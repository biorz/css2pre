import {
  get,
  set,
  deconStruct,
  extend,
  splitFirst,
  splitTrim,
  arr2,
  each
} from "./utils";

let def = {
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
def.vendorPrefixesReg = new RegExp(
  "^(" + def.vendorPrefixesList.join("|") + ")-",
  "gi"
);

let cons = function (str, options) {
  if (!str) {
    throw new Error("converter has css string");
  }

  if (!(this instanceof cons)) {
    return new cons(str, options);
  }

  options = options || {};

  this.css = str;
  this.options = extend(def, options);

  this.tree = {};
  this.result = "";

  if (this.options.vendorMixins) {
    this.vendorMixins = {};
  }

  this.init();
};

extend(cons.prototype, {
  init() {
    this.raw = this.css;
    this.css = this.raw.replace(/\r|\n/gi, "");
    this.tree = this.buildTree();
  },

  buildTree(temp) {
    temp = temp || deconStruct(this.css, [], "{", "}");

    if (temp.isStyle) {
      return;
    }

    this.shouldMerge((shouldMerge) => {
      let cur = -1

      while(cur < temp.length) {
        cur ++

        if (!temp[cur]) continue;

        if (this.isSpecial(temp, cur)) {
          this.processImport(temp, cur);
          continue;
        }

        if (this.isNote(temp, cur)) {
          this.processNotes(temp, cur);
          continue;
        }

        if (this.isStyle(temp, cur)) {
          this.processStyle(temp, cur);
          continue;
        }

        shouldMerge(temp, cur)
      }
    })

    temp.forEach((item, cur) => {
      if (Array.isArray(temp[cur])) {
        this.buildTree(temp[cur]);
      }
    })

    return temp;
  },

  shouldMerge(callback) {
    let closeRule = []

    let push = (temp, cur) => {
      closeRule.push(cur)

      if (closeRule.length % 2 && typeof temp[cur] !== 'string') return
      else if (typeof temp[cur] !== 'object') return

      if (closeRule.length === 4) {
        this.closeMerge(temp, ...closeRule)
        closeRule.splice(0, 2)
      }
    }

    callback && callback(push)
  },

  closeMerge(arr, r1, s1, r2, s2) {
    if (this.isComma(arr[r1]) || this.isComma(arr[r2])) return

    let a1 = splitTrim(this.processQuote(arr[r1]), " ");
    let a2 = splitTrim(this.processQuote(arr[r2]), " ");

    if (a1.length > a2.length) {
      a1 = [a2, (a2 = a1)][0]
      r1 = [r2, (r2 = r1)][0];
      s1 = [s2, (s2 = s1)][0];
    }

    let i = 0;
    for (; i < a1.length; i++) {
      if (a1[i] !== a2[i]) break;
    }

    if (!i) return;

    let selector = a2
      .slice(0, i)
      .join(" ")
      .replace(/ &/, "");

    let child = a1.slice(i).join(' ')
      ? [] : arr[s1]

    child = child.length
      ? child.concat([
        a2.slice(i).join(' '),
        arr[s2]
      ])
      : child.concat([
        a1.slice(i).join(' '),
        arr[s1],
        a2.slice(i).join(' '),
        arr[s2]
      ])

    arr[r1] = ''
    arr[s1] = ''
    arr[r2] = selector
    arr[s2] = child
  },

  processImport(arr, cur) {
    let im;
    arr[cur] = arr[cur].replace(/(@.*?;)/, str => {
      im = str;
      return "";
    });

    arr.splice(cur, 0, im);
  },

  processNotes(arr, cur) {
    let nt;
    arr[cur] = arr[cur].replace(/\/\*(.*?)\*\//, (str, $1) => {
      nt = "/*" + $1 + "*/";
      return "";
    });

    arr.splice(cur, 0, nt);
  },

  processQuote(r) {
    if (!r.replace) {
      debugger
    }

    let rule;
    rule = r.replace(/[^&:](:{1,2})/gi, str => {
      return str.replace(/:{1,2}/, str => " &" + str);
    });
    rule = rule.replace(/[\w\d][#.]/gi, str => {
      return str.replace(/[#.]/, str => " &" + str);
    });
    return rule;
  },

  preProcess(arr, cur) {
    let splitRule,
      rst = [],
      temp = rst,
      i = 0,
      val = arr[cur + 1];

    if (/@|,/.test(arr[cur])) return;

    splitRule = splitTrim(arr[cur], " ");

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

  isSpecial(arr, index) {
    if (typeof (arr[index]) !== 'string') return false

    return /@.*?;/.test(arr[index])
  },

  isNote(arr, index) {
    if (typeof (arr[index]) !== 'string') return false

    return /\/\*/.test(arr[index])
  },

  isStyle(arr, index) {
    return !Array.isArray(arr[index])
      && !Array.isArray(arr[index + 1])
      && /:/.test(arr[index]);
  },

  processStyle(arr, index) {
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

    var styles = [], style;
    while (style = declaration()) {
      if (style) {
        styles.push(style);
      }
    }

    styles.isStyle = true;

    arr.splice(index, 1, styles);
  },

  isComma(str) {
    if (/@/.test(str)) return false;
    if (/,/.test(str)) return true;

    return false;
  },

  processComma(arr, cur) {
    let splitRules, ahead, val;

    splitRules = splitTrim(this.processQuote(arr, cur), ",")
      .map(it =>
        splitTrim(it, " ")
      );

    ahead = arr2(splitRules).getEqualAhead();

    if (!ahead.length) return;

    splitRules = splitRules.map(it => {
      if (!it) return "&";

      return it
        .slice(ahead.length)
        .join(" ")
        .replace(" &", "");
    });

    val = arr[cur + 1];
    arr[cur] = ahead.join(" ");
    arr[cur + 1] = [splitRules.join(","), val];
  },

  convert: function () {
    throw new Error("this action need overwrite");
  },

  to: function (type) {
    if (!converter[type]) {
      throw new Error("不支持的格式");
    }

    extend(cons.prototype, converter[type]);
    return this.convert();
  }
});

let converter = {
  less: {
    indent: "  ",

    convert() {
      let output = this.renderTree().replace(/(\n|\r\n){2}/gi, (str, $1) => {
        return $1;
      });

      return output;
    },

    renderTree(tree, indent) {
      tree = tree || this.tree;
      indent = tree.isStyle ? indent - 1 : indent || 0;

      let str = "",
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

    getIndent(size) {
      return this.indent.repeat(size);
    }
  }
};

converter.scss = converter.less;

export default cons;
