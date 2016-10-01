page.anken.view = function() {
  return [
    mlb.headers("案件検索画面", "[検索条件] 案件を選びましょう。"),
    m("div", {class: "section"}, [
      m("div", {class: "row"}, [
        page.anken.vm.items.map(function(item, i) {
          return [
            m("div", {class: "input-field col s" + item.cols}, [
              m("input", {id: item.key, type: "text", onchange: m.withAttr("value", item.value), value: item.value()}),
              m("label", item.text),
            ]),
          ];
        }),
      ]),
      m("div", {class: "row right-align"}, [
        m("a", {class: "btn", onclick: page.anken.vm.clear}, "Clear"),
        m("a[href='/anken?" + page.anken.vm.get_cond_url() + "']", {class: "btn", config: m.route}, "Search"),
      ]),
    ]),
    m("div", {class: "right-align"}, [m("span", "新たに案件を作成する場合は"), m("a", {href: "/anken/register", config: m.route}, "こちら"), m("span", "から。")]),
    m("div", {class: "section"}, [
      (function() {
        if (!page.anken.vm.ret() || page.anken.vm.ret().length == 0 || page.anken.vm.hidden) return;
        //TODO can scroll to here after redraw?
        return [
          m("table", {class: "responsive-table striped centered", config: mlb.ctx.scroll_to}, [
            m("thead", [
              m("tr", [
                page.anken.vm.ret_col_headers.map(function(col, i) {
                  return m("th", col);
                }),
                m("th", ""),
                m("th", ""),
              ]),
            ]),
            m("tbody", [
              page.anken.vm.ret().map(function(row, i) {
                //TODO return to prev page after route
                return m("tr", [
                  page.anken.vm.ret_cols.map(function(col, i) {
                    return m("td", row[col]);
                  }),
                  m("td", m(mlb.util.format("a[href='/anken/detail/{0}']", row["anken_id"]), {class: "btn-floating", config: m.route}, m("i", {class: "material-icons"}, "receipt"))),
                  m("td", m(mlb.util.format("a[href='/anken/ver/{0}']", row["anken_id"]), {class: "btn-floating yellow", config: m.route}, m("i", {class: "material-icons grey-text text-darken-3"}, "trending_flat"))),
                ]);
              }),
              //TODO escape from color style...
              m("tr", {class: "grey darken-4"}, [
                page.anken.vm.ret_cols.map(function(col, i) {
                  return m("td", "");
                }),
                m("td", ""),
                m("td", ""),
              ]),
            ]),
          ]),
          m("ul", {class: "right-align"}, [
            m("li", m("a", {class: "btn", onclick: page.anken.vm.hide_ret}, "Hide")),
          ]),
        ];
      })(),
      (function() {
        if (!page.anken.vm.ret() || page.anken.vm.ret().length == 0 || !page.anken.vm.hidden) return;
        return [
          m("ul", {class: "right-align"}, [
            m("li", m("a", {class: "btn", onclick: page.anken.vm.show_ret}, "Show")),
          ]),
        ];
      })()
    ]),
  ];
};
page.anken.vm = (function() {
  var vm = {};
  vm.init = function() {
    //TODO keep search cond and show ret after come back from next page
    //TODO show created_at and created_by
    vm.items = [
      {text: "案件名", cols: "6", key: "anken_name", value: m.prop(m.route.param("anken_name") || ""), whereope: "like"},
      {text: "状態", cols: "3", key: "status", value: m.prop(m.route.param("anken_status") || ""), whereope: "eq"},
      {text: "お客様ID", cols: "4", key: "customer_id", value: m.prop(m.route.param("customer_id") || ""), whereope: "like", autocomp_target: "customer"},
      {text: "お客様名", cols: "6", key: "customer_name", value: m.prop(m.route.param("customer_name") || ""), whereope: "like", autocomp_target: "customer"},
      {text: "担当者ID", cols: "4", key: "user_id", value: m.prop(m.route.param("user_id") || ""), whereope: "like", autocomp_target: "user"},
      {text: "担当者名", cols: "6", key: "user_name", value: m.prop(m.route.param("user_name") || ""), whereope: "like", autocomp_target: "user"},
    ];
    vm.get_cond_url = function() {
      var ret = "";
      Lazy(vm.items).each(function(item, i) {
        ret += ret ? "&" : "";
        ret += item.key + "=" + item.value();
      });
      return ret;
    };
    vm.ret = m.prop([]);
    vm.ret_cols = [ "anken_id", "anken_name", "customer_id", "user_id", "status", "note"];
    vm.ret_col_headers = [ "案件ID", "案件名", "お客様ID", "担当者ID", "状態", "備考"];
    vm.clear = function() {
      mlb.clear_item_values(vm.items);
    };
    vm.hidden = false;
    vm.hide_ret = function() {
      vm.hidden = true;
    };
    vm.show_ret = function() {
      vm.hidden = false;
    };
    vm.search = function() {
      if (mlb.is_progressing) return false;
      var data = {};
      data.Target = "anken";
      data.Params = [];
      Lazy(vm.items).each(function(item) {
        if (!item.value()) return;
        var param = {
          Key: item.key,
          Whereope: item.whereope,
          Value: item.value(),
        };
        data.Params.push(param);
      });
      var exec = function() {
        mlb.progressing(true);
        m.request({
          method: "post",
          url: "/anken/api/search",
          data: data
        }).then(function(ret) {
          if (mlb.validate_response(ret)) {
            if (!ret.Body.Data || ret.Body.Data.length == 0) {
              mlb.util.info_msg("検索結果は0件でした");
            } else {
              vm.ret(ret.Body.Data);
              vm.hidden = false;
            }
          }
        });
      };
        //TODO confirm even when return from next page?
//      if (data.Params.length == 0) {
//        mlb.util.confirm_callback = exec;
//        mlb.util.confirm_msg("条件を指定せずに検索すると時間が掛かる場合があります。続行しますか?");
//      } else {
//        exec();
//      }
        exec();
    };

    if (0 <= m.route().indexOf("=")) {
      vm.search(); 
    }

    mlb.set_mst_autocomp(vm.items);
  };
  return vm;
})();
page.anken.controller = function() {
  page.anken.vm.init();
};
