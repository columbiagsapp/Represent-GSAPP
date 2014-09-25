$(document).ready(function(){

  $('#tmpltzr').width( window.innerWidth - 400 );




  // program list runs across top



  // header fade in and out
  function fadeSwitchElements(id1, id2, fade_time, cycle)
  {
    var element1 = $('.' + id1);
    var element2 = $('.' + id2);

    if(element1.is(':visible'))
    {
      element1.fadeToggle(fade_time);
      element2.fadeToggle(fade_time);
    }
    else
    {
      element2.fadeToggle(fade_time, function() {
        element1.fadeToggle(fade_time);
      });
    }
    if(cycle > 0){
      setTimeout(function(){
        fadeSwitchElements(id2, id1, fade_time, cycle);
      }, cycle);
    }
  }
  //start the title fade after 3s
  setTimeout(function(){
    fadeSwitchElements('full', 'hash', 2000, 0);//only do once, set last var to 0
  }, 3000);



  // Gradient background

  // make sure this matches all the colors in scss/_vars.scss
  var colors = ['red', 'red-orange', 'orange', 'pink', 'salmon', 'blue', 'blue-alt', 'purple', 'violet', 'fuchsia', 'red-purple'];

  var gradient = $('.gradient');

  function gradientCycle() {
    console.log('gradientCycle()');
    var classes = gradient.attr('class').split(' '),
      oldClass;
    for ( var i = 0; i < classes.length; i++ ) {
      if ( classes[i] !== 'gradient') {
        oldClass = classes[i];
        oldClass = oldClass.replace('gradient-', '');
        break;
      }
    }
    var newClass = colors[(colors.indexOf(oldClass) + 1) % colors.length];
    var newGradient = $('<div class="gradient gradient-' + newClass + ' faded">');
    $('.gradient-' + oldClass).last().after(newGradient);

    //gradient.addClass('faded');
    setTimeout(function(){
      newGradient.removeClass('faded');
    }, 100);

    setTimeout(function(){
      gradient = newGradient;
      gradientCycle();
    }, 5000);
  }
  gradientCycle();


});
