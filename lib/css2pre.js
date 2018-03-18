(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("css2pre", [], factory);
	else if(typeof exports === 'object')
		exports["css2pre"] = factory();
	else
		root["css2pre"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _css2pre = __webpack_require__(1);

var _css2pre2 = _interopRequireDefault(_css2pre);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _css2pre2.default;
module.exports = exports['default'];

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils = __webpack_require__(2);

var def = {
  vendorPrefixesList: ["-moz", "-o", "-ms", "-webkit"],
  indentSymbol: "  ",
  indentSize: 1,
  selectorSeparator: ", ",
  blockFromNewLine: false,
  blockSeparator: "\n",
  vendorMixins: false,
  nameValueSeparator: ": ",
  target: "less"
};
def.vendorPrefixesReg = new RegExp("^(" + def.vendorPrefixesList.join("|") + ")-", "gi");

var cons = function cons(str, options) {
  if (!str) {
    throw new Error("converter has css string");
  }

  if (!(this instanceof cons)) {
    return new cons(str, options);
  }

  options = options || {};

  this.css = str;
  this.options = (0, _utils.extend)(def, options);

  this.tree = {};
  this.result = "";

  if (this.options.vendorMixins) {
    this.vendorMixins = {};
  }

  this.init();
};

(0, _utils.extend)(cons.prototype, {
  init: function init() {
    this.raw = this.css;
    this.css = this.raw.replace(/\r|\n/gi, "");
    this.tree = this.buildTree();
  },
  buildTree: function buildTree(temp) {
    var _this = this;

    temp = temp || (0, _utils.deconStruct)(this.css, [], "{", "}");

    if (temp.isStyle) {
      temp.some(function (it, i) {
        if (/\/\*/.test(it)) {
          _this.processNotes(temp, i);
          return true;
        }
      });
      return;
    }

    var index = 0,
        pre = -1,
        cur = -1;

    // 666
    while (cur < temp.length - 1) {
      cur++;

      if (!temp[cur]) {
        continue;
      }
      if (Array.isArray(temp[cur])) {
        continue;
      }

      if (/@.*?;/.test(temp[cur])) {
        this.processImport(temp, cur);
        continue;
      }
      if (/\/\*/.test(temp[cur])) {
        this.processNotes(temp, cur);
        continue;
      }

      if (this.isStyle(temp, cur)) {
        this.processStyle(temp, cur);
        pre = -1;
        continue;
      }

      if (temp[cur + 1]) {
        if (this.isComma(temp, cur)) {
          this.processComma(temp, cur);
        }
        this.preProcess(temp, cur);
        if (~pre) {
          this.closeMerge(temp, pre, cur);
        }
      }

      pre = cur;
    }

    while (index < temp.length) {
      if (Array.isArray(temp[index])) {
        this.buildTree(temp[index]);
      }
      index++;
    }

    return temp;
  },
  closeMerge: function closeMerge(arr, pre, cur) {
    var a1 = void 0,
        a2 = void 0,
        extract = void 0,
        ext = void 0,
        short = pre,
        long = cur,
        push = void 0,
        action = "unshift";

    a1 = (0, _utils.splitTrim)(this.processQuote(arr, pre), " ");
    a2 = (0, _utils.splitTrim)(this.processQuote(arr, cur), " ");

    if (a1.length > a2.length) {
      short = cur;
      long = pre;
      a1 = [a2, a2 = a1][0];
    }

    for (var i = 0; i < a1.length; i++) {
      if (a1[i] !== a2[i]) return;
    }

    extract = a1.join(" ").replace(/ &/, "");
    ext = a2.slice(a1.length).join(" ").replace(/ &/, "");
    push = ext.length ? [ext, arr[long + 1]] : arr[long + 1];

    if (short < long) {
      arr[cur] = arr[pre];
      arr[cur + 1] = arr[pre + 1];
      action = "push";
    }
    arr[pre] = "";
    arr[pre + 1] = "";

    [][action].apply(arr[cur + 1], push);
  },
  processImport: function processImport(arr, cur) {
    var im = void 0;
    arr[cur] = arr[cur].replace(/(@.*?;)/, function (str) {
      im = str;
      return "";
    });
    arr.splice(cur, 0, im);
  },
  processNotes: function processNotes(arr, cur) {
    var note = void 0;

    arr[cur] = arr[cur].replace(/\/\*(.*?)\*\//, function (str, $1) {
      note = "/*" + $1 + "*/";
      return "";
    });

    arr.splice(cur, 0, note);
  },
  processQuote: function processQuote(arr, cur) {
    var rule = void 0;
    rule = arr[cur].replace(/[^&:](:{1,2})/gi, function (str) {
      return str.replace(/:{1,2}/, function (str) {
        return " &" + str;
      });
    });
    rule = rule.replace(/[\w\d][#.]/gi, function (str) {
      return str.replace(/[#.]/, function (str) {
        return " &" + str;
      });
    });
    return rule;
  },
  preProcess: function preProcess(arr, cur) {
    var splitRule = void 0,
        rst = [],
        temp = rst,
        i = 0,
        val = arr[cur + 1];

    if (/@|,/.test(arr[cur])) return;

    splitRule = (0, _utils.splitTrim)(arr[cur], " ");

    if (!splitRule.length) return;

    for (; i < splitRule.length - 1; i++) {
      temp[0] = splitRule[i];
      temp = temp[1] = [];
    }
    temp[0] = splitRule[i];
    temp[1] = val;

    arr[cur] = rst[0];
    arr[cur + 1] = rst[1];
  },
  isStyle: function isStyle(arr, index) {
    return (/:/.test(arr[index]) && !Array.isArray(arr[index + 1])
    );
  },


  processStyle: function processStyle(arr, index) {
    var styles = [],
        style = arr[index];

    styles.isStyle = true;
    [].push.apply(styles, (0, _utils.splitTrim)(style, /;/));

    arr[index] = styles;
  },

  isComma: function isComma(arr, cur) {
    if (/@/.test(arr[cur])) return false;
    if (/,/.test(arr[cur])) return true;

    return false;
  },
  processComma: function processComma(arr, cur) {
    var splitRules = void 0,
        i = 0,
        j = 0,
        lens = [],
        len = void 0,
        extract = void 0,
        isBreak = void 0,
        val = void 0;

    splitRules = (0, _utils.splitTrim)(this.processQuote(arr, cur), ",");
    splitRules = splitRules.map(function (it) {
      return (0, _utils.splitTrim)(it, " ");
    });

    for (; i < splitRules.length; i++) {
      lens.push(splitRules[i].length);
    }
    len = Math.min.apply(Math, lens);

    for (i = 0; i < len; i++) {
      for (j = 1; j < splitRules.length; j++) {
        if (splitRules[j][i] !== splitRules[j - 1][i]) {
          isBreak = true;
          break;
        }
      }
      if (isBreak) break;
    }

    if (!i) return;

    extract = splitRules[0].slice(0, i);
    splitRules = splitRules.map(function (it) {
      return it.slice(i).join(" ") || "&";
    });
    val = arr[cur + 1];
    arr[cur] = extract.join(" ");
    arr[cur + 1] = [splitRules.join(","), val];
  },


  convert: function convert() {
    throw new Error("this action need overwrite");
  },

  to: function to(type) {
    if (!converter[type]) {
      throw new Error("不支持的格式");
    }

    (0, _utils.extend)(cons.prototype, converter[type]);
    return this.convert();
  }
});

var converter = {
  less: {
    indent: "  ",

    convert: function convert() {
      var output = this.renderTree().replace(/(\n|\r\n){2}/gi, function (str, $1) {
        return $1;
      });

      return output;
    },
    renderTree: function renderTree(tree, indent) {
      tree = tree || this.tree;
      indent = tree.isStyle ? indent - 1 : indent || 0;

      var str = "",
          i = 0;

      if (indent && !tree.isStyle) {
        str += "\n" + this.getIndent(indent - 1) + "{\n";
      }

      for (; i < tree.length; i++) {
        if (!tree[i]) continue;

        if (Array.isArray(tree[i])) {
          str += this.renderTree(tree[i], indent + 1);
          continue;
        }

        tree[i] = tree[i].trim();

        str += this.getIndent(indent);

        if (tree.isStyle) {
          str += tree[i] + ";";
        } else {
          str += tree[i];
        }

        str += "\n";
      }

      if (indent && !tree.isStyle) {
        str += this.getIndent(indent - 1) + "}\n";
      }

      return str;
    },
    getIndent: function getIndent(size) {
      return this.indent.repeat(size);
    }
  }
};

converter.scss = converter.less;

exports.default = cons;
module.exports = exports["default"];

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var extend = exports.extend = function extend(a, b) {
  if (!(a instanceof Object) || !(b instanceof Object)) {
    throw new Error("a or b is not object");
  }

  for (var k in b) {
    if (b.hasOwnProperty(k)) {
      a[k] = b[k];
    }
  }

  return a;
};

var splitFirst = exports.splitFirst = function splitFirst(str, reg) {
  var idx = str.search(reg);

  if (~idx) {
    return [str.slice(0, idx), str.slice(idx + 1)];
  }

  return str;
};

var splitTrim = exports.splitTrim = function splitTrim(str, reg) {
  return str.replace(/\r|\n/, "").split(reg).map(function (val) {
    return val.trim();
  }).filter(function (val) {
    return val !== "";
  });
};

var set = exports.set = function set(obj, keys, val, isOverwrite) {
  keys.split && (keys = keys.split("."));
  var i = 0,
      l = keys.length,
      t = obj,
      x = void 0;

  for (; i < l - 1; ++i) {
    x = t[keys[i]];
    t = t[keys[i]] = x instanceof Object || !(x === undefined || isOverwrite) ? x : {};
  }

  return t[keys[i]] = val;
};

var get = exports.get = function get(obj, keys, val) {
  keys.split && (keys = keys.split("."));
  var i = 0,
      l = keys.length,
      t = obj;

  for (; i < l - 1; ++i) {
    t = t[keys[i]];
    if (!(t instanceof Object)) {
      return undefined;
    }
  }

  return t[keys[i]];
};

var _deconStruct2 = function _deconStruct(str, tree, start, end) {
  if (!tree) exports.deconStruct = _deconStruct2 = function deconStruct(str) {
    return _deconStruct2(str, [], "{", "}");
  };

  var idx, val;

  while (~(idx = str.search(new RegExp(start + "|" + end)))) {
    val = str.slice(0, idx);
    val && tree.push(val);

    if (str[idx] === start) {
      tree.push([]);
      str = str.slice(idx + 1);
      str = _deconStruct2(str, tree[tree.length - 1], start, end);
    } else if (str[idx] === end) {
      return str.slice(idx + 1);
    }
  }

  str && tree.push(str);

  return tree;
};
exports.deconStruct = _deconStruct2;

/***/ })
/******/ ]);
});
//# sourceMappingURL=css2pre.js.map