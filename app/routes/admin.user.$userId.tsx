import { useLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "~/db.server"; // Adjust the import path as needed

export async function loader({ params }: LoaderFunctionArgs) {
  const userId = Number(params.userId);

  if (!userId) {
    throw new Response("User ID is required", { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
    },
  });

  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  return { user };
}
export default function User() {
  const { user } = useLoaderData<typeof loader>();
  console.log(user);

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 mb-4 lg:mb-0 lg:gap-4">
        <div className="col-span-1 space-y-4">
          <div className="flex flex-col gap-4 border rounded-md justify-center items-center bg-gray-100 py-12">
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
        <div className="col-span-2">
          <div className="bg-gray-100 p-4 px-6 mb-4 border rounded-md">
            <p className="text-lg text-center lg:text-start text-green-500 uppercase font-semibold">
              User profile
            </p>
          </div>
          {user.profile && (
            <div className="mb-12 max-w-5xl mx-auto">
              <div className="grid grid-cols-1 gap-4">
                {/* Basic Info Card */}
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-md transform hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <svg
                          className="w-6 h-6 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">
                        Basic Info
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white/50 p-3 rounded-lg">
                        <span className="font-medium text-gray-700">Bio</span>
                        <p className="text-gray-800 mt-1">
                          {user.profile.bio || "Not provided"}
                        </p>
                      </div>
                      <div className="bg-white/50 p-3 rounded-lg">
                        <span className="font-medium text-gray-700">
                          Gender
                        </span>
                        <p className="text-gray-800 mt-1">
                          {user.profile.gender || "Not specified"}
                        </p>
                      </div>
                      <div className="bg-white/50 p-3 rounded-lg">
                        <span className="font-medium text-gray-700">
                          Location
                        </span>
                        <p className="text-gray-800 mt-1">
                          {user.profile.livingLocation || "Not set"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Education Card */}
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-md transform hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="bg-green-100 p-2 rounded-full">
                        <svg
                          className="w-6 h-6 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 14l9-5-9-5-9 5 9 5z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">
                        Education
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white/50 p-3 rounded-lg">
                        <p className="font-medium text-gray-700">Exam : SSC</p>
                        <p className="text-gray-800 mt-1">
                          School : {user.profile.sscSchool || "N/A"}
                        </p>
                        <p> Result : {user.profile.sscResult || "N/A"}</p>
                      </div>
                      <div className="bg-white/50 p-3 rounded-lg">
                        <p className="font-medium text-gray-700">Exam : HSC</p>
                        <p className="text-gray-800 mt-1">
                          College : {user.profile.hscCollege || "N/A"}
                        </p>
                        <p className="text-gray-800 mt-1">
                          Result : {user.profile.hscResult || "N/A"}
                        </p>
                      </div>
                      <div className="bg-white/50 p-3 rounded-lg">
                        <p className="font-medium text-gray-700">University</p>
                        <p className="text-gray-800 mt-1">
                          University : {user.profile.currentUniversity || "N/A"}
                        </p>
                        <p className="text-gray-800 mt-1">
                          Department : {user.profile.currentDepartment || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preferred Locations Card */}
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-md transform hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <svg
                          className="w-6 h-6 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800">
                        Preferred Locations
                      </h3>
                    </div>
                    <div className="space-y-3 capitalize">
                      {user.profile.preferredLocations ? (
                        user.profile.preferredLocations
                          .split(",")
                          .map((location, index) => (
                            <div
                              key={index}
                              className="bg-white/50 p-3 rounded-lg flex items-center justify-between hover:bg-white/70 transition-colors"
                            >
                              <span className="text-gray-800">
                                {location.trim() || "N/A"}
                              </span>
                              <span className="text-sm text-purple-600 font-medium">
                                #{index + 1}
                              </span>
                            </div>
                          ))
                      ) : (
                        <div className="bg-white/50 p-3 rounded-lg text-gray-600">
                          No preferred locations set
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
