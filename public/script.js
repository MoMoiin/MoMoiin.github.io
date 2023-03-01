

(function($) { "use strict";
 
 	//Parallax            
              
	function scrollBanner() {
	  $(document).on('scroll', function(){
      var scrollPos = $(this).scrollTop();
        $('.parallax-fade-top').css({
          'top' : (scrollPos/2)+'px',
          'opacity' : 1-(scrollPos/700)
        });
        $('.parallax-00').css({
          'top' : (scrollPos/-3.5)+'px'
        });
        $('.parallax-01').css({
          'top' : (scrollPos/-2.8)+'px'
        });
        $('.parallax-top-shadow').css({
          'top' : (scrollPos/-2)+'px'
        });
      });    
	  }
	scrollBanner();	              

              

       
})(jQuery);


var topSec = document.querySelectorAll(".top");


$(window).scroll(function(){
  var topPos = $(topSec).offset().top;
  var topBot = topPos + $(topSec).outerHeight(true);
  if ($(window).scrollTop() > topBot){
    $(".sidebarNav").addClass("sidebarNavIn");
  }
  else{
    $(".sidebarNav").removeClass("sidebarNavIn");
  }
});

var sidebarNavButton = document.querySelectorAll(".sidebarNavItem");
var sidebarNavSection = document.querySelectorAll(".section");





$(document).ready(function(){
  // Add smooth scrolling to all links
  $(".scrollLink").on('click', function(event) {

    // Make sure this.hash has a value before overriding default behavior
    if (this.hash !== "") {
      // Prevent default anchor click behavior
      event.preventDefault();

      // Store hash
      var hash = this.hash;

      // Using jQuery's animate() method to add smooth page scroll
      // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
      $('html, body').animate({
        scrollTop: $(hash).offset().top
      }, 50, function(){

        // Add hash (#) to URL when done scrolling (default click behavior)
        window.location.hash = hash;
      });
    } // End if
  });
});

