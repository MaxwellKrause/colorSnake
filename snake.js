/* snake javascript file
Max Krause
9/10/19
grid size : 30x30
each grid square: 20x20
*/

//main vars
var canvas = document.getElementById("MyCanvas");
var draw = canvas.getContext("2d");
var changeDir; //boolean which determines when the player presses an arrow key
var direction = 0; 
var arenaDim; //px of the arena
var arenaDimWithoutBorder;
var boxWidth;
var boxNumber = 8;
var segmentArray = []; //array that will contain all of the snake segment positions
var interval;
var speedRate = 1;
var frameInterval = 3;
var score = 0;
var playingGame = false;
var fired = false;

var currentDirection;

//main function 
function main() {
    playingGame = true;
    for(var i = segmentArray.length - 1; i > 0; i = i - 1) {
        segmentArray.pop();
    }
    segmentArray[0] = new snakeObject(boxWidth, boxWidth, "white", 0, 0); //creates a new snake object 
    direction = 0;
    options();
    draw.clearRect(0, 0, arenaDim, arenaDim);
    food = new foodObject();
    food.newFood();
}

function determineScreenSizing() {
    var maxHeight;
    if(window.innerWidth > window.innerHeight) {
        maxHeight = window.innerHeight;
    }
    else {
        maxHeight = window.innerWidth;
    }
    arenaDim = Math.floor(maxHeight-20); //gets the total size of the canvas
    boxWidth = Math.floor(arenaDim/((parseFloat(boxNumber) + .5))); //gets the size that each of the checkerboard squares are
    boxWidth = boxWidth - (boxWidth % 10);
    arenaDim = boxWidth * boxNumber + (1 * parseFloat(boxNumber));
    var borderWidth = Math.floor(boxWidth/4); //get the size of the border (1/2 of the box size)
    arenaDimWithoutBorder = boxWidth * parseFloat(boxNumber);
    document.documentElement.style.setProperty("--checkerboard-sizing", (boxWidth * 2) + "px");
    document.documentElement.style.setProperty("--checkerboard-pos", boxWidth + "px");
    document.documentElement.style.setProperty("--checkerboard-negpos", (-1 * boxWidth) + "px");
    document.documentElement.style.setProperty("--window-sizing", arenaDimWithoutBorder + "px");
    document.documentElement.style.setProperty("--border-width", borderWidth + "px");
    document.getElementById("MyCanvas").height = (arenaDim);
    document.getElementById("MyCanvas").width = (arenaDim);
}

window.onresize = function() {
    determineScreenSizing();
}

//the main control pannel for the frame by frame updates
function frameUpdate() {
    draw.clearRect(0, 0, arenaDim, arenaDim); // clears the screen
    food.show();
    newPos(); //updates the snake objects X and Y position
    update(); //updates the image of the snake
}

function newPos () {
    collisionCheck();
    for(var i = 0; i < segmentArray.length; i = i + 1) {
        segmentArray[i].x = segmentArray[i].x + segmentArray[i].Xspeed;
        segmentArray[i].y = segmentArray[i].y + segmentArray[i].Yspeed;
    }
    if(segmentArray[0].x % boxWidth == 0 && segmentArray[0].y % boxWidth == 0) { //if the snake is in a new coordinate, run
        var temX = segmentArray[0].Xspeed;
        var temY = segmentArray[0].Yspeed;
        var temDir;
        if(changeDir == true) {
            changeSnakeDir(); //changes the snakes X and y speeds
            if((segmentArray[0].Xspeed + temX == 0) && (segmentArray[0].Yspeed + temY == 0)){ //if the player directs the snake to go the opposite way of current direction
                segmentArray[0].Xspeed = temX;
                segmentArray[0].Yspeed = temY;
                direction = temDir;
                changeSnakeDir(); //changes the direction of the snake back to the original
                return;
            }
            changeDir = false;
        }
        for(var i = 0; i < segmentArray.length; i = i + 1) {
            segmentArray[i].Xcord = Math.floor(segmentArray[i].x/boxWidth);
            segmentArray[i].Ycord = Math.floor(segmentArray[i].y/boxWidth);
        }
        for(var i = segmentArray.length - 1; i > 0; i = i - 1) { //when in a new cord, set the x and y speed of the segments to the previous
            segmentArray[i].Xspeed = (segmentArray[i-1].Xspeed);
            segmentArray[i].Yspeed = (segmentArray[i-1].Yspeed);
        }
        if(segmentArray.length > 1) {
            segmentArray[1].Xspeed = temX;
            segmentArray[1].Yspeed = temY;
        }
    }
}

//updates the location of the snake when called -- meant to be called after newpos function
function update () {
    for(var i = 0; i < segmentArray.length; i = i + 1) {
        draw.fillStyle = segmentArray[i].color;
        draw.fillRect(segmentArray[i].x, segmentArray[i].y, segmentArray[i].width, segmentArray[i].height)
    }
}

function grow() { //grows the snake by 1 segment when called
    var tempX = (segmentArray[segmentArray.length-1].x);
    var tempY = (segmentArray[segmentArray.length-1].y);
    segmentArray.push(new snakeObject(boxWidth, boxWidth, food.color, tempX, tempY));
    score = score + 1;
    document.getElementById("score").innerHTML = ("Score: " + score);
}

function collisionCheck() {
    var xPosition = segmentArray[0].Xcord; //checks the coordinate infront of the snake
    var yPosition = segmentArray[0].Ycord;
    if(xPosition == food.Xcord && yPosition == food.Ycord) { //if the snake is in the same coordinate as the food then run
        grow();
        food.newFood();
    }
    for(var i = 1; i < segmentArray.length; i = i + 1) { //goes through the snake body
        if(xPosition == segmentArray[i].Xcord && yPosition == segmentArray[i].Ycord) { //if the head crosses the body
            deathScreen();
        }
    }
    if((segmentArray[0].x < 0) || (segmentArray[0].y < 0) 
        || (segmentArray[0].x + boxWidth > arenaDimWithoutBorder) || (segmentArray[0].y + boxWidth > arenaDimWithoutBorder)) {
        deathScreen();
    }
}

