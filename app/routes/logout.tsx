import { redirect } from "@remix-run/node";
import { serialize } from "cookie";

export let action = async ({ request }: { request: Request }) => {
  const cookie = serialize("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
    sameSite: "strict",
  });

  return redirect("/auth/signin", {
    headers: {
      "Set-Cookie": cookie,
    },
  });
};

export default function Logout() {
  return null;
}
