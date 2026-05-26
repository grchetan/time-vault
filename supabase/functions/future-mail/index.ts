import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

serve(async (req) => {
  if (req.method === 'OPTIONS')
    return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader)
      return new Response(JSON.stringify({ error: 'No token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    const token = authHeader.replace('Bearer ', '');

    // Verify Firebase token
    const verifyRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${Deno.env.get('FIREBASE_API_KEY')}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: token }),
      },
    );
    if (!verifyRes.ok)
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    const userData = await verifyRes.json();
    if (!userData.users?.length)
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    const userId = userData.users[0].localId;
    const userEmail = userData.users[0].email;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SB_SERVICE_ROLE_KEY') ?? '',
    );

    const body = await req.json();
    const { action } = body;
    const now = Date.now();
    console.log(`[FUTURE MAIL EVENT] Received request: action=${action} userId=${userId} email=${userEmail}`);

    // CREATE
    if (action === 'create') {
      const { subject, message, deliverAt } = body;
      if (!message || !deliverAt)
        return new Response(
          JSON.stringify({ error: 'Message and delivery date required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      if (deliverAt <= now)
        return new Response(
          JSON.stringify({ error: 'Delivery date must be in the future' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );

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

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, mail: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // LIST (active only — excludes soft-deleted)
    if (action === 'list') {
      const { data, error } = await supabase
        .from('future_mails')
        .select('id, subject, deliver_at, created_at, delivered, delivered_at')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('deliver_at', { ascending: true });
      if (error) throw error;
      return new Response(JSON.stringify({ mails: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // SOFT DELETE — moves to trash (30-day recovery)
    if (action === 'delete') {
      const { mailId } = body;
      console.log(`[DELETE FUTURE MAIL] Soft deleting mailId=${mailId} for userId=${userId}`);
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
        console.error(`[DELETE FUTURE MAIL ERROR]`, error.message);
        throw error;
      }
      if (!data || data.length === 0) {
        return new Response(JSON.stringify({ error: 'Mail not found or already deleted' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      console.log(`[DELETE FUTURE MAIL SUCCESS] Rows affected:`, data.length);
      return new Response(JSON.stringify({ success: true, trashed: true, mail: data[0] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // TRASH LIST — returns trashed items for this user
    if (action === 'trash_list') {
      console.log(`[TRASH LIST FUTURE MAILS] Fetching trash for userId=${userId}`);
      const { data, error } = await supabase
        .from('future_mails')
        .select('id, subject, deliver_at, created_at, delivered, deleted_at, trash_expires_at')
        .eq('user_id', userId)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) {
        console.error(`[TRASH LIST ERROR]`, error.message);
        throw error;
      }
      console.log(`[TRASH LIST SUCCESS] Found items:`, data?.length ?? 0);
      return new Response(JSON.stringify({ mails: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // RESTORE — moves item back to active list
    if (action === 'restore') {
      const { mailId } = body;
      console.log(`[RESTORE FUTURE MAIL] Restoring mailId=${mailId} for userId=${userId}`);
      const { data, error } = await supabase
        .from('future_mails')
        .update({ deleted_at: null, trash_expires_at: null })
        .eq('id', mailId)
        .eq('user_id', userId)
        .select();

      if (error) {
        console.error(`[RESTORE FUTURE MAIL ERROR]`, error.message);
        throw error;
      }
      console.log(`[RESTORE FUTURE MAIL SUCCESS] Rows restored:`, data?.length ?? 0);
      return new Response(JSON.stringify({ success: true, restored: true, mail: data?.[0] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PERMANENT DELETE — hard deletes from trash
    if (action === 'permanent_delete') {
      const { mailId } = body;
      const { error } = await supabase
        .from('future_mails')
        .delete()
        .eq('id', mailId)
        .eq('user_id', userId)
        .not('deleted_at', 'is', null);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true, permanently_deleted: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // CLEANUP TRASH — purges expired trash items (called by cron)
    if (action === 'cleanup_trash') {
      const { data, error } = await supabase
        .from('future_mails')
        .delete()
        .not('trash_expires_at', 'is', null)
        .lt('trash_expires_at', now)
        .select('id');
      if (error) throw error;
      return new Response(
        JSON.stringify({ success: true, purged: data?.length ?? 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // SEND DUE — cron triggers to deliver scheduled mails
    if (action === 'send_due') {
      const { data: dueMails, error } = await supabase
        .from('future_mails')
        .select('*')
        .eq('delivered', false)
        .is('deleted_at', null)
        .lte('deliver_at', now);
      if (error) throw error;

      let sent = 0;
      for (const mail of dueMails) {
        try {
          await sendEmailResend(mail);
          await supabase
            .from('future_mails')
            .update({ delivered: true, delivered_at: now })
            .eq('id', mail.id);
          sent++;
        } catch (e) {
          console.error('Failed to send:', mail.id, e.message);
        }
      }
      return new Response(
        JSON.stringify({ success: true, sent, total: dueMails.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function sendEmailResend(mail: any) {
  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!resendKey) throw new Error('RESEND_API_KEY not set');

  const fromEmail = Deno.env.get('SMTP_USER') || 'support.timevault@gmail.com';
  const createdDate = new Date(mail.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const htmlBody = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:2rem;color:#1a1a2e;background:#fafaf8;">
  <div style="text-align:center;margin-bottom:2rem;">
    <div style="width:56px;height:56px;background:#1a1a2e;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:12px;">📬</div>
    <h1 style="font-size:22px;margin:0;font-weight:700;">A Letter From Your Past Self</h1>
    <p style="color:#888;font-size:13px;margin-top:6px;">Written on ${createdDate} · Delivered today as scheduled</p>
  </div>
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:1.5rem;font-size:15px;line-height:1.8;white-space:pre-wrap;color:#1a1a2e;">${mail.message}</div>
  <hr style="border:none;border-top:1px solid #eee;margin:2rem 0;">
  <p style="text-align:center;font-size:12px;color:#aaa;">
    Delivered by <a href="https://time-vault-nine.vercel.app" style="color:#6366f1;text-decoration:none;">Time Vault</a>
    · Built by <a href="https://github.com/grchetan" style="color:#6366f1;text-decoration:none;">@grchetan</a>
  </p>
</body>
</html>`;

  const res = await fetch('https://api.resend.com/emails', {
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

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Resend API failed');
  }
}
