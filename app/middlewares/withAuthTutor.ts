import { json, redirect } from "@remix-run/node";
import { getUserById, getUserFromSession } from "~/session.server";

export function withAuthTutor(loader: any) {
  return async ({ request }: { request: Request }) => {
    const userSession = getUserFromSession(request);
    if (!userSession) {
      return redirect("/auth/signin");
    }
    const user = await getUserById(Number(userSession?.userId));
    if (user?.role !== "tutor") {
      return redirect(`/${user?.role}/dashboard`);
    }

    const data = await loader({ request });
    return json({ ...data, user });
  };
}
