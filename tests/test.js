var _ = require('./lib/underscore/underscore');
require('./lib/chai/chai').should();
var timer = require('../timer');

describe('timer.js', function() {

  var t;
  var fn = function() {};       // No-op function.

  // Tests if @val is approximately equal to @compareTo within +/- @deviation.
  function approx(val, compareTo, deviation) {
    return (val >= compareTo - deviation) && (val <= compareTo + deviation);
  }

  beforeEach(function() {
    t && t.stop();
    t = new timer.Timer();
  });

  it("creates a Timer object.", function() {
    new timer.Timer();
  });

  it("starts and stops a timer.", function(done) {
    t.start();
    t.on('tick', function(timerData) {
      t.stop();
      done();
    });
  });

  it("expects a valid event.", function() {
    t.on.bind(t, 'tick', fn).should.not.throw();
  });

  it("expects an invalid event.", function() {
    t.on.bind(t, 'foofoofoo', fn).should.throw();
  });

  it("configures a tick interval.", function(done) {
    t = new timer.Timer({tickInterval: 100});
    var startTime = performance.now();
    t.on('tick', function(timerData) {
      if (timerData.tick == 2) {
        (approx(performance.now() - startTime, 200, 50)).should.be.true;
        t.stop();
        done();
      }
    }).start();
  });

  it("listens to a timer for 10 ticks.", function(done) {
    t = new timer.Timer({tickInterval: 10})
    t.on('tick', function(timerData) {
      if (timerData.tick >= 10) {
        t.stop();
        done();
      }
    }).start();
  });

  it("measures a timer for 10 ticks", function(done) {
    t = new timer.Timer({tickInterval: 10});
    var startTime = performance.now();
    t.on('tick', function(timerData) {
      if (timerData.tick == 10) {
        (approx(performance.now() - startTime, 100, 50)).should.be.true;
        t.stop();
        done();
      }
    }).start();
  });

  it("measures a timer for 100 ticks", function(done) {
    t = new timer.Timer({tickInterval: 5});
    var startTime = performance.now();
    t.on('tick', function(timerData) {
      if (timerData.tick == 100) {
        (approx(performance.now() - startTime, 500, 75)).should.be.true;
        t.stop();
        done();
      }
    }).start();
  });

  it("measures a minimal tick against setTimeout.", function(done) {
    var start = performance.now();
    var tickCount = 100;
    var tickInterval = 1;
    var i = 0;
    (function fn() {
      if (i < tickCount)
        setTimeout(fn, tickInterval);
      else {
        var timeoutTicksPerSec = (performance.now() - start) / tickCount;
        t = new timer.Timer({tickInterval: tickInterval});
        t.on('tick', function(timerData) {
          if (timerData.tick == tickCount) {
            var timerTicksPerSec = (performance.now() - timerData.start) / tickCount;
            approx(timerTicksPerSec, timeoutTicksPerSec, 0.5).should.be.true;
            console.log('timeout TPS:', timeoutTicksPerSec);
            console.log('timer TPS:', timerTicksPerSec);
            done();
          }
        }).start();
      }
      i++;
    })();
  });

});
