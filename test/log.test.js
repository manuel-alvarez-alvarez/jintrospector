import { LoggerFactory, PatternAppender, Level } from "../src/log.js";
import { ConsoleAppender } from "../src/log";

describe("The log facility works", () => {
  const logger = LoggerFactory.getRootLogger();
  const defaultAppender = logger.appender;

  const messages = [];

  beforeEach(() => {
    logger.appender = new PatternAppender({
      append: data => messages.push(data.message)
    });
  });

  afterEach(() => {
    messages.length = 0;
    logger.appender = defaultAppender;
  });

  test("The default level in the tests is ERROR", () => {
    expect(logger.level).toEqual(Level.ERROR);

    logger.log(Level.INFO, "Hello!");
    expect(messages.length).toEqual(0);
  });

  test("The console appender just works", () => {
    new ConsoleAppender().append({ message: "Hello!" });
  });

  test("The pattern appender just works", () => {
    const items = [];
    new PatternAppender({ append: data => items.push(data.message) }).append({
      message: "Hello!",
      logger: logger,
      level: Level.ERROR
    });

    expect(items.length).toEqual(1);
    expect(items[0]).toContain("Hello!");
    expect(items[0]).toContain(Level.ERROR.name);
  });

  test("The logger will log statements to the chosen appender", () => {
    logger.log(Level.ERROR, "Hello!");
    expect(messages.length).toEqual(1);
    expect(messages[0]).toContain("Hello!");
  });

  test("The logger can use %s as place holders", () => {
    logger.log(Level.ERROR, "Hello %s!", "Manuel");
    expect(messages.length).toEqual(1);
    expect(messages[0]).toContain("Hello Manuel!");

    logger.log(Level.ERROR, "Hello %s", "Manuel");
    expect(messages.length).toEqual(2);
    expect(messages[1]).toContain("Hello Manuel");

    logger.log(Level.ERROR, "%s Manuel!", "Hello");
    expect(messages.length).toEqual(3);
    expect(messages[2]).toContain("Hello Manuel!");
  });

  test("The logger can use %j as place holders for JSON values", () => {
    logger.log(Level.ERROR, "Hello %j!", {a: "1", b: "2"});
    expect(messages.length).toEqual(1);
    expect(messages[0]).toContain("Hello {\"a\":\"1\",\"b\":\"2\"}!");
  });

  test("The logger will use the polymorphic methods just fine", () => {
    logger.error("Hello %s!", "Manuel");
    logger.info("Hello %s!", "Manuel");
    logger.debug("Hello %s!", "Manuel");

    expect(messages.length).toEqual(1);
    expect(messages[0]).toContain("Hello Manuel!");
  });

  test("The logger can use {} with indexes as place holders", () => {
    logger.log(Level.ERROR, "Hello %1s %0s!", "Manuel", "Mr.");
    expect(messages.length).toEqual(1);
    expect(messages[0]).toContain("Hello Mr. Manuel!");
  });

  test("The logger factory can create new loggers", () => {
    const customLogger = LoggerFactory.getLogger("custom");
    expect(customLogger.name).toEqual("custom");

    customLogger.log(Level.ERROR, "Hello %1s %0s!", "Manuel", "Mr.");
    expect(messages.length).toEqual(1);
  });

  test("The new loggers can change its own level", () => {
    const customLogger = LoggerFactory.getLogger("custom");
    customLogger.level = Level.OFF;
    customLogger.log(Level.ERROR, "Hello");
    expect(messages.length).toEqual(0);

    logger.log(Level.ERROR, "Hello");
    expect(messages.length).toEqual(1);
  });

  test("The new loggers can change its own pattern", () => {
    const customLogger = LoggerFactory.getLogger("custom");
    customLogger.appender.pattern = "${message}";
    customLogger.level = Level.ERROR;
    customLogger.log(Level.ERROR, "Hello %1s %0s!", "Manuel", "Mr.");
    expect(messages.length).toEqual(1);
    expect(messages[0]).toEqual("Hello Mr. Manuel!");
  });

  test("The new loggers can change its own appender", () => {
    const customLogger = LoggerFactory.getLogger("custom");
    const otherMessages = [];
    customLogger.level = Level.ALL;
    customLogger.appender = new PatternAppender({
      append: data => otherMessages.push(data.message)
    });
    customLogger.log(Level.ERROR, "Hello");
    expect(otherMessages.length).toEqual(1);
    otherMessages.length = 0;

    logger.log(Level.ERROR, "Hello");
    expect(messages.length).toEqual(1);
  });
});
