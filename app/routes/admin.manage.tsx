import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams, useFetcher } from "@remix-run/react";
import { ActionFunction, LoaderFunction } from "@vercel/remix";
import { prisma } from "~/db.server";
import { getUserFromSession } from "~/session.server";
import { useState, useEffect } from "react";
import { Eye } from "lucide-react";

export const loader: LoaderFunction = async ({ request }) => {
  const user = getUserFromSession(request);
  const userId = user?.userId;

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
    },
  });

  return json({
    managedJobs,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalManagedJobs / limit),
      totalManagedJobs,
    },
  });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = new URLSearchParams(await request.text());
  const id = formData.get("id");
  const status = formData.get("status");

  if (id && status) {
    try {
      await prisma.job.update({
        where: { id: parseInt(id) },
        data: { status: status as "active" | "inactive" },
      });
      return json({ message: "Status updated successfully.", success: true });
    } catch (error) {
      return json({ message: "Error updating status.", success: false });
    }
  }

  return json({ message: "Invalid request.", success: false });
};

type ActionResponse = { message: string; success?: boolean };
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

  const handleStatusChange = (id: number, newStatus: string) => {
    fetcher.submit({ id: String(id), status: newStatus }, { method: "POST" });
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
              <tr key={job.id} className="border-b hover:bg-gray-50">
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
                    onChange={(e) => handleStatusChange(job.id, e.target.value)}
                    disabled={fetcher.state === "submitting"}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  <a href={`/job/details/${job.id}`} className="flex-inline">
                    <Eye className="inline ms-6 mb-1" />
                  </a>
                </td>
              </tr>
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
