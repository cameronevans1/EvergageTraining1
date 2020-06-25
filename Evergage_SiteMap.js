


Config.pageTypes.push({

	name:"Homepage",
	action: "Homepage", //can call this viewed homepage etc but for ease its called homepage here
    isMatch: function(){
        return/\/homepage/.test(window.location.href); //isMatch is a boolean - how do I know the user is on the homepage
    }
    contentZones{
        {name:"Homepage Hero", selector:".experience-carousel-bannerCarousel"}, //uses class to identify
        {name:"Homepage Sub Hero", selector:".experience-carousel-bannerCarousel + .experience-component"}
    }
    
    onActionEvent: function(event){
        event.attributes.loyaltyPoints = getLoyaltyPointsFromPage();
        return event
    }
    
    });
