import {LoggerFactory} from "./util/log.js";
import {ObjectVisitor, Options} from "./util/visitor";
import {Method, Type, Builder} from './common';

function makeFunction(arity, fn) {
  const params = [];
  for (let i = 0; i < arity; i++) {
    params.push('_' + i);
  }
  return new Function(
    'fn',
    'return function (' + params.join(', ') + ') { return fn.apply(this, arguments); }'
  )(fn);
}

function getType(object) {
  let classname;
  if (object === null) {
    classname = 'null';
  } else if (object === undefined) {
    classname = 'undefined';
  } else {
    classname = object.constructor ? object.constructor.name : null;
  }
  return new Type(typeof object, classname);
}

class Aop {
  constructor(object, typePredicate, methodPredicate, replacement) {
    this.object = object;
    this.typePredicate = typePredicate;
    this.methodPredicate = methodPredicate;
    this.replacement = replacement;
  }

  instrument() {
    const visitor = new ObjectVisitor();
    visitor.visit(this.object, new Options(this._visitObject.bind(this), this._visitFunction.bind(this)));
    return this.object;
  }

  _visitObject(target) {
    const type = getType(target);
    Aop.LOGGER.debug('_visitObject: "%j"', type);
    return this.typePredicate.test(type);
  }

  _visitFunction(target, owner, name) {
    const ownerType = getType(owner);
    const method = new Method(ownerType, name);
    Aop.LOGGER.debug('_visitFunction: "%j"', method);
    if (this.methodPredicate.test(method)) {
      const replacement = this.replacement;
      owner[name] = makeFunction(target.length, function () {
        return replacement.call(this, new Invocation(target, arguments, this))
      });
    }
  }
}

Aop.LOGGER = LoggerFactory.getLogger("jintrospector.aop");

class AopBuilder extends Builder {
  constructor(object) {
    super();
    this.object = object;
  }

  instrument() {
    return new Aop(this.object, this.typePredicate, this.methodPredicate, this.replacement).instrument();
  }
}

class Invocation {
  constructor(method, args, context) {
    this.method = method;
    this.args = args;
    this.context = context;
  }

  proceed() {
    return this.method.apply(this.context, this.args);
  }
}

export default class {
  static forObject(object) {
    return new AopBuilder(object);
  }
}
