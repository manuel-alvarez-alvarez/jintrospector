import {Predicate} from './predicate.js';
import {log, DEBUG, INFO, ERROR} from './log.js';

class Type {
  constructor(name) {
    this.name = name;
  }

  static for(object) {
    return new Type()
  }
}

class Method {
  constructor(name) {
    this.name = name;
  }

  static for(method) {
    return new Type()
  }
}

class Aop {

  constructor(target, type, method) {
    this.target = target;
    this.type = type;
    this.method = method;
  }

  _visitObject(object) {
    log(DEBUG, () => `Visiting object of type ${typeof object}`);
    const descriptors = Object.getOwnPropertyDescriptors(object);
    Object.keys(descriptors).forEach(key => {
      const property = descriptors[key];
      if (property.writable) {
        const value = property.value;
        if (Function.isPrototypeOf(value)) {
          const instrumented = this._visitFunction(value);
        } else if (Object.isPrototypeOf(value)) {
          const instrumented = this._visitObject(value);
        }
      }
    });
    return object;
  }

  _visitFunction(method, owner) {

  }

  instrument() {
    return this._visitObject(this.target);
  }
}

class Ast {

  constructor(target, type, method) {
    this.target = target;
    this.type = type;
    this.method = method;
  }

  instrument() {
    return this.target;
  }
}

class Builder {
  constructor(target) {
    this.target = target;
    this.method = Predicate.none();
    this.type = Predicate.none();
  }

  include(typePredicate, methodPredicate) {
    this.type = typePredicate;
    this.method = methodPredicate;
  }

  instrument() {
    return (String.isPrototypeOf(this.target) ?
        new Ast(this.target, this.type, this.method) :
        new Aop(this.target, this.type, this.method)
    ).instrument();
  }
}

export default class {
  static target(target) {
    return new Builder(target);
  }
};

