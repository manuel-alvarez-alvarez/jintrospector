class BaseInstrumenter {
  constructor(target) {
    this.target = target;

  }


}

class Aop extends BaseInstrumenter {

  instrument() {
    Object.keys(object).forEach(key => {

    });
    return this.target;
  }

}

class Ast extends BaseInstrumenter {

  execute() {

  }
}

class Predicate {
  constructor()
}

class Builder {
  constructor(target) {
    this.target = target;
    this.type = type => true;
    this.method = method => true;
  }

  forType(matcher) {
    this.type = matcher;
  }

  forMethod(matcher) {
    this.method = matcher;
  }
}

class jintrospector {

  static instrument(target) {
    return new Builder(target);
  }
}

export default jintrospector;
