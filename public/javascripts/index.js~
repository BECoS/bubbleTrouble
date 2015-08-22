var stage;
var triangle;
var bulletContainer = new createjs.Container();
var enemyContainer = new createjs.Container();
var enemies = [];
var oldX;
var oldY;
var degToRad = -Math.PI / 180;

$(document).ready(function() {
  var context = $('canvas')[0].getContext('2d');
  context.canvas.width = 500;
  context.canvas.height = 500;

  stage = new createjs.Stage('canvas');
  stage.mouseEventsEnabled = true;

  createjs.Ticker.setFPS(60);
  createjs.Ticker.on('tick', tick);
  createjs.Ticker.addEventListener('tick', stage);
 
  triangle = new createjs.Shape();
  triangle.graphics.beginFill('DeepSkyBlue');
  triangle.graphics.moveTo(0, 0).lineTo(10, 15).lineTo(0, 30).lineTo(30, 15).lineTo(0, 0);
  triangle.regX = 15;
  triangle.regY = 15;
  triangle.x = triangle.y = 100;

  bulletContainer.x = 0;
  bulletContainer.y = 0;

  stage.addChild(triangle);
  stage.addChild(bulletContainer);
  stage.addChild(enemyContainer);
  
  stage.on("stagemousemove", function(evt) {
    if (oldX) {
      triangle.x = evt.stageX;
      triangle.y = evt.stageY;
    }

    oldX = evt.stageX;
    oldY = evt.stageY;
  })

  stage.on("stagemousedown", shoot)
  stage.on("stagemouseup", addEnemy)
});

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

function tick(event) {
  /**Move projectiles**/
  bulletContainer.children.forEach(moveProjectiles);

  if (bulletContainer.children.length > 0 ) {
    for (var x = 0; x < bulletContainer.children.length; x++) {
      for (var y = 0; y < enemyContainer.children.length; y++) {
        var xDistance = bulletContainer.children[x].x - enemyContainer.children[y].x;
        var yDistance = bulletContainer.children[x].y - enemyContainer.children[y].y;
        var distance = pythagorus(xDistance, yDistance);

        if (distance < 5 + 25) {
          destroyEnemy(x, y);
        }
      }
    }
  }

  handleComplete();
  enemyContainer.children.forEach(moveEnemies);
}

function pythagorus(a, b) {
  return Math.sqrt(Math.pow(a, 2) +  Math.pow(b, 2));
}

function destroyEnemy(bulletIndex, enemyIndex) {
  createjs.Tween.get(enemyContainer.children[enemyIndex])
    .to({alpha:0, visible:false}, 300);
  
  //Needs a delay here
  //enemyContainer.removeChildAt(enemyIndex);
  //bulletContainer.removeChildAt(bulletIndex);
}

function moveProjectiles(element, index, array) {
  var rise = Math.sin(array[index].rotation * degToRad) * 30;
  var run = Math.cos(array[index].rotation * degToRad) * 30;

  array[index].x += run;
  array[index].y -= rise;

  /**Remove offstage bulletContainer**/
  if (array[index].x < 0 || array[index].x > stage.canvas.width)
    bulletContainer.removeChildAt(index);
  else if (array[index].y < 0 || array[index].y > stage.canvas.height)
    bulletContainer.removeChildAt(index);
}

function moveEnemies(element, index, array) {
  enemyContainer.children[index].x += (enemies[index].run * enemies[index].xDirection);
  enemyContainer.children[index].y += (enemies[index].rise * enemies[index].yDirection);
}

function addEnemy() {
  var enemy = new createjs.Shape();
  enemy.graphics.beginFill('red').drawCircle(0, 0, 25);
  enemy.x = Math.random() * stage.canvas.width;
  enemy.y = Math.random() * stage.canvas.height;
  enemy.alpha = 0;

  enemies.push(new createEnemy(enemy));

  enemyContainer.addChild(enemies[enemies.length - 1].shape);
  createjs.Tween.get(enemies[enemies.length - 1].shape)
    .to({alpha:1, visible:true}, 500);
    //.call(handleComplete);
  /*for (var i = 0; i < 20; i++) {
    var circle = new createjs.Shape();
    circle.graphics.setStrokeStyle(15);
    circle.graphics.beginStroke('#113355');
    circle.graphics.drawCircle(0, 0, (i + 1) * 4);
    circle.alpha = 1 - i * 0.02;
    circle.x = 100;
    circle.y = 100;
    circle.compositeOperation = 'lighter';

    enemyContainer.addChild(circle);
  }*/
  
}

function createEnemy(enemy) {
  this.shape = enemy;
  this.yDirection = 1;
  this.xDirection = 1;
  this.rise = Math.floor(Math.random() * 11);
  this.run = Math.floor(Math.random() * 11);
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

$(document).keydown(function(event) {
  if (event.which == 37) {
    triangle.rotation--;
  }
  else if (event.which == 39) {
    triangle.rotation++;
  }
});
