document.getElementById('btn-archive').onclick = function() {
  if (contactsSelectionnes.length === 0) {
    afficherArchives();
    return;
  }
  contacts.forEach(contact => {
    if (contactsSelectionnes.includes(contact.id)) {
      contact.archive = true;
    }
  });
  contactsSelectionnes = [];
  afficherContacts();
};import { contacts, groupes } from './data.js';
function afficherAjoutMembres(groupe) {
 
  if (groupe.createurId !== currentUserId) {
    alert("Seul le créateur du groupe peut ajouter des membres.");
    return;
  }

  const form = document.createElement('div');
  form.className = "mt-4 p-2 bg-white rounded shadow flex flex-col";

  const titre = document.createElement('div');
  titre.className = "font-semibold mb-2";
  titre.textContent = "Ajouter des membres au groupe";
  form.appendChild(titre);

 
  const membresDiv = document.createElement('div');
  membresDiv.className = "mb-2";
  const membresIds = groupe.membres || [];
  contacts.filter(c => !c.archive && !membresIds.includes(c.id)).forEach(contact => {
    const label = document.createElement('label');
    label.className = "inline-flex items-center mr-2 mt-1";
    const checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.value = contact.id;
    checkbox.className = "form-checkbox";
    label.appendChild(checkbox);
    const span = document.createElement('span');
    span.className = "ml-1 text-sm";
    span.textContent = contact.nom;
    label.appendChild(span);
    membresDiv.appendChild(label);
  });
  form.appendChild(membresDiv);

  
  const errorDiv = document.createElement('div');
  errorDiv.className = "text-red-500 text-xs mb-2";
  form.appendChild(errorDiv);

  
  const btnDiv = document.createElement('div');
  btnDiv.className = "flex justify-end space-x-2";
  const btnAnnuler = document.createElement('button');
  btnAnnuler.className = "px-4 py-1 rounded bg-gray-300";
  btnAnnuler.textContent = "Annuler";
  btnDiv.appendChild(btnAnnuler);
  const btnValider = document.createElement('button');
  btnValider.className = "px-4 py-1 rounded bg-yellow-400 text-white";
  btnValider.textContent = "Ajouter";
  btnDiv.appendChild(btnValider);
  form.appendChild(btnDiv);

  const liste = document.getElementById('liste-contacts');
  liste.appendChild(form);

  btnAnnuler.onclick = () => form.remove();
  btnValider.onclick = () => {
    const nouveaux = Array.from(membresDiv.querySelectorAll('input[type="checkbox"]:checked')).map(cb => parseInt(cb.value));
    if (nouveaux.length === 0) {
      errorDiv.textContent = "Sélectionnez au moins un contact à ajouter.";
      return;
    }
    if (!groupe.membres) groupe.membres = [];
    groupe.membres = groupe.membres.concat(nouveaux);
    form.remove();
    afficherGroupes();
  };
}
const currentUserId = 1;

let contactsSelectionnes = [];

function afficherContacts() {
  
  const liste = document.getElementById('liste-contacts');
  liste.innerHTML = '';

 
  const btnPlus = document.getElementById('btn-ajouter-groupe');
  if (btnPlus) btnPlus.remove();

  
  let inputRecherche = document.getElementById('recherche-contact');
  
  function renderContacts() {
    liste.innerHTML = '';
    const recherche = inputRecherche.value.trim().toLowerCase();
    const contactsTries = [...contacts]
      .filter(contact =>
        !contact.archive &&
        (contact.nom.toLowerCase().includes(recherche) ||
         contact.phone.includes(recherche))
      )
      .sort((a, b) => a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }));

    contactsTries.forEach(contact => {
      const div = document.createElement('div');
      div.className = "p-2 border-b flex items-center justify-between cursor-pointer transition";

      const profilDiv = document.createElement('div');
      profilDiv.className = "w-8 h-8 flex items-center justify-center rounded-full bg-gray-400 text-white font-bold text-base mr-3";
      const noms = contact.nom.trim().split(' ');
      let initiales = noms[0][0] ? noms[0][0].toUpperCase() : '';
      if (noms.length > 1 && noms[1][0]) {
        initiales += noms[1][0].toUpperCase();
      }
      profilDiv.textContent = initiales || "?";

      const infoDiv = document.createElement('div');
      infoDiv.className = "flex-1";
      const strong = document.createElement('strong');
      strong.textContent = contact.nom;
      const br = document.createElement('br');
      const phoneSpan = document.createElement('span');
      phoneSpan.className = "text-sm text-gray-500";
      phoneSpan.textContent = contact.phone;
      infoDiv.appendChild(strong);
      infoDiv.appendChild(br);
      infoDiv.appendChild(phoneSpan);

      div.appendChild(profilDiv);
      div.appendChild(infoDiv);
      liste.appendChild(div);

      div.onclick = function() {
        const index = contactsSelectionnes.indexOf(contact.id);
        if (index === -1) {
          contactsSelectionnes.push(contact.id);
          div.classList.add('bg-yellow-200');
        } else {
          contactsSelectionnes.splice(index, 1);
          div.classList.remove('bg-yellow-200');
        }
      };
    });
  }

  // Mets à jour la liste à chaque frappe dans l'input
  inputRecherche.oninput = renderContacts;

  // Affiche la liste au chargement
  renderContacts();
}

