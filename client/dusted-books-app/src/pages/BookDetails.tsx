import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Nav from "../components/Nav";
import { useCart } from "../context/cartContext";

type Book = {
  _id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  imgUrl?: string;
  category?: string[];
  condition?: string;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(price);

function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/books/${id}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch book");
        }

        const selectedBook = (await response.json()) as Book;

        if (!selectedBook || !selectedBook._id) {
          setError("Book not found.");
          setBook(null);
          return;
        }

        setBook(selectedBook);
      } catch (err) {
        console.error(err);
        setError("Unable to load the book right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const itemInCart = useMemo(
    () =>
      book ? cartItems.some((cartItem) => cartItem._id === book._id) : false,
    [book, cartItems],
  );

  const handleAddToCart = () => {
    if (!book) {
      return;
    }

    addToCart({
      _id: book._id,
      title: book.title,
      author: book.author,
      description: book.description,
      price: book.price,
      imgUrl:
        book.imgUrl || "https://via.placeholder.com/400x600?text=Dusted+Books",
      category: book.category,
    });
  };

  const handleBuy = () => {
    if (!book) {
      return;
    }

    if (!itemInCart) {
      addToCart({
        _id: book._id,
        title: book.title,
        author: book.author,
        description: book.description,
        price: book.price,
        imgUrl:
          book.imgUrl ||
          "https://via.placeholder.com/400x600?text=Dusted+Books",
        category: book.category,
      });
    }

    navigate("/cart");
  };

  return (
    <div className="min-h-screen bg-paper text-amber-950 dark:bg-gray-950 dark:text-amber-100 font-sans selection:bg-amber-900 selection:text-white overflow-x-hidden w-full max-w-full">
      <Nav />

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-fit rounded-full border border-amber-700/30 px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-50 dark:border-amber-400/30 dark:text-amber-200 dark:hover:bg-gray-800"
        >
          ← Back
        </button>

        {loading ? (
          <div className="rounded-3xl border border-amber-900/10 bg-paper-elevated p-8 text-center shadow-sm shadow-amber-950/5 dark:border-gray-700 dark:bg-gray-900 dark:shadow-black/20">
            <p className="text-lg font-semibold text-amber-950 dark:text-amber-100">
              Loading book details...
            </p>
          </div>
        ) : error || !book ? (
          <div className="rounded-3xl border border-amber-900/10 bg-paper-elevated p-8 text-center shadow-sm shadow-amber-950/5 dark:border-gray-700 dark:bg-gray-900 dark:shadow-black/20">
            <p className="text-lg font-semibold text-amber-800 dark:text-amber-300">
              {error || "Book not found."}
            </p>
          </div>
        ) : (
          <section className="grid gap-6 rounded-3xl border border-amber-900/10 bg-paper-elevated p-6 shadow-sm shadow-amber-950/5 dark:border-gray-700 dark:bg-gray-900 dark:shadow-black/20 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
            <div className="flex items-center justify-center rounded-3xl bg-gradient-to-br from-amber-50 via-paper-muted to-paper-elevated p-4 dark:from-gray-800 dark:via-gray-800 dark:to-gray-700">
              <img
                src={
                  book.imgUrl ||
                  "https://via.placeholder.com/400x600?text=Dusted+Books"
                }
                alt={book.title}
                className="max-h-[480px] w-full max-w-[320px] object-contain"
              />
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <div className="mb-4 flex flex-wrap gap-2">
                  {book.category?.map((category) => (
                    <span
                      key={category}
                      className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                    >
                      {category}
                    </span>
                  )) || (
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                      Featured
                    </span>
                  )}
                </div>

                <h1 className="font-serif text-3xl font-bold text-amber-950 dark:text-amber-50">
                  {book.title}
                </h1>
                <p className="mt-2 text-lg text-amber-900/60 dark:text-amber-200/50">
                  by {book.author}
                </p>
                <p className="mt-4 text-base leading-7 text-amber-900/70 dark:text-amber-200/55">
                  {book.description}
                </p>
                <div className="mt-6 rounded-2xl border border-amber-900/10 bg-amber-50 p-4 dark:border-gray-700 dark:bg-gray-800/70">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700/70 dark:text-amber-300/70">
                    Condition
                  </p>
                  <p className="mt-1 text-base font-medium text-amber-950 dark:text-amber-100">
                    {book.condition || "Good condition copy"}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4">
                <div className="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3 dark:bg-amber-900/20">
                  <span className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-800 dark:text-amber-300">
                    Price
                  </span>
                  <span className="text-2xl font-bold text-amber-800 dark:text-amber-300">
                    {formatPrice(book.price)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleBuy}
                    className="rounded-full bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  >
                    Buy Now
                  </button>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={itemInCart}
                    className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-amber-500/40 ${
                      itemInCart
                        ? "cursor-not-allowed border-amber-300 bg-amber-100 text-amber-900 dark:border-gray-600 dark:bg-gray-700 dark:text-amber-300"
                        : "border-amber-700/80 text-amber-800 hover:bg-amber-50 dark:border-amber-400/70 dark:text-amber-200 dark:hover:bg-gray-800"
                    }`}
                  >
                    {itemInCart ? "In Cart" : "Add to Cart"}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default BookDetails;
