if (navigator.mozApps && navigator.userAgent.toLowerCase().indexOf('mobile') != -1) {
  appSelf = navigator.mozApps.getSelf();
  appSelf.onsuccess = function() {
    if (!appSelf.result) {
      var fos = document.createElement('div');
      fos.id = 'fosInstall';

      var install = document.createElement('div');
      install.className = 'install';
      install.textContent = 'Install';
      fos.appendChild(install);

      var status = document.createElement('div');
      status.className = 'status';
      fos.appendChild(status);

      var request = window.navigator.mozApps.getInstalled();
      request.onsuccess = function(e) {
        for(var i in request.result) {
          if (request.result[i].manifest.name == 'moka.beat-em-up') {
            install.textContent = 'Open';
            request.result[i].launch();
          }
        }
      }

      document.body.appendChild(fos);

      install.addEventListener('touchstart', function() {
        var path = document.URL.split( '/' ).slice( 0, -1 ).join( '/' );
        var request = navigator.mozApps.install(path + "/manifest.webapp");
        request.onsuccess = function() {
          install.textContent = 'Open';
          status.textContent = 'installed';
          var activity = new MozActivity({
            name: "moka.beat"
          });
        }
        request.onerror = function(e) {
          if (this.error.name == 'REINSTALL_FORBIDDEN') {
            var activity = new MozActivity({
              name: "moka.beat"
            });
          } else {
            status.textContent = 'app install failed: ' + this.error.name;
          }
        }
      });
    } else {
      initialize();
    }
  }
  appSelf.onerror = function() {
    initialize();
  }
} else {
  initialize();
}

var ctx, canvas, socket;
var notifies = [ ];

