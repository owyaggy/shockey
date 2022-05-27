let middle;
let dimensions;
let puck;
let startX;
let startY;
let striker;
let cpu;
let fr;
let goalHeight; // as multiplier of height of rink

/**
 * Notes:
 * - Coordinate grid for rink is 17.5 x 10 meters (width x height)
 * - (0, 0) is the top left corner
 * - (17.5, 10) is the bottom right corner
 * - all coordinates are mapped on to a grid of width dimensions[0] and height dimensions[1]
 */

function setup() {
  // put setup code here
    var cnv = createCanvas(windowWidth, windowHeight);
    cnv.style('display', 'block');
    background(255);
    fr = 60;
    frameRate(fr);
    middle = [width/2, height/2];
    puck = {
        "x": 17.5 / 2, // x-position
        "y": 10.0 / 2, // y-position
        "xv": 0, // x-velocity
        "yv": 0, // y-velocity
        "xa": 0, // x-acceleration
        "ya": 0, // y-acceleration
        "mass": 0.5, // mass (kg)
        "charge": -1 // TODO: accurate charge
    }
    striker = {
        "x": 4,
        "y": 10 / 2,
        "charge": -1 // TODO: accurate charge
    }
    cpu = {
        "x": 17.5 - 4,
        "y": 10 / 2,
        "xv": 0.1,
        "yv": 0.3,
        "charge": -1, // TODO: accurate charge
        "difficulty": 1 // TODO: implement difficulty
    }
    goalHeight = 0.7;
    dimensions = checkRatio();
    startX = (middle[0] - dimensions[0] / 2) + dimensions[1] / 30 + dimensions[0] / 200;
    startY = (middle[1] - dimensions[1] / 2) + dimensions[1] / 30 + dimensions[0] / 200;
}

function draw() {
    updateBackground(); // automatically refreshes background

    drawScoreboard(); // draws scoreboard at top of screen
    drawInfo(); // draws info at bottom of screen
    dimensions = checkRatio();
    drawRink();
    drawGoals();
    drawPuck();
    updatePuck();
    drawStriker();
    drawCPU();

    /*stroke(255);
    strokeWeight(1);
    // line(startX, height / 2, width / 2, height / 2);
    noFill();
    ellipseMode(CORNERS);
    ellipse(startX, startY, width - startX, height - startY);
    ellipseMode(CENTER);
    ellipse(width/2, height/2, dimensions[0], dimensions[1]);//*/
}

function updateBackground() {
    background(0, 0, 255);
}

function drawScoreboard() {
    noStroke();
    fill(255);
    rectMode(CORNER);
    rect(0, 0, width, 50);
    fill(0, 0, 255);
    rectMode(CENTER);
    rect(middle[0] * 0.8, 25, 45, 45, 10);
    fill(255, 0, 0);
    rect(width - middle[0] * 0.8, 25, 45, 45, 10);
}

function drawInfo() {
    noStroke();
    fill(255);
    rectMode(CORNER);
    rect(0, height - 50, width, height);
}

function checkRatio() { // determines which dimension is the limiting factor (width or height)
    // returns [width, height] of playing field in relation to center
    if (width/(height - 100) >= 1.75) {
        // can expand to max width
        return [(height-100)*1.75*.95, (height-100)*.95];
    } else {
        // can expand to max height
        return [width*.95, (width/1.75)*.95];
    }
}

