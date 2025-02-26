import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { redirect } from "react-router-dom";

import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { prisma } from "~/db.server";
import { getUserById, getUserFromSession } from "~/session.server";
import { withAuth } from "~/middlewares/withAuth";

export const loader: LoaderFunction = withAuth(
  async ({ request }: { request: Request }) => {
    const userSession = getUserFromSession(request);
    const user = await getUserById(Number(userSession?.userId));
    if (user?.role !== "admin" && user?.role !== "superadmin") {
      const response = redirect(`/${user?.role}/dashboard`);
      throw response;
    }
    return json({ user });
  }
);
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const salary = parseFloat(formData.get("salary") as string);
  const publisher = formData.get("publisher") as string;
  const studentGender = formData.get("studentGender") as string;
  const tutorGenderNeed = formData.get("tutorGenderNeed") as string;
  const tutorUniversityNeed = formData.get("tutorUniversityNeed") as string;
  const subjects = formData.get("subjects") as string;
  const daysInWeek = formData.get("daysInWeek") as string;
  const tutoringTime = formData.get("tutoringTime") as string;
  const tutorUniversityTypeNeed = formData.get(
    "tutorUniversityTypeNeed"
  ) as string;
  const tutorDepartmentNeed = formData.get("tutorDepartmentNeed") as string;
  const postedById = parseInt(formData.get("postedById") as string);
  if (!title || !location || !publisher) {
    return json(
      { error: "Title, location, and publisher are required!" },
      { status: 400 }
    );
  }
  try {
    await prisma.job.create({
      data: {
        title,
        description,
        location,
        salary,
        publisher,
        studentGender,
        tutorGenderNeed,
        tutorUniversityNeed,
        tutorUniversityTypeNeed,
        tutorDepartmentNeed,
        postedById,
        subjects,
        daysInWeek,
        tutoringTime,
      },
    });

    return redirect(`/`);
  } catch (error) {
    return json(
      { error: "Failed to create job. Please try again." },
      { status: 500 }
    );
  }
};

