page.a_register.view = function() {
  return [
    mlb.headers("案件登録画面", "案件を作成しましょう。"),
    page.a_register.vm.items.map(function(item, i) {
      return m("div", {class: "row input-field"}, [
        m("span", {class: "col m3"}, item.text),
        m("div", {class: "col m" + item.cols}, [
          m("input", {id: item.key, onchange: m.withAttr("value", item.value), value: item.value()}),
        ])
      ]);
    }),
    m("div", {class: "right-align"}, [
      m("a", {class: "btn", onclick: page.a_register.vm.clear}, "Clear"),
      m("a", {class: "btn deep-orange tooltipped", "data-position": "top", "data-tooltip": "データを登録します", onclick: page.a_register.vm.register}, "Register"),
    ]),
  ];
};
page.a_register.vm = (function() {
  var vm = {};
  vm.init = function() {
    vm.items = [
      {text: "案件名", cols: "9", key: "anken_name", value: m.prop(""), required: true},
      {text: "お客様", cols: "6", key: "customer_id", value: m.prop(""), required: true, autocomp_target: "customer"},
      {text: "担当者", cols: "5", key: "user_id", value: m.prop(""), required: true, autocomp_target: "user"},
    ];
    vm.clear = function() {
      mlb.clear_item_values(vm.items);
    };
    vm.register = function() {
      if (mlb.is_progressing) return false;
      if (!mlb.validate_required(vm.items)) return false;
      var exec = function() {
        var data = {};
        data.Target = "anken";
        data.Params = vm.items.map(function(item, i) {
          return {
            Key: item.key,
            Value: item.value()
          };
        });
        mlb.progressing(true);
        m.request({
          method: "post",
          url: "/anken/api/add",
          data: data,
        }).then(function(ret) {
          if (mlb.validate_response(ret, "<span>案件 " + vm.items[0].value() + " を作成しました<a class='btn' href='/?/anken/ver/1/1/'>Jump</a></span>")) {
            vm.clear();
          }
        });
      };
      mlb.util.confirm_callback = exec;
      mlb.util.confirm_msg("作成しますか？");
    }
    mlb.set_mst_autocomp(vm.items);
  };
  return vm;
})();
page.a_register.controller = function() {
  page.a_register.vm.init();
};
