import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { Sun,Moon, Mail } from 'lucide-react'; 
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import api from "@/api/api";
import { fetchUserById } from "@/store/features/user/user";
// import { getImageUrl } from "@/utils";
import {LogOut, MonitorCog } from "lucide-react";
import { AvatarImage } from "@radix-ui/react-avatar";
import { getInitials } from "@/utils/getIntialUsername";
// import { logout } from "@/store/slices/userSlice";
import LogoutModal from "@/components/modal/LogoutModal"; // import the modal

interface HeaderProps {
  theme: 'light' | 'dark';
  serviceName: string;
  setTheme: (theme: 'light' | 'dark') => void;
  setShowSettings: (show: boolean) => void;
  showSettings: boolean;
  location?: string;
}

const Header: React.FC<HeaderProps> = ({
  theme,
  serviceName,
  setTheme,
  setShowSettings,
  location
}) => {
  const user = useSelector((state: RootState) => state?.user?.currentUser?.data);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>(); // ✅ typed dispatch
  const { config } = useSelector((state: RootState) => state.siteConfig);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false); // modal state
  const [_, setSuccess] = useState(false);

  const tabs = config?.tabs || {};

  
  const handleLogout = async () => {
    try {
      setLogoutModalOpen(true); // show modal immediately

     const res= await api.post("/logout", {}, { withCredentials: true });
      setSuccess(res.data.success)
      localStorage.removeItem("persist:root");
      localStorage.removeItem("persist:user");

      setTimeout(() => {
        navigate("/login"); // navigate after modal closes
      }, 2500); // match the modal auto-close time
    } catch (error) {
      console.error("Logout failed:", error);
      setLogoutModalOpen(false);
    }
  };
  

  useEffect(() => {

    if (user?.id) {
      dispatch(fetchUserById(user?.id));
    }
  }, [dispatch, user?.id]);



  return (
    <header className="sticky top-0 bg-inherit border-b z-10 dark:bg-gray-900 dark:text-white flex justify-between items-center px-4 ">
      <div className="flex items-center gap-2">
        {
          user?.role === "user" ?
            <Link to="/service-request">
              <img
                src={theme === "dark" ? `${config?.logoUrl || '/assets/logo-white.png'}` : `${config?.logoUrl || '/assets/logo.png'}`}
                alt="Logo"
                className="h-[60px] w-[60px] dark:invert"
              />
            </Link>
            :
            <Link to="/admin-panel">
              <img
                src={theme === "dark" ? `${config?.logoUrl || '/assets/logo-white.png'}` : `${config?.logoUrl || '/assets/logo.png'}`}
                alt="Logo"
                className="h-[60px] w-[60px] dark:invert"
              />
            </Link>
        }


        <h1 className="text-[14px] 2xl:text-xl font-semibold">{serviceName}</h1>
        <div className="hidden lg:flex items-center gap-4 ml-6">


          {location == "/order-status" && (
            <nav>
              <ul className="flex items-center ml-6">
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
          {(location !== "/admin-panel" && location !== "/answered-order" && location !== "/manage-users" && location !== "/staff-panel" && location !== "/manage-categories-departments" && location !=='/email-settings') && (
            <nav>
              <ul className="flex items-center ml-6">
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

          {(location == "/admin-panel" || location == "/answered-order" || location == '/manage-users' || location == '/manage-categories-departments' || location == '/staff-panel' || location == '/email-settings') && (
            <nav>
              <ul className="flex items-center gap-10 ml-6">
               {
                  user?.role === "staff" && <li>
                    <NavLink
                      to="/staff-panel"
                      className="text-[14px] 2xl:text-[16px] hover:underline text-black hover:text-gray-800 dark:text-white transition"
                    >
                      {tabs?.T1 || "Home"}
                    </NavLink>
                  </li>
               }
                {user?.role === "admin" && (<>
                  <li>
                    <NavLink
                      to="/admin-panel"
                      className="text-[14px] 2xl:text-[16px] hover:underline text-black hover:text-gray-800 dark:text-white transition"
                    >
                      {tabs?.T1 || "Home"}
                    </NavLink>
                  </li>
                <li>
                  <NavLink
                    to="/manage-users"
                      className="text-[14px] 2xl:text-[16px] hover:underline text-black hover:text-gray-800 dark:text-white transition"
                  >
                    {tabs?.T2 || "User Management "}
                  </NavLink>
                </li>
                </>)}
                <li>
                  <NavLink
                    to="/answered-order"
                    className="text-[14px] 2xl:text-[16px] hover:underline text-black hover:text-gray-800 dark:text-white transition"
                  >
                    {tabs?.T3 || "Answered order"}
                  </NavLink>
                </li>
                {user?.role === "admin" && <li>
                  <NavLink
                    to="/manage-categories-departments"
                    className="text-[14px] 2xl:text-[16px] hover:underline text-black hover:text-gray-800 dark:text-white transition"
                  >
                    {tabs?.T5 || "Manage Categories and Departments"}
                  </NavLink>
                </li>}
              </ul>
            </nav>
          )}
        </div>

      </div>

      <div className="flex items-center gap-4">
        <Button
          className="cursor-pointer"
          variant="ghost"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? <Moon /> : <Sun />}
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
                              className="w-full h-full object-cover"

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
                {(location !== "/admin-panel" && location !== "/answered-order" && location !== "/manage-users" && location !== '/manage-categories-departments') && (
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

                {(location == "/admin-panel" || location == "/answered-order" || location == '/manage-users' || location == '/manage-categories-departments') && (
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
                      <li>
                        <NavLink
                          to="/manage-categories-departments"
                          className="hover:underline text-black hover:text-gray-800 dark:text-white transition"
                        >
                          {tabs?.T5 || "Manage Categories and Departments"}

                        </NavLink>
                      </li>
                    </ul>
                  </nav>
                )}
              </div>
            </DropdownMenuItem>
            {user?.role == 'admin' && (<><NavLink to='/admin-panel/site-config'>
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2 mt-1 text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white">
                <MonitorCog />  Site Configuration
              </DropdownMenuItem>
            </NavLink>
              {/* <NavLink to='/manage-categories-departments'>
                <DropdownMenuItem className="cursor-pointer flex items-center gap-2 mt-1 text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white">
                  <Building2 /> Department
                </DropdownMenuItem>
              </NavLink> */}
              
              </>)}

            <DropdownMenuItem onClick={() => setShowSettings(true)} className="cursor-pointer flex items-center gap-2 mt-1 text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white">
              ⚙️ Account Settings
            </DropdownMenuItem>
           
            {user?.role == 'admin' && <DropdownMenuItem onClick={() => setShowSettings(true)} className="cursor-pointer flex items-center gap-2 mt-1 text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white">
              <NavLink to="/email-settings">
                <div className="flex items-center gap-2"><Mail /> Email Settings</div>
                
              </NavLink>
            </DropdownMenuItem>}
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
      <LogoutModal  setSuccess={setSuccess} open={logoutModalOpen} onClose={() => setLogoutModalOpen(false)} />

    </header>
  );
};

export default Header;