export default function AddJob() {
  const actionData = useActionData<typeof action>();
  const { user } = useLoaderData<typeof loader>();
  return (
    <div className="max-w-6xl mx-auto py-4 pb-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-4">
        <div className="col-span-1">
          <div className="flex flex-col gap-4 border rounded-md justify-center items-center bg-gray-100 py-12">
            <div className="border-b w-full ">
              <p className="text-center mb-4">Posting Job As</p>
            </div>
            <img
              src="/user.jpg"
              alt="profile-img"
              className="size-40 border-4 rounded-full"
            />
            <div>
              <p className="text-2xl font-bold text-center">{user?.name}</p>
              <p className="text-sm text-center font-mono uppercase">
                {user?.email}
              </p>
              <p
                className="text-sm px-3 text-center bg-green-500 text-white
                py-1 mt-2 uppercase rounded border border-green-700"
              >
                {user?.role} User ID : {user?.id}
              </p>
            </div>
          </div>
        </div>
        <div className="col-span-2 space-y-4">
          <div className="bg-gray-100 p-4 rounded-md border">
            <h1 className="text-2xl font-semibold">Post a New Job</h1>
          </div>
          {actionData?.error && (
            <div className="bg-gray-100 p-4 rounded-md border">
              <p className="text-red-500">{actionData.error}</p>
            </div>
          )}
          <Form method="post" className="space-y-4">
            <div className="bg-gray-100 p-8 rounded-md border space-y-4">
              <input type="hidden" name="postedById" value={user?.id} />
              <div>
                <p className="block font-medium">Title:</p>
                <input
                  type="text"
                  name="title"
                  placeholder="Job title"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                />
                <p className="text-gray-700 text-sm mt-1">
                  Title is required. Make it concise, ideally 3 to 5 words.
                </p>
              </div>
              <div>
                <p className="block font-medium">Description:</p>
                <textarea
                  name="description"
                  placeholder="Job description"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                ></textarea>
                <p className="text-gray-700 text-sm mt-1">
                  Provide a detailed description of the job (optional).
                </p>
              </div>
            </div>
            <div className="bg-gray-100 p-8 rounded-md border space-y-4">
              <div>
                <p className="block font-medium">Location:</p>
                <input
                  type="text"
                  name="location"
                  placeholder="Job Location"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                />
                <p className="text-gray-700 text-sm mt-1">
                  Enter the location where the job will be conducted.
                </p>
              </div>

              <div>
                <p className="block font-medium">Subjects:</p>
                <input
                  type="text"
                  name="subjects"
                  placeholder="Enter subjects (Comma separated)"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                />
                <p className="text-gray-700 text-sm mt-1">
                  List the subjects to be taught, separated by commas (e.g.,
                  Math, Science).
                </p>
              </div>
            </div>
            <div className="bg-gray-100 p-8 rounded-md border space-y-4">
              <div>
                <p className="block font-medium">Tutoring Time:</p>
                <input
                  type="time"
                  name="tutoringTime"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                />
                <p className="text-gray-700 text-sm mt-1">
                  Select the preferred time for tutoring sessions.
                </p>
              </div>

              <div>
                <p className="block font-medium">Days In Week:</p>
                <input
                  type="number"
                  name="daysInWeek"
                  placeholder="Days in week"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                  maxLength={6}
                />
                <p className="text-gray-700 text-sm mt-1">
                  Enter the number of days per week for tutoring (max 6 days).
                </p>
              </div>

              <div>
                <p className="block font-medium">Salary:</p>
                <input
                  required
                  type="number"
                  step="500"
                  placeholder="Job salary"
                  name="salary"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                <p className="text-gray-700 text-sm mt-1">
                  Enter the salary amount (increments of 500).
                </p>
              </div>
            </div>
            <div className="bg-gray-100 p-8 rounded-md border space-y-4">
              <div>
                <p className="block font-medium">Publisher:</p>
                <input
                  type="text"
                  name="publisher"
                  placeholder="Publisher name"
                  className="mt-1 cursor-not-allowed block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                  defaultValue={user?.name}
                  readOnly
                />
                <p className="text-gray-700 text-sm mt-1">
                  This field is automatically filled with your name.
                </p>
              </div>

              <div>
                <p className="block font-medium">Student Gender:</p>
                <select
                  required
                  name="studentGender"
                  className="mt-1 block appearance-none w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">~select here~</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <p className="text-gray-700 text-sm mt-1">
                  Select the gender of the student.
                </p>
              </div>

              <div>
                <p className="block font-medium">Tutor Gender:</p>
                <select
                  required
                  name="tutorGenderNeed"
                  className="mt-1 block appearance-none w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">~select here~</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Any">Any</option>
                </select>
                <p className="text-gray-700 text-sm mt-1">
                  Select the preferred gender of the tutor.
                </p>
              </div>
            </div>
            <div className="bg-gray-100 p-8 rounded-md border space-y-4">
              <div>
                <p className="block font-medium">Tutor University:</p>
                <input
                  required
                  type="text"
                  name="tutorUniversityNeed"
                  placeholder="Tutor university"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                <p className="text-gray-700 text-sm mt-1">
                  Enter the university the tutor should be from.
                </p>
              </div>

              <div>
                <p className="block font-medium">Tutor University Type:</p>
                <select
                  required
                  name="tutorUniversityTypeNeed"
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">~select here~</option>
                  <option value="Public University">Public University</option>
                  <option value="Private University">Private University</option>
                  <option value="Seven College">Seven College</option>
                </select>
                <p className="text-gray-700 text-sm mt-1">
                  Select the type of university the tutor should be from.
                </p>
              </div>

              <div>
                <p className="block font-medium">Tutor Department:</p>
                <input
                  required
                  type="text"
                  name="tutorDepartmentNeed"
                  placeholder="Tutor department"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
                <p className="text-gray-700 text-sm mt-1">
                  Enter the department the tutor should belong to.
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 rounded"
            >
              Add Job
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
