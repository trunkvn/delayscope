import Pusher from "pusher";

const globalForPusher = global as unknown as { pusher: Pusher };

export const pusher =
  globalForPusher.pusher ||
  new Pusher({
    appId: process.env.SOKETI_APP_ID!,
    key: process.env.NEXT_PUBLIC_SOKETI_APP_KEY!,
    secret: process.env.SOKETI_APP_SECRET!,
    host: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ? undefined : (process.env.NEXT_PUBLIC_SOKETI_HOST || "127.0.0.1"),
    port: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ? undefined : (process.env.NEXT_PUBLIC_SOKETI_PORT || "6001"),
    useTLS: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ? true : process.env.SOKETI_SCHEME === "https",
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "",
  });

if (process.env.NODE_ENV !== "production") globalForPusher.pusher = pusher;
