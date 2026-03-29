// Fonction qui permet de changer le format du temps pour afficher "00:30" au lieu de juste "30"
function formatTemps(secondes) {
    let minutes = Math.floor(secondes / 60);
    let sec = secondes % 60;

    // ajoute un 0 devant si les minutes sont plus petites que 10
    minutes = minutes < 10 ? "0" + minutes : minutes;
    sec = sec < 10 ? "0" + sec : sec; // pareil pour els secondes

    return minutes + ":" + sec;
}

// Affiche le score en haut à gauche avec une jolie police que j'ai choisi et une couleur importée en variables :)
function defScore() {
    ctx.font = "32px 'Jersey 10'";
    ctx.fillStyle = gold;
    ctx.textBaseline = "middle";
    scoreAffiche = gameOver ? scoreFinal : score;
    ctx.fillText("Score : " + scoreAffiche, 8, hudY);
    ctx.textBaseline = "alphabetic";
}

// Affiche les coeurs de vie, pleins ou vides selon le nombres de vies restants 
// (si le joueur perds une vie alors de gauche à droite on affiche les coeurs vide)
function defVies() {
    var taille = 30; // taille des coeurs
    var espacement = 10;

    for (var i = 0; i < 3; i++) { // max 3 vies
        var x = canvaJeu.width - (i + 1) * (taille + espacement);
        var y = hudY - taille / 2; // aligne verticalement avec score/timer

        if (i < vies) {
            ctx.drawImage(coeurPlein, x, y, taille, taille);
        } else {
            ctx.drawImage(coeurVide, x, y, taille, taille);
        }
    }
}

// Affiche le timer au milieu avec le même style que le score :) 
function defTimer() {
    ctx.font = "32px 'Jersey 10'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    var x = canvaJeu.width / 2;
    var y = hudY;
    var urgent = !gameOver && tempsRestant <= 10 && tempsRestant > 0; // urgent se déclenche quand il reste moins de 10s

    ctx.fillStyle = urgent ? "#e53935" : gold; // le texte devient rouge quand il ne reste que 10s

    if (urgent) {
        if (sonUrgence.paused) {
            sonUrgence.play().catch(function () { }); // quand il reste 10s --> son de timer
        }
        ctx.save();
        ctx.translate(x, y);
        var pulse = 1 + 0.1 * Math.sin(Date.now() / 350); // animation de pulsion pour le texte quand il reste 10s
        ctx.scale(pulse, pulse);
        ctx.fillText(formatTemps(tempsRestant), 0, 0);
        ctx.restore();
    } else {
        sonUrgence.pause();
        sonUrgence.currentTime = 0;
        ctx.fillText(formatTemps(tempsRestant), x, y);
    }

    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
}
