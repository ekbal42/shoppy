import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Banknote,
  Book,
  BookOpen,
  Calendar,
  Check,
  Clock,
  GraduationCap,
  MapPin,
  School,
  Share2,
  User2,
  UserCheck,
} from "lucide-react";
import { prisma } from "~/db.server";
import { getUserFromSession } from "~/session.server";
import { formatTimeToAMPM, getRelativeTime } from "~/utils";
export async function loader({ request, params }: LoaderFunctionArgs) {
  const jobId = Number(params.jobId);

  if (isNaN(jobId)) {
    throw new Response("Invalid Job ID", { status: 400 });
  }
  const user = getUserFromSession(request);
  const userId = user ? Number(user.userId) : null;
  await prisma.job.update({
    where: { id: jobId },
    data: {
      views: {
        increment: 1,
      },
    },
  });
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      postedBy: {
        select: {
          name: true,
          email: true,
          profile: true,
        },
      },
      applications: userId
        ? {
            where: { userId, jobId },
            select: { id: true },
          }
        : undefined,
    },
  });

  if (!job) {
    throw new Response("Job not found", { status: 404 });
  }
  const hasApplied = userId ? job.applications.length > 0 : false;
  const allApplications = await prisma.jobApplication.findMany({
    where: { jobId },
  });
  return { job, hasApplied, user, allApplications };
}

export async function action({ request }: ActionFunctionArgs) {
  const user = getUserFromSession(request);
  const userId = Number(user?.userId);
  if (!userId) {
    return {
      toast: {
        message: "User not authenticated",
        type: "error",
      },
    };
  }
  const formData = await request.formData();
  const jobId = Number(formData.get("jobId"));
  if (isNaN(jobId)) {
    return {
      toast: {
        message: "Invalid Job ID",
        type: "error",
      },
    };
  }
  const existingApplication = await prisma.jobApplication.findFirst({
    where: { userId, jobId },
  });
  if (existingApplication) {
    return {
      toast: {
        message: "Already applied",
        type: "error",
      },
    };
  }
  await prisma.jobApplication.create({
    data: {
      userId,
      jobId,
    },
  });
  return {
    toast: {
      message: "Job application successfull!",
      type: "success",
    },
  };
}

