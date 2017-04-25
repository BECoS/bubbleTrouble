var stage;
var triangle;
var sphereContainer = new createjs.Container();
var bulletContainer = new createjs.Container();
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
var degToRad = -Math.PI / 180;
var score = 0;
var nIntervId;
//var enemyInterval;
var special = false;
var sonic = new createjs.Shape();
var tempShield = false;
var lives = 3;
var timer;
var SEEKER = false;

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

  triangle = new createjs.Shape();
  triangle.graphics.beginFill('DeepSkyBlue');
  triangle.graphics.moveTo(0, 0).lineTo(10, 15).lineTo(0, 30).lineTo(30, 15).lineTo(0, 0);
  triangle.regX = 15;
  triangle.regY = 15;
  triangle.x = triangle.y = 100;

  bulletContainer.x = 0;
  bulletContainer.y = 0;

  stage.addChild(sphereContainer);
  stage.addChild(triangle);
  stage.addChild(bulletContainer);
  stage.addChild(specialContainer);
  stage.addChild(enemyContainer);
  stage.addChild(particleContainer);
  stage.addChild(score_life_text);

  stage.on("stagemousemove", function (evt) {
    if (oldX) {
      triangle.x = evt.stageX;
      triangle.y = evt.stageY;
    }

    oldX = evt.stageX;
    oldY = evt.stageY;
  })

  //Spawns enemies on a random time interval between 1 - 3 seconds
  //nIntervId = setInterval(addSphere, 1000 * getRandomIntInclusive(0.1, 1));

  stage.on("stagemousedown", function () {
    if (!tempShield)
      shoot();
  })

  randomEnemySpawn();
});

class Enemy {
  constructor() {
    this.enemyShape = new createjs.Shape();
    this.enemyShape.graphics.beginFill('black').drawCircle(0, 0, 25);
    this.enemyShape.x = getRandomIntInclusive(26, 474);
    this.enemyShape.y = getRandomIntInclusive(26, 474);
    this.enemyShape.alpha = 0;
    //this.shape = enemy;
    this.yDirection = 1;
    this.xDirection = 1;
    this.xMovement = getRandomIntInclusive(1, 10);
    this.yMovement = getRandomIntInclusive(1, 10);
  }

  getEnemyShape() {
    return this.enemyShape;
  }

  getXOffset() {
    return this.enemyShape.x;
  }

  getYOffset() {
    return this.enemyShape.y;
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
    this.enemyShape.x += (this.xMovement * this.xDirection);
    this.enemyShape.y += (this.yMovement * this.yDirection);
  }

  destroy() {
    createjs.Tween.get(this.enemyShape)
      .to({ alpha: 0, visible: false }, 100);

    addParticles(this.enemyShape.x, this.enemyShape.y, getRandomIntInclusive(7, 17));
    enemies.splice(enemyContainer.getChildIndex(this.enemyShape), 1);
  }
}

class SeekerEnemy extends Enemy {
  constructor() {
    super();
  }

  move() {
    var arcTan = Math.atan2(triangle.y - this.enemyShape.y,
      triangle.x - this.enemyShape.x);

    this.enemyShape.x += (Math.cos(arcTan) * this.run);
    this.enemyShape.y += (Math.sin(arcTan) * this.rise);
  }
}

class Projectile {
  constructor() {
    this.projectileShape = new createjs.Shape();
    this.projectileShape.graphics.beginFill('black').drawCircle(0, 0, 5);
    this.projectileShape.regX = 0;
    this.projectileShape.regY = 0;
    this.projectileShape.x = triangle.x;
    this.projectileShape.y = triangle.y;
    this.projectileShape.rotation = triangle.rotation;
  }

  getProjectileShape() {
    return this.projectileShape;
  }

  getXOffset() {
    return this.projectileShape.x;
  }

    getYOffset() {
    return this.projectileShape.y;
  }

  getRotation() {
    return this.projectileShape.rotation;
  }

  destroy() {
    createjs.Tween.get(this.projectileShape)
      .to({ alpha: 0, visible: false }, 100);
  }

