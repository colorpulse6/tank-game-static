import * as PIXI from "pixi.js";
import {
  bgTexture,
  bulletTexture,
  hayTexture,
  wallTexture,
  redTankTexture,
  greenTankTexture,
  blueTankTexture,
} from "./textures";

const canvas = document.getElementById("my-canvas") as HTMLCanvasElement;

let _w = window.innerWidth;
let _h = window.innerHeight;

//PIXI application helper class
let app = new PIXI.Application({
  view: canvas,
  width: _w,
  height: _h,
});

const screenWidth = app.renderer.screen.width;
const screenHeight = app.renderer.screen.height;

//Creat container for tank(necesary for rotation)

let tankContainer = new PIXI.Container();

//Create sprites
let bg = new PIXI.Sprite(bgTexture);
let bullet = new PIXI.Sprite(bulletTexture);
let redTank = new PIXI.Sprite(redTankTexture);
let greenTank = new PIXI.Sprite(greenTankTexture);
let blueTank = new PIXI.Sprite(blueTankTexture);

let tanks = [redTank, greenTank, blueTank];

tanks.map((tank) => {
  tank.height = 40;
  tank.width = 40;
});

//Set tank names for conditional
redTank.name = "redTank";
greenTank.name = "greenTank";
blueTank.name = "blueTank";
bg.width = screenWidth;
bg.height = screenHeight;
bullet.width = 15;
bullet.height = 15;
bullet.name = "bullet";

app.stage.addChild(bg);
//Set Image to Center
bg.x = screenWidth / 2;
bg.y = screenHeight / 2;
bg.anchor.x = 0.5;
bg.anchor.y = 0.5;

//Set initial tank
let activeTank = redTank;

activeTank.x = screenWidth / 2;
activeTank.y = screenHeight - 100;
//Add to container
app.stage.addChild(tankContainer);

tankContainer.addChild(activeTank);
tankContainer.x = activeTank.x;
tankContainer.y = activeTank.y;
tankContainer.name = "activeTank";
tankContainer.pivot.x = activeTank.x + 25;
tankContainer.pivot.y = activeTank.y + 25;

//Set initial tank coords on load
let tankPos = {
  x: activeTank.x,
  y: activeTank.y,
};

function toggleTank() {
  tankContainer.removeChild(activeTank);
  switch (activeTank.name) {
    case "redTank":
      activeTank = blueTank;
      break;
    case "blueTank":
      activeTank = greenTank;
      break;
    case "greenTank":
      activeTank = redTank;
  }
  activeTank.x = tankPos.x;
  activeTank.y = tankPos.y;

  tankContainer.addChild(activeTank);
}

//Obstacle Type
type obsElement = {
  sprite: PIXI.Sprite;
  health: number;
};

let hayArray: Array<obsElement> = [];
let wallArray: Array<obsElement> = [];

addToStage(50, "wall", wallTexture);
addToStage(25, "hay", hayTexture);

function addToStage(amount: number, name: string, texture: PIXI.Texture) {
  for (let i = 0; i < amount; i++) {
    addObs(name, texture);
  }
}

function addObs(name: string, texture: PIXI.Texture) {
  let obsElement;

  //Create Obstacles
  obsElement = { sprite: new PIXI.Sprite(texture), health: 100 };

  let randomX = Math.floor(Math.random() * (_w - 100)) + 20;
  let randomY = Math.floor(Math.random() * (_h - 150)) + 20;
  obsElement.sprite.x = randomX;
  obsElement.sprite.y = randomY;
  obsElement.sprite.name = name;

  if (name === "hay") {
    obsElement.sprite.height = 25;
    obsElement.sprite.width = 25;
  } else {
    obsElement.sprite.width = 50;
    obsElement.sprite.height = 15;
  }
  if (name === "hay") {
    hayArray.push(obsElement);
  }
  if (name === "wall") {
    hayArray.push(obsElement);
  }
  app.stage.addChild(obsElement.sprite);
}

//Handle General Collision
function collision(a: PIXI.Sprite, b: PIXI.Sprite) {
  let ab = a.getBounds();
  let bb = b.getBounds();
  return (
    ab.x + ab.width > bb.x &&
    ab.x < bb.x + bb.width &&
    ab.y + ab.height > bb.y &&
    ab.y < bb.y + bb.height
  );
}

//Handle Obstacle Exits
function handleExit(item: obsElement, array: Array<obsElement>) {
  app.stage.removeChild(item.sprite);
  array.splice(array.indexOf(item), 1);
}

