define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/json",
    "dojo/on",
    "dojo/string",
    "dijit/registry",
    "app/util/special/mobile/SimpleDialog",
    "app/util/Global"
], function (declare, lang, json, on, string, registry, Dialog, Global) {
    var app = Global.getInstance().app;

    return declare(null, {
        timeout: 60000,
        requestService: function (serviceUrl, request, responseHandler) {
            var thisServiceHelper = this;
            var waitingDialog = thisServiceHelper._handleWaiting();

            waitingDialog.show().then(function (value) {
                return app.nwHelper.loadUrl(serviceUrl, {
                    method: "POST",
                    timeout: this.timeout,
                    content: request,
                    handle: function (response) {
                        waitingDialog.destroy();

                        if (response.constructor == Error) {
                            if (response.message == "Timeout") {
                                thisServiceHelper._handleException(app.bundle.MsgTimeout);
                            } else {
                                thisServiceHelper._handleException(response);
                            }
                        } else {
                            try {
                                var jsonResponse = ((typeof response == "string" || response.constructor == String) ? json.parse(response) : response);

                                if (jsonResponse.status == "true") {
                                    responseHandler(jsonResponse);
                                } else {
                                    thisServiceHelper._handleError(jsonResponse);
                                }
                            } catch (ex) {
                                thisServiceHelper._handleException(ex);
                            }
                        }
                    }
                });
            });
        },
        requestGetService: function (serviceUrl, request, responseHandler) {
            var thisServiceHelper = this;
            var waitingDialog = thisServiceHelper._handleWaiting();

            waitingDialog.show().then(function (value) {
                return app.nwHelper.loadUrl(serviceUrl, {
                    method: "GET",
                    timeout: this.timeout,
                    content: request,
                    handle: function (response) {
                        waitingDialog.destroy();

                        if (response.constructor == Error) {
                            if (response.message == "Timeout") {
                                thisServiceHelper._handleException(app.bundle.MsgTimeout);
                            } else {
                                thisServiceHelper._handleException(response);
                            }
                        } else {
                            try {
                                var jsonResponse = ((typeof response == "string" || response.constructor == String) ? json.parse(response) : response);

                                if (jsonResponse.status == "true") {
                                    responseHandler(jsonResponse);
                                } else {
                                    thisServiceHelper._handleError(jsonResponse);
                                }
                            } catch (ex) {
                                thisServiceHelper._handleException(ex);
                            }
                        }
                    }
                });
            });
        },
        requestTextService: function (serviceUrl, request, responseHandler) {
            var thisServiceHelper = this;
            var waitingDialog = thisServiceHelper._handleWaiting();

            waitingDialog.show().then(function (value) {
                return app.nwHelper.loadUrl(serviceUrl, {
                    method: "POST",
                    timeout: this.timeout,
                    content: request,
                    handle: function (response) {
                        waitingDialog.destroy();

                        if (response.constructor == Error) {
                            if (response.message == "Timeout") {
                                thisServiceHelper._handleException(app.bundle.MsgTimeout);
                            } else {
                                thisServiceHelper._handleException(response);
                            }
                        } else {
                            try {
                                var jsonResponse = ((typeof response == "string" || response.constructor == String) ? json.parse(response) : response);

                                responseHandler(jsonResponse);
                            } catch (ex) {
                                thisServiceHelper._handleException(ex);
                            }
                        }
                    }
                });
            });
        },
        requestGetTextService: function (serviceUrl, request, responseHandler) {
            var thisServiceHelper = this;
            var waitingDialog = thisServiceHelper._handleWaiting();

            waitingDialog.show().then(function (value) {
                return app.nwHelper.loadUrl(serviceUrl, {
                    method: "GET",
                    timeout: this.timeout,
                    content: request,
                    handle: function (response) {
                        waitingDialog.destroy();

                        if (response.constructor == Error) {
                            if (response.message == "Timeout") {
                                thisServiceHelper._handleException(app.bundle.MsgTimeout);
                            } else {
                                thisServiceHelper._handleException(response);
                            }
                        } else {
                            try {
                                var jsonResponse = ((typeof response == "string" || response.constructor == String) ? json.parse(response) : response);

                                responseHandler(jsonResponse);
                            } catch (ex) {
                                thisServiceHelper._handleException(ex);
                            }
                        }
                    }
                });
            });
        },
        requestTextServiceNoBlock: function (serviceUrl, request, responseHandler) {
            var thisServiceHelper = this;

            return app.nwHelper.loadUrl(serviceUrl, {
                method: "POST",
                timeout: this.timeout,
                content: request,
                handle: function (response) {
                    if (response.constructor == Error) {
                        if (response.message == "Timeout") {
                            thisServiceHelper._handleExceptionNoBlock(app.bundle.MsgTimeout);
                        } else {
                            thisServiceHelper._handleExceptionNoBlock(response);
                        }
                    } else {
                        try {
                            var jsonResponse = ((typeof response == "string" || response.constructor == String) ? json.parse(response) : response);

                            responseHandler(jsonResponse);
                        } catch (ex) {
                            thisServiceHelper._handleExceptionNoBlock(ex);
                        }
                    }
                }
            });
        },
        requestGetTextServiceNoBlock: function (serviceUrl, request, responseHandler) {
            var thisServiceHelper = this;

            return app.nwHelper.loadUrl(serviceUrl, {
                method: "GET",
                timeout: this.timeout,
                content: request,
                handle: function (response) {
                    if (response.constructor == Error) {
                        if (response.message == "Timeout") {
                            thisServiceHelper._handleExceptionNoBlock(app.bundle.MsgTimeout);
                        } else {
                            thisServiceHelper._handleExceptionNoBlock(response);
                        }
                    } else {
                        try {
                            var jsonResponse = ((typeof response == "string" || response.constructor == String) ? json.parse(response) : response);

                            responseHandler(jsonResponse);
                        } catch (ex) {
                            thisServiceHelper._handleExceptionNoBlock(ex);
                        }
                    }
                }
            });
        },
        _handleWaiting: function (ex) {
            var waitingDialog = new Dialog({
                "class": "dlgProcessing",
                title: app.bundle.MsgProcessing,
                content: app.bundle.MsgPleaseWait,
                draggable: false
            });

            return waitingDialog;
        },
        _handleError: function (response) {
            var systemErrorDialog = new Dialog({
                title: app.bundle.MsgSystemError,
                content: string.substitute(app.bundle.MsgInvalidRequest, response),
                progressable: false
            });

            if (response.errCode == "-1" || response.errCode == "-2") {
                on(systemErrorDialog, "hide", function () {
                });
            }

            systemErrorDialog.show();
        },
        _handleException: function (ex) {
            var exceptionErrorDialog = new Dialog({
                title: app.bundle.MsgSystemError,
                content: ex.toString(),
                progressable: false
            });

            exceptionErrorDialog.show();
        },
        _handleExceptionNoBlock: function (ex) {
            console.debug(ex.toString());
        }
    });
});
