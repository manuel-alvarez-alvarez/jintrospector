import {LoggerFactory} from "./log";

const LOGGER = LoggerFactory.getLogger("jintrospector.visitor");

function getType(item) {
  if (item === null) {
    return 'null';
  } else if (item === undefined) {
    return 'undefined';
  } else if (item.constructor) {
    return item.constructor.name;
  } else {
    return typeof item;
  }
}

export class Options {
  constructor(objectHandle, functionHandle) {
    this.objectHandle = objectHandle;
    this.functionHandle = functionHandle;
  }
}

class ContextEntry {
  constructor(target, owner = null, property = null) {
    this.target = target;
    this.owner = owner;
    this.property = property;
  }
}

class Context {
  constructor(options) {
    this.options = options;
    this.stack = [];
    this.visited = new Set();
  }

  push(entry) {
    this.stack.push(entry);
  }

  pop() {
    return this.stack.pop();
  }

  peek() {
    return this.stack[this.stack.length - 1];
  }

  isVisited(object) {
    return this.visited.has(object);
  }

  addVisited(object) {
    this.visited.add(object);
  }
}

export class ObjectVisitor {

  visit(object, options) {
    const context = new Context(options);
    context.push(new ContextEntry(object));
    return this._visit(context);
  }

  _visit(context) {
    const entry = context.peek();
    try {
      const target = entry.target;
      if (target === null || target === undefined || context.isVisited(target)) {
        return;
      }
      context.addVisited(target);
      const type = getType(entry.target);
      const ownerType = getType(entry.owner);
      LOGGER.debug('_visit: "%s" owned by "%s" and property "%s"', type, ownerType, entry.property);
      let visitMethod;
      switch (typeof target) {
        case 'function':
          visitMethod = this._visitFunction;
          break;
        case 'object':
          visitMethod = this._visitObject;
          break;
      }
      if (visitMethod) {
        return visitMethod.call(this, context);
      } else {
        LOGGER.debug('_visit: "%s" not a function or object', type);
      }
    } finally {
      context.pop();
    }
  }

  _visitObject(context) {
    const entry = context.peek();
    const target = entry.target;
    LOGGER.debug('_visitObject');
    const keepOn = context.options.objectHandle(target, entry.owner, entry.property);
    if (keepOn) {
      Object.getOwnPropertyNames(target).forEach(key => {
        LOGGER.debug('_visitObject: property "%s"', key);
        const descriptor = Object.getOwnPropertyDescriptor(target, key);
        context.push(new ContextEntry(descriptor.value, target, key));
        this._visit(context);
      });

      const prototype = Object.getPrototypeOf(target);
      if (prototype) {
        context.push(new ContextEntry(prototype, target, 'prototype'));
        this._visit(context);
      }
    }
  }

  _visitFunction(context) {
    const entry = context.peek();
    const target = entry.target;
    LOGGER.debug('_visitFunction');
    context.options.functionHandle(target, entry.owner, entry.property);
  }
}

