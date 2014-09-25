lazyval
=======

[![build status](https://secure.travis-ci.org/WebReflection/lazyval.png)](http://travis-ci.org/WebReflection/lazyval)

A simple function to define lazy properties to a generic object or a prototype.

There's nothing special on this function except it solves problem with older Android phones and IE9 Mobile and it's compatible with mostly every browser or engine out there, [feel free to test it](http://webreflection.github.io/lazyval/test/).


### function signature

```js
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
```


### lazy examples via object

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


### lazy examples via inheritance

```js
function A() {}
lazyval(
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