var facteurVitesseGlobal = 1.65; // vitesse globale des pommes etc

var facteurApparitionPommes = 2; // tentaives de spawn de pommes par secondes

var ecranGameOver = document.getElementById("ecranGameOver");
var gameOverTitre = document.getElementById("gameOverTitre");
var gameOverScore = document.getElementById("gameOverScore");
var btnRejouerGameOver = document.getElementById("btnRejouerGameOver");

var ecranVictoire = document.getElementById("ecranVictoire");
var victoireTitre = document.getElementById("victoireTitre");
var victoireScore = document.getElementById("victoireScore");
var btnRejouerVictoire = document.getElementById("btnRejouerVictoire");
var btnContinuerHistoire = document.getElementById("btnContinuerHistoire");

// Ecran de consignes au démarrage
var ecranConsignes = document.getElementById("ecranConsignes");
var btnLancerJeu = document.getElementById("btnLancerJeu");
var btnRevoirCinematique = document.getElementById("btnRevoirCinematique");
var btnAutoriserMicro = document.getElementById("btnAutoriserMicro");
var etatMicroConsignes = document.getElementById("etatMicroConsignes");
var ecranCinematique = document.getElementById("ecranCinematique");
var imagePommierCinematique = document.getElementById("imagePommierCinematique");
var texteCinematique = document.getElementById("texteCinematique");
var btnSecouerArbre = document.getElementById("btnSecouerArbre");
var pommesCinematique = document.querySelectorAll(".pomme-cine");
var jeuCommence = false;
var cleCinematiqueVue = "cinematiqueSecouerArbreVue";
var cinematiqueSecousseDeclenchee = false;
var ecouteSecousseActive = false;
var derniereAcceleration = null;
var dernierSecouement = 0;
var pigeon = null;
var prochainApparitionPigeonMs = 0;
var microAnalyseur = null;
var microDonnees = null;
var microDonneesFrequences = null;
var microContexte = null;
var microPret = false;
var microDemandeEffectuee = false;
var bruitAmbiant = 0.015;
var clePermissionMicro = "permissionMicroJeu";
var souffleConsecutif = 0;
var signatureSouffleAmbiante = 0.12;
var messagePigeon = "";
var messagePigeonJusquaMs = 0;
var messagePigeonCouleur = "#7CFF8F";
var calibrationMicroJusquaMs = 0;
var niveauPicRecent = 0;

if (btnRejouerGameOver) {
    btnRejouerGameOver.addEventListener("click", function () {
        document.location.reload();
    });
}

if (btnRejouerVictoire) {
    btnRejouerVictoire.addEventListener("click", function () {
        document.location.reload();
    });
}

if (btnContinuerHistoire) {
    btnContinuerHistoire.addEventListener("click", function () {
        // Bouton temporaire: pas de redirection pour l'instant
    });
}

function afficherGameOver(message) {
    if (!ecranGameOver || !gameOverTitre || !gameOverScore) return;
    gameOverTitre.textContent = message;
    gameOverScore.textContent = "Score : " + scoreFinal;
    sonGameOverEcran.currentTime = 0;
    sonGameOverEcran.play().catch(function () { });
    ecranGameOver.classList.remove("cache");
}

function afficherVictoire(message) {
    if (!ecranVictoire || !victoireTitre || !victoireScore) return;
    victoireTitre.textContent = message;
    victoireScore.textContent = "Score : " + scoreFinal;
    musiqueFinEcran.currentTime = 0;
    musiqueFinEcran.play().catch(function () { });
    ecranVictoire.classList.remove("cache");
}

function cinematiqueDejaVue() {
    try {
        return sessionStorage.getItem(cleCinematiqueVue) === "1";
    } catch (e) {
        return false;
    }
}

function mettreAJourBoutonRevoirCinematique() {
    if (!btnRevoirCinematique) return;
    if (cinematiqueDejaVue()) {
        btnRevoirCinematique.classList.remove("cache");
    } else {
        btnRevoirCinematique.classList.add("cache");
    }
}

