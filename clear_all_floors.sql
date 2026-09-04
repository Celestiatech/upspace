-- =============================================================================
-- UPSPACE 3D SKYLINE - CLEAR ALL FLOORS, BIDS & TRANSACTIONS
-- Run this in your Supabase SQL Editor to wipe all floor claims and transactions.
-- =============================================================================

-- 1. Clear all payment transactions and audit logs
DELETE FROM public.transactions;

-- 2. Clear all historical bids
DELETE FROM public.bid_history;

-- 3. Clear all claimed floor records (or reset to available)
DELETE FROM public.floors;

-- All floors will now be 100% available and ready to be claimed fresh!
