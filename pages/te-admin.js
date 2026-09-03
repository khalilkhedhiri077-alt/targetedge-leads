import { useEffect, useState } from 'react';

// ─── STYLES ────────────────────────────────────────────────────────────────
const css = {
  app: { maxWidth: 760, margin: '0 auto', background: '#fff', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  header: { background: '#185FA5', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { color: '#fff', fontWeight: 700, fontSize: 16 },
  sub: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 2 },
  tabs: { display: 'flex', borderBottom: '1px solid #eee', background: '#fafafa' },
  tab: (a) => ({ padding: '11px 18px', fontSize: 13, fontWeight: a ? 600 : 400, color: a ? '#185FA5' : '#666', borderBottom: a ? '2px solid #185FA5' : '2px solid transparent', cursor: 'pointer', background: 'none', border: 'none', borderBottom: a ? '2px solid #185FA5' : '2px solid transparent' }),
  body: { padding: '16px 18px' },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 16 },
  stat: (c) => ({ background: '#fafafa', border: '1px solid #eee', borderRadius: 8, padding: '10px 6px', textAlign: 'center' }),
  statN: (c) => ({ fontSize: 22, fontWeight: 700, color: c || '#1d1d1f' }),
  statL: { fontSize: 10, color: '#888', marginTop: 1 },
  card: { background: '#fafafa', border: '1px solid #eee', borderRadius: 10, padding: 14, marginBottom: 10 },
  cardBl: (c) => ({ ...{ background: '#fafafa', border: '1px solid #eee', borderRadius: '0 10px 10px 0', padding: 14, marginBottom: 10 }, borderLeft: '3px solid ' + (c || '#ddd') }),
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  name: { fontWeight: 600, fontSize: 14, color: '#1d1d1f' },
  meta: { fontSize: 11, color: '#666', marginTop: 3, lineHeight: 1.5 },
  badge: (bg, c) => ({ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: bg, color: c, whiteSpace: 'nowrap' }),
  btnRow: { display: 'flex', gap: 7, marginTop: 10 },
  btn: { padding: '7px 13px', fontSize: 12, fontWeight: 500, borderRadius: 7, border: '1px solid #ddd', background: '#fafafa', color: '#333', cursor: 'pointer' },
  btnP: { padding: '7px 13px', fontSize: 12, fontWeight: 500, borderRadius: 7, border: 'none', background: '#185FA5', color: '#fff', cursor: 'pointer' },
  btnOk: { padding: '7px 13px', fontSize: 12, fontWeight: 500, borderRadius: 7, border: 'none', background: '#EAF3DE', color: '#3B6D11', cursor: 'pointer' },
  btnKo: { padding: '7px 13px', fontSize: 12, fontWeight: 500, borderRadius: 7, border: 'none', background: '#FCEBEB', color: '#A32D2D', cursor: 'pointer' },
  btnWarn: { padding: '7px 13px', fontSize: 12, fontWeight: 500, borderRadius: 7, border: '1px solid #F0AD4E', background: '#FFF8E6', color: '#7a5c00', cursor: 'pointer' },
  filterRow: { display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' },
  filterBtn: (a) => ({ padding: '5px 11px', fontSize: 11, fontWeight: 500, borderRadius: 20, border: '1px solid ' + (a ? '#185FA5' : '#ddd'), background: a ? '#185FA5' : '#fafafa', color: a ? '#fff' : '#333', cursor: 'pointer' }),
  sectionTitle: { fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 6 },
  divider: { height: 1, background: '#eee', margin: '14px 0' },
  input: { width: '100%', padding: '7px 9px', fontSize: 13, border: '1px solid #ddd', borderRadius: 7, background: '#fff', marginBottom: 8, outline: 'none' },
  label: { display: 'block', fontSize: 11, fontWeight: 500, color: '#555', marginBottom: 3 },
  fgRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 },
  modalBox: { background: '#fff', borderRadius: 12, padding: 22, maxWidth: 440, width: '92%', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontWeight: 700, fontSize: 15, marginBottom: 14, color: '#1d1d1f' },
  totalBox: { background: '#E6F1FB', border: '1px solid #85B7EB', borderRadius: 8, padding: '10px 14px', marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 12, color: '#185FA5', fontWeight: 500 },
  totalVal: { fontSize: 18, fontWeight: 700, color: '#185FA5' },
  tableWrap: { overflowX: 'auto', marginTop: 6 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
  th: { padding: '8px 10px', background: '#f5f5f7', textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#555', borderBottom: '1px solid #eee' },
  td: { padding: '8px 10px', borderBottom: '1px solid #f0f0f0', verticalAlign: 'top' },
  tdR: { padding: '8px 10px', borderBottom: '1px solid #f0f0f0', textAlign: 'right', fontWeight: 600 },
};

const BADGE_MAP = {
  EN_ATTENTE: ['#F1EFE8', '#5F5E5A', 'En attente'],
  VALIDE: ['#EAF3DE', '#3B6D11', '✓ Validé'],
  REFUSE: ['#FCEBEB', '#A32D2D', '✕ Refusé'],
  CONTESTE: ['#FFF8E6', '#7a5c00', '⚠ Contesté'],
  ARBITRAGE_OK: ['#EAF3DE', '#3B6D11', '✓ Maintenu'],
  ARBITRAGE_KO: ['#FCEBEB', '#A32D2D', '✕ Invalidé'],
};

function Badge({ s }) {
  const [bg, c, label] = BADGE_MAP[s] || BADGE_MAP.EN_ATTENTE;
  return <span style={css.badge(bg, c)}>{label}</span>;
}

function borderCol(s) {
  if (s === 'VALIDE' || s === 'ARBITRAGE_OK') return '#639922';
  if (s === 'REFUSE' || s === 'ARBITRAGE_KO') return '#A32D2D';
  if (s === 'CONTESTE') return '#F0AD4E';
  return '#ddd';
}

// ─── LEAD CARD ─────────────────────────────────────────────────────────────
function LeadCard({ lead, onAction, cplSt }) {
  const [motif, setMotif] = useState('');
  const [showMotif, setShowMotif] = useState(false);

  function action(type) {
    if (type === 'REFUSE' && !motif.trim()) { setShowMotif(true); return; }
    onAction(lead.id, type, motif);
  }

  return (
    <div style={css.cardBl(borderCol(lead.statut))}>
      <div style={css.row}>
        <div style={{ flex: 1 }}>
          <div style={css.name}>{lead.societe}</div>
          <div style={css.meta}>
            <span style={{ fontSize: 10, background: '#E6F1FB', color: '#185FA5', borderRadius: 12, padding: '1px 7px', marginRight: 5, fontWeight: 600 }}>{lead.operation}</span>
            <span style={{ background: '#f0f0f0', borderRadius: 12, padding: '1px 6px', fontSize: 10 }}>{lead.centre}</span>
            <span style={{ marginLeft: 5 }}>{lead.date} {lead.heure}</span>
          </div>
          <div style={{ ...css.meta, marginTop: 5 }}>
            {lead.prenom} {lead.nom} — {lead.fonction}<br />
            {lead.tel}{lead.email ? ' · ' + lead.email : ''}
          </div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
            RDV : {lead.rdv_date} {lead.rdv_heure} ({lead.rdv_format}) · {lead.rdv_noshow}
          </div>
          {cplSt > 0 && (
            <div style={{ fontSize: 10, marginTop: 4, color: '#3B6D11', fontWeight: 500 }}>
              CPL sous-traitant : {cplSt}€ HT
            </div>
          )}
        </div>
        <Badge s={lead.statut} />
      </div>

      {lead.commentaire && (
        <div style={{ marginTop: 8, padding: '6px 9px', background: '#FFF8E6', borderRadius: 6, fontSize: 11, color: '#7a5c00' }}>
          💬 {lead.commentaire}
        </div>
      )}

      {lead.qualification && Object.keys(lead.qualification).length > 0 && (
        <details style={{ marginTop: 8 }}>
          <summary style={{ fontSize: 11, color: '#185FA5', cursor: 'pointer', fontWeight: 500 }}>Voir qualification</summary>
          <div style={{ marginTop: 6, fontSize: 11, color: '#444', lineHeight: 1.7, padding: '6px 0' }}>
            {Object.entries(lead.qualification)
              .filter(([k]) => !k.endsWith('_choice'))
              .map(([k, v]) => (
                <div key={k}><strong>{k.replace(/_/g, ' ')} :</strong> {Array.isArray(v) ? v.join(', ') : v}</div>
              ))}
          </div>
        </details>
      )}

      {lead.audio_url && (
        <audio controls style={{ width: '100%', marginTop: 10, height: 36 }} src={lead.audio_url} />
      )}

      {lead.statut === 'CONTESTE' && (
        <div style={{ marginTop: 10, padding: '10px 12px', background: '#FFF8E6', borderRadius: 8, border: '1px solid #F0AD4E' }}>
          <div style={{ fontWeight: 600, fontSize: 12, color: '#7a5c00', marginBottom: 4 }}>⚠ Contestation client</div>
          <div style={{ fontSize: 12, color: '#7a5c00' }}>{lead.contestation_motif}</div>
          <div style={{ fontSize: 10, color: '#aaa', marginTop: 3 }}>{lead.contestation_date}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button onClick={() => onAction(lead.id, 'ARBITRAGE_KO', '')} style={css.btnKo}>✕ Accepter contestation</button>
            <button onClick={() => onAction(lead.id, 'ARBITRAGE_OK', '')} style={css.btnOk}>✓ Rejeter — lead valide</button>
          </div>
        </div>
      )}

      {lead.statut === 'EN_ATTENTE' && (
        <div style={{ marginTop: 10 }}>
          {showMotif && (
            <textarea placeholder="Motif du refus (obligatoire)" value={motif} onChange={e => setMotif(e.target.value)}
              style={{ width: '100%', minHeight: 50, padding: '7px 9px', fontSize: 12, border: '1px solid #ddd', borderRadius: 7, resize: 'vertical', marginBottom: 7 }} />
          )}
          <div style={css.btnRow}>
            <button onClick={() => action('REFUSE')} style={css.btnKo}>✕ Refuser</button>
            <button onClick={() => action('VALIDE')} style={{ ...css.btnP, flex: 2 }}>✓ Valider → envoyer au client</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CPL CALCULATOR ────────────────────────────────────────────────────────
function CPLCalculator({ leads, config, target }) {
  // target = { type: 'st' | 'client', id, nom }
  const isSt = target.type === 'st';

  const relevant = leads.filter(l => {
    if (isSt) return l.centre === target.id;
    const clientOps = (config.campagnes || [])
      .filter(c => c.client_id === target.id && c.actif)
      .map(c => c.operation);
    return clientOps.includes(l.operation);
  });

  // Grouper par opération
  const byOp = {};
  relevant.forEach(l => {
    if (!byOp[l.operation]) byOp[l.operation] = { total: 0, valides: 0, refuses: 0, cpl: 0 };
    const campagne = (config.campagnes || []).find(c => c.operation === l.operation && (isSt ? true : c.client_id === target.id));
    const cpl = campagne ? (isSt ? campagne.cpl_st : campagne.cpl_client) : 0;
    byOp[l.operation].cpl = cpl;
    byOp[l.operation].total++;
    const valide = ['VALIDE', 'ARBITRAGE_OK'].includes(l.statut);
    const refuse = ['REFUSE', 'ARBITRAGE_KO'].includes(l.statut);
    if (valide) byOp[l.operation].valides++;
    if (refuse) byOp[l.operation].refuses++;
  });

  const grandTotal = Object.values(byOp).reduce((acc, v) => acc + v.valides * v.cpl, 0);
  const totalLeads = Object.values(byOp).reduce((acc, v) => acc + v.valides, 0);

  return (
    <div>
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>
        {isSt ? '📊 Calculateur CPL — ' : '🧾 Facture — '}{target.nom}
      </div>
      {Object.keys(byOp).length === 0 && (
        <div style={{ color: '#888', fontSize: 12, textAlign: 'center', padding: 20 }}>Aucun lead pour ce {isSt ? 'sous-traitant' : 'client'}</div>
      )}
      {Object.keys(byOp).length > 0 && (
        <>
          <div style={css.tableWrap}>
            <table style={css.table}>
              <thead>
                <tr>
                  <th style={css.th}>Opération</th>
                  <th style={css.th}>Saisis</th>
                  <th style={css.th}>Validés</th>
                  <th style={css.th}>Refusés</th>
                  <th style={css.th}>CPL</th>
                  <th style={{ ...css.th, textAlign: 'right' }}>Sous-total</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(byOp).map(([op, v]) => (
                  <tr key={op}>
                    <td style={css.td}>{op}</td>
                    <td style={css.td}>{v.total}</td>
                    <td style={{ ...css.td, color: '#3B6D11', fontWeight: 600 }}>{v.valides}</td>
                    <td style={{ ...css.td, color: '#A32D2D' }}>{v.refuses}</td>
                    <td style={css.td}>{v.cpl}€</td>
                    <td style={css.tdR}>{(v.valides * v.cpl).toFixed(2)}€</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={css.totalBox}>
            <div>
              <div style={css.totalLabel}>{totalLeads} leads validés · {isSt ? 'À payer au sous-traitant' : 'À facturer au client'}</div>
            </div>
            <div style={css.totalVal}>{grandTotal.toFixed(2)} € HT</div>
          </div>
          <div style={{ fontSize: 10, color: '#aaa', marginTop: 6, textAlign: 'right' }}>
            Leads refusés ou contestés-invalidés déduits automatiquement
          </div>
        </>
      )}
    </div>
  );
}

// ─── GESTION CAMPAGNES ─────────────────────────────────────────────────────
function GestionCampagnes({ config, onSave, onDelete }) {
  const [modal, setModal] = useState(null); // null | 'campagne' | 'st' | 'client'
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  function openNew(type) {
    setForm({ type, id: '', nom: '', operation: '', client_id: '', cpl_st: 0, cpl_client: 0, url_slug: '', actif: true });
    setModal(type);
  }
  function openEdit(row) {
    setForm({ ...row });
    setModal(row.type);
  }
  function setF(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function save() {
    if (!form.id || !form.nom) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
    setModal(null);
  }

  const { campagnes = [], soustraitants = [], clients = [] } = config;

  return (
    <div>
      {/* Campagnes */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={css.sectionTitle}>Campagnes / Opérations</div>
        <button style={css.btnP} onClick={() => openNew('CAMPAGNE')}>+ Nouvelle campagne</button>
      </div>
      {campagnes.filter(c => c.actif).map(c => {
        const cl = clients.find(x => x.id === c.client_id);
        return (
          <div key={c.id} style={{ ...css.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '10px 14px' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{c.operation}</div>
              <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>Client : {cl?.nom || c.client_id} · ST→ {c.cpl_st}€ · Client← {c.cpl_client}€</div>
              <div style={{ fontSize: 10, color: '#aaa', marginTop: 1 }}>/{c.url_slug || c.id}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={css.btn} onClick={() => openEdit(c)}>✏️ Modifier</button>
              <button style={css.btnKo} onClick={() => onDelete(c.id)}>Désactiver</button>
            </div>
          </div>
        );
      })}
      {campagnes.filter(c => c.actif).length === 0 && <div style={{ color: '#aaa', fontSize: 12, marginBottom: 10 }}>Aucune campagne active</div>}

      <div style={css.divider} />

      {/* Sous-traitants */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={css.sectionTitle}>Sous-traitants</div>
        <button style={css.btnP} onClick={() => openNew('SOUS_TRAITANT')}>+ Ajouter</button>
      </div>
      {soustraitants.filter(s => s.actif).map(s => (
        <div key={s.id} style={{ ...css.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '10px 14px' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{s.nom}</div>
            <div style={{ fontSize: 11, color: '#666' }}>ID : {s.id} · URL saisie : /saisie/{s.url_slug || s.id}</div>
          </div>
          <button style={css.btn} onClick={() => openEdit(s)}>✏️</button>
        </div>
      ))}

      <div style={css.divider} />

      {/* Clients */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={css.sectionTitle}>Clients / Fournisseurs</div>
        <button style={css.btnP} onClick={() => openNew('CLIENT')}>+ Ajouter</button>
      </div>
      {clients.filter(c => c.actif).map(c => (
        <div key={c.id} style={{ ...css.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '10px 14px' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{c.nom}</div>
            <div style={{ fontSize: 11, color: '#666' }}>ID : {c.id} · Lien : /client/{c.url_slug || c.id}</div>
          </div>
          <button style={css.btn} onClick={() => openEdit(c)}>✏️</button>
        </div>
      ))}

      {/* MODAL */}
      {modal && (
        <div style={css.modal}>
          <div style={css.modalBox}>
            <div style={css.modalTitle}>
              {modal === 'CAMPAGNE' ? '🏗 Campagne' : modal === 'SOUS_TRAITANT' ? '👥 Sous-traitant' : '🤝 Client'}
              {form.id ? ' — Modifier' : ' — Nouveau'}
            </div>

            <label style={css.label}>Identifiant unique (ex. : ynh, gconnex, decennale-btp)<span style={{ color: '#c00' }}>*</span></label>
            <input style={css.input} value={form.id} onChange={e => setF('id', e.target.value.toLowerCase().replace(/\s/g, '-'))} placeholder="ex. : ynh-callcenter" disabled={!!form.id && form.id.length > 0 && modal !== 'CAMPAGNE'} />

            <label style={css.label}>Nom affiché<span style={{ color: '#c00' }}>*</span></label>
            <input style={css.input} value={form.nom} onChange={e => setF('nom', e.target.value)} placeholder="ex. : Y&H Call Center" />

            {modal === 'CAMPAGNE' && (
              <>
                <label style={css.label}>Opération (ex. : Décennale BTP)<span style={{ color: '#c00' }}>*</span></label>
                <input style={css.input} value={form.operation} onChange={e => setF('operation', e.target.value)} placeholder="ex. : Décennale BTP" />

                <label style={css.label}>Client destinataire<span style={{ color: '#c00' }}>*</span></label>
                <select style={css.input} value={form.client_id} onChange={e => setF('client_id', e.target.value)}>
                  <option value="">— Choisir un client —</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>

                <div style={css.fgRow}>
                  <div>
                    <label style={css.label}>CPL sous-traitant (€ HT)</label>
                    <input style={css.input} type="number" value={form.cpl_st} onChange={e => setF('cpl_st', parseFloat(e.target.value))} placeholder="40" />
                  </div>
                  <div>
                    <label style={css.label}>CPL client (€ HT)</label>
                    <input style={css.input} type="number" value={form.cpl_client} onChange={e => setF('cpl_client', parseFloat(e.target.value))} placeholder="100" />
                  </div>
                </div>
                {form.cpl_st > 0 && form.cpl_client > 0 && (
                  <div style={{ fontSize: 11, color: '#3B6D11', background: '#EAF3DE', borderRadius: 7, padding: '6px 10px', marginBottom: 8 }}>
                    Marge TargetEdge : {(form.cpl_client - form.cpl_st).toFixed(2)}€ / lead ({Math.round((1 - form.cpl_st / form.cpl_client) * 100)}%)
                  </div>
                )}
              </>
            )}

            <label style={css.label}>Slug URL (laissez vide = identifiant)</label>
            <input style={css.input} value={form.url_slug} onChange={e => setF('url_slug', e.target.value)} placeholder="ex. : ynh (donnera /ynh-saisie)" />

            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <button style={css.btn} onClick={() => setModal(null)}>Annuler</button>
              <button style={{ ...css.btnP, flex: 2, opacity: saving ? 0.6 : 1 }} onClick={save} disabled={saving}>
                {saving ? 'Enregistrement...' : '💾 Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PAGE PRINCIPALE ADMIN ─────────────────────────────────────────────────
export default function Admin() {
  const [activeTab, setActiveTab] = useState('leads');
  const [cplTarget, setCplTarget] = useState(null);
  const [leads, setLeads] = useState([]);
  const [config, setConfig] = useState({ campagnes: [], soustraitants: [], clients: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('tous');

  function loadAll() {
    setLoading(true);
    Promise.all([
      fetch('/api/leads/list').then(r => r.json()),
      fetch('/api/config').then(r => r.json()),
    ]).then(([ld, cfg]) => {
      setLeads(ld.leads || []);
      setConfig(cfg);
      setLoading(false);
    });
  }

  useEffect(() => { loadAll(); }, []);

  async function handleAction(id, action, motif) {
    await fetch('/api/leads/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action, motif }),
    });
    loadAll();
  }

  async function handleSaveConfig(row) {
    await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save', row }),
    });
    loadAll();
  }

  async function handleDeleteConfig(id) {
    if (!confirm('Désactiver cette entrée ?')) return;
    await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', row: { id } }),
    });
    loadAll();
  }

  // Lookup CPL sous-traitant par opération
  function getCplSt(lead) {
    const c = config.campagnes.find(c => c.operation === lead.operation);
    return c ? c.cpl_st : 0;
  }

  const enAttente = leads.filter(l => l.statut === 'EN_ATTENTE');
  const contestes = leads.filter(l => l.statut === 'CONTESTE');
  const valides = leads.filter(l => l.statut === 'VALIDE' || l.statut === 'ARBITRAGE_OK');
  const refuses = leads.filter(l => l.statut === 'REFUSE' || l.statut === 'ARBITRAGE_KO');

  const filtered =
    filter === 'attente' ? enAttente :
    filter === 'conteste' ? contestes :
    filter === 'valide' ? valides :
    filter === 'refuse' ? refuses : leads;

  const TABS = [
    { id: 'leads', label: '📋 Leads' },
    { id: 'cpl', label: '💶 CPL / Facturation' },
    { id: 'config', label: '⚙️ Campagnes' },
  ];

  return (
    <div style={css.app}>
      <div style={css.header}>
        <div>
          <div style={css.logo}>TargetEdge — Admin</div>
          <div style={css.sub}>Tous centres · Validation & gestion</div>
        </div>
        <button onClick={loadAll} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 7, padding: '5px 11px', cursor: 'pointer', fontSize: 12 }}>🔄</button>
      </div>

      <div style={css.tabs}>
        {TABS.map(t => (
          <button key={t.id} style={css.tab(activeTab === t.id)} onClick={() => setActiveTab(t.id)}>{t.label}</button>
        ))}
      </div>

      <div style={css.body}>
        {loading && <div style={{ textAlign: 'center', color: '#888', padding: 40 }}>Chargement...</div>}

        {/* ── TAB LEADS ── */}
        {!loading && activeTab === 'leads' && (
          <>
            <div style={css.statGrid}>
              {[['En attente', enAttente.length, '#5F5E5A'], ['Contestés', contestes.length, '#7a5c00'], ['Validés', valides.length, '#3B6D11'], ['Refusés', refuses.length, '#A32D2D']].map(([l, n, c]) => (
                <div key={l} style={css.stat()}>
                  <div style={css.statN(c)}>{n}</div>
                  <div style={css.statL}>{l}</div>
                </div>
              ))}
            </div>

            <div style={css.filterRow}>
              {[['tous', 'Tous'], ['attente', 'En attente'], ['conteste', 'Contestés'], ['valide', 'Validés'], ['refuse', 'Refusés']].map(([v, l]) => (
                <button key={v} style={css.filterBtn(filter === v)} onClick={() => setFilter(v)}>{l}</button>
              ))}
            </div>

            {filter === 'tous' ? (
              <>
                {contestes.length > 0 && (
                  <>
                    <div style={css.sectionTitle}>⚠ À arbitrer en priorité</div>
                    {contestes.map(l => <LeadCard key={l.id} lead={l} onAction={handleAction} cplSt={getCplSt(l)} />)}
                    <div style={css.divider} />
                  </>
                )}
                {enAttente.length > 0 && (
                  <>
                    <div style={css.sectionTitle}>En attente de validation</div>
                    {enAttente.map(l => <LeadCard key={l.id} lead={l} onAction={handleAction} cplSt={getCplSt(l)} />)}
                    <div style={css.divider} />
                  </>
                )}
                {[...valides, ...refuses].length > 0 && (
                  <>
                    <div style={css.sectionTitle}>Traités</div>
                    {[...valides, ...refuses].map(l => <LeadCard key={l.id} lead={l} onAction={handleAction} cplSt={getCplSt(l)} />)}
                  </>
                )}
              </>
            ) : (
              filtered.map(l => <LeadCard key={l.id} lead={l} onAction={handleAction} cplSt={getCplSt(l)} />)
            )}
            {!loading && filtered.length === 0 && filter !== 'tous' && (
              <div style={{ textAlign: 'center', color: '#aaa', padding: 30 }}>Aucun lead dans cette catégorie</div>
            )}
          </>
        )}

        {/* ── TAB CPL / FACTURATION ── */}
        {!loading && activeTab === 'cpl' && (
          <>
            <div style={css.sectionTitle}>Sous-traitants</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {config.soustraitants.filter(s => s.actif).map(s => (
                <button key={s.id}
                  style={{ padding: '7px 14px', fontSize: 12, fontWeight: 500, borderRadius: 20, border: '1px solid ' + (cplTarget?.id === s.id ? '#185FA5' : '#ddd'), background: cplTarget?.id === s.id ? '#E6F1FB' : '#fafafa', color: cplTarget?.id === s.id ? '#185FA5' : '#333', cursor: 'pointer' }}
                  onClick={() => setCplTarget({ type: 'st', id: s.id, nom: s.nom })}>
                  👥 {s.nom}
                </button>
              ))}
            </div>

            <div style={css.sectionTitle}>Clients</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {config.clients.filter(c => c.actif).map(c => (
                <button key={c.id}
                  style={{ padding: '7px 14px', fontSize: 12, fontWeight: 500, borderRadius: 20, border: '1px solid ' + (cplTarget?.id === c.id ? '#185FA5' : '#ddd'), background: cplTarget?.id === c.id ? '#E6F1FB' : '#fafafa', color: cplTarget?.id === c.id ? '#185FA5' : '#333', cursor: 'pointer' }}
                  onClick={() => setCplTarget({ type: 'client', id: c.id, nom: c.nom })}>
                  🤝 {c.nom}
                </button>
              ))}
            </div>

            {cplTarget && (
              <div style={{ ...css.card, marginTop: 4 }}>
                <CPLCalculator leads={leads} config={config} target={cplTarget} />
              </div>
            )}
            {!cplTarget && (
              <div style={{ color: '#aaa', fontSize: 12, textAlign: 'center', padding: 30 }}>
                Sélectionnez un sous-traitant ou un client pour voir son calculateur
              </div>
            )}
          </>
        )}

        {/* ── TAB CONFIG ── */}
        {!loading && activeTab === 'config' && (
          <GestionCampagnes config={config} onSave={handleSaveConfig} onDelete={handleDeleteConfig} />
        )}
      </div>
    </div>
  );
}
