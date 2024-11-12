import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import { prisma } from "../db.server";

export let action = async ({ request }: { request: Request }) => {
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
  return redirect("/tutor/dashboard");
};

export default function Signin() {
  const actionData = useActionData<{ error?: string }>();

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full md:w-96 mx-auto p-4 md:p-8 rounded">
        <div className="flex flex-col gap-4">
          <h1 className="capitalize text-lg">Sign In to your account 🔑</h1>

          {/* Form for user login */}
          <Form method="post" className="flex flex-col gap-4">
            {/* Display error message if exists */}
            {actionData?.error && (
              <div className="text-red-500 text-sm mb-2">
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
            <button className="bg-blue-500 text-white py-2 rounded">
              Sign In
            </button>
          </Form>

          {/* Link to the signup page */}
          <Link to="/auth/signup">
            <p className="text-sm text-center hover:text-blue-500 hover:underline">
              Don't have an account? Create Account!
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
