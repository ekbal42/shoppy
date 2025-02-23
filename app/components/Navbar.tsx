import { Link } from "@remix-run/react";

export default function Navbar() {
  return (
    <>
      <nav className="bg-green-500 p-4">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-start justify-start">
          <Link to="/" className="text-2xl text-white font-extrabold uppercase">
            Jobify
          </Link>
        </div>
      </nav>
    </>
  );
}
