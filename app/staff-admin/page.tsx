"use client";

import { useState } from "react";
import { ref, set } from "firebase/database";
import { db } from "@/firebase/config"; // <-- IMPORTANT

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("staff");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
console.log("sumit clicked")
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      // Generating a simple unique ID
      const userId = Date.now().toString();

      // Store user data in Realtime Database
      await set(ref(db, "users/" + userId), {
        email: email,
        password: password,
        role: role,
        createdAt: new Date().toISOString(),
      });

      alert("User data stored successfully!");
      
      // Clear form
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRole("staff");

    } catch (error) {
      console.error(error);
      alert("Error storing data in Firebase");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-3">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-300">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>
            <label className="block mb-1 font-semibold text-gray-800">Email</label>
            <input
              type="email"
              className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 font-semibold text-gray-800">Password</label>
            <input
              type="password"
              className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-1 font-semibold text-gray-800">Confirm Password</label>
            <input
              type="password"
              className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Role */}
          <div>
            <label className="block mb-1 font-semibold text-gray-800">Role</label>
            <select
              className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="staff">Staff</option>
              <option value="administrator">Administrator</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 transition shadow-md"
          >
            Submit
          </button>

        </form>
      </div>
    </div>
  );
}
