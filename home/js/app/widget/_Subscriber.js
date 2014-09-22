define([
    "dojo/_base/declare",
    "dojo/_base/array"
], function (declare, array) {
    return declare("app.widget._Subscriber", null, {
        subscribers: [],
        destroy: function () {
            this.inherited(arguments);

            array.forEach(this.subscribers, lang.hitch(this, function (item, index) {
                if (item != null) {
                    item.remove();
                    item = null;
                }
            }));
        }
    });
});
