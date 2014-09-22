define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-construct",
    "dojo/topic",
    "dojox/mobile/Pane",
    "app/widget/_Valuable"
], function (declare, lang, domConstruct, topic, Pane, _Valuable) {
    return declare("app.widget.PnlValuable", [Pane, _Valuable], {
        backgroundColor: "transparent",
        pane: null,
        setValue: function (data) {
            this.pane.innerHTML = data.newValue;
        },
        postCreate: function () {
            this.inherited(arguments);

            this.pane = domConstruct.create("div", {
                style: {
                    width: "100%",
                    backgroundColor: this.backgroundColor
                },
                innerHTML: ""
            }, this.domNode);
        }
    });
});
