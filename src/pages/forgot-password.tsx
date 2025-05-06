import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import PublicHeader from "@/common/PublicHeader";
import useThemeMode from "@/hooks/useTheme";
import { forgetPassword } from "@/store/features/user/user";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";

export default function ForgotPassword() {
    const dispatch = useDispatch<AppDispatch>();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const { theme, setTheme } = useThemeMode(); // now you have access to theme and toggle

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error("Please enter your email.");
            return;
        }

        setLoading(true);
        try {
            await dispatch(forgetPassword({ email })).unwrap()
            toast.success( "Reset link sent to your email.");
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    console.log("loading:", loading);
    
    return (
        <div>
                        <PublicHeader theme={theme} setTheme={setTheme} />
            <div className="h-[calc(100vh-200px)] bg-white dark:bg-gray-900 flex items-center justify-center px-4">


                <Card className="w-full max-w-md bg-white dark:bg-zinc-900 text-black dark:text-white">
                    <CardContent className="px-6 space-y-4">
                        <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    placeholder="Enter your registered email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <Button  type="submit" className="w-full cursor-pointer hover:opacity-75" disabled={loading}>
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="animate-spin w-4 h-4" />
                                        Sending...
                                    </span>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
       
    );
}
