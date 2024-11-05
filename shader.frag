#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_dt;
uniform int u_msg;

in vec2 f_uv;

out vec4 outColor;

// void main() {
//     vec2 uv = (f_uv * 2.0 - 1.0) * u_resolution / u_resolution.y;
//     outColor = vec4(uv, 0.5 + 0.5 * sin(u_time), 1);
// }

void main() {
    switch (u_msg) {
        case 1:
            outColor = vec4(1.0, 0.0, 0.0, 1.0); // 红色
            break;
        case 2:
            outColor = vec4(0.0, 1.0, 0.0, 1.0); // 绿色
            break;
        case 3:
            outColor = vec4(0.0, 0.0, 1.0, 1.0); // 蓝色
            break;
        case 4:
            outColor = vec4(1.0, 0.0, 1.0, 1.0); // 蓝色
            break;
        default:
            outColor = vec4(1.0, 1.0, 1.0, 1.0); // 默认白色
            break;
    }
}
