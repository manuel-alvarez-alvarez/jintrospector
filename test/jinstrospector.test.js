import jinstrospector from "../src/jintrospector.js";
import { LoggerFactory, Level } from "../src/log";
import {MethodPredicates, StringPredicates, TypePredicates} from "../src/predicate";

describe("Creation of the interceptor", () => {
  test("The exported library is not null", () => {
    expect(jinstrospector).not.toBeNull();
  });

  test("Instrument an object works", () => {
    expect(jinstrospector.forObject(window).instrument()).not.toBeNull();
  });

  test("Instrument a program works", () => {
    expect(jinstrospector.forCode("function sum(a, b) { return a = b }; sum(1, 2);").instrument()).not.toBeNull();
  });
});

describe("AOP interceptor", () => {



  test("The instrumenter returns an object with the same methods", () => {
    function TestObject() {}
    TestObject.prototype.sayHello = function() {
      return "Hello!!!";
    };

    const object = new TestObject();
    const instrumented = jinstrospector.forObject(object)
      .includeTypes(TypePredicates.typeName('TestObject'))
      .replaceMethods(MethodPredicates.methodName('sayHello'), () => 'Goodbye!!!')
      .instrument();

    expect(instrumented.sayHello()).toEqual("Goodbye!!!");
  });
});
