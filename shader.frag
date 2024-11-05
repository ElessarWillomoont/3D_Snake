#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform int u_gridWidth;     // Grid width (number of columns)
uniform int u_gridHeight;    // Grid height (number of rows)
uniform int u_gameArray[200]; // Grid state array

out vec4 outColor;

const int unUse = 0;
const int isEmpty = 1;
const int haveSnake = 2;
const int haveApple = 3;

void main() {
    // Width and height of each grid cell
    float cellWidth = u_resolution.x / float(u_gridWidth);
    float cellHeight = u_resolution.y / float(u_gridHeight);

    // Calculate the grid coordinates (gridX, gridY) of the current pixel
    int gridX = int(gl_FragCoord.x / cellWidth);
    int gridY = int(gl_FragCoord.y / cellHeight);

    // Calculate the index of the current grid cell in u_gameArray
    int gridIndex = gridY * u_gridWidth + gridX;

    // Ensure the index does not exceed the range of u_gameArray
    if (gridIndex < 0 || gridIndex >= 200) {
        outColor = vec4(1.0, 1.0, 1.0, 1.0); // Default white color
        return;
    }

    // Get the state of the current grid cell
    int cellState = u_gameArray[gridIndex];

    // Calculate the local position of the fragment relative to the grid cell
    float xPos = mod(gl_FragCoord.x, cellWidth) - cellWidth / 2.0;
    float yPos = mod(gl_FragCoord.y, cellHeight) - cellHeight / 2.0;
    float dist = length(vec2(xPos, yPos));

    // Draw different colors and shapes based on the state
    float radius = min(cellWidth, cellHeight) / 2.0 - 2.0; // Radius of the circle

    if (cellState == haveSnake && dist < radius) {
        outColor = vec4(0.0, 1.0, 0.0, 1.0); // Green, represents snake
    } else if (cellState == haveApple && dist < radius) {
        outColor = vec4(1.0, 0.0, 0.0, 1.0); // Red, represents apple
    } else if (cellState == isEmpty) {
        outColor = vec4(1.0, 1.0, 1.0, 1.0); // White, represents empty
    } else {
        outColor = vec4(0.0, 0.0, 0.0, 1.0); // Other cases
    }
}
