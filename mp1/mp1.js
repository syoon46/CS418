var gl;
var canvas;
var shaderProgram;
var vertexPositionBuffer;

var vertexColorBuffer;

var mvMatrix = mat4.create();
var rotAngle = 0;
var lastTime = 0;

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}


function degToRad(degrees) {
        return degrees * Math.PI / 180;
}


function createGLContext(canvas) {
  var names = ["webgl", "experimental-webgl"];
  var context = null;
  for (var i=0; i < names.length; i++) {
    try {
      context = canvas.getContext(names[i]);
    } catch(e) {}
    if (context) {
      break;
    }
  }
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}

function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);
  
  // If we don't find an element with the specified id
  // we do an early exit 
  if (!shaderScript) {
    return null;
  }
  
  // Loop through the children for the found DOM element and
  // build up the shader source code as a string
  var shaderSource = "";
  var currentChild = shaderScript.firstChild;
  while (currentChild) {
    if (currentChild.nodeType == 3) { // 3 corresponds to TEXT_NODE
      shaderSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
  }
 
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }
 
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
 
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  } 
  return shader;
}

function setupShaders() {
  vertexShader = loadShaderFromDOM("shader-vs");
  fragmentShader = loadShaderFromDOM("shader-fs");
  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  gl.useProgram(shaderProgram);
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  
}

