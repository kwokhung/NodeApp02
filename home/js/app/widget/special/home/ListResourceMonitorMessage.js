define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/topic",
    "dijit/registry",
    "dojox/mobile/RoundRectStoreList",
    "app/util/StoredData",
    "app/widget/_ScrollableStoreList",
    "app/widget/_Subscriber"
], function (declare, lang, topic, registry, RoundRectStoreList, StoredData, _ScrollableStoreList, _Subscriber) {
    return declare("app.widget.special.home.ListResourceMonitorMessage", [RoundRectStoreList, StoredData, _ScrollableStoreList, _Subscriber], {
        appendMessage: function (data) {
            var itemCount = this.data.length;
            var itemId = this.id + "_" + (itemCount + 1);

            if (typeof data.what != "undefined" && (typeof data.what == "string" || (data.what != null && data.what.constructor == String))) {
                this.store.put({
                    "id": itemId,
                    "label": "<span style='color: blue;'>" + data.who + "</span><br />" + data.what.replace(/\n/g, "<br />"),
                    "variableHeight": true
                });
            }
            else {
                this.store.put({
                    "id": itemId,
                    "label": "<span style='color: blue;'>" + data.who + "</span><br />" + data.what,
                    "variableHeight": true
                });
            }

            this.getParent().scrollIntoView(registry.byId(itemId).domNode, false);
        },
        resourceMonitorSaid: function (data) {
            this.appendMessage(data);
        },
        postCreate: function () {
            this.inherited(arguments);

            this.storeLabel = "Resource Monitor Message";
            this.setStore(this.store);

            this.subscribers.push(topic.subscribe("/resourceMonitorMessageList/resourceMonitor.said", lang.hitch(this, this.resourceMonitorSaid)));
            this.subscribers.push(topic.subscribe("/resourceMonitorMessageList/clear.message", lang.hitch(this, this.clearMessage)));
            this.subscribers.push(topic.subscribe("/resourceMonitorMessageList/goto.top", lang.hitch(this, this.gotoTop)));
            this.subscribers.push(topic.subscribe("/resourceMonitorMessageList/goto.bottom", lang.hitch(this, this.gotoBottom)));
        }
    });
});
