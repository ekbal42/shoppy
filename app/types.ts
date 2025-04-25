export interface LoaderData {
  toast?: Toast;
}

export interface ActionData {
  toast?: Toast;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export const orderStatus = {
  pending: "pending",
  confirmed: "confirmed",
  processing: "processing",
  shipped: "shipped",
  delivered: "delivered",
  cancelled: "cancelled",
  returned: "returned",
  refunded: "refunded",
  failed: "failed",
  on_hold: "on_hold",
};

export type OrderStatus = 
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned"
  | "refunded"
  | "failed"
  | "on_hold";
