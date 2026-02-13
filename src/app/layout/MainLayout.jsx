import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
    return (
        <div className="relative w-full h-full overflow-hidden">
            {/* Actual Content - responsive padding, allow horizontal scroll for tables */}
            <div className="relative z-10 w-full h-full overflow-auto">
                <div className="p-2 sm:p-4 min-h-full w-full">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
