/* eslint-disable */

function init() {
	container = document.getElementById("container"),
	initScene(),
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
var Detector = {
	canvas: !!window.CanvasRenderingContext2D,
	webgl: function() {
			try {
					var e = document.createElement("canvas");
					return !(!window.WebGLRenderingContext || !e.getContext("webgl") && !e.getContext("experimental-webgl"))
			} catch (t) {
					return !1
			}
	}(),
	workers: !!window.Worker,
	fileapi: window.File && window.FileReader && window.FileList && window.Blob,
	getWebGLErrorMessage: function() {
			var e = document.createElement("div");
			return e.id = "webgl-error-message",
			e.style.fontFamily = "monospace",
			e.style.fontSize = "13px",
			e.style.fontWeight = "normal",
			e.style.textAlign = "center",
			e.style.background = "#fff",
			e.style.color = "#000",
			e.style.padding = "1.5em",
			e.style.width = "400px",
			e.style.margin = "5em auto 0",
			this.webgl || (e.innerHTML = window.WebGLRenderingContext ? ['Your graphics card does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br />', 'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'].join("\n") : ['Your browser does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br/>', 'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'].join("\n")),
			e
	},
	addGetWebGLMessage: function(e) {
			var t, r, o;
			e = e || {},
			t = void 0 !== e.parent ? e.parent : document.body,
			r = void 0 !== e.id ? e.id : "oldie",
			o = Detector.getWebGLErrorMessage(),
			o.id = r,
			t.appendChild(o)
	}
};
"object" == typeof module && (module.exports = Detector),
THREE.TrailRenderer = function(e, t) {
	THREE.Object3D.call(this),
	this.active = !1,
	this.orientToMovement = !1,
	t && (this.orientToMovement = !0),
	this.scene = e,
	this.geometry = null,
	this.mesh = null,
	this.nodeCenters = null,
	this.lastNodeCenter = null,
	this.currentNodeCenter = null,
	this.lastOrientationDir = null,
	this.nodeIDs = null,
	this.currentLength = 0,
	this.currentEnd = 0,
	this.currentNodeID = 0
}
,
THREE.TrailRenderer.prototype = Object.create(THREE.Object3D.prototype),
THREE.TrailRenderer.prototype.constructor = THREE.TrailRenderer,
THREE.TrailRenderer.MaxHeadVertices = 128,
THREE.TrailRenderer.LocalOrientationTangent = new THREE.Vector3(1,0,0),
THREE.TrailRenderer.LocalOrientationDirection = new THREE.Vector3(0,0,(-1)),
THREE.TrailRenderer.LocalHeadOrigin = new THREE.Vector3(0,0,0),
THREE.TrailRenderer.PositionComponentCount = 3,
THREE.TrailRenderer.UVComponentCount = 2,
THREE.TrailRenderer.IndicesPerFace = 3,
THREE.TrailRenderer.FacesPerQuad = 2,
THREE.TrailRenderer.Shader = {},
THREE.TrailRenderer.Shader.BaseVertexVars = ["attribute float nodeID;", "attribute float nodeVertexID;", "attribute vec3 nodeCenter;", "uniform float minID;", "uniform float maxID;", "uniform float trailLength;", "uniform float maxTrailLength;", "uniform float verticesPerNode;", "uniform vec2 textureTileFactor;", "uniform vec4 headColor;", "uniform vec4 tailColor;", "varying vec4 vColor;"].join("\n"),
THREE.TrailRenderer.Shader.TexturedVertexVars = [THREE.TrailRenderer.Shader.BaseVertexVars, "varying vec2 vUV;", "uniform float dragTexture;"].join("\n"),
THREE.TrailRenderer.Shader.BaseFragmentVars = ["varying vec4 vColor;", "uniform sampler2D texture;"].join("\n"),
THREE.TrailRenderer.Shader.TexturedFragmentVars = [THREE.TrailRenderer.Shader.BaseFragmentVars, "varying vec2 vUV;"].join("\n"),
THREE.TrailRenderer.Shader.VertexShaderCore = ["float fraction = ( maxID - nodeID ) / ( maxID - minID );", "vColor = ( 1.0 - fraction ) * headColor + fraction * tailColor;", "vec4 realPosition = vec4( ( 1.0 - fraction ) * position.xyz + fraction * nodeCenter.xyz, 1.0 ); "].join("\n"),
THREE.TrailRenderer.Shader.BaseVertexShader = [THREE.TrailRenderer.Shader.BaseVertexVars, "void main() { ", THREE.TrailRenderer.Shader.VertexShaderCore, "gl_Position = projectionMatrix * viewMatrix * realPosition;", "}"].join("\n"),
THREE.TrailRenderer.Shader.BaseFragmentShader = [THREE.TrailRenderer.Shader.BaseFragmentVars, "void main() { ", "gl_FragColor = vColor;", "}"].join("\n"),
THREE.TrailRenderer.Shader.TexturedVertexShader = [THREE.TrailRenderer.Shader.TexturedVertexVars, "void main() { ", THREE.TrailRenderer.Shader.VertexShaderCore, "float s = 0.0;", "float t = 0.0;", "if ( dragTexture == 1.0 ) { ", "   s = fraction *  textureTileFactor.s; ", " \tt = ( nodeVertexID / verticesPerNode ) * textureTileFactor.t;", "} else { ", "\ts = nodeID / maxTrailLength * textureTileFactor.s;", " \tt = ( nodeVertexID / verticesPerNode ) * textureTileFactor.t;", "}", "vUV = vec2( s, t ); ", "gl_Position = projectionMatrix * viewMatrix * realPosition;", "}"].join("\n"),
THREE.TrailRenderer.Shader.TexturedFragmentShader = [THREE.TrailRenderer.Shader.TexturedFragmentVars, "void main() { ", "vec4 textureColor = texture2D( texture, vUV );", "gl_FragColor = vColor * textureColor;", "}"].join("\n"),
THREE.TrailRenderer.createMaterial = function(e, t, r) {
	return r = r || {},
	r.trailLength = {
			type: "f",
			value: null
	},
	r.verticesPerNode = {
			type: "f",
			value: null
	},
	r.minID = {
			type: "f",
			value: null
	},
	r.maxID = {
			type: "f",
			value: null
	},
	r.dragTexture = {
			type: "f",
			value: null
	},
	r.maxTrailLength = {
			type: "f",
			value: null
	},
	r.textureTileFactor = {
			type: "v2",
			value: null
	},
	r.headColor = {
			type: "v4",
			value: new THREE.Vector4
	},
	r.tailColor = {
			type: "v4",
			value: new THREE.Vector4
	},
	e = e || THREE.TrailRenderer.Shader.BaseVertexShader,
	t = t || THREE.TrailRenderer.Shader.BaseFragmentShader,
	new THREE.ShaderMaterial({
			uniforms: r,
			vertexShader: e,
			fragmentShader: t,
			transparent: !0,
			alphaTest: .5,
			blending: THREE.CustomBlending,
			blendSrc: THREE.SrcAlphaFactor,
			blendDst: THREE.OneMinusSrcAlphaFactor,
			blendEquation: THREE.AddEquation,
			depthTest: !0,
			depthWrite: !1,
			side: THREE.DoubleSide
	})
}
,
THREE.TrailRenderer.createBaseMaterial = function(e) {
	return this.createMaterial(THREE.TrailRenderer.Shader.BaseVertexShader, THREE.TrailRenderer.Shader.BaseFragmentShader, e)
}
,
THREE.TrailRenderer.createTexturedMaterial = function(e) {
	return e = {},
	e.texture = {
			type: "t",
			value: null
	},
	this.createMaterial(THREE.TrailRenderer.Shader.TexturedVertexShader, THREE.TrailRenderer.Shader.TexturedFragmentShader, e)
}
,
THREE.TrailRenderer.prototype.initialize = function(e, t, r, o, a, i) {
	this.deactivate(),
	this.destroyMesh(),
	this.length = t > 0 ? t + 1 : 0,
	this.dragTexture = r ? 1 : 0,
	this.targetObject = i,
	this.initializeLocalHeadGeometry(o, a),
	this.nodeIDs = [],
	this.nodeCenters = [];
	for (var n = 0; n < this.length; n++)
			this.nodeIDs[n] = -1,
			this.nodeCenters[n] = new THREE.Vector3;
	this.material = e,
	this.initializeGeometry(),
	this.initializeMesh(),
	this.material.uniforms.trailLength.value = 0,
	this.material.uniforms.minID.value = 0,
	this.material.uniforms.maxID.value = 0,
	this.material.uniforms.dragTexture.value = this.dragTexture,
	this.material.uniforms.maxTrailLength.value = this.length,
	this.material.uniforms.verticesPerNode.value = this.VerticesPerNode,
	this.material.uniforms.textureTileFactor.value = new THREE.Vector2(1,1),
	this.reset()
}
,
THREE.TrailRenderer.prototype.initializeLocalHeadGeometry = function(e, t) {
	if (this.localHeadGeometry = [],
	t) {
			this.VerticesPerNode = 0;
			for (var r = 0; r < t.length && r < THREE.TrailRenderer.MaxHeadVertices; r++) {
					var o = t[r];
					if (o && o instanceof THREE.Vector3) {
							var a = new THREE.Vector3;
							a.copy(o),
							this.localHeadGeometry.push(a),
							this.VerticesPerNode++
					}
			}
	} else {
			var i = e || 1;
			i /= 2,
			this.localHeadGeometry.push(new THREE.Vector3((-i),0,0)),
			this.localHeadGeometry.push(new THREE.Vector3(i,0,0)),
			this.VerticesPerNode = 2
	}
	this.FacesPerNode = 2 * (this.VerticesPerNode - 1),
	this.FaceIndicesPerNode = 3 * this.FacesPerNode
}
,
THREE.TrailRenderer.prototype.initializeGeometry = function() {
	this.vertexCount = this.length * this.VerticesPerNode,
	this.faceCount = this.length * this.FacesPerNode;
	var e = new THREE.BufferGeometry
		, t = new Float32Array(this.vertexCount)
		, r = new Float32Array(this.vertexCount * this.VerticesPerNode)
		, o = new Float32Array(this.vertexCount * THREE.TrailRenderer.PositionComponentCount)
		, a = new Float32Array(this.vertexCount * THREE.TrailRenderer.PositionComponentCount)
		, i = new Float32Array(this.vertexCount * THREE.TrailRenderer.UVComponentCount)
		, n = new Uint32Array(this.faceCount * THREE.TrailRenderer.IndicesPerFace)
		, s = new THREE.BufferAttribute(t,1);
	s.setDynamic(!0),
	e.addAttribute("nodeID", s);
	var c = new THREE.BufferAttribute(r,1);
	c.setDynamic(!0),
	e.addAttribute("nodeVertexID", c);
	var l = new THREE.BufferAttribute(a,THREE.TrailRenderer.PositionComponentCount);
	l.setDynamic(!0),
	e.addAttribute("nodeCenter", l);
	var u = new THREE.BufferAttribute(o,THREE.TrailRenderer.PositionComponentCount);
	u.setDynamic(!0),
	e.addAttribute("position", u);
	var d = new THREE.BufferAttribute(i,THREE.TrailRenderer.UVComponentCount);
	d.setDynamic(!0),
	e.addAttribute("uv", d);
	var h = new THREE.BufferAttribute(n,1);
	h.setDynamic(!0),
	e.setIndex(h),
	this.geometry = e
}
,
THREE.TrailRenderer.prototype.zeroVertices = function() {
	for (var e = this.geometry.getAttribute("position"), t = 0; t < this.vertexCount; t++) {
			var r = 3 * t;
			e.array[r] = 0,
			e.array[r + 1] = 0,
			e.array[r + 2] = 0
	}
	e.needsUpdate = !0,
	e.updateRange.count = -1
}
,
THREE.TrailRenderer.prototype.zeroIndices = function() {
	for (var e = this.geometry.getIndex(), t = 0; t < this.faceCount; t++) {
			var r = 3 * t;
			e.array[r] = 0,
			e.array[r + 1] = 0,
			e.array[r + 2] = 0
	}
	e.needsUpdate = !0,
	e.updateRange.count = -1
}
,
THREE.TrailRenderer.prototype.formInitialFaces = function() {
	this.zeroIndices();
	for (var e = this.geometry.getIndex(), t = 0; t < this.length - 1; t++)
			this.connectNodes(t, t + 1);
	e.needsUpdate = !0,
	e.updateRange.count = -1
}
,
THREE.TrailRenderer.prototype.initializeMesh = function() {
	this.mesh = new THREE.Mesh(this.geometry,this.material),
	this.mesh.dynamic = !0,
	this.mesh.matrixAutoUpdate = !1
}
,
THREE.TrailRenderer.prototype.destroyMesh = function() {
	this.mesh && (this.scene.remove(this.mesh),
	this.mesh = null)
}
,
THREE.TrailRenderer.prototype.reset = function() {
	this.currentLength = 0,
	this.currentEnd = -1,
	this.lastNodeCenter = null,
	this.currentNodeCenter = null,
	this.lastOrientationDir = null,
	this.currentNodeID = 0,
	this.formInitialFaces(),
	this.zeroVertices(),
	this.geometry.setDrawRange(0, 0)
}
,
THREE.TrailRenderer.prototype.updateUniforms = function() {
	this.currentLength < this.length ? this.material.uniforms.minID.value = 0 : this.material.uniforms.minID.value = this.currentNodeID - this.length,
	this.material.uniforms.maxID.value = this.currentNodeID,
	this.material.uniforms.trailLength.value = this.currentLength,
	this.material.uniforms.maxTrailLength.value = this.length,
	this.material.uniforms.verticesPerNode.value = this.VerticesPerNode
}
,
THREE.TrailRenderer.prototype.advance = function() {
	var e = (new THREE.Vector3,
	new THREE.Vector3,
	new THREE.Vector3,
	new THREE.Matrix4);
	return function() {
			this.targetObject.updateMatrixWorld(),
			e.copy(this.targetObject.matrixWorld),
			this.advanceWithTransform(e),
			this.updateUniforms()
	}
}(),
THREE.TrailRenderer.prototype.advanceWithPositionAndOrientation = function(e, t) {
	this.advanceGeometry({
			position: e,
			tangent: t
	}, null)
}
,
THREE.TrailRenderer.prototype.advanceWithTransform = function(e) {
	this.advanceGeometry(null, e)
}
,
THREE.TrailRenderer.prototype.advanceGeometry = function() {
	new THREE.Vector3,
	new THREE.Vector3;
	return function(e, t) {
			var r = this.currentEnd + 1 >= this.length ? 0 : this.currentEnd + 1;
			if (t ? this.updateNodePositionsFromTransformMatrix(r, t) : this.updateNodePositionsFromOrientationTangent(r, e.position, e.tangent),
			this.currentLength >= 1) {
					var o = this.connectNodes(this.currentEnd, r)
						, a = null;
					if (this.currentLength >= this.length) {
							var i = this.currentEnd + 1 >= this.length ? 0 : this.currentEnd + 1;
							a = this.disconnectNodes(i)
					}
					this.updateIndexRangesForConnectAndDisconnect(o, a)
			}
			this.currentLength < this.length && this.currentLength++,
			this.currentEnd++,
			this.currentEnd >= this.length && (this.currentEnd = 0),
			this.currentLength >= 1 && (this.currentLength < this.length ? this.geometry.setDrawRange(0, (this.currentLength - 1) * this.FaceIndicesPerNode) : this.geometry.setDrawRange(0, this.currentLength * this.FaceIndicesPerNode)),
			this.updateNodeID(this.currentEnd, this.currentNodeID),
			this.currentNodeID++
	}
}(),
THREE.TrailRenderer.prototype.updateHead = function() {
	var e = new THREE.Matrix4;
	return function() {
			this.currentEnd < 0 || (this.targetObject.updateMatrixWorld(),
			e.copy(this.targetObject.matrixWorld),
			this.updateNodePositionsFromTransformMatrix(this.currentEnd, e))
	}
}(),
THREE.TrailRenderer.prototype.updateNodeID = function(e, t) {
	this.nodeIDs[e] = t;
	for (var r = this.geometry.getAttribute("nodeID"), o = this.geometry.getAttribute("nodeVertexID"), a = 0; a < this.VerticesPerNode; a++) {
			var i = e * this.VerticesPerNode + a;
			r.array[i] = t,
			o.array[i] = a
	}
	r.needsUpdate = !0,
	o.needsUpdate = !0,
	r.updateRange.offset = e * this.VerticesPerNode,
	r.updateRange.count = this.VerticesPerNode,
	o.updateRange.offset = e * this.VerticesPerNode,
	o.updateRange.count = this.VerticesPerNode
}
,
THREE.TrailRenderer.prototype.updateNodeCenter = function(e, t) {
	this.lastNodeCenter = this.currentNodeCenter,
	this.currentNodeCenter = this.nodeCenters[e],
	this.currentNodeCenter.copy(t);
	for (var r = this.geometry.getAttribute("nodeCenter"), o = 0; o < this.VerticesPerNode; o++) {
			var a = 3 * (e * this.VerticesPerNode + o);
			r.array[a] = t.x,
			r.array[a + 1] = t.y,
			r.array[a + 2] = t.z
	}
	r.needsUpdate = !0,
	r.updateRange.offset = e * this.VerticesPerNode * THREE.TrailRenderer.PositionComponentCount,
	r.updateRange.count = this.VerticesPerNode * THREE.TrailRenderer.PositionComponentCount
}
,
THREE.TrailRenderer.prototype.updateNodePositionsFromOrientationTangent = function() {
	for (var e = (new THREE.Matrix4,
	new THREE.Quaternion), t = new THREE.Vector3, r = [], o = 0; o < THREE.TrailRenderer.MaxHeadVertices; o++) {
			var a = new THREE.Vector3;
			r.push(a)
	}
	return function(o, a, i) {
			var n = this.geometry.getAttribute("position");
			this.updateNodeCenter(o, a),
			t.copy(a),
			t.sub(THREE.TrailRenderer.LocalHeadOrigin),
			e.setFromUnitVectors(THREE.TrailRenderer.LocalOrientationTangent, i);
			for (var s = 0; s < this.localHeadGeometry.length; s++) {
					var c = r[s];
					c.copy(this.localHeadGeometry[s]),
					c.applyQuaternion(e),
					c.add(t)
			}
			for (var s = 0; s < this.localHeadGeometry.length; s++) {
					var l = (this.VerticesPerNode * o + s) * THREE.TrailRenderer.PositionComponentCount
						, u = r[s];
					n.array[l] = u.x,
					n.array[l + 1] = u.y,
					n.array[l + 2] = u.z
			}
			n.needsUpdate = !0
	}
}(),
THREE.TrailRenderer.prototype.updateNodePositionsFromTransformMatrix = function() {
	function e(e, t) {
			var r = t.elements;
			e.set(r[0], r[1], r[2], r[4], r[5], r[6], r[8], r[9], r[10])
	}
	for (var t = (new THREE.Matrix4,
	new THREE.Matrix3), r = new THREE.Quaternion, o = new THREE.Vector3, a = new THREE.Vector3, i = new THREE.Vector3, n = new THREE.Vector3, s = [], c = 0; c < THREE.TrailRenderer.MaxHeadVertices; c++) {
			var l = new THREE.Vector3;
			s.push(l)
	}
	return function(c, l) {
			var u = this.geometry.getAttribute("position");
			o.set(0, 0, 0),
			o.applyMatrix4(l),
			this.updateNodeCenter(c, o);
			for (var d = 0; d < this.localHeadGeometry.length; d++) {
					var h = s[d];
					h.copy(this.localHeadGeometry[d])
			}
			for (var d = 0; d < this.localHeadGeometry.length; d++) {
					var h = s[d];
					h.applyMatrix4(l)
			}
			if (this.lastNodeCenter && this.orientToMovement && (e(t, l),
			i.set(0, 0, -1),
			i.applyMatrix3(t),
			n.copy(this.currentNodeCenter),
			n.sub(this.lastNodeCenter),
			n.normalize(),
			n.lengthSq() <= 1e-4 && this.lastOrientationDir && n.copy(this.lastOrientationDir),
			n.lengthSq() > 1e-4)) {
					this.lastOrientationDir || (this.lastOrientationDir = new THREE.Vector3),
					r.setFromUnitVectors(i, n),
					a.copy(this.currentNodeCenter);
					for (var d = 0; d < this.localHeadGeometry.length; d++) {
							var h = s[d];
							h.sub(a),
							h.applyQuaternion(r),
							h.add(a)
					}
			}
			for (var d = 0; d < this.localHeadGeometry.length; d++) {
					var v = (this.VerticesPerNode * c + d) * THREE.TrailRenderer.PositionComponentCount
						, f = s[d];
					u.array[v] = f.x,
					u.array[v + 1] = f.y,
					u.array[v + 2] = f.z
			}
			u.needsUpdate = !0,
			u.updateRange.offset = c * this.VerticesPerNode * THREE.TrailRenderer.PositionComponentCount,
			u.updateRange.count = this.VerticesPerNode * THREE.TrailRenderer.PositionComponentCount
	}
}(),
THREE.TrailRenderer.prototype.connectNodes = function() {
	var e = {
			attribute: null,
			offset: 0,
			count: -1
	};
	return function(t, r) {
			for (var o = this.geometry.getIndex(), a = 0; a < this.localHeadGeometry.length - 1; a++) {
					var i = this.VerticesPerNode * t + a
						, n = this.VerticesPerNode * r + a
						, s = (t * this.FacesPerNode + a * THREE.TrailRenderer.FacesPerQuad) * THREE.TrailRenderer.IndicesPerFace;
					o.array[s] = i,
					o.array[s + 1] = n,
					o.array[s + 2] = i + 1,
					o.array[s + 3] = n,
					o.array[s + 4] = n + 1,
					o.array[s + 5] = i + 1
			}
			return o.needsUpdate = !0,
			o.updateRange.count = -1,
			e.attribute = o,
			e.offset = t * this.FacesPerNode * THREE.TrailRenderer.IndicesPerFace,
			e.count = this.FacesPerNode * THREE.TrailRenderer.IndicesPerFace,
			e
	}
}(),
THREE.TrailRenderer.prototype.disconnectNodes = function(e) {
	var t = {
			attribute: null,
			offset: 0,
			count: -1
	};
	return function(e) {
			for (var r = this.geometry.getIndex(), o = 0; o < this.localHeadGeometry.length - 1; o++) {
					var a = (this.VerticesPerNode * e + o,
					(e * this.FacesPerNode + o * THREE.TrailRenderer.FacesPerQuad) * THREE.TrailRenderer.IndicesPerFace);
					r.array[a] = 0,
					r.array[a + 1] = 0,
					r.array[a + 2] = 0,
					r.array[a + 3] = 0,
					r.array[a + 4] = 0,
					r.array[a + 5] = 0
			}
			return r.needsUpdate = !0,
			r.updateRange.count = -1,
			t.attribute = r,
			t.offset = e * this.FacesPerNode * THREE.TrailRenderer.IndicesPerFace,
			t.count = this.FacesPerNode * THREE.TrailRenderer.IndicesPerFace,
			t
	}
}(),
THREE.TrailRenderer.prototype.updateIndexRangesForConnectAndDisconnect = function(e, t) {
	var r = e.attribute;
	t ? e.offset + e.count == t.offset ? (r.offset = e.offset,
	r.count = e.count) : (r.offset = 0,
	r.count = -1) : (r.offset = e.offset,
	r.count = e.count)
}
,
THREE.TrailRenderer.prototype.deactivate = function() {
	this.isActive && (this.scene.remove(this.mesh),
	this.isActive = !1)
}
,
THREE.TrailRenderer.prototype.activate = function() {
	this.isActive || (this.scene.add(this.mesh),
	this.isActive = !0)
}
,
THREE.CopyShader = {
	uniforms: {
			tDiffuse: {
					value: null
			},
			opacity: {
					value: 1
			}
	},
	vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
	fragmentShader: ["uniform float opacity;", "uniform sampler2D tDiffuse;", "varying vec2 vUv;", "void main() {", "vec4 texel = texture2D( tDiffuse, vUv );", "gl_FragColor = opacity * texel;", "}"].join("\n")
},
THREE.BokehShader = {
	uniforms: {
			tColor: {
					value: null
			},
			tDepth: {
					value: null
			},
			focus: {
					value: 1
			},
			aspect: {
					value: 1
			},
			aperture: {
					value: .025
			},
			maxblur: {
					value: 1
			}
	},
	vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
	fragmentShader: ["varying vec2 vUv;", "uniform sampler2D tColor;", "uniform sampler2D tDepth;", "uniform float maxblur;", "uniform float aperture;", "uniform float focus;", "uniform float aspect;", "void main() {", "vec2 aspectcorrect = vec2( 1.0, aspect );", "vec4 depth1 = texture2D( tDepth, vUv );", "float factor = depth1.x - focus;", "vec2 dofblur = vec2 ( clamp( factor * aperture, -maxblur, maxblur ) );", "vec2 dofblur9 = dofblur * 0.9;", "vec2 dofblur7 = dofblur * 0.7;", "vec2 dofblur4 = dofblur * 0.4;", "vec4 col = vec4( 0.0 );", "col += texture2D( tColor, vUv.xy );", "col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur );", "col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur );", "col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur );", "col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur );", "col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur );", "col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur );", "col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur );", "col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur );", "col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur );", "col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur );", "col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur );", "col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur );", "col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur );", "col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur );", "col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur );", "col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur );", "col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur9 );", "col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur9 );", "col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur9 );", "col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur9 );", "col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur9 );", "col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur9 );", "col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur9 );", "col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur9 );", "col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur7 );", "col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur7 );", "col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur7 );", "col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur7 );", "col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur7 );", "col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur7 );", "col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur7 );", "col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur7 );", "col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur4 );", "col += texture2D( tColor, vUv.xy + ( vec2(  0.4,   0.0  ) * aspectcorrect ) * dofblur4 );", "col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur4 );", "col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur4 );", "col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur4 );", "col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur4 );", "col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur4 );", "col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur4 );", "gl_FragColor = col / 41.0;", "gl_FragColor.a = 1.0;", "}"].join("\n")
},
THREE.EffectComposer = function(e, t) {
	if (this.renderer = e,
	void 0 === t) {
			var r = {
					minFilter: THREE.LinearFilter,
					magFilter: THREE.LinearFilter,
					format: THREE.RGBAFormat,
					stencilBuffer: !1
			}
				, o = e.getSize();
			t = new THREE.WebGLRenderTarget(o.width,o.height,r)
	}
	this.renderTarget1 = t,
	this.renderTarget2 = t.clone(),
	this.writeBuffer = this.renderTarget1,
	this.readBuffer = this.renderTarget2,
	this.passes = [],
	void 0 === THREE.CopyShader && console.error("THREE.EffectComposer relies on THREE.CopyShader"),
	this.copyPass = new THREE.ShaderPass(THREE.CopyShader)
}
,
Object.assign(THREE.EffectComposer.prototype, {
	swapBuffers: function() {
			var e = this.readBuffer;
			this.readBuffer = this.writeBuffer,
			this.writeBuffer = e
	},
	addPass: function(e) {
			this.passes.push(e);
			var t = this.renderer.getSize();
			e.setSize(t.width, t.height)
	},
	insertPass: function(e, t) {
			this.passes.splice(t, 0, e)
	},
	render: function(e) {
			var t, r, o = !1, a = this.passes.length;
			for (r = 0; r < a; r++)
					if (t = this.passes[r],
					t.enabled !== !1) {
							if (t.render(this.renderer, this.writeBuffer, this.readBuffer, e, o),
							t.needsSwap) {
									if (o) {
											var i = this.renderer.context;
											i.stencilFunc(i.NOTEQUAL, 1, 4294967295),
											this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, e),
											i.stencilFunc(i.EQUAL, 1, 4294967295)
									}
									this.swapBuffers()
							}
							void 0 !== THREE.MaskPass && (t instanceof THREE.MaskPass ? o = !0 : t instanceof THREE.ClearMaskPass && (o = !1))
					}
	},
	reset: function(e) {
			if (void 0 === e) {
					var t = this.renderer.getSize();
					e = this.renderTarget1.clone(),
					e.setSize(t.width, t.height)
			}
			this.renderTarget1.dispose(),
			this.renderTarget2.dispose(),
			this.renderTarget1 = e,
			this.renderTarget2 = e.clone(),
			this.writeBuffer = this.renderTarget1,
			this.readBuffer = this.renderTarget2
	},
	setSize: function(e, t) {
			this.renderTarget1.setSize(e, t),
			this.renderTarget2.setSize(e, t);
			for (var r = 0; r < this.passes.length; r++)
					this.passes[r].setSize(e, t)
	}
}),
THREE.Pass = function() {
	this.enabled = !0,
	this.needsSwap = !0,
	this.clear = !1,
	this.renderToScreen = !1
}
,
Object.assign(THREE.Pass.prototype, {
	setSize: function(e, t) {},
	render: function(e, t, r, o, a) {
			console.error("THREE.Pass: .render() must be implemented in derived pass.")
	}
}),
THREE.RenderPass = function(e, t, r, o, a) {
	THREE.Pass.call(this),
	this.scene = e,
	this.camera = t,
	this.overrideMaterial = r,
	this.clearColor = o,
	this.clearAlpha = void 0 !== a ? a : 0,
	this.clear = !0,
	this.clearDepth = !1,
	this.needsSwap = !1
}
,
THREE.RenderPass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {
	constructor: THREE.RenderPass,
	render: function(e, t, r, o, a) {
			var i = e.autoClear;
			e.autoClear = !1,
			this.scene.overrideMaterial = this.overrideMaterial;
			var n, s;
			this.clearColor && (n = e.getClearColor().getHex(),
			s = e.getClearAlpha(),
			e.setClearColor(this.clearColor, this.clearAlpha)),
			this.clearDepth && e.clearDepth(),
			e.render(this.scene, this.camera, this.renderToScreen ? null : r, this.clear),
			this.clearColor && e.setClearColor(n, s),
			this.scene.overrideMaterial = null,
			e.autoClear = i
	}
}),
THREE.ShaderPass = function(e, t) {
	THREE.Pass.call(this),
	this.textureID = void 0 !== t ? t : "tDiffuse",
	e instanceof THREE.ShaderMaterial ? (this.uniforms = e.uniforms,
	this.material = e) : e && (this.uniforms = THREE.UniformsUtils.clone(e.uniforms),
	this.material = new THREE.ShaderMaterial({
			defines: e.defines || {},
			uniforms: this.uniforms,
			vertexShader: e.vertexShader,
			fragmentShader: e.fragmentShader
	})),
	this.camera = new THREE.OrthographicCamera((-1),1,1,(-1),0,1),
	this.scene = new THREE.Scene,
	this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2,2),null),
	this.scene.add(this.quad)
}
,
THREE.ShaderPass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {
	constructor: THREE.ShaderPass,
	render: function(e, t, r, o, a) {
			this.uniforms[this.textureID] && (this.uniforms[this.textureID].value = r.texture),
			this.quad.material = this.material,
			this.renderToScreen ? e.render(this.scene, this.camera) : e.render(this.scene, this.camera, t, this.clear)
	}
}),
THREE.BokehPass = function(e, t, r) {
	THREE.Pass.call(this),
	this.scene = e,
	this.camera = t;
	var o = void 0 !== r.focus ? r.focus : 1
		, a = void 0 !== r.aspect ? r.aspect : t.aspect
		, i = void 0 !== r.aperture ? r.aperture : .025
		, n = void 0 !== r.maxblur ? r.maxblur : 1
		, s = r.width || window.innerWidth || 1
		, c = r.height || window.innerHeight || 1;
	this.renderTargetColor = new THREE.WebGLRenderTarget(s,c,{
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBFormat
	}),
	this.renderTargetDepth = this.renderTargetColor.clone(),
	this.materialDepth = new THREE.MeshDepthMaterial,
	void 0 === THREE.BokehShader && console.error("THREE.BokehPass relies on THREE.BokehShader");
	var l = THREE.BokehShader
		, u = THREE.UniformsUtils.clone(l.uniforms);
	u.tDepth.value = this.renderTargetDepth.texture,
	u.focus.value = o,
	u.aspect.value = a,
	u.aperture.value = i,
	u.maxblur.value = n,
	this.materialBokeh = new THREE.ShaderMaterial({
			uniforms: u,
			vertexShader: l.vertexShader,
			fragmentShader: l.fragmentShader
	}),
	this.uniforms = u,
	this.needsSwap = !1,
	this.camera2 = new THREE.OrthographicCamera((-1),1,1,(-1),0,1),
	this.scene2 = new THREE.Scene,
	this.quad2 = new THREE.Mesh(new THREE.PlaneBufferGeometry(2,2),null),
	this.scene2.add(this.quad2)
}
,
THREE.BokehPass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {
	constructor: THREE.BokehPass,
	render: function(e, t, r, o, a) {
			this.quad2.material = this.materialBokeh,
			this.scene.overrideMaterial = this.materialDepth,
			e.render(this.scene, this.camera, this.renderTargetDepth, !0),
			this.uniforms.tColor.value = r.texture,
			this.renderToScreen ? e.render(this.scene2, this.camera2) : e.render(this.scene2, this.camera2, t, this.clear),
			this.scene.overrideMaterial = null
	}
}),
THREE.GlowShader = {
	uniforms: {
			tDiffuse: {
					type: "t",
					value: null
			},
			amount: {
					type: "f",
					value: .5
			},
			size: {
					type: "f",
					value: 4
			},
			darkness: {
					type: "f",
					value: .1
			},
			resolution: {
					type: "v2",
					value: new THREE.Vector2(800,600)
			}
	},
	vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
	fragmentShader: ["uniform sampler2D tDiffuse;", "uniform float size;", "uniform float amount;", "uniform vec2 resolution;", "uniform float darkness;", "varying vec2 vUv;", "void main() {", "float h = size / resolution.x;", "float v = size / resolution.y;", "vec4 sum = vec4( 0.0 );", "sum += (texture2D( tDiffuse, vec2( vUv.x - 4.0 * h, vUv.y ) )- darkness) * 0.051 ;", "sum += (texture2D( tDiffuse, vec2( vUv.x - 3.0 * h, vUv.y ) )- darkness) * 0.0918;", "sum += (texture2D( tDiffuse, vec2( vUv.x - 2.0 * h, vUv.y ) )- darkness) * 0.12245;", "sum += (texture2D( tDiffuse, vec2( vUv.x - 1.0 * h, vUv.y ) )- darkness) * 0.1531;", "sum += (texture2D( tDiffuse, vec2( vUv.x, vUv.y ) )- darkness) * 0.1633;", "sum += (texture2D( tDiffuse, vec2( vUv.x + 1.0 * h, vUv.y ) )- darkness) * 0.1531;", "sum += (texture2D( tDiffuse, vec2( vUv.x + 2.0 * h, vUv.y ) )- darkness) * 0.12245;", "sum += (texture2D( tDiffuse, vec2( vUv.x + 3.0 * h, vUv.y ) )- darkness) * 0.0918;", "sum += (texture2D( tDiffuse, vec2( vUv.x + 4.0 * h, vUv.y ) )- darkness) * 0.051;", "sum += (texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * v ) )- darkness) * 0.051;", "sum += (texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v ) )- darkness) * 0.0918;", "sum += (texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v ) )- darkness) * 0.12245;", "sum += (texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v ) )- darkness) * 0.1531;", "sum += (texture2D( tDiffuse, vec2( vUv.x, vUv.y ) )- darkness) * 0.1633;", "sum += (texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v ) )- darkness) * 0.1531;", "sum += (texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v ) )- darkness) * 0.12245;", "sum += (texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v ) )- darkness) * 0.0918;", "sum += (texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v ) )- darkness) * 0.051;", "vec4 base = texture2D( tDiffuse, vUv );", "gl_FragColor = base + max(sum,0.0) * amount;", "}"].join("\n")
},
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
},
THREE.FilmGrainShader = {
	uniforms: {
			tDiffuse: {
					type: "t",
					value: null
			},
			time: {
					type: "f",
					value: 0
			},
			noiseAmt: {
					type: "f",
					value: .05
			},
			resolution: {
					type: "v2",
					value: new THREE.Vector2(0,0)
			}
	},
	vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),
	fragmentShader: ["varying vec2 vUv;", "uniform sampler2D tDiffuse;", "uniform sampler2D bg;", "uniform float time;", "uniform float noiseAmt;", "float snoise(in vec2 co){", "return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);", "}", "void main() {", "vec4 warp = texture2D(tDiffuse, vUv);", "float noise = snoise(vUv + vec2(cos(time), sin(time)));", "gl_FragColor = warp + (noise * noiseAmt);", "}"].join("\n")
},
Detector.webgl || Detector.addGetWebGLMessage();
var overlay = document.getElementById("overlay"), w = window.innerWidth, h = window.innerHeight, mouseX = 0, mouseY = 0, container, scene, camera, renderer, clock, time = 0, rendererBackground = 131081, cameraZ = 1e4, postprocessing = {}, renderPass, wobblePass, glowPass, filmGrainPass, hueLower = 205, hueUpper = 280, radius = .8 * cameraZ, stars = Math.round(radius), starSize = radius / 92, starSystem, uniforms, starsGeometry, texture, orbCount = 64, orb, orbs = [], trail, trailHeadGeometry, trailMaterial, trailLength = 120, trails = [], bpm = 136, bars = [], tilt = 1.4 * cameraZ, deltaX = 0, deltaY = 0, deltaZ = 3.2 * cameraZ, freqs = new Uint8Array(orbCount), jsNode, context, sourceNode, analyzerSmoothing = .4, analyzerResolution = 512, context = new (window.AudioContext || window.webkitAudioContext), gainNode = context.createGain(), muteButton = document.getElementById("mute"), unMuteButton = document.getElementById("unmute"), muted = !1, playButton = document.getElementById("play"), paused = !0, about = document.getElementById("about"), aboutSwitch = document.getElementById("aboutSwitch"), aboutClose = document.getElementById("aboutClose");
muteButton.onclick = function(e) {
	e.preventDefault(),
	0 == muted && (muted = !0,
	muteButton.className = "mute active",
	unMuteButton.className = "mute inactive",
	gainNode.gain.value = 0)
}
,
unMuteButton.onclick = function(e) {
	e.preventDefault(),
	1 == muted && (muted = !1,
	muteButton.className = "mute inactive",
	unMuteButton.className = "mute active",
	gainNode.gain.value = 1)
}
,
playButton.onclick = function(e) {
	e.preventDefault(),
	0 == paused ? (paused = !0,
	playButton.className += " paused",
	context.suspend()) : (paused = !1,
	playButton.className = "play",
	context.resume())
}
;
var hideAbout = new TimelineMax;
hideAbout.set(".about-overlay", {
	autoAlpha: 0
}),
hideAbout.set(".about-copy h2", {
	autoAlpha: 0,
	yPercent: 100
}),
hideAbout.set(".about-copy p", {
	autoAlpha: 0,
	yPercent: 10
}),
hideAbout.set(".about-close", {
	xPercent: 300
}),
window.innerWidth > 640 ? hideAbout.set(".profile-img", {
	xPercent: 100
}) : hideAbout.set(".profile-img", {
	autoAlpha: 0
});
var nav = document.getElementById("nav");
aboutSwitch.onclick = function(e) {
	e.preventDefault();
	var t = nav.offsetWidth - aboutSwitch.offsetWidth;
	about.className = "about about-open";
	var r = new TimelineMax;
	r.set(".about", {
			autoAlpha: 1
	}),
	window.innerWidth > 640 && (r.set(".about", {
			width: t
	}),
	r.to("#aboutSwitch span", .3, {
			autoAlpha: 0,
			xPercent: -100,
			ease: Power3.easeOut
	}, 0)),
	r.to(".about-overlay", .7, {
			autoAlpha: .85,
			ease: Linear.easeNone
	}, 0),
	r.to(".profile-img", .7, {
			autoAlpha: 1,
			xPercent: 0,
			ease: Power3.easeOut
	}, .1),
	r.staggerTo([".about-copy h2", ".about-copy p"], 1, {
			autoAlpha: 1,
			yPercent: 0,
			ease: Power3.easeOut
	}, .1, .2),
	r.to(".about-close", 1, {
			xPercent: 0,
			ease: Expo.easeOut
	}, .5)
}
,
aboutClose.onclick = function(e) {
	e.preventDefault(),
	about.className = "about";
	var t = new TimelineMax;
	t.to(".about-overlay", 1, {
			autoAlpha: 0,
			ease: Linear.easeNone
	}, 0),
	t.to(".about-close", .5, {
			xPercent: 300,
			ease: Power3.easeOut
	}, 0),
	t.to(".about-copy p", .5, {
			autoAlpha: 0,
			yPercent: 10,
			ease: Power3.easeOut
	}, .1),
	t.to(".about-copy h2", .5, {
			autoAlpha: 0,
			yPercent: 100,
			ease: Power3.easeOut
	}, .2),
	t.to(".profile-img", .5, {
			autoAlpha: 0,
			ease: Linear.easeNone
	}, .1),
	t.to("#aboutSwitch span", .3, {
			autoAlpha: 1,
			xPercent: 0,
			ease: Power3.easeOut
	}, .5),
	window.innerWidth > 640 && t.set(".profile-img", {
			autoAlpha: 1,
			xPercent: 100
	})
}
;
for (var nwidth = .0125 * window.innerHeight, nheight = .0275 * window.innerHeight, intro = new TimelineMax({
	paused: !0,
	onComplete: setupRoutingGraph
}), i = 0; i < 20; i++)
	intro.to(".stamp", .1, {
			autoAlpha: .75 + .25 * Math.random()
	});
