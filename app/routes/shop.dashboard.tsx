import { Link, useRouteLoaderData } from "@remix-run/react";
import { ExternalLink } from "lucide-react";
import { getOrigin } from "~/utils";

export default function Dashboard() {
  const { user } = useRouteLoaderData("routes/shop") as { user: any };
  const fullUrl = getOrigin();
  return (
    <>
      <div className="h-96">
        <div className="flex justify-end">
          <Link
            to={`${fullUrl + "/" + user?.shops[0]?.handle}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-500 hover:text-blue-700 font-mono underline flex gap-1"
          >
            {fullUrl + "/" + user?.shops[0]?.handle} <ExternalLink />
          </Link>
        </div>
      </div>
    </>
  );
}
