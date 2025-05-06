// ResetPassword.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react"; // 👈 icons
import { resetPassword } from "@/store/features/user/user";
import { AppDispatch } from "@/store";
import { useDispatch } from "react-redux";
import useThemeMode from "@/hooks/useTheme";
import PublicHeader from "@/common/PublicHeader";

export default function ResetPassword() {
    const dispatch = useDispatch<AppDispatch>();
    const [showPassword, setShowPassword] = useState(false);
    const { theme, setTheme } = useThemeMode(); // now you have access to theme and toggle

    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return toast.error("Token missing in URL.");

        const errors = [];
        if (password.length < 6) errors.push("at least 6 characters");
        if (!/[a-z]/.test(password)) errors.push("1 lowercase");
        if (!/[A-Z]/.test(password)) errors.push("1 uppercase");
        if (!/\d/.test(password)) errors.push("1 number");
        if (!/[@$!%*?&]/.test(password)) errors.push("1 symbol");

        if (errors.length > 0) {
            return toast.error(`Password must contain: ${errors.join(", ")}`);
        }

        setLoading(true);
        try {
            await dispatch(resetPassword({ token, password }))
            toast.success("Password reset successfully!");
            navigate("/login");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <PublicHeader theme={theme} setTheme={setTheme} />

        <div className="h-[calc(100vh-150px)] flex items-center justify-center  dark:bg-gray-900">
            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-md w-full max-w-md space-y-4"
            >
                <h2 className="text-2xl font-bold text-center">Reset Password</h2>
                <div className="relative">
                    <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                <Button  type="submit" className="w-full cursor-pointer hover:opacity-75" disabled={loading}>
                    {loading ? "Please wait..." : "Reset Password"}
                </Button>
            </form>
            </div>
            </div>
    );
}
