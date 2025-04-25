import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useRouteLoaderData } from "@remix-run/react";
import { ExternalLink } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const recuestURL = new URL(request.url);
  const requestOrigin = recuestURL.origin;

  return { requestOrigin };
}

export default function Dashboard() {
  const { user } = useRouteLoaderData("routes/shop") as { user: any };
  const { requestOrigin } = useLoaderData<typeof loader>();
  return (
    <>
      <div className="h-96">
        <div>
          <div className="flex justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Good Morning, {user?.name}!
              </h1>
              <p>
                Your shop is ready to go. You can start selling your products
                now.
              </p>
            </div>
            <Link
              to={`${requestOrigin + "/" + user?.shops[0]?.handle}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 hover:text-blue-700 font-mono underline flex gap-1"
            >
              Visit Shop <ExternalLink />
            </Link>
          </div>
        </div>
        <div>
          <div className="stats bg-base-100 shadow-sm mt-8">
            <div className="stat">
              <div className="stat-title">Total Products</div>
              <div className="stat-value text-nuetral">
                {user.shops[0].products.length}
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Total Orders</div>
              <div className="stat-value text-nuetral">
                {user.shops[0].orders.length}
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Shop Views</div>
              <div className="stat-value text-nuetral">2040</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
