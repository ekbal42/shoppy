import { json, redirect } from "@remix-run/node";
import { getUserFromSession } from "~/session.server";

export function withAuthTutor(loader: any) {
  return async ({ request }: { request: Request }) => {
    const user = getUserFromSession(request);

    if (!user) {
      return redirect("/auth/signin");
    }

    if (user?.role !== "tutor") {
      return redirect(`/${user?.role}/dashboard`);
    }

    const data = await loader({ request });
    return json({ ...data, user });
  };
}
