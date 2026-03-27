document.addEventListener("mousemove", mouseMoveHandler, false); // mousemove = mouvement de la souris

window.addEventListener("deviceorientation", handleOrientation, true); // deviceorientation = mouvement du téléphone

// iPhone/iPad: demande l'autorisation gyroscope au 1er geste utilisateur
function activerOrientationMobile() {
    // Même geste utilisateur : on débloque aussi l'audio.
    if (typeof preparerAudio === "function") {
        preparerAudio();
    }

    if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
        DeviceOrientationEvent.requestPermission().catch(function () {});
    }
}
document.addEventListener("pointerdown", activerOrientationMobile, { once: true });
document.addEventListener("touchstart", activerOrientationMobile, { once: true });
document.addEventListener("click", activerOrientationMobile, { once: true });
var appareilMobile = navigator.maxTouchPoints > 0;

function handleOrientation(event) {
    // gamma = inclinaison gauche/droite du téléphone (portrait)
    if (event.gamma === null || modePaysage) return;

    // Plus la plage est petite, plus le panier réagit vite.
    var plageInclinaison = 20; // essaie 15 si tu veux encore plus sensible
    var gamma = Math.max(-plageInclinaison, Math.min(plageInclinaison, event.gamma));
    var ratio = (gamma + plageInclinaison) / (plageInclinaison * 2); // 0 -> gauche, 1 -> droite
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
