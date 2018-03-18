export let extend = function(a, b) {
  if (!(a instanceof Object) || !(b instanceof Object)) {
    throw new Error("a or b is not object");
  }

  for (let k in b) {
    if (b.hasOwnProperty(k)) {
      a[k] = b[k];
    }
  }

  return a;
};

export let splitFirst = function(str, reg) {
  let idx = str.search(reg);

  if (~idx) {
    return [str.slice(0, idx), str.slice(idx + 1)];
  }

  return str;
};

export let splitTrim = function(str, reg) {
  return str
    .replace(/\r|\n/, "")
    .split(reg)
    .map(val => val.trim())
    .filter(val => val !== "");
};

export let set = function(obj, keys, val, isOverwrite) {
  keys.split && (keys = keys.split("."));
  let i = 0,
    l = keys.length,
    t = obj,
    x;

  for (; i < l - 1; ++i) {
    x = t[keys[i]];
    t = t[keys[i]] =
      x instanceof Object || !(x === undefined || isOverwrite) ? x : {};
  }

  return (t[keys[i]] = val);
};

export let get = function(obj, keys, val) {
  keys.split && (keys = keys.split("."));
  let i = 0,
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

export let deconStruct = (str, tree, start, end) => {
  if (!tree)
    deconStruct = function(str) {
      return deconStruct(str, [], "{", "}");
    };

  var idx, val;

  while (~(idx = str.search(new RegExp(`${start}|${end}`)))) {
    val = str.slice(0, idx);
    val && tree.push(val);

    if (str[idx] === start) {
      tree.push([]);
      str = str.slice(idx + 1);
      str = deconStruct(str, tree[tree.length - 1], start, end);
    } else if (str[idx] === end) {
      return str.slice(idx + 1);
    }
  }

  str && tree.push(str);

  return tree;
};
