/*
  timer.js

  <Usage>
  <TODO>

  <TODO>
  Actually emulate your usage for this so you know how to design it.
*/

function has(obj, key) {
  return obj.hasOwnProperty(key);
}

function each(coll, fn, context) {
  if (Array.isArray(coll)) {
    for (var i=0; i < coll.length; i++)
      fn.call(context, coll[i], i);
  }
  else {
    for (var k in coll) {
      if (coll.hasOwnProperty(k))
        fn.call(context, coll[k], k);
    }
  }
}

/*
  This is webworker code that should be treated as if it were on
  another page/url.
*/
var workerJs = function(tickInterval) {

  /*
    This worker posts only one kind of message (via postMessage), a
    data object consisting of various time properties.
  */

  var run = false;
  var tickCount = 0;
  var startTime;
  var runTime = 0;

  function tick() {
    var dt = performance.now() - startTime + runTime;
    runTime += dt;
    var data = {
      tick: tickCount++,
      time: runTime,
      dt: dt,
      interval: tickInterval
    };
    postMessage(data);
    setTimeout(function() {
      if (run) tick();
    }, tickInterval);
  };

  self.addEventListener('message', function(event) {
    if (event.data == 'stop')
      run = false;
    else if (event.data == 'start') {
      run = true;
      startTime = performance.now();
      tick();
    }
  });

};
/****/

var Timer = function(opts) {
  this.checkBrowserSupport();
  if (typeof opts == 'undefined')
    opts = {};
  this.events = {
    'tick': []
  };
  this.tickInterval = opts.tickInterval || 25;

  // Make sure you call this after all options have been configured.
  this.worker = this.createWorker();
};

var fn = Timer.prototype;

fn.checkBrowserSupport = function() {
  var features = ['Blob', 'Worker', 'URL', 'performance'];
  each(features, function(feature) {
    if (typeof this[feature] == 'undefined')
      throw new Error(feature + ' is not supported in this browser environment.');
  }, self);
};

fn.createWorker = function() {
  var blobUrl = URL.createObjectURL(
    new Blob(['(', workerJs.toString(), ')(' + this.tickInterval + ')'], {type: 'application/javascript'})
  );
  var worker = new Worker(blobUrl);
  URL.revokeObjectURL(blobUrl);
  worker.addEventListener('message', function(event) {
    this.trigger('tick', event.data);
  }.bind(this));
  return worker;
};

fn.start = function() {
  this.worker.postMessage('start');
  return this;
};

fn.stop = function() {
  this.worker.postMessage('stop');
  return this;
};

fn.checkValidEvent = function(eventName) {
  if (!has(this.events, eventName))
    throw new Error('Event "' + eventName + '" not a valid event.');
}

fn.on = function(eventName, callback) {
  this.checkValidEvent(eventName);
  this.events[eventName].push(callback);
  return this;
};

fn.trigger = function(eventName, eventArgs) {
  this.checkValidEvent(eventName);
  var eventArgs = Array.prototype.slice.call(arguments, 1);
  each(this.events[eventName], function(callback) {
    callback.apply(this, eventArgs);
  }, this);
  return this;
};

module.exports = {
  Timer: Timer,
};
