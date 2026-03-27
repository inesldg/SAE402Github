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
var gold = rootStyles.getPropertyValue("--gold");

// Variables qui définissent notre petit panier !
var panierW = 120; // largeur
var panierH = 110; // hauteur
var panierX = (canvaJeu.width - panierW) / 2; // position axe X
var panierY = canvaJeu.height - panierH - 20; // position axe Y

// On stocke les pommes dans un tableau, tableau stocké dans la variable pommes
var pommes = [];


// SPRITES des élements //
// J'utilise image (fonction prédéfinie en JavaScript) --> navigateur crée une <img> sans l'ajouter
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


// Le score est stocké dans cette variable, qui est à 0 par défaut au début
var score = 0; // score départ du joueur
var scoreFinal = 0; // score affiché quand gameOver est vrai, score figé pour éviter des points en plus etc
var scoreAffiche = 0; // score montré à l'écran mis à jour, qui devient scoreFinal à la fin

// On dispose un nombre de vies au joueur
var vies = 3;

// On définit un timer
var tempsRestant = 30; // 30sec par défaut
var gameOver = false; // false = partie en cours
var intervalId = null; // stocke l'identifiant du setInterval, sert à arrêter le timer proprement
var finParTemps = false; // indique cause de la fin, ici fin car timer écoulé

// Fonction qui permet d'afficher le score du joueur
var hudY = 30; // position verticale du texte en haut, 30 permets de descendre les éléments vers le bas