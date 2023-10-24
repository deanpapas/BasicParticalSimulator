import { useEffect } from "react";
import "./Home.css";

const gravity = 0.9;
const friction = 0.5;

function getDistanceSquared(x1, y1, x2, y2) {
  let xDistance = x2 - x1;
  let yDistance = y2 - y1;

  return xDistance * xDistance + yDistance * yDistance;
}

const Home = () => {
  useEffect(() => {
    //Get the canvas & context
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    //Set the canvas width & height to fullscreen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight / 2;

    //Define mouse object
    var mouse = {
      x: undefined,
      y: undefined,
    };

    //Define Circle Parameters
    let pushFactor = 10;
    const colourArray = ["#ffaa33", "#99ffaa", "#00ff00", "#4411aa", "#ff1100"];

    //Define Listeners
    window.addEventListener("mousemove", function (event) {
      mouse.x = event.x;
      mouse.y = event.y;
    });

    window.addEventListener("mousedown", function (event) {
      pushFactor = 5;
    });

    window.addEventListener("mouseup", function (event) {
      pushFactor = 10;
    });

    window.addEventListener("resize", function () {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight / 2;

      init();
    });

    var circleArray = [];
    function init() {
      //Set the number of circles to be drawn on canvas
      circleArray = [];
      for (var i = 0; i < 400; i++) {
        var radius = Math.random() * 20 + 1;
        var x = Math.random() * (canvas.width - radius * 2) + radius;
        var y = Math.random() * (canvas.height - radius * 2) + radius;

        var dx = (Math.random() - 0.5) * 1;
        var dy = (Math.random() - 0.5) * 1;

        circleArray.push(new Circle(x, y, dx, dy, radius));
      }
    }

    //Begin the animation
    init();
    animate();

    function animate() {
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      //Update the circles
      for (var i = 0; i < circleArray.length; i++) {
        circleArray[i].update();
      }
    }

    //Define the resolveCollision function
    function resolveCollision(circle1, circle2) {
      const xVelocityDiff = circle1.dx - circle2.dx;
      const yVelocityDiff = circle1.dy - circle2.dy;

      const xDist = circle2.x - circle1.x;
      const yDist = circle2.y - circle1.y;

      //Prevent accidental overlap of circles
      if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
        //Grab angle between the two colliding circles
        const angle = -Math.atan2(circle2.y - circle1.y, circle2.x - circle1.x);

        //Store mass in var for better readability in collision equation
        const m1 = circle1.mass;
        const m2 = circle2.mass;

        //Velocity before equation
        const u1 = rotate(circle1.dx, circle1.dy, angle);
        const u2 = rotate(circle2.dx, circle2.dy, angle);

        //Velocity after 1d collision equation
        const v1 = {
          x: (u1.x * (m1 - m2)) / (m1 + m2) + (u2.x * 2 * m2) / (m1 + m2),
          y: u1.y,
        };
        const v2 = {
          x: (u2.x * (m1 - m2)) / (m1 + m2) + (u1.x * 2 * m2) / (m1 + m2),
          y: u2.y,
        };

        //Final velocity after rotating axis back to original location
        const vFinal1 = rotate(v1.x, v1.y, -angle);
        const vFinal2 = rotate(v2.x, v2.y, -angle);

        //Swap circle velocities for realistic bounce effect
        circle1.dx = vFinal1.x;
        circle1.dy = vFinal1.y;

        circle2.dx = vFinal2.x;
        circle2.dy = vFinal2.y;
      }
    }

    //Define the rotate function
    function rotate(dx, dy, angle) {
      return {
        x: dx * Math.cos(angle) - dy * Math.sin(angle),
        y: dx * Math.sin(angle) + dy * Math.cos(angle),
      };
    }

    //Define the Circle object
    function Circle(startX, startY, dx, dy, radius) {
      this.x = startX;
      this.y = startY;
      this.dx = dx;
      this.dy = dy;
      this.radius = radius;
      this.mass = 1 + radius / 10;
      this.colour = colourArray[Math.floor(Math.random() * colourArray.length)];

      this.draw = function () {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.colour;
        ctx.fill();
      };

      this.update = function () {
        //interactivity

        //Check if mouse is within 50px of circle
        var distance = Math.sqrt(
          Math.pow(mouse.x - this.x, 2) + Math.pow(mouse.y - this.y, 2)
        );

        if (distance < 50) {
          //Push away from mouse
          var yDiff = mouse.y - this.y;
          var xDiff = mouse.x - this.x;

          this.dy -= yDiff / pushFactor;
          this.dx -= xDiff / pushFactor;
        }

        //Check for collision with walls

        //Right wall
        if (this.x + this.radius > canvas.width && this.dx >= 0) {
          this.dx = -this.dx * friction;
          this.x = canvas.width - this.radius;
        }

        //Left wall
        if (this.x - this.radius < 0 && this.dx <= 0) {
          this.dx = -this.dx * friction;
          this.x = this.radius;
        }

        //Bottom wall
        if (this.y + this.radius > canvas.height && this.dy >= 0) {
          this.dy = -this.dy * friction;
          this.y = canvas.height - this.radius;

          //Reduce horizontal velocity
          this.dx = this.dx * friction;
        }

        //Top wall
        if (this.y - this.radius < 0 && this.dy <= 0) {
          this.dy = -this.dy * friction;
          this.y = this.radius;
        } else {
          //Apply gravity
        //   this.dy += gravity;
        }

        for (var i = 0; i < circleArray.length; i++) {
          if (this === circleArray[i]) continue;

          if (
            getDistanceSquared(
              this.x,
              this.y,
              circleArray[i].x,
              circleArray[i].y
            ) <
            (this.radius + circleArray[i].radius) *
              (this.radius + circleArray[i].radius)
          ) {
            //Collision detected
            resolveCollision(this, circleArray[i]);
          }
        }

        this.x += this.dx;
        this.y += this.dy;

        this.draw();
      };
    }
  }, []);

  return (
    <div>
      <canvas id="canvas"></canvas>
    </div>
  );
};

export default Home;
