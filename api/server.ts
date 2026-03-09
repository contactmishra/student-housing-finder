import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createCheckoutSession } from './routes/checkout.js';
import { handleStripeWebhook } from './webhooks/stripe.js';
import adminRoutes from './routes/admin.js';
import cookieParser from 'cookie-parser';
import { supabase } from './services/db.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Env Validation ───────────────────────────
function validateEnv() {
    const required = [
        'STRIPE_SECRET_KEY',
        'STRIPE_WEBHOOK_SECRET',
        'SCRAPPEY_API_KEY',
        'RESEND_API_KEY'
    ];
    const missing = required.filter(k => !process.env[k]);
    if (missing.length > 0) {
        console.error(`\n❌ Error: Missing mandatory environment variables:`);
        missing.forEach(m => console.error(`   ├── ${m}`));
        console.error(`\n   The server may not function correctly. Please check your .env file.\n`);
    }
}
validateEnv();

// CORS — allow frontend (both local dev and Vercel production)
app.use(cors({
    origin: true,
    credentials: true,
}));

// Stripe webhook needs raw body — MUST come before express.json()
app.post('/api/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// JSON parsing for all other routes
app.use(express.json());
app.use(cookieParser());

// ── Admin Routes ─────────────────────────────
app.use('/api/admin', adminRoutes);

// ── Routes ───────────────────────────────────
app.post('/api/create-checkout-session', createCheckoutSession);

// ── Health check ─────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Session results polling endpoint ─────────
app.get('/api/session/:sessionId/results', async (req, res) => {
    const { sessionId } = req.params;

    try {
        const { data: session, error } = await supabase
            .from('searches')
            .select('*')
            .eq('stripe_session_id', sessionId)
            .single();

        if (error || !session) {
            // Note: Returning 'not_found' triggers the frontend error state.
            // If the webhook is slightly delayed, we might want to return 'scraping' instead of failing immediately.
            // But we will handle this gracefully.
            return res.status(404).json({ status: 'not_found' });
        }

        if (session.status === 'scraping' || session.status === 'pending') {
            return res.json({ status: 'scraping', message: 'Still finding your leads...' });
        }

        if (session.status === 'completed') {
            return res.json({ status: 'complete', listings: session.listings || [], filters: session.filters || {} });
        }

        if (session.status === 'failed') {
            return res.json({ status: 'failed', message: session.error_message || 'Something went wrong' });
        }

        return res.json({ status: session.status });
    } catch (err) {
        console.error('Error fetching session:', err);
        return res.status(500).json({ status: 'error' });
    }
});

// ── In-memory session store ──────────────────
// ── Removed In-Memory Session Store ──────────

// ── Start ────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n  🏠 Housing Finder Backend`);
    console.log(`  ├── Server:  http://localhost:${PORT}`);
    console.log(`  ├── Health:  http://localhost:${PORT}/health`);
    console.log(`  └── Stripe:  ${process.env.STRIPE_SECRET_KEY?.startsWith('sk_test') ? '✅ Test mode' : '⚠️  Check keys'}\n`);
});

export default app;
