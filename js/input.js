document.addEventListener("mousemove", mouseMoveHandler, false); // mousemove = mouvement de la souris

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

// On calcule la position horizontale (x) de la souris, le mouvement est limité à la taille du canva
// de façon à ce que le panier s'arrête aux bords horizontaux
function mouseMoveHandler(e) {
    var sourisX = e.clientX - canvaJeu.offsetLeft;
    panierX = sourisX - panierW / 2;
    panierX = Math.max(0, Math.min(panierX, canvaJeu.width - panierW));
}

function orientationPaysage() {
    return window.innerWidth > window.innerHeight;
}

function verifierOrientation() {
    modePaysage = orientationPaysage();
}

verifierOrientation();
window.addEventListener("resize", verifierOrientation);
