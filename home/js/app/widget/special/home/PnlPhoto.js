define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-construct",
    "dojo/topic",
    "dojox/mobile/Pane",
    "app/widget/_Subscriber"
], function (declare, lang, domConstruct, topic, Pane, _Subscriber) {
    return declare("app.widget.special.home.PnlPhoto", [Pane, _Subscriber], {
        backgroundColor: "transparent",
        photo: null,
        display: function (data) {
            this.photo.src = data.what.src;
        },
        postCreate: function () {
            this.inherited(arguments);

            this.photo = domConstruct.create("img", {
                style: {
                    width: "100%",
                    backgroundColor: this.backgroundColor
                },
                src: "#",
                alt: ""
            }, this.domNode);

            this.subscribers.push(topic.subscribe("/photo/display", lang.hitch(this, this.display)));
        }
    });
});
