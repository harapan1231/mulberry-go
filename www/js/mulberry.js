var mlb = {};

mlb.headers = function(name, msg) {
  //TODO msg -> msg_id for multilang
  return [
    m("div", mlb.breadcrumbs()),
    m("h5", {class: "brown darken-3"}, name),
    m("div", {class: "row"}, msg),
  ];
};

mlb.breadcrumbs = function() {
  var dirs = m.route().split("/");
  var crnt;
  var ret = [];
  Lazy(dirs).each(function(dir, i) {
    if (!dir) return;
    var elm;
    var sep = m("span", " -> ");
    var dir_name = dir.split("?")[0];
    if (!crnt) {
      crnt = "/" + dir;
      elm = [m("a", {href: "/", config: m.route}, "home"), sep, m("a", {href: crnt, config: m.route}, dir_name)];
    } else {
      crnt = crnt + "/" + dir;
      if (dir == "ver" || dir == "detail") {
        elm = [sep, m("span", dir_name)];
      } else {
        elm = [sep, m("a", {href: crnt, config: m.route}, dir_name)];
      }
    }
    ret.push(elm);
  });
  return ret;
}

mlb.render = function(vm) {
  m.mount(document.getElementById("page"), {view: vm.view, controller: vm.controller});
  mlb.redraw();
};

mlb.route = function(root, route) {
  m.route(document.getElementById("page"), root, route);
}

mlb.redraw = function(callback) {
  m.redraw(true);
  $("select").material_select();
  if (callback && typeof callback === "function") {
    callback();
  }
};

mlb.validate_required = function(items) {
  var ret = true;
  Lazy(items).each(function(item) {
    if (!("required" in item) || !item.required) return;
    if (!item.value()) {
      mlb.util.error_msg(item.text + " を入力してください");
      ret = false;
    }
  });
  return ret;
};

mlb.is_progressing = false;
mlb.progressing = function(bln) {
  mlb.is_progressing = bln;
  mlb.redraw();
};

mlb.validate_response = function(res, msg) {
  mlb.progressing(false);
  if (res.Err) {
    mlb.util.error_msg(res.Err);
    return false;
  } else {
    if (msg) {
      mlb.util.info_msg(msg);
    }
    return true;
  }
};

mlb.clear_item_values = function(items) {
  Lazy(items).each(function(item) {
    if ("value" in item) {
      if (typeof item.value === "function") {
        item.value("");
      } else {
        item.value = "";
      }
    };
  });
};

mlb.ctx = {};

mlb.ctx.scroll_to = function(elm, is_initialized, ctx) {
  if (is_initialized) return;
  $(window).scrollTop($(elm).position().top - 120);
};

mlb.set_mst_autocomp = function(items) {
  m.request({
    method: "get",
    url: "/settings/api/search",
    data: {
      Target: mlb.util.get_key_list(items, "autocomp_target", true).join(","),
    }
  }).then(function(ret) {
    if (!mlb.validate_response(ret)) return false;
    var callback = function(response_body) {
      Lazy(items).each(function(item) {
        if (!"autocomp_target" in item || !item.autocomp_target) return;
        var mst = Lazy(ret.Body).findWhere({Target: item.autocomp_target});
        if (!mst) return;
        var list = mlb.util.get_key_list(mst.Data, item.key, true);
        new Awesomplete(document.getElementById(item.key), {list: list, minChars: 1});
      });
    };
    mlb.redraw(function(){callback(ret.Body)});
  });
};
