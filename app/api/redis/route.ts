import redis from "@/lib/redis";
import { NextResponse } from "next/server";

export async function GET() {
//   await redis.set("game", "pokemon");

  const value = await redis.get("game");
  const topic = await redis.get("room:1:topic");
  const stopic = await redis.get("room:1:topic:subtopic");

  return NextResponse.json({ value, topic, stopic });
}
