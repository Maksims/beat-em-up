var cameraOffset = {
  x: -32,
  y: -152
}

var camera = null;

function Camera() {
  this.x = 0;
  this.y = 0;
}

Camera.prototype.render = function() {
  ctx.translate(-this.x, -this.y);
}