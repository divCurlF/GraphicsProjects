/**
 * @author: Zac Sanchez
 * @description: A simple physics engine system displaying particle wall 
 * collision.
 */


var gl;
var canvas;
var shaderProgram;
var vertexPositionBuffer;
var acceleration = vec3.fromValues(0, -0.01, 0);
var drag = 0.001;
var shiny = 100;

var currentlyPressedKeys = [];
var dt = 0;
var prevDate = Date.now();
var balls = [];
var velocity = vec3.fromValues(1.0,0.8,0.2);
var position = vec3.fromValues(-0.8, 0.8, -0.4);

// Create a place to store sphere geometry
var sphereVertexPositionBuffer;

//Create a place to store normals for shading
var sphereVertexNormalBuffer;

var radius = 10.0;

// View parameters
var eyePt = vec3.fromValues(0.0,0.0,150.0);
var viewDir = vec3.fromValues(0.0,0.0,-1.0);
var up = vec3.fromValues(0.0,1.0,0.0);
var viewPt = vec3.fromValues(0.0,0.0,0.0);

// Create the normal
var nMatrix = mat3.create();

// Create ModelView matrix
var mvMatrix = mat4.create();

//Create Projection matrix
var pMatrix = mat4.create();

var mvMatrixStack = [];

//-------------------------------------------------------------------------
/**
 * Populates buffers with data for spheres: CREDIT ERIC SCHAFFER LAB CODE 3
 */
function setupSphereBuffers() {
    
    var sphereSoup=[];
    var sphereNormals=[];
    var numT=sphereFromSubdivision(6,sphereSoup,sphereNormals);
    console.log("Generated ", numT, " triangles"); 
    sphereVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);      
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereSoup), gl.STATIC_DRAW);
    sphereVertexPositionBuffer.itemSize = 3;
    sphereVertexPositionBuffer.numItems = numT*3;
    console.log(sphereSoup.length/9);
    
    // Specify normals to be able to do lighting calculations
    sphereVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphereNormals),
                  gl.STATIC_DRAW);
    sphereVertexNormalBuffer.itemSize = 3;
    sphereVertexNormalBuffer.numItems = numT*3;
    
    console.log("Normals ", sphereNormals.length/3);     
}

//-------------------------------------------------------------------------
/**
 * Draws a sphere from the sphere buffer
 */
function drawSphere(){
 gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
 gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, sphereVertexPositionBuffer.itemSize, 
                         gl.FLOAT, false, 0, 0);

 // Bind normal buffer
 gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
 gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
                           sphereVertexNormalBuffer.itemSize,
                           gl.FLOAT, false, 0, 0);
 gl.drawArrays(gl.TRIANGLES, 0, sphereVertexPositionBuffer.numItems);      
}

//----------------------------------------------------------------------------------
/**
 * Draw call that applies matrix transformations to model and draws model in frame
 */
function draw() { 
  
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(pMatrix,degToRad(90), gl.viewportWidth / gl.viewportHeight, 0.1, 1000.0);

    // We want to look down -z, so create a lookat point in that direction    
    vec3.add(viewPt, eyePt, viewDir);
    // Then generate the lookat matrix and initialize the MV matrix to that view
    mat4.lookAt(mvMatrix,eyePt,viewPt,up);
  
    renderBoxOutline();

    balls.forEach(ball => {
      renderBall(ball);
    })

}

/**
 * Creates the wireframe display of teh box
 */
function renderBoxOutline() {

  // Light parameters for the box
  R = 0.0;
  G = 1.0;
  B = 1.0;
  
  // TODO: make the box actually have an outline with faces, also make the
  // Light variables adjustable for the user.
  mvPushMatrix();
  uploadLightsToShader([10,0,0],[0.0,0.0,0.0],[1.0,1.0,1.0],[1.0,1.0,1.0]);
  uploadMaterialToShader([R,G,B],[R,G,B],[1.0,1.0,1.0],shiny);
  // Scale the box up by 100;
  var transformVec = vec3.fromValues(100, 100, 100);
  mat4.scale(mvMatrix, mvMatrix, transformVec);
  setMatrixUniforms();

  // In Box.js
  drawLines();
  mvPopMatrix();
}

/**
 * Rendering a single ball on screen.
 * @param {Ball} ball The ball object being rendered
 */
function renderBall(ball) {
    mvPushMatrix();
    // Move the ball in world coords
    mat4.translate(mvMatrix, mvMatrix, ball.position);
    // Scale the size of the ball so that it has the correct radius
    mat4.scale(mvMatrix, mvMatrix, ball.scale);
    // Adjusts to translate the ball inside the box parameters. These numbers
    // Seemed to work well so I went with them.
    var translateVec = vec3.fromValues(0,0,50/ball.radius-2);
    mat4.translate(mvMatrix, mvMatrix, translateVec);
    uploadLightsToShader([20,20,20],[0.0,0.0,0.0],[1.0,1.0,1.0],[1.0,1.0,1.0]);
    uploadMaterialToShader(ball.color,ball.color,[1.0,1.0,1.0],shiny);
    setMatrixUniforms();
    drawSphere();
    mvPopMatrix();
}

//----------------------------------------------------------------------------------
/**
 * Animation to be called from tick. Updates globals and performs animation for each tick.
 */
function animate() {
      var dt = (Date.now() - prevDate)/10;
      prevDate = Date.now();



      handleKeyPress();

      // Update the position and velocity of each ball.
      balls.forEach(ball => {
        ball.eulerIntegrate(acceleration, drag, dt)
      })
      
}

//----------------------------------------------------------------------------------
/**
 * Startup function called from html code to start program.
 */
 function startup() {
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  
  reset_button = document.getElementById("reset");
  spawn_button = document.getElementById("spawn");
  num_balls = document.getElementById("num-balls");
  // Keyboard Event handling see keyboard-handler.js
  document.onkeydown = handleKeyDown;
  document.onkeyup = handleKeyUp;
  
  setupShaders("shader-phong-phong-vs","shader-phong-phong-fs");
  setupSphereBuffers();
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);
  balls.push(new Ball());
  tick();
}

//----------------------------------------------------------------------------------
/**
 * Tick called for every animation frame.
 */
function tick() {
    resize(gl.canvas);
    reset_button.onclick = function () {
      console.log("here");
      // Ensures that after pressing space the button is not activated by space 
      // bar
      this.blur();
      balls = [];
    }
    spawn_button.onclick = function () {
      for (var i = 0; i < num_balls.value; i++) {
        balls.push(new Ball())
      }
    }
    requestAnimFrame(tick);
    draw();
    animate();
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
