import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api/api";
import useThemeMode from "@/hooks/useTheme";
import PublicHeader from "@/common/PublicHeader";
import { Card, CardContent } from "@/components/ui/card";

const EmailVerification = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();
  const { theme, setTheme } = useThemeMode();

  const verifyEmail = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.post(
        "/verify", // Adjust if necessary
        { token },
        { withCredentials: true }
      );
      setMessage(response.data.message);
      if (response.data.success) {
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      }
    } catch (error) {
      setMessage("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyEmail();
  }, [token]);

  return (
    <div className={`${theme === "dark" ? "dark" : ""}`}>
      <PublicHeader theme={theme} setTheme={setTheme} />

      <div className="h-[calc(100vh-64px)] bg-white dark:bg-gray-900 flex items-center justify-center px-4">
        <Card className="w-full max-w-md bg-white dark:bg-zinc-900 text-black dark:text-white shadow-md">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Verify Your Email
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
              Please wait while we verify your email...
            </p>

            {message && (
              <p
                className={`text-center mb-4 ${message.toLowerCase().includes("success")
                    ? "text-green-500"
                    : "text-red-500"
                  }`}>
                {message}
              </p>
            )}

            {loading && (
              <p className="text-center text-gray-500 dark:text-gray-400">
                Verifying...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerification;
