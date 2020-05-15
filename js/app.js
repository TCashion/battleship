/*----- constants -----*/

const battleshipPlayerColors = {
    "1": "var(--main-minus-one)",         
    "-1": "var(--main-color)"             
};
const boardColors = {
    "null": "var(--main-plus-one)",
    "-1": "var(--main-plus-two)",
    "1": "orange",
    "shipColor": "var(--main-minus-one)",
    renderShipColors: function(cellValue) {
        if (typeof cellValue === "string") {
            return this.shipColor;
        } else {
            return this[cellValue];
        }
    }
};
const alphabet = ["A","B","C","D","E","F","G","H","I","J"];
const inputRegEx = /(^[A-Ja-j][1][0]$|^[A-Ja-j][1-9]$)\b/;
boardLength = 10;

/*----- app's state (variables) -----*/

let turnBs;
let winnerBs;
let playerOneShips;
let playerTwoShips;
let playerOneShipLayout;
let playerTwoShipLayout;
let engageAi;                 
let playerTwoAiObj;
let sounds; 
let player; 
let loopPlayer;

/*----- cached element references -----*/

const battleshipGameboard = document.querySelector("#battleship-board");
const playerOneRadarDivEls = document.querySelectorAll("#player-one-radar .battleship-panel");
const playerOneDisplayDivEls = document.querySelectorAll("#player-one-display .battleship-panel");
const targetDisplayEl = document.querySelector(".battleship-target-display");
const targetInputEl = document.getElementById("battleship-target-input");
const targetInputLabelEls = document.querySelector("#battleship-input-form > label");
const statusIndicatorEls = document.querySelectorAll(".ship-status-indicator"); 
const onToggle = document.getElementById("audio-on");
const offToggle = document.getElementById("audio-off");
class Sound {
    constructor (title, path, volume) {
        this.title = title;
        this.path = path;
        this.volume = volume;
    }
};
class Ship {
    constructor(type, identifier, length) {
        this.type = type; 
        this.identifier = identifier;
        this.length = length; 
        this.hitSpaces = 0;
        this.alive = true;
        this.boardLocation = [];
        this.playDestroyedSound = false; 
    } 
    checkIfAlive() {
        if (this.hitSpaces === this.length) this.alive = false; 
    }
};
class aiShip extends Ship {
    constructor(type, identifier, length) {
        super(type, identifier, length);
        this.direction = null;
        this.positionKnown = false; 
        this.hitSpaces = 0; 
        this.alive = true; 
        this.boardLocation = [];
        this.knownHits = []; 
        this.knownMisses = []; 
    }
    determineDirection() {
        if (this.knownHits[0].row === this.knownHits[1].row) {
            this.direction = "horizontal";
        };
        if (this.knownHits[0].col === this.knownHits[1].col) {
            this.direction = "vertical";
        };
        
    };
    determineNextShot() {
        let shotArr; 
        if (this.boardLocation.length === 0) {
            // case: after first hit: keep tying until 2nd hit. 
            if (this.knownHits[0].row === 0) {
                this.knownMisses.push("top row");
                this.findRestOfShip(); 
                shotArr = [this.knownHits[0].row, this.knownHits[0].col + 1];
                return shotArr;
            } else if (this.knownHits[0].col === 9) {  
                this.knownMisses.push("top row"); 
                this.findRestOfShip(); 
                shotArr = [this.knownHits[0].row + 1, this.knownHits[0].col]; 
                return shotArr; 
            } else if (typeof playerOneShipLayout[this.knownHits[0].row - 1][this.knownHits[0].col] !== "number" && this.knownHits[0].row !== 0) {
                shotArr = [this.knownHits[0].row - 1, this.knownHits[0].col];
                return shotArr; 
            } else if (typeof playerOneShipLayout[this.knownHits[0].row][this.knownHits[0].col + 1] !== "number") {
                shotArr = [this.knownHits[0].row, this.knownHits[0].col + 1];
                return shotArr; 
            } else if (typeof playerOneShipLayout[this.knownHits[0].row + 1][this.knownHits[0].col] !== "number") {
                shotArr = [this.knownHits[0].row + 1, this.knownHits[0].col];
                return shotArr; 
            } else if (typeof playerOneShipLayout[this.knownHits[0].row][this.knownHits[0].col - 1] !== "number") {
                shotArr = [this.knownHits[0].row, this.knownHits[0].col - 1];
                return shotArr; 
            };
        } else if (this.boardLocation.length > 0) {
            // return the first board location value that is false, and that is the shotArr
            const rowIdx = this.boardLocation.find(function(coordinate) {return coordinate.hit === false;}).row;
            const colIdx = this.boardLocation.find(function(coordinate) {return coordinate.hit === false;}).col;
            shotArr = [rowIdx, colIdx];
        }
        return shotArr; 
    };
    findRestOfShip() { 
        const currentShip = this; 
        if ((currentShip.knownHits.length + currentShip.knownMisses.length) >= 2) {
            currentShip.boardLocation = (playerOneShips.find(function(ship) {
                return (ship.identifier === currentShip.identifier); 
            })).boardLocation;
        };
    };
};

