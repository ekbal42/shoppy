import { LoaderFunction, ActionFunction, redirect } from "@remix-run/node";
import { getUserFromSession } from "~/session.server";
import { useLoaderData, Form, useNavigation } from "@remix-run/react";
import { prisma } from "~/db.server";
import { useState, useEffect } from "react";
import { CirclePlusIcon, FileSymlink, Pencil, Trash2 } from "lucide-react";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUserFromSession(request);
  if (!user) return redirect("/login");

  const url = new URL(request.url);
  const shopId = url.searchParams.get("shopId");
  const page = parseInt(url.searchParams.get("page") || "1");
  const perPage = 3;

  const shops = await prisma.shop.findMany({
    where: { ownerId: user.userId },
    select: { id: true, name: true, handle: true },
  });

  if (!shops.length) {
    return { shops: [], products: [], currentShop: null, pagination: null };
  }

  const currentShopId = shopId || shops[0].id;
  const currentShop =
    shops.find((shop) => shop.id === currentShopId) || shops[0];

  const productCount = await prisma.product.count({
    where: { shopId: currentShop.id },
  });

  const products = await prisma.product.findMany({
    where: { shopId: currentShop.id },
    skip: (page - 1) * perPage,
    take: perPage,
    orderBy: { createdAt: "desc" },
  });

  return {
    shops,
    products,
    currentShop,
    pagination: {
      page,
      perPage,
      totalItems: productCount,
      totalPages: Math.ceil(productCount / perPage),
    },
  };
};

export const action: ActionFunction = async ({ request }) => {
  const user = await getUserFromSession(request);
  if (!user) return redirect("/login");

  const formData = await request.formData();
  const intent = formData.get("intent");
  const shopId = formData.get("shopId") as string;
  const productId = formData.get("productId") as string;

  const shop = await prisma.shop.findFirst({
    where: { id: shopId, ownerId: user.userId },
  });

  if (!shop) {
    return { error: "Invalid shop" };
  }

  if (intent === "delete") {
    await prisma.product.delete({
      where: { id: productId },
    });
    return redirect(`/shop/products?shopId=${shopId}`);
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseInt(formData.get("price") as string);
  const imageUrl = formData.get("imageUrl") as string;

  if (intent === "create") {
    await prisma.product.create({
      data: {
        name,
        description,
        price,
        imageUrl,
        shopId,
      },
    });
  } else if (intent === "update") {
    await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        price,
        imageUrl,
      },
    });
  }

  return redirect(`/shop/products?shopId=${shopId}`);
};

