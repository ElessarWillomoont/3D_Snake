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
  const scoreDisplay = document.getElementById("score-display");
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
          statusDisplay.innerHTML = getStatusText(gameStatus)
          scoreDisplay.innerHTML = `Score: ${score}`;
      },
  };

  const u_msg = gl.getUniformLocation(program, "u_msg")//convert the user control

// consts for user control status
const controlUP = 1
const controlDown = 2
const controlLeft = 3
const controlRight = 4
const controlNo = 0

function getStatusText(status) {
  switch (status) {
      case GAME_STATUS_PLAY:
          return "Playing";
      case GAME_STATUS_HALT:
          return "Halt";
      case GAME_STATUS_END:
          return "Game Over";
      default:
          return "Unknown Status";
  }
}

let userMessage = controlNo;

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

let gameArray = new Int32Array(MAX_Grid_SIZE).fill(unUse); // game array that store the messages(snake, apple, empty)
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

let isInitialized = 0 //ensure the initialization only happen once
function initialGame(){
  console.log("is here")
  if (userMessage != controlNo){
    gameStatus = GAME_STATUS_PLAY
  }
  if (isInitialized == 0){
    gameArray.fill(isEmpty,0,(gridInfo.width * gridInfo.height))
    const startX = Math.floor(gridInfo.width / 2);  // middle floor
    const startY = Math.floor(gridInfo.height / 2); // middle range
    const snakeStartIndex = calculateGridPlace(startX, startY)
    gameArray[snakeStartIndex] = haveSnake; // define snake position as have snak
    snakeBody.unshift(snakeStartIndex)// give an origin body of snake
    // console.log(`Snake initial position at index: ${snakeStartIndex}, means colum ${startX}, line${startY}`);
    score = 0
    let actualX = calculateActualCenterPoint(startX,startY).actualX
    let actualY = calculateActualCenterPoint(startX,startY).actualY
    calculatedArrayUpdate(snakeStartIndex, actualX, actualY, haveSnake,'add')
    // console.log(gameStatus)
    isInitialized = 1
  }
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
    let actualX = calculateActualCenterPoint(appleX,appleY).actualX
    let actualY = calculateActualCenterPoint(appleX,appleY).actualY
    calculatedArrayUpdate(appleIndex, actualX, actualY, haveApple,'add')
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
      let actualX1 =calculateActualCenterPointbyIndex(currentSnakeIndex).actualX
      let actualY1 =calculateActualCenterPointbyIndex(currentSnakeIndex).actualY
      calculatedArrayUpdate(currentSnakeIndex, actualX1, actualY1, haveSnake,'add')
      snakeBody.unshift(currentSnakeIndex) // add new head to snake
      let snakeEndIndex = snakeBody.pop() // remove the end of tail
      gameArray[snakeEndIndex] = isEmpty
      let actualX2 =calculateActualCenterPointbyIndex(snakeEndIndex).actualX
      let actualY2 =calculateActualCenterPointbyIndex(snakeEndIndex).actualY
      calculatedArrayUpdate(snakeEndIndex, actualX2, actualY2, isEmpty,'sub')
      return
    }
    if (gameArray[currentSnakeIndex] == haveSnake){
      gameStatus = GAME_STATUS_END
      return
    }// game over if touch itself
    if (gameArray[currentSnakeIndex] == haveApple){
      score = score + 1
      gameArray[currentSnakeIndex] = haveSnake
      let actualX =calculateActualCenterPointbyIndex(currentSnakeIndex).actualX
      let actualY =calculateActualCenterPointbyIndex(currentSnakeIndex).actualY
      calculatedArrayUpdate(currentSnakeIndex, actualX, actualY, haveApple,'sub')
      calculatedArrayUpdate(currentSnakeIndex, actualX, actualY, haveSnake,'add')
      snakeBody.unshift(currentSnakeIndex)
      appleStatus = noApple // no apple any more
      return
    }
  }

  //reduce the load of GPU, calculate the center and status of each dot only when needed
  const u_calculatedGridArray = gl.getUniformLocation(program, "u_calculatedGridArray")
  let calculatedArray = new Float32Array(MAX_Grid_SIZE * 4).fill(unUse);
  const dotNum = gl.getUniformLocation(program, "dotNum")
  let usedDotNumber = 0

  // function to opreate the calculated array, get the index, x and y and wanted behive
  function calculatedArrayUpdate(index, x, y, status, behive){

    //norminalize x y into uv
    const normalizedX = (x / window.screen.width) * 2.0 - 1.0;
    const normalizedY = (y / window.screen.height) * 2.0 - 1.0;
    if (behive == 'add'){//add a dot in the array
      calculatedArray[usedDotNumber * 4] = index // dot index
      calculatedArray[usedDotNumber * 4 + 1] = normalizedX // x location of the center of dot
      calculatedArray[usedDotNumber * 4 + 2] = normalizedY// y location of the center of dot
      calculatedArray[usedDotNumber * 4 + 3] = status //dot location, snake or apple
      usedDotNumber = usedDotNumber + 1
    }
    else if (behive == 'sub'){
      for (let i = 0; i < calculatedArray.length; i += 4) {
        if(calculatedArray[i] == index){ //search the dot index
          calculatedArray[i]= calculatedArray[(usedDotNumber - 1) * 4]; // after find, use the last valid dot to replace
          calculatedArray[i + 1] = calculatedArray[(usedDotNumber - 1) * 4 + 1];
          calculatedArray[i + 2] = calculatedArray[(usedDotNumber - 1) * 4 + 2];
          calculatedArray[i + 3] = calculatedArray[(usedDotNumber - 1) * 4 + 3];
          // set the end dot into 0
          calculatedArray[(usedDotNumber - 1) * 4] = 0
          calculatedArray[(usedDotNumber - 1) * 4 + 1] = 0
          calculatedArray[(usedDotNumber - 1) * 4 + 2] = 0
          calculatedArray[(usedDotNumber - 1) * 4 + 3] = 0
          break
        }
      }
      usedDotNumber = usedDotNumber - 1
    }
  }

  function calculateActualCenterPoint(localX, localY){
    let dotIndex = calculateGridPlace(localX, localY)
    // calculate the height and width of each cell
    let cellWidth = window.screen.width / gridInfo.width;
    let cellHeight = window.screen.height / gridInfo.height;
    
    // calculate actual center of the cell
    let actualX = (localX + 0.5) * cellWidth;
    let actualY = (localY + 0.5) * cellHeight;
    return{dotIndex : dotIndex, actualX : actualX, actualY : actualY}
  }

  // nearly same as upper, but use index
  function calculateActualCenterPointbyIndex(index){
    let localX = index%gridInfo.width
    let localY = Math.floor(index/gridInfo.width)
    let cellWidth = window.screen.width / gridInfo.width;
    let cellHeight = window.screen.height / gridInfo.height;
    
    // calculate actual center of the cell
    let actualX = (localX + 0.5) * cellWidth;
    let actualY = (localY + 0.5) * cellHeight;
    return{actualX : actualX, actualY : actualY}
  }

  const u_gameArray = gl.getUniformLocation(program, "u_gameArray")
  const u_radius = gl.getUniformLocation(program, "u_radius")
  const radius = Math.min(1 / gridInfo.width, 1 / gridInfo.height)/2
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
      console.log("gameArray type:", gameArray.constructor.name);
      gl.uniform1i(u_msg, userMessage);
      gl.uniform1i(u_acctual_size, calculated_grid_size);
      gl.uniform1i(u_gridWidth, calculated_grid_width);
      gl.uniform1i(u_gridHeight, calculated_grid_height);
      gl.uniform1i(dotNum, usedDotNumber)
      gl.uniform1f(u_radius, radius);
      gl.uniform1iv(u_gameArray, gameArray);// convert the game array to renderer
      gl.uniform1fv(u_calculatedGridArray, calculatedArray);

      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

      gl.bindVertexArray(null);

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

      time.update();
      requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

main();
