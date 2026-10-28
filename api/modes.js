const UPSTREAM = "https://aml-api-eta.vercel.app/levels/ml/page/all/0/";
let lastGood = null; // gardé en mémoire tant que l'instance reste chaude

export default async function handler(request, response) {
  // 1) API AML en direct
  try {
    const upstream = await fetch(UPSTREAM, {
      headers: {
        Accept: "application/json",
        "User-Agent": "aml-game-series-list (projet communautaire)"
      }
    });

    if (upstream.ok) {
      const data = await upstream.json();
      lastGood = data;
      response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
      response.setHeader("X-Data-Source", "live");
      return response.status(200).json(data);
    }
    console.warn("AML upstream status:", upstream.status);
  } catch (error) {
    console.warn("AML upstream error:", error);
  }

  // 2) Dernières données valides en mémoire
  if (lastGood) {
    response.setHeader("Cache-Control", "s-maxage=300");
    response.setHeader("X-Data-Source", "snapshot");
    return response.status(200).json(lastGood);
  }

  // 3) Instantané modes.json déployé avec le site
  try {
    const own = await fetch(`https://${request.headers.host}/modes.json`);
    if (own.ok) {
      const data = await own.json();
      response.setHeader("Cache-Control", "s-maxage=300");
      response.setHeader("X-Data-Source", "snapshot");
      return response.status(200).json(data);
    }
  } catch (error) {
    console.warn("Snapshot error:", error);
  }

  return response.status(502).json({ error: "Données AML indisponibles." });
}
