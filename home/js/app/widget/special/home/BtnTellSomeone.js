define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/topic",
    "dojox/mobile/Button",
    "app/widget/_Subscriber"
], function (declare, lang, on, topic, Button, _Subscriber) {
    return declare("app.widget.special.home.BtnTellSomeone", [Button, _Subscriber], {
        whom: null,
        what: null,
        setWhomTopicId: null,
        setWhatTopicId: null,
        setWhom: function (data) {
            this.whom = data.newValue;
        },
        setWhat: function (data) {
            this.what = data.newValue;
        },
        postCreate: function () {
            this.inherited(arguments);

            if (this.setWhomTopicId != null) {
                this.subscribers.push(topic.subscribe(this.setWhomTopicId, lang.hitch(this, this.setWhom)));
            }

            if (this.setWhatTopicId != null) {
                this.subscribers.push(topic.subscribe(this.setWhatTopicId, lang.hitch(this, this.setWhat)));
            }

            on(this, "click", lang.hitch(this, function (e) {
                if (e != null) {
                    e.preventDefault();
                }

                topic.publish("/resourceMonitor/tell.someone", {
                    whom: this.whom,
                    what: this.what
                });
            }));
        }
    });
});
