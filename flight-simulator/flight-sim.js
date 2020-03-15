
/**
 * @file A simple WebGL example drawing central Illinois style terrain
 * @author Eric Shaffer <shaffer1@illinois.edu>  
 */

/**
 * Aliases for glMatrix.
 */
var vec3 = glMatrix.vec3;
var mat3 = glMatrix.mat3;
var vec4 = glMatrix.vec4;
var mat4 = glMatrix.mat4;
var quat = glMatrix.quat;


/** @global The WebGL context */
var gl;

/** @global The HTML5 canvas we draw on */
var canvas;

/** @global A simple GLSL shader program */
var shaderProgram;

/** @global The Modelview matrix */
var mvMatrix = mat4.create();

/** @global The Projection matrix */
var pMatrix = mat4.create();

/** @global The Normal matrix */
var nMatrix = mat3.create();

/** @global The matrix stack for hierarchical modeling */
var mvMatrixStack = [];

/** @global The angle of rotation around the y axis */
var viewRot = 10;

/** @global A glmatrix vector to use for transformations */
var transformVec = vec3.create();    

// Initialize the vector....
vec3.set(transformVec,0.0,0.0,-2.0);

/** @global If true does blinn phong, phong otherwise. */
var blinn = true

/** @global denisty coefficient for fog. */
var fogDensity = 0.2

/** @global An object holding the geometry for a 3D terrain */
var myTerrain;

/** @global Maintains current view orientation */
var orientationQuat = quat.create();

/** @global Currently pressed keys for key press events*/
var currentlyPressedKeys = {};

/** @global Initial location of the camera in world coordinates */
var INIT_EYE_PT = vec3.fromValues(-0.17,0.51,-0.72);
/** @global Initial View direction in  world coordinates */
var INIT_VIEW_DIR =  vec3.fromValues(0.08,-0.37,-0.59);
/** @global INitial up direction in world coordinates */
var INIT_UP_DIR = vec3.fromValues(0,1,0);

// View parameters
/** @global Location of the camera in world coordinates */
var eyePt = vec3.fromValues(-0.17,0.51,-0.72);
/** @global Direction of the view in world coordinates */
var viewDir = vec3.fromValues(0.08,-0.37,-0.59);
/** @global Up vector for view matrix creation, in world coordinates */
var up = vec3.fromValues(0,1,0);
/** @global Location of a point along viewDir in world coordinates */
var viewPt = vec3.fromValues(0.0,0.0,0.0);

/** SPEED INCREMENT */

var SPEED_MIN = 0.0005
/** Camera movement speed */
var speed = SPEED_MIN

//Light parameters
/** @global Light position in VIEW coordinates */
var lightPosition = [-0.68, 1.86, -1.94];
/** @global Ambient light color/intensity for Phong reflection */
var lAmbient = [0.23921,0.14117,0.79607];
/** @global Diffuse light color/intensity for Phong reflection */
var lDiffuse = [0.3803,0.7411,0.7];
/** @global Specular light color/intensity for Phong reflection */
var lSpecular =[0.81176, 0.431372,0.3882];


//Material parameters
/** @global Shininess exponent for Phong reflection */
var shininess = 10;
/** @global Edge color fpr wireframeish rendering */
var kEdgeBlack = [0.0,0.0,0.0];
/** @global Edge color for wireframe rendering */
var kEdgeWhite = [1.0,1.0,1.0];



//-------------------------------------------------------------------------
/**
 * Sends Modelview matrix to shader
 */
function uploadModelViewMatrixToShader() {
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

//-------------------------------------------------------------------------
/**
 * Sends projection matrix to shader
 */
function uploadProjectionMatrixToShader() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, 
                      false, pMatrix);
}

//-------------------------------------------------------------------------
/**
 * Generates and sends the normal matrix to the shader
 */
function uploadNormalMatrixToShader() {
  mat3.fromMat4(nMatrix,mvMatrix);
  mat3.transpose(nMatrix,nMatrix);
  mat3.invert(nMatrix,nMatrix);
  gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, nMatrix);
}

//----------------------------------------------------------------------------------
/**
 * Pushes matrix onto modelview matrix stack
 */
function mvPushMatrix() {
    var copy = mat4.clone(mvMatrix);
    mvMatrixStack.push(copy);
}


//----------------------------------------------------------------------------------
/**
 * Pops matrix off of modelview matrix stack
 */
function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
      throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

//----------------------------------------------------------------------------------
/**
 * Sends projection/modelview matrices to shader
 */
function setMatrixUniforms() {
    uploadModelViewMatrixToShader();
    uploadNormalMatrixToShader();
    uploadProjectionMatrixToShader();
}

//----------------------------------------------------------------------------------
/**
 * Translates degrees to radians
 * @param {Number} degrees Degree input to function
 * @return {Number} The radians that correspond to the degree input
 */
function degToRad(degrees) {
        return degrees * Math.PI / 180;
}

//----------------------------------------------------------------------------------
/**
 * Creates a context for WebGL
 * @param {element} canvas WebGL canvas
 * @return {Object} WebGL context
 */
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

//----------------------------------------------------------------------------------
/**
 * Loads Shaders
 * @param {string} id ID string for shader to load. Either vertex shader/fragment shader
 */
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

