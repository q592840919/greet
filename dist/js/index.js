(function(doc,win){
	var cid,localId,serverId,
     modelList = [{
		name: "工程师/男",
		id: "model1",
	},{
		name: "工人/男",
		id: "model2",
	},{
		name: "唐装/男",
		id: "model3",
	},{
		name: "西服/男",
		id: "model4",
	},{
		name: "工程师/女",
		id: "model5",
	},{
		name: "工人/女",
		id: "model6",
	},{
		name: "唐装/女",
		id: "model7",
	},{
		name: "西服/女",
		id: "model8",
	}],backList = [{
		name: "室外",
		id: "back1",
	},{
		name: "室内",
		id: "back2",
	}],options = {
		cardSet :{
			model: 'model1',
			back: 'back1',
			name: '',
			word: '',
			id: ''
		},
		brige: {
			imgUrl: "http://km.oubamall.com/image/card/6.png", 
			link: location.href, 
			title:"春节贺卡制作",
			desc: "制作你的贺卡"
		},
		 qrCode: {
			render: "image",
			ecLevel: "H",
			minVersion: 6,
	
			fill: "#da232a",
			background: "#ffffff",
			// fill: jq('#img-buffer')[0],
	
			text: "",
			size: 398,
			radius: 0,
			quiet: 5,
	
			mode: 2,
			top: -5,
			mSize: 0.103,
			mPosX: 0.50,
			mPosY: 0.50,
			label: '捷普祝您新春快乐',
			fontcolor: '#e66627',
			//image: $('#logoFor')[0]
		}
	};
	(function(){
		init();
		uievent();
		sdkInit();
	})();

	function uievent(){
		//自适应屏幕
		$(win).resize(function() {
			$('html').css('fontSize', (doc.documentElement.clientWidth / 7.5) + 'px');
		});
		//step1
		$(".go-next").click(function(){
			$(".concent").hide();
			$(this).parent().next().css("display","table");
			options.cardSet.name =  $(".two-name").val();
			options.cardSet.word = $(".two-word").val();
			if(options.cardSet.name){
				$(".card-name").html($(".two-name").val()+":");
				$(".card-word").html(options.cardSet.word);
			}
			$(".audio-it").get(0).pause();
			window.scrollTo(0,0);
		});
		$(".audio-it").get(0).play();
		//step2
		$(".model-list").on('click','li',function(){
			options.cardSet.model =  $(this).get(0).className;
			$(".model-it").css("backgroundImage","url('image/model/"+options.cardSet.model+".png')")
		});
		$(".back-list").on('click','li',function(){
			options.cardSet.back = $(this).get(0).className;
			$(".back-it").css("backgroundImage","url('image/back/"+options.cardSet.back+".png')")
		});
		//step3
		$(".back-two").click(function(){
			$(".concent").hide();
			$(".step-two").show();
			window.scrollTo(0,0);
		})

		$(".go-finish").click(function(){
            options.qrCode.text = location.origin + "/greet.html#" +  "id=" + options.cardSet.id 
			+  "&serverId=" + serverId
			+  "&back=" + options.cardSet.back
			+  "&model=" + options.cardSet.model
			+  "&name=" + encodeURIComponent(options.cardSet.name)
			+  "&word=" + encodeURIComponent(options.cardSet.word);
			$('#qrCode').empty().qrcode(options.qrCode);
			$(".qr-code").show();
			window.scrollTo(0, document.querySelector('.step-three').scrollHeight)
		});
	}

	function init(){
		//自适应屏幕
		$('html').css('fontSize', (doc.documentElement.clientWidth / 7.5) + 'px');
		reloadView();
		$(".step-one").one('touchstart',function(){
			$(".audio-it").get(0).play();
		});
	}

	function reloadView(){
		modelView();
		backView();
	}

	function modelView(){
		var i = 0 ,list = '' ;
		for(;i<modelList.length;i++){
			list = list + '<li class="'+modelList[i].id+'">'+modelList[i].name+'</li>';
		}
		$(".model-list").html(list)
	}

	function backView(){
		var i = 0 ,list = '' ;
		for(;i<backList.length;i++){
			list = list + '<li class="'+backList[i].id+'">'+backList[i].name+'</li>';
		}
		$(".back-list").html(list)
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
					record(wx);
					wxbriges(wx);
				})
			}
		})
	}

    
	function record(wx){
		$('#talk_btn').click(function(event){
            if($(this).html()=="结束录音"){
                wx.stopRecord({
                    success: function (res) {
						localId = res.localId;
						uploadVoice();
                    },
                    fail: function (res) {
                    }
                  });
                  $(this).html("重新录音").removeClass("on-checking");
            }else{
                event.preventDefault();
                wx.startRecord({
                    success: function(){
                        localStorage.rainAllowRecord = 'true';
                        
                    },
                    cancel: function () {
                        alert('用户拒绝授权录音');
                    }
                });
                $(this).html("结束录音").addClass("on-checking");
            }
        });
        
        $("#listen_btn").click(function(){
			if(cid){
				wx.playVoice({
					localId: cid // 需要播放的音频的本地ID，由stopRecord接口获得
				});
				$("#listen_btn").addClass("on-checking");
				wx.onVoicePlayEnd({
					success: function (res) {
						$("#listen_btn").removeClass("on-checking");
					}
				});
			}
        })
		//上传录音
		
    }
    

		function uploadVoice(){
			wx.uploadVoice({
				localId: localId, // 需要上传的音频的本地ID，由stopRecord接口获得
				isShowProgressTips: 1, // 默认为1，显示进度提示
				success: function (res) {
					//把录音在微信服务器上的id（res.serverId）
					serverId  = res.serverId;
					console.log(serverId);
					alert("录音完毕");
                    wx.downloadVoice({
                        serverId: serverId, // 需要下载的音频的服务器端ID，由uploadVoice接口获得
                        isShowProgressTips: 1, // 默认为1，显示进度提示
                        success: function (resp) {
                            cid = options.cardSet.id = resp.localId; // 返回音频的本地ID
                        }
                    });
				}
            });
		}

		function wxbriges(wx){
			wx.onMenuShareAppMessage({ 
				"imgUrl": options.brige.imgUrl, 
				"link": options.brige.link, 
				"title": options.brige.title,
				"desc": options.brige.desc, 
				"success": function(){
				}
			});
			wx.onMenuShareTimeline({
				"imgUrl": options.brige.imgUrl, 
				"link": options.brige.link, 
				"title": options.brige.title,
				"success": function(){
				},
				"cancel": function(){
				}
			}); 
		}
		
		window.alert = function(name){
			 var iframe = document.createElement("IFRAME");
			iframe.style.display="none";
			iframe.setAttribute("src", 'data:text/plain,');
			document.documentElement.appendChild(iframe);
			window.frames[0].window.alert(name);
			iframe.parentNode.removeChild(iframe);
		}
})(document, window)