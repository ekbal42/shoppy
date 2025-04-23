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
      <div className="card bg-base-100 shadow-md w-full max-w-md mx-auto p-4 md:p-8">
        <h2 className="card-title text-2xl mb-1">Register to Shoppy</h2>
        <p>Create an account to start shopping with us.</p>
        <div className="flex flex-col gap-4 mt-4">
          <Form method="post" className="flex flex-col gap-4">
            {actionData?.error && (
              <div role="alert" className="alert alert-error alert-soft">
                <span>{actionData.error}</span>
              </div>
            )}

            <fieldset className="fieldset">
              <legend className="fieldset-legend">What is your name?</legend>
              <input
                type="text"
                className="input w-full"
                placeholder="Type here"
                name="name"
                required
              />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Enter your phone.</legend>
              <input
                type="tel"
                className="input w-full"
                placeholder="Type here"
                name="phone"
                required
              />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Enter your email.</legend>
              <input
                type="email"
                className="input w-full"
                placeholder="Type here"
                name="email"
                required
              />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Password you prefer.</legend>
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
              {navigation?.state === "submitting" ? "Signing Up..." : "Sign Up"}
            </button>
          </Form>
          <Link to="/auth/signin">
            <p className="text-sm text-center hover:text-neutral hover:underline">
              Already have an account? Sign In!
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
