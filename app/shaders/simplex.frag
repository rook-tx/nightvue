varying vec2 vUv;
varying vec3 vPos;
varying vec3 vNormal;

uniform float time;
uniform vec3 color;

#pragma glslify: noise = require(glsl-noise/simplex/3d)

struct PointLight {
  vec3 position;
  vec3 color;
};

uniform PointLight pointLights[NUM_POINT_LIGHTS];

void main() {

  vec4 addedLights = vec4(color * 0.7, 1.0);

  for(int l = 0; l < NUM_POINT_LIGHTS; l++) {
    vec3 adjustedLight = pointLights[l].position + cameraPosition;
    vec3 lightDirection = normalize(vPos - adjustedLight);
    addedLights.rgb += clamp(dot(-lightDirection, vNormal), 0.0, 1.0) * pointLights[l].color;
  }

  vec3 c = vec3(vUv * 200.0, time) * 0.1;
  vec4 nc = vec4(color * noise(c) * 0.2, 1.0);

  gl_FragColor = nc + addedLights;

}
