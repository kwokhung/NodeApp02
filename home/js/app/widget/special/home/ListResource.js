define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/on",
    "dojo/topic",
    "dijit/registry",
    "dojox/mobile/RoundRectStoreList",
    "app/util/StoredData",
    "app/widget/_ScrollableStoreList",
    "app/widget/_Subscriber"
], function (declare, lang, array, on, topic, registry, RoundRectStoreList, StoredData, _ScrollableStoreList, _Subscriber) {
    return declare("app.widget.special.home.ListResource", [RoundRectStoreList, StoredData, _ScrollableStoreList, _Subscriber], {
        appendMessage: function (data) {
            var itemCount = this.data.length;
            var itemId = this.id + "_" + (itemCount + 1);

            this.store.put({
                "id": itemId,
                "who": data.who,
                "label":
                    "<span style='color: blue;'>" +
                        data.who +
                    "</span>" +
                    "<br />" +
                    "<span style='font-size: 50%; color: green;'>" +
                        "Last Beat: " + data.when.dateFormat() +
                    "</span>",
                "moveTo": "#viewResourceInformation",
                "variableHeight": true
            });

            on(registry.byId(itemId), "click", lang.hitch(this, function (e) {
                if (e != null) {
                    e.preventDefault();
                }

                topic.publish("/resourceInformation/show.details", data);
            }));

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
        someoneBeat: function (data) {
            array.forEach(this.store.query({
                who: data.who
            }), lang.hitch(this, function (item, index) {
                item.label =
                    "<span style='color: blue;'>" +
                        data.who +
                    "</span>" +
                    "<br />" +
                    "<span style='font-size: 50%; color: green;'>" +
                        "Last Beat: " + data.when.dateFormat() +
                    "</span>";
            this.store.put(item);
            }));
        },
        postCreate: function () {
            this.inherited(arguments);

            this.storeLabel = "Resource";
            this.setStore(this.store);

            this.subscribers.push(topic.subscribe("/resourceList/there.are", lang.hitch(this, this.thereAre)));
            this.subscribers.push(topic.subscribe("/resourceList/someone.beat", lang.hitch(this, this.someoneBeat)));
            this.subscribers.push(topic.subscribe("/resourceList/clear.message", lang.hitch(this, this.clearMessage)));
            this.subscribers.push(topic.subscribe("/resourceList/goto.top", lang.hitch(this, this.gotoTop)));
            this.subscribers.push(topic.subscribe("/resourceList/goto.bottom", lang.hitch(this, this.gotoBottom)));

            topic.publish("/resourceMonitor/who.are.there");
        }
    });
});
