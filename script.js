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
  const gl = canvas.getContext("webgl2");
  if (!gl) alert("Could not initialize WebGL Context.");

  const vertShader = createShader(gl, gl.VERTEX_SHADER, await readShader("vert")); // prettier-ignore
  const fragShader = createShader(gl, gl.FRAGMENT_SHADER, await readShader("frag")); // prettier-ignore
  const program = createProgram(gl, vertShader, fragShader);

  const positionAttribLoc = gl.getAttribLocation(program, "a_position");
  const uvAttribLoc = gl.getAttribLocation(program, "a_uv");

  // prettier-ignore
  const data = new Float32Array([
    // x    y       u    v
    -1.0, -1.0,   1.0, 0.0,
     1.0, -1.0,   0.0, 1.0,
     1.0,  1.0,   0.0, 0.0,
    -1.0,  1.0,   1.0, 0.0,
  ]);
  // prettier-ignore
  const indices = new Uint16Array([
    0, 1, 2,
    0, 2, 3,
  ]);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttribLoc);
  gl.vertexAttribPointer(positionAttribLoc, 2, gl.FLOAT, false, 4 * 4, 0);
  gl.enableVertexAttribArray(uvAttribLoc);
  gl.vertexAttribPointer(uvAttribLoc, 2, gl.FLOAT, false, 4 * 4, 2 * 4);

  const ebo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

main();
