const SB_URL = () => (process.env.SUPABASE_URL || "").replace(/\/rest\/v1\/?$/, "");
const SB_KEY = () => process.env.SUPABASE_ANON_KEY;
const hdrs = () => ({
  "Content-Type": "application/json",
  "apikey": SB_KEY(),
  "Authorization": `Bearer ${SB_KEY()}`,
});

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const base = `${SB_URL()}/rest/v1/config`;

  if (req.method === "GET") {
    const r = await fetch(`${base}?id=eq.main&select=data`, { headers: hdrs() });
    const data = await r.json();
    console.log("GET config:", JSON.stringify(data).slice(0, 200));
    if (Array.isArray(data) && data.length > 0 && data[0].data && Object.keys(data[0].data).length > 0) {
      return res.status(200).json(data[0].data);
    }
    return res.status(200).json({});
  }

  if (req.method === "POST") {
    const configData = req.body.data || req.body;
    if (!configData || Object.keys(configData).length === 0) return res.status(400).json({ error: "No data" });

    console.log("Saving config keys:", Object.keys(configData).join(", "));
    console.log("URL:", `${base}?id=eq.main`);

    const r = await fetch(`${base}?id=eq.main`, {
      method: "PATCH",
      headers: { ...hdrs(), "Prefer": "return=minimal" },
      body: JSON.stringify({ data: configData }),
    });

    console.log("PATCH status:", r.status);

    if (r.status === 204) return res.status(200).json({ success: true });
    if (r.status === 200) return res.status(200).json({ success: true });

    const txt = await r.text();
    console.log("PATCH error:", txt);
    return res.status(500).json({ error: `${r.status}: ${txt}` });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
