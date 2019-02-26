/* eslint-disable */

initRenderer(),
    initPostprocessing(),
    initStars(),
    initOrbs(),
    initTrailRenderers(),
    window.innerWidth > 640 ? intro.play() : introMob.play(),
    document.addEventListener("mousemove", onDocumentMouseMove, !1),
    window.addEventListener("resize", onWindowResize, !1),
    window.addEventListener("blur", function() {
        clock.stop()
    }),
    window.addEventListener("focus", function() {
        clock.start()
    })
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight,
    camera.updateProjectionMatrix(),
    renderer.setSize(window.innerWidth, window.innerHeight)
}
function onDocumentMouseMove(e) {
    mouseX = e.clientX - window.innerWidth / 2,
    mouseY = e.clientY - window.innerHeight / 2
}
function onDocumentTouchStart(e) {
    e.touches.length > 1 && (e.preventDefault(),
    mouseX = e.touches[0].pageX - window.innerWidth / 2,
    mouseY = e.touches[0].pageY - window.innerHeight / 2)
}
function onDocumentTouchMove(e) {
    1 == e.touches.length && (e.preventDefault(),
    mouseX = e.touches[0].pageX - window.innerWidth / 2,
    mouseY = e.touches[0].pageY - window.innerHeight / 2)
}
function initScene() {
    scene = new THREE.Scene,
    camera = new THREE.PerspectiveCamera(30,window.innerWidth / window.innerHeight,1,3e4),
    clock = new THREE.Clock,
    scene.add(camera),
    resetCamera()
}
function resetCamera() {
    camera.aspect = window.innerWidth / window.innerHeight,
    camera.updateProjectionMatrix(),
    camera.position.set(0, 0, deltaZ),
    camera.lookAt(scene.position)
}
function initRenderer() {
    renderer = new THREE.WebGLRenderer({
        antialias: !1
    }),
    renderer.setPixelRatio(window.devicePixelRatio),
    renderer.setSize(window.innerWidth, window.innerHeight),
    renderer.setClearColor(rendererBackground),
    container.appendChild(renderer.domElement)
}
function initStars(e) {
    for (var t = new THREE.ShaderMaterial({
        uniforms: {
            color: {
                value: new THREE.Color(16777215)
            },
            texture: {
                value: (new THREE.TextureLoader).load("/static/images/textures/sprites/spark1.png")
            }
        },
        vertexShader: ["attribute float size;", "attribute vec3 customColor;", "varying vec3 vColor;", "void main() {", "vColor = customColor;", "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );", "gl_PointSize = size * ( 300.0 / -mvPosition.z );", "gl_Position = projectionMatrix * mvPosition;", "}"].join("\n"),
        fragmentShader: ["uniform vec3 color;", "uniform sampler2D texture;", "varying vec3 vColor;", "void main() {", "gl_FragColor = vec4( color * vColor, 1.0 );", "gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );", "}"].join("\n"),
        blending: THREE.AdditiveBlending,
        depthTest: !1,
        transparent: !0
    }), r = new THREE.BufferGeometry, o = new Float32Array(3 * stars), a = new Float32Array(3 * stars), i = new Float32Array(stars), n = new THREE.Color, s = 0, c = 0; s < stars; s++,
    c += 3) {
        o[c + 0] = (2 * Math.random() - 1) * radius,
        o[c + 1] = (2 * Math.random() - 1) * radius,
        o[c + 2] = (2 * Math.random() - 1) * radius;
        var l = (hueLower + Math.random() * (hueUpper - hueLower)) / 360;
        n.setHSL(l, .5 + .5 * Math.random(), .5 + .5 * Math.random()),
        a[c + 0] = n.r,
        a[c + 1] = n.g,
        a[c + 2] = n.b,
        i[s] = starSize
    }
    r.addAttribute("position", new THREE.BufferAttribute(o,3)),
    r.addAttribute("customColor", new THREE.BufferAttribute(a,3)),
    r.addAttribute("size", new THREE.BufferAttribute(i,1)),
    starSystem = new THREE.Points(r,t),
    scene.add(starSystem),
    e && e()
}
function initOrbs(e) {
    for (var t = 0; t < orbCount; t++) {
        var r = new THREE.SphereGeometry(1)
          , o = new THREE.MeshBasicMaterial({
            color: rendererBackground
        });
        orb = new THREE.Mesh(r,o),
        orb.position.z = t * t + t * t - radius,
        orbs.push(orb),
        scene.add(orb)
    }
}
function initTrailRenderers(e) {
    for (o = 0; o < orbs.length; o++) {
        for (var t = [], r = 2 * Math.PI, a = 0, i = o / orbCount * 10, n = r / 32, s = 0; s <= r + n; s += n) {
            var c = new THREE.Vector3;
            c.set(Math.cos(s) * i, Math.sin(s) * i, 0),
            t[a] = c,
            a++
        }
        var l = new THREE.TrailRenderer(scene,(!1));
        trailMaterial = THREE.TrailRenderer.createBaseMaterial(),
        l.initialize(trailMaterial, trailLength, !1, 0, t, orbs[o]),
        updateTrailColors(o),
        l.activate(),
        trails.push(l)
    }
    e && e()
}
function updateTrailColors(e) {
    var t = new THREE.Color
      , r = (hueLower + Math.random() * (hueUpper - hueLower)) / 360;
    t.setHSL(r, .5 + .5 * Math.random(), .4 + .4 * Math.random()),
    trailMaterial.uniforms.headColor.value.set(t.r, t.g, t.b, 1)
}
function setupRoutingGraph() {
    sourceNode = context.createBufferSource(),
    analyzer = context.createAnalyser(),
    analyzer.smoothingTimeConstant = analyzerSmoothing,
    analyzer.fftSize = 2 * orbCount,
    jsNode = context.createScriptProcessor(analyzerResolution, 1, 1),
    jsNode.onaudioprocess = function() {
        analyzer.getByteFrequencyData(freqs)
    }
    ,
    jsNode.connect(context.destination),
    sourceNode.connect(analyzer),
    sourceNode.connect(gainNode),
    analyzer.connect(jsNode),
    gainNode.connect(context.destination);
    var e = new XMLHttpRequest;
    e.open("GET", "/static/audio/young.mp3", !0),
    e.responseType = "arraybuffer",
    e.onload = function() {
        context.decodeAudioData(e.response, function(e) {
            sourceNode.buffer = e,
            sourceNode.loop = !0,
            sourceNode.start(0)
        }, function(e) {
            console.log(e)
        })
    }
    ,
    e.send()
}
function initPostprocessing() {
    renderPass = new THREE.RenderPass(scene,camera);
    var e = new THREE.EffectComposer(renderer);
    glowPass = new THREE.ShaderPass(THREE.GlowShader),
    glowPass.uniforms.resolution.value = new THREE.Vector2(window.innerWidth,window.innerHeight),
    glowPass.uniforms.amount.value = 8,
    wobblePass = new THREE.ShaderPass(THREE.WobbleShader),
    wobblePass.uniforms.size.value = 8,
    filmGrainPass = new THREE.ShaderPass(THREE.FilmGrainShader),
    filmGrainPass.uniforms.resolution.value = new THREE.Vector2(window.innerWidth,window.innerHeight),
    filmGrainPass.renderToScreen = !0,
    e.addPass(renderPass),
    e.addPass(wobblePass),
    e.addPass(glowPass),
    e.addPass(filmGrainPass),
    postprocessing.composer = e
}
function animate() {
    time = 1e3 * clock.getElapsedTime();
    var e = time * (bpm / 6e4);
    for (i = 0; i < orbs.length; i++) {
        var t = orbCount - i
          , r = freqs[t] / 256
          , o = 256 - i / 54 * 62
          , a = 256 - (orbCount - i)
          , n = i * (i + r * (i / 15))
          , s = i * (i + r * (i / 9))
          , c = i * (i + r * (i / 2))
          , l = i * (i / 4)
          , u = e * i / 95;
        freqs[0] < 100 && (n = i * i),
        freqs[t] > o && (n = s),
        freqs[t] > a && (n = c),
        i % 2 == 0 ? (orbs[i].position.x = n * Math.sin(u),
        orbs[i].position.y = n * Math.cos(u),
        orbs[i].position.z = i * i + i * i * (i / 17) - 2 * radius + l * Math.cos(u)) : (orbs[i].position.x = n * Math.cos(u),
        orbs[i].position.y = n * Math.sin(u),
        orbs[i].position.z = i * i + i * i * (i / 17) - 2 * radius - l * Math.sin(u)),
        trails[i].advance()
    }
    freqs[0] > 100 && (window.innerWidth > 640 && begin.play(),
    deltaZ = cameraZ,
    deltaX = mouseX / window.innerWidth * tilt,
    deltaY = mouseY / window.innerHeight * tilt),
    camera.position.x += .02 * (deltaX - camera.position.x),
    camera.position.y += .02 * (deltaY - camera.position.y),
    camera.position.z += .03 * (deltaZ - camera.position.z),
    camera.lookAt(scene.position),
    camera.rotation.z += e / 4,
    filmGrainPass.uniforms.time.value = e,
    wobblePass.uniforms.time.value = e / 2,
    wobblePass.uniforms.strength.value = .015 * Math.sin(e),
    requestAnimationFrame(animate),
    render()
}
function render() {
    postprocessing.composer.render()
}