define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/number",
    "dojo/topic",
    "dijit/registry",
    "dojox/mobile/RoundRectStoreList",
    "app/util/StoredData",
    "app/widget/_ScrollableStoreList",
    "app/widget/_Subscriber"
], function (declare, lang, array, number, topic, registry, RoundRectStoreList, StoredData, _ScrollableStoreList, _Subscriber) {
    return declare("app.widget.special.home.ListResourceProcess", [RoundRectStoreList, StoredData, _ScrollableStoreList, _Subscriber], {
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
                        "Process Id: " + data.processId +
                    "</span>" +
                    "<br />" +
                    "<span style='font-size: 50%; color: green;'>" +
                        "User: " + data.user +
                    "</span>" +
                    "<br />" +
                    "<span style='font-size: 50%; color: green;'>" +
                        "Creation Date: " + data.creationDate.dateFormat() +
                    "</span>" +
                    "<br />" +
                    "<span style='font-size: 50%; color: green;'>" +
                        "Priority: " + data.priority +
                    "</span>" +
                    "<br />" +
                    "<span style='font-size: 50%; color: green;'>" +
                        "Working Set Size: " + number.format(data.workingSetSize / 1024 / 1024, { pattern: "#,###.###" }) + " MB" +
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

            this.storeLabel = "Resource Process";
            this.setStore(this.store);

            this.subscribers.push(topic.subscribe("/resourceProcessList/there.are", lang.hitch(this, this.thereAre)));
            this.subscribers.push(topic.subscribe("/resourceProcessList/clear.message", lang.hitch(this, this.clearMessage)));
            this.subscribers.push(topic.subscribe("/resourceProcessList/goto.top", lang.hitch(this, this.gotoTop)));
            this.subscribers.push(topic.subscribe("/resourceProcessList/goto.bottom", lang.hitch(this, this.gotoBottom)));
        }
    });
});
