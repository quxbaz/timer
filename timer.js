/*
  bind.js

  Uses Range objects to accomplish bindings.
*/

var doc = document;

function each(obj, fn, context) {
  if (Array.isArray(obj)) {
    for (var i=0; i < obj.length; i++)
      fn.call(context, obj, i);
  }
  else {
    for (var k in obj) {
      if (obj.hasOwnProperty(k))
        fn.call(context, obj[k], k);
    }
  }
}

var setup = function(Handlebars) {
  Handlebars.registerHelper('bind', function(key) {
    if (typeof key != 'string')
      throw new Error('bind function must be passed a string.');
    return new Handlebars.SafeString(
      '<script data-bind-to="' + key + '" type="text/placeholder"></script>'
    );
  });
};

var bindProps = function(obj, el) {
  /*
    Looks in the DOM element @el for placeholders tags and binds then
    properties of @obj to them.

    <Usage>
    var v = new View();
    v.data = 'hello';
    v.template = '{{bind "data"}}';
    v.render();

    bind.bindProps(v, v.el); // You must call this after the template
                             // is rendered into DOM elements.

    console.log(v.el.innerHTML) -> 'hello'

    v.data = 'world';
    console.log(v.el.innerHTML) -> 'world'
  */
  each(el.getElementsByTagName('script'), function(script) {
    var range = doc.createRange();
    range.setStartBefore(script);
    range.setEndAfter(script);
    var key = script.getAttribute('data-bind-to');
    range.deleteContents();  // Deletes the script tag.
    var textNode = doc.createTextNode(obj[key]);
    range.insertNode(textNode);
    (function(value) {
      Object.defineProperty(obj, key, {
        get: function() {return value},
        set: function(val) {
          value = val;
          textNode.textContent = val;
        }
      });
    })(obj[key]);
  });
};

module.exports = {
  setup: setup,
  bindProps: bindProps
};
