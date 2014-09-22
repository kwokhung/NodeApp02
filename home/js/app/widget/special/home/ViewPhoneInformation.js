define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/topic",
    "dojox/mobile/View",
    "app/util/app"
], function (declare, lang, on, topic, View, app) {
    return declare("app.widget.special.home.ViewPhoneInformation", [View], {
        postCreate: function () {
            this.inherited(arguments);

            on(this, "afterTransitionIn", lang.hitch(this, function (e) {
                if (app.device != null) {
                    topic.publish("/value/phoneInformation/phone/platform/TextBox", {
                        newValue: app.device.platform
                    });
                    topic.publish("/value/phoneInformation/phone/version/TextBox", {
                        newValue: app.device.version
                    });
                }

                if (app.navigator != null) {
                    if (typeof app.navigator.network != "undefined") {
                        var connectionStates = {};
                        connectionStates[Connection.UNKNOWN] = "Unknown connection";
                        connectionStates[Connection.ETHERNET] = "Ethernet connection";
                        connectionStates[Connection.WIFI] = "WiFi connection";
                        connectionStates[Connection.CELL_2G] = "Cell 2G connection";
                        connectionStates[Connection.CELL_3G] = "Cell 3G connection";
                        connectionStates[Connection.CELL_4G] = "Cell 4G connection";
                        connectionStates[Connection.NONE] = "No network connection";

                        topic.publish("/value/phoneInformation/connection/TextBox", {
                            newValue: connectionStates[app.navigator.network.connection.type]
                        });
                    }

                    if (typeof app.navigator.contacts != "undefined") {
                        app.navigator.contacts.find(["displayName", "phoneNumbers"], function (contacts) {
                            topic.publish("/value/phoneInformation/contact/name/TextBox", {
                                newValue: contacts[0].displayName
                            });
                            topic.publish("/value/phoneInformation/contact/phone/TextBox", {
                                newValue: contacts[0].phoneNumbers[0].value
                            });
                        }, function (error) {
                            app.generalHelper.alert("Error getting contacts.", "Error Code: " + error.code);
                        }, {
                            filter: "\u6731\u570b\u96c4",
                            multiple: true
                        });
                    }

                    if (typeof app.navigator.geolocation != "undefined") {
                        app.navigator.geolocation.getCurrentPosition(function (position) {
                            topic.publish("/value/phoneInformation/location/latitude/TextBox", {
                                newValue: position.coords.latitude
                            });
                            topic.publish("/value/phoneInformation/location/longitude/TextBox", {
                                newValue: position.coords.longitude
                            });
                        }, function (error) {
                            app.generalHelper.alert("Error getting location.", "Error Code: " + error.code + "\n" + "Error Message: " + error.message);
                        }, {
                            enableHighAccuracy: false
                        });
                    }

                    if (typeof app.navigator.accelerometer != "undefined") {
                        app.navigator.accelerometer.watchAcceleration(function (acceleration) {
                            topic.publish("/value/phoneInformation/accelerometer/x/TextBox", {
                                newValue: acceleration.x
                            });
                            topic.publish("/value/phoneInformation/accelerometer/y/TextBox", {
                                newValue: acceleration.y
                            });
                            topic.publish("/value/phoneInformation/accelerometer/z/TextBox", {
                                newValue: acceleration.z
                            });
                        }, function () {
                            app.generalHelper.alert("Error getting acceleration.", "");
                        }, {
                            frequency: 1000
                        });
                    }
                }
            }));
        }
    });
});
