export default async function handler(req, res) {
  try {
    const pathParam = req.query?.path;

    const path = Array.isArray(pathParam)
      ? pathParam.join("/")
      : typeof pathParam === "string"
        ? pathParam
        : "";

    if (!path) {
      return res.status(400).json({
        error: "API path is missing",
      });
    }

    const incomingUrl = new URL(req.url, "http://localhost");

    const params = new URLSearchParams(incomingUrl.search);
    params.delete("path");

    const queryString = params.toString()
      ? `?${params.toString()}`
      : "";

    const apiUrl =
      `https://api.football-data.org/v4/${path}${queryString}`;

    console.log("FOOTBALL API PROXY:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY,
        Accept: "application/json",
      },
    });

    const contentType =
      response.headers.get("content-type") || "";

    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    console.log(
      "FOOTBALL API STATUS:",
      response.status
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Football data API request failed",
        status: response.status,
        details: data,
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("FOOTBALL PROXY ERROR:", error);

    return res.status(500).json({
      error: "Failed to fetch football data",
      details: error.message,
    });
  }
}