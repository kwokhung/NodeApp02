define([
    "dojo/_base/declare"
], function (declare) {
    return declare("app.widget._Resizable", null, {
        postCreate: function () {
            this.inherited(arguments);

            this.resize();
        }
    });
});
