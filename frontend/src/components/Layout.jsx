import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col print:ml-0">
                <Navbar />
                <main className="p-8 flex-1 print:p-0">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
