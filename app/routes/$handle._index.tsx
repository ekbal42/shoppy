import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, json, redirect, Form } from "@remix-run/react";
import { prisma } from "~/db.server";
import { useState } from "react";

export async function loader({ params }: LoaderFunctionArgs) {
  const { handle } = params;

  const shop = await prisma.shop.findUnique({
    where: { handle },
    include: {
      products: true,
    },
  });

  if (!shop) {
    throw new Response("Shop not found", { status: 404 });
  }

  return json({ shop });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { handle } = params;
  const formData = await request.formData();

  const customerName = formData.get("customerName") as string;
  const customerPhone = formData.get("customerPhone") as string;
  const customerAddress = formData.get("customerAddress") as string;
  const productId = formData.get("productId") as string;
  const quantity = parseInt(formData.get("quantity") as string);

  if (!customerName || !customerPhone || !productId || isNaN(quantity)) {
    return json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { price: true, shopId: true, name: true },
    });

    if (!product) {
      return json({ error: "Product not found" }, { status: 404 });
    }

    const order = await prisma.order.create({
      data: {
        shopId: product.shopId,
        total: product.price * quantity,
        status: "PENDING",
        items: {
          create: {
            productId,
            quantity,
            price: product.price,
          },
        },
        customerName,
        customerPhone,
        customerAddress,
      },
    });

    return redirect(`/${handle}/thanks?orderId=${order.id}`);
  } catch (error) {
    console.error("Order creation failed:", error);
    return json({ error: "Failed to create order" }, { status: 500 });
  }
}

export default function ShopPage() {
  const { shop } = useLoaderData<typeof loader>();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{shop.name}</h1>
        <p className="text-lg opacity-80 mb-4">{shop.description}</p>
        {shop.address && (
          <div className="badge badge-lg badge-outline">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 mr-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
            {shop.address}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {shop.products.map((product: any) => (
          <div
            key={product.id}
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
          >
            <figure className="px-4 pt-4">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="rounded-xl h-48 w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/400x400";
                  }}
                />
              ) : (
                <div className="rounded-xl bg-gray-200 h-48 w-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-12 h-12 text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </div>
              )}
            </figure>
            <div className="card-body">
              <h2 className="card-title capitalize">{product.name}</h2>
              <p>{product.description}</p>
              <div className="card-actions justify-between items-center mt-4">
                <span className="text-2xl font-bold">
                  ${(product.price / 100).toFixed(2)}
                </span>
                <button
                  onClick={() => {
                    setSelectedProduct(product);
                    (
                      document.getElementById(
                        "order_modal"
                      ) as HTMLDialogElement
                    )?.showModal();
                  }}
                  className="btn btn-primary"
                >
                  Order Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <dialog id="order_modal" className="modal">
        <div className="modal-box w-11/12 max-w-3xl">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>

          {selectedProduct && (
            <div className="space-y-6">
              <h3 className="font-bold text-2xl">Order Details</h3>

              <fieldset className="fieldset border-2 border-base-200 rounded-lg">
                <legend className="fieldset-legend">Product Information</legend>
                <div className="flex items-start gap-4 bg-gray-100 p-3 rounded-md">
                  {selectedProduct.imageUrl && (
                    <img
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.name}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/400x400";
                      }}
                    />
                  )}
                  <div>
                    <h4 className="font-bold text-lg capitalize">
                      {selectedProduct.name}
                    </h4>
                    <p className="text-lg font-bold text-primary">
                      BDT {(selectedProduct.price / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              </fieldset>

              <Form method="post" className="space-y-4">
                <input
                  type="hidden"
                  name="productId"
                  value={selectedProduct.id}
                />

                <div className="space-y-4">
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Customer Name</legend>
                    <input
                      type="text"
                      className="input w-full"
                      placeholder="My awesome page"
                      name="customerName"
                      required
                    />
                  </fieldset>
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Phone Number</legend>
                    <input
                      type="tel"
                      className="input w-full"
                      placeholder="My awesome page"
                      name="customerPhone"
                      required
                    />
                  </fieldset>
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">
                      Delivery Address
                    </legend>
                    <textarea
                      className="textarea w-full"
                      placeholder="My awesome page"
                      name="customerAddress"
                      rows={3}
                      required
                    />
                  </fieldset>
                  <fieldset className="fieldset">
                    <legend className="fieldset-legend">Quantity</legend>
                    <input
                      type="number"
                      className="input w-full"
                      placeholder="My awesome page"
                      name="quantity"
                      min="1"
                      defaultValue="1"
                      required
                    />
                  </fieldset>
                </div>

                <div className="modal-action">
                  <button className="btn btn-primary w-full">
                    Confirm Order
                  </button>
                </div>
              </Form>
            </div>
          )}
        </div>
      </dialog>
    </div>
  );
}
