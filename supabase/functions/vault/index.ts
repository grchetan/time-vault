import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

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
        })
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, vault: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // LIST (no passwords returned)
    if (action === 'list') {
      const { data, error } = await supabase
        .from('vaults')
        .select('id, name, reason, created_at, unlock_at, duration_label')
        .eq('user_id', userId)
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
        .single();

      if (error || !vault) {
        return new Response(JSON.stringify({ error: 'Vault nahi mila' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // ===== SERVER-SIDE TIMER CHECK =====
      // This runs on Supabase server — NOBODY can bypass this
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

      // Timer expired — return encrypted passwords
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

    // DELETE
    if (action === 'delete') {
      const { vaultId } = body;
      const { error } = await supabase
        .from('vaults')
        .delete()
        .eq('id', vaultId)
        .eq('user_id', userId);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
