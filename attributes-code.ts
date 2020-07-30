install(context : GearLifecycleContext) {

    context.services.systemConfiguration.requestUserAttribute({id: "attribute1", label: "Attribute One", type: "String"});
    context.services.systemConfiguration.requestUserAttribute({id: "attribute2", label: "Attribute Two", type: "String"});

    context.services.systemConfiguration.submitPendingRequests();

}

