import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader({ params }: LoaderFunctionArgs) {
  const { shopname } = params;
  return { shopname };
}

export default function UserProfile() {
  const { shopname } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>{shopname} website</h1>
    </div>
  );
}
