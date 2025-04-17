import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api/api";
import useThemeMode from "@/hooks/useTheme";
import PublicHeader from "@/common/PublicHeader";
import { Card, CardContent } from "@/components/ui/card";

const EmailVerification = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false); // 🎯 new
  const { token } = useParams();
  const navigate = useNavigate();
  const { theme, setTheme } = useThemeMode();

  const verifyEmail = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.post(
        "/verify",
        { token },
        { withCredentials: true }
      );
      setMessage(response.data.message);
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
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
          <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
            <h2 className="text-2xl font-bold">Verify Your Email</h2>

            {loading && (
              <p className="text-gray-500 dark:text-gray-300">Verifying...</p>
            )}

            {!loading && success && (
              <div className="flex flex-col items-center">
                {/* ✅ Tick animation */}
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
                  <svg
                    className="w-10 h-10 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="text-green-600 font-medium mt-4">{message}</p>
              </div>
            )}

            {/* {!loading && !success && message && (
              <p className="text-red-500">{message}</p>
            )} */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerification;
