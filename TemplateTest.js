
(function() {

    function apply(context, template) {
        
        var html = template(context);
        Evergage.cashDom("body").append(html);
        
    }

    function reset(context, template) {
        Evergage.cashDon('#infobar').resolve()
    }
  
    function control() {
        
    }

    registerTemplate({
        apply: apply,
        reset: reset,
        control: control
    });
  
})();
