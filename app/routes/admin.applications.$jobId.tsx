import {
  useLoaderData,
  useSearchParams,
  useFetcher,
  Link,
} from "@remix-run/react";
import { LoaderFunctionArgs, ActionFunction } from "@remix-run/node";
import { getUserFromSession } from "~/session.server";
import { prisma } from "~/db.server";
import {
  ApplicationStage,
  stageColors,
  stageOptions,
} from "~/components/StageBadge";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const jobId = Number(params.jobId);
  if (isNaN(jobId)) {
    throw new Response("Invalid Job ID", { status: 400 });
  }

  const user = getUserFromSession(request);
  const userId = user?.userId;
  if (!userId) {
    throw new Response("Unauthorized", { status: 401 });
  }
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      applications: {
        include: { user: true },
        where: {
          OR: [
            { user: { name: { contains: search, lte: "insensitive" } } },
            { user: { email: { contains: search, lte: "insensitive" } } },
          ],
        },
      },
    },
  });

  if (!job) {
    throw new Response("Job not found", { status: 404 });
  }

  if (job.managedById !== Number(userId)) {
    throw new Response("Forbidden: You are not the manager of this job", {
      status: 403,
    });
  }

  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = 10;
  const offset = (page - 1) * limit;

  const totalApplications = job.applications.length;
  const paginatedApplications = job.applications.slice(offset, offset + limit);

  return {
    job,
    applications: paginatedApplications,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalApplications / limit),
      totalApplications,
    },
  };
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const applicationId = formData.get("applicationId");
  const status = formData.get("status");

  if (applicationId && status) {
    try {
      await prisma.jobApplication.update({
        where: { id: parseInt(applicationId as string) },
        data: { stage: status as string },
      });
      return {
        toast: {
          message: "Application status updated successfully.",
          type: "success",
        },
      };
    } catch (error) {
      return {
        toast: {
          message: "Error updating application status.",
          type: "error",
        },
      };
    }
  }

  return {
    toast: {
      message: "Invalid request.",
      type: "error",
    },
  };
};

type LoaderData = {
  job: any;
  applications: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalApplications: number;
  };
};

export default function JobApplications() {
  const { applications, pagination, job } = useLoaderData<LoaderData>();
  const fetcher = useFetcher();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const handlePageChange = (page: number) => {
    searchParams.set("page", String(page));
    setSearchParams(searchParams);
  };

  const handleApplicationStatusChange = (
    applicationId: number,
    newStatus: string
  ) => {
    fetcher.submit(
      { applicationId: String(applicationId), status: newStatus },
      { method: "POST" }
    );
  };
  const handleSearch = (query: string) => {
    searchParams.set("search", query);
    searchParams.set("page", "1");
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-full p-4">
      <h1 className="text-2xl font-semibold mb-4">
        Job Applications
        <span className="ms-2 bg-green-400 px-2 text-sm py-1 text-white border rounded">
          ID{job.id}
        </span>
        <span className="ms-2 bg-green-400 px-2 text-sm py-1 text-white border rounded">
          {job.title}
        </span>
      </h1>
      <div className="mb-4">
        <input
          type="text"
          spellCheck="false"
          placeholder="Search by title or description"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <div className="overflow-x-auto w-full">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
          <thead>
            <tr className="text-left bg-gray-100">
              <th className="px-4 py-2 border-b">User</th>
              <th className="px-4 py-2 border-b">Email</th>
              <th className="px-4 py-2 border-b">Applied At</th>
              <th className="px-4 py-2 border-b">Stage</th>
              <th className="px-4 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{app.user.name}</td>
                <td className="px-4 py-2">{app.user.email}</td>
                <td className="px-4 py-2">
                  {new Date(app.appliedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
                  <select
                    className={`px-3 py-1 rounded-full border appearance-none
                        ring-2 ring-${
                          stageColors[app.stage as ApplicationStage]
                        }-500`}
                    value={app.stage}
                    onChange={(e) =>
                      handleApplicationStatusChange(app.id, e.target.value)
                    }
                    disabled={fetcher.state === "submitting"}
                    aria-label="Change application stage"
                  >
                    {stageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <Link
                    to={`/admin/user/${app.user.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 hover:text-blue-700 underline"
                    aria-label="View applicant details"
                  >
                    See Applicant
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-4 justify-between items-center mt-4">
        <div className="capitalize underline">
          Showing page {pagination.currentPage} of {pagination.totalPages} (
          {pagination.totalApplications} total applications)
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
            aria-label="Previous page"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
