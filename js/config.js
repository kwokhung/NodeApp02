var path = require("path");

dojoConfig = {
    baseUrl: __dirname + path.sep,
    async: 1,
    hasCache: {
        "host-node": 1,
        "dom": 0
    },
    packages: [{
        name: "dojo",
        location: "dojo/dojo-release-1.10.0-src/dojo"
    }, {
        name: "app",
        location: "app"
    }, {
        name: "root",
        location: "."
    }]
};