define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/topic",
    "dojox/mobile/Button",
    "app/widget/_Subscriber",
    "app/util/app"
], function (declare, lang, on, topic, Button, _Subscriber, app) {
    return declare("app.widget.BtnSendText", [Button, _Subscriber], {
        what: null,
        setWhatTopicId: null,
        setWhat: function (data) {
            this.what = data.newValue;
        },
        sendTextOnClick: function () {
            on(this, "click", lang.hitch(this, function (e) {
                if (e != null) {
                    e.preventDefault();
                }

                app.generalHelper.natvieCall("BluetoothSerial", "isConnected", [], lang.hitch(this, function (response) {
                    app.generalHelper.natvieCall("BluetoothSerial", "write", [this.what + "\n"], lang.hitch(this, function (response) {
                    }), lang.hitch(this, function (error) {
                        app.generalHelper.alert("write", error);
                    }));
                }), lang.hitch(this, function (error) {
                    app.generalHelper.alert("isConnected", error);
                }));
            }));
        },
        postCreate: function () {
            this.inherited(arguments);

            if (this.setWhatTopicId != null) {
                this.subscribers.push(topic.subscribe(this.setWhatTopicId, lang.hitch(this, this.setWhat)));
            }

            this.sendTextOnClick();
        }
    });
});
