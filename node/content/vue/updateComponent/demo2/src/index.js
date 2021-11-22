_c(
  "div",
  { attrs: { id: "app" } },
  [
    _v("\n        " + _s(color) + "\n        "),
    _c("div", { attrs: { title: color } }),
    _v(" "),
    _c("input", {
      directives: [
        {
          name: "model",
          rawName: "v-model",
          value: inputValue,
          expression: "inputValue",
        },
      ],
      domProps: { value: inputValue },
      on: {
        input: function($event) {
          if ($event.target.composing) return;
          inputValue = $event.target.value;
        },
      },
    }),
    _v(" "),
    _c(
      "child1",
      {
        attrs: { num: parentNum },
        scopedSlots: _u([
          {
            key: "header",
            fn: function() {
              return [
                _v("\n                ad" + _s(color) + "\n            "),
              ];
            },
            proxy: true,
          },
          {
            key: "footer",
            fn: function(t) {
              return [
                _v("\n                " + _s(t) + _s(color) + "\n            "),
              ];
            },
          },
        ]),
      },
      [
        _v("       \n            sda" + _s(color) + "\n            "),
        _v(" "),
        _v("\n            2\n        "),
      ]
    ),
    _v(" "),
    _c("div", [_c("div", [_v(_s(color))])]),
  ],
  1
);
