import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filters, Listing } from './types';
import FilterForm from './components/FilterForm';
import PricingCards from './components/PricingCards';
import ResultsList from './components/ResultsList';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Loader2, Sparkles } from 'lucide-react';

const API_URL = '/api';

const TIER_MAP: Record<string, string> = {
    'price_single': 'single',
    'price_pack_7': 'pack_7',
    'price_pack_20': 'pack_20',
};

export default function App() {
    const [step, setStep] = useState<'form' | 'pricing' | 'loading' | 'results' | 'error'>('form');
    const [filters, setFilters] = useState<Filters | null>(null);
    const [email, setEmail] = useState('');
    const [listings, setListings] = useState<Listing[]>([]);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isAdminRoute, setIsAdminRoute] = useState(false);
    const [isAdminAuth, setIsAdminAuth] = useState(false);

    useEffect(() => {
        if (window.location.pathname === '/admin') {
            setIsAdminRoute(true);
        }
        const params = new URLSearchParams(window.location.search);
        const urlSessionId = params.get('session_id');
        const status = params.get('status');

        if (urlSessionId && status === 'success') {
            setSessionId(urlSessionId);
            setStep('loading');
            window.history.replaceState({}, '', '/');
        } else if (status === 'cancelled') {
            setStep('form');
            window.history.replaceState({}, '', '/');
        }
    }, []);

    const pollResults = useCallback(async (sid: string) => {
        try {
            const res = await fetch(`${API_URL}/session/${sid}/results`);

            if (!res.ok) {
                if (res.status === 404) {
                    setErrorMsg('Session not found. Please start a new search.');
                } else {
                    setErrorMsg('Server connection lost. Retrying...');
                    return false;
                }
                setStep('error');
                return true;
            }

            const data = await res.json();

            if (data.status === 'complete' && data.listings) {
                setListings(data.listings);
                if (data.filters) setFilters(data.filters);
                setStep('results');
                return true;
            }

            if (data.status === 'failed') {
                setErrorMsg(data.message || 'Scraping failed — the system might be busy.');
                setStep('error');
                return true;
            }

            return false;
        } catch (err) {
            console.error('Polling error:', err);
            return false;
        }
    }, []);

    useEffect(() => {
        if (step !== 'loading' || !sessionId) return;

        let stopped = false;
        const poll = async () => {
            while (!stopped) {
                const done = await pollResults(sessionId);
                if (done || stopped) break;
                await new Promise(r => setTimeout(r, 2000));
            }
        };
        poll();

        return () => { stopped = true; };
    }, [step, sessionId, pollResults]);

    const handleFilterSubmit = (f: Filters, e: string) => {
        setFilters(f);
        setEmail(e);
        setStep('pricing');
    };

    const handleSelectTier = async (priceId: string, _amount: number) => {
        if (!filters || !email) return;
        const tier = TIER_MAP[priceId] || 'single';

        try {
            const res = await fetch(`${API_URL}/create-checkout-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier, email, filters }),
            });

            if (!res.ok) throw new Error('Failed to create payment session');

            const data = await res.json();
            if (data.url) {
                setSessionId(data.sessionId);
                window.location.href = data.url;
            }
        } catch (err) {
            console.error('Checkout error:', err);
            setErrorMsg('Unable to reach payment gateway. Please check your connection.');
            setStep('error');
        }
    };

    const resetApp = () => {
        setStep('form');
        setListings([]);
        setSessionId(null);
        setErrorMsg(null);
    };

    if (isAdminRoute) {
        if (isAdminAuth) {
            return <AdminDashboard onLogout={() => setIsAdminAuth(false)} />;
        }
        // Simple trick to bypass login in development if needed, but we keep it secure per user request
        return <AdminLogin onLogin={() => setIsAdminAuth(true)} />;
    }

    return (
        <div className="min-h-screen flex flex-col items-center selection:bg-accent selection:text-black">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-accent/5 rounded-full blur-[100px]" />
            </div>

            <header className="w-full max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3"
                >
                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-lg shadow-accent/20">
                        <Sparkles size={20} className="text-dark" />
                    </div>
                    <div className="text-lg font-display font-bold tracking-tight">
                        <span className="text-light/40 font-medium">The Om Vlogs ·</span> Housing Finder
                    </div>
                </motion.div>

                {email && step !== 'form' && step !== 'error' && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs font-medium px-4 py-2 rounded-full border border-white/10 bg-white/5 text-light/50 hidden md:block"
                    >
                        Active for: <span className="text-accent">{email}</span>
                    </motion.div>
                )}
            </header>

            <main className="w-full max-w-7xl mx-auto flex-grow px-6 py-12 flex flex-col items-center">
                <AnimatePresence mode="wait">
                    {step === 'form' && (
                        <motion.div
                            key="form-step"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            className="w-full flex flex-col items-center"
                        >
                            <div className="text-center mb-12">
                                <motion.h1
                                    className="text-5xl md:text-7xl font-display leading-[1.1] mb-6 tracking-tight"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    Skip the scams. <br />
                                    <span className="text-accent italic text-glow">Find your room in Italy.</span>
                                </motion.h1>
                                <motion.p
                                    className="text-light/50 max-w-xl mx-auto text-lg md:text-xl font-light"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    Select your preferences. Our specialized bot will scrape the largest Italian portals and send you 20 verified leads instantly.
                                </motion.p>
                            </div>
                            <FilterForm onSubmit={handleFilterSubmit} />
                        </motion.div>
                    )}

                    {step === 'pricing' && (
                        <motion.div
                            key="pricing-step"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="w-full"
                        >
                            <PricingCards onSelectTier={handleSelectTier} />
                        </motion.div>
                    )}

                    {step === 'loading' && (
                        <motion.div
                            key="loading-step"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-20 flex flex-col items-center"
                        >
                            <div className="relative mb-10">
                                <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl animate-pulse" />
                                <Loader2 size={64} className="text-accent animate-spin relative z-10" />
                            </div>
                            <h2 className="text-4xl font-display font-bold mb-4">Deep Search Initiated...</h2>
                            <p className="text-light/50 max-w-sm mb-8 text-lg">
                                Our bot is simulating human behavior and deep-browsing through <span className="text-light">{filters?.city || 'the city'}</span> portals to ensure higher success rates.
                            </p>
                            <div className="px-6 py-4 card-premium border-accent/20 bg-accent/5 flex flex-col items-center gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
                                    <span className="text-sm font-medium text-accent">Estimated time: 5-8 minutes</span>
                                </div>
                                <p className="text-[10px] text-light/30 uppercase tracking-widest mt-2">
                                    Status: Bypassing security gates & analyzing metadata
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {step === 'results' && (
                        <motion.div
                            key="results-step"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full"
                        >
                            <ResultsList
                                listings={listings}
                                filters={filters!}
                                onStartOver={resetApp}
                            />
                        </motion.div>
                    )}

                    {step === 'error' && (
                        <motion.div
                            key="error-step"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-20 flex flex-col items-center max-w-md mx-auto"
                        >
                            <div className="w-20 h-20 rounded-3xl bg-red-500/10 text-red-500 flex items-center justify-center mb-8 shadow-xl shadow-red-500/5 border border-red-500/20">
                                <span className="text-4xl font-bold">!</span>
                            </div>
                            <h2 className="text-4xl font-display font-bold mb-4 tracking-tight">Something went wrong</h2>
                            <p className="text-light/50 mb-10 text-lg leading-relaxed">
                                {errorMsg || "We couldn't complete your request at this time. Don't worry, if you paid, your credits are safe."}
                            </p>
                            <div className="flex flex-col w-full gap-4">
                                <button onClick={resetApp} className="btn-primary py-4">
                                    Try Again
                                </button>
                                <button onClick={() => window.location.reload()} className="btn-secondary py-4">
                                    Refresh Page
                                </button>
                            </div>
                            <p className="mt-8 text-xs text-light/20 font-medium uppercase tracking-[0.2em]">
                                Contact support if this persists
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <footer className="w-full py-12 px-6">
                <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-light/20 text-xs">
                    <p>© 2024 Built for the Om Vlogs community. All rights reserved.</p>
                    <p className="flex items-center gap-4 italic">
                        <span>Reliable.</span>
                        <span>Fast.</span>
                        <span>Scalable.</span>
                    </p>
                </div>
            </footer>
        </div>
    );
}
