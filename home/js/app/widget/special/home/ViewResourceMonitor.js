define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/topic",
    "dojox/mobile/View",
    "app/util/special/mobile/SimpleDialog",
    "app/util/app",
    "app/util/ResourceConnectionHelper",
    "app/util/ResourceInboundHelper",
    "app/util/ResourceTodoHelper",
    "app/util/ResourceOutboundHelper",
    "app/widget/_Subscriber"
], function (declare, lang, topic, View, Dialog, app, ResourceConnectionHelper, ResourceInboundHelper, ResourceTodoHelper, ResourceOutboundHelper, _Subscriber) {
    return declare("app.widget.special.home.ViewResourceMonitor", [View, _Subscriber], {
        resourceUrl: null,
        who: "anonymous",
        socket: null,
        resourceConnectionHelper: null,
        resourceInboundHelper: null,
        resourceTodoHelper: null,
        resourceOutboundHelper: null,
        appendMessage: function (data) {
            topic.publish("/resourceMonitorMessageList/resourceMonitor.said", data);
        },
        logMessage: function (result) {
            if (result.status) {
                this.appendMessage({ who: "System (Succeeded)", what: result.message });
            }
            else {
                this.appendMessage({ who: "System (Failed)", what: result.message });
                this._handleException(result.message);
            }
        },
        setResourceUrl: function (data) {
            this.resourceUrl = data.url;
            var parsedUrl = app.nwHelper.parseUrl(this.resourceUrl);
            this.socket = io.connect(parsedUrl.schemeName + "://" + parsedUrl.hostName + ":" + (typeof parsedUrl.port == "undefined" ? "80" : parsedUrl.port), { "force new connection": false });

            this.resourceConnectionHelper.onMessage();
        },
        iAm: function (data) {
            this.resourceOutboundHelper.handleIAm(data);
        },
        iAmNoMore: function (data) {
            this.resourceOutboundHelper.handleIAmNoMore(data);
        },
        heartbeat: function () {
            this.resourceOutboundHelper.handleHeartbeat();
        },
        tellOther: function (data) {
            var enhancedData = this.resourceOutboundHelper.handleTellOther(data);

            if (enhancedData != null) {
                topic.publish("/messageList/someone.said", enhancedData);
            }
        },
        tellSomeone: function (data) {
            var enhancedData = this.resourceOutboundHelper.handleTellSomeone(data);

            if (enhancedData != null) {
                topic.publish("/messageList/someone.said", enhancedData);
            }
        },
        whoAreThere: function () {
            this.resourceOutboundHelper.handleWhoAreThere();
        },
        _handleException: function (ex) {
            var exceptionErrorDialog = new Dialog({
                title: app.bundle.MsgSystemError,
                content: ex.toString(),
                progressable: false
            });

            exceptionErrorDialog.show();
        },
        postCreate: function () {
            this.inherited(arguments);

            this.resourceConnectionHelper = new ResourceConnectionHelper({
                resourceMonitor: this
            });

            this.resourceInboundHelper = new ResourceInboundHelper({
                resourceMonitor: this
            });

            this.resourceTodoHelper = new ResourceTodoHelper({
                resourceMonitor: this
            });

            this.resourceOutboundHelper = new ResourceOutboundHelper({
                resourceMonitor: this
            });

            this.subscribers.push(topic.subscribe("/resourceMonitor/set.resource.url", lang.hitch(this, this.setResourceUrl)));

            this.subscribers.push(topic.subscribe("/resourceMonitor/i.am", lang.hitch(this, this.iAm)));
            this.subscribers.push(topic.subscribe("/resourceMonitor/i.am.no.more", lang.hitch(this, this.iAmNoMore)));
            this.subscribers.push(topic.subscribe("/resourceMonitor/heartbeat", lang.hitch(this, this.heartbeat)));
            this.subscribers.push(topic.subscribe("/resourceMonitor/tell.other", lang.hitch(this, this.tellOther)));
            this.subscribers.push(topic.subscribe("/resourceMonitor/tell.someone", lang.hitch(this, this.tellSomeone)));
            this.subscribers.push(topic.subscribe("/resourceMonitor/who.are.there", lang.hitch(this, this.whoAreThere)));
        },
        destroy: function () {
            this.inherited(arguments);

            if (this.who != "anonymous") {
                this.iAmNoMore({
                    whoAmI: this.who
                });
            }
        }
    });
});
