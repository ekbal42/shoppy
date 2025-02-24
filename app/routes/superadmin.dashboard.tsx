import { useLoaderData } from "@remix-run/react";
import { LoaderFunction, json } from "@remix-run/node";
import { prisma } from "~/db.server";
import {
  Briefcase,
  Users,
  UserCheck,
  UserPlus,
  Clock,
  Shield,
  BookOpen,
} from "lucide-react";

export const loader: LoaderFunction = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const totalJobs = await prisma.job.count();
  const newJobsToday = await prisma.job.count({
    where: {
      createdAt: {
        gte: today,
      },
    },
  });
  const totalUsers = await prisma.user.count();
  const newUsersToday = await prisma.user.count({
    where: {
      createdAt: {
        gte: today,
      },
    },
  });

  const adminCount = await prisma.user.count({
    where: { role: "admin" },
  });
  const tutorCount = await prisma.user.count({
    where: { role: "tutor" },
  });
  const superAdminCount = await prisma.user.count({
    where: { role: "superadmin" },
  });

  return json({
    totalJobs,
    newJobsToday,
    totalUsers,
    newUsersToday,
    adminCount,
    tutorCount,
    superAdminCount,
  });
};

export default function Dashboard() {
  const {
    totalJobs,
    newJobsToday,
    totalUsers,
    newUsersToday,
    adminCount,
    tutorCount,
    superAdminCount,
  } = useLoaderData<typeof loader>();

  return (
    <div className="pt-3 lg:pt-4">
      {/* Job Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Jobs */}
        <div className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg text-white transform transition-all hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Total Jobs</h2>
              <p className="text-3xl font-bold">{totalJobs}</p>
            </div>
            <Briefcase className="w-10 h-10" />
          </div>
        </div>

        {/* New Jobs Today */}
        <div className="p-6 bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg text-white transform transition-all hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">New Jobs</h2>
              <p className="text-3xl font-bold">{newJobsToday}</p>
            </div>
            <Clock className="w-10 h-10" />
          </div>
        </div>

        {/* Total Users */}
        <div className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg text-white transform transition-all hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Total Users</h2>
              <p className="text-3xl font-bold">{totalUsers}</p>
            </div>
            <Users className="w-10 h-10" />
          </div>
        </div>

        {/* New Users Today */}
        <div className="p-6 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg shadow-lg text-white transform transition-all hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">New Users</h2>
              <p className="text-3xl font-bold">{newUsersToday}</p>
            </div>
            <UserPlus className="w-10 h-10" />
          </div>
        </div>
      </div>

      {/* Role-Based User Counts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Admins */}
        <div className="p-6 bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg text-white transform transition-all hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Admins</h2>
              <p className="text-3xl font-bold">{adminCount}</p>
            </div>
            <Shield className="w-10 h-10" />
          </div>
        </div>

        {/* Tutors */}
        <div className="p-6 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow-lg text-white transform transition-all hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Tutors</h2>
              <p className="text-3xl font-bold">{tutorCount}</p>
            </div>
            <BookOpen className="w-10 h-10" />
          </div>
        </div>

        {/* Super Admins */}
        <div className="p-6 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg shadow-lg text-white transform transition-all hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Super Admins</h2>
              <p className="text-3xl font-bold">{superAdminCount}</p>
            </div>
            <UserCheck className="w-10 h-10" />
          </div>
        </div>
      </div>
    </div>
  );
}
