import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import api from "@/api/api";
import { Eye, EyeOff } from "lucide-react";
import { getPasswordStrength } from "@/utils/passwordStrength";

export default function PasswordChangeModal({ userId, open, setOpen }:any) {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

  
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

       const errors = [];
      
        if (newPassword.length < 6) {
                  errors.push("at least 6 characters");
              }
        if (!/[a-z]/.test(newPassword)) {
                  errors.push("one lowercase letter");
              }
              if (!/[A-Z]/.test(newPassword)) {
                  errors.push("one uppercase letter");
              }
              if (!/\d/.test(newPassword)) {
                  errors.push("one number");
              }
              if (!/[@$!%*?&]/.test(newPassword)) {
                  errors.push("one symbol");
              }
      
              if (errors.length > 0) {
                  toast.error(`Password must contain: ${errors.join(", ")}`);
                  return;
              }

        setLoading(true);
        try {
            await api.post(`/change-password/${userId}`, {
                oldPassword,
                newPassword,
            });
            setOpen(false)
            toast.success("Password changed successfully!");
            navigate("/admin-panel");
        } catch (err:any) {
            console.log(err);
            
            toast.error(err.response.data.message||"Failed to change password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Change Your Password</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2 relative">
                        <Label>Current Password</Label>
                        <Input
                            type={showOld ? "text" : "password"}
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowOld(!showOld)}
                            className="absolute right-3 top-8 text-gray-500"
                        >
                            {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <div className="space-y-2 relative">
                        <Label>New Password</Label>
                        <Input
                            type={showNew ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        {newPassword && (
                            <div className="mt-1">
                                <div className="h-2 w-full bg-gray-200 rounded">
                                    <div
                                        className={`h-2 rounded transition-all duration-300 ${getPasswordStrength(newPassword).color}`}
                                        style={{ width: `${getPasswordStrength(newPassword).label === "Weak" ? 33 : getPasswordStrength(newPassword).label === "Medium" ? 66 : 100}%` }}
                                    />
                                </div>
                              
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => setShowNew(!showNew)}
                            className="absolute right-3 top-8 text-gray-500"
                        >
                            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Password must be at least 6 characters, and include 1 uppercase, 1 lowercase, 1 number, and 1 special character.
                    </p>

                    <Button type="submit" className="w-full cursor-pointer hover:opacity-80" disabled={loading}>
                        {loading ? "Please wait..." : "Update Password"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
