import { Link, Outlet, useLocation } from "@remix-run/react";
import { Power } from "lucide-react";
import { withAuthTutor } from "~/middlewares/withAuthTutor";

export const loader = withAuthTutor(async () => {
  return {};
});

export default function Tutor() {
  const { pathname } = useLocation();

  return (
    <>
      {/* navbar */}
      <div className="overflow-x-auto bg-gray-200">
        <div className="max-w-6xl mx-auto bg-gray-200 p-4 flex items-center gap-4">
          <div className="w-full items-center flex justify-between gap-4">
            <div>
              <Link
                to="/"
                className="text-2xl text-green-500 text-nowrap font-extrabold uppercase"
              >
                Jobify
              </Link>
            </div>
            <ul className="flex gap-2 items-center capitalize">
              <li>
                <Link
                  to="/tutor/dashboard"
                  className={`px-3 py-2 rounded border border-gray-300 ${
                    pathname.includes("dashboard") && "bg-gray-300"
                  }`}
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <form method="post" action="/auth/logout">
                  <button className="px-3 py-2 rounded border border-gray-300">
                    <Power className="h-5 hover:text-red-500" />
                  </button>
                </form>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-sidebar">
          {/* Main content */}
          <div className="col-span-1 lg:col-span-2 p-4">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}
