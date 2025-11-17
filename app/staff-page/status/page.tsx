"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/firebase/config";

export default function ViewStatusPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loggedUser, setLoggedUser] = useState<any>(null);

  // Load user from localStorage (client only)
  useEffect(() => {
    const stored = localStorage.getItem("loggedUser");
    if (stored) {
      setLoggedUser(JSON.parse(stored));
    }
  }, []);

  // Load projects only after user is available
  useEffect(() => {
    if (!loggedUser) return;

    const userEmail = loggedUser.email;

    onValue(ref(db, "staff_projects"), (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.keys(data)
        .map((id) => ({ id, ...data[id] }))
        .filter((p) => p.staffName === userEmail);

      setProjects(list);
    });
  }, [loggedUser]);

  // Prevent UI render until loggedUser is loaded
  if (!loggedUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 text-white">
      <h1 className="text-3xl font-bold text-center mb-6">Project Status</h1>

      {projects.length === 0 && (
        <p className="text-center text-gray-300">No projects submitted yet.</p>
      )}

      {projects.map((proj) => (
        <div
          key={proj.id}
          className="bg-white text-gray-900 p-4 rounded-lg mb-3 shadow-md"
        >
          <p><strong>Project:</strong> {proj.projectName}</p>
          <p><strong>Status:</strong>
            {proj.status === "accepted" && (
              <span className="text-green-700"> Accepted ✔</span>
            )}
            {proj.status === "rejected" && (
              <span className="text-red-700"> Rejected ✖</span>
            )}
            {proj.status === "pending" && (
              <span className="text-yellow-600"> Pending ⏳</span>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
