// Used with User Identities
// Define Identities by prioritized order
// Keyed by identityTypeId defined on the Account
enum UserIdentity {
    emailAddress    = "attribute:emailAddress"
}
class MultipleIdentitiesService {
    // Static method to extract Identity keys in prioritized order
    static extractIdentityKeys(record: { [p: string]: string }): IdentityKey[] {
        return Object.keys(UserIdentity).map(identityTypeId => {
            let tempIdentityKey : IdentityKey = {
                id: record[UserIdentity[identityTypeId]],
                identityTypeId: identityTypeId
            };
            return (tempIdentityKey.id) ? tempIdentityKey : null;
        }).filter(key => key != null);
    }
}

export class userLoyaltyETL implements EtlJob<{ [s: string]: string; }> {

    static readonly EMAIL_ADDRESS_REGEX = /^[^@]+@.+\..+$/;

    defaultValueMetadata;

    getFilesToProcess(context: EtlJobContext): File[] {
        let filesystem = context.services.filesystem;
        let files = filesystem.listFiles('/inbound');
        let subdirExists = false;
        try {
            filesystem.getFile('/inbound/subdir');
            subdirExists = true;
        } catch (ignore) {
        }
        if (subdirExists) {
            files = files.concat(filesystem.listFiles('/inbound/subdir'));
        }
        return files
            .filter(file => {
                let fileName = file.path.substring(file.path.lastIndexOf('/') + 1);
                return /^user-.+\.csv(\.[a-z]+)?$/.test(fileName);
            });
    }

    prefetch(context: EtlJobContext, record: { [s: string]: string; }) {
        // Used with Identities
        context.prefetchUser(MultipleIdentitiesService.extractIdentityKeys(record));
    }

    extract(context: EtlJobContext, file: File): EvgIterator<{ [s: string]: string; }> {
        var csvReader = context.services.csv.readFile(file);
        if (file.path.endsWith(".pgp")) {
            csvReader.decryptionKeyId('default');
        }
        return csvReader
            .separator(',')
            .recordIterator();
    }

    transform(context: EtlJobContext, record: { [s: string]: string; }) {
        // Extract user ID and/or identities from record.
        let userId = record.userId;
        let userIdentities = MultipleIdentitiesService.extractIdentityKeys(record);

        // Try to match an existing user from Identities
        let user: User;
        if (userIdentities.length > 0) {
            let orderedMatchingUsers = context.services.profile.findOrderedMatchingUsers(userIdentities);
            if (orderedMatchingUsers.length > 0) {
                user = orderedMatchingUsers[0];
            }
        }

        if (!user) {

            // Try to match an existing user from primary userId
            user = context.services.profile.findUser(userId);

            // Attempt to create a new User record from userId or userIdentities
            if (!user && userId) {
                user = context.services.profile.newUser(userId);
            } if (!user && userIdentities) {
                user = context.services.profile.newUserWithFirstValidId(userIdentities);
            }
        }

        if (!user) {
            context.skipRecord('Failed to match or create User.');
            return;
        }

        for (let key in record) {
            let value: any = record[key];
            if (value != null) {
                value.trim();
            }

            if (key == 'accountId') {
                // Alternative to attribute:accountId
                user.attributes.accountId = { value: value };
            } else if (key == 'displayName') {
                // Alternative to attribute:name
                user.attributes.name = { value: value };
            } else if (key == 'emailAddress') {
                // Alternative to attribute:email
                if (userLoyaltyETL.EMAIL_ADDRESS_REGEX.test(value)) {
                    user.attributes.emailAddress = {
                        value: value,
                        metadata: { ...this.defaultValueMetadata, classification: 'Sensitive' }
                    };
                } else {
                    context.addError('invalid email address');
                }
            } else if (/^attribute:.+/.test(key)) {
                let attributeName = key.replace(/^attribute:/, '');
                let existingAttribute = user.attributes[attributeName];
                let existingValue = (existingAttribute != null) ? existingAttribute.value : null;

                switch (attributeName) {
                    case 'age': {
                        value = parseInt(value);
                        if (isNaN(value)) {
                            context.skipRecord('age value is not an integer');
                            continue;
                        }
                        if (value < 1) {
                            context.skipRecord(`Age must be a positive number (received: ${value})`);
                            continue;
                        }
                        break;
                    }
                    case 'email': {
                        if (!userLoyaltyETL.EMAIL_ADDRESS_REGEX.test(value)) {
                            context.skipRecord('invalid email address');
                            continue;
                        } else {
                            user.attributes.emailAddress = {
                                value: value,
                                metadata: { ...this.defaultValueMetadata, classification: 'Sensitive' }
                            };
                        }
                        break;
                    }
                    case 'VIP': {
                        let bool = userLoyaltyETL.parseBoolean(value);
                        if (typeof bool === 'boolean') {
                            value = bool;
                        } else {
                            continue;
                        }
                        break;
                    }
                    case 'birthday': {
                        value = new Date(value);
                        if (isNaN(value.getTime())) {
                            context.skipRecord("Birthday is incorrectly formatted");
                            continue;
                        }
                        break;
                    }
                    // this is setting the loyaltyTier attribute by casing the loyaltyPoints column and doing a transform on it based on rules
                    case 'loyaltyPoints': {
                        let pointInt = parseInt(value); // let pointInt new variable be the value of the 'loyaltyPoints' column
                        if (!pointInt || pointInt==0) { //if pointInt does not exist or is 0
                            break;
                        }
                        let tier = "Bronze";
                        if (pointInt > 1999) {
                           tier="Platinum";
                        } else if (pointInt>999){
                            tier="Gold";
                        } else if (pointInt>499){
                            tier="Silver";
                        }
                        user.attributes.loyaltyTier={value: tier}
                    }

                    case 'someJson': {
                        try {
                            value = JSON.parse(value);
                        } catch (e) {
                            context.skipRecord('invalid someJson, not parsable');
                            continue;
                        }
                        break;
                    }
                }

                user.attributes[attributeName] = { value: value };
            }
        }

        context.stageUser(user);
    }

    getDefaultValueMetadata(file: File): ValueMetadata {
        if (!this.defaultValueMetadata) {
            // Store in a field, since transform impl will clone and modify it when setting metadata for email attribute.
            this.defaultValueMetadata = {
                provider: `ETL:${file.path}`
            };
        }
        return this.defaultValueMetadata;
    }

    static parseBoolean(value: string) : boolean|undefined {
        if (value === 'true') {
            return true;
        } else if (value === 'false') {
            return false;
        } else {
            return undefined;
        }
    }

}