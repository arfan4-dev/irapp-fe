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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";

const departments = ["Kitchen", "Reception", "Cleaning Staff", "Security", "Other"];

interface Props {
    open: boolean;
    onClose: () => void;
    initialData?: {
        username?: string;
        email?: string;
        department?: string;
    };
    onSubmit: (formData: FormData) => void;
}

export default function AddUserModal({ open, onClose, initialData, onSubmit }: Props) {
    const [username, setUsername] = useState(initialData?.username || "");
    const [email, setEmail] = useState(initialData?.email || "");
    const [password, setPassword] = useState("");
    const [department, setDepartment] = useState(initialData?.department || "Kitchen");
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        formData.append("username", username);
        formData.append("email", email);
        if (password) formData.append("password", password);
        formData.append("department", department);
        if (fileInputRef.current?.files?.[0]) {
            formData.append("image", fileInputRef.current.files[0]);
        }

        onSubmit(formData);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Update User Info</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label>Username</Label>
                        <Input value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>

                    <div>
                        <Label>Email</Label>
                        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    <div>
                        <Label>New Password</Label>
                        <Input
                            type="password"
                            placeholder="Leave blank to keep current"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div>
                        <Label>Department</Label>
                        <Select value={department} onValueChange={setDepartment}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.map(dep => (
                                    <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Profile Image</Label>
                        <div className="flex gap-4 items-center">
                            <Input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                className="w-full"
                            />
                            {preview && (
                                <img src={preview} alt="Preview" className="h-12 w-12 rounded-full object-cover" />
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
