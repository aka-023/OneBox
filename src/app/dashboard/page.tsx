"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type Email = {
  id: string;
  subject: string;
  snippet: string;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [emails, setEmails] = useState<Email[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const res = await fetch("/api/emails", {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });
        const data = await res.json();
        setEmails(data);
      } catch (err) {
        console.error("Failed to fetch emails", err);
      }
    };

    if (session?.accessToken) {
      fetchEmails();
    }
  }, [session]);

  if (status === "loading") {
    return <div className="text-center p-10">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-700 text-white p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-6 tracking-wide">OneBox</h1>
          <div className="space-y-1 mb-4">
            <p className="font-medium">{session?.user?.name}</p>
            <p className="text-sm text-indigo-200">{session?.user?.email}</p>
          </div>
          <Link
            href="/dashboard/compose"
            className="inline-block bg-white text-indigo-700 px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-100 transition"
          >
            + Compose
          </Link>
        </div>
        <button
          onClick={() => signOut()}
          className="mt-6 py-2 px-4 bg-red-600 hover:bg-red-700 rounded-md transition w-full"
        >
          Logout
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-gray-100 p-10">
        <h2 className="text-2xl font-semibold mb-6">Inbox</h2>

        {emails.length === 0 ? (
          <p className="text-gray-600">No emails found or loading...</p>
        ) : (
          <ul className="space-y-4">
            {emails.map((email) => (
              <Link key={email.id} href={`/dashboard/email/${email.id}`}>
                <li className="bg-white p-4 rounded-lg shadow hover:shadow-md transition cursor-pointer">
                  <h3 className="font-semibold text-lg text-gray-800">{email.subject}</h3>
                  <p className="text-gray-600 text-sm">{email.snippet}</p>
                </li>
              </Link>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
