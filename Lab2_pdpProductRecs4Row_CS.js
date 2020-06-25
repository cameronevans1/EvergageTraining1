(function() {

  let originalRow1 = Evergage.cashDom(".row.recommendations div[id*='cq']:nth-of-type(1)").html();
  let originalRow2 = Evergage.cashDom(".row.recommendations div[id*='cq']:nth-of-type(2)").html();

  function apply(context, template) {
    
    var html = template(context);
    if (context.contentZone && context.contentZone == "PDP Recs Row 1") {
        Evergage.cashDom(".row.recommendations div[id*='cq']:nth-of-type(1)").html(html);
    } else if (context.contentZone && context.contentZone == "PDP Recs Row 2") {
        Evergage.cashDom(".row.recommendations div[id*='cq']:nth-of-type(2)").html(html);
    }
    
  }

  function reset(context, template) {

    Evergage.cashDom("#evg-recs-container").remove();
    Evergage.cashDom(".row.recommendations div[id*='cq']:nth-of-type(1)").html(originalRow1);
    Evergage.cashDom(".row.recommendations div[id*='cq']:nth-of-type(2)").html(originalRow2);
    
  }
  
  function control() {
    
  }

  registerTemplate({
    apply: apply,
    reset: reset,
    control: control
  });
  
})();