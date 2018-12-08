import {ObjectVisitor, Options} from "../src/visitor";
import {Level, LoggerFactory} from "../src/log";

LoggerFactory.getLogger('jintrospector.visitor').level = Level.ALL;

describe("The visitor class works", () => {

  test("The visitor works for ES6 classes", () => {

    class TestClass {

      sayHello() {
        return "Hello!!!";
      }
    }

    class OtherClass {

      greet() {
        return "Hello!!!";
      }
    }

    class ExtendedTestClass extends TestClass {

      constructor() {
        super();
        this.otherClass = new OtherClass();
      }

      sayGoodbye() {
        return "Goodbye!!!";
      }
    }

    const visitedObjects = new Set();
    const visitedMethods = new Set();
    const instance = new ExtendedTestClass();
    const visitor = new ObjectVisitor();
    visitor.visit(instance, new Options(
      (object, owner, property) => {
        visitedObjects.add(object);
        return true;
      },
      (method, owner, name) => {
        visitedMethods.add(name);
        return true;
      }
    ));

    expect(visitedObjects).toContain(instance);
    expect(visitedObjects).toContain(instance.otherClass);

    expect(visitedMethods).toContain('sayHello');
    expect(visitedMethods).toContain('sayGoodbye');
    expect(visitedMethods).toContain('greet');
  });

  test("The visitor works for regular prototype classes", () => {
    function TestClass() {
    }

    TestClass.prototype.sayHello = function () {
      return "Hello!!!";
    };

    function OtherClass() {
    }

    OtherClass.prototype.greet = function () {
      return "Hello!!!";
    };

    function ExtendedTestClass() {
      this.otherClass = new OtherClass();
    }
    ExtendedTestClass.prototype = Object.create( TestClass.prototype );
    ExtendedTestClass.prototype.sayGoodbye = function () {
      return "Goodbye!!!";
    };

    const visitedObjects = new Set();
    const visitedMethods = new Set();
    const instance = new ExtendedTestClass();
    const visitor = new ObjectVisitor();
    visitor.visit(instance, new Options(
      (object, owner, property) => {
        visitedObjects.add(object);
        return true;
      },
      (method, owner, name) => {
        visitedMethods.add(name);
        return true;
      }
    ));

    expect(visitedObjects).toContain(instance);
    expect(visitedObjects).toContain(instance.otherClass);

    expect(visitedMethods).toContain('sayHello');
    expect(visitedMethods).toContain('sayGoodbye');
    expect(visitedMethods).toContain('greet');
  });


});
