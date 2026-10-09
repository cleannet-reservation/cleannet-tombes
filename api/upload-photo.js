const SB_URL = () => (process.env.SUPABASE_URL || "").replace(/\/rest\/v1\/?$/, "");
// Service role key bypasse le RLS — nécessaire pour l'upload Storage
const SB_KEY = () => process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const url = SB_URL();
  const key = SB_KEY();
  if (!url || !key) return res.status(500).json({ error: "Supabase not configured" });

  const { file, name, type } = req.body;
  if (!file || !name) return res.status(400).json({ error: "file and name required" });

  const base64Data = file.replace(/^data:[^;]+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  const contentType = type || "image/jpeg";
  const fileName = `${Date.now()}_${name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": contentType,
    "x-upsert": "true",
  };

  try {
    const r = await fetch(`${url}/storage/v1/object/galerie/${encodeURIComponent(fileName)}`, {
      method: "POST",
      headers,
      body: buffer,
    });

    const raw = await r.text();
    let data;
    try { data = JSON.parse(raw); } catch(_) { data = {}; }

    if (!r.ok) {
      console.error("Upload error:", r.status, raw);
      return res.status(500).json({ error: data.message || data.error || `HTTP ${r.status}: ${raw}` });
    }

    const publicUrl = `${url}/storage/v1/object/public/galerie/${encodeURIComponent(fileName)}`;
    return res.status(200).json({ success: true, url: publicUrl, name: fileName });
  } catch (err) {
    console.error("Upload exception:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
