Evergage.init({
    cookieDomain: "northerntrailoutfitters.com",
    trackerUrl: "https://partnerdeloitte.devergage.com"
}).then(() => {

    var config ={
        global:{},
        pageTypes:[]
    };

    config.pageTypes.push({
        name: "Homepage",
        action: "Homepage",
        isMatch: () => {
            return /\/homepage/.test(window.location.href);
        }
    });

    config.pageTypes.push({
        name:"Product Page",
        action:"Product Page View",
        isMatch: () => {
            return Evergage.cashDom("div.page[data-action='Product-Show']").length>0;
        },
        contentZones: [
            {name:"Row1 ProductRecs",selector:".row.recommendations div[id*='cq']:nth-of-type(1)"},
            {name:"Row2 ProductRecs",selector:".row.recommendations div[id*='cq']:nth-of-type(2)"}
            // Inspect elements at: https://www.northerntrailoutfitters.com/default/men%E2%80%99s-ultimate-active-pants-1030968AO3.html
            //finding id of two zones, look dynamic so avoid using significantly unique value, so use the child of the class where the id starts with 'cq', nth-of-type(1) selects the first of these
        ],
        catalog:{
          Product:{
              _id:Evergage.resolvers.fromSelectorAttribute(".product-wrapper[data-pid]","data-pid"), 
              //get me the class of .product-wrapper where there is also the attribute data-pid ([data-pid]), then get me the data-pid attribute value (,"data-pid")
              name: Evergage.resolvers.fromSelector(".product-name .d-none .d-md-block").val(),
              //can also find name through the JSON LD that is sent:
              //name: Evergage.resolvers.fromJsonLd("name"),
              price: Evergage.resolvers.fromSelector(".prices .price .value").val(),
              url:Evergage.resolvers.fromHref(),
              imageUrl: Evergage.resolvers.fromSelectorAttribute(".carousel-item .slick-slide .slick-current .slick-active[data-slick-index='0'] img","src"),
              //get me the .carousel-item where [data-slick-index='0'] then go down to the img layer and from there get me the "src" attribute value
              dimensions:{
                  Color: Evergage.resolvers.fromSelectorAttributeMultiple(".color-value","data-attr-value"),//multiple allows us to grab multiple colours at once
                  //Capital letters as that is what has been set up in Evergage for the Dimensions
                  Gender: () => {
                            if (Evergage.cashDom(".product-breadcrumb .breadcrumb a").first().text().toLowerCase() ==="women" || 
                                    Evergage.cashDom("h1.product-name").text().indexOf("Women")>=0){
                                        return "WOMEN";
                    //this is getting the text out of the first a element within the product breadcrumb .breadcrumb class then converting htis to lowercase, if this is "women" and same type
                    //OR (||) the h1 product name's text contains "Women" (case sensitive) (providing a integer position of where this occurs (or -1 if it doesnt occur)) if the value is >=0 i.e. it exists then return women
                            }else if (Evergage.cashDom(".product-breadcrumb .breadcrumb a").first().text().toLowerCase() ==="men" || 
                                    Evergage.cashDom("h1.product-name").text().indexOf("Men")>=0){ //can use toLowerCase() to ensure the indexOf regardless of case, but change to indexOf("men")if so
                                       return "MEN";
                                    }
                  },
                  Feature: Evergage.resolvers.fromSelector(".long-description li") //unsure if this will work due to changes in site structure
              }
          }  
        },
        listeners:[
            Evergage.listener("click",".add-to-cart",() => { //add a listener for when user clicks add to cart
                var lineItem = Evergage.util.buildLineItemFromPageState("select[id*=quantity]");
                lineItem.sku = Evergage.cashDom(".product-detail[data-pid").attr("data-pid"); // sending sku as obviously sku changes when you select a different colour/size
                Evergage.sendEvent({
                    itemAction:Evergage.ItemAction.AddToCart, //dev details http://evergage-gears-docs.s3-website-us-east-1.amazonaws.com/websdk/docs/enums/_evergage_d_.itemaction.html
                    lineItem: lineItem // dev details http://evergage-gears-docs.s3-website-us-east-1.amazonaws.com/websdk/docs/interfaces/_evergage_d_.lineitem.html
                });
            })
        ]
    });

    config.global ={
        contentZones:[
            {name:"Infobar - Top of Page", selector:"header.site-header"}, //works without the "header" addition
            {name:"Infobar - Bottom of Page", selector:"footer.site-footer"}
        ],
        listeners:[
            Evergage.listener("submit",".email-signup",() =>{ //button.btn.btn-primary
                var userEmail = Evergage.cashDom("#dwfrm_mcsubscribe_email").val();
                Evergage.sendEvent({
                    action: "Email Sign-Up",
                        attributes:{
                            emailAddress:userEmail,
                            userName: "Cameron Evans" //very optional to add
                        }
                })
            })
        ]
        
    }
    
    Evergage.initSitemap(config); //Importantly does not capture without this

});


