import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import logoImage from "../assets/db logo.png";

const browseCategories = ["Fiction", "Non-Fiction", "Mystery", "Self Help"];

const contactPhones = [
  { display: "077 496 5624", tel: "0774965624", wa: "94774965624" },
  { display: "078 390 7616", tel: "0783907616", wa: "94783907616" },
] as const;

const contactEmail = "dustedbooks130@gmail.com";

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61591971380790",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.52 1.5-3.91 3.78-3.91 1.09 0 2.23.2 2.23.2v2.46H15.2c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.9h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/dustedbooks130",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07ZM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.88 5.88 0 0 0-2.13 1.38A5.88 5.88 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.8.72 1.47 1.38 2.13a5.88 5.88 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.88 5.88 0 0 0 2.13-1.38 5.88 5.88 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.88 5.88 0 0 0-1.38-2.13A5.88 5.88 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0Zm0 5.84A6.16 6.16 0 1 0 12 18.16 6.16 6.16 0 0 0 12 5.84Zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/dusted-books",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0Z" />
      </svg>
    ),
  },
];

function Footer() {
  const { user } = useAuth();

  return (
    <footer className="border-t border-amber-900/10 bg-paper-elevated px-5 py-10 dark:border-gray-800 dark:bg-gray-900/50 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-6">
          {/* Brand + socials */}
          <div className="sm:col-span-2 lg:col-span-4">
            <div className="mb-3 flex items-center gap-2.5">
              <img
                src={logoImage}
                alt="DustedBooks"
                className="h-9 w-9 object-contain"
              />
              <span className="font-brand text-lg font-semibold text-amber-950 dark:text-amber-100">
                DustedBooks
              </span>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-amber-900/50 dark:text-amber-200/40">
              Sri Lanka&apos;s marketplace for pre-loved books. Buy, sell, and
              request titles — and give every story a second life.
            </p>

            <div className="mt-4 flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`DustedBooks on ${social.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-amber-900/10 bg-paper text-amber-800/55 transition-colors hover:border-amber-700/25 hover:bg-amber-50 hover:text-amber-800 dark:border-gray-700 dark:bg-gray-800 dark:text-amber-200/55 dark:hover:bg-gray-700 dark:hover:text-amber-200"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div className="lg:col-span-2">
            <h4 className="mb-3 text-[12px] font-medium tracking-[0.12em] text-amber-900/55 uppercase dark:text-amber-200/50">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/browse"
                  className="text-amber-900/60 transition-colors hover:text-amber-800 dark:text-amber-200/50 dark:hover:text-amber-300"
                >
                  Browse books
                </Link>
              </li>
              {browseCategories.map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/browse?category=${encodeURIComponent(cat)}`}
                    className="text-amber-900/60 transition-colors hover:text-amber-800 dark:text-amber-200/50 dark:hover:text-amber-300"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div className="lg:col-span-2">
            <h4 className="mb-3 text-[12px] font-medium tracking-[0.12em] text-amber-900/55 uppercase dark:text-amber-200/50">
              Account
            </h4>
            <ul className="space-y-2 text-sm">
              {!user && (
                <>
                  <li>
                    <Link
                      to="/login"
                      className="text-amber-900/60 transition-colors hover:text-amber-800 dark:text-amber-200/50 dark:hover:text-amber-300"
                    >
                      Sign in
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/signup"
                      className="text-amber-900/60 transition-colors hover:text-amber-800 dark:text-amber-200/50 dark:hover:text-amber-300"
                    >
                      Create account
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link
                  to="/my-requests"
                  className="text-amber-900/60 transition-colors hover:text-amber-800 dark:text-amber-200/50 dark:hover:text-amber-300"
                >
                  Request a book
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div id="contact-us" className="sm:col-span-2 lg:col-span-4">
            <h4 className="mb-3 text-[12px] font-medium tracking-[0.12em] text-amber-900/55 uppercase dark:text-amber-200/50">
              Contact
            </h4>
            <p className="mb-4 text-sm leading-relaxed text-amber-900/50 dark:text-amber-200/40">
              Selling books or need help? Reach us by phone, WhatsApp, or email.
            </p>

            <div className="space-y-4">
              <div>
                <p className="mb-2 text-[11px] font-medium tracking-wide text-amber-900/40 dark:text-amber-200/35">
                  Phone
                </p>
                <ul className="space-y-2.5">
                  {contactPhones.map((phone) => (
                    <li
                      key={phone.tel}
                      className="flex flex-wrap items-center gap-x-3 gap-y-1.5"
                    >
                      <span className="min-w-[7.5rem] text-sm font-medium tabular-nums text-amber-950 dark:text-amber-100">
                        {phone.display}
                      </span>
                      <span className="flex items-center gap-2">
                        <a
                          href={`tel:${phone.tel}`}
                          className="text-xs font-medium text-amber-800/70 underline decoration-amber-900/15 underline-offset-2 transition-colors hover:text-amber-900 hover:decoration-amber-900/40 dark:text-amber-200/60 dark:hover:text-amber-200"
                        >
                          Call
                        </a>
                        <span
                          className="text-amber-900/15 dark:text-gray-600"
                          aria-hidden="true"
                        >
                          ·
                        </span>
                        <a
                          href={`https://wa.me/${phone.wa}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-emerald-700 underline decoration-emerald-700/20 underline-offset-2 transition-colors hover:text-emerald-800 hover:decoration-emerald-700/50 dark:text-emerald-400/80 dark:hover:text-emerald-300"
                        >
                          WhatsApp
                        </a>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="mb-1.5 text-[11px] font-medium tracking-wide text-amber-900/40 dark:text-amber-200/35">
                  Email
                </p>
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-sm font-medium text-amber-950 transition-colors hover:text-amber-700 dark:text-amber-100 dark:hover:text-amber-300"
                >
                  {contactEmail}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-amber-900/10 pt-5 dark:border-gray-800 sm:flex-row">
          <p className="text-xs text-amber-900/40 dark:text-gray-500">
            © {new Date().getFullYear()} DustedBooks. All rights reserved.
          </p>
          <p className="text-xs text-amber-900/40 dark:text-gray-500">
            Give books a second life.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
