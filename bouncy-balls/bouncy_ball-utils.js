/**
 * @author: Eric Schaffer
 * Utility code inherited from Lab3.
 */

 
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
  function setupShaders(vshader,fshader) {
    vertexShader = loadShaderFromDOM(vshader);
    fragmentShader = loadShaderFromDOM(fshader);
    
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
    shaderProgram.uniformDiffuseMaterialColor = gl.getUniformLocation(shaderProgram, "uDiffuseMaterialColor");
    shaderProgram.uniformAmbientMaterialColor = gl.getUniformLocation(shaderProgram, "uAmbientMaterialColor");
    shaderProgram.uniformSpecularMaterialColor = gl.getUniformLocation(shaderProgram, "uSpecularMaterialColor");
  
    shaderProgram.uniformShininess = gl.getUniformLocation(shaderProgram, "uShininess");    
  }
  
  
  //-------------------------------------------------------------------------
  /**
   * Sends material information to the shader
   * @param {Float32Array} a diffuse material color
   * @param {Float32Array} a ambient material color
   * @param {Float32Array} a specular material color 
   * @param {Float32} the shininess exponent for Phong illumination
   */
  function uploadMaterialToShader(dcolor, acolor, scolor,shiny) {
    gl.uniform3fv(shaderProgram.uniformDiffuseMaterialColor, dcolor);
    gl.uniform3fv(shaderProgram.uniformAmbientMaterialColor, acolor);
    gl.uniform3fv(shaderProgram.uniformSpecularMaterialColor, scolor);
    gl.uniform1f(shaderProgram.uniformShininess, shiny);
  }
  
  //-------------------------------------------------------------------------
  /**
   * Sends light information to the shader
   * @param {Float32Array} loc Location of light source
   * @param {Float32Array} a Ambient light strength
   * @param {Float32Array} d Diffuse light strength
   * @param {Float32Array} s Specular light strength
   */
  function uploadLightsToShader(loc,a,d,s) {
    gl.uniform3fv(shaderProgram.uniformLightPositionLoc, loc);
    gl.uniform3fv(shaderProgram.uniformAmbientLightColorLoc, a);
    gl.uniform3fv(shaderProgram.uniformDiffuseLightColorLoc, d);
    gl.uniform3fv(shaderProgram.uniformSpecularLightColorLoc, s); 
  }