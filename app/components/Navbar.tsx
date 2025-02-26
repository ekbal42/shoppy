import { Link } from "@remix-run/react";
import { User } from "lucide-react";
export default function Navbar() {
  return (
    <>
      <nav className="bg-green-500 p-4 sticky top-0">
        <div className="max-w-6xl mx-auto flex items-start justify-between">
          <Link to="/" className="text-2xl text-white font-extrabold uppercase">
            Jobify
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-white hover:font-semibold text-nowrap">
              Job Board
            </Link>
            <Link to="/auth/signin">
              <button className="border-2 rounded-full size-8 flex items-center justify-center">
                <User className="text-white" />
              </button>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
