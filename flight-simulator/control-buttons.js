function handleButtonPress() {
    var tempQuat = quat.create();
    // Take the cross product of eyePt and viewDir to get plane of rotation for pitch
    var cross_vec = vec3.create()
    vec3.cross(cross_vec, viewDir, up);
    vec3.normalize(cross_vec, cross_vec);
     // Roll the plane left if A is pressed.

    up_btn = document.getElementById("up-btn");
    down_btn = document.getElementById("down-btn");
    left_btn = document.getElementById("left-btn");
    right_btn = document.getElementById("right-btn");
    spd_inc = document.getElementById("spd-inc");
    spd_dec = document.getElementById("spd-dec");

    left_btn.onmousedown = function() {
       quat.setAxisAngle(tempQuat, viewPt, -0.05);
       vec3.transformQuat(up, up, tempQuat);
     }
     
     // Roll the plane right if d is pressed.
     right_btn.onmousedown = function() {
       quat.setAxisAngle(tempQuat, viewPt, 0.05);
       vec3.transformQuat(up, up, tempQuat);
     }
   
     // Pitch up by rotating viewDir.
     up_btn.onmousedown = function() {
       quat.setAxisAngle(tempQuat, cross_vec, 0.05);
       vec3.transformQuat(viewDir, viewDir, tempQuat);
     }
     
     // PItch down by rotating viewDir
     down_btn.onmousedown = function() {
       quat.setAxisAngle(tempQuat, cross_vec, -0.05);
       vec3.transformQuat(viewDir, viewDir, tempQuat);
     }
   
     // Adjust speed.
     spd_inc.onmousedown = function() {
       speed += 2*SPEED_MIN
     }
   
     spd_dec.onmousedown = function() {
       speed -= 2*SPEED_MIN
       speed = Math.max(0, speed)
     }
   }