import { supabase } from '../infrastructure/supabase';

export class SyncTrades {
  /**
   * Syncs new trades from a list to Supabase, preventing duplicates.
   * @param {Trade[]} trades 
   * @param {string} accountId 
   * @param {string} userId
   */
  static async execute(trades, accountId, userId) {
    if (!trades.length || !accountId || !userId) return { count: 0, error: null };

    // Prepare data for insertion
    const tracksToInsert = trades.map(t => {
      // Create a unique hash for deduplication
      const externalId = btoa(`${t.asset}-${t.openDate}-${t.result}`).substring(0, 100);
      
      return {
        account_id: accountId,
        user_id: userId,
        asset: t.asset,
        open_date: t.openDate,
        close_date: t.closeDate,
        side: t.type,
        result: t.result,
        external_id: externalId
      };
    });

    // In Supabase, we can use "upsert" with "ignoreDuplicates: true" 
    // if we have a unique constraint on external_id + account_id.
    // However, the requirement is "only save data not saved yet, update prohibited".
    // "upsert" with "onConflict" and without update is exactly that.
    
    const { data, error } = await supabase
      .from('trades')
      .upsert(tracksToInsert, { 
        onConflict: 'account_id,external_id',
        ignoreDuplicates: true 
      });

    return { data, error, count: tracksToInsert.length };
  }
}
