import jinstrospector from "../src/jintrospector.js";

describe("Creation of the interceptor", () => {
  test("The exported library is not null", () => {
    expect(jinstrospector).not.toBeNull();
  });

  test("Instrument an object works", () => {
    expect(jinstrospector.target(window)).not.toBeNull();
  });

  test("Instrument a program works", () => {
    expect(jinstrospector.target('function sum(a, b) { return a = b }; sum(1, 2);')).not.toBeNull();
  })
});

describe("AOP interceptor", () => {
  test("The instrumenter returns a proxy with the same methods", () => {
    let object = {
      sayHello: function() {
        return "Hello!!!"
      }
    };
    expect(jinstrospector.target(object).instrument().sayHello()).toEqual("Hello!!!");
  });
});
