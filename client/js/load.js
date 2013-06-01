var scripts = [
  {
    name: 'input',
    file: '/js/input.js',
    requires: [
      'events'
    ]
  }, {
    name: 'sockets',
    file: '/socket.io/socket.io.js'
  }, {
    name: 'images',
    file: '/js/images.js'
  }, {
    name: 'camera',
    file: '/js/camera.js'
  }, {
    name: 'player',
    file: '/js/player.js',
    requires: [
      'camera'
    ]
  }, {
    name: 'events',
    file: '/js/events.js'
  }, {
    name: 'team',
    file: '/js/team.js',
    requires: [
      'events'
    ]
  }, {
    name: 'user',
    file: '/js/user.js',
    requires: [
      'events'
    ]
  }, {
    name: 'body',
    file: '/js/body.js'
  }, {
    name: 'item',
    file: '/js/item.js'
  }, {
    name: 'global',
    file: '/js/global.js',
    requires: [
      'input',
      'events',
      'sockets',
      'camera',
      'player',
      'images',
      'team',
      'user',
      'body',
      'item'
    ]
  }
];


function ScriptLoader(data) {
  this.scripts = data.scripts;
  this.total = this.scripts.length;
  this.loaded = 0;
  this.step = data.step.bind(this);
  this.complete = data.complete;
  this.error = data.error;
  this.load();
}
ScriptLoader.prototype.load = function() {
  if (this.total == this.loaded) {
    if (this.complete != undefined) {
      this.complete();
    }
  } else {
    var i = this.total;
    while(i--) {
      if (!this.scripts[i].loaded) {
        var delay = false;
        var d = this.total;
        while(d--) {
          if (this.scripts[d].loaded != 1 && this.scripts[i].requires && this.scripts[i].requires.indexOf(this.scripts[d].name) != -1) {
            delay = true;
          }
        }
        if (!delay) {
          this.loadScript(this.scripts[i]);
        }
      }
    }
  }
}
ScriptLoader.prototype.loadScript = function(script) {
  if (script.loaded != false) {
    var self = this;
    script.loaded = false;
    var element = document.createElement('script');
    element.type = 'text/javascript';
    element.src = script.file + '?' + new Date().getTime();
    element.onload = element.onreadystatechange = function() {
      if (script.loaded == false && (!this.readyState || this.readyState == 'complete')) {
        script.loaded = true;
        self.loaded++;
        if (self.step != undefined) {
          self.step(script);
        }
        self.load();
      }
    };
    element.onerror = function() {
      if (self.error != undefined) {
        self.error(script);
      }
    }
    document.body.appendChild(element);
  }
}


new ScriptLoader({
  scripts: scripts,
  step: function() {
    var progress = Math.floor((this.loaded / this.total) * 100);
   // console.log('loading: ' + progress + '%');
  },
  error: function() {
    console.error('error loading scripts');
  },
  complete: function() {
  }
});