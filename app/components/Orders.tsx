import dayjs from "dayjs";
import { useEffect, useState } from "react";

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedOrders = localStorage.getItem("orders");
      setOrders(storedOrders ? JSON.parse(storedOrders) : []);
    }
  }, []);

  if (!isVisible || orders.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 border border-gray-200 rounded-md">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body p-4">
          <div className="flex justify-between items-center">
            <h2 className="card-title">
              Recent Orders
              <div className="bg-gray-100 px-2 rounded-md border border-gray-200 text-sm ms-1">
                {orders.length}
              </div>
            </h2>
            <div className="flex gap-2">
              <button
                className="btn btn-sm btn-ghost px-2"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                )}
              </button>
              <button
                className="btn btn-sm btn-ghost px-2"
                onClick={() => setIsVisible(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {isExpanded && (
            <div className="mt-2">
              <div className="overflow-y-auto max-h-96 space-y-4">
                {orders.map((order: any, index: number) => (
                  <div
                    key={index}
                    className="collapse collapse-plus bg-base-200 shadow-inner"
                  >
                    <input type="checkbox" />
                    <div className="collapse-title text-sm font-medium">
                      ORDER #{order.orderId} • {order.shop} • {dayjs(order.date).format("DD/MM/YYYY - HH:mm:ss")}
                    </div>
                    <div className="collapse-content">
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="font-semibold me-1">Order ID:</span>
                          {order.orderId}
                        </p>
                        <p>
                          <span className="font-semibold me-1">Date:</span>
                          {dayjs(order.date).format("DD/MM/YYYY - HH:mm:ss")}
                        </p>
                        <p>
                          <span className="font-semibold me-1">Shop:</span>
                          {order.shop}
                        </p>
                        <p>
                          <span className="font-semibold">Tracking:</span>
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link link-primary font-mono ms-1"
                          >
                            Track This Order
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card-actions justify-end mt-4">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    localStorage.removeItem("orders");
                    setOrders([]);
                  }}
                >
                  Clear All Orders
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
