import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import PublicHeader from "@/common/PublicHeader";
import useThemeMode from "@/hooks/useTheme";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { AppDispatch } from "@/store"; // 👈 if you're using a typed dispatch
import { loginUser } from "@/store/features/user/user";
import { Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
    const dispatch = useDispatch<AppDispatch>();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" });
    const { theme, setTheme } = useThemeMode(); // now you have access to theme and toggle
    const { loading } = useSelector((state: RootState) => state?.user);
    const navigate=useNavigate()
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
             await dispatch(loginUser(formData)).unwrap()
            .then((res) => {              
                    toast.success("Login successful!");
                    // Optional: redirect or update UI
                if (res.success) {
                    navigate("/service-request"); // Redirect to service request page after successful login

                }
               
            })
        } catch (err) {
            console.error("Login error:", err);
            toast.error(err as any);
        }
    };

    return (
        <div>
            <PublicHeader theme={theme} setTheme={setTheme} />

            <div className="h-[calc(100vh-64px)] bg-white dark:bg-gray-900 flex items-center justify-center px-4 overflow-hidden">
                <Card className="w-full max-w-md bg-white dark:bg-zinc-900 text-black dark:text-white">
                    <CardContent className="px-6 space-y-4">
                        <h2 className="text-2xl font-bold text-center">Login</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input type="email" name="email" value={formData.email} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2 relative">
                                <Label>Password</Label>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 top-[33px] text-gray-500 hover:text-gray-800 dark:hover:text-white"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
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
                            <p className="text-sm text-center mt-2 text-muted-foreground">
                                Don't have an account?{" "}
                                <Link to="/" className="text-blue-600 hover:underline dark:text-blue-400">
                                    Register
                                </Link>
                            </p>

                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
       
    );
}
