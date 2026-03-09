import { motion } from 'framer-motion';
import { Listing } from '../types';
import { Home, Ruler, UserCheck, ExternalLink, MapPin } from 'lucide-react';

interface Props {
    listing: Listing;
}

export default function ListingCard({ listing }: Props) {
    const isPrivate = listing.listing_type === 'private';

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="card-premium card-premium-hover overflow-hidden flex flex-col h-full group"
        >
            <div className="relative h-48 bg-white/5 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent z-10" />
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                    <span className={`badge flex items-center gap-1 ${isPrivate ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-500/30 text-gray-300 border border-gray-500/40'}`}>
                        {isPrivate ? '👤 Private' : '🏢 Agency'}
                    </span>
                </div>
                <div className="w-full h-full flex items-center justify-center text-white/5">
                    <Home size={64} strokeWidth={1} />
                </div>
            </div>

            <div className="p-6 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-display font-semibold line-clamp-2 leading-tight flex-grow pr-4">
                        {listing.title}
                    </h3>
                    <div className="text-2xl font-bold text-accent">
                        €{listing.price}
                    </div>
                </div>

                <div className="space-y-3 mb-6 flex-grow">
                    <div className="flex items-center gap-2 text-sm text-light/50">
                        <MapPin size={14} className="text-accent/60" />
                        <span className="truncate">{listing.zone}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-light/40">
                        <div className="flex items-center gap-1.5 capitalize">
                            <Ruler size={13} /> {listing.size_mq ? `${listing.size_mq} mq` : 'N/A'} • {listing.room_type} Room
                        </div>
                        <div className="flex items-center gap-1.5">
                            <UserCheck size={13} /> {isPrivate ? 'No Fees' : (listing.agency_name || 'Verified Agency')}
                        </div>
                    </div>
                </div>

                <a
                    href={listing.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto btn-secondary w-full py-3 flex items-center justify-center gap-2 text-sm group-hover:bg-accent group-hover:text-dark group-hover:border-accent"
                >
                    View Details <ExternalLink size={14} />
                </a>
            </div>
        </motion.div >
    );
}
