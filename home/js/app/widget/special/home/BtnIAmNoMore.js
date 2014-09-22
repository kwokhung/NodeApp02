define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/topic",
    "dojox/mobile/Button",
    "app/widget/_Subscriber"
], function (declare, lang, on, topic, Button, _Subscriber) {
    return declare("app.widget.special.home.BtnIAmNoMore", [Button, _Subscriber], {
        whoAmINot: null,
        setWhoAmINotTopicId: null,
        setWhoAmINot: function (data) {
            this.whoAmINot = data.newValue;
        },
        postCreate: function () {
            this.inherited(arguments);

            if (this.setWhoAmINotTopicId != null) {
                this.subscribers.push(topic.subscribe(this.setWhoAmINotTopicId, lang.hitch(this, this.setWhoAmINot)));
            }

            on(this, "click", lang.hitch(this, function (e) {
                if (e != null) {
                    e.preventDefault();
                }

                topic.publish("/resourceMonitor/i.am.no.more", {
                    whoAmI: this.whoAmINot
                });

                topic.publish("/resourceMonitor/who.are.there");
            }));
        }
    });
});