/*----- event listeners -----*/

battleshipGameboard.addEventListener("click", function(e) {
    const eventTarget = e.target;
    if (eventTarget.id === "battleship-render-button") {
        e.preventDefault(); 
        initBs();
    };
    if (eventTarget.id === "battleship-fire-button") {
        e.preventDefault(); 
        if (turnBs === 1 && inputRegEx.test(targetInputEl.value)) {
            const shot = targetInputEl.value; 
            targetInputEl.value = ""; 
            playerOneShot(translateShot(shot));
        } else if (!turnBs) {
            targetInputLabelEls.innerText = "Press the 'Reset' button to start the game!";
            targetInputLabelEls.style.display = "block";
        } else {
            targetInputLabelEls.innerText = "Not a valid shot";
            targetInputLabelEls.style.display = "block";
        };
    };
    if (eventTarget.classList.contains("audio-toggle-radio")) {
        handleRadioToggle();
    };
    if (Array.from(playerOneRadarDivEls).includes(eventTarget) && turnBs === 1) {
        const cellId = eventTarget.id.split("");
        const rowIdx = parseInt(cellId[3]);
        const colIdx = parseInt(cellId[1]);
        const shotArr = [rowIdx, colIdx];
        playerOneShot(shotArr);
    };
});

/*----- functions -----*/

function initBs() {
    turnBs = 1; 
    winnerBs = null; 
    engageAi = false; 
    // manage initial sounds
    createSounds(); 
    if (loopPlayer) loopPlayer.pause(); 
    if (playerOneShipLayout === undefined) playSound("radar"); 
    playLoopTrack(); 
    // create ships & layout
    playerOneRadarDivEls.forEach(div => div.innerText = "");
    playerOneDisplayDivEls.forEach(div => div.innerText = "");
    playerOneShipLayout = defineBoard(playerOneShipLayout);
    playerTwoShipLayout = defineBoard(playerTwoShipLayout);
    createShips();
    addShipsToBoard();
    updateShipObjects(1);
    updateShipObjects(-1);
    resetAnimationClasses(playerOneRadarDivEls);
    resetAnimationClasses(playerOneDisplayDivEls);
    renderBs(playerOneShipLayout, playerTwoShipLayout);
};

function renderBs(playerOneShipLayout, playerTwoShipLayout) {
    targetInputLabelEls.style.display = "none";
    matchArraysToDom(playerOneShipLayout);
    matchArraysToDom(playerTwoShipLayout);
    renderDestroyed(playerOneShips);
    renderDestroyed(playerTwoShips);
    checkWinnerBs(); 
    renderShipStatus();
    renderSounds();
};

function defineBoard(playerXShipLayout) {
    playerXShipLayout = [
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null]
    ];
    return playerXShipLayout;
};

// iterates through each cell in the DOM and renders the colors of the board based on current data
function matchArraysToDom(shipLayout) {
    for (let r = 0; r < shipLayout.length; r++) {
        const rowIdx = r; 
        for (let c = 0; c < shipLayout[r].length; c++) {
            const colIdx = c; 
            generateBoardColors(shipLayout, rowIdx, colIdx);
        };
    };
};

function generateBoardColors(shipLayout, rowIdx, colIdx) {
    // rowIdx and colIdx transposed on this step so that board matches array layout exactly 
    let shipLayoutPositionValue = shipLayout[rowIdx][colIdx];
    const divElColor = boardColors.renderShipColors(shipLayoutPositionValue);
    const radarDivEl = document.getElementById(`x${colIdx}y${rowIdx}`); 
    const displayDivEl = document.getElementById(`X${colIdx}Y${rowIdx}`);
    if (shipLayout === playerOneShipLayout) {
        displayDivEl.setAttribute("style", `background-color: ${divElColor}`); 
    };
    if (shipLayout === playerTwoShipLayout) {
        // hides enemy ship colors from player one
        if (typeof shipLayoutPositionValue === "string") {
            radarDivEl.setAttribute("style", `background-color: ${boardColors["null"]}`); 
        } else {
            radarDivEl.setAttribute("style", `background-color: ${divElColor}`); 
        };
    };  
};

