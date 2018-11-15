const jinstrospector = require("../dist/jintrospector.cjs");

describe("Creation of the interceptor", () => {
  test("The exported library is not null", () => {
    expect(jinstrospector).not.toBeNull();
  });
});