function setupBuffers() {
  vertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);

  var triangleVertices = [
          -0.90,  0.95,  0.0,
           0.90,  0.95,  0.0,
          -0.90,  0.60,  0.0,

           0.90,  0.60,  0.0,
           0.90,  0.95,  0.0,
          -0.90,  0.60,  0.0,

          -0.70,  0.60,  0.0,
          -0.70, -0.40,  0.0,
          -0.30,  0.60,  0.0,

          -0.30, -0.40,  0.0,
          -0.70, -0.40,  0.0,
          -0.30,  0.60,  0.0,

           0.70,  0.60,  0.0,
           0.70, -0.40,  0.0,
           0.30,  0.60,  0.0,

           0.30, -0.40,  0.0,
           0.70, -0.40,  0.0,
           0.30,  0.60,  0.0,

          -0.30,  0.30,  0.0,
          -0.30, -0.10,  0.0,
          -0.175,  0.30,  0.0,

          -0.175, -0.10,  0.0,
          -0.30, -0.10,  0.0,
          -0.175,  0.30,  0.0,

           0.30,  0.30,  0.0,
           0.30, -0.10,  0.0,
           0.175,  0.30,  0.0,

           0.175, -0.10,  0.0,
           0.30, -0.10,  0.0,
           0.175,  0.30,  0.0,

          -0.7000, -0.45,  0.0,
          -0.7000, -0.575,  0.0,
          -0.5667, -0.45,  0.0,

          -0.5667, -0.45,  0.0,
          -0.5667, -0.65,  0.0,
          -0.7000, -0.575,  0.0,

           0.7000, -0.45,  0.0,
           0.7000, -0.575,  0.0,
           0.5667, -0.45,  0.0,

           0.5667, -0.45,  0.0,
           0.5667, -0.65,  0.0,
           0.7000, -0.575,  0.0,

           0.3000, -0.45, 0.0,
           0.4333, -0.45, 0.0,
           0.4333, -0.70, 0.0,

           0.3000, -0.45, 0.0,
           0.3000, -0.775, 0.0,
           0.4333, -0.70, 0.0,

          -0.3000, -0.45, 0.0,
          -0.4333, -0.45, 0.0,
          -0.4333, -0.70, 0.0,

          -0.3000, -0.45, 0.0,
          -0.3000, -0.775, 0.0,
          -0.4333, -0.70, 0.0,

          -0.1775, -0.45, 0.0,
          -0.1775, -0.825, 0.0,
          -0.0555, -0.45, 0.0,

		  -0.0555, -0.9, 0.0,
          -0.1775, -0.825, 0.0,
          -0.0555, -0.45, 0.0,  

           0.1775, -0.45, 0.0,
           0.1775, -0.825, 0.0,
           0.0555, -0.45, 0.0,

		   0.0555, -0.9, 0.0,
           0.1775, -0.825, 0.0,
           0.0555, -0.45, 0.0      

  ];
    
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
  vertexPositionBuffer.itemSize = 3;
  vertexPositionBuffer.numberOfItems = 66;
    
  vertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);

  var colors = [

		0.0, 0.0, 0.24314, 1.0,
		0.0, 0.0, 0.24314, 1.0,
		0.0, 0.0, 0.24314, 1.0,

		0.0, 0.0, 0.24314, 1.0,
		0.0, 0.0, 0.24314, 1.0,
		0.0, 0.0, 0.24314, 1.0,

        0.0, 0.0, 0.24314, 1.0,
		0.0, 0.0, 0.24314, 1.0,
		0.0, 0.0, 0.24314, 1.0,

		0.0, 0.0, 0.24314, 1.0,
		0.0, 0.0, 0.24314, 1.0,
		0.0, 0.0, 0.24314, 1.0,

		0.0, 0.0, 0.24314, 1.0,
		0.0, 0.0, 0.24314, 1.0,
		0.0, 0.0, 0.24314, 1.0,

        0.0, 0.0, 0.24314, 1.0,
		0.0, 0.0, 0.24314, 1.0,
		0.0, 0.0, 0.24314, 1.0,

		0.0, 0.0, 0.24314, 1.0,
		0.0, 0.0, 0.24314, 1.0,
		0.0, 0.0, 0.24314, 1.0,

		0.0, 0.0, 0.24314, 1.0,
		0.0, 0.0, 0.24314, 1.0,
		0.0, 0.0, 0.24314, 1.0,

        0.0, 0.0, 0.24314, 1.0,
		0.0, 0.0, 0.24314, 1.0,
		0.0, 0.0, 0.24314, 1.0,

		0.0, 0.0, 0.24314, 1.0,
		0.0, 0.0, 0.24314, 1.0,
		0.0, 0.0, 0.24314, 1.0,

		1.0, 0.27843, 0.10196, 1.0,
		1.0, 0.27843, 0.10196, 1.0,
		1.0, 0.27843, 0.10196, 1.0,

		1.0, 0.27843, 0.10196, 1.0,
		1.0, 0.27843, 0.10196, 1.0,
		1.0, 0.27843, 0.10196, 1.0,

		1.0, 0.27843, 0.10196, 1.0,
		1.0, 0.27843, 0.10196, 1.0,
		1.0, 0.27843, 0.10196, 1.0,

		1.0, 0.27843, 0.10196, 1.0,
		1.0, 0.27843, 0.10196, 1.0,
		1.0, 0.27843, 0.10196, 1.0,

		1.0, 0.27843, 0.10196, 1.0,
		1.0, 0.27843, 0.10196, 1.0,
		1.0, 0.27843, 0.10196, 1.0,

		1.0, 0.27843, 0.10196, 1.0,
		1.0, 0.27843, 0.10196, 1.0,
		1.0, 0.27843, 0.10196, 1.0,

	    1.0, 0.27843, 0.10196, 1.0,
		1.0, 0.27843, 0.10196, 1.0,
		1.0, 0.27843, 0.10196, 1.0,

		1.0, 0.27843, 0.10196, 1.0,
		1.0, 0.27843, 0.10196, 1.0,
		1.0, 0.27843, 0.10196, 1.0,

		1.0, 0.27843, 0.10196, 1.0,
		1.0, 0.27843, 0.10196, 1.0,
		1.0, 0.27843, 0.10196, 1.0,

		1.0, 0.27843, 0.10196, 1.0,
		1.0, 0.27843, 0.10196, 1.0,
		1.0, 0.27843, 0.10196, 1.0,

	    1.0, 0.27843, 0.10196, 1.0,
		1.0, 0.27843, 0.10196, 1.0,
		1.0, 0.27843, 0.10196, 1.0,

		1.0, 0.27843, 0.10196, 1.0,
		1.0, 0.27843, 0.10196, 1.0,
		1.0, 0.27843, 0.10196, 1.0     
  ];
  
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  vertexColorBuffer.itemSize = 4;
  vertexColorBuffer.numItems = 66;  
}

function draw() { 
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  
  mat4.identity(mvMatrix);


  mat4.rotateX(mvMatrix,mvMatrix, degToRad(rotAngle));
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
                         vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
                            vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numberOfItems);
}

