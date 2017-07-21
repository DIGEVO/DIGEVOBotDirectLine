'use strict';

var Swagger = require('swagger-client');
var rp = require('request-promise');
const Promise = require('promise');

require('dotenv').config();

module.exports = {
    createClient: () => {
        return rp(process.env.SPEC)
            .then(function (spec) {
                return new Swagger({
                    spec: JSON.parse(spec.trim()),
                    usePromise: true
                });
            })
            .then(function (client) {
                client.clientAuthorizations.add('AuthorizationBotConnector',
                    new Swagger.ApiKeyAuthorization('Authorization', 'Bearer ' + process.env.SECRET, 'header'));
                return client;
            })
            .catch(function (err) {
                console.error('Error initializing DirectLine client', err);
            });
    },
    /*
    */
    printMessages(activities) {
        if (activities && activities.length) {
            // ignore own messages
            activities = activities.filter(function (m) { return m.from.id !== process.env.CLIENT });

            if (activities.length) {
                process.stdout.clearLine();
                process.stdout.cursorTo(0);

                activities.forEach(module.exports.printMessage);
            }
        }
    },
    /*
    */
    printMessage(activity) {
        if (activity.text) {
            console.log(activity.text);
        }

        if (activity.attachments) {
            activity.attachments.forEach((attachment) => {
                if (attachment.contentType == 'application/vnd.microsoft.card.hero') {
                    module.exports.renderHeroCard(attachment);
                }
            });
        }
    },
    /*
    */
    renderHeroCard(attachment) {
        if (attachment.content.buttons && attachment.content.buttons.length) {
            attachment.content.buttons.forEach(b => console.log(`${b.title}`));
        }
    }
};