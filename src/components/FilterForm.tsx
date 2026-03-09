import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filters } from '../types';
import {
    MapPin,
    Euro,
    BedDouble,
    Armchair,
    UserCheck,
    ChevronRight,
    Mail
} from 'lucide-react';

interface Props {
    onSubmit: (filters: Filters, email: string) => void;
}

const CITIES = [
    'Bologna', 'Milan', 'Turin', 'Rome', 'Florence',
    'Naples', 'Padua', 'Pisa', 'Genoa', 'Trento'
];

export default function FilterForm({ onSubmit }: Props) {
    const [filters, setFilters] = useState<Filters>({
        city: 'Bologna',
        budgetMin: 300,
        budgetMax: 700,
        roomType: 'any',
        furnished: 'any',
        listingType: 'both'
    });
    const [email, setEmail] = useState('');

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="w-full max-w-4xl card-premium p-8 md:p-12"
        >
            <form onSubmit={(e) => { e.preventDefault(); onSubmit(filters, email); }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* City Selection */}
                    <motion.div variants={itemVariants} className="space-y-3">
                        <label className="text-sm font-medium flex items-center gap-2 text-light/60">
                            <MapPin size={16} className="text-accent" /> Destination City
                        </label>
                        <select
                            className="input-premium"
                            value={filters.city}
                            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                        >
                            {CITIES.map(c => <option key={c} value={c} className="bg-dark text-white">{c}</option>)}
                        </select>
                    </motion.div>

                    {/* Email Input */}
                    <motion.div variants={itemVariants} className="space-y-3">
                        <label className="text-sm font-medium flex items-center gap-2 text-light/60">
                            <Mail size={16} className="text-accent" /> Results Email
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="your@email.com"
                            className="input-premium"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </motion.div>

                    {/* Budget Range */}
                    <motion.div variants={itemVariants} className="space-y-3">
                        <label className="text-sm font-medium flex items-center gap-2 text-light/60">
                            <Euro size={16} className="text-accent" /> Monthly Budget (€)
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="number"
                                placeholder="Min"
                                className="input-premium"
                                value={filters.budgetMin}
                                onChange={(e) => setFilters({ ...filters, budgetMin: Number(e.target.value) })}
                            />
                            <input
                                type="number"
                                placeholder="Max"
                                className="input-premium"
                                value={filters.budgetMax}
                                onChange={(e) => setFilters({ ...filters, budgetMax: Number(e.target.value) })}
                            />
                        </div>
                    </motion.div>

                    {/* Room Type */}
                    <motion.div variants={itemVariants} className="space-y-3">
                        <label className="text-sm font-medium flex items-center gap-2 text-light/60">
                            <BedDouble size={16} className="text-accent" /> Room Preference
                        </label>
                        <select
                            className="input-premium"
                            value={filters.roomType}
                            onChange={(e) => setFilters({ ...filters, roomType: e.target.value as Filters['roomType'] })}
                        >
                            <option value="any" className="bg-dark text-white">Any Type</option>
                            <option value="single" className="bg-dark text-white">Single Room</option>
                            <option value="shared" className="bg-dark text-white">Shared Room</option>
                            <option value="studio" className="bg-dark text-white">Studio/Flat</option>
                        </select>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Listing Type Toggle */}
                    <motion.div variants={itemVariants} className="space-y-4">
                        <label className="text-sm font-medium flex items-center gap-2 text-light/60">
                            <UserCheck size={16} className="text-accent" /> Listing Provider
                        </label>
                        <div className="flex p-1 bg-white/5 rounded-2xl w-full border border-white/5">
                            {['both', 'private', 'agency'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFilters({ ...filters, listingType: type as Filters['listingType'] })}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 capitalize flex-1 ${filters.listingType === type
                                        ? 'bg-accent text-dark shadow-lg shadow-accent/20'
                                        : 'text-light/50 hover:text-light hover:bg-white/5'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Furnished Toggle */}
                    <motion.div variants={itemVariants} className="space-y-4">
                        <label className="text-sm font-medium flex items-center gap-2 text-light/60">
                            <Armchair size={16} className="text-accent" /> Furnished
                        </label>
                        <div className="flex p-1 bg-white/5 rounded-2xl w-full border border-white/5">
                            {['any', 'yes', 'no'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFilters({ ...filters, furnished: type as Filters['furnished'] })}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 capitalize flex-1 ${filters.furnished === type
                                        ? 'bg-accent text-dark shadow-lg shadow-accent/20'
                                        : 'text-light/50 hover:text-light hover:bg-white/5'
                                        }`}
                                >
                                    {type === 'any' ? 'Either' : type}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <motion.button
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="btn-primary w-full py-5 text-lg"
                >
                    Find Verified Rooms <ChevronRight size={20} />
                </motion.button>
            </form>
        </motion.div>
    );
}