function afficherGroupes() {
  const liste = document.getElementById('liste-contacts');
  liste.innerHTML = '';
  groupes.forEach(groupe => {
    const div = document.createElement('div');
    div.className = "flex flex-col border-b p-2";

    const topDiv = document.createElement('div');
    topDiv.className = "flex items-center space-x-3";

    const profilDiv = document.createElement('div');
    profilDiv.className = "w-10 h-10 flex items-center justify-center rounded-full bg-gray-400 text-white font-bold text-lg";
    profilDiv.textContent = groupe.profil || groupe.nom[0];

    const infoDiv = document.createElement('div');
    const nomDiv = document.createElement('div');
    nomDiv.className = "font-semibold";
    nomDiv.textContent = groupe.nom;
    const descDiv = document.createElement('div');
    descDiv.className = "text-xs text-gray-500";

    // Affichage des membres du groupe
    let membresTxt = "";
    if (groupe.createurId === currentUserId) {
      membresTxt = "Vous";
    } else {
      const admin = contacts.find(c => c.id === groupe.createurId);
      membresTxt = admin ? admin.nom : "Admin";
    }

    if (groupe.membres && groupe.membres.length > 0) {
      // Exclure l'admin de la liste des membres affichés
      const autresMembres = groupe.membres
        .filter(id => id !== groupe.createurId)
        .map(id => {
          const c = contacts.find(ct => ct.id === id);
          return c ? c.nom : "";
        })
        .filter(nom => nom)
        .join(", ");
      if (autresMembres) {
        membresTxt += " et " + autresMembres;
      }
    }

    descDiv.textContent = membresTxt;
    infoDiv.appendChild(nomDiv);
    infoDiv.appendChild(descDiv);

    topDiv.appendChild(profilDiv);
    topDiv.appendChild(infoDiv);
    div.appendChild(topDiv);
    div.style.cursor = "pointer";
    div.onclick = function(e) {
     
      if (e.target.tagName === "BUTTON" || e.target.closest("button")) return;
      afficherMembresGroupe(groupe);
    };
    liste.appendChild(div);
  });

  
  let btnPlus = document.getElementById('btn-ajouter-groupe');
  if (!btnPlus) {
    btnPlus = document.createElement('button');
    btnPlus.id = 'btn-ajouter-groupe';
    btnPlus.className = "fixed bottom-8 left-1/4 transform -translate-x-1/2 bg-yellow-400 hover:bg-yellow-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-50";
    const icon = document.createElement('span');
    icon.className = "material-icons text-3xl";
    icon.textContent = "add";
    btnPlus.appendChild(icon);
    btnPlus.onclick = afficherFormulaireGroupe;
    document.body.appendChild(btnPlus);
  }
}

