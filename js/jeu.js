var ecranGameOver = document.getElementById("ecranGameOver");
var gameOverTitre = document.getElementById("gameOverTitre");
var gameOverScore = document.getElementById("gameOverScore");
var btnRejouerGameOver = document.getElementById("btnRejouerGameOver");

var ecranVictoire = document.getElementById("ecranVictoire");
var victoireTitre = document.getElementById("victoireTitre");
var victoireScore = document.getElementById("victoireScore");
var btnRejouerVictoire = document.getElementById("btnRejouerVictoire");
var btnContinuerHistoire = document.getElementById("btnContinuerHistoire");

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

// Permet d'ajouter un timer, et le jeu s'arrête à la fin du timer
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

function collisionPanier() {
    var margeCollisionX = 18; // élargit un peu la capture sur les côtés

    for (var i = 0; i < pommes.length; i++) {
        // Si le timer (ou la fin par vies) vient de déclencher,
        // on stoppe tout de suite pour ne plus modifier le score.
        if (gameOver) return;

        var pommeSeule = pommes[i];

        if (
            pommeSeule.x < panierX + panierW + margeCollisionX &&
            pommeSeule.x - 5 > panierX - margeCollisionX && // distance à laquelle la pomme touche le panier sur les côtés (axe X)
            pommeSeule.y < panierY + panierH &&
            pommeSeule.y + -20 > panierY // distance à laquelle la pomme touche le panier depuis le haut (axe Y)
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
                    terminerJeu("JEU PERDU !");
                }
            }

            pommes.splice(i, 1);
            i--;

            // Si la fin du jeu vient d'être déclenchée (dernier coeur),
            // on stoppe pour éviter de modifier le score sur la même frame.
            if (gameOver) return;
        }
    }
}

function creerPomme() {
    var type = Math.random();

    var pomme = {
        x: Math.random() * (canvaJeu.width - 40),
        y: 0,
        vitesse: 2 + Math.random() * 3,
        type: type
    };

    pommes.push(pomme); // On insère la variable pomme dans le tableau pommes
}

// Fonction qui permet de dessiner les pommes
function dessinerPommes() {
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
        pommeSeule.y += pommeSeule.vitesse;
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

// Fonction qui dessine la trajectoire et empêche la répétition des frame
function dessiner() {

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
    dessinerPommes();
    dessinerPanier();
    collisionPanier();
    defScore();
    defVies();
    defTimer();

    // Spawn des pommes
    if (Math.random() < 0.02) {
        creerPomme();
    }

    // Fin par temps déclenchée ici pour figer un score cohérent avec la frame affichée
    if (finParTemps) {
        terminerJeu("C'est fini, Bravo ! Score : {score}");
        return;
    }

    requestAnimationFrame(dessiner); // La fonction dessiner est exécutée à l'infini
}

dessiner();
