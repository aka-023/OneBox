//src/app/dashboard/page.tsx
"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import EmailList, { Email } from "../components/EmailList";
import Link from "next/link";

type Account = {
  _id: string;
  email: string;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);

  const linkAccount = async () => {
    try {
      const res = await fetch("/api/accounts/oauth-url");
      const { url } = await res.json();
      // Redirect the browser to Google’s consent screen
      window.location.href = url;
    } catch (err) {
      console.error("Failed to start link flow", err);
    }
  };


  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Load linked accounts
  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/accounts")
      .then((res) => res.json())
      .then((data: Account[]) => {
        setAccounts(data);
        if (data.length) setSelectedAccount(data[0]);
      });
  }, [session]);

  // Fetch emails for the selected account
  useEffect(() => {
    if (!selectedAccount || !session?.accessToken) return;
    fetch(`/api/emails?account=${selectedAccount.email}`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })
      .then((res) => res.json())
      .then(setEmails)
      .catch(console.error);
  }, [selectedAccount, session]);

  if (status === "loading") return <div className="text-center p-10">Loading...</div>;

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
            className="block bg-white text-indigo-700 px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-100 transition mb-2"
          >
            + Compose
          </Link>
          <button
          onClick={linkAccount}
          className="block bg-white text-indigo-700 px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-100 transition"
        >
          + Add Account
        </button>
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
        <h2 className="text-2xl font-semibold mb-4">Inbox</h2>

        {/* Account Tabs */}
        <div className="mb-6 flex space-x-4">
          {accounts.map((acct) => (
            <button
              key={acct._id}
              onClick={() => setSelectedAccount(acct)}
              className={`px-4 py-2 rounded-md font-medium ${
                selectedAccount?.email === acct.email
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-indigo-700"
              }`}
            >
              {acct.email}
            </button>
          ))}
        </div>

        {/* Email List */}
        <EmailList emails={emails} />
      </div>
    </div>
  );
}