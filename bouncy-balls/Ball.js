class Ball {
    constructor() {
        // Choose 0.8 so it doesn't immediately intersect the walls.
        // Center of the ball
        
        this.position = randomVector(40);
        this.velocity = randomVector(1.2);
        this.radius = 20*(Math.random());
        this.scale = vec3.fromValues(this.radius, this.radius, this.radius);
        this.color = [Math.random(), Math.random(), Math.random()];
    }

    /**
     * Performs positiona and velocity update after collision checks.
     * @param {vec3} acceleration Unfiform acceleration vector
     * @param {FLoat} drag drag coefficient
     * @param {float} dt Time differential
     */
    eulerIntegrate(acceleration, drag, dt) {

        var damped_velocity = vec3.create();
        vec3.scale(damped_velocity, this.velocity, drag**dt);
        vec3.add(this.velocity, this.velocity, damped_velocity);
        
        var a_dt = vec3.create();
        vec3.scale(a_dt, acceleration, dt);
        vec3.add(this.velocity, this.velocity, a_dt);
        
        this.collisionCheck(dt);

        var v_dt = vec3.create();
        vec3.scale(v_dt, this.velocity, dt);
        vec3.add(this.position, this.position, v_dt);
    }

    /**
     * Performs a collision check using reflection vector formula.
     * 
     * V' = V - 2*(V • N) * N
     * @param {Float} dt Time differential
     */
    collisionCheck(dt) {
        // Initialise vectors.
        var vdt = vec3.create(); // distance travelled in time dt in direction v
        var surfacePos = vec3.create(); // point on surface parralel to velocity.
        var radius = vec3.create(); // radius vector. 
        var xPoint = vec3.create(); // intersection point coordinates.

        // The object is a ball, and the surrounding is a box - so the most likely
        // position at which the ball collides with the wall is the surface point
        // That is parallel to the velocity when taking a vector from the center.

        vec3.normalize(radius, this.velocity);
        vec3.scale(radius, radius, this.radius);
        vec3.add(surfacePos, this.position, radius);

        // vdt is how far the ball moves in time dt.
        vec3.scale(vdt, this.velocity, dt);
        // maximal intersection point.
        vec3.add(xPoint, this.position, vdt);

        // The intersection point must have been outside the box for there
        // to be a collision
        if (Math.abs(xPoint[0]) > 50 ||
            Math.abs(xPoint[1]) > 50 ||
            Math.abs(xPoint[2]) > 40  ) 
        {   

             // Normal to the box.
            var normal = vec3.create();
            
            // Check cases for each side of the box.
            if (xPoint[0] > 50) {
                vec3.set(normal,-1, 0, 0);
            } else if (xPoint[0] < -50) {
                vec3.set(normal,1, 0, 0);
            } else if (xPoint[1] > 50) {
                vec3.set(normal,0, -1, 0);
            } else if (xPoint[1] < -50) {
                vec3.set(normal,0, 1, 0);
            } else if (xPoint[2] > 40) {
                vec3.set(normal,0, 0, -1);
            } else if (xPoint[2] < -40) {
                vec3.set(normal,0, 0, 1);
            }

            // Perform the update V' = V - 2*(V • N)*N
            var vdotn = -2*vec3.dot(this.velocity, normal);
            vec3.scale(normal, normal, vdotn);
            vec3.add(this.velocity, this.velocity, normal);

            // Some kind of frictional coefficient so the ball slows down
            // After a collision event.
            vec3.scale(this.velocity, this.velocity, 0.7);
            
            // Set of conditions (very rough) to check if the ball should stop 
            // moving.
            if (vec3.length(this.velocity) < 0.07 && 
                Math.abs(this.velocity[1]) < 0.05 && 
                this.position[1] < 0.05/this.radius) 
            {
                vec3.set(this.velocity,0,0,0);
            }
    }
    
}
    
}

/**
 * Generates random number in range [-mult, mult]
 */
function randomVector(mult) {
    x = 2*mult*Math.random()-mult;
    y = 2*mult*Math.random()-mult;
    z = 2*mult*Math.random()-mult;

    return vec3.fromValues(x, y, z);
}