function afficherFormulaireGroupe() {
  const liste = document.getElementById('liste-contacts');
  liste.innerHTML = '';

  const form = document.createElement('div');
  form.className = "bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto flex flex-col gap-3";

  const titre = document.createElement('h2');
  titre.className = "text-xl font-bold mb-4 text-yellow-500";
  titre.textContent = "Créer un nouveau groupe";
  form.appendChild(titre);

  
  const inputNom = document.createElement('input');
  inputNom.type = "text";
  inputNom.id = "nouveau-nom-groupe";
  inputNom.placeholder = "Nom du groupe";
  inputNom.className = "border border-yellow-300 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-yellow-400";
  form.appendChild(inputNom);

  
  const inputDesc = document.createElement('input');
  inputDesc.type = "text";
  inputDesc.id = "nouvelle-description-groupe";
  inputDesc.placeholder = "Description du groupe";
  inputDesc.className = "border border-yellow-300 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-yellow-400";
  form.appendChild(inputDesc);

 
  const membresDiv = document.createElement('div');
  membresDiv.className = "mb-2";
  const labelMembres = document.createElement('div');
  labelMembres.className = "font-semibold mb-1";
  labelMembres.textContent = "Sélectionnez au moins 2 membres :";
  membresDiv.appendChild(labelMembres);

  contacts.filter(c => !c.archive).forEach(contact => {
    const label = document.createElement('label');
    label.className = "inline-flex items-center mr-3 mt-1";
    const checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.value = contact.id;
    checkbox.className = "form-checkbox accent-yellow-400";
    label.appendChild(checkbox);
    const span = document.createElement('span');
    span.className = "ml-1 text-sm";
    span.textContent = contact.nom;
    label.appendChild(span);
    membresDiv.appendChild(label);
  });
  form.appendChild(membresDiv);

  
  const errorDiv = document.createElement('div');
  errorDiv.className = "text-red-500 text-xs mb-2";
  form.appendChild(errorDiv);

 
  const btnDiv = document.createElement('div');
  btnDiv.className = "flex justify-end space-x-2 mt-2";

  const btnAnnuler = document.createElement('button');
  btnAnnuler.className = "px-4 py-1 rounded bg-gray-200 hover:bg-gray-300";
  btnAnnuler.textContent = "Annuler";
  btnAnnuler.onclick = afficherGroupes;
  btnDiv.appendChild(btnAnnuler);

  const btnValider = document.createElement('button');
  btnValider.className = "px-4 py-1 rounded bg-yellow-400 text-white hover:bg-yellow-500";
  btnValider.textContent = "Créer";
  btnDiv.appendChild(btnValider);

  form.appendChild(btnDiv);

  liste.appendChild(form);

  btnValider.onclick = () => {
    const nom = inputNom.value.trim();
    const description = inputDesc.value.trim();
    const membres = Array.from(membresDiv.querySelectorAll('input[type="checkbox"]:checked')).map(cb => parseInt(cb.value));
    if (!nom || !description) {
      errorDiv.textContent = "Veuillez remplir tous les champs.";
      return;
    }
    if (membres.length < 2) {
      errorDiv.textContent = "Veuillez sélectionner au moins 2 membres.";
      return;
    }
    groupes.push({
      id: Date.now(),
      nom,
      description,
      profil: nom[0],
      membres,
      createurId: currentUserId
    });
    afficherGroupes();
  };
}

function afficherFormulaire() {
  // Supprime le bouton "ajouter un groupe" s'il existe
const btnPlus = document.getElementById('btn-ajouter-groupe');
if (btnPlus) btnPlus.remove();
  const liste = document.getElementById('liste-contacts');
  liste.innerHTML = '';

  const form = document.createElement('div');
  form.className = "bg-white p-4 rounded shadow max-w-md mx-auto";

  // Champ nom
  const inputNom = document.createElement('input');
  inputNom.type = "text";
  inputNom.id = "contact-name";
  inputNom.placeholder = "Nom du contact";
  inputNom.className = "border rounded px-2 py-1 mb-2 w-full";
  form.appendChild(inputNom);

  // Champ téléphone
  const inputPhone = document.createElement('input');
  inputPhone.type = "text";
  inputPhone.id = "contact-phone";
  inputPhone.placeholder = "Numéro de téléphone";
  inputPhone.className = "border rounded px-2 py-1 mb-2 w-full";
  form.appendChild(inputPhone);

  // Message d'erreur
  const errorDiv = document.createElement('div');
  errorDiv.id = 'contact-phone-error';
  errorDiv.className = 'text-red-500 text-xs mb-2';
  form.appendChild(errorDiv);

  // Boutons
  const btnDiv = document.createElement('div');
  btnDiv.className = "flex justify-end space-x-2";

  const btnAnnuler = document.createElement('button');
  btnAnnuler.className = "px-4 py-1 rounded bg-gray-300";
  btnAnnuler.textContent = "Annuler";
  btnAnnuler.onclick = afficherContacts;
  btnDiv.appendChild(btnAnnuler);

  const btnValider = document.createElement('button');
  btnValider.className = "px-4 py-1 rounded bg-yellow-400 text-white";
  btnValider.textContent = "Créer";
  btnValider.onclick = ajouterContact;
  btnDiv.appendChild(btnValider);

  form.appendChild(btnDiv);

  liste.appendChild(form);
}

function cacherFormulaire() {
  document.getElementById('nouveau-contact-form').classList.add('hidden');
  document.getElementById('contact-name').value = '';
  document.getElementById('contact-phone').value = '';
}

