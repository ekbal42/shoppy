import { Link, Outlet, useLocation } from "@remix-run/react";
import { Power, LayoutDashboard, PlusSquare, List } from "lucide-react";
import { withAuth } from "~/middlewares/withAuth";

export const loader = withAuth(async () => {
  return {};
});

export default function Tutor() {
  const path = useLocation().pathname;
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link
              to="/"
              className="text-2xl font-bold uppercase text-green-600 hover:text-green-700 transition-colors"
            >
              Shoppy
            </Link>

            <form method="post" action="/auth/logout">
              <button
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Logout"
                title="Logout"
              >
                <Power className="h-5 w-5 text-gray-600 hover:text-red-500 transition-colors" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row">
          <aside className="w-full md:w-64 py-4 md:py-8 pr-4">
            <nav className="space-y-1">
              <Link
                to="/shop/dashboard"
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors
                  ${
                    path.includes("/shop/dashboard")
                      ? "bg-green-100 text-green-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <LayoutDashboard className="flex-shrink-0 h-5 w-5 mr-3" />
                <span className="truncate">Dashboard</span>
              </Link>

              <Link
                to="#"
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors
                  ${
                    path.includes("/shop/add")
                      ? "bg-green-100 text-green-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <PlusSquare className="flex-shrink-0 h-5 w-5 mr-3" />
                <span className="truncate">Add Product</span>
              </Link>

              <Link
                to="#"
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors
                  ${
                    path.includes("/shop/products")
                      ? "bg-green-100 text-green-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <List className="flex-shrink-0 h-5 w-5 mr-3" />
                <span className="truncate">Products</span>
              </Link>
            </nav>
          </aside>

          <main className="flex-1 py-8">
            <div className="bg-white shadow-sm rounded-lg p-4">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
