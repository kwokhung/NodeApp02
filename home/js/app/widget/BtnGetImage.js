define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/topic",
    "dojox/mobile/Button",
    "app/util/app"
], function (declare, lang, on, topic, Button, app) {
    return declare("app.widget.BtnGetImage", [Button], {
        postCreate: function () {
            this.inherited(arguments);

            on(this, "click", lang.hitch(this, function (e) {
                if (e != null) {
                    e.preventDefault();
                }

                if (app.navigator != null) {
                    if (typeof app.navigator.camera != "undefined") {
                        app.navigator.camera.getPicture(function (imageData) {
                            var src = "data:image/jpeg;base64," + imageData;

                            var data = {
                                what: {
                                    toDo: "displayPhoto",
                                    src: src
                                }
                            };

                            topic.publish("/photo/display", data);
                            topic.publish("/resourceMonitor/tell.other", data);
                        }, function (message) {
                            app.generalHelper.alert("Error getting picture.", "Error Message: " + message);
                        }, {
                            quality: 50,
                            destinationType: Camera.DestinationType.DATA_URL/*FILE_URI*//*NATIVE_URI*/,
                            sourceType: Camera.PictureSourceType./*PHOTOLIBRARY*/CAMERA/*SAVEDPHOTOALBUM*/,
                            encodingType: Camera.EncodingType.JPEG/*PNG*/
                        });
                    }
                    else {
                        var data = {
                            what: {
                                toDo: "displayPhoto",
                                src: "http://p.www.xiaomi.com/zt/2013/icon-common.png?0822"
                            }
                        };

                        topic.publish("/photo/display", data);
                        topic.publish("/resourceMonitor/tell.other", data);
                    }
                }
            }));
        }
    });
});
