define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/string",
    "dojo/topic",
    "dojox/mobile/View",
    "app/util/app"
], function (declare, lang, on, string, topic, View, app) {
    return declare("app.widget.special.home.ViewMarketOutlook", [View], {
        postCreate: function () {
            this.inherited(arguments);

            on(this, "afterTransitionIn", lang.hitch(this, function () {
                app.serviceHelper.requestGetService(
                    string.substitute("${serviceUrl}?service=${service}&languageDisplay=${languageDisplay}", {
                        serviceUrl: "https://www.guococom.com/GuocoCommoditiesServer/serviceportal.aspx",
                        service: "marketoutlook",
                        languageDisplay: app.language
                    }),
                    null,
                    function (response) {
                        topic.publish("/value/marketOutlook/analysis/Pane", {
                            newValue: response.analysis
                        });
                    }
                );
            }));
        }
    });
});
