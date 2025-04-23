import jwt from "jsonwebtoken";
import { parse } from "cookie";
import { prisma } from "./db.server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
interface User {
  name: string;
  userId: string;
  email: string;
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

export async function getUserById(userId: number | undefined) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: String(userId),
      },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user by ID:", userId);
    throw error;
  }
}
