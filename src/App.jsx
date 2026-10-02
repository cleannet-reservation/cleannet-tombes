import { useState, useEffect } from "react";

// ─── COULEURS ──────────────────────────────────────────────────────────────
const C = {
  stone: "#2C2C2C",
  marble: "#F5F3EF",
  sage: "#5C7A6B",
  sageLight: "#E8F0EC",
  gold: "#8B7355",
  goldLight: "#F5EFE6",
  white: "#FFFFFF",
  muted: "#7A7A7A",
  border: "#DDD8D0",
  red: "#DC2626",
};

const fmt = (n) => Number(n).toFixed(2).replace(".", ",") + " €";

const PRESTATIONS = [
  { id: "nettoyage", icon: "🧼", label: "Nettoyage de la pierre", desc: "Démoussage, détartrage et nettoyage complet de la stèle et du monument" },
  { id: "desherbage", icon: "🌿", label: "Désherbage", desc: "Élimination des mauvaises herbes autour et sous la concession" },
  { id: "fleurs_artificielles", icon: "💐", label: "Fleurs artificielles", desc: "Dépôt d'un bouquet de fleurs artificielles de qualité" },
  { id: "fleurs_naturelles", icon: "🌸", label: "Fleurs naturelles", desc: "Dépôt de fleurs fraîches de saison" },
  { id: "photos", icon: "📸", label: "Photos avant/après", desc: "Rapport photo envoyé par SMS ou email après chaque intervention" },
];

const FORMULES = [
  { id: "ponctuel", label: "Ponctuel", desc: "Une seule intervention", prix: 49, badge: null },
  { id: "mensuel", label: "Mensuel", desc: "1 intervention / mois", prix: 39, badge: "Populaire" },
  { id: "trimestriel", label: "Trimestriel", desc: "1 intervention / trimestre", prix: 29, badge: null },
  { id: "annuel", label: "Annuel", desc: "1 intervention / an", prix: 19, badge: "Économique" },
];

const CIMETIERES = [
  "Cimetière d'Antibes — Avenue du Docteur Donat",
  "Cimetière de la Rayne — Antibes",
  "Cimetière de Juan-les-Pins",
  "Cimetière de Vallauris — Avenue Georges Clemenceau",
  "Autre (préciser dans les notes)",
];

const STEPS = ["Prestation", "Coordonnées", "Récapitulatif"];

function ProgressBar({ step }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32 }}>
      {STEPS.map((label, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: i <= step ? C.sage : C.border,
              color: i <= step ? C.white : C.muted,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700,
            }}>
              {i < step ? "✓" : i + 1}
            </div>
            <span style={{ fontSize: 11, fontWeight: i <= step ? 700 : 400, color: i <= step ? C.sage : C.muted, whiteSpace: "nowrap" }}>{label}</span>
          </div>
          {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1.5, background: i < step ? C.sage : C.border, margin: "0 8px", marginBottom: 16 }} />}
        </div>
      ))}
    </div>
  );
}

