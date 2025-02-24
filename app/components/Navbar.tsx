import { Link } from "@remix-run/react";
export default function Navbar() {
  return (
    <>
      <nav className="bg-green-500 p-4 sticky top-0">
        <div className="max-w-6xl mx-auto flex items-start justify-between">
          <Link to="/" className="text-2xl text-white font-extrabold uppercase">
            Jobify
          </Link>
        </div>
      </nav>
    </>
  );
}
