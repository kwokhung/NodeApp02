define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dijit/registry",
    "dojox/mobile/Button",
    "app/widget/_Clickable"
], function (declare, lang, on, registry, Button, _Clickable) {
    return declare("app.widget.BtnLinkTo", [Button, _Clickable], {
        url: null,
        postCreate: function () {
            this.inherited(arguments);

            if (this.url != null) {
                this.linkToUrlOnClick(this.url);
            }
        }
    });
});