// manage animations during gameplay
function animateElement(elementToAnimate, hitStatus) {
    if (hitStatus === "hit") {
        elementToAnimate.classList.add("fade-to-orange");
    } else if (hitStatus === "miss") {
        elementToAnimate.classList.add("fade-to-miss");
    } else if (hitStatus === "destroyed") {
        elementToAnimate.classList.add("fade-to-red");
    };
};

// on initBs() invocation, remove all animation classes to avoid conflicts
function resetAnimationClasses(monitorDivEls) {
    monitorDivEls.forEach(function(el) {
            el.classList.remove("fade-to-orange");
            el.classList.remove("fade-to-red");
            el.classList.remove("fade-to-water");
            el.classList.remove("fade-to-ship");
            el.classList.remove("fade-to-miss");
    });
};

// creates each player's ship data objects
function createShips() {
    playerOneShips = [];
    playerTwoShips= [];
    playerTwoAiObj = [];
    const carrier = new Ship("carrier", "A", 5);
    const battleship = new Ship("battleship", "B", 4);
    const cruiser = new Ship("cruiser", "C", 3);
    const submarine = new Ship("submarine", "S", 3);
    const destroyer = new Ship("destroyer", "D", 2);
    const carrierTwo = new Ship("carrier", "A", 5);
    const battleshipTwo = new Ship("battleship", "B", 4);
    const cruiserTwo = new Ship("cruiser", "C", 3);
    const submarineTwo = new Ship("submarine", "S", 3);
    const destroyerTwo = new Ship("destroyer", "D", 2);
    const carrierAi = new aiShip("carrier", "A", 5);
    const battleshipAi = new aiShip("battleship", "B", 4);
    const cruiserAi = new aiShip("cruiser", "C", 3);
    const submarineAi = new aiShip("submarine", "S", 3);
    const destroyerAi = new aiShip("destroyer", "D", 2);
    playerOneShips.push(carrier, battleship, cruiser, submarine, destroyer);
    playerTwoShips.push(carrierTwo, battleshipTwo, cruiserTwo, submarineTwo, destroyerTwo);
    playerTwoAiObj.push(carrierAi, battleshipAi, cruiserAi, submarineAi, destroyerAi);
};

// adds ships to player board data objects
function addShipsToBoard() {     
    do {
        if (shipCountVerifier(playerOneShipLayout) === 0) {
            playerOneShips.forEach((ship) => layoutShip(1, ship));
            playerTwoShips.forEach((ship) => layoutShip(-1, ship));
        } else {
            playerOneShipLayout = defineBoard(playerOneShipLayout);
            playerTwoShipLayout = defineBoard(playerTwoShipLayout);
            playerOneShips.forEach((ship) => layoutShip(1, ship));
            playerTwoShips.forEach((ship) => layoutShip(-1, ship));
        }
    } while (shipCountVerifier(playerOneShipLayout) < 17 || shipCountVerifier(playerTwoShipLayout) < 17);
};

// ensures that ships do not overlap on board
function shipCountVerifier(playerXShipLayout) {
    let shipCounter = 0;  
    playerXShipLayout.forEach(function(row) {
        row.forEach(function(cellValue) {
            if (typeof cellValue === "string") {
                shipCounter += 1;
            }; 
        });
    });
    return shipCounter;
};

// randomly lays ships out on board 
function layoutShip(player, ship) {
    const direction = randomNumber(1);
    let playerBoardToAddShip;
    if (player === 1) playerBoardToAddShip = playerOneShipLayout;
    if (player === -1) playerBoardToAddShip = playerTwoShipLayout;
    if (direction === 1) {
        let startingColCoord = randomNumber(boardLength - 1);
        let startingRowCoord = randomNumber(boardLength - ship.length - 1);
        parseShipHoriz(playerBoardToAddShip, startingColCoord, startingRowCoord, ship);
    };
    if (direction === 0) {
        let startingColCoord = randomNumber(boardLength - ship.length - 1);
        let startingRowCoord = randomNumber(boardLength - 1);
        parseShipVert(playerBoardToAddShip, startingColCoord, startingRowCoord, ship);
    };
}

