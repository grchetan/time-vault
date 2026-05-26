# 🚀 Edge Function Deployment Guide

The Trash & Recovery edge function fixes have been applied to the local files. You need to deploy them to Supabase manually.

## Files Changed

1. `supabase/functions/vault/index.ts` — Fixed soft-delete validation
2. `supabase/functions/future-mail/index.ts` — Fixed soft-delete (removed delivered=false filter, added row validation)

## Method 1: Supabase Dashboard (Easiest)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project `xoeznxjfnxjzhifwviyr`
2. Navigate to **Edge Functions** in the left sidebar
3. Click on the **vault** function → **Edit** → paste the contents of `supabase/functions/vault/index.ts`
4. Click on the **future-mail** function → **Edit** → paste the contents of `supabase/functions/future-mail/index.ts`
5. Deploy both

## Method 2: Supabase CLI (Requires Login)

```powershell
# Login first
npx supabase login

# Then link and deploy
npx supabase link --project-ref xoeznxjfnxjzhifwviyr
npx supabase functions deploy vault
npx supabase functions deploy future-mail
```

## What Was Fixed

### Bug 1: Delivered mails couldn't be soft-deleted
The `future-mail` delete action had `.eq('delivered', false)` which blocked deleting already-delivered mails. **Fixed**: removed this filter so all mails can be moved to Trash.

### Bug 2: Silent failure on soft-delete
If a vault/mail ID didn't match (e.g., wrong user, already deleted), the function returned `success: true` with no data — silently failing. **Fixed**: now returns HTTP 404 with a clear error message if 0 rows were affected.

### Bug 3: Toast messages were confusing
The success toasts said "deleted" which implied permanent deletion. **Fixed**: now correctly say "Moved to Trash — recoverable for 30 days."

## Database Check

Make sure both tables have the trash columns. Run in Supabase SQL Editor:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('vaults', 'future_mails') 
  AND column_name IN ('deleted_at', 'trash_expires_at');
```

Should return 4 rows (2 columns × 2 tables), all with `bigint` type.

If any are missing, run:
```sql
ALTER TABLE vaults ADD COLUMN IF NOT EXISTS deleted_at BIGINT DEFAULT NULL;
ALTER TABLE vaults ADD COLUMN IF NOT EXISTS trash_expires_at BIGINT DEFAULT NULL;
ALTER TABLE future_mails ADD COLUMN IF NOT EXISTS deleted_at BIGINT DEFAULT NULL;
ALTER TABLE future_mails ADD COLUMN IF NOT EXISTS trash_expires_at BIGINT DEFAULT NULL;
```
