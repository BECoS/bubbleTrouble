var stage;
var myShip;
var sphereContainer = new createjs.Container();
var bulletContainer = new createjs.Container();
var shipContainer = new createjs.Container();
var enemyContainer = new createjs.Container();
var particleContainer = new createjs.Container();
var specialContainer = new createjs.Container();
var score_life_text = new createjs.Text('Lives: 3  Score: 0', '20px Arial');
var enemies = [];
var spheres = [];
var particles = [];
var projectiles = [];
var oldX;
var oldY;
var DEGREE_TO_RADIAN = -Math.PI / 180;
var score = 0;
//var nIntervId;
var special = false;
var sonic = new createjs.Shape();
var RESPAWN = false;
var lives = 3;
var timer;
var SEEKER = false;
var KEYCODE_LEFT = 37,
  KEYCODE_RIGHT = 39,
  KEYCODE_UP = 38,
  KEYCODE_DOWN = 40;
var left, right, up, down = false;
var MAX_SPEED = 3;
//var acceleration = 0;

$(document).ready(function () {
  var context = $('canvas')[0].getContext('2d');
  context.canvas.width = 500;
  context.canvas.height = 500;

  stage = new createjs.Stage('canvas');
  stage.mouseEventsEnabled = true;

  createjs.Ticker.setFPS(45);
  createjs.Ticker.on('tick', tick);
  createjs.Ticker.addEventListener('tick', stage);

  score_life_text.x = context.canvas.width - ((1 / 2) * context.canvas.width);
  score_life_text.baseLine = 'alphabetic';

  /*triangle = new createjs.Shape();
  triangle.graphics.beginFill('DeepSkyBlue');
  triangle.graphics.moveTo(0, 0).lineTo(10, 15).lineTo(0, 30).lineTo(30, 15).lineTo(0, 0);
  triangle.regX = 15;
  triangle.regY = 15;
  triangle.x = triangle.y = 100;*/

  bulletContainer.x = 0;
  bulletContainer.y = 0;

  stage.addChild(sphereContainer);
  //stage.addChild(triangle);
  stage.addChild(shipContainer);
  stage.addChild(bulletContainer);
  stage.addChild(specialContainer);
  stage.addChild(enemyContainer);
  stage.addChild(particleContainer);
  stage.addChild(score_life_text);

  /*stage.on("stagemousemove", function (evt) {
    if (oldX) {
      triangle.x = evt.stageX;
      triangle.y = evt.stageY;
    }

    oldX = evt.stageX;
    oldY = evt.stageY;
  })*/

  //Spawns enemies on a random time interval between 1 - 3 seconds
  //nIntervId = setInterval(addSphere, 1000 * getRandomIntInclusive(0.1, 1));

  stage.on("stagemousedown", function () {
    if (!RESPAWN)
      shoot();
  })

  addShip();
  randomEnemySpawn();
});

class Ship {
  constructor() {
    this.shape = new createjs.Shape();
    this.shape.graphics.beginFill('DeepSkyBlue');
    this.shape.graphics.moveTo(0, 0).lineTo(10, 15).lineTo(0, 30).lineTo(30, 15).lineTo(0, 0);
    this.shape.regX = 15;
    this.shape.regY = 15;
    this.shape.x = this.shape.y = 100;
    this.acceleration = 0;
  }

  getAcceleration() {
    return this.acceleration;
  }

  setAcceleration(acceleration) {
    this.acceleration = acceleration;
  }

  move() {

  }

}

class Enemy {
  constructor() {
    this.shape = new createjs.Shape();
    this.shape.graphics.beginFill('black').drawCircle(0, 0, 25);
    this.shape.x = getRandomIntInclusive(26, 474);
    this.shape.y = getRandomIntInclusive(26, 474);
    this.shape.alpha = 0;
    this.yDirection = 1;
    this.xDirection = 1;
    this.xMovement = getRandomIntInclusive(1, 10);
    this.yMovement = getRandomIntInclusive(1, 10);
  }

