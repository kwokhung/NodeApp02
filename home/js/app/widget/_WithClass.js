define([
    "dojo/_base/declare",
    "dojo/dom-class"
], function (declare, domClass) {
    return declare("app.widget._WithClass", null, {
        classes: null,
        postCreate: function () {
            this.inherited(arguments);

            domClass.add(this.domNode, this.classes);
        }
    });
});
