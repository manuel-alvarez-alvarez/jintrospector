export class Predicate {
  constructor(method) {
    this.method = method;
  }

  test(t) {
    return this.method.call(this, t);
  }

  static none() {
    return new Predicate(any => false);
  }

  static all() {
    return new Predicate(any => true);
  }

  not() {
    return new Predicate(t => !this.test(t));
  }

  and(predicate) {
    return new Predicate(t => this.test(t) && predicate.test(t));
  }

  or(predicate) {
    return new Predicate(t => this.test(t) || predicate.test(t));
  }
}

export class TypePredicates {

  static typeName(string) {
    return new Predicate(type => type.name === string);
  }
}


export class MethodPredicates {

  static methodName(string) {
    return new Predicate(method => method.name === string);
  }
}
