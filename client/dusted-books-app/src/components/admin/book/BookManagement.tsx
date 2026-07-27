import { Outlet } from "react-router-dom";

function BookManagement() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Book Management</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Welcome to Book Management where you can manage Books.</p>
        <aside>
            <Outlet />
        </aside>
      </div>
    </>
  );
}

export default BookManagement;
