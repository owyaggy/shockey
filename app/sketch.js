let middle; // [x, y] of middle of rink and window
let dimensions; // [width, height] of rink
let puck; // dictionary of puck info
let startX; // x value of puck when touching upper rink border
let startY; // y value of puck when touching upper rink border
let striker; // dictionary of user striker info
let cpu; // dictionary of cpu striker info
let fr; // framerate
let goalHeight; // as multiplier of height of rink
let arrows; // whether electric field arrows shown
let ev; // magnitude of 1 electron charge
let gravity; // acceleration due to gravity
let fs; // static friction of the surface
let fk; // kinetic friction of the surface
let pauseGame; // boolean pause game variable
let coulombConstant; // coulomb's law constant
let wallBounce; // percent of momentum absorbed by walls upon collisions
let score; // [user goals, cpu goals]
let state; // 'start', 'about', 'how-to', 'mode', 'play'
let animationMetrics; // variables to track intro animation
let bolts; // array of lightning objects

/**
 * Notes:
 * - Coordinate grid for rink is 17.5 x 10 meters (width x height)
 * - (0, 0) is the top left corner
 * - (17.5, 10) is the bottom right corner
 * - all coordinates are mapped on to a grid of width dimensions[0] and height dimensions[1]
 */

function setup() {
    var cnv = createCanvas(windowWidth, windowHeight);
    cnv.style('display', 'block');
    background(255);
    fr = 60;
    frameRate(fr);
    middle = [width/2, height/2];
    ev = 1.6 * Math.pow(10, -19);
    let universalQ = -7 * ev * Math.pow(10, 14);
    puck = {
        "x": 17.5 / 2, // x-position
        "y": 10.0 / 2, // y-position
        "xv": 0, // x-velocity
        "yv": 0, // y-velocity
        "mass": 2, // mass (kg)
        "q": universalQ // TODO: accurate charge
    }
    striker = {
        "x": 4,
        "y": 10 / 2,
        "q": universalQ // TODO: accurate charge
    }
    cpu = {
        "x": 17.5 - 4,
        "y": 10 / 2,
        "xv": 0,
        "yv": 3,
        "q": universalQ, // TODO: accurate charge
        "difficulty": 1 // TODO: implement difficulty
    }
    goalHeight = 0.4;
    dimensions = checkRatio();
    startX = (middle[0] - dimensions[0] / 2) + dimensions[1] / 30 + dimensions[0] / 200;
    startY = (middle[1] - dimensions[1] / 2) + dimensions[1] / 30 + dimensions[0] / 200;
    arrows = false;
    gravity = 9.81;
    fs = .10; // static friction µ
    fk = .08; // kinetic friction µ
    pauseGame = false;
    coulombConstant = 9 * Math.pow(10, 9);
    wallBounce = 1;
    score = [0, 0];
    state = 'start';
    animationMetrics = {
        "y": 0,
        "alpha": 75,
        "text": "SHOCKEY",
        "bg": 255
    }
    bolts = [];
}

function draw() {
    updateBackground(); // automatically refreshes background

    if (state == 'start') {
        runIntro();
    }

    if (state == 'play') {
        drawScoreboard(); // draws scoreboard at top of screen
        drawInfo(); // draws info at bottom of screen
        drawRink();
        drawGoals();
        if (arrows) drawArrows();
        drawPuck();
        updatePuck();
        drawStriker();
        drawCPU();

        drawMenu();
    }
  
    if (state == 'goal'){
       drawScoreboard(); // draws scoreboard at top of screen
       drawInfo(); // draws info at bottom of screen
       drawRink();
       drawGoals();
       runGoal();
      
    }
}

function mouseClicked(){
  
  if (state === 'goal' || state === 'start'){
    state = 'play'
  }
  
}


function updateBackground() {
    background(0, 0, animationMetrics.bg);
}

