// Sons du jeu pour chaques actions (volume pommes : 0 = muet, 1 = max)
var volumePommes = 0.05; // volume de son global de chacune des 3 pommes

var sonPomme = new Audio("sons/pomme.mp3");
var sonDoree = new Audio("sons/pomme_doree.mp3");
var sonPourrie = new Audio("sons/pomme_pourrie.mp3");
sonPomme.preload = "auto";
sonDoree.preload = "auto";
sonPourrie.preload = "auto";
sonPomme.volume = volumePommes;
sonDoree.volume = volumePommes;
sonPourrie.volume = volumePommes;

//var sonGameOver = new Audio("sons/game_over.mp3");
//var sonFin = new Audio("sons/fin.mp3");

var sonUrgence = new Audio("sons/timer.mp3"); // son pour le timer
sonUrgence.preload = "auto";

var musique = new Audio("sons/musique.mp3"); // musique de fond
musique.preload = "auto";
musique.volume = 1; // volume de la musique de fond

// Fonction qui permet d'activer le son avec l'action d'un utilisateur (click, doigt sur l'écran)... 
// à cause de la politique qui bloque automatiquement
var audioAction = false;
function preparerAudio() {
    if (audioAction) return;

    // Déverrouillage minimal mais robuste: 1 son test en muet.
    var ancienVolume = sonPomme.volume;
    sonPomme.volume = 0;

    var tentative = sonPomme.play();
    if (tentative !== undefined) {
        tentative.then(function () {
            sonPomme.pause();
            sonPomme.currentTime = 0;
            sonPomme.volume = ancienVolume;

            audioAction = true; // activé seulement si succès réel
            musique.play().catch(function () { });
        }).catch(function () {
            // En cas d'échec, on laisse les prochains taps réessayer.
            sonPomme.volume = ancienVolume;
        });
    } else {
        // Certains navigateurs ne renvoient pas de Promise.
        sonPomme.pause();
        sonPomme.currentTime = 0;
        sonPomme.volume = ancienVolume;
        audioAction = true;
        musique.play().catch(function () { });
    }
}
document.addEventListener("pointerdown", preparerAudio, { passive: true });
document.addEventListener("touchstart", preparerAudio, { passive: true });
document.addEventListener("click", preparerAudio, { passive: true });