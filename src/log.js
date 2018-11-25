export function log(level, messageFn) {
  if (level.isLoggable(CURRENT_LEVEL)) {
    level.log(messageFn);
  }
}

class Level {
  constructor(value, adapter) {
    this.value = value;
    this.adapter = adapter;
  }

  isLoggable(level) {
    return this.value <= level;
  }

  log(messageFn) {
    this.adapter.call(this, messageFn.call(this));
  }
}

export const ALL = new Level(Number.MAX_SAFE_INTEGER, console.log);
export const DEBUG = new Level(100, console.log);
export const INFO = new Level(0, console.log);
export const ERROR = new Level(-100, console.error || console.log);
export const OFF = new Level(Number.MIN_SAFE_INTEGER, () => {
});

export let CURRENT_LEVEL = (process && process.env && process.env.NODE_ENV === 'development' ? ALL : OFF);
