import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, redirect } from "@remix-run/react";
import { prisma } from "~/db.server";
import Renderer from "~/templates/Renderer";

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

  return { shop };
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
    return { error: "Missing required fields" };
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { price: true, shopId: true, name: true },
    });

    if (!product) {
      return { error: "Product not found" };
    }

    const order = await prisma.order.create({
      data: {
        shopId: product.shopId,
        total: product.price * quantity,
        status: "pending",
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
    return { error: "Failed to create order" };
  }
}

export default function ShopPage() {
  const { shop } = useLoaderData<typeof loader>();
  const colorScheme = "indigo";

  return (
    <Renderer templateId={"astra"} shop={shop} colorScheme={colorScheme} />
  );
}
