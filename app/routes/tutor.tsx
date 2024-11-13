import { useState } from "react";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { withAuthTutor } from "~/utils/withAuthTutor";
import { getUserFromSession } from "~/session.server";
import { Menu } from "lucide-react";

export let loader = withAuthTutor(async ({ request }: { request: Request }) => {
  const user = getUserFromSession(request);
  return { user };
});

export default function Tutor() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useLoaderData<any>().user;
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  return (
    <div className="min-h-screen flex">
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-0 bg-white bg-opacity-0 md:relative md:translate-x-0 md:block transition-transform duration-300 ease-in-out`}
      >
        <div className="w-64 bg-white p-6 h-full border-e">
          <h2 className="text-2xl font-semibold mb-8 mt-20 ms-4">
            {user?.name}
          </h2>
          <nav>
            <ul>
              <li>
                <a
                  href="#"
                  className="block px-4 py-2 rounded-lg hover:bg-gray-100"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block px-4 py-2 rounded-lg hover:bg-gray-100"
                >
                  Manage Students
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block px-4 py-2 rounded-lg hover:bg-gray-100"
                >
                  Assignments
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block px-4 py-2 rounded-lg hover:bg-gray-100"
                >
                  Settings
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <button
        className="md:hidden p- bg-white fixed top-4 left-4 z-50 rounded-full"
        onClick={toggleSidebar}
      >
        <Menu size={24} />
      </button>
      {/* Main Content */}
      <div className="flex-1">
        <div className="h-14 w-full bg-white border-b">
          <div className="flex items-center justify-end h-full">
            <form method="post" action="/logout">
              <button className="py-2 px-4 hover:bg-gray-100 rounded me-2">
                Log Out
              </button>
            </form>
          </div>
        </div>
        <div className="max-w-6xl mx-auto p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
