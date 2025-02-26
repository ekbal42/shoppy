import { prisma } from "~/db.server";
import { Job } from "@prisma/client";
import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import {
  Link,
  useFetcher,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import { useState, useEffect } from "react";
import { Eye } from "lucide-react";
import { getUserFromSession } from "~/session.server";
import { getRelativeTime } from "~/utils";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = 10;
  const search = url.searchParams.get("search") || "";
  const offset = (page - 1) * limit;

  const totalJobs = await prisma.job.count({
    where: {
      OR: [
        { title: { contains: search, lte: "insensitive" } },
        { description: { contains: search, lte: "insensitive" } },
      ],
    },
  });

  const jobs = await prisma.job.findMany({
    skip: offset,
    take: limit,
    where: {
      OR: [
        { title: { contains: search, lte: "insensitive" } },
        { description: { contains: search, lte: "insensitive" } },
      ],
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      managedBy: true,
    },
  });
  return json({
    jobs,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalJobs / limit),
      totalJobs,
    },
  });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = new URLSearchParams(await request.text());
  const manageId = formData.get("manageId");
  const user = getUserFromSession(request);
  const userId = user?.userId;

  if (manageId && userId) {
    try {
      await prisma.$transaction([
        prisma.job.update({
          where: { id: parseInt(manageId) },
          data: {
            managedById: parseInt(userId),
            managedAt: new Date(),
          },
        }),
        prisma.user.update({
          where: { id: parseInt(userId) },
          data: {
            managedJobs: {
              connect: { id: parseInt(manageId) },
            },
          },
        }),
      ]);

      return json({
        message: "Job successfully added to managed jobs.",
        success: true,
      });
    } catch (error) {
      console.error("Error managing job:", error);
      return json({ message: "Error managing job.", success: false });
    }
  }
  return json({ message: "Invalid request.", success: false });
};

type ActionResponse = { message: string; success?: boolean };
type LoaderData = {
  jobs: Job[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalJobs: number;
  };
};

export default function Jobs() {
  const { jobs, pagination } = useLoaderData<LoaderData>();
  const fetcher = useFetcher();
  const fetcherData = fetcher.data as ActionResponse;
  const [messageVisible, setMessageVisible] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  useEffect(() => {
    if (fetcherData?.message) {
      setMessageVisible(true);
      const timer = setTimeout(() => {
        setMessageVisible(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [fetcherData]);
  const handleManageJob = (id: number) => {
    fetcher.submit({ manageId: String(id) }, { method: "POST" });
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
  return (
    <div className="max-w-full">
      {messageVisible && fetcherData?.message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            fetcherData.success
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {fetcherData.message}
        </div>
      )}

      <h1 className="text-2xl font-semibold mb-4">All Jobs</h1>
      <div className="mb-4">
        <input
          type="text"
          spellCheck="false"
          placeholder="Search by title or description"
          value={searchQuery}
          onChange={(e: any) => handleSearch(e.target.value)}
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
              <th className="px-4 py-2 border-b">Manager</th>
              <th className="px-4 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job: any) => (
              <tr key={job.id} className="border-b hover:bg-gray-50">
                <td className="py-3">
                  <p className="ms-3">{job.id}</p>
                </td>
                <td className="px-4 py-2 text-nowrap capitalize">
                  {new Date(job.createdAt).toLocaleDateString()}
                  <span className="bg-blue-100 text-sm border border-blue-500 ms-2 py-1 px-2 text-blue-500 rounded-full">
                    {getRelativeTime(job.createdAt)}
                  </span>
                </td>
                <td className="px-4 py-2 text-nowrap capitalize">
                  {job.title.split(" ").slice(0, 3).join(" ") +
                    (job.title.split(" ").length > 3 ? "..." : "")}
                </td>
                <td className="px-4 py-2 text-nowrap">{job.publisher}</td>
                <td className="px-4 py-2 text-nowrap capitalize">
                  <span
                    className={`px-2 py-1 rounded-full ${
                      job.status === "active"
                        ? "bg-green-100 text-green-700 border border-green-500"
                        : "bg-red-100 text-red-700 border border-red-500"
                    }`}
                  >
                    {job.status}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleManageJob(job.id)}
                    className={`ms-4 text-nowrap rounded-md ${
                      job?.managedBy
                        ? "text-black cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600 px-3 text-white"
                    }`}
                    disabled={job?.managedBy}
                  >
                    {job?.managedBy ? job?.managedBy?.name : "Manage"}
                  </button>
                </td>

                <td>
                  <Link className="flex-inline" to={`/job/details/${job?.id}`}>
                    <Eye className="inline me-1 ms-8" />
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
          {pagination.totalJobs} total jobs)
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
