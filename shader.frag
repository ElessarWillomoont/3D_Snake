#version 300 es
precision highp float;

#define EPS         0.001
#define N_MAX_STEPS 80
#define MAX_DIST    100.0

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_dt;

in vec2 f_uv;

out vec4 outColor;

float smin(float a, float b, float k) {
    k *= log(2.0);
    float x = b - a;
    return a + x / (1.0 - exp2(x / k));
}

float sdp_sphere(vec3 p, float r) {
    return length(p) - r;
}

float sdf_scene(vec3 p) {
    vec3 sp1 = vec3(sin(u_time) * 3.0, 0.0, 0.0);
    // vec3 sp1 = vec3(-0.8, 0.0, 0.0);
    float sd1 = sdp_sphere(p - sp1, 1.0);

    // vec3 sp2 = vec3(cos(u_time) * 3.0, 0.0, 0.0);
    vec3 sp2 = vec3(0.8, 0.0, 0.0);
    float sd2 = sdp_sphere(p - sp2, 0.5);

    return smin(sd1, sd2, 0.2);
}

float ray_march(vec3 ro, vec3 rd) {
    float t = 0.0;
    for (int i = 0; i < N_MAX_STEPS; i++) {
        vec3 p = ro + rd * t;
        float d = sdf_scene(p);
        t += d;
        if (d < EPS || t > MAX_DIST) break;
    }
    return t;
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

void main() {
    vec2 uv = (f_uv * 2.0 - 1.0) * u_resolution / u_resolution.y;

    vec3 ro = vec3(0.0, 0.0, -3.0);
    vec3 rd = normalize(vec3(uv, 1.0));

    vec3 a_col = vec3(185.0 / 255.0, 210.0 / 255.0, 250.0 / 255.0);
    vec3 col = a_col;

    vec3 l_dir = normalize(vec3(sin(u_time), 0.0, cos(u_time)));
    vec3 l_col = vec3(0.8, 0.6, 0.4);

    float t = ray_march(ro, rd);
    if (t <= MAX_DIST) {
        vec3 p = ro + rd * t;

        vec3 n = approx_normal(p);
        vec3 diff = vec3(max(0.0, dot(l_dir, n))) * l_col;

        float k = max(0.0, dot(n, -rd));
        vec3 ref = vec3(pow(k, 4.0)) * 1.0 * l_col;

        col = mix(diff + ref, a_col, 0.1);
    }

    col = pow(col, vec3(0.4545));
    outColor = vec4(col, 1.0);
}
