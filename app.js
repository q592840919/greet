var utils = {}, config = {
},connection,app,wechat;
function init(){
    utilsInit();
    // connectDb();
    api();
}


function utilsInit(){
    var fs = utils.fs = require('fs'),deps;
    
	utils.readJson = function(path){
		if(!fs.existsSync(path)){
			return false;
		}
		var t = fs.readFileSync(path);
		return eval('('+ t +')');
    };

    deps =  utils.readJson('package.json').devDependencies;

    utils.typeOf = function(o){
		return Object.prototype.toString.call(o).match(/ (\w+)/)[1].toLowerCase();
    };
    
	for(var k in deps){
		var name = k.indexOf('-')>-1 ? k.split('-')[1] : k
		utils[name] = require(k);
    }
    
    wechat = new utils.api("wx4ca06a3bd4d56583","9f8fdfc3c6195a611200b4e47dab5695");
}


function api(){
     app = utils.express();
    //  主页输出 "Hello World"
    app.get('/api/down', function (req, res) {
        // //构建私有空间的链接
        url = 'http://domains/keys';
        var policy = new qiniu.rs.GetPolicy();
        //生成下载链接url
        var downloadUrl = policy.makeRequest(url);
        //打印下载的url
    });

    app.get('/api/wx_sdk',function(req,res){
        var noncestr = Math.random().toString(36).substr(2),
        timestamp = Math.floor(Date.now()/1000), //精确到秒
        jsapi_ticket,
        url = req.query.url,
        conf = {
            appid : "wx4ca06a3bd4d56583",
            secret: "9f8fdfc3c6195a611200b4e47dab5695",
            accessTokenUrl: "https://api.weixin.qq.com/cgi-bin/token",
            ticketUrl: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket',
            cache_duration: 1000*60*60*24
        };
        // if(utils.cache.get('ticket')){
        //     jsapi_ticket = utils.cache.get('ticket');
        //     res.send({
        //         noncestr:noncestr,
        //         timestamp:timestamp,
        //         signature: utils.sha1('jsapi_ticket=' + jsapi_ticket + '&noncestr=' + noncestr + '×tamp=' + timestamp + '&url=' + url)
        //     });
        // }else
        utils.request(conf.accessTokenUrl + '?grant_type=client_credential' +  '&appid=' + conf.appid + '&secret=' + conf.secret ,function(error, response, body){
            if (!error && response.statusCode == 200) {
                var tokenMap = JSON.parse(body);
                utils.request(conf.ticketUrl + '?access_token=' + tokenMap.access_token + '&type=jsapi', function(error, resp, json){
                    
                    if (!error && response.statusCode == 200) {
                        var ticketMap = JSON.parse(json);
                        utils.cache.put('ticket',ticketMap.ticket,conf.cache_duration);  //加入缓存
                        res.send({
                            appid: conf.appid,
                            noncestr:noncestr,
                            timestamp:timestamp,
                            signature: utils.sha1('jsapi_ticket=' + ticketMap.ticket + '&noncestr=' + noncestr + '&timestamp=' + timestamp + '&url=' + url)
                        });
                    }
                })
            }
        })
    });

    app.get('/api/alioss',function(req,response){
        wechat.getMedia(req.query.media_id,function(err,results,res){
        var client = new utils.oss({
            region: 'oss-cn-beijing',
            accessKeyId: 'LTAI812ewabPIoEt',
            accessKeySecret: 'LtWEYZJ7HyuLC5U6DIoTeH5joAOeNh',
            bucket: 'greetcardinput',
            endpoint: 'http://oss-cn-hangzhou.aliyuncs.com'
        });
        
        utils.co(function* () {
            console.log(results);
        // use 'chunked encoding'
            var result = yield client.put("video/"+"ssss"+'.amr', results);
            response.send({success:true});
        // don't use 'chunked encoding'
            }).catch(function (err) {
                console.log(err);
              });;
        })
    });
    app.get("/api/downOss",function(req,res){
        var client = new utils.oss({
            region: 'oss-cn-beijing',
            accessKeyId: 'LTAI812ewabPIoEt',
            accessKeySecret: 'LtWEYZJ7HyuLC5U6DIoTeH5joAOeNh',
            bucket: 'greetcardoutput',
            endpoint: 'http://oss-cn-hangzhou.aliyuncs.com'
        });
        res.send({
            url: client.signatureUrl("video/"+req.query.name+'.mp4', {expires: 3600})
        }) 
    })
}
init();

    app.use(utils.express.static("dist"));
    app.listen(80);
