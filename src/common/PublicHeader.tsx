import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Sun,Moon } from 'lucide-react'; 
import { Button } from "@/components/ui/button";

interface PublicHeaderProps {
    theme: "light" | "dark";
    setTheme: (theme: "light" | "dark") => void;
    serviceName?: string;
}

const PublicHeader: React.FC<PublicHeaderProps> = ({ theme, setTheme, serviceName='IntraServe' }) => {
    const location=useLocation();
    return (
        <header className="w-full p-2 flex justify-between items-center bg-white dark:bg-gray-900 border-b dark:border-gray-700">
            <div className="flex items-center gap-7">
                <Link to="/" className="flex items-center gap-2">
                    <img
                        src={theme === "dark" ? "/assets/logo-white.png" : "/assets/logo.png"}
                        alt="Logo"
                        className="h-10 w-10"
                    />
                    <span className="text-xl font-semibold text-black dark:text-white">
                        {serviceName}
                    </span>
                </Link>
                {
                    location.pathname === '/admin' && <NavLink to="/login" className="flex items-center gap-2 ">
                        <ul >
                            <li className="hover:underline"> Login</li>
                        </ul>
                    </NavLink>
                }
                
                {location.pathname === '/login' && <NavLink to="/admin" className="flex items-center gap-2 ">
                    <ul >
                        <li className="hover:underline">Admin Login</li>
                    </ul>
                </NavLink>}

                {location.pathname === '/' && <> <NavLink to="/login" className="flex items-center gap-2 ">
                    <ul >
                        <li className="hover:underline"> Login</li>
                    </ul>
                </NavLink>
                
                    <NavLink to="/admin" className="flex items-center gap-2 ">
                        <ul >
                            <li className="hover:underline">Admin Login</li>
                        </ul>
                    </NavLink></> }

            </div>
           
            <Button
                className="cursor-pointer"
                variant="ghost"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
                {theme === "light" ? <Moon /> : <Sun />}
            </Button>
        </header>
    );
};

export default PublicHeader;
