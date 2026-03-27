document.addEventListener("mousemove", mouseMoveHandler, false); // mousemove = mouvement de la souris

window.addEventListener("deviceorientation", handleOrientation, true); // deviceorientation = mouvement du téléphone

// iPhone/iPad: demande l'autorisation gyroscope au 1er geste utilisateur
function activerOrientationMobile() {
    if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
        DeviceOrientationEvent.requestPermission().catch(function () {});
    }
}
document.addEventListener("click", activerOrientationMobile, { once: true });
document.addEventListener("touchstart", activerOrientationMobile, { once: true });

// TOUCHES MOBILES
document.addEventListener("touchstart", touchHandler, { passive: false }); // touchstart = doigt sur l'écran
document.addEventListener("touchmove", touchHandler, { passive: false }); // touchmove = mouvement avec le doigt sur l'écran

function touchHandler(e) {
    if (e.touches) {

        var touchX = e.touches[0].clientX - canvaJeu.offsetLeft;
        panierX = touchX - panierW / 2;
        panierX = Math.max(0, Math.min(panierX, canvaJeu.width - panierW));

        e.preventDefault();
    }
}

function handleOrientation(event) {
    // gamma = inclinaison gauche/droite du téléphone (portrait)
    if (event.gamma === null || modePaysage) return;

    var gamma = Math.max(-45, Math.min(45, event.gamma));
    var ratio = (gamma + 45) / 90; // 0 -> gauche, 1 -> droite
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
    modePaysage = orientationPaysage();
}

// Appel dès le début pour que modePaysage ait la bonne valeur direct
verifierOrientation();
// À chaque changement de taille (rotation etc), on relance verifierOrientation() pour garder modePaysage à jour.
window.addEventListener("resize", verifierOrientation);