function drawRink() {
    rectMode(CENTER);
    fill(200, 200, 200, 150);
    stroke(255, 0, 0);
    strokeWeight(dimensions[0] / 100);
    // adjust corner curve based on canvas size
    let angle = 10;
    if (dimensions[0] < 300) angle = 10 * (dimensions[0] / 300);
    // outer boundary
    rect(middle[0], middle[1], dimensions[0], dimensions[1], angle);
    // center circle
    strokeWeight(dimensions[0] / 150);
    stroke(0, 0, 255);
    noFill();
    ellipse(middle[0], middle[1], dimensions[1] / 3.5, dimensions[1] / 3.5);
    // blue lines
    strokeCap(PROJECT);
    line(
        middle[0] - dimensions[0] / 6,
        middle[1] - dimensions[1] / 2 + dimensions[0] / 200 + dimensions[0] / 300,
        middle[0] - dimensions[0] / 6,
        middle[1] + dimensions[1] / 2 - dimensions[0] / 200 - dimensions[1] / 175 // unclear why 175 works better than 300
    );
    line(
        middle[0] + dimensions[0] / 6,
        middle[1] - dimensions[1] / 2 + dimensions[0] / 200 + dimensions[0] / 300,
        middle[0] + dimensions[0] / 6,
        middle[1] + dimensions[1] / 2 - dimensions[0] / 200 - dimensions[1] / 175
    );
    // four circles
    strokeCap(ROUND);
    stroke(255, 0, 0);
    ellipse(middle[0] - dimensions[0] / 3.5, middle[1] - dimensions[1] / 3, dimensions[1] / 5);
    ellipse(middle[0] - dimensions[0] / 3.5, middle[1] + dimensions[1] / 3, dimensions[1] / 5);
    ellipse(middle[0] + dimensions[0] / 3.5, middle[1] - dimensions[1] / 3, dimensions[1] / 5);
    ellipse(middle[0] + dimensions[0] / 3.5, middle[1] + dimensions[1] / 3, dimensions[1] / 5);
    // lines coming off circles
    line(middle[0] - dimensions[0] / 3.5, middle[1] - dimensions[1] / 3 - dimensions[1] / 10,
        middle[0] - dimensions[0] / 3.5, middle[1] - dimensions[1] / 3 - dimensions[1] / 10 - dimensions[1] / 35);
    line(middle[0] - dimensions[0] / 3.5, middle[1] - dimensions[1] / 3 + dimensions[1] / 10,
        middle[0] - dimensions[0] / 3.5, middle[1] - dimensions[1] / 3 + dimensions[1] / 10 + dimensions[1] / 35);
    line(middle[0] - dimensions[0] / 3.5, middle[1] + dimensions[1] / 3 - dimensions[1] / 10,
        middle[0] - dimensions[0] / 3.5, middle[1] + dimensions[1] / 3 - dimensions[1] / 10 - dimensions[1] / 35);
    line(middle[0] - dimensions[0] / 3.5, middle[1] + dimensions[1] / 3 + dimensions[1] / 10,
        middle[0] - dimensions[0] / 3.5, middle[1] + dimensions[1] / 3 + dimensions[1] / 10 + dimensions[1] / 35);
    line(middle[0] + dimensions[0] / 3.5, middle[1] - dimensions[1] / 3 - dimensions[1] / 10,
        middle[0] + dimensions[0] / 3.5, middle[1] - dimensions[1] / 3 - dimensions[1] / 10 - dimensions[1] / 35);
    line(middle[0] + dimensions[0] / 3.5, middle[1] - dimensions[1] / 3 + dimensions[1] / 10,
        middle[0] + dimensions[0] / 3.5, middle[1] - dimensions[1] / 3 + dimensions[1] / 10 + dimensions[1] / 35);
    line(middle[0] + dimensions[0] / 3.5, middle[1] + dimensions[1] / 3 - dimensions[1] / 10,
        middle[0] + dimensions[0] / 3.5, middle[1] + dimensions[1] / 3 - dimensions[1] / 10 - dimensions[1] / 35);
    line(middle[0] + dimensions[0] / 3.5, middle[1] + dimensions[1] / 3 + dimensions[1] / 10,
        middle[0] + dimensions[0] / 3.5, middle[1] + dimensions[1] / 3 + dimensions[1] / 10 + dimensions[1] / 35);
    // center line
    line(middle[0], middle[1] - dimensions[1] / 2, middle[0], middle[1] + dimensions[1] / 2);
    // center point
    strokeWeight(dimensions[0] / 50);
    point(middle[0], middle[1]);
    // four red points
    point(middle[0] - dimensions[0] / 8, middle[1] - dimensions[1] / 3);
    point(middle[0] - dimensions[0] / 8, middle[1] + dimensions[1] / 3);
    point(middle[0] + dimensions[0] / 8, middle[1] - dimensions[1] / 3);
    point(middle[0] + dimensions[0] / 8, middle[1] + dimensions[1] / 3);
    // red points in circles
    point(middle[0] - dimensions[0] / 3.5, middle[1] - dimensions[1] / 3);
    point(middle[0] - dimensions[0] / 3.5, middle[1] + dimensions[1] / 3);
    point(middle[0] + dimensions[0] / 3.5, middle[1] - dimensions[1] / 3);
    point(middle[0] + dimensions[0] / 3.5, middle[1] + dimensions[1] / 3);
}

