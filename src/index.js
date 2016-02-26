class Conjurify {
  constructor(window) {
    this.Function = window ? window.Function : Function;
    this.originalCall = this.Function.prototype.call;
    this.callWithTrap = this.getTrapCall();
    this.modules = [];
    this.caches = [];
  }

  getTrapCall() {
    let prevModules;
    const self = this;
    return function trapCall(thisArg, ...args) {
      self.removeTrap(); // Avoid infinite recursion

      // Function.prototype.toString() of Chromium keeps spaces,
      // but that of Firefox normalizes spaces like `function (require,module,exports)`.
      const funcPattern = /^function\s*\(require,\s*module,\s*exports\)/;
      if (funcPattern.test(this.toString())) {
        if (prevModules !== args[4]) {
          prevModules = args[4];
          self.modules.push(args[4]);
          self.caches.push(args[5]);
        }
      }

      const retval = this.apply(thisArg, args);
      self.setTrap();
      return retval;
    };
  }

  setTrap() {
    Object.defineProperty(this.Function.prototype, 'call', {
      value: this.callWithTrap,
      configurable: true,
    });
  }

  removeTrap() {
    Object.defineProperty(this.Function.prototype, 'call', {
      value: this.originalCall,
      configurable: true,
    });
  }

  getModuleMaps() {
    return this.modules.map((module, index) => {
      const map = Object.create(null);
      for (const key of Object.keys(module)) {
        const paths = module[key][1];
        for (const path of Object.keys(paths)) {
          map[path] = this.caches[index][paths[path]];
        }
      }
      return map;
    });
  }

  getRequire() {
    const moduleMaps = this.getModuleMaps();
    return (path) => {
      for (const map of moduleMaps) {
        if (map[path] && map[path].exports) return map[path].exports;
      }
      throw new Error(`[conjurify] Cannot find module '${path}'`);
    };
  }
}

module.exports = Conjurify;
