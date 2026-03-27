// Sons du jeu pour chaques actions (volume pommes : 0 = muet, 1 = max)
var volumePommes = 0.05; // volume de son global de chacune des 3 pommes

var sonPomme = new Audio("sons/pomme.mp3");
var sonDoree = new Audio("sons/pomme_doree.mp3");
var sonPourrie = new Audio("sons/pomme_pourrie.mp3");
sonPomme.volume = volumePommes;
sonDoree.volume = volumePommes;
sonPourrie.volume = volumePommes;

//var sonGameOver = new Audio("sons/game_over.mp3");
//var sonFin = new Audio("sons/fin.mp3");

var sonUrgence = new Audio("sons/timer.mp3"); // son pour le timer

var musique = new Audio("sons/musique.mp3"); // musique de fond
musique.volume = 1; // volume de la musique de fond

// Fonction qui permet d'activer le son avec l'action d'un utilisateur (click, doigt sur l'écran)... 
// à cause de la politique qui bloque automatiquement
var audioAction = false;
function preparerAudio() {
    if (audioAction) return;
    audioAction = true;

    // Déverrouille tous les sons dès le 1er geste utilisateur (mobile).
    function deverrouillerSon(son, volumeFinal) {
        var ancienVolume = son.volume;
        son.volume = 0;
        var lecture = son.play();
        if (lecture !== undefined) {
            lecture.then(function () {
                son.pause();
                son.currentTime = 0;
                son.volume = volumeFinal !== undefined ? volumeFinal : ancienVolume;
            }).catch(function () { });
        }
    }

    deverrouillerSon(sonPomme, volumePommes);
    deverrouillerSon(sonDoree, volumePommes);
    deverrouillerSon(sonPourrie, volumePommes);
    deverrouillerSon(sonUrgence);

    musique.play().catch(function () { });
}
document.addEventListener("click", preparerAudio, { passive: true });
document.addEventListener("touchstart", preparerAudio, { passive: true });