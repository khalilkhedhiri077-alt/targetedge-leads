import { useEffect, useState } from 'react';

const DELAI_H = 72;
function heuresRestantes(dv) {
  if (!dv) return 0;
  const d = new Date(dv);
  const r = (d.getTime() + DELAI_H * 3600000 - Date.now()) / 3600000;
  return Math.max(0, Math.round(r));
}

function borderCol(s) {
  if (s === 'VALIDE' || s === 'ARBITRAGE_OK') return '#639922';
  if (s === 'REFUSE' || s === 'ARBITRAGE_KO') return '#A32D2D';
  if (s === 'CONTESTE') return '#F0AD4E';
  return '#ddd';
}

export default function VueClient({ client, operation, titre }) {
  const [leads, setLeads] = useState([]);
  const [config, setConfig] = useState({ campagnes: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('leads');
  const [modal, setModal] = useState(null);
  const [motif, setMotif] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/leads/list?client=' + client).then(r => r.json()),
      fetch('/api/config').then(r => r.json()),
    ]).then(([ld, cfg]) => {
      setLeads(ld.leads || []);
      setConfig(cfg);
      setLoading(false);
    });
  }, [client]);

  async function contester(lead) {
    if (!motif.trim()) return;
    setSubmitting(true);
    await fetch('/api/leads/contester', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: lead.id, motif }),
    });
    setLeads(ls => ls.map(l => l.id === lead.id ? { ...l, statut: 'CONTESTE', contestation_motif: motif } : l));
    setModal(null); setMotif(''); setSubmitting(false);
  }

  // CPL
  const campagnesClient = (config.campagnes || []).filter(c => c.client_id === client && c.actif);
  const getCpl = (op) => { const c = campagnesClient.find(c => c.operation === op); return c ? c.cpl_client : 0; };
  const byOp = {};
  leads.forEach(l => {
    if (!byOp[l.operation]) byOp[l.operation] = { valides: 0, refuses: 0, contestes: 0, cpl: getCpl(l.operation) };
    if (['VALIDE', 'ARBITRAGE_OK'].includes(l.statut)) byOp[l.operation].valides++;
    if (['REFUSE', 'ARBITRAGE_KO'].includes(l.statut)) byOp[l.operation].refuses++;
    if (l.statut === 'CONTESTE') byOp[l.operation].contestes++;
  });
  const grandTotal = Object.values(byOp).reduce((a, v) => a + v.valides * v.cpl, 0);
  const totalLeads = Object.values(byOp).reduce((a, v) => a + v.valides, 0);

  const css = {
    app: { maxWidth: 620, margin: '0 auto', background: '#fff', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
    header: { background: '#185FA5', padding: '12px 18px' },
    logo: { color: '#fff', fontWeight: 700, fontSize: 15 },
    sub: { color: 'rgba(255,255,255,0.75)', fontSize: 11 },
    tabs: { display: 'flex', borderBottom: '1px solid #eee', background: '#fafafa' },
    tab: (a) => ({ padding: '10px 18px', fontSize: 13, fontWeight: a ? 600 : 400, color: a ? '#185FA5' : '#666', borderBottom: a ? '2px solid #185FA5' : '2px solid transparent', cursor: 'pointer', background: 'none', border: 'none' }),
    body: { padding: '14px 16px' },
    statGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 14 },
    stat: { background: '#fafafa', border: '1px solid #eee', borderRadius: 8, padding: '10px 6px', textAlign: 'center' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
    th: { padding: '8px 10px', background: '#f5f5f7', textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#555', borderBottom: '1px solid #eee' },
    td: { padding: '8px 10px', borderBottom: '1px solid #f0f0f0' },
    tdR: { padding: '8px 10px', borderBottom: '1px solid #f0f0f0', textAlign: 'right', fontWeight: 700 },
    totalBox: { background: '#E6F1FB', border: '1px solid #85B7EB', borderRadius: 8, padding: '12px 16px', marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  };

  const valides = leads.filter(l => ['VALIDE', 'ARBITRAGE_OK'].includes(l.statut));
  const contestes = leads.filter(l => l.statut === 'CONTESTE');
  const invalidés = leads.filter(l => l.statut === 'ARBITRAGE_KO');

  return (
    <div style={css.app}>
      <div style={css.header}>
        <div style={css.logo}>TargetEdge — {titre}</div>
        <div style={css.sub}>{operation}</div>
      </div>

      <div style={css.tabs}>
        <button style={css.tab(tab === 'leads')} onClick={() => setTab('leads')}>📋 Leads reçus</button>
        <button style={css.tab(tab === 'facture')} onClick={() => setTab('facture')}>🧾 Facture</button>
      </div>

      <div style={css.body}>
        {loading && <div style={{ color: '#888', textAlign: 'center', padding: 30 }}>Chargement...</div>}

        {/* ── TAB LEADS ── */}
        {!loading && tab === 'leads' && (
          <>
            <div style={css.statGrid}>
              {[['Leads reçus', totalLeads, '#3B6D11'], ['En contestation', contestes.length, '#7a5c00'], ['Invalidés', invalidés.length, '#A32D2D']].map(([l, n, c]) => (
                <div key={l} style={css.stat}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: c }}>{n}</div>
                  <div style={{ fontSize: 10, color: '#888', marginTop: 1 }}>{l}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 11, padding: '8px 12px', background: '#EAF3DE', borderRadius: 8, color: '#3B6D11', border: '1px solid #97C459', marginBottom: 14 }}>
              ✉ Email TargetEdge à chaque nouveau lead validé. <strong>72h</strong> pour contester.
            </div>

            {leads.filter(l => l.statut !== 'REFUSE').length === 0 && (
              <div style={{ color: '#aaa', textAlign: 'center', padding: 30 }}>Aucun lead pour le moment</div>
            )}

            {leads.filter(l => l.statut !== 'REFUSE').map(lead => {
              const hR = heuresRestantes(lead.date_validation);
              const contestable = lead.statut === 'VALIDE' && hR > 0;
              return (
                <div key={lead.id} style={{ borderLeft: '3px solid ' + borderCol(lead.statut), borderRadius: '0 10px 10px 0', background: '#fafafa', padding: '12px 14px', marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{lead.societe}</div>
                      <div style={{ fontSize: 12, color: '#444', marginTop: 3, lineHeight: 1.5 }}>
                        {lead.prenom} {lead.nom} — {lead.fonction}<br />
                        {lead.tel}{lead.email ? ' · ' + lead.email : ''}
                      </div>
                      {lead.qualification?.salaries && <div style={{ fontSize: 11, color: '#666', marginTop: 3 }}>{lead.qualification.salaries} salariés{lead.qualification.assureur ? ' · ' + lead.qualification.assureur : ''}{lead.qualification.echeance && lead.qualification.echeance !== 'Ne sait pas' ? ' · Éch. ' + lead.qualification.echeance : ''}</div>}
                      <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>RDV : {lead.rdv_date} {lead.rdv_heure} ({lead.rdv_format})</div>
                    </div>
                    <div>
                      {lead.statut === 'VALIDE' && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#EAF3DE', color: '#3B6D11' }}>✓ Validé</span>}
                      {lead.statut === 'CONTESTE' && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#FFF8E6', color: '#7a5c00' }}>⚠ En contestation</span>}
                      {lead.statut === 'ARBITRAGE_OK' && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#EAF3DE', color: '#3B6D11' }}>✓ Maintenu</span>}
                      {lead.statut === 'ARBITRAGE_KO' && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#FCEBEB', color: '#A32D2D' }}>✕ Invalidé</span>}
                    </div>
                  </div>

                  {lead.audio_url && <audio controls style={{ width: '100%', marginTop: 10, height: 36 }} src={lead.audio_url} />}

                  <div style={{ fontSize: 10, color: '#aaa', marginTop: 5 }}>Reçu le {lead.date} · TargetEdge</div>

                  {lead.statut === 'CONTESTE' && (
                    <div style={{ marginTop: 8, padding: '7px 10px', background: '#FFF8E6', borderRadius: 7, fontSize: 11, color: '#7a5c00' }}>Contestation envoyée — arbitrage TargetEdge en cours</div>
                  )}
                  {contestable && (
                    <button onClick={() => setModal(lead)} style={{ marginTop: 10, width: '100%', padding: 8, fontSize: 12, fontWeight: 500, borderRadius: 7, border: '1px solid #F0AD4E', background: '#FFF8E6', color: '#7a5c00', cursor: 'pointer' }}>
                      ⚠ Contester ce lead <span style={{ fontSize: 10, background: '#F3EDFC', border: '1px solid #A67DD4', borderRadius: 20, padding: '1px 7px', color: '#6B3FA0', marginLeft: 6 }}>{hR}h restantes</span>
                    </button>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* ── TAB FACTURE ── */}
        {!loading && tab === 'facture' && (
          <>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>🧾 Facture TargetEdge — {titre}</div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 12 }}>Leads validés uniquement · Refusés et invalidés déduits automatiquement</div>
            {Object.keys(byOp).length === 0 && <div style={{ color: '#aaa', textAlign: 'center', padding: 20 }}>Aucun lead facturé pour le moment</div>}
            {Object.keys(byOp).length > 0 && (
              <>
                <table style={css.table}>
                  <thead>
                    <tr>
                      <th style={css.th}>Opération</th>
                      <th style={css.th}>Leads</th>
                      <th style={{ ...css.th, color: '#A32D2D' }}>Déduits</th>
                      <th style={css.th}>Facturés</th>
                      <th style={css.th}>CPL</th>
                      <th style={{ ...css.th, textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(byOp).map(([op, v]) => (
                      <tr key={op}>
                        <td style={css.td}>{op}</td>
                        <td style={css.td}>{v.valides + v.refuses + v.contestes}</td>
                        <td style={{ ...css.td, color: '#A32D2D' }}>{v.refuses}</td>
                        <td style={{ ...css.td, color: '#3B6D11', fontWeight: 700 }}>{v.valides}</td>
                        <td style={css.td}>{v.cpl}€ HT</td>
                        <td style={css.tdR}>{(v.valides * v.cpl).toFixed(2)} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={css.totalBox}>
                  <div style={{ fontSize: 13, color: '#185FA5', fontWeight: 500 }}>{totalLeads} leads · Montant dû à TargetEdge</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#185FA5' }}>{grandTotal.toFixed(2)} € HT</div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Modal contestation */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, maxWidth: 360, width: '92%' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Contester — {modal.societe}</div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>Expliquez pourquoi ce lead n'est pas conforme.</div>
            <textarea value={motif} onChange={e => setMotif(e.target.value)} placeholder="Ex. : Prospect non décisionnaire, RDV non tenu..." style={{ width: '100%', minHeight: 75, padding: '7px 9px', fontSize: 12, border: '1px solid #ddd', borderRadius: 7, resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={() => { setModal(null); setMotif(''); }} style={{ flex: 1, padding: 9, fontSize: 12, borderRadius: 7, border: '1px solid #ddd', background: '#fafafa', cursor: 'pointer' }}>Annuler</button>
              <button onClick={() => contester(modal)} disabled={submitting || !motif.trim()} style={{ flex: 2, padding: 9, fontSize: 12, fontWeight: 500, borderRadius: 7, border: 'none', background: submitting ? '#aaa' : '#F0AD4E', color: '#fff', cursor: 'pointer' }}>
                {submitting ? 'Envoi...' : 'Envoyer la contestation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
