/**
 * Keyboard event functions.
 */

/**
 * Handles key presses
 */
function handleKeyDown(event) { 
    if (event.key == " ")
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
function handleKeyPress() {
    if (currentlyPressedKeys[" "]) {
        for (var i = 0; i < num_balls.value; i++) {
            balls.push(new Ball())
        }
        currentlyPressedKeys[" "] = false;
    }
}
    