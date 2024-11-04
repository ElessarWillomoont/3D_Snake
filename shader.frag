#version 300 es
precision highp float;

in vec2 f_uv;

out vec4 outColor;

void main() {
    outColor = vec4(f_uv, 0, 1);
}
