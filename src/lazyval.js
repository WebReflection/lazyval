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
    return (arguments.length === 1 ?
              lazyProperties(proto, property, true) :
              lazyProperty(proto, property, callback, true)
            ), proto;
  }

  function lazyval(object, property, callback) {
    return (arguments.length === 1 ?
              lazyProperties(object, property, false) :
              lazyProperty(object, property, callback, false)
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