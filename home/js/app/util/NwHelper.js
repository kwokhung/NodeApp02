define([
    "dojo/_base/declare",
    "dojo/request/xhr",
    "dojo/request/script",
    "dojo/request/iframe",
    "dojox/io/windowName",
    "app/util/Global"
], function (declare, xhr, script, iframe, windowName, Global) {
    var app = Global.getInstance().app;

    return declare(null, {
        parseUrl: function (url) {
            //app.generalHelper.dumpObject("url", url);
            var urlRegExp = new RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?$", "i");
            var urlArray = urlRegExp.exec(url);

            if (urlArray[4] != null) {
                var authorityRegExp = new RegExp("^(([^@]+)@)?([^:]*)(:(.*))?$", "i");
                var authorityArray = authorityRegExp.exec(urlArray[4]);
            }

            var parseUrl = {
                "schemeName": urlArray[2],
                "userInfo": (urlArray[4] == null ? null : authorityArray[2]),
                "hostName": (urlArray[4] == null ? null : authorityArray[3]),
                "port": (urlArray[4] == null ? null : authorityArray[5]),
                "path": urlArray[5],
                "query": urlArray[7],
                "fragment": urlArray[9]
            };

            //app.generalHelper.dumpObject("parseUrl", parseUrl);
            return parseUrl;
        },
        isCrossDomain: function (url) {
            var windowUrl = this.parseUrl(window.location);

            if (windowUrl.hostName == "127.0.0.1") {
                windowUrl.hostName = "localhost";
            }

            if (windowUrl.schemeName == "http" && (windowUrl.port == null || windowUrl.port == "")) {
                windowUrl.port = "80";
            }

            if (windowUrl.schemeName == "https" && (windowUrl.port == null || windowUrl.port == "")) {
                windowUrl.port = "443";
            }

            var thisUrl = this.parseUrl(url);

            if (thisUrl.hostName == "127.0.0.1") {
                thisUrl.hostName = "localhost";
            }

            if (thisUrl.schemeName == "http" && (thisUrl.port == null || thisUrl.port == "")) {
                thisUrl.port = "80";
            }

            if (thisUrl.schemeName == "https" && (thisUrl.port == null || thisUrl.port == "")) {
                thisUrl.port = "443";
            }

            if (thisUrl.schemeName == null || thisUrl.schemeName == "") {
                thisUrl.schemeName = windowUrl.schemeName;
            }

            if (thisUrl.hostName == null || thisUrl.hostName == "") {
                thisUrl.hostName = windowUrl.hostName;
            }

            if (thisUrl.port == null || thisUrl.port == "") {
                thisUrl.port = windowUrl.port;
            }

            var isCrossDomain = ((windowUrl.schemeName != thisUrl.schemeName) || (windowUrl.hostName != thisUrl.hostName) || (windowUrl.port != thisUrl.port));
            //app.generalHelper.dumpObject("isCrossDomain", isCrossDomain);

            return isCrossDomain;
        },
        isDifferentHost: function (url) {
            var windowUrl = this.parseUrl(window.location);

            if (windowUrl.hostName == "127.0.0.1") {
                windowUrl.hostName = "localhost";
            }

            var thisUrl = this.parseUrl(url);

            if (thisUrl.hostName == "127.0.0.1") {
                thisUrl.hostName = "localhost";
            }

            if (thisUrl.hostName == null || thisUrl.hostName == "") {
                thisUrl.hostName = windowUrl.hostName;
            }

            var isDifferentHost = (windowUrl.hostName != thisUrl.hostName);
            //app.generalHelper.dumpObject("isDifferentHost", isDifferentHost);

            return isDifferentHost;
        },
        loadUrl: function (serviceUrl, request) {
            //app.generalHelper.dumpObject("serviceUrl", serviceUrl);
            //app.generalHelper.dumpObject("request", request);
            if (serviceUrl.substring(0, 4) == "http" && this.isCrossDomain(serviceUrl)) {
                if (request.method == null || request.method == "GET") {
                    if (this.isDifferentHost(serviceUrl)/* || true*/) {
                        if (this.parseUrl(serviceUrl).hostName == "www.guococom.com") {
                            return windowName.send("GET", {
                                url: serviceUrl,
                                preventCache: true,
                                timeout: request.timeout
                            }).addBoth(request.handle);
                        }
                        else {
                            return script.get(serviceUrl, {
                                preventCache: true,
                                timeout: request.timeout,
                                jsonp: "callback"
                            }).then(request.handle);
                        }
                    }
                    else {
                        return script.get(serviceUrl, {
                            preventCache: true,
                            timeout: request.timeout,
                            jsonp: "callback"
                        }).then(request.handle);
                        /*return iframe.get(serviceUrl, {
                        query: { "iframe":"true" },
                        preventCache: true,
                        timeout: request.timeout,
                        handleAs: "json"
                        }).then(request.handle);*/
                    }
                } else {
                    if (this.isDifferentHost(serviceUrl)/* || true*/) {
                        if (this.parseUrl(serviceUrl).hostName == "www.guococom.com") {
                            return windowName.send("POST", {
                                url: serviceUrl,
                                preventCache: true,
                                timeout: request.timeout,
                                form: request.form,
                                content: request.content
                            }).addBoth(request.handle);
                        }
                        else {
                            return script.get(serviceUrl, {
                                preventCache: true,
                                timeout: request.timeout,
                                jsonp: "callback",
                                query: request.content
                            }).then(request.handle);
                        }
                    }
                    else {
                        return script.get(serviceUrl, {
                            preventCache: true,
                            timeout: request.timeout,
                            jsonp: "callback",
                            query: request.content
                        }).then(request.handle);
                        /*return iframe.post(serviceUrl, {
                        query: { "iframe":"true" },
                        preventCache: true,
                        timeout: request.timeout,
                        data: request.content,
                        handleAs: "json"
                        }).then(request.handle);*/
                    }
                }
            } else {
                if (request.method == null || request.method == "GET") {
                    return xhr.get(serviceUrl, {
                        preventCache: true,
                        sync: request.sync,
                        timeout: request.timeout,
                        handleAs: (request.handleAs == null ? "text" : request.handleAs)
                    }).then(request.handle);
                } else {
                    return xhr.post(serviceUrl, {
                        preventCache: true,
                        sync: request.sync,
                        timeout: request.timeout,
                        data: request.content,
                        handleAs: (request.handleAs == null ? "text" : request.handleAs)
                    }).then(request.handle);
                }
            }
        }
    });
});
