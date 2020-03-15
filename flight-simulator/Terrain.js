/**
 * @fileoverview Terrain - A simple 3D terrain using WebGL
 * @author Eric Shaffer
 */

/** Class implementing 3D terrain. */
class Terrain{   
/**
 * Initialize members of a Terrain object
 * @param {number} div Number of triangles along x axis and y axis
 * @param {number} minX Minimum X coordinate value
 * @param {number} maxX Maximum X coordinate value
 * @param {number} minY Minimum Y coordinate value
 * @param {number} maxY Maximum Y coordinate value
 * @param {bool} rPartition True if using random partitioning False for flat terrain.
 * @param {number} delta Height delta in random partition algorithm
 * @param {number} num_iter number of times random partition algorithm is run
 */
    constructor(div,minX,maxX,minY,maxY, rPartition, delta, num_iter){
        this.div = div;
        this.minX=minX;
        this.minY=minY;
        this.maxX=maxX;
        this.maxY=maxY;
        this.rPartition = rPartition;
        this.delta=delta;
        this.num_iter=num_iter;
        
        // Allocate vertex array
        this.vBuffer = [];
        // Allocate triangle array
        this.fBuffer = [];
        // Allocate normal array
        this.nBuffer = [];
        // Allocate array for edges so we can draw wireframe
        this.eBuffer = [];
        console.log("Terrain: Allocated buffers");
        
        this.generateTriangles();
        console.log("Terrain: Generated triangles");
        
        this.generateLines();
        console.log("Terrain: Generated lines");
        
        // Get extension for 4 byte integer indices for drwElements
        var ext = gl.getExtension('OES_element_index_uint');
        if (ext == null){
            alert("OES_element_index_uint is unsupported by your browser and terrain generation cannot proceed.");
        }
    }
    
    /**
     * Converts (i, j) index pair to the index of the vertex in vBuffer
     * @param {number} i 
     * @param {number} j 
     */
    convert_indices(i, j) {
        return 3*(i*(this.div+1)+j);
    }
    
    /**
    * Set the x,y,z coords of a vertex at location(i,j)
    * @param {Object} v an an array of length 3 holding x,y,z coordinates
    * @param {number} i the ith row of vertices
    * @param {number} j the jth column of vertices
    */
    setVertex(v,i,j)
    {
        var n = this.convert_indices(i, j)
        this.vBuffer[n] = v[0];
        this.vBuffer[n+1] = v[1];
        this.vBuffer[n+2] = v[2];
    }
    
    /**
    * Return the x,y,z coordinates of a vertex at location (i,j)
    * @param {Object} v an an array of length 3 holding x,y,z coordinates
    * @param {number} i the ith row of vertices
    * @param {number} j the jth column of vertices
    */
    getVertex(v,i,j)
    {
        var n = this.convert_indices(i,j);
        v[0] = this.vBuffer[n];
        v[1] = this.vBuffer[n+1];
        v[2] = this.vBuffer[n+2];
    }

    /**
     * Generates a random vector on the unit circle.
     */
    generate_random_normal() {
        var angle = Math.random()*Math.PI*2
        var x = Math.cos(angle)
        var y = Math.sin(angle)
        return [x, y]
    }

    /**
     * Generates the height of each point in the terrain map.
     */
    generate_heights() {
        var x_idx = Math.floor(Math.random()*this.div);
        var y_idx = Math.floor(Math.random()*this.div);

        var v = [0, 0, 0]
        this.getVertex(v, x_idx, y_idx);

        var norm = this.generate_random_normal();

        
        for (var i = 0; i <= this.div; i++) {
            for (var j = 0; j <= this.div; j++) {
                var p = [0, 0, 0]
                this.getVertex(p, i, j)

                var val = (v[0] - p[0])*norm[0] + (v[1] - p[1])*norm[1]
                if (val < 0) {
                    p[2] -= this.delta
                } else {
                    p[2] += this.delta
                }
                this.setVertex(p, i, j);
            }
        }
    }
    
