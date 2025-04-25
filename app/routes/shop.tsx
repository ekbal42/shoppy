import { Link, Outlet, useLocation } from "@remix-run/react";
import {
  Power,
  LayoutDashboard,
  List,
  ShoppingCart,
  ClockArrowUp,
} from "lucide-react";
import { withAuth } from "~/middlewares/withAuth";

export const loader = withAuth(async () => {
  return {};
});

export default function Tutor() {
  const path = useLocation().pathname;
  return (
    <div className="min-h-screen bg-gray-50 grid grid-cols-[auto_1fr]">
      <aside className="w-64 bg-white shadow-sm h-screen sticky top-0">
        <div className="h-16 bg-gray-200 flex items-center justify-start px-8 mb-4">
          <Link
            to="/"
            className="text-xl font-bold flex gap-2 uppercase text-nutral items-center"
          >
            <ShoppingCart size={24} className="text-nutral" strokeWidth={2.5} />
            Shoppy
          </Link>
        </div>

        <nav className="mx-3">
          <ul className="menu space-y-2 w-full bg-white">
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
                to="/shop/products"
                className={path.includes("/shop/products") ? "menu-active" : ""}
              >
                <List className="flex-shrink-0 h-5 w-5 mr-3" />
                Products
              </Link>
            </li>
            <li>
              <Link
                to="/shop/orders"
                className={path.includes("/shop/orders") ? "menu-active" : ""}
              >
                <ClockArrowUp className="flex-shrink-0 h-5 w-5 mr-3" />
                Orders
              </Link>
            </li>
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0">
          <form method="post" action="/auth/logout" className="w-full">
            <button
              className="btn rounded-none w-full flex justify-center"
              aria-label="Logout"
            >
              <Power className="h-5 w-5 mr-1" /> Exit Shop
            </button>
          </form>
        </div>
      </aside>

      <div className="grid grid-rows-[auto_1fr]">
        <main className="p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
