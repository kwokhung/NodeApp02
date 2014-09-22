define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/on",
    "dojo/string",
    "dojo/topic",
    "dijit/registry",
    "dojox/mobile/RoundRectStoreList",
    "app/util/StoredData",
    "app/widget/_ScrollableStoreList",
    "app/widget/_Subscriber",
    "app/util/app"
], function (declare, lang, array, on, string, topic, registry, RoundRectStoreList, StoredData, _ScrollableStoreList, _Subscriber, app) {
    return declare("app.widget.special.home.ListPressRelease", [RoundRectStoreList, StoredData, _ScrollableStoreList, _Subscriber], {
        resourceUrl: null,
        appendMessage: function (data) {
            var itemCount = this.data.length;
            var itemId = this.id + "_" + (itemCount + 1);

            var label =
                "<span style='color: blue;'>" +
                    data.headline +
                "</span>" +
                "<br />" +
                "<span style='font-size: 50%; color: green;'>" +
                    data.date.dateFormat() +
                "</span>";

            this.store.put({
                "id": itemId,
                "label": label,
                "headline": data.headline,
                "date": data.date,
                "moveTo": "#viewPressRelease",
                "variableHeight": true
            });

            on(registry.byId(itemId), "click", lang.hitch(this, function (e) {
                if (e != null) {
                    e.preventDefault();
                }

                topic.publish("/value/pressRelease/headline/Pane", {
                    newValue: 
                        "<span style='color: blue;'>" +
                            this.store.get(itemId).headline +
                        "</span>"
                });

                topic.publish("/value/pressRelease/date/Pane", {
                    newValue:
                        "<span style='font-size: 50%; color: green;'>" +
                            this.store.get(itemId).date.dateFormat() +
                        "</span>"
                });
            }));

            this.getParent().scrollIntoView(registry.byId(itemId).domNode);
        },
        getPressRelease: function () {
            app.serviceHelper.requestGetTextServiceNoBlock(
                string.substitute("${resourceUrl}&languageDisplay=${languageDisplay}", {
                    resourceUrl: this.resourceUrl,
                    languageDisplay: app.language
                }),
                null,
                lang.hitch(this, function (response) {
                    array.forEach(this.store.query({}), lang.hitch(this, function (item, index) {
                        this.store.remove(item.id);
                    }));
                    array.forEach(response.content.data, lang.hitch(this, function (item, index) {
                        this.appendMessage(item);
                    }));
                })
            );
        },
        refreshMessage: function () {
            this.getPressRelease();
        },
        postCreate: function () {
            this.inherited(arguments);

            if (this.resourceUrl != null) {
                this.storeLabel = "Press Release";
                this.setStore(this.store);

                this.subscribers.push(topic.subscribe("/pressReleaseList/refresh.message", lang.hitch(this, this.refreshMessage)));
                this.subscribers.push(topic.subscribe("/pressReleaseList/clear.message", lang.hitch(this, this.clearMessage)));
                this.subscribers.push(topic.subscribe("/pressReleaseList/goto.top", lang.hitch(this, this.gotoTop)));
                this.subscribers.push(topic.subscribe("/pressReleaseList/goto.bottom", lang.hitch(this, this.gotoBottom)));

                this.getPressRelease();
            }
        }
    });
});
