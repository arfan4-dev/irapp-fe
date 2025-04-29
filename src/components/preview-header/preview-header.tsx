import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";

import { fetchUserById } from "@/store/features/user/user";

interface HeaderProps {
    theme?: 'light' | 'dark';
    serviceName?: string;
    setTheme?: (theme: 'light' | 'dark') => void;
   tabs:{
    T1:string;
       T2: string;
       T3: string
   };
    logoPreview:string 
}

const PreviewHeader: React.FC<HeaderProps> = ({
    
    serviceName,
    tabs,
    logoPreview
   
}) => {
    const user = useSelector((state: RootState) => state?.user?.currentUser?.data);
    const dispatch = useDispatch<AppDispatch>(); // ✅ typed dispatch



  

    useEffect(() => {

        if (user?.id) {
            dispatch(fetchUserById(user.id));
        }
    }, [dispatch, user?.id]);





    return (
        <header className="sticky top-0 bg-inherit border-b z-10 dark:bg-gray-900 dark:text-white flex justify-between items-center px-4 ">
            <div className="flex items-center gap-2">
                   
                       
                            <img
                    src={logoPreview}
                                alt="Logo"
                                className="h-[60px] w-[60px]"
                            />


                <h1 className="text-[14px] md:text-xl font-semibold">{serviceName}</h1>
                <div className="hidden lg:flex items-center gap-4 ml-6">

                    {(
                        <nav>
                            <ul className="flex items-center gap-10 ml-6">
                                <li>
                                    <p
                                      
                                        className="hover:underline text-black hover:text-gray-800 dark:text-white transition"
                                    >
                                        {tabs.T1 ||' Home'}
                                    </p>
                                </li>
                                <li>
                                    <p
                                      
                                        className="hover:underline text-black hover:text-gray-800 dark:text-white transition"
                                    >
                                        {tabs.T2 || 'User Management'}
                                    </p>
                                </li>
                                <li>
                                    <p
                                
                                        className="hover:underline text-black hover:text-gray-800 dark:text-white transition"
                                    >
                                        {tabs.T3 || 'Answered order'}
                                    </p>
                                </li>
                            </ul>
                        </nav>
                    )}
                </div>

            </div>

          
        </header>
    );
};

export default PreviewHeader;
