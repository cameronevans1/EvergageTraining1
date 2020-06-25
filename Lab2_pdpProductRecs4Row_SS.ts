import { RecommendationsConfig, recommend } from 'recs';

export class NewTemplate implements CampaignTemplateComponent {

    // TODO: Add content zone selector - defining the two zones manually
    @title('Content Zone')
    @subtitle('Select a content zone')
    contentZone: "PDP Recs Row 1" | "PDP Recs Row 2";

    // TODO: Add title above the recommendations
    
    @title('PDP Recs Row Title')
    header: string = "Input title here...";

  
    // TODO: Make a new RecommendationsConfig object here, then call a function from that new object
    // (use type completion) to restrict the item type to Product
    
    //Recs Config contains the Recipe dropdown and Max Results already defined
    @title('Recs Config')
    recsConfig: RecommendationsConfig = new RecommendationsConfig().restrictItemType('Product');



    run(context:CampaignComponentContext) {
        // TODO: make recommend API call here
        // const items = recommend();
        return {
            items: recommend(context, this.recsConfig),// return items from your recommend API call here,
        }
    }
    
}
