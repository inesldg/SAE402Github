// On enregistre notre canva dans la variable canvaJeu, ensuite
// on crée la variable ctx pour stocker le contexte 2d
var canvaJeu = document.getElementById("monCanva");
var ctx = canvaJeu.getContext("2d");

// Fonction qui adapte la taille du canva selon la taille de l'appareil utilisé
function resizeCanvas() {
    canvaJeu.width = window.innerWidth;
    canvaJeu.height = window.innerHeight;
}

resizeCanvas(); // au chargement --> adaptation de la taille du canva selon l'écran
window.addEventListener("resize", resizeCanvas);

// Variable qui stocke l'orientation du téléphone
var modePaysage = false;

// Couleurs et typos reliées au root du style
var rootStyles = getComputedStyle(document.documentElement);
var gold = rootStyles.getPropertyValue("--gold-clair");

// Variables qui définissent notre petit panier !
var panierW = 120;
var panierH = 110;
var panierX = (canvaJeu.width - panierW) / 2;
var panierY = canvaJeu.height - panierH - 20;

// Variable qui définissent les pommes et leurs sprites
var pommes = [];

var spritePommeRouge = new Image();
spritePommeRouge.src = "sprites/pommeRouge.png"; // Sprite pomme rouge

var spritePommeDoree = new Image();
spritePommeDoree.src = "sprites/pommeDoree.png"; // Sprite pomme dorée

var spritePommePourrie = new Image();
spritePommePourrie.src = "sprites/pommePourrie.png"; // Sprite pomme pourrie

// Définition de l'image du panier
var spritePanier = new Image();
spritePanier.src = "sprites/panier.png"; // Sprite panier qui récupère les pommes

// Définition des sprites de coeurs pour les vies
var coeurPlein = new Image();
coeurPlein.src = "sprites/coeur_plein.png"; // Sprite coeurs restants

var coeurVide = new Image();
coeurVide.src = "sprites/coeur_vide.png"; // Sprite coeurs perdus

// On mémorise l'état des touches gauche et droite dans des variables booléennes, ici
// elle sont en false par défaut car au début elles ne sont pas enfoncées
var droiteAppui = false;
var gaucheAppui = false;

// SCORE NON FONCTIONNEL -A MODIFIER
// Le score est stocké dans cette variable, qui est à 0 par défaut au début
var score = 0;
var scoreFinal = 0;
var scoreAffiche = 0;

// On dispose un nombre de vies au joueur
var vies = 3;

// On définit un timer
var tempsRestant = 30;
var gameOver = false;
var intervalId = null;
var finParTemps = false;

// Termine le jeu une seule fois (évite les alert/reload en double)
function terminerJeu(message) {
    if (gameOver) return; // garde-fou anti-doubles déclenchements
    gameOver = true;
    scoreFinal = scoreAffiche; // score réellement affiché à l'écran

    if (intervalId !== null) {
        clearInterval(intervalId);
    }

    // Petite pause pour laisser le canvas afficher la dernière frame (coeurs/temps)
    setTimeout(function () {
        // Pour la fin "Bravo", on injecte le score final capturé
        var texte = message;
        texte = texte.replace("{score}", scoreFinal);
        alert(texte);
        document.location.reload();
    }, 50);
}

// Fonction qui permet de changer le format du temps pour afficher "00:30" au lieu de juste "30"
function formatTemps(secondes) {
    let minutes = Math.floor(secondes / 60);
    let sec = secondes % 60;

    // ajoute un 0 devant si les minutes sont plus petites que 10
    minutes = minutes < 10 ? "0" + minutes : minutes;
    sec = sec < 10 ? "0" + sec : sec; // pareil pour els secondes

    return minutes + ":" + sec;
}

// Permet d'ajouter un timer, et le jeu s'arrête à la fin du timer
intervalId = setInterval(function () {
    if (gameOver) return;

    tempsRestant--;

    if (tempsRestant <= 0) {
        tempsRestant = 0;
        finParTemps = true;
        clearInterval(intervalId);
        intervalId = null;
    }

}, 1000);

