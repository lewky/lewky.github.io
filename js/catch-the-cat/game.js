!function() {
  const isMobile = /mobile/i.test(window.navigator.userAgent);
  var radius = isMobile ? 12 : 20;
  window.game = new CatchTheCatGame({ 
      w: 11, 
      h: 11, 
      r: radius, 
      backgroundColor: 0xeeeeee, 
      parent: "catch-the-cat", 
      statusBarAlign: "center", 
      credit: " "
  });
}();