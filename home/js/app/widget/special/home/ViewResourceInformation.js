define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/number",
    "dojo/topic",
    "dojox/mobile/View",
    "app/widget/_Subscriber"
], function (declare, lang, number, topic, View, _Subscriber) {
    return declare("app.widget.special.home.ViewResourceInformation", [View, _Subscriber], {
        who: null,
        resourceRefresh: null,
        resourceRefreshDuration: 1000,
        showDetails: function (data) {
            this.who = data.who;

            topic.publish("/value/resourceInformation/resourceName/TextBox", {
                newValue: "undefined"
            });

            topic.publish("/value/resourceInformation/resourceComputerSystemName/TextBox", {
                newValue: "undefined"
            });
            topic.publish("/value/resourceInformation/resourceComputerSystemDescription/TextBox", {
                newValue: "undefined"
            });
            topic.publish("/value/resourceInformation/resourceComputerSystemDomain/TextBox", {
                newValue: "undefined"
            });
            topic.publish("/value/resourceInformation/resourceComputerSystemManufacturer/TextBox", {
                newValue: "undefined"
            });
            topic.publish("/value/resourceInformation/resourceComputerSystemSystemType/TextBox", {
                newValue: "undefined"
            });
            topic.publish("/value/resourceInformation/resourceComputerSystemTotalPhysicalMemory/TextBox", {
                newValue: "undefined"
            });
            topic.publish("/value/resourceInformation/resourceComputerSystemStatus/TextBox", {
                newValue: "undefined"
            });

            topic.publish("/value/resourceInformation/resourceOperatingSystemCaption/TextBox", {
                newValue: "undefined"
            });
            topic.publish("/value/resourceInformation/resourceOperatingSystemVersion/TextBox", {
                newValue: "undefined"
            });
            topic.publish("/value/resourceInformation/resourceOperatingSystemCSDVersion/TextBox", {
                newValue: "undefined"
            });
            topic.publish("/value/resourceInformation/resourceOperatingSystemOSArchitecture/TextBox", {
                newValue: "undefined"
            });
            topic.publish("/value/resourceInformation/resourceOperatingSystemManufacturer/TextBox", {
                newValue: "undefined"
            });
            topic.publish("/value/resourceInformation/resourceOperatingSystemFreePhysicalMemory/TextBox", {
                newValue: "undefined"
            });
            topic.publish("/value/resourceInformation/resourceOperatingSystemFreeVirtualMemory/TextBox", {
                newValue: "undefined"
            });
            topic.publish("/value/resourceInformation/resourceOperatingSystemLocalDateTime/TextBox", {
                newValue: "undefined"
            });
            topic.publish("/value/resourceInformation/resourceOperatingSystemStatus/TextBox", {
                newValue: "undefined"
            });

            topic.publish("/resourceDiskList/clear.message");
            topic.publish("/resourceProcessList/clear.message");
            topic.publish("/resourceServiceList/clear.message");

            topic.publish("/switch/resourceInformation/refresh/on");
            topic.publish("/value/resourceInformation/refreshDuration/Slider", {
                newValue: this.resourceRefreshDuration / 1000
            });
            topic.publish("/value/resourceInformation/refreshDuration/TextBox", {
                newValue: "" + this.resourceRefreshDuration / 1000 + " s"
            });

            if (this.resourceRefresh != null) {
                clearInterval(this.resourceRefresh);
                this.resourceRefresh = null;
            }

            this.resourceRefresh = setInterval(lang.hitch(this, function () {
                topic.publish("/resourceMonitor/tell.someone", {
                    whom: this.who,
                    what: {
                        toDo: "updateYourDetails"
                    }
                });
            }), this.resourceRefreshDuration);
        },
        renderDetails: function (data) {
            topic.publish("/value/resourceInformation/resourceName/TextBox", {
                newValue: data.what.details.who
            });

            if (typeof data.what.details.computerSystem != "undefined" && data.what.details.computerSystem != null) {
                topic.publish("/value/resourceInformation/resourceComputerSystemName/TextBox", {
                    newValue: data.what.details.computerSystem.name
                });
                topic.publish("/value/resourceInformation/resourceComputerSystemDescription/TextBox", {
                    newValue: data.what.details.computerSystem.description
                });
                topic.publish("/value/resourceInformation/resourceComputerSystemDomain/TextBox", {
                    newValue: data.what.details.computerSystem.domain
                });
                topic.publish("/value/resourceInformation/resourceComputerSystemManufacturer/TextBox", {
                    newValue: data.what.details.computerSystem.manufacturer
                });
                topic.publish("/value/resourceInformation/resourceComputerSystemSystemType/TextBox", {
                    newValue: data.what.details.computerSystem.systemType
                });
                topic.publish("/value/resourceInformation/resourceComputerSystemTotalPhysicalMemory/TextBox", {
                    newValue: number.format(data.what.details.computerSystem.totalPhysicalMemory / 1024 / 1024 / 1024, { pattern: "#,###.###" }) + " GB"
                });
                topic.publish("/value/resourceInformation/resourceComputerSystemStatus/TextBox", {
                    newValue: data.what.details.computerSystem.status
                });

                topic.publish("/value/resourceInformation/resourceOperatingSystemCaption/TextBox", {
                    newValue: data.what.details.operatingSystem.caption
                });
                topic.publish("/value/resourceInformation/resourceOperatingSystemVersion/TextBox", {
                    newValue: data.what.details.operatingSystem.version
                });
                topic.publish("/value/resourceInformation/resourceOperatingSystemCSDVersion/TextBox", {
                    newValue: data.what.details.operatingSystem.csdVersion
                });
                topic.publish("/value/resourceInformation/resourceOperatingSystemOSArchitecture/TextBox", {
                    newValue: data.what.details.operatingSystem.osArchitecture
                });
                topic.publish("/value/resourceInformation/resourceOperatingSystemManufacturer/TextBox", {
                    newValue: data.what.details.operatingSystem.manufacturer
                });
                topic.publish("/value/resourceInformation/resourceOperatingSystemFreePhysicalMemory/TextBox", {
                    newValue: number.format(data.what.details.operatingSystem.freePhysicalMemory / 1024 / 1024, { pattern: "#,###.###" }) + " GB"
                });
                topic.publish("/value/resourceInformation/resourceOperatingSystemFreeVirtualMemory/TextBox", {
                    newValue: number.format(data.what.details.operatingSystem.freeVirtualMemory / 1024 / 1024, { pattern: "#,###.###" }) + " GB"
                });
                topic.publish("/value/resourceInformation/resourceOperatingSystemLocalDateTime/TextBox", {
                    newValue: data.what.details.operatingSystem.localDateTime.dateFormat()
                });
                topic.publish("/value/resourceInformation/resourceOperatingSystemStatus/TextBox", {
                    newValue: data.what.details.operatingSystem.status
                });

                topic.publish("/resourceDiskList/there.are", data.what.details.disks);
                topic.publish("/resourceProcessList/there.are", data.what.details.processes);
                topic.publish("/resourceServiceList/there.are", data.what.details.services);
            }
        },
        refresh: function (data) {
            switch (data.newState) {
                case "on":
                    if (this.resourceRefresh != null) {
                        clearInterval(this.resourceRefresh);
                        this.resourceRefresh = null;
                    }

                    this.resourceRefresh = setInterval(lang.hitch(this, function () {
                        topic.publish("/resourceMonitor/tell.someone", {
                            whom: this.who,
                            what: {
                                toDo: "updateYourDetails"
                            }
                        });
                    }), this.resourceRefreshDuration);

                    break;

                case "off":
                    if (this.resourceRefresh != null) {
                        clearInterval(this.resourceRefresh);
                        this.resourceRefresh = null;
                    }

                    break;
            }
        },
        setRefreshDuration: function (data) {
            topic.publish("/switch/resourceInformation/refresh/off");
            topic.publish("/value/resourceInformation/refreshDuration/TextBox", {
                newValue: "" + data.newValue + " s"
            });
            this.resourceRefreshDuration = data.newValue * 1000;
        },
        postCreate: function () {
            this.inherited(arguments);

            this.subscribers.push(topic.subscribe("/resourceInformation/show.details", lang.hitch(this, this.showDetails)));
            this.subscribers.push(topic.subscribe("/resourceInformation/render.details", lang.hitch(this, this.renderDetails)));
            this.subscribers.push(topic.subscribe("/resourceInformation/refresh", lang.hitch(this, this.refresh)));
            this.subscribers.push(topic.subscribe("/resourceInformation/setRefreshDuration", lang.hitch(this, this.setRefreshDuration)));

            this.subscribers.push(topic.subscribe("/dojox/mobile/afterTransitionIn", lang.hitch(this, function (transitionView) {
                if (transitionView.id == this.id) {
                }
            })));

            this.subscribers.push(topic.subscribe("/dojox/mobile/afterTransitionOut", lang.hitch(this, function (transitionView) {
                if (transitionView.id == this.id) {
                    if (this.resourceRefresh != null) {
                        clearInterval(this.resourceRefresh);
                        this.resourceRefresh = null;
                    }
                }
            })));
        }
    });
});
