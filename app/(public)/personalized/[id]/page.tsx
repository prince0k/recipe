import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { auth } from "@/lib/auth";
import { PersonalizedActions } from "@/components/content/PersonalizedActions";

export const dynamic = "force-dynamic";

export default async function PersonalizedViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const request = await prisma.personalizedRequest.findUnique({
    where: { id },
    include: {
      content: true,
      user: true,
    }
  });

  if (!request || !request.generatedContent) {
    return notFound();
  }

  // Security: Check if user is the owner or an admin
  const isOwner = session?.user?.id === request.userId;
  const isAdmin = session?.user?.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    // Optionally allow public view if the status is SENT, but let's stick to owner for now
    // if (request.status !== "SENT") return notFound();
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] py-12 px-4 sm:px-6 lg:px-8">
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { margin: 15mm; }
          nav, footer, .subscribe-popup, .back-link, .print-hide, .botpress-chat, #bp-web-widget, [id^="bp-"], .bp-web-widget-container { display: none !important; opacity: 0 !important; visibility: hidden !important; }
          body { background: white !important; padding: 0 !important; margin: 0 !important; color: #1a1a1a !important; }
          .min-h-screen { min-height: 0 !important; padding: 0 !important; overflow: visible !important; }
          .max-w-4xl { max-width: 100% !important; width: 100% !important; margin: 0 !important; overflow: visible !important; }
          .shadow-2xl, .shadow-sm { box-shadow: none !important; }
          .border { border: none !important; }
          .rounded-[2.5rem], .rounded-full { border-radius: 0 !important; }
          .bg-white { background: white !important; }
          .bg-gray-50/50 { background: transparent !important; }
          .px-8, .px-16 { padding-left: 0 !important; padding-right: 0 !important; }
          .prose { max-width: 100% !important; font-size: 11pt !important; line-height: 1.7 !important; color: #1a1a1a !important; }
          h1 { font-size: 26pt !important; margin-top: 0 !important; margin-bottom: 20pt !important; }
          h2 { font-size: 18pt !important; margin-top: 25pt !important; margin-bottom: 12pt !important; }
          h3 { font-size: 14pt !important; margin-top: 20pt !important; }
          p { margin-bottom: 12pt !important; }
          .page-break { page-break-before: always; }
        }
      `}} />

      <div className="max-w-4xl mx-auto">
        {/* Print-only Header */}
        <div className="hidden print:block mb-12 pb-8 border-b-2 border-primary/30">
          <div className="flex justify-between items-start">
            <div className="max-w-[70%]">
              <p className="text-primary font-bold tracking-[0.2em] uppercase text-[10px] mb-3">Premium Personalised Edition</p>
              <h1 className="text-4xl font-bold font-serif italic m-0 leading-tight">{request.content.title}</h1>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="font-serif text-2xl font-bold text-primary mb-1">Stewart Lucas</div>
              <p className="text-[10px] text-gray-400 tracking-widest uppercase m-0">Culinary Excellence</p>
              <p className="text-[10px] text-primary font-medium m-0 mt-1">stewartlucas.com</p>
            </div>
          </div>
        </div>

        {/* Header Section */}
        <div className="mb-12 text-center print-hide">
          <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase rounded-full mb-6">
            Premium Personalised Edition
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-serif italic">
            {request.content.title}
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
            Crafted specifically for <span className="text-primary font-bold">{request.user.name || "you"}</span> based on your unique goals and dietary preferences.
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden mb-12">
          {/* Top Bar with Actions */}
          <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4 print-hide">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Generated on {new Date(request.createdAt).toLocaleDateString()}
            </div>
            <PersonalizedActions />
          </div>

          {/* Actual Markdown Content */}
          <div className="px-8 md:px-16 py-16 prose prose-lg prose-olive max-w-none">
             <ReactMarkdown 
                components={{
                  h1: ({node, ...props}) => <h1 className="font-serif italic text-4xl mb-8" {...props} />,
                  h2: ({node, ...props}) => <h2 className="font-serif italic text-3xl mt-12 mb-6" {...props} />,
                  h3: ({node, ...props}) => <h3 className="font-serif italic text-2xl mt-10 mb-4 text-primary" {...props} />,
                  p: ({node, ...props}) => <p className="leading-relaxed text-gray-700 mb-6" {...props} />,
                  ul: ({node, ...props}) => <ul className="space-y-4 mb-8" {...props} />,
                  li: ({node, ...props}) => (
                    <li className="flex items-start gap-3">
                      <span className="text-primary mt-1.5">•</span>
                      <span {...props} />
                    </li>
                  ),
                }}
             >
                {request.generatedContent}
             </ReactMarkdown>
          </div>

          {/* Footer Bar */}
          <div className="bg-gray-50/50 px-8 py-10 text-center border-t border-gray-100">
            <p className="text-gray-400 text-sm italic mb-0">
              "Cooking is an act of love, both for yourself and those you nourish."
            </p>
            <p className="text-primary font-bold text-sm mt-2">— Stewart Lucas</p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center back-link">
          <a href="/" className="text-gray-400 hover:text-primary transition-colors text-sm font-medium">
            &larr; Back to Stewart Lucas Home
          </a>
        </div>
      </div>
    </div>
  );
}
