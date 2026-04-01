// Sons du jeu pour chaques actions (volume pommes : 0 = muet, 1 = max)
var volumePommes = 0.05; // volume de son global de chacune des 3 pommes

var sonPomme = new Audio("sons/pomme.mp3");
var sonDoree = new Audio("sons/pomme_doree.mp3");
var sonPourrie = new Audio("sons/pomme_pourrie.mp3");
var sonSecoussePommier = new Audio("sons/secousse_pommier.mp3");
var sonPigeonSansPomme = new Audio("sons/pigeon_sans_pomme.mp3");
var sonPigeonVolePomme = new Audio("sons/pigeon_vole_pomme.mp3");
sonPomme.preload = "auto";
sonDoree.preload = "auto";
sonPourrie.preload = "auto";
sonSecoussePommier.preload = "auto";
sonPigeonSansPomme.preload = "auto";
sonPigeonVolePomme.preload = "auto";
sonPomme.volume = volumePommes;
sonDoree.volume = volumePommes;
sonPourrie.volume = volumePommes;
sonSecoussePommier.volume = 0.25;
sonPigeonSansPomme.volume = 0.25;
sonPigeonVolePomme.volume = 0.3;

//var sonGameOver = new Audio("sons/game_over.mp3");
//var sonFin = new Audio("sons/fin.mp3");

var sonUrgence = new Audio("sons/timer.mp3"); // son pour le timer
sonUrgence.preload = "auto";
sonUrgence.volume = 0.22;

var sonGameOverEcran = new Audio("sons/game_over_ecran.mp3"); // son pour l'écran de game over
sonGameOverEcran.preload = "auto";
sonGameOverEcran.volume = 0.15;
var musiqueFinEcran = new Audio("sons/fin_ecran.mp3"); // ajoute ton son de fin ici
musiqueFinEcran.preload = "auto";
musiqueFinEcran.volume = 0.15;

var musique = new Audio("sons/musique.mp3"); // musique de fond
musique.preload = "auto";
musique.volume = 1; // volume de la musique de fond

// Fonction qui permet d'activer le son avec l'action d'un utilisateur (click, doigt sur l'écran)... 
// à cause de la politique qui bloque automatiquement
var audioAction = false;
var audioActivationEnCours = false;

function rechaufferSon(audio) {
    if (!audio) return;
    var ancienVolume = audio.volume;
    audio.volume = 0;
    audio.currentTime = 0;
    audio.play().then(function () {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = ancienVolume;
    }).catch(function () {
        audio.volume = ancienVolume;
    });
}

function preparerAudio() {
    if (audioAction || audioActivationEnCours) return;
    audioActivationEnCours = true;

    var tentative = sonPomme.play();
    if (tentative !== undefined) {
        tentative.then(function () {
            sonPomme.pause();
            sonPomme.currentTime = 0;
            sonPomme.volume = volumePommes;
            rechaufferSon(sonSecoussePommier);

            audioAction = true; // activé seulement si succès réel
            audioActivationEnCours = false;
            musique.play().catch(function () { });
        }).catch(function () {
            // En cas d'échec, on laisse les prochains clics réessayer
            sonPomme.volume = volumePommes;
            audioActivationEnCours = false;
        });
    } else {
        sonPomme.pause();
        sonPomme.currentTime = 0;
        sonPomme.volume = volumePommes;
        rechaufferSon(sonSecoussePommier);
        audioAction = true;
        audioActivationEnCours = false;
        musique.play().catch(function () { });
    }
}
document.addEventListener("pointerdown", preparerAudio, { passive: true });
document.addEventListener("touchstart", preparerAudio, { passive: true });
document.addEventListener("click", preparerAudio, { passive: true });