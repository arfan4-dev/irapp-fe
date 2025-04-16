import React from "react";
import { Link } from "react-router-dom";
import { FaMoon, FaSun } from "react-icons/fa";
import { Button } from "@/components/ui/button";

interface PublicHeaderProps {
    theme: "light" | "dark";
    setTheme: (theme: "light" | "dark") => void;
}

const PublicHeader: React.FC<PublicHeaderProps> = ({ theme, setTheme }) => {
    
    return (
        <header className="w-full p-2 flex justify-between items-center bg-white dark:bg-gray-900 border-b dark:border-gray-700">
            <Link to="/" className="flex items-center gap-2">
                <img
                    src={theme === "dark" ? "/logo-white.png" : "/logo.png"}
                    alt="Logo"
                    className="h-10 w-10"
                />
                <span className="text-xl font-semibold text-black dark:text-white">
                    IntraServe
                </span>
            </Link>
            <Button
                variant="ghost"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
                {theme === "light" ? <FaMoon /> : <FaSun />}
            </Button>
        </header>
    );
};

export default PublicHeader;
