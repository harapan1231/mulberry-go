page.a_ver.view = function() {
  return [
    mlb.headers(page.a_ver.vm.page_name, page.a_ver.vm.page_comment),
    m("div", {class: "section"}, [
      //TODO edit header according to page_id
      m("div", [
        m("table", [
          m("tr", [
            {name: "案件", value: page.a_ver.vm.anken_id},
            {name: "バージョン", value: page.a_ver.vm.anken_ver},
            {name: "フェーズ", value: page.a_ver.vm.phase_id},
          ].map(function(item, i) {
            if (!item.value) return;
            return m("td", item.name + "：" + item.value)
          })),
        ]),
      ]),
      //TODO switch position to keep header fixed by javascript
      page.a_ver.vm.ret.length == 0 ? "" : 
      m("table", {class: "responsive-table striped centered"}, [
        m("thead", [
          m("tr", [
            page.a_ver.vm.cols.map(function(col, i) {
              //TODO move if stmt to upper
              if (col.key == "__hash__") return;
              if (!page.a_ver.vm.ret || page.a_ver.vm.ret.length == 0) return;
              return m("th", col.caption);
            }),
            m("th", ""),
            m("th", ""),
            m("th", ""),
            m("th", ""),
            page.a_ver.vm.phase_id ? "" :
            m("th", ""),
          ]),
        ]),
        m("tbody", [
          page.a_ver.vm.ret.map(function(row, i) {
            return m("tr", [
              page.a_ver.vm.cols.map(function(col, j) {
                //TODO null exists? 
                if (col.key == "__hash__") return;
                if (!col.input_type) {
                  if (col.key == "sort_order") {
                    row[col.key] = i + 1;
                  }
                  return m("td", row[col.key] ? row[col.key] : "-");
                }
                //TODO set width
                return m("td", m("input", {type: col.input_type, maxlength: col.max_len ? col.max_len : "", onchange: m.withAttr("value", row[col.key]), value: row[col.key]()}));
              }),
              //TODO icons?
              m("td", [m("a", {class: "btn-floating btn-small", onclick: page.a_ver.vm.up}, "up")]),
              m("td", [m("a", {class: "btn-floating btn-small", onclick: page.a_ver.vm.down}, "dn")]),
              m("td", [m("a", {class: "btn-floating btn-small", onclick: page.a_ver.vm.copy}, m("i", {class: "material-icons"}, "call_split"))]),
              m("td", [m("a", {class: "btn-floating btn-small", onclick: page.a_ver.vm.delete}, m("i", {class: "material-icons"}, "not_interested"))]),
              page.a_ver.vm.phase_id ? "" :
              (function() {
                var url;
                if (page.a_ver.vm.anken_ver) {
                  url = mlb.util.format("/anken/ver/{0}/{1}/{2}", page.a_ver.vm.anken_id, page.a_ver.vm.anken_ver, row["phase_id"]);
                } else {
                  url = mlb.util.format("/anken/ver/{0}/{1}", page.a_ver.vm.anken_id, row["anken_ver"]);
                }
                return m("td", m("a[href='" + url + "']", {class: "btn-floating yellow", config: m.route}, m("i", {class: "material-icons grey-text text-darken-3"}, "trending_flat")));
              })(),
            ]);
          }),
        ]),
      ]),
      page.a_ver.vm.page_id == "ver" ? "" :
      m("div", {class: "row right-align"}, [
        m("a", {class: "btn-floating btn-small", onclick: page.a_ver.vm.add}, m("i", {class: "material-icons"}, "playlist_add")),
      ]),
      page.a_ver.vm.ret.length == 0 ? "" :
      m("div", {class: "row right-align"}, [
        page.a_ver.vm.page_id == "ver" ? "" : m("a", {class: "btn lime darken-3", onclick: page.a_ver.vm.save}, "Calc"),
        m("a", {class: "btn deep-orange darken-2", onclick: page.a_ver.vm.save}, "Save"),
      ]),
    ]),
  ];
};
page.a_ver.vm = (function() {
  var vm = {};
  vm.init = function() {
    vm.anken_id = m.route.param("anken_id");
    vm.anken_ver = m.route.param("anken_ver");
    vm.phase_id = m.route.param("phase_id");
    vm.page_id = "ver";
    vm.page_id += vm.anken_ver ? "_phase" : "";
    vm.page_id += vm.phase_id ? "_func" : "";
    vm.ret = [];
    vm.conv_ret_to_mprop = function(ret, cols) {
      if (mlb.validate_response(ret)) {
        vm.ret.length = 0;
        Lazy(ret.Body.Data).each(function(row, i) {
          var r = {};
          Lazy(row).each(function(val, key) {
            var col = Lazy(cols).findWhere({"key": key});
            if (col && col.input_type) {
              r[key] = m.prop(val);
            } else {
              r[key] = val;
            }
          });
          r["__hash__"] = vm.get_row_hash(row);
          vm.ret.push(r);
        });
      }
    };
    vm.get_row_hash = function(row) {
      var ret = "";
      Lazy(row).each(function(val, key) {
        if (key == "__hash__") return;
        var v = (typeof val === "function") ? val() : val;
        ret += key + "=" + v + ",";
      });
      return ret;
    };
    //TODO rename function
    vm.add = function() {
      var r = {};
      r["anken_id"] = vm.anken_id;
      //TODO use page_id
      if (vm.anken_ver) r["anken_ver"] = vm.anken_ver;
      if (vm.phase_id) r["phase_id"] = vm.anken_ver;
      Lazy(vm.cols).each(function(col, i) {
        if (!col || !col.input_type) {
          if (col.key == "sort_order") {
            r[col.key] = vm.ret.length + 1;
          } else {
            r[col.key] = "";
          }
          return;
        }
        switch(col.input_type) {
          case "number":
            r[col.key] = m.prop("0"); break;
          case "date":
            //TODO default value?
            r[col.key] = m.prop("20160124"); break;
          default:
            r[col.key] = m.prop(""); break;
        }
      });
      vm.ret.push(r);
    };
    //TODO define functions
    vm.up = function() {console.log("hello");};
    vm.down = function() {console.log("world");};
    //TODO rename function
    vm.save = function() {
      var data = [];
      Lazy(vm.ret).each(function(row, i) {
        var method, hash;
        if (row["__hash__"]) {
          hash = vm.get_row_hash(row);
          if (hash == row["__hash__"]) return;
          method = "update";
        } else {
          method = "add";
        }
        var q = {};
        //TODO page_id? or target?
        q.Target = "anken_" + vm.page_id;
        q.Method = method;
        q.Params = [];
        //TODO omit keys used in where clause
        Lazy(row).each(function(val, key) {
          if (key == "__hash__") return;
          var col = Lazy(vm.cols).findWhere({key: key});
          if (col && !col.input_type && !val) return;
          var p = {};
          p.Key = key;
          if (typeof val === "function") {
            p.Value = val();
          } else {
            p.Value = val;
          }
          //TODO edit if necessary
          p.Whereope = "";
          q.Params.push(p);
        });
        if (q.Method == "update") {
          var wheres = [
            {Key: "anken_id", Value: vm.anken_id, Whereope: "eq",},
            {Key: "anken_ver", Value: vm.anken_ver, Whereope: "eq",},
            {Key: "phase_id", Value: vm.phase_id || row["phase_id"], Whereope: "eq",},
            {Key: "func_id", Value: vm.page_id == "ver_phase_func" && row["func_id"], Whereope: "eq",},
          ];
          Lazy(wheres).each(function(val, i) {
            if (!val.Value) return;
            Lazy(q.Params).each(function(v, j) {
              //TODO why undefinec exists?
              if (v && v.Key == val.Key && !v.Whereope) {
                q.Params.splice(j, 1);
                return;
              }
            });
            var param = {
              Key: val.Key,
              Value: val.Value,
              Whereope: val.Whereope,
            };
            q.Params.push(param);
          });
        }
        data.push(q);
      });
      //TODO delete logger
      Lazy(data).each(function(x, i) {
        console.log("", x);
        Lazy(x.Params).each(function(y, j) {
          console.log("::", y);
        });
      });
      if (data.length == 0) return;
      m.request({
        method: "post",
        url: "/anken/ver/api/save",
        data: data,
      }).then(function(ret) {
        if (mlb.validate_response(ret)) {
          vm.search();
        }
      })
    };

    vm.ver = {};
    vm.ver.page_name = "案件バージョン画面";
    vm.ver.page_comment = "バージョンを選びましょう。";
    //TODO term_to is null -> mobile table looks ugly
    vm.ver.cols = [
      {caption: "バージョン", key: "anken_ver", visible: true, input_type: ""},
      {caption: "名前", key: "anken_ver_name", visible: true, input_type: "text", max_len: 40},
      {caption: "担当者ID", key: "user_id", visible: true, input_type: "text", max_len: 20},
      {caption: "開始", key: "term_from", visible: true, input_type: "date"},
      {caption: "終了", key: "term_to", visible: true, input_type: "date"},
      {caption: "状態", key: "status", visible: true, input_type: "number", max_len: 1},
      {caption: "備考", key: "note", visible: true, input_type: "text", max_len: 250},
      {caption: "", key: "__hash__", visible: false, input_type: ""},
    ];
    vm.ver.search = function() {
      var data = {};
      data.Target = "anken_ver";
      data.Params = [{
        Key: "anken_id",
        Whereope: "eq",
        Value: vm.anken_id,
      }];
      m.request({
        method: "post",
        url: "/anken/ver/api/search",
        data: data,
      }).then(function(ret) {
        vm.conv_ret_to_mprop(ret, vm.ver.cols);
      })
    };

    vm.ver_phase = {};
    vm.ver_phase.page_name = "フェーズ画面";
    vm.ver_phase.page_comment = "フェーズの編集を行います。";
    vm.ver_phase.cols = [
      {caption: "フェーズID", key: "phase_id", visible: true, input_type: ""},
      {caption: "フェーズ名", key: "phase_name", visible: true, input_type: "text", max_len: 12},
      {caption: "メイン", key: "is_main", visible: true, input_type: "radio"},
      {caption: "%", key: "scale_pct_per_main", visible: true, input_type: "number", max_len: 3},
      {caption: "開始", key: "term_from", visible: true, input_type: "date"},
      {caption: "終了", key: "term_to", visible: true, input_type: "date"},
      {caption: "単価", key: "unit_price", visible: true, input_type: "number", max_len: 8},
      {caption: "人数", key: "members", visible: true, input_type: "number", max_len: 4},
      {caption: "並び順", key: "sort_order", visible: true, input_type: ""}, //TODO set invisible
      {caption: "", key: "__hash__", visible: false, input_type: ""},
    ];
    vm.ver_phase.search = function() {
      var data = {};
      data.Target = "anken_ver_phase";
      data.Params = [{
        Key: "anken_id",
        Whereope: "eq",
        Value: vm.anken_id,
      }, {
        Key: "anken_ver",
        Whereope: "eq",
        Value: vm.anken_ver,
      }];
      m.request({
        method: "post",
        url: "/anken/ver/api/search",
        data: data,
      }).then(function(ret) {
        vm.conv_ret_to_mprop(ret, vm.ver_phase.cols);
      })
    };
    vm.ver_phase.copy = function(e) {
      var phase_id = e.target.getAttribute("phase_id");
      Lazy(vm.ret).each(function(elm, i) {
        //TODO phase_id is null check?
        if (phase_id != "-" && elm.phase_id == phase_id) {
          //TODO copy funcs, insert db
          var org = vm.ret[i];
          vm.ret.splice(i + 1, 0, {
            phase_id: "-",
            phase_name: org.phase_name,
            is_main: "0",
            sort_order: vm.ret.length + 1,
            scale_pct_per_main: org.scale_pct_per_main,
            unit_price: org.unit_price,
            person_days: org.person_days,
            term_from: org.tern_from,
            term_to: org.term_to,
            members: org.members,
          });
        }
      });
    };
    vm.ver_phase.delete = function() {
      var phase_id = e.target.getAttribute("phase_id");
      Lazy(vm.ret).each(function(elm, i) {
        if (elm.phase_id == phase_id) {
          vm.ret.splice(i, 1);
        }
      });
    };

    vm.ver_phase_func = {};
    vm.ver_phase_func.page_name = "機能一覧画面";
    vm.ver_phase_func.page_comment = "機能一覧の編集を行います。";
    vm.ver_phase_func.cols = [
      {caption: "グループID", key: "func_group_id", visible: true, input_type: "text", max_len: 2},
      {caption: "種別", key: "func_type", visible: true, input_type: "text", max_len: 2},
      {caption: "機能ID", key: "func_id", visible: true, input_type: ""},
      {caption: "名前", key: "func_name", visible: true, input_type: "text", max_len: 30},
      {caption: "重み", key: "weight_type", visible: true, input_type: "text", max_len: 1},
      {caption: "人日", key: "person_days", visible: true, input_type: "number", max_len: 4},
      {caption: "並び順", key: "sort_order", visible: true, input_type: ""},
      {caption: "備考", key: "note", visible: true, input_type: "text", max_len: 250},
      {caption: "", key: "__hash__", visible: false, input_type: ""},
    ];
    vm.ver_phase_func.search = function() {
      var data = {};
      data.Target = "anken_ver_phase_func";
      data.Params = [{
        Key: "anken_id",
        Whereope: "eq",
        Value: vm.anken_id,
      }, {
        Key: "anken_ver",
        Whereope: "eq",
        Value: vm.anken_ver,
      }];
      m.request({
        method: "post",
        url: "/anken/ver/api/search",
        data: data,
      }).then(function(ret) {
        vm.conv_ret_to_mprop(ret, vm.ver_phase_func.cols);
      })
    };
    vm.ver_phase_func.copy = function(e) {
      var phase_id = e.target.getAttribute("phase_id");
      Lazy(vm.ret).each(function(elm, i) {
        //TODO phase_id is null check?
        if (phase_id != "-" && elm.phase_id == phase_id) {
          //TODO copy funcs, insert db
          var org = vm.ret[i];
          vm.ret.splice(i + 1, 0, {
            phase_id: "-",
            phase_name: org.phase_name,
            is_main: "0",
            sort_order: vm.ret.length + 1,
            scale_pct_per_main: org.scale_pct_per_main,
            unit_price: org.unit_price,
            term_from: org.tern_from,
            term_to: org.term_to,
            members: org.members,
          });
        }
      });
    };
    vm.ver_phase_func.delete = function() {
      var phase_id = e.target.getAttribute("phase_id");
      Lazy(vm.ret).each(function(elm, i) {
        if (elm.phase_id == phase_id) {
          vm.ret.splice(i, 1);
        }
      });
    };
    
    switch(vm.page_id) {
      case "ver":
        vm.page_name = vm.ver.page_name;
        vm.page_comment = vm.ver.page_comment;
        vm.cols = vm.ver.cols;
        vm.search = vm.ver.search;
        vm.copy = vm.ver.copy;
        vm.paste = vm.ver.paste;
        vm.delete = function() {return;};
        break;
      case "ver_phase":
        vm.page_name = vm.ver_phase.page_name;
        vm.page_comment = vm.ver_phase.page_comment;
        vm.cols = vm.ver_phase.cols;
        vm.search = vm.ver_phase.search;
        vm.copy = vm.ver_phase.copy;
        vm.paste = vm.ver_phase.paste;
        vm.delete = vm.ver_phase.delete;
        break;
      case "ver_phase_func":
        vm.page_name = vm.ver_phase_func.page_name;
        vm.page_comment = vm.ver_phase_func.page_comment;
        vm.cols = vm.ver_phase_func.cols;
        vm.search = vm.ver_phase_func.search;
        vm.copy = vm.ver_phase_func.copy;
        vm.paste = vm.ver_phase_func.paste;
        vm.delete = vm.ver_phase_func.delete;
        break;
    };

    //TODO copy and paste at table
    vm.copy = null;
    vm.paste = null;
    vm.search();
  };
  return vm;
})();
page.a_ver.controller = function() {
  page.a_ver.vm.init();
};
