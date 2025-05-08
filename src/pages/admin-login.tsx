import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { adminLogin } from "@/store/features/user/user";
import { Link, useNavigate } from "react-router-dom";
import PublicHeader from "@/common/PublicHeader";
import useThemeMode from "@/hooks/useTheme";
import PasswordChangeModal from "@/components/modal/PasswordChangeModal";

export default function AdminLogin() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });
    const { theme, setTheme } = useThemeMode(); // now you have access to theme and toggle
    const [serviceName] = useState("IntraServe Admin ");
    const { loading } = useSelector((state: RootState) => state?.user);
    const user = useSelector((state: RootState) => state.user.currentUser?.data);
    const [open, setOpen] = useState(false)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.email || !form.password) {
            toast.error("Please enter both email and password.");
            return;
        }

        try {
            const user = await dispatch(adminLogin(form)).unwrap();
            if (user.data.changePassword) {
                setOpen(true);
                return;
            } 
            if (user.data.role !== "admin") {
                toast.error("Access denied. Only admins can log in.");
                return;
            }
            toast.success("Admin logged in successfully.");
            navigate("/admin-panel"); // redirect to admin dashboard
        } catch (err: any) {
            toast.error("Invalid Credential.");
        }
    };

    return (
        <div>
            <PublicHeader theme={theme} setTheme={setTheme} serviceName={serviceName} />
            <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-white dark:bg-gray-900">
                <div className="w-full max-w-md bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-md text-black dark:text-white">
                    <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium block mb-1"> Username / Email</label>
                            <Input
                                type="text"
                                name="email"
                                placeholder="Enter Username / Email"
                                value={form.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="relative">
                            <label className="text-sm font-medium block mb-1">Password</label>
                            <Input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter Password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(prev => !prev)}
                                className="absolute right-3 top-8 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                              <div className="text-right mt-1">
                                                                <Link
                                                                    to="/forgot-password"
                                                                    className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                                                                >
                                                                    Forgot Password?
                                                                </Link>
                                                            </div>
                        </div>
                        <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="animate-spin w-4 h-4" />

                                    <span className="text-sm">Please wait...</span>
                                </span>
                            ) : (
                                'Login'
                            )}
                        </Button>
                    </form>
                </div>
            </div>
             {user?.changePassword && (
                            <PasswordChangeModal open={open} setOpen={setOpen} userId={user.id} />
                )}
        </div>

    );
}
