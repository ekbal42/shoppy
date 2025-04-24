import "./index.css";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useActionData,
  useFetchers,
  useMatches,
  useRouteError,
} from "@remix-run/react";
import { Notification } from "./components/Notification";
import { useEffect, useState } from "react";
import { ActionData, LoaderData, Toast } from "./types";
export function Layout({ children }: { children: React.ReactNode }) {
  //-----------------------------------------------------------------
  const matches = useMatches();
  const actionData = useActionData<ActionData>();
  const fetchers = useFetchers();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const generateToastId = () => Math.random().toString(36).substring(2, 9);

  const loaderToasts = matches
    .map((match) => (match.data as LoaderData)?.toast)
    .filter(Boolean) as Toast[];

  useEffect(() => {
    if (loaderToasts.length > 0) {
      setToasts((prev) => {
        const newToasts = loaderToasts.filter(
          (toast) => !prev.some((t) => t.message === toast.message)
        );
        return [
          ...prev,
          ...newToasts.map((toast) => ({ ...toast, id: generateToastId() })),
        ];
      });
    }
  }, [loaderToasts]);

  useEffect(() => {
    if (actionData?.toast) {
      setToasts((prev: any) => {
        const toastExists = prev.some(
          (t: any) => t.message === actionData.toast?.message
        );
        if (!toastExists) {
          return [...prev, { ...actionData.toast, id: generateToastId() }];
        }
        return prev;
      });
    }
  }, [actionData]);

  useEffect(() => {
    fetchers.forEach((fetcher) => {
      const toast = (fetcher.data as ActionData)?.toast;
      if (toast) {
        setToasts((prev) => {
          const toastExists = prev.some((t) => t.message === toast.message);
          if (!toastExists) {
            return [...prev, { ...toast, id: generateToastId() }];
          }
          return prev;
        });
      }
    });
  }, [fetchers]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };
  //-----------------------------------------------------------------
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        {toasts.map((toast) => (
          <Notification
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <Outlet />
      <Orders />
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError() as any;
  return (
    <div className="flex items-center gap-2 justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800">{error.status}</h1>
      <p>{error.data} ~</p>
    </div>
  );
}

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedOrders = localStorage.getItem("orders");
      setOrders(storedOrders ? JSON.parse(storedOrders) : []);
    }
  }, []);
  return (
    <>
      {orders.length > 0 && (
        <div className="fixed bottom-0 right-0 p-4">
          <div className="bg-white shadow-lg rounded-lg p-4 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-2">Recent Orders</h2>
            <ul className="list-disc pl-5">
              {orders.map((order: any, index: number) => (
                <li key={index} className="mb-3">
                  Order ID: {order.orderId}
                  <br />
                  OrderDate : {order.date}
                  <br />
                  Shop : {order.shop}
                  <br />
                  Tracking UrL :
                  <a
                    className="underline text-blue-500 ms-1"
                    href={order.trackingUrl}
                  >
                    Track This Order
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};
