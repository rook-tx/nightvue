/* eslint-disable */

// ----------
// Detector
// ----------

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();


// ----------
// Vars
// ----------

var w = window.innerWidth,
    h = window.innerHeight,
    mouseX = 0,
    mouseY = 0;

var container, scene, camera, renderer;

var rendererBackground = 0x050009;

var cameraX = 0,
    cameraY = 0,
    cameraZ = 10000;

var hueLower = 200,
    hueUpper = 280;

var radius = cameraZ*0.8,
    stars = Math.round(radius*2/3),
    starSize = radius/65;

var starSystem, uniforms, starsGeometry, texture;

var orbCount = 64;
var orb,
    orbs = [];
var trail, trailHeadGeometry, trailMaterial,
    trailLength = 120,
    trails = [];

var bpm = 111,
    bars = [],
    tilt = cameraZ*1.5,
    deltaX = 0,
    deltaY = 0,
    freqs = new Uint8Array( orbCount );

var jsNode, context, sourceNode,
    analyzerSmoothing = 0.4,
    analyzerResolution = 256;

var postprocessing = {},
    wobblePass, glowPass;


// ----------
// init
// ----------

init();
animate();
setupRoutingGraph();

function init() {
	container = document.getElementById( 'container' );

  initScene();
  initRenderer();
  initPostprocessing();

  initStars();
  initOrbs();
  initTrailRenderers();

  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'touchstart', onDocumentTouchStart, false );
  document.addEventListener( 'touchmove', onDocumentTouchMove, false );
  window.addEventListener( 'resize', onWindowResize, false );

}


// ----------
// events
// ----------

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove(e) {
  mouseX = e.clientX - (window.innerWidth/2);
  mouseY = e.clientY - (window.innerHeight/2);
}

function onDocumentTouchStart(e) {
	if ( e.touches.length > 1 ) {
		e.preventDefault();
		mouseX = e.touches[ 0 ].pageX - (window.innerWidth/2);
		mouseY = e.touches[ 0 ].pageY - (window.innerHeight/2);
	}
}

function onDocumentTouchMove(e) {
	if ( e.touches.length == 1 ) {
		e.preventDefault();
		mouseX = e.touches[ 0 ].pageX - (window.innerWidth/2);
		mouseY = e.touches[ 0 ].pageY - (window.innerHeight/2);
	}
}


// ----------
// Init scene and camera
// ----------

function initScene() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 30000 );
  scene.add( camera );
  resetCamera();
}

function resetCamera() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  camera.position.set( cameraX, cameraY, cameraZ );
  camera.lookAt( scene.position );
}

function initRenderer() {
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor( rendererBackground );
  renderer.sortObjects = false;
  container.appendChild( renderer.domElement );
}


// ----------
// Stars
// ----------

function initStars( onFinished ) {
	var shaderMaterial = new THREE.ShaderMaterial( {
    uniforms: {
     color: {
       value: new THREE.Color( 0xffffff )
     },
    	texture: {
       value: new THREE.TextureLoader().load( "/static/images/textures/sprites/spark1.png" )
     }
    },
    vertexShader: ["attribute float size;", "attribute vec3 customColor;", "varying vec3 vColor;", "void main() {", "vColor = customColor;", "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );", "gl_PointSize = size * ( 300.0 / -mvPosition.z );", "gl_Position = projectionMatrix * mvPosition;", "}"].join("\n"),
    fragmentShader: ["uniform vec3 color;", "uniform sampler2D texture;", "varying vec3 vColor;", "void main() {", "gl_FragColor = vec4( color * vColor, 1.0 );", "gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );", "}"].join("\n"),
		blending:       THREE.AdditiveBlending,
		depthTest:      false,
		transparent:    true
	});

	var starsGeometry = new THREE.BufferGeometry();

	var positions = new Float32Array( stars * 3 );
	var colors = new Float32Array( stars * 3 );
	var sizes = new Float32Array( stars );

	var color = new THREE.Color();

	for ( var i = 0, i3 = 0; i < stars; i ++, i3 += 3 ) {
		positions[ i3 + 0 ] = ( Math.random() * 2 - 1 ) * radius;
		positions[ i3 + 1 ] = ( Math.random() * 2 - 1 ) * radius;
		positions[ i3 + 2 ] = ( Math.random() * 2 - 1 ) * radius;

    var hue = ( hueLower + (Math.random() * (hueUpper - hueLower)) ) / 360;

    color.setHSL( hue, (0.5 + (Math.random() * 0.5)), (0.5 + (Math.random() * 0.5)) );

		colors[ i3 + 0 ] = color.r;
		colors[ i3 + 1 ] = color.g;
		colors[ i3 + 2 ] = color.b;

		sizes[ i ] = starSize;
	}

	starsGeometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	starsGeometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	starsGeometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );

	starSystem = new THREE.Points( starsGeometry, shaderMaterial );

	scene.add( starSystem );

  if( onFinished ) {
    onFinished();
  }
}


// ----------
// Orbs & trails
// ----------

function initOrbs( onFinished ) {

  for ( var i = 0; i < orbCount; i ++ ) {
    var geometry = new THREE.SphereGeometry(1);
    var material = new THREE.MeshBasicMaterial({ color: rendererBackground });
    orb = new THREE.Mesh( geometry, material );
    orb.position.z = i*i+i*i - radius;
    orbs.push( orb );
    scene.add( orb );
  }
}

