import dayjs from "dayjs";
import { OrderStatus } from "~/types";

interface TimelineItem {
  status: OrderStatus;
  date: string | null;
  text: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

const OrderTimeline: React.FC<any> = ({ order }) => {
  const statusSequence: OrderStatus[] = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
  ];

  const alternativeStatuses: OrderStatus[] = [
    "cancelled",
    "returned",
    "refunded",
    "failed",
    "on_hold",
  ];

  const currentStatusIndex = statusSequence.indexOf(order.status);
  const isAlternativeStatus = alternativeStatuses.includes(order.status);

  const timelineItems: TimelineItem[] = statusSequence.map((status, index) => {
    const isCompleted =
      currentStatusIndex >= index || (isAlternativeStatus && index <= 1);

    const isCurrent = order.status === status;
    const isAlternativeCurrent = isAlternativeStatus && index === 1;

    let date: string | null = null;
    if (isCompleted) {
      if (isCurrent || isAlternativeCurrent) {
        date = dayjs(order.updatedAt).format("MMM D, YYYY");
      } else if (index === 0) {
        date = dayjs(order.createdAt).format("MMM D, YYYY");
      } else {
        date = "--";
      }
    }

    const formatStatusText = (status: string): string => {
      return status
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    let statusText = formatStatusText(status);

    if (isAlternativeCurrent) {
      statusText = formatStatusText(order.status);
    }

    return {
      status,
      date,
      text: statusText,
      isCompleted,
      isCurrent: isCurrent || isAlternativeCurrent,
    };
  });

  if (isAlternativeStatus) {
    timelineItems.splice(1);
  }

  return (
    <ul className="timeline timeline-vertical">
      {timelineItems.map((item, index) => (
        <li key={index}>
          <div className="timeline-start">{item.date || "--"}</div>
          <div className="timeline-middle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`w-5 h-5 ${
                item.isCompleted
                  ? item.isCurrent
                    ? "text-green-500"
                    : "text-nuetral"
                  : "text-gray-300"
              }`}
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div
            className={`timeline-end timeline-box flex items-center gap-2 ${
              item.isCurrent
                ? "bg-green-100 border border-green-300  text-green-500"
                : ""
            } ${item.isCompleted ? "" : "opacity-70"}`}
          >
            {item.text}
            {item.isCurrent && <></>}
          </div>
        </li>
      ))}

      {isAlternativeStatus && (
        <li>
          <div className="timeline-start">
            {dayjs(order.updatedAt).format("MMM D, YYYY")}
          </div>
          <div className="timeline-middle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 text-error"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28-7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="timeline-end timeline-box bg-red-100 border border-red-300  text-red-500">
            {order.status
              .split("_")
              .map((word: any) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </div>
        </li>
      )}
    </ul>
  );
};

export default OrderTimeline;
