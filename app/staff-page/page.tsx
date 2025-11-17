"use client";

import { useState, useEffect } from "react";
import { ref, push } from "firebase/database";
import { db } from "@/firebase/config";
import { useRouter } from "next/navigation";

export default function StaffPage() {
  const router = useRouter();
  const [projectName, setProjectName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loggedUser, setLoggedUser] = useState<any>(null);

  // Load user from localStorage on client only
  useEffect(() => {
    const stored = localStorage.getItem("loggedUser");
    if (stored) {
      setLoggedUser(JSON.parse(stored));
    } else {
      router.replace("/login-page");
    }
  }, []);

  // Prevent rendering until user is loaded
  if (!loggedUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  const staffName = loggedUser.email;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName.trim()) {
      alert("Please enter a project name");
      return;
    }

    try {
      await push(ref(db, "staff_projects"), {
        staffName,
        projectName,
        uploadedAt: new Date().toISOString(),
        status: "pending",
      });

      setSuccessMessage("Project submitted successfully!");
      setProjectName("");

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
      alert("Error submitting project");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-3">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-xl">

        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">
          Project Submission
        </h2>

        {successMessage && (
          <div className="mb-3 p-3 bg-green-200 text-green-900 border border-green-500 rounded font-semibold">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Enter project name"
            className="w-full border border-gray-500 rounded-lg px-3 py-2 bg-gray-100 text-gray-900 placeholder-gray-600"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 transition"
          >
            Submit
          </button>
        </form>

        <button
          onClick={() => router.push("/staff-page/status")}
          className="mt-4 w-full bg-gray-700 text-white py-2 rounded-lg font-semibold hover:bg-gray-800"
        >
          View Status
        </button>

        <button
          onClick={() => {
            localStorage.removeItem("loggedUser");
            router.replace("/login-page");
          }}
          className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
