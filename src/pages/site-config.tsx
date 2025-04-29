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

export default function SiteConfig() {
    const [siteTitle, setSiteTitle] = useState("");
    const [tagline, setTagline] = useState("");
    const [logoPreview, setLogoPreview] = useState<string>("/assets/logo.png");
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
    const [tabs, setTabs] = useState({ T1: '', T2: '', T3: '',T4:'' });
    const dispatch = useDispatch<AppDispatch>();
    const { loading, config } = useSelector((state:RootState) => state.siteConfig);
   
    console.log(config)
    const logoInputRef = useRef<HTMLInputElement>(null);
    const faviconInputRef = useRef<HTMLInputElement>(null);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                toast.error("Please upload a valid image file.");
                return;
            }
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                toast.error("Please upload a valid image file.");
                return;
            }
            setFaviconPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = () => {
        const formData = new FormData();
        formData.append('siteTitle', siteTitle);
        formData.append('tagline', tagline);
        formData.append('tabs', JSON.stringify(tabs));

        if (logoInputRef.current?.files?.[0]) {
            formData.append('logo', logoInputRef.current.files[0]);
        }
        if (faviconInputRef.current?.files?.[0]) {
            formData.append('favicon', faviconInputRef.current.files[0]);
        }
        if (
            siteTitle.trim() === "" &&
            tagline.trim() === "" &&
         
            !faviconInputRef.current?.files?.[0] &&
            tabs.T1.trim() === "" &&
            tabs.T2.trim() === "" &&
            tabs.T3.trim() === "" &&
            tabs.T4?.trim?.() === "" // optional check if T4 exists
        ) {
            return toast.error("Update at least one field before submitting.");
        }

        dispatch(updateSiteConfig(formData)).unwrap().then(()=>{
            toast.success("Settings submitted successfully.")
            setTabs({ T1: '', T2: '', T3: '', T4:'' })
            setTagline('')
            setSiteTitle('')
            setLogoPreview('/assets/logo.png')
            setFaviconPreview('');
            if (faviconInputRef.current) {
                faviconInputRef.current.value = ""; // ✅ reset the actual file input
            }

            if (logoInputRef.current) {
                logoInputRef.current.value = ""; // ✅ also reset logo input if needed
            }
            dispatch(fetchSiteConfig()).unwrap()

        }).catch(e=>{
            toast.error("Settings submitting Failed.");
            console.log(e)
        })
    };

    // console.log(` siteTitle :${siteTitle},
    //         tagline:${tagline},
    //     logoPreview:${logoPreview},
    //     faviconUrl:${faviconPreview},
    //     tabs:${tabs}`);

    useEffect(()=>{
        dispatch(fetchSiteConfig()).unwrap()
    },[])


    return (
        <div>
            <PreviewHeader tabs={tabs} logoPreview={logoPreview} />

            <div className="space-y-10 max-w-[1200px] mx-auto p-4">
                <h1 className="text-2xl font-bold">Site Identity</h1>

                <Card>
                    <CardContent className="p-6 space-y-8">

                        {/* Site Title */}
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <Label className="w-40">Site Title</Label>
                            <Input
                                placeholder="Enter your website title"
                                value={siteTitle}
                                onChange={(e) => setSiteTitle(e.target.value)}
                                className="w-full md:w-1/2"
                            />
                        </div>

                        {/* Tagline */}
                        <div className="flex flex-col md:flex-row items-start gap-4">
                            <Label className="w-40">Tagline</Label>
                            <div className="w-full md:w-1/2">
                                <Input
                                    placeholder="A short description..."
                                    value={tagline}
                                    onChange={(e) => setTagline(e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    In a few words, explain what this site is about.
                                </p>
                            </div>
                        </div>

                        {/* Tabs Input */}
                        <div className="flex flex-col md:flex-row items-start gap-4">
                            <Label className="w-40">Admin Tabs</Label>
                            <div className="w-full md:w-1/2 space-y-2">
                                <Input
                                    placeholder="Tab 1 Name"
                                    value={tabs.T1}
                                    onChange={(e) => setTabs(prev => ({ ...prev, T1: e.target.value }))}
                                />
                                <Input
                                    placeholder="Tab 2 Name"
                                    value={tabs.T2}
                                    onChange={(e) => setTabs(prev => ({ ...prev, T2: e.target.value }))}
                                />
                                <Input
                                    placeholder="Tab 3 Name"
                                    value={tabs.T3}
                                    onChange={(e) => setTabs(prev => ({ ...prev, T3: e.target.value }))}
                                />
                            </div>
                        </div>
                        {/* Tabs Input */}
                        <div className="flex flex-col md:flex-row items-start gap-4">
                            <Label className="w-40">User Tabs</Label>
                            <div className="w-full md:w-1/2 space-y-2">
                                <Input
                                    placeholder="Tab 1 Name"
                                    value={tabs.T4}
                                    onChange={(e) => setTabs(prev => ({ ...prev, T4: e.target.value }))}
                                />
                                {/* <Input
                                    placeholder="Tab 2 Name"
                                    value={tabs.T2}
                                    onChange={(e) => setTabs(prev => ({ ...prev, T2: e.target.value }))}
                                />
                                <Input
                                    placeholder="Tab 3 Name"
                                    value={tabs.T3}
                                    onChange={(e) => setTabs(prev => ({ ...prev, T3: e.target.value }))}
                                /> */}
                            </div>
                        </div>

                        {/* Logo Upload */}
                        <div className="flex flex-col md:flex-row items-start gap-4">
                            <Label className="w-40">Logo Upload</Label>
                            <div className="w-full md:w-1/2 space-y-2">
                                <div className="flex items-center gap-4">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        name="logo"
                                        ref={logoInputRef}
                                        onChange={handleLogoChange}
                                        hidden
                                    />
                                    <Button type="button" onClick={() => logoInputRef.current?.click()}>
                                        Choose Logo
                                    </Button>
                                    { (
                                        <img src={logoPreview} alt="Logo preview" className="h-16 object-contain" />
                                    )}
                                </div>
                                <p className="text-xs text-gray-500">
                                    Logo should be at least 512x512 pixels.
                                </p>
                            </div>
                        </div>

                        {/* Favicon Upload */}
                        <div className="flex flex-col md:flex-row items-start gap-4">
                            <Label className="w-40">Favicon Upload</Label>
                            <div className="w-full md:w-1/2 space-y-2">
                                <div className="flex items-center gap-4">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        name="favicon"

                                        ref={faviconInputRef}
                                        onChange={handleFaviconChange}
                                        hidden
                                    />
                                    <Button type="button" onClick={() => faviconInputRef.current?.click()}>
                                        Choose Favicon
                                    </Button>
                                    {faviconPreview && (
                                        <img src={faviconPreview} alt="Favicon preview" className="h-12 object-contain" />
                                    )}
                                </div>
                                <p className="text-xs text-gray-500">
                                    Favicon must be a square image (e.g., 512x512 px).
                                </p>
                            </div>
                        </div>

                        {/* 👇 Submit Button */}
                        <div className="flex justify-end">
                            <Button disabled={loading} onClick={handleSubmit} className="w-40 mt-6 cursor-pointer hover:opacity-75">
                                {loading ? "Submiting..." :"Submit"}  
                            </Button>
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
