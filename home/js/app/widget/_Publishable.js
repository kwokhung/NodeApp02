define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/on",
    "dojo/topic"
], function (declare, lang, array, on, topic) {
    return declare("app.widget._Publishable", null, {
        topicId: null,
        postCreate: function () {
            this.inherited(arguments);

            if (this.topicId != null) {
                on(this, "click", lang.hitch(this, function (e) {
                    if (e != null) {
                        e.preventDefault();
                    }

                    if (Array.isArray(this.topicId)) {
                        array.forEach(this.topicId, lang.hitch(this, function (item, index) {
                            topic.publish(item);
                        }));
                    }
                    else {
                        topic.publish(this.topicId);
                    }
                }));
            }
        }
    });
});
