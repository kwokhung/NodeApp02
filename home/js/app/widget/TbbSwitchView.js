define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dijit/registry",
    "dojox/mobile/TabBarButton",
    "app/widget/_Clickable"
], function (declare, lang, on, registry, TabBarButton, _Clickable) {
    return declare("app.widget.TbbSwitchView", [TabBarButton, _Clickable], {
        viewId: null,
        postCreate: function () {
            this.inherited(arguments);

            if (this.viewId != null) {
                this.switchToViewOnClickAsUsual(this.viewId);
            }
        }
    });
});
