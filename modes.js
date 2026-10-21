
export default async function handler(request, response) {
  try {
    const upstream = await fetch(
      "https://aml-api-eta.vercel.app/levels/ml/page/all/0/"
    );

    if (!upstream.ok) {
      return response.status(502).json({
        error: "L'API AML a renvoyé une erreur.",
        status: upstream.status
      });
    }

    const data = await upstream.json();

    response.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return response.status(200).json(data);
  } catch (error) {
    return response.status(502).json({
      error: "Impossible de récupérer les données AML."
    });
  }
}
