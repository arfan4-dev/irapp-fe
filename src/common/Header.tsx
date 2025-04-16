import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { FaSun, FaMoon } from "react-icons/fa";
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
import { LogOut } from "lucide-react";

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



  const handleLogout = async () => {
    try {
      await api.post("/logout", {}, { withCredentials: true });
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };


  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserById(user.id));
    }
  }, [dispatch, user?.id]);


  const getInitials = (name: string) => {
    return name?.charAt(0).toUpperCase() || "U";
  };

  return (
    <header className="sticky top-0 bg-inherit border-b z-10 dark:bg-gray-900 dark:text-white flex justify-between items-center px-4 ">
      <div className="flex items-center gap-2">
        <Link to="/">
          <img
            src={theme === "dark" ? "/logo-white.png" : "/logo.png"}
            alt="Logo"
            className="h-[60px] w-[60px]"
          />
        </Link>

        <h1 className="text-xl font-semibold">{serviceName}</h1>

        {location !== "/admin" && (
          <nav>
            <ul className="flex items-center ml-6">
              <li>
                <NavLink
                  to="/order-status"
                  className="hover:underline text-black hover:text-gray-800 dark:text-white transition"
                >
                  Orders
                </NavLink>
              </li>
            </ul>
          </nav>
        )}
      </div>

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
                {/* <AvatarImage
                  // src={'/logo.png'}
                  src={getImageUrl(user?.image)}
                  alt={user?.name || "User"}
                /> */}
                <AvatarFallback>{getInitials(user?.username || "U")}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-zinc-900">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.username}</p>
              <p className="text-xs text-gray-500 truncate dark:text-gray-400">{user?.email}</p>
            </div>
            <DropdownMenuItem onClick={() => setShowSettings(true)}>
              ⚙️ User Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </DropdownMenuItem>

          </DropdownMenuContent>

        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
