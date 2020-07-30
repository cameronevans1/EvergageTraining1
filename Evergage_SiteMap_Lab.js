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
            return /\/homepage/.test(window.location.href); //defines the pageType by url structure
        }
    });

    config.pageTypes.push({
        name:"Product Page",
        action:"Product Page View",
        isMatch: () => {
            return Evergage.cashDom("div.page[data-action='Product-Show']").length>0; //defines the pageType by an actiom/DOM element
        },
        contentZones: [
            {name:"Row1 ProductRecs",selector:".row.recommendations div[id*='cq']:nth-of-type(1)"},
            {name:"Row2 ProductRecs",selector:".row.recommendations div[id*='cq']:nth-of-type(2)"}
            // Inspect elements at: https://www.northerntrailoutfitters.com/default/men%E2%80%99s-ultimate-active-pants-1030968AO3.html
            //finding id of two zones, look dynamic so avoid using significantly unique value, so use the child of the class where the id starts with 'cq', nth-of-type(1) selects the first of these
        ]
    });

    config.global ={
        contentZones:[
            {name:"Infobar - Top of Page", selector:"header.site-header"}, //works without the "header" addition
            {name:"Infobar - Bottom of Page", selector:"footer.site-footer"}
        ],
        listeners:[
            Evergage.listener("submit",".email-signup",() =>{ //does not work with "button.btn.btn-primary", instead use the class of the embedded form in HTML element
                var userEmail = Evergage.cashDom("#dwfrm_mcsubscribe_email").val(); //set a variable to the value of the text input field
                Evergage.sendEvent({ //send an event to Evergage when pressing submit
                    action: "Email Sign-Up", // define the name of what you want this event to be
                        attributes:{
                            emailAddress:userEmail, // set the emailAddress attribute in Evergage profile to the same value they inserted
                            userName: "Cameron Evans" //very optional to add
                        }
                })
            })
        ]
        
    }
    
    Evergage.initSitemap(config); //Importantly does not capture without this

});