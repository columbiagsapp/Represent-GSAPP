(function(){

  var chart = new Snap('#stats'),
    apiURL = 'stats.json', // change to URL string when API is ready
    columnWidth = 50, // might want to dynamically set this from text width
    data;

  var gradient = $('.gradient');

  var height = +chart.attr('height'),
    width = +chart.attr('width');

  // make sure this matches all the colors in scss/_vars.scss
  var colors = ['red', 'red-orange', 'orange', 'pink', 'salmon', 'blue', 'blue-alt', 'purple', 'violet', 'fuchsia', 'red-purple'];

  function renderPrograms() {

    chart.attr({
      width: data.programs.length * columnWidth
    });

    for ( var i = 0; i < data.programs.length; i++ ) {

      // create text
      var text = chart.text( columnWidth * i + columnWidth / 2, height - 100, data.programs[i].name).attr({
        'class': 'chart-label ' + colors[i % colors.length]
      });
      text.transform(Snap.matrix().rotate(-90, columnWidth * i + columnWidth / 2 + 5, height - 100).toTransformString());

      var textWidth = $(text.node).width();

      text.attr({
        x: ( columnWidth * i ) + ( columnWidth - textWidth )
      });

      // create bar
      // TODO: height should be relative to program with highest # of total images,
      // which is 100% height of the chart
      var bar = chart.rect( columnWidth * i + columnWidth / 10, height - 5 * data.programs[i].total_images - 145, columnWidth - columnWidth / 5, 5 * data.programs[i].total_images ).attr({
        'class': colors[i % colors.length]
      });
    }
  }

  function handleData(theData) {
    data = theData;
    console.log(data);
    renderPrograms();
  }

  function retrieveData() {
    $.ajax({
      url: apiURL,
      success: handleData
    });
  }

  var isMousedown = false,
    originator;

  function mouseIsDown(e) {
    isMousedown = true;
    originator = e.offsetX;
  }

  function mouseIsUp() {
    isMousedown = false;
  }

  function moveChart(e) {

    if ( isMousedown ) {
      $(this).css({
        left: (e.pageX - originator)
      });
    }
  }

  function gradientCycle() {
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
      gradient.remove();
      gradient = newGradient;
      gradientCycle();
    }, 5000);
  }
  gradientCycle();

  function init() {
    retrieveData();
    // $('#stats').mousedown(mouseIsDown).mouseup(mouseIsUp).mousemove(moveChart);
  }

  init();

})();
