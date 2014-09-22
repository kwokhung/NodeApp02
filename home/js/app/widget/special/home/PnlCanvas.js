define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-geometry",
    "dojo/dom-construct",
    "dojo/on",
    "dojo/topic",
    "dojox/mobile/Pane",
    "app/widget/_Subscriber"
], function (declare, lang, domGeom, domConstruct, on, topic, Pane, _Subscriber) {
    return declare("app.widget.special.home.PnlCanvas", [Pane, _Subscriber], {
        width: null,
        height: null,
        backgroundColor: "transparent",
        ctx: null,
        draw: function (data) {
            switch (data.what.type) {
                case "mousedown":
                case "touchstart":
                    this.ctx.beginPath();
                    this.ctx.moveTo(data.what.x, data.what.y);

                    break;

                case "mousemove":
                case "touchmove":
                    this.ctx.lineTo(data.what.x, data.what.y);
                    this.ctx.stroke();

                    break;

                case "mouseup":
                case "touchend":
                    this.ctx.closePath();

                    break;
            }
        },
        dragToDraw: function (e) {
            var data = {
                what: {
                    toDo: "drawCanvas",
                    type: e.type,
                    x: e.clientX - domGeom.position(this.domNode).x,
                    y: e.clientY - domGeom.position(this.domNode).y
                }
            };

            this.draw(data);
            topic.publish("/resourceMonitor/tell.other", data);
        },
        postCreate: function () {
            this.inherited(arguments);

            var canvas = domConstruct.create("canvas", {
                width: this.width,
                height: this.height,
                style: {
                    backgroundColor: this.backgroundColor
                },
                innerHTML: "Your browser does not support the HTML5 canvas element."
            }, this.domNode);

            this.ctx = canvas.getContext("2d");

            var isDragging = false;

            on(this, "mousedown, mousemove, mouseup, touchstart, touchmove, touchend", lang.hitch(this, function (e) {
                if (e != null) {
                    e.preventDefault();
                }

                switch (e.type) {
                    case "mousedown":
                    case "touchstart":
                        isDragging = true;
                        this.dragToDraw(e);

                        break;

                    case "mousemove":
                    case "touchmove":
                        if (isDragging) {
                            this.dragToDraw(e);
                        }

                        break;

                    case "mouseup":
                    case "touchend":
                        isDragging = false;
                        this.dragToDraw(e);

                        break;
                }
            }));

            this.subscribers.push(topic.subscribe("/canvas/draw", lang.hitch(this, this.draw)));
        }
    });
});
