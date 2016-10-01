page.home.view = function() {
  return [
    m("div", {class: "section row center-align valign-wrapper"}, [
      m("div", {class: "col m2 valign hide-on-small-only"}, [ 
        m("input", {class: "no-select", maxlength: 20, oninput: m.withAttr("value", page.home.vm.rev), oninput: m.withAttr("value", page.home.vm.reset_timer), value: page.home.vm.rev()}),
      ]),
      m("img", {class: "col s12 m6 offset-m1 valign no-select", src: page.home.vm.top_img, ondragstart: function() {return false;}}),
      m("div", {class: "col m3 valign no-select hide-on-small-only"}, [
        m("div", {class: "row right-align"}, [
          m("span", mlb.util.str_reverse(page.home.vm.rev()))
        ]),
        m("div", {class: "row left-align mlb_upsidedown"}, [
          m("span", page.home.vm.rev()),
        ]),
      ]),
    ]),
    m("pre", {class: "row center-align no-select"}, [
      m("span", page.home.vm.msg),
    ]),
    m("div", {class: "row center-align"}, [
      m("div", {class: "col s12 m4 grey darken-3 circle"}, "This is..."),
      m("div", {class: "col s12 m4 grey darken-1 circle"}, "Introduction"),
      m("div", {class: "col s12 m4 grey darken-3 circle"}, "Like this..."),
    ]),
    m("div", {class: "row center-align"}, [
      m("div", {class: "col s12 m4 grey darken-3 circle"}, "You can..."),
      m("div", {class: "col s12 m4 grey darken-1 circle"}, "Tutorial"),
      m("div", {class: "col s12 m4 grey darken-3 circle"}, "Let's join."),
    ]),
  ];
};
page.home.vm = (function() {
  var vm = {};
  vm.init = function() {
    vm.msg = "\"Just play. Have fun. Enjoy the game.\"\n(M.J.Jordan)"
    vm.rev = m.prop("");
    vm.top_img = "img/mulberry.png";
    vm.timer = setInterval(function() {
      const msg = ".-* Welcome! *-.";
      var str = vm.rev();
      var len = str.length;
      if (msg.length < len || str != msg.substr(0, len)) {
        vm.rev("");
      } else if (str == msg) {
        vm.rev("* * * ようこそ！ * * *");
      } else {
        vm.rev(str + msg.charAt(len));
      }
      mlb.redraw();
    }, 1000);
    vm.reset_timer = function(value) {
      if (vm.timer) {
        clearInterval(vm.timer);
        vm.timer = null;
      }
      vm.rev(value);
    }
  };
  return vm;
})();
page.home.controller = function() {
  page.home.vm.init();
  return {
    onunload: function() {
      page.home.vm.reset_timer();
    },
  };
};
