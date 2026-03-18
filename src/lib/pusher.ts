import Pusher from "pusher";

const globalForPusher = global as unknown as { pusher: Pusher };

export const pusher =
  globalForPusher.pusher ||
  new Pusher({
    appId: process.env.SOKETI_APP_ID!,
    key: process.env.NEXT_PUBLIC_SOKETI_APP_KEY!,
    secret: process.env.SOKETI_APP_SECRET!,
    host: process.env.NEXT_PUBLIC_SOKETI_HOST!,
    port: process.env.NEXT_PUBLIC_SOKETI_PORT!,
    useTLS: process.env.SOKETI_SCHEME === "https",
    cluster: "", // Soketi doesn't use clusters usually
  });

if (process.env.NODE_ENV !== "production") globalForPusher.pusher = pusher;
