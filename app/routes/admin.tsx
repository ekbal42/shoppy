import { Outlet, useLoaderData } from "@remix-run/react";
import { getUserFromSession } from "~/session.server";
import { Power } from "lucide-react";
import { withAuthAdmin } from "~/utils/withAuthAdmin";

export const loader = withAuthAdmin(
  async ({ request }: { request: Request }) => {
    const user = getUserFromSession(request);
    return { user };
  }
);

export default function SuperAdmin() {
  const user = useLoaderData<any>().user;
  //   const { pathname } = useLocation();
  return (
    <>
      {/* navbar */}
      <div className="overflow-x-auto bg-gray-200">
        <div className="max-w-6xl mx-auto bg-gray-200 p-4 flex items-center gap-4">
          <div className="w-full items-center flex justify-between gap-4">
            <div>
              <h1 className="text-lg text-nowrap font-semibold uppercase">
                {user?.name}
              </h1>
            </div>
            <ul className="flex gap-2 items-center capitalize">
              {/* <li>
                <Link
                  to="#"
                  className={`px-3 py-2 rounded border border-gray-300 ${
                    pathname.includes("users") && "bg-gray-300"
                  }`}
                >
                  Users
                </Link>
              </li> */}
              <li>
                <form method="post" action="/logout">
                  <button className="px-3 py-2 rounded border border-gray-300 me-4">
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
