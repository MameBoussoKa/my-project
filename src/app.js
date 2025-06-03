import { contacts, groupes } from './data.js';
import { setTitreSection } from './fonctions.js';

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
};

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
let contactActif = null;
let groupeActif = null;
let messagesGroupes = {}; // { groupeId: [ {texte, auteur, date} ] }

function afficherContacts() {
  const liste = document.getElementById('liste-contacts');
  liste.innerHTML = '';

  const btnPlus = document.getElementById('btn-ajouter-groupe');
  if (btnPlus) btnPlus.remove();

  let inputRecherche = document.getElementById('recherche-contact');

  function renderContacts() {
    liste.innerHTML = '';
    const recherche = inputRecherche.value.trim().toLowerCase();

    let contactsTries;
    if (recherche === '*') {
      // Affiche tous les contacts non archivés, triés par nom
      contactsTries = [...contacts]
        .filter(contact => !contact.archive)
        .sort((a, b) => a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }));
    } else {
      contactsTries = [...contacts]
        .filter(contact =>
          !contact.archive &&
          (contact.nom.toLowerCase().includes(recherche) ||
           contact.phone.includes(recherche))
        )
        .sort((a, b) => a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' }));
    }

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
        contactActif = contact;
        contactsSelectionnes = [contact.id];
        document.querySelectorAll('.bg-yellow-200').forEach(el => el.classList.remove('bg-yellow-200'));
        div.classList.add('bg-yellow-200');
        afficherProfilContact();
        afficherMessages(); // Ajoute cette ligne
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
      groupeActif = groupe;
      contactActif = null;
      afficherProfilGroupe();
      afficherMessagesGroupe();
      afficherMembresGroupe(groupe); // <-- Ajoute cette ligne
    };
    liste.appendChild(div);
  });

  // Supprime l'ancien bouton s'il existe
  let btnPlus = document.getElementById('btn-ajouter-groupe');
  if (btnPlus) btnPlus.remove();

  // Crée le bouton et ajoute-le à la suite de la liste
  btnPlus = document.createElement('button');
  btnPlus.id = 'btn-ajouter-groupe';
  btnPlus.className = "mt-4 flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 text-white rounded-full w-full py-2";
  const icon = document.createElement('span');
  icon.className = "material-icons mr-2";
  icon.textContent = "add";
  btnPlus.appendChild(icon);
  btnPlus.appendChild(document.createTextNode("Ajouter un groupe"));
  btnPlus.onclick = afficherFormulaireGroupe;
  liste.appendChild(btnPlus);
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
    // Récupère les membres sélectionnés (hors utilisateur courant)
    let membres = Array.from(membresDiv.querySelectorAll('input[type="checkbox"]:checked')).map(cb => parseInt(cb.value));

    // Ajoute l'utilisateur courant s'il n'est pas déjà dans la sélection
    if (!membres.includes(currentUserId)) {
      membres.unshift(currentUserId);
    }

    if (!nom) {
      errorDiv.textContent = "Veuillez saisir un nom de groupe.";
      return;
    }
    if (!description) {
      errorDiv.textContent = "Veuillez saisir une description.";
      return;
    }
    // Il faut au moins 2 membres (l'utilisateur + au moins un contact)
    if (membres.length < 2) {
      errorDiv.textContent = "Veuillez sélectionner au moins un contact en plus de vous.";
      return;
    }
    errorDiv.textContent = "";

    groupes.push({
      id: Date.now(),
      nom,
      description,
      profil: nom[0],
      membres,
      createurId: currentUserId,
      admins: [currentUserId]
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

  // Validation du nom
  if (!nomBase) {
    errorDiv.textContent = "Veuillez saisir un nom.";
    return;
  }

  // Vérifie que chaque mot commence par une majuscule
  const mots = nomBase.split(' ');
  const tousMaj = mots.every(mot => mot[0] && mot[0] === mot[0].toUpperCase() && /[A-ZÀ-Ÿ]/.test(mot[0]));
  if (!tousMaj) {
    errorDiv.textContent = "Chaque nom et prénom doit commencer par une lettre majuscule.";
    return;
  }

  // Validation du téléphone
  if (!phone) {
    errorDiv.textContent = "Veuillez saisir un numéro de téléphone.";
    return;
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

  // Validation du nom unique (insensible à la casse)
  let nom = nomBase;
  let compteur = 2;
  while (contacts.some(c => c.nom.toLowerCase() === nom.toLowerCase())) {
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

function afficherDiffusion() {
  const btnPlus = document.getElementById('btn-ajouter-groupe');
  if (btnPlus) btnPlus.remove();
  const liste = document.getElementById('liste-contacts');
  liste.innerHTML = '';
  const titre = document.createElement('h3');
  titre.className = "text-lg font-semibold mb-2";
  titre.textContent = "Sélectionnez les contacts à diffuser";
  liste.appendChild(titre);

  const form = document.createElement('form');
  form.className = "mb-4";

  // Liste des contacts à cocher
  contacts.forEach(contact => {
    if (contact.archive) return;
    const label = document.createElement('label');
    label.className = "flex items-center mb-1";
    const checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.value = contact.id;
    checkbox.className = "mr-2";
    checkbox.checked = contactsSelectionnes.includes(contact.id);
    checkbox.onchange = function() {
      if (checkbox.checked) {
        if (!contactsSelectionnes.includes(contact.id)) contactsSelectionnes.push(contact.id);
      } else {
        contactsSelectionnes = contactsSelectionnes.filter(id => id !== contact.id);
      }
    };
    label.appendChild(checkbox);

    const strong = document.createElement('strong');
    strong.textContent = contact.nom;
    label.appendChild(strong);

    const phoneSpan = document.createElement('span');
    phoneSpan.className = "ml-2 text-sm text-gray-500";
    phoneSpan.textContent = contact.phone;
    label.appendChild(phoneSpan);

    form.appendChild(label);
  });

  liste.appendChild(form);
}

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
  // S'assure que la propriété admins existe toujours
  if (!groupe.admins) {
    groupe.admins = [groupe.createurId];
  }

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

        // Bouton retirer (si admin et pas le créateur lui-même)
        if (groupe.createurId === currentUserId && id !== groupe.createurId) {
          const btnRetirer = document.createElement('button');
          btnRetirer.className = "ml-2 px-2 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 text-xs";
          btnRetirer.textContent = "Retirer";
          btnRetirer.onclick = function() {
            groupe.membres = groupe.membres.filter(mid => mid !== id);
            afficherMembresGroupe(groupe);
          };
          div.appendChild(btnRetirer);
        }

        // Bouton rendre admin (si admin et que ce n'est pas le créateur)
        if (
          groupe.admins.includes(currentUserId) && // tu es admin
          !groupe.admins.includes(id) &&           // le membre n'est pas déjà admin
          id !== groupe.createurId                 // on ne touche pas au créateur
        ) {
          const btnAdmin = document.createElement('button');
          btnAdmin.className = "ml-2 px-2 py-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200 text-xs";
          btnAdmin.textContent = "Rendre admin";
          btnAdmin.onclick = function() {
            groupe.admins.push(id);
            afficherMembresGroupe(groupe);
          };
          div.appendChild(btnAdmin);
        }

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

function afficherProfilContact() {
  const profilDiv = document.getElementById('profil-entete');
  const nomSpan = document.getElementById('nom-entete');
  if (!profilDiv || !nomSpan) return;
  if (contactActif) {
    // Initiales
    const noms = contactActif.nom.trim().split(' ');
    let initiales = noms[0][0] ? noms[0][0].toUpperCase() : '';
    if (noms.length > 1 && noms[1][0]) {
      initiales += noms[1][0].toUpperCase();
    }
    profilDiv.textContent = initiales || "?";
    nomSpan.textContent = contactActif.nom;
  } else {
    profilDiv.textContent = "";
    nomSpan.textContent = "";
  }
}

function afficherProfilGroupe() {
  const profilDiv = document.getElementById('profil-entete');
  const nomSpan = document.getElementById('nom-entete');
  if (!profilDiv || !nomSpan) return;
  if (groupeActif) {
    profilDiv.textContent = groupeActif.profil || (groupeActif.nom[0] ? groupeActif.nom[0].toUpperCase() : "?");
    nomSpan.textContent = groupeActif.nom;
  } else {
    profilDiv.textContent = "";
    nomSpan.textContent = "";
  }
}

// Nettoie la sélection visuelle si besoin
document.querySelectorAll('.bg-yellow-200').forEach(el => el.classList.remove('bg-yellow-200'));

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-nouveau').onclick = function() {
    setSidebarSelection('btn-nouveau');
    afficherFormulaire();
  };
  document.getElementById('annuler-nouveau').onclick = cacherFormulaire;
  document.getElementById('valider-nouveau').onclick = ajouterContact;
  document.getElementById('btn-message').onclick = function() {
    setSidebarSelection('btn-message');
    setTitreSection("Discussions");
    afficherContacts();
  };
  document.getElementById('btn-groupes').onclick = function() {
    setSidebarSelection('btn-groupes');
    setTitreSection("Groupes");
    afficherGroupes();
  };
  document.getElementById('btn-diffusion').onclick = function() {
    setSidebarSelection('btn-diffusion');
    setTitreSection("Diffusion");
    afficherDiffusion();
  };
  document.getElementById('btn-archive').onclick = function() {
    setSidebarSelection('btn-archive');
    setTitreSection("Archives");
    afficherArchives();
  };

  // Icône archive entête : archive les contacts sélectionnés
  const btnArchiveEntete = document.getElementById('btn-archive-entete');
  if (btnArchiveEntete) {
    btnArchiveEntete.onclick = function() {
      if (contactsSelectionnes.length === 0) {
        // On ne fait rien si aucun contact n'est sélectionné
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
      // alert("Contacts archivés !"); // <-- SUPPRIMÉ
    };
  }
  afficherContacts(); // 
});

let messages = {}; // { contactId: [ {texte, auteur, date} ] }
function afficherMessages() {
  const zone = document.getElementById('zone-messages');
  zone.innerHTML = '';
  if (!contactActif) {
    zone.innerHTML = '<div class="text-gray-400 text-center mt-10">Sélectionnez un contact pour voir la conversation.</div>';
    return;
  }
  const msgs = messages[contactActif.id] || [];
  msgs.forEach(msg => {
    const div = document.createElement('div');
    div.className = "mb-2 flex " + (msg.auteur === 'moi' ? "justify-end" : "justify-start");
    div.innerHTML = `<span class="px-3 py-2 rounded bg-green-500 text-white">${msg.texte}</span>`;
    zone.appendChild(div);
  });
}

// Envoi de message
  const inputMsg = document.querySelector('.flex-1.border.rounded.px-4.py-2');
  const btnSend = document.querySelector('.bg-green-500.text-white.p-2.rounded-full');
  if (btnSend && inputMsg) {
    btnSend.onclick = function() {
      const texte = inputMsg.value.trim();
      if (!texte) return;
      // Si plusieurs contacts sélectionnés (diffusion)
      if (contactsSelectionnes.length > 1) {
        contactsSelectionnes.forEach(id => {
          if (!messages[id]) messages[id] = [];
          messages[id].push({ texte, auteur: 'moi', date: new Date() });
        });
        inputMsg.value = '';
        // Affiche une confirmation
        const info = document.getElementById('diffusion-info');
        if (info) {
          info.textContent = "Message diffusé à " + contactsSelectionnes.length + " contacts.";
          setTimeout(() => { info.textContent = ""; }, 3000); // Efface après 3 secondes
        }
        // Affiche la confirmation au centre de la zone de messages
const zone = document.getElementById('zone-messages');
if (zone) {
  zone.innerHTML = `<div class="flex items-center justify-center h-full">
    <div class="bg-green-100 text-green-700 px-6 py-4 rounded shadow text-lg font-semibold">
      Message diffusé à ${contactsSelectionnes.length} contacts.
    </div>
  </div>`;
  setTimeout(() => {
    zone.innerHTML = '<div class="text-gray-400 text-center mt-10">Sélectionnez un contact pour voir la conversation.</div>';
  }, 2000); // Efface après 2 secondes
}
        return;
      }
      // Sinon, message classique
      if (contactActif) {
        if (!messages[contactActif.id]) messages[contactActif.id] = [];
        messages[contactActif.id].push({ texte, auteur: 'moi', date: new Date() });
        afficherMessages();
      } else if (groupeActif) {
        if (!messagesGroupes[groupeActif.id]) messagesGroupes[groupeActif.id] = [];
        messagesGroupes[groupeActif.id].push({ texte, auteur: 'moi', date: new Date() });
        afficherMessagesGroupe();
      } else {
        alert("Sélectionnez un contact ou un groupe !");
        return;
      }
      inputMsg.value = '';
    };
    inputMsg.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        btnSend.click();
      }
    });
  }