  getEnemyShape() {
    return this.shape;
  }

  getXOffset() {
    return this.shape.x;
  }

  getYOffset() {
    return this.shape.y;
  }

  getXDirection() {
    return this.xDirection;
  }

  getYDirection() {
    return this.yDirection;
  }

  setXDirection(value) {
    this.xDirection = value;
  }

  setYDirection(value) {
    this.yDirection = value;
  }

  move() {
    this.shape.x += (this.xMovement * this.xDirection);
    this.shape.y += (this.yMovement * this.yDirection);
  }

  destroy() {
    createjs.Tween.get(this.shape)
      .to({ alpha: 0, visible: false }, 100);

    addParticles(this.shape.x, this.shape.y, getRandomIntInclusive(7, 17));
    enemies.splice(enemyContainer.getChildIndex(this.shape), 1);
  }
}

class SeekerEnemy extends Enemy {
  constructor() {
    super();
  }

  move() {
    var arcTan = Math.atan2(myShip.shape.y - this.shape.y,
      myShip.shape.x - this.shape.x);

    this.shape.x += (Math.cos(arcTan) * this.run);
    this.shape.y += (Math.sin(arcTan) * this.rise);
  }
}

class Projectile {
  constructor(shipXPosition, shipYPosition, shipRotation) {
    this.shape = new createjs.Shape();
    this.shape.graphics.beginFill('black').drawCircle(0, 0, 5);
    this.shape.regX = 0;
    this.shape.regY = 0;
    this.shape.x = shipXPosition;
    this.shape.y = shipYPosition;
    this.shape.rotation = shipRotation;
  }

  getProjectileShape() {
    return this.shape;
  }

  getXOffset() {
    return this.shape.x;
  }

  getYOffset() {
    return this.shape.y;
  }

  getRotation() {
    return this.shape.rotation;
  }

  destroy() {
    createjs.Tween.get(this.shape)
      .to({ alpha: 0, visible: false }, 100);
  }

  move() {
    var verticalMovement = Math.sin(this.shape.rotation * DEGREE_TO_RADIAN) * 30;
    var horizontalMovement = Math.cos(this.shape.rotation * DEGREE_TO_RADIAN) * 30;

    this.shape.x += horizontalMovement;
    this.shape.y -= verticalMovement;
  }
}

class RainbowDust {
  constructor(x, y, pattern, xDirection, yDirection) {
    this.shape = new createjs.Shape();
    this.shape.x = x;
    this.shape.y = y;
    this.shape.alpha = 1;
    this.xMovement = getRandomIntInclusive(1, 10);
    this.yMovement = getRandomIntInclusive(1, 10);
    this.yDirection = yDirection;
    this.xDirection = xDirection;
  }

  createRainbowDust(pattern) {
    if (pattern === 0) {
      this.shape.graphics.setStrokeStyle(1).beginStroke(createjs.Graphics.
        getHSL(Math.random() * 360, 100, 50)).drawCircle(0, 0, getRandomIntInclusive(5, 25));
    }
    else if (pattern === 1) {
      this.shape.graphics.beginFill(createjs.Graphics.getHSL(Math.random() * 360, 100, 50)).
        drawCircle(0, 0, getRandomIntInclusive(5, 25));
      var blurFilter = new createjs.BlurFilter(5, 5, 1);
      this.shape.filters = [blurFilter];
      var bounds = blurFilter.getBounds();

      this.shape.cache(-50 + bounds.x, -50 + bounds.y,
        100 + bounds.width, 100 + bounds.height);
    }
    else {
      this.shape.graphics.beginFill("#FF0").
        drawPolyStar(0, 0, getRandomIntInclusive(5, 15), 5, 0.5, -90);
    }
  }

  move() {
    this.shape.x += (this.xMovement * this.xDirection);
    this.shape.y += (this.yMovement * this.yDirection);
    this.shape.rotation++;
  }

