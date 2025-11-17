"use client";

import { useState, useEffect } from "react";
import { ref, get, child } from "firebase/database";
import { db } from "@/firebase/config";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Auto redirect if user already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem("loggedUser");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.role === "administrator") {
        router.replace("/admin-page");
      } else {
        router.replace("/staff-page");
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const snapshot = await get(child(ref(db), "users"));
    if (!snapshot.exists()) {
      alert("No users found");
      return;
    }

    let foundUser: any = null;
    snapshot.forEach((u) => {
      const data = u.val();
      if (data.email === email && data.password === password) {
        foundUser = data;
      }
    });

    if (!foundUser) {
      alert("Invalid email or password");
      return;
    }

    localStorage.setItem("loggedUser", JSON.stringify(foundUser));

    if (foundUser.role === "administrator") {
      router.replace("/admin-page");
    } else {
      router.replace("/staff-page");
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
            className="w-full border rounded-lg px-3 py-2 bg-gray-900"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-lg px-3 py-2 bg-gray-900"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold"
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