function afficherMessagesGroupe() {
  const zone = document.getElementById('zone-messages');
  zone.innerHTML = '';
  if (!groupeActif) {
    zone.innerHTML = '<div class="text-gray-400 text-center mt-10">Sélectionnez un groupe pour voir la conversation.</div>';
    return;
  }
  const msgs = messagesGroupes[groupeActif.id] || [];
  msgs.forEach(msg => {
    const div = document.createElement('div');
    div.className = "mb-2 flex " + (msg.auteur === 'moi' ? "justify-end" : "justify-start");
    div.innerHTML = `<span class="px-3 py-2 rounded bg-green-200">${msg.texte}</span>`;
    zone.appendChild(div);
  });
}

let currentUser = null;

function afficherConnexion() {
  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('app-main').style.display = 'none';
}

function connexionReussie(user) {
  currentUser = user;
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('app-main').style.display = '';
  // Enlève le message sous la barre de recherche
  const header = document.getElementById('user-connecte');
  if (header) {
    header.innerHTML = "";
  }
}

// Au chargement, affiche la page de connexion
window.addEventListener('DOMContentLoaded', () => {
  afficherConnexion();
  document.getElementById('btn-login').onclick = function() {
    const nom = document.getElementById('login-nom').value.trim();
    const numero = document.getElementById('login-numero').value.trim();
    const errorDiv = document.getElementById('login-error');
    if (!nom || !numero) {
      errorDiv.textContent = "Veuillez remplir tous les champs.";
      return;
    }
    // Vérifie si le contact existe déjà
    const user = contacts.find(c => c.nom === nom && c.phone === numero && !c.archive);
    if (user) {
      connexionReussie(user);
    } else {
      errorDiv.textContent = "Nom ou numéro incorrect.";
    }
  };
});

// Fonction de déconnexion
function deconnexion() {
  currentUser = null;
  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('app-main').style.display = 'none';
  // Optionnel : efface les champs de connexion
  document.getElementById('login-nom').value = '';
  document.getElementById('login-numero').value = '';
}

// Ajoute l'écouteur sur le bouton logout après le chargement
window.addEventListener('DOMContentLoaded', () => {
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.onclick = deconnexion;
  }
});

function setSidebarSelection(btnId) {
  const ids = ['btn-message', 'btn-groupes', 'btn-diffusion', 'btn-archive', 'btn-nouveau'];
  ids.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.classList.remove('bg-yellow-300');
  });
  const selected = document.getElementById(btnId);
  if (selected) selected.classList.add('bg-yellow-300');
}

// Handler pour le bouton "Nouveau"
document.getElementById('btn-nouveau').onclick = function() {
  setSidebarSelection('btn-nouveau');
  afficherFormulaire();
};

// Si tu appelles afficherFormulaire() ailleurs (ex : après ajout ou annulation), 
// pense à rappeler setSidebarSelection('btn-nouveau') juste avant ou après.