function deathScreen() { //function for when the snake dies
    clearInterval(interval); //stops the continuous frame updates
    document.getElementById("death").style.display = "block";
}

function cont() {
    score = 0;
    document.getElementById("score").innerHTML = ("Score: " + score);
    document.getElementById("death").style.display = "none";
    main();
}

function options() { //function which controls the options pannel
    var elem = document.getElementById("options");
    toggle(elem);
    // Toggle element visibility
    function toggle(elem) {
        if (window.getComputedStyle(elem, null).display == "block") {
            elem.style.display = "none";
            if(playingGame) {
                interval = setInterval(frameUpdate, frameInterval); 
            }
        }
        else{
            elem.style.display = "block";
            clearInterval(interval);
        }
    }
}

function difficulty() {
    playingGame = false;
    document.getElementById("death").style.display = "none";
    document.getElementById("difficulty").style.display = "block";
    options();
    interval = setInterval(updateSize, 10);
    function updateSize() {
        var previewSize = (arenaDimWithoutBorder/document.getElementById("sizeSlider").value);
        var previewX = (arenaDimWithoutBorder/2) - previewSize/2;
        var previewY = (arenaDimWithoutBorder/2 + 120) - previewSize/2;
        draw.clearRect(0, 0, arenaDim, arenaDim);
        draw.fillStyle = "rgb(23, 221, 40)";
        draw.fillRect(previewX, previewY, previewSize, previewSize);
    }
}

function exitOptions() {
    document.getElementById("difficulty").style.display = "none";
    boxNumber = document.getElementById("sizeSlider").value;
    determineScreenSizing();
    modable = false;
    speedRate = parseFloat(document.getElementById("speedSlider").value);
    while(!modable) {
        if(boxWidth % speedRate == 0) {
            modable = true;
        }
        else {
            speedRate = speedRate - .5;
        }
    }
    clearInterval(interval);
    draw.clearRect(0, 0, arenaDim, arenaDim);
    options();
}

function tutorial() {
    if(document.getElementById("tutorial").style.display === "none") {
        document.getElementById("tutorial").style.display = "block";
    }
    else {
        document.getElementById("tutorial").style.display = "none";
    }
}

//function runs when a key is pressed
onkeydown = function () {
    if(!fired) {
        direction = event.keyCode; //logs the key pressed and sets direction =  to it
        fired = true;
        temDir = direction;
        if(event.keyCode == 27) { //if the user presses the excape key the options menu will pull up
            options();
        }
        changeDir = true; //allows the if statement which changes direction to be run 
    }
}
onkeyup = function() {
    fired = false;
}

//function which determines arrow pressed and changes X and Y speeds
function changeSnakeDir() {
    if (direction == 37) {
        currentDirection = 37; //
        segmentArray[0].Xspeed = -speedRate;
        segmentArray[0].Yspeed = 0;
    } else if (direction == 38) {
        currentDirection = 37; // 
        segmentArray[0].Xspeed = 0;
        segmentArray[0].Yspeed = -speedRate;
    } else if (direction == 39) {
        currentDirection = 37; // 
        segmentArray[0].Xspeed = speedRate;
        segmentArray[0].Yspeed = 0;
    } else if (direction == 40) {
        currentDirection = 37; //
        segmentArray[0].Xspeed = 0;
        segmentArray[0].Yspeed = speedRate;
    }
}

//snakeObject constructor
    function snakeObject(width, height, color, x, y) {
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.Xcord;
        this.Ycord;
        this.Xspeed = 0; //x speed of the snake
        this.Yspeed = 0; //y speed of the snake
        this.color = color;
    }

//food object which deals with food
function foodObject() { 
    this.Xpos;
    this.Ypos;
    this.Xcord;
    this.Ycord;
    this.color;

    this.newFood = function() { //when called, creates new food in new position
        this.color = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
        this.Xpos = Math.floor((this.randomPos()) * boxWidth + (boxWidth/2)); //calculates the new random 
        this.Ypos = Math.floor((this.randomPos()) * boxWidth + (boxWidth/2)); //location of the food
        this.Xcord = (this.Xpos - (boxWidth/2)) / boxWidth; //gets the X cord of the food
        this.Ycord = (this.Ypos - (boxWidth/2)) / boxWidth; //gets the Y cord of the food
        if(this.Xcord % 1 != 0) {
            this.Xcord = Math.floor((this.Xpos - (boxWidth/2)) / boxWidth) + 1;
        }
        if(this.Ycord % 1 != 0) {
            this.Ycord = Math.floor((this.Ypos - (boxWidth/2)) / boxWidth) + 1;
        }
        for(var i = 1; i < segmentArray.length; i = i + 1) {
            if(this.Xcord == segmentArray[i].Xcord && this.Ycord == segmentArray[i].Ycord) { //if the food spawns ontop of the snake
                this.newFood(); //redo food spawn
            }
        }
    }

    this.show = function() { //draws the food onto the arena
        draw.beginPath();
        draw.fillStyle = this.color;
        draw.arc(this.Xpos, this.Ypos, (boxWidth/2), 0, 2 * Math.PI);
        draw.fill();
    }

    this.randomPos = function() { //finds a random coordinate on the arena 
        return Math.floor(Math.random() * (arenaDimWithoutBorder/boxWidth));
    }
}