import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Header from "@/common/Header";
import { useLocation } from "react-router-dom";
import useThemeMode from "@/hooks/useTheme";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export default function EmailSettingsForm() {
      const user = useSelector((state: RootState) => state?.user?.currentUser?.data);
    
    const [fromEmail, setFromEmail] = useState("");
    const [sendgridApiKey, setSendgridApiKey] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const location=useLocation()
      const { theme, setTheme } = useThemeMode(); // now you have access to theme and toggle
      const [serviceName] = useState(user?.role === "admin" ? "Admin Panel" : "Staff Panel");
    const [showAdminSettings, setShowAdminSettings] = useState(false);
    // Load existing settings on mount
    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/email-settings");
                if (!res.ok) throw new Error("Failed to fetch settings");

                const data = await res.json();
                setFromEmail(data.fromEmail || "");
                setSendgridApiKey(data.sendgridApiKey || "");
            } catch (err) {
                toast.error("Could not load email settings.");
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    // Handle save
    const handleSave = async () => {
        if (!fromEmail || !sendgridApiKey) {
            toast.warning("Both fields are required.");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch("/api/email-settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fromEmail, sendgridApiKey }),
            });

            if (!res.ok) throw new Error("Save failed");
            toast.success("Email settings saved.");
        } catch (err) {
            toast.error("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="">

            <Header
                location={location.pathname}
                theme={theme}
                serviceName={serviceName}
                setTheme={setTheme}
                setShowSettings={setShowAdminSettings}
                showSettings={showAdminSettings}
            />
        <div className="max-w-2xl mx-auto mt-24 p-6 bg-white dark:bg-zinc-800 rounded-lg shadow">
           
            <h2 className="text-xl font-semibold mb-4">Email Configuration</h2>

            <div className="space-y-4">
                <div>
                    <Label htmlFor="fromEmail" className="mb-2">From Email Address</Label>
                    <Input
                        id="fromEmail"
                        type="email"
                        placeholder="e.g. no-reply@yourdomain.com"
                        value={fromEmail}
                        onChange={(e) => setFromEmail(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div>
                        <Label htmlFor="apiKey" className="mb-2"> API Key</Label>
                    <Input
                        id="apiKey"
                        type="password"
                        placeholder="SG.xxxxxxx"
                        value={sendgridApiKey}
                        onChange={(e) => setSendgridApiKey(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <Button className="w-full mt-4 hover:bg-transparent cursor-pointer hover:text-black border border-black transition-all duration-300" onClick={handleSave} disabled={saving || loading}>
                    {saving ? "Saving..." : "Save Settings"}
                </Button>
            </div>
            </div> </div>
    );
}
