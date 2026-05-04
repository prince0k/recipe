import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/Card";

export default async function AnalyticsPage() {
  const [totalViews, uniqueVisitors] = await Promise.all([
    prisma.pageView.count(),
    prisma.pageView.groupBy({
      by: ['userId'],
      _count: true,
    })
  ]);

  const topContent = await prisma.download.groupBy({
    by: ['contentId'],
    _count: { contentId: true },
    orderBy: { _count: { contentId: 'desc' } },
    take: 5
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 font-serif mb-8">Analytics & Tracking</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent>
            <h3 className="text-sm font-medium text-gray-500">Total Page Views (Internal Tracking)</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{totalViews}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <h3 className="text-sm font-medium text-gray-500">Tracked Visitors (Logged in)</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{uniqueVisitors.filter(v => v.userId !== null).length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Google Analytics Integration</h3>
        </div>
        <CardContent>
          <p className="text-gray-600 mb-4">
            For deep analytics including session duration, bounce rate, and full traffic sources, please refer to your Google Analytics 4 dashboard.
          </p>
          <a 
            href="https://analytics.google.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#10b981] font-medium hover:underline"
          >
            Open Google Analytics &rarr;
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