intro.to(".stamp", .1, {
	autoAlpha: 1
}),
intro.to(".overlay", 3, {
	autoAlpha: 0
}, "-=2");
var introMob = new TimelineMax({
	paused: !0,
	onComplete: setupRoutingGraph
});
introMob.to(".overlay", 3, {
	autoAlpha: 0
}),
introMob.fromTo(".wordmark", .75, {
	autoAlpha: 0,
	x: -nwidth
}, {
	autoAlpha: 1,
	x: 0
}, 1.5),
introMob.staggerFromTo(".social-li", 1, {
	autoAlpha: 0,
	y: 64
}, {
	autoAlpha: 1,
	y: 0,
	ease: Back.easeOut.config(.75)
}, .2, 1.5),
introMob.to(".preloader", 1, {
	autoAlpha: 0
}),
introMob.fromTo(".monogram", 1, {
	autoAlpha: 0
}, {
	autoAlpha: 1
});
var begin = new TimelineMax({
	paused: !0
});
begin.to(".preloader", 1, {
	autoAlpha: 0
}),
begin.fromTo(".wordmark", .75, {
	autoAlpha: 0
}, {
	autoAlpha: 1
}),
begin.fromTo(".monogram", 1, {
	autoAlpha: 0
}, {
	autoAlpha: 1
}, "-=0.5"),
begin.fromTo(".mute-wrap", .75, {
	autoAlpha: 0,
	y: 64
}, {
	autoAlpha: 1,
	y: 0,
	ease: Back.easeOut.config(.75)
}, "-=1"),
begin.staggerFromTo(".social-li", .75, {
	autoAlpha: 0,
	y: 64
}, {
	autoAlpha: 1,
	y: 0,
	ease: Back.easeOut.config(.75)
}, .1, "-=1");
var beginMob = new TimelineMax({
	paused: !0
});
init(),
animate();
