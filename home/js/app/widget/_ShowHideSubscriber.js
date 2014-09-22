define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/topic",
    "app/widget/_Subscriber"
], function (declare, lang, topic, _Subscriber) {
    return declare("app.widget._ShowHideSubscriber", [_Subscriber], {
        showMe: false,
        showTopicId: null,
        hideTopicId: null,
        postCreate: function () {
            this.inherited(arguments);

            if (this.showTopicId != null) {
                this.subscribers.push(topic.subscribe(this.showTopicId, lang.hitch(this, this.show)));
            }

            if (this.hideTopicId != null) {
                this.subscribers.push(topic.subscribe(this.hideTopicId, lang.hitch(this, this.hide)));
            }

            if (this.showMe) {
                this.show();
            }
        }
    });
});
