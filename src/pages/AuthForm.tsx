import { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "@/store/slices/authSlice";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AuthForm() {
    const dispatch = useDispatch();
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        password: "",
        role: "staff", // default role
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Mock auth logic – in real app, validate with backend
        if (formData.name && formData.password) {
            dispatch(
                login({
                    name: formData.name,
                    role: formData.role,
                })
            );
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-zinc-900">
            <Card className="w-full max-w-sm">
                <CardContent className="space-y-6 p-6">
                    <h2 className="text-2xl font-semibold text-center">
                        {isRegister ? "Register" : "Login"}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block mb-1 text-sm">Username</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full p-2 border rounded dark:bg-zinc-800"
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-sm">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full p-2 border rounded dark:bg-zinc-800"
                                required
                            />
                        </div>

                        {isRegister && (
                            <div>
                                <label className="block mb-1 text-sm">Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded dark:bg-zinc-800"
                                >
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        )}

                        <Button type="submit" className="w-full">
                            {isRegister ? "Register" : "Login"}
                        </Button>
                    </form>

                    <div className="text-sm text-center">
                        {isRegister ? (
                            <>
                                Already have an account?{" "}
                                <button onClick={() => setIsRegister(false)} className="text-blue-500 hover:underline">
                                    Login
                                </button>
                            </>
                        ) : (
                            <>
                                Don't have an account?{" "}
                                <button onClick={() => setIsRegister(true)} className="text-blue-500 hover:underline">
                                    Register
                                </button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
