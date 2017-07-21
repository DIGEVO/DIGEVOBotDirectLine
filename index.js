'use strict';

const Utils = require('./Utils');
require('dotenv').config();

const directLineClient = Utils.createClient();

directLineClient.then(function (client) {
    client.Conversations.Conversations_StartConversation()
        .then(function (response) {
            return response.obj.conversationId;
        })                           
        .then(function (conversationId) {
            sendMessagesFromConsole(client, conversationId); 
            pollMessages(client, conversationId);
        });
});

function sendMessagesFromConsole(client, conversationId) {
    var stdin = process.openStdin();
    stdin.addListener('data', function (e) {
        var input = e.toString().trim();
        if (input) {
            // exit
            if (input.toLowerCase() === 'exit') {
                return process.exit();
            }

            // send message
            client.Conversations.Conversations_PostActivity(
                {
                    conversationId: conversationId,
                    activity: {
                        textFormat: 'plain',
                        text: input,
                        type: 'message',
                        from: {
                            id: process.env.CLIENT,
                            name: process.env.CLIENT
                        }
                    }
                }).catch(function (err) {
                    console.error('Error sending message:', err);
                });
        }
    });
}

function pollMessages(client, conversationId) {
    console.log('Ya estás conectado con DIGEVOBot');
    var watermark = null;
    setInterval(function () {
        client.Conversations.Conversations_GetActivities({ conversationId: conversationId, watermark: watermark })
            .then(function (response) {
                watermark = response.obj.watermark;
                return response.obj.activities;
            })
            .then(printMessages)
            .catch((error) => console.error(error));
    }, process.env.INTERVAL);
}
