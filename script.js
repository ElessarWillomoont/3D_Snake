async function readShader(id) {
  const req = await fetch(document.getElementById(id).src);
  return await req.text();
}

function createShader(gl, type, src) {
  let shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) return shader;

  console.error("Could not compile WebGL Shader", gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertShader, fragShader) {
  let program = gl.createProgram();
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);

  let success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) return program;

  console.error("Could not Link WebGL Program", gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

async function main() {
  const canvas = document.getElementById("canvas");
  const fpsDisplay = document.getElementById("fps-display");
  const statusDisplay = document.getElementById("game-status-display");
  const gl = canvas.getContext("webgl2");

  if (!gl) {
      alert("Could not initialize WebGL Context.");
      return;
  }

  // Set up canvas to be full screen
  function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Initialize shaders and program
  const vertShader = createShader(gl, gl.VERTEX_SHADER, await readShader("vert"));
  const fragShader = createShader(gl, gl.FRAGMENT_SHADER, await readShader("frag"));
  const program = createProgram(gl, vertShader, fragShader);

  const a_position = gl.getAttribLocation(program, "a_position");
  const a_uv = gl.getAttribLocation(program, "a_uv");

  const u_resolution = gl.getUniformLocation(program, "u_resolution");
  const u_time = gl.getUniformLocation(program, "u_time");
  const u_dt = gl.getUniformLocation(program, "u_dt");

  // Vertex data for a full-screen quad
  const data = new Float32Array([
      -1.0, -1.0,   0.0, 0.0,
       1.0, -1.0,   1.0, 0.0,
       1.0,  1.0,   1.0, 1.0,
      -1.0,  1.0,   0.0, 1.0,
  ]);
  const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(a_position);
  gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 4 * 4, 0);
  gl.enableVertexAttribArray(a_uv);
  gl.vertexAttribPointer(a_uv, 2, gl.FLOAT, false, 4 * 4, 2 * 4);

  const ebo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  // Time-related variables
  const time = {
      current_t: Date.now(),
      dts: [1 / 60],
      t: 0,
      dt: function () { return this.dts[0]; },
      update: function () {
          const new_t = Date.now();
          this.dts = [(new_t - this.current_t) / 1000, ...this.dts].slice(0, 10);
          this.t += this.dt();
          this.current_t = new_t;

          const avg_dt = this.dts.reduce((a, dt) => a + dt, 0) / this.dts.length;
          fpsDisplay.innerHTML = `${Math.round(1 / avg_dt)} FPS`;
          statusDisplay.innerHTML = `${gameStatus}`
      },
  };

  const u_msg = gl.getUniformLocation(program, "u_msg")//convert the user control

// consts for user control status
const controlUP = 1
const controlDown = 2
const controlLeft = 3
const controlRight = 4
const controlNo = 0


let userMessage = controlNo;
let currentDirection = controlNo;

// function setupControls() {
//   let startX, startY;

//   document.addEventListener('keydown', (event) => {
//     switch (event.key) {
//       case 'ArrowUp':
//         currentDirection = controlUP;
//         break;
//       case 'ArrowDown':
//         currentDirection = controlDown;
//         break;
//       case 'ArrowLeft':
//         currentDirection = controlLeft;
//         break;
//       case 'ArrowRight':
//         currentDirection = controlRight;
//         break;
//       default:
//         // Do nothing
//         break;
//     }
//   });

//   document.addEventListener('touchstart', (event) => {
//     event.preventDefault();
//     startX = event.touches[0].clientX;
//     startY = event.touches[0].clientY;
//   });

//   document.addEventListener('touchend', (event) => {
//     const endX = event.changedTouches[0].clientX;
//     const endY = event.changedTouches[0].clientY;

//     const diffX = endX - startX;
//     const diffY = endY - startY;

//     const angleThreshold = Math.tan(45 * Math.PI / 180);

//     if (Math.abs(diffX / diffY) > angleThreshold) {
//       if (diffX > 0) {
//         currentDirection = controlRight;
//       } else {
//         currentDirection = controlLeft;
//       }
//     } else if (Math.abs(diffY / diffX) > angleThreshold) {
//       if (diffY > 0) {
//         currentDirection = controlDown;
//       } else {
//         currentDirection = controlUP;
//       }
//     }
//   });
// }

function canvasControl() {
    let startX, startY;

    // handle the keyboard keys
    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'ArrowUp':
                userMessage = controlUP; // set to 1
                break;
            case 'ArrowDown':
                userMessage = controlDown; // set to 2
                break;
            case 'ArrowLeft':
                userMessage = controlLeft; // set to 3
                break;
            case 'ArrowRight':
                userMessage = controlRight; // set to 4
                break;
            default:
                userMessage = controlNo; // default
                break;
        }
    });

    document.addEventListener('touchstart', (event) => {
        event.preventDefault(); 
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
    });

    document.addEventListener('touchend', (event) => {
        const endX = event.changedTouches[0].clientX;
        const endY = event.changedTouches[0].clientY;

        const diffX = endX - startX;
        const diffY = endY - startY;

        // set the angle blockage
        const angleThreshold = Math.tan(45 * Math.PI / 180); // tan = 1

        if (Math.abs(diffX / diffY) > angleThreshold) {
            if (diffX > 0) {
                userMessage = controlRight; 
            } else {
                userMessage = controlLeft;
            }
        } else if (Math.abs(diffY / diffX) > angleThreshold) {
            if (diffY > 0) {
                userMessage = controlDown;
            } else {
                userMessage = controlUP;
            }
        }
    });
    // console.log(userMessage)
}

