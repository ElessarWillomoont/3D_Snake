#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform int dotNum; // Number of valid spheres
uniform float u_calculatedGridArray[200 * 4]; // Each sphere has 4 floats (index, x, y, state)
uniform float u_radius;

out vec4 outColor;

const int haveSnake = 2;
const int haveApple = 3;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution; // Normalized coordinates of the current pixel
    
    vec3 color = vec3(0.2, 0.2, 0.2); // Background color
    
    // Iterate through all points and draw circles
    for (int i = 0; i < dotNum; i++) {
        // Get the center position and state
        vec2 center = vec2(u_calculatedGridArray[i * 4 + 1], u_calculatedGridArray[i * 4 + 2]);
        int state = int(u_calculatedGridArray[i * 4 + 3]);

        // Calculate the distance from the current pixel to the center
        float dist = length(gl_FragCoord.xy - center);

        // If the pixel is within the circle, set the color based on the state
        if (dist < u_radius) {
            if (state == haveSnake) {
                color = vec3(0.0, 1.0, 0.0); // Green represents the snake
            } else if (state == haveApple) {
                color = vec3(1.0, 0.0, 0.0); // Red represents the apple
            }
        }
    }
    
    outColor = vec4(color, 1.0);
}