// ----- SECOND VERSION -------- //
Evergage.init({
    cookieDomain: "northerntrailoutfitters.com",
    trackerUrl: "https://partnerdeloitte.devergage.com"
}).then(() => {

    var config ={
        global:{},
        pageTypes:[]
    };

    config.pageTypes.push({
        name: "Homepage",
        action: "Homepage",
        isMatch: () => {
            return /\/homepage/.test(window.location.href);
        }
    });

    config.pageTypes.push({
        name:"Product Page",
        action:"Product Page View",
        isMatch: () => {
            return Evergage.cashDom("div.page[data-action='Product-Show']").length>0;
        },
        contentZones: [
            {name:"Row1 ProductRecs",selector:".row.recommendations div[id*='cq']:nth-of-type(1)"},
            {name:"Row2 ProductRecs",selector:".row.recommendations div[id*='cq']:nth-of-type(2)"}
            // Inspect elements at: https://www.northerntrailoutfitters.com/default/men%E2%80%99s-ultimate-active-pants-1030968AO3.html
            //finding id of two zones, look dynamic so avoid using significantly unique value, so use the child of the class where the id starts with 'cq', nth-of-type(1) selects the first of these
        ],
        catalog:{
          Product:{
              _id:Evergage.resolvers.fromSelectorAttribute(".product-wrapper[data-pid]","data-pid"),
              //name: Evergage.resolvers.fromSelector(".product-name").val(),
              //can also find name through the JSON LD that is sent:
              name: Evergage.resolvers.fromJsonLd("name"),
              price: Evergage.resolvers.fromSelector(".prices .price .value"),
              url:Evergage.resolvers.fromHref(),
              imageUrl: Evergage.resolvers.fromSelectorAttribute(".carousel-item [data-slick-index='0'] img","src"),
              dimensions:{
                  Color: Evergage.resolvers.fromSelectorAttributeMultiple(".color-value","data-attr-value"),//multiple allows us to grab multiple colours at once
                  //Capital letters as that is what has been set up in Evergage for the Dimensions
                  Gender: () => {
                            if (Evergage.cashDom(".product-breadcrumb .breadcrumb a").first().text().toLowerCase() ==="women" || 
                                    Evergage.cashDom("h1.product-name").text().indexOf("Women")>=0){
                                        return "WOMEN";
                    //this is getting the text out of the first a element within the product breadcrumb .breadcrumb class then converting htis to lowercase, if this is "women" and same type
                    //OR (||) the h1 product name's text contains "Women" (case sensitive) (providing a integer position of where this occurs (or -1 if it doesnt occur)) if the value is >=0 i.e. it exists then return women
                            }else if (Evergage.cashDom(".product-breadcrumb .breadcrumb a").first().text().toLowerCase() ==="men" || 
                                    Evergage.cashDom("h1.product-name").text().indexOf("Men")>=0){ //can use toLowerCase() to ensure the indexOf regardless of case, but change to indexOf("men")if so
                                       return "MEN";
                                    }
                  },
                  Feature: Evergage.resolvers.fromSelectorMultiple(".long-description li") //unsure if this will work due to changes in site structure
              }
          }  
        },
        listeners:[
            Evergage.listener("click",".add-to-cart",() => { //add a listener for when user clicks add to cart
                var lineItem = Evergage.util.buildLineItemFromPageState("select[id*=quantity]");
                lineItem.sku = Evergage.cashDom(".product-detail[data-pid").attr("data-pid"); // sending sku as obviously sku changes when you select a different colour/size
                Evergage.sendEvent({
                    itemAction:Evergage.ItemAction.AddToCart, //dev details http://evergage-gears-docs.s3-website-us-east-1.amazonaws.com/websdk/docs/enums/_evergage_d_.itemaction.html
                    lineItem: lineItem // dev details http://evergage-gears-docs.s3-website-us-east-1.amazonaws.com/websdk/docs/interfaces/_evergage_d_.lineitem.html
                });
            })
        ]
    });

    config.global ={
        contentZones:[
            {name:"Infobar - Top of Page", selector:"header.site-header"}, //works without the "header" addition
            {name:"Infobar - Bottom of Page", selector:"footer.site-footer"}
        ],
        listeners: [
            Evergage.listener("submit",".email-signup",() =>{ //button.btn.btn-primary
                var userEmail = Evergage.cashDom("#dwfrm_mcsubscribe_email").val();
                Evergage.sendEvent({
                    action: "Email Sign-Up",
                        attributes:{
                            emailAddress:userEmail,
                            userName: "Cameron Evans" //very optional to add
                        }
                })
            })
        ]
    },
    
    Evergage.initSitemap(config); //Importantly does not capture without this





}