//----------------------------------------------------------------------------------
/**
 * Setup the fragment and vertex shaders
 */
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

  shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
  gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
  shaderProgram.uniformLightPositionLoc = gl.getUniformLocation(shaderProgram, "uLightPosition");    
  shaderProgram.uniformAmbientLightColorLoc = gl.getUniformLocation(shaderProgram, "uAmbientLightColor");  
  shaderProgram.uniformDiffuseLightColorLoc = gl.getUniformLocation(shaderProgram, "uDiffuseLightColor");
  shaderProgram.uniformSpecularLightColorLoc = gl.getUniformLocation(shaderProgram, "uSpecularLightColor");
  shaderProgram.uniformShininessLoc = gl.getUniformLocation(shaderProgram, "uShininess");
  shaderProgram.blinn = gl.getUniformLocation(shaderProgram, "blinn");
  shaderProgram.fogDensity = gl.getUniformLocation(shaderProgram, "fogDensity");
  shaderProgram.fogToggle = gl.getUniformLocation(shaderProgram, "fogToggle");
}

//-------------------------------------------------------------------------
/**
 * Sends light information to the shader
 * @param {Float32Array} loc Location of light source
 * @param {Float32Array} a Ambient light strength
 * @param {Float32Array} d Diffuse light strength
 * @param {Float32Array} s Specular light strength
 * @param {Float} shininess Shininess exponent
 */
function setLightUniforms(loc,a,d,s, shininess) {
  gl.uniform3fv(shaderProgram.uniformLightPositionLoc, loc);
  gl.uniform3fv(shaderProgram.uniformAmbientLightColorLoc, a);
  gl.uniform3fv(shaderProgram.uniformDiffuseLightColorLoc, d);
  gl.uniform3fv(shaderProgram.uniformSpecularLightColorLoc, s);
  gl.uniform1f(shaderProgram.uniformShininessLoc, shininess);
}

function setFogParameters(fogDensity) {
  gl.uniform1f(shaderProgram.fogDensity, fogDensity);
  if (document.getElementById("fog-toggle").checked) {
    gl.uniform1i(shaderProgram.fogToggle, 1);
  } else {
    gl.uniform1i(shaderProgram.fogToggle, 0);
  }
}

//----------------------------------------------------------------------------------
/**
 * Populate buffers with data. Changes between flat terrain and random terrain based on
 * user input. Flat terrain is used to debug shading issues.
 */
function setupBuffers() {
    // GRID SIZE, minX, maxX, minY, maxY, delta, number of random partition iterations.
    myTerrain = new Terrain(500,-10,10,-10,10, true, 0.007, 1000);
    myTerrain.loadBuffers();
    
}

/**
 * When clicked changes from phong to blinn phong model
 */

 function changeLight() {
  light_val = document.getElementById("light_value")
   if (blinn) {
     gl.uniform1i(shaderProgram.blinn, 1)
     light_val.innerHTML = "Current: Phong"
     blinn = false
   } else {
     gl.uniform1i(shaderProgram.blinn, 0)
     light_val.innerHTML = "Current: Blinn-Phong"
     blinn = true
   }
   setupBuffers();
 }

 /** Helper function to reset the camera to the defaults */
 function reset_camera() {
  speed = SPEED_MIN
  eyePt = vec3.clone(INIT_EYE_PT);
  viewDir = vec3.clone(INIT_VIEW_DIR);
  up = vec3.clone(INIT_VIEW_DIR);

 }


//----------------------------------------------------------------------------------
/**
 * Draw call that applies matrix transformations to model and draws model in frame
 */
function draw() { 
    //console.log("function draw()")
    var transformVec = vec3.create();
  
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // We'll use perspective 
    mat4.perspective(pMatrix,degToRad(45), 
                     gl.viewportWidth / gl.viewportHeight,
                     0.1, 200.0);

    // mat4.fromQuat(mvMatrix, orientationQuat);
    // We want to look down -z, so create a lookat point in that direction
  
    mat4.lookAt(mvMatrix,eyePt,viewPt,up);
    
    //Draw Terrain
    mvPushMatrix();
    vec3.set(transformVec,0.0,-0.25,-2.0);
    mat4.translate(mvMatrix, mvMatrix,transformVec);
    mat4.rotateY(mvMatrix, mvMatrix, degToRad(viewRot));
    mat4.rotateX(mvMatrix, mvMatrix, degToRad(-75));
    setMatrixUniforms();
    setLightUniforms(lightPosition,lAmbient,lDiffuse,lSpecular, shininess);
    setFogParameters(fogDensity);
    myTerrain.drawTriangles();
    mvPopMatrix();
}


function animate() {

  // Create view point vector.
  vec3.add(viewPt, eyePt, viewDir);

  

  // Update the direction based on key press or button click
  handleKeyPress();
  handleButtonPress();
  
  // Adjust camera movement by moving the eyePT in the direction of viewDir.
  var movement_direction = vec3.clone(viewDir)
  vec3.normalize(movement_direction, movement_direction)
  vec3.scale(movement_direction, movement_direction, speed)
  vec3.add(eyePt, eyePt, movement_direction);
}

//----------------------------------------------------------------------------------
/**
 * Startup function called from html code to start program.
 */
 function startup() {
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  fog_density_slider = document.getElementById("fog-density");
  fog_density_slider.oninput = function() {
    fogDensity = this.value / 1000.0;
  }
  setupShaders();
  setupBuffers();
  document.onkeydown = handleKeyDown;
  document.onkeyup = handleKeyUp;
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  tick();
}

//----------------------------------------------------------------------------------
/**
 * Keeping drawing frames....
 */
function tick() {
    resize(gl.canvas);
    requestAnimFrame(tick);
    animate();
    draw();
}


function resize(canvas) {
  // Lookup the size the browser is displaying the canvas.
  var displayWidth  = canvas.clientWidth;
  var displayHeight = canvas.clientHeight;
 
  // Check if the canvas is not the same size.
  if (canvas.width  != displayWidth ||
      canvas.height != displayHeight) {
 
    // Make the canvas the same size
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }
}


