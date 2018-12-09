import {Predicate} from "./predicate.js";
import {LoggerFactory} from "./log.js";
import {ObjectVisitor, Options} from "./visitor";

class Type {
  constructor(type, name) {
    this.type = type;
    this.name = name;
  }
}

class Method {
  constructor(owner, name) {
    this.owner = owner;
    this.name = name;
  }
}

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
  constructor(object, typePredicate, replacements) {
    this.object = object;
    this.typePredicate = typePredicate;
    this.replacements = replacements;
  }

  instrument() {
    const visitor = new ObjectVisitor();
    visitor.visit(this.object, new Options(this._visitObject.bind(this), this._visitFunction.bind(this)));
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
    this.replacements.forEach((replacement, predicate) => {
      if (predicate.test(method)) {
        owner[name] = makeFunction(target.length, function () {
          return replacement.call(this, new Invocation(target, arguments, this))
        });
      }
    });
  }
}

Aop.LOGGER = LoggerFactory.getLogger("jintrospector.aop");

class Ast {
  constructor(code, typePredicate, remplacements) {
    this.code = code;
    this.typePredicate = typePredicate;
    this.remplacements = remplacements;
  }

  instrument() {

  }
}

Ast.LOGGER = LoggerFactory.getLogger("jintrospector.ast");

class Builder {
  constructor() {
    this.typePredicate = Predicate.all();
    this.methodPredicate = Predicate.all();
    this.replacement = null;
  }

  types(typePredicate) {
    this.typePredicate = typePredicate;
    return this;
  }

  methods(methodPredicate) {
    this.methodPredicate = methodPredicate;
    return this;
  }

  replaceWith(replacement) {
    this.replacement = replacement;
  }
}

class AopBuilder extends Builder {
  constructor(object) {
    super();
    this.object = object;
  }

  instrument() {
    return new Aop(this.object, this.typePredicate, this.replacements).instrument();
  }
}

class AstBuilder extends Builder {
  constructor(code) {
    super();
    this.code = code;
  }

  instrument() {
    return new Ast(this.code, this.typePredicate, this.replacements).instrument();
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

  static forCode(code) {
    return new AstBuilder(code);
  }
}
