"use client";

import dynamic from "next/dynamic";

export const BotpressChat = dynamic(
  () => import("./BotpressChat").then((m) => m.BotpressChat),
  { ssr: false }
);
