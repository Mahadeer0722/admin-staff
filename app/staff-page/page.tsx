"use client";

import { useState } from "react";
import { ref, push } from "firebase/database";
import { db } from "@/firebase/config";

export default function StaffPage() {
  const [staffName, setStaffName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!staffName.trim() || !projectName.trim()) {
      alert("Please fill all fields!");
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

      // Clear fields
      setStaffName("");
      setProjectName("");

      // Remove message after 3 seconds
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
          Staff Project Submission
        </h2>

        {successMessage && (
          <div className="mb-3 p-3 bg-green-200 border border-green-500 text-green-900 font-semibold rounded">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Staff Name */}
          <div>
            <label className="block mb-1 font-semibold text-gray-800">Staff Name</label>
            <input
              type="text"
              className="w-full border border-gray-500 rounded-lg px-3 py-2"
              placeholder="Enter your name"
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              required
            />
          </div>

          {/* Project Name */}
          <div>
            <label className="block mb-1 font-semibold text-gray-800">Project Name</label>
            <input
              type="text"
              className="w-full border border-gray-500 rounded-lg px-3 py-2"
              placeholder="Enter project name"
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
      </div>
    </div>
  );
}
