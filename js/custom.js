/* 控制台输出 */
if(window.console) {
	var cons = console; 
	if(cons) { 
		cons.group("O(∩_∩)O哈喽！");
		cons.info("这位看代码的童鞋，不如留下你的友链来一起玩耍吧！"); 
		cons.log("%cYulin Lewis's Blog", "background-image: linear-gradient(#063053, #395873, #5c7c99);font-size: 2rem;");
		cons.info("==============================此乃分界线==============================");
		cons.log("  █████▒█    ██  ▄████▄   ██ ▄█▀       ██████╗ ██╗   ██╗ ██████╗\n▓██   ▒ ██  ▓██▒▒██▀ ▀█   ██▄█▒        ██╔══██╗██║   ██║██╔════╝\n▒████ ░▓██  ▒██░▒▓█    ▄ ▓███▄░        ██████╔╝██║   ██║██║  ███╗\n░▓█▒  ░▓▓█  ░██░▒▓▓▄ ▄██▒▓██ █▄        ██╔══██╗██║   ██║██║   ██║\n░▒█░   ▒▒█████▓ ▒ ▓███▀ ░▒██▒ █▄       ██████╔╝╚██████╔╝╚██████╔╝\n ▒ ░   ░▒▓▒ ▒ ▒ ░ ░▒ ▒  ░▒ ▒▒ ▓▒       ╚═════╝  ╚═════╝  ╚═════╝\n ░     ░░▒░ ░ ░   ░  ▒   ░ ░▒ ▒░\n ░ ░    ░░░ ░ ░ ░        ░ ░░ ░\n          ░     ░ ░      ░  ░\n")
		cons.groupEnd();
	} 
}

/* 返回随机颜色 */
function randomColor() {
	return "rgb("+~~(255*Math.random())+","+~~(255*Math.random())+","+~~(255*Math.random())+")";
}

/* 鼠标点击文字特效 */
var a_idx = 0;
var a_click = 1;
var a = new Array("富强", "民主", "文明", "和谐", "自由", "平等", "公正" ,"法治", "爱国", "敬业", "诚信", "友善",
			"老哥稳", "带我飞", "厉害了word哥", "扎心了老铁", "蓝瘦香菇", "还有这种操作?", "就是有这种操作",
			"皮皮虾我们走", "笑到猪叫", "石乐志", "不存在的", "黑车!", "我要下车!", "他还只是个孩子", "请不要放过他",
			"惊不惊喜?", "意不意外?", "我有一个大胆的想法", "你的良心不会痛吗", "你心里就没点b数吗", "没有,我很膨胀",
			"秀", "天秀", "陈独秀", "蒂花之秀", "造化钟神秀", "我去买几个橘子", "你就站在此地", "不要走动",
			"我可能读了假书", "贫穷限制了我的想象力", "打call", "当然是选择原谅她啊", "你有freestyle吗",
			"北大还行撒贝宁", "不知妻美刘强东", "悔创阿里杰克马", "一无所有王健林", "普通家庭马化腾",
			"别点了", "求求你别点了", "你还点", "你再点!", "有本事继续点!", "你厉害", "我投翔",
			"w(·Д·)w", "(#`O′)", "（/TДT)/", "┭┮﹏┭┮", "_(:3」∠)_");
jQuery(document).ready(function($) {
    $("body").click(function(e) {
		/* 点击频率，点击几次就换挂件 */
		var frequency = 3;
		if (a_click % frequency === 0) {
			
			var $i = $("<span/>").text(a[a_idx]);
			a_idx = (a_idx + 1) % a.length;
			var x = e.pageX,
			y = e.pageY;
			$i.css({
				"z-index": 9999,
				"top": y - 20,
				"left": x,
				"position": "absolute",
				"font-weight": "bold",
				"color": randomColor(),
				"-webkit-user-select": "none",
				"-moz-user-select": "none",
				"-ms-user-select": "none",
				"user-select": "none"
			});
			$("body").append($i);
			$i.animate({
				"top": y - 180,
				"opacity": 0
			},
			1500,
			function() {
				$i.remove();
			});
			
		}
	a_click ++;
		
    });
});

/* 点击头像更换b站挂件 */
var avatar_plug = 0;
jQuery(document).ready(function($) {
	/* 点击频率，点击几次就换挂件 */
	var frequency = 3;
	/* 头像挂件数量 */
	var plug_count = 44;
	$(".site-author-image-bilibili").click(function(e) {
		if (a_click % frequency === 0) {
			avatar_plug ++;
			$(".site-avatar-plug-bilibili").attr("src","/images/avatar-plug/bilibili_" + avatar_plug + ".png");
		}		
		if (avatar_plug === plug_count) {
			avatar_plug = 0;
		}
		$(".site-author-image-bilibili").attr("alt","再点击" + (frequency - a_click % frequency) + "次头像试试看~~");
		a_click ++;
	});
});

/* 轮播背景图片 */
$(function () {
	$.backstretch([
		  "/images/background/saber1.jpg",
		  "/images/background/saber2.jpg",
		  "/images/background/wlop.jpg"
	], { duration: 60000, fade: 1500 });
});

/* 拉姆蕾姆回到顶部或底部按钮 */
$(function() {
	$("#lamu img").eq(0).click(function() {
		$("html,body").animate({scrollTop:$(document).height()},800);
		return false;
	});
	$("#leimu img").eq(0).click(function() {
		$("html,body").animate({scrollTop:0},800);
		return false;
	});
});

/* 离开当前页面时修改网页标题，回到当前页面时恢复原来标题 */
window.onload = function() {
  var OriginTitile = document.title;
  var titleTime;
  document.addEventListener('visibilitychange', function() {
    if(document.hidden) {
      $('[rel="icon"]').attr('href', "/failure.ico");
      $('[rel="shortcut icon"]').attr('href', "/failure.ico");
      document.title = '喔唷，崩溃啦！';
      clearTimeout(titleTime);
    } else {
      $('[rel="icon"]').attr('href', "/favicon-32x32.png");
      $('[rel="shortcut icon"]').attr('href', "/favicon-32x32.png");
      document.title = '咦，页面又好了！';
      titleTime = setTimeout(function() {
        document.title = OriginTitile;
      }, 2000);
	}
  });
}