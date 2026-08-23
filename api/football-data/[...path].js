export default async function handler(req, res) {
  console.log("PROXY HIT:", req.url);

  try {
    // Get the actual URL path
    const incomingUrl = new URL(req.url, "http://localhost");

    const pathname = incomingUrl.pathname;

    const prefix = "/api/football-data/";

    // Extract everything after /api/football-data/
    if (!pathname.startsWith(prefix)) {
      return res.status(400).json({
        error: "Invalid API path",
        pathname,
      });
    }

    const path = pathname
      .slice(prefix.length)
      .replace(/^\/+|\/+$/g, "");

    if (!path) {
      return res.status(400).json({
        error: "API path is missing",
      });
    }

    // Only forward REAL query parameters.
    // Never forward Vercel's catch-all "path" parameter.
    const params = new URLSearchParams(incomingUrl.search);

    params.delete("path");

    const queryString = params.toString()
      ? `?${params.toString()}`
      : "";

    const apiUrl =
      `https://api.football-data.org/v4/${path}${queryString}`;

    console.log("Football API request:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY,
        "Content-Type": "application/json",
      },
    });

    const contentType =
      response.headers.get("content-type") || "";

    let data;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Football data API request failed",
        status: response.status,
        details: data,
        requestedUrl: apiUrl,
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Football-data.org proxy error:", error);

    return res.status(500).json({
      error: "Failed to fetch football data",
      details: error.message,
    });
  }
}