function ajouterContact() {
  const nomBase = document.getElementById('contact-name').value.trim();
  const phone = document.getElementById('contact-phone').value.trim();
  let errorDiv = document.getElementById('contact-phone-error');
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.id = 'contact-phone-error';
    errorDiv.className = 'text-red-500 text-xs mt-1';
    document.getElementById('contact-phone').after(errorDiv);
  }


  if (!/^\d+$/.test(phone)) {
    errorDiv.textContent = "Le numéro de téléphone doit contenir uniquement des chiffres.";
    return;
  }

  const existe = contacts.some(c => c.phone === phone);
  if (existe) {
    errorDiv.textContent = "Ce numéro existe déjà.";
    return;
  }

 
  let nom = nomBase;
  let compteur = 2;
  while (contacts.some(c => c.nom === nom)) {
    nom = nomBase + compteur;
    compteur++;
  }

  errorDiv.textContent = "";

  if (nom && phone) {
    contacts.push({ id: Date.now(), nom, phone, archive: false });
    afficherContacts();
    cacherFormulaire();
  }
}

// function afficherDiffusion() {

// const btnPlus = document.getElementById('btn-ajouter-groupe');
// if (btnPlus) btnPlus.remove();
//   const liste = document.getElementById('liste-contacts');
//   liste.innerHTML = '';
//   const titre = document.createElement('h3');
//   titre.className = "text-lg font-semibold mb-2";
//   titre.textContent = "Sélectionnez les contacts à diffuser";
//   liste.appendChild(titre);

//   const form = document.createElement('form');
//   form.className = "mb-4";

 
//   const errorDiv = document.createElement('div');
//   errorDiv.className = "text-red-500 text-xs mb-2";
//   form.appendChild(errorDiv);

//   form.onsubmit = function(e) {
//     e.preventDefault();
//     const selection = Array.from(form.querySelectorAll('input[type="checkbox"]:checked')).map(cb => parseInt(cb.value));
//     if (selection.length === 0) {
//       errorDiv.textContent = "Sélectionnez au moins un contact.";
//       return;
//     } else {
//       errorDiv.textContent = "";
//     }
   
//     afficherContacts();
//   };

//   contacts.forEach(contact => {
//     if (contact.archive) return;
//     const label = document.createElement('label');
//     label.className = "flex items-center mb-1";
//     const checkbox = document.createElement('input');
//     checkbox.type = "checkbox";
//     checkbox.value = contact.id;
//     checkbox.className = "mr-2";
//     label.appendChild(checkbox);

//     const strong = document.createElement('strong');
//     strong.textContent = contact.nom;
//     label.appendChild(strong);

//     const phoneSpan = document.createElement('span');
//     phoneSpan.className = "ml-2 text-sm text-gray-500";
//     phoneSpan.textContent = contact.phone;
//     label.appendChild(phoneSpan);

//     form.appendChild(label);
//   });

 
//   const btnEnvoyer = document.createElement('button');
//   btnEnvoyer.type = "submit";
//   btnEnvoyer.className = "mt-3 px-4 py-1 rounded bg-yellow-400 text-white";
//   btnEnvoyer.textContent = "Envoyer";
//   form.appendChild(btnEnvoyer);

//   liste.appendChild(form);
// }

function afficherArchives() {
  // Supprime le bouton "ajouter un groupe" s'il existe
const btnPlus = document.getElementById('btn-ajouter-groupe');
if (btnPlus) btnPlus.remove();
  const liste = document.getElementById('liste-contacts');
  liste.innerHTML = '';
  const titre = document.createElement('h3');
  titre.className = "text-lg font-semibold mb-2";
  titre.textContent = "Contacts archivés";
  liste.appendChild(titre);

  const contactsDiv = document.createElement('div');
  contactsDiv.id = "contacts-archives";
  const archives = contacts.filter(contact => contact.archive);
  if (archives.length === 0) {
    const empty = document.createElement('div');
    empty.className = "text-gray-500 text-sm";
    empty.textContent = "Aucun contact archivé.";
    contactsDiv.appendChild(empty);
  } else {
    archives.forEach(contact => {
      const div = document.createElement('div');
      div.className = "p-2 border-b flex justify-between items-center";
      // Infos contact
      const infoDiv = document.createElement('div');
      const strong = document.createElement('strong');
      strong.textContent = contact.nom;
      const br = document.createElement('br');
      const phoneSpan = document.createElement('span');
      phoneSpan.className = "text-sm text-gray-500";
      phoneSpan.textContent = contact.phone;
      infoDiv.appendChild(strong);
      infoDiv.appendChild(br);
      infoDiv.appendChild(phoneSpan);

     
      const btn = document.createElement('button');
      btn.className = "ml-2 p-1 rounded-full hover:bg-yellow-100";
      btn.title = "Désarchiver";
      btn.onclick = function() {
        contact.archive = false;
        afficherArchives();
      };
      const icon = document.createElement('span');
      icon.className = "material-icons text-yellow-500 text-base";
      icon.textContent = "unarchive"; 
      btn.appendChild(icon);
      

      div.appendChild(infoDiv);
      div.appendChild(btn);
      contactsDiv.appendChild(div);
     
const btnPlus = document.getElementById('btn-ajouter-groupe');
if (btnPlus) btnPlus.remove();
    });
  }
  liste.appendChild(contactsDiv);
}

