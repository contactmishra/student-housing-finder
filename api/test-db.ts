import { supabase } from './services/db.js';

async function test() {
    try {
        console.log("Inserting mock search...");
        const { error: insertError } = await supabase.from('searches').insert([{
            email: 'test@example.com',
            city: 'Milan',
            budget_min: 400,
            budget_max: 800,
            room_type: 'single',
            furnished: 'yes',
            listing_type: 'private',
            pricing_tier: 'pack_7',
            scrappey_credits_used: 5,
            results_count: 20,
            status: 'completed',
            stripe_session_id: 'sess_123'
        }]);

        if (insertError) throw insertError;

        console.log("✅ Mock search inserted. Retrieving...");
        const { data, error: selectError } = await supabase.from('searches').select('*').order('created_at', { ascending: false }).limit(1);
        if (selectError) throw selectError;

        console.log("✅ Retrieved row:");
        console.log(data[0]);
    } catch (err) {
        console.error("❌ Test failed:", err);
    } finally {
        process.exit(0);
    }
}

test();
