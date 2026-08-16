import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { verifyEmail, resendVerificationEmail } from "../service/Auth";
import { useTheme } from "../context/themeContext";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(4);
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<{ type: string; text: string } | null>(null);

  const requestedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. No token was provided.");
      return;
    }

    // Prevent duplicate API call in React StrictMode (double-invoked effect)
    if (requestedTokenRef.current === token) {
      return;
    }
    requestedTokenRef.current = token;

    const verify = async () => {
      try {
        const response = await verifyEmail(token);
        setStatus("success");
        setMessage((response as { message?: string })?.message || "Email verified successfully!");
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Failed to verify email. The link may be invalid or expired."
        );
      }
    };

    verify();
  }, [searchParams]);

  // Countdown timer for automatic redirect on success
  useEffect(() => {
    if (status !== "success") return;

    if (countdown <= 0) {
      navigate("/login", { replace: true });
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [status, countdown, navigate]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResending(true);
    setResendMessage(null);
    try {
      const response = await resendVerificationEmail(resendEmail);
      const resData = response as { message?: string } | undefined;
      setResendMessage({
        type: "success",
        text: resData?.message || "Verification email sent! Please check your inbox.",
      });
    } catch (err) {
      setResendMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to resend verification email.",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      {/* Floating theme toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className="fixed top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-paper-elevated dark:bg-gray-800 border border-amber-900/10 dark:border-gray-700 shadow-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer"
      >
        {isDark ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7Z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
          </svg>
        )}
      </button>

      <section className="bg-paper dark:bg-gray-950 min-h-screen flex items-center justify-center p-4 transition-colors duration-300">
        <div className="w-full bg-paper-elevated rounded-3xl border border-amber-900/10 dark:border-gray-800 dark:bg-gray-900 shadow-xl shadow-amber-950/8 dark:shadow-black/30 sm:max-w-md xl:p-0 overflow-hidden">
          <div className="p-6 space-y-6 md:space-y-8 sm:p-8">
            <div className="text-center">
              {status === "loading" && (
                <div className="py-6 space-y-4">
                  <div className="inline-flex h-16 w-16 animate-spin rounded-full border-4 border-solid border-amber-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-2"></div>
                  <h1 className="font-serif text-2xl font-bold text-amber-950 dark:text-amber-100">
                    Verifying Your Email...
                  </h1>
                  <p className="text-sm text-amber-900/60 dark:text-gray-400">
                    Please wait while we verify your email address.
                  </p>
                </div>
              )}

              {status === "success" && (
                <div className="space-y-4">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mx-auto shadow-inner">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h1 className="font-serif text-2xl font-bold text-amber-950 dark:text-amber-100">
                    Email Verified!
                  </h1>
                  <p className="text-sm text-amber-900/70 dark:text-gray-300">{message}</p>
                  
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    Redirecting to sign in in <strong className="font-bold">{countdown}</strong> seconds...
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => navigate("/login", { replace: true })}
                      className="w-full text-white bg-amber-600 hover:bg-amber-700 focus:ring-4 focus:outline-none focus:ring-amber-300 font-semibold rounded-full text-sm px-5 py-3 text-center dark:bg-amber-700 dark:hover:bg-amber-600 transition-all duration-150 shadow-md cursor-pointer"
                    >
                      Sign In Now
                    </button>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="space-y-4">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mx-auto shadow-inner">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h1 className="font-serif text-2xl font-bold text-amber-950 dark:text-amber-100">
                    Verification Failed
                  </h1>
                  <p className="text-sm text-amber-900/70 dark:text-gray-300">{message}</p>

                  {/* Resend verification section */}
                  <form onSubmit={handleResend} className="pt-2 space-y-3 text-left">
                    <label className="block text-xs font-semibold text-amber-900 dark:text-amber-200">
                      Need a new verification link?
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        required
                        placeholder="Enter your email"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        className="bg-amber-50 border border-amber-900/10 text-amber-950 text-xs rounded-xl block w-full p-2.5 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-amber-500 focus:border-amber-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={resending}
                        className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium px-4 py-2 rounded-xl whitespace-nowrap disabled:opacity-50 cursor-pointer"
                      >
                        {resending ? "Sending..." : "Resend"}
                      </button>
                    </div>

                    {resendMessage && (
                      <p
                        className={`text-xs p-2 rounded-lg font-medium text-center ${
                          resendMessage.type === "error"
                            ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                        }`}
                      >
                        {resendMessage.text}
                      </p>
                    )}
                  </form>

                  <div className="pt-4 border-t border-amber-900/10 dark:border-gray-800">
                    <Link
                      to="/login"
                      className="inline-block w-full text-amber-800 dark:text-amber-300 hover:underline text-sm font-semibold text-center"
                    >
                      Back to Sign In
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default VerifyEmail;
