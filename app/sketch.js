let middle;
let dimensions;
let puck;
let startX;
let startY;

function setup() {
  // put setup code here
    var cnv = createCanvas(windowWidth, windowHeight);
    cnv.style('display', 'block');
    background(255);
    frameRate(60);
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
    dimensions = checkRatio();
    startX = (middle[0] - dimensions[0] / 2) + dimensions[1] / 15;
    startY = (middle[1] - dimensions[1] / 2) + dimensions[1] / 15;
}

function draw() {
    updateBackground(); // automatically refreshes background

    drawScoreboard(); // draws scoreboard at top of screen
    drawInfo(); // draws info at bottom of screen
    dimensions = checkRatio();
    drawRink();
    drawPuck();
    updatePuck();
    drawStriker();

    stroke(255);
    strokeWeight(1);
    line(startX, height / 2, width / 2, height / 2);
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
        return [(height-100)*1.75, height-100];
    } else {
        // can expand to max height
        return [width, width/1.75];
    }
}

function drawRink() {
    rectMode(CENTER);
    fill(200, 200, 200, 150);
    stroke(255, 0, 0);
    strokeWeight(dimensions[0] / 100);
    rect(middle[0], middle[1], dimensions[0] - 25, dimensions[1] - 25, 10);
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
    //if (keyIsPressed && keyCode == 32) striker["charge"] *= -1;
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
    }
    if (mouseY < startY) {
        cursor(ARROW);
        y = startY;
    } else if (mouseY >= startY && mouseY <= height - startY) {
        noCursor();
        y = mouseY;
    } else {
        cursor(ARROW);
        y = startY;
    }
    if (mouseY > middle[1] - dimensions[1] / 2) y = mouseY;
    striker["x"] = (x - (width - dimensions[0]) / 2) / dimensions[0] * 17.5;
    ellipse(x, y, dimensions[1] / 15, dimensions[1] / 15);
    fill(255);
    rectMode(CENTER);
    rect(x, y, dimensions[1] / 22, dimensions[1] / 90, 10);
    if (striker["charge"] > 0) rect(x, y, dimensions[1] / 90, dimensions[1] / 22, 10);
}

function updateStriker() {}

function drawCPU() {}

function updateCPU() {}

function keyPressed() {
    if (keyCode == 32) striker["charge"] *= -1;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  middle = [width / 2, height / 2];
  startX = (middle[0] - dimensions[0] / 2)+ dimensions[1] / 15;
  startY = (middle[1] - dimensions[1] / 2) + dimensions[1] / 15;
}