import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './navbar';

function Layout() {
    return (
        <div className="layout">
            <Navbar />
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;