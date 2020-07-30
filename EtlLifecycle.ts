
export class EtlLifecycle implements GearLifecycle {
    @description("Description of the field")
    @title("Label me")
    configMe: string;
    
    install(context : GearLifecycleContext) {
        //the below will add the attributes to the list in Eveergage through your gear rather than creating them in Evergage
        context.services.systemConfiguration.requestUserAttribute({id: "address", label: "Address", type: "String"});
        context.services.systemConfiguration.requestUserAttribute({id: "city", label: "City", type: "String"});
        context.services.systemConfiguration.requestUserAttribute({id: "state", label: "State", type: "String"});
        context.services.systemConfiguration.requestUserAttribute({id: "zipcode", label: "Zip Code", type: "String"});
        context.services.systemConfiguration.requestUserAttribute({id: "phoneNumber", label: "Phone Number", type: "String"});

        context.services.systemConfiguration.submitPendingRequests();

    }




    validate() {
        let validator = new Validator<this>(this);
    
        validator.nonEmpty("configMe");
    
        return validator.errors;
    }
}
    