function randomNumber (max) {
    return Math.round(Math.random()*Math.floor(max));
};

function parseShipHoriz(playerBoardToAddShip, startingColCoord, startingRowCoord, ship) {
    for (let i = 0; i < ship.length; i++) {
        playerBoardToAddShip[startingColCoord][startingRowCoord + i] = ship.identifier;
    };
};

function parseShipVert(playerBoardToAddShip, startingColCoord, startingRowCoord, ship) {
    for (let i = 0; i < ship.length; i++) {
        playerBoardToAddShip[startingColCoord + i][startingRowCoord] = ship.identifier;
    };
};

// create sound objects
function createSounds() {
    sounds = []; 
    const soundOne = new Sound("radar", "./audio/radar-edited.mp3", 0.4)
    const soundTwo = new Sound("playerOneShotTypeOne", "./audio/live-shot(edited).mp3", 0.2)
    const soundThree = new Sound("backgroundTrack", "./audio/navy-battleship-soundscape.flac", 0.08)
    const soundFour = new Sound("distantExplosion", "./audio/distant-explosion.wav", 0.5)
    const soundFive = new Sound("shipSinking", "./audio/ship-sinking.mp3", 0.3)
    const soundSix = new Sound("targetAcquired", "./audio/target-acquired.wav", 0.15)
    sounds.push(soundOne, soundTwo, soundThree, soundFour, soundFive, soundSix);
};

// render sounds
function renderSounds() {
    if (checkSoundInterval(15)) playSound("distantExplosion");
    if (checkSoundInterval(20)) playSound("playerOneShotTypeOne");
};

// handle audio (non-loops)
function playSound(soundTitle) {
    player = new Audio(); 
    let selectedSound;
    sounds.forEach(function(sound) {
        if (sound.title === soundTitle) selectedSound = sound;
    });
    player.src = selectedSound.path;
    player.volume = selectedSound.volume;
    if (onToggle.checked) player.play();
};

// handle audio background loop 
function playLoopTrack() {
    loopPlayer = new Audio();
    let selectedSound;
    sounds.forEach(function(sound) {
        if (sound.title === "backgroundTrack") selectedSound = sound;
    });
    loopPlayer.src = selectedSound.path;
    loopPlayer.volume = selectedSound.volume;
    loopPlayer.loop = true; 
    if (onToggle.checked) loopPlayer.play();
}

// determine intervals for specific sounds
function checkSoundInterval(divisor) {
    let counter = 1; 
    playerOneShipLayout.forEach(function(row) {
        row.forEach(function(cell) {
            if (cell === 1 || cell === -1){
                counter += 1;
            };
        });
    });
    if (counter % divisor === 0 && turnBs === 1) {
        return true; 
    };
};

// handle audio control toggle
function handleRadioToggle() {
    if(onToggle.checked) {
        loopPlayer.muted = false;
        player.muted = false; 
    } else if (offToggle.checked) {
        loopPlayer.muted = true;
        player.muted = true; 
    };
};

// update player One's ship status bar
function renderShipStatus() {
    statusIndicatorEls.forEach(function(el) {
        el.setAttribute("style", "background-color: var(--main-plus-two)")
    });
    playerOneShips.forEach(function(ship) {
        if (ship.type === "carrier") updateStatusIndicator(ship, 0);
        if (ship.type === "battleship") updateStatusIndicator(ship, 5);
        if (ship.type === "cruiser") updateStatusIndicator(ship, 9);
        if (ship.type === "submarine") updateStatusIndicator(ship, 12);
        if (ship.type === "destroyer") updateStatusIndicator(ship, 15);
    });
};

function updateStatusIndicator(ship, indicatorIdx) {
    for (let i = indicatorIdx; i < indicatorIdx + ship.hitSpaces; i++) {
        statusIndicatorEls[i].style.backgroundColor = "red";
    }; 
};

// at game start, update the data in each player's ship objects, according to random ship placements
function updateShipObjects(player) {
    let shipArrayToUpdate;
    let shipLayoutToScan; 
    if (player === 1) {
        shipArrayToUpdate = playerOneShips;
        shipLayoutToScan = playerOneShipLayout;
    } else {
        shipArrayToUpdate = playerTwoShips;
        shipLayoutToScan = playerTwoShipLayout;
    };
    shipArrayToUpdate.forEach(function(ship) {
        shipLayoutToScan.forEach(function(row) {
            for (let col = 0; col < row.length; col++) {
                if (row[col] === ship.identifier) {
                    const rowIdx = shipLayoutToScan.indexOf(row);
                    const colIdx = col; 
                    const coordObj = {
                        row: rowIdx,
                        col: colIdx,
                        hit: false
                    };
                    ship.boardLocation.push(coordObj);
                };
            };
        });
    });
};

