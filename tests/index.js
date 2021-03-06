var _ = require('./lib/underscore/underscore');
require('./lib/chai/chai').should();
var Timer = require('../index');

describe('timer', function() {

  var fn = function() {};       // No-op function.

  // Tests if @val is approximately equal to @compareTo within +/- @deviation.
  function approx(val, compareTo, deviation) {
    return (val >= compareTo - deviation) && (val <= compareTo + deviation);
  }

  it("creates a Timer object.", function() {
    new Timer();
  });

  it("starts and stops a timer.", function(done) {
    var t = new Timer();
    t.start();
    t.on('tick', function() {
      t.stop();
      done();
    });
  });

  it("binds a valid event.", function() {
    var t = new Timer();
    t.on.bind(t, 'tick', fn).should.not.throw();
  });

  it("throws on binding an invalid event.", function() {
    var t = new Timer();
    t.on.bind(t, 'foofoofoo', fn).should.throw();
  });

  it("configures a tick interval.", function(done) {
    var t = new Timer({tickInterval: 50});
    t = new Timer({tickInterval: 10});
    t.on('tick', function() {
      // console.log('tick');
      if (t.tickCount == 5) {
        // (approx(t.elapsed, 250, 50)).should.be.true;
        t.stop();
        done();
      }
    }).start();
  });

  it("listens to a timer for 10 ticks.", function(done) {
    var t = new Timer({tickInterval: 10})
    t.on('tick', function() {
      if (t.tickCount == 10) {
        t.stop();
        done();
      }
    }).start();
  });

  it("measures a timer for 10 ticks", function(done) {
    var t = new Timer({tickInterval: 10});
    t.on('tick', function() {
      if (t.tickCount == 10) {
        (approx(t.elapsed, 100, 50)).should.be.true;
        t.stop();
        done();
      }
    }).start();
  });

  it("measures a timer for 100 ticks", function(done) {
    var t = new Timer({tickInterval: 5});
    t.on('tick', function() {
      if (t.tickCount == 100) {
        (approx(t.elapsed, 500, 75)).should.be.true;
        t.stop();
        done();
      }
    }).start();
  });

  it("measures a minimal tick against setTimeout.", function(done) {
    var start = performance.now();
    var tickCount = 50;
    var tickInterval = 1;
    var i = 0;
    (function fn() {
      if (i < tickCount) {
        setTimeout(fn, tickInterval);
        i++;
      }
      else {
        var timeoutTicksPerSec = (performance.now() - start) / tickCount;
        t = new Timer({tickInterval: tickInterval});
        t.on('tick', function() {
          if (t.tickCount == tickCount) {
            var timerTicksPerSec = t.elapsed / tickCount;
            approx(timerTicksPerSec, timeoutTicksPerSec, 0.5).should.be.true;
            done();
          }
        }).start();
      }
    })();
  });

  it("Changes the tick interval while the timer is running.", function(done) {
    var t = new Timer({tickInterval: 10});
    t.on('tick', function() {
      if (t.tickCount == 10)
        t.setTickInterval(50);
      else if (t.tickCount == 15) {
        approx(t.elapsed, 350, 50).should.be.true;
        done();
      }
    }).start();
  });

});