function drawGoals() {
    fill(255, 50, 255, 80);
    strokeWeight(dimensions[0] / 150);
    stroke(255, 0, 0);
    rectMode(CENTER);
    rect(middle[0] - dimensions[0] / 2 + dimensions[0] / 20, middle[1], dimensions[0] / 10, dimensions[1] * goalHeight, 0, 40, 40, 0);
    rect(middle[0] + dimensions[0] / 2 - dimensions[0] / 20, middle[1], dimensions[0] / 10, dimensions[1] * goalHeight, 40, 0, 0, 40);
    // green lines
    stroke(0, 255, 0);
    strokeWeight(dimensions[0] / 200);
    strokeCap(SQUARE);
    line(
        middle[0] - dimensions[0] / 2 + dimensions[0] / 400,
        middle[1] - dimensions[1] * goalHeight / 2 + dimensions[0] / 300,
        middle[0] - dimensions[0] / 2 + dimensions[0] / 400,
        middle[1] + dimensions[1] * goalHeight / 2 - dimensions[0] / 300
    );
    line(
        middle[0] + dimensions[0] / 2 - dimensions[0] / 400,
        middle[1] - dimensions[1] * goalHeight / 2 + dimensions[0] / 300,
        middle[0] + dimensions[0] / 2 - dimensions[0] / 400,
        middle[1] + dimensions[1] * goalHeight / 2 - dimensions[0] / 300
    );
    strokeCap(ROUND);
}

function drawPuck() {
    fill(0, 0, 255);
    noStroke();
    let x = (puck["x"] / 17.5) * dimensions[0] + (width - dimensions[0]) / 2;
    let y = (puck["y"] / 10) * dimensions[1] + (height - dimensions[1]) / 2;
    ellipse(x, y, dimensions[1] / 15, dimensions[1] / 15);
    fill(255);
    rectMode(CENTER);
    rect(x, y, dimensions[1] / 22, dimensions[1] / 90, 10);
}

function updatePuck() {
    puck["x"] += puck["xv"];
    puck["y"] += puck["yv"];
}

function drawStriker() {
    if (striker["charge"] < 0) fill(0, 0, 255);
    else fill(255, 0, 0);
    noStroke();
    let x = (striker["x"] / 17.5) * dimensions[0] + (width - dimensions[0]) / 2;
    let y = (striker["y"] / 10) * dimensions[1] + (height - dimensions[1]) / 2;
    if (mouseX < startX) {
        cursor(ARROW);
        x = startX;
    } else if (mouseX >= startX && mouseX <= width - startX) {
        noCursor();
        x = mouseX;
    } else {
        cursor(ARROW);
        x = width - startX;
    }
    if (mouseY < startY) {
        cursor(ARROW);
        y = startY;
    } else if (mouseY >= startY && mouseY <= height - startY) {
        if (mouseX < startX || mouseX > width - startX) cursor(ARROW);
        else noCursor();
        y = mouseY;
    } else {
        cursor(ARROW);
        y = height - startY;
    }
    striker["x"] = (x - (width - dimensions[0]) / 2) / dimensions[0] * 17.5;
    striker["y"] = (y - (height - dimensions[1]) / 2) / dimensions[1] * 10.0;
    ellipse(x, y, dimensions[1] / 15, dimensions[1] / 15);
    fill(255);
    rectMode(CENTER);
    rect(x, y, dimensions[1] / 22, dimensions[1] / 90, 10);
    if (striker["charge"] > 0) rect(x, y, dimensions[1] / 90, dimensions[1] / 22, 10);
}


function drawCPU() {
    fill(0, 0, 255);
    noStroke();
    cpu["x"] += cpu["xv"] / fr;
    cpu["y"] += cpu["yv"] / fr;
    let x = (cpu["x"] / 17.5) * dimensions[0] + (width - dimensions[0]) / 2;
    let y = (cpu["y"] / 10) * dimensions[1] + (height - dimensions[1]) / 2;
    if (x < startX) x = startX;
    if (x > width - startX) x = width - startX;
    if (y < startY) y = startY;
    if (y > height - startY) y = height - startY;
    cpu["x"] = (x - (width - dimensions[0]) / 2) / dimensions[0] * 17.5;
    cpu["y"] = (y - (height - dimensions[1]) / 2) / dimensions[1] * 10.0;
    ellipse(x, y, dimensions[1] / 15, dimensions[1] / 15);
    fill(255);
    rectMode(CENTER);
    rect(x, y, dimensions[1] / 22, dimensions[1] / 90, 10);
}

function updateCPU() {}

function keyPressed() {
    if (keyCode == 32) striker["charge"] *= -1;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  middle = [width / 2, height / 2];
  dimensions = checkRatio();
  startX = (middle[0] - dimensions[0] / 2)+ dimensions[1] / 30 + dimensions[0] / 200;
  startY = (middle[1] - dimensions[1] / 2) + dimensions[1] / 30 + dimensions[0] / 200;
}