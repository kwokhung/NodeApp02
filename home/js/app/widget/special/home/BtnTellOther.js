define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/topic",
    "dojox/mobile/Button",
    "app/widget/_Subscriber"
], function (declare, lang, on, topic, Button, _Subscriber) {
    return declare("app.widget.special.home.BtnTellOther", [Button, _Subscriber], {
        what: null,
        setWhatTopicId: null,
        setWhat: function (data) {
            this.what = data.newValue;
        },
        postCreate: function () {
            this.inherited(arguments);

            if (this.setWhatTopicId != null) {
                this.subscribers.push(topic.subscribe(this.setWhatTopicId, lang.hitch(this, this.setWhat)));
            }

            on(this, "click", lang.hitch(this, function (e) {
                if (e != null) {
                    e.preventDefault();
                }

                topic.publish("/resourceMonitor/tell.other", {
                    what: this.what
                });
            }));
        }
    });
});
