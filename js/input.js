document.addEventListener("mousemove", mouseMoveHandler, false); // Contrôle souris

window.addEventListener("deviceorientation", handleOrientation, true); // Contrôle gyroscope (mouvement du téléphone)

// Comme sur IOS le device orientation est désactivé par défaut on l'active par un clic et au passage on active aussi l'audio par un clic si pas déjà fait
function activerOrientationMobile() {
    if (typeof preparerAudio === "function") {
        preparerAudio();
    }

    // Uniquement sur les navigateurs qui exposent requestPermission (IOS etc), on ignore les erreurs avec catch pour ne pas casser le script
    if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
        DeviceOrientationEvent.requestPermission().catch(function () { });
    }
}

//  Trois types d'événements possibles pour couvrir souris, doigt et stylet
// { once: true } = la fonction ne s'exécute qu'une fois au total
document.addEventListener("pointerdown", activerOrientationMobile, { once: true });
document.addEventListener("touchstart", activerOrientationMobile, { once: true });
document.addEventListener("click", activerOrientationMobile, { once: true });

// Détection simple "appareil tactile" : utilisé ailleurs (reset orientation)
var appareilMobile = navigator.maxTouchPoints > 0;

function handleOrientation(event) {
    // Si pas de données capteur, ou mode paysage : on ne déplace pas le panier (le jeu affiche un message paysage)
    if (event.gamma === null || modePaysage) return;

    // 20° pour la sensibilité, permet d'éviter de trop pencher le téléphone car c'est chiant
    var plageInclinaison = 20; 
    var gamma = Math.max(-plageInclinaison, Math.min(plageInclinaison, event.gamma));

    // On ramène gamma entre -plage et +plage vers un ratio entre 0 (gauche) et 1 (droite)
    // Exemple plage 20 : gamma = -20 → ratio 0 ; gamma = 0 → ratio 0.5 ; gamma = +20 → ratio 1
    var ratio = (gamma + plageInclinaison) / (plageInclinaison * 2);

    // panierX est le coin haut-gauche du sprite : le panier peut aller de 0 à (largeur canvas - largeur panier)
    panierX = ratio * (canvaJeu.width - panierW);
}

// On calcule la position horizontale (x) de la souris, le mouvement est limité à la taille du canva
// de façon à ce que le panier s'arrête aux bords horizontaux
function mouseMoveHandler(e) {
    var sourisX = e.clientX - canvaJeu.offsetLeft;
    panierX = sourisX - panierW / 2;
    panierX = Math.max(0, Math.min(panierX, canvaJeu.width - panierW));
}

// Fonction qui détecte si le format est en paysage si la largeur du canva est plus grande que la hauteur
function orientationPaysage() {
    return window.innerWidth > window.innerHeight;
}

// Définit le format en tant que paysage et le stocke dans la variable modePaysage
function verifierOrientation() {
    var etaitPaysage = modePaysage;
    modePaysage = orientationPaysage();

    // Sur téléphone, retour paysage -> portrait = nouvelle partie
    if (appareilMobile && etaitPaysage && !modePaysage) {
        document.location.reload();
    }
}

// Appel dès le début pour que modePaysage ait la bonne valeur direct
verifierOrientation();
// À chaque changement de taille (rotation etc), on relance verifierOrientation() pour garder modePaysage à jour.
window.addEventListener("resize", verifierOrientation);
