import jinstrospector from "../src/jintrospector.js";
import {Methods, Types} from "../src/predicate";

describe("Creation of the interceptor", () => {
  test("The exported library is not null", () => {
    expect(jinstrospector).not.toBeNull();
  });
});

describe("AOP interceptor", () => {

  test("The instrumenter returns an object with the same methods using prototypes", () => {
    function TestObject() {
      this.surname = 'Alvarez Alvarez';
    }

    TestObject.prototype.sayHello = function (name) {
      return `Hello ${name} ${this.surname}`;
    };

    const target = new TestObject();
    expect(target.sayHello.length).toEqual(1);
    expect(target.sayHello('Manuel')).toEqual("Hello Manuel Alvarez Alvarez");

    jinstrospector
      .forObject(target)
      .types(Types.name('TestObject'))
      .methods(Methods.name('sayHello'))
      .replaceWith(invocation => invocation.proceed() + '!!!')
      .instrument();
    expect(target.sayHello.length).toEqual(1);
    expect(target.sayHello('Manuel')).toEqual("Hello Manuel Alvarez Alvarez!!!");
  });

  test("The instrumenter returns an object with the same methods using classes", () => {
    class TestObject {
      constructor() {
        this.surname = 'Alvarez Alvarez';
      }

      sayHello(name) {
        return `Hello ${name} ${this.surname}`;
      }
    }
    const target = new TestObject();
    expect(target.sayHello.length).toEqual(1);
    expect(target.sayHello('Manuel')).toEqual("Hello Manuel Alvarez Alvarez");

    jinstrospector
      .forObject(target)
      .types(Types.name('TestObject'))
      .methods(Methods.name('sayHello'))
      .replaceWith(invocation => invocation.proceed() + '!!!')
      .instrument();
    expect(target.sayHello.length).toEqual(1);
    expect(target.sayHello('Manuel')).toEqual("Hello Manuel Alvarez Alvarez!!!");
  });
});
