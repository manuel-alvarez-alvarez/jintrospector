import { Predicate } from "./predicate.js";
import { LoggerFactory } from "./log.js";

class Type {
  constructor(kind, name) {
    this._kind = kind;
    this._name = name;
  }

  get name() {
    return this._name;
  }

  get kind() {
    return this._kind;
  }

  toString() {
    return `Type[kind=${this.kind}, name=${this.name}]`;
  }
}

export class Method {
  constructor(owner, name) {
    this._owner = owner;
    this._name = name;
  }

  get name() {
    return this._name;
  }

  get owner() {
    return this._owner;
  }

  toString() {
    return `Method[owner=${this.owner}, name=${this.name}]`;
  }
}

class Frame {
  constructor(target, owner = null, property = null) {
    this._target = target;
    this._owner = owner;
    this._property = property;
  }

  get target() {
    return this._target;
  }

  get owner() {
    return this._owner;
  }

  get property() {
    return this._property;
  }
}

class Context {
  constructor() {
    this.stack = [];
  }

  push(frame) {
    this.stack.push(frame);
  }

  pop() {
    return this.stack.pop();
  }

  peek() {
    return this.stack[this.stack.length - 1];
  }
}

class Aop {
  constructor(object, typePredicate, methodPredicate) {
    this.object = object;
    this.typePredicate = typePredicate;
    this.methodPredicate = methodPredicate;
  }

  instrument() {
    const context = new Context();
    context.push(new Frame(this.object));
    return this._visit(context);
  }

  _visit(context) {
    const frame = context.peek();
    try {
      if (Aop._getOrCreateHolder(frame.target).visited) {
        return target;
      }
      let target = frame.target;
      const type = Aop._getType(target);
      let visit;
      if (
        type.kind === "function" ||
        (type.kind === "object" && type.name === "Function")
      ) {
        visit = this._visitFunction;
      } else if (type.kind === "object") {
        visit = this._visitObject;
      }
      if (visit) {
        const holder = Aop._getOrCreateHolder(target);
        if (!holder.visited) {
          holder.visited = true;
          target = visit.call(this, context);
        }
      } else {
        Aop.LOGGER.debug(
          '_visit: "{} with type {}" not a function or object',
          target,
          this._getType(target)
        );
      }
      return target;
    } finally {
      context.pop();
    }
  }

  _visitObject(context) {
    const frame = context.peek();
    const target = frame.target;
    const type = Aop._getType(target);
    Aop.LOGGER.debug(
      '_visitObject: visiting "{}" of type "{}" owned by "{}"',
      frame.property,
      type,
      frame.owner
    );
    if (!this.typePredicate.test(type)) {
      Aop.LOGGER.debug("_visitObject: excluded");
      return target;
    }
    const descriptors = Object.getOwnPropertyDescriptors(target);
    Object.keys(descriptors)
      .filter(key => key !== "__jinstrospector__")
      .forEach(key => {
        const property = descriptors[key];
        Aop.LOGGER.debug(
          '_visitObject: "{}" is writable? "{}"',
          key,
          property.writable
        );
        if (property.writable) {
          context.push(new Frame(property.value, type, key));
          target[key] = this._visit(context);
        }
      });
    return target;
  }

  _visitFunction(context) {
    const frame = context.peek();
    const target = frame.target;
    const method = new Method(frame.owner, frame.property);
    if (!this.methodPredicate.test(method)) {
      Aop.LOGGER.debug("_visitFunction: excluded");
      return target;
    }
    Aop.LOGGER.debug(
      '_visitFunction: visiting "{}" "{}"',
      method,
      typeof target
    );
    return target;
  }

  static _getOrCreateHolder(target) {
    let holder = target.__jinstrospector__;
    if (!holder) {
      holder = { visited: false };
      target.__jinstrospector__ = holder;
    }
    return holder;
  }

  static _getType(object) {
    let name, kind;
    if (object === undefined) {
      kind = name = "undefined";
    } else if (object === null) {
      kind = name = "null";
    } else {
      const prototype = Object.prototype.toString.call(object).split(" ");
      kind = prototype[0].substring(1);
      name = prototype[1].substring(0, prototype[1].length - 1);
      if (name === "Number" && isNaN(object)) {
        name = "NaN";
      }
    }
    return new Type(kind, name);
  }
}

Aop.LOGGER = LoggerFactory.getLogger("jintrospector.AOP");

class Ast {
  constructor(code, typePredicate, methodPredicate) {
    this.code = code;
    this.typePredicate = typePredicate;
    this.methodPredicate = methodPredicate;
  }

  instrument() {
    return this.code;
  }
}

Ast.LOGGER = LoggerFactory.getLogger("jintrospector.AST");

class Builder {
  constructor() {
    this.typePredicate = Predicate.all();
    this.methodPredicate = Predicate.all();
  }

  includeTypes(typePredicate) {
    this.typePredicate = typePredicate;
  }

  includeMethods(methodPredicate) {
    this.methodPredicate = methodPredicate;
  }
}

class AopBuilder extends Builder {
  constructor(object) {
    super();
    this.object = object;
  }

  instrument() {
    return new Aop(
      this.object,
      this.typePredicate,
      this.methodPredicate
    ).instrument();
  }
}

class AstBuilder extends Builder {
  constructor(code) {
    super();
    this.code = code;
  }

  instrument() {
    return new Ast(
      this.code,
      this.typePredicate,
      this.methodPredicate
    ).instrument();
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
