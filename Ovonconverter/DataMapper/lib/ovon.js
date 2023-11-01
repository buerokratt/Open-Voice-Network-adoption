

export default function ovonConvert(input){	
	var events = input["ovon"]["events"].map((event) => {
		if (event.parameters["dialog-event"]) {
			var output = {
			    "schema": input.ovon.schema.url,
			    "event": {
			        "id": "21680825631298608436367356332136",
			        "origin_server_ts": Date.parse(event.parameters["dialog-event"].span["start-time"]),
			    },
			    "conversation": {
			        "id": input.ovon.conversation.id,
			    },
			    "message": {
			        "response_to": "94234007341143393076049309873622",
			        "sensitivity": 1,
			        "encryption": "none",
			        "content": {
			            "type": "text",
			            "lang": "en",
			            "encoding": "UTF-8",
			            "body": event.parameters["dialog-event"].features.text.tokens.map((token) => token.value).join(),
			            "formatted_body": "<p>" + event.parameters["dialog-event"].features.text.tokens.map((token) => token.value).join() + "</p>",
			        }
			    },
			    "participants": {
			        "from": {
			            "from": input.ovon.sender.from,
			            "reply-to": input.ovon.sender["reply-to"],
			            "avatar_url": input.ovon.conversation.speakers || input.ovon.conversation.speakers[0]["avatar-url"],
			            "displayname": input.ovon.conversation.speakers || input.ovon.conversation.speakers[0]["display-name"],
			        },
			        "to": {
			            "address": "https://example.com/chatbot",
			            "labels": ""
			        }
			    }
			}
			return output;
		}
	});
	return events;
};

