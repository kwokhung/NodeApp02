define([
    "dojo/_base/declare",
    "dojo/dom-class"
], function (declare, domClass) {
    return declare("app.widget._Classless", null, {
        postCreate: function () {
            this.inherited(arguments);

            domClass.remove(this.domNode);
        }
    });
});
