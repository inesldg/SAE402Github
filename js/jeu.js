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

function enregistrerCinematiqueCommeVue() {
    try {
        sessionStorage.setItem(cleCinematiqueVue, "1");
    } catch (e) {
        // Si le stockage est indisponible, on ignore sans bloquer le jeu.
    }
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
        lancerAnimationSecousse();
    }
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

    // Reset sons "timer"
    sonUrgence.pause();
    sonUrgence.currentTime = 0;

    // Active les sons (le clic sur le bouton fait partie du geste utilisateur)
    if (typeof preparerAudio === "function") {
        preparerAudio();
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
    btnSecouerArbre.addEventListener("click", lancerAnimationSecousse);
}

if (btnRevoirCinematique) {
    btnRevoirCinematique.addEventListener("click", function () {
        try {
            sessionStorage.removeItem(cleCinematiqueVue);
        } catch (e) {
            // Ignore si le stockage n'est pas disponible.
        }
    });
}

// Termine le jeu une seule fois (évite les alert/reload en double)
function terminerJeu(message) {
    if (gameOver) return; // garde-fou anti-doubles déclenchements
    gameOver = true;
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
        // fond sombre
        ctx.clearRect(0, 0, canvaJeu.width, canvaJeu.height);
        ctx.fillStyle = "rgba(0, 0, 0, 0.59)";
        ctx.fillRect(0, 0, canvaJeu.width, canvaJeu.height);

        // texte
        ctx.textAlign = "center";
        ctx.font = "32px 'Jersey 10'";
        ctx.fillStyle = "white";

        ctx.fillText(
            "Veuillez placer votre téléphone en mode portrait",
            canvaJeu.width / 2,
            canvaJeu.height / 2 - 10
        );

        ctx.fillText(
            "pour une meilleure expérience de jeu ;)",
            canvaJeu.width / 2,
            canvaJeu.height / 2 + 20
        );

        ctx.textAlign = "start";
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
    dessinerPommes(dt);
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
