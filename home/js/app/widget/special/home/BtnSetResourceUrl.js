define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/topic",
    "dijit/registry",
    "dojox/mobile/Button",
    "app/widget/_Subscriber"
], function (declare, lang, on, topic, registry, Button, _Subscriber) {
    return declare("app.widget.special.home.BtnSetResourceUrl", [Button, _Subscriber], {
        url: null,
        setUrlTopicId: null,
        setUrl: function (data) {
            this.url = data.newValue;
        },
        postCreate: function () {
            this.inherited(arguments);

            if (this.setUrlTopicId != null) {
                this.subscribers.push(topic.subscribe(this.setUrlTopicId, lang.hitch(this, this.setUrl)));
            }

            on(this, "click", lang.hitch(this, function (e) {
                if (e != null) {
                    e.preventDefault();
                }

                topic.publish("/resourceMonitor/set.resource.url", {
                    url: this.url
                });
            }));
        }
    });
});
