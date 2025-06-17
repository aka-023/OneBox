// src/app/dashboard/compose/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ComposeEmailPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<{ email: string }[]>([]);
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // Load linked accounts to choose 'from'
  useEffect(() => {
    fetch("/api/accounts")
      .then((res) => res.json())
      .then((data: { email: string }[]) => {
        setAccounts(data);
        if (data.length) {
          setFormData((prev) => ({ ...prev, from: data[0].email }));
        }
      })
      .catch(console.error);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send email.");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4">Compose Email</h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">From</label>
            <select
              name="from"
              value={formData.from}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            >
              {accounts.map((acct) => (
                <option key={acct.email} value={acct.email}>
                  {acct.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">To</label>
            <input
              type="email"
              name="to"
              value={formData.to}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Subject</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={6}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded hover:bg-indigo-700 transition"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
