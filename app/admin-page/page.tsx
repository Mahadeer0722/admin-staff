"use client";

import { useEffect, useState } from "react";
import { ref, onValue, get, set, remove } from "firebase/database";
import { db } from "@/firebase/config";

export default function AdminPage() {
  const [staffData, setStaffData] = useState<any>({});
  const [scores, setScores] = useState<any>({});
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);

  useEffect(() => {
    // Get all projects grouped by staff
    onValue(ref(db, "staff_projects"), (snapshot) => {
      const data = snapshot.val() || {};
      const grouped: any = {};

      Object.keys(data).forEach((key) => {
        const proj = { id: key, ...data[key] };

        if (!grouped[proj.staffName]) {
          grouped[proj.staffName] = {
            staffName: proj.staffName,
            projects: [],
          };
        }
        grouped[proj.staffName].projects.push(proj);
      });

      setStaffData(grouped);
    });

    // Scores
    onValue(ref(db, "staff_scores"), (snapshot) => {
      setScores(snapshot.val() || {});
    });
  }, []);

  // Toggle delete mode
  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    setSelectedStaff([]);
  };

  // Select or unselect staff
  const handleCheckbox = (staffName: string) => {
    if (selectedStaff.includes(staffName)) {
      setSelectedStaff(selectedStaff.filter((s) => s !== staffName));
    } else {
      setSelectedStaff([...selectedStaff, staffName]);
    }
  };

  // Delete selected staff + projects
  const deleteSelected = async () => {
    if (selectedStaff.length === 0) {
      alert("Select at least one staff to delete.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete selected staff and all their projects?"
    );
    if (!confirmDelete) return;

    for (const staffName of selectedStaff) {
      // Delete staff's score
      await remove(ref(db, `staff_scores/${staffName}`));

      // Delete all projects belonging to staff
      const projects = staffData[staffName]?.projects || [];
      for (const proj of projects) {
        await remove(ref(db, `staff_projects/${proj.id}`));
      }
    }

    alert("Selected staff and their projects deleted successfully.");
    setSelectedStaff([]);
    setDeleteMode(false);
  };

  // Accept Project
  const acceptProject = async (staffName: string, projectId: string) => {
    const statusRef = ref(db, `staff_projects/${projectId}/status`);
    const scoreRef = ref(db, `staff_scores/${staffName}/score`);

    const snap = await get(statusRef);
    const currentStatus = snap.exists() ? snap.val() : "pending";

    if (currentStatus === "accepted") {
      alert("Already accepted.");
      return;
    }
    if (currentStatus === "rejected") {
      alert("Cannot accept rejected project.");
      return;
    }

    await set(statusRef, "accepted");

    const scoreSnap = await get(scoreRef);
    const currentScore = scoreSnap.exists() ? scoreSnap.val() : 0;

    await set(scoreRef, currentScore + 1);

    alert("Accepted +1 score");
  };

  // Reject Project
  const rejectProject = async (projectId: string) => {
    const statusRef = ref(db, `staff_projects/${projectId}/status`);

    const snap = await get(statusRef);
    const currentStatus = snap.exists() ? snap.val() : "pending";

    if (currentStatus === "rejected") {
      alert("Already rejected.");
      return;
    }
    if (currentStatus === "accepted") {
      alert("Cannot reject an accepted project.");
      return;
    }

    await set(statusRef, "rejected");

    alert("Rejected.");
  };

  return (
    <div className="min-h-screen p-6 bg-gray-900 text-white">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>

        {/* Delete Button */}
        <button
          onClick={toggleDeleteMode}
          className="bg-red-600 px-4 py-2 rounded font-semibold hover:bg-red-700"
        >
          {deleteMode ? "Cancel Delete" : "Delete"}
        </button>
      </div>

      {/* Delete Selected Button */}
      {deleteMode && selectedStaff.length > 0 && (
        <button
          onClick={deleteSelected}
          className="mb-4 bg-red-700 px-4 py-2 rounded font-semibold hover:bg-red-800"
        >
          Delete Selected ({selectedStaff.length})
        </button>
      )}

      {/* Staff Cards */}
      {Object.values(staffData).map((staff: any) => {
        const staffName = staff.staffName;
        const rejectedCount = staff.projects.filter((p: any) => p.status === "rejected").length;
        const submittedCount = staff.projects.length;
        const score = scores[staffName]?.score || 0;

        return (
          <div key={staffName} className="bg-white text-gray-900 p-5 rounded-xl shadow-lg mb-6">

            {/* Staff Header */}
            <div className="flex justify-between items-center mb-3">

              <div className="flex items-center gap-3">
                {deleteMode && (
                  <input
                    type="checkbox"
                    checked={selectedStaff.includes(staffName)}
                    onChange={() => handleCheckbox(staffName)}
                    className="w-5 h-5"
                  />
                )}

                <h2 className="text-2xl font-bold">{staffName}</h2>
              </div>

              <div className="text-right">
                <p><strong>Submitted:</strong> {submittedCount}</p>
                <p><strong>Rejected:</strong> {rejectedCount}</p>
                <p><strong>Score:</strong> {score}</p>
              </div>
            </div>

            {/* Projects List */}
            {staff.projects.map((proj: any) => (
              <div
                key={proj.id}
                className="bg-gray-100 p-3 rounded border border-gray-300 mb-3"
              >
                <p><strong>Project:</strong> {proj.projectName}</p>
                <p><strong>Status:</strong> {proj.status}</p>

                {proj.status === "pending" && !deleteMode && (
                  <div className="mt-2 flex gap-3">
                    <button
                      onClick={() => acceptProject(staffName, proj.id)}
                      className="bg-green-600 px-4 py-1 rounded text-white hover:bg-green-700"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() => rejectProject(proj.id)}
                      className="bg-red-600 px-4 py-1 rounded text-white hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {proj.status !== "pending" && (
                  <p className="text-sm text-gray-600 italic mt-2">
                    Action completed
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
