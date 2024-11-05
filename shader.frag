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

//parameters defination get from class code
#define EPS         0.001
#define N_MAX_STEPS 80
#define MAX_DIST    100.0

//sdp function
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

vec3 approx_normal(vec3 p) {
    vec2 eps = vec2(EPS, -EPS);
    return normalize(
        eps.xyy * sdf_scene(p + eps.xyy) + \
        eps.yyx * sdf_scene(p + eps.yyx) + \
        eps.yxy * sdf_scene(p + eps.yxy) + \
        eps.xxx * sdf_scene(p + eps.xxx)
    );
}

//real code
void main() {
    // Width and height of each grid cell
    float cellWidth = u_resolution.x / float(u_gridWidth);
    float cellHeight = u_resolution.y / float(u_gridHeight);
    // Radius of the spthere
    float radius = min(cellWidth,cellHeight) * 0.5;

    // Determine the grid coordinates (gridX, gridY) for the current pixel
    int gridX = int(gl_FragCoord.x / cellWidth);
    int gridY = int(gl_FragCoord.y / cellHeight);

    // Calculate the index in u_gameArray for the current grid cell
    int gridIndex = gridY * u_gridWidth + gridX;

    // Get the state of the current grid cell
    int cellState = u_gameArray[gridIndex];

    // Calculate the center of the current cell
    vec3 cellCenter = vec3(
        (float(gridX) + 0.5) * cellWidth,
        (float(gridY) + 0.5) * cellHeight,
        0.0
    );
    // Ray origin and direction
    vec3 ro = vec3(gl_FragCoord.xy, -3.0);
    vec3 rd = normalize(vec3(0.0, 0.0, 1.0)); // Ray pointing along the z-axis

    
    //do the ray marching
    float t = 0.0;
    vec3 col = vec3(0.8); // Background color (light gray)
    for (int i = 0; i < N_MAX_STEPS; i++) {
        vec3 p = ro + rd * t;
        float d = sdf_scene(p, cellState, cellCenter, radius);
        
        if (d < EPS || t > MAX_DIST) break;
        t += d;
    }
    // Shade based on distance `t`, applying different colors for snake and apple
    if (t < MAX_DIST) {
        if (cellState == haveSnake) {
            col = vec3(0.0, 0.6, 0.0) * (1.0 - t * 0.02); // Darker green with shading
        } else if (cellState == haveApple) {
            col = vec3(0.6, 0.0, 0.0) * (1.0 - t * 0.02); // Darker red with shading
        }
    }
    
    outColor = vec4(col, 1.0);

}

// used to test the game logic

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

//     // Use different colors to represent array states
//     if (cellState == haveSnake) {
//         outColor = vec4(0.0, 1.0, 0.0, 1.0); // Green
//     } else if (cellState == haveApple) {
//         outColor = vec4(1.0, 0.0, 0.0, 1.0); // Red
//     } else if (cellState == isEmpty) {
//         outColor = vec4(0.8, 0.8, 0.8, 1.0); // Gray
//     } else {
//         outColor = vec4(0.0, 0.0, 0.0, 1.0); // Black, unused
//     }
// }
