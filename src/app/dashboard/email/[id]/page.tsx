// src/app/dashboard/email/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Email = {
  subject: string;
  from: string;
  body: string;
};

export default function EmailDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [email, setEmail] = useState<Email>();

  useEffect(() => {
    const fetchEmail = async () => {
      const res = await fetch(`/api/emails/${id}`);
      const data = await res.json();
      setEmail(data);
    };
    fetchEmail();
  }, [id]);

  if (!email) return <div className="p-10 text-center">Loading email...</div>;

  return (
    <div className="min-h-screen p-10 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-4 text-indigo-600 hover:underline font-medium text-sm"
        >
          ← Back to Inbox
        </button>

        <h1 className="text-2xl font-bold mb-2">{email.subject || "(No Subject)"}</h1>
        <p className="text-sm text-gray-500 mb-4">From: {email.from}</p>
        <div
          className="text-gray-700"
          dangerouslySetInnerHTML={{ __html: email.body }}
        />
      </div>
    </div>
  );
}
