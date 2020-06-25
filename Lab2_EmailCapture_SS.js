export class EmailCapturePopup implements CampaignTemplateComponent {

    @title('Background Image URL')
    @subtitle('Input image URL for pop-up background')
    imageUrl: string;

    @subtitle("Select the style")
    style: "Dark on Light" | "Light on Dark" | "Blue on Light";

    @subtitle("Input pop-up header text")
    header: string;

    @title("Sub-header")
    @subtitle('Input sub-header text')
    subheader: string;

    @title("CTA Text")
    @subtitle("Input CTA text")
    ctaText: string;

    @subtitle("Enter text to display upon successful email entry & enrollment")
    confirmationText: string;

    @title("Confimation Sub-header Text")
    @subtitle("Enter text to display under the confirmation message")
    confirmationSubheaderText: string;

    @hidden(true)
    contentZone: string = "Homepage Popup";

    run(context: CampaignComponentContext) {
        return {};
    }
    
}