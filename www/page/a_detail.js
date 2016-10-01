page.a_detail.view = function() {
  return [
    mlb.headers("案件詳細画面", "案件の詳細です。"),
    page.a_detail.vm.items.map(function(item, i) {
      return m("div", {class: "row input-field"}, [
        m("span", {class: "col m3"}, item.text),
        m("div", {class: "col m" + item.cols}, [
          m("span", {id: item.key, onchange: m.withAttr("value", item.value), value: item.value()}),
        ])
      ]);
    }),
  ];
};
page.a_detail.vm = (function() {
  var vm = {};
  vm.init = function() {
    vm.anken_id = m.route.param("anken_id");
    vm.items = [
      {text: "案件名", cols: "9", key: "anken_name", value: m.prop(""), required: true},
      {text: "お客様", cols: "6", key: "customer_id", value: m.prop(""), required: true, autocomp_target: "customer"},
      {text: "担当者", cols: "5", key: "user_id", value: m.prop(""), required: true, autocomp_target: "user"},
    ];
  };
  return vm;
})();
page.a_detail.controller = function() {
  page.a_detail.vm.init();
};
