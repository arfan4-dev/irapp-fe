import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";

import { fetchUserById } from "@/store/features/user/user";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { FaMoon, FaSun } from "react-icons/fa";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Building2, LogOut, MonitorCog } from "lucide-react";
import api from "@/api/api";
import { getInitials } from "@/utils/getIntialUsername";

// interface HeaderProps {
//     theme?: 'light' | 'dark';
//     serviceName?: string;
//     location: string;
//     setShowSettings?: boolean;
//     setTheme?: (theme: 'light' | 'dark') => void;
//     tabs: {
//         T1: string;
//         T2: string;
//         T3: string;
//         T4: string;
//     };
//     logoPreview: string;
    
// }

const PreviewHeader: React.FC<any> = ({
    location,
    serviceName,
    tabs,
    logoPreview,
    setTheme,
    theme,
    setShowSettings

}) => {
    const user = useSelector((state: RootState) => state?.user?.currentUser?.data);
    const dispatch = useDispatch<AppDispatch>(); // ✅ typed dispatch
    const { config } = useSelector((state: RootState) => state.siteConfig || []);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.post("/logout", {}, { withCredentials: true });
            navigate("/login");
            localStorage.removeItem("persist:user");
            localStorage.removeItem("persist:root");
        } catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {

        if (user?.id) {
            dispatch(fetchUserById(user.id));
        }
    }, [dispatch, user?.id]);

    return (
        <header className="sticky top-0 bg-inherit border-b z-10 dark:bg-gray-900 dark:text-white flex justify-between items-center px-4 ">
            <div className="flex justify-between items-center gap-2 w-full">
                <div className="flex items-center gap-2">
                    <Link to='/admin-panel'>
                        <img
                            src={config.logoUrl || logoPreview}
                            alt="Logo"
                            className="h-[60px] w-[60px]"
                        /></Link>



                    <h1 className="text-[14px] md:text-xl font-semibold">{serviceName}</h1>
                    <div className="hidden lg:flex items-center gap-4 ml-6">

                        {(
                            <nav>
                                <ul className="flex items-center gap-10 ml-6">
                                    <li>
                                        <p

                                            className="hover:underline text-black hover:text-gray-800 dark:text-white transition"
                                        >
                                            <Link to='/admin-panel'>
                                                {tabs.T1 || config.tabs.T1 || ' Home'}</Link>
                                        </p>
                                    </li>
                                    <li>
                                        <p

                                            className="hover:underline text-black hover:text-gray-800 dark:text-white transition"
                                        >
                                            <Link to='/manage-users'>
                                                {tabs.T2 || config.tabs.T2 || 'User Management'}</Link>
                                        </p>
                                    </li>
                                    <li>
                                        <p

                                            className="hover:underline text-black hover:text-gray-800 dark:text-white transition"
                                        >
                                            <Link to='/answered-order'>
                                                {tabs.T3 || config.tabs.T3 || 'Answered order'}
                                            </Link>
                                        </p>
                                    </li>
                                </ul>
                            </nav>
                        )}
                    </div></div>

                <div className="flex items-center gap-4">
                    <Button
                        className="cursor-pointer"
                        variant="ghost"
                        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                    >
                        {theme === "light" ? <FaMoon /> : <FaSun />}
                    </Button>

                    {/* User Dropdown with Avatar */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="p-0 cursor-pointer  rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800">
                                <Avatar className="h-9 w-9">
                                    {user?.image ?
                                        <AvatarImage
                                            // src={'/logo.png'}
                                            src={user?.image}
                                            alt={user?.name || "User"}
                                        />
                                        : <AvatarFallback>{getInitials(user?.username || "U")}</AvatarFallback>}
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-zinc-900">
                            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.username}</p>
                                <p className="text-xs text-gray-500 truncate dark:text-gray-400">{user?.email}</p>
                            </div>
                            <DropdownMenuItem
                                asChild
                                className="cursor-pointer flex items-center gap-2 mt-1 text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white"
                            >
                                <div className="flex flex-col lg:hidden items-start gap-4 ">


                                    {location == "/order-status" && (
                                        <nav>
                                            <ul className="flex  ">
                                                <li>
                                                    <NavLink
                                                        to="/service-request"
                                                        className="hover:underline text-black hover:text-gray-800 dark:text-white transition"
                                                    >
                                                        {tabs?.T1 || "Home"}
                                                    </NavLink>
                                                </li>
                                            </ul>
                                        </nav>
                                    )}
                                    {(location !== "/admin-panel" && location !== "/answered-order" && location !== "/manage-users") && (
                                        <nav>
                                            <ul className="flex  ">
                                                <li>
                                                    <NavLink
                                                        to="/order-status"
                                                        className="hover:underline text-black hover:text-gray-800 dark:text-white transition"
                                                    >
                                                        {tabs?.T4 || "Orders"}
                                                    </NavLink>
                                                </li>
                                            </ul>
                                        </nav>
                                    )}

                                    {(location == "/admin-panel" || location == "/answered-order" || location == '/manage-users') && (
                                        <nav>
                                            <ul className="flex flex-col items-start gap-2 list-disc ml-4">
                                                <li>
                                                    <NavLink
                                                        to="/admin-panel"
                                                        className="hover:underline text-black hover:text-gray-800 dark:text-white transition"
                                                    >
                                                        {tabs?.T1 || "Home"}

                                                    </NavLink>
                                                </li>
                                                <li>
                                                    <NavLink
                                                        to="/manage-users"
                                                        className="hover:underline text-black hover:text-gray-800 dark:text-white transition"
                                                    >
                                                        {tabs?.T2 || "  User Management "}
                                                    </NavLink>
                                                </li>
                                                <li>
                                                    <NavLink
                                                        to="/answered-order"
                                                        className="hover:underline text-black hover:text-gray-800 dark:text-white transition"
                                                    >
                                                        {tabs?.T3 || "Answered order"}

                                                    </NavLink>
                                                </li>
                                            </ul>
                                        </nav>
                                    )}
                                </div>
                            </DropdownMenuItem>
                            {user.role == 'admin' && (<><NavLink to='/admin-panel/site-config'>
                                <DropdownMenuItem className="cursor-pointer flex items-center gap-2 mt-1 text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white">
                                    <MonitorCog />  Site Configuration
                                </DropdownMenuItem>
                            </NavLink>
                                <NavLink to='/departments'>
                                    <DropdownMenuItem className="cursor-pointer flex items-center gap-2 mt-1 text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white">
                                        <Building2 /> Department
                                    </DropdownMenuItem>
                                </NavLink></>)}

                            <DropdownMenuItem onClick={() => setShowSettings(true)} className="cursor-pointer flex items-center gap-2 mt-1 text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white">
                                ⚙️ Profile Setting
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-red-600 hover:text-red-700 cursor-pointer"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </DropdownMenuItem>

                        </DropdownMenuContent>

                    </DropdownMenu>
                </div>

            </div>


        </header>
    );
};

export default PreviewHeader;