  getRainbowDustShape() {
    return this.shape;
  }
}

/**Spawns enemies on a random time interval between 1 - 3.5 seconds**/
function randomEnemySpawn() {
  var randomSpawnTime = 1000 * getRandomIntInclusive(1, 3.5);
  timer = setTimeout(function () {
    addEnemy();
    randomEnemySpawn();
  }, randomSpawnTime);
}

function tick(event) {

  moveShip();

  /**Move projectiles**/
  projectiles.forEach(moveProjectiles);

  for (var x = 0; x < enemies.length; x++) {

    /**Check for ship collisions**/
    shipCollision(myShip, enemies[x]);

    /**Check for bullet collisions**/
    for (var y = 0; y < projectiles.length; y++) {
      bulletCollision(enemies[x], projectiles[y]);
    }
  }

  if (special) {
    for (var x = 0; x < enemyContainer.children.length; x++) {
      var xDistance = sonic.x - enemyContainer.children[x].x;
      var yDistance = sonic.y - enemyContainer.children[x].y;
      var distance = pythagorus(xDistance, yDistance);

      if (distance < sonic.radius + 25) {
        destroyEnemy(null, x);
        incrementScore();
      }
    }

    specialContainer.children[0].graphics.clear();
    specialContainer.children[0].radius += 5;
    increaseSuperSonic(specialContainer.children[0], specialContainer.children[0].radius);

    if (sonic.radius >= stage.canvas.width) {
      createjs.Tween.get(specialContainer.children[0])
        .to({ alpha: 0, visible: false }, 100);
      specialContainer.removeChildAt(0);
      special = false;
    }
  }

  handleComplete();
  particles.forEach(moveParticles);
  enemyContainer.children.forEach(moveEnemies);
  sphereContainer.children.forEach(moveBackground);
}

function moveShip() {
  //  multiplied by a factor to increase the speed
  var y = Math.sin(myShip.shape.rotation * DEGREE_TO_RADIAN) * myShip.getAcceleration();
  var x = Math.cos(myShip.shape.rotation * DEGREE_TO_RADIAN) * myShip.getAcceleration();
  
  // if rotating add to the ships radial acceleration
  if (left)
    myShip.shape.rotation += -2 - myShip.getAcceleration();
  else if (right)
    myShip.shape.rotation += 2 + myShip.getAcceleration();
  else if (up) 
    myShip.setAcceleration(myShip.getAcceleration() + 0.1);
  else if (down)
    myShip.setAcceleration(myShip.getAcceleration() - 0.1);

  // Slowly deccelerate 
  if (myShip.getAcceleration() > 0)
    myShip.setAcceleration(myShip.getAcceleration() - 0.01);
  else 
    myShip.setAcceleration(myShip.getAcceleration() + 0.01);

  // Update the ships position
  myShip.shape.x += x;
  myShip.shape.y -= y;
}

function moveEnemies(element, index, array) {
  enemies[index].move();
}

function addShip() {
  myShip = new Ship();
  shipContainer.addChild(myShip.shape);
}

function addEnemy() {
  if (!SEEKER) {
    enemies.push(new Enemy());
  }
  else {
    enemies.push(new SeekerEnemy());
    SEEKER = false;
  }

  enemyContainer.addChild(enemies[enemies.length - 1].shape);
  createjs.Tween.get(enemies[enemies.length - 1].shape)
    .to({ alpha: 1, visible: true }, 500);
}

/*** Projectile Functions ***/
function shoot() {
  projectiles.push(new Projectile(myShip.shape.x, myShip.shape.y,
    myShip.shape.rotation));
  bulletContainer.addChild(projectiles[projectiles.length - 1].getProjectileShape());
}

