var stage;
var triangle;
var sphereContainer = new createjs.Container();
var bulletContainer = new createjs.Container();
var enemyContainer = new createjs.Container();
var particleContainer = new createjs.Container();
var specialContainer = new createjs.Container();
var scoreDisplay = new createjs.Text('Lives: 3  Score: 0', '20px Arial');
var enemies = [];
var spheres = [];
var particles = [];
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

$(document).ready(function() {
  var context = $('canvas')[0].getContext('2d');
  context.canvas.width = 500;
  context.canvas.height = 500;

  stage = new createjs.Stage('canvas');
  stage.mouseEventsEnabled = true;

  createjs.Ticker.setFPS(45);
  createjs.Ticker.on('tick', tick);
  createjs.Ticker.addEventListener('tick', stage);

  scoreDisplay.x = context.canvas.width - ((1/2)*context.canvas.width);
  scoreDisplay.baseLine = 'alphabetic';
 
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
  stage.addChild(scoreDisplay);
  
  stage.on("stagemousemove", function(evt) {
    if (oldX) {
      triangle.x = evt.stageX;
      triangle.y = evt.stageY;
    }

    oldX = evt.stageX;
    oldY = evt.stageY;
  })
  
  //Spawns enemies on a random time interval between 1 - 3 seconds
    //nIntervId = setInterval(addSphere, 1000 * getRandomIntInclusive(0.1, 1));

  stage.on("stagemousedown", function() {
    if (!tempShield)
      shoot();
    })

  randomEnemySpawn();
});

/**Spawns enemies on a random time interval between 1 - 3.5 seconds**/
function randomEnemySpawn() {
  var randomSpawnTime = 1000 * getRandomIntInclusive(1, 3.5);
  timer = setTimeout(function() {
    addEnemy();
    randomEnemySpawn();
  }, randomSpawnTime);
}