function lireEtatMicroSauvegarde() {
    try {
        return localStorage.getItem(clePermissionMicro) || "inconnu";
    } catch (e) {
        return "inconnu";
    }
}

function enregistrerEtatMicro(etat) {
    try {
        localStorage.setItem(clePermissionMicro, etat);
    } catch (e) {
        // stockage indisponible: on continue sans bloquer le jeu
    }
}

function mettreAJourTexteEtatMicro() {
    if (!etatMicroConsignes) return;
    if (btnAutoriserMicro) {
        btnAutoriserMicro.classList.remove("cache");
    }

    if (microPret) {
        etatMicroConsignes.textContent = "Micro autorisé";
        if (btnAutoriserMicro) {
            btnAutoriserMicro.classList.add("cache");
        }
        return;
    }

    var etat = lireEtatMicroSauvegarde();
    if (etat === "granted") {
        etatMicroConsignes.textContent = "Micro déjà autorisé";
        if (btnAutoriserMicro) {
            btnAutoriserMicro.classList.add("cache");
        }
    } else if (etat === "denied") {
        etatMicroConsignes.textContent = "Micro refusé : active-le dans les réglages du navigateur";
    } else {
        etatMicroConsignes.textContent = "Micro non configuré";
    }
}

function verifierPermissionMicroExistante() {
    if (!navigator.permissions || !navigator.permissions.query) {
        mettreAJourTexteEtatMicro();
        return;
    }

    navigator.permissions.query({ name: "microphone" }).then(function (statut) {
        if (statut.state === "granted") {
            enregistrerEtatMicro("granted");
        } else if (statut.state === "denied") {
            enregistrerEtatMicro("denied");
        }
        mettreAJourTexteEtatMicro();
    }).catch(function () {
        mettreAJourTexteEtatMicro();
    });
}

function enregistrerCinematiqueCommeVue() {
    try {
        sessionStorage.setItem(cleCinematiqueVue, "1");
    } catch (e) {
        // Si le stockage est indisponible, on ignore sans bloquer le jeu.
    }
    mettreAJourBoutonRevoirCinematique();
}

function demanderPermissionSecousse() {
    if (
        typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function"
    ) {
        DeviceMotionEvent.requestPermission().catch(function () { });
    }
}

function arreterEcouteSecousse() {
    if (!ecouteSecousseActive) return;
    window.removeEventListener("devicemotion", detecterSecousse);
    ecouteSecousseActive = false;
}

function detecterSecousse(event) {
    if (cinematiqueSecousseDeclenchee) return;

    var acceleration = event.accelerationIncludingGravity || event.acceleration;
    if (!acceleration) return;

    var x = acceleration.x || 0;
    var y = acceleration.y || 0;
    var z = acceleration.z || 0;
    var maintenant = Date.now();

    if (!derniereAcceleration) {
        derniereAcceleration = { x: x, y: y, z: z };
        return;
    }

    var variation =
        Math.abs(x - derniereAcceleration.x) +
        Math.abs(y - derniereAcceleration.y) +
        Math.abs(z - derniereAcceleration.z);

    derniereAcceleration = { x: x, y: y, z: z };

    if (variation > 22 && maintenant - dernierSecouement > 900) {
        dernierSecouement = maintenant;
        jouerSonSecoussePommier();
        lancerAnimationSecousse();
    }
}

function jouerSonSecoussePommier() {
    if (typeof sonSecoussePommier === "undefined") return;
    sonSecoussePommier.currentTime = 0;
    sonSecoussePommier.play().catch(function () { });
}

function lancerAnimationSecousse() {
    if (!ecranCinematique || cinematiqueSecousseDeclenchee) return;
    cinematiqueSecousseDeclenchee = true;
    arreterEcouteSecousse();

    if (texteCinematique) {
        texteCinematique.textContent = "Bien joué ! Les pommes tombent...";
    }

    if (imagePommierCinematique) {
        imagePommierCinematique.classList.remove("secoue");
        void imagePommierCinematique.offsetWidth;
        imagePommierCinematique.classList.add("secoue");
    }

    for (var i = 0; i < pommesCinematique.length; i++) {
        pommesCinematique[i].classList.add("tomber");
    }

    window.setTimeout(function () {
        ecranCinematique.classList.add("transition-bas");
        enregistrerCinematiqueCommeVue();

        window.setTimeout(function () {
            ecranCinematique.classList.add("cache");
            ecranCinematique.classList.remove("transition-bas");
            demarrerJeu();
        }, 820);
    }, 1200);
}

