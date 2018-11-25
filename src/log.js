class Level {
  constructor(value, adapter) {
    this.value = value;
    this.adapter = adapter;
  }

  isLoggable(level) {
    return this.value <= level;
  }

  log(pattern, ...args) {
    const message =
      args.length > 0 ? Level._replaceAll(pattern, args) : pattern;
    this.adapter().call(message);
  }

  static _replaceAll(pattern, ...args) {
    let message = "";
    const expr = /\{(\d*)\}/g;
    let match,
      patternIndex = 0,
      argIndex = 0;
    while ((match = expr.exec(pattern))) {
      message += pattern.substring(patternIndex, match.index);
      patternIndex = match.index + match[0].length;
      message += match[1].length > 0 ? args[match[1]] : args[argIndex++];
    }
    if (patternIndex < pattern.length) {
      message += pattern.substring(patternIndex);
    }
    return message;
  }
}

export function log(level, pattern, ...args) {
  if (level.isLoggable(LEVEL)) {
    level.log(pattern, ...args);
  }
}

let OUT = console.log;
let ERR = console.error || console.log;
let NULL = () => {};

export const ALL = new Level(Number.MAX_SAFE_INTEGER, getOut);
export const DEBUG = new Level(100, getOut);
export const INFO = new Level(0, getOut);
export const ERROR = new Level(-100, getErr);
export const OFF = new Level(Number.MIN_SAFE_INTEGER, getNull);

let LEVEL =
  process &&
  process.env &&
  ["test", "development"].indexOf(process.env.NODE_ENV) >= 0
    ? ALL.value
    : OFF.value;

export function setLevel(level) {
  LEVEL = level.value;
}

export function getLevel() {
  return LEVEL;
}

export function setOut(stream) {
  OUT = stream;
}

export function setErr(stream) {
  ERR = stream;
}

export function setNull(stream) {
  NULL = stream;
}

export function getOut() {
  return OUT;
}

export function getErr() {
  return ERR;
}

export function getNull() {
  return NULL;
}
