export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        error: "Method not allowed",
      });
    }

    const endpoint = req.query.endpoint;

    if (!endpoint) {
      return res.status(400).json({
        error: "Missing endpoint",
      });
    }

    const apiUrl = new URL(
      `https://api.football-data.org/v4/${endpoint}`
    );

    // Forward all query parameters except endpoint
    for (const [key, value] of Object.entries(req.query)) {
      if (key !== "endpoint" && value !== undefined) {
        apiUrl.searchParams.set(
          key,
          Array.isArray(value) ? value[0] : value
        );
      }
    }

    console.log(
      "Football API request:",
      apiUrl.toString()
    );

    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "X-Auth-Token":
          process.env.FOOTBALL_DATA_API_KEY,
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
      "Football proxy error:",
      error
    );

    return res.status(500).json({
      error: "Failed to fetch football data",
      details: error.message,
    });
  }
}