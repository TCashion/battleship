# Battleship

My version of Battleship is a web-based version of the popular children's board game. In this web-based game, play against your computer to try to find and sink your opponents' ships before the computer sinks all of yours! 

## Getting Started

Open up the game in your browser, click the "Reset" button, enter your first shot coordinates into the target panel, and fire away! 

## Technologies Used 

* HTML
* CSS
* JS (vanilla)

## Sound Clips

* Cannon fire: https://freesound.org/people/kingngnicoli/sounds/274826/
     * (edited for length before implementation)
* Distant explosion (for player One hits): https://freesound.org/people/SoundFX.studio/sounds/456272/
* Distant explosion option 2: https://freesound.org/people/Mr_KeybOred/sounds/372086/ 
     * potentially good for p2 cannon
* Near explosion (for player Two hits): 
     * metallic clank: https://freesound.org/people/Jadester64/sounds/370739/
     * explosion: https://freesound.org/people/OGsoundFX/sounds/423118/
* Naval battle sounds: https://freesound.org/people/qubodup/sounds/162365/
* Radar sweep: https://freesound.org/people/MATTIX/sounds/449671/ 
* Underwater explosion: https://freesound.org/people/VitaWrap/sounds/434545/ 
* Submarine dive siren: https://freesound.org/people/kallesv/sounds/460161/ 
* Warship cannon fire: https://freesound.org/people/morganpurkis/sounds/399853/ 
* Water splash: https://freesound.org/people/soundmary/sounds/196676/ 
* Water splash option 2: https://freesound.org/people/genel/sounds/482953/
* Water splash option 3: https://freesound.org/people/qubodup/sounds/212143/

## Next Steps

* give player One the option to set their own board locations 
* develop different levels of AI
     * allow the player to select difficulty 


Wireframe:

