import { Link, Outlet, useLocation } from "@remix-run/react";
import {
  Power,
  LayoutDashboard,
  PlusSquare,
  List,
  ShoppingCart,
} from "lucide-react";
import { withAuth } from "~/middlewares/withAuth";

export const loader = withAuth(async () => {
  return {};
});

export default function Tutor() {
  const path = useLocation().pathname;
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="navbar bg-base-100 shadow-sm border-b">
        <div className="container px-4 mx-auto">
          <div className="flex justify-between h-16 items-center">
            <Link
              to="/"
              className="text-2xl font-bold flex gap-2 uppercase text-primary"
            >
              <ShoppingCart
                size={30}
                className="text-primary"
                strokeWidth={3}
              />
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

      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row">
          <ul className="menu w-56 mt-4 me-4 space-y-2">
            <li>
              <Link
                to="/shop/dashboard"
                className={
                  path.includes("/shop/dashboard") ? "menu-active" : ""
                }
              >
                <LayoutDashboard className="flex-shrink-0 h-5 w-5 mr-3" />
                Dashboard
              </Link>
            </li>
             <li>
              <Link
                to="#"
                className={path.includes("/shop/add") ? "menu-active" : ""}
              >
                <PlusSquare className="flex-shrink-0 h-5 w-5 mr-3" />
                Add Product
              </Link>
            </li>
            <li>
              <Link
                to="#"
                className={path.includes("/shop/products") ? "menu-active" : ""}
              >
                <List className="flex-shrink-0 h-5 w-5 mr-3" />
                Products
              </Link>
            </li> 
            <li>
              <Link
                to="#"
                className={path.includes("/shop/add") ? "menu-active" : ""}
              >
                <PlusSquare className="flex-shrink-0 h-5 w-5 mr-3" />
                Add Product
              </Link>
            </li>
            <li>
              <Link
                to="#"
                className={path.includes("/shop/products") ? "menu-active" : ""}
              >
                <List className="flex-shrink-0 h-5 w-5 mr-3" />
                Products
              </Link>
            </li> <li>
              <Link
                to="#"
                className={path.includes("/shop/add") ? "menu-active" : ""}
              >
                <PlusSquare className="flex-shrink-0 h-5 w-5 mr-3" />
                Add Product
              </Link>
            </li>
            <li>
              <Link
                to="#"
                className={path.includes("/shop/products") ? "menu-active" : ""}
              >
                <List className="flex-shrink-0 h-5 w-5 mr-3" />
                Products
              </Link>
            </li> <li>
              <Link
                to="#"
                className={path.includes("/shop/add") ? "menu-active" : ""}
              >
                <PlusSquare className="flex-shrink-0 h-5 w-5 mr-3" />
                Add Product
              </Link>
            </li>
            <li>
              <Link
                to="#"
                className={path.includes("/shop/products") ? "menu-active" : ""}
              >
                <List className="flex-shrink-0 h-5 w-5 mr-3" />
                Products
              </Link>
            </li> 
          </ul>

          <main className="flex-1 border-s">
            <div className="p-4 min-h-[calc(100vh-90px)]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
