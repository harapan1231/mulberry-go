mlb.util = {}

mlb.util.str_reverse = function(str) {
  var s = str.split(""),
    len = s.length,
    halfIndex = Math.floor(len / 2) - 1,
    tmp;
  for (var i = 0; i <= halfIndex; i++) {
    tmp = s[len - i - 1];
    s[len - i - 1] = s[i];
    s[i] = tmp;
  }
  return s.join("");
};

mlb.util.get_toast_msg = function(msg, css) {
  var timestamp = " (at " + mlb.util.get_time() + ")";
  if (css) {
    return "<span><b class='" + css + "'>" + msg + "</b>" + timestamp + "</span>";
  } else {
    return msg + timestamp;
  }
};

mlb.util.info_msg = function(msg) {
  Materialize.toast(mlb.util.get_toast_msg(msg), 4000, "rounded");
};

mlb.util.warn_msg = function(msg) {
  Materialize.toast(mlb.util.get_toast_msg(msg), 4000);
};

mlb.util.error_msg = function(msg) {
  Materialize.toast(mlb.util.get_toast_msg(msg, "deep-orange-text text-darken-3"), 6000);
};

mlb.util.confirming = false;
mlb.util.confirm_callback;
mlb.util.confirm_msg = function(msg) {
  if (mlb.util.confirming) return false;
  //TODO disabled
  var toast_msg = "<span>" + msg + "<a class='btn deep-orange darken-3 right' onclick='this.disabled = true;mlb.util.confirm_callback();this.classList.add(\"grey\");this.textContent = \"Accept\";'>OK</a></span>";
  var toast_callback = function() {
    mlb.util.confirm_callback = null;
    mlb.util.confirming = false;
  };
  mlb.util.confirming = true;
  Materialize.toast(toast_msg, 4000, "", toast_callback);
};

mlb.util.get_date = function() {
  var now = new Date(),
    m = now.getMonth() + 1,
    d = now.getDate();
  return (mlb.util.lpad(m, 2, "0") + "/" + mlb.util.lpad(d, 2, "0"));
};

mlb.util.get_time = function() {
  var now = new Date(),
    h = now.getHours(),
    m = now.getMinutes(),
    s = now.getSeconds();
  return (mlb.util.lpad(h, 2, "0") + ":" + mlb.util.lpad(m, 2, "0") + ":" + mlb.util.lpad(s, 2, "0"));
};

mlb.util.get_datetime = function() {
  return (mlb.util.get_date() + " " + mlb.util.get_time());
};

mlb.util.lpad = function(str, len, chr) {
  var block = (chr) ? chr : " ";
  return (block.repeat(len) + str).substr(("" + str).length);
};

mlb.util.is_small = function() {
  return ($("header.navbar-fixed").css("content") == "small");
};

mlb.util.get_key_list = function(map_list, key, omits_null_item) {
  return mlb.util.filter_by_key(map_list, key).map(function(map, i) {
    if (key in map) {
      if (!omits_null_item || map[key]) {
        return map[key];
      }
    }
  });
};

mlb.util.filter_by_key = function(map_list, key) {
  return map_list.filter(function(map, i) {
    return key in map;
  });
};

mlb.util.format = function(str) {
  var args = Array.prototype.slice.call(arguments, 1);
  var ret = str;
  for (var i = 0; i < args.length; i++) {
    if (typeof args[i] != "undefined") {
      ret = ret.replace(new RegExp("\\{" + i + "\\}", "g"), args[i]);
    }
  }
  return ret;
};
