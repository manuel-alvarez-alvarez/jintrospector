'use strict';

class BaseInstrumenter {
  constructor(target) {
    this.target = target;
    this.type = t => true;
    this.method = m => true;
  }

  forType(matcher) {
    this.type = matcher;
  }

  forMethod(matcher) {
    this.method = matcher;
  }
}



class Aop extends BaseInstrumenter {

  execute() {
    Object.keys(object).forEach(key => {

    });
    return this.target;
  }

}

class Ast extends BaseInstrumenter {

  execute() {

  }
}

class jintrospector {

  static instrument(target) {
    return String.isPrototypeOf(target) ? new Ast(target) : new Aop(target);
  }
}

module.exports = jintrospector;
