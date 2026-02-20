import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    DollarSign,
    TrendingUp,
    AlertCircle,
    Calendar,
    HardHat,
    Package,
    Clock,
    LayoutDashboard
} from 'lucide-react';

const SimpleStatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-4">
            <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10 text-opacity-100`}>
                <Icon size={18} className={colorClass.replace('bg-', 'text-')} />
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{title}</p>
                <h3 className="text-lg font-bold text-slate-900 leading-none">{value}</h3>
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/dashboard/stats');
                setStats(data);
            } catch (err) {
                console.error('Error fetching stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();

        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const greeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Simple Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">{greeting()}, Nisal</h1>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">System overview for {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-2 text-primary bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
                    <LayoutDashboard size={14} className="font-bold" />
                    <span className="text-[11px] font-black uppercase tracking-widest">Dashboard Active</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SimpleStatCard
                    title="Revenue"
                    value={`LKR ${stats?.totalSales?.toLocaleString()}`}
                    icon={DollarSign}
                    colorClass="bg-indigo-500"
                />
                <SimpleStatCard
                    title="Profit"
                    value={`LKR ${stats?.totalProfit?.toLocaleString()}`}
                    icon={TrendingUp}
                    colorClass="bg-emerald-500"
                />
                <SimpleStatCard
                    title="Dues"
                    value={`LKR ${stats?.totalDue?.toLocaleString()}`}
                    icon={AlertCircle}
                    colorClass="bg-rose-500"
                />
                <SimpleStatCard
                    title="Rentals"
                    value={stats?.activeRentals}
                    icon={Clock}
                    colorClass="bg-amber-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Inventory Widget */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <Package size={16} className="text-primary" />
                            Inventory Status
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Total Items: {(stats?.machinesCount || 0) + (stats?.partsCount || 0)}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <HardHat size={18} className="text-slate-600" />
                                </div>
                                <span className="text-xs font-bold text-slate-500">Heavy Machines</span>
                            </div>
                            <span className="text-xl font-black text-slate-900">{stats?.machinesCount}</span>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Package size={18} className="text-slate-600" />
                                </div>
                                <span className="text-xs font-bold text-slate-500">Spare Parts</span>
                            </div>
                            <span className="text-xl font-black text-slate-900">{stats?.partsCount}</span>
                        </div>
                    </div>
                </div>

                {/* Rental Income Widget */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Calendar size={16} className="text-amber-500" />
                        Monthly Projections
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Estimated Income</p>
                            <h2 className="text-2xl font-black text-slate-900">
                                LKR {stats?.totalRentalIncome?.toLocaleString()}
                            </h2>
                        </div>

                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full w-[65%]" />
                        </div>

                        <div className="space-y-2 pt-2">
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                                <span>Base renewals: {stats?.activeRentals}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                                <span>Growth target: 12.5%</span>
                            </div>
                        </div>

                        <button className="w-full mt-2 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-primary transition-all shadow-sm">
                            Manage Renewals
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
