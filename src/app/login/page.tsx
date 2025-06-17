//src/app/login/page.tsx
"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md text-center"
      >
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-4 tracking-tight">
          OneBox
        </h1>

        {!session ? (
          <>
            <h2 className="text-2xl font-semibold mb-6 text-gray-700">
              Login to continue
            </h2>
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition"
            >
              Sign in with Google
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-700 mb-4">
              Welcome, {session.user?.name}
            </h2>
            <p className="text-gray-500 mb-6">{session.user?.email}</p>
            <button
              onClick={() => signOut()}
              className="w-full py-3 px-6 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl shadow-md transition"
            >
              Sign out
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
