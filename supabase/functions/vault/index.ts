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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    if (!verifyRes.ok) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userData = await verifyRes.json();
    if (!userData.users || userData.users.length === 0) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = userData.users[0].localId;

    // Supabase admin client — uses SB_SERVICE_ROLE_KEY
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SB_SERVICE_ROLE_KEY') ?? '',
    );

    const body = await req.json();
    const { action } = body;
    const now = Date.now();
    console.log(`[VAULT FUNCTION EVENT] Received request: action=${action} userId=${userId}`);

    // CREATE
    if (action === 'create') {
      const { name, reason, unlockAt, durationLabel, passwords } = body;
      const { data, error } = await supabase
        .from('vaults')
        .insert({
          user_id: userId,
          name,
          reason: reason || '',
          created_at: now,
          unlock_at: unlockAt,
          duration_label: durationLabel,
          passwords: passwords,
          deleted_at: null,
          trash_expires_at: null,
        })
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, vault: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // LIST (active only — excludes soft-deleted)
    if (action === 'list') {
      const { data, error } = await supabase
        .from('vaults')
        .select('id, name, reason, created_at, unlock_at, duration_label')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify({ vaults: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // REVEAL — SERVER checks timer, client cannot bypass
    if (action === 'reveal') {
      const { vaultId } = body;

      const { data: vault, error } = await supabase
        .from('vaults')
        .select('*')
        .eq('id', vaultId)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single();

      if (error || !vault) {
        return new Response(JSON.stringify({ error: 'Vault nahi mila' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ===== SERVER-SIDE TIMER CHECK =====
      if (now < vault.unlock_at) {
        const remaining = vault.unlock_at - now;
        const d = Math.floor(remaining / 86400000);
        const h = Math.floor((remaining % 86400000) / 3600000);
        const m = Math.floor((remaining % 3600000) / 60000);
        const s = Math.floor((remaining % 60000) / 1000);

        return new Response(
          JSON.stringify({
            error: `Timer abhi khatam nahi hua! ${d > 0 ? d + 'd ' : ''}${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${s}s baaki hai.`,
            remainingMs: remaining,
            locked: true,
          }),
          {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          passwords: vault.passwords,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // SOFT DELETE — moves to trash (30-day recovery window)
    if (action === 'delete') {
      const { vaultId } = body;
      console.log(`[DELETE VAULT] Soft deleting vaultId=${vaultId} for userId=${userId}`);
      const { data, error } = await supabase
        .from('vaults')
        .update({
          deleted_at: now,
          trash_expires_at: now + THIRTY_DAYS_MS,
        })
        .eq('id', vaultId)
        .eq('user_id', userId)
        .select();

      if (error) {
        console.error(`[DELETE VAULT ERROR]`, error.message);
        throw error;
      }
      if (!data || data.length === 0) {
        return new Response(JSON.stringify({ error: 'Vault not found or already deleted' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      console.log(`[DELETE VAULT SUCCESS] Rows affected:`, data.length);
      return new Response(JSON.stringify({ success: true, trashed: true, vault: data[0] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // TRASH LIST — returns items in trash for this user
    if (action === 'trash_list') {
      console.log(`[TRASH LIST VAULTS] Fetching trash for userId=${userId}`);
      const { data, error } = await supabase
        .from('vaults')
        .select('id, name, reason, created_at, unlock_at, duration_label, deleted_at, trash_expires_at')
        .eq('user_id', userId)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) {
        console.error(`[TRASH LIST ERROR]`, error.message);
        throw error;
      }
      console.log(`[TRASH LIST SUCCESS] Found items:`, data?.length ?? 0);
      return new Response(JSON.stringify({ vaults: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // RESTORE — removes trash flags, moves back to active
    if (action === 'restore') {
      const { vaultId } = body;
      console.log(`[RESTORE VAULT] Restoring vaultId=${vaultId} for userId=${userId}`);
      const { data, error } = await supabase
        .from('vaults')
        .update({ deleted_at: null, trash_expires_at: null })
        .eq('id', vaultId)
        .eq('user_id', userId)
        .select();

      if (error) {
        console.error(`[RESTORE VAULT ERROR]`, error.message);
        throw error;
      }
      console.log(`[RESTORE VAULT SUCCESS] Rows restored:`, data?.length ?? 0);
      return new Response(JSON.stringify({ success: true, restored: true, vault: data?.[0] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PERMANENT DELETE — hard deletes from trash
    if (action === 'permanent_delete') {
      const { vaultId } = body;
      const { error } = await supabase
        .from('vaults')
        .delete()
        .eq('id', vaultId)
        .eq('user_id', userId)
        .not('deleted_at', 'is', null);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, permanently_deleted: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // CLEANUP TRASH — purges expired trash items (called by cron or admin)
    if (action === 'cleanup_trash') {
      const { data, error } = await supabase
        .from('vaults')
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
