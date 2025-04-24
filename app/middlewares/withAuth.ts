import { redirect } from "@remix-run/node";
import { getUserById, getUserFromSession } from "~/session.server";

export function withAuth(loader: any) {
  return async ({ request }: { request: Request }) => {
    const userSession = await getUserFromSession(request);
    if (!userSession) {
      return redirect("/auth/signin");
    }
    const user = await getUserById(userSession?.userId);
    const data = await loader({ request });
    return { ...data, user };
  };
}