function afficherMembresGroupe(groupe) {
  const liste = document.getElementById('liste-contacts');
  liste.innerHTML = '';

  const titre = document.createElement('h3');
  titre.className = "text-lg font-semibold mb-2";
  titre.textContent = `Membres du groupe : ${groupe.nom}`;
  liste.appendChild(titre);

  if (!groupe.membres || groupe.membres.length === 0) {
    const vide = document.createElement('div');
    vide.className = "text-gray-500 text-sm";
    vide.textContent = "Aucun membre dans ce groupe.";
    liste.appendChild(vide);
  } else {
    groupe.membres.forEach(id => {
      const contact = contacts.find(c => c.id === id && !c.archive);
      if (contact) {
        const div = document.createElement('div');
        div.className = "p-2 border-b flex items-center";

        // Profil
        const profilDiv = document.createElement('div');
        profilDiv.className = "w-8 h-8 flex items-center justify-center rounded-full bg-gray-400 text-white font-bold text-base mr-3";
        const noms = contact.nom.trim().split(' ');
        let initiales = noms[0][0] ? noms[0][0].toUpperCase() : '';
        if (noms.length > 1 && noms[1][0]) {
          initiales += noms[1][0].toUpperCase();
        }
        profilDiv.textContent = initiales || "?";

        // Infos
        const infoDiv = document.createElement('div');
        infoDiv.className = "flex-1";
        const strong = document.createElement('strong');
        strong.textContent = contact.nom;
        const br = document.createElement('br');
        const phoneSpan = document.createElement('span');
        phoneSpan.className = "text-sm text-gray-500";
        phoneSpan.textContent = contact.phone;
        infoDiv.appendChild(strong);
        infoDiv.appendChild(br);
        infoDiv.appendChild(phoneSpan);

        div.appendChild(profilDiv);
        div.appendChild(infoDiv);
        liste.appendChild(div);
      }
    });
  }

 
  if (groupe.createurId === currentUserId) {
    const btnContainer = document.createElement('div');
    btnContainer.className = "flex justify-end mt-4";
    const btn = document.createElement('button');
    btn.className = "p-2 rounded-full bg-yellow-400 hover:bg-yellow-500 text-white flex items-center justify-center shadow";
    btn.title = "Ajouter des membres";
    const icon = document.createElement('span');
    icon.className = "material-icons text-xl";
    icon.textContent = "add";
    btn.appendChild(icon);
    btn.onclick = function() {
      afficherAjoutMembres(groupe);
    };
    btnContainer.appendChild(btn);
    liste.appendChild(btnContainer);
  }
}

// Nettoie la sélection visuelle si besoin
document.querySelectorAll('.bg-yellow-200').forEach(el => el.classList.remove('bg-yellow-200'));

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-nouveau').onclick = function() {
    afficherFormulaire();
  };
  document.getElementById('annuler-nouveau').onclick = cacherFormulaire;
  document.getElementById('valider-nouveau').onclick = ajouterContact;
  document.getElementById('btn-message').onclick = afficherContacts; // <-- Ajoute cette ligne
  document.getElementById('btn-groupes').onclick = afficherGroupes;
  document.getElementById('btn-diffusion').onclick = afficherDiffusion;
  const btnArchive = document.getElementById('btn-archive');
  if (btnArchive) {
    btnArchive.onclick = function() {
      afficherArchives();
    };
  }
  document.getElementById('btn-archive-entete').onclick = function() {
  console.log("Clic sur archive entête !");
  if (contactsSelectionnes.length === 0) {
    alert("Sélectionnez au moins un contact à archiver.");
    return;
  }
  contacts.forEach(contact => {
    if (contactsSelectionnes.includes(contact.id)) {
      contact.archive = true;
    }
  });
  document.querySelectorAll('.bg-yellow-200').forEach(el => el.classList.remove('bg-yellow-200'));
  contactsSelectionnes = [];
  afficherContacts();
  alert("Contacts archivés !");
};
  afficherContacts(); // 
});