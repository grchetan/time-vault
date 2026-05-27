import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;
    const now = Date.now();

    console.log(`[FUTURE MAIL EVENT] Incoming request: action="${action}" timestamp=${now} (${new Date(now).toISOString()})`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SB_SERVICE_ROLE_KEY') ?? '',
    );

    // Skip auth entirely for cron server-side automation actions
    const isCronAction = action === 'send_due' || action === 'cleanup_trash';
    console.log(`[FUTURE MAIL EVENT] isCronAction=${isCronAction} (action=${action})`);

    let userId = null;
    let userEmail = null;

    if (!isCronAction) {
      console.log(`[FUTURE MAIL EVENT] Running Firebase authentication validation...`);
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        console.warn(`[FUTURE MAIL AUTH ERROR] Authorization header is missing.`);
        return new Response(JSON.stringify({ error: 'No token' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const token = authHeader.replace('Bearer ', '');
      const firebaseApiKey = Deno.env.get('FIREBASE_API_KEY');
      if (!firebaseApiKey) {
        console.error(`[FUTURE MAIL CONFIG ERROR] FIREBASE_API_KEY secret is not set in Deno environment.`);
        throw new Error('FIREBASE_API_KEY environment variable not configured.');
      }

      // Verify Firebase token
      const verifyRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: token }),
        },
      );
      if (!verifyRes.ok) {
        const verifyErr = await verifyRes.text();
        console.warn(`[FUTURE MAIL AUTH ERROR] Firebase token validation rejected: ${verifyErr}`);
        return new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const userData = await verifyRes.json();
      if (!userData.users?.length) {
        console.warn(`[FUTURE MAIL AUTH ERROR] User object not found in Firebase payload.`);
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      userId = userData.users[0].localId;
      userEmail = userData.users[0].email;
      console.log(`[FUTURE MAIL AUTH SUCCESS] Authenticated userId=${userId} email=${userEmail}`);
    }

    // CREATE
    if (action === 'create') {
      const { subject, message, deliverAt } = body;
      console.log(`[CREATE ACTION] deliverAt=${deliverAt} messageLength=${message?.length}`);
      if (!message || !deliverAt) {
        return new Response(
          JSON.stringify({ error: 'Message and delivery date required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      if (deliverAt <= now) {
        return new Response(
          JSON.stringify({ error: 'Delivery date must be in the future' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      const { data, error } = await supabase
        .from('future_mails')
        .insert({
          user_id: userId,
          email: userEmail,
          subject: subject || 'A letter from your past self',
          message,
          deliver_at: deliverAt,
          created_at: now,
          delivered: false,
          deleted_at: null,
          trash_expires_at: null,
        })
        .select()
        .single();

      if (error) {
        console.error(`[CREATE DB ERROR]`, error.message);
        throw error;
      }
      console.log(`[CREATE SUCCESS] mailId=${data.id} scheduled for ${new Date(deliverAt).toISOString()}`);
      return new Response(JSON.stringify({ success: true, mail: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // LIST (active only — excludes soft-deleted)
    if (action === 'list') {
      console.log(`[LIST ACTION] Fetching active letters for userId=${userId}`);
      const { data, error } = await supabase
        .from('future_mails')
        .select('id, subject, deliver_at, created_at, delivered, delivered_at')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('deliver_at', { ascending: true });
      if (error) {
        console.error(`[LIST DB ERROR]`, error.message);
        throw error;
      }
      console.log(`[LIST SUCCESS] Found ${data?.length || 0} active letters`);
      return new Response(JSON.stringify({ mails: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // SOFT DELETE — moves to trash (30-day recovery)
    if (action === 'delete') {
      const { mailId } = body;
      console.log(`[DELETE ACTION] Soft deleting mailId=${mailId} for userId=${userId}`);
      const { data, error } = await supabase
        .from('future_mails')
        .update({
          deleted_at: now,
          trash_expires_at: now + THIRTY_DAYS_MS,
        })
        .eq('id', mailId)
        .eq('user_id', userId)
        .select();

      if (error) {
        console.error(`[DELETE DB ERROR]`, error.message);
        throw error;
      }
      if (!data || data.length === 0) {
        console.warn(`[DELETE WARN] Mail not found or already deleted: mailId=${mailId}`);
        return new Response(JSON.stringify({ error: 'Mail not found or already deleted' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      console.log(`[DELETE SUCCESS] Trashed mailId=${mailId}`);
      return new Response(JSON.stringify({ success: true, trashed: true, mail: data[0] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // TRASH LIST — returns trashed items for this user
    if (action === 'trash_list') {
      console.log(`[TRASH_LIST ACTION] Fetching trashed letters for userId=${userId}`);
      const { data, error } = await supabase
        .from('future_mails')
        .select('id, subject, deliver_at, created_at, delivered, deleted_at, trash_expires_at')
        .eq('user_id', userId)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) {
        console.error(`[TRASH_LIST DB ERROR]`, error.message);
        throw error;
      }
      console.log(`[TRASH_LIST SUCCESS] Found ${data?.length || 0} trashed letters`);
      return new Response(JSON.stringify({ mails: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // RESTORE — moves item back to active list
    if (action === 'restore') {
      const { mailId } = body;
      console.log(`[RESTORE ACTION] Restoring mailId=${mailId} for userId=${userId}`);
      const { data, error } = await supabase
        .from('future_mails')
        .update({ deleted_at: null, trash_expires_at: null })
        .eq('id', mailId)
        .eq('user_id', userId)
        .select();

      if (error) {
        console.error(`[RESTORE DB ERROR]`, error.message);
        throw error;
      }
      console.log(`[RESTORE SUCCESS] Restored mailId=${mailId}`);
      return new Response(JSON.stringify({ success: true, restored: true, mail: data?.[0] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PERMANENT DELETE — hard deletes from trash
    if (action === 'permanent_delete') {
      const { mailId } = body;
      console.log(`[PERMANENT_DELETE ACTION] Hard deleting mailId=${mailId} for userId=${userId}`);
      const { error } = await supabase
        .from('future_mails')
        .delete()
        .eq('id', mailId)
        .eq('user_id', userId)
        .not('deleted_at', 'is', null);
      if (error) {
        console.error(`[PERMANENT_DELETE DB ERROR]`, error.message);
        throw error;
      }
      console.log(`[PERMANENT_DELETE SUCCESS] Deleted mailId=${mailId} from database`);
      return new Response(JSON.stringify({ success: true, permanently_deleted: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // CLEANUP TRASH — purges expired trash items (called by cron)
    if (action === 'cleanup_trash') {
      console.log(`[CLEANUP_TRASH ACTION] Running expired trash purge...`);
      const { data, error } = await supabase
        .from('future_mails')
        .delete()
        .not('trash_expires_at', 'is', null)
        .lt('trash_expires_at', now)
        .select('id');
      if (error) {
        console.error(`[CLEANUP_TRASH DB ERROR]`, error.message);
        throw error;
      }
      console.log(`[CLEANUP_TRASH SUCCESS] Purged ${data?.length ?? 0} expired letters`);
      return new Response(
        JSON.stringify({ success: true, purged: data?.length ?? 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // SEND DUE — cron triggers to deliver scheduled mails
    if (action === 'send_due') {
      console.log(`[SEND_DUE ACTION] Querying database for due, undelivered letters (now <= deliver_at)`);
      const { data: dueMails, error } = await supabase
        .from('future_mails')
        .select('*')
        .eq('delivered', false)
        .is('deleted_at', null)
        .lte('deliver_at', now);
      if (error) {
        console.error(`[SEND_DUE DB ERROR]`, error.message);
        throw error;
      }

      console.log(`[SEND_DUE INFO] Found ${dueMails?.length || 0} due undelivered letters.`);

      let sent = 0;
      const failures = [];

      if (dueMails && dueMails.length > 0) {
        for (const mail of dueMails) {
          try {
            console.log(`[SEND_DUE PROCESS] Dispatching email to Resend: mailId=${mail.id} to=${mail.email}`);
            await sendEmailResend(mail);
            
            console.log(`[SEND_DUE PROCESS] Resend email success. Updating delivered state in DB: mailId=${mail.id}`);
            const { error: updateErr } = await supabase
              .from('future_mails')
              .update({ delivered: true, delivered_at: now })
              .eq('id', mail.id);
            if (updateErr) {
              console.error(`[SEND_DUE DB UPDATE ERROR] failed to update delivered flag for mailId=${mail.id}:`, updateErr.message);
              throw updateErr;
            }
            console.log(`[SEND_DUE PROCESS] Successfully delivered and updated: mailId=${mail.id}`);
            sent++;
          } catch (e) {
            console.error(`[SEND_DUE PROCESS FAILURE] failed to deliver mailId=${mail.id}:`, e.message);
            failures.push({ mailId: mail.id, email: mail.email, error: e.message });
          }
        }
      }

      return new Response(
        JSON.stringify({ success: true, sent, total: dueMails?.length || 0, failures }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    console.warn(`[UNKNOWN ACTION] Received action="${action}" which matches no route.`);
    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(`[EDGE FUNCTION HANDLER FATAL EXCEPTION]`, err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function sendEmailResend(mail: any) {
  console.log(`[RESEND API] Initiating Resend client payload validation...`);
  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!resendKey) {
    console.error(`[RESEND CONFIG ERROR] RESEND_API_KEY secret is not set in Deno environment.`);
    throw new Error('RESEND_API_KEY not set');
  }

  const createdDate = new Date(mail.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A Letter From Your Past Self</title>
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:2rem 1.25rem;color:#1a1a2e;background-color:#fafaf9;-webkit-font-smoothing:antialiased;">
  <div style="background-color:#ffffff;border:1px solid #e5e5e0;border-radius:24px;padding:2.5rem 2rem;box-shadow:0 4px 20px -2px rgba(0,0,0,0.02),0 20px 48px -8px rgba(0,0,0,0.03);overflow:hidden;position:relative;">
    
    <!-- Premium Soft-3D Header Gradient bar -->
    <div style="position:absolute;top:0;left:0;right:0;height:6px;background:linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);"></div>

    <!-- Brand Logo Header -->
    <div style="text-align:center;margin-bottom:2.5rem;margin-top:0.5rem;">
      <div style="width:52px;height:52px;background:linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);border-radius:16px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:14px;box-shadow:0 0 16px rgba(124,58,237,0.25);">
        <span style="font-size:24px;line-height:1;">📬</span>
      </div>
      <h2 style="font-size:11px;text-transform:uppercase;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;letter-spacing:0.15em;color:#7c3aed;font-weight:800;margin:0;">Time Capsule Unsealed</h2>
      <h1 style="font-size:22px;font-weight:800;color:#111111;margin:6px 0 0 0;letter-spacing:-0.025em;line-height:1.2;">A Message from Your Past Self</h1>
      <p style="color:#6b6b76;font-size:12px;font-weight:500;margin:8px 0 0 0;">Sealed on ${createdDate} &middot; Unsealed today</p>
    </div>

    <!-- Content Card Panel -->
    <div style="background-color:#faf8f5;border:1px solid #ebdcd0;border-radius:18px;padding:2rem 1.5rem;font-family:Georgia,Cambria,'Times New Roman',Times,serif;font-size:15px;line-height:1.8;color:#3d2f24;white-space:pre-wrap;margin-bottom:2rem;box-shadow:inset 0 1px 2px rgba(0,0,0,0.01);">${mail.message}</div>

    <!-- Motivational Quote / Call to Action -->
    <div style="background-color:#faf5ff;border:1px solid #f3e8ff;border-radius:18px;padding:1.25rem 1.5rem;text-align:center;margin-bottom:2.5rem;">
      <p style="font-size:12px;font-style:italic;color:#7c3aed;font-weight:600;line-height:1.6;margin:0;">
        "Discipline is the bridge between goals and accomplishment. Sustain the friction, reject the distractions, and keep conquering your focus."
      </p>
    </div>

    <!-- Footer Section -->
    <div style="border-top:1px solid #f0f0ee;padding-top:1.5rem;text-align:center;">
      <p style="font-size:11px;text-transform:uppercase;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;letter-spacing:0.1em;color:#999999;margin:0;font-weight:700;">
        Powered by <a href="https://timevault.vercel.app" style="color:#7c3aed;text-decoration:none;font-weight:800;">TimeVault</a>
      </p>
      <p style="font-size:10px;color:#b5b5ba;margin-top:6px;font-weight:500;line-height:1.5;">
        You received this scheduled focus contract because you sealed a capsule at TimeVault.<br/>
        Built with care by <a href="https://github.com/grchetan" style="color:#6b6b76;text-decoration:underline;font-weight:600;">@grchetan</a>
      </p>
    </div>

  </div>
</body>
</html>`;

  console.log(`[RESEND API] Posting email to Resend API: from="Time Vault <onboarding@resend.dev>", to="${mail.email}"`);
  let res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Time Vault <onboarding@resend.dev>`,
      to: [mail.email],
      subject: mail.subject,
      html: htmlBody,
    }),
  });

  console.log(`[RESEND API] Fetch completed. Status code: ${res.status}`);
  if (!res.ok) {
    const errText = await res.text();
    console.warn(`[RESEND API FIRST ATTEMPT FAILED] status=${res.status} responseBody=${errText}`);
    
    // Check if this is the Resend sandbox restriction error
    if (errText.includes('You can only send testing emails to your own email address')) {
      const fallbackEmail = 'support.timevault@gmail.com';
      console.log(`[RESEND API SANDBOX DETECTED] Rerouting email to verified owner: ${fallbackEmail}`);
      
      const fallbackHtml = `
        <div style="background:#fff3cd; border:1px solid #ffeeba; color:#856404; padding:12px; border-radius:8px; margin-bottom:16px; font-size:13px; font-family:sans-serif;">
          <strong>⚠️ Resend Sandbox Domain Warning:</strong><br/>
          This Future Mail capsule was originally scheduled for <strong>${mail.email}</strong>. 
          Because the Resend account is operating in development sandbox mode (using onboarding@resend.dev), the email was rerouted to the verified owner address. 
          To send to arbitrary public recipients, please verify a custom domain at resend.com/domains.
        </div>
        ${htmlBody}
      `;

      res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `Time Vault <onboarding@resend.dev>`,
          to: [fallbackEmail],
          subject: `[SANDBOX DELIVERED] ${mail.subject}`,
          html: fallbackHtml,
        }),
      });
      
      if (!res.ok) {
        const fallbackErrText = await res.text();
        console.error(`[RESEND API FALLBACK ATTEMPT FAILED] status=${res.status} responseBody=${fallbackErrText}`);
        throw new Error(`Sandbox fallback failed: ${fallbackErrText}`);
      }
      
      console.log(`[RESEND API SUCCESS] Sandbox fallback email successfully sent to ${fallbackEmail}`);
    } else {
      let errorMessage = 'Resend API failed';
      try {
        const errJson = JSON.parse(errText);
        errorMessage = errJson.message || errorMessage;
      } catch (_) {}
      throw new Error(errorMessage);
    }
  }

  const successPayload = await res.json();
  console.log(`[RESEND API SUCCESS] Dispatch success. Resend transactionId=${successPayload.id}`);
}
