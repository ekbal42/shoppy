import { Link, useRouteLoaderData } from "@remix-run/react";
import { getOrigin } from "~/utils";

export default function Dashboard() {
  const { user } = useRouteLoaderData("routes/shop") as { user: any };
  const fullUrl = getOrigin();
  return (
    <>
      <div className="h-96">
        <div className="flex justify-center items-center h-full">
          <Link
            to={`${fullUrl + "/" + user?.shops[0]?.handle}`}
            target="_blank"
            rel="noreferrer"
          >
            {fullUrl + "/" + user?.shops[0]?.handle}
          </Link>
        </div>
      </div>
    </>
  );
}
