import { Outlet } from "@remix-run/react";
import Navbar from "~/components/Navbar";

export default function Job() {
  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-sidebar">
          <div className="col-span-1 lg:col-span-2">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}
