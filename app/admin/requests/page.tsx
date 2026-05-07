import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  const requests = await prisma.personalizedRequest.findMany({
    include: {
      user: true,
      content: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Personalised Requests</h1>
          <p className="text-gray-500">Review AI-generated content and email users.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Date</th>
              <th className="py-3 px-4 font-semibold text-gray-600 text-sm">User</th>
              <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Requested Content</th>
              <th className="py-3 px-4 font-semibold text-gray-600 text-sm">Status</th>
              <th className="py-3 px-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 text-sm text-gray-500">
                  {new Date(req.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm font-medium text-gray-900">{req.user.name || "Unknown"}</div>
                  <div className="text-xs text-gray-500">{req.user.email}</div>
                </td>
                <td className="py-3 px-4 text-sm font-medium text-[#10b981]">
                  {req.content.title}
                </td>
                <td className="py-3 px-4">
                  <Badge variant={req.status === "SENT" ? "success" : "warning"}>
                    {req.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  <Link 
                    href={`/admin/requests/${req.id}`}
                    className="text-sm font-medium text-[#10b981] hover:underline"
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  No requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
