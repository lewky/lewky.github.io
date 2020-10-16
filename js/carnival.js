setTimeout('le()',1000);
function le() {
    function loadCss() {      //将css文件引入页面
        var myCss = document.createElement("link");
        myCss.setAttribute("type", "text/css");
        myCss.setAttribute("rel", "stylesheet");
        myCss.setAttribute("href", cssHref);  //css文件地址
        myCss.setAttribute("class", l);
        document.body.appendChild(myCss)
    }
    function h() {
        var e = document.getElementsByClassName(l);
        for (var t = 0; t < e.length; t++) {
            document.body.removeChild(e[t])
        }
    }
    function p() {
        var e = document.createElement("div");
        e.setAttribute("class", a);
        document.body.appendChild(e);
        setTimeout(function() {
            document.body.removeChild(e)
        },
        100)
    }
    function getSize(e) {   //获取目标的宽高
        return {
            height: e.offsetHeight,
            width: e.offsetWidth
        }
    }
    function checkSize(i) {     //判断目标大小是否符合要求
        var s = getSize(i);     //获取目标的宽高
        return s.height > minHeight && s.height < maxHeight && s.width > minWidth && s.width < maxWidth     //判断目标是否符合条件
    }
    function m(e) {
        var t = e;
        var n = 0;
        while ( !! t) {
            n += t.offsetTop;
            t = t.offsetParent
        }
        return n
    }
    function g() {
        var e = document.documentElement;
        if ( !! window.innerWidth) {
            return window.innerHeight
        } else if (e && !isNaN(e.clientHeight)) {
            return e.clientHeight
        }
        return 0
    }
    function y() {
        if (window.pageYOffset) {
            return window.pageYOffset
        }
        return Math.max(document.documentElement.scrollTop, document.body.scrollTop)
    }
    function E(e) {
        var t = m(e);
        return t >= w && t <= b + w
    }
    function setBgm() {  //设置音乐
        var e = document.createElement("audio");
        e.setAttribute("class", l);
        e.src = bgmSrc;  //bgm地址
        e.loop = false;
        e.addEventListener("canplay",
        function() {
            setTimeout(function() {x(k)},500);
            setTimeout(function() {N();p();
                for (var e = 0; e < O.length; e++) {
                    T(O[e])
                }
            },
            15500)
        },
        true);
        e.addEventListener("ended",function() {N();h()},true);
        e.innerHTML = " <p>If you are reading this, it is because your browser does not support the audio element. We recommend that you get a new browser.</p> <p>";
        document.body.appendChild(e);
        e.play()
    }
    function x(e) {
        e.className += " " + s + " " + o
    }
    function T(e) {
        e.className += " " + s + " " + u[Math.floor(Math.random() * u.length)]
    }
    function N() {
        var e = document.getElementsByClassName(s);
        var t = new RegExp("\\b" + s + "\\b");
        for (var n = 0; n < e.length;) {
            e[n].className = e[n].className.replace(t, "")
        }
    }
    var minHeight = 3;     //最小高度
    var minWidth = 3;     //最小宽度
    var maxHeight = 800 * 3;    //最大高度
    var maxWidth = 1400 * 3;    //最大宽度
    var s = "mw-harlem_shake_me";
    var o = "im_first";
    var u = ["im_drunk", "im_baked", "im_trippin", "im_blown"];
    var a = "mw-strobe_light";
    var l = "mw_added_css";     //最终要移除的css
    var b = g();
    var w = y();
    var C = document.getElementsByTagName("*");
    var k = null;
    for (var L = 0; L < C.length; L++) {
        var targetDiv = C[L];
        if (checkSize(targetDiv)) {
            if (E(targetDiv)) {
                k = targetDiv;
                break
            }
        }
    }
    if (targetDiv === null) {       //如果没找到合适大小的
        console.warn("没能找到合适的大小. 换一个页面试试？.");
        return
    }
    
    loadCss();        //将自定义css文件引入页面
    setBgm();   //添加背景音乐
    
    var O = [];
    for (var L = 0; L < C.length; L++) {
        var targetDiv = C[L];
        if (checkSize(targetDiv)) {
            O.push(targetDiv)
        }
    };
    
    $("body").css({     //网页整体倾斜效果
        "overflow-x": "hidden",
        "transform": "rotate(1deg)",
        "-webkit-transform": "rotate(1deg)",
        "-moz-transform": "rotate(1deg)",
        "-o-transform": "rotate(1deg)",
        "-ms-transform": "rotate(1deg)"
    });
    
}
//var bgmSrc = "https://lewky.coding.me/carnival/audio/Martin%20Jensen%20-%20Fox%20(Loop%20Remix).mp3";
var bgmSrc = "/audio/zhexue_min.mp3";
var cssHref = "/css/high.css";     //设置页面动效css地址