function tick(event) {
  /**Move projectiles**/
  bulletContainer.children.forEach(moveProjectiles);

  for (var x = 0; x < enemyContainer.children.length; x++) {
    
    /**Check for ship collisions**/
    shipCollision(enemyContainer.children[x]);

    /**Check for bullet collisions**/
    for (var y = 0; y < bulletContainer.children.length; y++) {
      bulletCollision(enemyContainer.children[x], bulletContainer.children[y]);
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
        .to({alpha:0, visible:false}, 100);
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
  createjs.Tween.get(bullet)
    .to({alpha:0, visible:false}, 100);  
}

function destroyEnemy(enemy) {
  createjs.Tween.get(enemy)
    .to({alpha:0, visible:false}, 100);
  
  addParticles(enemy.x, enemy.y, getRandomIntInclusive(7, 17));
  enemies.splice(enemyContainer.getChildIndex(enemy), 1);
}

function moveEnemies(element, index, array) {
  if (enemies[index].homing) {
    arcTan = Math.atan2(triangle.y - enemyContainer.children[index].y,
      triangle.x - enemyContainer.children[index].x);
  
    enemyContainer.children[index].x += (Math.cos(arcTan) * enemies[index].run);
    enemyContainer.children[index].y += (Math.sin(arcTan) * enemies[index].rise)
  }
  else {
    enemyContainer.children[index].x += (enemies[index].run * enemies[index].xDirection);
    enemyContainer.children[index].y += (enemies[index].rise * enemies[index].yDirection);
  }
}

function createEnemy(enemy, homing) {
  this.shape = enemy;
  this.yDirection = 1;
  this.xDirection = 1;
  this.rise = Math.floor(Math.random() * 11);
  this.run = Math.floor(Math.random() * 11);
  this.homing = homing;
}

function addEnemy() {
  var enemy = new createjs.Shape();
  enemy.graphics.beginFill('black').drawCircle(0, 0, 25);
  enemy.x = getRandomIntInclusive(26,474);
  enemy.y = getRandomIntInclusive(26,474);
  enemy.alpha = 0;
  
  if (score % 500 == 0 && score != 0)
    enemies.push(new createEnemy(enemy, true));
  else
    enemies.push(new createEnemy(enemy, false));

  enemyContainer.addChild(enemies[enemies.length - 1].shape);
  createjs.Tween.get(enemies[enemies.length - 1].shape)
    .to({alpha:1, visible:true}, 500);
}

/*** Projectile Functions ***/
function shoot() {
  var shot = new createjs.Shape();
  shot.graphics.beginFill('black').drawCircle(0, 0, 5);
  shot.regX = 0;
  shot.regY = 0;
  shot.x = triangle.x;
  shot.y = triangle.y;
  shot.rotation = triangle.rotation;

  bulletContainer.addChild(shot);
}

function moveProjectiles(element, index, array) {
  var rise = Math.sin(array[index].rotation * degToRad) * 30;
  var run = Math.cos(array[index].rotation * degToRad) * 30;

  array[index].x += run;
  array[index].y -= rise;

  //clean this up
  /**Remove offstage bulletContainer**/
  if (array[index].x < 0 || array[index].x > stage.canvas.width)
    bulletContainer.removeChildAt(index);
  else if (array[index].y < 0 || array[index].y > stage.canvas.height)
    bulletContainer.removeChildAt(index);
}

/**Ship collision detection**/
function shipCollision(enemy) {
  var distanceTwo = pythagorus(distanceCalc(triangle.x, enemy.x),
    distanceCalc(triangle.y, enemy.y));

  if (distanceTwo < 15 + 25 && !tempShield) {
    destroyEnemy(enemy);
    cleanContainer(enemyContainer, enemy);
    if (--lives <= 0)
      gameover();
    else
      resetShip();

    scoreDisplay.text = "lives: " + lives + "  Score: " + score;
  }
}

function bulletCollision(enemy, bullet) {
  var distanceOne = pythagorus(distanceCalc(bullet.x, enemy.x),
    distanceCalc(bullet.y, enemy.y));

  if (distanceOne < 5 + 25) {
    destroyEnemy(enemy);
    destroyBullet(bullet);
    cleanContainer(enemyContainer, enemy);
    cleanContainer(bulletContainer, bullet);
    incrementScore();
  }
}

function gameover() {
  clearTimeout(timer);
  clearInterval(nIntervId);
  tempShield = true;

  for (x = 0; x < enemies.length; x++) {
    createjs.Tween.get(enemyContainer.children[x])
    .to({alpha:0, visible:false}, 100);
    addParticles(enemyContainer.children[x].x, enemyContainer.children[x].y, getRandomIntInclusive(7, 17));
  }

  setTimeout(enemyContainer.removeAllChildren(), 100);
  setTimeout(bulletContainer.removeAllChildren(), 100);

  enemies.length = 0;
}

/**Gives the ship a two second window after being hit**/
function resetShip() {
  createjs.Tween.get(triangle)
    .to({alpha:0}, 500).to({alpha:1}, 500).to({alpha:0}, 500).to({alpha:1}, 500);
  tempShield = true;
  setTimeout(function() {
    tempShield = false;
  }, 2000);
}

/** Background Functions **/
function moveBackground(element, index, array) {
  sphereContainer.children[index].y -= spheres[index].rise;
  
  createjs.Tween.get(spheres[index].shape)
    .to({alpha:1, visible:true}, 500);  
  
  if (array[index].y < -15)
    sphereContainer.removeChildAt(index);
}

function addSphere() {
  var sphere = new createjs.Shape();
  sphere.graphics.beginFill(createjs.Graphics.getHSL(Math.random()*360,100,50)).drawCircle(0,0,30);
  sphere.x = Math.random() * stage.canvas.width;
  sphere.y = getRandomIntInclusive(stage.canvas.height, stage.canvas.height + 15);
  sphere.alpha = 0;  
  
  spheres.push(new createSphere(sphere));

  sphereContainer.addChild(spheres[spheres.length - 1].shape);
  createjs.Tween.get(spheres[spheres.length - 1].shape)
    .to({alpha:0.1, visible:true}, 500);  
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
    particle.graphics.setStrokeStyle(1).beginStroke(createjs.Graphics.getHSL(Math.random()*360,100,50)).drawCircle(0, 0, getRandomIntInclusive(5, 25));
  }
  else if (randInt === 1) {
    particle.graphics.beginFill(createjs.Graphics.getHSL(Math.random()*360,100,50)).drawCircle(0, 0, getRandomIntInclusive(5, 25));
    var blurFilter = new createjs.BlurFilter(5, 5, 1);
    particle.filters = [blurFilter];
    var bounds = blurFilter.getBounds();
      
    particle.cache(-50+bounds.x, -50+bounds.y, 100+bounds.width, 100+bounds.height);
  }
  else {
    particle.graphics.beginFill("#FF0").drawPolyStar(0, 0,  getRandomIntInclusive(5, 15), 5, 0.5, -90);
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
      .to({alpha:0, visible:false}, 400);
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
  sonic.graphics.setStrokeStyle(10).beginStroke(createjs.Graphics.getHSL(Math.random()*360,100,50)).drawCircle(0, 0, sonic.radius);
  
  sonic.x = triangle.x;
  sonic.y = triangle.y;
  
  specialContainer.addChild(sonic);
}

function increaseSuperSonic(aShape, radius) {
  aShape.graphics.setStrokeStyle(10).beginStroke(createjs.Graphics.getHSL(Math.random()*360,100,50)).drawCircle(0, 0, radius);
}

function handleComplete() {
  for (var x = 0; x < enemyContainer.children.length; x++) {
    //**Check width boundaries**//
    if (enemyContainer.children[x].y < 25 || enemyContainer.children[x].y + 25 > stage.canvas.height) {
      enemies[x].yDirection = -(enemies[x].yDirection);
    }
    
    //**Check height boundaries**//
    if (enemyContainer.children[x].x < 25 || enemyContainer.children[x].x + 25 > stage.canvas.width) {
      enemies[x].xDirection = -(enemies[x].xDirection);
    }
  }
}

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pythagorus(a, b) {
  return Math.sqrt(Math.pow(a, 2) +  Math.pow(b, 2));
}

function distanceCalc(a, b) {
  return a - b; 
} 

function incrementScore() {
  score += 100;
  scoreDisplay.text = "lives: " + lives + "  Score: " + score;
}

function cleanContainer(container, shape) {
  container.removeChild(shape);
}

$(document).keydown(function(event) {
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
    scoreDisplay.text = "lives: " + lives + "  Score: " + score;
  }
});