function Landing({ onStart, config }) {
  const formules = config?.formules || FORMULES;
  const prestations = config?.prestations || PRESTATIONS;
  const cimetieres = config?.cimetieres || CIMETIERES;
  return (
    <div style={{ fontFamily: "'Georgia', serif", color: C.stone, background: C.marble, minHeight: "100vh" }}>
      {/* Header */}
      <header style={{ background: C.stone, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: C.white, fontWeight: 700, fontSize: 18, letterSpacing: "0.5px" }}>CleanNet Tombes</div>
          <div style={{ color: "#AAA", fontSize: 11, letterSpacing: "1px", fontFamily: "system-ui" }}>SERVICE D'ENTRETIEN FUNÉRAIRE</div>
        </div>
        <div style={{ color: "#AAA", fontSize: 13, fontFamily: "system-ui" }}>📞 06 12 92 20 48</div>
      </header>

      {/* Hero */}
      <div style={{ background: C.stone, padding: "60px 24px 72px", textAlign: "center" }}>
        <p style={{ color: C.sage, fontSize: 13, letterSpacing: "2px", textTransform: "uppercase", margin: "0 0 16px", fontFamily: "system-ui" }}>Antibes · Juan-les-Pins · Vallauris</p>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 400, color: C.white, margin: "0 0 20px", lineHeight: 1.2, maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}>
          Entretenir leur mémoire,<br />
          <em style={{ color: C.gold }}>avec soin et respect.</em>
        </h1>
        <p style={{ color: "#AAA", fontSize: 16, maxWidth: 480, margin: "0 auto 36px", lineHeight: 1.8, fontFamily: "system-ui" }}>
          Nettoyage de monuments, désherbage, fleurs et rapport photo — pour ceux qui ne peuvent pas être présents.
        </p>
        <button onClick={onStart} style={{ background: C.sage, color: C.white, border: "none", borderRadius: 4, padding: "14px 32px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "system-ui", letterSpacing: "0.5px" }}>
          Demander une intervention
        </button>
      </div>

      {/* Prestations */}
      <div style={{ padding: "56px 24px", maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{ fontSize: 26, fontWeight: 400, textAlign: "center", marginBottom: 8 }}>Nos prestations</h2>
        <p style={{ color: C.muted, textAlign: "center", fontSize: 14, margin: "0 0 40px", fontFamily: "system-ui" }}>Chaque intervention est réalisée avec discrétion et respect</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {prestations.map(p => (
            <div key={p.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 6, padding: "20px 18px" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{p.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{p.label}</div>
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, fontFamily: "system-ui" }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Formules */}
      <div style={{ background: C.sageLight, padding: "56px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: 26, fontWeight: 400, textAlign: "center", marginBottom: 8 }}>Formules d'entretien</h2>
          <p style={{ color: C.muted, textAlign: "center", fontSize: 14, margin: "0 0 40px", fontFamily: "system-ui" }}>À partir de 19€ par intervention</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 12 }}>
            {formules.map(f => (
              <div key={f.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 6, padding: "20px 16px", textAlign: "center", position: "relative" }}>
                {f.badge && <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: C.sage, color: C.white, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, fontFamily: "system-ui", whiteSpace: "nowrap" }}>{f.badge}</div>}
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{f.label}</div>
                <div style={{ fontSize: 12, color: C.muted, fontFamily: "system-ui", marginBottom: 12 }}>{f.desc}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: C.sage }}>{f.prix}€</div>
                <div style={{ fontSize: 11, color: C.muted, fontFamily: "system-ui" }}>par intervention</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: C.muted, textAlign: "center", marginTop: 20, fontFamily: "system-ui" }}>
            * Tarifs de base pour nettoyage + désherbage. Fleurs en supplément.
          </p>
        </div>
      </div>

      {/* Cimetières */}
      <div style={{ padding: "56px 24px", maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{ fontSize: 26, fontWeight: 400, textAlign: "center", marginBottom: 40 }}>Cimetières desservis</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {cimetieres.filter(c => !c.startsWith("Autre")).map(c => (
            <div key={c} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: C.white, border: `1px solid ${C.border}`, borderRadius: 6 }}>
              <span style={{ color: C.sage, fontSize: 18 }}>📍</span>
              <span style={{ fontSize: 14, fontFamily: "system-ui" }}>{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: C.stone, padding: "48px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: 24, fontWeight: 400, color: C.white, margin: "0 0 12px" }}>Confiez-nous l'entretien</h2>
        <p style={{ color: "#AAA", fontSize: 14, margin: "0 0 28px", fontFamily: "system-ui" }}>Intervention sous 48h — Photo envoyée après chaque passage</p>
        <button onClick={onStart} style={{ background: C.sage, color: C.white, border: "none", borderRadius: 4, padding: "14px 32px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "system-ui" }}>
          Demander une intervention
        </button>
        <p style={{ color: "#666", fontSize: 12, marginTop: 16, fontFamily: "system-ui" }}>📞 06 12 92 20 48 · cleannet06600@gmail.com</p>
      </div>

      <footer style={{ background: "#1A1A1A", padding: "20px 24px", textAlign: "center" }}>
        <p style={{ color: "#555", fontSize: 12, margin: 0, fontFamily: "system-ui" }}>
          © 2026 CleanNet Multi-Service 06 · SIRET 539 560 607 00035 · TVA non applicable, art. 293 B du CGI
        </p>
      </footer>
    </div>
  );
}

function Reservation({ onBack, config }) {
  const FORMULES_DATA = config?.formules || FORMULES;
  const PRESTATIONS_DATA = config?.prestations || PRESTATIONS;
  const CIMETIERES_DATA = [...(config?.cimetieres || CIMETIERES), "Autre (préciser dans les notes)"];
  const whatsappNum = config?.whatsapp || "33612922048";

  const [step, setStep] = useState(0);
  const [formule, setFormule] = useState(null);
  const [prestations, setPrestations] = useState([]);
  const [form, setForm] = useState({ prenom: "", nom: "", email: "", telephone: "", cimetiere: "", defunt: "", concession: "", date: "", note: "" });
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);

  const togglePrestation = (id) => setPrestations(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const fleursSup = (() => {
    const fn = PRESTATIONS_DATA.find(p => p.id === "fleurs_naturelles");
    const fa = PRESTATIONS_DATA.find(p => p.id === "fleurs_artificielles");
    if (prestations.includes("fleurs_naturelles")) return fn?.sup || 15;
    if (prestations.includes("fleurs_artificielles")) return fa?.sup || 8;
    return 0;
  })();
  const photosSup = (() => {
    const ph = PRESTATIONS_DATA.find(p => p.id === "photos");
    return prestations.includes("photos") ? (ph?.sup || 5) : 0;
  })();
  const total = formule ? formule.prix + fleursSup + photosSup : 0;

  const canNext = () => {
    if (step === 0) return !!formule && prestations.length > 0;
    if (step === 1) return !!(form.prenom && form.nom && form.email && form.telephone && form.cimetiere && form.defunt && form.date);
    return true;
  };

  const handleSubmit = () => {
    const prestationsLabel = prestations.map(id => PRESTATIONS.find(p => p.id === id)?.label).join(", ");
    const msg = encodeURIComponent(
`🪦 *Demande d'entretien — CleanNet Tombes*

👤 *Client :*
Nom : ${form.prenom} ${form.nom}
📞 ${form.telephone}
📧 ${form.email}

⚰️ *Concession :*
Défunt : ${form.defunt}
Cimetière : ${form.cimetiere}
${form.concession ? `Concession : ${form.concession}` : ""}

🌿 *Formule :* ${formule.label} — ${formule.prix}€/intervention
✅ *Prestations :* ${prestationsLabel}
📅 *Date souhaitée :* ${form.date}
💶 *Total :* ${fmt(total)}
${form.note ? `📝 *Notes :* ${form.note}` : ""}

_Envoyé depuis cleannet-tombes.vercel.app_`
    );
    window.open(`https://wa.me/${whatsappNum}?text=${msg}`, "_blank");
    setDone(true);
  };

  const IS = { border: `1px solid ${C.border}`, borderRadius: 4, padding: "10px 12px", fontSize: 14, color: C.stone, outline: "none", fontFamily: "Georgia, serif", background: C.white, width: "100%", boxSizing: "border-box" };

  if (done) return (
    <div style={{ minHeight: "100vh", background: C.marble, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "Georgia, serif" }}>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 6, padding: "48px 36px", maxWidth: 480, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🙏</div>
        <h2 style={{ fontSize: 22, fontWeight: 400, margin: "0 0 12px" }}>Demande reçue</h2>
        <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.8, margin: "0 0 20px", fontFamily: "system-ui" }}>
          Merci <strong>{form.prenom}</strong>. Votre demande a été envoyée sur WhatsApp. Nous vous confirmons l'intervention sous 24h.
        </p>
        <div style={{ background: C.sageLight, borderRadius: 4, padding: "14px 18px", fontSize: 13, color: C.stone, marginBottom: 24, textAlign: "left", fontFamily: "system-ui", lineHeight: 1.8 }}>
          <div>🌿 <strong>Formule :</strong> {formule?.label}</div>
          <div>⚰️ <strong>Défunt :</strong> {form.defunt}</div>
          <div>📍 <strong>Cimetière :</strong> {form.cimetiere}</div>
          <div>📅 <strong>Date souhaitée :</strong> {form.date}</div>
          <div>💶 <strong>Total :</strong> {fmt(total)}</div>
        </div>
        <button onClick={onBack} style={{ background: C.sage, color: C.white, border: "none", borderRadius: 4, padding: "12px 28px", fontWeight: 600, cursor: "pointer", fontFamily: "system-ui" }}>
          Retour à l'accueil
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.marble, fontFamily: "Georgia, serif", color: C.stone }}>
      <header style={{ background: C.stone, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={onBack} style={{ color: "#AAA", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontFamily: "system-ui" }}>← Retour</button>
        <div style={{ color: C.white, fontWeight: 700, fontSize: 16 }}>CleanNet Tombes</div>
        <div style={{ width: 80 }} />
      </header>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 20px 60px" }}>
        <ProgressBar step={step} />

        {/* ÉTAPE 0 — Formule + Prestations */}
        {step === 0 && (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 400, margin: "0 0 6px" }}>Choisissez votre formule</h2>
            <p style={{ color: C.muted, fontSize: 13, margin: "0 0 24px", fontFamily: "system-ui" }}>Ponctuel ou abonnement récurrent</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {FORMULES_DATA.map(f => (
                <button key={f.id} onClick={() => setFormule(f)} style={{ border: `1.5px solid ${formule?.id === f.id ? C.sage : C.border}`, background: formule?.id === f.id ? C.sageLight : C.white, borderRadius: 6, padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{f.label}</div>
                    <div style={{ fontSize: 12, color: C.muted, fontFamily: "system-ui" }}>{f.desc}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: C.sage }}>{f.prix}€</div>
                    {f.badge && <div style={{ fontSize: 10, background: C.sage, color: C.white, padding: "2px 8px", borderRadius: 20, fontFamily: "system-ui" }}>{f.badge}</div>}
                  </div>
                </button>
              ))}
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 400, margin: "0 0 6px" }}>Prestations souhaitées</h3>
            <p style={{ color: C.muted, fontSize: 13, margin: "0 0 16px", fontFamily: "system-ui" }}>Sélectionnez une ou plusieurs options</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PRESTATIONS_DATA.map(p => {
                const active = prestations.includes(p.id);
                const sup = p.id === "fleurs_naturelles" ? "+15€" : p.id === "fleurs_artificielles" ? "+8€" : p.id === "photos" ? "+5€" : "Inclus";
                return (
                  <button key={p.id} onClick={() => togglePrestation(p.id)} style={{ border: `1.5px solid ${active ? C.sage : C.border}`, background: active ? C.sageLight : C.white, borderRadius: 6, padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
                    <span style={{ fontSize: 22 }}>{p.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{p.label}</div>
                      <div style={{ fontSize: 12, color: C.muted, fontFamily: "system-ui" }}>{p.desc}</div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: active ? C.sage : C.muted, fontFamily: "system-ui" }}>{sup}</span>
                    {active && <span style={{ background: C.sage, color: C.white, borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ÉTAPE 1 — Coordonnées */}
        {step === 1 && (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 400, margin: "0 0 6px" }}>Vos coordonnées</h2>
            <p style={{ color: C.muted, fontSize: 13, margin: "0 0 24px", fontFamily: "system-ui" }}>Informations nécessaires pour l'intervention</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 4, fontFamily: "system-ui", color: C.muted }}>Prénom *</label>
                  <input value={form.prenom} onChange={e => setForm(p => ({...p, prenom: e.target.value}))} style={IS} placeholder="Marie" />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 4, fontFamily: "system-ui", color: C.muted }}>Nom *</label>
                  <input value={form.nom} onChange={e => setForm(p => ({...p, nom: e.target.value}))} style={IS} placeholder="Dupont" />
                </div>
              </div>
              {[
                { key: "email", label: "Email *", ph: "marie@exemple.fr", type: "email" },
                { key: "telephone", label: "Téléphone *", ph: "06 12 34 56 78" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 4, fontFamily: "system-ui", color: C.muted }}>{f.label}</label>
                  <input type={f.type||"text"} value={form[f.key]} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))} style={IS} placeholder={f.ph} />
                </div>
              ))}

              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 14px", color: C.sage }}>Informations sur la concession</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 4, fontFamily: "system-ui", color: C.muted }}>Nom du défunt *</label>
                    <input value={form.defunt} onChange={e => setForm(p => ({...p, defunt: e.target.value}))} style={IS} placeholder="ex: Jean Dupont" />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 4, fontFamily: "system-ui", color: C.muted }}>Cimetière *</label>
                    <select value={form.cimetiere} onChange={e => setForm(p => ({...p, cimetiere: e.target.value}))} style={IS}>
                      <option value="">Sélectionnez un cimetière</option>
                      {CIMETIERES_DATA.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 4, fontFamily: "system-ui", color: C.muted }}>Numéro de concession (si connu)</label>
                    <input value={form.concession} onChange={e => setForm(p => ({...p, concession: e.target.value}))} style={IS} placeholder="ex: Allée B, tombe 12" />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 4, fontFamily: "system-ui", color: C.muted }}>Date souhaitée *</label>
                    <input type="date" value={form.date} onChange={e => setForm(p => ({...p, date: e.target.value}))} style={IS} min={new Date().toISOString().split("T")[0]} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 4, fontFamily: "system-ui", color: C.muted }}>Notes complémentaires</label>
                    <textarea value={form.note} onChange={e => setForm(p => ({...p, note: e.target.value}))} style={{...IS, height: 80, resize: "vertical"}} placeholder="Particularités, accès, demandes spéciales..." />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ÉTAPE 2 — Récapitulatif */}
        {step === 2 && (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 400, margin: "0 0 24px" }}>Récapitulatif</h2>
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 6, padding: "20px 22px", marginBottom: 16 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 14px", fontFamily: "system-ui" }}>Prestation</p>
              {[
                { label: `Formule ${formule?.label}`, val: fmt(formule?.prix || 0) },
                ...(prestations.includes("fleurs_naturelles") ? [{ label: "Fleurs naturelles", val: "+8,00 €" }] : []),
                ...(prestations.includes("fleurs_artificielles") ? [{ label: "Fleurs artificielles", val: "+8,00 €" }] : []),
                ...(prestations.includes("photos") ? [{ label: "Photos avant/après", val: "+5,00 €" }] : []),
              ].map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 14, fontFamily: "system-ui" }}>
                  <span style={{ color: C.muted }}>{r.label}</span>
                  <span style={{ fontWeight: 600 }}>{r.val}</span>
                </div>
              ))}
              <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700 }}>
                <span>Total</span>
                <span style={{ color: C.sage }}>{fmt(total)}</span>
              </div>
            </div>
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 6, padding: "20px 22px", marginBottom: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 14px", fontFamily: "system-ui" }}>Détails</p>
              {[
                { label: "Client", val: `${form.prenom} ${form.nom}` },
                { label: "Défunt", val: form.defunt },
                { label: "Cimetière", val: form.cimetiere },
                { label: "Concession", val: form.concession || "Non précisée" },
                { label: "Date souhaitée", val: form.date },
                { label: "Prestations", val: prestations.map(id => PRESTATIONS.find(p => p.id === id)?.label).join(", ") },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 13, fontFamily: "system-ui", flexWrap: "wrap", gap: 4 }}>
                  <span style={{ color: C.muted }}>{r.label}</span>
                  <span style={{ fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{r.val}</span>
                </div>
              ))}
            </div>

            <div style={{ background: C.sageLight, border: `1px solid ${C.sage}30`, borderRadius: 6, padding: "14px 18px", marginBottom: 20, fontSize: 13, color: C.stone, fontFamily: "system-ui", lineHeight: 1.7 }}>
              📸 Si vous avez sélectionné les photos avant/après, nous vous les enverrons par SMS et email dans les 24h suivant l'intervention.
            </div>

            <button onClick={handleSubmit} style={{ width: "100%", background: "#25D366", color: C.white, border: "none", borderRadius: 4, padding: "14px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "system-ui" }}>
              📲 Envoyer ma demande sur WhatsApp →
            </button>
            <p style={{ fontSize: 12, color: C.muted, textAlign: "center", marginTop: 12, fontFamily: "system-ui" }}>
              Confirmation sous 24h · Paiement à l'intervention
            </p>
          </>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, gap: 12 }}>
          {step > 0
            ? <button onClick={() => setStep(s => s - 1)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 4, padding: "10px 20px", fontSize: 14, cursor: "pointer", fontFamily: "system-ui", color: C.stone }}>← Retour</button>
            : <div />
          }
          {step < 2 && (
            <button onClick={() => canNext() && setStep(s => s + 1)} disabled={!canNext()} style={{ background: canNext() ? C.sage : C.border, color: canNext() ? C.white : C.muted, border: "none", borderRadius: 4, padding: "11px 24px", fontSize: 14, fontWeight: 600, cursor: canNext() ? "pointer" : "not-allowed", marginLeft: "auto", fontFamily: "system-ui" }}>
              {step === 1 ? "Voir le récapitulatif →" : "Continuer →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN ────────────────────────────────────────────────────────────────
function Admin({ onBack }) {
  const [auth, setAuth] = useState(false);
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState(null);
  const [cfg, setCfg] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const ADMIN_PWD = "tombes2026";

  useEffect(() => {
    if (auth) {
      fetch(`/api/config?t=${Date.now()}`)
        .then(r => r.json())
        .then(data => {
          if (data && Object.keys(data).length > 0) {
            setCfg(data);
          } else {
            setCfg({
              formules: [
                { id: "ponctuel", label: "Ponctuel", desc: "Une seule intervention", prix: 49, badge: null },
                { id: "mensuel", label: "Mensuel", desc: "1 intervention / mois", prix: 39, badge: "Populaire" },
                { id: "trimestriel", label: "Trimestriel", desc: "1 intervention / trimestre", prix: 29, badge: null },
                { id: "annuel", label: "Annuel", desc: "1 intervention / an", prix: 19, badge: "Économique" },
              ],
              prestations: [
                { id: "nettoyage", icon: "🧼", label: "Nettoyage de la pierre", desc: "Démoussage, détartrage et nettoyage complet", sup: null },
                { id: "desherbage", icon: "🌿", label: "Désherbage", desc: "Élimination des mauvaises herbes", sup: null },
                { id: "fleurs_artificielles", icon: "💐", label: "Fleurs artificielles", desc: "Dépôt d'un bouquet de fleurs artificielles", sup: 8 },
                { id: "fleurs_naturelles", icon: "🌸", label: "Fleurs naturelles", desc: "Dépôt de fleurs fraîches de saison", sup: 15 },
                { id: "photos", icon: "📸", label: "Photos avant/après", desc: "Rapport photo envoyé par SMS ou email", sup: 5 },
              ],
              cimetieres: [
                "Cimetière d'Antibes — Avenue du Docteur Donat",
                "Cimetière de la Rayne — Antibes",
                "Cimetière de Juan-les-Pins",
                "Cimetière de Vallauris — Avenue Georges Clemenceau",
              ],
              whatsapp: "33612922048",
              adminPwd: "tombes2026",
            });
          }
        })
        .catch(() => {});
    }
  }, [auth]);

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch(e) { console.error(e); }
    finally { setSaving(false); }
  };

  const IS = { border: `1px solid ${C.border}`, borderRadius: 4, padding: "9px 12px", fontSize: 14, color: C.stone, outline: "none", fontFamily: "system-ui", background: C.white, width: "100%", boxSizing: "border-box" };

  if (!auth) return (
    <div style={{ minHeight: "100vh", background: C.marble, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "Georgia, serif" }}>
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 6, padding: "40px 32px", maxWidth: 380, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🪦</div>
          <h2 style={{ fontSize: 20, fontWeight: 400, margin: 0 }}>CleanNet Tombes — Admin</h2>
        </div>
        {error && <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 4, padding: "10px 14px", fontSize: 13, color: "#DC2626", marginBottom: 14 }}>{error}</div>}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 4, fontFamily: "system-ui", color: C.muted }}>Mot de passe</label>
          <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} onKeyDown={e => e.key === "Enter" && (pwd === ADMIN_PWD ? setAuth(true) : setError("Mot de passe incorrect"))}
            style={IS} placeholder="••••••••" />
        </div>
        <button onClick={() => pwd === ADMIN_PWD ? setAuth(true) : setError("Mot de passe incorrect")}
          style={{ width: "100%", background: C.sage, color: C.white, border: "none", borderRadius: 4, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "system-ui" }}>
          Se connecter →
        </button>
        <button onClick={onBack} style={{ width: "100%", background: "none", border: "none", color: C.muted, fontSize: 13, cursor: "pointer", marginTop: 12, fontFamily: "system-ui" }}>← Retour au site</button>
      </div>
    </div>
  );

  if (!cfg) return <div style={{ minHeight: "100vh", background: C.marble, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui", color: C.muted }}>⏳ Chargement...</div>;

  return (
    <div style={{ minHeight: "100vh", background: C.marble, fontFamily: "system-ui", color: C.stone }}>
      <header style={{ background: C.stone, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={onBack} style={{ color: "#AAA", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>← Site</button>
        <div style={{ color: C.white, fontWeight: 700 }}>🪦 Admin CleanNet Tombes</div>
        <button onClick={save} style={{ background: saved ? "#059669" : C.sage, color: C.white, border: "none", borderRadius: 6, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          {saving ? "⏳" : saved ? "✓ Sauvegardé !" : "💾 Sauvegarder"}
        </button>
      </header>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 20px 60px" }}>

        {/* WhatsApp */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: "20px", marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>📲 WhatsApp</h3>
          <label style={{ fontSize: 12, fontWeight: 600, display: "block", marginBottom: 4, color: C.muted }}>Numéro (format international sans +)</label>
          <input value={cfg.whatsapp || ""} onChange={e => setCfg(c => ({...c, whatsapp: e.target.value}))} style={IS} placeholder="33612922048" />
        </div>

        {/* Formules */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: "20px", marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>💶 Formules et tarifs</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(cfg.formules || []).map((f, fi) => (
              <div key={f.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: 8, alignItems: "end" }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, display: "block", marginBottom: 3, color: C.muted }}>{f.label} — Label</label>
                  <input value={f.desc} onChange={e => { const n=[...cfg.formules]; n[fi]={...n[fi],desc:e.target.value}; setCfg(c=>({...c,formules:n})); }} style={IS} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, display: "block", marginBottom: 3, color: C.muted }}>Badge (optionnel)</label>
                  <input value={f.badge || ""} onChange={e => { const n=[...cfg.formules]; n[fi]={...n[fi],badge:e.target.value||null}; setCfg(c=>({...c,formules:n})); }} style={IS} placeholder="ex: Populaire" />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, display: "block", marginBottom: 3, color: C.muted }}>Prix (€)</label>
                  <input type="number" value={f.prix} onChange={e => { const n=[...cfg.formules]; n[fi]={...n[fi],prix:Number(e.target.value)}; setCfg(c=>({...c,formules:n})); }} style={IS} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prestations */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: "20px", marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>🧹 Prestations</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(cfg.prestations || []).map((p, pi) => (
              <div key={p.id} style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: "12px 14px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "48px 1fr 80px", gap: 8, marginBottom: 8 }}>
                  <input value={p.icon} onChange={e => { const n=[...cfg.prestations]; n[pi]={...n[pi],icon:e.target.value}; setCfg(c=>({...c,prestations:n})); }} style={{...IS, textAlign:"center", fontSize:18}} />
                  <input value={p.label} onChange={e => { const n=[...cfg.prestations]; n[pi]={...n[pi],label:e.target.value}; setCfg(c=>({...c,prestations:n})); }} style={IS} placeholder="Nom de la prestation" />
                  <div style={{ position: "relative" }}>
                    <input type="number" value={p.sup || ""} onChange={e => { const n=[...cfg.prestations]; n[pi]={...n[pi],sup:e.target.value?Number(e.target.value):null}; setCfg(c=>({...c,prestations:n})); }} style={{...IS, paddingRight:24}} placeholder="0" />
                    <span style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", fontSize:11, color:C.muted }}>€</span>
                  </div>
                </div>
                <input value={p.desc} onChange={e => { const n=[...cfg.prestations]; n[pi]={...n[pi],desc:e.target.value}; setCfg(c=>({...c,prestations:n})); }} style={IS} placeholder="Description" />
              </div>
            ))}
          </div>
        </div>

        {/* Cimetières */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: "20px", marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px" }}>📍 Cimetières desservis</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(cfg.cimetieres || []).map((c, ci) => (
              <div key={ci} style={{ display: "flex", gap: 8 }}>
                <input value={c} onChange={e => { const n=[...cfg.cimetieres]; n[ci]=e.target.value; setCfg(cfg=>({...cfg,cimetieres:n})); }} style={{...IS, flex:1}} />
                <button onClick={() => setCfg(cfg=>({...cfg,cimetieres:cfg.cimetieres.filter((_,i)=>i!==ci)}))}
                  style={{ background:"#FEE2E2", border:"none", borderRadius:4, padding:"8px 12px", color:"#DC2626", cursor:"pointer", fontWeight:700 }}>✕</button>
              </div>
            ))}
            <button onClick={() => setCfg(c=>({...c,cimetieres:[...c.cimetieres,"Nouveau cimetière"]}))}
              style={{ background:"none", border:`1.5px dashed ${C.sage}`, borderRadius:6, padding:"9px", color:C.sage, fontWeight:600, cursor:"pointer" }}>
              + Ajouter un cimetière
            </button>
          </div>
        </div>

        {/* Mot de passe */}
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: "20px" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>🔑 Mot de passe admin</h3>
          <input value={cfg.adminPwd || ""} onChange={e => setCfg(c=>({...c,adminPwd:e.target.value}))} style={IS} placeholder="tombes2026" />
          <p style={{ fontSize: 11, color: C.muted, margin: "6px 0 0" }}>⚠️ Changez ce mot de passe et sauvegardez</p>
        </div>

        <button onClick={save} style={{ width:"100%", marginTop:20, background:saved?"#059669":C.sage, color:C.white, border:"none", borderRadius:6, padding:"14px", fontWeight:800, fontSize:15, cursor:"pointer" }}>
          {saving?"⏳ Sauvegarde...":saved?"✓ Sauvegardé !":"💾 Sauvegarder toutes les modifications"}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("landing");
  const [config, setConfig] = useState(null);

  useEffect(() => {
    fetch(`/api/config?t=${Date.now()}`)
      .then(r => r.json())
      .then(data => { if (data && Object.keys(data).length > 0) setConfig(data); })
      .catch(() => {});
  }, []);

  const path = window.location.pathname;
  if (path === "/admin") return <Admin onBack={() => window.location.href = "/"} />;
  if (page === "reservation") return <Reservation onBack={() => setPage("landing")} config={config} />;
  return <Landing onStart={() => setPage("reservation")} config={config} />;
}
