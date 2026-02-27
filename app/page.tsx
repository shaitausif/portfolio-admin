import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import Dashboard from "@/components/Dashboard";

async function isAuthenticated() {
  const token = (await cookies()).get("accessToken")?.value;

  if (!token || !process.env.ACCESS_TOKEN_SECRET) {
    return false;
  }

  try {
    const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export default async function Home() {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    redirect("/login");
  }

  return <Dashboard />;
}
