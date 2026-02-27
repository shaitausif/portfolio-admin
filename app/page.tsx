import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";

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

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-10">
      <section className="mx-auto max-w-3xl rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-zinc-900">Portfolio Admin</h1>
        <p className="mt-3 text-zinc-700">You are logged in with JWT authentication.</p>
      </section>
    </main>
  );
}
