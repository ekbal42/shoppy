import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Shoppy" },
    { name: "description", content: "Welcome to Shoppy!" },
  ];
};

export default function Index() {
  return (
    <div className="min-w-80 h-screen relative">
      <div className="absolute top-0 left-0 right-0 bg-yellow-400 text-black text-center py-2 font-bold z-10">
        🚧 UNDER CONSTRUCTION 🚧
      </div>
    </div>
  );
}
