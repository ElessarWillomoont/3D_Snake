#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_dt;
uniform int u_msg;


uniform int u_acctual_size;//actual grid size
uniform int u_gridWidth;//grid width
uniform int u_gridHeight;//grid height

in vec2 f_uv;

out vec4 outColor;

// control logic test case
// void main() {
//     switch (u_msg) {
//         case 1:
//             outColor = vec4(1.0, 0.0, 0.0, 1.0); // red
//             break;
//         case 2:
//             outColor = vec4(0.0, 1.0, 0.0, 1.0); // greed
//             break;
//         case 3:
//             outColor = vec4(0.0, 0.0, 1.0, 1.0); // blue
//             break;
//         case 4:
//             outColor = vec4(1.0, 0.0, 1.0, 1.0); // don't know
//             break;
//         default:
//             outColor = vec4(1.0, 1.0, 1.0, 1.0); // white
//             break;
//     }
// }

void main() {
    float cellWidth = u_resolution.x / float(u_gridWidth);
    float cellHeight = u_resolution.y / float(u_gridHeight);

    float xPos = mod(gl_FragCoord.x, cellWidth);
    float yPos = mod(gl_FragCoord.y, cellHeight);

    float lineWidth = 2.0; // line width in pix

    if (xPos < lineWidth || xPos > (cellWidth - lineWidth) ||
        yPos < lineWidth || yPos > (cellHeight - lineWidth)) {
        outColor = vec4(0.0, 0.0, 0.0, 1.0); 
    } else {
        outColor = vec4(1.0, 1.0, 1.0, 1.0); 
    }
}