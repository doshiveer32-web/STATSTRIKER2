export default async function handler(req, res) {
  try {
    let path = req.query?.path;

    if (Array.isArray(path)) {
      path = path.join("/");
    }

    if (!path) {
      const url = new URL(req.url, "http://localhost");
      const prefix = "/api/football-data/";

      if (url.pathname.startsWith(prefix)) {
        path = url.pathname.slice(prefix.length);
      }
    }

    if (!path) {
      return res.status(400).json({
        error: "API path is missing",
      });
    }

    path = path.replace(/^\/+|\/+$/g, "");

    const url = new URL(req.url, "http://localhost");
    const params = new URLSearchParams(url.search);

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
        "Accept": "application/json",
      },
    });

    const contentType =
      response.headers.get("content-type") || "";

    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      console.error(
        "Football API error:",
        response.status,
        data
      );

      return res.status(response.status).json({
        error: "Football data API request failed",
        status: response.status,
        details: data,
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error(
      "Football-data proxy error:",
      error
    );

    return res.status(500).json({
      error: "Failed to fetch football data",
      details: error.message,
    });
  }
}