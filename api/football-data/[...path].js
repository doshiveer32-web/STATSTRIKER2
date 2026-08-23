export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        error: "Method not allowed",
      });
    }

    const path = Array.isArray(req.query.path)
      ? req.query.path.join("/")
      : req.query.path;

    if (!path) {
      return res.status(400).json({
        error: "API path is missing",
      });
    }

    const url = new URL(
      `https://api.football-data.org/v4/${path}`
    );

    for (const [key, value] of Object.entries(req.query)) {
      if (key !== "path" && value !== undefined) {
        url.searchParams.set(
          key,
          Array.isArray(value) ? value[0] : value
        );
      }
    }

    console.log("Football API request:", url.toString());

    const response = await fetch(url.toString(), {
      headers: {
        "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY,
      },
    });

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (!response.ok) {
      console.error("Football API error:", response.status, data);

      return res.status(response.status).json({
        error: "Football data API request failed",
        status: response.status,
        details: data,
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Proxy error:", error);

    return res.status(500).json({
      error: "Failed to fetch football data",
      details: error.message,
    });
  }
}