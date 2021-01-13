# 关于


{{< admonition tip "Running Time" >}}
<!-- 站点运行时间 -->
<div id="days"></div>
{{< /admonition >}}

## 博主相关

### 近况

17年本科毕业，目前在珠海从事Java开发，码农界萌新 (⌒▽⌒)

### 技能

Java

~~（性感码农，在线搬砖）~~

### 联系

* <a href="javascript:void(0);">email: 1019175915@qq.com</a>
* <a href="https://github.com/lewky">github@lewky</a>
* <a href="https://blog.csdn.net/lewky_liu">csdn@lewky_liu</a>
* <a href="http://www.cnblogs.com/yulinlewis">cnblogs@yulinlewis</a>
* 
### 随笔

<a href="/posts/d65a1577.html" target="_blank">→ 戳我查看随笔 ←</a>

## 站点相关

### 站点及主题版本

	hugo: v0.74.2/extended windows/amd64 BuildDate: unknown
	LoveIt: v0.2.10

### 建站日志

<a href="/posts/e62c38c4.html" target="_blank">→ 戳我查看建站日志 ←</a>

### 神奇页面

<a href="/funny/high" target="_blank">→ 废话少说燥起来!!前方高能♂ ←</a>

### 友情链接

想添加友链可以前往[友链页面](/friends)留言 `(ﾉ*･ω･)ﾉ～`


<script>
/* 站点运行时间 */
function show_date_time(){
	window.setTimeout("show_date_time()", 1000);
	/* 请修改这里的起始时间 */
	BirthDay=new Date("04/24/2018 15:00:00");
	today=new Date();
	timeold=(today.getTime()-BirthDay.getTime());
	sectimeold=timeold/1000
	secondsold=Math.floor(sectimeold);
	msPerDay=24*60*60*1000
	e_daysold=timeold/msPerDay
	daysold=Math.floor(e_daysold);
	e_hrsold=(e_daysold-daysold)*24;
	hrsold=setzero(Math.floor(e_hrsold));
	e_minsold=(e_hrsold-hrsold)*60;
	minsold=setzero(Math.floor((e_hrsold-hrsold)*60));
	seconds=setzero(Math.floor((e_minsold-minsold)*60));
	document.getElementById('days').innerHTML="本站已运行"+daysold+"天"+hrsold+"小时"+minsold+"分"+seconds+"秒";
}
function setzero(i){
	if (i<10) {
		i="0" + i;
	}
	return i;
}
show_date_time();
</script>