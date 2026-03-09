import Stripe from 'stripe';
import { Request, Response } from 'express';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
});

const PRICE_IDS: Record<string, number> = {
    'single': 99, // €0.99 in cents
    'pack_7': 499,
    'pack_20': 899
};

export async function createCheckoutSession(req: Request, res: Response) {
    const { tier, email, filters } = req.body;

    const amount = PRICE_IDS[tier] || 500;

    try {
        const origin = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: `Housing Leads - ${tier.replace('_', ' ').toUpperCase()}`,
                        description: `Search in ${filters.city} with verified leads delivered instantly.`
                    },
                    unit_amount: amount,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${origin}/?status=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/?status=cancelled`,
            metadata: {
                email,
                tier,
                city: filters.city,
                budgetMin: filters.budgetMin,
                budgetMax: filters.budgetMax,
                roomType: filters.roomType,
                furnished: filters.furnished,
                listingType: filters.listingType
            }
        });

        res.json({ id: session.id, url: session.url, sessionId: session.id });
    } catch (err) {
        console.error('❌ Failed to create checkout session:', err);
        res.status(500).json({ error: 'Failed to create payment session' });
    }
}
