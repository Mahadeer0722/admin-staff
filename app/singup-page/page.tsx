"use client";

import { useState } from "react";
import { ref, push } from "firebase/database";
import { db } from "@/firebase/config";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("staff");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    await push(ref(db, "users"), {
      email,
      password,
      role,
    });

    alert("Account created successfully!");
    router.push("/login-page");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-3">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-xl">

        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">
          Sign Up
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

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
            className="w-full border rounded-lg px-3 py-2 bg-gray-900"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full border rounded-lg px-3 py-2 bg-gray-900"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <select
            className="w-full border rounded-lg px-3 py-2 bg-gray-100"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="staff">Staff</option>
            <option value="administrator">Administrator</option>
          </select>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg"
          >
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}