function moveProjectiles(element, index, array) {
  array[index].move();

  /**Remove offstage bulletContainer**/
  if (array[index].getXOffset() < 0 || array[index].getXOffset() > stage.canvas.width) {
    bulletContainer.removeChildAt(index);
    projectiles.splice(projectiles.indexOf(array[index]), 1);
  }
  else if (array[index].getYOffset() < 0 || array[index].getYOffset() > stage.canvas.height) {
    bulletContainer.removeChildAt(index);
    projectiles.splice(projectiles.indexOf(array[index]), 1);
  }
}

/**Ship collision detection**/
function shipCollision(ship, enemy) {
  var distanceTwo = pythagorus(distanceCalc(ship.shape.x, enemy.getXOffset()),
    distanceCalc(ship.shape.y, enemy.getYOffset()));

  if (distanceTwo < 15 + 25 && !RESPAWN) {
    enemy.destroy();
    cleanContainer(enemyContainer, enemy.getEnemyShape());
    if (--lives <= 0)
      gameover();
    else
      resetShip();

    score_life_text.text = "lives: " + lives + "  Score: " + score;
  }
}

function bulletCollision(enemy, projectile) {
  var distanceOne = pythagorus(distanceCalc(projectile.getXOffset(), enemy.getXOffset()),
    distanceCalc(projectile.getYOffset(), enemy.getYOffset()));

  if (distanceOne < 5 + 25) {
    enemy.destroy();
    projectile.destroy();
    cleanContainer(enemyContainer, enemy.getEnemyShape());
    cleanContainer(bulletContainer, projectile.getProjectileShape());
    incrementScore();
  }
}

function gameover() {
  clearTimeout(timer);
  //clearInterval(nIntervId);
  RESPAWN = true;

  for (x = 0; x < enemies.length; x++) {
    createjs.Tween.get(enemies[x].getEnemyShape())
      .to({ alpha: 0, visible: false }, 100);
    addParticles(enemies[x].getXOffset(), enemies[x].getYOffset(), getRandomIntInclusive(7, 17));
  }

  setTimeout(enemyContainer.removeAllChildren(), 100);
  setTimeout(bulletContainer.removeAllChildren(), 100);

  enemies.length = 0;
}

/**Gives the ship a two second window after being hit**/
function resetShip() {
  createjs.Tween.get(myShip.shape)
    .to({ alpha: 0 }, 500).to({ alpha: 1 }, 500).to({ alpha: 0 }, 500).to({ alpha: 1 }, 500);
  RESPAWN = true;
  setTimeout(function () {
    RESPAWN = false;
  }, 2000);
}

/** Background Functions **/
function moveBackground(element, index, array) {
  sphereContainer.children[index].y -= spheres[index].rise;

  createjs.Tween.get(spheres[index].shape)
    .to({ alpha: 1, visible: true }, 500);

  if (array[index].y < -15)
    sphereContainer.removeChildAt(index);
}

function addSphere() {
  var sphere = new createjs.Shape();
  sphere.graphics.beginFill(createjs.Graphics.getHSL(Math.random() * 360, 100, 50)).drawCircle(0, 0, 30);
  sphere.x = Math.random() * stage.canvas.width;
  sphere.y = getRandomIntInclusive(stage.canvas.height, stage.canvas.height + 15);
  sphere.alpha = 0;

  spheres.push(new createSphere(sphere));

  sphereContainer.addChild(spheres[spheres.length - 1].shape);
  createjs.Tween.get(spheres[spheres.length - 1].shape)
    .to({ alpha: 0.1, visible: true }, 500);
}

function createSphere(sphere) {
  this.shape = sphere;
  this.rise = getRandomIntInclusive(1, 5);
}

/** Particle Functions **/
function moveParticles(element, index, array) {
  array[index].move();
}

