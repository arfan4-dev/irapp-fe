import { useState, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createUserByAdmin } from "@/store/features/user/user";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { Eye, EyeOff } from "lucide-react";
import { roles } from "@/lib/constant";




export default function AddUserModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [formState, setFormState] = useState({
        username: "",
        email: "",
        password: "",
        role: "user",
        location: "",
        department: "Kitchen",
    });
    const [showPassword, setShowPassword] = useState(false);
    const { departments } = useSelector((state: RootState) => state?.departments || []);

    const dispatch = useDispatch<AppDispatch>();


    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { loading } = useSelector((state: RootState) => state?.user);
  
    
    const handleChange = (key: string, value: string) => {
        if (key === "email") {
            if (/\s/.test(value)) {
                toast.error("Email cannot contain spaces.");
                return;
            }
            setFormState((prev) => ({ ...prev, email: value }));
        } else if (key === "username") {
            if (/\s/.test(value)) {
                toast.error("Username cannot contain spaces.");
                return;
            }
            const isValid = /^[a-zA-Z0-9]*$/.test(value);
            if (!isValid) {
                toast.error("Username must be alphanumeric only.");
                return;
            }
            setFormState((prev) => ({ ...prev, username: value }));
        } else if (key === "password" || key === "location") {
            if (/\s{2,}/.test(value)) {
                toast.error("Only single spaces allowed between words.");
                return;
            }
            setFormState((prev) => ({ ...prev, [key]: value }));
        } else {
            setFormState((prev) => ({ ...prev, [key]: value }));
        }
    };



    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setPreview(URL.createObjectURL(file));
        } else {
            toast.error("Invalid image file.");
        }
    };

    const handleSubmit = () => {
        const usernameRegex = /^[a-zA-Z0-9 ]+$/;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-z\d@$!%*?&._-]{6,}$/;

        if (formState.username.trim() == "" ||
            formState.email.trim() == "" ||
            formState.password.trim() == "" ||
            formState.role.trim() == "" ||
            formState.location.trim() == "" ||
            formState.department.trim() == "" ||
            !fileInputRef.current?.files?.[0]
        ) return toast.info("Please Fill All the Fields.")

        if (!usernameRegex.test(formState.username)) {
            return toast.error("Username must not contain special characters.");
        }
        if (!emailRegex.test(formState.email)) {
            return toast.error("Please enter a valid email address.");
        }

        if (formState.password && !passwordRegex.test(formState.password)) {
            return toast.error("Password must be at least 6 characters and include uppercase, lowercase, digit, and special character.");
        }

        const formData = new FormData();
        formData.append("username", formState.username);
        formData.append("email", formState.email);
        formData.append("role", formState.role);
        formData.append("location", formState.location);
        if (formState.department) {
            formData.append("department", formState.department);
        }
        if (formState.password) {
            formData.append("password", formState.password);
        }
        if (fileInputRef.current?.files?.[0]) {
            formData.append("image", fileInputRef.current.files[0]);
        }
        if (formState.username.trim() == "" ||
            formState.email.trim() == "" ||
            formState.password.trim() == "" ||
            formState.role.trim() == "" ||
            formState.location.trim() == "" ||
            formState.department.trim() == "" ||
            !fileInputRef.current?.files?.[0]
        ) return toast.info("Please Fill All the Fields.")
        dispatch(createUserByAdmin(formData))
            .unwrap()
            .then(() => {
                toast.success("New User Created Successfully.");
                onClose();
            })
            .catch((err) => {
                toast.error("Failed to Create User.");
                console.error(err);
            });
    };



    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 pt-2">
                    <div className="grid gap-1">
                        <Label className="mb-1">Username</Label>
                        <Input
                            type='text'
                            value={formState.username}
                            onChange={(e) => handleChange("username", e.target.value)}
                            placeholder="Enter Username"
                        />
                    </div>

                    <div className="grid gap-1">
                        <Label className="mb-1">Email</Label>
                        <Input
                            type='email'
                            value={formState.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            placeholder="Enter Email"
                        />
                    </div>

                    <div className="grid gap-1 relative">
                        <Label className="mb-1">Password</Label>
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter Password"
                            value={formState.password}
                            onChange={(e) => handleChange("password", e.target.value)}
                            className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-[28px] text-gray-500 dark:text-gray-400"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>


                    <div className="grid gap-1">
                        <Label className="mb-1">Location</Label>
                        <Input placeholder="Enter Location" name="location" maxLength={20} value={formState.location} onChange={(e) => handleChange("location", e.target.value)} required />
                    </div>
                    <div className="grid gap-1">
                        <Label className="mb-1">Role</Label>
                        <Select value={formState.role} onValueChange={(value) => handleChange("role", value)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role) => (
                                    <SelectItem key={role} value={role}>
                                        {role.charAt(0).toUpperCase() + role.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-1">
                        <Label className="mb-1">Department</Label>
                        <Select
                            value={formState.department}
                            onValueChange={(value) => handleChange("department", value)}
                            disabled={formState.role === "admin"}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.map((dep) => (
                                    <SelectItem key={dep._id} value={dep.name}>
                                        {dep.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-1">
                        <Label className="mb-1">Profile Image</Label>
                        <div className="flex items-center gap-4">
                            <Input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                className="w-full"
                            />
                            {preview && (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="h-12 w-12 rounded-full object-cover"
                                />
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button disabled={loading} onClick={handleSubmit} className="cursor-pointer hover:opacity-75">
                        {loading ? "Saving..." : 'Add'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
