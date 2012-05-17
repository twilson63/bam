$(function() {
  var curSlide = 0;
  //$.scrollTo($('#slide1').attr('href'), 1200);
  $('body').keydown(function(e){
    if (e.which == '40') {
      if (curSlide < $('section').length - 1) { curSlide += 1; }
      $.scrollTo($('section')[curSlide], 1200);
    } else if (e.which == '38') {
      if (curSlide > 0) { curSlide -= 1; }
      $.scrollTo($('section')[curSlide], 1200);
    }
  })
  $('.page-link[href="#prev"]').click(function(e) {
    e.preventDefault();
    if (curSlide > 0) { curSlide -= 1; }
    $.scrollTo($('section')[curSlide], 1200);
  });
  $('.page-link[href="#next"]').click(function(e) {
    e.preventDefault();
    if (curSlide < $('section').length - 1) { curSlide += 1; }
    $.scrollTo($('section')[curSlide], 1200);
  });

  $('h1').fitText(1.2, {
    minFontSize: '20px'
  });
});
