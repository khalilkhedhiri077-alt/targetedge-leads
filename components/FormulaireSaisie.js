async function function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
  } submit() {
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
      alert('Erreur lors de l\'envoi. Réessayez.');
    }
    setSubmitting(false);
  }
