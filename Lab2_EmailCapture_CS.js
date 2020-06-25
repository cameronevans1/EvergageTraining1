(function() {

    function apply(context, template) {
        Evergage.cashDom("body").off("mousemove.evg");
        Evergage.cashDom("body").on("mousemove.evg", function(event) {
            if (event.pageX <= 250 && event.pageY <= 250 && Evergage.cashDom("#evg-email-capture-popup").length === 0) {
                var html = template(context);
                Evergage.cashDom("body").append(html);
                setLightOrDarkMode(context);
                Evergage.cashDom("#evg-email-capture-popup .evg-cta").on("click", function(event) {
                    Evergage.cashDom("#evg-email-capture-popup .evg-content").addClass("evg-hide");
                    Evergage.cashDom("#evg-email-capture-popup .evg-confirm-content").removeClass("evg-hide");
                });
                Evergage.cashDom("body").on("click", function(event) {
                    if (Evergage.cashDom(event.target).closest(".evg-popup").length === 0 || 
                        Evergage.cashDom(event.target).closest(".evg-close").length === 1) {
                        reset(context, template);
                    }
                });
            }
        });
    }

    function reset(context, template) {
        Evergage.cashDom("#evg-email-capture-popup").remove();
    }

    function control() {
    
    }

    function setLightOrDarkMode(context) {
        if (context.style == "Dark on Light") {
            Evergage.cashDom(".evg-popup").addClass("evg-dark-text");
        } else if (context.style == "Light on Dark"){
            Evergage.cashDom(".evg-popup").addClass("evg-light-text")
        } else {
            Evergage.cashDom(".evg-popup").addClass("evg-blue-text")
        }

    }
  
    registerTemplate({
      apply: apply,
      reset: reset, 
      control: control
    });
    
  })();