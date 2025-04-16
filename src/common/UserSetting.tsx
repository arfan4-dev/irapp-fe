import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from "lucide-react";
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { useState } from 'react';
import { toast } from 'sonner';
import { updateUser } from '@/store/features/user/user';

const UserSetting = ({ modalRef, setShowSettings,user }: any) => {
    const dispatch = useDispatch<AppDispatch>();
    console.log("user:",user);

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });

    // const [image, setImage] = useState<File | null>(null);
    // const [preview, setPreview] = useState<string | null>(null);

    // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = e.target.files?.[0];
    //     if (file) {
    //         setImage(file);
    //         setPreview(URL.createObjectURL(file));
    //     }
    // };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        const data = new FormData();
        if (formData.username) data.append("username", formData.username);
        if (formData.password) data.append("password", formData.password);
        // if (image) data.append("image", image);

        dispatch(updateUser({ data, id: user.id }))
            .unwrap()
            .then(() => {
                toast.success("User updated successfully!");
                setShowSettings(false);
            })
            .catch((err) => {
                toast.error("Update failed: " + err);
            });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card
                ref={modalRef}
                className="relative p-6 w-full max-w-md bg-white text-black dark:bg-gray-800 dark:text-white"
            >
                <button
                    onClick={() => setShowSettings(false)}
                    className="absolute top-4 right-4 text-black dark:text-white text-[24px] hover:scale-110 transition cursor-pointer"
                >
                    ×
                </button>
                <h2 className="text-xl font-semibold mb-4 mt-2">User Settings</h2>
                <div className="space-y-4">
                    {/* <label
                        htmlFor="upload"
                        className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm text-center"
                    >
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                Click or drag image to upload
                            </p>
                            <p className="text-xs text-gray-400">(Only image files accepted)</p>
                        </div>
                        {preview && (
                            <img
                                src={preview}
                                alt="Preview"
                                className="mt-3 w-24 h-24 rounded-full object-cover border"
                            />
                        )}
                    </label>
                    <input
                        id="upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    /> */}

                    <Input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Username"
                        className="w-full"
                    />

                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Password"
                            className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <Button onClick={handleSave}>Save</Button>
                </div>
            </Card>
        </div>
    );
};

export default UserSetting;
