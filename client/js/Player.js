var players = { };

function Player(data) {
  this.id = data.id;

  this.x = data.x;
  this.y = data.y;

  this.dx = 0;
  this.dy = 0;

  this.f = data.f;

  this.sp = data.sp;

  this.hp = data.hp;
  this.state = data.state;
  this.user = users[data.user];

  this.holding = false;

  this.anim = 'stand';

  this.frameLast = 0;
  this.frame = 0;
}

Player.prototype.set = function(data) {
  for(var key in data) {
    if (key != 'id' && this[key] != undefined) {
      this[key] = data[key];
    } else {
      switch(key) {
        case 'kick':
          this.anim = 'punch';
          this.frame = 0;
          this.frameLast = now;
          break;
      }
    }
  }
}

Player.prototype.update = function() {
  if (now - this.frameLast > animSpeed) {
    this.frameLast = now;
    ++this.frame;
  }

  if (!(this.anim == 'punch' && this.frame < 3 && !this.holding)) {
    switch(this.state) {
      case 'walk':
        this.anim = 'walk' + (this.holding ? '.grab' : '');
        break;
      default:
        this.anim = 'stand' + (this.holding ? '.grab' : '');
        break;
    }
  }
}

Player.prototype.render = function() {
  ctx.save();

  ctx.beginPath();
  ctx.translate(Math.floor(this.x / 4) * 4, Math.floor(this.y / 2) * 2);
  if (this.f == -1) {
    ctx.scale(-1, 1);
  }

  drawImage('player', this.user.team.color, this.anim, 0, 0, .5, 1, this.frame);

  ctx.restore();
}

Player.prototype.renderBottom = function() {
  if (this.id == own) {
    ctx.save();

    ctx.translate(Math.floor(this.x / 4) * 4, Math.floor(this.y / 2) * 2 - 2);
    ctx.scale(1, .5);
    ctx.beginPath();
    ctx.arc(0, 0, 29, 0 , 2 * Math.PI, false);

    ctx.strokeStyle = this.user.team.name == 'green' ? '#0c0' : '#c00';

    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.restore();
  }
}
Player.prototype.renderTop = function() {
  var x = Math.floor(this.x / 4) * 4;
  var y = Math.floor(this.y / 2) * 2;

  ctx.save();

  ctx.beginPath();
  ctx.fillStyle = '#000';
  ctx.rect(x - 29, y + 4, 59, 4);
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = this.hp > 50 ? '#0f0' : (this.hp > 25 ? '#ff0' : '#f00');
  var bars = Math.floor(this.hp / 10);
  var i = bars;
  while(i--) {
    ctx.rect(x + (i * 6) - 29, y + 4, 5, 4)
  }
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.fillStyle = this.user.team.name == 'green' ? '#0c0' : '#c00';
  ctx.fillText(this.user.name, x, y - 70 - (item.player == this.id ? 26 : 0));

  ctx.restore();
}