//Handle Bullet Exits
function handleExitBullets(item: PIXI.Sprite, array: Array<PIXI.Sprite>) {
  app.stage.removeChild(item);
  array.splice(array.indexOf(item), 1);
}

let bullets: Array<PIXI.Sprite> = [];
let bulletSpeed = 5;
let count = 0;
let damage: number;

//Collision detection (for bullets)
function detectHit(bullet: PIXI.Sprite, obs: obsElement) {
  if (collision(bullet, obs.sprite)) {
    //Remove bullets on target hit
    handleExitBullets(bullet, bullets);

    //Remove health from hay
    if (obs.sprite.name === "hay") {
      switch (activeTank.name) {
        case "redTank":
          damage = 10;
          break;
        case "blueTank":
          damage = 20;
          break;
        case "greenTank":
          damage = 25;
          break;
      }
      obs.health -= damage;
    }

    //Remove dead targets
    if (obs.health === 0) {
      count++;
      handleExit(obs, hayArray);
    }

    //Set score
    let score = document.getElementById("score") as HTMLElement;
    score.innerHTML = `Score: ${String(count)}`;
  }
}

//Collision detection (for tank)
function tankCollision(obsArray: Array<obsElement>) {
  for (let i = 0; i < obsArray.length; i++) {
    let eachObs = obsArray[i];
    if (collision(activeTank, eachObs.sprite)) {
      activeTank.y = eachObs.sprite.y + eachObs.sprite.height + 50;
    }
  }
}

//Render Bullets
function shoot(rotation: number, startPosition: { x: number; y: number }) {
  bullet.x = startPosition.x;
  bullet.y = startPosition.y;
  bullet.rotation = rotation;
  bullets.push(bullet);
  if (bullet.y <= 0) {
    app.stage.removeChild(bullet);
  }
  app.stage.addChild(bullet);
}

//Handle Controls
let tankSpeed = 15;
function onKeyDown(e: KeyboardEvent) {
  switch (e.code) {
    case "ArrowRight":
      activeTank.x += tankSpeed;
      //Set moving tank coords
      tankPos.x = activeTank.x;
      tankContainer.pivot.x = activeTank.x + 25;
      tankContainer.x = activeTank.x;
      break;
    case "ArrowLeft":
      activeTank.x -= tankSpeed;
      tankPos.x = activeTank.x;
      tankContainer.pivot.x = activeTank.x + 25;
      tankContainer.x = activeTank.x;

      break;
    case "ArrowUp":
      activeTank.y -= tankSpeed;
      tankPos.y = activeTank.y;
      tankContainer.pivot.y = activeTank.y + 25;
      tankContainer.y = activeTank.y;
      break;
    case "ArrowDown":
      activeTank.y += tankSpeed;
      tankPos.y = activeTank.y;
      tankContainer.pivot.y = activeTank.y + 25;
      tankContainer.y = activeTank.y;
      break;
    case "KeyQ":
      tankContainer.rotation -= 0.1;
      break;
    case "KeyW":
      tankContainer.rotation += 0.1;
      break;
    case "KeyT":
      toggleTank();
      break;
    case "Space":
      shoot(tankContainer.rotation, {
        x: activeTank.position.x - activeTank.width / 2,
        y: activeTank.position.y,
      });
      break;
  }
  //Prevent tank from rotating past its x axis
  if (tankContainer.rotation < -1.6) {
    tankContainer.rotation = -1.6;
  }
  if (tankContainer.rotation > 1.6) {
    tankContainer.rotation = 1.6;
  }
}

document.addEventListener("keydown", onKeyDown);

const animate = () => {
  requestAnimationFrame(animate);
  for (var k = 0; k < bullets.length; k++) {
    let eachBullet = bullets[k];

    //Rotate bullet pos with tank
    eachBullet.position.x += eachBullet.rotation * bulletSpeed;
    eachBullet.position.y +=
      -Math.abs(Math.cos(eachBullet.rotation)) * bulletSpeed;

    //Link Bullet to hay
    for (let i = 0; i < hayArray.length; i++) {
      let eachHay = hayArray[i];
      detectHit(eachBullet, eachHay);
    }

    //Link Bullet to wall
    for (let i = 0; i < wallArray.length; i++) {
      let eachWall = wallArray[i];
      detectHit(eachBullet, eachWall);
    }
  }
  tankCollision(wallArray);
  tankCollision(hayArray);
};
animate();
