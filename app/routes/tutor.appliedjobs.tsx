import { useLoaderData, Link } from "@remix-run/react";
import { LoaderFunction, json, redirect } from "@remix-run/node";
import { prisma } from "~/db.server";
import { getUserFromSession } from "~/session.server";
export const loader: LoaderFunction = async ({ request }) => {
  const user = getUserFromSession(request);
  const userId = Number(user?.userId);

  if (!userId) {
    return redirect("/login");
  }
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const perPage = 10;
  const totalAppliedJobs = await prisma.jobApplication.count({
    where: { userId },
  });

  const appliedJobs = await prisma.jobApplication.findMany({
    where: { userId },
    include: {
      job: true,
    },
    skip: (page - 1) * perPage,
    take: perPage,
    orderBy: { appliedAt: "desc" },
  });

  return json({
    appliedJobs,
    totalAppliedJobs,
    currentPage: page,
    perPage,
    totalPages: Math.ceil(totalAppliedJobs / perPage),
  });
};

export default function AppliedJobs() {
  const { appliedJobs, totalAppliedJobs, currentPage, totalPages } =
    useLoaderData<typeof loader>();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Applied Jobs
        <span className="bg-green-500 ms-2 text-white px-3 py-2 text-sm rounded-full">
          {totalAppliedJobs}
        </span>
      </h1>

      {/* Display applied jobs */}
      <div className="space-y-4">
        {appliedJobs.length === 0 ? (
          <p>No jobs applied yet.</p>
        ) : (
          appliedJobs.map((application: any) => (
            <div
              key={application.id}
              className="p-4 border rounded-lg shadow-sm flex justify-between items-center"
            >
              <div>
                <h2 className="text-xl font-semibold capitalize">
                  {application.job.title}
                </h2>
                <p className="text-gray-600">{application.job.description}</p>
                <p className="text-sm text-gray-500">
                  Applied on :
                  <span className="ms-1">
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-blue-200 text-blue-500 px-3 py-1 rounded-full">
                  Just Applied
                </div>
                <Link to={`/job/details/${application.job?.id}`}>
                  <button className="bg-green-500 px-3 py-2 rounded-md text-white">
                    View Details
                  </button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination controls */}
      {totalAppliedJobs.length > 10 && (
        <div className="flex justify-center gap-4 mt-8">
          {currentPage > 1 && (
            <Link
              to={`?page=${currentPage - 1}`}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Previous
            </Link>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              to={`?page=${page}`}
              className={`px-4 py-2 ${
                page === currentPage
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              } rounded-lg`}
            >
              {page}
            </Link>
          ))}

          {currentPage < totalPages && (
            <Link
              to={`?page=${currentPage + 1}`}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
