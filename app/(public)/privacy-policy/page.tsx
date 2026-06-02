import React from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "This Privacy Policy explains how Lucas Stewart Ventures collects, uses, and shares your personal information.",
  alternates: {
    canonical: "https://stewartlucas.com/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy | NutriGuide",
    description: "This Privacy Policy explains how Lucas Stewart Ventures collects, uses, and shares your personal information.",
    url: "https://stewartlucas.com/privacy-policy",
    images: [
      {
        url: "https://stewartlucas.com/assets/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Privacy Policy | Lucas Stewart Ventures",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | NutriGuide",
    description: "This Privacy Policy explains how Lucas Stewart Ventures collects, uses, and shares your personal information.",
    images: ["https://stewartlucas.com/assets/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "March 13, 2025";

  const breadcrumbListSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://stewartlucas.com" },
      { "@type": "ListItem", "position": 2, "name": "Privacy Policy", "item": "https://stewartlucas.com/privacy-policy" }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListSchema) }}
      />
      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8 animate-fade-in">
          <Breadcrumbs items={[{ label: "Privacy Policy" }]} />
          <h1 className="text-4xl font-bold font-serif text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-12">Last Updated: {lastUpdated}</p>

        <div className="prose prose-slate max-w-none space-y-8">
          <p className="text-gray-600 leading-relaxed">
            This Privacy Policy explains how Lucas Stewart Ventures (the owner of stewartlucas.com and related brands, referred to as &ldquo;Lucas Stewart,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects, uses, and shares your personal information. It applies to:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
            <li>Our website (stewartlucas.com) and any authorized sites linked to this Privacy Policy.</li>
            <li>Email newsletters and other email communications we send.</li>
            <li>Our social media pages.</li>
            <li>Other services, contests, or features we offer (collectively, the &ldquo;Platform&rdquo;).</li>
          </ul>
          <p className="text-gray-600 leading-relaxed">
            Some sections of this Privacy Policy may vary depending on where you live, as noted below.
          </p>

          <section>
            <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">Modifications to This Privacy Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this policy at any time. If we change how we collect, use, or share your personal information, we will post the revised policy here. In some cases, we may also notify you by email, Platform notifications, or other required methods. Your continued use of the Platform after changes are posted means you accept the updated policy. We recommend that you review this Privacy Policy periodically to stay informed about our latest practices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">Collection of Personal Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We collect and use various types of personal information to operate our Platform and provide our services. This information may include:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mb-4">
              <li><strong>Contact Information:</strong> Your email address, mailing address, or social media handle.</li>
              <li><strong>User Submissions:</strong> Content you upload or submit (text, images, audio, video) and any associated metadata.</li>
              <li><strong>Marketing Preferences:</strong> Your choices about receiving newsletters, promotions, and how you engage with our communications.</li>
              <li><strong>Account Information:</strong> Details you provide when creating an account or setting up a profile on our Platform.</li>
              <li><strong>Survey and Sweepstakes Responses:</strong> Information you give when participating in surveys, questionnaires, contests, or sweepstakes.</li>
              <li><strong>Demographic Information:</strong> City, state, postal code, age, gender, income range, education level, marital status, occupation, military status, industry, and personal interests (often collected through surveys or account profiles).</li>
              <li>
                <strong>Online Activity Information:</strong> Data about how you interact with our Platform, such as:
                <ul className="list-circle list-inside text-gray-500 space-y-1 ml-6 mt-1.5">
                  <li>The website or app you visited before coming to our site.</li>
                  <li>Pages or screens you view and how long you spend on them.</li>
                  <li>Navigation paths within our Platform.</li>
                  <li>Your actions on pages or emails (clicks, interactions).</li>
                  <li>Timestamps of your visits and activities.</li>
                </ul>
              </li>
              <li>
                <strong>Device Information:</strong> Technical data about the computer or mobile device you use to access our Platform, such as:
                <ul className="list-circle list-inside text-gray-500 space-y-1 ml-6 mt-1.5">
                  <li>Operating system and version.</li>
                  <li>Wireless carrier, device manufacturer, and model.</li>
                  <li>Device identifiers (like Google Advertising ID or Apple ID for Advertising).</li>
                  <li>Browser type and screen resolution.</li>
                  <li>IP address and general location data (city, state, or region).</li>
                </ul>
              </li>
              <li><strong>Communications:</strong> Any information you provide when you contact us with questions or feedback (for example, via email or contact forms).</li>
            </ul>

            <p className="text-gray-600 leading-relaxed mb-3">We collect this information in a few ways:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li><strong>Information You Provide Directly:</strong> When you register for an account, sign up for our newsletters, enter contests, fill out surveys, or otherwise communicate with us, you provide personal information (such as your name, email, or demographic details).</li>
              <li><strong>Information from Third Parties:</strong> We may receive personal information from third-party partners or services, such as advertising and marketing partners, affiliate networks, analytics providers, sweepstakes/contest organizers, publicly available databases, and social media platforms. If we obtain your info through a social platform, we treat it according to this policy. We may also combine third-party data with info we collect ourselves.</li>
              <li>If our Platform includes a &ldquo;refer a friend&rdquo; feature, only submit someone&rsquo;s contact info with their permission. We take privacy seriously.</li>
              <li>
                <strong>Automatic Collection:</strong> We and our partners automatically log certain information about your device and interactions. Like many websites, we use cookies and similar technologies to collect and process this data, including:
                <ul className="list-circle list-inside text-gray-500 space-y-1 ml-6 mt-1.5">
                  <li><strong>Cookies:</strong> Small text files stored on your device that help recognize your browser, remember settings, understand user activity, and serve personalized content/ads.</li>
                  <li><strong>Flash Cookies:</strong> Similar to cookies but can store larger amounts of data.</li>
                  <li><strong>Web Beacons (Pixel Tags, Clear GIFs):</strong> Tiny invisible images embedded in pages or emails that tell us if they were opened, help compile statistics, and measure campaign performance.</li>
                  <li><strong>Local Storage:</strong> Data saved directly on your device through your browser/app to remember preferences or track interactions.</li>
                  <li><strong>Session-Replay Technologies:</strong> Third-party software that records a video-like replay of interactions (clicks, scrolling, typing) for research, troubleshooting, and experience optimization.</li>
                </ul>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">Use of Personal Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We use the personal information we collect for various business and operational purposes, as described below or where disclosed at the time of collection:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-3 ml-4">
              <li>
                <strong>Providing and Operating the Platform:</strong>
                <ul className="list-circle list-inside text-gray-500 space-y-1 ml-6 mt-1.5">
                  <li>To create, manage, and maintain your account or user profile.</li>
                  <li>To respond to your inquiries, feedback, and service requests.</li>
                  <li>To send you important notices (like account updates, security alerts, or legal info).</li>
                  <li>To send confirmations, invoices, and notifications related to transactions.</li>
                  <li>To verify your identity and eligibility for promotions, offers, or contests.</li>
                  <li>To deliver the services or content you request, including products you purchase.</li>
                  <li>To personalize and enhance your experience on our Platform.</li>
                  <li>To communicate with you about our products, services, offers, and promotions.</li>
                  <li>To facilitate your participation in promotions, surveys, contests, and sweepstakes.</li>
                  <li>To monitor and analyze Platform usage trends and user engagement.</li>
                </ul>
              </li>
              <li>
                <strong>Advertising:</strong>
                <p className="text-gray-600 leading-relaxed ml-6 mt-1.5">
                  We and our partners use collected information to display and serve relevant advertisements. Our partners may collect data across websites and services to create targeted ads. Ads may be delivered by us or by ad networks. For example, if you shop at a physical store and that data is shared with our partners, they might use it to show you ads related to your purchase. Personal info may be used to recognize you across devices, analyze and report on ads, optimize marketing campaigns, and securely target lookalike audiences on other platforms using hashed customer lists.
                </p>
              </li>
              <li>
                <strong>Newsletters and Promotional Communications:</strong>
                <p className="text-gray-650 leading-relaxed ml-6 mt-1.5">
                  We may send you newsletters, updates, announcements, or promotional materials in compliance with applicable law. You can opt out of marketing emails any time using the unsubscribe link or contacting us. Service-related emails (like receipts) will still be sent.
                </p>
              </li>
              <li>
                <strong>Research and Development:</strong>
                <p className="text-gray-655 leading-relaxed ml-6 mt-1.5">
                  We study user behavior and demographics to identify trends, improve our Platform, and develop new features, products, or services.
                </p>
              </li>
              <li>
                <strong>Legal Compliance:</strong>
                <p className="text-gray-655 leading-relaxed ml-6 mt-1.5">
                  We may use or disclose personal information to comply with laws, regulations, legal processes (such as subpoenas), or government requests.
                </p>
              </li>
              <li>
                <strong>Compliance, Fraud Prevention, and Safety:</strong>
                <p className="text-gray-655 leading-relaxed ml-6 mt-1.5">
                  We may share or use personal info when necessary to protect the safety, security, and integrity of our Platform (preventing fraud, investigating illegal activities, or defending against cyberattacks).
                </p>
              </li>
              <li>
                <strong>With Your Consent:</strong>
                <p className="text-gray-655 leading-relaxed ml-6 mt-1.5">
                  In some cases, we will ask for your explicit consent before collecting, using, or sharing your personal information.
                </p>
              </li>
              <li>
                <strong>Anonymous or De-Identified Data:</strong>
                <p className="text-gray-655 leading-relaxed ml-6 mt-1.5">
                  We may remove identifying details from your info so that it can&rsquo;t be tied back to you for analysis, insights, or sharing. We will keep it de-identified.
                </p>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">Disclosure of Personal Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We may share your personal information in the following situations, in accordance with this Privacy Policy:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li><strong>Related Companies:</strong> We may share your data with our parent company, affiliates, subsidiaries, or other companies under common control with Lucas Stewart Ventures.</li>
              <li><strong>Service Providers:</strong> We use third-party companies and individuals to help perform services on our behalf (e.g., website hosting, email delivery, database management, fraud detection, ad services, payment processing). They only have access to information needed for their tasks and must maintain its confidentiality.</li>
              <li><strong>Advertising Partners:</strong> We work with advertising partners who collect tracking data to serve targeted ads on our Platform or other sites, or use hashed customer lists to target ads to you or similar users.</li>
              <li><strong>Sweepstakes and Joint Marketing Partners:</strong> If you enter contests or co-sponsored promotions, we may share your info with campaign partners who may send you promotional materials.</li>
              <li><strong>Other Users and the Public:</strong> Certain features allow you to share info publicly (e.g., comments, reviews). Public content, name, username, or profile links may be visible to others. Use caution when sharing personal details.</li>
              <li><strong>Professional Advisors:</strong> We may share info with lawyers, accountants, financial advisors, or insurance consultants bound by confidentiality.</li>
              <li><strong>Compliance, Fraud Prevention, and Safety:</strong> We may disclose info to comply with laws, respond to lawful requests (like subpoenas), protect our rights, prevent abuse, or cooperate with law enforcement.</li>
              <li><strong>Business Transactions:</strong> If involved in a merger, sale of assets, financing, or bankruptcy, personal info may be shared with involved parties under terms consistent with this policy.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">Your Choices Regarding Your Personal Information</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li><strong>Review and Update Account Information:</strong> Log in and review or update your personal info, privacy settings, or communication preferences in your profile.</li>
              <li><strong>Opt-Out of Marketing Emails:</strong> Click the &ldquo;unsubscribe&rdquo; link at the bottom of marketing emails or email us at <a href="mailto:privacy@stewartlucas.com" className="text-emerald-600 hover:underline">privacy@stewartlucas.com</a>. Service-related emails will still be sent.</li>
              <li><strong>Control Cookies and Web Storage:</strong> Delete or block cookies through your browser settings. Some features may not work properly if cookies are blocked. See <a href="https://www.allaboutcookies.org/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">All About Cookies</a> for more details.</li>
              <li><strong>Google Analytics:</strong> We use Google Analytics to study site usage. To opt out, you can install the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Google Analytics Opt-out Add-on</a>.</li>
              <li><strong>Advertising Choices:</strong> Limit interest-based advertising by blocking third-party cookies, using tracking-blocker browser extensions, or adjusting advertising ID settings on mobile devices. You can also visit opt-out pages like the <a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Network Advertising Initiative</a> and <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Digital Advertising Alliance</a>.</li>
              <li><strong>Do Not Track:</strong> At this time, our Platform does not respond to DNT signals, as there is no standard for how to interpret them.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">Other Sites and Services</h2>
            <p className="text-gray-600 leading-relaxed">
              Our Platform may link to third-party websites or services for your convenience. We do not control and are not responsible for their content or privacy practices. Review their policies before providing personal info.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">Security of Personal Information</h2>
            <p className="text-gray-600 leading-relaxed">
              We take reasonable technical and organizational measures to protect your personal info, but no system is completely secure. You can help protect your data by using strong passwords and secure networks.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">Children&rsquo;s Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              Our Platform is intended for users aged 18 and over. We do not knowingly collect info from children under 18. If we learn we did, we will take steps to delete it immediately. Contact us if you believe a child provided us data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">International Transfers of Personal Information</h2>
            <p className="text-gray-600 leading-relaxed">
              We operate in the U.S. and work with global service providers. By using the Platform, you acknowledge and consent that your info may be transferred, stored, or processed outside of your home country, where privacy laws may differ.
            </p>
          </section>

          <section className="border-t border-slate-100 pt-8">
            <h2 className="text-2xl font-bold font-serif text-gray-900 mb-4">Notice to California Residents</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              This section applies to California residents under the California Consumer Privacy Act (CCPA).
            </p>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Personal Information We Collect (CCPA Categories)</h3>
            <p className="text-gray-600 leading-relaxed mb-3">
              In the past 12 months, we have collected: Identifiers, Customer Records, Protected Classifications, Commercial Information, Internet or Network Activity, Sensory Information, Professional/Employment Info, and Inferences. We do not collect sensitive personal info to infer characteristics.
            </p>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Disclosure, &ldquo;Sale,&rdquo; and &ldquo;Sharing&rdquo;</h3>
            <p className="text-gray-600 leading-relaxed mb-3">
              Disclosures to advertising partners or marketing partners may qualify as &ldquo;sales&rdquo; or &ldquo;sharing&rdquo; under the CCPA (providing info to another business for cross-context behavioral ads). In the past 12 months, we may have sold or shared: Identifiers, Customer Records, Commercial Info, Internet/Network Activity, and Inferences with affiliates, advertising, and marketing partners. We do not knowingly sell/share data of consumers under 16.
            </p>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Retention of Personal Information</h3>
            <p className="text-gray-600 leading-relaxed mb-3">
              We retain personal info as long as necessary to fulfill processing purposes, comply with legal obligations, resolve disputes, and enforce agreements. After the retention period, data is deleted or anonymized.
            </p>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Privacy Rights (California)</h3>
            <p className="text-gray-600 leading-relaxed mb-3">
              California residents have the right to: Delete, Know/Access, Correct, Opt-Out of Sale/Sharing, and Non-Discrimination. To exercise rights, email <a href="mailto:privacy@stewartlucas.com" className="text-emerald-600 hover:underline">privacy@stewartlucas.com</a> with the subject &ldquo;CCPA Consumer Request.&rdquo; To opt out of sales/sharing, use the &ldquo;Your Privacy Choices&rdquo; link or a Global Privacy Control (GPC) signal.
            </p>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">California Notice of Financial Incentive</h3>
            <p className="text-gray-600 leading-relaxed">
              We may offer incentives (e.g. exclusive content, sweepstakes entries) in exchange for personal info. Participation is voluntary, and you can opt out at any time.
            </p>
          </section>

          <section className="border-t border-slate-100 pt-8">
            <h2 className="text-2xl font-bold font-serif text-gray-900 mb-4">Notice to Nevada Residents</h2>
            <p className="text-gray-650 leading-relaxed">
              Nevada residents have the right to opt out of the sale of certain personal information. If you wish to opt out, email <a href="mailto:privacy@stewartlucas.com" className="text-emerald-600 hover:underline">privacy@stewartlucas.com</a> with the subject line &ldquo;Nevada Opt-Out Request.&rdquo;
            </p>
          </section>

          <section className="border-t border-slate-100 pt-8">
            <h2 className="text-2xl font-bold font-serif text-gray-900 mb-4">State Privacy Laws Addendum</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Residents of Colorado, Virginia, Delaware, and other applicable states have rights described below:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
              <li><strong>Right to Access:</strong> Request confirmation of processing and get a portable copy of your data.</li>
              <li><strong>Right to Correct:</strong> Request correction of inaccurate personal info.</li>
              <li><strong>Right to Delete:</strong> Request deletion of collected personal info.</li>
              <li><strong>Right to Opt-Out:</strong> Opt out of profiling, sales, or targeted advertising.</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              To exercise these rights, email <a href="mailto:privacy@stewartlucas.com" className="text-emerald-600 hover:underline">privacy@stewartlucas.com</a> with the subject &ldquo;Privacy Request&rdquo; and specify your state of residence.
            </p>
          </section>

          <section className="border-t border-slate-100 pt-8">
            <h2 className="text-2xl font-bold font-serif text-gray-900 mb-4">Contacting Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions or comments about this Privacy Policy, contact us at:
            </p>
            <div className="mt-4 bg-slate-50 border border-slate-100 rounded-2xl p-6 max-w-md">
              <p className="text-slate-800 font-bold font-serif text-base">Lucas Stewart Ventures</p>
              <p className="text-slate-600 text-sm mt-1">123 Venture Parkway</p>
              <p className="text-slate-600 text-sm">Redmond, WA 98052</p>
              <p className="text-slate-600 text-sm">United States</p>
              <p className="text-slate-800 text-sm mt-3 font-semibold">
                Email: <a href="mailto:privacy@stewartlucas.com" className="text-emerald-600 hover:underline">privacy@stewartlucas.com</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
    </>
  );
}
