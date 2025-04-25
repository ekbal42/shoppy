import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";
import dayjs from "dayjs";
import OrderTimeline from "~/components/OrderTimeline";
import { Store } from "lucide-react";

export async function loader({ params }: LoaderFunctionArgs) {
  const { handle, orderId } = params;

  if (!handle || !orderId) {
    throw new Response("Not Found", { status: 404 });
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      shop: {
        handle: handle,
      },
    },
    include: {
      shop: {
        select: {
          name: true,
          phone: true,
          handle: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              name: true,
              price: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new Response("Not Found", { status: 404 });
  }

  return { order };
}

export default function TrackOrder() {
  const { order } = useLoaderData<typeof loader>();

  const statusBadgeClass =
    {
      completed: "badge-success",
      cancelled: "badge-error",
      pending: "badge-warning",
      processing: "badge-info",
    }[order.status] || "badge-neutral";

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
              <div>
                <h1 className="card-title text-2xl md:text-3xl">
                  Order #{order.id}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`badge ${statusBadgeClass} gap-2`}>
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                  <span className="text-sm text-base-content/70">
                    Placed on{" "}
                    {dayjs(order.createdAt).format("MMM D, YYYY [at] h:mm A")}
                  </span>
                </div>
              </div>
              <a
                href={`/${order.shop.handle}`}
                className="btn px-2"
                title={`Back to ${order.shop.name}`}
              >
                <Store size={20} />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-base-200 p-4 rounded-box">
                <h2 className="font-bold text-lg mb-3">Customer</h2>
                <div className="space-y-2">
                  <p>
                    <span className="font-semibold">Name:</span>{" "}
                    {order.customerName}
                  </p>
                  <p>
                    <span className="font-semibold">Phone:</span>{" "}
                    {order.customerPhone}
                  </p>
                  <p>
                    <span className="font-semibold">Address:</span>{" "}
                    {order.customerAddress}
                  </p>
                </div>
              </div>

              <div className="bg-base-200 p-4 rounded-box">
                <h2 className="font-bold text-lg mb-3">Shop</h2>
                <div className="space-y-2">
                  <p>
                    <span className="font-semibold">Name:</span>{" "}
                    {order.shop.name}
                  </p>
                  <p>
                    <span className="font-semibold">Contact:</span>{" "}
                    {order.shop.phone}
                  </p>
                </div>
              </div>

              <div className="bg-base-200 p-4 rounded-box">
                <h2 className="font-bold text-lg mb-3">Order Summary</h2>
                <div className="space-y-2">
                  <p>
                    <span className="font-semibold">Items:</span> {totalItems}
                  </p>
                  <p>
                    <span className="font-semibold">Subtotal:</span> BDT
                    {order.total}
                  </p>
                  <p>
                    <span className="font-semibold">Order Date:</span>{" "}
                    {dayjs(order.createdAt).format("MMM D, YYYY")}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="font-bold text-xl mb-4">Order Items</h2>
              <div className="overflow-x-auto">
                <table className="table table-zebra border-2 border-gray-100">
                  <thead>
                    <tr className="bg-gray-100">
                      <th>Product</th>
                      <th className="text-right">Price</th>
                      <th className="text-right">Qty</th>
                      <th className="text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.product.name}</td>
                        <td className="text-right">
                          BDT{item.price.toFixed(2)}
                        </td>
                        <td className="text-right">{item.quantity}</td>
                        <td className="text-right">
                          BDT{(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th colSpan={3} className="text-right">
                        Total
                      </th>
                      <th className="text-right">
                        BDT{order.total.toFixed(2)}
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div>
              <h2 className="font-bold text-xl mb-4">Order Timeline</h2>
              <OrderTimeline order={order} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
