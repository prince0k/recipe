import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PersonalizedLandingClient } from "./PersonalizedLandingClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Personalized Nutrition Plan",
  description: "Get your personalized nutrition plans and recipes tailored to your specific health goals and diet preferences.",
  alternates: {
    canonical: "https://stewartlucas.com/personalized",
  },
  openGraph: {
    title: "Personalized Nutrition Plan | NutriGuide",
    description: "Get your personalized nutrition plans and recipes tailored to your specific health goals and diet preferences.",
    url: "https://stewartlucas.com/personalized",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default async function PersonalizedPage() {
  const session = await auth();

  // Find a default diet plan to base personalizations on
  const defaultDietPlan = await prisma.content.findFirst({
    where: { type: "DIET_PLAN", published: true }
  });

  // If logged in, fetch user's existing personalized plans
  let existingPlans: any[] = [];
  if (session?.user?.id) {
    existingPlans = await prisma.personalizedRequest.findMany({
      where: { userId: session.user.id },
      include: {
        content: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  // Serialize plans to prevent serialization warning issues
  const serializedPlans = existingPlans.map(p => ({
    id: p.id,
    createdAt: p.createdAt.toISOString(),
    status: p.status,
    contentTitle: p.content.title
  }));

  const serializedPlan = defaultDietPlan ? {
    id: defaultDietPlan.id,
    title: defaultDietPlan.title,
    painPointQuestions: defaultDietPlan.painPointQuestions
  } : null;

  return (
    <PersonalizedLandingClient 
      session={session} 
      defaultDietPlan={serializedPlan} 
      existingPlans={serializedPlans} 
    />
  );
}
