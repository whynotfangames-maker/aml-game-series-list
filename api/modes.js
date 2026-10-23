
export default async function handler(request, response) {
  try {
    const upstream = await fetch(
      "https://aml-api-eta.vercel.app/levels/ml/page/all/0/",
      {
        headers: {
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    if (!upstream.ok) {
      const details = await upstream.text();

      return response.status(502).json({
        error: "L'API AML refuse la requête.",
        upstreamStatus: upstream.status,
        retryAfter: upstream.headers.get("retry-after"),
        details: details.slice(0, 1000)
      });
    }

    const data = await upstream.json();

    response.setHeader(
      "Cache-Control",
      "s-maxage=60, stale-while-revalidate=300"
    );

    return response.status(200).json(data);
  } catch (error) {
    return response.status(500).json({
      error: "Erreur du serveur intermédiaire.",
      details: error.message
    });
  }
}
