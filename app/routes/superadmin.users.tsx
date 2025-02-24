import { prisma } from "~/db.server";
import { User } from "@prisma/client";
import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import { useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import { useState, useEffect } from "react";
import { Trash } from "lucide-react";
export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = 10;
  const search = url.searchParams.get("search") || "";
  const offset = (page - 1) * limit;

  const totalUsers = await prisma.user.count({
    where: {
      OR: [
        { name: { contains: search, lte: "insensitive" } },
        { email: { contains: search, lte: "insensitive" } },
      ],
    },
  });

  const users = await prisma.user.findMany({
    skip: offset,
    take: limit,
    where: {
      OR: [
        { name: { contains: search, lte: "insensitive" } },
        { email: { contains: search, lte: "insensitive" } },
      ],
    },
  });

  return json({
    users,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
    },
  });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = new URLSearchParams(await request.text());
  const id = formData.get("id");
  const role = formData.get("role");
  const deleteId = formData.get("deleteId");

  if (deleteId) {
    try {
      await prisma.user.delete({ where: { id: parseInt(deleteId) } });
      return json({ message: "User successfully deleted.", success: true });
    } catch (error) {
      return json({ message: "Error deleting user.", success: false });
    }
  }

  if (id && role) {
    try {
      await prisma.user.update({ where: { id: parseInt(id) }, data: { role } });
      return json({ message: "Role updated successfully.", success: true });
    } catch (error) {
      return json({ message: "Error updating role.", success: false });
    }
  }

  return json({ message: "Invalid request.", success: false });
};

type ActionResponse = { message: string; success?: boolean };
type LoaderData = {
  users: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
  };
};

export default function Users() {
  const { users, pagination } = useLoaderData<LoaderData>();
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

  const handleRoleChange = (id: number, newRole: string) => {
    fetcher.submit({ id: String(id), role: newRole }, { method: "POST" });
  };

  const handleDeleteUser = (id: number) => {
    fetcher.submit({ deleteId: String(id) }, { method: "POST" });
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

      <h1 className="text-2xl font-semibold mb-4"> All Users</h1>
      <div className="mb-4">
        <input
          type="text"
          spellCheck={"false"}
          placeholder="Search by name or email~"
          value={searchQuery}
          onChange={(e: any) => handleSearch(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <div className="overflow-x-auto w-full">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
          <thead>
            <tr className="text-left bg-gray-100">
              <th className="px-4 py-2 border-b">Name</th>
              <th className="px-4 py-2 border-b">Email</th>
              <th className="px-4 py-2 border-b">Role</th>
              <th className="px-4 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 text-nowrap capitalize">
                  {user.name}
                </td>
                <td className="px-4 py-2 text-nowrap font-mono">
                  {user.email}
                </td>
                <td className="px-4 py-2 text-nowrap">
                  <select
                    className="px-3 py-2 border rounded-md appearance-none"
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={fetcher.state === "submitting"}
                  >
                    <option value="superadmin" disabled>
                      Super Admin
                    </option>
                    <option value="admin" disabled={user.role === "superadmin"}>
                      Admin
                    </option>
                    <option value="tutor" disabled={user.role === "superadmin"}>
                      Tutor
                    </option>
                  </select>
                </td>
                <td className="">
                  <button onClick={() => handleDeleteUser(user.id)}>
                    <Trash className="w-6 h-6 inline -mt-1" /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-4 justify-between items-center mt-4">
        <div className="capitalize underline">
          Showing page {pagination.currentPage} of {pagination.totalPages} (
          {pagination.totalUsers} total users)
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
