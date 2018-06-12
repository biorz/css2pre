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

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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
      return;
    }

    this.shouldMerge(function (shouldMerge) {
      var cur = -1;

      while (cur < temp.length) {
        cur++;

        if (!temp[cur]) continue;

        if (_this.isSpecial(temp, cur)) {
          _this.processImport(temp, cur);
          continue;
        }

        if (_this.isNote(temp, cur)) {
          _this.processNotes(temp, cur);
          continue;
        }

        if (_this.isStyle(temp, cur)) {
          _this.processStyle(temp, cur);
          continue;
        }

        shouldMerge(temp, cur);
      }
    });

    temp.forEach(function (item, cur) {
      if (Array.isArray(temp[cur])) {
        _this.buildTree(temp[cur]);
      }
    });

    return temp;
  },
  shouldMerge: function shouldMerge(callback) {
    var _this2 = this;

    var closeRule = [];

    var push = function push(temp, cur) {
      closeRule.push(cur);

      if (closeRule.length % 2 && typeof temp[cur] !== 'string') return;else if (_typeof(temp[cur]) !== 'object') return;

      if (closeRule.length === 4) {
        _this2.closeMerge.apply(_this2, [temp].concat(closeRule));
        closeRule.splice(0, 2);
      }
    };

    callback && callback(push);
  },
  closeMerge: function closeMerge(arr, r1, s1, r2, s2) {
    if (this.isComma(arr[r1]) || this.isComma(arr[r2])) return;

    var a1 = (0, _utils.splitTrim)(this.processQuote(arr[r1]), " ");
    var a2 = (0, _utils.splitTrim)(this.processQuote(arr[r2]), " ");

    if (a1.length > a2.length) {
      a1 = [a2, a2 = a1][0];
      r1 = [r2, r2 = r1][0];
      s1 = [s2, s2 = s1][0];
    }

    var i = 0;
    for (; i < a1.length; i++) {
      if (a1[i] !== a2[i]) break;
    }

    if (!i) return;

    var selector = a2.slice(0, i).join(" ").replace(/ &/, "");

    var child = a1.slice(i).join(' ') ? [] : arr[s1];

    child = child.length ? child.concat([a2.slice(i).join(' '), arr[s2]]) : child.concat([a1.slice(i).join(' '), arr[s1], a2.slice(i).join(' '), arr[s2]]);

    arr[r1] = '';
    arr[s1] = '';
    arr[r2] = selector;
    arr[s2] = child;
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
    var nt = void 0;
    arr[cur] = arr[cur].replace(/\/\*(.*?)\*\//, function (str, $1) {
      nt = "/*" + $1 + "*/";
      return "";
    });

    arr.splice(cur, 0, nt);
  },
  processQuote: function processQuote(r) {
    if (!r.replace) {
      debugger;
    }

    var rule = void 0;
    rule = r.replace(/[^&:](:{1,2})/gi, function (str) {
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
  isSpecial: function isSpecial(arr, index) {
    if (typeof arr[index] !== 'string') return false;

    return (/@.*?;/.test(arr[index])
    );
  },
  isNote: function isNote(arr, index) {
    if (typeof arr[index] !== 'string') return false;

    return (/\/\*/.test(arr[index])
    );
  },
  isStyle: function isStyle(arr, index) {
    return !Array.isArray(arr[index]) && !Array.isArray(arr[index + 1]) && /:/.test(arr[index]);
  },
  processStyle: function processStyle(arr, index) {
    var css = arr[index].trim();

    function match(re) {
      var m = re.exec(css);
      if (!m) return;
      var str = m[0];
      css = css.slice(str.length);
      return m;
    }

    function declaration() {
      // prop
      var prop = match(/^(\*?[-#\/\*\\\w]+(\[[0-9a-z_-]+\])?)\s*/);

      if (!prop) return;
      prop = prop[0].trim();

      // :
      if (!match(/^:\s*/)) throw new Error("property missing ':'");

      // val
      var val = match(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^\)]*?\)|[^};])+)/);
      val = val ? val[0].trim() : '';
      // ;
      match(/^[;\s]*/);

      return prop + ':' + val + '';
    }

    var styles = [],
        style;
    while (style = declaration()) {
      if (style) {
        styles.push(style);
      }
    }

    styles.isStyle = true;

    arr.splice(index, 1, styles);
  },
  isComma: function isComma(str) {
    if (/@/.test(str)) return false;
    if (/,/.test(str)) return true;

    return false;
  },
  processComma: function processComma(arr, cur) {
    var splitRules = void 0,
        ahead = void 0,
        val = void 0;

    splitRules = (0, _utils.splitTrim)(this.processQuote(arr, cur), ",").map(function (it) {
      return (0, _utils.splitTrim)(it, " ");
    });

    ahead = (0, _utils.arr2)(splitRules).getEqualAhead();

    if (!ahead.length) return;

    splitRules = splitRules.map(function (it) {
      if (!it) return "&";

      return it.slice(ahead.length).join(" ").replace(" &", "");
    });

    val = arr[cur + 1];
    arr[cur] = ahead.join(" ");
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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
var arr2 = exports.arr2 = function arr2(arr) {
  var Arr2 = function () {
    function Arr2(arr) {
      _classCallCheck(this, Arr2);

      this.value = arr;
    }

    _createClass(Arr2, [{
      key: "getMinLength",
      value: function getMinLength() {
        var i = 0,
            lens = [];
        for (; i < this.value.length; i++) {
          lens.push(this.value[i].length);
        }

        return Math.min.apply(Math, lens);
      }
    }, {
      key: "getEqualAhead",
      value: function getEqualAhead() {
        var i = void 0,
            j = void 0,
            isBreak = void 0,
            len = this.getMinLength();

        for (i = 0; i < len; i++) {
          for (j = 1; j < this.value.length; j++) {
            if (this.value[j][i] !== this.value[j - 1][i]) {
              isBreak = true;
              break;
            }
          }
          if (isBreak) break;
        }

        console.log(this.value[0].slice(0, i));
        return this.value[0].slice(0, i);
      }
    }]);

    return Arr2;
  }();

  return new Arr2(arr);
};

var each = exports.each = function each(itera, fn) {
  var next = void 0;

  if (Array.isArray(itera)) {
    for (var _i = 0; _i < itera.length; _i++) {
      if (next = fn(itera[_i], _i)) {
        if (next === 'break') break;
        if (next === 'continue') continue;
      }
    }
    return;
  } else if (itera instanceof Object) {
    for (var k in itera) {
      if (next = fn(itera[i], i)) {
        if (next === 'break') break;
        if (next === 'continue') continue;
      }
    }
    return;
  }

  throw new Error('need itera data');
};

/***/ })
/******/ ]);
});
//# sourceMappingURL=css2pre.js.map