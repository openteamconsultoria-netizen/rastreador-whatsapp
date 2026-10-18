import { redis } from "./_redis.js";
import { LINKS } from "./_links.js";

export default async function handler(req, res) {
  const key = process.env.PANEL_KEY;
  if (!key || req.headers["x-key"] !== key)
    return res.status(401).json({ error: "senha incorreta" });

  const links = Object.keys(LINKS);
  const total = (await redis.hgetall("c:total")) || {};
  const byDay = {}, bySrc = {};
  for (const l of links) {
    byDay[l] = (await redis.hgetall(`c:day:${l}`)) || {};
    bySrc[l] = (await redis.hgetall(`c:src:${l}`)) || {};
  }
  res.setHeader("Cache-Control", "no-store");
  res.json({ links, total, byDay, bySrc });
}
