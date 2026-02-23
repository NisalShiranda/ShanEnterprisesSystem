import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    HardHat,
    Package,
    ShoppingCart,
    CalendarDays,
    LogOut,
    ChevronRight,
    History
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();

    const navItems = [
        { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Inventory', path: '/machines', icon: HardHat },
        { name: 'Sales Hub', path: '/sales', icon: ShoppingCart },
        { name: 'Sales History', path: '/sales-history', icon: History },
        { name: 'Rentals', path: '/rentals', icon: CalendarDays },
    ];

    return (
        <aside className="w-64 h-screen bg-white border-r border-slate-100 flex flex-col fixed left-0 top-0 z-20 print:hidden">
            {/* Brand Logo */}
            <div className="h-16 flex items-center px-6 border-b border-slate-50">
                <div className="flex items-center gap-3">
                    <img src="/logo.jpeg" alt="Logo" className="w-8 h-8 object-contain" />
                    <div>
                        <h1 className="text-[11px] font-black text-slate-900 tracking-tight leading-none uppercase">Shan Enterprises</h1>
                        <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">Systems</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-1">
                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Main Menu</p>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `group flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-300 ${isActive
                                ? 'bg-slate-900 text-white shadow-md shadow-slate-200'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <div className="flex items-center gap-3">
                                    <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                    <span className="text-sm font-semibold tracking-tight">{item.name}</span>
                                </div>
                                <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'hidden' : ''}`} />
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer / User Profile Area */}
            <div className="p-4 border-t border-slate-50">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 group"
                >
                    <div className="p-1.5 rounded-lg group-hover:bg-red-100 transition-colors">
                        <LogOut size={18} />
                    </div>
                    <span className="text-sm font-bold tracking-tight">Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
