define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dijit/registry",
    "dojox/mobile/Button",
    "app/widget/_Clickable"
], function (declare, lang, on, registry, Button, _Clickable) {
    return declare("app.widget.BtnSwitchView", [Button, _Clickable], {
        viewId: null,
        postCreate: function () {
            this.inherited(arguments);

            if (this.viewId != null) {
                this.switchToViewOnClick(this.viewId);
            }
        }
    });
});
