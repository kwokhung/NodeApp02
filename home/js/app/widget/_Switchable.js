define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/on",
    "dojo/topic",
    "app/widget/_Subscriber"
], function (declare, lang, array, on, topic, _Subscriber) {
    return declare("app.widget._Switchable", [_Subscriber], {
        switchOnTopicId: null,
        switchOffTopicId: null,
        topicId: null,
        switchOn: function () {
            this.set("value", "on");
        },
        switchOff: function () {
            this.set("value", "off");
        },
        postCreate: function () {
            this.inherited(arguments);

            if (this.switchOnTopicId != null) {
                this.subscribers.push(topic.subscribe(this.switchOnTopicId, lang.hitch(this, this.switchOn)));
            }

            if (this.switchOffTopicId != null) {
                this.subscribers.push(topic.subscribe(this.switchOffTopicId, lang.hitch(this, this.switchOff)));
            }

            if (this.topicId != null) {
                on(this, "stateChanged", lang.hitch(this, function (newState) {
                    if (Array.isArray(this.topicId)) {
                        array.forEach(this.topicId, lang.hitch(this, function (item, index) {
                            topic.publish(item, {
                                newState: newState
                            });
                        }));
                    }
                    else {
                        topic.publish(this.topicId, {
                            newState: newState
                        });
                    }
                }));
            }
        }
    });
});
