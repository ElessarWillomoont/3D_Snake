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
      },
  };

  const u_msg = gl.getUniformLocation(program, "u_msg")//convert the user control
  let userMessage = 0

function canvasControl() {
    let startX, startY;

    // 处理键盘方向键
    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'ArrowUp':
                userMessage = 1; // 设置状态为1
                break;
            case 'ArrowDown':
                userMessage = 2; // 设置状态为2
                break;
            case 'ArrowLeft':
                userMessage = 3; // 设置状态为3
                break;
            case 'ArrowRight':
                userMessage = 4; // 设置状态为4
                break;
            default:
                userMessage = 0; // 默认值
                break;
        }
    });

    // 处理触摸滑动事件
    document.addEventListener('touchstart', (event) => {
        event.preventDefault(); // 阻止默认行为
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
    });

    document.addEventListener('touchend', (event) => {
        const endX = event.changedTouches[0].clientX;
        const endY = event.changedTouches[0].clientY;

        const diffX = endX - startX;
        const diffY = endY - startY;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) {
                userMessage = 4; // 设置状态为4 (右滑)
            } else {
                userMessage = 3; // 设置状态为3 (左滑)
            }
        } else {
            if (diffY > 0) {
                userMessage = 2; // 设置状态为2 (下滑)
            } else {
                userMessage = 1; // 设置状态为1 (上滑)
            }
        }
    });
}


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

      canvasControl()
      gl.uniform1i(u_msg, userMessage);

      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

      gl.bindVertexArray(null);

      time.update();
      requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

main();
