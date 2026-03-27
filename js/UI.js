// Fonction qui permet de changer le format du temps pour afficher "00:30" au lieu de juste "30"
function formatTemps(secondes) {
    let minutes = Math.floor(secondes / 60);
    let sec = secondes % 60;

    // ajoute un 0 devant si les minutes sont plus petites que 10
    minutes = minutes < 10 ? "0" + minutes : minutes;
    sec = sec < 10 ? "0" + sec : sec; // pareil pour els secondes

    return minutes + ":" + sec;
}

function defScore() {
    ctx.font = "32px 'Jersey 10'";
    ctx.fillStyle = gold;
    ctx.textBaseline = "middle";
    scoreAffiche = gameOver ? scoreFinal : score;
    ctx.fillText("Score: " + scoreAffiche, 8, hudY);
    ctx.textBaseline = "alphabetic";
}

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

function defTimer() {
    ctx.font = "32px 'Jersey 10'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    var x = canvaJeu.width / 2;
    var y = hudY;
    var urgent = tempsRestant <= 10 && tempsRestant > 0;

    ctx.fillStyle = urgent ? "#e53935" : gold;

    if (urgent) {
        if (sonUrgence.paused) {
            sonUrgence.play().catch(function () {});
        }
        ctx.save();
        ctx.translate(x, y);
        var pulse = 1 + 0.1 * Math.sin(Date.now() / 350);
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
