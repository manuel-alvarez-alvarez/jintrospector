export class Predicate {

  constructor(method) {
    this.method = method;
  }

  test(t) {
    return method.call(this, t);
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
}
