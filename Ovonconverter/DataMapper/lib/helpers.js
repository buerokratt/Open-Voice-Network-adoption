import Handlebars from 'handlebars';
import {extractMessageByProtocol} from "../js/helpers/extractMessageByProtocol.js";

Handlebars.registerHelper('toJSON', function(obj) {
    return JSON.stringify(obj);
});

Handlebars.registerHelper('eq', function(a, b) {
    return a == b;
});

Handlebars.registerHelper('extractMessage', function (request, protocolVersion,eventType) {
    return extractMessageByProtocol(request, protocolVersion, eventType);
})

Handlebars.registerHelper('checkEvent', function(request) {
    const events = request.ovon.events.map(e => e.eventType);
    if(events.includes('invite')) {
        return 'invite';
    }
    if (events.includes('bye')) {
        return 'bye';
    }
    if(events.includes('utterance')) {
        return 'utterance';
    }
    return 'whisper';
})

Handlebars.registerHelper('checkSessionId', function (sessionId) {
    const random4Digit = Math.floor(1000 + Math.random() * 9000);
    return sessionId == null ? random4Digit : sessionId;
})

Handlebars.registerHelper('extractEvent', function (request, protocolVersion,eventType) {
    return extractEventByProtocol(request, protocolVersion, eventType);
})

Handlebars.registerHelper('getDate', function() {
    return new Date().toISOString();
})

Handlebars.registerHelper('isMessage', function(inputValue) {
    return inputValue === 'message';
})

Handlebars.registerHelper('assign', function(varName, varValue, options) {
    if (!options.data.root) {
        options.data.root = {};
    }
    options.data.root[varName] = varValue;
});

Handlebars.registerHelper('isInModel', function(intentTitle, intents) {
    const inModelIntents = intents?.inmodel;
    return Array.isArray(inModelIntents) ? inModelIntents.includes(intentTitle) : false;
});

Handlebars.registerHelper('getCount', function(intentTitle, intents) {
    const intentCounts = intents.count;
    const intentCount = intentCounts?.find(intent => intent.key === intentTitle)?.examples_counts?.value;
    return intentCount || 0;
});

export default Handlebars.helpers;
