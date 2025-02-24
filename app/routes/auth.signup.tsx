import { json, LoaderFunction, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { prisma } from "../db.server";
import { getUserFromSession } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = getUserFromSession(request);
  if (user) {
    return redirect(`/${user?.role}/dashboard`);
  }
  return {};
};

export const action = async ({ request }: { request: Request }) => {
  const formData = new URLSearchParams(await request.text());
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");

  if (!name || !email || !password) {
    return json({ error: "All fields are required." }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return json(
      { error: "User already exists with this email." },
      { status: 400 }
    );
  }

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password,
        role: "tutor",
      },
    });

    return redirect("/auth/signin");
  } catch (error) {
    console.error(error);
    return json(
      { error: "Something went wrong while creating the user." },
      { status: 500 }
    );
  }
};

export default function Signup() {
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full md:w-96 mx-auto p-4 md:p-8 rounded">
        <h1 className="text-start text-green-500 mb-4 text-2xl font-extrabold">
          Jobify Sign Up~
        </h1>
        <div className="flex flex-col gap-4">
          <h1 className="capitalize text-lg">Create a new account 🔑</h1>

          {/* Form for user signup */}
          <Form method="post" className="flex flex-col gap-4">
            {/* Show error message if exists */}
            {actionData?.error && (
              <div className="text-red-500 text-sm bg-red-100 p-3">
                {actionData.error}
              </div>
            )}

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="py-2 px-3 border"
              required
            />
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
