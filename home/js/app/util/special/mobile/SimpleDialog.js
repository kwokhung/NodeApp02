define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/dom-construct",
    "dojo/query",
    "dojo/Deferred",
    "dojox/mobile/ProgressIndicator",
    "dojox/mobile/Button",
    "dojox/mobile/SimpleDialog",
    "app/util/Global"
], function (declare, lang, on, domConstruct, query, Deferred, ProgressIndicator, Button, SimpleDialog, Global) {
    var app = Global.getInstance().app;

    return declare("app.util.special.mobile.SimpleDialog", [SimpleDialog], {
        progressable: true,
        progressIndicator: new ProgressIndicator({ center: false }),
        show: function () {
            this.inherited(arguments);

            if (this.progressable) {
                this.progressIndicator.start();
            }

            this._deferred = new Deferred(lang.hitch(this, function () {
                delete this._deferred;
            }));

            var promise = this._deferred.promise;

            this._deferred.resolve(true);
            delete this._deferred;

            return promise;
        },
        hide: function () {
            this.inherited(arguments);

            if (this.progressable) {
                this.progressIndicator.stop();
            }
        },
        postCreate: function () {
            this.inherited(arguments);

            domConstruct.place(this.domNode, query("body", document)[0], "last");

            domConstruct.create("div", {
                "class": "mblSimpleDialogText",
                innerHTML: this.title
            }, this.domNode);

            domConstruct.create("div", {
                "class": "mblSimpleDialogText",
                innerHTML: this.content
            }, this.domNode);

            if (this.progressable) {
                domConstruct.place(this.progressIndicator.domNode, query("td", domConstruct.create("div", {
                    "class": "mblSimpleDialogText",
                    innerHTML:
                        "<table style='width: 100%;' cellspacing='0'>" +
                            "<tbody valign='top'>" +
                                "<tr align='center'>" +
                                    "<td>" +
                                    "</td>" +
                                "</tr>" +
                            "</tbody>" +
                        "</table>"
                }, this.domNode))[0], "last");
            }

            var btnCancel = new Button({
                class: "mblSimpleDialogButton mblRedButton",
                innerHTML: "Cancel"
            });
            on(btnCancel, "click", lang.hitch(this, function (e) {
                if (e != null) {
                    e.preventDefault();
                }

                this.hide();
            }));
            btnCancel.placeAt(this.domNode);
        },
        destroy: function () {
            this.hide();

            if (this._deferred) {
                this._deferred.cancel();
            }

            this.inherited(arguments);
        }
    });
});
