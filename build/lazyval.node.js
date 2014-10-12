/*!
Copyright (C) 2014-today by Andrea Giammarchi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
var lazyval = lazyval || (function (Object) {

  var

    hasConfigurableBug, // mostly Androidn 2.x problem

    defineProperty = Object.defineProperty,
    getPrototypeOf = Object.getPrototypeOf,
    getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor,
    hasOwnProperty = Object.hasOwnProperty,

    lazyProperty = function (object, property, callback, isPrototype) {
      // only if configurable and also
      // in case it was previously configured
      if (delete object[property]) {
        defineProperty(object, property, {
          configurable: true,
          get: function () {
            var
              self = this,
              proto = self,
              value,
              desc
            ;
            // in case it has been set as prototype
            // we don't want to set a lazy value
            // to every inherited instance
            if (isPrototype && self === object) {
              return callback;
            }
            // invoke the callback with this context
            // and the property used for this descriptor
            // plus the object where the initial lazy value
            // was defined (usually the prototype)
            value = callback.call(self, property, object);
            // in case it's a buggy engine and
            // the descriptor wasn't just copied somewhere else
            // ( ignored by all modern browsers )
            if (hasConfigurableBug && property in self) {
              // find the object with the descriptor
              while (!hasOwnProperty.call(proto, property)) {
                // in the inherited chain
                proto = getPrototypeOf(proto);
              }
              // until it's found
              desc = getOwnPropertyDescriptor(proto, property);
              // it must be removed or we cannot reconfigure it
              // even if inherited
              delete proto[property];
            }
            // in all cases redefine the property
            defineProperty(self, property, {
              // making it configurable
              configurable: true,
              value: value
            });
            // in case it's buggy and the removed descriptor
            // is not actually from the same object
            if (hasConfigurableBug && proto !== self) {
              // put it back where it was
              defineProperty(proto, property, desc);
            }
            // return the lazily assigned value
            return value;
          }
        });
      } else {
        throw new Error('unable to configure ' + property);
      }
    }
  ;

  function lazyProperties(object, properties, isPrototype) {
    for(var property in properties) {
      if (hasOwnProperty.call(properties, property)) {
        lazyProperty(object, property, properties[property], isPrototype);
      }
    }
  }

  function lazyproto(proto, property, callback) {
    return (callback ?
              lazyProperty(proto, property, callback, true) :
              lazyProperties(proto, property, true)
            ), proto;
  }

  function lazyval(object, property, callback) {
    return (callback ?
              lazyProperty(object, property, callback, false) :
              lazyProperties(object, property, false)
            ), object;
  }

  // TODO: verify IE9 Mobile as soon as possible

  if (getOwnPropertyDescriptor) {
    try {
      Object = Object.create(
        defineProperty(
          {},
          '_',
          {
            get: function () {
              return defineProperty(this, '_', {value: false})._;
            }
          }
        )
      );
      hasConfigurableBug = Object._ || Object._;
    } catch(o_O) {
      hasConfigurableBug = true;
    }

  }

  lazyval.direct = lazyval;
  lazyval.proto = lazyproto;

  return lazyval;

}(Object));
module.exports = lazyval;