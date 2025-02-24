import { json, LoaderFunction, redirect } from "@remix-run/node";
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
    return redirect(`/${user?.role}/dashboard`);
  }
  return {};
};
export const action = async ({ request }: { request: Request }) => {
  const formData = new URLSearchParams(await request.text());
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return json({ error: "Email and password are required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return json({ error: "No user found with this email." }, { status: 400 });
  }

  if (user.password !== password) {
    return json({ error: "Incorrect password." }, { status: 400 });
  }

  const token = jwt.sign(
    { name: user.name, userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRATION,
    }
  );

  const cookie = serialize("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 3600,
    path: "/",
    sameSite: "strict",
  });

  return redirect(`/${user.role}/dashboard`, {
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
      <div className="w-full md:w-96 mx-auto p-4 md:p-8 rounded">
        <h1 className="text-start text-green-500 mb-4 text-2xl font-extrabold">
          Jobify Sign In~
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
              type="email"
              name="email"
              placeholder="Email"
              className="py-2 px-3 border"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="py-2 px-3 border"
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
              Dont have an account? Create Account!
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
