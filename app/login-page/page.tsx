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

    try {
      const dbRef = ref(db);
      const snapshot = await get(child(dbRef, "users"));

      if (!snapshot.exists()) {
        alert("No users found");
        return;
      }

      let isValid = false;
      let userRole = "";

      snapshot.forEach((user) => {
        const data = user.val();

        if (data.email === email && data.password === password) {
          isValid = true;
          userRole = data.role; // staff or administrator
        }
      });

      if (isValid) {
        alert("Login successful!");

        // ⭐ REDIRECT BASED ON ROLE
        if (userRole === "administrator") {
          router.push("/admin-page");
        } else if (userRole === "staff") {
          router.push("/staff-page");
        } else {
          alert("Unknown role in database!");
        }

      } else {
        alert("Invalid email or password");
      }

    } catch (error) {
      console.error(error);
      alert("Login error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-3">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-300">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">
          Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* EMAIL */}
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-gray-100 text-gray-900"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Password</label>
            <input
              type="password"
              className="w-full border border-gray-600 rounded-lg px-3 py-2 bg-gray-100 text-gray-900"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* SUBMIT */}
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