function afficherCinematique() {
    if (!ecranCinematique) {
        demarrerJeu();
        return;
    }

    cinematiqueSecousseDeclenchee = false;
    derniereAcceleration = null;
    dernierSecouement = 0;

    if (ecranConsignes) ecranConsignes.classList.add("cache");
    ecranCinematique.classList.remove("cache");
    ecranCinematique.classList.remove("transition-bas");

    if (imagePommierCinematique) {
        imagePommierCinematique.classList.remove("secoue");
    }
    for (var i = 0; i < pommesCinematique.length; i++) {
        pommesCinematique[i].classList.remove("tomber");
    }

    if (texteCinematique) {
        texteCinematique.textContent = "Secoue ton téléphone !";
    }

    demanderPermissionSecousse();
    window.addEventListener("devicemotion", detecterSecousse);
    ecouteSecousseActive = true;
}

// Démarre une nouvelle partie après le clic sur "Lancer le jeu"
function demarrerJeu() {
    if (jeuCommence) return;
    jeuCommence = true;
    document.dispatchEvent(new CustomEvent("sae402:game-start", { bubbles: true }));

    if (ecranConsignes) ecranConsignes.classList.add("cache");

    // Cache les écrans de fin si jamais ils étaient visibles
    if (ecranGameOver) ecranGameOver.classList.add("cache");
    if (ecranVictoire) ecranVictoire.classList.add("cache");

    // Reset état du jeu
    pommes.length = 0;
    score = 0;
    scoreFinal = 0;
    scoreAffiche = 0;
    vies = 3;
    tempsRestant = 30;
    gameOver = false;
    finParTemps = false;
    pigeon = null;
    prochainApparitionPigeonMs = Date.now() + 2500 + Math.random() * 3500;

    // Reset sons "timer"
    sonUrgence.pause();
    sonUrgence.currentTime = 0;

    // Active les sons (le clic sur le bouton fait partie du geste utilisateur)
    if (typeof preparerAudio === "function") {
        preparerAudio();
    }
    if (lireEtatMicroSauvegarde() === "granted") {
        initialiserDetectionSouffle();
    }
    musique.play().catch(function () { });

    // Démarre le timer seulement maintenant
    if (intervalId !== null) {
        clearInterval(intervalId);
    }
    intervalId = setInterval(function () {
        if (gameOver) return;

        tempsRestant--;

        if (tempsRestant <= 0) {
            tempsRestant = 0;
            finParTemps = true;
            sonUrgence.pause();
            sonUrgence.currentTime = 0;
            clearInterval(intervalId);
            intervalId = null;
        }
    }, 1000);

    // Lance la boucle de rendu
    instantFramePrecedent = 0;
    requestAnimationFrame(dessiner);
}

