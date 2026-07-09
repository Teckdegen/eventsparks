import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const eventId = url.searchParams.get("id");

    if (!eventId) {
      return new Response(JSON.stringify({ error: "Missing event id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: event, error } = await supabase
      .from("events")
      .select("id, title, description, image, date, location, category, city, country")
      .eq("id", eventId)
      .maybeSingle();

    if (error || !event) {
      return new Response(JSON.stringify({ error: "Event not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const siteUrl = Deno.env.get("SITE_URL") ?? "https://eventsparks.com";
    const eventUrl = `${siteUrl}/event/${event.id}`;
    const image = event.image ?? `${siteUrl}/favicon.png`;
    const location = [event.city, event.country].filter(Boolean).join(", ") || event.location;
    const description = event.description
      ? event.description.slice(0, 160)
      : `${event.category} event on ${event.date} — ${location}`;

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>${event.title} — EventSparks</title>
    <meta name="description" content="${description}" />

    <!-- Open Graph -->
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="EventSparks" />
    <meta property="og:url" content="${eventUrl}" />
    <meta property="og:title" content="${event.title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@EventSparks" />
    <meta name="twitter:title" content="${event.title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />

    <!-- Redirect real users to the SPA -->
    <meta http-equiv="refresh" content="0; url=${eventUrl}" />
    <link rel="canonical" href="${eventUrl}" />
  </head>
  <body>
    <p>Redirecting to <a href="${eventUrl}">${event.title}</a>…</p>
  </body>
</html>`;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        // Cache for 10 minutes so crawlers don't hammer the function
        "Cache-Control": "public, max-age=600",
      },
    });
  } catch (e) {
    console.error("og-meta error:", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
