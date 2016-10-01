page.sitemap.view = function() {
  return [
    m("ul", [
      page.sitemap.vm.links.map(function(link, i) {
        return [
          m("li", {class: "col s2"}, [
            m("a", {href: link.url, config: m.route}, link.text)
          ]),
        ];
      })
    ]),
  ];
};
page.sitemap.vm = (function() {
  var vm = {};
  vm.init = function() {
    vm.links = [
      {url: "/", text: "Home"},
      {url: "/anken", text: "案件検索"},
      {url: "/anken/register", text: "案件登録"},
      {url: "/settings", text: "設定項目"},
      {url: "/settings/customer", text: "お客様設定"},
      {url: "/settings/user", text: "ユーザー設定"},
    ];
  };
  return vm;
}());
page.sitemap.controller = function() {
  page.sitemap.vm.init();
};
