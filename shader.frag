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

// Parameters definition
#define EPS         0.001
#define N_MAX_STEPS 80
#define MAX_DIST    100.0

// Sphere SDF function
float sdf_sphere(vec3 p, float r) {
    return length(p) - r;
}

// Function to define the scene SDF based on grid cell contents
float sdf_scene(vec3 p, int cellState, vec3 sphereCenter, float radius) {
    if (cellState == haveSnake || cellState == haveApple) {
        return sdf_sphere(p - sphereCenter, radius);
    }
    return MAX_DIST; // No object if cell is empty
}

// Approximate normal for shading
vec3 approx_normal(vec3 p, int cellState, vec3 sphereCenter, float radius) {
    vec2 eps = vec2(EPS, -EPS);
    return normalize(
        eps.xyy * sdf_scene(p + eps.xyy, cellState, sphereCenter, radius) + 
        eps.yyx * sdf_scene(p + eps.yyx, cellState, sphereCenter, radius) + 
        eps.yxy * sdf_scene(p + eps.yxy, cellState, sphereCenter, radius) + 
        eps.xxx * sdf_scene(p + eps.xxx, cellState, sphereCenter, radius)
    );
}

// Main shader code
void main() {

    // Width and height of each grid cell
    float cellWidth = u_resolution.x / float(u_gridWidth);
    float cellHeight = u_resolution.y / float(u_gridHeight);
    float radius = min(cellWidth, cellHeight) * 0.5; // use half of the short edge as the radius of the circle

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

    // Calculate the center of the current cell
    vec2 cellCenter = vec2(
        (float(gridX) + 0.5) * cellWidth,
        (float(gridY) + 0.5) * cellHeight
    );

    // Calculate the distance from the pixel to the center of the cell
    float distToCenter = length(gl_FragCoord.xy - cellCenter);

    // Get the state of the current grid cell
    int cellState = u_gameArray[gridIndex];

    // Check if in the circle
    if (distToCenter < radius) {
        // If inside the circle, set color based on cellState
        if (cellState == haveSnake) {
            outColor = vec4(0.0, 1.0, 0.0, 1.0); // Green for snake
        } else if (cellState == haveApple) {
            outColor = vec4(1.0, 0.0, 0.0, 1.0); // Red for apple
        } else {
            outColor = vec4(0.8, 0.8, 0.8, 1.0); // Gray for empty cells
        }
    } else {
        outColor = vec4(0.8, 0.8, 0.8, 1.0); // Gray background outside the circle
    }
}