function initialiserDetectionSouffle() {
    if (microPret || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        mettreAJourTexteEtatMicro();
        return;
    }
    if (microDemandeEffectuee) return;
    microDemandeEffectuee = true;

    navigator.mediaDevices.getUserMedia({
        audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
        }
    }).then(function (flux) {
        var ContexteAudio = window.AudioContext || window.webkitAudioContext;
        if (!ContexteAudio) return;

        microContexte = new ContexteAudio();
        if (typeof microContexte.resume === "function") {
            microContexte.resume().catch(function () { });
        }
        var source = microContexte.createMediaStreamSource(flux);
        microAnalyseur = microContexte.createAnalyser();
        microAnalyseur.fftSize = 512;
        source.connect(microAnalyseur);
        microDonnees = new Uint8Array(microAnalyseur.fftSize);
        microDonneesFrequences = new Uint8Array(microAnalyseur.frequencyBinCount);
        microPret = true;
        calibrationMicroJusquaMs = Date.now() + 1200;
        niveauPicRecent = 0;
        enregistrerEtatMicro("granted");
        mettreAJourTexteEtatMicro();

        // Certains navigateurs baissent/coupent la sortie audio lors de l'activation micro.
        // On relance explicitement l'audio du jeu après autorisation.
        if (typeof preparerAudio === "function") {
            preparerAudio();
        }
        if (jeuCommence && !gameOver) {
            musique.play().catch(function () { });
            if (tempsRestant <= 10 && tempsRestant > 0) {
                sonUrgence.play().catch(function () { });
            }
        }
    }).catch(function () {
        // Si la permission micro est refusée, le pigeon reste un danger normal.
        enregistrerEtatMicro("denied");
        mettreAJourTexteEtatMicro();
    }).finally(function () {
        microDemandeEffectuee = false;
    });
}

function niveauSouffle() {
    if (!microPret || !microAnalyseur || !microDonnees) return 0;

    microAnalyseur.getByteTimeDomainData(microDonnees);
    var somme = 0;

    for (var i = 0; i < microDonnees.length; i++) {
        var centree = (microDonnees[i] - 128) / 128;
        somme += centree * centree;
    }

    return Math.sqrt(somme / microDonnees.length);
}

function signatureSouffle() {
    if (!microPret || !microAnalyseur || !microDonneesFrequences) return 0;

    microAnalyseur.getByteFrequencyData(microDonneesFrequences);

    var n = microDonneesFrequences.length;
    if (!n) return 0;

    // Le souffle contient souvent plus de bruit dans les hautes fréquences que la voix criée.
    var debutMoyen = Math.floor(n * 0.08);
    var finMoyen = Math.floor(n * 0.32);
    var debutHaut = Math.floor(n * 0.45);
    var finHaut = Math.floor(n * 0.9);

    var sommeMoyen = 0;
    var sommeHaut = 0;
    var i;

    for (i = debutMoyen; i < finMoyen; i++) {
        sommeMoyen += microDonneesFrequences[i];
    }
    for (i = debutHaut; i < finHaut; i++) {
        sommeHaut += microDonneesFrequences[i];
    }

    var moyenneMoyen = sommeMoyen / Math.max(1, finMoyen - debutMoyen);
    var moyenneHaut = sommeHaut / Math.max(1, finHaut - debutHaut);

    return moyenneHaut / Math.max(1, moyenneMoyen);
}

function creerPigeon() {
    var cote = Math.random() < 0.5 ? "gauche" : "droite";
    var largeur = 92;
    var hauteur = 66;
    var xBord = cote === "gauche" ? 0 : canvaJeu.width - largeur;

    pigeon = {
        cote: cote,
        largeur: largeur,
        hauteur: hauteur,
        x: xBord,
        y: 96,
        typeFuite: "",
        vitesseFuiteX: cote === "gauche" ? -360 : 360,
        vitesseFuiteY: -300,
        tempsApparition: Date.now(),
        tempsReactionSouffle: 650,
        tempsAvantVol: 3000,
        enFuite: false,
        aVole: false
    };
    souffleConsecutif = 0;

    if (typeof sonPigeonSansPomme !== "undefined") {
        sonPigeonSansPomme.currentTime = 0;
        sonPigeonSansPomme.play().catch(function () { });
    }
}

function afficherMessagePigeon(message, dureeMs, couleur) {
    messagePigeon = message;
    messagePigeonJusquaMs = Date.now() + (dureeMs || 1100);
    messagePigeonCouleur = couleur || "#7CFF8F";
}

function faireVolerPigeon(raison) {
    if (!pigeon || pigeon.enFuite || gameOver) return;
    pigeon.typeFuite = "souffle";
    pigeon.enFuite = true;
    afficherMessagePigeon("Bien joué ! Le pigeon s'enfuit.", 1200, "#7CFF8F");
    if (typeof sonPigeonSansPomme !== "undefined") {
        sonPigeonSansPomme.currentTime = 0;
        sonPigeonSansPomme.play().catch(function () { });
    }
}

