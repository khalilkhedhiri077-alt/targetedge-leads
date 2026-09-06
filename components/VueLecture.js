import { useEffect, useState } from 'react';

function borderCol(s) {
  if (s === 'VALIDE' || s === 'ARBITRAGE_OK') return '#639922';
  if (s === 'REFUSE' || s === 'ARBITRAGE_KO') return '#A32D2D';
  if (s === 'CONTESTE') return '#F0AD4E';
  return '#ddd';
}

export default function VueLecture({ centre, titre }) {
  const [leads, setLeads] = useState([]);
  const [campagnes, setCampagnes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('leads');
  const [opFilter, setOpFilter] = useState('tous');

  useEffect(() => {
    Promise.all([
      fetch('/api/leads/list?centre=' + centre).then(r => r.json()),
      fetch('/api/config').then(r => r.json()),
    ]).then(([ld, cfg]) => {
      setLeads(ld.leads || []);
      setCampagnes(cfg.campagnes || []);
      setLoading(false);
    });
  }, [centre]);

  function getCpl(op) {
    const c = campagnes.find(c => c.operation === op);
    return c ? Number(c.cpl_st) : 0;
  }

  const valides = leads.filter(l => ['VALIDE','ARBITRAGE_OK'].includes(l.statut));
  const refuses = leads.filter(l => ['REFUSE','ARBITRAGE_KO'].includes(l.statut));
  const enAttente = leads.filter(l => l.statut === 'EN_ATTENTE');

  const byOp = {};
  leads.forEach(l => {
    if (!byOp[l.operation]) byOp[l.operation] = { valides: 0, refuses: 0, attente: 0, cpl: getCpl(l.operation) };
    if (['VALIDE','ARBITRAGE_OK'].includes(l.statut)) byOp[l.operation].valides++;
    else if (['REFUSE','ARBITRAGE_KO'].includes(l.statut)) byOp[l.operation].refuses++;
    else byOp[l.operation].attente++;
  });

  const totalDu = Object.values(byOp).reduce((a, v) => a + (v.valides * v.cpl), 0);
  const totalLeadsValides = valides.length;
  const ops = [...new Set(leads.map(l => l.operation))];
  const filtered = opFilter === 'tous' ? leads : leads.filter(l => l.operation === opFilter);

  const css = {
    app: { maxWidth: 620, margin: '0 auto', background: '#fff', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
    header: { background: '#185FA5', padding: '12px 18px' },
    tabs: { display: 'flex', borderBottom: '1px solid #eee', background: '#fafafa' },
    tab: (a) => ({ padding: '10px 18px', fontSize: 13, fontWeight: a ? 600 : 400, color: a ? '#185FA5' : '#666', borderBottom: a ? '2px solid #185FA5' : '2px solid transparent', cursor: 'pointer', background: 'none', border: 'none' }),
    body: { padding: '14px 16px' },
    statGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 14 },
    stat: { background: '#fafafa', border: '1px solid #eee', borderRadius: 8, padding: '10px 6px', textAlign: 'center' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
    th: { padding: '8px 10px', background: '#f5f5f7', textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#555', borderBottom: '1px solid #eee' },
    td: { padding: '8px 10px', borderBottom: '1px solid #f0f0f0' },
    tdR: { padding: '8px 10px', borderBottom: '1px solid #f0f0f0', textAlign: 'right', fontWeight: 700 },
    totalBox: { background: '#EAF3DE', border: '1px solid #97C459', borderRadius: 8, padding: '12px 16px', marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    filterRow: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 },
    filterBtn: (a) => ({ padding: '5px 11px', fontSize: 11, fontWeight: 500, borderRadius: 20, border: '1px solid ' + (a ? '#185FA5' : '#ddd'), background: a ? '#185FA5' : '#fafafa', color: a ? '#fff' : '#333', cursor: 'pointer' }),
  };

  return (
    <div style={css.app}>
      <div style={css.header}>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>TargetEdge — {titre}</div>
        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 2 }}>Lecture seule · Informations client final non visibles</div>
      </div>
      <div style={css.tabs}>
        <button style={css.tab(tab === 'leads')} onClick={() => setTab('leads')}>📋 Mes leads</button>
        <button style={css.tab(tab === 'cpl')} onClick={() => setTab('cpl')}>💶 Mon calculateur</button>
      </div>
      <div style={css.body}>
        {loading && <div style={{ color: '#888', textAlign: 'center', padding: 30 }}>Chargement...</div>}

        {!loading && tab === 'leads' && (
          <>
            <div style={css.statGrid}>
              {[['Total', leads.length, '#1d1d1f'], ['Validés', valides.length, '#3B6D11'], ['Refusés', refuses.length, '#A32D2D'], ['Attente', enAttente.length, '#5F5E5A']].map(([l, n, c]) => (
                <div key={l} style={css.stat}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: c }}>{n}</div>
                  <div style={{ fontSize: 10, color: '#888', marginTop: 1 }}>{l}</div>
                </div>
              ))}
            </div>
            {ops.length > 1 && (
              <div style={css.filterRow}>
                <button style={css.filterBtn(opFilter === 'tous')} onClick={() => setOpFilter('tous')}>Toutes</button>
                {ops.map(op => <button key={op} style={css.filterBtn(opFilter === op)} onClick={() => setOpFilter(op)}>{op}</button>)}
              </div>
            )}
            {filtered.length === 0 && <div style={{ color: '#aaa', textAlign: 'center', padding: 30 }}>Aucun lead</div>}
            {filtered.map(lead => (
              <div key={lead.id} style={{ borderLeft: '3px solid ' + borderCol(lead.statut), borderRadius: '0 10px 10px 0', background: '#fafafa', padding: '11px 13px', marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{lead.societe}</div>
                    <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                      <span style={{ fontSize: 10, background: '#E6F1FB', color: '#185FA5', borderRadius: 12, padding: '1px 6px', marginRight: 5, fontWeight: 600 }}>{lead.operation}</span>
                      {lead.date} {lead.heure}
                    </div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>RDV : {lead.rdv_date} {lead.rdv_heure} ({lead.rdv_format})</div>
                    {getCpl(lead.operation) > 0 && ['VALIDE','ARBITRAGE_OK'].includes(lead.statut) && (
                      <div style={{ fontSize: 10, color: '#3B6D11', fontWeight: 600, marginTop: 3 }}>+ {getCpl(lead.operation)} € CPL</div>
                    )}
                  </div>
                  <div>
                    {lead.statut === 'EN_ATTENTE' && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#F1EFE8', color: '#5F5E5A' }}>En attente</span>}
                    {lead.statut === 'VALIDE' && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#EAF3DE', color: '#3B6D11' }}>✓ Validé</span>}
                    {['REFUSE','ARBITRAGE_KO'].includes(lead.statut) && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#FCEBEB', color: '#A32D2D' }}>✕ Non validé</span>}
                    {lead.statut === 'CONTESTE' && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#FFF8E6', color: '#7a5c00' }}>⚠ Contesté</span>}
                    {lead.statut === 'ARBITRAGE_OK' && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#EAF3DE', color: '#3B6D11' }}>✓ Maintenu</span>}
                  </div>
                </div>
                {['VALIDE','ARBITRAGE_OK'].includes(lead.statut) && lead.audio_url && (
                  <audio controls style={{ width: '100%', marginTop: 8, height: 34 }} src={lead.audio_url} />
                )}
                {['REFUSE','ARBITRAGE_KO'].includes(lead.statut) && lead.motif_refus && (
                  <div style={{ fontSize: 10, color: '#A32D2D', marginTop: 5, padding: '5px 8px', background: '#FCEBEB', borderRadius: 6 }}>Motif : {lead.motif_refus}</div>
                )}
              </div>
            ))}
          </>
        )}

        {!loading && tab === 'cpl' && (
          <>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>💶 Calculateur CPL — {titre}</div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 12 }}>Seuls les leads <strong>validés</strong> sont comptabilisés. Les refusés sont automatiquement déduits.</div>
            {Object.keys(byOp).length === 0 && <div style={{ color: '#aaa', textAlign: 'center', padding: 30 }}>Aucun lead enregistré</div>}
            {Object.keys(byOp).length > 0 && (
              <>
                <table style={css.table}>
                  <thead>
                    <tr>
                      <th style={css.th}>Opération</th>
                      <th style={css.th}>Soumis</th>
                      <th style={{ ...css.th, color: '#3B6D11' }}>Validés</th>
                      <th style={{ ...css.th, color: '#A32D2D' }}>Refusés</th>
                      <th style={css.th}>CPL</th>
                      <th style={{ ...css.th, textAlign: 'right' }}>À percevoir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(byOp).map(([op, v]) => (
                      <tr key={op}>
                        <td style={css.td}><strong>{op}</strong></td>
                        <td style={css.td}>{v.valides + v.refuses + v.attente}</td>
                        <td style={{ ...css.td, color: '#3B6D11', fontWeight: 700 }}>{v.valides}</td>
                        <td style={{ ...css.td, color: '#A32D2D' }}>{v.refuses}</td>
                        <td style={css.td}>{v.cpl > 0 ? v.cpl + ' €' : '—'}</td>
                        <td style={css.tdR}>{v.cpl > 0 ? (v.valides * v.cpl).toFixed(2) + ' €' : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={css.totalBox}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#3B6D11' }}>{totalLeadsValides} leads validés</div>
                    <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>Montant à percevoir de TargetEdge</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#3B6D11' }}>{totalDu.toFixed(2)} € HT</div>
                </div>
                <div style={{ fontSize: 10, color: '#aaa', marginTop: 8 }}>⚠ Les leads contestés et invalidés sont automatiquement déduits.</div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
