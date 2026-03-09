import { motion } from 'framer-motion';
import { Check, Zap, Rocket, ShieldCheck } from 'lucide-react';

interface Props {
    onSelectTier: (priceId: string, amount: number) => void;
}

const TIERS = [
    {
        id: 'price_single',
        name: 'Single Hunt',
        price: 0.99,
        leads: '20 Leads',
        description: 'Perfect for a quick look at the market.',
        icon: Zap,
        features: ['Instant email delivery', 'Verified private/agency', 'No hidden fees'],
        popular: false
    },
    {
        id: 'price_pack_7',
        name: 'Active Hunter',
        price: 4.99,
        leads: '7 Searches',
        description: 'Best for students moving across cities.',
        icon: Rocket,
        features: ['Priority scraping speed', 'Valid for 30 days', '7 x 20 leads guaranteed', 'Premium support'],
        popular: true
    },
    {
        id: 'price_pack_20',
        name: 'Power Searcher',
        price: 8.99,
        leads: '20 Searches',
        description: 'For organizations or groups of friends.',
        icon: ShieldCheck,
        features: ['White-glove matching', 'No expiry date', 'Dedicated team support'],
        popular: false
    }
];

export default function PricingCards({ onSelectTier }: Props) {
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="w-full">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">Transparent Pricing</h2>
                <p className="text-light/50">Pay only for the verified leads you need. No monthly subscriptions.</p>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
            >
                {TIERS.map((tier) => (
                    <motion.div
                        key={tier.id}
                        variants={itemVariants}
                        className={`card-premium relative p-8 flex flex-col ${tier.popular ? 'border-accent/40 bg-accent/[0.04] scale-105 z-10' : 'bg-white/5'
                            }`}
                    >
                        {tier.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-dark text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg shadow-accent/20">
                                Most Popular
                            </div>
                        )}

                        <div className="mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent mb-6">
                                <tier.icon size={24} />
                            </div>
                            <h3 className="text-2xl font-display font-bold mb-1">{tier.name}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold italic">€{tier.price}</span>
                                <span className="text-sm text-light/30">/ search pack</span>
                            </div>
                            <p className="text-xs text-accent mt-2 font-medium tracking-wide uppercase">
                                {tier.leads}
                            </p>
                        </div>

                        <div className="space-y-4 mb-10 flex-grow">
                            {tier.features.map(f => (
                                <div key={f} className="flex items-center gap-3 text-sm text-light/60">
                                    <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                                        <Check size={12} className="text-accent" />
                                    </div>
                                    {f}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => onSelectTier(tier.id, tier.price)}
                            className={`w-full py-4 rounded-xl font-bold transition-all duration-300 ${tier.popular
                                ? 'bg-accent text-dark shadow-xl shadow-accent/20 hover:brightness-110 active:scale-95'
                                : 'bg-white/5 text-white hover:bg-white/10 active:scale-95 border border-white/5'
                                }`}
                        >
                            Select Plan
                        </button>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
