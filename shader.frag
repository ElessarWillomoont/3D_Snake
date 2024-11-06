#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform int dotNum; // Number of valid spheres
uniform float u_calculatedGridArray[200 * 4]; // Each sphere has 4 floats (index, x, y, state)
uniform float u_radius;

out vec4 outColor;

const int haveSnake = 2;
const int haveApple = 3;

// Parameters for ray marching
#define EPS         0.001
#define N_MAX_STEPS 100
#define MAX_DIST    300.0
#define SCALE_FACTOR 14.1  // Scale factor for position and radius

// Sphere SDF function
float sdf_sphere(vec3 p, float r) {
    return length(p) - r;
}

// Scene SDF function, calculates the minimum distance from the ray position to any sphere
float sdf_scene(vec3 p, out int sphereColor) {
    float minDist = MAX_DIST;
    sphereColor = 0;

    // Loop through each sphere defined in u_calculatedGridArray
    for (int i = 0; i < dotNum; i++) {
        // Scale the sphere center position and radius
        vec3 center = vec3(u_calculatedGridArray[i * 4 + 1] * (u_resolution.x / u_resolution.y), u_calculatedGridArray[i * 4 + 2], 0.0) * SCALE_FACTOR;
        int state = int(u_calculatedGridArray[i * 4 + 3]);

        // Calculate the distance from the ray position to the scaled sphere center
        float dist = sdf_sphere(p - center, u_radius * SCALE_FACTOR * 2.5); // Apply scale factor to radius
        if (dist < minDist) {
            minDist = dist;
            sphereColor = state; // Store the color (snake or apple) of the closest sphere
        }
    }
    return minDist;
}

// Approximate normal for shading
vec3 approx_normal(vec3 p) {
    vec2 eps = vec2(EPS, -EPS);
    int dummy;
    return normalize(
        vec3(
            sdf_scene(p + eps.xyy, dummy) - sdf_scene(p - eps.xyy, dummy),
            sdf_scene(p + eps.yxy, dummy) - sdf_scene(p - eps.yxy, dummy),
            sdf_scene(p + eps.yyx, dummy) - sdf_scene(p - eps.yyx, dummy)
        )
    );
}

// Ray marching function
float ray_march(vec3 ro, vec3 rd, out int sphereColor) {
    float t = 0.0;
    for (int i = 0; i < N_MAX_STEPS; i++) {
        vec3 p = ro + t * rd;
        float d = sdf_scene(p, sphereColor);
        if (d < EPS) break;
        t += d;
        if (t > MAX_DIST) break;
    }
    return t;
}

void main() {
    vec2 uv = (gl_FragCoord.xy / u_resolution) * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;

    vec3 ro = vec3(0.0, 0.0, -20.0); // Increase the ray origin distance
    vec3 rd = normalize(vec3(uv, 1.5)); // Adjust ray direction for better perspective

    int sphereColor;
    float t = ray_march(ro, rd, sphereColor);

    if (t < MAX_DIST) {
        vec3 p = ro + rd * t;
        vec3 n = approx_normal(p);

        // Lighting
        vec3 lightDir = normalize(vec3(1.0, 1.0, -1.0));
        float diff = max(dot(n, lightDir), 0.0);

        // Set color based on sphere type
        vec3 color = vec3(0.8); // Default gray
        if (sphereColor == haveSnake) {
            color = vec3(0.0, 1.0, 0.0) * diff; // Green for snake
        } else if (sphereColor == haveApple) {
            color = vec3(1.0, 0.0, 0.0) * diff; // Red for apple
        }

        outColor = vec4(color, 1.0);
    } else {
        outColor = vec4(0.2, 0.2, 0.2, 1.0); // Background color
    }
}
