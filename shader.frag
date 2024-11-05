#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform int u_gridWidth;     // Grid width (number of columns)
uniform int u_gridHeight;    // Grid height (number of rows)
uniform int u_gameArray[200]; // Grid state array
uniform int u_msg;

out vec4 outColor;

const int unUse = 0;
const int isEmpty = 1;
const int haveSnake = 2;
const int haveApple = 3;

// void main() {
//     // Width and height of each grid cell
//     float cellWidth = u_resolution.x / float(u_gridWidth);
//     float cellHeight = u_resolution.y / float(u_gridHeight);

//     // Calculate grid coordinates (gridX, gridY) for the current pixel
//     int gridX = int(gl_FragCoord.x / cellWidth);
//     int gridY = int(gl_FragCoord.y / cellHeight);

//     // Calculate the index in u_gameArray for the current grid
//     int gridIndex = gridY * u_gridWidth + gridX;

//     // Ensure index is within bounds of u_gameArray
//     if (gridIndex < 0 || gridIndex >= 200) {
//         outColor = vec4(1.0, 1.0, 1.0, 1.0); // Default white color
//         return;
//     }

//     // Get the state of the current grid cell
//     int cellState = u_gameArray[gridIndex];

//     // Calculate local position relative to the grid cell for the current fragment
//     float xPos = mod(gl_FragCoord.x, cellWidth) - cellWidth / 2.0;
//     float yPos = mod(gl_FragCoord.y, cellHeight) - cellHeight / 2.0;
//     float dist = length(vec2(xPos, yPos));

//     // Render different colors and shapes based on cell state
//     float radius = min(cellWidth, cellHeight) / 2.0 - 2.0; // Radius of the circle

//     if (cellState == haveSnake && dist < radius) {
//         outColor = vec4(0.0, 1.0, 0.0, 1.0); // Green for snake
//     } else if (cellState == haveApple && dist < radius) {
//         outColor = vec4(1.0, 0.0, 0.0, 1.0); // Red for apple
//     } else if (cellState == isEmpty) {
//         outColor = vec4(1.0, 1.0, 1.0, 1.0); // White for empty cell
//     } else {
//         outColor = vec4(0.0, 0.0, 0.0, 1.0); // Other cases
//     }
// }

void main() {
    // Width and height of each grid cell
    float cellWidth = u_resolution.x / float(u_gridWidth);
    float cellHeight = u_resolution.y / float(u_gridHeight);

    // Calculate grid coordinates (gridX, gridY) for the current pixel
    int gridX = int(gl_FragCoord.x / cellWidth);
    int gridY = int(gl_FragCoord.y / cellHeight);

    // Calculate the index in u_gameArray for the current grid
    int gridIndex = gridY * u_gridWidth + gridX;

    // Ensure index is within bounds of u_gameArray
    if (gridIndex < 0 || gridIndex >= 200) {
        outColor = vec4(1.0, 1.0, 1.0, 1.0); // Default white color
        return;
    }

    // Get the state of the current grid cell
    int cellState = u_gameArray[gridIndex];

    // Use different colors to represent array states
    if (cellState == haveSnake) {
        outColor = vec4(0.0, 1.0, 0.0, 1.0); // Green
    } else if (cellState == haveApple) {
        outColor = vec4(1.0, 0.0, 0.0, 1.0); // Red
    } else if (cellState == isEmpty) {
        outColor = vec4(0.8, 0.8, 0.8, 1.0); // Gray
    } else {
        outColor = vec4(0.0, 0.0, 0.0, 1.0); // Black, unused
    }
}
