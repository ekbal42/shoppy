import { json, LoaderFunction, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { ActionFunction } from "@vercel/remix";
import { prisma } from "~/db.server";
import { getUserFromSession } from "~/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = getUserFromSession(request);
  const userId = Number(user?.userId);

  if (!userId) {
    return redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId },
  });

  return json({ profile, user });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const profileData = {
    livingLocation: formData.get("livingLocation") as string,
    preferredLocations: formData.get("preferredLocations") as string,
    gender: formData.get("gender") as string,
    sscSchool: formData.get("sscSchool") as string,
    sscGroup: formData.get("sscGroup") as string,
    sscResult: parseFloat(formData.get("sscResult") as string),
    sscMedium: formData.get("sscMedium") as string,
    hscCollege: formData.get("hscCollege") as string,
    hscGroup: formData.get("hscGroup") as string,
    hscResult: parseFloat(formData.get("hscResult") as string),
    hscMedium: formData.get("hscMedium") as string,
    currentUniversity: formData.get("currentUniversity") as string,
    currentDepartment: formData.get("currentDepartment") as string,
    currentYearInUniversity: parseInt(
      formData.get("currentYearInUniversity") as string
    ),
    lastSemesterResult: parseFloat(
      formData.get("lastSemesterResult") as string
    ),
  };

  const user = getUserFromSession(request);
  const userId = Number(user?.userId);

  if (!userId) {
    return redirect("/login");
  }
  const existingProfile = await prisma.profile.findUnique({
    where: { userId },
  });
  if (existingProfile) {
    await prisma.profile.update({
      where: { userId },
      data: profileData,
    });
  } else {
    await prisma.profile.create({
      data: {
        userId,
        ...profileData,
      },
    });
  }

  return redirect("/tutor/dashboard");
};
export default function Dashboard() {
  const { profile, user } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 space-y-4">
          <div className="flex flex-col gap-4 border rounded-md justify-center items-center bg-gray-100 py-12">
            <img
              src="/user.jpg"
              alt="profile-img"
              className="size-40 border rounded-full"
            />
            <div>
              <p className="text-2xl font-bold text-center">{user?.name}</p>
              <p className="text-sm text-center font-mono uppercase">
                {user?.email}
              </p>
              <p
                className="text-sm text-center bg-green-500 text-white rounded-md 
                py-1 mt-2 uppercase"
              >
                User ID : {user?.userId}
              </p>
            </div>
          </div>
          <div className="bg-gray-100 border p-4 rounded-md flex justify-between items-center">
            <Link to="#">
              <p className="hover:text-green-500 hover:underline text-lg">
                All Jobs
              </p>
            </Link>
            <p className="bg-green-500  text-white px-2 py-1 rounded-full">
              10
            </p>
          </div>
          <div className="bg-gray-100 border p-4 rounded-md flex justify-between items-center">
            <Link to="#">
              <p className="hover:text-green-500 hover:underline text-lg">
                Jobs Applied
              </p>
            </Link>
            <p className="bg-green-500  text-white px-2 py-1 rounded-full">
              05
            </p>
          </div>
        </div>
        <div className="col-span-2">
          <div className="">
            <div className="bg-gray-100 p-4 px-6 mb-4 border rounded-md">
              <p className="text-lg text-green-500 uppercase font-semibold">
                User profile
              </p>
            </div>
            <Form method="post" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border rounded-md p-8 bg-gray-100">
                <div>
                  <p className="block text-sm font-medium text-gray-700">
                    Living Location
                  </p>
                  <input
                    type="text"
                    placeholder="Living location"
                    name="livingLocation"
                    defaultValue={profile?.livingLocation || ""}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <p className="block text-sm font-medium text-gray-700">
                    Gender
                  </p>
                  <select
                    name="gender"
                    defaultValue={profile?.gender || ""}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <p className="block text-sm font-medium text-gray-700">
                    Preferred Locations
                  </p>
                  <input
                    type="text"
                    placeholder="Preferred location (Comma separeted)"
                    name="preferredLocations"
                    defaultValue={profile?.preferredLocations || ""}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border rounded-md p-8 bg-gray-100">
                <div>
                  <p className="block text-sm font-medium text-gray-700">
                    SSC School
                  </p>
                  <input
                    type="text"
                    placeholder="School in SSC"
                    name="sscSchool"
                    defaultValue={profile?.sscSchool || ""}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <p className="block text-sm font-medium text-gray-700">
                    SSC Group
                  </p>
                  <select
                    name="sscGroup"
                    defaultValue={profile?.sscGroup || ""}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select Group</option>
                    <option value="Science">Science</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Arts">Arts</option>
                  </select>
                </div>

                <div>
                  <p className="block text-sm font-medium text-gray-700">
                    SSC Result
                  </p>
                  <input
                    type="number"
                    placeholder="Result in SSC"
                    name="sscResult"
                    defaultValue={profile?.sscResult || ""}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <p className="block text-sm font-medium text-gray-700">
                    SSC Medium
                  </p>
                  <select
                    name="sscMedium"
                    defaultValue={profile?.sscMedium || ""}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select Medium</option>
                    <option value="Bangla">Bangla</option>
                    <option value="English">English</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border rounded-md p-8 bg-gray-100">
                <div>
                  <p className="block text-sm font-medium text-gray-700">
                    HSC College
                  </p>
                  <input
                    type="text"
                    placeholder="College in HSC"
                    name="hscCollege"
                    defaultValue={profile?.hscCollege || ""}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <p className="block text-sm font-medium text-gray-700">
                    HSC Group
                  </p>
                  <select
                    name="hscGroup"
                    defaultValue={profile?.hscGroup || ""}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select Group</option>
                    <option value="Science">Science</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Arts">Arts</option>
                  </select>
                </div>

                <div>
                  <p className="block text-sm font-medium text-gray-700">
                    HSC Result
                  </p>
                  <input
                    type="number"
                    placeholder="Result in HSC"
                    name="hscResult"
                    defaultValue={profile?.hscResult || ""}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <p className="block text-sm font-medium text-gray-700">
                    HSC Medium
                  </p>
                  <select
                    name="hscMedium"
                    defaultValue={profile?.hscMedium || ""}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select Medium</option>
                    <option value="Bangla">Bangla</option>
                    <option value="English">English</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border rounded-md p-8 bg-gray-100">
                <div>
                  <p className="block text-sm font-medium text-gray-700">
                    Current University
                  </p>
                  <input
                    type="text"
                    placeholder="Current university"
                    name="currentUniversity"
                    defaultValue={profile?.currentUniversity || ""}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <p className="block text-sm font-medium text-gray-700">
                    Current Department
                  </p>
                  <input
                    type="text"
                    placeholder="Current department"
                    name="currentDepartment"
                    defaultValue={profile?.currentDepartment || ""}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <p className="block text-sm font-medium text-gray-700">
                    Current Year in University
                  </p>
                  <input
                    type="number"
                    placeholder="Year"
                    name="currentYearInUniversity"
                    defaultValue={profile?.currentYearInUniversity || ""}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <p className="block text-sm font-medium text-gray-700">
                    Last Semester Result
                  </p>
                  <input
                    type="text"
                    placeholder="Last semester result"
                    name="lastSemesterResult"
                    defaultValue={profile?.lastSemesterResult || ""}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Update Profile
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
