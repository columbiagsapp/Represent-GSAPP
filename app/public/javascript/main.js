$(document).ready(function(){

  $('#tmpltzr').width( window.innerWidth - 400 );

  $(".owl-carousel").owlCarousel({
    items : 3,
    slideSpeed : 1000,
    autoPlay : true,
    stopOnHover : true,
    responsive: true,
    responsiveRefreshRate : 200,
    responsiveBaseWidth: '#repgsapp-wrapper',
    itemsScaleUp: true

  });




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
