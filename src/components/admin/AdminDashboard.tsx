import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import CountUp from 'react-countup';
import { RefreshCw, Users, Search, Euro, Zap, AlertTriangle, LogOut } from 'lucide-react';

interface DashboardData {
    revenue: { allTime: number, thisMonth: number, thisWeek: number, today: number };
    users: { total: number, newToday: number };
    searches: { total: number, newToday: number };
    cities: { name: string, count: number }[];
    filters: { roomType: any[], furnished: any[], listingType: any[], avgBudget: number };
    chart: { name: string, revenue: number }[];
    recent: any[];
    tiers: { name: string, purchases: number, revenue: number }[];
    scrappey: { balance: number, usedThisMonth: number };
}

export const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const fetchData = async () => {
        try {
            const baseUrl = '/api';
            const opts = { credentials: 'include' as RequestCredentials };

            const [rev, usr, src, cit, fil, chr, rec, tier, scr] = await Promise.all([
                fetch(`${baseUrl}/admin/stats/revenue`, opts).then(r => r.json()),
                fetch(`${baseUrl}/admin/stats/users`, opts).then(r => r.json()),
                fetch(`${baseUrl}/admin/stats/searches`, opts).then(r => r.json()),
                fetch(`${baseUrl}/admin/stats/cities`, opts).then(r => r.json()),
                fetch(`${baseUrl}/admin/stats/filters`, opts).then(r => r.json()),
                fetch(`${baseUrl}/admin/stats/chart`, opts).then(r => r.json()),
                fetch(`${baseUrl}/admin/stats/recent`, opts).then(r => r.json()),
                fetch(`${baseUrl}/admin/stats/tiers`, opts).then(r => r.json()),
                fetch(`${baseUrl}/admin/stats/scrappey`, opts).then(r => r.json()),
            ]);

            setData({ revenue: rev, users: usr, searches: src, cities: cit, filters: fil, chart: chr, recent: rec, tiers: tier, scrappey: scr });
            setLastUpdated(new Date());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000); // 60s
        return () => clearInterval(interval);
    }, []);

    const handleLogout = async () => {
        try {
            await fetch(`/api/admin/logout`, { method: 'POST', credentials: 'include' });
            onLogout();
        } catch (e) {
            onLogout();
        }
    };

    if (loading && !data) return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
    );

    if (!data) return <div className="min-h-screen bg-[#0A0A0A] text-white p-8">Failed to load dashboard.</div>;

    const isLowCredits = data.scrappey.balance < 200;
    const isCriticalCredits = data.scrappey.balance < 50;

    const stagger = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
    };

    const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#F5F0E8] selection:bg-amber-500/30 font-sans pb-20">
            {/* Header */}
            <header className="border-b border-[#2A2A2A] bg-[#141414] sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-xl font-serif text-amber-500">The Om Vlogs · Admin</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[#8A8580]">
                        <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                        <button onClick={fetchData} className="hover:text-amber-500 transition-colors flex items-center gap-1">
                            <RefreshCw className="w-4 h-4" /> Refresh
                        </button>
                        <button onClick={handleLogout} className="hover:text-amber-500 transition-colors flex items-center gap-1 ml-4 border-l border-[#2A2A2A] pl-4">
                            <LogOut className="w-4 h-4" /> Exit
                        </button>
                    </div>
                </div>
            </header>

            <motion.main
                variants={stagger} initial="hidden" animate="show"
                className="max-w-7xl mx-auto px-4 pt-8 space-y-8"
            >
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <motion.div variants={item} className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6 hover:border-amber-500/30 transition-colors">
                        <div className="flex items-center gap-3 text-[#8A8580] mb-2">
                            <Euro className="w-5 h-5" /> <h2>Total Earned</h2>
                        </div>
                        <div className="text-4xl font-serif text-amber-500 mb-2 mt-4">
                            €<CountUp end={data.revenue.allTime} decimals={2} duration={1.5} />
                        </div>
                        <div className="text-sm space-y-1 text-[#8A8580]">
                            <p>This month: <span className="text-[#F5F0E8]">€{data.revenue.thisMonth.toFixed(2)}</span></p>
                            <p>This week: <span className="text-[#F5F0E8]">€{data.revenue.thisWeek.toFixed(2)}</span></p>
                            <p className="text-green-500">+€{data.revenue.today.toFixed(2)} today</p>
                        </div>
                    </motion.div>

                    <motion.div variants={item} className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6 hover:border-amber-500/30 transition-colors">
                        <div className="flex items-center gap-3 text-[#8A8580] mb-2">
                            <Users className="w-5 h-5" /> <h2>Total Users</h2>
                        </div>
                        <div className="text-4xl font-serif mb-2 mt-4">
                            <CountUp end={data.users.total} duration={1.5} />
                        </div>
                        <div className="text-sm text-green-500">
                            +{data.users.newToday} new today
                        </div>
                    </motion.div>

                    <motion.div variants={item} className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6 hover:border-amber-500/30 transition-colors">
                        <div className="flex items-center gap-3 text-[#8A8580] mb-2">
                            <Search className="w-5 h-5" /> <h2>Total Searches</h2>
                        </div>
                        <div className="text-4xl font-serif mb-2 mt-4">
                            <CountUp end={data.searches.total} duration={1.5} />
                        </div>
                        <div className="text-sm text-green-500">
                            +{data.searches.newToday} today
                        </div>
                    </motion.div>

                    <motion.div variants={item} className={`bg-[#141414] border transition-colors rounded-xl p-6 relative overflow-hidden ${isCriticalCredits ? 'border-red-500' : isLowCredits ? 'border-amber-500' : 'border-[#2A2A2A] hover:border-amber-500/30'}`}>
                        {isCriticalCredits && <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none" />}
                        <div className="flex items-center gap-3 text-[#8A8580] mb-2 relative z-10">
                            <Zap className="w-5 h-5" /> <h2>Scrappey Credits</h2>
                        </div>
                        <div className={`text-4xl font-serif mb-2 mt-4 relative z-10 ${isCriticalCredits ? 'text-red-500' : ''}`}>
                            <CountUp end={data.scrappey.balance} duration={1.5} />
                        </div>
                        <div className="text-sm text-[#8A8580] relative z-10 flex justify-between items-center">
                            <span>Used this month: {data.scrappey.usedThisMonth}</span>
                            {isLowCredits && <span className="flex items-center gap-1 text-red-500"><AlertTriangle className="w-4 h-4" /> Top up</span>}
                        </div>
                    </motion.div>
                </div>

                {/* Revenue Chart */}
                <motion.div variants={item} className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6">
                    <h2 className="text-lg text-[#8A8580] mb-6">Revenue — Last 30 Days</h2>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.chart}>
                                <XAxis dataKey="name" stroke="#8A8580" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#8A8580" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#141414', border: '1px solid #2A2A2A', borderRadius: '8px' }}
                                    itemStyle={{ color: '#F59E0B' }}
                                    formatter={(value: any) => [`€${Number(value).toFixed(2)}`, 'Revenue']}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#F59E0B" strokeWidth={3} dot={false} activeDot={{ r: 6 }} animationDuration={1000} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Grid 2x1 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cities Bar Chart */}
                    <motion.div variants={item} className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6 col-span-2">
                        <h2 className="text-lg text-[#8A8580] mb-6">Top Cities Searched</h2>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.cities} layout="vertical" margin={{ left: 20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" stroke="#8A8580" fontSize={12} tickLine={false} axisLine={false} width={100} />
                                    <Tooltip
                                        cursor={{ fill: '#2A2A2A', opacity: 0.4 }}
                                        contentStyle={{ backgroundColor: '#141414', border: '1px solid #2A2A2A', borderRadius: '8px' }}
                                        formatter={(value: any) => [value, 'Searches']}
                                    />
                                    <Bar dataKey="count" fill="#F59E0B" radius={[0, 4, 4, 0]} animationDuration={1000} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Filter Breakdown & Revenue Tiers Side column */}
                    <motion.div variants={item} className="space-y-4 flex flex-col h-full">
                        <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6 flex-1">
                            <h2 className="text-lg text-[#8A8580] mb-6">Filter Breakdown</h2>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between items-center border-b border-[#2A2A2A] pb-2">
                                    <span className="text-[#8A8580]">Avg Budget</span>
                                    <span className="font-serif text-lg text-amber-500">€{data.filters.avgBudget}/mo</span>
                                </div>

                                {Object.entries(data.filters).filter(([k]) => k !== 'avgBudget').map(([key, vals]) => {
                                    if (!Array.isArray(vals)) return null;
                                    const total = vals.reduce((sum, v) => sum + v.value, 0) || 1;
                                    const top = [...vals].sort((a, b) => b.value - a.value)[0];

                                    return (
                                        <div key={key} className="flex justify-between items-center">
                                            <span className="text-[#8A8580] capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                            <div className="flex gap-2">
                                                {top && (
                                                    <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-xs border border-amber-500/20">
                                                        {top.name} ({Math.round(top.value / total * 100)}%)
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6">
                            <h2 className="text-lg text-[#8A8580] mb-4">Revenue by Tier</h2>
                            <div className="space-y-3">
                                {data.tiers.map(tier => (
                                    <div key={tier.name} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                                            <span className="capitalize">{tier.name.replace('_', ' ')}</span>
                                            <span className="text-[#8A8580] text-xs">({tier.purchases})</span>
                                        </div>
                                        <span>€{tier.revenue.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Recent Searches Table */}
                <motion.div variants={item} className="bg-[#141414] border border-[#2A2A2A] rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-[#2A2A2A]">
                        <h2 className="text-lg text-[#8A8580]">Recent Searches</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-[#8A8580] uppercase bg-[#0A0A0A] border-b border-[#2A2A2A]">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Time / Date</th>
                                    <th className="px-6 py-4 font-medium">City</th>
                                    <th className="px-6 py-4 font-medium">Budget</th>
                                    <th className="px-6 py-4 font-medium">Room</th>
                                    <th className="px-6 py-4 font-medium">Furn.</th>
                                    <th className="px-6 py-4 font-medium">Tier</th>
                                    <th className="px-6 py-4 font-medium">Credits</th>
                                    <th className="px-6 py-4 font-medium text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2A2A2A]">
                                {data.recent.map((row) => (
                                    <motion.tr
                                        key={row.id}
                                        whileHover={{ backgroundColor: 'rgba(245, 158, 11, 0.03)' }}
                                        className="transition-colors group"
                                        title={`Email: ${row.email}\nStripe ID: ${row.stripe_session_id}`}
                                    >
                                        <td className="px-6 py-4 text-[#8A8580] whitespace-nowrap">
                                            {new Date(row.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4 text-[#F5F0E8] font-medium">{row.city}</td>
                                        <td className="px-6 py-4">€{row.budget_min} - €{row.budget_max}</td>
                                        <td className="px-6 py-4 capitalize">{row.room_type}</td>
                                        <td className="px-6 py-4 capitalize">{row.furnished}</td>
                                        <td className="px-6 py-4 capitalize">{row.pricing_tier.replace('_', ' ')}</td>
                                        <td className="px-6 py-4">{row.scrappey_credits_used || 0}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${row.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                {row.status === 'completed' ? '✓' : '×'}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                                {data.recent.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center text-[#8A8580]">No recent searches found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </motion.main>
        </div>
    );
};
