define([
    "dojo/_base/declare",
    "app/util/Global"
], function (declare, Global) {
    var app = Global.getInstance().app;

    return declare(null, {
        openNewWindow: function (path, winName) {
            var width = screen.width - 200;
            var height = screen.height - 200;
            var windowProperties = string.substitute("left=${left},top=${top},width=${width},height=${height},resizable=yes,scrollbars=yes,toolbar=no,location=no,directories=no,status=no,menubar=no,copyhistory=no", {
                "left": (screen.width - width) / 2,
                "top": (screen.height - height) / 2,
                "width": width,
                "height": height
            });

            window.open(string.substitute("${url}", {
                url: path
            }), winName, windowProperties);
        },
        openParentWindow: function (path) {
            parent.location.href = path;
        }
    });
});
