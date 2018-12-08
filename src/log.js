function digestRegexp(regexp, message, callback) {
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

export class ConsoleAppender {
  append(data) {
    console.log(data.message);
  }
}

export class PatternAppender {
  constructor(appender, pattern = "${level | justify 5} (${date | iso}) [${name | justify -32}]: ${message}") {
    this.appender = appender;
    this._pattern = pattern;
  }

  append(data) {
    data.message = digestRegexp(/\$\{\s*(\w+)(?:\s*\|\s*([^\}]+))*\s*\}/g, this.pattern, match => {
      const method = match[1];
      let item = this[method](data);
      if (match[2]) {
        match[2]
          .split("|")
          .map(it => it.trim())
          .forEach(pipe => {
            const pipeArguments = pipe.split(" ").map(it => it.trim());
            const pipeMethod = pipeArguments[0];
            pipeArguments[0] = item;
            item = this[pipeMethod].apply(this, pipeArguments);
          });
      }
      return item;
    });
    return this.appender.append(data);
  }

  get pattern() {
    return this._pattern;
  }

  set pattern(pattern) {
    this._pattern = pattern;
  }

  level(data) {
    return data.level.name;
  }

  date() {
    return new Date();
  }

  name(data) {
    return data.logger.name;
  }

  message(data) {
    return data.message;
  }

  iso(date) {
    return date.toISOString();
  }

  justify(message, value) {
    const amount = parseInt(value);
    const padding = Array(Math.abs(amount) + 1).join(" ");
    if (amount > 0) {
      return (message + padding).substring(0, padding.length);
    }
    return (padding + message).slice(-padding.length);
  }
}

export class Logger {
  constructor(parent, name, level, appender) {
    this._parent = parent;
    this._name = name;
    this._level = level;
    this._appender = appender;
  }

  log(level, message, ...args) {
    if (this.level.isLoggable(level)) {
      let finalMessage = message;
      if (args.length > 0) {
        let argIndex = 0;
        finalMessage = digestRegexp(/\%(\d*)([s|j])/g, message, match => {
          const index = match[1].length > 0 ? parseInt(match[1]) : argIndex++;
          const value = args[index];
          if (value === null) {
            return 'null';
          } else if (value === undefined) {
            return 'undefined';
          }
          const format = match[2];
          switch (format) {
            case 's':
              return value.toString();
            case 'j':
              return JSON.stringify(value);
            default:
              throw new Error(`Pattern "${format}" not recognized`);
          }
        });
      }
      this.appender.append({message: finalMessage, level: level, logger: this});
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
}

export class LoggerFactory {
}

LoggerFactory._loggers = {
  "": new Logger(null, "root", Level.ERROR, new PatternAppender(new ConsoleAppender()))
};
LoggerFactory.getRootLogger = function () {
  return LoggerFactory._loggers[""];
};
LoggerFactory.getLogger = function (name) {
  let logger = LoggerFactory._loggers[name];
  if (!logger) {
    logger = new Logger(LoggerFactory._loggers[""], name);
    LoggerFactory._loggers[name] = logger;
  }
  return logger;
};
