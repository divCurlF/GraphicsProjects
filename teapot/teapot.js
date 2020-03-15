/**
 * Based on the MP2 code and sample provided by the lecture and discussion session.
 I have implemented the Environment mapping based on the idea from
 1) http://math.hws.edu/graphicsbook/c7/s3.html
 2) https://webglfactory.blogspot.com/2011/05/adding-textures.html
 3) http://webglfundamentals.org/webgl/lessons/webgl-3d-textures.html

 For OBJ loading, I have follow the format explanation in
 1) http://www.martinreddy.net/gfx/3d/OBJ.spec
 */

 // WebGL context
var gl;

// WebGl Canvas
var canvas;

// Location of the obj file for the teapot mesh. 
var teapotFile = "https://zacsanchez.me/projects/teapot/teapot_0.obj"

// Keep track of pressed keys for keyboard handling of rotation.
var currentlyPressedKeys = [];

// separate shader program for skybox and teapot
var shaderProgramSkybox;

// Create ModelView matrix
var mvMatrix = mat4.create();

//Create Projection matrix
var pMatrix = mat4.create();

// Create the Normal matrix
var nMatrix = mat3.create();

// This will store the inverse of mvMatrix that applied to skybox to be used
// For the correct shading of the refraction and reflection.
var inverseViewTransform = mat3.create();

// Model view matrix stack for heirarchical modelling.
var mvMatrixStack = [];

// For animation of world rotationa and teapot rotation.
var lastTime = 0;
var teapotRotationValue = 0.0;
var teapotFlipValue = 0.0;
var worldRotationValue = 0.0;
var worldFlipValue = 0.0;

// Paramters to be entered into lookat matrix
var eyePt = vec3.fromValues(0.0, 0.0, 0.0);
var viewDir = vec3.fromValues(0.0, 0.0, -1);
var up = vec3.fromValues(0.0, 1.0, 0.0);
var viewPt = vec3.create();

/** @global position of the light for Blinn Phong Shading */
var lightPosEye = vec3.fromValues(1.0, 1.0, 1.0);

/** @global Ambient light color/intensity for Phong reflection */
var Ia = vec3.fromValues(0.23921,0.14117,0.79607);
/** @global Diffuse light color/intensity for Phong reflection */
var Id = vec3.fromValues(0.3803,0.7411,1.0);
/** @global Specular light color/intensity for Phong reflection */
var Is =vec3.fromValues(0.81176, 0.431372,1.0);


/**
 * Load shader data from the provided id using DOM and return the linked shader program.
 * Modified from base code form lecture sample.
 *
 * @param {String} vertexShaderID the string of vertex shader id
 * @param {String} fragmentShaderID the string of vertex shader id
 * @return {gl.shaderProgram} the shader program with requested vertex and fragment shader
 */
function setupShaders(vertexShaderID, fragmentShaderID) {
    var shaderProgram;
    var fragmentShader = loadShaderFromDOM(fragmentShaderID);
    var vertexShader = loadShaderFromDOM(vertexShaderID);

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        throw "Link error in program:  " + gl.getProgramInfoLog(shaderProgram);
    }

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");

    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
    shaderProgram.skyboxSampler = gl.getUniformLocation(shaderProgram, "uSkyboxSampler");
    shaderProgram.inverseViewTransform = gl.getUniformLocation(shaderProgram, "uInverseViewTransform");

    return shaderProgram;
}

/**
 * Asynchoronously reads server side obj file.
 * @param {String} url Is the url of the obj file.
 */
function asyncGetFile(url) {
    console.log("Getting text file.")
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.onload = () => resolve(xhr.responseText);
      xhr.onerror = () => reject(xhr.statusText);
      xhr.send();
      console.log("Made Promise");
    })
}
/**
 * Adds Lighting data to the shaderProgram.
 * @param {webGLShaderObject} shaderProgram THe current active shaderProgram.
 */
function addLighting(shaderProgram) {
    shaderProgram.uniformLightPositionLoc = gl.getUniformLocation(shaderProgram, "uLightPosition");
    shaderProgram.uniformAmbientLightColorLoc = gl.getUniformLocation(shaderProgram, "uAmbientLightColor");
    shaderProgram.uniformDiffuseLightColorLoc = gl.getUniformLocation(shaderProgram, "uDiffuseLightColor");
    shaderProgram.uniformSpecularLightColorLoc = gl.getUniformLocation(shaderProgram, "uSpecularLightColor");
}

/**
 *  Main draw code per animation frame. 
 */