function addParticles(x, y, amount) {
  while (amount > 0) {
    var randInt = getRandomIntInclusive(0, 2);
    var xDirection;
    var yDirection;

    if (getRandomIntInclusive(0, 1) > 0) {
      yDirection = 1;
    }
    else
      yDirection = -1;

    if (getRandomIntInclusive(0, 1) > 0) {
      xDirection = 1;
    }
    else
      xDirection = -1;

    particles.push(new RainbowDust(x, y, randInt, xDirection, yDirection));
    particles[particles.length - 1].createRainbowDust(randInt);
    particleContainer.addChild(particles[particles.length - 1].getRainbowDustShape());
    amount--;
  }

  for (x = 0; x < particles.length; x++) {
    createjs.Tween.get(particles[x].getRainbowDustShape())
      .to({ alpha: 0, visible: false }, 500);
    particles.pop
  }
  //TODO: figure out how to release this resource appropriately array should be local
  //particles.length = 0;
}

function superSonic() {
  special = true;
  sonic.radius = 30;
  sonic.alpha = 1;
  sonic.visible = true;
  sonic.graphics.setStrokeStyle(10).beginStroke(createjs.Graphics.getHSL(Math.random() * 360, 100, 50)).drawCircle(0, 0, sonic.radius);

  sonic.x = triangle.x;
  sonic.y = triangle.y;

  specialContainer.addChild(sonic);
}

function increaseSuperSonic(aShape, radius) {
  aShape.graphics.setStrokeStyle(10).beginStroke(createjs.Graphics.getHSL(Math.random() * 360, 100, 50)).drawCircle(0, 0, radius);
}

function handleComplete() {
  for (var x = 0; x < enemies.length; x++) {
    //**Check width boundaries**//
    if (enemies[x].getYOffset() < 25 || enemies[x].getYOffset() + 25 > stage.canvas.height) {
      enemies[x].setYDirection(-enemies[x].getYDirection());
    }

    //**Check height boundaries**//
    if (enemies[x].getXOffset() < 25 || enemies[x].getXOffset() + 25 > stage.canvas.width) {
      enemies[x].setXDirection(-enemies[x].getXDirection());
    }
  }
}

function pythagorus(a, b) {
  return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
}

function distanceCalc(a, b) {
  return a - b;
}

function incrementScore() {
  score += 100;
  if (score % 500 == 0)
    SEEKER = true;

  score_life_text.text = "lives: " + lives + "  Score: " + score;
}

function cleanContainer(container, shape) {
  container.removeChild(shape);
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

$(document).keydown(function (event) {
  switch (event.keyCode) {
    case KEYCODE_LEFT:
      left = true;
      break;
    case KEYCODE_RIGHT:
      right = true;
      break;
    case KEYCODE_UP:
      up = true;
      break;
    case KEYCODE_DOWN:
      down = true;
      break;
  }
});

$(document).keyup(function (event) {
  switch (event.keyCode) {
    case KEYCODE_LEFT:
      left = false;
      break;
    case KEYCODE_RIGHT:
      right = false;
      break;
    case KEYCODE_UP:
      up = false;
      break;
    case KEYCODE_DOWN:
      down = false;
      break;
  }
});

function calculateTriangleXY(C) {
  var B = 180;
  // solve for A
  var A = 180 - C - B;
  // solve c and a
  var c = (15 * Math.sin(toRadians(C))) / Math.sin(toRadians(B));
  var a = (c * Math.sin(toRadians(A))) / Math.sin(toRadians(C));
  // return x/y sides
  return { x: a, y: c }
}

function toRadians(deg) {
  return deg / 180 * -Math.PI;
}

/*(document).keydown(function (event) {
  if (event.which == 65) {
    triangle.rotation -= 7;
  }
  else if (event.which == 68) {
    triangle.rotation += 7;
  }
  /**else if (event.which == 32) {
    superSonic();
  }**/
  /*else if (event.which == 32 && lives == 0) {
    //initialize();
    randomEnemySpawn();
    //nIntervId = setInterval(addSphere, 1000 * getRandomIntInclusive(0.1, 1));
    RESPAWN = false;
    lives = 3;
    score = 0;
    score_life_text.text = "lives: " + lives + "  Score: " + score;
  }
});*/
