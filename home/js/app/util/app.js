define([
    "app/util/Global",
    "app/util/GeneralHelper",
    "app/util/UiHelper",
    "app/util/NwHelper",
    "app/util/ServiceHelper",
    "dojo/domReady!"
], function (Global, GeneralHelper, UiHelper, NwHelper, ServiceHelper) {
    var app = Global.getInstance().app;

    if (!app.isInitialized) {
        app.generalHelper = new GeneralHelper();
        app.uiHelper = new UiHelper();
        app.nwHelper = new NwHelper();
        app.serviceHelper = new ServiceHelper();

        if (location.search.match(/locale=([\w\-]+)/) == null) {
            switch (app.language) {
                case "E":
                    app.generalHelper.switchBundle("en");
                    break;
                case "C":
                    app.generalHelper.switchBundle("zh");
                    break;
                case "S":
                    app.generalHelper.switchBundle("zh-cn");
                    break;
                default:
                    break;
            }
        }
        else {
            switch (location.search.match(/locale=([\w\-]+)/) ? RegExp.$1 : "en") {
                case "en":
                    app.generalHelper.switchBundle("en");
                    app.generalHelper.switchLanguage("E");
                    break;
                case "zh":
                    app.generalHelper.switchBundle("zh");
                    app.generalHelper.switchLanguage("C");
                    break;
                case "zh-cn":
                    app.generalHelper.switchBundle("zh-cn");
                    app.generalHelper.switchLanguage("S");
                    break;
                default:
                    break;
            }
        }

        app.isInitialized = true;
    }

    return app;
});
