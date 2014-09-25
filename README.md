lazyval
=======

[![build status](https://secure.travis-ci.org/WebReflection/lazyval.png)](http://travis-ci.org/WebReflection/lazyval)

A simple function to define lazy properties to a generic object or a prototype.

There's nothing special on this function except it solves problem with older Android phones and IE9 Mobile and it's compatible with mostly every browser or engine out there.

### examples via inheritance

```js
function A() {}
lazyval(
  A.prototype,
  'expensive',
  function () {
    // do expensive computation here
    // as example ...
    return Math.random();
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