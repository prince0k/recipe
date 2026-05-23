import React, { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SubscribePopup } from "@/components/ui/SubscribePopup";
import { VerificationPopup } from "@/components/VerificationPopup";
import { AdBanner } from "@/components/ui/AdBanner";

export const dynamic = "force-dynamic";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <Suspense fallback={null}>
        <VerificationPopup />
      </Suspense>
      <main className="flex-grow">{children}</main>
      <SubscribePopup />
      <AdBanner placement="GLOBAL_FOOTER" />
      <Footer />
    </>
  );
}

