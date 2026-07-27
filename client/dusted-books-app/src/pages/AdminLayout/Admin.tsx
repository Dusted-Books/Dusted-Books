import { Outlet } from "react-router-dom";
import NavAdmin from "../../components/Nav_Admin";

function AdminPage() {

    return (
        <div className="flex min-h-screen w-full bg-paper dark:bg-gray-950 text-amber-950 dark:text-gray-100">
            <NavAdmin /> 
            
            <div className="flex-1 min-h-screen overflow-y-auto px-4 py-20 xl:ml-[20%] md:px-10 xl:py-10">
                <Outlet />
            </div>
        </div>
    );
}

export default AdminPage;