var initialized = false;
function initialize() {
  if (!initialized) {
    initialized = true;

    if (navigator.mozSetMessageHandler) {
      navigator.mozSetMessageHandler('activity', function(activityRequest) {
        location.reload(true);
      });
    }

    var ruler = document.getElementById('ruler');
    var rulerWidth = 0;
    var rulerHeight = 0;


    document.getElementById('refresh').onclick = function() {
      location.href = location.href
    }


    canvas = document.getElementById("game");
    ctx = canvas.getContext("2d");

    ctx.webkitImageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    ctx.font = '14px "pixel"';

    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;

    socket = io.connect();


    var ownHealth = 0;


    now = new Date().getTime();

    var start = false;
    var GameLoop = null;
    var GameRender = null;

    var uiPunch = 0;

    var joysticLast = {
      x: 0,
      y: 0
    };
    var joystic = {
      x: 0,
      y: 0,
      touch: -1
    };

    socket.on('connect', function() {
      socket.on('lobby', function(data) {
        document.getElementById('lobbyUsers').textContent = data.users + ' / ' + data.match;
      });

      GameLoop = function () {
        now = new Date().getTime();

        if (now - frameLast > animSpeed) {
          frameLast = now;
          ++frame;
        }

        for(var id in players) {
          players[id].update();

          if (navigator.vibrate) {
            if (players[own].hp != ownHealth) {
              navigator.vibrate(Math.max(Math.min(Math.abs(ownHealth - players[own].hp) * 5, 300), 50));
              ownHealth = players[own].hp;
            }
          }
        }

        if (input.touch) {
          joysticLast.x = joystic.x;
          joysticLast.y = joystic.y;

          var punchTouch = false;
          var joysticTouch = false;
          if (input.touches[joystic.touch] != undefined) {
            joysticTouch = true;
          }
          for(var id in input.touches) {
            var touch = input.touches[id];

            if (!joysticTouch) {
              var d = dist(68, rulerHeight - 68, touch.x, touch.y);
              if (d < 64) {
                joysticTouch = true;
                joystic.touch = id;
                joystic.x = (touch.x - 68) / Math.max(d, 64);
                joystic.y = (touch.y - (rulerHeight - 68)) / Math.max(d, 64);
              }
            } else if (id == joystic.touch) {
              var d = dist(68, rulerHeight - 68, touch.x, touch.y);
              joystic.x = (touch.x - 68) / Math.max(d, 64);
              joystic.y = (touch.y - (rulerHeight - 68)) / Math.max(d, 64);
            }

            if (!punchTouch && item.player != own) {
              var d = dist(rulerWidth - 68, rulerHeight - 68, touch.x, touch.y);
              if (d < 64) {
                punchTouch = true;
              }
            }
          }
          if (!joysticTouch) {
            joystic.touch = -1;
            joystic.x = 0;
            joystic.y = 0;
          }

          var inputEmpty = true;
          var actions = { };

          if (joysticLast.x != joystic.x || joysticLast.y != joystic.y) {
            inputEmpty = false;
            actions['move'] = {
              x: joystic.x,
              y: joystic.y
            }
          }
          if (punchTouch) {
            inputEmpty = false;
            uiPunch = now;
            actions['kick'] = 1;
          }
          if (uiPunch != 0 && now - uiPunch > 100) {
            uiPunch = 0;
          }

          if (!inputEmpty) {
            socket.emit('input', actions);
          }
        }
      }

      GameRender = function() {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.font = '14px "pixel"';

        if (own) {
          camera.x = Math.max(Math.min((Math.floor(players[own].x / 4) * 4) - rulerWidth / 2, 832 - rulerWidth + cameraOffset.x), cameraOffset.x);
          camera.y = Math.max(Math.min((Math.floor(players[own].y / 2) * 2) - rulerHeight / 2 + cameraOffset.x, 384 - rulerHeight + cameraOffset.y), cameraOffset.y);
        }
        camera.render();

        canvas.style.backgroundPosition = (-camera.x + cameraOffset.x) + 'px ' + (-camera.y + cameraOffset.y) + 'px';

        var renderables = [ ];

        for(var id in players) {
          renderables.push(players[id]);
        }
        if(item.player == 0) {
          renderables.push(item);
        }
        var i = bodies.length;
        while(i--) {
          renderables.push(bodies[i]);
        }

        renderables.sort(function(a, b) {
          return b.y - a.y;
        });

        var i = renderables.length;
        while(i--) {
          if (renderables[i].renderBottom) {
            renderables[i].renderBottom();
          }
        }

        i = renderables.length;
        while(i--) {
          renderables[i].render(true);
        }

        i = renderables.length;
        while(i--) {
          if (renderables[i].renderTop) {
            renderables[i].renderTop();
          }
        }

        ctx.setTransform(1, 0, 0, 1, 0, 0);

        ctx.font = '36px "pixel"';
        for(var id in teams) {
          if (teams[id].color == 'green') {
            ctx.fillStyle = '#0c0';
            ctx.textAlign = 'right';
            ctx.fillText(teams[id].score, rulerWidth / 2 - 8, rulerHeight - 16);
          } else {
            ctx.fillStyle = '#c00';
            ctx.textAlign = 'left';
            ctx.fillText(teams[id].score, rulerWidth / 2 + 8, rulerHeight - 16);
          }
        }

        if (input.touch) {
          ctx.beginPath();
          ctx.arc(68, rulerHeight - 68, 64, 0, 2 * Math.PI, false);
          ctx.strokeStyle = '#999';
          ctx.stroke();
          ctx.fillStyle = 'rgba(255, 255, 255, ' + ((joystic.x == 0 && joystic.y == 0) ? '.1' : '.2') + ')';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(68 + joystic.x * 48, (rulerHeight - 68) + joystic.y * 48, 32, 0, 2 * Math.PI, false);
          ctx.strokeStyle = '#999';
          ctx.stroke();
          ctx.fillStyle = 'rgba(255, 255, 255, .2)';
          ctx.fill();

          if (item.player != own) {
            ctx.beginPath();
            ctx.arc(rulerWidth - 68, rulerHeight - 68, 64, 0, 2 * Math.PI, false);
            ctx.strokeStyle = '#999';
            ctx.stroke();
            ctx.fillStyle = 'rgba(255, 255, 255, ' + (uiPunch == 0 ? '.1' : '.4') +  ')';
            ctx.fill();

            ctx.drawImage(images['punch'], rulerWidth - 116, rulerHeight - 106);
          }

          // for(var i in input.touches) {
          //   ctx.beginPath();
          //   ctx.arc(input.touches[i].x, input.touches[i].y, 32, 0, 2 * Math.PI, false);
          //   ctx.fillStyle = '#00f';
          //   ctx.fill();
          // }
        }

        if (rulerWidth < 832 || rulerHeight < 384) {
          camera.render();

          var arrowSize = 20;

          for(var id in players) {
            if (id != own) {
              if (players[id].x < camera.x || players[id].x > camera.x + rulerWidth || players[id].y < camera.y || players[id].y > camera.y + rulerHeight) {
                ctx.beginPath();
                var x = Math.min(Math.max(players[id].x, camera.x + 4), camera.x + rulerWidth - 4);
                var y = Math.min(Math.max(players[id].y, camera.y + 4), camera.y + rulerHeight - 4);

                var nx = players[own].x - players[id].x;
                var ny = players[own].y - players[id].y;
                var d = Math.sqrt(nx * nx + ny * ny);

                nx /= d;
                ny /= d;

                var cA = rot(nx, ny, -30);
                var cB = rot(nx, ny, 30);

                ctx.moveTo(x, y);
                ctx.lineTo(x + cA.x * arrowSize, y + cA.y * arrowSize);
                ctx.lineTo(x + cB.x * arrowSize, y + cB.y * arrowSize);

                ctx.stroke();
                ctx.fillStyle = players[id].user.team.name == 'green' ? '#0c0' : '#c00';
                ctx.fill();
              }
            }
          }
        }

        if (item.player == 0 && (item.x < camera.x || item.x > camera.x + rulerWidth || item.y < camera.y || item.y > camera.y + rulerHeight)) {
          ctx.beginPath();
          var x = Math.min(Math.max(item.x, camera.x + 4), camera.x + rulerWidth - 4);
          var y = Math.min(Math.max(item.y, camera.y + 4), camera.y + rulerHeight - 4);

          var nx = players[own].x - item.x;
          var ny = players[own].y - item.y;
          var d = Math.sqrt(nx * nx + ny * ny);

          nx /= d;
          ny /= d;

          var cA = rot(nx, ny, -30);
          var cB = rot(nx, ny, 30);

          ctx.moveTo(x, y);
          ctx.lineTo(x + cA.x * arrowSize, y + cA.y * arrowSize);
          ctx.lineTo(x + cB.x * arrowSize, y + cB.y * arrowSize);

          ctx.fillStyle = '#f60';
          ctx.fill();
        }
      }

      socket.on('match', function(data) {
        start = true;

        if (navigator.mozNotification && document.hidden) {
          var notify = navigator.mozNotification.createNotification("Beat-Em-Up", "Match has just started!");
          notify.onclick = function() {
            appSelf.result.launch();
          };
          notify.show();
          notifies.push(notify);
        }

        document.getElementById('lobby').parentNode.removeChild(document.getElementById('lobby'));
        document.getElementById('game').style.display = 'block';

        StartBlink();

        camera = new Camera();

        for(var id in data.teams) {
          var team = new Team({
            id: id,
            name: data.teams[id].name,
            color: data.teams[id].color,
            score: data.teams[id].score
          });
        }

        for(var id in data.users) {
          var user = new User({
            id: id,
            name: data.users[id].name,
            team: teams[data.users[id].team],
            score: data.users[id].score
          });
        }

        item = new Item(data.item.x, data.item.y);

        for(var id in data.players) {
          players[id] = new Player(data.players[id]);
        }

        setInterval(GameLoop, 1000/30);
        setInterval(GameRender, 1000/30);

        input.touchInit(canvas);
        if (input.touch) {
          document.getElementById('refresh').style.display = 'block';
        }
      });


      socket.on('match.end', function(data) {
        //console.log('match.end');
        //console.log(JSON.stringify(data));
      });


      var lastHit = new Date().getTime();

      socket.on('state', function(data) {
        if (data.item.player) {
          if (item.player == 0) {
            players[data.item.player].holding = true;
          }
          item.player = data.item.player;
        } else {
          if (item.player != 0) {
            if (players[item.player] != undefined) {
              players[item.player].holding = false;
            }
          }
          item.x = data.item.x;
          item.y = data.item.y;
          item.player = 0;
        }

        for(var id in data.teams) {
          teams[id].data(data.teams[id]);
        }

        for(var id in data.users) {
          users[id].data(data.users[id]);
        }

        for(var id in data.players) {
          players[id].set(data.players[id]);
        }
      });

      socket.on('user.leave', function(id) {
        users[id].remove();
      });

      socket.on('setName', function(data) {
        var user = users[data.id];
        user.data({
          name: data.name
        })
      });

      socket.on('player.spawn', function(data) {
        players[data.id] = new Player(data);
      });

      socket.on('player.death', function(id) {
        new Body({
          x: players[id].x,
          y: players[id].y,
          f: players[id].facing,
          skin: players[id].user.team.color
        });

        delete players[id];
      });

      socket.on('player.own', function(id) {
        own = id;
      });
    });

    var blink = 5;
    var blinkTitle = 'MATCH! Beat-Em-Up!'
    function StartBlink() {
      if (blink > 0) {
        blink--;
        document.title = (blink % 2) == 1 ? blinkTitle : 'Beat-Em-Up!';
        setTimeout(StartBlink, 500);
      } else {
        document.title = blinkTitle;
      }
    }

    window.onresize = function() {
      resizeCanvas();
    }

    setInterval(function() {
      resizeCanvas();
    }, 200);

    var resizeTimer = null;
    function resizeCanvas() {
      var bounds = ruler.getBoundingClientRect();
      if (rulerWidth != Math.min(bounds.width, 832) || rulerHeight != Math.min(bounds.height, 384)) {
        rulerWidth = Math.min(bounds.width, 832);
        rulerHeight = Math.min(bounds.height, 384);

        if (resizeTimer) {
          clearTimeout(resizeTimer);
          resizeTimer = null;
        }
        resizeTimer = setTimeout(function() {
          canvas.width = rulerWidth;
          canvas.height = rulerHeight;

          ctx.font = '14px "pixel"';

          if (start) {
            GameRender();
          }
        }, 100);
      }
    }
    resizeCanvas();


    // math

    var rd = Math.PI / 180.0;

    function dist(sX, sY, dX, dY) {
      return Math.sqrt((sX - dX) * (sX - dX) + (sY - dY) * (sY - dY));
    }

    function rot(x, y, d) {
      d *= rd;
      return {
        x: x * Math.cos(d) - y * Math.sin(d),
        y: y * Math.cos(d) + x * Math.sin(d)
      }
    }
  }
}