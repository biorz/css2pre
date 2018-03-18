import { get, set, deconStruct, extend, splitFirst, splitTrim } from "./utils";

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

let cons = function(str, options) {
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
      temp.some((it, i) => {
        if (/\/\*/.test(it)) {
          this.processNotes(temp, i);
          return true;
        }
      });
      return;
    }

    let index = 0,
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

  closeMerge(arr, pre, cur) {
    let a1,
      a2,
      extract,
      ext,
      short = pre,
      long = cur,
      push,
      action = "unshift";

    a1 = splitTrim(this.processQuote(arr, pre), " ");
    a2 = splitTrim(this.processQuote(arr, cur), " ");

    if (a1.length > a2.length) {
      short = cur;
      long = pre;
      a1 = [a2, (a2 = a1)][0];
    }

    for (let i = 0; i < a1.length; i++) {
      if (a1[i] !== a2[i]) return;
    }

    extract = a1.join(" ").replace(/ &/, "");
    ext = a2
      .slice(a1.length)
      .join(" ")
      .replace(/ &/, "");
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

  processImport(arr, cur) {
    let im;
    arr[cur] = arr[cur].replace(/(@.*?;)/, str => {
      im = str;
      return "";
    });
    arr.splice(cur, 0, im);
  },

  processNotes(arr, cur) {
    let note;

    arr[cur] = arr[cur].replace(/\/\*(.*?)\*\//, (str, $1) => {
      note = "/*" + $1 + "*/";
      return "";
    });

    arr.splice(cur, 0, note);
  },

  processQuote(arr, cur) {
    let rule;
    rule = arr[cur].replace(/[^&:](:{1,2})/gi, str => {
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

  isStyle(arr, index) {
    return /:/.test(arr[index]) && !Array.isArray(arr[index + 1]);
  },

  processStyle: function(arr, index) {
    let styles = [],
      style = arr[index];

    styles.isStyle = true;
    [].push.apply(styles, splitTrim(style, /;/));

    arr[index] = styles;
  },

  isComma(arr, cur) {
    if (/@/.test(arr[cur])) return false;
    if (/,/.test(arr[cur])) return true;

    return false;
  },

  processComma(arr, cur) {
    let splitRules,
      i = 0,
      j = 0,
      lens = [],
      len,
      extract,
      isBreak,
      val;

    splitRules = splitTrim(this.processQuote(arr, cur), ",");
    splitRules = splitRules.map(it => splitTrim(it, " "));

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
    splitRules = splitRules.map(it => {
      return it.slice(i).join(" ") || "&";
    });
    val = arr[cur + 1];
    arr[cur] = extract.join(" ");
    arr[cur + 1] = [splitRules.join(","), val];
  },

  convert: function() {
    throw new Error("this action need overwrite");
  },

  to: function(type) {
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
