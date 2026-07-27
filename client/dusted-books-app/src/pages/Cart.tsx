import { Link } from "react-router-dom";
import { useCart } from "../context/cartContext";

function Cart() {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-paper dark:bg-gray-950 text-amber-950 dark:text-amber-100 font-sans selection:bg-amber-900 selection:text-white pt-28 pb-20 overflow-x-hidden w-full max-w-full">
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className="rounded-3xl bg-paper-elevated dark:bg-gray-900 border border-amber-900/10 dark:border-gray-700 p-8 shadow-sm shadow-amber-900/5 dark:shadow-black/20">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Your Cart</h1>
              <p className="mt-2 text-sm text-amber-700/70 dark:text-amber-300/70 max-w-2xl">
                Purchase is not yet implemented, but you can store items here and remove them anytime.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/browse"
                className="inline-flex items-center justify-center rounded-full border border-amber-700 bg-transparent px-5 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 dark:border-amber-400 dark:text-amber-200 dark:hover:bg-gray-800"
              >
                Continue browsing
              </Link>
              {cartItems.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Clear cart
                </button>
              )}
            </div>
          </div>

          {cartItems.length === 0 ? (
            <div className="mt-12 rounded-3xl border border-dashed border-amber-200 dark:border-gray-700 bg-amber-50 dark:bg-gray-900/50 p-12 text-center">
              <h2 className="text-xl font-semibold text-amber-950 dark:text-amber-100">Your cart is empty.</h2>
              <p className="mt-3 text-amber-700/70 dark:text-amber-300/70">Add books from browse to see them here.</p>
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              {cartItems.map((item) => (
                <div key={item._id} className="rounded-3xl border border-amber-200 dark:border-gray-700 bg-paper-elevated dark:bg-gray-900 p-6 shadow-sm shadow-amber-900/5 dark:shadow-black/20">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.imgUrl || "https://via.placeholder.com/160x220?text=Dusted+Books"}
                        alt={item.title}
                        className="h-24 w-20 rounded-2xl object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-bold text-amber-950 dark:text-amber-100">{item.title}</h3>
                        <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">By {item.author}</p>
                        <p className="mt-1 text-sm text-amber-700/80 dark:text-amber-300/80">{item.category?.join(", ")}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 text-right">
                      <span className="text-sm text-amber-600 dark:text-amber-300">Quantity: {item.quantity}</span>
                      <span className="text-xl font-semibold text-amber-900 dark:text-amber-100">Rs. {item.price.toLocaleString("en-IN")}</span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item._id)}
                        className="rounded-full border border-red-600 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-400 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-900"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="rounded-3xl border border-amber-200 dark:border-gray-700 bg-paper-elevated dark:bg-gray-900 p-6 shadow-sm shadow-amber-900/5 dark:shadow-black/20">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-amber-600 dark:text-amber-300">Cart total</p>
                    <p className="text-3xl font-bold text-amber-950 dark:text-amber-100">Rs. {totalPrice.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="rounded-full bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-700 dark:bg-gray-800 dark:text-amber-200">
                    Purchase is not yet available
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Cart;
