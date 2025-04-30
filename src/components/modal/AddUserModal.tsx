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

const departments = ["Reception",
    "Kitchen",
    "Housekeeping",
    "Maintenance",
    "Security",
    "IT Support",
    "Accounts / Finance",
    "HR (Human Resources)",
    "Front Desk",
    "Customer Service",
    "Logistics",
    "Cleaning Crew",
    "Operations",
    "Managerial Staff",
    "Laundry"
];
const roles = ["user", "admin", "staff"];

export default function AddUserModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [formState, setFormState] = useState({
        username: "",
        email: "",
        password: "",
        role: "user",
        location:"",
        department: "Kitchen",
    });
      const dispatch = useDispatch<AppDispatch>();
    

    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const {loading} = useSelector((state: RootState) => state?.user);
    const handleChange = (key: string, value: string) => {
        setFormState((prev) => ({ ...prev, [key]: value }));
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

        dispatch(createUserByAdmin(formData)).unwrap().then(()=>{
            toast.success('New User Created Successfully.')
            onClose();
        }).catch(err=>{
            toast.error('Failed to Create User.')
            console.log(err)
        })

        // Submit formData here
       
    };
    console.log(formState);
    

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 pt-2">
                    <div className="grid gap-1">
                        <Label>Username</Label>
                        <Input
                            type='text'
                            value={formState.username}
                            onChange={(e) => handleChange("username", e.target.value)}
                            placeholder="Enter Username"
                        />
                    </div>

                    <div className="grid gap-1">
                        <Label>Email</Label>
                        <Input
                        type='email'
                            value={formState.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            placeholder="Enter Email"
                        />
                    </div>

                    <div className="grid gap-1">
                        <Label> Password</Label>
                        <Input
                            type="password"
                            placeholder="Enter Password"
                            value={formState.password}
                            onChange={(e) => handleChange("password", e.target.value)}
                        />
                    </div>

                    <div className="grid gap-1">
                                <Label>Location</Label>
                        <Input placeholder="Enter Location"  name="location" maxLength={20} value={formState.location} onChange={(e) => handleChange("location", e.target.value)} required />
                            </div>
                    <div className="grid gap-1">
                        <Label>Role</Label>
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
                        <Label>Department</Label>
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
                                    <SelectItem key={dep} value={dep}>
                                        {dep}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-1">
                        <Label>Profile Image</Label>
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
                        {loading?"Saving...":'Add'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
