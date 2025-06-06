import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from "lucide-react";
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { fetchUserById, updateUser } from '@/store/features/user/user';
import api from '@/api/api';

const UserSetting = ({  setShowSettings, user }: any) => {
    const dispatch = useDispatch<AppDispatch>();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState<any>({
        username: "",
        password: ""
    });
    const [loading, setLoading] = useState(false); // ✅ add this at the top with useState

    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [currentPassword, setCurrentPassword] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const isImage = file.type.startsWith("image/");
            if (!isImage) {
                toast.error("Only JPG, PNG, or WEBP images are allowed.");
                e.target.value = ""; // reset the input
                return;
            }
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === "username") {
            if (/\s/.test(value)) {
                toast.error("Username cannot contain spaces.");
                return;
            }
            const isValid = /^[a-zA-Z0-9]*$/.test(value); // only letters and numbers
            if (!isValid) {
                toast.error("Username must be alphanumeric only.");
                return;
            }
        }

        if (name === "password") {
            if (/\s{2,}/.test(value)) {
                toast.error("Only single spaces allowed in password.");
                return;
            }

            const errors = [];
            if (value.length < 6) errors.push("at least 6 characters");
            if (!/[a-z]/.test(value)) errors.push("one lowercase letter");
            if (!/[A-Z]/.test(value)) errors.push("one uppercase letter");
            if (!/\d/.test(value)) errors.push("one number");
            if (!/[@$!%*?&]/.test(value)) errors.push("one special symbol");

            if (errors.length > 0) {
                toast.error(`Password must contain: ${errors.join(", ")}`);
            }

        }


        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };


    // Add this above the form return
    const handleVerifyPassword = async () => {
        if (!currentPassword) {
            toast.error("Please Enter Your Current Password.");
            return;
        }

        try {
            const res = await api.post("/verify-password", { password: currentPassword, user }, { withCredentials: true });
            if (res.data.success) {
                setIsVerified(true);
                toast.success("Password verified. You can now update your profile.");
                // Don't save yet — wait for Save button click to call handleSave
            } else {
                toast.error("Invalid current password.");
            }
        } catch (err: any) {
            console.log(err);

            toast.error("Invalid current password.");
        }
    };


    const handleSave = async () => {
        const data = new FormData();
        if (formData.username) data.append("username", formData.username);
        if (image) data.append("image", image);

        // If new password is given
        if (formData.password) {
            // Block if current password is not entered
            if (!currentPassword) {
                toast.error("Please enter your current password first.");
                return;
            }

            if (!isVerified) {
                toast.error("Please verify your current password before saving.");
                return;
            }

            // New password validation
            const errors = [];
            if (formData.password.length < 6) errors.push("at least 6 characters");
            if (!/[a-z]/.test(formData.password)) errors.push("one lowercase letter");
            if (!/[A-Z]/.test(formData.password)) errors.push("one uppercase letter");
            if (!/\d/.test(formData.password)) errors.push("one number");
            if (!/[@$!%*?&]/.test(formData.password)) errors.push("one symbol");

            if (errors.length > 0) {
                toast.error(`Password must contain: ${errors.join(", ")}`);
                return;
            }

            data.append("password", formData.password);
        }

        setLoading(true); // ✅ start loading
        // Proceed to update
        dispatch(updateUser({ data, id: user.id }))
            .unwrap()
            .then(() => {
                dispatch(fetchUserById(user.id));
                setLoading(false); // ✅ start loading
                toast.success("User updated successfully.");

                setShowSettings(false);
            })
            .catch((err) => {
                toast.error("Update failed: " + err);
                setLoading(false); // ✅ start loading
            });
    };

    useEffect(() => {
        if (user) {
            setFormData({ username: user?.username || '' });
            if (user.image) {
                setPreview(user.image); // Show existing image as preview on first load
            }
        }
    }, [user]);

    console.log("showPasswordModal:", showPasswordModal)
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card
                // ref={modalRef}
                className="relative p-4 w-full max-w-md bg-white text-black dark:bg-zinc-800 dark:text-white"
            >
                <button
                    onClick={() => {


                        setShowSettings(false)
                    }}
                    className="absolute top-2.5 right-4 text-black dark:text-white text-[24px] hover:scale-110 transition cursor-pointer"
                >
                    ×
                </button>
                <h2 className="text-xl font-semibold mb- " >Personal Settings</h2>

                <div className="space-y-4" >
                    {/* {!isVerified ? (
                        <>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter current password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="pr-10"
                                    required
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

                            
                            <Button type="button" onClick={handleVerifyPassword} className='cursor-pointer hover:opacity-75'>
                                Verify Password
                            </Button>
                        </>
                    ) : ( */}
                    <>
                        <label
                            htmlFor="upload"
                            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition text-sm text-center"
                        >
                            {!preview && <div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Click or drag image to upload
                                </p>
                                <p className="text-xs text-gray-400">(Only image files accepted)</p>
                            </div>}
                            {preview && (
                                <div className='relative'>
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="mt-3 w-24 h-24 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"

                                    />
                                    <div className='absolute top-0 right-0 bg-white rounded-full p-[2px] cursor-pointer hover:opacity-75 dark:text-black' onClick={() => { setPreview(null); setImage(null) }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                    </div>
                                </div>

                            )}
                        </label>
                        <input
                            id="upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}

                        />

                        <Input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            placeholder="Username"
                            className="w-full"
                            required
                        />
                        <Button size={'sm'} className="cursor-pointer " variant={'outline'} onClick={() => { setShowPasswordModal(true) }}>Change Password</Button> <br />
                        {/* <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Enter New Password"
                                        className="pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div> */}

                        {/* <Button onClick={handleSave} className='cursor-pointer hover:opacity-75'>Save</Button> */}
                        <Button
                            onClick={handleSave}
                            disabled={loading}
                            className='cursor-pointer hover:opacity-75'
                        >
                            {loading ? "Updating..." : "Save"}
                        </Button>
                    </>
                    {/* )} */}

                </div>
            </Card>
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="relative p-4 w-full max-w-md bg-white dark:bg-zinc-800 text-black dark:text-white">
                        <button
                            onClick={() => setShowPasswordModal(false)}
                            className="absolute top-2.5 right-4 text-[24px] dark:text-white hover:scale-110 transition"
                        >
                            ×
                        </button>
                        <h2 className="text-xl font-semibold mb-4">Change Password</h2>

                        <div className="space-y-4">
                            {/* Current Password Field with Eye Toggle */}
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    name="currentPassword"
                                    placeholder="Enter current password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => !prev)}
                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* New Password Field with Eye Toggle */}
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter new password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => !prev)}
                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <Button
                                onClick={async () => {
                                    if (!isVerified) {
                                        await handleVerifyPassword(); // Verifies + shows toast if success/fail
                                    }
                                    if (isVerified) {
                                        await handleSave(); // Proceeds to save everything
                                        setShowPasswordModal(false);
                                    }
                                }}
                                className='cursor-pointer hover:opacity-75'
                            >
                                {isVerified ? "Save" : "Verify Password"}
                            </Button>


                        </div>
                    </Card>
                </div>
            )}



        </div>
    );
};

export default UserSetting;
