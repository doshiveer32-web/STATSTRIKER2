export default async function handler(req, res) {
  try {
    let path = Array.isArray(req.query.path)
      ? req.query.path.join("/")
      : req.query.path || "";

    // Remove accidental prefixes if they are included
    path = path
      .replace(/^\/+/, "")
      .replace(/^football-data\/?/, "")
      .replace(/^v4\/?/, "");

    const incomingUrl = new URL(
      req.url,
      "http://localhost"
    );

    const queryString = incomingUrl.search;

    const apiUrl =
      `https://api.football-data.org/v4/${path}` +
      queryString;

    console.log("Requesting Football-Data URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY,
        Accept: "application/json",
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
      console.error(
        "Football-Data API error:",
        response.status,
        data
      );

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