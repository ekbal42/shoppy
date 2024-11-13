import jwt from "jsonwebtoken";
import { parse } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
interface User {
  name: string;
  userId: string;
  email: string;
  role: "tutor" | "student" | "admin" | "superadmin";
}
export function getUserFromSession(request: Request) {
  const cookies = parse(request.headers.get("Cookie") || "");
  const token = cookies.token;

  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, JWT_SECRET) as User;
  } catch (error) {
    return null;
  }
}