function pigeonVoleUnePomme() {
    if (!pigeon || pigeon.aVole || gameOver) return;
    pigeon.aVole = true;
    pigeon.typeFuite = "vol";
    afficherMessagePigeon("Raté ! Le pigeon vole une pomme.", 1400, "#FF5C5C");

    if (pommes.length > 0) {
        pommes.splice(0, 1);
    }

    if (typeof sonPigeonVolePomme !== "undefined") {
        sonPigeonVolePomme.currentTime = 0;
        sonPigeonVolePomme.play().catch(function () { });
    }

    vies--;
    if (vies <= 0) {
        terminerJeu("PARTIE PERDUE :(");
    }
}

function mettreAJourPigeon(dt) {
    if (gameOver) return;

    var maintenant = Date.now();

    if (!pigeon && maintenant >= prochainApparitionPigeonMs) {
        creerPigeon();
    }

    if (!pigeon) return;

    if (!pigeon.enFuite) {
        pigeon.x = pigeon.cote === "gauche" ? 0 : canvaJeu.width - pigeon.largeur;

        var tempsSurEcran = maintenant - pigeon.tempsApparition;
        var niveau = niveauSouffle();
        var signature = signatureSouffle();
        var coefLissage = maintenant < calibrationMicroJusquaMs ? 0.05 : 0.015;
        bruitAmbiant = bruitAmbiant * (1 - coefLissage) + niveau * coefLissage;
        signatureSouffleAmbiante = signatureSouffleAmbiante * (1 - coefLissage) + signature * coefLissage;
        niveauPicRecent = Math.max(niveauPicRecent * 0.92, niveau);

        var mobile = navigator.maxTouchPoints > 0;
        var seuilSouffle = mobile
            ? Math.max(0.05, bruitAmbiant * 2.2)
            : Math.max(0.078, bruitAmbiant * 3.05);
        var seuilSignatureSouffle = Math.max(0.14, signatureSouffleAmbiante * 1.3);
        var souffleFort = niveau > seuilSouffle;
        var souffleTypique = signature > seuilSignatureSouffle;
        var picSouffle = niveauPicRecent > seuilSouffle * 1.4;

        if (
            tempsSurEcran >= pigeon.tempsReactionSouffle &&
            (souffleFort || souffleTypique || picSouffle)
        ) {
            souffleConsecutif++;
        } else {
            souffleConsecutif = 0;
        }

        // Evite les déclenchements instantanés dus au bruit ambiant.
        if (souffleConsecutif >= 2) {
            faireVolerPigeon("souffle");
            souffleConsecutif = 0;
        } else if (tempsSurEcran >= pigeon.tempsAvantVol) {
            pigeonVoleUnePomme();
            pigeon.enFuite = true;
            souffleConsecutif = 0;
        }
    } else {
        if (pigeon.typeFuite === "vol") {
            var versDroite = pigeon.cote === "gauche";
            pigeon.x += (versDroite ? 420 : -420) * dt;
        } else {
            // Soufflé: retourne en arrière (animation actuelle)
            pigeon.x += pigeon.vitesseFuiteX * dt;
            pigeon.y += pigeon.vitesseFuiteY * dt;
        }
    }

    if (
        pigeon.x < -140 ||
        pigeon.x > canvaJeu.width + 140 ||
        pigeon.y < -140
    ) {
        pigeon = null;
        prochainApparitionPigeonMs = Date.now() + 5000 + Math.random() * 6000;
    }
}

