define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/json",
    "dojo/topic",
    "dijit/registry",
    "dojox/mobile/RoundRectStoreList",
    "app/util/StoredData",
    "app/widget/_ScrollableStoreList",
    "app/widget/_Subscriber"
], function (declare, lang, on, json, topic, registry, RoundRectStoreList, StoredData, _ScrollableStoreList, _Subscriber) {
    return declare("app.widget.special.home.ListBluetoothMessage", [RoundRectStoreList, StoredData, _ScrollableStoreList, _Subscriber], {
        appendMessage: function (data) {
            var itemCount = this.data.length;
            var itemId = this.id + "_" + (itemCount + 1);

            var label =
                "<span style='color: blue;'>" +
                    data.who +
                "</span>" +
                "<br />" +
                "<span style='font-size: 50%; color: green;'>" +
                    data.when.dateFormat() + ": ";

            if (typeof data.what != "undefined" && (typeof data.what == "string" || (data.what != null && data.what.constructor == String))) {
                label = label + data.what.replace(/\n/g, "<br />");
            }
            else if (typeof data.what != "undefined" && (typeof data.what == "object" || (data.what != null && data.what.constructor == Object))) {
                label = label + json.stringify(data.what);
            }
            else {
                label = label + data.what;
            }

            label = label +
                "</span>";

            this.store.put({
                "id": itemId,
                "label": label,
                "what": data.what,
                "when": data.when,
                "moveTo": "#viewBluetoothMessage",
                "variableHeight": true
            });

            on(registry.byId(itemId), "click", lang.hitch(this, function (e) {
                if (e != null) {
                    e.preventDefault();
                }

                topic.publish("/value/bluetoothMessage/what/Pane", {
                    newValue:
                        "<span style='color: blue;'>" +
                            this.store.get(itemId).what +
                        "</span>"
                });

                topic.publish("/value/bluetoothMessage/when/Pane", {
                    newValue:
                        "<span style='font-size: 50%; color: green;'>" +
                            this.store.get(itemId).when.dateFormat() +
                        "</span>"
                });
            }));

            this.getParent().scrollIntoView(registry.byId(itemId).domNode);

            topic.publish("/resourceMonitor/tell.other", {
                what: label
            });
        },
        someoneSaid: function (data) {
            this.appendMessage(data);
        },
        postCreate: function () {
            this.inherited(arguments);

            this.storeLabel = "Message";
            this.setStore(this.store);

            this.subscribers.push(topic.subscribe("/bluetooth/messageList/someone.said", lang.hitch(this, this.someoneSaid)));
            this.subscribers.push(topic.subscribe("/bluetooth/messageList/clear.message", lang.hitch(this, this.clearMessage)));
            this.subscribers.push(topic.subscribe("/bluetooth/messageList/goto.top", lang.hitch(this, this.gotoTop)));
            this.subscribers.push(topic.subscribe("/bluetooth/messageList/goto.bottom", lang.hitch(this, this.gotoBottom)));
        }
    });
});
