(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.jintrospector = factory());
}(this, (function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  var BaseInstrumenter =
  /*#__PURE__*/
  function () {
    function BaseInstrumenter(target) {
      _classCallCheck(this, BaseInstrumenter);

      this.target = target;

      this.type = function (t) {
        return true;
      };

      this.method = function (m) {
        return true;
      };
    }

    _createClass(BaseInstrumenter, [{
      key: "forType",
      value: function forType(matcher) {
        this.type = matcher;
      }
    }, {
      key: "forMethod",
      value: function forMethod(matcher) {
        this.method = matcher;
      }
    }]);

    return BaseInstrumenter;
  }();

  var Type =
  /*#__PURE__*/
  function () {
    function Type(name) {
      _classCallCheck(this, Type);

      this.name = name;
    }

    _createClass(Type, null, [{
      key: "for",
      value: function _for(object) {
        return new Type();
      }
    }]);

    return Type;
  }();

  var Method =
  /*#__PURE__*/
  function () {
    function Method(name) {
      _classCallCheck(this, Method);

      this.name = name;
    }

    _createClass(Method, null, [{
      key: "for",
      value: function _for(method) {
        return new Type();
      }
    }]);

    return Method;
  }();

  var Aop =
  /*#__PURE__*/
  function (_BaseInstrumenter) {
    _inherits(Aop, _BaseInstrumenter);

    function Aop() {
      _classCallCheck(this, Aop);

      return _possibleConstructorReturn(this, _getPrototypeOf(Aop).apply(this, arguments));
    }

    _createClass(Aop, [{
      key: "execute",
      value: function execute() {
        Object.keys(object).forEach(function (key) {});
        return this.target;
      }
    }]);

    return Aop;
  }(BaseInstrumenter);

  var Ast =
  /*#__PURE__*/
  function (_BaseInstrumenter2) {
    _inherits(Ast, _BaseInstrumenter2);

    function Ast() {
      _classCallCheck(this, Ast);

      return _possibleConstructorReturn(this, _getPrototypeOf(Ast).apply(this, arguments));
    }

    _createClass(Ast, [{
      key: "execute",
      value: function execute() {}
    }]);

    return Ast;
  }(BaseInstrumenter);

  var jintrospector =
  /*#__PURE__*/
  function () {
    function jintrospector() {
      _classCallCheck(this, jintrospector);
    }

    _createClass(jintrospector, null, [{
      key: "instrument",
      value: function instrument(target) {
        return String.isPrototypeOf(target) ? new Ast(target) : new Aop(target);
      }
    }]);

    return jintrospector;
  }();

  return jintrospector;

})));
