/**
 * Object to store the skybox texture.
 */
class SkyBox {

    constructor(){
        this.vBuffer = [];
        this.fBuffer = [];
        this.numVertices;
        this.numFaces;
        this.images = []
        this.imageLoadCounter = 0;
        this.loaded = false;
    }

    /**
     * Function used to determine whether the skybox texture has been
     * loaded correctly.
     */
    isLoaded() {
        return this.loaded;
    }

    /**
     * Creates vertices of a 3D cube.
     */
    loadVertices() {
        var skyboxVertex = [
            // Front face
            -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            1.0, 1.0, 1.0,
            -1.0, 1.0, 1.0,
    
            // Back face
            -1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, -1.0, -1.0,
    
            // Top face
            -1.0, 1.0, -1.0,
            -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, -1.0,
    
            // Bottom face
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, -1.0, 1.0,
            -1.0, -1.0, 1.0,
    
            // Right face
            1.0, -1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, 1.0, 1.0,
            1.0, -1.0, 1.0,
    
            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0,
            -1.0, 1.0, -1.0
        ];

        this.vBuffer.push(...skyboxVertex);
        this.numVertices = 24;
    }

    /**
     * Specifies the faces for a 3D cube and loads them as indices into the face buffer.
     * Index mesh format
     */
    loadFaces() {
        var skyboxFace = [
            0.0, 1.0, 2.0, 0.0, 2.0, 3.0,    // front
            4.0, 5.0, 6.0, 4.0, 6.0, 7.0,    // back
            8.0, 9.0, 10.0, 8.0, 10.0, 11.0,   // top
            12.0, 13.0, 14.0, 12.0, 14.0, 15.0,   // bottom
            16.0, 17.0, 18.0, 16.0, 18.0, 19.0,   // right
            20.0, 21.0, 22.0, 20.0, 22.0, 23.0    // left
        ];

        this.fBuffer.push(...skyboxFace);
        this.numFaces = 6;

    }

    /**
     * Sets up the vertex and face buffers for the skybox texture.
     */
    setupSkyboxBuff() {
        
        this.loadVertices();
        this.loadFaces();

        this.skyboxVertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.skyboxVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vBuffer), gl.STATIC_DRAW);
    
        this.skyboxFaceBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.skyboxFaceBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.fBuffer), gl.STATIC_DRAW);
        this.skyboxFaceBuffer.numItems = this.fBuffer.length;
    
    }

    /**
     * Creates an array of 6 images for the skybox, sources from the local /img folder
     */
    setupSkyBoxCubeMap() {

        this.images = [new Image(), new Image(), new Image(), new Image(), new Image(), new Image()];

        var image_names = [
            'pos-x.png', 'pos-y.png', 'pos-z.png',
            'neg-x.png', 'neg-y.png', 'neg-z.png'
        ];

        for (var i = 0; i < this.images.length; i++) {
            this.images[i].src = 'img/' + image_names[i];
            this.images[i].crossOrigin = "anonymous"
        }
        var self = this;
        for (var i = 0; i < this.images.length; i++) {
            this.images[i].onload = function () {
                self.imageLoadCounter += 1;
                handleTextureLoadedForSkyBox(self.images, self.imageLoadCounter, self);
            }
        }
    }


    /**
     * This function will bind buffer data and draw the skybox cube.
     */
    drawSkybox() {

        gl.enableVertexAttribArray(shaderProgramSkybox.vertexPositionAttribute);
        
        setTexture(shaderProgramSkybox);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.skyboxVertexBuffer);
        gl.vertexAttribPointer(shaderProgramSkybox.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.skyboxFaceBuffer);
        gl.drawElements(gl.TRIANGLES, this.skyboxFaceBuffer.numItems, gl.UNSIGNED_SHORT, 0);

        // Disable the array after use for other shader programs.
        gl.disableVertexAttribArray(shaderProgramSkybox.vertexPositionAttribute);

    }
}

/**
 *  Helper function that will bind image texture into skybox cubemap.
 *
 * @param {Array} images array to be used as texture
 * @param {number} imgLoadCounter number of images loaded so far
 * @param {skyBox} skyBox skybox object to attach the image array to
 */
function handleTextureLoadedForSkyBox(images, imgLoadCounter, skyBox) {
    // GLSL directives for texture map coords.
    var skyboxSide =
        [gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_Z];
    
    // When the iamge array is fully loaded.
    if (imgLoadCounter === 6) {
        texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        // Load in all the images to the array.
        try {
            for (var i = 0; i < images.length; i++) {
                gl.texImage2D(skyboxSide[i], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[i]);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            }
        } catch (exception) {
            console.log(exception);
        }
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        skyBox.CubeMap = texture;
        skyBox.loaded = true;
    }
}