    /**
    * Send the buffer objects to WebGL for rendering 
    */
    loadBuffers()
    {
        
        // Specify the vertex coordinates
        this.VertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPositionBuffer);      
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vBuffer), gl.STATIC_DRAW);
        this.VertexPositionBuffer.itemSize = 3;
        this.VertexPositionBuffer.numItems = this.numVertices;
        console.log("Loaded ", this.VertexPositionBuffer.numItems, " vertices");
    
        // Specify normals to be able to do lighting calculations
        this.VertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.nBuffer),
                  gl.STATIC_DRAW);
        this.VertexNormalBuffer.itemSize = 3;
        this.VertexNormalBuffer.numItems = this.numVertices;
        console.log("Loaded ", this.VertexNormalBuffer.numItems, " normals");
    
        // Specify faces of the terrain 
        this.IndexTriBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexTriBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.fBuffer),
                  gl.STATIC_DRAW);
        this.IndexTriBuffer.itemSize = 1;
        this.IndexTriBuffer.numItems = this.fBuffer.length;
        console.log("Loaded ", this.IndexTriBuffer.numItems, " triangles");
    
        //Setup Edges  
        this.IndexEdgeBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexEdgeBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.eBuffer),
                  gl.STATIC_DRAW);
        this.IndexEdgeBuffer.itemSize = 1;
        this.IndexEdgeBuffer.numItems = this.eBuffer.length;
        
        console.log("triangulatedPlane: loadBuffers");
    }
    
    /**
    * Render the triangles 
    */
    drawTriangles(){
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.VertexPositionBuffer.itemSize, 
                         gl.FLOAT, false, 0, 0);

        // Bind normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
                           this.VertexNormalBuffer.itemSize,
                           gl.FLOAT, false, 0, 0);   
    
        //Draw 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexTriBuffer);
        gl.drawElements(gl.TRIANGLES, this.IndexTriBuffer.numItems, gl.UNSIGNED_INT,0);
    }
    
    /**
    * Render the triangle edges wireframe style 
    */
    drawEdges(){
    
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.VertexPositionBuffer.itemSize, 
                         gl.FLOAT, false, 0, 0);

        // Bind normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
                           this.VertexNormalBuffer.itemSize,
                           gl.FLOAT, false, 0, 0);   
    
        //Draw 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexEdgeBuffer);
        gl.drawElements(gl.LINES, this.IndexEdgeBuffer.numItems, gl.UNSIGNED_INT,0);   
    }
/**
 * Fill the vertex and buffer arrays 
 */    
generateTriangles()
{
    var deltaX = (this.maxX - this.minX) / this.div;
    var deltaY = (this.maxY - this.minY) / this.div;

    for (var i = 0; i <= this.div; i++) {
        for (var j = 0; j <= this.div; j++) {

            var x_idx = this.minX + deltaX*j
            var y_idx = this.minY + deltaY*i

            // Vertex is (x, y, 0) for flat plane.
            this.vBuffer.push(x_idx);
            this.vBuffer.push(y_idx);
            this.vBuffer.push(0);
        }
    }

    for (var i = 0; i < this.div; i++) {
        for (var j = 0; j < this.div; j++) 
        {
            
            // Anticlockwise triangle specification using converted index
            // if v1, v2, v3, v4 specify a square with a v2, v3 diagonal
            // in anticlockwise order with v1 on the bottom left corner
            // We send the order (v1, v2, v4), (v2, v3, v4) to specify
            // The triangle in the buffer. 

            var t_idx = i*(this.div + 1) + j;

            this.fBuffer.push(t_idx);
            this.fBuffer.push(t_idx+1);
            this.fBuffer.push(t_idx+this.div+1);

            this.fBuffer.push(t_idx + 1);
            this.fBuffer.push(t_idx + this.div + 2);
            this.fBuffer.push(t_idx + this.div + 1);
        }
    }
    
    if (this.rPartition) {
        // Creates the z coordinates of the vertices with random_partitioning
        for (var i = 0; i < this.num_iter; i++) {
            this.generate_heights();
        }
    }

    // Generate per vertex normals
    for (var i = 0; i < this.vBuffer.length; i++) {
        this.nBuffer[i] = 0;
    }

    this.generateNormals();
    this.numVertices = this.vBuffer.length/3;
    this.numFaces = this.fBuffer.length/3;
}

