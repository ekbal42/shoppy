import { Form } from "@remix-run/react";
import { useState } from "react";

export default function Astra({ shop, colorScheme = "#2563eb" }: any) {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  // Calculate total price
  const totalPrice = selectedProduct
    ? ((selectedProduct.price * quantity) / 100).toFixed(2)
    : "0.00";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with theme color */}
      <header
        className="bg-white shadow-sm"
        style={{ borderBottom: `2px solid ${colorScheme}` }}
      >
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: colorScheme }}>
              {shop.name}
            </h1>
            <p className="text-gray-600 mt-1">{shop.description}</p>
          </div>
          {shop.address && (
            <div className="hidden md:flex items-center text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{shop.address}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Featured Products */}
        <section className="mb-12">
          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {shop.products.map((product: any) => (
              <div
                key={product.id}
                className="bg-white flex flex-col rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
              >
                <div className="relative">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-60 object-cover bg-gray-100"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/400x400";
                    }}
                  />
                </div>
                <div className="p-4 flex-grow-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-1 capitalize">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold" style={{ color: colorScheme }}>
                      BDT {product.price}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setQuantity(1);
                        (
                          document.getElementById(
                            "order_modal"
                          ) as HTMLDialogElement
                        )?.showModal();
                      }}
                      className="px-3 cursor-pointer py-1 text-sm rounded-md border hover:text-white transition-colors"
                      style={{
                        borderColor: colorScheme,
                        color: colorScheme,
                        backgroundColor: `${colorScheme}10`,
                      }}
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section
          className="rounded-lg p-8 mb-12 text-center"
          style={{ backgroundColor: `${colorScheme}10` }}
        >
          <h2 className="text-2xl font-bold mb-4">
            Need Help With Your Order?
          </h2>
          <p className="mb-6 max-w-2xl mx-auto text-gray-700">
            Our customer service team is available 24/7 to assist you with any
            questions.
          </p>
          <button
            className="px-6 py-3 rounded-full font-medium"
            style={{
              backgroundColor: colorScheme,
              color: getContrastColor(colorScheme),
            }}
          >
            Contact Support
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="py-4 border-t border-gray-700 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} {shop.name}. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Order Modal */}
      <dialog id="order_modal" className="modal">
        <div
          className="modal-box max-w-3xl"
          style={{ borderTop: `4px solid ${colorScheme}` }}
        >
          <form method="dialog">
            <button className="btn btn-sm btn-circle absolute right-2 top-2">
              ✕
            </button>
          </form>

          {selectedProduct && (
            <div className="space-y-6">
              <h3 className="font-bold text-2xl" style={{ color: colorScheme }}>
                Order Details
              </h3>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="bg-gray-100 p-4 rounded-lg">
                    {selectedProduct.imageUrl ? (
                      <img
                        src={selectedProduct.imageUrl}
                        alt={selectedProduct.name}
                        className="w-full h-64 object-contain rounded"
                        onError={(e) => {
                          e.currentTarget.src = "https://placehold.co/400x400";
                        }}
                      />
                    ) : (
                      <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <h4 className="text-xl font-bold capitalize mb-2">
                    {selectedProduct.name}
                  </h4>
                  <p className="text-gray-600 mb-4">
                    {selectedProduct.description}
                  </p>

                  <div className="mb-6">
                    <span
                      className="text-2xl font-bold"
                      style={{ color: colorScheme }}
                    >
                      BDT {(selectedProduct.price / 100).toFixed(2)}
                    </span>
                  </div>

                  <Form method="post" className="space-y-4">
                    <input
                      type="hidden"
                      name="productId"
                      value={selectedProduct.id}
                    />

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Quantity</span>
                      </label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          className="px-3 py-1 border rounded-l"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          className="input input-bordered w-16 text-center rounded-none"
                          name="quantity"
                          min="1"
                          value={quantity}
                          onChange={(e) =>
                            setQuantity(
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          }
                        />
                        <button
                          type="button"
                          className="px-3 py-1 border rounded-r"
                          onClick={() => setQuantity(quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Customer Name</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        placeholder="Your name"
                        name="customerName"
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Phone Number</span>
                      </label>
                      <input
                        type="tel"
                        className="input input-bordered w-full"
                        placeholder="Your phone number"
                        name="customerPhone"
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Delivery Address</span>
                      </label>
                      <textarea
                        className="textarea textarea-bordered w-full"
                        placeholder="Your delivery address"
                        name="customerAddress"
                        rows={3}
                        required
                      />
                    </div>

                    <div className="pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-medium">Total:</span>
                        <span
                          className="text-xl font-bold"
                          style={{ color: colorScheme }}
                        >
                          BDT {totalPrice}
                        </span>
                      </div>
                      <button
                        type="submit"
                        className="btn w-full"
                        style={{
                          backgroundColor: colorScheme,
                          color: getContrastColor(colorScheme),
                        }}
                      >
                        Confirm Order
                      </button>
                    </div>
                  </Form>
                </div>
              </div>
            </div>
          )}
        </div>
      </dialog>
    </div>
  );
}

function getContrastColor(hexColor: string) {
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}