// check for a winner, each round
function checkWinnerBs() {
    if(!playerOneShips.find(function(ship) {return ship.alive === true;})) {
        winnerBs = -1;
        turnBs = null; 
    } else if (!playerTwoShips.find(function(ship) {return ship.alive === true;})) {
        winnerBs = 1;
        turnBs = null; 
    };
    if (winnerBs) renderWinner(winnerBs);
};

// update DOM to show winner
function renderWinner (winnerBs) {
    let winnerId;
    if (winnerBs === 1) winnerId = "1";
    if (winnerBs === -1) winnerId = "2";
    let bannerRowPositions = [14, 24, 34, 44, 54, 64, 74, 84, 35, 45, 55, 65];
    let banner = ["P", "L", "A", "Y", "E", "R", " ", winnerId, "W", "I", "N", "S"];
    bannerRowPositions.forEach(function(position, idx) {
        playerOneDisplayDivEls[position].setAttribute("style", "color: black; background-color: var(--main-minus-two)");
        playerOneRadarDivEls[position].setAttribute("style", "color: black; background-color: var(--main-minus-two)");
        playerOneDisplayDivEls[position].innerText = banner[idx];
        playerOneRadarDivEls[position].innerText = banner[idx];
    });
};

// change destroyed ship colors to red
function renderDestroyed(playerXShips) {
    playerXShips.forEach(function(ship) {
        if (ship.alive === false) {
            ship.boardLocation.forEach(function(location) {
                let elementToAnimate; 
                if (playerXShips === playerOneShips) {
                    elementToAnimate = document.getElementById(`X${location.col}Y${location.row}`);
                } else if (playerXShips === playerTwoShips) {
                    elementToAnimate = document.getElementById(`x${location.col}y${location.row}`);
                };
                animateElement(elementToAnimate, "destroyed");
                elementToAnimate.style.backgroundColor = "red";
                elementToAnimate.innerText = ship.identifier; 
            });
            if (playerXShips === playerOneShips && ship.playDestroyedSound === false) {
                playSound("shipSinking");
                ship.playDestroyedSound = true; 
            };
            if (playerXShips === playerTwoShips && ship.playDestroyedSound === false) {
                playSound("targetAcquired");
                ship.playDestroyedSound = true; 
            };
        };
    });
};

// translate shot from user input into data coordinates
function translateShot(shot) {
    let shotArr = shot.split("");
    const shotRowIdx = alphabet.indexOf(shotArr[0].toUpperCase()); 
    let shotColIdx;
    if (shotArr.length === 3) {
        const numberArr = [shotArr[1],shotArr[2]];
        shotColIdx = parseInt(numberArr.join("")) - 1;
    } else {
        shotColIdx = parseInt(shotArr[1]) - 1;
    };
    shotArr = [shotRowIdx, shotColIdx];
    return shotArr; 
};  

// handle player one shot submission
function playerOneShot(shotArr) {
    let shotPlacement = playerTwoShipLayout[shotArr[0]][shotArr[1]];
    if (typeof shotPlacement === "string") {
        registerHit(1, shotArr);
        playerTwoShipLayout[shotArr[0]][shotArr[1]] = 1;
    };
    if (shotPlacement === null) {
        playerTwoShipLayout[shotArr[0]][shotArr[1]] = -1;
        const elementToAnimate = document.getElementById(`x${shotArr[1]}y${shotArr[0]}`);
        animateElement(elementToAnimate, "miss");
    };
    if (shotPlacement === 1 || shotPlacement === -1) {
        turnBs = 1;
        targetInputLabelEls.style.display = "block";
        targetInputLabelEls.innerText = "You've already taken that shot!";
    } else {
        targetInputLabelEls.style.display = "none";
        turnBs *= -1;
        renderBs(playerOneShipLayout, playerTwoShipLayout);
        setTimeout(playerTwoShot, 250);
    };
};

