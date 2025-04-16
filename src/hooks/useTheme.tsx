import { useEffect, useState } from "react";

const useThemeMode = () => {
    const [theme, setTheme] = useState<"light" | "dark">(() => {
        // Initial check from localStorage
        const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
        return storedTheme || "light";
    });

    useEffect(() => {
        // Store to localStorage when theme changes
        localStorage.setItem("theme", theme);

        // Apply theme class to document body (optional)
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [theme]);

    return {
        theme, setTheme, toggleTheme: () => setTheme(prev => (prev === "light" ? "dark" : "light")),
 };
};

export default useThemeMode;

