import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Order Details</h1>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Shop Information</h2>
          <p>
            <span className="font-medium">Shop Name:</span> {order.shop.name}
          </p>
          <p>
            <span className="font-medium">Contact:</span> {order.shop.phone}
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Order Information</h2>
          <p>
            <span className="font-medium">Order ID:</span> {order.id}
          </p>
          <p>
            <span className="font-medium">Status:</span>
            <span
              className={`ml-2 px-2 py-1 rounded text-sm ${
                order.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : order.status === "cancelled"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {order.status}
            </span>
          </p>
          <p>
            <span className="font-medium">Order Date:</span>
            {new Date(order.createdAt).toLocaleString()}
          </p>
          <p>
            <span className="font-medium">Total Amount:</span> BDT{order.total}
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Customer Details</h2>
          <p>
            <span className="font-medium">Name:</span> {order.customerName}
          </p>
          <p>
            <span className="font-medium">Phone:</span> {order.customerPhone}
          </p>
          <p>
            <span className="font-medium">Address:</span>
            {order.customerAddress}
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Order Items</h2>
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      BDT{item.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      BDT{item.price * item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