// On détecte si la flèche de gauche ou de droite a été enfoncée, puis on exécute 
// la fonction keyDownHandler / keyUpHandler selon le cas
document.addEventListener("keydown", keyDownHandler, false); // keydown = touche enfoncée
document.addEventListener("keyup", keyUpHandler, false); // keyup = touche relâchée
document.addEventListener("mousemove", mouseMoveHandler, false); // mousemove = mouvement de la souris

// TOUCHES MOBILES
document.addEventListener("touchstart", touchHandler, { passive: false }); // touchstart = doigt sur l'écran
document.addEventListener("touchmove", touchHandler, { passive: false }); // touchmove = mouvement avec le doigt sur l'écran

function touchHandler(e) {
    if (e.touches) {

        var touchX = e.touches[0].clientX - canvaJeu.offsetLeft;

        if (touchX > panierW / 2 && touchX < canvaJeu.width - panierW / 2) {
            panierX = touchX - panierW / 2;
        }

        e.preventDefault();
    }
}

// On calcule la position horizontale (x) de la souris, le mouvement est limité à la taille du canva
// de façon à ce que le panier s'arrête aux bords horizontaux
function mouseMoveHandler(e) {
    var sourisX = e.clientX - canvaJeu.offsetLeft;
    if (sourisX > panierW / 2 && sourisX < canvaJeu.width - panierW / 2) {
        panierX = sourisX - panierW / 2;
    }
}

// Quand on presse une touche l'information est stockée dans une variable, la
// variable concernée est mise sur true
function keyDownHandler(e) {
    //ArrowRight suffit pour la plupart des navigateur masi on utilise aussi Right pour Edge je crois
    if (e.key == "Right" || e.key == "ArrowRight") {
        droiteAppui = true;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        gaucheAppui = true;
    }
}

// Quand la touche est relâchée elle revient à false
function keyUpHandler(e) {
    if (e.key == "Right" || e.key == "ArrowRight") {
        droiteAppui = false;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
        gaucheAppui = false;
    }
}

function orientationPaysage() {
    return window.innerWidth > window.innerHeight;
}



function verifierOrientation() {
    modePaysage = orientationPaysage();
}

verifierOrientation();
window.addEventListener("resize", verifierOrientation);



function collisionPanier() {
    for (var i = 0; i < pommes.length; i++) {
        // Si le timer (ou la fin par vies) vient de déclencher,
        // on stoppe tout de suite pour ne plus modifier le score.
        if (gameOver) return;

        var pommeSeule = pommes[i];

        if (
            pommeSeule.x < panierX + panierW &&
            pommeSeule.x + -5 > panierX && // distance à laquelle la pomme touche le panier sur les côtés (axe X)
            pommeSeule.y < panierY + panierH &&
            pommeSeule.y + -20 > panierY // distance à laquelle la pomme touche le panier depuis le haut (axe Y)
        ) {
            // SCORE selon type
            if (pommeSeule.type < 0.7) {
                score += 1;
            } else if (pommeSeule.type < 0.8) {
                score += 10;
            } else {
                vies--; // si pomme pourrie touchée -1 vie à chaque fois
                score -= 5; // si pomme pourrie touchée -5 points à chaque fois

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

// Fonction qui permet d'afficher le score du joueur
function defScore() {
    ctx.font = "32px 'Jersey 10'";
    ctx.fillStyle = gold;
    scoreAffiche = gameOver ? scoreFinal : score;
    ctx.fillText("Score: " + scoreAffiche, 8, 20);
}

function defVies() {
    var taille = 30; // taille des coeurs
    var espacement = 10;

    for (var i = 0; i < 3; i++) { // max 3 vies
        var x = canvaJeu.width - (i + 1) * (taille + espacement);
        var y = 0; // Distance entre le sprite et le bord haut du canva

        if (i < vies) {
            ctx.drawImage(coeurPlein, x, y, taille, taille);
        } else {
            ctx.drawImage(coeurVide, x, y, taille, taille);
        }
    }
}

function defTimer() {
    ctx.font = "32px 'Jersey 10'";
    ctx.fillStyle = gold;
    ctx.textAlign = "center"; // 👈 centré

    ctx.fillText(formatTemps(tempsRestant), canvaJeu.width / 2, 20);

    ctx.textAlign = "start"; // reset pour éviter bugs ailleurs
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