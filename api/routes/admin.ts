import { Router } from 'express';
import Stripe from 'stripe';
import { supabase } from '../services/db.js';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2026-02-25.clover',
});

// Middleware for Admin Auth
const adminAuth = (req: any, res: any, next: any) => {
    const cookie = req.cookies?.admin_session;
    if (cookie !== process.env.ADMIN_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Login Endpoint
router.post('/login', (req, res) => {
    const { password } = req.body;
    if (password === process.env.ADMIN_PASSWORD) {
        res.cookie('admin_session', process.env.ADMIN_SECRET, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });
        return res.json({ success: true });
    }
    return res.status(401).json({ error: 'Invalid password' });
});

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('admin_session');
    return res.json({ success: true });
});

// Apply auth to all /stats routes
router.use('/stats', adminAuth);

// 1. Revenue Stats
router.get('/stats/revenue', async (req, res) => {
    try {
        const charges = await stripe.charges.list({ limit: 100 });

        let allTime = 0;
        let thisMonth = 0;
        let thisWeek = 0;
        let today = 0;

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000;
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).setHours(0, 0, 0, 0) / 1000;
        now.setDate(new Date().getDate()); // reset
        const startOfDay = new Date().setHours(0, 0, 0, 0) / 1000;

        charges.data.forEach(charge => {
            if (charge.status === 'succeeded' && charge.paid) {
                const amount = charge.amount / 100; // in EUR
                allTime += amount;
                if (charge.created >= startOfMonth) thisMonth += amount;
                if (charge.created >= startOfWeek) thisWeek += amount;
                if (charge.created >= startOfDay) today += amount;
            }
        });

        res.json({ allTime, thisMonth, thisWeek, today });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch revenue' });
    }
});

// 2. Users Stats
router.get('/stats/users', async (req, res) => {
    try {
        const { data, error } = await supabase.rpc('get_dashboard_stats');
        if (error) throw error;
        res.json({
            total: parseInt(data.users_total) || 0,
            newToday: parseInt(data.users_today) || 0
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch user stats' });
    }
});

// 3. Searches Stats
router.get('/stats/searches', async (req, res) => {
    try {
        const { data, error } = await supabase.rpc('get_dashboard_stats');
        if (error) throw error;
        res.json({
            total: parseInt(data.searches_total) || 0,
            newToday: parseInt(data.searches_today) || 0
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch searches' });
    }
});

// 4. Cities Breakdown
router.get('/stats/cities', async (req, res) => {
    try {
        const { data, error } = await supabase.rpc('get_dashboard_stats');
        if (error) throw error;
        res.json((data.cities || []).map((r: any) => ({ name: r.name, count: parseInt(r.count) })));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed' });
    }
});

// 5. Filters Breakdown
router.get('/stats/filters', async (req, res) => {
    try {
        const { data, error } = await supabase.rpc('get_dashboard_stats');
        if (error) throw error;
        res.json({
            roomType: (data.filters_room_type || []).map((r: any) => ({ name: r.name, value: parseInt(r.value) })),
            furnished: (data.filters_furnished || []).map((r: any) => ({ name: r.name, value: parseInt(r.value) })),
            listingType: (data.filters_listing_type || []).map((r: any) => ({ name: r.name, value: parseInt(r.value) })),
            avgBudget: Math.round(data.filters_avg_budget || 0)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed' });
    }
});

// 6. Revenue Chart Data (Last 30 Days)
router.get('/stats/chart', async (req, res) => {
    try {
        const charges = await stripe.charges.list({ limit: 100 });
        const last30Days = [...Array(30)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (29 - i));
            return {
                date_raw: d.toISOString().split('T')[0],
                name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                revenue: 0
            };
        });

        charges.data.forEach(charge => {
            if (charge.status === 'succeeded' && charge.paid) {
                const chargeDate = new Date(charge.created * 1000).toISOString().split('T')[0];
                const dayMatch = last30Days.find(d => d.date_raw === chargeDate);
                if (dayMatch) {
                    dayMatch.revenue += (charge.amount / 100);
                }
            }
        });

        res.json(last30Days.map(d => ({ name: d.name, revenue: d.revenue })));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed' });
    }
});

// 7. Recent Searches Table
router.get('/stats/recent', async (req, res) => {
    try {
        const { data, error } = await supabase.from('searches').select('*').order('created_at', { ascending: false }).limit(20);
        if (error) throw error;

        // Mask emails for security
        const masked = (data || []).map(r => {
            if (!r.email || !r.email.includes('@')) return r;
            const parts = r.email.split('@');
            const maskedEmail = parts[0][0] + '***@' + parts[1];
            return { ...r, email: maskedEmail };
        });
        res.json(masked);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed' });
    }
});

// 8. Tiers Breakdown
router.get('/stats/tiers', async (req, res) => {
    try {
        const { data, error } = await supabase.rpc('get_dashboard_stats');
        if (error) throw error;

        const tiers = (data.tiers || []).map((r: any) => ({
            name: r.name,
            purchases: parseInt(r.count),
            revenue: parseInt(r.count) * (r.name === 'single' ? 0.99 : r.name === 'pack_7' ? 4.99 : 8.99)
        }));
        res.json(tiers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed' });
    }
});

// 9. Live Scrappey Balance
router.get('/stats/scrappey', async (req, res) => {
    try {
        const response = await fetch('https://publisher.scrappey.com/api/v1/balance?key=' + process.env.SCRAPPEY_API_KEY);
        const externalData = await response.json();

        const { data, error } = await supabase.rpc('get_dashboard_stats');
        if (error) throw error;

        res.json({
            balance: externalData.balance || 0,
            usedThisMonth: parseInt(data.scrappey_used_this_month || 0)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed' });
    }
});

export default router;
