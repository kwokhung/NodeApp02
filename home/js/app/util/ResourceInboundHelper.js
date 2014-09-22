define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/topic"
], function (declare, lang, array, topic) {
    return declare("app.util.ResourceInboundHelper", null, {
        resourceMonitor: null,
        constructor: function (kwArgs) {
            lang.mixin(this, kwArgs);
        },
        onMessage: function () {
            if (this.resourceMonitor.socket == null) {
                return;
            }

            this.resourceMonitor.socket.on("heartbeat", lang.hitch(this, function (data) {
                this.resourceMonitor.appendMessage({ who: "heartbeat", what: data.when });
                this.resourceMonitor.heartbeat();
            }));

            this.resourceMonitor.socket.on("you.are", lang.hitch(this, function (data) {
                this.resourceMonitor.appendMessage({ who: "you.are", what: data.who });
                this.resourceMonitor.whoAreThere();
            }));

            this.resourceMonitor.socket.on("you.are.no.more", lang.hitch(this, function (data) {
                this.resourceMonitor.appendMessage({ who: "you.are.no.more", what: data.who });
                this.resourceMonitor.whoAreThere();
            }));

            this.resourceMonitor.socket.on("he.is", lang.hitch(this, function (data) {
                this.resourceMonitor.appendMessage({ who: "he.is", what: data.who });
                this.resourceMonitor.whoAreThere();
            }));

            this.resourceMonitor.socket.on("he.is.no.more", lang.hitch(this, function (data) {
                this.resourceMonitor.appendMessage({ who: "he.is.no.more", what: data.who });
                this.resourceMonitor.whoAreThere();
            }));

            this.resourceMonitor.socket.on("there.are", lang.hitch(this, function (data) {
                array.forEach(data.who, lang.hitch(this, function (item, index) {
                    this.resourceMonitor.appendMessage({ who: "there.are", what: item.who });
                }));

                topic.publish("/resourceList/there.are", data.who);
            }));

            this.resourceMonitor.socket.on("someone.said", lang.hitch(this, function (data) {
                this.resourceMonitor.appendMessage({ who: "someone.said", what: data.what + " by " + data.who });

                topic.publish("/messageList/someone.said", data);

                if (typeof data.what != "undefined" && data.what != null && typeof data.what.toDo != "undefined" && data.what.toDo != null) {
                    this.resourceMonitor.resourceTodoHelper.whatToDo(data);
                }
            }));

            this.resourceMonitor.socket.on("someone.joined", lang.hitch(this, function (data) {
                this.resourceMonitor.appendMessage({ who: "someone.joined", what: data.who });
            }));

            this.resourceMonitor.socket.on("someone.left", lang.hitch(this, function (data) {
                this.resourceMonitor.appendMessage({ who: "someone.left", what: data.who });
            }));

            this.resourceMonitor.socket.on("someone.beat", lang.hitch(this, function (data) {
                this.resourceMonitor.appendMessage({ who: "someone.beat", what: data.when + " by " + data.who });

                topic.publish("/resourceList/someone.beat", data);
            }));
        }
    });
});
