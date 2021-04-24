# 热度排行榜

<style>
ul#hot {
    list-style: none;
}
ul#hot li {
    position: relative;
    padding-left: 30px;
    height: 36px;
    line-height: 36px;
}
ul#hot li:after {
    content: "";
    display: inline-block;
    width: 20px;
    height: 20px;
    line-height: 20px;
    text-align: center;
    color: #FFF;
    background: #999999;
    text-align: center;
    position: absolute;
    left: 0;
    top: 8px;
}
ul#hot li:first-child:after {content: "1";background: #FD8C84;}
ul#hot li:nth-child(2):after {content: "2";background: #FFCC99;}
ul#hot li:nth-child(3):after {content: "3";background: #7FD75A;}
ul#hot li:nth-child(4):after {content: "4";background: #CCCCFF;}
ul#hot li:nth-child(5):after {content: "5";background: #60C4FD;}
ul#hot li:nth-child(6):after {content: "6";}
ul#hot li:nth-child(7):after {content: "7";}
ul#hot li:nth-child(8):after {content: "8";}
ul#hot li:nth-child(9):after {content: "9";}
ul#hot li:nth-child(10):after {content: "10";}
ul#hot li:nth-child(11):after {content: "11";}
ul#hot li:nth-child(12):after {content: "12";}
ul#hot li:nth-child(13):after {content: "13";}
ul#hot li:nth-child(14):after {content: "14";}
ul#hot li:nth-child(15):after {content: "15";}

li font {color: grey;}
li#hot1 font, li#hot2 font, li#hot3 font {color: red;}
li#hot4 font, li#hot5 font {color: #bd5d67;}

ul#hot li {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>

<div><ul id="hot"></ul></div>
<script src="https://cdn1.lncld.net/static/js/av-core-mini-0.6.4.js"></script>
<script>AV.initialize("1OiMg9cMz7owGf7apX4mTQs3-gzGzoHsz", "nfafLPsFBNTdO9Sb5suuGdpG");</script>
<script type="text/javascript">
  var time=0
  var title=""
  var url=""
  var query = new AV.Query('Counter');
  query.notEqualTo('id',0);
  query.descending('time');
  query.limit(15);
  query.find().then(function (todo) {
    for (var i=0;i<1000;i++){
      var result=todo[i].attributes;
      time=result.time;
      title=result.title;
      url=result.url;
      if (i<5) {
        var content="<li id='hot"+(i+1)+"'>"+"<a href='"+url+"'>"+title+"<font>"+"&nbsp;&nbsp;<i class='fas fa-fire fa-fw'></i> "+time+" ℃"+"</font>"+"</a>"+"</li>";
	  } else {
		var content="<li id='hot"+(i+1)+"'>"+"<a href='"+url+"'>"+title+"<font>"+"&nbsp;&nbsp;<i class='fas fa-eye fa-fw'></i> "+time+" ℃"+"</font>"+"</a>"+"</li>";
      }
      document.getElementById("hot").innerHTML+=content
    }
  }, function (error) {
    console.log("error");
  });
</script>