function dessinerPigeon() {
    if (!pigeon) return;

    if (spritePigeon && spritePigeon.complete && spritePigeon.naturalWidth > 0) {
        if (pigeon.cote === "gauche") {
            ctx.drawImage(spritePigeon, pigeon.x, pigeon.y, pigeon.largeur, pigeon.hauteur);
        } else {
            ctx.save();
            ctx.translate(pigeon.x + pigeon.largeur / 2, pigeon.y + pigeon.hauteur / 2);
            ctx.scale(-1, 1);
            ctx.drawImage(
                spritePigeon,
                -pigeon.largeur / 2,
                -pigeon.hauteur / 2,
                pigeon.largeur,
                pigeon.hauteur
            );
            ctx.restore();
        }
    }

    if (!pigeon.enFuite) {
        ctx.font = "22px 'Jersey 10'";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        if (microPret) {
            ctx.fillText("Fait fuir le pigeon !", canvaJeu.width / 2, 95);
        } else {
            ctx.fillText("Tape le pigeon pour le chasser !", canvaJeu.width / 2, 95);
        }
        ctx.textAlign = "start";
    }
}

function dessinerMessagePigeon() {
    if (!messagePigeon || Date.now() > messagePigeonJusquaMs) return;

    ctx.font = "24px 'Jersey 10'";
    ctx.fillStyle = messagePigeonCouleur;
    ctx.textAlign = "center";
    ctx.fillText(messagePigeon, canvaJeu.width / 2, 128);
    ctx.textAlign = "start";
}

function positionDansCanvasDepuisEvenement(e) {
    var rect = canvaJeu.getBoundingClientRect();
    var clientX = e.clientX;
    var clientY = e.clientY;

    if ((clientX === undefined || clientY === undefined) && e.touches && e.touches.length) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    }

    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

function gererTapPigeonSansMicro(e) {
    if (!pigeon || pigeon.enFuite || gameOver) return;

    var pos = positionDansCanvasDepuisEvenement(e);
    var dansX = pos.x >= pigeon.x && pos.x <= pigeon.x + pigeon.largeur;
    var dansY = pos.y >= pigeon.y && pos.y <= pigeon.y + pigeon.hauteur;

    if (dansX && dansY) {
        faireVolerPigeon("tap");
    }
}

if (btnLancerJeu) {
    btnLancerJeu.addEventListener("click", function () {
        if (cinematiqueDejaVue()) {
            demarrerJeu();
        } else {
            afficherCinematique();
        }
    });
}

if (btnSecouerArbre) {
    btnSecouerArbre.addEventListener("click", function () {
        jouerSonSecoussePommier();
        lancerAnimationSecousse();
    });
}

if (btnRevoirCinematique) {
    btnRevoirCinematique.addEventListener("click", function () {
        try {
            sessionStorage.removeItem(cleCinematiqueVue);
        } catch (e) {
            // Ignore si le stockage n'est pas disponible.
        }
        mettreAJourBoutonRevoirCinematique();
    });
}

if (btnAutoriserMicro) {
    btnAutoriserMicro.addEventListener("click", function () {
        initialiserDetectionSouffle();
    });
}

canvaJeu.addEventListener("pointerdown", gererTapPigeonSansMicro);
canvaJeu.addEventListener("touchstart", gererTapPigeonSansMicro, { passive: true });

mettreAJourBoutonRevoirCinematique();
verifierPermissionMicroExistante();

// Termine le jeu une seule fois (évite les alert/reload en double)
function terminerJeu(message) {
    if (gameOver) return; // garde-fou anti-doubles déclenchements
    gameOver = true;
    jeuCommence = false;
    document.dispatchEvent(new CustomEvent("sae402:game-end", { bubbles: true }));
    scoreFinal = scoreAffiche; // score réellement affiché à l'écran

    if (intervalId !== null) {
        clearInterval(intervalId);
    }

    musique.pause();
    musiqueFinEcran.pause();
    musiqueFinEcran.currentTime = 0;
    sonUrgence.pause();
    sonUrgence.currentTime = 0;

    var texte = message.replace("{score}", scoreFinal);
    if (finParTemps) {
        afficherVictoire(texte);
    } else {
        afficherGameOver(texte);
    }
}

// Le timer est démarré dans demarrerJeu()

