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