export default function Products() {
  const { shops, products, currentShop, pagination } =
    useLoaderData<typeof loader>();
  const transition = useNavigation();
  const [price, setPrice] = useState("");
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);

  useEffect(() => {
    if (editingProduct) {
      setModalOpen(true);
    }
  }, [editingProduct]);

  if (!shops.length) {
    return (
      <div className="p-8">
        <div className="alert alert-warning">
          You don't have any shops yet. Please create a shop first.
        </div>
      </div>
    );
  }

  const handleEditClick = (product: any) => {
    setEditingProduct(product);
    setPrice(product.price.toString());
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
    setPrice("");
  };

  const handleDeleteClick = (product: any) => {
    setProductToDelete(product);
    // @ts-ignore - DaisyUI modal method
    document.getElementById("delete_modal").showModal();
  };

  return (
    <div>
      <dialog
        id="product_modal"
        className={`modal ${modalOpen ? "modal-open" : ""}`}
      >
        <div className="modal-box w-11/12 max-w-3xl">
          <h3 className="font-bold text-lg">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </h3>
          <Form method="post">
            <input type="hidden" name="shopId" value={currentShop.id} />
            <input
              type="hidden"
              name="intent"
              value={editingProduct ? "update" : "create"}
            />
            {editingProduct && (
              <input type="hidden" name="productId" value={editingProduct.id} />
            )}

            <div className="space-y-4 py-4">
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Product Name</legend>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Type here"
                  name="name"
                  required
                  defaultValue={editingProduct?.name || ""}
                />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Description</legend>
                <textarea
                  className="textarea w-full"
                  placeholder="Type here"
                  name="description"
                  required
                  rows={3}
                  defaultValue={editingProduct?.description || ""}
                />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Price</legend>
                <input
                  className="input w-full"
                  placeholder="Type here"
                  required
                  type="number"
                  name="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                />
              </fieldset>
              <fieldset className="fieldset">
                <legend className="fieldset-legend">Image URL</legend>
                <input
                  className="input w-full"
                  placeholder="Type here"
                  required
                  type="url"
                  name="imageUrl"
                  defaultValue={editingProduct?.imageUrl || ""}
                />
              </fieldset>
            </div>

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-neutral"
                disabled={transition.state === "submitting"}
                onClick={() => setModalOpen(false)}
              >
                {transition.state === "submitting"
                  ? "Saving..."
                  : editingProduct
                  ? "Update Product"
                  : "Add Product"}
              </button>
            </div>
          </Form>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button onClick={handleCloseModal}>close</button>
        </form>
      </dialog>

      <dialog id="delete_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Confirm Delete</h3>
          <p className="py-4">
            Are you sure you want to delete "{productToDelete?.name}"? This
            action cannot be undone.
          </p>
          <div className="modal-action">
            <Form method="post">
              <input type="hidden" name="shopId" value={currentShop.id} />
              <input
                type="hidden"
                name="productId"
                value={productToDelete?.id}
              />
              <input type="hidden" name="intent" value="delete" />
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  // @ts-ignore - DaisyUI modal method
                  document.getElementById("delete_modal").close();
                  setProductToDelete(null);
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-error">
                Delete
              </button>
            </Form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-64 hidden">
          <div className="card bg-base-100 shadow">
            <div className="card-body p-4">
              <h2 className="card-title ms-2">Shops</h2>
              <ul className="menu w-full space-y-2">
                {shops.map((shop: any) => (
                  <li key={shop.id}>
                    <a
                      href={`/shop/products?shopId=${shop.id}`}
                      className={`menu-item w-full ${
                        currentShop.id === shop.id ? "menu-active" : ""
                      }`}
                    >
                      {shop.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">
              Products in {currentShop.name}
              <div className="badge badge-soft badge-primary ms-2">
                {pagination.totalItems}
              </div>
            </h1>
            <button
              onClick={() => setModalOpen(true)}
              className="btn btn-neutral"
            >
              <CirclePlusIcon className="w-4 h-4 mr-1" /> New Product
            </button>
          </div>

          <div className="bg-base-100 shadow">
            <div>
              {products.length === 0 ? (
                <div className="alert alert-info">
                  No products found in this shop. Add your first product!
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra px-0 border border-gray-100 w-full">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Price</th>
                          <th>Added On</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product: any) => (
                          <tr key={product.id}>
                            <td className="w-[70%]">
                              <div className="flex items-center space-x-3">
                                {product.imageUrl && (
                                  <div className="avatar">
                                    <div className="mask mask-squircle w-12 h-12">
                                      <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        onError={(e) => {
                                          e.currentTarget.src =
                                            "https://placehold.co/400x400";
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}
                                <div>
                                  <div className="font-bold capitalize">
                                    {product.name}
                                  </div>
                                  {product.description && (
                                    <div className="text-sm opacity-50 line-clamp-1">
                                      {product.description.slice(0, 50)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>BDT {product.price / 100}</td>
                            <td>
                              {new Date(product.createdAt).toLocaleDateString()}
                            </td>
                            <td>
                              <div className="flex gap-1">
                                <button
                                  className="btn btn-ghost btn-xs"
                                  onClick={() => handleEditClick(product)}
                                  title="Edit"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  className="btn btn-ghost btn-xs text-error"
                                  onClick={() => handleDeleteClick(product)}
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
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
                        products
                      </div>
                      <div className="join">
                        {Array.from(
                          { length: pagination.totalPages },
                          (_, i) => i + 1
                        ).map((pageNum) => (
                          <a
                            key={pageNum}
                            href={`/shop/products?shopId=${currentShop.id}&page=${pageNum}`}
                            className={`join-item btn ${
                              pagination.page === pageNum ? "btn-active" : ""
                            }`}
                          >
                            {pageNum}
                          </a>
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
    </div>
  );
}
