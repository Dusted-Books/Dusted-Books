import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/authContext";
import { ThemeProvider } from "./context/themeContext";
import { CartProvider } from "./context/cartContext";

import ProtectedRoute from "./routes/protected";
import GuestRoute from "./routes/GuestRoutes";
import AdminRoute from "./routes/adminRoutes";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";

// Code-split the heavier pages so they load on demand
const Home = lazy(() => import("./pages/CustomerLayout/Home"));
const Browse = lazy(() => import("./pages/Browse"));
const Cart = lazy(() => import("./pages/Cart"));
const BookDetails = lazy(() => import("./pages/BookDetails"));
const MyRequests = lazy(() => import("./pages/CustomerLayout/MyRequests"));
const AdminDashboard = lazy(() => import("./pages/AdminLayout/Admin"));
const UserManagement = lazy(() => import("./components/admin/user/UserManagement"));
const BookManagement = lazy(() => import("./components/admin/book/BookManagement"));
const UserCreateForm = lazy(() => import("./components/admin/user/UserCreateForm"));
const BookUpload = lazy(() => import("./components/admin/book/BookUpload"));
const RequestManagement = lazy(
  () => import("./components/admin/requests/RequestManagement"),
);

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper dark:bg-gray-950">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-4 border-amber-200/40 dark:border-gray-700" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-amber-600 dark:border-t-amber-400" />
      </div>
    </div>
  );
}

// "/" shows the customer Home for logged-in users, the public Landing otherwise
function RootRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  return user ? <Home /> : <Landing />;
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route
                  path="/login"
                  element={
                    <GuestRoute>
                      <Login />
                    </GuestRoute>
                  }
                />

                <Route
                  path="/signup"
                  element={
                    <GuestRoute>
                      <Login />
                    </GuestRoute>
                  }
                />

                <Route path="/" element={<RootRoute />} />

                {/* Public: guests can browse; deeper pages still require login */}
                <Route path="/browse" element={<Browse />} />

                {/* Public: guests can view their cart and book details too */}
                <Route path="/cart" element={<Cart />} />

                <Route path="/books/:id" element={<BookDetails />} />

                <Route
                  path="/my-requests"
                  element={
                    <ProtectedRoute>
                      <MyRequests />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                >
                  <Route index element={<Navigate to="users/create" replace />} />

                  {/* user-routes */}
                  <Route path="users" element={<UserManagement />}>
                    <Route path="create" element={<UserCreateForm />}></Route>
                  </Route>
                  {/* book-routes */}
                  <Route path="books" element={<BookManagement />}>
                    <Route path="add" element={<BookUpload />}></Route>
                  </Route>
                  {/* request-routes */}
                  <Route path="requests" element={<RequestManagement />} />
                </Route>

                <Route path="/unauthorized" element={<Unauthorized />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
