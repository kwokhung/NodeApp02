define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/topic"
], function (declare, lang, topic) {
    return declare("app.util.ResourceTodoHelper", null, {
        resourceMonitor: null,
        constructor: function (kwArgs) {
            lang.mixin(this, kwArgs);
        },
        whatToDo: function (data) {
            switch (data.what.toDo) {
                case "updateYourDetails":
                    this.resourceMonitor.tellSomeone({
                        whom: data.who,
                        what: {
                            toDo: "updateHisDetails",
                            details: {
                                who: this.resourceMonitor.who
                            }
                        }
                    });

                    break;

                case "updateHisDetails":
                    topic.publish("/resourceInformation/render.details", data);

                    break;

                case "drawCanvas":
                    topic.publish("/canvas/draw", data);

                    break;

                case "displayPhoto":
                    topic.publish("/photo/display", data);

                    break;
            }
        }
    });
});
