(function(doc,win){
	var options = {
	},i = 0, t ,
	arr = location.hash.split("#")[1].split('&'),
	brige = {
		imgUrl: "http://km.oubamall.com/image/card/6.png", 
		link: location.href, 
		title:"春节贺卡制作",
		desc: "制作你的贺卡"
	};
	(function(){
		init();
		sdkInit();
	})();
	function init(){
		for(;i<arr.length;i++){
			options[arr[i].split("=")[0]] = decodeURIComponent(arr[i].split("=")[1])
		}

		$('html').css('fontSize', (doc.documentElement.clientWidth / 7.5) + 'px');
		$(win).resize(function() {
			$('html').css('fontSize', (doc.documentElement.clientWidth / 7.5) + 'px');
		});
		$(".back-it").css("backgroundImage","url('image/back/"+options.back+".png')")
		//step1
			if(options.name){
				$(".card-name").html(options.name+":");
				$(".card-word").html(options.word);
			}
			$(".model-it").css("backgroundImage","url('image/model/"+options.model+".png')")

	}

	function sdkInit(){
		$.ajax({
			url: "/api/wx_sdk",
			data: {url: location.href},
			success: function(rep){
				wx.config({
                    appId: rep.appid, // 必填，公众号的唯一标识
					timestamp: rep.timestamp, // 必填，生成签名的时间戳
					nonceStr: rep.noncestr, // 必填，生成签名的随机串
					signature: rep.signature,// 必填，签名，见附录1
					jsApiList: [
					"downloadVoice",
					"startRecord",
					"onVoiceRecordEnd",
					"playVoice",
					"pauseVoice",
					"stopVoice",
					"onVoicePlayEnd",
					"onMenuShareAppMessage",
					"onMenuShareTimeline",
					"uploadVoice",
                    "downloadVoice",
                    "stopRecord"] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
				});
				wx.ready(function(){
					wx.downloadVoice({
                        serverId: options.serverId, // 需要下载的音频的服务器端ID，由uploadVoice接口获得
                        isShowProgressTips: 1, // 默认为1，显示进度提示
                        success: function (resp) {
							t = setTimeout(function(){
								wx.playVoice({
									localId: resp.localId // 需要播放的音频的本地ID，由stopRecord接口获得
								})
								clearTimeout(t);
							}, 1000);
							
							//$(".music").click(function(){
							//	wx.playVoice({
							//		localId: resp.localId // 需要播放的音频的本地ID，由stopRecord接口获得
							//	});
							//})
                        }
                    });
					wxbriges(wx);
				})
			}
		})
	}
	
	function wxbriges(wx){
		wx.onMenuShareAppMessage({ 
			"imgUrl": brige.imgUrl, 
			"link": brige.link, 
			"title": brige.title,
			"desc": brige.desc, 
			"success": function(){
			}
		});
		wx.onMenuShareTimeline({
			"imgUrl": brige.imgUrl, 
			"link": brige.link, 
			"title": brige.title,
			"success": function(){
			},
			"cancel": function(){
			}
		}); 
	}
    // function netEvent(){
    //     $.ajax({
	// 		url: "/api/downOss",
	// 		data: {name: options.id},
	// 		success: function(rep){
    //             $("#playvideos").attr("src",rep.url);
    //             $(".music").click(function(){
    //                 $("#playvideos").get(0).play();
    //             });
	// 		}
	// 	})
    // }


})(document, window)    