import {
  useLoaderData,
  useSearchParams,
  useFetcher,
  Link,
} from "@remix-run/react";
import { ActionFunction, LoaderFunction } from "@vercel/remix";
import { prisma } from "~/db.server";
import { getUserFromSession } from "~/session.server";
import React, { useState } from "react";
import {
  ApplicationStage,
  stageColors,
  stageOptions,
} from "~/components/StageBadge";
export const loader: LoaderFunction = async ({ request }) => {
  const user = getUserFromSession(request);
  const userId = user?.userId;

  if (!userId) {
    throw new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = 10;
  const search = url.searchParams.get("search") || "";
  const offset = (page - 1) * limit;

  const totalManagedJobs = await prisma.job.count({
    where: {
      managedById: Number(userId),
      OR: [
        { title: { contains: search, lte: "insensitive" } },
        { description: { contains: search, lte: "insensitive" } },
      ],
    },
  });

  const managedJobs = await prisma.job.findMany({
    skip: offset,
    take: limit,
    where: {
      managedById: Number(userId),
      OR: [
        { title: { contains: search, lte: "insensitive" } },
        { description: { contains: search, lte: "insensitive" } },
      ],
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      managedBy: true,
      applications: {
        include: {
          user: true,
        },
        orderBy: [
          {
            stage: "asc",
          },
        ],
      },
    },
  });

  return {
    managedJobs,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalManagedJobs / limit),
      totalManagedJobs,
    },
  };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const id = formData.get("id");
  const status = formData.get("status");
  const applicationId = formData.get("applicationId");

  if (id && status) {
    try {
      await prisma.job.update({
        where: { id: parseInt(id as string) },
        data: { status: status as "active" | "inactive" },
      });
      return {
        toast: { message: "Job status updated successfully.", type: "success" },
      };
    } catch (error) {
      return {
        toast: { message: "Job status update faild!.", type: "error" },
      };
    }
  }

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
          type: "success",
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
  managedJobs: any[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalManagedJobs: number;
  };
};

export default function Manage() {
  const { managedJobs, pagination } = useLoaderData<LoaderData>();
  const fetcher = useFetcher();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);
  const handleStatusChange = (id: number, newStatus: string) => {
    fetcher.submit({ id: String(id), status: newStatus }, { method: "POST" });
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

  const handlePageChange = (page: number) => {
    searchParams.set("page", String(page));
    setSearchParams(searchParams);
  };

  const handleSearch = (query: string) => {
    searchParams.set("search", query);
    searchParams.set("page", "1");
    setSearchParams(searchParams);
  };

  const toggleApplications = (jobId: number) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null);
    } else {
      setExpandedJobId(jobId);
    }
  };

  return (
    <div className="max-w-full p-4">
      <h1 className="text-2xl font-semibold mb-4">My Management</h1>
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
              <th className="px-4 py-2 border-b">ID</th>
              <th className="px-4 py-2 border-b">Date</th>
              <th className="px-4 py-2 border-b">Title</th>
              <th className="px-4 py-2 border-b">Publisher</th>
              <th className="px-4 py-2 border-b">Status</th>
              <th className="px-4 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {managedJobs.map((job) => (
              <React.Fragment key={job.id}>
                <tr className={`border-b hover:bg-gray-50`}>
                  <td className="px-4 py-2">{job.id}</td>
                  <td className="px-4 py-2 text-nowrap">
                    {new Date(job.managedAt).toLocaleDateString()}
                    {(() => {
                      const d = new Date(job.managedAt),
                        t = new Date();
                      const y = new Date(t);
                      y.setDate(t.getDate() - 1);
                      return d.toDateString() === t.toDateString() ? (
                        <span className="ml-2 bg-green-500 text-white text-sm px-2 py-1 rounded-full">
                          Today
                        </span>
                      ) : d.toDateString() === y.toDateString() ? (
                        <span className="ml-2 bg-yellow-500 text-white text-sm px-2 py-1 rounded-full">
                          Yesterday
                        </span>
                      ) : (
                        <span className="ml-2 bg-gray-500 text-white text-sm px-2 py-1 rounded-full">
                          Older
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-2 text-nowrap capitalize">
                    {job.title.split(" ").slice(0, 3).join(" ") +
                      (job.title.split(" ").length > 3 ? "..." : "")}
                  </td>
                  <td className="px-4 py-2 text-nowrap">{job.publisher}</td>
                  <td className="px-4 py-2 text-nowrap">
                    <select
                      className={`px-3 py-1 rounded-full border appearance-none ${
                        job.status === "active"
                          ? "ring-2 ring-green-500"
                          : "ring-2 ring-red-500"
                      }`}
                      value={job.status}
                      onChange={(e) =>
                        handleStatusChange(job.id, e.target.value)
                      }
                      disabled={fetcher.state === "submitting"}
                      aria-label="Change job status"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <Link
                      to={`/job/details/${job.id}`}
                      className="inline-flex items-center text-nowrap underline text-blue-500 hover:text-blue-700"
                      aria-label="View job details"
                    >
                      See Job
                    </Link>
                    <button
                      onClick={() => toggleApplications(job.id)}
                      className="lg:ml-2 underline text-blue-500 text-nowrap hover:text-blue-700"
                      aria-label="Toggle applications"
                    >
                      See Applications ({job.applications.length})
                    </button>
                  </td>
                </tr>
                {expandedJobId === job.id && (
                  <tr>
                    <td colSpan={6}>
                      <div className="px-4 py-2 bg-gray-100 pb-4">
                        <h3 className="font-semibold mb-2">
                          Applications ({job.applications.length})
                        </h3>
                        {job.applications.length > 0 ? (
                          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                            <thead>
                              <tr className="text-left bg-gray-50">
                                <th className="px-4 py-2 border-b">User</th>
                                <th className="px-4 py-2 border-b">Email</th>
                                <th className="px-4 py-2 border-b">
                                  Applied At
                                </th>
                                <th className="px-4 py-2 border-b">Stage</th>
                                <th className="px-4 py-2 border-b">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {job.applications.map((app: any) => (
                                <tr
                                  key={app.id}
                                  className="border-b hover:bg-gray-50"
                                >
                                  <td className="px-4 py-2">{app.user.name}</td>
                                  <td className="px-4 py-2">
                                    {app.user.email}
                                  </td>
                                  <td className="px-4 py-2">
                                    {new Date(
                                      app.appliedAt
                                    ).toLocaleDateString()}
                                  </td>
                                  <td className="px-4 py-2">
                                    <select
                                      className={`px-3 py-1 rounded-full border appearance-none
                                        ring-2 ring-${
                                          stageColors[
                                            app.stage as ApplicationStage
                                          ]
                                        }-500`}
                                      value={app.stage}
                                      onChange={(e) =>
                                        handleApplicationStatusChange(
                                          app.id,
                                          e.target.value
                                        )
                                      }
                                      disabled={fetcher.state === "submitting"}
                                      aria-label="Change application stage"
                                    >
                                      {stageOptions.map((option) => (
                                        <option
                                          key={option.value}
                                          value={option.value}
                                        >
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
                        ) : (
                          <p className="text-gray-500">
                            No applications found.
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-4 justify-between items-center mt-4">
        <div className="capitalize underline">
          Showing page {pagination.currentPage} of {pagination.totalPages} (
          {pagination.totalManagedJobs} total jobs)
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
