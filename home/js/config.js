var dojoConfig = {
    baseUrl: ".",
    tlmSiblingOfDojo: false,
    selectorEngine: "lite",
    isDebug: true,
    parseOnLoad: false,
    async: true,
    hashPollFrequency: 100,
    packages: [{
        "name": "dojo",
        "location": "http://ajax.googleapis.com/ajax/libs/dojo/1.9.1/dojo"
    }, {
        "name": "dojox",
        "location": "http://ajax.googleapis.com/ajax/libs/dojo/1.9.1/dojox"
    }, {
        "name": "dijit",
        "location": "http://ajax.googleapis.com/ajax/libs/dojo/1.9.1/dijit"
    }, {
        "name": "app",
        "location": "js/app"
    }],
    locale: (location.search.match(/locale=([\w\-]+)/) ? RegExp.$1 : "en"),
    extraLocale: [
        "en",
        "zh",
        "zh-cn"
    ],
    dojoBlankHtmlUrl: "js/dojo/resources/blank.html"
};