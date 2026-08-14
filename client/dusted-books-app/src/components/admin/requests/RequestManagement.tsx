import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type RequestStatus = "pending" | "approved" | "rejected";

interface BookRequest {
  _id: string;
  userEmail: string;
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
    pending:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50",
    approved:
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50",
    rejected:
      "bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700/50",
  };
  const labels = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  };
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

export default function RequestManagement() {
  const [requests, setRequests] = useState<BookRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Per-row approve form state: { [requestId]: priceString }
  const [approvePrices, setApprovePrices] = useState<Record<string, string>>({});
  // Which rows have the approve form open
  const [approveOpen, setApproveOpen] = useState<Record<string, boolean>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [actionError, setActionError] = useState<Record<string, string>>({});

  // Filter
  const [filter, setFilter] = useState<"all" | RequestStatus>("all");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/book-requests`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load requests.");
      const data: BookRequest[] = await res.json();
      setRequests(data);
    } catch {
      setError("Could not load book requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: string, status: "approved" | "rejected") => {
    const price = approvePrices[id];

    if (status === "approved") {
      const parsed = Number(price);
      if (!price || Number.isNaN(parsed) || parsed <= 0) {
        setActionError((prev) => ({ ...prev, [id]: "Please enter a valid price." }));
        return;
      }
    }

    try {
      setActionLoading((prev) => ({ ...prev, [id]: true }));
      setActionError((prev) => ({ ...prev, [id]: "" }));

      const res = await fetch(`${API}/book-requests/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, price: status === "approved" ? Number(price) : undefined }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Action failed.");
      }

      // Update local state
      const updated: BookRequest = await res.json();
      setRequests((prev) => prev.map((r) => (r._id === id ? updated : r)));
      setApproveOpen((prev) => ({ ...prev, [id]: false }));
      setApprovePrices((prev) => ({ ...prev, [id]: "" }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setActionError((prev) => ({ ...prev, [id]: msg }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const filtered =
    filter === "all" ? requests : requests.filter((r) => r.status === filter);

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          Book Requests
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Review and respond to customer book requests.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              filter === tab
                ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}{" "}
            <span
              className={`ml-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs ${
                filter === tab
                  ? "bg-white/20 text-white dark:bg-black/20 dark:text-gray-900"
                  : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
          Loading requests…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600 dark:border-red-700/40 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
          <svg
            className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
            />
          </svg>
          <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
            No {filter === "all" ? "" : filter} requests found.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {filtered.map((req) => (
            <li
              key={req._id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
            >
              {/* Request header */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-gray-900 dark:text-gray-50 truncate">
                    {req.bookTitle}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">by {req.authorName}</p>
                  {req.note && (
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 italic">
                      "{req.note}"
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                      </svg>
                      {req.userEmail}
                    </span>
                    <span>·</span>
                    <span>
                      {new Date(req.createdAt).toLocaleDateString("en-LK", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <StatusBadge status={req.status} />
              </div>

              {/* Approved: show price */}
              {req.status === "approved" && req.price != null && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 dark:bg-emerald-900/20">
                  <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    Approved at {formatPrice(req.price)}
                  </p>
                </div>
              )}

              {/* Rejected: show message */}
              {req.status === "rejected" && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 dark:bg-red-900/20">
                  <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {req.adminMessage || "Sorry, this book is not available."}
                  </p>
                </div>
              )}

              {/* Action buttons — only for pending */}
              {req.status === "pending" && (
                <div className="mt-4 flex flex-col gap-3">
                  {/* Approve inline form */}
                  {approveOpen[req._id] ? (
                    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-700/50 dark:bg-emerald-900/20">
                      <div className="flex flex-1 items-center gap-2 min-w-[200px]">
                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
                          Price (LKR):
                        </span>
                        <input
                          id={`price-${req._id}`}
                          type="number"
                          min="1"
                          placeholder="e.g. 1500"
                          value={approvePrices[req._id] || ""}
                          onChange={(e) =>
                            setApprovePrices((prev) => ({ ...prev, [req._id]: e.target.value }))
                          }
                          className="flex-1 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-600 dark:bg-gray-800 dark:text-gray-100"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(req._id, "approved")}
                          disabled={actionLoading[req._id]}
                          className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
                        >
                          {actionLoading[req._id] ? "Saving…" : "Confirm Approve"}
                        </button>
                        <button
                          onClick={() =>
                            setApproveOpen((prev) => ({ ...prev, [req._id]: false }))
                          }
                          className="rounded-lg bg-gray-200 px-4 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          setApproveOpen((prev) => ({ ...prev, [req._id]: true }))
                        }
                        className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(req._id, "rejected")}
                        disabled={actionLoading[req._id]}
                        className="rounded-full border border-red-300 bg-red-50 px-5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60 dark:border-red-700/50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                      >
                        {actionLoading[req._id] ? "Processing…" : "Reject"}
                      </button>
                    </div>
                  )}

                  {actionError[req._id] && (
                    <p className="text-xs text-red-500 dark:text-red-400">
                      {actionError[req._id]}
                    </p>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
