import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    HardHat,
    Settings,
    ShoppingCart,
    CalendarRange,
    Users,
    LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Machines', path: '/machines', icon: HardHat },
        { name: 'Parts', path: '/parts', icon: Settings },
        { name: 'Sales', path: '/sales', icon: ShoppingCart },
        { name: 'Rentals', path: '/rentals', icon: CalendarRange },
    ];

    return (
        <div className="w-64 h-screen bg-secondary text-white flex flex-col fixed left-0 top-0 overflow-y-auto">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-accent">Shan Ent.</h1>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition duration-200 ${isActive
                                ? 'bg-primary text-white shadow-lg'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`
                        }
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-700">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:bg-red-500 hover:text-white rounded-lg transition duration-200"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
