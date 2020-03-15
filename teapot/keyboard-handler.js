/** Handles keypresses and removes arrow down and up functionality */
function handleKeyDown(event) {
    if (event.key == "ArrowDown" || event.key == "ArrowUp" ||
        event.key == "ArrowLeft" || event.key == "ArrowRight")
    {
      event.preventDefault();
    }
    currentlyPressedKeys[event.key] = true;
}
  
/** Handles key releases. */
function handleKeyUp(event) {
    currentlyPressedKeys[event.key] = false;
}

/**
 * Alters the rotation value updates upon key presses.
 * @param {float} elapsed the amount of time elapsed per frame.
 */
function handleKeyPress(elapsed) {
    if (currentlyPressedKeys["w"]) {
        worldFlipValue += elapsed / 10.0;
        teapotFlipValue += elapsed / 10.0;
    }
    if (currentlyPressedKeys["a"]) {
        worldRotationValue += elapsed / 10.0;
        teapotRotationValue += elapsed / 10.0;
    }
    if (currentlyPressedKeys["s"]) {
        worldFlipValue -= elapsed / 10.0;
        teapotFlipValue -= elapsed / 10.0;
    }
    if (currentlyPressedKeys["d"]) {
        worldRotationValue -= elapsed / 10.0;
        teapotRotationValue -= elapsed / 10.0;
    }
    if (currentlyPressedKeys["ArrowRight"]) {
        teapotRotationValue += elapsed / 10.0;
    }
    if (currentlyPressedKeys["ArrowLeft"]) {
        teapotRotationValue -= elapsed / 10.0;
    }
    if (currentlyPressedKeys["ArrowUp"]) {
        teapotFlipValue += elapsed / 10.0;
    }
    if (currentlyPressedKeys["ArrowDown"]) {
        teapotFlipValue -= elapsed / 10.0;
    }
}