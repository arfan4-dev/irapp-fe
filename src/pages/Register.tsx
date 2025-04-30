import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
// import {
//     Select,
//     SelectTrigger,
//     SelectValue,
//     SelectContent,
//     SelectItem
// } from "@/components/ui/select";
import { Loader2 } from "lucide-react"; // using lucide-react icons
import { Eye, EyeOff } from "lucide-react";
import PublicHeader from "@/common/PublicHeader";
import useThemeMode from "@/hooks/useTheme";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store"; // if using custom typed dispatch
import { registerUser } from "@/store/features/user/user";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function Register() {
    const { loading } = useSelector((state: RootState) => state?.user);
    const [showPassword, setShowPassword] = useState(false); // 👈 toggle state
    const fileInputRef = useRef<HTMLInputElement>(null);


    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: "user",
        location:"",
        image: null as File | null,
    });
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const { theme, setTheme } = useThemeMode();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, files } = e.target;

        if (name === "image" && files?.[0]) {
            const file = files[0];
            const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

            if (!allowedTypes.includes(file.type)) {
                toast.error("Only JPG, PNG, or WEBP images are allowed.");
                e.target.value = ""; // reset the input
                return;
            }

            setFormData(prev => ({ ...prev, image: file }));
            setPreviewUrl(URL.createObjectURL(file));
        } else if (name === "email") {
            setFormData(prev => ({ ...prev, email: value.toLowerCase() }));
        } else if (name === "username") {
            // Allow only alphanumeric and spaces
            const isValid = /^[a-zA-Z0-9 ]*$/.test(value);
            if (!isValid) {
                toast.error("Username cannot contain special characters.");
                return;
            }
            setFormData(prev => ({ ...prev, username: value }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    // const handleRoleChange = (value: string) => {
    //     setFormData(prev => ({ ...prev, role: value }));
    // };


    const dispatch = useDispatch<AppDispatch>();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.username.length < 3) {
            toast.error("Username must be at least 3 characters long.");
            return;
        }
        const errors = [];

        if (formData.password.length < 6) {
            errors.push("at least 6 characters");
        }
        if (!/[a-z]/.test(formData.password)) {
            errors.push("one lowercase letter");
        }
        if (!/[A-Z]/.test(formData.password)) {
            errors.push("one uppercase letter");
        }
        if (!/\d/.test(formData.password)) {
            errors.push("one number");
        }
        if (!/[@$!%*?&]/.test(formData.password)) {
            errors.push("one symbol");
        }

        if (errors.length > 0) {
            toast.error(`Password must contain: ${errors.join(", ")}`);
            return;
        }


        const payload = new FormData();
        payload.append("username", formData.username);
        payload.append("email", formData.email);
        payload.append("password", formData.password);
        payload.append("role", formData.role);
        payload.append("location", formData.location);
        if (formData.image) {
            payload.append("image", formData.image);
        }

        dispatch(registerUser(payload)).unwrap()
            .then(() => {
                setFormData({
                    username: "",
                    email: "",
                    password: "",
                    role: "user",
                    location:"",
                    image: null,
                });
                toast.success("Registration successfully. Please check your email for verification.");
                setPreviewUrl(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                } // Reset preview URL after successful registration
                
            })
            .catch((error) => {
                console.log(error);
                
            toast.error(error);
                // Handle registration error, e.g., show an error message
            });
    };
    


    return (
        <div className={`${theme === "dark" ? "dark" : ""}`}>
            <PublicHeader theme={theme} setTheme={setTheme} />

            <div className="h-[calc(100vh-57px)] bg-white dark:bg-gray-900 flex items-center justify-center px-4 overflow-hidden">
                <Card className="w-full max-w-md bg-white dark:bg-zinc-900 text-black dark:text-white shadow-md">
                    <CardContent className="px-6 space-y-4">
                        <h2 className="text-2xl font-bold text-center">Register</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Username</Label>
                                <Input name="username" value={formData.username} onChange={handleChange} required />
                            </div>
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
                                    className="pr-10 "
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 top-[32px] text-gray-500 hover:text-gray-800 dark:hover:text-white"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* <div className="space-y-2">
                                <Label>Role</Label>
                                <Select value={formData.role} onValueChange={handleRoleChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="user">User</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div> */}

                            <div className="space-y-2">
                                <Label>Location</Label>
                                <Input placeholder="Enter Location" name="location" maxLength={20} value={formData.location} onChange={handleChange} required />
                            </div>

                            <div className="space-y-2">
                                <Label>Profile Picture</Label>
                                <Input
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleChange}
                                    className="w-full"
                                    required
                                    ref={fileInputRef}

                                />
                                {previewUrl && (
                                    <div className="mt-3 flex flex-col items-center">
                                        <p className="text-sm text-muted-foreground mb-1">Preview</p>
                                        <img
                                            src={previewUrl}
                                            alt="Profile Preview"
                                            className="w-24 h-24 rounded-full border border-gray-300 shadow object-cover"
                                        />
                                    </div>
                                )}
                            </div>


                            <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="animate-spin w-4 h-4" />
                                        Creating...
                                    </span>
                                ) : (
                                    'Create Account'
                                )}
                            </Button>
                            <p className="text-sm text-center mt-2 text-muted-foreground">
                                Already have an account?{" "}
                                <Link to="/login" className="text-blue-600 hover:underline dark:text-blue-400">
                                    Login
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
