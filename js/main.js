define([
    "dojo/_base/lang",
    "dojo/node!util",
    "dojo/node!express.io",
    "app/util/AppHelper",
    "app/util/ExpressHelper",
    "app/util/ResourceHelper",
    "app/util/WechatHelper"
], function (lang, util, express, AppHelper, ExpressHelper, ResourceHelper, WechatHelper) {
    return function (appDirName) {
        var appHelper = new AppHelper();

        appHelper.initApp();

        var app = express();

        app.http().io();

        var expressHelper = new ExpressHelper({
            appDirName: appDirName,
            app: app
        });

        var wechatHelper = new WechatHelper({
            token: "LivingStrategy"
        });

        app.configure(function () {
            app.use("/home", express.static(appDirName + "/home"));
            app.use("/www", express.static(appDirName + "/www"));
            app.use("/testWechat", lang.hitch(wechatHelper, wechatHelper.parseBody));
            app.use("/wechat", lang.hitch(wechatHelper, wechatHelper.parseBody));
        });

        app.get("/index.html", lang.hitch(expressHelper, expressHelper.handleIndex));

        app.get("/process", lang.hitch(expressHelper, expressHelper.handleProcess));

        app.get("/testWechat", lang.hitch(wechatHelper, wechatHelper.handleTest));

        app.post("/testWechat", lang.hitch(wechatHelper, wechatHelper.handleTest));

        app.get("/wechat", lang.hitch(wechatHelper, wechatHelper.handleGet));

        app.post("/wechat", lang.hitch(wechatHelper, wechatHelper.handlePost));

        //app.io.configure(lang.hitch(expressHelper, expressHelper.ioConfigure));

        app.io.set("authorization", lang.hitch(expressHelper, expressHelper.ioSetAuthorization));

        app.io.on("connection", lang.hitch(expressHelper, expressHelper.ioOnConnection));

        app.listen(process.env.PORT || 3000);
        console.log("Listening on port " + (process.env.PORT || 3000));
    };
});