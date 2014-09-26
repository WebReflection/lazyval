lazyval
=======

[![build status](https://secure.travis-ci.org/WebReflection/lazyval.png)](http://travis-ci.org/WebReflection/lazyval)

A simple way to define lazy properties to a generic object or a prototype.

Compatible with mostly every browser or engine out there: [feel free to test it](http://webreflection.github.io/lazyval/test/).


### function signature

```js
lazyval({}, 'key', function () { return value; });
// returns the generic Object
lazyval(
  // where to define the lazy property
  // can be object or a prototype
  generic:Object,
  // the property name
  property:String,
  // the callback to invoke once
  // the generic object or any inherited one
  // will access this property
  callback:Function
  // this callback will be invoked inside the getter as:
  //  callback.call(this, property, generic);
  // and its returned value will be assigned
);


lazyval({}, {
  key1: function () { return value1; },
  key2: function () { return value2; }
});
// for multiple lazy properties at once
lazyval(
  // where to define the lazy property
  // can be object or a prototype
  generic:Object,
  // a key/value pair where value
  // will be function to lazily invoke
  // once accessed through properties
  properties:Object
);
```


### lazy examples via object and properties

```js
var o = lazyval({}, {
  uid: function () {
    return 'object:' + Math.round(
      Math.random() * Date.now()
    );
  }
});

// only once needed ...
o.uid; // object:27364279
```


### lazy examples via inheritance and 3 arguments

```js
function A() {}

// note lazyval.proto
lazyval.proto(
  A.prototype,
  'expensive',
  function () {
    // do expensive computation here
    // as example ...
    return Math.random();
    // return the value to lazily assign
    // as property name of the object
  }
);

var
  a1 = new A,
  a2 = new A
;

a1.expensive; // 0.346731865
a1.expensive === a1.expensive; // true
a2.expensive === a1.expensive; // false
a2.expensive; // 0.874216789

// clean up
delete a1.expensive;
a1.expensive; // 0.4567891
a1.expensive === a1.expensive; // true
```

#### lazyval.direct VS lazyval.proto
The difference is that `lazyval.proto` will not actually replace at runtime the property to the prototype object itself but only to inheriting isntances. `lazyval.direct` is somehow more greedy here because an access to the prototype object could affect all inherited instances.

For classes and prototypal inheritance, `lazyval.proto` is recommended.

