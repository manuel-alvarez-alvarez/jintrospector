export class Level {
  constructor(name, value) {
    this._name = name;
    this._value = value;
  }

  isLoggable(level) {
    return this.value >= level.value;
  }

  get value() {
    return this._value;
  }

  get name() {
    return this._name;
  }
}

Level.ALL = new Level("ALL", Number.MAX_SAFE_INTEGER);
Level.DEBUG = new Level("DEBUG", 100);
Level.INFO = new Level("INFO", 0);
Level.ERROR = new Level("ERROR", -100);
Level.OFF = new Level("OFF", Number.MIN_SAFE_INTEGER);

export class Logger {
  constructor(parent, name, level, pattern, appender) {
    this._parent = parent;
    this._name = name;
    this._level = level;
    this._pattern = pattern;
    this._appender = appender;
  }

  log(level, message, ...args) {
    if (this.level.isLoggable(level)) {
      const messageWithArgs =
        args.length === 0
          ? message
          : this._injectArguments.apply(
              this,
              Array.prototype.splice.call(arguments, 1)
            );
      const finalMessage = this._composeMessage(messageWithArgs);
      this.appender(finalMessage);
    }
  }

  info(message, ...args) {
    const newArguments = Array.prototype.slice.call(arguments);
    newArguments.unshift(Level.INFO);
    this.log.apply(this, newArguments);
  }

  debug(message, ...args) {
    const newArguments = Array.prototype.slice.call(arguments);
    newArguments.unshift(Level.DEBUG);
    this.log.apply(this, newArguments);
  }

  error(message, ...args) {
    const newArguments = Array.prototype.slice.call(arguments);
    newArguments.unshift(Level.ERROR);
    this.log.apply(this, newArguments);
  }

  _composeMessage(message) {
    return this._withRegexp(/%(-?\d*)?(\w+)/g, this.pattern, match => {
      let result;
      switch (match[2]) {
        case "level":
          result = this.level.name;
          break;
        case "date":
          result = new Date().toISOString();
          break;
        case "name":
          result = this.name;
          break;
        case "message":
          result = message;
          break;
      }
      return this._justify(match[1] ? parseInt(match[1]) : 0, result);
    });
  }

  _justify(value, message) {
    if (value === 0) {
      return message;
    }
    return message;
  }

  _injectArguments(message, ...args) {
    let argIndex = 0;
    return this._withRegexp(
      /\{(\d*)\}/g,
      message,
      match => args[match[1].length > 0 ? parseInt(match[1]) : argIndex++]
    );
  }

  _withRegexp(regexp, message, callback) {
    let result = "";
    let match,
      start = 0;
    while ((match = regexp.exec(message))) {
      result += message.substring(start, match.index);
      start = match.index + match[0].length;
      result += callback(match);
    }
    if (start < message.length) {
      result += message.substring(start);
    }
    return result;
  }

  get parent() {
    return this._parent;
  }

  get name() {
    return this._name;
  }

  get level() {
    return this._level || this.parent.level;
  }

  set level(level) {
    this._level = level;
  }

  get appender() {
    return this._appender || this.parent.appender;
  }

  set appender(appender) {
    this._appender = appender;
  }

  get pattern() {
    return this._pattern || this.parent.pattern;
  }

  set pattern(pattern) {
    this._pattern = pattern;
  }
}

export class LoggerFactory {}

LoggerFactory._loggers = {
  "": new Logger(
    null,
    "root",
    Level.ERROR,
    "%5level (%date) [%-10name]: %message",
    console.log
  )
};
LoggerFactory.getRootLogger = function() {
  return LoggerFactory._loggers[""];
};
LoggerFactory.getLogger = function(name) {
  let logger = LoggerFactory._loggers[name];
  if (!logger) {
    logger = new Logger(LoggerFactory._loggers[""], name);
    LoggerFactory._loggers[name] = logger;
  }
  return logger;
};
