function handleKeyPress() {
 var tempQuat = quat.create();
    // Take the cross product of eyePt and viewDir to get plane of rotation for pitch
    var cross_vec = vec3.create()
    vec3.cross(cross_vec, viewDir, up);
    vec3.normalize(cross_vec, cross_vec);
  // Roll the plane left if A is pressed.

  if (currentlyPressedKeys["a"]) {
    quat.setAxisAngle(tempQuat, viewPt, -0.01);
    vec3.transformQuat(up, up, tempQuat);
  }
  
  // Roll the plane right if d is pressed.
  if (currentlyPressedKeys["d"]) {
    quat.setAxisAngle(tempQuat, viewPt, 0.01);
    vec3.transformQuat(up, up, tempQuat);
  }

  // Pitch up by rotating viewDir.
  if (currentlyPressedKeys["w"]) {
    quat.setAxisAngle(tempQuat, cross_vec, 0.01);
    vec3.transformQuat(viewDir, viewDir, tempQuat);
  }
  
  // PItch down by rotating viewDir
  if (currentlyPressedKeys["s"]) {
    quat.setAxisAngle(tempQuat, cross_vec, -0.01);
    vec3.transformQuat(viewDir, viewDir, tempQuat);
  }

  // Adjust speed.
  if (currentlyPressedKeys["+"]) {
    speed += SPEED_MIN
  }

  if (currentlyPressedKeys["-"]) {
    speed -= SPEED_MIN
    speed = Math.max(0, speed)
  }
}


/** Handles keypresses and removes arrow down and up functionality */
function handleKeyDown(event) {
    if (event.key == "ArrowDown" || event.key == "ArrowUp") {
      event.preventDefault();
    }
    currentlyPressedKeys[event.key] = true;
}
  
  /** Handles key releases. */
function handleKeyUp(event) {
    currentlyPressedKeys[event.key] = false;
}