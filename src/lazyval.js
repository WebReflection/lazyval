var lazyval = lazyval || (function (Object) {

  var

    hasConfigurableBug, // mostly Android 2.x problem

    defineProperty = Object.defineProperty,
    getPrototypeOf = Object.getPrototypeOf,
    getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor,
    hasOwnProperty = Object.hasOwnProperty,

    lazyProperty = function (object, property, callback, enumerable, isProto) {
      // only if configurable and also
      // in case it was previously configured
      if (delete object[property]) {
        defineProperty(object, property, {
          enumerable: enumerable,
          configurable: true,
          get: function get() {
            var
              self = this,
              proto = self,
              value,
              desc
            ;
            // in case it has been set as prototype
            // we don't want to set a lazy value
            // to every inherited instance
            if (isProto && self === object) {
              return callback;
            }
            // invoked twice in IE9 Mobile (yes, only mobile)
            // which will not consider the new descriptor until "next tick"
            if (hasShenanigans) {
              // if there is a descriptor
              desc = getOwnPropertyDescriptor(this, property);
              // and it's different from this one
              if (desc && desc.get !== get) {
                // we can just return its value instead
                // of going through the whole process
                return desc.get();
              }
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
            // verifying IE9 Mobile behavior
            defineProperty(self, property, descriptorValue(value, enumerable));
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
    },

    // used to spot a bug in IE9 Mobile (yes, only mobile)
    i = 0,
    tmp,
    descriptorValue,
    hasShenanigans

  ;

  function lazyProperties(object, properties, enumerable, isProto) {
    for(var property in properties) {
      if (hasOwnProperty.call(properties, property)) {
        lazyProperty(
          object,
          property,
          properties[property],
          enumerable,
          isProto
        );
      }
    }
  }

  function lazyproto(proto, property, callback, enumerable) {
    return lazy(proto, property, callback, enumerable, true);
  }

  function lazyval(object, property, callback, enumerable) {
    return lazy(object, property, callback, enumerable, false);
  }

  function lazy(object, property, callback, enumerable, isProto) {
    return (typeof callback === 'function' ?
              lazyProperty(object, property, callback, !!enumerable, isProto) :
              lazyProperties(object, property, !!callback, isProto)
            ), object;
  }

  try {
    tmp = Object.create(
      defineProperty(
        {},
        '_',
        {
          get: function () {
            // IE9 Mobile (yes, only mobile) will call this getter twice
            ++i;
            return defineProperty(this, '_', {value: false})._;
          }
        }
      )
    );
    hasConfigurableBug = tmp._ || tmp._;
  } catch(o_O) {
    hasConfigurableBug = true;
  }

  hasShenanigans = 1 < i;

  // every browser but IE9 Mobile (yes, only mobile)
  descriptorValue = hasShenanigans ?
    function (value, enumerable) {
      return {
        enumerable: enumerable,
        configurable: true,
        get: function () {
          return value;
        }
      };
    } :
    function (value, enumerable) {
      return {
        enumerable: enumerable,
        configurable: true,
        value: value
      };
    }
  ;

  lazyval.direct = lazyval;
  lazyval.proto = lazyproto;

  return lazyval;

}(Object));