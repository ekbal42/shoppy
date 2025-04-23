import { LoaderFunction, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { prisma } from "../db.server";
import { getUserFromSession } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = getUserFromSession(request);
  if (user) {
    return redirect(`/shop/dashboard`);
  }
  return {};
};

export const action = async ({ request }: { request: Request }) => {
  const formData = new URLSearchParams(await request.text());
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const phone = formData.get("phone");

  if (!name || !email || !password || !phone) {
    return { error: "All fields are required." };
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { phone }],
    },
  });

  if (existingUser) {
    if (existingUser.email === email) {
      return { error: "User already exists with this email." };
    }
    if (existingUser.phone === phone) {
      return { error: "User already exists with this phone number." };
    }
  }

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password,
        phone,
      },
    });

    return redirect("/auth/signin");
  } catch (error) {
    console.error(error);
    return {
      error: "Something went wrong while creating the user.",
    };
  }
};

export default function Signup() {
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full md:w-96 mx-auto p-4 md:p-8 rounded bg-gray-100 border">
        <h1 className="text-start text-green-500 mb-4 text-2xl font-extrabold">
          Shoppy Sign Up~
        </h1>
        <div className="flex flex-col gap-4">
          <h1 className="capitalize text-lg">Create a new account 🔑</h1>

          <Form method="post" className="flex flex-col gap-4">
            {actionData?.error && (
              <div className="text-red-500 text-sm bg-red-100 p-3">
                {actionData.error}
              </div>
            )}

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              required
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              required
            />

            <button
              className="bg-green-500 text-white py-2 rounded"
              disabled={navigation?.state === "submitting"}
            >
              {navigation?.state === "submitting" ? "Signing Up..." : "Sign Up"}
            </button>
          </Form>

          <Link to="/auth/signin">
            <p className="text-sm text-center hover:text-green-500 hover:underline">
              Already have an account? Sign In!
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