function draw(shaderProgram) {
    // var transformVec = vec3.create();

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(pMatrix, degToRad(45), gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);

    // Create a new lookat point from quaternion-rotated parameters
    vec3.add(viewPt, eyePt, viewDir);

    // Generate lookat matrix from new parameters
    mat4.lookAt(mvMatrix, eyePt, viewPt, up);
    
    if (mySkyBox.isLoaded()) {

        // Use the skybox shader.
        gl.useProgram(shaderProgramSkybox);

        // Ensures we can still sea the teapot after rendering skybox
        gl.depthMask(false);

        mvPushMatrix();
        
        // Rotate the World by the current rotation value.
        mat4.rotateY(mvMatrix, mvMatrix, degToRad(worldRotationValue));
        mat4.rotateX(mvMatrix, mvMatrix, degToRad(worldFlipValue));
        setMatrixUniforms(shaderProgramSkybox);
        
        // Draw the skybox
        mySkyBox.drawSkybox();
        
        // Create Inverse view transform for correct rendering of refraction and reflection
        mat3.fromMat4(inverseViewTransform, mvMatrix);
        mat3.invert(inverseViewTransform, inverseViewTransform);
    
        mvPopMatrix();

        // Create NM Matrix 
        mat3.normalFromMat4(nMatrix, mvMatrix);

        // Use the teapot shader.
        gl.useProgram(shaderProgram);
        gl.depthMask(true);
        uploadinverseViewTransformMatrixToShader(shaderProgram);
        // Only render the teapot if the mesh is loaded.
        if (myTeapot.loaded()) {
            mvPushMatrix();
            // orient the teapot to the correct position
            mat4.translate(mvMatrix, mvMatrix, [0.35, -0.75, -5]); 
            mat4.rotateY(mvMatrix, mvMatrix, degToRad(teapotRotationValue));
            mat4.rotateX(mvMatrix, mvMatrix, degToRad(teapotFlipValue));
            mat4.scale(mvMatrix, mvMatrix, [0.5, 0.5, 0.5]);

            mat3.normalFromMat4(nMatrix, mvMatrix);
            setTexture(shaderProgram);
            setMatrixUniforms(shaderProgram);

            myTeapot.drawTeapot(shaderProgram);
            mvPopMatrix();
        }
    }
}

/**
 *   Perform the rotation and moving of camera on every frames. It will calculate
 *   calculate the elapsed time and perform the action based on flags.
 * */
function animate() {
    var timeNow = new Date().getTime();
    var elapsed = 0;
    if (lastTime !== 0) {
        elapsed = timeNow - lastTime;
    }
    lastTime = timeNow;
    handleKeyPress(elapsed);
    handleButtonPress(elapsed);
    if (reflective_button.checked) {
        shaderProgram = shaderProgramTeapotReflective;
    } else if (refractive_button.checked) {
        shaderProgram = shaderProgramTeapotRefractive;
    } else if (blinn_phong_button.checked) {
        shaderProgram = shaderProgramTeapotBlinnPhong
    }
}

/**
 * Creates a teapot object with the correct vertex, normal and face data inputted.
 * @param {String} filename 
 */
function setupTeapotMesh(filename) {
    myTeapot = new Teapot();
    myPromise = asyncGetFile(filename);
    // We defined what to do when the promise is resolved with the then() call.
    // and what to do when the promise is rejected with the catch() call
    myPromise.then((retrievedText) => {
        myTeapot.loadFromOBJ(retrievedText);
        console.log("File retrieved.");
    })
    .catch(
        (reason) => {
        console.log("Handle rejected proimse ("+reason+") here.");
    })
}

/**
 * Creates a skybox object with the correct vertex, normal and face data inputted as well
 * as the texture.
 */
function setupSkyBox() {
    mySkyBox = new SkyBox();
    mySkyBox.setupSkyBoxCubeMap();
    mySkyBox.setupSkyboxBuff();
}

/**
 *  Startup function called from html code to start program.
 */
function startup() {
    canvas = document.getElementById("myGLCanvas");

    // Radio Button Form to select the shader program to be used.
    reflective_button = document.getElementById("reflective");
    refractive_button = document.getElementById("refractive");
    blinn_phong_button = document.getElementById("blinn-phong");

    // Keyboard Event handling
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

    gl = createGLContext(canvas);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Setup and compile each shader.
    shaderProgramSkybox = setupShaders("shader-vs-skybox", "shader-fs-skybox");
    shaderProgramTeapotReflective = setupShaders("shader-vs-teapot-reflective", "shader-fs-teapot-reflective");
    shaderProgramTeapotRefractive = setupShaders("shader-vs-teapot-refractive", "shader-fs-teapot-refractive");
    shaderProgramTeapotBlinnPhong = setupShaders("shader-vs-teapot-blinn-phong", "shader-fs-teapot-blinn-phong");
    addLighting(shaderProgramTeapotBlinnPhong);

    // Default shader program is the reflective teapot.
    shaderProgram = shaderProgramTeapotReflective

    // Load the skybox and the teapot mesh
    setupSkyBox();
    setupTeapotMesh(teapotFile);

    // Keep drawing frames.
    tick(); 
}

/**
 *  Keep Drawing Frames.
 */
function tick() {
    resize(gl.canvas);
    requestAnimFrame(tick);
    draw(shaderProgram);
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

