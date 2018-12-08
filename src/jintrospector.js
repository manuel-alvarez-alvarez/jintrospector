import {Predicate} from "./predicate.js";
import {LoggerFactory} from "./log.js";
import {ObjectVisitor, Options} from "./visitor";

class Type {
  constructor(type, name) {
    this.type = type;
    this.name = name;
  }
}

export class Method {
  constructor(owner, name) {
    this.owner = owner;
    this.name = name;
  }
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
    return this.object;
  }

  _visitObject(target) {
    const type = Aop._getType(target);
    Aop.LOGGER.debug('_visitObject: "%j"', type);
    return this.typePredicate.test(type);
  }

  _visitFunction(fn, owner, name) {
    const ownerType = Aop._getType(owner);
    const method = new Method(ownerType, name);
    Aop.LOGGER.debug('_visitFunction: "%j"', method);
    this.replacements.forEach((replacement, predicate) => {
      if (predicate.test(method)) {
        owner[name] = replacement;
      }
    });
  }

  static _getType(object) {
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
}

Aop.LOGGER = LoggerFactory.getLogger("jintrospector.aop");

class Ast {
  constructor(code, typePredicate, remplacements) {
    this.code = code;
    this.typePredicate = typePredicate;
    this.remplacements = remplacements;
  }

  instrument() {
    return this.code;
  }
}

Ast.LOGGER = LoggerFactory.getLogger("jintrospector.ast");

class Builder {
  constructor() {
    this.typePredicate = Predicate.all();
    this.replacements = new Map();
  }

  includeTypes(typePredicate) {
    this.typePredicate = typePredicate;
    return this;
  }

  replaceMethods(methodPredicate, replacement) {
    this.replacements.set(methodPredicate, replacement);
    return this;
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
    return new Ast(this.code, this.typePredicate, this.methodPredicate).instrument();
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
