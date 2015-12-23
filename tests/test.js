var _ = require('./lib/underscore/underscore');
require('./lib/chai/chai').should();
// var $ = require('./lib/jquery/dist/jquery');
var timer = require('../timer');

describe('timer.js', function() {

  var t;
  var fn = function() {};       // No-op function.

  beforeEach(function() {
    t && t.stop();
    t = new timer.Timer();
  });

  it("creates a Timer object.", function() {
    new timer.Timer();
  });

  it("expects a valid event.", function() {
    t.on.bind(t, 'tick', fn).should.not.throw();
  });

  it("expects an invalid event.", function() {
    t.on.bind(t, 'foofoofoo', fn).should.throw();
  });

  it("configures a tick interval.", function() {

  });

  it.only("listens to a timer for 10 ticks.", function(done) {
    t = new timer.Timer({tickInterval: 10})
    t.on('tick', function(timerData) {
      if (timerData.tick >= 10) {
        // <TODO> Bug here: postMessage('stop') can take longer than
        // 10ms to fire and cause this block to run multiple times.
        t.stop();
        done();
      }
    }).start();
  });

  it("starts a timer.", function(done) {
  });

  it("stops a timer.", function(done) {
    // t.stop('tick')
    done();
  });

  it("measures a timer for 10 ticks", function(done) {
    done();
  });

});
