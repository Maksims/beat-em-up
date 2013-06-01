var animSpeed = 100;
var frameLast = 0;
var frame = 0;

var images = {
  'player': {
    skin: {
      'green': loadImage('player-green.png'),
      'red': loadImage('player-red.png')
    },
    frames: {
      'stand': [
        [ 0, 0, 58, 62 ]
      ],
      'stand.grab': [
        [ 0, 128, 58, 96 ]
      ],
      'walk': [
        [ 58, 0, 58, 62 ],
        [ 116, 0, 58, 62 ],
        [ 0, 0, 58, 62 ]
      ],
      'walk.grab': [
        [ 58, 128, 58, 96 ],
        [ 116, 128, 58, 96 ],
        [ 0, 128, 58, 96 ]
      ],
      'punch': [
        [ 0, 64, 58, 62 ],
        [ 58, 64, 58, 62 ],
        [ 116, 64, 58, 62 ]
      ],
      'corpse': [
        [ 0, 226, 68, 32 ]
      ]
    }
  },
  'chicken': {
    img: loadImage('chicken.png'),
    frames: {
      'stand': [
        [ 0, 0, 42, 32 ]
      ],
      'walk': [
        [ 42, 0, 42, 32 ],
        [ 84, 0, 42, 32 ],
        [ 0, 0, 42, 32 ]
      ]
    }
  },
  'punch': loadImage('punch.png')
}

function loadImage(fileName) {
  var image = new Image();
  image.src = '/images/' + fileName;
  return image;
}

function drawImage(image, skin, anim, x, y, halign, valign, lframe) {
  if (lframe == undefined) {
    lframe = frame;
  }
  if (skin) {
    var img = images[image].skin[skin];
  } else {
    var img = images[image].img;
  }

  var s = images[image].frames[anim][ lframe % images[image].frames[anim].length ];

  var o = [ 0, 0 ];
  if (halign) {
    o[0] = -s[2] * halign;
  }
  if (valign) {
    o[1] = -s[3] * valign;
  }

  ctx.drawImage(img, s[0], s[1], s[2], s[3], x + o[0], y + o[1], s[2], s[3]);
}