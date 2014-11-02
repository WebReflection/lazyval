//remove:
var lazyval = require('../build/lazyval.node.js');
//:remove

wru.test([
  {
    name: 'main',
    test: function () {
      wru.assert(typeof lazyval == 'function');
      wru.assert(typeof lazyval.direct == 'function');
      wru.assert(typeof lazyval.proto == 'function');
    }
  }, {
    name: 'basic object test',
    test: function () {
      var o = {};
      var i = 0;
      var random;
      lazyval(o, 'random', function () {
        i++;
        return Math.random();
      });
      wru.assert('until reached, nothing happens', i === 0);
      wru.assert('reached many times does not affect the value', o.random === o.random);
      random = o.random;
      wru.assert('once reached, the value is the expected', /^0\.\d+$/.test(random));
      wru.assert('reached many times does not affect the value', o.random === o.random);
      wru.assert('callback invoked only once', i === 1);
      wru.assert('it is possible to remove the property', delete o.random);
      wru.assert('now no value assigned', o.random === undefined);
      wru.assert('callback not invoked again', i === i);
      wru.assert('we can re-assign the property');
      lazyval(o, 'random', function () {
        i++;
        return Math.random();
      });
      wru.assert('[2] until reached, nothing happens', i === 1);
      wru.assert('[2] once reached, the value is the expected', /^0\.\d+$/.test(o.random));
      wru.assert('[2] reached many times does not affect the value', o.random === o.random);
      wru.assert('[2] callback invoked only once', i === 2);
      wru.assert('[2] new value is different from previous one', random !== o.random);
      wru.assert('[2] it is possible to remove the property', delete o.random);
      wru.assert('[2] now no value assigned', o.random === undefined);
    }
  }, {
    name: 'inherited object test',
    test: function () {
      function Base() {}
      lazyval(Base.prototype, 'random', function () {
        i++;
        return Math.random();
      });
      var o = new Base;
      var i = 0;
      var random;
      wru.assert('until reached, nothing happens', i === 0);
      random = o.random;
      wru.assert('once reached, the value is the expected', /^0\.\d+$/.test(random));
      wru.assert('reached many times does not affect the value', o.random === o.random);
      wru.assert('callback invoked only once', i === 1);
      wru.assert('it is possible to remove the property', delete o.random);
      wru.assert('callback not invoked again', i === i);
      wru.assert('[2] once reached, the value is the expected', /^0\.\d+$/.test(o.random));
      wru.assert('[2] reached many times does not affect the value', o.random === o.random);
      wru.assert('[2] callback invoked only once', i === 2);
      wru.assert('[2] new value is different from previous one', random !== o.random);
      wru.assert('[2] it is possible to remove the property', delete o.random);
    }
  }, {
    name: 'inherited and inheritee',
    test: function () {
      function Base() {}
      lazyval(Base.prototype, 'random', function () {
        return Math.random();
      });
      var o = new Base;
      var random;
      wru.assert('accessing the proto object affects instances', Base.prototype.random === o.random);
      wru.assert('the value is the expected',
        /^0\.\d+$/.test(Base.prototype.random) && /^0\.\d+$/.test(o.random)
      );
      random = o.random;
      lazyval(Base.prototype, 'random', function () {
        return Math.random();
      });
      wru.assert('we can reassign the property', Base.prototype.random !== random);
      lazyval(Base.prototype, 'random', function () {
        return Math.random();
      });
      wru.assert('once reached via inheritance the value is the expected', /^0\.\d+$/.test(o.random));
      wru.assert('and it is different from before', random !== o.random);
      random = Base.prototype.random;
      delete Base.prototype.random;
      wru.assert('object has its own property', /^0\.\d+$/.test(o.random));
      wru.assert('and it is different from the other', random !== o.random);
    }
  }, {
    name: 'inherited and inheritee as lazyval.proto',
    test: function () {
      function Base() {}
      lazyval.proto(Base.prototype, 'random', function () {
        return Math.random();
      });
      var o = new Base;
      var random;
      var callback;
      wru.assert('accessing the proto object does not affect instances', Base.prototype.random !== o.random);
      wru.assert('the value is the expected',
        typeof Base.prototype.random === 'function' && /^0\.\d+$/.test(o.random)
      );
      callback = Base.prototype.random;
      random = o.random;
      lazyval(Base.prototype, 'random', function () {
        return Math.random();
      });
      wru.assert('we can reassign the property', Base.prototype.random !== callback);
      lazyval(Base.prototype, 'random', function () {
        return Math.random();
      });
      delete o.random;
      wru.assert('once reached via inheritance the value is the expected', /^0\.\d+$/.test(o.random));
      wru.assert('and it is different from before', random !== o.random);
      random = Base.prototype.random;
      delete Base.prototype.random;
      wru.assert('object has its own property', /^0\.\d+$/.test(o.random));
      wru.assert('and it is different from the other', random !== o.random);
    }
  }, {
    name: 'properties instead of proto',
    test: function () {
      var o = lazyval({}, {
        a: function () {
          return 1;
        },
        b: function () {
          return 2;
        }
      });
      wru.assert(3 === o.a + o.b);
    }
  }, {
    name: 'enumerable VS non enumearble property',
    test: function () {
      var gOPD = Object.getOwnPropertyDescriptor;
      var o = {};
      lazyval(o, 'a', function () { return 1; });
      lazyval(o, 'b', function () { return 2; }, true);
      wru.assert('values are OK in both cases', o.a === 1 && o.b === 2);
      wru.assert('default is not enumerable', !gOPD(o, 'a').enumerable);
      wru.assert('but it can be enumerable', gOPD(o, 'b').enumerable);
    }
  }, {
    name: 'enumerable VS non enumearble properties',
    test: function () {
      var gOPD = Object.getOwnPropertyDescriptor;
      var o = {};
      lazyval(o, {a: function () { return 1; }});
      lazyval(o, {b: function () { return 2; }}, true);
      wru.assert('values are OK in both cases', o.a === 1 && o.b === 2);
      wru.assert('default is not enumerable', !gOPD(o, 'a').enumerable);
      wru.assert('but it can be enumerable', gOPD(o, 'b').enumerable);
    }
  }
]);
