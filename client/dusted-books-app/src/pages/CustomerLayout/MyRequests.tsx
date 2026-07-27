import { useEffect, useState } from "react";
import Nav from "../../components/Nav";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/cartContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type RequestStatus = "pending" | "approved" | "rejected";

interface BookRequest {
  _id: string;
  bookTitle: string;
  authorName: string;
  note?: string;
  status: RequestStatus;
  price?: number | null;
  adminMessage?: string;
  createdAt: string;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(price);

const StatusBadge = ({ status }: { status: RequestStatus }) => {
  const cfg = {
    pending: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50",
    approved: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50",
    rejected: "bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700/50",
  };

  const labels = { pending: "Pending", approved: "Approved", rejected: "Rejected" };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${cfg[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "pending"
            ? "bg-amber-500"
            : status === "approved"
            ? "bg-emerald-500"
            : "bg-red-500"
        }`}
      />
      {labels[status]}
    </span>
  );
};

export default function MyRequests() {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();

  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState("");

  const handleAddToCart = (req: BookRequest) => {
    if (!req.price) return;
    addToCart({
      _id: req._id,
      title: req.bookTitle,
      author: req.authorName,
      description: req.note || "Requested book",
      price: req.price,
      imgUrl: "https://via.placeholder.com/400x600?text=Dusted+Books",
      category: ["Requested"],
    });
  };

  const handleBuy = (req: BookRequest) => {
    if (!req.price) return;
    const inCart = cartItems.some((cartItem) => cartItem._id === req._id);
    if (!inCart) {
      addToCart({
        _id: req._id,
        title: req.bookTitle,
        author: req.authorName,
        description: req.note || "Requested book",
        price: req.price,
        imgUrl: "https://via.placeholder.com/400x600?text=Dusted+Books",
        category: ["Requested"],
      });
    }
    navigate("/cart");
  };

  // Form state
  const [bookTitle, setBookTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<{ type: "success" | "error" | ""; message: string }>({ type: "", message: "" });

  const fetchMyRequests = async () => {
    try {
      setLoadingList(true);
      const res = await fetch(`${API}/book-requests/my`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load requests.");
      const data: BookRequest[] = await res.json();
      setRequests(data);
    } catch {
      setListError("Could not load your requests. Please try again.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim()) return;

    try {
      setSubmitting(true);
      setFormStatus({ type: "", message: "" });

      const res = await fetch(`${API}/book-requests`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookTitle, authorName, note }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to submit request.");
      }

      setFormStatus({ type: "success", message: "Your request has been submitted! We'll review it soon." });
      setBookTitle("");
      setAuthorName("");
      setNote("");
      fetchMyRequests();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setFormStatus({ type: "error", message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-amber-950 dark:bg-gray-950 dark:text-amber-100 overflow-x-hidden w-full max-w-full">
      <Nav />

      <main className="mx-auto max-w-3xl px-4 pb-20 pt-28 sm:px-6 lg:pt-32">
        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-stone-900 dark:text-gray-50">My Book Requests</h1>
          <p className="mt-1.5 text-sm text-stone-500 dark:text-gray-400">
            Can't find a book in our store? Request it and we'll check availability for you.
          </p>
        </div>

        {/* ── Request form ── */}
        <section className="mb-10 rounded-2xl border border-amber-900/10 bg-paper-elevated p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="mb-5 text-lg font-semibold text-stone-800 dark:text-gray-100">Request a Book</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="req-title" className="block mb-1.5 text-sm font-medium text-stone-700 dark:text-gray-300">
                Book Title <span className="text-red-500">*</span>
              </label>
              <input
                id="req-title"
                type="text"
                required
                placeholder="e.g. The Alchemist"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-amber-500"
              />
            </div>

            <div>
              <label htmlFor="req-author" className="block mb-1.5 text-sm font-medium text-stone-700 dark:text-gray-300">
                Author's Name <span className="text-red-500">*</span>
              </label>
              <input
                id="req-author"
                type="text"
                required
                placeholder="e.g. Paulo Coelho"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-amber-500"
              />
            </div>

            <div>
              <label htmlFor="req-note" className="block mb-1.5 text-sm font-medium text-stone-700 dark:text-gray-300">
                Additional Note <span className="text-stone-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="req-note"
                placeholder="e.g. Preferred edition, condition, etc."
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 outline-none resize-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-amber-500"
              />
            </div>

            {formStatus.message && (
              <p
                className={`rounded-xl px-4 py-3 text-sm font-medium ${
                  formStatus.type === "success"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                    : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                }`}
              >
                {formStatus.message}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !bookTitle.trim() || !authorName.trim()}
              className="self-start rounded-full bg-amber-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit Request"}
            </button>
          </form>
        </section>

        {/* ── My requests list ── */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-stone-800 dark:text-gray-100">Your Past Requests</h2>

          {loadingList ? (
            <div className="rounded-2xl border border-amber-900/10 bg-paper-elevated p-8 text-center text-sm text-stone-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
              Loading requests…
            </div>
          ) : listError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600 dark:border-red-700/40 dark:bg-red-900/20 dark:text-red-400">
              {listError}
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900">
              <svg className="mx-auto mb-3 h-10 w-10 text-stone-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
              <p className="text-sm font-medium text-stone-400 dark:text-gray-500">No requests yet. Submit your first one above!</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {requests.map((req) => (
                <li
                  key={req._id}
                  className="rounded-2xl border border-amber-900/10 bg-paper-elevated p-5 shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-stone-900 truncate dark:text-gray-50">
                        {req.bookTitle}
                      </p>
                      <p className="mt-0.5 text-sm text-stone-500 dark:text-gray-400">by {req.authorName}</p>
                      {req.note && (
                        <p className="mt-0.5 text-sm text-stone-500 dark:text-gray-400">{req.note}</p>
                      )}
                      <p className="mt-2 text-xs text-stone-400 dark:text-gray-500">
                        Requested on {new Date(req.createdAt).toLocaleDateString("en-LK", { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>

                  {/* Approved: show price + buy CTA */}
                  {req.status === "approved" && req.price != null && (() => {
                    const itemInCart = cartItems.some((cartItem) => cartItem._id === req._id);
                    return (
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-900/20">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Great news! This book is available.</p>
                          <p className="mt-0.5 text-xl font-bold text-emerald-700 dark:text-emerald-300">{formatPrice(req.price)}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleBuy(req)}
                            className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
                          >
                            Buy Now
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddToCart(req)}
                            disabled={itemInCart}
                            className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                              itemInCart
                                ? 'cursor-not-allowed border-emerald-300 bg-emerald-100/50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-800 dark:text-emerald-300'
                                : 'border-emerald-600 text-emerald-600 hover:bg-emerald-100/30 dark:border-emerald-400 dark:text-emerald-200 dark:hover:bg-emerald-800'
                            }`}
                          >
                            {itemInCart ? 'In Cart' : 'Add to Cart'}
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Rejected: show sorry message */}
                  {req.status === "rejected" && (
                    <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-red-50 px-4 py-3 dark:bg-red-900/20">
                      <svg className="h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                      </svg>
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">
                        {req.adminMessage || "Sorry, this book is not available."}
                      </p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
