var item = null;

function Item(x, y) {
  this.x = x;
  this.y = y;
  this.player = 0;
}

Item.prototype.renderBottom = function() {
  if (this.player == 0) {
    ctx.save();

    ctx.translate(this.x, this.y - 2);
    ctx.scale(1, .5);
    ctx.beginPath();
    ctx.arc(0, 0, 29, 0 , 2 * Math.PI, false);
    ctx.strokeStyle = '#f60';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.restore();
  }
}

Item.prototype.render = function() {
  if (this.player == 0) {
    ctx.save();

    ctx.beginPath();
    ctx.translate(Math.floor(this.x / 4) * 4, Math.floor(this.y / 2) * 2);

    drawImage('chicken', null, 'walk', 0, 0, .5, 1);

    ctx.restore();
  }
}