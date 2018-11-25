import {
  log,
  setOut,
  getOut,
  setErr,
  getErr,
  setLevel,
  getLevel,
  ALL,
  INFO,
  DEBUG,
  ERROR,
  OFF
} from "../src/log.js";

describe("The log facility works", () => {
  const logged = [];
  const out = getOut();

  beforeEach(() => {
    setOut(m => logged.push(m));
  });

  afterEach(() => {
    logged.length = 0;
    setOut(out);
  });

  test("The default level in the tests is ALL", () => {
    expect(getLevel()).toEqual(ALL.value);
  });

  test("The library will log statements to the console", () => {
    log(INFO, "Hello!");
    expect(logged.length).toEqual(1);
    expect(logged[0]).toEqual("Hello!");
  });

  test("The library can use {} as place holders", () => {
    log(INFO, "Hello {}!", "Manuel");
    expect(logged.length).toEqual(1);
    expect(logged[0]).toEqual("Hello!");
  });
});
