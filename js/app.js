/*----- constants -----*/

const battleshipPlayerColors = {
    "1": "var(--main-minus-one)",         // player1
    "-1": "var(--main-color)"             // player2
};
const boardColors = {
    "null": "var(--main-plus-one)",
    "-1": "var(--main-plus-two)",
    "1": "orange",
    "shipColor": "var(--main-minus-one)",
    shipFinder: function(cellValue) {
        if (typeof cellValue === "string") {
            return this.shipColor;
        } else {
            return this[cellValue];
        }
    }
};
boardLength = 10;
const alphabet = ["A","B","C","D","E","F","G","H","I","J"];
const inputRegEx = /([A-Ja-j][1][0]|[A-Ja-j][1-9])\b/;

/*----- app's state (variables) -----*/

let turnBs;
let winnerBs;
let playerOneShips;
let playerTwoShips;
let playerOneShipLayout;
let playerTwoShipLayout;
let engageAi;                 
let aiHits;
let playerTwoAiObj;

/*----- cached element references -----*/

const playerOneRadarDivEls = document.querySelectorAll("#playerOneRadar .battleship-panel");
const playerOneDisplayDivEls = document.querySelectorAll("#playerOneDisplay .battleship-panel");
const targetDisplayEl = document.querySelector(".battleship-target-display");
const targetInput = document.getElementById("battleship-target-input");
const targetInputLabel = document.querySelector("#battleship-input-form > label");
class Ship {
    constructor(type, identifier, length, hitSpaces) {
        this.type = type; 
        this.identifier = identifier;
        this.length = length; 
        this.hitSpaces = 0;
        this.alive = true;
        this.boardLocation = [];
    } 
    checkIfAlive() {
        if (this.hitSpaces === this.length) {
            this.alive = false; 
        }
    }
};
class aiShip extends Ship {
    constructor(type, identifier, length) {
        super(type, identifier, length);
        this.direction = null;
        this.positionKnown = false; 
        this.hitSpaces = 0; 
        this.alive = true; 
    }
    determineDirection() {
        console.log("direction");
    };
}

/*----- event listeners -----*/

targetDisplayEl.addEventListener("click", function(e) {
    e.preventDefault(); 
    const eventTarget = e.target.id;
    if (eventTarget === "battleship-render-button") initBs();
    if (eventTarget === "battleship-fire-button") {
        if (turnBs === 1 && inputRegEx.test(targetInput.value)) {
            const shot = targetInput.value; 
            targetInput.value = ""; 
            playerOneShot(translateShot(shot));
        } else {
            targetInputLabel.innerText = "Not a valid shot";
            targetInputLabel.style.display = "block";
        };
    };
});

/*----- functions -----*/

function initBs() {
    turnBs = 1; 
    playerOneRadarDivEls.forEach(div => div.innerText = "");
    playerOneDisplayDivEls.forEach(div => div.innerText = "");
    playerOneShipLayout = defineBoard(playerOneShipLayout);
    playerTwoShipLayout = defineBoard(playerTwoShipLayout);
    createShips();
    addShipsToBoard();
    updateShipObjects(1);
    updateShipObjects(-1);
    renderBs(playerOneShipLayout, playerTwoShipLayout);
    
}

function renderBs(playerOneShipLayout, playerTwoShipLayout) {
    matchArraysToDom(playerOneShipLayout);
    matchArraysToDom(playerTwoShipLayout);
    renderDestroyed(playerOneShips);
    renderDestroyed(playerTwoShips);
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
}

function generateBoardColors(shipLayout, rowIdx, colIdx) {
    // rowIdx and colIdx transposed on these two so that board matches array
    let shipLayoutPositionValue = shipLayout[rowIdx][colIdx];
    const divElColor = boardColors.shipFinder(shipLayoutPositionValue);
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
}

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
}

function parseShipHoriz(playerBoardToAddShip, startingColCoord, startingRowCoord, ship) {
    for (let i = 0; i < ship.length; i++) {
        playerBoardToAddShip[startingColCoord][startingRowCoord + i] = ship.identifier;
    }

};

function parseShipVert(playerBoardToAddShip, startingColCoord, startingRowCoord, ship) {
    for (let i = 0; i < ship.length; i++) {
        playerBoardToAddShip[startingColCoord + i][startingRowCoord] = ship.identifier;
    }
};

// update the data in each player's ship objects, according to ship placements
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

// change destroyed ship colors to red
function renderDestroyed(playerXShips) {
    playerXShips.forEach(function(ship) {
        if (ship.alive === false) {
            ship.boardLocation.forEach(function(location) {
                let divEl; 
                if (playerXShips === playerOneShips) {
                    divEl = document.getElementById(`X${location.col}Y${location.row}`);
                } else if (playerXShips === playerTwoShips) {
                    divEl = document.getElementById(`x${location.col}y${location.row}`);
                };
                divEl.style.backgroundColor = "red";
                divEl.innerText = ship.identifier; 
            });
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
    if (shotPlacement === null) playerTwoShipLayout[shotArr[0]][shotArr[1]] = -1;
    if (shotPlacement === 1 || shotPlacement === -1) {
        turnBs = 1;
        targetInputLabel.style.display = "block";
        targetInputLabel.innerText = "You've already taken that shot!";
    } else {
        targetInputLabel.style.display = "none";
        turnBs *= -1;
        renderBs(playerOneShipLayout, playerTwoShipLayout);
        playerTwoShot(); 
    };
};

// update ship data if ship is hit
function registerHit(player, shotArr) {
    let shipsToUpdate;
    if (player === 1) shipsToUpdate = playerTwoShips;
    if (player === -1) shipsToUpdate = playerOneShips;
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

// playerTwo random shot (if AI is not engaged)
function playerTwoShot() {
    const rowIdx = randomNumber(9);
    const colIdx = randomNumber(9);
    const shotArr = [rowIdx, colIdx];
    let shotPlacement = playerOneShipLayout[shotArr[0]][shotArr[1]];
    if (typeof shotPlacement === "string") {
        registerHit(-1, shotArr);
        playerOneShipLayout[shotArr[0]][shotArr[1]] = 1;
    };
    if (shotPlacement === null) playerOneShipLayout[shotArr[0]][shotArr[1]] = -1;
    if (shotPlacement === 1 || shotPlacement === -1) {
        turnBs = -1; 
        playerTwoShot(); 
    } else {
        turnBs *= -1;
        renderBs(playerOneShipLayout, playerTwoShipLayout);
    };
};