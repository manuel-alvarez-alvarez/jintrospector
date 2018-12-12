import {Predicate} from "./util/predicate";

export class Type {
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

export class Builder {
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
    return this;
  }
}
