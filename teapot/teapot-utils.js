/**
 * Various helper functions that have been adapted from previous MPs or Labs.
 * These functions do not have anything to do with what is seen on screen,
 * for example uploading data to shaders, setting up shaders.
 * @author: Eric Schaffer
 * 
*/

/**
 * This function provides mvMatrix stack pop.
 */
function mvPopMatrix() {
    if (mvMatrixStack.length === 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

/**
 * This function provides mvMatrix stack push.
 */
function mvPushMatrix() {
    var copy = mat4.clone(mvMatrix);
    mvMatrixStack.push(copy);
}

/**
 *  This function will upload required matrix to the shaderprogram.
 *  Based on sample code on lecture website.
 *
 *  @Param {gl.ShaderProgram} the shader program to upload uniform maxtrix
 */
function setMatrixUniforms(shaderProgram) {
    uploadModelViewMatrixToShader(shaderProgram);
    uploadProjectionMatrixToShader(shaderProgram);
    uploadNormalMatrixToShader(shaderProgram);
    uploadLightsToShader(shaderProgram, lightPosEye, Ia, Id, Is);

}

/**
 * Convert degree value to radian. This code is from lecture sample.
 *
 * @param {number} degrees A degree value to be converted to radian
 * @return {number} a degree value in radian
 */
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}


/**
 * Initialized webgl context by verifying whether WebGL rendering is supported or not.
 * This code is from lecture sample.
 *
 * @param {gl.canvas} canvas A canvas object from web browser
 * @return {gl} context A webgl context
 */
function createGLContext(canvas) {
    var names = ["webgl", "experimental-webgl"];
    var context = null;
    for (var i = 0; i < names.length; i++) {
        try {
            context = canvas.getContext(names[i]);
        } catch (e) {
        }
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


/**
 * Load shader data from the provided id using DOM. This code is from lecture sample.
 *
 * @param {String} id An id of target object
 * @return shader The shader data
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
        if (currentChild.nodeType === 3) { // 3 corresponds to TEXT_NODE
            shaderSource += currentChild.textContent;
        }
        currentChild = currentChild.nextSibling;
    }

    var shader;
    if (shaderScript.type === "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type === "x-shader/x-vertex") {
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

/**
 * This function will load the texture data for shader program.
 *
 * @param {gl.shaderProgram} shaderProgram to load the texture data
 */
function setTexture(shaderProgram) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, mySkyBox.CubeMap);
    gl.uniform1i(shaderProgram.skyboxSampler, 0);
}


/**
 * Upload lightning related data to shader program.
 * This code is identical to lecture sample code.
 *
 * @param {gl.shaderProgram} shaderProgram the target shader program to upload light data
 * @param {vec3} loc Vector of light source location
 * @param {vec3} a Vector of ambient lightning color
 * @param {vec3} d Vector of diffuse lightning color
 * @param {vec3} s Vector of specular lightning color
 */
function uploadLightsToShader(shaderProgram, loc, a, d, s) {
    gl.uniform3fv(shaderProgram.uniformLightPositionLoc, loc);
    gl.uniform3fv(shaderProgram.uniformAmbientLightColorLoc, a);
    gl.uniform3fv(shaderProgram.uniformDiffuseLightColorLoc, d);
    gl.uniform3fv(shaderProgram.uniformSpecularLightColorLoc, s);
}

/**
 * Upload mvMatrix data to shader program.
 *
 * @param {gl.shaderProgram} shaderProgram the target shader program to upload light data
 */
function uploadModelViewMatrixToShader(shaderProgram) {
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

/**
 * Upload pMatrix data to shader program.
 *
 * @param {gl.shaderProgram} shaderProgram the target shader program to upload light data
 */
function uploadProjectionMatrixToShader(shaderProgram) {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform,
        false, pMatrix);
}

/**
 * Upload inverseViewTransform matrix data to shader program.
 *
 * @param {gl.shaderProgram} shaderProgram the target shader program to upload light data
 */
function uploadinverseViewTransformMatrixToShader(shaderProgram) {
    gl.uniformMatrix3fv(shaderProgram.inverseViewTransform, false, inverseViewTransform);
}


/**
 * Upload inverse transpose matrix to shader program for correct normal mapping.
 *
 * @param {gl.shaderProgram} shaderProgram the target shader program to upload light data
 */
function uploadNormalMatrixToShader(shaderProgram) {
    mat3.fromMat4(nMatrix, mvMatrix);
    mat3.transpose(nMatrix, nMatrix);
    mat3.invert(nMatrix, nMatrix);
    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, nMatrix);
}
