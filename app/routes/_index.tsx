import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Calendar, User } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Jobify" },
    { name: "description", content: "Welcome to Jobify!" },
  ];
};

export default function Index() {
  return (
    <div className="min-w-80">
      <nav className="bg-blue-500 py-4">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-between">
          <h1 className="text-2xl text-white uppercase mb-4 lg:mb-0">
            Jobify Jobs
          </h1>

          <div className="flex mx-4 lg:mx-0 flex-col items-center lg:flex-row gap-4">
            <select className="px-3 py-2 rounded appearance-none w-full">
              <option value="">Select Filter</option>
              <option value="all">All</option>
              <option value="today">Today</option>
              <option value="recent-jobs">Recent Jobs</option>
              <option value="recent-male-job">Recent Male Jobs</option>
              <option value="recent-female-job">Recent Female Jobs</option>
            </select>
            <form className="flex flex-col gap-4 lg:flex-row lg:gap-2">
              <input
                type="search"
                placeholder="Search here..."
                className="px-3 py-2 rounded"
              />
              <button
                type="button"
                className="text-white font-normal uppercase bg-blue-600 px-3 py-2 rounded"
              >
                Search
              </button>
            </form>
            <div>
              <Link to="/auth/signin">
                <button>
                  <User className="text-white" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto py-4 px-4 xl:px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <JobCard />
          <JobCard />
          <JobCard />
          <JobCard />
          <JobCard />
          <JobCard />
          <JobCard />
          <JobCard />
          <JobCard />
          <JobCard />
          <JobCard />
          <JobCard />
        </div>
      </div>
    </div>
  );
}

const JobCard = () => {
  return (
    <div
      className="bg-white rounded-lg shadow-sm border p-4 mb-4 cursor-pointer
     hover:shadow hover:border-blue-500 transition-all duration-300"
    >
      <div className="flex flex-wrap gap-4 justify-between items-center border-b pb-4 mb-4">
        <h2 className="text-lg font-semibold line-clamp-1">
          <span className="bg-blue-500 text-white px-2 py-1 rounded me-2">
            ID2846
          </span>
          HSC Tutor Needed
        </h2>
        <div className="bg-blue-100 px-2 py-1 text-nowrap text-sm text-blue-600 rounded">
          <Calendar className="inline -mt-1" size={16} /> 23 Jun 2024
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
        <div>
          <p className="text-gray-600 font-medium">Class</p>
          <p className="text-gray-500">HSC</p>
        </div>
        <div>
          <p className="text-gray-600 font-medium">Student Gender</p>
          <p className="text-gray-500">Male</p>
        </div>
        <div>
          <p className="text-gray-600 font-medium">Salary</p>
          <p className="text-gray-500">5000 BDT</p>
        </div>
        <div>
          <p className="text-gray-600 font-medium">Tutoring Time</p>
          <p className="text-gray-500">5 PM</p>
        </div>
      </div>
    </div>
  );
};
