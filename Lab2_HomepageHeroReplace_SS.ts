export class PromotionsReference {
    label: string;
    url: string;
    imageUrl: string;
}

export class PromotionsLookup implements Lookup<PromotionsReference> {

    contentZone: string;

    constructor(contentZone: string) {
        this.contentZone = contentZone;
    }

    lookup(context: GearLifecycleContext) : PromotionsReference[] {
        // Get the promotions configured in the catalog that have the given content zone ("Homepage | Hero", in this case)
        let promotions = context.services.catalog.findPromotionsWithContentZoneAndDimensions(this.contentZone, 1440, 617);
        
        // TODO: Lab 2 - Filter promotions here to only include ones that have "New Arrival" in the name
        const filteredPromotions = promotions.filter(p => {
            return p.attributes["name"].value.toString().toLowerCase().includes("new arrivals");
        })
        // Map the promotions to the Promotion Reference class
        return filteredPromotions.map(p => {
            return <PromotionsReference>{ 
                label: p.attributes["name"].value,
                url: p.attributes["url"].value,
                imageUrl: p.images["1440x617"].imageUrl
            };
        });
    }
}

export class HomepageHeroPromotionTemplate implements CampaignTemplateComponent {
    
    @hidden(true)
    contentZone: string = "Homepage | Hero";

    @title("Hero Promotion")
    @subtitle("Select a homepage hero promotion")
    @lookupOptions((self) => new PromotionsLookup(self.contentZone))
    selectedPromotion: PromotionsReference;

    run(context:CampaignComponentContext) {
        return {
            selectedPromotion: this.selectedPromotion
        };
    }
    
}