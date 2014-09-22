define([
    "dojo/_base/declare",
    "dojo/_base/kernel",
    "dojo/topic",
    "dojo/cookie",
    "app/util/Global"
], function (declare, kernel, topic, cookie, Global) {
    var app = Global.getInstance().app;

    return declare(null, {
        dumpObject: function (objectName, object) {
            try {
                console.log("%s: %o", objectName, object);
            }
            catch (ex) {
            }
        },
        alert: function (title, message) {
            if (app.navigator != null) {
                if (typeof app.navigator.notification != "undefined" && false) {
                    app.navigator.notification.alert(message, null, title, "OK");
                }
                else {
                    alert(title + "\n\n" + message);
                }
            }
            else {
                alert(title + "\n\n" + message);
            }
        },
        natvieCall: function (service, operation, parameters, responseHandler, errorHandler) {
            if (app.cordova != null) {
                app.cordova.exec(responseHandler, errorHandler, service, operation, parameters);
            }
        },
        switchBundle: function (locale) {
            kernel.locale = locale;

            require([
                "dojo/i18n!app/nls/Bundle"
            ], function (bundle) {
                app.bundle = bundle;
            });
        },
        switchLanguage: function (language) {
            app.language = language;

            topic.publish("/change/language", [{
                language: language
            }]);

            cookie("language", language, {
                expires: 30
            });
        }
    });
});
