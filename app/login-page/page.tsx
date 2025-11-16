"use client";

import { useState } from "react";
import { ref, get, child } from "firebase/database";
import { db } from "@/firebase/config";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const snapshot = await get(child(ref(db), "users"));
    if (!snapshot.exists()) return alert("No users found");

    let matchedUser: any = null;

    snapshot.forEach((u) => {
      const user = u.val();
      if (user.email === email && user.password === password) {
        matchedUser = user;
      }
    });

    if (!matchedUser) return alert("Invalid credentials");

    if (matchedUser.role === "administrator") {
      router.push("/admin-page");
    } else {
      router.push("/staff-page");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-xl">
        
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">Login</h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded-lg px-3 py-2 bg-gray-100"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-lg px-3 py-2 bg-gray-100"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-2 rounded-lg"
          >
            Login
          </button>
        </form>

        <div className="text-center mt-5">
          <p className="text-gray-700">Don't have an account?</p>
          <button
            onClick={() => router.push("/singup-page")}
            className="text-blue-600 font-semibold underline"
          >
            Create a new account
          </button>
        </div>
      </div>
    </div>
  );
}
