import { Link } from "@remix-run/react";

const Pagination = ({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: URLSearchParams;
}) => {
  const getPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `?${params.toString()}`;
  };

  return (
    <div className="flex gap-2">
      {page > 1 && (
        <Link
          to={getPageUrl(page - 1)}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Previous
        </Link>
      )}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          to={getPageUrl(p)}
          className={`px-4 py-2 ${
            p === page ? "bg-green-700" : "bg-green-500"
          } text-white rounded`}
        >
          {p}
        </Link>
      ))}
      {page < totalPages && (
        <Link
          to={getPageUrl(page + 1)}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Next
        </Link>
      )}
    </div>
  );
};

export default Pagination;
