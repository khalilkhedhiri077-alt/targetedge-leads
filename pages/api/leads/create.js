import { v4 as uuidv4 } from 'uuid';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const bodyStr = Buffer.concat(chunks).toString('binary');

  let data = {}, centre = 'INCONNU', operation = '', audio_url = '';

  try {
    const boundary = req.headers['content-type']?.split('boundary=')[1];
    if (boundary) {
      const parts = bodyStr.split('--' + boundary).slice(1, -1);
      for (const part of parts) {
        const [rawHeader, ...bodyParts] = part.split('\r\n\r\n');
        const partBody = bodyParts.join('\r\n\r\n').replace(/\r\n$/, '');
        const nameMatch = rawHeader.match(/name="([^"]+)"/);
        const filenameMatch = rawHeader.match(/filename="([^"]+)"/);
        if (!nameMatch) continue;
        const name = nameMatch[1];
        if (filenameMatch) {
          const buf = Buffer.from(partBody, 'binary');
          const ext = filenameMatch[1].split('.').pop();
          audio_url = `data:audio/${ext};base64,` + buf.toString('base64');
        } else if (name === 'data') {
          data = JSON.parse(partBody);
        } else if (name === 'centre') {
          centre = partBody.trim();
        } else if (name === 'operation') {
          operation = partBody.trim();
        }
      }
    }
  } catch (e) {
    return res.status(400).json({ error: 'Parse error: ' + e.message });
  }

  const now = new Date();
  const lead = {
    id: uuidv4(),
    date: now.toLocaleDateString('fr-FR'),
    heure: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    centre,
    operation: operation || data.operation || '',
    societe: data.societe || '',
    siret: data.siret || '',
    cp: data.cp || '',
    adresse: data.adresse || '',
    nom: data.nom || '',
    prenom: data.prenom || '',
    fonction: data.fonction || '',
    tel: data.tel || '',
    email: data.email || '',
    qualification: data.qualification || {},
    rdv_date: data.rdv_date || '',
    rdv_heure: data.rdv_heure || '',
    rdv_format: data.rdv_format || '',
    rdv_noshow: data.rdv_noshow || '',
    commentaire: data.commentaire || '',
    audio_url,
  };

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'append_lead', lead }),
    });
    const result = await response.json();
    res.status(200).json({ success: true, id: lead.id, result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
