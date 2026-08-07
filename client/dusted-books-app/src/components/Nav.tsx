import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useCart } from "../context/cartContext";
import { useTheme } from "../context/themeContext";
import logoImage from "../assets/db logo.png";

// Sun icon
function SunIcon() {
  return (
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
  );
}

// Moon icon
function MoonIcon() {
  return (
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
  );
}

function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const dropdownRef = useRef<HTMLLIElement>(null);
  const isCartRoute = location.pathname === "/cart";
  const isHomeRoute = location.pathname === "/" || location.pathname === "/home";

  // Detect scroll to add background shadow/opacity
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomeRoute]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setAccountDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 w-full z-[999] transition-all duration-300 ${
        scrolled
          ? "bg-paper-elevated/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-amber-900/10 dark:border-gray-800 shadow-sm py-2.5"
          : isHomeRoute
          ? "bg-paper/20 dark:bg-gray-950/20 backdrop-blur-sm py-4 dark"
          : "bg-paper/90 dark:bg-gray-950/90 backdrop-blur-md py-4"
      }`}
    >
      <div className="mx-auto flex flex-wrap items-center justify-between max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2.5 mr-4 text-2xl font-bold tracking-wider transition-opacity hover:opacity-80"
        >
          <img
            src={logoImage}
            alt="DustedBooks logo"
            className="h-9 w-9 object-contain"
          />
          <span className="font-brand bg-clip-text text-transparent bg-gradient-to-r from-amber-900 to-amber-700 dark:from-amber-400 dark:to-amber-300">
            DustedBooks
          </span>
        </Link>

        <div className="flex items-center gap-2 ml-auto lg:hidden">
          {/* Theme toggle – mobile */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="flex h-10 w-10 items-center justify-center rounded-full text-amber-900 dark:text-amber-200 hover:bg-amber-900/5 dark:hover:bg-white/10 transition-colors"
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>

          <button
            type="button"
            className="relative h-10 w-10 select-none rounded-full text-center align-middle transition-colors hover:bg-amber-900/5 dark:hover:bg-white/10 active:bg-amber-900/10 flex items-center justify-center border border-transparent text-amber-900 dark:text-amber-200"
            aria-label="Toggle navigation"
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
            onClick={() => {
              setIsOpen((current) => !current);
              if (accountDropdownOpen) setAccountDropdownOpen(false);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>

        <div
          id="mobile-nav"
          className={`w-full overflow-hidden lg:overflow-visible transition-all duration-300 ease-in-out lg:block lg:w-auto ${
            isOpen
              ? "max-h-96 opacity-100 translate-y-0 mt-4"
              : "max-h-0 opacity-0 -translate-y-4 lg:translate-y-0 lg:max-h-none lg:opacity-100 mt-0"
          }`}
          aria-hidden={!isOpen}
        >
          <ul className="flex flex-col gap-2 mt-2 mb-4 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-8">
            <li className="flex items-center">
              <Link
                to="/"
                className="group flex items-center gap-2 text-[15px] font-medium text-amber-900/70 dark:text-amber-100/70 hover:text-amber-900 dark:hover:text-amber-100 transition-colors py-2"
              >
                Home
              </Link>
            </li>

            <li className="flex items-center">
              <Link
                to="/browse"
                className="group flex items-center gap-2 text-[15px] font-medium text-amber-900/70 dark:text-amber-100/70 hover:text-amber-900 dark:hover:text-amber-100 transition-colors py-2"
              >
                Browse
              </Link>
            </li>

            {user && user.role === "customer" && (
              <li className="flex items-center">
                <Link
                  to="/my-requests"
                  className="group flex items-center gap-2 text-[15px] font-medium text-amber-900/70 dark:text-amber-100/70 hover:text-amber-900 dark:hover:text-amber-100 transition-colors py-2"
                >
                  My Requests
                </Link>
              </li>
            )}

            {user && user.role === "admin" && (
              <li className="flex items-center">
                <Link
                  to="/admin"
                  className="group flex items-center gap-1.5 text-[15px] font-medium text-amber-900/70 dark:text-amber-100/70 hover:text-amber-900 dark:hover:text-amber-100 transition-colors py-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="7" height="9" rx="1" />
                    <rect x="3" y="16" width="7" height="5" rx="1" />
                    <rect x="14" y="3" width="7" height="5" rx="1" />
                    <rect x="14" y="12" width="7" height="9" rx="1" />
                  </svg>
                  Admin
                </Link>
              </li>
            )}

            <li className="flex items-center">
              <Link
                to="/cart"
                className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-[15px] font-medium transition-all ${
                  isCartRoute
                    ? "bg-amber-900/10 text-amber-900 dark:bg-white/10 dark:text-amber-100"
                    : "text-amber-900/70 hover:bg-amber-900/5 hover:text-amber-900 dark:text-amber-100/70 dark:hover:bg-white/10 dark:hover:text-amber-100"
                }`}
              >
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
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 0 0 6.6 17H19m-12 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm11 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"
                  />
                </svg>
                Cart
                {cartCount > 0 && (
                  <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-amber-700 px-1.5 text-[11px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            </li>

            {/* Theme toggle – desktop (in nav list) */}
            <li className="hidden lg:flex items-center">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={
                  isDark ? "Switch to light mode" : "Switch to dark mode"
                }
                className="flex h-9 w-9 items-center justify-center rounded-full text-amber-900/70 dark:text-amber-100/70 hover:text-amber-900 dark:hover:text-amber-100 hover:bg-amber-900/5 dark:hover:bg-white/10 transition-all"
              >
                {isDark ? <SunIcon /> : <MoonIcon />}
              </button>
            </li>

            {user ? (
              <li
                className="relative flex flex-col lg:items-center"
                ref={dropdownRef}
              >
                <button
                  className={`group flex items-center gap-2 cursor-pointer text-[15px] font-medium transition-colors py-2 px-3 rounded-full ${
                    accountDropdownOpen
                      ? "bg-amber-900/10 text-amber-900 dark:bg-white/10 dark:text-amber-100"
                      : "text-amber-900/70 hover:bg-amber-900/5 hover:text-amber-900 dark:text-amber-100/70 dark:hover:bg-white/10 dark:hover:text-amber-100"
                  }`}
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  aria-haspopup="true"
                  aria-expanded={accountDropdownOpen}
                >
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
                      d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                  Account
                </button>

                <div
                  id="account-dropdown"
                  className={`w-full lg:absolute lg:right-0 lg:top-full lg:mt-3 lg:w-48 rounded-xl shadow-xl shadow-amber-900/5 dark:shadow-black/40 bg-paper-elevated/95 dark:bg-gray-800/95 backdrop-blur-xl border border-amber-900/10 dark:border-gray-700 z-50 origin-top-right transition-all duration-200 ease-out ${
                    accountDropdownOpen
                      ? "scale-100 opacity-100 visible translate-y-0 h-auto"
                      : "scale-95 opacity-0 invisible -translate-y-2 h-0 overflow-hidden"
                  }`}
                >
                  <ul className="py-2">
                    <li>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 w-full px-5 py-2.5 text-left text-[14px] text-amber-950/80 dark:text-amber-100/80 hover:bg-amber-50 dark:hover:bg-gray-700 hover:text-amber-900 dark:hover:text-amber-100 transition-colors font-medium"
                      >
                        Profile
                      </Link>
                    </li>
                    <div className="h-[1px] bg-amber-900/5 dark:bg-gray-700 my-1"></div>
                    <li>
                      <button
                        className="flex items-center gap-2 w-full px-5 py-2.5 text-left text-[14px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-colors font-medium"
                        onClick={logout}
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </li>
            ) : (
              <li className="flex items-center mt-2 lg:mt-0 lg:ml-2">
                <Link
                  to="/login"
                  className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white text-[14px] font-medium rounded-full transition-all shadow-sm hover:shadow-md"
                >
                  Log in
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Nav;