function initTrailRenderers( callback ) {

  for ( o = 0; o < orbs.length; o++ ) {
    var trailHeadGeometry = [];
    var twoPI = Math.PI * 2;
    var index = 0;
    var scale = 6 + ( o/orbCount )*2;
    var inc = twoPI / 32.0;

    for ( var i = 0; i <= twoPI + inc; i+= inc )  {
      var vector = new THREE.Vector3();
      vector.set( Math.cos( i ) * scale, Math.sin( i ) * scale, 0 );
      trailHeadGeometry[ index ] = vector;
      index ++;
    }

    var trail = new THREE.TrailRenderer( scene, false );
    trailMaterial = THREE.TrailRenderer.createBaseMaterial();
    trail.initialize( trailMaterial, trailLength, false, 0, trailHeadGeometry, orbs[o] );
    updateTrailColors(o);
    trail.activate();
    trails.push(trail);
  }

  if ( callback ) {
    callback();
  }
}

function updateTrailColors( o ) {
  var color = new THREE.Color();
  var hue = ( hueLower + ( Math.random() * (hueUpper - hueLower) )) / 360;

  color.setHSL( hue, (0.5 + (Math.random() * 0.5)), (0.4 + (Math.random() * 0.4)) );

  trailMaterial.uniforms.headColor.value.set( color.r, color.g, color.b, 0.6 );
}



// ----------
// Frequencies
// ----------

function setupRoutingGraph() {
  var AudioContext = window.AudioContext || window.webkitAudioContext;
  var context = new AudioContext();

  sourceNode  = context.createBufferSource();

  analyzer = context.createAnalyser();
  analyzer.smoothingTimeConstant = analyzerSmoothing;
  analyzer.fftSize = orbCount*2;

  jsNode = context.createScriptProcessor(analyzerResolution, 1, 1);

  jsNode.onaudioprocess = function() {
    analyzer.getByteFrequencyData( freqs );
  };

	jsNode.connect( context.destination );
	sourceNode.connect( analyzer );
	analyzer.connect( jsNode );
	sourceNode.connect( context.destination );

	var req = new XMLHttpRequest();
	req.open('GET', '/static/audio/infinity.mp3', true);
	req.responseType = 'arraybuffer';

	req.onload = function() {
		context.decodeAudioData(req.response, function(buf) {
			sourceNode.buffer = buf;
			sourceNode.start(0);
		}, function(e) {
      console.log(e);
    });
	};
	req.send();
}


// ----------
// Post
// ----------

function initPostprocessing() {
  var renderPass = new THREE.RenderPass( scene, camera );
  var composer = new THREE.EffectComposer( renderer );

  var bokehPass = new THREE.BokehPass( scene, camera, {
    focus: 		1.0,
    aperture:	0.003,
    maxblur:	1,
    width: window.innerWidth,
    height: window.innerHeight
  });

  bokehPass.renderToScreen = true;

  glowPass = new THREE.ShaderPass(THREE.GlowShader);
  glowPass.uniforms.amount.value = 8;
  glowPass.uniforms.darkness.value = .1;
  glowPass.uniforms.resolution.value = new THREE.Vector2( window.innerWidth, window.innerHeight );

  wobblePass = new THREE.ShaderPass(THREE.WobbleShader);
  wobblePass.uniforms.size.value = 8;

  composer.addPass( renderPass );
  composer.addPass( glowPass );
  composer.addPass( wobblePass );
  composer.addPass( bokehPass );

  postprocessing.composer = composer;
}


// ----------
// Render
// ----------

function animate() {
  var time = performance.now();
  var scaledTime = time * (bpm/60000);

  requestAnimationFrame( animate );

  for ( i = 0; i < orbs.length; i++ ) {
    var ishift          = orbCount - i,
        ratio           = freqs[ishift] / 256,
        midThreshold    = 256 - (i/54 * 60),
        heavyThreshold  = 256 - ((orbCount - i)*1.15),
        orbRadius       = i * ( i + ( ratio * (i/15) )),
        orbRadiusMid    = i * ( i + ( ratio * (i/10) )),
        orbRadiusHeavy  = i * ( i + ( ratio * (i/2) )),
        orbZed          = i * ( i/4 ),
        theta           = scaledTime * i/100;

    if ( freqs[0] < 100 ) {
      orbRadius = i * i;
    }

    if ( freqs[ishift] > midThreshold ) {
      orbRadius = orbRadiusMid
    }

    if ( freqs[ishift] > heavyThreshold ) {
      orbRadius = orbRadiusHeavy
    }

    if ( i % 2 == 0 ) {
      orbs[i].position.x = orbRadius * Math.sin( theta );
      orbs[i].position.y = orbRadius * Math.cos( theta );
      orbs[i].position.z = i*i+i*i*(i/20) - radius*2 + ( orbZed * Math.cos( theta ) );
    } else {
      orbs[i].position.x = orbRadius * Math.cos( theta );
      orbs[i].position.y = orbRadius * Math.sin( theta );
      orbs[i].position.z = i*i+i*i*(i/20) - radius*2 - ( orbZed * Math.sin( theta ) );
    }

    trails[i].advance();
  }

  if ( freqs[0] > 100 ) {
    deltaX = ( mouseX / window.innerWidth ) * tilt;
    deltaY = ( mouseY / window.innerHeight ) * tilt;
  }

  camera.position.x += ( deltaX - camera.position.x ) * 0.015;
  camera.position.y += ( deltaY - camera.position.y ) * 0.015;
  camera.lookAt( scene.position );

  camera.rotation.z += scaledTime/4;
  starSystem.rotation.x += scaledTime/16384;

  wobblePass.uniforms.time.value = scaledTime/2;
  wobblePass.uniforms.strength.value = 0.015 * Math.sin( scaledTime );

  render();
}

function render() {
  postprocessing.composer.render();
}