function runGoal(){
  textSize(32);
  text('GOAL', 0, 0);
  textAlign(CENTER);
  textStyle(BOLDITALIC);
 
  
  
}
function runIntro() {
    textSize(dimensions[1] * animationMetrics["y"] / 1000);
    textAlign(CENTER);
    textStyle(BOLDITALIC);
    fill(animationMetrics["alpha"], 150, 255 - animationMetrics['alpha'] + 40, animationMetrics['alpha'] * 0.7);
    strokeWeight(dimensions[1] / 200);
    stroke(255, 255, 255, animationMetrics['alpha']);
    strokeCap(ROUND);
    text(animationMetrics["text"], middle[0], animationMetrics["y"] / 100 * middle[1]);
    if (animationMetrics['y'] >= 100) {
        animationMetrics['y'] = 100;
        textSize(dimensions[1] * animationMetrics["y"] / 2500);
        animationMetrics["text"] = "SHOCKEY";
        if (animationMetrics.bg > 40) {
            animationMetrics.bg -= 75 / fr;
        } else {
            animationMetrics.bg = 40;
            zap();
        }
    }
    if (animationMetrics['y'] < 100) {
        animationMetrics['y'] += 40 / fr;
        animationMetrics['alpha']+= 72 / fr;
        animationMetrics["text"] = animationMetrics['text'].substring(1, 7) + animationMetrics['text'].substring(0, 1);
    }
    strokeWeight(dimensions[1] / 100);
    stroke(255, 255, 255, animationMetrics["alpha"] * 0.9);
    strokeCap(PROJECT);
    line(0, middle[1] * 0.91, middle[0] * 0.0075 * animationMetrics["y"], middle[1] * 0.91);
    line(0, middle[1] * 0.96, middle[0] * 0.0073 * animationMetrics["y"], middle[1] * 0.96);
    line(width, middle[1] * 0.91, width - middle[0] * 0.0073 * animationMetrics["y"], middle[1] * 0.91);
    line(width, middle[1] * 0.96, width - middle[0] * 0.0075 * animationMetrics["y"], middle[1] * 0.96);
}

