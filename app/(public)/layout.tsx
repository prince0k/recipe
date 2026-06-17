import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SubscribePopup } from "@/components/ui/SubscribePopup";
import { AdBanner } from "@/components/ui/AdBanner";
import dynamic from "next/dynamic";

const VerificationPopup = dynamic(
  () => import("@/components/VerificationPopup").then(mod => mod.VerificationPopup),
  { ssr: false }
);

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <VerificationPopup />
      <main id="main-content" className="flex-grow">{children}</main>
      <SubscribePopup />
      <AdBanner placement="GLOBAL_FOOTER" />
      <Footer />
    </>
  );
}

