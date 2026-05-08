import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Stwart Lucas",
  description: "Learn how Stwart Lucas collects, uses, and protects your personal data. Our privacy policy covers data collection, cookies, subscriber tracking, and your rights under GDPR and CCPA.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "8 May 2026";
  const siteName = "Stwart Lucas";
  const siteUrl = process.env.AUTH_URL || "https://stewartlucas.com";
  const contactEmail = "privacy@stewartlucas.com";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold font-serif text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-12">Last updated: {lastUpdated}</p>

        <div className="prose prose-gray max-w-none space-y-8">
          {/* 1. Introduction */}
          <section>
            <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              Welcome to {siteName} (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). We are committed to protecting your privacy and ensuring your personal data is handled responsibly. This Privacy Policy explains what data we collect, why we collect it, how we use it, and your rights regarding your personal information.
            </p>
            <p className="text-gray-600 leading-relaxed mt-3">
              By using our website at <span className="font-medium">{siteUrl}</span>, subscribing to our newsletter, or interacting with our services, you agree to the terms described in this policy.
            </p>
          </section>

          {/* 2. Data We Collect */}
          <section>
            <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">2. Data We Collect</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We collect the following categories of personal data:
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">2.1 Information You Provide</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
              <li>Name and email address (when subscribing or creating an account)</li>
              <li>Dietary preferences and health-related survey answers (when requesting personalised content)</li>
              <li>Any other information you voluntarily submit through forms on our site</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.2 Information Collected Automatically</h3>
            <p className="text-gray-600 leading-relaxed mb-2">
              When you subscribe to our newsletter or browse our website, we automatically collect:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
              <li><strong>IP address</strong> — used to determine your approximate geographic location (country, city, region)</li>
              <li><strong>Browser type and version</strong> — parsed from your User-Agent header</li>
              <li><strong>Operating system</strong> — parsed from your User-Agent header</li>
              <li><strong>Device type</strong> — whether you are using a desktop, mobile, or tablet device</li>
              <li><strong>Screen resolution</strong> — the display resolution of your device</li>
              <li><strong>Preferred language</strong> — your browser&apos;s language setting</li>
              <li><strong>Timezone</strong> — your local timezone</li>
              <li><strong>Referrer URL</strong> — the website you visited immediately before ours</li>
              <li><strong>Page URL</strong> — which page on our site you were viewing</li>
              <li><strong>Date and time</strong> — when the interaction occurred</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">2.3 Geolocation Data</h3>
            <p className="text-gray-600 leading-relaxed">
              We use your IP address to determine your approximate location (country, city, and region) using a third-party geolocation service (ip-api.com). This data is used for analytics purposes only and is not precise enough to identify your exact street address or location.
            </p>
          </section>

          {/* 3. How We Use Your Data */}
          <section>
            <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">3. How We Use Your Data</h2>
            <p className="text-gray-600 leading-relaxed mb-3">We use the data we collect for the following purposes:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
              <li><strong>Newsletter delivery</strong> — to send you recipes, diet plans, and nutritional content you subscribed to</li>
              <li><strong>Personalisation</strong> — to tailor content recommendations based on your dietary preferences</li>
              <li><strong>Analytics and improvement</strong> — to understand our audience demographics, popular content, and website performance</li>
              <li><strong>Security</strong> — to detect and prevent abuse, fraud, or malicious activity</li>
              <li><strong>Legal compliance</strong> — to comply with applicable laws and regulations</li>
            </ul>
          </section>

          {/* 4. Legal Basis for Processing (GDPR) */}
          <section>
            <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">4. Legal Basis for Processing (GDPR)</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Under the General Data Protection Regulation (GDPR), we process your personal data based on:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
              <li><strong>Consent</strong> — when you voluntarily subscribe to our newsletter or submit a form, you consent to the processing of your data as described in this policy</li>
              <li><strong>Legitimate interest</strong> — we have a legitimate interest in understanding our audience through analytics to improve our services</li>
              <li><strong>Contract performance</strong> — processing necessary to provide the services you requested (e.g., personalised diet plans)</li>
            </ul>
          </section>

          {/* 5. Data Sharing */}
          <section>
            <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">5. Data Sharing &amp; Third Parties</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              <strong>We do not sell your personal data under any circumstances.</strong> We value your trust and your privacy.
            </p>
            <p className="text-gray-600 leading-relaxed mb-3">
              We may share limited data with our trusted <strong>Partners</strong> and the following third-party services to provide and improve our services:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
              <li><strong>Trusted Partners</strong> — We may share anonymous or limited user data with our verified partners listed on our website to enhance our collaborative offerings.</li>
              <li><strong>ip-api.com</strong> — IP geolocation service (receives your IP address to return location data)</li>
              <li><strong>Resend</strong> — email delivery service (receives your email address and name to send newsletters)</li>
              <li><strong>Google Analytics</strong> — website analytics (receives anonymised browsing data)</li>
              <li><strong>Google Gemini API</strong> — AI content generation (does not receive your personal data)</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              All third-party processors are contractually bound to protect your data and use it only for the stated purposes.
            </p>
          </section>

          {/* 6. Data Retention */}
          <section>
            <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">6. Data Retention</h2>
            <p className="text-gray-600 leading-relaxed">
              We retain your subscriber data for as long as you remain subscribed to our newsletter. If you unsubscribe, your email will be added to our suppression list, and your subscriber intelligence data will be deleted within 30 days. Account data for registered users is retained until you request account deletion.
            </p>
          </section>

          {/* 7. Your Rights */}
          <section>
            <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">7. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed mb-3">Under GDPR and CCPA, you have the following rights:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-2">
              <li><strong>Right of access</strong> — request a copy of the personal data we hold about you</li>
              <li><strong>Right to rectification</strong> — request correction of inaccurate data</li>
              <li><strong>Right to erasure</strong> — request deletion of your personal data (&quot;right to be forgotten&quot;)</li>
              <li><strong>Right to restrict processing</strong> — request that we limit how we use your data</li>
              <li><strong>Right to data portability</strong> — receive your data in a structured, machine-readable format</li>
              <li><strong>Right to object</strong> — object to the processing of your data for marketing purposes</li>
              <li><strong>Right to withdraw consent</strong> — withdraw consent at any time by unsubscribing or contacting us</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              To exercise any of these rights, please contact us at <a href={`mailto:${contactEmail}`} className="text-emerald-600 hover:underline">{contactEmail}</a>.
            </p>
          </section>

          {/* 8. Cookies */}
          <section>
            <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">8. Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              We use essential cookies to maintain your session and remember your preferences (e.g., newsletter popup dismissal). We also use analytics cookies via Google Analytics to understand how visitors interact with our website. You can disable cookies through your browser settings at any time, though this may affect some features of our site.
            </p>
          </section>

          {/* 9. Security */}
          <section>
            <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">9. Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. This includes encrypted database connections, secure authentication mechanisms, and access controls on administrative interfaces.
            </p>
          </section>

          {/* 10. Children */}
          <section>
            <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">10. Children&apos;s Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              Our services are not directed to individuals under the age of 16. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us and we will promptly delete it.
            </p>
          </section>

          {/* 11. Changes */}
          <section>
            <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">11. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated &quot;Last updated&quot; date. We encourage you to review this policy periodically.
            </p>
          </section>

          {/* 12. Contact */}
          <section>
            <h2 className="text-xl font-bold font-serif text-gray-900 mb-3">12. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about this Privacy Policy or wish to exercise your data rights, please contact us at:
            </p>
            <div className="mt-3 bg-gray-50 rounded-xl p-4">
              <p className="text-gray-800 font-medium">{siteName}</p>
              <p className="text-gray-600">Email: <a href={`mailto:${contactEmail}`} className="text-emerald-600 hover:underline">{contactEmail}</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
