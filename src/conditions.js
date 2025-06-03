import * as fonctions from './fonctions.js';

window.addEventListener('DOMContentLoaded', () => {
  fonctions.afficherConnexion();

  // Connexion
  const btnLogin = document.getElementById('btn-login');
  if (btnLogin) {
    btnLogin.onclick = () => {
      const nom = document.getElementById('login-nom').value.trim();
      const numero = document.getElementById('login-numero').value.trim();
      if (!nom || !numero) {
        document.getElementById('login-error').textContent = "Veuillez remplir tous les champs.";
        return;
      }
      let user = { nom, numero };
      fonctions.connexionReussie(user);
    };
  }

  // Affichage formulaire nouveau contact
  const btnNouveau = document.getElementById('btn-nouveau');
  if (btnNouveau) btnNouveau.onclick = fonctions.afficherFormulaire;

  // Annuler ajout contact
  const btnAnnuler = document.getElementById('annuler-nouveau');
  if (btnAnnuler) btnAnnuler.onclick = fonctions.cacherFormulaire;

  // Valider ajout contact
  const btnValider = document.getElementById('valider-nouveau');
  if (btnValider) btnValider.onclick = fonctions.ajouterContact;

  // Déconnexion
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) btnLogout.onclick = fonctions.deconnexion;

  // Ajoute ici les autres boutons si besoin
});