import jinstrospector from "../src/jintrospector.js";
import { LoggerFactory, Level } from "../src/log";

LoggerFactory.getRootLogger().level = Level.ALL;

describe("Creation of the interceptor", () => {
  test("The exported library is not null", () => {
    expect(jinstrospector).not.toBeNull();
  });

  test("Instrument an object works", () => {
    expect(jinstrospector.forObject(window).instrument()).not.toBeNull();
  });

  test("Instrument a program works", () => {
    expect(
      jinstrospector
        .forCode("function sum(a, b) { return a = b }; sum(1, 2);")
        .instrument()
    ).not.toBeNull();
  });
});

describe("AOP interceptor", () => {
  test("The instrumenter returns a proxy with the same methods", () => {
    let object = {
      sayHello: function() {
        return "Hello!!!";
      }
    };
    expect(
      jinstrospector
        .forObject(object)
        .instrument()
        .sayHello()
    ).toEqual("Hello!!!");
  });
});
