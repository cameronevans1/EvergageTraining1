(function() {

  function apply(context, template) {
    
    var html = template(context);
    Evergage.cashDom(".experience-carousel-bannerCarousel").html(html);
    
  }

  function reset(context, template) {
  
  }
  
  function control() {
    
  }

  registerTemplate({
    apply: apply,
    reset: reset,
    control: control
  });
  
})();