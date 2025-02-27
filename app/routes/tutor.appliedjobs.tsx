import { useLoaderData, Link } from "@remix-run/react";
import { LoaderFunction, redirect } from "@remix-run/node";
import { prisma } from "~/db.server";
import { getUserFromSession } from "~/session.server";
import { getRelativeTime } from "~/utils";
import { Eye, Inbox } from "lucide-react";
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

  return {
    appliedJobs,
    totalAppliedJobs,
    currentPage: page,
    perPage,
    totalPages: Math.ceil(totalAppliedJobs / perPage),
  };
};

export default function AppliedJobs() {
  const { appliedJobs, totalAppliedJobs, currentPage, totalPages } =
    useLoaderData<typeof loader>();
  return (
    <div>
      <div className="flex justify-between items-center p-4 border rounded-md bg-gray-100 mb-4">
        <h1 className="text-xl font-normal">Applications</h1>
        <p className="bg-green-500 inline-flex ms-2 text-sm text-white px-2 py-1 rounded-full">
          {totalAppliedJobs}
        </p>
      </div>
      {/* Display applied jobs */}
      <div className="space-y-4">
        {appliedJobs.length === 0 ? (
          <div className="flex justify-center flex-col items-center gap-3 mt-40 lg:mt-72">
            <div className="bg-gray-200 p-4 rounded-full flex text-green-600">
              <Inbox size={50} />
            </div>
          </div>
        ) : (
          appliedJobs.map((application: any) => (
            <div
              key={application.id}
              className="p-4 border rounded-lg shadow-sm  gap-4 flex flex-wrap justify-between items-center"
            >
              <div className="flex justify-start items-center gap-4">
                <div>
                  <p className="text-5xl">{application.id}</p>
                </div>
                <div>
                  <h2 className="text-xl font-medium uppercase line-clamp-1">
                    {application.job.title}
                  </h2>
                  <p className="text-gray-600">{application.job.description}</p>
                  <p className="text-sm text-gray-500 text-nowrap">
                    <span className="me-1">
                      {new Date(application.appliedAt).toLocaleDateString()}
                    </span>
                    - {getRelativeTime(application.appliedAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 text-nowrap text-blue-500 text-sm border border-blue-500 px-3 py-1 rounded-full">
                  Just Applied
                </div>
                <Link to={`/job/details/${application.job?.id}`}>
                  <button className="bg-gray-200 px-2 py-2 rounded-full text-black">
                    <Eye />
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