![Battleship Wireframe](https://imgur.com/dswIWhb.jpg)
            
``` 
Psuedocode:



     PROGRAM Battleship

          /*----- constants -----*/

               playerColors = {playerOne: 1, playerTwo: 2};
               hitMissColors = {null: blue, miss: white, hit: orange, ship: gray}
               boardSize = 10x10                  // can adjust this for smaller board size during development
               boardLength = 10                   //                  ""

          /*----- app's state (variables) -----*/

               turn
               winner
               playerOneShips
               playerTwoShips
               playerOneBoard
               playerOneRadar
               playerTwoBoard
               playerTwoRadar
               engageAi                 // for AI. Opens AI "session" if hit is      detected, and runs a different alogorithm for playerTwo's shots until the hit ship sinks. starts at 0, goes to 1 until ship is sunk

               aiHits
               shipIdentified


          /*----- cached element references -----*/

               playerOneRadar (Divs) 
               playerOneBoard (Divs)

          /*----- event listeners -----*/

               Event listener on target form (see wireframe)
                    ACTIVATE on submit
                         IF coordinate provided:
                              ARE valid x,y coordinates 
                                   must be between 0 and boardLength
                              ARE not already marked as hit or miss (1 or -1)
                         THEN takeShot(1, x, y)        // 1 for playerOne
          
          /*----- functions -----*/

               MODULE init()
                    turn = 1; 
                    winner = null 
                    playerOneBoard = function generateBoard()
                    playerTwoBoard = function generateBoard()
                    playerOneRadar = array of boardSize, all values null
                    playerTwoRadar = array of boardSize, all values null
                    playerOneCapturedShips = []
                    playerTwoCapturedShips = []
                    engageAi = 0
                    aiHits = {}; 
                    shipIdentified = false
                    playerOneShips = function generateShips()
                    playerTwoShips = function generateShips()
               END MODULE 


               MODULE render()
                    IF board position = null
                         DIV COLOR is hitMissColors(null)
                    IF board poistion = -1
                         DIV COLOR is hitMissColors(miss)
                    IF board poistion = 1
                         DIV COLOR is hitMissColors(hit)
                    IF board position = 0
                         DIV COLOR is hitMissColors(ship)
               END MODULE 


               MODULE generateBoard()
                    create random layout of board
                         null = blank spot
                         0 = ship present
                    **OR**
                         to save development time, I could start with set board layouts rather than randomly generated ones; 
               END MODULE 


               MODULE generateShips()
                    [
                         {type: carrier, 
                         length: 5, 
                         unhitSpaces: this.length, 
                         hitSpaces: 0,
                         alive: true,
                         locationCoordinates: [
                              (x0,y0),
                              (x1,y1),
                              (x2,y2),
                              (x3,y3),
                              (x4,y4)
                         ]},
                         {type: battleship, 
                         length: 4, 
                         unhitSpaces: this.length, 
                         hitSpaces: 0,
                         alive: true,
                         locationCoordinates: [
                              (x0,y0),
                              (x1,y1),
                              (x2,y2),
                              (x3,y3)
                         ]},
                         {type: cruiser, 
                         length: 3, 
                         unhitSpaces: this.length, 
                         hitSpaces: 0,
                         alive: true,
                         locationCoordinates: [
                              (x0,y0),
                              (x1,y1),
                              (x2,y2)
                         ]},
                         {type: submarine, 
                         length: 3, 
                         unhitSpaces: this.length, 
                         hitSpaces: 0,
                         alive: true,
                         locationCoordinates: [
                              (x0,y0),
                              (x1,y1),
                              (x2,y2)
                         ]},
                         {type: destroyer, 
                         length: 2, 
                         unhitSpaces: this.length, 
                         hitSpaces: 0,
                         alive: true,
                         locationCoordinates: [
                              (x0,y0),
                              (x1,y1)
                         ]},
                    ]
               END MODULE


               MODULE randomShipPlacement()
                    for each ship, generate random number 0 or 1     
                         this will determine whether ship will be vertical or horizontal 
                    generate two more random numbers, one for the row coordinate and the column coordinate of the starting position
                    IF the first number is 0, start parsing the ship from left to right
                    IF the first number is 1, start parsing the ship from top to bottom
                    While parsing the ship, check if any of the slots are already occupied (containe string identifier or 1, depending on development strategy TBD)
                    If there's a conflict, try again
                    Run the above until all ships are placed 
               END MODULE


               MODULE randomShot() // generates random shot for playerTwo
                    IF engageAi = 1                    // meaning last shot was a hit
                         RUN opponentAi(aiHits[x], aiHits[y])
                    ASSIGN x coordinate
                         x = randomNum(0,boardLength)
                    ASSIGN y coordinate
                         y = randomNum(0,boardLength)
                    takeShot(-1, x, y)    // -1 for playerTwo turn
               END MODULE


               MODULE randomNum(boardLength) 
                    random number generator between 0 and (board length - 1);
               END MODULE


               MODULE takeShot(turn, xCoordinate, yCoordinate)                       // (-1 = miss, 1 = hit)
                    IF turn = 1
                         update playerTwoBoard at position (xCoordinate, yCoordinate)
                              If playerTwoBoard(xCoordinate, yCoordinate) = null
                                   UPDATE to -1 (miss)     
                                   RENDER() board 
                                   checkWinner()
                                   CHANGE turn (turn *= -1)     
                              If playerTwoBoard(xCoordinate, yCoordinate) = 0
                                   UPDATE to 1 (hit)     
                                   trackHits(-1)      
                                   RENDER() board
                                   checkWinner()
                                   CHANGE turn
                              If playerTwoBoard(xCoordinate, yCoordinate) = 1 or -1
                                   ALERT "You've already tried to shoot there!"
                                   CLEAR input form and wait for playerOne to try again        
                    ELSE IF turn = -1
                              If playerOneBoard(xCoordinate, yCoordinate) = null
                                   UPDATE to -1 (miss)   
                                   RENDER() board        
                                   CHANGE turn
                              If playerOneBoard(xCoordinate, yCoordinate) = 0
                                   UPDATE to 1 (hit)    
                                   trackHits(1)       
                                   RENDER() board
                                   playerTwoHit = 1 
                                   engageAi = 1
                                   aiHits = {
                                        hits: (xCoordinate, yCoordinate)
                                   }
                                   CHANGE turn
                              If playerOneBoard(xCoordinate, yCoordinate) = 1 or -1
                                   no change to board
                                   RUN randomShot() again 
               END MODULE


               MODULE trackHits(player)
                    ITERATE through (player) ships
                         IF any location coordinates = 1
                              hitSpaces += 1
                              unhitSpaces -=1
                              IF hitSpaces = ship.length
                                   ship.alive = false
               END MODULE


               MODULE checkWinner()
                    CHECK playerOne ships to see if any are still alive
                    IF none are alive
                         winner = -1
                         turn = 0
                         ALERT playerTwo wins!
                    CHECK playerTwo ships to see if any are still alive
                    IF none are alive
                         winner = 1
                         turn = 0
                         ALERT playerOne wins!
               END MODULE


               MODULE opponentAi(hit)

                    * iterate through playerTwoAiObject
                         * If no open ships, 
                              * take reandom shot
                         * If one or more open ships, 
                              * STOP on the first open ship (position known is true, is-alive is true)
                              * if there's only one hit, no misses, take the last shot (y - 1) to shoot one cell above
                                   * track shot result
                                        * if miss, register it as a miss
                                        * if hit but another ship, register it as a miss for current ship
                                             * register as hit for 2nd ship 
                                                  * update AiObject with known position 
                                        * if hit on target ship, update hit coordinates
                              * if there are two hits and no misses
                                   * if (y-2) is already a miss, register it as a miss
                                        * this location is the "cap"
                                        * fill out board locations 
                                             * WILL NEED MODULE FOR THIS 
                                   * if (y-2) is off the board, fill in board location
                                        * this means the edge of the board is the "cap"
                                   * if (y-2) has not been shot at yet, make that the next shot
                                        * if it's a miss, (y-2) is the "cap"
                                             * flesh out board locations
                                        * if it's a hit but on a different ship, (y-2) is the cap
                                             * flesh out board locations
                                        * if it's a hit on the same ship, and ship is still alive, next shot is (y - 3)
                              * if there are two hits and one miss
                                   * miss location is the "cap"
                                        * function to flesh out remaining board locations
                                   * subsequent shots will fill in boardLocations until knownHits is equal to / has all the same values as boardLocations 




                    IF engageAi = 0
                         BREAK
                    ELSE

                         WHILE engageAi = 1 
                              playerTwo shots allowed only on adjacent cells to most recent hit 
                                   RUN cycle through these coordinates until playerTwo gets another hit
                                        // options (x0 + 1,  y0), (x0 - 1,  y0), (x0,  y0 + 1), (x0,  y0 - 1);
                              ON second hit
                                   shipIdentified = true;        // prompts AI to move from 2D to 1D
                                   aiHits = {
                                        hits: [(x0, y0), (x1, y1)]              // where (x1, y1) is the second hit coordinate 
                                        }


                         WHILE shipIdentified = true {
                              once ship is identified, playerTwo's shots will be only in same line:
                              IF the hits have same x value
                                   next shot is (x1 + 1)
                                        if (x1 + 1) is a miss
                                             register (x1 + 1):            // so AI knows to try in the other direction 
                                                  aiHits = {
                                                       hits: [(x0, y0), (x1, y1)], 
                                                       miss: (x1 + 1)
                                                       }
                                             next shot is (x0 - 1)           
                                             if it's a hit
                                             trackHits(1)
                                             ADD hit coordinates to aiHits object    
                              IF the hits have same y value
                                   next shot is (y1 + 1)
                                        if (y1 + 1) is a miss
                                             register (y1 + 1):            // so AI knows to try in the other direction 
                                                  aiHits = {
                                                       hits: [(x0, y0), (x1, y1)], 
                                                       miss: (y1 + 1)
                                                  }
                                             next shot is (y0 - 1)
                                        if it's a hit
                                             trackHits(1)
                                             ADD hit coordinates to aiHits object
                              if aiHits length > 3
                                   proceed to hit in straight line until ship is sunk 
                         }

                         IF ship is sunk, playerTwo return to taking random shots
                              aiHits = {};
                              playerTwoHit = 0;
                              shipIdentified = false; 

               END MODULE





     END PROGRAM Battleship 
```