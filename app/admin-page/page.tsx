"use client";

import { useEffect, useState } from "react";
import { ref, onValue, get, set, remove } from "firebase/database";
import { db } from "@/firebase/config";

// Convert email (.) → (,) because Firebase path cannot use dots
const fixKey = (email: string) => email.replace(/\./g, ",");

export default function AdminPage() {
  const [staffData, setStaffData] = useState<any>({});
  const [scores, setScores] = useState<any>({});
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);

  // Load DB data
  useEffect(() => {
    // Load projects
    onValue(ref(db, "staff_projects"), (snapshot) => {
      const data = snapshot.val() || {};
      const grouped: any = {};

      Object.keys(data).forEach((key) => {
        const project = { id: key, ...data[key] };

        if (!grouped[project.staffName]) {
          grouped[project.staffName] = { staffName: project.staffName, projects: [] };
        }

        grouped[project.staffName].projects.push(project);
      });

      setStaffData(grouped);
    });

    // Load scores
    onValue(ref(db, "staff_scores"), (snapshot) => {
      setScores(snapshot.val() || {});
    });
  }, []);

  // Toggle selected checkbox
  const toggleSelectStaff = (email: string) => {
    setSelectedStaff((prev) =>
      prev.includes(email) ? prev.filter((s) => s !== email) : [...prev, email]
    );
  };

  // DELETE staff & all projects
  const handleDeleteSelected = async () => {
    if (selectedStaff.length === 0) return alert("Please select a staff member.");

    if (!confirm("Are you sure you want to delete selected staff & all projects?")) return;

    for (let email of selectedStaff) {
      const safeKey = fixKey(email);

      // delete score
      await remove(ref(db, `staff_scores/${safeKey}`));

      // delete projects
      const projects = staffData[email]?.projects || [];
      for (let proj of projects) {
        await remove(ref(db, `staff_projects/${proj.id}`));
      }
    }

    alert("Deleted successfully.");
    setDeleteMode(false);
    setSelectedStaff([]);
  };

  // ACCEPT PROJECT
  const handleAccept = async (email: string, projectId: string) => {
    const safeKey = fixKey(email);
    const statusRef = ref(db, `staff_projects/${projectId}/status`);
    const scoreRef = ref(db, `staff_scores/${safeKey}/score`);

    const snap = await get(statusRef);
    const currentStatus = snap.exists() ? snap.val() : "pending";

    if (currentStatus !== "pending") return;

    await set(statusRef, "accepted");

    const scoreSnap = await get(scoreRef);
    const currentScore = scoreSnap.exists() ? scoreSnap.val() : 0;

    await set(scoreRef, currentScore + 1);
  };

  // REJECT PROJECT
  const handleReject = async (projectId: string) => {
    const statusRef = ref(db, `staff_projects/${projectId}/status`);
    const snap = await get(statusRef);
    const currentStatus = snap.exists() ? snap.val() : "pending";

    if (currentStatus !== "pending") return;

    await set(statusRef, "rejected");
  };

  return (
    <div className="min-h-screen p-6 bg-gray-900 text-white">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>

        <button
          onClick={() => {
            setDeleteMode(!deleteMode);
            setSelectedStaff([]);
          }}
          className="bg-red-600 px-4 py-2 rounded font-semibold hover:bg-red-700"
        >
          {deleteMode ? "Cancel" : "Delete"}
        </button>
      </div>

      {/* Delete Action */}
      {deleteMode && (
        <button
          onClick={handleDeleteSelected}
          className="bg-red-700 mb-4 px-4 py-2 rounded font-semibold hover:bg-red-800"
        >
          Delete Selected ({selectedStaff.length})
        </button>
      )}

      {/* Staff List */}
      {Object.values(staffData).map((staff: any) => {
        const email = staff.staffName;
        const projects = staff.projects;
        const safeKey = fixKey(email);
        const score = scores[safeKey]?.score || 0;
        const rejectedCount = projects.filter((p: any) => p.status === "rejected").length;
        const submittedCount = projects.length;

        return (
          <div key={email} className="bg-white text-gray-900 p-5 rounded-xl shadow-lg mb-6">
            
            {/* Staff Header */}
            <div className="flex justify-between items-center mb-3">
              <div className="flex gap-3 items-center">
                {deleteMode && (
                  <input
                    type="checkbox"
                    checked={selectedStaff.includes(email)}
                    onChange={() => toggleSelectStaff(email)}
                    className="w-5 h-5"
                  />
                )}
                <h2 className="text-xl font-bold">{email}</h2>
              </div>

              <div className="text-right">
                <p><strong>Submitted:</strong> {submittedCount}</p>
                <p><strong>Rejected:</strong> {rejectedCount}</p>
                <p><strong>Score:</strong> {score}</p>
              </div>
            </div>

            {/* Project List */}
            {projects.map((proj: any) => (
              <div key={proj.id} className="bg-gray-100 p-3 rounded border mb-3">

                <p><strong>Project:</strong> {proj.projectName}</p>
                <p><strong>Status:</strong> {proj.status}</p>

                {/* Accept & Reject Buttons */}
                {proj.status === "pending" && !deleteMode && (
                  <div className="mt-2 flex gap-4">
                    <button
                      onClick={() => handleAccept(email, proj.id)}
                      className="bg-green-600 px-4 py-1 rounded text-white hover:bg-green-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(proj.id)}
                      className="bg-red-600 px-4 py-1 rounded text-white hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {proj.status !== "pending" && (
                  <p className="text-sm italic text-gray-600 mt-2">
                    Action Completed
                  </p>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
