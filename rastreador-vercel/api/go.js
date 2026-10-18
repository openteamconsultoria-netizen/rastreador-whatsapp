import { redis } from "./_redis.js";
import { LINKS } from "./_links.js";

const BOTS = /bot|crawler|spider|facebookexternalhit|whatsapp|preview|slurp/i;

export default async function handler(req, res) {
  const slug = String(req.query.slug || "");
  const dest = LINKS[slug];
  if (!dest) return res.status(404).send("Link não encontrado");

  const ua = req.headers["user-agent"] || "";
  if (!BOTS.test(ua)) {
    const src = String(req.query.src || "direto").replace(/[^\w-]/g, "").slice(0, 30) || "direto";
    const day = new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
    try {
      await redis.pipeline()
        .hincrby("c:total", slug, 1)
        .hincrby(`c:day:${slug}`, day, 1)
        .hincrby(`c:src:${slug}`, src, 1)
        .exec();
    } catch (e) { console.error(e); }
  }
  res.setHeader("Cache-Control", "no-store");
  res.redirect(302, dest);
}
