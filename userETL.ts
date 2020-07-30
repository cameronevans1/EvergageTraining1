export class userETL implements EtlJob<{ [s: string]: string; }> {

    static HEADER_DEFINITION = {
        'userId':           'user001',
        'accountId':        'account001',
        'emailAddress':     'john.doe@email.com',
        'attribute:age':    21,
        'displayName':      "John Doe"
    };

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
        context.prefetchUserByPrimaryId(record["userId"]);
    }

    extract(context: EtlJobContext, file: File): EvgIterator<{ [s: string]: string; }> {
        var csvReader = context.services.csv.readFile(file);
        if (file.path.endsWith(".pgp")) {
            csvReader.decryptionKeyId('default');
        }
        return csvReader
            .separator(',')
            .idField('userId')
            .recordIterator();
    }

    transform(context: EtlJobContext, record: { [s: string]: string; }) {
        // Extract user ID from record.
        let userId = record.userId;

        // Try to match an existing user.
        let user: User;
        if (userId) {
            user = context.services.profile.findUser(userId);
            if (!user) {
                user = context.services.profile.newUser(userId);
            }
        } else {
            context.skipRecord('No user ID was provided.');
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
            } else if (key == 'userId') {
                // Alternative to attribute:userId
                user.attributes.salesforceContactId = { value: value }; //setting the salesforceContactId attribute on the user to be equal to the userId in the csv file uploaded
            } else if (key == 'emailAddress') {
                // Alternative to attribute:email
                if (userETL.EMAIL_ADDRESS_REGEX.test(value)) {
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
                        if (!userETL.EMAIL_ADDRESS_REGEX.test(value)) {
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
                        let bool = userETL.parseBoolean(value);
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
