import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    DollarSign,
    TrendingUp,
    AlertCircle,
    Calendar,
    HardHat,
    Settings
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, detail }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
        <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
            {detail && <p className="text-xs text-slate-400 mt-2">{detail}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-opacity-100`}>
            <Icon size={24} className={color.replace('bg-', 'text-')} />
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

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
    }, []);

    if (loading) return <div className="animate-pulse">Loading dashboard...</div>;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
                <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Sales"
                    value={`LKR ${stats?.totalSales?.toLocaleString()}`}
                    icon={DollarSign}
                    color="bg-green-500"
                    detail="Cumulative sales amount"
                />
                <StatCard
                    title="Total Profit"
                    value={`LKR ${stats?.totalProfit?.toLocaleString()}`}
                    icon={TrendingUp}
                    color="bg-primary"
                    detail="Estimated net gain"
                />
                <StatCard
                    title="Due Payments"
                    value={`LKR ${stats?.totalDue?.toLocaleString()}`}
                    icon={AlertCircle}
                    color="bg-red-500"
                    detail="Pending from customers"
                />
                <StatCard
                    title="Active Rentals"
                    value={stats?.activeRentals}
                    icon={Calendar}
                    color="bg-accent"
                    detail="Currently out on lease"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <HardHat size={20} className="text-primary" />
                        Inventory Status
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <span className="text-slate-600">Total Machines</span>
                            <span className="font-bold text-slate-800">{stats?.machinesCount}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <span className="text-slate-600">Total Parts</span>
                            <span className="font-bold text-slate-800">{stats?.partsCount}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Calendar size={20} className="text-accent" />
                        Rental Monthly Income
                    </h3>
                    <div className="flex flex-col items-center justify-center h-32">
                        <span className="text-3xl font-bold text-slate-800">
                            LKR {stats?.totalRentalIncome?.toLocaleString()}
                        </span>
                        <span className="text-sm text-slate-500 italic mt-1 text-center">
                            Projected income from renewals this month
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
