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
      <div className="card bg-base-100 shadow-md w-full max-w-md mx-auto p-4 md:p-8">
        <h2 className="card-title text-2xl mb-1">Login to Shoppy</h2>
        <p>Manage your shop and products with ease.</p>
        <div className="flex flex-col gap-4 mt-4">
          <Form method="post" className="flex flex-col gap-4">
            {actionData?.error && (
              <div role="alert" className="alert alert-error alert-soft">
                <span>{actionData.error}</span>
              </div>
            )}
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Email or Phone</legend>
              <input
                type="text"
                className="input w-full"
                placeholder="Type here"
                name="emailOrPhone"
                required
              />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Shop Password</legend>
              <input
                type="password"
                className="input w-full"
                placeholder="Type here"
                name="password"
                required
              />
            </fieldset>
            <button
              className="btn btn-neutral w-full"
              disabled={navigation?.state === "submitting"}
            >
              {navigation?.state === "submitting" ? "Signing In..." : "Sign In"}
            </button>
          </Form>
          <Link to="/auth/signup">
            <p className="text-sm text-center hover:text-neutral hover:underline">
              Dont have an account? Create Account!
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
