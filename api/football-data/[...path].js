export default async function handler(req, res) {
  try {
    const path = req.query.path;

    const segments = Array.isArray(path)
      ? path
      : typeof path === "string"
        ? path.split("/")
        : [];

    const footballPath = segments
      .filter(Boolean)
      .join("/");

    if (!footballPath) {
      return res.status(400).json({
        error: "API path is missing",
      });
    }

    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(req.query)) {
      if (key === "path") continue;

      if (Array.isArray(value)) {
        value.forEach((item) => {
          params.append(key, item);
        });
      } else if (value !== undefined) {
        params.append(key, value);
      }
    }

    const queryString = params.toString()
      ? `?${params.toString()}`
      : "";

    const apiUrl =
      `https://api.football-data.org/v4/${footballPath}${queryString}`;

    console.log("Football API request:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY,
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