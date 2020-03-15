function handleButtonPress(elapsed) {
   

    cam_up_btn = document.getElementById("cam-up-btn");
    cam_down_btn = document.getElementById("cam-down-btn");
    cam_left_btn = document.getElementById("cam-left-btn");
    cam_right_btn = document.getElementById("cam-right-btn");
    
    tp_up_btn = document.getElementById("tp-up-btn");
    tp_down_btn = document.getElementById("tp-down-btn");
    tp_left_btn = document.getElementById("tp-left-btn");
    tp_right_btn = document.getElementById("tp-right-btn");
    

    cam_left_btn.onmousedown = function() {
      worldRotationValue += elapsed;
      teapotRotationValue += elapsed;
     }
     
     // Roll the plane right if d is pressed.
     cam_right_btn.onmousedown = function() {
        worldRotationValue -= elapsed
        teapotRotationValue -= elapsed
     }
   
     // Pitch up by rotating viewDir.
     cam_up_btn.onmousedown = function() {
        worldFlipValue += elapsed
        teapotFlipValue += elapsed
     }
     
     // PItch down by rotating viewDir
     cam_down_btn.onmousedown = function() {
      worldFlipValue -= elapsed
      teapotFlipValue -= elapsed
     }
   
     tp_left_btn.onmousedown = function() {
      teapotRotationValue -= elapsed
     }
     
     // Roll the plane right if d is pressed.
     tp_right_btn.onmousedown = function() {
      teapotRotationValue += elapsed
     }
   
     // Pitch up by rotating viewDir.
     tp_up_btn.onmousedown = function() {
      teapotFlipValue += elapsed
     }
     
     // PItch down by rotating viewDir
     tp_down_btn.onmousedown = function() {
      teapotFlipValue -= elapsed
     }
   }