// Vercel Edge Function — serves dynamic OG meta for crawlers on /event/:id
// Crawlers get an HTML page with per-event OG tags.
// Real users get the SPA index.html as normal.

export const config = { runtime: "edge" };

const CRAWLER_UA =
  /Twitterbot|facebookexternalhit|WhatsApp|LinkedInBot|Slackbot|TelegramBot|Discordbot|ia_archiver|vkShare|W3C_Validator|redditbot|Applebot|Pinterest|Googlebot/i;

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const ua = req.headers.get("user-agent") ?? "";

  // Extract event ID from path /api/event/<id>
  const pathParts = url.pathname.split("/");
  const eventId = pathParts[pathParts.length - 1];

  // Non-crawlers: serve the SPA index.html so React Router handles it
  if (!CRAWLER_UA.test(ua)) {
    const spaRes = await fetch(new URL("/", url).toString());
    const html = await spaRes.text();
    return new Response(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // Crawlers: fetch OG meta HTML from Supabase edge function
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !anonKey) {
    return new Response("Supabase env vars not configured", { status: 500 });
  }

  try {
    const ogRes = await fetch(
      `${supabaseUrl}/functions/v1/og-meta?id=${encodeURIComponent(eventId)}`,
      {
        headers: {
          Authorization: `Bearer ${anonKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const html = await ogRes.text();

    return new Response(html, {
      status: ogRes.ok ? 200 : ogRes.status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=600",
      },
    });
  } catch (e) {
    console.error("og-meta fetch failed:", e);
    return new Response("Failed to load event preview", { status: 500 });
  }
}
