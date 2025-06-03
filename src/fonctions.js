import { contacts, groupes } from './data.js';

export let contactsSelectionnes = [];
export let contactActif = null;
export let groupeActif = null;
export let messagesGroupes = {};
export let messages = {};
export let currentUser = null;
export const currentUserId = 1;

// Affiche la liste des contacts
export function afficherContacts() {
  const liste = document.getElementById('liste-contacts');
  if (!liste) return;
  liste.innerHTML = contacts.map(c =>
    `<div class="border p-2 rounded mb-2">${c.nom} (${c.phone})</div>`
  ).join('');
}

// Affiche le formulaire pour ajouter un contact
export function afficherFormulaire() {
  document.getElementById('nouveau-contact-form').classList.remove('hidden');
}

// Cache le formulaire d'ajout de contact
export function cacherFormulaire() {
  document.getElementById('nouveau-contact-form').classList.add('hidden');
}

// Ajoute un contact
export function ajouterContact() {
  const nom = document.getElementById('contact-name').value.trim();
  const phone = document.getElementById('contact-phone').value.trim();
  if (!nom || !phone) return;
  contacts.push({ id: contacts.length + 1, nom, phone, archive: false });
  afficherContacts();
  cacherFormulaire();
}

// Affiche la page de connexion
export function afficherConnexion() {
  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('app-main').style.display = 'none';
}

// Gère la connexion réussie
export function connexionReussie(user) {
  currentUser = user;
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('app-main').style.display = 'flex';
  document.getElementById('user-connecte').textContent = `Connecté en tant que ${user.nom}`;
  afficherContacts();
}

// Déconnexion
export function deconnexion() {
  currentUser = null;
  afficherConnexion();
}

export function setTitreSection(titre) {
  const titreEl = document.getElementById('titre-section');
  if (titreEl) titreEl.textContent = titre;
}

// Ajoute ici toutes tes autres fonctions utilitaires...