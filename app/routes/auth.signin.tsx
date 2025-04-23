import { LoaderFunction, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { prisma } from "../db.server";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import { getUserFromSession } from "~/session.server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRATION = "1h";

export const loader: LoaderFunction = async ({ request }) => {
  const user = getUserFromSession(request);
  if (user) {
    return redirect(`/shop/dashboard`);
  }
  return {};
};

export const action = async ({ request }: { request: Request }) => {
  const formData = new URLSearchParams(await request.text());
  const emailOrPhone = formData.get("emailOrPhone");
  const password = formData.get("password");

  if (!emailOrPhone || !password) {
    return { error: "Email/Phone and password are required." };
  }

  const isEmail = emailOrPhone.includes("@");

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: isEmail ? emailOrPhone : undefined },
        { phone: !isEmail ? emailOrPhone : undefined },
      ],
    },
  });

  if (!user) {
    return { error: "No user found with this email or phone." };
  }

  if (user.password !== password) {
    return { error: "Incorrect password." };
  }

  const token = jwt.sign(
    { name: user.name, userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION }
  );

  const cookie = serialize("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 3600,
    path: "/",
    sameSite: "strict",
  });

  return redirect(`/shop/dashboard`, {
    headers: {
      "Set-Cookie": cookie,
    },
  });
};

export default function Signin() {
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full md:w-96 mx-auto p-4 md:p-8 rounded bg-gray-100 border">
        <h1 className="text-start text-green-500 mb-4 text-2xl font-extrabold">
          Shoppy Sign In~
        </h1>
        <div className="flex flex-col gap-4">
          <h1 className="capitalize text-lg">Sign In to your account 🔑</h1>
          <Form method="post" className="flex flex-col gap-4">
            {actionData?.error && (
              <div className="text-red-500 text-sm bg-red-100 p-3">
                {actionData.error}
              </div>
            )}
            <input
              type="text"
              name="emailOrPhone"
              placeholder="Email/Phone"
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
              {navigation?.state === "submitting" ? "Signing In..." : "Sign In"}
            </button>
          </Form>
          <Link to="/auth/signup">
            <p className="text-sm text-center hover:text-green-500 hover:underline">
              Don't have an account? Create Account!
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
