import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { ExternalLink, Copy, Check } from "lucide-react";
import { useEffect, useState } from "react";

export async function loader({ params }: LoaderFunctionArgs) {
  const { handle } = params;
  return { handle };
}

export default function Thanks() {
  const { handle } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [copied, setCopied] = useState(false);
  const fullUrl = "http://localhost:5173";
  const trackingUrl = `${fullUrl}/${handle}/track/${orderId}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const existingOrder = orders.find(
      (order: any) => order.orderId === orderId
    );
    if (!existingOrder) {
      orders.push({
        date: new Date().toISOString(),
        orderId: orderId,
        trackingUrl: trackingUrl,
        shop: handle,
      });
      localStorage.setItem("orders", JSON.stringify(orders));
    }
  }, []);

  if (!orderId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center p-4">
        <h1 className="text-2xl font-semibold text-red-600">
          Order ID is missing in the URL
        </h1>
        <p className="text-gray-600 mt-2">
          Please check your confirmation link.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-100 to-white p-6 text-center">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">
        🎉 Thanks for your order!
      </h1>
      <p className="text-lg text-gray-600 mb-4">
        Here's your order tracking link. Please copy and save it for future use.
      </p>

      <div className="flex items-center bg-white border border-gray-300 rounded-md px-4 py-2 shadow-sm w-full max-w-md justify-between mb-3">
        <span className="text-sm text-gray-700 truncate">{trackingUrl}</span>
        <button
          onClick={handleCopy}
          className="text-blue-500 hover:text-blue-700 transition-colors ml-2"
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="w-5 h-5" />
          ) : (
            <Copy className="w-5 h-5" />
          )}
        </button>
      </div>

      <Link
        to={trackingUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors mb-4"
      >
        Track Now <ExternalLink className="w-4 h-4" />
      </Link>
    </div>
  );
}