function zap() {
    if (random() < 0.05 && bolts.length < 100) {
        bolts.push(new Lightning(0, random(), 0.7));
    }
    for (let i = 0; i < bolts.length; i++) {
        if (bolts[i] != null) {
            bolts[i].animate();
            if (bolts[i].a <= 0) {
                bolts[i] = bolts[bolts.length - 1];
                bolts.pop();
            }
        }
    }
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
    fill(255);
    noStroke();
    textStyle(BOLD);
    textSize(36);
    textAlign(CENTER);
    text(score[0], middle[0] *  0.8, 37);
    text(score[1], middle[0] * 1.2, 37);
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
    if (!arrows) {
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
    }
    // center line
    strokeWeight(dimensions[0] / 150);
    line(middle[0], middle[1] - dimensions[1] / 2, middle[0], middle[1] + dimensions[1] / 2);
    // center point
    strokeWeight(dimensions[0] / 50);
    point(middle[0], middle[1]);
    if (!arrows) {
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
    let userDistance = Math.sqrt(
        Math.pow(puck["x"] - striker["x"], 2) + Math.pow(puck["y"] - striker["y"], 2)
    );
    let userForce; // force in N of user striker charge on puck charge
    userForce = Math.abs(coulombConstant * puck["q"] * striker["q"] / Math.pow(userDistance, 2));
    let cpuDistance = Math.sqrt(
        Math.pow(puck["x"] - cpu["x"], 2) + Math.pow(puck["y"] - cpu["y"], 2)
    );
    let cpuForce; // force in N of CPU striker on puck charge
    cpuForce = coulombConstant * puck["q"] * cpu["q"] / Math.pow(cpuDistance, 2);
    let userAngle = calculateAngle(striker["x"], striker["y"], puck["x"], puck["y"]);
    if (striker["q"] > 0) userAngle += Math.PI;
    let cpuAngle = calculateAngle(cpu["x"], cpu["y"], puck["x"], puck["y"]);
    let resultant = vectorAddition(userForce, userAngle, cpuForce, cpuAngle); // in form [magnitude, angle]
    let frictionForce = puck["mass"] * gravity; // calculate normal force
    if (puck["xv"] === 0 && puck["yv"] === 0) {
        frictionForce *= fs; // if puck is stationary multiply by static friction µ
        if (Math.abs(frictionForce) > Math.abs(resultant[0])) {
            resultant[0] = 0;
        }
    }
    else frictionForce *= fk; // if puck is moving multiply by kinetic friction coefficient
    let xforce;
    let yforce;
    xforce = resultant[0] * Math.cos(resultant[1]);
    yforce = resultant[0] * Math.sin(resultant[1]);
    let xacceleration;
    let yacceleration;
    xacceleration = xforce / puck["mass"];
    yacceleration = yforce / puck["mass"];
    xacceleration /= fr;
    yacceleration /= fr;
    puck["xv"] += xacceleration;
    puck["yv"] -= yacceleration;
    if (resultant[0] < frictionForce) { // if combined force from strikers is less than friction force
        xacceleration = 0; // no acceleration
        yacceleration = 0;
    }
    /* TODO: figure out friction
    xacceleration -= (frictionForce / puck["mass"]) * Math.cos(resultant[1]);
    yacceleration -= (frictionForce / puck["mass"]) * Math.sin(resultant[1]);
    if (puck["xv"] - xacceleration != Math.abs)
     */
    if (!pauseGame) {
        puck["x"] += puck["xv"] / fr;
        puck["y"] += puck["yv"] / fr;
    }
    let x = (puck["x"] / 17.5) * dimensions[0] + (width - dimensions[0]) / 2;
    let y = (puck["y"] / 10) * dimensions[1] + (height - dimensions[1]) / 2;
    if (x < startX) {
        if (y > middle[1] - dimensions[1] * goalHeight / 2 && y < middle[1] + dimensions[1] * goalHeight /2) {
            goal('cpu');
        }
        x = startX;
        puck["xv"] *= -wallBounce;
    }
    if (x > width - startX) {
        if (y > middle[1] - dimensions[1] * goalHeight / 2 && y < middle[1] + dimensions[1] * goalHeight /2) {
            goal('user');
        }
        x = width - startX;
        puck["xv"] *= -wallBounce;
    }
    if (y < startY) {
        y = startY;
        puck["yv"] *= -wallBounce;
    }
    if (y > height - startY) {
        y = height - startY;
        puck["yv"] *= -wallBounce;
    }
    puck["x"] = (x - (width - dimensions[0]) / 2) / dimensions[0] * 17.5;
    puck["y"] = (y - (height - dimensions[1]) / 2) / dimensions[1] * 10.0;
    if (pauseGame) {
        console.log(
            "userDistance: ", userDistance,
            " userForce: ", userForce,
            " userAngle: ", userAngle / Math.PI, "π",
            " cpuDistance: ", cpuDistance,
            " cpuForce: ", cpuForce,
            " cpuAngle: ", cpuAngle / Math.PI, "π",
            " resultant magnitude w/o friction: ", resultant[0] + frictionForce,
            " resultant magnitude w/ friction: ", resultant[0],
            " resultant angle: ", resultant[1] / Math.PI, "π"
        );
    }
}

function calculateAngle(x1, y1, x2, y2) {
    // consider striker/CPU at origin (x1, y1)
    let angle; // resultant angle to be returned
    if (x2 >= x1 && y2 <= y1) { // puck in quadrant I:
        angle = Math.atan((y1 - y2) / (x2 - x1));
    } else if (x2 < x1 && y2 <= y1) { // puck in quadrant II:
        angle = Math.atan((y1 - y2) / (x1 - x2)) + Math.PI / 2;
    } else if (x2 < x1 && y2 > y1) { // puck in quadrant III:
        angle = Math.atan((y2 - y1) / (x1 - x2)) + Math.PI;
    } else { // puck in quadrant IV:
        angle = Math.atan((y2 - y1) / (x2 - x1)) + 3 * Math.PI / 2;
    }
    return angle;
}

function vectorAddition(force1, angle1, force2, angle2) {
    let xforce;
    let yforce;
    let magnitude;
    let angle;
    xforce = force1 * Math.cos(angle1) + (force2 * Math.cos(angle2));
    yforce = force1 * Math.sin(angle1) + (force2 * Math.sin(angle2));
    if (xforce >= 0 && yforce >= 0) {
        angle = Math.atan(yforce / xforce);
    } else if (xforce < 0 && yforce >= 0) {
        angle = Math.PI - Math.atan(-1 * yforce / xforce);
    } else if (xforce < 0 && yforce < 0) {
        angle = Math.PI + Math.atan(yforce / xforce);
    } else {
        angle = 2 * Math.PI - Math.atan(-1 * yforce / xforce);
    }
    magnitude = Math.sqrt(Math.pow(xforce, 2) + Math.pow(yforce, 2));
    /*console.log(
        "xforce: ", xforce,
        " yforce: ", yforce
    );*/
    return [magnitude, angle];
}

function drawStriker() {
    if (striker["q"] < 0) fill(0, 0, 255);
    else fill(255, 0, 0);
    noStroke();
    let x = (striker["x"] / 17.5) * dimensions[0] + (width - dimensions[0]) / 2;
    let y = (striker["y"] / 10) * dimensions[1] + (height - dimensions[1]) / 2;
    if (!pauseGame) {
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
    }
    striker["x"] = (x - (width - dimensions[0]) / 2) / dimensions[0] * 17.5;
    striker["y"] = (y - (height - dimensions[1]) / 2) / dimensions[1] * 10.0;
    ellipse(x, y, dimensions[1] / 15, dimensions[1] / 15);
    fill(255);
    rectMode(CENTER);
    rect(x, y, dimensions[1] / 22, dimensions[1] / 90, 10);
    if (striker["q"] > 0) rect(x, y, dimensions[1] / 90, dimensions[1] / 22, 10);
}

function drawCPU() {
    fill(0, 0, 255);
    noStroke();
    if (!pauseGame) {
        cpu["x"] += cpu["xv"] / fr;
        cpu["y"] += cpu["yv"] / fr;
    }
    let x = (cpu["x"] / 17.5) * dimensions[0] + (width - dimensions[0]) / 2;
    let y = (cpu["y"] / 10) * dimensions[1] + (height - dimensions[1]) / 2;
    // simple movement simulation
    if (y >= middle[1] + dimensions[1] * 0.3) cpu["yv"] *= -1;
    if (y <= middle[1] - dimensions[1] * 0.3) cpu["yv"] *= -1;
    // end simple movement simulation
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

function drawArrows() {
    let xinterval = dimensions[0] / 12;
    let yinterval = dimensions[1] / 8;
    let userForce;
    let distance;
    stroke(255);
    strokeWeight(dimensions[0] / 75);
    for (let x = 1; x < 12; x++) {
        for (let y = 1; y < 8; y++) {
            let a = x * xinterval + middle[0] - dimensions[0] / 2;
            let b = y * yinterval + middle[1] - dimensions[1] / 2
            point(a, b);
            /* TODO: Draw the actual arrows
            distance =
            userForce = coulombConstant * striker["q"] / distance;
            //line(a, b, )*/
        }
    }
}



function goal(scorer) {
    state = 'goal'
    if (scorer === "user") {
        score[0]++;
    }
    if (scorer === "cpu") {
        score[1]++;
    }
}

function drawMenu() {

}

function keyPressed() {
    if (keyCode == 32) striker["q"] *= -1;
    if (keyCode == 80) pauseGame = !pauseGame;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  middle = [width / 2, height / 2];
  dimensions = checkRatio();
  startX = (middle[0] - dimensions[0] / 2)+ dimensions[1] / 30 + dimensions[0] / 200;
  startY = (middle[1] - dimensions[1] / 2) + dimensions[1] / 30 + dimensions[0] / 200;
}

class Lightning {
  constructor(sx, sy, ex) {
    this.x = sx;
    this.y = sy;
    this.ex = ex;
    this.dir = "right";
    if (random() >= 0.5) this.dir = "left";
    this.speed = 0.1;
    this.turns = [[this.x, this.y]];
    this.a = 255; // alpha (out of 255)
    this.c = color(255, 242, 94);
    this.vertical = random(-0.012, 0.012);
    this.xTurns = [];
    for (let i = 0; i < 10; i++) {
      this.xTurns.push(random() * this.ex);
    }
  }

  animate() {
    if (this.x < this.ex) {
      this.x += this.speed;
      this.y += this.vertical;
      let toRemove = 0;
      for (let i = 0; i < this.xTurns.length; i++) {
        if (this.x > this.xTurns[i]) {
          toRemove = i;
          this.turns.push([this.x, this.y]);
          this.vertical = 0 - (this.vertical + (random() + 0.8) * 0.04);
        }
      }
      this.xTurns[toRemove] = this.xTurns[this.xTurns.length - 1];
      this.xTurns.pop();
    } else {
      this.a -= 240 / fr;
      this.c.setAlpha(this.a);
    }
    stroke(this.c);
    strokeWeight(height * 0.008);
    noFill();
    beginShape();
    for (let i = 0; i < this.turns.length; i++) {
      vertex(this.turns[i][0] * width, this.turns[i][1] * height);
    }
    vertex(this.x * width, this.y * height);
    endShape();
  }
}
