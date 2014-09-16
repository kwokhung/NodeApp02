define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/string",
    "dojo/node!async",
    "dojo/node!request",
    "dojo/node!util",
    "dojo/node!crypto",
    "dojo/node!http",
    "dojo/node!https",
    "dojo/node!connect",
    "dojo/node!xml2js"
], function (declare, lang, array, string, async, request, util, crypto, http, https, connect, xml2js) {
    return declare("app.util.WechatHelper", null, {
        token: null,
        constructor: function (kwArgs) {
            lang.mixin(this, kwArgs);
        },
        parseBody: function (req, res, next) {
            if (req.method.toUpperCase() != "POST") {
                return next();
            }

            //if (connect.utils.mime(req) != "" && connect.utils.mime(req).toLowerCase() != "text/xml") {
            if (!req.is("") && !req.is("text/xml")) {
                return next();
            }

            if (req._body) {
                return next();
            }

            req.body = req.body || {};
            req._body = true;

            var requestDataXml = "";

            req.setEncoding("utf8");

            req.on("data", function (data) {
                requestDataXml += data;
            });

            req.on("end", function () {
                console.log(requestDataXml);
                xml2js.parseString(requestDataXml, { trim: true }, function (error, requestDataJson) {
                    if (error) {
                        error.status = 400;
                        next(error);
                    } else {
                        req.body = requestDataJson;
                        next();
                    }
                });
            });
        },
        checkSignature: function (req) {
            //console.log(this.token);
            //console.log(req.query.timestamp);
            //console.log(req.query.nonce);
            //console.log(req.query.signature);
            if (crypto.createHash("sha1").update([
                this.token,
                req.query.timestamp,
                req.query.nonce
            ].sort().join("")).digest("hex") == req.query.signature) {
                //console.log("true");
                return true;
            }
            else {
                //console.log("false");
                return false;
            }
        },
        handleTest_new: function (req, res) {
            if (this.checkSignature(req) == true) {
                var now = this.nowaday();

                res.type("xml");

                this.handleScanEvent_8002(now, req, res);
            }
            else {
                res.writeHead(401);
                res.end("Signature is invalid");
            }
        },
        handleTest: function (req, res) {
            var access_token = "";
            var openid = null;
            var users = [];

            async.series([
                function (callback) {
                    request({
                        url: "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxe5653dce80baa14e&secret=da9e92a7245fdfb6bbd0b5c271908c21",
                        method: "GET",
                        headers: {
                            "Accept": "application/json"
                        }
                    }, function (error, response, body) {
                        if (error) {
                            callback(error);
                        }
                        else {
                            access_token = JSON.parse(body).access_token;

                            callback(null, access_token);
                        }
                    })
                },
                function (callback) {
                    request({
                        url: "https://api.weixin.qq.com/cgi-bin/user/get?access_token=" + access_token,
                        method: "GET",
                        headers: {
                            "Accept": "application/json"
                        }
                    }, function (error, response, body) {
                        if (error) {
                            callback(error);
                        }
                        else if (JSON.parse(body).count <= 0) {
                            callback("error");
                        }
                        else {
                            openid = JSON.parse(body).data.openid;

                            callback(null, openid);
                        }
                    })
                },
                function (callback) {
                    async.eachSeries(openid, function (item, callback) {
                        request({
                            url: "https://api.weixin.qq.com/cgi-bin/user/info?access_token=" + access_token + "&openid=" + item + "&lang=zh_CN",
                            method: "GET",
                            headers: {
                                "Accept": "application/json"
                            }
                        }, function (error, response, body) {
                            if (error) {
                                callback(error);
                            }
                            else {
                                users.push(item + ": " + JSON.parse(body).nickname);

                                callback(null);
                            }
                        });
                    }, function (error) {
                        if (error) {
                            callback(error);
                        }
                        else {
                            callback(null, users);
                        }
                    });
                }
            ],
            function (error, results) {
                if (error) {
                    res.send(error);
                }
                else {
                    res.send(results);
                }
            });
        },
        handleGet: function (req, res) {
            if (this.checkSignature(req) == true) {
                res.writeHead(200);
                res.end(req.query.echostr);
            }
            else {
                res.writeHead(401);
                res.end("Signature is invalid");
            }
        },
        handlePost: function (req, res) {
            if (this.checkSignature(req) == true) {
                var now = this.nowaday();

                res.type("xml");

                switch (req.body.xml.MsgType[0].toLowerCase()) {
                    case "text":
                        this.handleText(now, req, res);

                        break;

                    case "image":
                        this.handleImage(now, req, res);

                        break;

                    case "voice":
                        this.handleVoice(now, req, res);

                        break;

                    case "video":
                        this.handleVideo(now, req, res);

                        break;

                    case "location":
                        this.handleLocation(now, req, res);

                        break;

                    case "link":
                        this.handleLink(now, req, res);

                        break;

                    case "event":
                        this.handleEvent(now, req, res);

                        break;

                    default:
                        this.handleOther(now, req, res);

                        break;
                }

                /*if (typeof req.io != "undefined" && req.io != null) {
                    req.data = {
                        who: req.body.xml.FromUserName[0],
                        what: util.inspect(req.body, false, null),
                        when: new Date((parseInt(req.body.xml.CreateTime[0]) * 1000)).yyyyMMddHHmmss()
                    };

                    req.io.route("resource:tell.other");
                }*/
            }
            else {
                res.writeHead(401);
                res.end("Signature is invalid");
            }
        },
        handleText: function (now, req, res) {
            res.send(this.renderArticle({
                ToUserName: req.body.xml.FromUserName,
                FromUserName: req.body.xml.ToUserName,
                CreateTime: Math.round(now.time / 1000),
                Content: req.body.xml.Content[0],
                Articles: [{
                    Title: "Text",
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: string.substitute(
                        "Current Time: ${CurrentTime}\n\n" +
                        "Current Time Zone: ${CurrentTimeZone}\n\n" +
                        "HK Time: ${HkTime}\n\n" +
                        "Message Id: ${MsgId}\n\n" +
                        "Message type: ${MsgType}\n\n" +
                        "Create Time: ${CreateTime}\n\n" +
                        "From User: ${FromUserName}\n\n" +
                        "To User: ${ToUserName}", {
                            CurrentTime: now.time.dateFormat(),
                            CurrentTimeZone: now.timeZone,
                            HkTime: now.hkDate.getTime().dateFormat(),
                            MsgId: (typeof req.body.xml.MsgId == "undefined" ? "" : req.body.xml.MsgId[0]),
                            MsgType: req.body.xml.MsgType[0],
                            CreateTime: (parseInt(req.body.xml.CreateTime[0]) * 1000).dateFormat(),
                            FromUserName: req.body.xml.FromUserName[0],
                            ToUserName: req.body.xml.ToUserName[0]
                        }),
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: string.substitute("Content: ${Content}", { Content: req.body.xml.Content[0] }),
                    Description: "",
                    PicUrl: "",
                    Url: string.substitute("${GoogleUrl}/#q=${Content}", { GoogleUrl: "https://www.google.com.hk", Content: req.body.xml.Content[0] })
                }, {
                    Title: util.inspect(req.body, false, null),
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }]
            }));
        },
        handleImage: function (now, req, res) {
            res.send(this.renderImage({
                ToUserName: req.body.xml.FromUserName,
                FromUserName: req.body.xml.ToUserName,
                CreateTime: Math.round(now.time / 1000),
                MediaId: req.body.xml.MediaId[0],
                Articles: [{
                    Title: "Image",
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: string.substitute(
                        "Current Time: ${CurrentTime}\n\n" +
                        "Current Time Zone: ${CurrentTimeZone}\n\n" +
                        "HK Time: ${HkTime}\n\n" +
                        "Message Id: ${MsgId}\n\n" +
                        "Message type: ${MsgType}\n\n" +
                        "Create Time: ${CreateTime}\n\n" +
                        "From User: ${FromUserName}\n\n" +
                        "To User: ${ToUserName}", {
                            CurrentTime: now.time.dateFormat(),
                            CurrentTimeZone: now.timeZone,
                            HkTime: now.hkDate.getTime().dateFormat(),
                            MsgId: (typeof req.body.xml.MsgId == "undefined" ? "" : req.body.xml.MsgId[0]),
                            MsgType: req.body.xml.MsgType[0],
                            CreateTime: (parseInt(req.body.xml.CreateTime[0]) * 1000).dateFormat(),
                            FromUserName: req.body.xml.FromUserName[0],
                            ToUserName: req.body.xml.ToUserName[0]
                        }),
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: string.substitute("Picture Url: ${PicUrl}", { PicUrl: req.body.xml.PicUrl[0] }),
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: string.substitute("Media Id: ${MediaId}", { MediaId: req.body.xml.MediaId[0] }),
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: util.inspect(req.body, false, null),
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }]
            }));
        },
        handleVoice: function (now, req, res) {
            res.send(this.renderVoice({
                ToUserName: req.body.xml.FromUserName,
                FromUserName: req.body.xml.ToUserName,
                CreateTime: Math.round(now.time / 1000),
                MediaId: req.body.xml.MediaId[0],
                Articles: [{
                    Title: "Voice",
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: string.substitute(
                        "Current Time: ${CurrentTime}\n\n" +
                        "Current Time Zone: ${CurrentTimeZone}\n\n" +
                        "HK Time: ${HkTime}\n\n" +
                        "Message Id: ${MsgId}\n\n" +
                        "Message type: ${MsgType}\n\n" +
                        "Create Time: ${CreateTime}\n\n" +
                        "From User: ${FromUserName}\n\n" +
                        "To User: ${ToUserName}", {
                            CurrentTime: now.time.dateFormat(),
                            CurrentTimeZone: now.timeZone,
                            HkTime: now.hkDate.getTime().dateFormat(),
                            MsgId: (typeof req.body.xml.MsgId == "undefined" ? "" : req.body.xml.MsgId[0]),
                            MsgType: req.body.xml.MsgType[0],
                            CreateTime: (parseInt(req.body.xml.CreateTime[0]) * 1000).dateFormat(),
                            FromUserName: req.body.xml.FromUserName[0],
                            ToUserName: req.body.xml.ToUserName[0]
                        }),
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: string.substitute("Media Id: ${MediaId}", { MediaId: req.body.xml.MediaId[0] }),
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: string.substitute("Format: ${Format}", { Format: req.body.xml.Format[0] }),
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: string.substitute("Recognition: ${Recognition}", { Recognition: req.body.xml.Recognition[0] }),
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: util.inspect(req.body, false, null),
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }]
            }));
        },
        handleVideo: function (now, req, res) {
            res.send(this.renderVideo({
                ToUserName: req.body.xml.FromUserName,
                FromUserName: req.body.xml.ToUserName,
                CreateTime: Math.round(now.time / 1000),
                MediaId: req.body.xml.MediaId[0],
                ThumbMediaId: req.body.xml.ThumbMediaId[0],
                Articles: [{
                    Title: "Video",
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: string.substitute(
                        "Current Time: ${CurrentTime}\n\n" +
                        "Current Time Zone: ${CurrentTimeZone}\n\n" +
                        "HK Time: ${HkTime}\n\n" +
                        "Message Id: ${MsgId}\n\n" +
                        "Message type: ${MsgType}\n\n" +
                        "Create Time: ${CreateTime}\n\n" +
                        "From User: ${FromUserName}\n\n" +
                        "To User: ${ToUserName}", {
                            CurrentTime: now.time.dateFormat(),
                            CurrentTimeZone: now.timeZone,
                            HkTime: now.hkDate.getTime().dateFormat(),
                            MsgId: (typeof req.body.xml.MsgId == "undefined" ? "" : req.body.xml.MsgId[0]),
                            MsgType: req.body.xml.MsgType[0],
                            CreateTime: (parseInt(req.body.xml.CreateTime[0]) * 1000).dateFormat(),
                            FromUserName: req.body.xml.FromUserName[0],
                            ToUserName: req.body.xml.ToUserName[0]
                        }),
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: string.substitute("Media Id: ${MediaId}", { MediaId: req.body.xml.MediaId[0] }),
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: string.substitute("ThumbMediaId: ${ThumbMediaId}", { ThumbMediaId: req.body.xml.ThumbMediaId[0] }),
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: util.inspect(req.body, false, null),
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }]
            }));
        },
        handleLocation: function (now, req, res) {
            res.send(this.renderArticle({
                ToUserName: req.body.xml.FromUserName,
                FromUserName: req.body.xml.ToUserName,
                CreateTime: Math.round(now.time / 1000),
                Articles: [{
                    Title: "Location",
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: string.substitute(
                        "Current Time: ${CurrentTime}\n\n" +
                        "Current Time Zone: ${CurrentTimeZone}\n\n" +
                        "HK Time: ${HkTime}\n\n" +
                        "Message Id: ${MsgId}\n\n" +
                        "Message type: ${MsgType}\n\n" +
                        "Create Time: ${CreateTime}\n\n" +
                        "From User: ${FromUserName}\n\n" +
                        "To User: ${ToUserName}", {
                            CurrentTime: now.time.dateFormat(),
                            CurrentTimeZone: now.timeZone,
                            HkTime: now.hkDate.getTime().dateFormat(),
                            MsgId: (typeof req.body.xml.MsgId == "undefined" ? "" : req.body.xml.MsgId[0]),
                            MsgType: req.body.xml.MsgType[0],
                            CreateTime: (parseInt(req.body.xml.CreateTime[0]) * 1000).dateFormat(),
                            FromUserName: req.body.xml.FromUserName[0],
                            ToUserName: req.body.xml.ToUserName[0]
                        }),
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: string.substitute("Location X: ${Location_X}", { Location_X: req.body.xml.Location_X[0] }),
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: string.substitute("Location Y: ${Location_Y}", { Location_Y: req.body.xml.Location_Y[0] }),
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: string.substitute("Scale: ${Scale}", { Scale: req.body.xml.Scale[0] }),
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: string.substitute("Label: ${Label}", { Label: req.body.xml.Label[0] }),
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: util.inspect(req.body, false, null),
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }]
            }));
        },
        handleLink: function (now, req, res) {
            res.send(this.renderArticle({
                ToUserName: req.body.xml.FromUserName,
                FromUserName: req.body.xml.ToUserName,
                CreateTime: Math.round(now.time / 1000),
                Articles: [{
                    Title: "Link",
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: string.substitute(
                        "Current Time: ${CurrentTime}\n\n" +
                        "Current Time Zone: ${CurrentTimeZone}\n\n" +
                        "HK Time: ${HkTime}\n\n" +
                        "Message Id: ${MsgId}\n\n" +
                        "Message type: ${MsgType}\n\n" +
                        "Create Time: ${CreateTime}\n\n" +
                        "From User: ${FromUserName}\n\n" +
                        "To User: ${ToUserName}", {
                            CurrentTime: now.time.dateFormat(),
                            CurrentTimeZone: now.timeZone,
                            HkTime: now.hkDate.getTime().dateFormat(),
                            MsgId: (typeof req.body.xml.MsgId == "undefined" ? "" : req.body.xml.MsgId[0]),
                            MsgType: req.body.xml.MsgType[0],
                            CreateTime: (parseInt(req.body.xml.CreateTime[0]) * 1000).dateFormat(),
                            FromUserName: req.body.xml.FromUserName[0],
                            ToUserName: req.body.xml.ToUserName[0]
                        }),
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: string.substitute("Url: ${Url}", { Url: req.body.xml.Url[0] }),
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: string.substitute("Title: ${Title}", { Title: req.body.xml.Title[0] }),
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: string.substitute("Description: ${Description}", { Description: req.body.xml.Description[0] }),
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: util.inspect(req.body, false, null),
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }]
            }));
        },
        handleEvent: function (now, req, res) {
            if (req.body.xml.Event[0].toUpperCase() == "CLICK") {
                switch (req.body.xml.EventKey[0].toLowerCase()) {
                    case "g_trade_online":
                        this.handleClickEvent_g_trade_online(now, req, res);

                        break;

                    case "g_trade_easy":
                        this.handleClickEvent_g_trade_easy(now, req, res);

                        break;

                    case "g_trade_premium":
                        this.handleClickEvent_g_trade_premium(now, req, res);

                        break;

                    case "g_trade_qianlong":
                        this.handleClickEvent_g_trade_qianlong(now, req, res);

                        break;

                    case "g_trade_mobile":
                        this.handleClickEvent_g_trade_mobile(now, req, res);

                        break;

                    case "g_service_securities":
                        this.handleClickEvent_g_service_securities(now, req, res);

                        break;

                    case "g_service_commodities":
                        this.handleClickEvent_g_service_commodities(now, req, res);

                        break;

                    case "g_service_corporate_finance":
                        this.handleClickEvent_g_service_corporate_finance(now, req, res);

                        break;

                    case "g_service_research":
                        this.handleClickEvent_g_service_research(now, req, res);

                        break;

                    case "g_service_fees":
                        this.handleClickEvent_g_service_fees(now, req, res);

                        break;

                    case "g_about_we":
                        this.handleClickEvent_g_about_we(now, req, res);

                        break;

                    case "g_about_contact":
                        this.handleClickEvent_g_about_contact(now, req, res);

                        break;

                    default:
                        this.handleEvent_default(now, req, res);

                        break;
                }
            }
            else if (req.body.xml.Event[0].toLowerCase() == "subscribe") {
                switch (req.body.xml.EventKey[0].toLowerCase()) {
                    case "qrscene_8001":
                        this.handleSubscribeEvent_8001(now, req, res);

                        break;

                    case "qrscene_8002":
                        this.handleSubscribeEvent_8002(now, req, res);

                        break;

                    default:
                        this.handleEvent_default(now, req, res);

                        break;
                }
            }
            else if (req.body.xml.Event[0].toUpperCase() == "SCAN") {
                switch (req.body.xml.EventKey[0].toLowerCase()) {
                    case "8001":
                        this.handleScanEvent_8001(now, req, res);

                        break;

                    case "8002":
                        this.handleScanEvent_8002(now, req, res);

                        break;

                    default:
                        this.handleEvent_default(now, req, res);

                        break;
                }
            }
            else {
                this.handleEvent_default(now, req, res);
            }
        },
        handleClickEvent_g_trade_online: function (now, req, res) {
            res.send(this.renderArticle({
                ToUserName: req.body.xml.FromUserName,
                FromUserName: req.body.xml.ToUserName,
                CreateTime: Math.round(now.time / 1000),
                Articles: [{
                    Title: "網上證券服務",
                    Description: "國浩資本互聯網是一個資訊豐富、互動、使用方便、可靠的網站。客戶可靈活運用以下服務，作出投資決定：\r\n\r\n● 即時股價剪影\r\n● 即時串流股票報價*\r\n● 電子提示服務 (如：到價提示)#\r\n● 即時道瓊斯新聞\r\n● 今天攻略及熱股推介\r\n● 證券研究報告\r\n● 圖表分析",
                    PicUrl: "",
                    //Url: "https://www.guococap.com/ttl/ssl/userlogin-main.asp?RetPage=%2Fttl%2FtradingPlatform%2FtradingPlatform.asp%3F"
                    Url: "http://livingstrategy.duapp.com/home/mobile.html"
                }]
            }));
        },
        handleClickEvent_g_trade_easy: function (now, req, res) {
            res.send(this.renderArticle({
                ToUserName: req.body.xml.FromUserName,
                FromUserName: req.body.xml.ToUserName,
                CreateTime: Math.round(now.time / 1000),
                Articles: [{
                    Title: "快易寶",
                    Description: "「快易寶」是本公司全新推出的下載版網上交易平台（只適用於微軟視窗系統）。只需數個步驟，客戶可從本公司網頁下載「快易寶」到桌面，並使用客戶現有之登入名稱及密碼直接進行證券交易。此外，新介面簡單易用，並可根據個人喜好重新設定，讓客戶更容易查詢所需的資料，有助客戶落盤更快更直接。「快易寶」功能全面提昇，功能包括：\r\n\r\n● 現金提取指示\r\n● 落盤情況*\r\n● 交收指示\r\n● 最新報價\r\n● 電子賬單\r\n● 串流報價\r\n● 新股認購\r\n● 投資回報計算\r\n● 個人介面設定\r\n● 戶口結餘",
                    PicUrl: "http://www.guococap.com/images/GCAP-EasyTradePic.png",
                    Url: "http://www.guococap.com/ttl/tradingPlatform/tradingPlatform.asp?#EasyTrade"
                }]
            }));
        },
        handleClickEvent_g_trade_premium: function (now, req, res) {
            res.send(this.renderArticle({
                ToUserName: req.body.xml.FromUserName,
                FromUserName: req.body.xml.ToUserName,
                CreateTime: Math.round(now.time / 1000),
                Articles: [{
                    Title: "證券至尊",
                    Description: "本公司推出「證券至尊」交易平台以迎合專業及頻繁買賣的客戶，此平台能協助客戶有效提昇落盤速度，對於瞬息萬變的市場，令客戶能時刻捕捉先機。客戶只需於微軟視窗系統 內安裝「證券至尊」程式便可以極速的使用買賣服務。此外，新介面簡單易用，並可根據個人喜好重新設定介面，讓客戶更容易查詢所需的資料，有助客戶落盤更快更直接，自然更加得心應手。「證券至尊」功能卓越，客戶可直接查詢最新投資組合、落盤情況、戶口結餘、最新報價、及提供多種下單類別，例如：\r\n\r\n基本功能：\r\n\r\n● 限價盤\r\n● 競價限價盤\r\n● 觸發盤",
                    PicUrl: "http://www.guococap.com/images/GCAP-SecuritiesPRO.png",
                    Url: "http://www.guococap.com/ttl/tradingPlatform/tradingPlatform.asp?#SecPRO"
                }]
            }));
        },
        handleClickEvent_g_trade_qianlong: function (now, req, res) {
            res.send(this.renderArticle({
                ToUserName: req.body.xml.FromUserName,
                FromUserName: req.body.xml.ToUserName,
                CreateTime: Math.round(now.time / 1000),
                Articles: [{
                    Title: "錢龍",
                    Description: "錢龍是中國首個實時市場分析和網上交易平台。透過 DDN 專線從港交所接收即時資料，將滬深港三大股市資訊集於一體，為客戶提供專業的投資分析、技術分析圖表、即市排行分析等穩定及可靠資訊。\r\n\r\n「錢龍」為慣常使用內地網站的客戶提供另一版面以供選擇，但同時融入香港投資者喜用的大利市系統。客戶可在這個集多種優點於一個平台上，隨時隨地享受更快更直接的落盤體驗。",
                    PicUrl: "http://www.guococap.com/images/GCAP-QianglongPic.png",
                    Url: "http://www.guococap.com/ttl/tradingPlatform/tradingPlatform.asp?#QianLong"
                }]
            }));
        },
        handleClickEvent_g_trade_mobile: function (now, req, res) {
            res.send(this.renderArticle({
                ToUserName: req.body.xml.FromUserName,
                FromUserName: req.body.xml.ToUserName,
                CreateTime: Math.round(now.time / 1000),
                Articles: [{
                    Title: "掌中寶",
                    Description: "「掌中寶」是本公司全新推出的iPhone/Android網上交易平台，只需於Apple App Store及Google Play下載便可即時使用。客戶可透過「掌中寶」登入本公司的網上交易平台，以進行交易買賣、查閱買賣進展、交易記錄、賬戶及股票結餘。客戶更透過「掌中寶」查詢免費股市排行及指數。\r\n\r\n註：此服務對應iPhone, iPod touch及iPad並需配備iPhone OS 3.0或以上的運作系統及Android 操作系統 2.2 或以上。使用此服務需要使用流動數據，您的流動網絡供應商可能會就您的數據傳輸用量收取費用。有關流動數據收費詳情，請向您的流動網絡供應商查詢。",
                    PicUrl: "http://www.guococap.com/images/GCAP-TradingPlatform/iphone.png",
                    Url: "http://www.guococap.com/ttl/tradingPlatform/tradingPlatform.asp?#Mobile"
                }]
            }));
        },
        handleClickEvent_g_service_securities: function (now, req, res) {
            res.send(this.renderArticle({
                ToUserName: req.body.xml.FromUserName,
                FromUserName: req.body.xml.ToUserName,
                CreateTime: Math.round(now.time / 1000),
                Articles: [{
                    Title: "證券買賣",
                    Description: "本公司可代您在下列市場買賣證券：\r\n\r\n    香港\r\n    美國*\r\n    上海B股*\r\n    深圳B股*\r\n    日本*\r\n    澳洲*\r\n    加拿大*\r\n    馬來西亞*\r\n    新加坡*\r\n    印尼*\r\n    菲律賓*\r\n\r\n* 只可透過經紀發出買賣指示",
                    PicUrl: "http://www.guococap.com/Images/secbrokC.jpg",
                    Url: "http://www.guococap.com/ttl/AboutGCAP/SecBrokingServicemain.asp"
                }]
            }));
        },
        handleClickEvent_g_service_commodities: function (now, req, res) {
            res.send(this.renderArticle({
                ToUserName: req.body.xml.FromUserName,
                FromUserName: req.body.xml.ToUserName,
                CreateTime: Math.round(now.time / 1000),
                Articles: [{
                    Title: "期貨買賣 (服務由國浩期貨商品提供)",
                    Description: "",
                    PicUrl: "",
                    Url: "http://www.guococap.com/ttl/AboutGCAP/FuturesBrokingmain.asp"
                }, {
                    Title: "香港期貨及期權",
                    Description: "",
                    PicUrl: "http://www.guococap.com/Images/HKFuturesBtnC.jpg",
                    Url: "http://www.guococap.com/ttl/AboutGCAP/HKFuturesBrokingDetails.asp"
                }, {
                    Title: "環球期貨",
                    Description: "",
                    PicUrl: "http://www.guococap.com/Images/GlobalFuturesBtnC.jpg",
                    Url: "http://www.guococap.com/ttl/AboutGCAP/GlobalFuturesBrokingDetails.asp"
                }]
            }));
        },
        handleClickEvent_g_service_corporate_finance: function (now, req, res) {
            res.send(this.renderArticle({
                ToUserName: req.body.xml.FromUserName,
                FromUserName: req.body.xml.ToUserName,
                CreateTime: Math.round(now.time / 1000),
                Articles: [{
                    Title: "企業融資",
                    Description: "自本公司在一九九七年成立企業融資部以來，一直積極從事集資的工作，以及充當企業的財務顧問，致力為客戶提供專業、創新和以客為先的財務顧問服務。國浩資本亦為一家首批於創業板上市公司的保薦人，可見本公司亦積極發展新興的創業板市場。\r\n\r\n企業融資服務協助有關公司在股票市場籌集資金，對經紀核心業務起相輔相成的作用。本公司為企業客戶提供的服務包括：\r\n\r\n● 主板及創業板上市；\r\n● 股份配售；\r\n● 收購合併、企業重組、分拆、供股及出售資產等財務顧問服務。\r\n\r\n查詢詳情，請致電本公司企業融資部 (852) 2218 2859。",
                    PicUrl: "http://www.guococap.com/Images/corpfinC.jpg",
                    Url: "http://www.guococap.com/ttl/AboutGCAP/corpfinancemain.asp"
                }]
            }));
        },
        handleClickEvent_g_service_research: function (now, req, res) {
            res.send(this.renderArticle({
                ToUserName: req.body.xml.FromUserName,
                FromUserName: req.body.xml.ToUserName,
                CreateTime: Math.round(now.time / 1000),
                Articles: [{
                    Title: "證券研究",
                    Description: "國浩資本研究部致力為客戶提供各種內容豐富，見解精闢的研究報告，報告以分析公司價值、影響盈利的因素及與同業比較作為研究重點。",
                    PicUrl: "http://www.guococap.com/Images/research_2C.jpg",
                    Url: "http://www.guococap.com/ttl/AboutGCAP/ServiceResearchmain.asp"
                }]
            }));
        },
        handleClickEvent_g_service_fees: function (now, req, res) {
            res.send(this.renderArticle({
                ToUserName: req.body.xml.FromUserName,
                FromUserName: req.body.xml.ToUserName,
                CreateTime: Math.round(now.time / 1000),
                Articles: [{
                    Title: "服務收費",
                    Description: "",
                    PicUrl: "http://www.guococap.com/images/feesAndCharges/hkSecurities/hk-securitiesC.jpg",
                    Url: "http://www.guococap.com/ttl/AboutGCAP/FeesCharges.asp"
                }]
            }));
        },
        handleClickEvent_g_about_we: function (now, req, res) {
            res.send(this.renderArticle({
                ToUserName: req.body.xml.FromUserName,
                FromUserName: req.body.xml.ToUserName,
                CreateTime: Math.round(now.time / 1000),
                Articles: [{
                    Title: "關於國浩資本",
                    Description: "於1981年創立的國浩資本有限公司是一間歷史悠久、根基穩健的證券經紀行。多年來，國浩資本的客戶來自各個階層， 而國浩資本也引進了一系列現代化的服務，如互聯網及自動買賣熱線(互動話音系統)等。\r\n\r\n國浩資本乃香港聯合交易所上巿公司國浩集團有限公司(股票代號：0053)的全資附屬公司。國浩集團附屬公司及聯營公司之主要業務包括投資及財資管理、地產發展及投資、 證券及期貨商品經紀業務、保險業務、投資顧問服務、基金管理、銀行及金融業務以及酒店投資及管理。其業務主要分佈在香港、新加坡、馬來西亞、中國及英國等地。\r\n\r\n國浩資本在香港聯合交易所佔有五個席位，主要從事買賣股票業務。國浩資本的姊妹公司國浩期貨商品有限公司 在香港期貨交易所亦佔兩個席位，專責代客買賣恆生指數期貨及恆生中國企業指數期貨。\r\n\r\n國浩資本也為客戶提供證券市場研究、網上認購新股 、孖展融資、託存服務和代理人服務 ;亦為公司客戶安排企業融資及充當財務顧問。 除了協助企業在主板市場上市外，國浩資本也積極保薦企業在創業板，即香港的第二板市場上巿。",
                    PicUrl: "http://www.guococap.com/Images/logononani.gif",
                    Url: "http://www.guococap.com/ttl/AboutGCAP/AboutGCAP.asp"
                }]
            }));
        },
        handleClickEvent_g_about_contact: function (now, req, res) {
            res.send(this.renderArticle({
                ToUserName: req.body.xml.FromUserName,
                FromUserName: req.body.xml.ToUserName,
                CreateTime: Math.round(now.time / 1000),
                Articles: [{
                    Title: "聯絡我們",
                    Description: "香港總辦事處及客戶服務熱線\r\n電話 : 	(852) - 2218-2818\r\n傳真 : 	(852) - 2285-3128\r\n電郵地址 : 	info@guococap.com\r\n地址 : 	香港中環皇后大道中99號中環中心12樓",
                    PicUrl: "http://www.guococap.com/Images/Hd.jpg",
                    Url: "http://www.guococap.com/ttl/FAQmain/helpdesk.asp"
                }]
            }));
        },
        handleEvent_default: function (now, req, res) {
            res.send(this.renderArticle({
                ToUserName: req.body.xml.FromUserName,
                FromUserName: req.body.xml.ToUserName,
                CreateTime: Math.round(now.time / 1000),
                Articles: [{
                    Title: "Event",
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: string.substitute(
                        "Current Time: ${CurrentTime}\n\n" +
                        "Current Time Zone: ${CurrentTimeZone}\n\n" +
                        "HK Time: ${HkTime}\n\n" +
                        "Message Id: ${MsgId}\n\n" +
                        "Message type: ${MsgType}\n\n" +
                        "Create Time: ${CreateTime}\n\n" +
                        "From User: ${FromUserName}\n\n" +
                        "To User: ${ToUserName}", {
                            CurrentTime: now.time.dateFormat(),
                            CurrentTimeZone: now.timeZone,
                            HkTime: now.hkDate.getTime().dateFormat(),
                            MsgId: (typeof req.body.xml.MsgId == "undefined" ? "" : req.body.xml.MsgId[0]),
                            MsgType: req.body.xml.MsgType[0],
                            CreateTime: (parseInt(req.body.xml.CreateTime[0]) * 1000).dateFormat(),
                            FromUserName: req.body.xml.FromUserName[0],
                            ToUserName: req.body.xml.ToUserName[0]
                        }),
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: string.substitute("Event: ${Event}", { Event: req.body.xml.Event[0] }),
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: string.substitute("Event Key: ${EventKey}", { EventKey: req.body.xml.EventKey[0] }),
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: util.inspect(req.body, false, null),
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }]
            }));
        },
        handleSubscribeEvent_8001: function (now, req, res) {
            res.send(this.renderArticle({
                ToUserName: req.body.xml.FromUserName,
                FromUserName: req.body.xml.ToUserName,
                CreateTime: Math.round(now.time / 1000),
                Articles: [{
                    Title: "歡迎您",
                    Description: "登記成為我們的會員即享購物優惠\r\n推廣期至2014年2月28日止",
                    PicUrl: "http://www.haomama.com/wp-content/uploads/2011/08/haomama_front-banner-2_644x291.jpg",
                    Url: "http://livingstrategy.duapp.com/home/lamsoonMain.html?blkMainContent=lamsoon/RegisterDetails"
                }]
            }));
        },
        handleSubscribeEvent_8002: function (now, req, res) {
            res.send(this.renderArticle({
                ToUserName: req.body.xml.FromUserName,
                FromUserName: req.body.xml.ToUserName,
                CreateTime: Math.round(now.time / 1000),
                Articles: [{
                    Title: "歡迎您",
                    Description: "登記成為我們的會員即享購物優惠\r\n推廣期至2014年2月28日止",
                    PicUrl: "http://www.haomama.com/wp-content/uploads/2011/08/haomama_front-banner-2_644x291.jpg",
                    Url: "http://livingstrategy.duapp.com/home/lamsoonMain.html?blkMainContent=lamsoon/RegisterDetails"
                }]
            }));
        },
        handleSubscribeEvent_8002: function (now, req, res) {
            var access_token = "";
            var userName = "";

            async.series([
                function (callback) {
                    request({
                        url: "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxe5653dce80baa14e&secret=da9e92a7245fdfb6bbd0b5c271908c21",
                        method: "GET",
                        headers: {
                            "Accept": "application/json"
                        }
                    }, function (error, response, body) {
                        if (error) {
                            callback(error);
                        }
                        else {
                            access_token = JSON.parse(body).access_token;

                            callback(null, access_token);
                        }
                    });
                },
                function (callback) {
                    request({
                        url: "https://api.weixin.qq.com/cgi-bin/user/info?access_token=" + access_token + "&openid=" + req.body.xml.FromUserName + "&lang=zh_CN",
                        method: "GET",
                        headers: {
                            "Accept": "application/json"
                        }
                    }, function (error, response, body) {
                        if (error) {
                            callback(error);
                        }
                        else {
                            userName = JSON.parse(body).nickname;

                            callback(null, userName);
                        }
                    });
                }
            ], lang.hitch(this, function (error, results) {
                if (error) {
                    res.send(this.renderArticle({
                        ToUserName: req.body.xml.FromUserName,
                        FromUserName: req.body.xml.ToUserName,
                        CreateTime: Math.round(now.time / 1000),
                        Articles: [{
                            Title: "歡迎您",
                            Description: "登記成為我們的會員即享購物優惠\r\n推廣期至2014年2月28日止",
                            PicUrl: "http://www.haomama.com/wp-content/uploads/2011/08/haomama_front-banner-2_644x291.jpg",
                            Url: "http://livingstrategy.duapp.com/home/lamsoonMain.html?blkMainContent=lamsoon/RegisterDetails"
                        }]
                    }));
                }
                else {
                    res.send(this.renderArticle({
                        ToUserName: req.body.xml.FromUserName,
                        FromUserName: req.body.xml.ToUserName,
                        CreateTime: Math.round(now.time / 1000),
                        Articles: [{
                            Title: "歡迎您，" + userName,
                            Description: "登記成為我們的會員即享購物優惠\r\n推廣期至2014年2月28日止",
                            PicUrl: "http://www.haomama.com/wp-content/uploads/2011/08/haomama_front-banner-2_644x291.jpg",
                            Url: "http://livingstrategy.duapp.com/home/lamsoonMain.html?blkMainContent=lamsoon/RegisterDetails"
                        }]
                    }));
                }
            }));
        },
        handleScanEvent_8001: function (now, req, res) {
            res.send(this.renderArticle({
                ToUserName: req.body.xml.FromUserName,
                FromUserName: req.body.xml.ToUserName,
                CreateTime: Math.round(now.time / 1000),
                Articles: [{
                    Title: "您好",
                    Description: "以優惠價$20換購金像牌菠蘿包預拌粉500g一盒",
                    PicUrl: "http://www.haomama.com/wp-content/uploads/2013/12/LSQ73_HMM_OnlineCoupon_L3OP-247x300.jpg",
                    Url: "http://livingstrategy.duapp.com/home/lamsoonMain.html?blkMainContent=lamsoon/Promotion01"
                }]
            }));
        },
        handleScanEvent_8002: function (now, req, res) {
            var access_token = "";
            var userName = "";

            async.series([
                function (callback) {
                    request({
                        url: "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxe5653dce80baa14e&secret=da9e92a7245fdfb6bbd0b5c271908c21",
                        method: "GET",
                        headers: {
                            "Accept": "application/json"
                        }
                    }, function (error, response, body) {
                        if (error) {
                            callback(error);
                        }
                        else {
                            access_token = JSON.parse(body).access_token;

                            callback(null, access_token);
                        }
                    });
                },
                function (callback) {
                    request({
                        url: "https://api.weixin.qq.com/cgi-bin/user/info?access_token=" + access_token + "&openid=" + req.body.xml.FromUserName + "&lang=zh_CN",
                        method: "GET",
                        headers: {
                            "Accept": "application/json"
                        }
                    }, function (error, response, body) {
                        if (error) {
                            callback(error);
                        }
                        else {
                            userName = JSON.parse(body).nickname;

                            callback(null, userName);
                        }
                    });
                }
            ], lang.hitch(this, function (error, results) {
                if (error) {
                    res.send(this.renderArticle({
                        ToUserName: req.body.xml.FromUserName,
                        FromUserName: req.body.xml.ToUserName,
                        CreateTime: Math.round(now.time / 1000),
                        Articles: [{
                            Title: "您好",
                            Description: "以優惠價$20換購金像牌菠蘿包預拌粉500g一盒",
                            PicUrl: "http://www.haomama.com/wp-content/uploads/2013/12/LSQ73_HMM_OnlineCoupon_L3OP-247x300.jpg",
                            Url: "http://livingstrategy.duapp.com/home/lamsoonMain.html?blkMainContent=lamsoon/Promotion01"
                        }]
                    }));
                }
                else {
                    res.send(this.renderArticle({
                        ToUserName: req.body.xml.FromUserName,
                        FromUserName: req.body.xml.ToUserName,
                        CreateTime: Math.round(now.time / 1000),
                        Articles: [{
                            Title: userName + "，您好",
                            Description: "以優惠價$20換購金像牌菠蘿包預拌粉500g一盒",
                            PicUrl: "http://www.haomama.com/wp-content/uploads/2013/12/LSQ73_HMM_OnlineCoupon_L3OP-247x300.jpg",
                            Url: "http://livingstrategy.duapp.com/home/lamsoonMain.html?blkMainContent=lamsoon/Promotion01"
                        }]
                    }));
                }
            }));
        },
        handleOther: function (now, req, res) {
            res.send(this.renderArticle({
                ToUserName: req.body.xml.FromUserName,
                FromUserName: req.body.xml.ToUserName,
                CreateTime: Math.round(now.time / 1000),
                Content: string.substitute(
                    "\n" +
                    "Current Time: ${CurrentTime}\n\n" +
                    "Current Time Zone: ${CurrentTimeZone}\n\n" +
                    "HK Time: ${HkTime}\n\n" +
                    "Raw Data: ${RawData}", {
                        CurrentTime: now.time.dateFormat(),
                        CurrentTimeZone: now.timeZone,
                        HkTime: now.hkDate.getTime().dateFormat(),
                        RawData: util.inspect(req.body, false, null)
                    }),
                Title: "最炫民族风",
                Description: "Song: 最炫民族风",
                MusicUrl: "http://stream10.qqmusic.qq.com/31432174.mp3",
                HQMusicUrl: "http://stream10.qqmusic.qq.com/31432174.mp3",
                Articles: [{
                    Title: "Apple",
                    Description: "To see an apple in a dream is a favorable sign. Red apples in green leave lead to good luck and prosperity. Ripe apples on a tree mean that it is the time of living activities. But if you see one apple at the top of a tree, think if your plans are real. Dropped apples on earth symbolize flattery of false friends. A rotten apple is a symbol of useless attempts. If you see rotten and wormy apples, then it leads to failures.",
                    PicUrl: "http://eofdreams.com/data_images/dreams/apple/apple-05.jpg",
                    Url: "http://eofdreams.com/apple.html"
                }, {
                    Title: "To see an apple in a dream is a favorable sign. Red apples in green leave lead to good luck and prosperity. Ripe apples on a tree mean that it is the time of living activities. But if you see one apple at the top of a tree, think if your plans are real. Dropped apples on earth symbolize flattery of false friends. A rotten apple is a symbol of useless attempts. If you see rotten and wormy apples, then it leads to failures.",
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: "Bananas",
                    Description: "If you see the dream with bananas, in reality you should work with colleagues who cause in you negative emotions. To eat the bananas in a dream - to stagnation in affairs. Also additional burdensome duties will fall down you. To trade the bananas - to the unprofitable transaction.",
                    PicUrl: "http://eofdreams.com/data_images/dreams/bananas/bananas-04.jpg",
                    Url: "http://eofdreams.com/bananas.html"
                }, {
                    Title: "If you see the dream with bananas, in reality you should work with colleagues who cause in you negative emotions. To eat the bananas in a dream - to stagnation in affairs. Also additional burdensome duties will fall down you. To trade the bananas - to the unprofitable transaction.",
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }, {
                    Title: util.inspect(req.body, false, null),
                    Description: "",
                    PicUrl: "",
                    Url: ""
                }]
            }));
        },
        nowaday: function () {
            var currentDate = new Date();
            var currentTime = currentDate.getTime();
            var currentTimeZone = 0 - currentDate.getTimezoneOffset() / 60;

            var hkDate = currentDate;
            hkDate.setHours(hkDate.getHours() - currentTimeZone + 8);

            return {
                date: currentDate,
                time: currentTime,
                timeZone: currentTimeZone,
                hkDate: hkDate
            };
        },
        renderText: function (data) {
            return string.substitute(
                "<xml>" +
                    "<ToUserName><![CDATA[${ToUserName}]]></ToUserName>" +
                    "<FromUserName><![CDATA[${FromUserName}]]></FromUserName>" +
                    "<CreateTime>${CreateTime}</CreateTime>" +
                    "<MsgType><![CDATA[text]]></MsgType>" +
                    "<Content><![CDATA[${Content}]]></Content>" +
                "</xml>", data);
        },
        renderImage: function (data) {
            return string.substitute(
                "<xml>" +
                    "<ToUserName><![CDATA[${ToUserName}]]></ToUserName>" +
                    "<FromUserName><![CDATA[${FromUserName}]]></FromUserName>" +
                    "<CreateTime>${CreateTime}</CreateTime>" +
                    "<MsgType><![CDATA[image]]></MsgType>" +
                    "<Image>" +
                    "<MediaId><![CDATA[${MediaId}]]></MediaId>" +
                    "</Image>" +
                "</xml>", data);
        },
        renderVoice: function (data) {
            return string.substitute(
                "<xml>" +
                    "<ToUserName><![CDATA[${ToUserName}]]></ToUserName>" +
                    "<FromUserName><![CDATA[${FromUserName}]]></FromUserName>" +
                    "<CreateTime>${CreateTime}</CreateTime>" +
                    "<MsgType><![CDATA[voice]]></MsgType>" +
                    "<Voice>" +
                    "<MediaId><![CDATA[${MediaId}]]></MediaId>" +
                    "</Voice>" +
                "</xml>", data);
        },
        renderVideo: function (data) {
            return string.substitute(
                "<xml>" +
                    "<ToUserName><![CDATA[${ToUserName}]]></ToUserName>" +
                    "<FromUserName><![CDATA[${FromUserName}]]></FromUserName>" +
                    "<CreateTime>${CreateTime}</CreateTime>" +
                    "<MsgType><![CDATA[video]]></MsgType>" +
                    "<Video>" +
                    "<MediaId><![CDATA[${MediaId}]]></MediaId>" +
                    "<ThumbMediaId><![CDATA[${ThumbMediaId}]]></ThumbMediaId>" +
                    "</Video>" +
                "</xml>", data);
        },
        renderMusic: function (data) {
            return string.substitute(
                "<xml>" +
                    "<ToUserName><![CDATA[${ToUserName}]]></ToUserName>" +
                    "<FromUserName><![CDATA[${FromUserName}]]></FromUserName>" +
                    "<CreateTime>${CreateTime}</CreateTime>" +
                    "<MsgType><![CDATA[music]]></MsgType>" +
                    "<Music>" +
                    "<Title><![CDATA[${Title}]]></Title>" +
                    "<Description><![CDATA[${Description}]]></Description>" +
                    "<MusicUrl><![CDATA[${MusicUrl}]]></MusicUrl>" +
                    "<HQMusicUrl><![CDATA[${HQMusicUrl}]]></HQMusicUrl>" +
                    "</Music>" +
                "</xml>", data);
        },
        renderArticle: function (data) {
            var result = string.substitute(
                "<xml>" +
                    "<ToUserName><![CDATA[${ToUserName}]]></ToUserName>" +
                    "<FromUserName><![CDATA[${FromUserName}]]></FromUserName>" +
                    "<CreateTime>${CreateTime}</CreateTime>" +
                    "<MsgType><![CDATA[news]]></MsgType>" +
                    "<ArticleCount>" + data.Articles.length + "</ArticleCount>" +
                    "<Articles>", data);

            array.forEach(data.Articles, function (item, index) {
                result += string.substitute(
                    "<item>" +
                    "<Title><![CDATA[${Title}]]></Title>" +
                    "<Description><![CDATA[${Description}]]></Description>" +
                    "<PicUrl><![CDATA[${PicUrl}]]></PicUrl>" +
                    "<Url><![CDATA[${Url}]]></Url>" +
                    "</item>", item);
            });

            result += string.substitute(
                    "</Articles>" +
                "</xml>", data);

            return result;
        }
    });
});
