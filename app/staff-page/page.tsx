"use client";

import { useState } from "react";
import { ref, push } from "firebase/database";
import { db } from "@/firebase/config";
import { useRouter } from "next/navigation";

export default function StaffPage() {
  const router = useRouter();
  const [projectName, setProjectName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Getting logged user data from localStorage
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser") || "{}");
  const staffName = loggedUser.email; // use email as identifier

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
        status: "pending"
      });

      setSuccessMessage("Project submitted successfully!");
      setProjectName("");

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error(error);
      alert("Error submitting project");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-3">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-xl">

        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">
          Project Submission
        </h2>

        {/* Display success message */}
        {successMessage && (
          <div className="mb-3 p-3 bg-green-200 border border-green-500 text-green-900 font-semibold rounded">
            {successMessage}
          </div>
        )}

        {/* Submission form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 font-semibold text-gray-800">Project Name</label>
            <input
              type="text"
              className="w-full border border-gray-500 rounded-lg px-3 py-2 bg-gray-900"
              placeholder="Enter your project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 transition"
          >
            Submit
          </button>
        </form>

        {/* View Status Button */}
        <button
          onClick={() => router.push("/staff-page/status")}
          className="mt-4 w-full bg-gray-700 text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition"
        >
          View Status
        </button>

        {/* Logout */}
        <button
          onClick={() => {
            localStorage.removeItem("loggedUser");
            router.replace("/login-page");
          }}
          className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition"
        >
          Logout
        </button>

      </div>
    </div>
  );
}
