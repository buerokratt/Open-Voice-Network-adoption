const extractMessageV03 = (request, eventType) => {
    const events = request.ovon.events;
    const whisperEvent = events.filter(events => events.eventType === eventType);
    return whisperEvent[0].parameters.message;
}

const extractMessageV05 = (request, eventType) => {
    const events = request.ovon.events;
    const whisperEvent = events.filter(events => events.eventType === eventType);
    return whisperEvent[0].parameters.dialogEvent.features.text.tokens[0].value;
}

export function extractMessageByProtocol(requestJson, version, eventType) {
    switch(version) {
        case 'V0.3' :
        case 'V0.4':
            return extractMessageV03(requestJson, eventType);
        case 'V0.5':
            return extractMessageV05(requestJson, eventType);
        default:
            return extractMessageV03(requestJson, eventType);
    }
}