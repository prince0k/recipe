"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface RoleDropdownProps {
  userId: string;
  initialRole: string;
  userEmail?: string;
}

export function RoleDropdown({ userId, initialRole, userEmail }: RoleDropdownProps) {
  const [role, setRole] = useState(initialRole);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRoleChange = async (newRole: string) => {
    if (newRole === role) return;

    const confirmed = confirm(
      `Are you sure you want to change the access level of ${userEmail || "this user"} to ${newRole}?`
    );
    if (!confirmed) {
      // Revert select input visual state by forcing a re-render
      setRole("");
      setTimeout(() => setRole(role), 0);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRole(newRole);
        router.refresh();
      } else {
        alert(data.error || "Failed to update user role");
        setRole(initialRole);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update role due to a network error.");
      setRole(initialRole);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = role === "ADMIN";

  return (
    <div className="relative inline-flex items-center">
      {loading ? (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-50 text-slate-400 border border-slate-200/50 animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-450" />
          Updating...
        </span>
      ) : (
        <select
          value={role}
          onChange={(e) => handleRoleChange(e.target.value)}
          disabled={loading}
          className={`cursor-pointer px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border tracking-wider outline-none transition-all duration-200 bg-white ${
            isAdmin
              ? "bg-amber-50/40 text-amber-700 border-amber-200/50 hover:bg-amber-50/80 hover:text-amber-800"
              : "bg-slate-50/40 text-slate-650 border-slate-200/50 hover:bg-slate-50/80 hover:text-slate-750"
          }`}
        >
          <option value="USER" className="bg-white text-slate-700">USER</option>
          <option value="ADMIN" className="bg-white text-amber-700">ADMIN</option>
        </select>
      )}
    </div>
  );
}
