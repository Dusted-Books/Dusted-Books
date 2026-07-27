import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/cartContext";

type Book = {
  _id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  imgUrl: string;
  category?: string[];
};

type BookCardProps = {
  book: Book;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(price);

function BookCard({ book }: BookCardProps) {
  const { addToCart, cartItems } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      addToCart(book);
    },
    [addToCart, book],
  );

  const itemInCart = cartItems.some((cartItem) => cartItem._id === book._id);

  const handleBuy = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();

      if (!itemInCart) {
        addToCart(book);
      }
      navigate("/cart");
    },
    [navigate, addToCart, book, itemInCart],
  );

  const handleViewDetails = useCallback(() => {
    navigate(`/books/${book._id}`);
  }, [book._id, navigate]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleViewDetails}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleViewDetails();
        }
      }}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-[22px] border border-amber-900/10 bg-paper-elevated p-4 shadow-sm shadow-amber-950/5 transition duration-300 hover:-translate-y-1 hover:border-amber-800/15 hover:shadow-lg hover:shadow-amber-950/8 dark:border-gray-700 dark:bg-gray-900 dark:shadow-black/20 dark:hover:shadow-black/40"
    >
      <div className="relative mb-4 flex h-64 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-paper-muted to-paper-elevated dark:from-gray-800 dark:via-gray-800 dark:to-gray-700 p-2">
        <img
          src={
            book.imgUrl ||
            "https://via.placeholder.com/400x600?text=Dusted+Books"
          }
          alt={book.title}
          className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="font-serif text-lg font-semibold text-amber-950 dark:text-amber-50">
              {book.title}
            </h2>
            <p className="mt-1 text-sm text-amber-900/55 dark:text-amber-200/50">
              By {book.author}
            </p>
          </div>
          <span className="rounded-full bg-amber-100 dark:bg-amber-900/40 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300">
            {formatPrice(book.price)}
          </span>
        </div>

        <p className="mt-3 line-clamp-3 text-sm text-amber-900/60 dark:text-amber-200/45">
          {book.description}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleBuy}
          className="rounded-full bg-amber-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
        >
          Buy
        </button>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={itemInCart}
          className={`rounded-full border border-amber-700/80 px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-amber-500/40 dark:border-amber-400/70 ${
            itemInCart
              ? "cursor-not-allowed bg-amber-100 text-amber-900 dark:bg-gray-700 dark:text-amber-300"
              : "bg-transparent text-amber-800 hover:bg-amber-50 dark:text-amber-200 dark:hover:bg-gray-800"
          }`}
        >
          {itemInCart ? "In Cart" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

export default BookCard;
