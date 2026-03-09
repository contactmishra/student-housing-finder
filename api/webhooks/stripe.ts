import Stripe from 'stripe';
import type { Request, Response } from 'express';
import { scrapeListings } from '../services/scrappey.js';
import { sendListingsEmail } from '../services/email.js';
import { supabase } from '../services/db.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-02-25.clover',
});

export async function handleStripeWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
        console.error('❌ Missing Stripe signature or webhook secret');
        return res.status(400).send('Missing signature');
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error(`❌ Webhook signature verification failed: ${message}`);
        return res.status(400).send(`Webhook Error: ${message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const meta = session.metadata;

        if (!meta) {
            console.error('❌ No metadata found on session');
            return res.status(400).send('No metadata');
        }

        console.log(`\n💰 Payment received!`);
        console.log(`  ├── Session: ${session.id}`);
        console.log(`  ├── Email:   ${meta.email}`);

        const filters = {
            city: meta.city || '',
            budgetMin: Number(meta.budgetMin) || 150,
            budgetMax: Number(meta.budgetMax) || 800,
            roomType: meta.roomType || 'any',
            furnished: meta.furnished || 'any',
            listingType: meta.listingType || 'both',
        };

        // Idempotency check to prevent duplicate scraping on webhook retries
        const { data: existing } = await supabase
            .from('searches')
            .select('id')
            .eq('stripe_session_id', session.id)
            .single();

        if (existing) {
            console.log(`ℹ️ Session ${session.id} already processed or in progress. Skipping.`);
            return res.json({ received: true });
        }

        // Insert pending state into Supabase directly
        await supabase.from('searches').insert([{
            email: meta.email || '',
            city: meta.city || 'Bologna',
            budget_min: filters.budgetMin,
            budget_max: filters.budgetMax,
            room_type: filters.roomType,
            furnished: filters.furnished,
            listing_type: filters.listingType,
            pricing_tier: meta.tier || 'single',
            status: 'scraping',
            stripe_session_id: session.id,
            scrappey_credits_used: 0,
            results_count: 0
        }]);

        // Await the scrape so Vercel does not kill the function early
        await triggerScrape(session.id, filters, meta.city || 'Bologna', meta.email || '');
    }

    return res.json({ received: true });
}

async function triggerScrape(sessionId: string, filters: any, city: string, email: string) {
    let listings: any[] = [];
    let creditsUsed = 0;
    let finalStatus = 'completed';
    let errorMessage = '';

    try {
        console.log(`\n🤖 Triggering real Scrappey scrape for ${city}...`);
        const result = await scrapeListings(filters);
        listings = result.listings;
        creditsUsed = result.creditsUsed;

        console.log(`✅ Scrappey scrape complete: ${listings.length} listings`);

        if (listings.length > 0 && email) {
            console.log(`\n📨 Preparing to send email to ${email}...`);
            await sendListingsEmail(email, city, listings);
        }

    } catch (err) {
        console.error(`❌ Scrape failed:`, err);
        finalStatus = 'failed';
        errorMessage = err instanceof Error ? err.message : 'Scraping failed';
    } finally {
        try {
            // Update the existing row instead of inserting
            const { error } = await supabase.from('searches').update({
                status: finalStatus,
                listings: listings,
                filters: filters,
                error_message: errorMessage,
                scrappey_credits_used: creditsUsed,
                results_count: listings.length
            }).eq('stripe_session_id', sessionId);

            if (error) throw error;
            console.log(`✅ Updated search status to ${finalStatus} in Supabase`);
        } catch (dbErr) {
            console.error(`❌ Failed to update search in Supabase db:`, dbErr);
        }
    }
}