//variables for snake
const MAX_Grid_SIZE = 200 //maxium grid size, use to define the array converting size
const u_acctual_size = gl.getUniformLocation(program, "u_acctual_size")
const u_gridWidth = gl.getUniformLocation(program, "u_gridWidth")
const u_gridHeight = gl.getUniformLocation(program, "u_gridHeight")

//variables for the game board
const unUse = 0
const isEmpty = 1
const haveSnake = 2
const haveApple =3

let gameArray = new Array(MAX_Grid_SIZE).fill(unUse); // game array that store the messages(snake, apple, empty)
console.log(`grid width: ${gameArray}`);


//calculate the wide/heigt ratio, handle the grid info
function getGridInfo() {
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;

  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(screenWidth, screenHeight);

  const aspectWidth = screenWidth / divisor;
  const aspectHeight = screenHeight / divisor;
  let gridHeight = 0
  let gridWidth = 0

  console.log(`resouloution: ${screenWidth}x${screenHeight}`);
  console.log(`ratio: ${aspectWidth}:${aspectHeight}`);
  if (aspectWidth > aspectHeight){
    gridHeight = 10
    gridWidth = Math.min((Math.floor(10 *(screenWidth/screenHeight))),20)
  }
  else {
    gridWidth = 10
    gridHeight = Math.min((Math.floor(10 * (screenHeight/screenWidth))),20)
  }

  return { width: gridWidth, height: gridHeight };
}
const gridInfo = getGridInfo();
let calculated_grid_size = gridInfo.width * gridInfo.height;
let calculated_grid_height = gridInfo.height;
console.log(`grid height: ${calculated_grid_height}`);
let calculated_grid_width = gridInfo.width;
console.log(`grid width: ${calculated_grid_width}`);

function calculateGridPlace(x, y){
  let gridIndex = y * gridInfo.width + x;
  return gridIndex
}

const GAME_SPEED_RATIO = 60
const GAME_STATUS_PLAY = 1
const GAME_STATUS_HALT = 0
const GAME_STATUS_END = 2
let gameStatus = GAME_STATUS_HALT
let gameTimer = 0
let score = 0

function initialGame(){
  if (userMessage != controlNo){
    gameStatus = GAME_STATUS_PLAY
  }
  gameArray.fill(isEmpty,0,(gridInfo.width * gridInfo.height))
  const startX = Math.floor(gridInfo.width / 2);  // middle floor
  const startY = Math.floor(gridInfo.height / 2); // middle range
  const snakeStartIndex = calculateGridPlace(startX, startY)
  gameArray[snakeStartIndex] = haveSnake; // define snake position as have snak
  // console.log(`Snake initial position at index: ${snakeStartIndex}, means colum ${startX}, line${startY}`);
  score = 0
  // console.log(gameStatus)
}

