import { motion } from 'framer-motion';
import { Listing, Filters } from '../types';
import ListingCard from './ListingCard';
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';

interface Props {
    listings: Listing[];
    filters: Filters;
    onStartOver: () => void;
}

export default function ResultsList({ listings, filters, onStartOver }: Props) {
    const privateMatches = listings.filter(l => l.listing_type === 'private');
    const showPrivateWarning = filters.listingType === 'private' && privateMatches.length < listings.length;

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (listings.length === 0) {
        return (
            <div className="text-center py-20 flex flex-col items-center">
                <AlertCircle size={48} className="text-accent mb-6 opacity-30" />
                <h3 className="text-2xl font-display font-medium mb-4">No rooms found yet</h3>
                <p className="text-light/50 mb-8 max-w-sm">
                    Our spider couldn't find any direct matches. Try expanding your budget or changing the city.
                </p>
                <button onClick={onStartOver} className="btn-primary px-8">
                    Adjust Search
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-display font-bold mb-2 flex items-center gap-3">
                        <Sparkles size={28} className="text-accent" />
                        Top verified leads
                    </h2>
                    <p className="text-light/50">We found {listings.length} rooms matching your search.</p>
                </div>
                <button onClick={onStartOver} className="text-sm font-medium text-light/40 hover:text-accent flex items-center gap-2 transition-colors">
                    <ArrowLeft size={16} /> New Search
                </button>
            </div>

            {showPrivateWarning && (
                <div className="card-premium bg-accent/5 border-accent/20 p-6 flex flex-col sm:flex-row items-center gap-4 text-accent">
                    <AlertCircle size={24} className="flex-shrink-0" />
                    <p className="font-medium text-center sm:text-left">
                        Only {privateMatches.length} private listings matched. Showing agency listings to complete your {listings.length} results.
                    </p>
                </div>
            )}

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {listings.map((l) => (
                    <motion.div key={l.url} variants={itemVariants}>
                        <ListingCard listing={l} />
                    </motion.div>
                ))}
            </motion.div>

            <div className="card-premium bg-accent/[0.02] border-accent/10 p-10 text-center max-w-2xl mx-auto">
                <h3 className="text-2xl font-display font-semibold mb-3">Happy with the results?</h3>
                <p className="text-light/50 mb-8">
                    We've sent the full list along with contact details to your email. Check your inbox and start booking!
                </p>
                <div className="flex justify-center gap-4">
                    <button onClick={onStartOver} className="btn-secondary px-6">
                        Start New Search
                    </button>
                </div>
            </div>
        </div>
    );
}
