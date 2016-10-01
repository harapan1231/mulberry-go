page.settings.view = function() {
  return [
    mlb.headers("各種設定画面", "確認・変更する項目を選びましょう。"),
    m("div", {class: "section"}, [
      page.settings.vm.items.map(function(item, i) {
        return [
          m("div", {class: "row"}, [
            m("a", {href: item.url, config: m.route}, item.text),
          ]),
        ];
      }),
    ]),
  ];
};
page.settings.vm = (function() {
  var vm = {};
  vm.init = function() {
    vm.items = [
      {text: "お客様", url: "/settings/customer"},
      {text: "ユーザー", url: "/settings/user"},
      {text: "機能種別", url: "/settings/func_type"},
      {text: "機能グループ", url: "/settings/func_group"},
      {text: "重み付け", url: "/settings/func_weight"},
    ];
  };
  return vm;
})();
page.settings.controller = function() {
  page.settings.vm.init();
};