var sinscalar = 0;
function animate() {
        sinscalar += 0.1;
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
          var triangleVertices = [
          -0.90+Math.sin(sinscalar-0.9)*0.05,  0.95+Math.sin(sinscalar)*0.05,  0.0,
           0.90+Math.sin(sinscalar+0.9)*0.05,  0.95+Math.sin(sinscalar)*0.05,  0.0,
          -0.90+Math.sin(sinscalar-0.9)*0.05,  0.60+Math.sin(sinscalar)*0.05,  0.0,

           0.90+Math.sin(sinscalar+0.9)*0.05,  0.60+Math.sin(sinscalar)*0.05,  0.0,
           0.90+Math.sin(sinscalar+0.9)*0.05,  0.95+Math.sin(sinscalar)*0.05,  0.0,
          -0.90+Math.sin(sinscalar-0.9)*0.05,  0.60+Math.sin(sinscalar)*0.05,  0.0,

          -0.70+Math.sin(sinscalar-0.7)*0.05,  0.60+Math.sin(sinscalar)*0.05,  0.0,
          -0.70+Math.sin(sinscalar-0.7)*0.05, -0.40+Math.sin(sinscalar)*0.05,  0.0,
          -0.30+Math.sin(sinscalar-0.3)*0.05,  0.60+Math.sin(sinscalar)*0.05,  0.0,

          -0.30+Math.sin(sinscalar-0.3)*0.05, -0.40+Math.sin(sinscalar)*0.05,  0.0,
          -0.70+Math.sin(sinscalar-0.7)*0.05, -0.40+Math.sin(sinscalar)*0.05,  0.0,
          -0.30+Math.sin(sinscalar-0.3)*0.05,  0.60+Math.sin(sinscalar)*0.05,  0.0,

           0.70+Math.sin(sinscalar+0.7)*0.05,  0.60+Math.sin(sinscalar)*0.05,  0.0,
           0.70+Math.sin(sinscalar+0.7)*0.05, -0.40+Math.sin(sinscalar)*0.05,  0.0,
           0.30+Math.sin(sinscalar+0.3)*0.05,  0.60+Math.sin(sinscalar)*0.05,  0.0,

           0.30+Math.sin(sinscalar+0.3)*0.05, -0.40+Math.sin(sinscalar)*0.05,  0.0,
           0.70+Math.sin(sinscalar+0.7)*0.05, -0.40+Math.sin(sinscalar)*0.05,  0.0,
           0.30+Math.sin(sinscalar+0.3)*0.05,  0.60+Math.sin(sinscalar)*0.05,  0.0,

          -0.30+Math.sin(sinscalar-0.3)*0.05,  0.30+Math.sin(sinscalar)*0.05,  0.0,
          -0.30+Math.sin(sinscalar-0.3)*0.05, -0.10+Math.sin(sinscalar)*0.05,  0.0,
          -0.175+Math.sin(sinscalar-0.175)*0.05,  0.30+Math.sin(sinscalar)*0.05,  0.0,

          -0.175+Math.sin(sinscalar-0.175)*0.05, -0.10+Math.sin(sinscalar)*0.05,  0.0,
          -0.30+Math.sin(sinscalar-0.3)*0.05, -0.10+Math.sin(sinscalar)*0.05,  0.0,
          -0.175+Math.sin(sinscalar-0.175)*0.05,  0.30+Math.sin(sinscalar)*0.05,  0.0,

           0.30+Math.sin(sinscalar+0.3)*0.05,  0.30+Math.sin(sinscalar)*0.05,  0.0,
           0.30+Math.sin(sinscalar+0.3)*0.05, -0.10+Math.sin(sinscalar)*0.05,  0.0,
           0.175+Math.sin(sinscalar+0.175)*0.05,  0.30+Math.sin(sinscalar)*0.05,  0.0,

           0.175+Math.sin(sinscalar+0.175)*0.05, -0.10+Math.sin(sinscalar)*0.05,  0.0,
           0.30+Math.sin(sinscalar+0.3)*0.05, -0.10+Math.sin(sinscalar)*0.05,  0.0,
           0.175+Math.sin(sinscalar+0.175)*0.05,  0.30+Math.sin(sinscalar)*0.05,  0.0,

          -0.7000+Math.sin(sinscalar-0.7)*0.05, -0.45+Math.sin(sinscalar)*0.05,  0.0,
          -0.7000+Math.sin(sinscalar-0.7)*0.05, -0.575+Math.sin(sinscalar)*0.05,  0.0,
          -0.5667+Math.sin(sinscalar-0.5667)*0.05, -0.45+Math.sin(sinscalar)*0.05,  0.0,

          -0.5667+Math.sin(sinscalar-0.5667)*0.05, -0.45+Math.sin(sinscalar)*0.05,  0.0,
          -0.5667+Math.sin(sinscalar-0.5667)*0.05, -0.65+Math.sin(sinscalar)*0.05,  0.0,
          -0.7000+Math.sin(sinscalar-0.7)*0.05, -0.575+Math.sin(sinscalar)*0.05,  0.0,

           0.7000+Math.sin(sinscalar+0.7)*0.05, -0.45+Math.sin(sinscalar)*0.05,  0.0,
           0.7000+Math.sin(sinscalar+0.7)*0.05, -0.575+Math.sin(sinscalar)*0.05,  0.0,
           0.5667+Math.sin(sinscalar+0.5667)*0.05, -0.45+Math.sin(sinscalar)*0.05,  0.0,

           0.5667+Math.sin(sinscalar+0.5667)*0.05, -0.45+Math.sin(sinscalar)*0.05,  0.0,
           0.5667+Math.sin(sinscalar+0.5667)*0.05, -0.65+Math.sin(sinscalar)*0.05,  0.0,
           0.7000+Math.sin(sinscalar+0.7)*0.05, -0.575+Math.sin(sinscalar)*0.05,  0.0,

           0.3000+Math.sin(sinscalar+0.3)*0.05, -0.45+Math.sin(sinscalar)*0.05, 0.0,
           0.4333+Math.sin(sinscalar+0.4333)*0.05, -0.45+Math.sin(sinscalar)*0.05, 0.0,
           0.4333+Math.sin(sinscalar+0.4333)*0.05, -0.70+Math.sin(sinscalar)*0.05, 0.0,

           0.3000+Math.sin(sinscalar+0.3)*0.05, -0.45+Math.sin(sinscalar)*0.05, 0.0,
           0.3000+Math.sin(sinscalar+0.3)*0.05, -0.775+Math.sin(sinscalar)*0.05, 0.0,
           0.4333+Math.sin(sinscalar+0.4333)*0.05, -0.70+Math.sin(sinscalar)*0.05, 0.0,

          -0.3000+Math.sin(sinscalar-0.3)*0.05, -0.45+Math.sin(sinscalar)*0.05, 0.0,
          -0.4333+Math.sin(sinscalar-0.4333)*0.05, -0.45+Math.sin(sinscalar)*0.05, 0.0,
          -0.4333+Math.sin(sinscalar-0.4333)*0.05, -0.70+Math.sin(sinscalar)*0.05, 0.0,

          -0.3000+Math.sin(sinscalar-0.3)*0.05, -0.45+Math.sin(sinscalar)*0.05, 0.0,
          -0.3000+Math.sin(sinscalar-0.3)*0.05, -0.775+Math.sin(sinscalar)*0.05, 0.0,
          -0.4333+Math.sin(sinscalar-0.4333)*0.05, -0.70+Math.sin(sinscalar)*0.05, 0.0,

          -0.1775+Math.sin(sinscalar-0.1775)*0.05, -0.45+Math.sin(sinscalar)*0.05, 0.0,
          -0.1775+Math.sin(sinscalar-0.1775)*0.05, -0.825+Math.sin(sinscalar)*0.05, 0.0,
          -0.0555+Math.sin(sinscalar-0.0555)*0.05, -0.45+Math.sin(sinscalar)*0.05, 0.0,

		  -0.0555+Math.sin(sinscalar-0.0555)*0.05, -0.9+Math.sin(sinscalar)*0.05, 0.0,
          -0.1775+Math.sin(sinscalar-0.1775)*0.05, -0.825+Math.sin(sinscalar)*0.05, 0.0,
          -0.0555+Math.sin(sinscalar-0.0555)*0.05, -0.45+Math.sin(sinscalar)*0.05, 0.0,  

           0.1775+Math.sin(sinscalar+0.1775)*0.05, -0.45+Math.sin(sinscalar)*0.05, 0.0,
           0.1775+Math.sin(sinscalar+0.1775)*0.05, -0.825+Math.sin(sinscalar)*0.05, 0.0,
           0.0555+Math.sin(sinscalar+0.0555)*0.05, -0.45+Math.sin(sinscalar)*0.05, 0.0,

		   0.0555+Math.sin(sinscalar+0.0555)*0.05, -0.9+Math.sin(sinscalar)*0.05, 0.0,
           0.1775+Math.sin(sinscalar+0.1775)*0.05, -0.825+Math.sin(sinscalar)*0.05, 0.0,
           0.0555+Math.sin(sinscalar+0.0555)*0.05, -0.45+Math.sin(sinscalar)*0.05, 0.0      

		  ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
        vertexPositionBuffer.itemSize = 3;
        vertexPositionBuffer.numberOfItems = 66;
}


function startup() {
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  setupShaders(); 
  setupBuffers();
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  tick();
}

function tick() {
    requestAnimFrame(tick);
    draw();
    animate();
}
