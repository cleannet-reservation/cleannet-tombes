const SB_URL = () => (process.env.SUPABASE_URL || "").replace(/\/rest\/v1\/?$/, "");
const SB_KEY = () => process.env.SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  const url = SB_URL();
  const key = SB_KEY();

  if (!url || !key) return res.status(500).json({ error: "Supabase not configured" });

  const headers = { apikey: key, Authorization: `Bearer ${key}` };

  // GET — liste les photos
  if (req.method === "GET") {
    const r = await fetch(`${url}/storage/v1/object/list/galerie`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ prefix: "", limit: 200, offset: 0, sortBy: { column: "created_at", order: "desc" } }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: data.message || "List error" });

    const photos = (Array.isArray(data) ? data : [])
      .filter(f => f.name && !f.name.endsWith("/"))
      .map(f => ({
        name: f.name,
        url: `${url}/storage/v1/object/public/galerie/${f.name}`,
        created_at: f.created_at,
        size: f.metadata?.size,
      }));

    return res.status(200).json(photos);
  }

  // DELETE — supprimer une photo
  if (req.method === "DELETE") {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "name required" });

    const r = await fetch(`${url}/storage/v1/object/galerie/${encodeURIComponent(name)}`, {
      method: "DELETE",
      headers,
    });
    if (!r.ok) {
      const data = await r.json().catch(() => ({}));
      return res.status(500).json({ error: data.message || "Delete error" });
    }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
