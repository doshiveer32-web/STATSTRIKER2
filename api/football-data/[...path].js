export default async function handler(req, res) {
  try {
    // Get the path from Vercel's catch-all route
    let path = "";

    if (Array.isArray(req.query?.path)) {
      path = req.query.path.join("/");
    } else if (typeof req.query?.path === "string") {
      path = req.query.path;
    }

    // Fallback: extract path directly from the request URL
    if (!path) {
      const url = new URL(req.url, "http://localhost");

      const pathname = url.pathname;

      const prefix = "/api/football-data/";

      if (pathname.startsWith(prefix)) {
        path = pathname.slice(prefix.length);
      }
    }

    // Remove leading/trailing slashes
    path = path.replace(/^\/+|\/+$/g, "");

    if (!path) {
      return res.status(400).json({
        error: "API path is missing",
      });
    }

    // Build query parameters WITHOUT forwarding the catch-all "path"
    const incomingUrl = new URL(req.url, "http://localhost");

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
    console.error(
      "Football-data.org proxy error:",
      error
    );

    return res.status(500).json({
      error: "Failed to fetch football data",
      details: error.message,
    });
  }
}