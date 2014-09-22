define([
    "dojo/_base/declare",
    "dojo/cookie",
    "dojo/i18n!app/nls/Bundle"
], function (declare, cookie, bundle) {
    var Global = declare(null, {
        app: {
            isInitialized: false,
            bundle: bundle,
            generalHelper: null,
            uiHelper: null,
            nwHelper: null,
            serviceHelper: null,
            cordova: null,
            device: null,
            navigator: null,
            currentViewId: "",
            previousViewId: "",
            language: (cookie("language") == null ? "E" : cookie("language"))
        }
    });

    Global._instance = null;

    Global.getInstance = function () {
        return (Global._instance == null ? new Global() : Global._instance);
    };

    return Global;
});
