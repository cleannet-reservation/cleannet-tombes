const getBase = () => {
  const url = (process.env.SUPABASE_URL || "").replace(/\/rest\/v1\/?$/, "");
  return `${url}/rest/v1/config`;
};
const headers = () => ({
  "Content-Type": "application/json",
  "apikey": process.env.SUPABASE_ANON_KEY,
  "Authorization": `Bearer ${process.env.SUPABASE_ANON_KEY}`,
});

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const base = getBase();

  if (req.method === "GET") {
    const r = await fetch(`${base}?id=eq.main&select=data`, { headers: headers() });
    const data = await r.json();
    if (Array.isArray(data) && data.length > 0 && data[0].data && Object.keys(data[0].data).length > 0) {
      return res.status(200).json(data[0].data);
    }
    return res.status(200).json({});
  }

  if (req.method === "POST") {
    const configData = req.body.data || req.body;
    if (!configData || Object.keys(configData).length === 0) return res.status(400).json({ error: "No data" });

    const supabaseUrl = (process.env.SUPABASE_URL || "").replace(/\/rest\/v1\/?$/, "");
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    // Utiliser l'API SQL de Supabase directement
    const sql = `UPDATE config SET data = '${JSON.stringify(configData).replace(/'/g, "''")}' WHERE id = 'main'`;
    const r = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}` },
      body: JSON.stringify({ sql }),
    }).catch(() => null);

    // Fallback — PATCH classique
    const r2 = await fetch(`${supabaseUrl}/rest/v1/config?id=eq.main`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "apikey": supabaseKey, "Authorization": `Bearer ${supabaseKey}`, "Prefer": "return=minimal" },
      body: JSON.stringify({ data: configData }),
    });
    console.log("PATCH status:", r2.status);
    const txt = await r2.text();
    console.log("PATCH response:", txt.slice(0, 200));

    if (r2.status === 204 || r2.status === 200) return res.status(200).json({ success: true });
    return res.status(500).json({ error: `Supabase error: ${r2.status} — ${txt}` });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
