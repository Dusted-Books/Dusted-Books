import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import roles from "../enums/roles";
import { useAuth } from "../context/authContext";
import { useTheme } from "../context/themeContext";

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
  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const locationState = location.state as AuthLocationState;
  const from = locationState?.from || "/";
  // Mode is driven by the URL: /signup vs /login
  const isLogin = location.pathname !== "/signup";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
          text: "Account created successfully! Please sign in below.",
        }
      : { type: "", text: "" },
  );

  // Reset transient UI when switching between /login and /signup
  useEffect(() => {
    setShowPassword(false);
    setShowConfirmPassword(false);

    if (locationState?.signupSuccess && isLogin) {
      setMessage({
        type: "success",
        text: "Account created successfully! Please sign in below.",
      });
      if (locationState.email) {
        setFormData((prev) => ({
          ...prev,
          name: "",
          email: locationState.email || prev.email,
          password: "",
          confirmPassword: "",
        }));
      }
      // Drop one-time flags so a refresh does not re-show the banner
      navigate("/login", { replace: true, state: { from } });
      return;
    }

    setMessage({ type: "", text: "" });
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const switchAuthMode = () => {
    setMessage({ type: "", text: "" });
    navigate(isLogin ? "/signup" : "/login", {
      state: { from },
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    // Client-side validation for Signup
    if (!isLogin && formData.password !== formData.confirmPassword) {
      return setMessage({ type: "error", text: "Passwords do not match!" });
    }

    const endpoint = isLogin
      ? `${apiBaseUrl}/users/login`
      : `${apiBaseUrl}/users/signup`;
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: roles.CUSTOMER,
        };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      let data: { message?: string } = {};
      const responseText = await response.text();

      if (responseText) {
        try {
          data = JSON.parse(responseText) as { message?: string };
        } catch {
          data = {};
        }
      }

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      if (isLogin) {
        setMessage({ type: "success", text: "Logged in successfully!" });
        await refreshUser();
        navigate(from, { replace: true });
      } else {
        // After signup, send user to the dedicated login path
        navigate("/login", {
          replace: true,
          state: {
            from,
            signupSuccess: true,
            email: formData.email,
          },
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";
      setMessage({ type: "error", text: errorMessage });
    }
  };

  return (
    <>
      {/* Floating theme toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className="fixed top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-paper-elevated dark:bg-gray-800 border border-amber-900/10 dark:border-gray-700 shadow-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
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
          box-shadow: 0 0 0 1000px #f0e6d6 inset !important;
          -webkit-box-shadow: 0 0 0 1000px #f0e6d6 inset !important;
          background-color: #f0e6d6 !important;
          color: #2a2118 !important;
          -webkit-text-fill-color: #2a2118 !important;
          caret-color: #2a2118 !important;
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
          box-shadow: 0 0 0 1000px #2f2b26 inset !important;
          -webkit-box-shadow: 0 0 0 1000px #2f2b26 inset !important;
          background-color: #2f2b26 !important;
          color: #f0e6d6 !important;
          -webkit-text-fill-color: #f0e6d6 !important;
          caret-color: #f0e6d6 !important;
        }
      `}</style>
      <section className="bg-paper dark:bg-gray-950 min-h-screen flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full bg-paper-elevated rounded-3xl border border-amber-900/10 dark:border-gray-800 dark:bg-gray-900 shadow-xl shadow-amber-950/8 dark:shadow-black/30 sm:max-w-md xl:p-0">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="font-serif text-xl font-bold leading-tight tracking-tight text-amber-950 md:text-2xl dark:text-amber-100 text-center">
            {isLogin ? "Sign in to your account" : "Create your account"}
          </h1>

          {message.text && (
            <div
              className={`p-3 text-sm rounded-xl text-center font-medium ${message.type === "error" ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200/50 dark:border-red-900/30" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/30"}`}
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.067 7.5a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.183a1.01 1.01 0 0 1 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
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
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.067 7.5a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.183a1.01 1.01 0 0 1 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full text-white bg-amber-600 hover:bg-amber-700 focus:ring-4 focus:outline-none focus:ring-amber-300 font-semibold rounded-full text-sm px-5 py-2.5 text-center dark:bg-amber-700 dark:hover:bg-amber-600 dark:focus:ring-amber-800 transition-all duration-150 hover:scale-[1.02] active:scale-100 shadow-sm"
            >
              {isLogin ? "Sign In" : "Register Account"}
            </button>

            <p className="text-sm font-light text-amber-900/60 dark:text-gray-400 text-center">
              {isLogin
                ? "Don’t have an account yet? "
                : "Already have an account? "}
              <button
                type="button"
                onClick={switchAuthMode}
                className="font-semibold text-amber-700 hover:underline dark:text-amber-400 bg-transparent border-none cursor-pointer"
              >
                {isLogin ? "Sign up" : "Log in"}
              </button>
            </p>
          </form>
        </div>
      </div>
      </section>
    </>
  );
}

export default AuthPage;