// update ship data if ship is hit
function registerHit(player, shotArr) {
    let shipsToUpdate;
    if (player === 1) {
        shipsToUpdate = playerTwoShips;
        const elementToAnimate = document.getElementById(`x${shotArr[1]}y${shotArr[0]}`);
        animateElement(elementToAnimate, "hit");
    };
    if (player === -1) {
        shipsToUpdate = playerOneShips;
        updatePlayerTwoIntel(1, shotArr); 
        const elementToAnimate = document.getElementById(`X${shotArr[1]}Y${shotArr[0]}`);
        animateElement(elementToAnimate, "hit");
    };
    shipsToUpdate.forEach(function(ship) {
        ship.boardLocation.forEach(function(location) {
            if (location.row === shotArr[0] && location.col === shotArr[1]) {
                location.row = shotArr[0];
                location.col = shotArr[1];
                location.hit = true; 
                ship.hitSpaces += 1;
                ship.checkIfAlive(); 
            };
        });
    });
};

// updates playerTwo AI object
function updatePlayerTwoIntel(hitOrMiss, shotArr) {
    let hitShipIdentifier = playerOneShipLayout[shotArr[0]][shotArr[1]]; 
    if (hitOrMiss === 1) {
        playerTwoAiObj.forEach(function(ship) {
            if (ship.identifier === hitShipIdentifier) {
                ship.hitSpaces += 1;
                ship.positionKnown = true; 
                const newCoord = {
                    row: shotArr[0],
                    col: shotArr[1]
                };
                ship.knownHits.push(newCoord);
            };
            ship.findRestOfShip(); 
            ship.checkIfAlive(); 
        });
    };
};

// handle shot based on AI status 
function playerTwoShot() {
    engageAi = false; 
    let targetShip = null; 
    playerTwoAiObj.find(function(ship) {
        if (ship.positionKnown === true && ship.alive === true) {
            engageAi = true; 
            targetShip = ship; 
            return targetShip;
        }; 
    });
    if (engageAi === false) {
        playerTwoRandomShot();
    } else if (engageAi === true) {
        playerTwoAiShot(targetShip);
    }; 
    // regardless of shot type, update AI object: 
    playerTwoAiObj.forEach(function(ship) {
        if (ship.knownHits.length > 1) ship.determineDirection(); 
    }); 
};

// shot at same ship until it sinks
function playerTwoAiShot(targetShip) {
    const shotArr = targetShip.determineNextShot(); 
    playerTwoSpecificShot(shotArr, targetShip);
};

// playerTwo random shot (if AI is not engaged)
function playerTwoRandomShot() {
    const rowIdx = randomNumber(9);
    const colIdx = randomNumber(9);
    const shotArr = [rowIdx, colIdx];
    let shotPlacement = playerOneShipLayout[shotArr[0]][shotArr[1]];
    if (typeof shotPlacement === "string") {
        registerHit(-1, shotArr);
        playerOneShipLayout[shotArr[0]][shotArr[1]] = 1;
    };
    if (shotPlacement === null) {
        playerOneShipLayout[shotArr[0]][shotArr[1]] = -1;
        const elementToAnimate = document.getElementById(`X${shotArr[1]}Y${shotArr[0]}`);
        animateElement(elementToAnimate, "miss");
    };
    if (shotPlacement === 1 || shotPlacement === -1) {
        turnBs = -1; 
        playerTwoRandomShot(); 
    } else {
        turnBs *= -1;
        renderBs(playerOneShipLayout, playerTwoShipLayout);
    };
};

function playerTwoSpecificShot(shotArr, targetShip) {
    let shotPlacement = playerOneShipLayout[shotArr[0]][shotArr[1]];
    if (typeof shotPlacement === "string") {
        registerHit(-1, shotArr);
        if (shotPlacement !== targetShip.identifier) addKnownMiss(shotArr, targetShip);
        playerOneShipLayout[shotArr[0]][shotArr[1]] = 1;
        turnBs *= -1;
    } else if (shotPlacement === null) {
        playerOneShipLayout[shotArr[0]][shotArr[1]] = -1;
        addKnownMiss(shotArr, targetShip);
        const elementToAnimate = document.getElementById(`X${shotArr[1]}Y${shotArr[0]}`);
        animateElement(elementToAnimate, "miss");
        turnBs *= -1;
    } else {
        turnBs *= -1; 
    }; 
    renderBs(playerOneShipLayout, playerTwoShipLayout);
};

function addKnownMiss(shotArr, targetShip) {
    const newCoord = {
        row: shotArr[0],
        col: shotArr[1]
    };
    targetShip.knownMisses.push(newCoord);
}; 
