import { Outlet } from "react-router-dom";

function UserManagement() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">User Management</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Welcome to User Management where you can manage users.</p>
        <aside>
            <Outlet />
        </aside>
      </div>
    </>
  );
}

export default UserManagement;
