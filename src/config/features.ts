/**
 * Feature switches.
 *
 * VENUE_PLANNER_ENABLED: the paid venue layout planner ($30).
 * Hidden for now — not requested in any of last season's weddings.
 * Couples who already paid for it still see it.
 * To bring it back, set this to true AND set VENUE_PAYMENTS_ENABLED
 * to true in supabase/functions/whish-pay-collect/index.ts.
 */
export const VENUE_PLANNER_ENABLED = false;