/**
 * Calculates per vertex normals.
 */
generateNormals() {
    for (var i = 0; i < this.fBuffer.length; i += 3) {

        // Get the index of each vertex of triangle.
        var ind_v1 = 3*this.fBuffer[i]
        var ind_v2 = 3*this.fBuffer[i+1]
        var ind_v3 = 3*this.fBuffer[i+2]


        // Create vectors for each vertex.
        var v1x = this.vBuffer[ind_v1]
        var v1y = this.vBuffer[ind_v1+1]
        var v1z = this.vBuffer[ind_v1+2]

        var v2x = this.vBuffer[ind_v2]
        var v2y = this.vBuffer[ind_v2+1]
        var v2z = this.vBuffer[ind_v2+2]

        var v3x = this.vBuffer[ind_v3]
        var v3y = this.vBuffer[ind_v3+1]
        var v3z = this.vBuffer[ind_v3+2]
        
        var v1  = vec3.fromValues(v1x, v1y, v1z);
        var v2  = vec3.fromValues(v2x, v2y, v2z);
        var v3 = vec3.fromValues(v3x, v3y, v3z);

        var v2v1 = vec3.create()
        var v3v1 = vec3.create()
        var nvec = vec3.create()

        // Perform (v2-v1) x (v3 - v1) and normalize.
        vec3.subtract(v2v1, v2, v1)
        vec3.subtract(v3v1, v3, v1)

        vec3.cross(nvec, v2v1, v3v1)
        vec3.normalize(v3, v3)

        // Add to the normal buffer each normal component.
        this.nBuffer[ind_v1] += nvec[0]
        this.nBuffer[ind_v1+1] += nvec[1]
        this.nBuffer[ind_v1+2] += nvec[2]

        this.nBuffer[ind_v2] += nvec[0]
        this.nBuffer[ind_v2+1] += nvec[1]
        this.nBuffer[ind_v2+2] += nvec[2]

        this.nBuffer[ind_v3] += nvec[0]
        this.nBuffer[ind_v3+1] += nvec[1]
        this.nBuffer[ind_v3+2] += nvec[2]
    }
}

/**
 * Print vertices and triangles to console for debugging
 */
printBuffers()
    {
        
    for(var i=0;i<this.numVertices;i++)
          {
           console.log("v ", this.vBuffer[i*3], " ", 
                             this.vBuffer[i*3 + 1], " ",
                             this.vBuffer[i*3 + 2], " ");
                       
          }
    
      for(var i=0;i<this.numFaces;i++)
          {
           console.log("f ", this.fBuffer[i*3], " ", 
                             this.fBuffer[i*3 + 1], " ",
                             this.fBuffer[i*3 + 2], " ");
                       
          }

        for(var i=0;i<this.numVertices;i++)
        {
        console.log("f ", this.nBuffer[i*3], " ", 
                        this.nBuffer[i*3 + 1], " ",
                        this.nBuffer[i*3 + 2], " ");
                    
        }
        
    }

/**
 * Generates line values from faces in faceArray
 * to enable wireframe rendering
 */
generateLines()
{
    var numTris=this.fBuffer.length/3;
    for(var f=0;f<numTris;f++)
    {
        var fid=f*3;
        this.eBuffer.push(this.fBuffer[fid]);
        this.eBuffer.push(this.fBuffer[fid+1]);
        
        this.eBuffer.push(this.fBuffer[fid+1]);
        this.eBuffer.push(this.fBuffer[fid+2]);
        
        this.eBuffer.push(this.fBuffer[fid+2]);
        this.eBuffer.push(this.fBuffer[fid]);
    }
}
    
}
