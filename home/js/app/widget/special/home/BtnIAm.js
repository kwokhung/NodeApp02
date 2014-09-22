define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/topic",
    "dojox/mobile/Button",
    "app/widget/_Subscriber"
], function (declare, lang, on, topic, Button, _Subscriber) {
    return declare("app.widget.special.home.BtnIAm", [Button, _Subscriber], {
        whoAmI: null,
        setWhoAmITopicId: null,
        setWhoAmI: function (data) {
            this.whoAmI = data.newValue;
        },
        postCreate: function () {
            this.inherited(arguments);

            if (this.setWhoAmITopicId != null) {
                this.subscribers.push(topic.subscribe(this.setWhoAmITopicId, lang.hitch(this, this.setWhoAmI)));
            }

            on(this, "click", lang.hitch(this, function (e) {
                if (e != null) {
                    e.preventDefault();
                }

                topic.publish("/resourceMonitor/i.am", {
                    whoAmI: this.whoAmI
                });

                topic.publish("/resourceMonitor/who.are.there");
            }));
        }
    });
});
