// app.js
const statusBtn = document.getElementById('statusBtn');
const statusResult = document.getElementById('statusResult');
const reportForm = document.getElementById('reportForm');
const reportResult = document.getElementById('reportResult');
const listBtn = document.getElementById('listBtn');
const reportsList = document.getElementById('reportsList');
const langSelect = document.getElementById('langSelect');

const API_URL = ''; // Laisser vide pour Railway (même domaine)

// --- Traductions messages interface ---
const messages = {
  fr: {
    apiWorking: 'API fonctionne correctement !',
    reportSent: 'Rapport envoyé avec succès !',
    reportError: 'Erreur lors de l’envoi du rapport.',
    fetchReportsError: 'Erreur lors de la récupération des rapports.',
    noReports: 'Aucun rapport trouvé.',
    geoError: 'Impossible de récupérer la position : ',
  },
  ln: {
    apiWorking: 'API ezali kosala malamu !',
    reportSent: 'Rapport esimbami malamu !',
    reportError: 'Erreur na kosimbisa rapport.',
    fetchReportsError: 'Erreur na kozwa rapports.',
    noReports: 'Rapport te.',
    geoError: 'Ekoki te kozwa esika : ',
  },
  kt: {
    apiWorking: 'API esadila malamu !',
    reportSent: 'Rapport etindami malamu !',
    reportError: 'Erreur kusadila rapport.',
    fetchReportsError: 'Erreur kusadila rapports.',
    noReports: 'Rapport te.',
    geoError: 'Ekoki te kusadila esika : ',
  }
};

// --- Fonction pour obtenir langue courante ---
function currentLang() {
  return langSelect.value || 'fr';
}

// --- Vérifier le statut de l'API ---
statusBtn.addEventListener('click', async () => {
  try {
    const res = await fetch(`${API_URL}/api/status`);
    const data = await res.json();
    if (data.status === 'success') {
      statusResult.textContent = messages[currentLang()].apiWorking;
    } else {
      statusResult.textContent = data.message;
    }
  } catch (err) {
    statusResult.textContent = err.message;
  }
});

// --- Envoyer un rapport ---
reportForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(reportForm);

  try {
    const res = await fetch(`${API_URL}/api/report`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.status === 'success') {
      reportResult.textContent = messages[currentLang()].reportSent;
      reportForm.reset();
    } else {
      reportResult.textContent = messages[currentLang()].reportError;
    }
  } catch (err) {
    reportResult.textContent = messages[currentLang()].reportError + ' ' + err.message;
  }
});

// --- Lister tous les rapports ---
listBtn.addEventListener('click', async () => {
  try {
    const res = await fetch(`${API_URL}/api/reports`);
    const data = await res.json();
    if (data.status === 'success') {
      if (data.reports.length === 0) {
        reportsList.textContent = messages[currentLang()].noReports;
        return;
      }
      let table = '<table border="1" cellpadding="5"><tr><th>ID</th><th>Nom</th><th>Description</th><th>Fichier</th><th>Date</th></tr>';
      data.reports.forEach(r => {
        table += `<tr>
                    <td>${r.id}</td>
                    <td>${r.name}</td>
                    <td>${r.description}</td>
                    <td>${r.file || '-'}</td>
                    <td>${r.created_at}</td>
                  </tr>`;
      });
      table += '</table>';
      reportsList.innerHTML = table;
    } else {
      reportsList.textContent = messages[currentLang()].fetchReportsError;
    }
  } catch (err) {
    reportsList.textContent = messages[currentLang()].fetchReportsError + ' ' + err.message;
  }
});