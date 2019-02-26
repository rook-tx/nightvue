/* eslint-disable */

/**
 * @author http://getmosh.io
 *
 */

THREE.WobbleShader = {
  uniforms: {
    tDiffuse: {
      type: "t",
      value: null
    },
    time: {
      type: "f",
      value: 0
    },
    strength: {
      type: "f",
      value: .001
    },
    size: {
      type: "f",
      value: 50
    },
    speed: {
      type: "f",
      value: 1
    }
  },
  vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
  fragmentShader: ["uniform sampler2D tDiffuse;", "uniform float time;", "uniform float strength;", "uniform float size;", "uniform float speed;", "varying vec2 vUv;", "void main() {", "vec2 p = -1.0 + 2.0 * vUv;", "gl_FragColor = texture2D(tDiffuse, vUv + strength * vec2(cos(time*speed+length(p*size)), sin(time*speed+length(p*size))));", "}"].join("\n")
};
