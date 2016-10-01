//TODO id needs to be hankaku
page.s_item.view = function() {
  return [
    mlb.headers(page.s_item.vm.name, page.s_item.vm.msg),
    m("div", {class: "section"}, [
      page.s_item.vm.items.map(function(item, i) {
        return [
          m("div", {class: "row input-field"}, [
            m("span", {class: "col s3"}, item.text),
            m("input", {class: "col s6", onchange: m.withAttr("value", item.value), value: item.value()}),
          ]),
        ];
      }),
      m("div", {class: "row right-align"}, [
        m("a", {class: "btn", onclick: page.s_item.vm.clear}, "Clear"),
        m("a", {class: "btn deep-orange tooltipped", "data-position": "top", "data-tooltip": "データを更新します", onclick: page.s_item.vm.register}, "Register"),
      ]),
    ]),
  ];
};
page.s_item.vm = (function() {
  var vm = {};
  vm.init = function() {
    vm.target = m.route.param("target");
    var page_info = (function() {
      var page_info = {};
      switch (vm.target) {
      case "customer":
        page_info.name = "お客様設定画面";
        page_info.msg = "お客様の確認・変更が行えます。（TODO：変更を行えるようにする。）";
        page_info.items = [
          {text: "ID", value: m.prop(""), key: "customer_id", required: true},
          {text: "名前", value: m.prop(""), key: "customer_name", required: true},
        ];
        break;
      case "user":
        page_info.name = "ユーザー設定画面";
        page_info.msg = "ユーザーの確認・変更が行えます。（TODO: 今は無制限の登録だけ...将来は認証機能も......できたらいいな）";
        page_info.items = [
          {text: "ID", value: m.prop(""), key: "user_id", required: true},
          {text: "名前", value: m.prop(""), key: "user_name", required: true},
        ];
        break;
      case "func_type":
        page_info.name = "機能種別設定画面";
        page_info.msg = "機能種別の確認・変更が行えます。";
        page_info.items = [
          {text: "グループID", value: m.prop(""), key: "group_id", required: true},
          {text: "種別ID", value: m.prop(""), key: "type_id", required: true},
          {text: "詳細", value: m.prop(""), key: "description", required: true},
        ];
        break;
      case "func_group":
        page_info.name = "機能グループ設定画面";
        page_info.msg = "機能グループの確認・変更が行えます。";
        page_info.items = [
          {text: "案件ID", value: m.prop(""), key: "anken_id", required: true},
          {text: "案件Ver", value: m.prop(""), key: "anken_ver", required: true},
          {text: "機能グループID", value: m.prop(""), key: "func_froup_id", required: true},
          {text: "機能グループ名", value: m.prop(""), key: "func_froup_name", required: true},
          {text: "並び順", value: m.prop(""), key: "sort_order", required: true},
        ];
        break;
      case "func_weight":
        page_info.name = "重み付け設定画面";
        page_info.msg = "機能の重み付けの確認・変更が行えます。";
        page_info.items = [
          {text: "案件ID", value: m.prop(""), key: "anken_id", required: true},
          {text: "案件Ver", value: m.prop(""), key: "anken_ver", required: true},
          {text: "機能種別", value: m.prop(""), key: "func_type", required: true},
          {text: "重み付け種別", value: m.prop(""), key: "weight_type", required: true},
          {text: "人日", value: m.prop(""), key: "person_days", required: true},
        ];
        break;
      }
      return page_info;
    })();
    vm.name = page_info.name;
    vm.msg = page_info.msg;
    vm.items = page_info.items;
    vm.clear = function() {
      mlb.clear_item_values(vm.items);
    };
    vm.register = function() {
      if (mlb.is_progressing) return false;
      if (!mlb.validate_required(vm.items)) return false;
      var exec = function() {
        var data = {};
        data.Target = vm.target;
        data.Params = [];
        vm.items.map(function(item, i) {
          data.Params.push({
            Key: item.key,
            Value: item.value(),
          });
        });
        mlb.progressing(true);
        m.request({
          method: "post",
          url: "/settings/api/add",
          data: data,
        }).then(function(ret) {
          if (mlb.validate_response(ret, vm.items[0].value() + " を作成しました")) {
            vm.clear();
          }
        });
      };
      mlb.util.confirm_callback = exec;
      mlb.util.confirm_msg("作成しますか？");
    };
  };
  return vm;
})();
page.s_item.controller = function() {
  page.s_item.vm.init();
};
