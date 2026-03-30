import Pusher from "pusher";

const globalForPusher = global as unknown as { pusher: Pusher };

const pusherConfig: any = {
  appId: process.env.SOKETI_APP_ID!,
  key: process.env.NEXT_PUBLIC_SOKETI_APP_KEY!,
  secret: process.env.SOKETI_APP_SECRET!,
  useTLS: true,
};

if (process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
  pusherConfig.cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
} else {
  // Fallback to Soketi/Local config
  pusherConfig.host = process.env.NEXT_PUBLIC_SOKETI_HOST || "127.0.0.1";
  pusherConfig.port = process.env.NEXT_PUBLIC_SOKETI_PORT || "6001";
  pusherConfig.useTLS = process.env.SOKETI_SCHEME === "https";
}

export const pusher = globalForPusher.pusher || new Pusher(pusherConfig);

if (process.env.NODE_ENV !== "production") globalForPusher.pusher = pusher;
