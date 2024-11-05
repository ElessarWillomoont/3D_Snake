#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_dt;
uniform int u_gridWidth;     
uniform int u_gridHeight;    
uniform int u_gameArray[200]; 
uniform int u_msg;

out vec4 outColor;

const int unUse = 0;
const int isEmpty = 1;
const int haveSnake = 2;
const int haveApple = 3;

in vec2 a_position;
in vec2 a_uv;

out vec2 f_uv;

void main() {
    f_uv = a_uv; // convey UV to fragment shader
    gl_Position = vec4(a_position, 0.0, 1.0); // set postion of vert
}
