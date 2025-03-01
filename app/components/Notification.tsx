import { X } from "lucide-react";
import { useEffect, useState } from "react";

type NotificationType = "success" | "error" | "info";

interface NotificationProps {
  message: string;
  type: NotificationType;
  visibleTime?: number;
}

export function Notification({
  message,
  type,
  visibleTime = 5000,
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, visibleTime);

    return () => clearTimeout(timer);
  }, [visibleTime]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const notificationStyles = {
    success: "bg-green-100 text-green-700 border-green-300",
    error: "bg-red-100 text-red-700 border-red-300",
    info: "bg-blue-100 text-blue-700 border-blue-300",
  };

  return (
    <div
      className={`fixed top-0 left-1/2 transform -translate-x-1/2 mt-4 p-4 border 
        rounded-lg shadow-lg ${notificationStyles[type]} flex justify-between items-start
        transition-all duration-500 ease-in-out gap-4 max-w-96`}
      style={{ top: isVisible ? "1rem" : "-100%" }}
    >
      {message}
      <button
        onClick={handleClose}
        className=" text-gray-500 hover:text-gray-700"
      >
        <X />
      </button>
    </div>
  );
}
