import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import PreviewHeader from "@/components/preview-header/preview-header";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchSiteConfig, updateSiteConfig } from "@/store/features/siteConfig/siteConfig";
import useThemeMode from "@/hooks/useTheme";
import { useLocation } from 'react-router-dom';
import UserSetting from "@/common/UserSetting";
import { filterAlphaSpaces } from "@/utils/alphaSpace";

export default function SiteConfig() {
    const dispatch = useDispatch<AppDispatch>();
    const { loading, config } = useSelector((state: RootState) => state.siteConfig);
    const { theme,setTheme } = useThemeMode();
    const user = useSelector((state: RootState) => state?.user?.currentUser?.data);

    const [siteTitle, setSiteTitle] = useState("");
    const [tagline, setTagline] = useState("");
    const [brandName, setBrandName] = useState("");
    const [logoPreview, setLogoPreview] = useState("/assets/logo.png");
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
    const [tabs, setTabs] = useState({ T1: '', T2: '', T3: '', T4: '', T5: '' });
    const location=useLocation()
    const [isEditing, setIsEditing] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);
    const faviconInputRef = useRef<HTMLInputElement>(null);
    const [showSettings,setShowSettings]=useState(false)
    const charOnly = /^[a-zA-Z\s]*$/;
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        dispatch(fetchSiteConfig());
    }, [dispatch]);

    useEffect(() => {
        if (config) {
            setSiteTitle(config.siteTitle || '');
            setTagline(config.tagline || '');
            setBrandName(config.brandName || '');
            setLogoPreview(config.logo || '/assets/logo.png');
            setFaviconPreview(config.favicon || '');
            setTabs(config.tabs || { T1: '', T2: '', T3: '', T4: '', T5: '' });
        }
    }, [config]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setLogoPreview(URL.createObjectURL(file));
        } else {
            toast.error("Please upload a valid image file.");
        }
    };

    const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setFaviconPreview(URL.createObjectURL(file));
        } else {
            toast.error("Please upload a valid image file.");
        }
    };

    // const handleSubmit = () => {
    //     if (!isEditing) return;

    //     if (![siteTitle, tagline, brandName, tabs.T1, tabs.T2, tabs.T3, tabs.T4].every(v => charOnly.test(v))) {
    //         return toast.error("Only alphabets and spaces are allowed in all fields.");
    //     }

    //     const formData = new FormData();
    //     formData.append("siteTitle", siteTitle);
    //     formData.append("tagline", tagline);
    //     formData.append("tabs", JSON.stringify(tabs));
    //     formData.append("brandName", brandName);
    //     if (logoInputRef.current?.files?.[0]) formData.append("logo", logoInputRef.current.files[0]);
    //     if (faviconInputRef.current?.files?.[0]) formData.append("favicon", faviconInputRef.current.files[0]);

    //     dispatch(updateSiteConfig(formData)).unwrap().then(() => {
    //         toast.success("Settings updated successfully.");
    //         setIsEditing(false);
    //         dispatch(fetchSiteConfig());
    //     }).catch(() => toast.error("Update failed."));
    // };

    const handleSubmit = () => {
        if (!isEditing) return;

        if (![siteTitle, tagline, brandName, tabs.T1, tabs.T2, tabs.T3, tabs.T4, tabs.T5].every(v => charOnly.test(v))) {
            return toast.error("Only alphabets and spaces are allowed in all fields.");
        }

        const isUnchanged =
            siteTitle === (config.siteTitle || '') &&
            tagline === (config.tagline || '') &&
            brandName === (config.brandName || '') &&
            tabs.T1 === (config.tabs?.T1 || '') &&
            tabs.T2 === (config.tabs?.T2 || '') &&
            tabs.T3 === (config.tabs?.T3 || '') &&
            tabs.T4 === (config.tabs?.T4 || '') &&
            tabs.T5=== (config.tabs?.T5 || '') &&
            !logoInputRef.current?.files?.[0] &&
            !faviconInputRef.current?.files?.[0];

        if (isUnchanged) {
            toast.info("No changes detected.");
            return;
        }

        const formData = new FormData();
        formData.append("siteTitle", siteTitle);
        formData.append("tagline", tagline);
        formData.append("tabs", JSON.stringify(tabs));
        formData.append("brandName", brandName);
        if (logoInputRef.current?.files?.[0]) formData.append("logo", logoInputRef.current.files[0]);
        if (faviconInputRef.current?.files?.[0]) formData.append("favicon", faviconInputRef.current.files[0]);

        dispatch(updateSiteConfig(formData)).unwrap().then(() => {
            toast.success("Settings updated successfully.");
            setIsEditing(false);
            dispatch(fetchSiteConfig());
        }).catch(() => toast.error("Update failed."));
    };

    const handleCancel = () => {
        if (config) {
            setSiteTitle(config.siteTitle || '');
            setTagline(config.tagline || '');
            setBrandName(config.brandName || '');
            setLogoPreview(config.logo || '/assets/logo.png');
            setFaviconPreview(config.favicon || '');
            setTabs(config.tabs || { T1: '', T2: '', T3: '', T4: '',T5:'' });
        }
        setIsEditing(false);
    };

    return (
        <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-black"}`}>
            <PreviewHeader showSettings={showSettings} setShowSettings={setShowSettings} tabs={tabs} logoPreview={logoPreview} theme={theme} setTheme={setTheme} location={location}  />
            <div className="space-y-10 max-w-[1200px] mx-auto p-4">
                <h1 className="text-2xl font-bold">Site Identity</h1>
                <Card>
                    <CardContent className="p-6 space-y-8">
                        {/* Site Title */}
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <Label className="w-40">Site Title</Label>
                            <Input
                                disabled={!isEditing}
                                value={siteTitle}
                                onChange={(e) => setSiteTitle(filterAlphaSpaces(e.target.value))}
                            />                        </div>

                        {/* Brand Name */}
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <Label className="w-40">Brand Name</Label>
                            <Input
                                disabled={!isEditing}
                                value={siteTitle}
                                onChange={(e) => setSiteTitle(filterAlphaSpaces(e.target.value))}
                            />                        </div>

                        {/* Admin Tabs */}
                        <div className="flex flex-col md:flex-row items-start gap-4">
                            <Label className="w-40">Admin Tabs</Label>
                            <div className="space-y-2 w-full">
                                <Input
                                    disabled={!isEditing}
                                    value={tabs.T1}
                                    onChange={(e) => setTabs({ ...tabs, T1: filterAlphaSpaces(e.target.value) })}
                                    placeholder="Tab 1"
                                />
                                <Input
                                    disabled={!isEditing}
                                    value={tabs.T2}
                                    onChange={(e) => setTabs({ ...tabs, T2: filterAlphaSpaces(e.target.value) })}
                                    placeholder="Tab 2"
                                />
                                <Input
                                    disabled={!isEditing}
                                    value={tabs.T3}
                                    onChange={(e) => setTabs({ ...tabs, T3: filterAlphaSpaces(e.target.value) })}
                                    placeholder="Tab 3"
                                />
                                <Input
                                    disabled={!isEditing}
                                    value={tabs.T5}
                                    onChange={(e) => setTabs({ ...tabs, T5: e.target.value })}
                                    placeholder="Tab 4"
                                />

                               

                            </div>
                        </div>

                        {/* User Tab */}
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <Label className="w-40">User Tab</Label>
                            {/* User Tab */}
                            <Input
                                disabled={!isEditing}
                                value={tabs.T4}
                                onChange={(e) => setTabs({ ...tabs, T4: filterAlphaSpaces(e.target.value) })}
                                placeholder="User Tab"
                            />                       
                     </div>

                        {/* Logo Upload */}
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <Label className="w-40">Logo</Label>
                            <div className="flex gap-4">
                                <Button className="cursor-pointer" disabled={!isEditing} onClick={() => logoInputRef.current?.click()}>Upload</Button>
                                <Input type="file" accept="image/*" ref={logoInputRef} onChange={handleLogoChange} hidden />
                                <img src={logoPreview} className="h-12 object-contain" alt="Logo preview" />
                            </div>
                        </div>

                        {/* Favicon Upload */}
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <Label className="w-40">Favicon</Label>
                            <div className="flex gap-4">
                                <Button className="cursor-pointer" disabled={!isEditing} onClick={() => faviconInputRef.current?.click()}>Upload</Button>
                                <Input type="file" accept="image/*" ref={faviconInputRef} onChange={handleFaviconChange} hidden />
                                {faviconPreview && <img src={faviconPreview} className="h-10 object-contain" alt="Favicon preview" />}
                            </div>
                        </div>
                        <div className="flex justify-end gap-4">
                            {!isEditing ? (
                                <Button className="cursor-pointer hover:opacity-80" onClick={() => setIsEditing(true)} variant="outline">Edit</Button>
                            ) : (
                                <>
                                    <Button className='cursor-pointer hover:opacity-75' onClick={handleSubmit} disabled={loading}>
                                        {loading ? "Updating..." : "Update"}
                                    </Button>
                                    <Button onClick={handleCancel} className="cursor-pointer" variant="secondary">Cancel</Button>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {showSettings && (
                <UserSetting user={user} modalRef={modalRef} setShowSettings={setShowSettings} userName={user?.username} setUserName={''} />
            )}
        </div>
    );
}