// //code of game logic
const noApple = 0
const applePuted = 1
let currentSnakeX = Math.floor(gridInfo.width / 2)
let currentSnakeY = Math.floor(gridInfo.height / 2)
let appleStatus = noApple
let currentSnakeIndex = 0
let snakeBody = []

function putApple(){
  let appleX = Math.floor(Math.random() * (gridInfo.width - 2)) + 1;
  let appleY = Math.floor(Math.random() * (gridInfo.height - 2)) + 1;
  let appleIndex = calculateGridPlace(appleX, appleY);

  // try to find a empty place
  while (gameArray[appleIndex] != isEmpty) {
    appleX = Math.floor(Math.random() * (gridInfo.width - 2)) + 1;
    appleY = Math.floor(Math.random() * (gridInfo.height - 2)) + 1;
    appleIndex = calculateGridPlace(appleX, appleY);
  }
  //if the place is empty, put apple
  gameArray[appleIndex] = haveApple
  appleStatus = applePuted
  return
}

function gameLoop(gameInput){
  console.log(gameStatus)
  switch(gameInput){
    case controlUP:
      currentSnakeY = currentSnakeY + 1
      break;
    case controlDown:
      currentSnakeY = currentSnakeY - 1
      break;
    case controlLeft:
      currentSnakeX = currentSnakeX -1
      break;
    case controlRight:
      currentSnakeX = currentSnakeX + 1
      break;
  }
  if ((currentSnakeX < 0) || (currentSnakeY < 0) || (currentSnakeX >= gridInfo.width) || (currentSnakeY >= gridInfo.height)){
    gameStatus = GAME_STATUS_END
    return
  }// touch the edge, return
  currentSnakeIndex = calculateGridPlace(currentSnakeX,currentSnakeY)
  if (gameArray[currentSnakeIndex] == isEmpty){
    gameArray[currentSnakeIndex] = haveSnake
    snakeBody.unshift(currentSnakeIndex) // add new head to snake
    let snakeEndIndex = snakeBody.pop() // remove the end of tail
    gameArray[snakeEndIndex] = isEmpty
    return
  }
  if (gameArray[currentSnakeIndex] == haveSnake){
    gameStatus = GAME_STATUS_END
    return
  }// game over if touch itself
  if (gameArray[currentSnakeIndex] == haveApple){
    score = score + 1
    gameArray[currentSnakeIndex] = haveSnake
    snakeBody.unshift(currentSnakeIndex)
    appleStatus = noApple // no apple any more
    return
  }
}

// setupControls()

const u_gameArray = gl.getUniformLocation(program, "u_gameArray")
  // Render loop
  function loop() {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.bindVertexArray(vao);
      gl.useProgram(program);
      gl.uniform2f(u_resolution, gl.canvas.width, gl.canvas.height);
      gl.uniform1f(u_time, time.t);
      gl.uniform1f(u_dt, time.dt());
      // console.log(userMessage)
      // console.log(gameStatus)
      canvasControl()
      if (gameStatus == GAME_STATUS_HALT){
        initialGame()
      }
      if (appleStatus == noApple){
        putApple()
      }
      if (gameStatus == GAME_STATUS_PLAY){
        gameTimer = gameTimer + 1
        if (gameTimer == GAME_SPEED_RATIO){
          gameLoop(userMessage)
          gameTimer = 0
        }
      }

      gl.uniform1i(u_msg, userMessage);
      gl.uniform1i(u_acctual_size, calculated_grid_size);
      gl.uniform1i(u_gridWidth, calculated_grid_width);
      gl.uniform1i(u_gridHeight, calculated_grid_height);
      gl.uniform1iv(u_gameArray, gameArray);// convert the game array to renderer

      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

      gl.bindVertexArray(null);

      time.update();
      requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

main();
