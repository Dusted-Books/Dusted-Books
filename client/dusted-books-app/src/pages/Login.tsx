import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import roles from "../enums/roles";
import { useAuth } from "../context/authContext";
import { useTheme } from "../context/themeContext";
import { resendVerificationEmail } from "../service/Auth";

type AuthLocationState = {
  from?: string;
  signupSuccess?: boolean;
  email?: string;
} | null;

function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const apiBaseUrl =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const locationState = location.state as AuthLocationState;
  const from = locationState?.from || "/";
  // Mode is driven by the URL: /signup vs /login
  const isLogin = location.pathname !== "/signup";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: locationState?.email || "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState(() =>
    locationState?.signupSuccess
      ? {
          type: "success",
          text: "Account created successfully! Please check your email to verify your account.",
        }
      : { type: "", text: "" },
  );

  // Resend cooldown timer effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Reset transient UI when switching between /login and /signup
  useEffect(() => {
    setShowPassword(false);
    setShowConfirmPassword(false);
    setRegisteredEmail(null);

    if (locationState?.signupSuccess && isLogin) {
      setMessage({
        type: "success",
        text: "Account created successfully! Please check your email to verify your account.",
      });
      if (locationState.email) {
        setFormData((prev) => ({
          ...prev,
          name: "",
          email: locationState.email || prev.email,
          password: "",
          confirmPassword: "",
        }));
        setShowResendVerification(true);
      }
      return;
    }

    setMessage({ type: "", text: "" });
    setShowResendVerification(false);
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const switchAuthMode = (targetIsLogin: boolean) => {
    setMessage({ type: "", text: "" });
    setRegisteredEmail(null);
    setShowResendVerification(false);
    navigate(targetIsLogin ? "/login" : "/signup", {
      state: { from },
    });
  };

  const handleResendVerification = async (targetEmail?: string) => {
    const emailToUse = targetEmail || formData.email;
    if (!emailToUse) {
      setMessage({ type: "error", text: "Please enter your email address." });
      return;
    }

    if (resendCooldown > 0) return;

    setResendingEmail(true);
    try {
      const response = await resendVerificationEmail(emailToUse);
      const resData = response as { message?: string } | undefined;
      setMessage({
        type: "success",
        text: resData?.message || "Verification email sent! Please check your inbox and spam folder.",
      });
      setResendCooldown(60);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to resend verification email.",
      });
    } finally {
      setResendingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setShowResendVerification(false);

    // Client-side validation for Signup
    if (!isLogin) {
      if (formData.name.trim().length < 2) {
        return setMessage({ type: "error", text: "Please enter your full name." });
      }
      if (formData.password.length < 8) {
        return setMessage({
          type: "error",
          text: "Password must be at least 8 characters long.",
        });
      }
      if (formData.password !== formData.confirmPassword) {
        return setMessage({ type: "error", text: "Passwords do not match!" });
      }
    }

    const endpoint = isLogin
      ? `${apiBaseUrl}/users/login`
      : `${apiBaseUrl}/users/signup`;
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: roles.CUSTOMER,
        };

    setIsSubmitting(true);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      let data: {
        message?: string;
        emailVerificationRequired?: boolean;
        email?: string;
        emailSent?: boolean;
      } = {};
      const responseText = await response.text();

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = {};
        }
      }

      if (!response.ok) {
        // Check if it's an email verification error
        if (data.emailVerificationRequired) {
          setShowResendVerification(true);
        }
        throw new Error(
          data.message || `Request failed with status ${response.status}`,
        );
      }

      if (isLogin) {
        setMessage({ type: "success", text: "Logged in successfully!" });
        await refreshUser();
        navigate(from, { replace: true });
      } else {
        // Registration successful: show the dedicated Verification Email Sent screen
        setRegisteredEmail(formData.email);
        setMessage({
          type: "success",
          text: data.message || "Account created successfully! Please check your email to verify your account.",
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsSubmitting(false);
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7Z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
            />
          </svg>
        )}
      </button>
      <style>{`
        .auth-input {
          color-scheme: light;
        }

        .dark .auth-input {
          color-scheme: dark;
        }

        .auth-input,
        .auth-input:hover,
        .auth-input:focus,
        .auth-input:-webkit-autofill,
        .auth-input:-webkit-autofill:hover,
        .auth-input:-webkit-autofill:focus,
        .auth-input:-webkit-autofill:active,
        .auth-input:-internal-autofill-selected {
          box-shadow: 0 0 0 1000px #FEF5F5 inset !important;
          -webkit-box-shadow: 0 0 0 1000px #FEF5F5 inset !important;
          background-color: #FEF5F5 !important;
          color: #2D1A1E !important;
          -webkit-text-fill-color: #2D1A1E !important;
          caret-color: #2D1A1E !important;
          transition: background-color 5000s ease-in-out 0s;
        }

        .dark .auth-input,
        .dark .auth-input:hover,
        .dark .auth-input:focus,
        .dark .auth-input:-webkit-autofill,
        .dark .auth-input:-webkit-autofill:hover,
        .dark .auth-input:-webkit-autofill:focus,
        .dark .auth-input:-webkit-autofill:active,
        .dark .auth-input:-internal-autofill-selected {
          box-shadow: 0 0 0 1000px #2F282A inset !important;
          -webkit-box-shadow: 0 0 0 1000px #2F282A inset !important;
          background-color: #2F282A !important;
          color: #FCE8E8 !important;
          -webkit-text-fill-color: #FCE8E8 !important;
          caret-color: #FCE8E8 !important;
        }
      `}</style>
      <section className="bg-paper dark:bg-gray-950 min-h-screen flex items-center justify-center p-4 transition-colors duration-300">
        <div className="w-full bg-paper-elevated rounded-3xl border border-amber-900/10 dark:border-gray-800 dark:bg-gray-900 shadow-xl shadow-amber-950/8 dark:shadow-black/30 sm:max-w-md xl:p-0 overflow-hidden">
          
          {/* Post-Registration Verification Sent Screen */}
          {registeredEmail ? (
            <div className="p-6 sm:p-8 space-y-6 text-center animate-fadeIn">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 mx-auto shadow-inner">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="h-10 w-10"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>
              </div>

              <div>
                <h1 className="font-serif text-2xl font-bold tracking-tight text-amber-950 dark:text-amber-100">
                  Verify Your Email
                </h1>
                <p className="mt-3 text-sm text-amber-900/80 dark:text-gray-300 leading-relaxed">
                  We have sent a verification link to:
                </p>
                <p className="mt-1 font-semibold text-amber-800 dark:text-amber-400 text-base break-all bg-amber-50 dark:bg-amber-950/50 py-1.5 px-3 rounded-lg border border-amber-200/60 dark:border-amber-900/40">
                  {registeredEmail}
                </p>
              </div>

              <div className="bg-amber-50/70 dark:bg-gray-800/60 rounded-2xl p-4 text-xs text-amber-900/70 dark:text-gray-400 space-y-2 text-left border border-amber-900/10 dark:border-gray-700/60">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-amber-700 dark:text-amber-400">1.</span>
                  <span>Open your email inbox (check <strong>Spam / Junk</strong> if not in Primary).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-amber-700 dark:text-amber-400">2.</span>
                  <span>Click the <strong>Verify Email</strong> button to activate your account.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-amber-700 dark:text-amber-400">3.</span>
                  <span>Once verified, return here and sign in to request books, buy, and sell!</span>
                </div>
              </div>

              {message.text && (
                <div
                  className={`p-3 text-sm rounded-xl text-center font-medium ${
                    message.type === "error"
                      ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200/50 dark:border-red-900/30"
                      : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/30"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => switchAuthMode(true)}
                  className="w-full text-white bg-amber-600 hover:bg-amber-700 focus:ring-4 focus:outline-none focus:ring-amber-300 font-semibold rounded-full text-sm px-5 py-3 text-center dark:bg-amber-700 dark:hover:bg-amber-600 dark:focus:ring-amber-800 transition-all duration-150 hover:scale-[1.02] active:scale-100 shadow-md cursor-pointer"
                >
                  Proceed to Sign In
                </button>

                <div className="flex items-center justify-center gap-1 text-sm text-amber-900/60 dark:text-gray-400">
                  <span>Didn't receive the email?</span>
                  <button
                    type="button"
                    onClick={() => handleResendVerification(registeredEmail)}
                    disabled={resendingEmail || resendCooldown > 0}
                    className="font-semibold text-amber-700 hover:underline dark:text-amber-400 bg-transparent border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendingEmail
                      ? "Sending..."
                      : resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : "Resend email"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Login / Signup Form */
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="font-serif text-xl font-bold leading-tight tracking-tight text-amber-950 md:text-2xl dark:text-amber-100 text-center">
                {isLogin ? "Sign in to your account" : "Create your account"}
              </h1>

              {message.text && (
                <div
                  className={`p-3 text-sm rounded-xl text-center font-medium ${
                    message.type === "error"
                      ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200/50 dark:border-red-900/30"
                      : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/30"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                {!isLogin && (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-amber-950 dark:text-amber-200">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="auth-input bg-amber-50 border border-amber-900/10 text-amber-950 rounded-xl block w-full p-2.5 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-amber-500 focus:border-amber-500 focus:outline-none"
                      placeholder="John Doe"
                      disabled={isSubmitting}
                    />
                  </div>
                )}

                <div>
                  <label className="block mb-2 text-sm font-medium text-amber-950 dark:text-amber-200">
                    Your email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="auth-input bg-amber-50 border border-amber-900/10 text-amber-950 rounded-xl block w-full p-2.5 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-amber-500 focus:border-amber-500 focus:outline-none"
                    placeholder="name@company.com"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-amber-950 dark:text-amber-200">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="auth-input bg-amber-50 border border-amber-900/10 text-amber-950 rounded-xl block w-full p-2.5 pr-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-amber-500 focus:border-amber-500 focus:outline-none"
                      placeholder="••••••••"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.8}
                          stroke="currentColor"
                          className="h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.067 7.5a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.8}
                          stroke="currentColor"
                          className="h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.183a1.01 1.01 0 0 1 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-amber-950 dark:text-amber-200">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        required
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="auth-input bg-amber-50 border border-amber-900/10 text-amber-950 rounded-xl block w-full p-2.5 pr-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-amber-500 focus:border-amber-500 focus:outline-none"
                        placeholder="••••••••"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
                        aria-label={
                          showConfirmPassword
                            ? "Hide confirm password"
                            : "Show confirm password"
                        }
                      >
                        {showConfirmPassword ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.8}
                            stroke="currentColor"
                            className="h-5 w-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.067 7.5a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.8}
                            stroke="currentColor"
                            className="h-5 w-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.183a1.01 1.01 0 0 1 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {showResendVerification && isLogin && (
                  <div className="p-3.5 text-sm rounded-2xl bg-amber-50/90 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-900/40">
                    <p className="text-amber-900 dark:text-amber-200 mb-2 font-medium">
                      Need a new verification link?
                    </p>
                    <button
                      type="button"
                      onClick={() => handleResendVerification()}
                      disabled={resendingEmail || resendCooldown > 0}
                      className="text-amber-700 dark:text-amber-400 hover:underline font-semibold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-1.5"
                    >
                      {resendingEmail && (
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-amber-600 border-r-transparent"></div>
                      )}
                      {resendingEmail
                        ? "Sending verification email..."
                        : resendCooldown > 0
                          ? `Resend available in ${resendCooldown}s`
                          : "Resend verification email"}
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full text-white bg-amber-600 hover:bg-amber-700 focus:ring-4 focus:outline-none focus:ring-amber-300 font-semibold rounded-full text-sm px-5 py-2.5 text-center dark:bg-amber-700 dark:hover:bg-amber-600 dark:focus:ring-amber-800 transition-all duration-150 hover:scale-[1.02] active:scale-100 shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                  )}
                  {isSubmitting
                    ? isLogin
                      ? "Signing In..."
                      : "Creating Account & Sending Email..."
                    : isLogin
                      ? "Sign In"
                      : "Register Account"}
                </button>

                <p className="text-sm font-light text-amber-900/60 dark:text-gray-400 text-center">
                  {isLogin
                    ? "Don’t have an account yet? "
                    : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => switchAuthMode(!isLogin)}
                    className="font-semibold text-amber-700 hover:underline dark:text-amber-400 bg-transparent border-none cursor-pointer"
                  >
                    {isLogin ? "Sign up" : "Log in"}
                  </button>
                </p>
              </form>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default AuthPage;
