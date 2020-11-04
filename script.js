var gameArea = document.getElementById('gameArea');
var highScoresTable = document.getElementById('highscores');
var highScoresHeader = document.getElementById('highcoresHeader');
var playAgainBtn = document.getElementById('playAgainBtn');
var balloon = document.createElement("div");
var nickBox = document.getElementById("nickBox");
var pointsBox = document.getElementById("pointsBox");
var roundBox = document.getElementById("roundBox");
var hitBox = document.getElementById("hitBox");
var shootsFiredBox = document.getElementById("shootsFiredBox");
var accuracyBox = document.getElementById("accuracyBox");
var person;
var NUMBER_OF_ROUNDS = 30;

// highscore json blob: https://jsonblob.com/f6aa43a0-1d73-11eb-9ea8-bf5ea33a93e3"
var highScoreURL = "https://jsonblob.com/api/f6aa43a0-1d73-11eb-9ea8-bf5ea33a93e3";

// sounds
var shootAudio = new Audio('sounds/shoot-bow.mp3');
var balloonPopAudio = new Audio('sounds/balloon-pop.mp3');

// general configuration
balloon.className = "balloon";
gameArea.appendChild(balloon);


// variables
var roundTimer;
var roundCounter;
var hitsCounter;
var points;
var roundStartTime;

// functions
function reset() {
    roundCounter = 0;
    hitsCounter = 0;
    points = 0;
    pointsBox.innerText = points;
    shootsFiredBox.innerText = 0;
    hitBox.innerText = 0;
    accuracyBox.innerText = 0;
    roundBox.innerText = roundCounter;
    highScoresTable.style.visibility = "hidden";
    highScoresHeader.style.visibility = "hidden";
    balloon.style.visibility = "visible";
    gameArea.style.background = "white";
    playAgainBtn.style.visibility = "hidden";
    // game initialization
    gameArea.addEventListener("click", handleActionFunction);
    balloon.addEventListener("click", handleActionFunction);
    gameArea.style.cursor = "crosshair";

    initNick();
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function initNick() {
    do {
        person = prompt("Witaj w grze Balloons!\n\nPodaj Twój nick", person);
    } while (person == null || person.length == 0);

    nickBox.innerText = person;
}

function updateBalloon(balloon) {
    diameter = getRandomIntInclusive(30, 100 - roundCounter * 2);
    balloon.style.width = diameter + "px";
    balloon.style.height = diameter + "px";
    parentLeft = gameArea.getBoundingClientRect().left;
    parentTop = gameArea.getBoundingClientRect().top;
    offsetX = getRandomIntInclusive(parentLeft + diameter, gameArea.getBoundingClientRect().width - diameter - 50) + "px";
    offsetY = getRandomIntInclusive(parentTop + diameter + 40, gameArea.getBoundingClientRect().height - diameter - 50) + "px";
    balloon.style.left = offsetX;
    balloon.style.top = offsetY;
    balloon.style.background = "rgb(" + getRandomIntInclusive(50, 220) + "," + getRandomIntInclusive(50, 220) + "," + getRandomIntInclusive(50, 220) + ")";
}

var handleActionFunction = function (e) {
    shootsFiredBox.innerText++;
    let source = e.target || e.srcElement;
    e.stopPropagation();
    if (source == balloon) {
        hitBox.innerText++;
        gameArea.style.background = "#ff0000aa";
        setTimeout(function () {
            gameArea.style.background = "white";
            nextRound();
        }, 100);
        balloonPopAudio.play();
        hitsCounter++;
        points += 10*Math.round(2000/(Date.now()-roundStartTime));
        pointsBox.innerText = points;
        clearTimeout(roundTimer);
    } else {
        shootAudio.play();
        points -= 2;
    }
    if (shootsFiredBox.innerText > 0) {
        accuracyBox.innerText = parseFloat(hitBox.innerText / shootsFiredBox.innerText * 100).toFixed(2);
    }
}

function nextRound() {
    if (roundCounter >= NUMBER_OF_ROUNDS) {
        handleGameFinish();
    } else {
        roundCounter++;
        roundBox.innerText = roundCounter;

        updateBalloon(balloon);
        roundStartTime = Date.now();
        roundTimer = setTimeout(nextRound, 2000 - roundCounter * 10);
    }
}

function handleGameFinish() {
    clearTimeout(roundTimer);
    alert("Koniec gry!\nZdobyłeś " + pointsBox.innerText + " punktów.");

    highScoresTable.innerHTML = "";
    highScoresTable.style.visibility = "visible";
    highScoresHeader.style.visibility = "visible";
    balloon.style.visibility = "hidden";
    gameArea.style.background = "#aaaaaaaa";
    playAgainBtn.style.visibility = "visible";
    playAgainBtn.onclick = function () {
        reset();
        nextRound();
    }
    gameArea.removeEventListener("click", handleActionFunction);
    balloon.removeEventListener("click", handleActionFunction);
    gameArea.style.cursor = "auto";
    printAndUpdateHighscores();
}

function generateTable(table, data) {
    let rowIt = 1;
    for (let element of data) {
        let row = table.insertRow();
        let cell = row.insertCell();
        let text = document.createTextNode(rowIt + ". ");
        cell.appendChild(text);
        rowIt++;
        for (key in element) {
            let cell = row.insertCell();
            let text = document.createTextNode(element[key]);
            cell.appendChild(text);
        }
    }
}

function printAndUpdateHighscores() {
    fetch(highScoreURL)
        .then(res => res.json())
        .then((entries) => {
            let newEntry = {
                nick: person,
                score: points,
                date: new Date().toString()
            }
            entries.push(newEntry);
            entries.sort(function (a, b) {
                return a.score < b.score;
            });
            entries = entries.slice(0, 7);
            updateHighscores(entries);
            generateTable(highScoresTable, entries);
        })
        .catch(err => {
            console.error('Fetching error:', err);
        });
}

function updateHighscores(data) {
    fetch(highScoreURL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => {
            //console.log('Upload success:', data);
        })
        .catch((error) => {
            console.error('Upload error:', error);
        });
}


reset();
nextRound();