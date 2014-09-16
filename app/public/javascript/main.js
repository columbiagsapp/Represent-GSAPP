$(document).ready(function(){

  $('#tmpltzr').width( window.innerWidth - 400 );

  $(".owl-carousel").owlCarousel({
    items : 1.5,
    slideSpeed : 1000,
    autoPlay : true,
    stopOnHover : true,
    responsive: true,
    responsiveRefreshRate : 200,
    responsiveBaseWidth: window.innerWidth - 400,

  });

});