export default function JobDetailsPage() {
  const { job, hasApplied, allApplications } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<any>();

  const handleApply = () => {
    if (hasApplied) {
      alert("You have already applied for this job!");
    } else {
      fetcher.submit({ jobId: job.id.toString() }, { method: "post" });
    }
  };
  return (
    <div className="px-4 lg:ps-4 xl:p-0 pb-8">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-0 lg:gap-4 xl:gap-8 mt-4">
        <div className="col-span-2">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <h1 className="text-xl md:text-4xl font-semibold capitalize underline text-gray-900">
              {job.title}
            </h1>
            <div className="flex justify-between items-center gap-4">
              {hasApplied && (
                <div className="bg-green-500 w-fit px-2 py-1 text-nowrap text-sm border text-white rounded">
                  <Check className="inline -mt-1 me-2" size={16} />
                  Applied
                </div>
              )}
              <div className="bg-green-100 w-fit px-2 py-1 text-nowrap text-sm border text-green-600 rounded">
                <Calendar className="inline -mt-1 me-2" size={16} />
                {job.createdAt ? getRelativeTime(job.createdAt) : "N/A"}
              </div>
            </div>
          </div>
          <p className="text-gray-700 mb-8 text-lg leading-relaxed mt-8">
            {job.description}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4 border">
              <MapPin className="text-green-500" size={40} />
              <div>
                <p className="mb-1">Location</p>
                <p className="text-gray-600 capitalize">
                  <span className="font-semibold"></span> {job.location}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4 border">
              <Banknote className="text-green-500" size={40} />
              <div>
                <p className="mb-1">Monthly Salary</p>
                <p className="text-gray-600 capitalize">
                  <span className="font-semibold"></span> {job.salary} BDT
                </p>
              </div>
            </div>

            {/* Subjects */}
            <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4 border">
              <BookOpen className="text-green-500" size={40} />
              <div>
                <p className="mb-1">Subjects</p>
                <p className="text-gray-600 capitalize">
                  <span className="font-semibold"></span> {job.subjects}
                </p>
              </div>
            </div>

            {/* Tutoring Time */}
            <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4 border">
              <Clock className="text-green-500" size={40} />
              <div>
                <p className="mb-1">Tutoring Time</p>
                <p className="text-gray-600 capitalize">
                  <span className="font-semibold"></span>{" "}
                  {formatTimeToAMPM(job.tutoringTime)}
                </p>
              </div>
            </div>

            {/* Days in Week */}
            <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4 border">
              <Calendar className="text-green-500" size={40} />
              <div>
                <p className="mb-1">Days in Week</p>
                <p className="text-gray-600 capitalize">
                  <span className="font-semibold"></span> {job.daysInWeek} Days
                </p>
              </div>
            </div>

            {/* Student Gender */}
            <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4 border">
              <User2 className="text-green-500" size={40} />
              <div>
                <p className="mb-1">Student Gender</p>
                <p className="text-gray-600 capitalize">
                  <span className="font-semibold"></span> {job.studentGender}
                </p>
              </div>
            </div>

            {/* Tutor Gender Need */}
            <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4 border">
              <UserCheck className="text-green-500" size={40} />
              <div>
                <p className="mb-1">Tutor Gender</p>
                <p className="text-gray-600 capitalize">
                  <span className="font-semibold"></span> {job.tutorGenderNeed}
                </p>
              </div>
            </div>

            {/* Tutor University Need */}
            <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4 border">
              <GraduationCap className="text-green-500" size={40} />
              <div>
                <p className="mb-1">Tutor University</p>
                <p className="text-gray-600 capitalize">
                  <span className="font-semibold"></span>{" "}
                  {job.tutorUniversityNeed}
                </p>
              </div>
            </div>
            {/* Tutor University Type Need */}
            <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4 border">
              <School className="text-green-500" size={40} />
              <div>
                <p className="mb-1">Tutor University Type</p>
                <p className="text-gray-600 capitalize">
                  <span className="font-semibold"></span>{" "}
                  {job.tutorUniversityTypeNeed}
                </p>
              </div>
            </div>

            {/* Tutor Department Need */}
            <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4 border">
              <Book className="text-green-500" size={40} />
              <div>
                <p className="mb-1">Tutor Department</p>
                <p className="text-gray-600 capitalize">
                  <span className="font-semibold"></span>{" "}
                  {job.tutorDepartmentNeed}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-2 lg:col-span-1">
          <div className="space-y-4">
            <div className="p-4 border rounded-md bg-gray-50">
              <p className="underline">Jobify.com</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-gray-700 font-semibold">Publisher</p>
              <p className="text-gray-500">{job.publisher}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-gray-700 font-semibold">Applications</p>
              <p className="text-gray-500">
                {hasApplied
                  ? allApplications.length === 1
                    ? "You applied"
                    : `You and ${allApplications.length - 1} other${
                        allApplications.length > 2 ? "s" : ""
                      } applied`
                  : allApplications.length === 0
                  ? "No applications yet"
                  : `${allApplications.length} applied`}{" "}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-gray-700 font-semibold">Views</p>
              <p className="text-gray-500">{job.views}</p>
            </div>
          </div>
          {/* Apply and Share Buttons */}
          <div className="flex justify-end gap-4 mt-4">
            <button
              className="bg-gray-100 w-full flex justify-center text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors items-center gap-2"
              onClick={async () => {
                try {
                  if (navigator.share) {
                    await navigator.share({
                      title: document.title,
                      url: window.location.href,
                    });
                  } else {
                    await navigator.clipboard.writeText(window.location.href);
                    alert("Link copied to clipboard!");
                  }
                } catch (error) {
                  console.error("Error sharing:", error);
                  alert("Failed to share. Please try again.");
                }
              }}
            >
              <Share2 className="h-5 w-5" />
              Share
            </button>
            {!hasApplied && (
              <button
                className={`${
                  hasApplied || fetcher.state === "submitting"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                } text-white px-6 py-3 w-1/2 text-nowrap rounded-lg transition-colors flex items-center gap-2`}
                onClick={handleApply}
                disabled={hasApplied || fetcher.state === "submitting"}
              >
                {fetcher.state === "submitting" ? (
                  "Applying..."
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    {hasApplied ? "Applied" : "Apply Now"}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
