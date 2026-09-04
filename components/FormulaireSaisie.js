import { useState } from 'react';
import { OPERATIONS, OPERATION_NAMES } from '../lib/operations';

const S = {
  app: { maxWidth: 520, margin: '0 auto', background: '#fff', minHeight: '100vh' },
  header: { background: '#185FA5', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 },
  logo: { color: '#fff', fontWeight: 600, fontSize: 15 },
  subhead: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  pbar: { height: 3, background: '#ddd' },
  pfill: (pct) => ({ height: '100%', background: '#185FA5', width: pct + '%', transition: 'width 0.3s' }),
  body: { padding: 18 },
  slabel: { fontSize: 10, fontWeight: 600, color: '#888', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 },
  stitle: { fontSize: 17, fontWeight: 600, color: '#1d1d1f', marginBottom: 14 },
  opGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  opCard: (sel) => ({ border: sel ? '2px solid #185FA5' : '1px solid #ddd', borderRadius: 10, padding: '14px 10px', textAlign: 'center', cursor: 'pointer', background: sel ? '#E6F1FB' : '#fafafa', transition: 'all 0.12s' }),
  opIcon: { fontSize: 22, marginBottom: 5 },
  opName: { fontSize: 12, fontWeight: 600, color: '#1d1d1f' },
  fg: { marginBottom: 13 },
  fgRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  label: { display: 'block', fontSize: 12, fontWeight: 500, color: '#555', marginBottom: 4 },
  req: { color: '#c00', marginLeft: 2 },
  hint: { fontSize: 10, fontWeight: 400, color: '#999', marginLeft: 3 },
  input: (err) => ({ width: '100%', padding: '8px 10px', fontSize: 13, border: err ? '1px solid #c00' : '1px solid #ddd', borderRadius: 7, background: '#fafafa', outline: 'none' }),
  textarea: (err) => ({ width: '100%', padding: '8px 10px', fontSize: 13, border: err ? '1px solid #c00' : '1px solid #ddd', borderRadius: 7, background: '#fafafa', resize: 'vertical', minHeight: 70, outline: 'none' }),
  err: { fontSize: 10, color: '#c00', marginTop: 3 },
  radioGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  radioOpt: (sel) => ({ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', border: sel ? '1.5px solid #185FA5' : '1px solid #ddd', borderRadius: 7, cursor: 'pointer', background: sel ? '#E6F1FB' : '#fafafa' }),
  checkOpt: { display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', border: '1px solid #ddd', borderRadius: 7, marginBottom: 5, cursor: 'pointer' },
  sdiv: { fontSize: 10, fontWeight: 600, color: '#888', letterSpacing: 1, textTransform: 'uppercase', borderTop: '1px solid #eee', paddingTop: 10, margin: '14px 0 8px' },
  warnBox: { background: '#FFF8E6', border: '1px solid #F0AD4E', borderRadius: 7, padding: '8px 10px', fontSize: 11, color: '#7a5c00', marginBottom: 10, lineHeight: 1.5 },
  btnRow: { display: 'flex', gap: 8, marginTop: 16 },
  btn: { padding: '9px 14px', fontSize: 13, fontWeight: 500, borderRadius: 7, border: '1px solid #ddd', background: '#fafafa', color: '#333', cursor: 'pointer', flex: 1 },
  btnP: { padding: '9px 14px', fontSize: 13, fontWeight: 500, borderRadius: 7, border: 'none', background: '#185FA5', color: '#fff', cursor: 'pointer', flex: 2 },
  audioZone: (hasFile) => ({ border: hasFile ? '2px solid #3B6D11' : '2px dashed #ddd', borderRadius: 10, padding: 22, textAlign: 'center', cursor: 'pointer', background: hasFile ? '#EAF3DE' : '#fafafa', marginBottom: 8 }),
  recap: { background: '#fafafa', border: '1px solid #eee', borderRadius: 10, padding: 14, marginBottom: 14 },
  rrow: { display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #eee', gap: 8 },
  rlabel: { fontSize: 11, color: '#888', flexShrink: 0, width: 130 },
  rval: { fontSize: 12, color: '#1d1d1f', textAlign: 'right', wordBreak: 'break-word' },
  success: { textAlign: 'center', padding: '50px 20px' },
};

export default function FormulaireSaisie({ centre }) {
  const STEPS = 9;
  const [step, setStep] = useState(1);
  const [op, setOp] = useState('');
  const [errors, setErrors] = useState({});
  const [audioFile, setAudioFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    societe: '', siret: '', cp: '', adresse: '',
    nom: '', prenom: '', fonction: '', tel: '', email: '',
    qualification: {},
    rdv_date: '', rdv_heure: '', rdv_format: '', rdv_noshow: '',
    commentaire: '',
  });

  const pct = Math.round((step / STEPS) * 100);

  function setF(key, val) { setForm(f => ({ ...f, [key]: val })); }
  function setQ(key, val) { setForm(f => ({ ...f, qualification: { ...f.qualification, [key]: val } })); }

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
  }

  function validate(s) {
    const errs = {};
    if (s === 2) {
      if (!form.societe.trim()) errs.societe = 'Obligatoire';
      if (!/^\d{14}$/.test(form.siret.replace(/\s/g, ''))) errs.siret = '14 chiffres requis';
      if (!/^\d{5}$/.test(form.cp)) errs.cp = '5 chiffres';
      if (!form.adresse.trim()) errs.adresse = 'Obligatoire';
    }
    if (s === 3) {
      if (!form.nom.trim()) errs.nom = 'Obligatoire';
      if (!form.prenom.trim()) errs.prenom = 'Obligatoire';
      if (!form.fonction.trim()) errs.fonction = 'Obligatoire';
      if (!/^(0|\+33)[0-9]{9}$/.test(form.tel.replace(/[\s.-]/g, ''))) errs.tel = 'Format invalide';
    }
    if (s === 4) {
      const fields = OPERATIONS[op]?.fields || [];
      fields.forEach(f => {
        if (f.divider || !f.req) return;
        if (f.type === 'date-or-unknown') {
          const choice = form.qualification[f.id + '_choice'];
          if (!choice) { errs['q_' + f.id] = 'Obligatoire'; return; }
          if (choice === 'date' && !form.qualification[f.id]) errs['q_' + f.id] = 'Choisissez une date';
        } else if (f.type === 'radio') {
          if (!form.qualification[f.id]) errs['q_' + f.id] = 'Obligatoire';
        } else {
          if (!form.qualification[f.id]?.toString().trim()) errs['q_' + f.id] = 'Obligatoire';
        }
      });
    }
    if (s === 5) {
      if (!form.rdv_date) errs.rdv_date = 'Obligatoire';
      if (!form.rdv_heure) errs.rdv_heure = 'Obligatoire';
      if (!form.rdv_format) errs.rdv_format = 'Sélectionnez un format';
      if (!form.rdv_noshow) errs.rdv_noshow = 'Obligatoire';
    }
    if (s === 6) {
      if (!form.commentaire.trim()) errs.commentaire = 'Commentaire obligatoire';
    }
    if (s === 7) {
      if (!audioFile) errs.audio = "L'enregistrement est obligatoire";
    }
    return errs;
  }

  function next(to) {
    const errs = validate(step);
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep(to);
  }

  async function submit() {
    setSubmitting(true);
    try {
      const SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
      const now = new Date();
      const lead = {
        id: Math.random().toString(36).substr(2, 9) + Date.now(),
        date: now.toLocaleDateString('fr-FR'),
        heure: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        centre: centre,
        operation: op,
        societe: form.societe,
        siret: form.siret,
        cp: form.cp,
        adresse: form.adresse,
        nom: form.nom,
        prenom: form.prenom,
        fonction: form.fonction,
        tel: form.tel,
        email: form.email,
        qualification: form.qualification,
        rdv_date: form.rdv_date,
        rdv_heure: form.rdv_heure,
        rdv_format: form.rdv_format,
        rdv_noshow: form.rdv_noshow,
        commentaire: form.commentaire,
        audio_url: audioFile ? await toBase64(audioFile) : '',
      };

      await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'append_lead', lead }),
      });

      setDone(true);
    } catch (e) {
      alert("Erreur lors de l'envoi. Réessayez.");
    }
    setSubmitting(false);
  }

  function reset() {
    setStep(1); setOp(''); setErrors({});
    setAudioFile(null); setDone(false);
    setForm({ societe: '', siret: '', cp: '', adresse: '', nom: '', prenom: '', fonction: '', tel: '', email: '', qualification: {}, rdv_date: '', rdv_heure: '', rdv_format: '', rdv_noshow: '', commentaire: '' });
  }

  function renderQField(f) {
    const qval = form.qualification[f.id];
    const qerr = errors['q_' + f.id];
    if (f.type === 'text' || f.type === 'number') {
      return (
        <div key={f.id} style={S.fg}>
          <label style={S.label}>{f.label}{f.req && <span style={S.req}>*</span>}</label>
          <input style={S.input(qerr)} type={f.type} placeholder={f.placeholder || ''} value={qval || ''} onChange={e => setQ(f.id, e.target.value)} />
          {qerr && <div style={S.err}>{qerr}</div>}
        </div>
      );
    }
    if (f.type === 'date-or-unknown') {
      const choice = form.qualification[f.id + '_choice'];
      return (
        <div key={f.id} style={S.fg}>
          <label style={S.label}>{f.label}{f.req && <span style={S.req}>*</span>}</label>
          <div style={S.radioGroup}>
            {['date', 'unknown'].map(v => (
              <label key={v} style={S.radioOpt(choice === v)}>
                <input type="radio" name={'du_' + f.id} value={v} checked={choice === v} onChange={() => { setQ(f.id + '_choice', v); if (v === 'unknown') setQ(f.id, 'Ne sait pas'); else setQ(f.id, ''); }} style={{ accentColor: '#185FA5' }} />
                <span style={{ fontSize: 13 }}>{v === 'date' ? 'Connue — choisir la date' : 'Ne sait pas'}</span>
              </label>
            ))}
          </div>
          {choice === 'date' && (
            <input style={{ ...S.input(qerr), marginTop: 6 }} type="date" value={qval || ''} onChange={e => setQ(f.id, e.target.value)} />
          )}
          {qerr && <div style={S.err}>{qerr}</div>}
        </div>
      );
    }
    if (f.type === 'radio') {
      return (
        <div key={f.id} style={S.fg}>
          <label style={S.label}>{f.label}{f.req && <span style={S.req}>*</span>}</label>
          <div style={S.radioGroup}>
            {f.options.map(opt => (
              <label key={opt} style={S.radioOpt(qval === opt)}>
                <input type="radio" name={'q_' + f.id} value={opt} checked={qval === opt} onChange={() => setQ(f.id, opt)} style={{ accentColor: '#185FA5' }} />
                <span style={{ fontSize: 12 }}>{opt}</span>
              </label>
            ))}
          </div>
          {qerr && <div style={S.err}>{qerr}</div>}
        </div>
      );
    }
    if (f.type === 'checkboxes') {
      const vals = form.qualification[f.id] || [];
      return (
        <div key={f.id} style={S.fg}>
          <label style={S.label}>{f.label}{f.req && <span style={S.req}>*</span>}<span style={S.hint}>(plusieurs choix)</span></label>
          {f.options.map(opt => (
            <label key={opt} style={S.checkOpt}>
              <input type="checkbox" checked={vals.includes(opt)} onChange={e => {
                const next = e.target.checked ? [...vals, opt] : vals.filter(v => v !== opt);
                setQ(f.id, next);
              }} style={{ accentColor: '#185FA5' }} />
              <span style={{ fontSize: 12 }}>{opt}</span>
            </label>
          ))}
        </div>
      );
    }
    return null;
  }

  if (done) return (
    <div style={S.app}>
      <div style={S.header}><span style={S.logo}>TargetEdge</span></div>
      <div style={S.success}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Lead envoyé</div>
        <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>En attente de validation TargetEdge.</div>
        <button style={{ ...S.btnP, flex: 'none', marginTop: 22, padding: '10px 22px' }} onClick={reset}>+ Nouveau lead</button>
      </div>
    </div>
  );

  return (
    <div style={S.app}>
      <div style={S.header}>
        <div>
          <div style={S.logo}>TargetEdge — Dépôt de lead</div>
          <div style={S.subhead}>{op || 'Sélectionnez une opération'}</div>
        </div>
      </div>
      <div style={S.pbar}><div style={S.pfill(pct)} /></div>
      <div style={S.body}>

        {step === 1 && (
          <>
            <div style={S.slabel}>Étape 1 / {STEPS}</div>
            <div style={S.stitle}>Type d'opération</div>
            <div style={S.opGrid}>
              {OPERATION_NAMES.map(name => (
                <div key={name} style={S.opCard(op === name)} onClick={() => { setOp(name); setTimeout(() => setStep(2), 280); }}>
                  <div style={S.opIcon}>{OPERATIONS[name].icon}</div>
                  <div style={S.opName}>{name}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={S.slabel}>Étape 2 / {STEPS}</div>
            <div style={S.stitle}>Société</div>
            <div style={S.fg}>
              <label style={S.label}>Nom de la société<span style={S.req}>*</span></label>
              <input style={S.input(errors.societe)} type="text" placeholder="Ex. : BTP Horizon SARL" value={form.societe} onChange={e => setF('societe', e.target.value)} />
              {errors.societe && <div style={S.err}>{errors.societe}</div>}
            </div>
            <div style={S.fgRow}>
              <div style={S.fg}>
                <label style={S.label}>SIRET<span style={S.req}>*</span></label>
                <input style={S.input(errors.siret)} type="text" placeholder="14 chiffres" maxLength={14} value={form.siret} onChange={e => setF('siret', e.target.value)} />
                {errors.siret && <div style={S.err}>{errors.siret}</div>}
              </div>
              <div style={S.fg}>
                <label style={S.label}>Code postal<span style={S.req}>*</span></label>
                <input style={S.input(errors.cp)} type="text" placeholder="44000" maxLength={5} value={form.cp} onChange={e => setF('cp', e.target.value)} />
                {errors.cp && <div style={S.err}>{errors.cp}</div>}
              </div>
            </div>
            <div style={S.fg}>
              <label style={S.label}>Ville / Adresse<span style={S.req}>*</span></label>
              <input style={S.input(errors.adresse)} type="text" placeholder="Ville et adresse" value={form.adresse} onChange={e => setF('adresse', e.target.value)} />
              {errors.adresse && <div style={S.err}>{errors.adresse}</div>}
            </div>
            <div style={S.btnRow}>
              <button style={S.btn} onClick={() => setStep(1)}>← Retour</button>
              <button style={S.btnP} onClick={() => next(3)}>Continuer →</button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div style={S.slabel}>Étape 3 / {STEPS}</div>
            <div style={S.stitle}>Décisionnaire</div>
            <div style={S.fgRow}>
              <div style={S.fg}>
                <label style={S.label}>Nom<span style={S.req}>*</span></label>
                <input style={S.input(errors.nom)} type="text" value={form.nom} onChange={e => setF('nom', e.target.value)} />
                {errors.nom && <div style={S.err}>{errors.nom}</div>}
              </div>
              <div style={S.fg}>
                <label style={S.label}>Prénom<span style={S.req}>*</span></label>
                <input style={S.input(errors.prenom)} type="text" value={form.prenom} onChange={e => setF('prenom', e.target.value)} />
                {errors.prenom && <div style={S.err}>{errors.prenom}</div>}
              </div>
            </div>
            <div style={S.fg}>
              <label style={S.label}>Fonction<span style={S.req}>*</span></label>
              <input style={S.input(errors.fonction)} type="text" placeholder="Ex. : Gérant, DG..." value={form.fonction} onChange={e => setF('fonction', e.target.value)} />
              {errors.fonction && <div style={S.err}>{errors.fonction}</div>}
            </div>
            <div style={S.fgRow}>
              <div style={S.fg}>
                <label style={S.label}>Téléphone<span style={S.req}>*</span></label>
                <input style={S.input(errors.tel)} type="tel" placeholder="06 XX XX XX XX" value={form.tel} onChange={e => setF('tel', e.target.value)} />
                {errors.tel && <div style={S.err}>{errors.tel}</div>}
              </div>
              <div style={S.fg}>
                <label style={S.label}>Email<span style={S.hint}>(facultatif)</span></label>
                <input style={S.input(false)} type="email" placeholder="contact@..." value={form.email} onChange={e => setF('email', e.target.value)} />
              </div>
            </div>
            <div style={S.btnRow}>
              <button style={S.btn} onClick={() => setStep(2)}>← Retour</button>
              <button style={S.btnP} onClick={() => next(4)}>Continuer →</button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div style={S.slabel}>Étape 4 / {STEPS}</div>
            <div style={S.stitle}>Qualification — {op}</div>
            {(OPERATIONS[op]?.fields || []).map((f, i) => {
              if (f.divider) return <div key={i} style={S.sdiv}>{f.divider}</div>;
              return renderQField(f);
            })}
            <div style={S.btnRow}>
              <button style={S.btn} onClick={() => setStep(3)}>← Retour</button>
              <button style={S.btnP} onClick={() => next(5)}>Continuer →</button>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <div style={S.slabel}>Étape 5 / {STEPS}</div>
            <div style={S.stitle}>RDV confirmé</div>
            <div style={S.fgRow}>
              <div style={S.fg}>
                <label style={S.label}>Date du RDV<span style={S.req}>*</span></label>
                <input style={S.input(errors.rdv_date)} type="date" value={form.rdv_date} onChange={e => setF('rdv_date', e.target.value)} />
                {errors.rdv_date && <div style={S.err}>{errors.rdv_date}</div>}
              </div>
              <div style={S.fg}>
                <label style={S.label}>Heure<span style={S.req}>*</span></label>
                <input style={S.input(errors.rdv_heure)} type="time" value={form.rdv_heure} onChange={e => setF('rdv_heure', e.target.value)} />
                {errors.rdv_heure && <div style={S.err}>{errors.rdv_heure}</div>}
              </div>
            </div>
            <div style={S.fg}>
              <label style={S.label}>Format<span style={S.req}>*</span></label>
              <div style={S.radioGroup}>
                {['Visio', 'Téléphone'].map(v => (
                  <label key={v} style={S.radioOpt(form.rdv_format === v)}>
                    <input type="radio" name="rdv_format" value={v} checked={form.rdv_format === v} onChange={() => setF('rdv_format', v)} style={{ accentColor: '#185FA5' }} />
                    <span style={{ fontSize: 13 }}>{v}</span>
                  </label>
                ))}
              </div>
              {errors.rdv_format && <div style={S.err}>{errors.rdv_format}</div>}
            </div>
            <div style={S.fg}>
              <label style={S.label}>Anti no-show<span style={S.req}>*</span></label>
              <div style={S.radioGroup}>
                {['Oui — prospect a confirmé sa présence', 'Non — confirmation non obtenue'].map(v => (
                  <label key={v} style={S.radioOpt(form.rdv_noshow === v)}>
                    <input type="radio" name="rdv_noshow" value={v} checked={form.rdv_noshow === v} onChange={() => setF('rdv_noshow', v)} style={{ accentColor: '#185FA5' }} />
                    <span style={{ fontSize: 12 }}>{v}</span>
                  </label>
                ))}
              </div>
              {errors.rdv_noshow && <div style={S.err}>{errors.rdv_noshow}</div>}
            </div>
            <div style={S.btnRow}>
              <button style={S.btn} onClick={() => setStep(4)}>← Retour</button>
              <button style={S.btnP} onClick={() => next(6)}>Continuer →</button>
            </div>
          </>
        )}

        {step === 6 && (
          <>
            <div style={S.slabel}>Étape 6 / {STEPS}</div>
            <div style={S.stitle}>Commentaire agent</div>
            <div style={S.warnBox}>Notez tout ce qui ne figure pas dans les champs : attitude, hésitations, engagement verbal, contexte particulier...</div>
            <div style={S.fg}>
              <label style={S.label}>Commentaire<span style={S.req}>*</span></label>
              <textarea style={S.textarea(errors.commentaire)} placeholder="Ex. : Très motivé, renouvellement dans 6 semaines..." value={form.commentaire} onChange={e => setF('commentaire', e.target.value)} />
              {errors.commentaire && <div style={S.err}>{errors.commentaire}</div>}
            </div>
            <div style={S.btnRow}>
              <button style={S.btn} onClick={() => setStep(5)}>← Retour</button>
              <button style={S.btnP} onClick={() => next(7)}>Continuer →</button>
            </div>
          </>
        )}

        {step === 7 && (
          <>
            <div style={S.slabel}>Étape 7 / {STEPS}</div>
            <div style={S.stitle}>Enregistrement de l'appel</div>
            <label style={S.audioZone(!!audioFile)}>
              <input type="file" accept="audio/*,.mp3,.wav,.m4a" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) { setAudioFile(e.target.files[0]); setErrors(er => ({ ...er, audio: '' })); } }} />
              {audioFile ? (
                <>
                  <div style={{ fontSize: 20, color: '#3B6D11' }}>🎵</div>
                  <div style={{ fontSize: 13, color: '#3B6D11', marginTop: 5, fontWeight: 500 }}>{audioFile.name}</div>
                  <div style={{ fontSize: 11, color: '#639922', marginTop: 3 }}>Cliquer pour remplacer</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 26 }}>⬆️</div>
                  <div style={{ fontSize: 13, color: '#555', marginTop: 6 }}>Cliquer pour importer</div>
                  <div style={{ fontSize: 11, color: '#999', marginTop: 3 }}>MP3, WAV, M4A · max 100 Mo</div>
                </>
              )}
            </label>
            {errors.audio && <div style={{ fontSize: 11, color: '#c00', marginTop: 5 }}>{errors.audio}</div>}
            <div style={S.btnRow}>
              <button style={S.btn} onClick={() => setStep(6)}>← Retour</button>
              <button style={S.btnP} onClick={() => next(8)}>Continuer →</button>
            </div>
          </>
        )}

        {step === 8 && (
          <>
            <div style={S.slabel}>Étape 8 / {STEPS}</div>
            <div style={S.stitle}>Vérification</div>
            <div style={S.recap}>
              {[
                ['Opération', op], ['Société', form.societe], ['SIRET', form.siret],
                ['Ville', form.adresse + ' ' + form.cp],
                ['Contact', form.prenom + ' ' + form.nom + ' — ' + form.fonction],
                ['Téléphone', form.tel], ['Email', form.email || '—'],
                ['RDV', form.rdv_date + ' ' + form.rdv_heure + ' (' + form.rdv_format + ')'],
                ['Anti no-show', form.rdv_noshow],
                ['Enregistrement', audioFile ? '✓ ' + audioFile.name : '—'],
                ['Commentaire', form.commentaire],
              ].map(([label, val]) => (
                <div key={label} style={S.rrow}>
                  <span style={S.rlabel}>{label}</span>
                  <span style={S.rval}>{val}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 14 }}>Impossible de modifier après envoi.</div>
            <div style={S.btnRow}>
              <button style={S.btn} onClick={() => setStep(7)}>← Modifier</button>
              <button style={{ ...S.btnP, background: submitting ? '#888' : '#185FA5' }} onClick={submit} disabled={submitting}>
                {submitting ? 'Envoi en cours...' : '✉ Envoyer le lead'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