function collisionPanier() {
    var margeCollisionX = 8;

    for (var i = 0; i < pommes.length; i++) {
        // Si le timer (ou la fin par vies) vient de déclencher,
        // on stoppe tout de suite pour ne plus modifier le score.
        if (gameOver) return;

        var pommeSeule = pommes[i];

        if (
            pommeSeule.x < panierX + panierW + margeCollisionX &&
            pommeSeule.x - 5 > panierX - margeCollisionX && // distance à laquelle la pomme touche le panier sur les côtés (axe X)
            pommeSeule.y < panierY + panierH &&
            pommeSeule.y + 10 > panierY // distance à laquelle la pomme touche le panier depuis le haut (axe Y)
        ) {
            // SCORE selon type
            if (pommeSeule.type < 0.7) {
                score += 1;
                sonPomme.currentTime = 0;
                sonPomme.play().catch(function () { });
            } else if (pommeSeule.type < 0.8) {
                score += 10;
                sonDoree.currentTime = 0;
                sonDoree.play().catch(function () { });
            } else {
                vies--; // si pomme pourrie touchée -1 vie à chaque fois
                score -= 5; // si pomme pourrie touchée -5 points à chaque fois

                sonPourrie.currentTime = 0;
                sonPourrie.play().catch(function () { });

                if (vies <= 0) {
                    terminerJeu("PARTIE PERDUE :(");
                }
            }

            pommes.splice(i, 1);
            i--;

            // Si la fin du jeu vient d'être déclenchée (dernier coeur),
            // on stoppe pour éviter de modifier le score sur la même frame
            if (gameOver) return;
        }
    }
}

function creerPomme() {
    var type = Math.random();

    // vitesse en px/s : base * facteurVitesseGlobal (identique sur tous les écrans)
    var pomme = {
        x: Math.random() * (canvaJeu.width - 40),
        y: 0,
        vitesse: (2 + Math.random() * 3) * 60 * facteurVitesseGlobal,
        type: type
    };

    pommes.push(pomme); // On insère la variable pomme dans le tableau pommes
}

function dessinerPommes(dt) {
    for (var i = 0; i < pommes.length; i++) {
        var pommeSeule = pommes[i];

        var image;

        if (pommeSeule.type < 0.7) {
            image = spritePommeRouge;
        }
        else if (pommeSeule.type < 0.8) {
            image = spritePommeDoree;
        } else {
            image = spritePommePourrie;
        }

        ctx.drawImage(image, pommeSeule.x, pommeSeule.y, 40, 40);
        pommeSeule.y += pommeSeule.vitesse * dt;
    }
}

// Fonction qui permet de dessiner notre panier
function dessinerPanier() {
    ctx.drawImage(
        spritePanier,
        panierX,
        panierY,
        panierW,
        panierH
    );
}

var instantFramePrecedent = 0;

// t = horodatage fourni par requestAnimationFrame (simple et fiable pour le delta temps)
function dessiner(t) {
    var dt = instantFramePrecedent
        ? Math.min((t - instantFramePrecedent) / 1000, 0.05)
        : 1 / 60;
    instantFramePrecedent = t;

    if (modePaysage) {
        ctx.clearRect(0, 0, canvaJeu.width, canvaJeu.height);
        requestAnimationFrame(dessiner);
        return;
    }

    if (gameOver) {
        // On affiche au moins le HUD final (score/vies/temps)
        ctx.clearRect(0, 0, canvaJeu.width, canvaJeu.height);
        defScore();
        defVies();
        defTimer();
        return;
    }

    ctx.clearRect(0, 0, canvaJeu.width, canvaJeu.height)
    mettreAJourPigeon(dt);
    dessinerPommes(dt);
    dessinerPigeon();
    dessinerMessagePigeon();
    dessinerPanier();
    collisionPanier();
    defScore();
    defVies();
    defTimer();

    if (Math.random() < 0.02 * 60 * dt * facteurApparitionPommes) {
        creerPomme();
    }

    // Fin par temps déclenchée ici pour figer un score cohérent avec la frame affichée
    if (finParTemps) {
        terminerJeu("PARTIE TERMINÉE ! BIEN JOUÉ :)");
        return;
    }

    requestAnimationFrame(dessiner); // La fonction dessiner est exécutée à l'infini
}

// La boucle commence uniquement après le clic sur "Lancer le jeu"
