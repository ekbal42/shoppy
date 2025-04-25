import { LoaderFunction, ActionFunction, redirect } from "@remix-run/node";
import { getUserFromSession } from "~/session.server";
import { useLoaderData, Link, Form } from "@remix-run/react";
import { prisma } from "~/db.server";
import { useState } from "react";
import { FileSymlink, Search, ArrowLeft } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { orderStatus } from "~/types";

dayjs.extend(relativeTime);

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUserFromSession(request);
  if (!user) return redirect("/login");

  const url = new URL(request.url);
  const shopId = url.searchParams.get("shopId");
  const page = parseInt(url.searchParams.get("page") || "1");
  const perPage = 10;
  const orderId = url.searchParams.get("orderId");

  const shops = await prisma.shop.findMany({
    where: { ownerId: user.userId },
    select: { id: true, name: true, handle: true },
  });

  if (!shops.length) {
    return {
      shops: [],
      orders: [],
      currentShop: null,
      pagination: null,
      orderDetails: null,
    };
  }

  const currentShopId = shopId || shops[0].id;
  const currentShop =
    shops.find((shop) => shop.id === currentShopId) || shops[0];

  if (orderId) {
    const orderDetails = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (orderDetails?.shopId !== currentShop.id) {
      return redirect(`/shop/orders?shopId=${currentShop.id}`);
    }

    return {
      shops,
      orders: [],
      currentShop,
      pagination: null,
      orderDetails,
    };
  }

  const orderCount = await prisma.order.count({
    where: { shopId: currentShop.id },
  });

  const orders = await prisma.order.findMany({
    where: { shopId: currentShop.id },
    skip: (page - 1) * perPage,
    take: perPage,
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return {
    shops,
    orders,
    currentShop,
    pagination: {
      page,
      perPage,
      totalItems: orderCount,
      totalPages: Math.ceil(orderCount / perPage),
    },
    orderDetails: null,
  };
};

export const action: ActionFunction = async ({ request }) => {
  const user = await getUserFromSession(request);
  if (!user) return redirect("/login");

  const formData = await request.formData();
  const intent = formData.get("intent");
  const orderId = formData.get("orderId") as string;
  const status = formData.get("status") as string;

  if (intent === "update-status") {
    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
    return redirect(request.url);
  }

  return null;
};

export default function Orders() {
  const { shops, orders, currentShop, pagination, orderDetails } =
    useLoaderData<typeof loader>();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  if (!shops.length) {
    return (
      <div className="p-8">
        <div className="alert alert-warning">
          You dont have any shops yet. Please create a shop first.
        </div>
      </div>
    );
  }

  if (orderDetails) {
    return (
      <div className="container mx-auto">
        <div className="mb-4">
          <Link
            to={`/shop/orders?shopId=${currentShop.id}`}
            className="btn btn-ghost"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
          </Link>
        </div>

        <div className="card rounded-none bg-base-100 shadow">
          <div className="card card-body">
            <h2 className="card rounded-none-title">Order Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8  border-2 border-gray-100 p-4">
              <div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Order ID</p>
                    <p className="text-end">{orderDetails.id}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Order Date</p>
                    <p className="text-end">
                      {dayjs(orderDetails.createdAt).format("DD/MM/YYYY")}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Current Status</p>
                    <p className="text-end">
                      <span
                        className={`badge ms-2 ${
                          orderDetails.status === "pending"
                            ? "badge-warning"
                            : orderDetails.status === "completed"
                            ? "badge-success"
                            : orderDetails.status === "cancelled"
                            ? "badge-error"
                            : "badge-info"
                        }`}
                      >
                        {orderDetails.status}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Total Price</p>
                    <p className="text-end">{orderDetails.total}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">C. Name</p>
                    <p className="text-end uppercase font-semibold">
                      {orderDetails.customerName}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">C. Phone</p>
                    <p className="text-end">{orderDetails.customerPhone}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">C. Address</p>
                    <p className="text-end">{orderDetails.customerAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <h3 className="card rounded-none-title mb-4">Order Items</h3>
              <table className="table table-zebra px-0 border-2 border-gray-100 w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {orderDetails.items.map((item: any) => (
                    <tr key={item.id}>
                      <td>
                        <div className="flex items-center space-x-3">
                          {item.product.imageUrl && (
                            <div className="avatar">
                              <div className="mask mask-squircle w-12 h-12">
                                <img
                                  src={item.product.imageUrl}
                                  alt={item.product.name}
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      "https://placehold.co/400x400";
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          <div>
                            <div className="font-bold uppercase">
                              {item.product.name}
                            </div>
                            <p>
                              On{" "}
                              {dayjs(orderDetails.createdAt).format(
                                "DD/MM/YYYY"
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>BDT {item.price}</td>
                      <td>{item.quantity} Item(s)</td>
                      <td>BDT {item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6">
              <Form method="post">
                <input type="hidden" name="orderId" value={orderDetails.id} />
                <input type="hidden" name="intent" value="update-status" />
                <div className="flex items-center gap-4">
                  <span className="font-semibold">Update Status:</span>
                  <select
                    name="status"
                    className="select select-bordered"
                    defaultValue={orderDetails.status}
                  >
                    {Object.values(orderStatus).map((status: any) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="btn btn-neutral">
                    Update
                  </button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter((order: any) => {
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery) ||
      order.id.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-64 hidden">
          <div className="card rounded-none bg-base-100 shadow">
            <div className="card rounded-none-body p-4">
              <h2 className="card rounded-none-title ms-2">Shops</h2>
              <ul className="menu w-full space-y-2">
                {shops.map((shop: any) => (
                  <li key={shop.id}>
                    <Link
                      to={`/shop/orders?shopId=${shop.id}`}
                      className={`menu-item w-full ${
                        currentShop.id === shop.id ? "menu-active" : ""
                      }`}
                    >
                      {shop.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">
              Orders for {currentShop.name}
            </h1>
          </div>

          <div className="card rounded-none bg-base-100 shadow-sm mb-4">
            <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
              <label className="input">
                <Search className="h-4 w-4 text-nuetral" />
                <input
                  type="search"
                  className="grow"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <kbd className="kbd kbd-sm">⌘</kbd>
                <kbd className="kbd kbd-sm">K</kbd>
              </label>
              <div className="flex gap-2 w-full md:w-auto">
                <select
                  className="select select-bordered w-full"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  {Object.values(orderStatus).map((status: any) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card rounded-none bg-base-100 shadow-sm">
            {filteredOrders.length === 0 ? (
              <div className="text-center">
                <div role="alert" className="alert">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-info h-6 w-6 shrink-0"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <span>
                    No orders found for:
                    <span className="font-semibold ms-1 font-mono">
                      {searchQuery}
                    </span>
                    .
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="table table-zebra px-0 border border-gray-100 w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Ordered</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order: any) => (
                        <tr key={order.id}>
                          <td>
                            <div className="font-mono text-sm">
                              {order.id.slice(0, 8)}...
                            </div>
                          </td>
                          <td>
                            <div>
                              <div className="font-bold uppercase">
                                {order.customerName}
                              </div>
                              <div className="text-sm opacity-50 uppercase">
                                {order.customerPhone}
                              </div>
                            </div>
                          </td>
                          <td>{dayjs(order.createdAt).fromNow()}</td>
                          <td>BDT {order.total / 100}</td>
                          <td>
                            <span
                              className={`badge uppercase ${
                                order.status === "pending"
                                  ? "badge-warning"
                                  : order.status === "completed"
                                  ? "badge-success"
                                  : order.status === "cancelled"
                                  ? "badge-error"
                                  : "badge-info"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <Link
                              to={`/shop/orders?shopId=${currentShop.id}&orderId=${order.id}`}
                              className="btn btn-xs"
                            >
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {pagination.totalPages > 1 && (
                  <div className="flex justify-between items-center p-4">
                    <div className="text-sm opacity-50 flex items-center gap-2">
                      <FileSymlink /> Page {pagination.page} of{" "}
                      {pagination.totalPages} | Total {pagination.totalItems}{" "}
                      orders
                    </div>
                    <div className="join">
                      {Array.from(
                        { length: pagination.totalPages },
                        (_, i) => i + 1
                      ).map((pageNum) => (
                        <Link
                          key={pageNum}
                          to={`/shop/orders?shopId=${currentShop.id}&page=${pageNum}`}
                          className={`join-item btn ${
                            pagination.page === pageNum ? "btn-active" : ""
                          }`}
                        >
                          {pageNum}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
