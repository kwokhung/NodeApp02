define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/topic",
    "dijit/registry",
    "dojox/mobile/RoundRectStoreList",
    "app/util/StoredData",
    "app/widget/_ScrollableStoreList",
    "app/widget/_Subscriber"
], function (declare, lang, array, topic, registry, RoundRectStoreList, StoredData, _ScrollableStoreList, _Subscriber) {
    return declare("app.widget.special.home.ListResourceService", [RoundRectStoreList, StoredData, _ScrollableStoreList, _Subscriber], {
        appendMessage: function (data) {
            var itemCount = this.data.length;
            var itemId = this.id + "_" + (itemCount + 1);

            this.store.put({
                "id": itemId,
                "label":
                    "<span style='color: blue;'>" +
                        data.name +
                    "</span>" +
                    "<br />" +
                    "<span style='font-size: 50%; color: green;'>" +
                        "Caption: " + data.caption +
                    "</span>" +
                    "<br />" +
                    "<span style='font-size: 50%; color: green;'>" +
                        "Display Name: " + data.displayName +
                    "</span>" +
                    "<br />" +
                    "<span style='font-size: 50%; color: green;'>" +
                        "Description: " + data.description +
                    "</span>" +
                    "<br />" +
                    "<span style='font-size: 50%; color: green;'>" +
                        "Path Name: " + data.pathName +
                    "</span>" +
                    "<br />" +
                    "<span style='font-size: 50%; color: green;'>" +
                        "Start Mode: " + data.startMode +
                    "</span>" +
                    "<br />" +
                    "<span style='font-size: 50%; color: green;'>" +
                        "Started: " + data.started +
                    "</span>" +
                    "<br />" +
                    "<span style='font-size: 50%; color: green;'>" +
                        "Start Name: " + data.startName +
                    "</span>" +
                    "<br />" +
                    "<span style='font-size: 50%; color: green;'>" +
                        "State: " + data.state +
                    "</span>" +
                    "<br />" +
                    "<span style='font-size: 50%; color: green;'>" +
                        "Process Id: " + data.processId +
                    "</span>" +
                    "<br />" +
                    "<span style='font-size: 50%; color: green;'>" +
                        "Exit Code: " + data.exitCode +
                    "</span>" +
                    "<br />" +
                    "<span style='font-size: 50%; color: green;'>" +
                        "Status: " + data.status +
                    "</span>",
                "variableHeight": true
            });

            this.getParent().scrollIntoView(registry.byId(itemId).domNode);
        },
        thereAre: function (who) {
            array.forEach(this.store.query({}), lang.hitch(this, function (item, index) {
                this.store.remove(item.id);
            }));
            array.forEach(who, lang.hitch(this, function (item, index) {
                this.appendMessage(item);
            }));
        },
        postCreate: function () {
            this.inherited(arguments);

            this.storeLabel = "Resource Service";
            this.setStore(this.store);

            this.subscribers.push(topic.subscribe("/resourceServiceList/there.are", lang.hitch(this, this.thereAre)));
            this.subscribers.push(topic.subscribe("/resourceServiceList/clear.message", lang.hitch(this, this.clearMessage)));
            this.subscribers.push(topic.subscribe("/resourceServiceList/goto.top", lang.hitch(this, this.gotoTop)));
            this.subscribers.push(topic.subscribe("/resourceServiceList/goto.bottom", lang.hitch(this, this.gotoBottom)));
        }
    });
});
