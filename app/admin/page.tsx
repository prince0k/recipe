import { getAdminDashboardStats } from "@/lib/queries";
import { Card, CardContent } from "@/components/ui/Card";

export default async function AdminDashboard() {
  const { totalUsers, recentDownloads, publishedContent, latestUsers } = await getAdminDashboardStats();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8 font-serif">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent>
            <h3 className="text-sm font-medium text-gray-500">Total Leads (Users)</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h3 className="text-sm font-medium text-gray-500">Total Downloads</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{recentDownloads}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h3 className="text-sm font-medium text-gray-500">Published Content</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{publishedContent}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Leads</h3>
          </div>
          <div className="p-0">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {latestUsers.map(user => (
                  <tr key={user.id}>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-900">{user.name || "N/A"}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