  move() {
    var verticalMovement = Math.sin(this.projectileShape.rotation * degToRad) * 30;
    var horizontalMovement = Math.cos(this.projectileShape.rotation * degToRad) * 30;

    this.projectileShape.x += horizontalMovement;
    this.projectileShape.y -= verticalMovement;
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
  /**Move projectiles**/
  projectiles.forEach(moveProjectiles);

  for (var x = 0; x < enemies.length; x++) {

    /**Check for ship collisions**/
    shipCollision(enemies[x]);

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
  particleContainer.children.forEach(moveParticles);
  enemyContainer.children.forEach(moveEnemies);
  sphereContainer.children.forEach(moveBackground);
}

/*** Enemy Functions ***/
function destroyBullet(bullet) {
  bullet.destroy();
}

function destroyEnemy(enemy) {
  enemy.destroy();
}

function moveEnemies(element, index, array) {
  enemies[index].move();
}

function addEnemy() {
  if (!SEEKER) {
    enemies.push(new Enemy());
  }
  else {
    enemies.push(new SeekerEnemy());
    SEEKER = false;
  }

  enemyContainer.addChild(enemies[enemies.length - 1].enemyShape);
  createjs.Tween.get(enemies[enemies.length - 1].enemyShape)
    .to({ alpha: 1, visible: true }, 500);
}

/*** Projectile Functions ***/
function shoot() {
  projectiles.push(new Projectile())
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
function shipCollision(enemy) {
  var distanceTwo = pythagorus(distanceCalc(triangle.x, enemy.getXOffset()),
    distanceCalc(triangle.y, enemy.getYOffset()));

  if (distanceTwo < 15 + 25 && !tempShield) {
    destroyEnemy(enemy);
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
    destroyEnemy(enemy);
    destroyBullet(projectile);
    cleanContainer(enemyContainer, enemy.getEnemyShape());
    cleanContainer(bulletContainer, projectile.getProjectileShape());
    incrementScore();
  }
}

function gameover() {
  clearTimeout(timer);
  clearInterval(nIntervId);
  tempShield = true;

  for (x = 0; x < enemies.length; x++) {
    createjs.Tween.get(enemyContainer.children[x])
      .to({ alpha: 0, visible: false }, 100);
    addParticles(enemyContainer.children[x].x, enemyContainer.children[x].y, getRandomIntInclusive(7, 17));
  }

  setTimeout(enemyContainer.removeAllChildren(), 100);
  setTimeout(bulletContainer.removeAllChildren(), 100);

  enemies.length = 0;
}

/**Gives the ship a two second window after being hit**/
function resetShip() {
  createjs.Tween.get(triangle)
    .to({ alpha: 0 }, 500).to({ alpha: 1 }, 500).to({ alpha: 0 }, 500).to({ alpha: 1 }, 500);
  tempShield = true;
  setTimeout(function () {
    tempShield = false;
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
  particleContainer.children[index].x += (particles[index].run * particles[index].xDirection);
  particleContainer.children[index].y += (particles[index].rise * particles[index].yDirection);
  particleContainer.children[index].rotation++;
}

function addParticles(x, y, amount) {
  while (amount > 0) {
    var particle = new createjs.Shape();
    var randInt = getRandomIntInclusive(0, 2);

    if (randInt === 0) {
      particle.graphics.setStrokeStyle(1).beginStroke(createjs.Graphics.getHSL(Math.random() * 360, 100, 50)).drawCircle(0, 0, getRandomIntInclusive(5, 25));
    }
    else if (randInt === 1) {
      particle.graphics.beginFill(createjs.Graphics.getHSL(Math.random() * 360, 100, 50)).drawCircle(0, 0, getRandomIntInclusive(5, 25));
      var blurFilter = new createjs.BlurFilter(5, 5, 1);
      particle.filters = [blurFilter];
      var bounds = blurFilter.getBounds();

      particle.cache(-50 + bounds.x, -50 + bounds.y, 100 + bounds.width, 100 + bounds.height);
    }
    else {
      particle.graphics.beginFill("#FF0").drawPolyStar(0, 0, getRandomIntInclusive(5, 15), 5, 0.5, -90);
    }

    particle.x = x;
    particle.y = y;
    particle.alpha = 1;

    particles.push(new createParticle(particle));

    particleContainer.addChild(particles[particles.length - 1].shape);
    amount--;
  }

  for (x = 0; x < particles.length; x++) {
    createjs.Tween.get(particles[x].shape)
      .to({ alpha: 0, visible: false }, 400);
  }
}

function createParticle(particle) {
  this.shape = particle;

  if (getRandomIntInclusive(0, 1) > 0) {
    this.yDirection = 1;
  }
  else
    this.yDirection = -1;

  if (getRandomIntInclusive(0, 1) > 0) {
    this.xDirection = 1;
  }
  else
    this.xDirection = -1;

  this.rise = Math.floor(Math.random() * 11);
  this.run = Math.floor(Math.random() * 11);
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
  if (event.which == 65) {
    triangle.rotation -= 7;
  }
  else if (event.which == 68) {
    triangle.rotation += 7;
  }
  /**else if (event.which == 32) {
    superSonic();
  }**/
  else if (event.which == 32 && lives == 0) {
    //initialize();
    randomEnemySpawn();
    //nIntervId = setInterval(addSphere, 1000 * getRandomIntInclusive(0.1, 1));
    tempShield = false;
    lives = 3;
    score = 0;
    score_life_text.text = "lives: " + lives + "  Score: " + score;
  }
});
