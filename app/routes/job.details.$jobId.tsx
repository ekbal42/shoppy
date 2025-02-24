import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
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
  return json({ job, hasApplied, user });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = getUserFromSession(request);
  const userId = Number(user?.userId);
  if (!userId) {
    return json(
      { success: false, error: "User not authenticated" },
      { status: 401 }
    );
  }
  const formData = await request.formData();
  const jobId = Number(formData.get("jobId"));
  if (isNaN(jobId)) {
    return json({ success: false, error: "Invalid Job ID" }, { status: 400 });
  }
  const existingApplication = await prisma.jobApplication.findFirst({
    where: { userId, jobId },
  });
  if (existingApplication) {
    return json({ success: false, error: "Already applied" }, { status: 400 });
  }
  await prisma.jobApplication.create({
    data: {
      userId,
      jobId,
    },
  });
  return json({ success: true });
}

export default function JobDetailsPage() {
  const { job, hasApplied, user } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<any>();

  const handleApply = () => {
    if (hasApplied) {
      alert("You have already applied for this job!");
    } else {
      fetcher.submit({ jobId: job.id.toString() }, { method: "post" });
    }
  };
  return (
    <div className="px-4 lg:px-0 pb-8">
      {fetcher.state === "idle" && fetcher.data?.success && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg">
          Successfully applied for the job!
        </div>
      )}
      {fetcher.state === "idle" && fetcher.data?.error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {fetcher.data.error}
        </div>
      )}
      <div className="flex flex-wrap gap-4 justify-between items-center mt-4">
        <h1 className="text-4xl font-semibold capitalize underline text-gray-900">
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
          <div className="bg-green-100 w-fit px-2 py-1 text-nowrap text-sm border text-green-600 rounded">
            <User2 className="inline -mt-1 me-2" size={16} />
            {job.publisher || "N/A"}
          </div>
        </div>
      </div>
      <p className="text-gray-700 mb-8 text-lg leading-relaxed">
        {job.description}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4">
          <MapPin className="text-green-500" size={40} />
          <div>
            <p className="mb-1">Location</p>
            <p className="text-gray-600 capitalize">
              <span className="font-semibold"></span> {job.location}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4">
          <Banknote className="text-green-500" size={40} />
          <div>
            <p className="mb-1">Monthly Salary</p>
            <p className="text-gray-600 capitalize">
              <span className="font-semibold"></span> {job.salary} BDT
            </p>
          </div>
        </div>

        {/* Subjects */}
        <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4">
          <BookOpen className="text-green-500" size={40} />
          <div>
            <p className="mb-1">Subjects</p>
            <p className="text-gray-600 capitalize">
              <span className="font-semibold"></span> {job.subjects}
            </p>
          </div>
        </div>

        {/* Tutoring Time */}
        <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4">
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
        <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4">
          <Calendar className="text-green-500" size={40} />
          <div>
            <p className="mb-1">Days in Week</p>
            <p className="text-gray-600 capitalize">
              <span className="font-semibold"></span> {job.daysInWeek} Days
            </p>
          </div>
        </div>

        {/* Student Gender */}
        <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4">
          <User2 className="text-green-500" size={40} />
          <div>
            <p className="mb-1">Student Gender</p>
            <p className="text-gray-600 capitalize">
              <span className="font-semibold"></span> {job.studentGender}
            </p>
          </div>
        </div>

        {/* Tutor Gender Need */}
        <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4">
          <UserCheck className="text-green-500" size={40} />
          <div>
            <p className="mb-1">Tutor Gender</p>
            <p className="text-gray-600 capitalize">
              <span className="font-semibold"></span> {job.tutorGenderNeed}
            </p>
          </div>
        </div>

        {/* Tutor University Need */}
        <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4">
          <GraduationCap className="text-green-500" size={40} />
          <div>
            <p className="mb-1">Tutor University</p>
            <p className="text-gray-600 capitalize">
              <span className="font-semibold"></span> {job.tutorUniversityNeed}
            </p>
          </div>
        </div>
        {/* Tutor University Type Need */}
        <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4">
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
        <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4">
          <Book className="text-green-500" size={40} />
          <div>
            <p className="mb-1">Tutor Department</p>
            <p className="text-gray-600 capitalize">
              <span className="font-semibold"></span> {job.tutorDepartmentNeed}
            </p>
          </div>
        </div>
      </div>
      {/* Apply and Share Buttons */}
      <div className="flex justify-end gap-4 mt-8">
        <button
          className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
          }}
        >
          <Share2 className="h-5 w-5" />
          Share
        </button>
        {user && !hasApplied && (
          <button
            className={`${
              hasApplied || fetcher.state === "submitting"
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            } text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2`}
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
  );
}
