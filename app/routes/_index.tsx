import type { MetaFunction } from "@remix-run/node";
import Navbar from "~/components/Navbar";

export const meta: MetaFunction = () => {
  return [
    { title: "Shoppy" },
    { name: "description", content: "Welcome to Shoppy!" },
  ];
};

export default function Index() {
  return (
    <div className="min-w-80">
      <Navbar />
    </div>
  );
}
