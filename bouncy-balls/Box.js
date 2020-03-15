
function drawLines() {
    var vertices = [
      -1, -1, 0.15,
      -1,  1, 0.15,
       1,  1, 0.15,
       1, -1, 0.15,
    ];

    var normals = [
      0, 0, 1,
      0, 0, 1, 
      0, 0, 1,
      0, 0, 1,
    ]
    
    var vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
      3, gl.FLOAT, false, 0, 0);

    var normal_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normal_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(shaderProgram.normalPositionAttribute, 
      3, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.LINE_LOOP, 0, 4);

    var vertices = [
      -1, -1, -1.5,
      -1,  1, -1.5,
       1,  1, -1.5,
       1, -1, -1.5,
    ];

    var normals = [
      0, 0, 1,
      0, 0, 1, 
      0, 0, 1,
      0, 0, 1,
    ]
    
    var vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
      3, gl.FLOAT, false, 0, 0);

    var normal_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normal_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(shaderProgram.normalPositionAttribute, 
      3, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.LINE_LOOP, 0, 4);

    var vertices = [
      -1, -1, -1.5,
      -1, -1, 0.15,
      -1,  1, -1.5,
      -1,  1, 0.15,
       1,  1, -1.5,
       1,  1, 0.15,
       1, -1, -1.5,
       1, -1, 0.15,
    ];

    var normals = [
      0, 0, 1,
      0, 0, 1, 
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1, 
      0, 0, 1,
      0, 0, 1,
    ]

    var vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
      3, gl.FLOAT, false, 0, 0);

    var normal_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normal_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    
    gl.vertexAttribPointer(shaderProgram.normalPositionAttribute, 
      3, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.LINES, 0, 8);
    
}