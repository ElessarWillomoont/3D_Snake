#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_dt;

in vec2 a_position;
in vec2 a_uv;

out vec2 f_uv;

void main() {
    f_uv = a_uv; // 传递 UV 坐标给片段着色器
    gl_Position = vec4(a_position, 0.0, 1.0); // 设置顶点位置
}
