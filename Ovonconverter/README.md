# Ovonconverter - a proof-of-concept demonstration of Ruuter and Pipelines components to filter and convert OVON messages

### Startup

```
docker-compose up -d
```

This starts both Ruuter and Pipelines component with necessary DSL's and 
pipelines.
Currently, as a proof-of-concept, Ruuter starts at the default port 8080, this 
can be configured in environment variable PORT.


### REST API Request

#### POST /ovonmessage

Request body: 
	"input": OVON message in JSON format.
	"type": "ovon" | "json" | "text"
Headers: 
	"Content-type": "application/json"
	

### Testing/demonstration html form

Included is a html file `test_message.html` which send an AJAX request to Ruuter to demonstrate the conversion of plaintext message to OVON JSON and that to Buerokratt JSON.

### Updating protocol migration

#### To add new version of OVON protocol follow this [guide](OVON_PROTOCOL_MIGRATION.md)

## Chat Bot using event as key via (RASA)Rest Api (Responses come with response body of request)

### Short description
Sending messages to bot with OVON structure type, and get instant response.
- Base url: `https://dev.buerokratt.ee/ovonr`
- Path: `/conversation`
- (OPTIONAL)Conversation.id is unique session id for the conversation(ID could be any id, but if it left as null, ID would be generated and response will include this ID)
- Event type should could be one of the following:
  - invite (This would send a greeting message as response)
  - bye (This would send a goodbye message as response)
  - utterance (This would be processed by bot and response would be sent)
  - whisper (This wont be sent to the bot but would be processed)
- Header must have `protocol` key with value of version, currently used `ovon_0.5`(Latest version of structure)
    - This header define which ovon converter should be used for converting to and from OVON
- Message is text that would be sent to the bot.
  Curl example request for utterance event:
```
curl --location 'https://dev.buerokratt.ee/ovonr/conversation' \
--header 'protocol: ovon_0.5' \
--header 'Content-Type: application/json' \
--data '{
    "ovon": {
        "conversation": {
            "id": null
        },
        "sender": {
            "from": "https://someBotThatOfferedTheInvite.com"
        },
        "responseCode": 200,
        "events": [
            {
                "eventType": "utterance",
                "parameters": {
                    "dialogEvent": {
                        "speakerId": "bykbot",
                        "span": { "startTime": "2023-06-14 02:06:07+00:00" },
                        "features": {
                            "text": {
                                "mimeType": "text/plain",
                                "tokens": [ { "value": "Nice to meet you Ms SomeBot."  } ]
                            }
                        }
                    }
                }
            }
        ]
    }
}'
```

Response example:

```
{
    "response": {
        "data": {
            "ovon": {
                "conversation": {
                    "id": "9261"
                },
                "sender": {
                    "from": "https://dev.buerokratt.ee"
                },
                "responseCode": 200,
                "events": [
                    {
                        "eventType": "utterance",
                        "parameters": {
                            "dialogEvent": {
                                "speakerId": "bykbot",
                                "span": {
                                    "startTime": "2023-11-30T10:19:04.433Z"
                                },
                                "features": {
                                    "text": {
                                        "mimeType": "text/plain",
                                        "tokens": [
                                            {
                                                "value": "Ma ei saanud päris täpselt aru."
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                ]
            }
        }
    }
}
```
- ID: is session that been used for chat(Generated if not provided initially)
- MESSAGE : response from bot for last message sent within session
    - "Ma ei saanud päris täpselt aru." signifies that bot couldn't understand the input of user.

## Chat Bot via (RASA)Rest Api (Responses come with response body of request)

### Short description
Sending messages to bot with OVON structure type, and get instant response.
- Base url: `https://dev.buerokratt.ee/ovonr`
- Path: `/chat/rasa/ovon`
- Conversation.id is unique session id for the conversation(ID's could be any number 5000-5050, keep in mind that sessions are always active and don't require initialization)
- Event type should be `whisper`
- Header must have `protocol` key with value of version, currently used `ovon_0.4`(Excluded cookie part, since not needed for this type of request)
  - This header define which ovon converter should be used for converting to and from OVON
- Message is text that would be sent to the bot.
Curl example request:
```
curl --location 'https://dev.buerokratt.ee/ovonr/chat/rasa/ovon' \
--header 'protocol: ovon_0.3' \
--header 'Content-Type: application/json' \
--data '{
    "ovon": {
        "conversation": {
            "id": 5011
        },
        "sender": {
            "from": "https://someBotThatOfferedTheInvite.com"
        },
        "responseCode": 200,
        "events": [
            {
                "eventType": "whisper",
                "parameters": {
                    "to": {
                        "url": "https://someBotThatIsBeingInvited.com"
                    },
                    "message": "Kes sa oled?"
                }
            }
        ]
    }
}'
```

Response example:

```
{
    "response": {
        "data": {
            "ovon": {
                "conversation": {
                    "id": "5010"
                },
                "sender": {
                    "from": "https://dev.buerokratt.ee"
                },
                "responseCode": 200,
                "events": [
                    {
                        "eventType": "whisper",
                        "parameters": {
                            "to": {
                                "url": "https://dev.buerokratt.ee"
                            },
                            "message": "Ma ei saanud päris täpselt aru."
                        }
                    }
                ]
            }
        }
    }
}
```
- ID: is session that been used for chat(Keep same id if you want to keep same conversation up)
- MESSAGE : response from bot for last message sent within session
  - "Ma ei saanud päris täpselt aru." signifies that bot couldnt process the input of user.


## Chat Bot via Rest Api (Responses come from stream)

#### Short description:
Communication with bot happens via rest api calls,bot responses via tex/event-stream where you recieve a stream of data, each JSON within this stream contains entire chat history.
* Base URL for all requests : ` https://dev.buerokratt.ee/ovonr `
* All post requests must have header providing current OVON protocol version, current base is ` protocol = ovon_0.3 `
* As request response used OVON min body with small modifications [OVON request/response body](https://github.com/open-voice-network/lib-interop/tree/main/javascript/sample-json/SuperMinSandBox20231018)
* Converting Buerokratt to OVON protocol instructions could be found here [OVON protocol conversion](OVON_PROTOCOL_MIGRATION.md)  
* To start using bot we need to initialize session with bot use  ` /chat/init/ovon` path
  - With request body we need to provide initial message for the bot initialization.
  - Within response, we will be provided with chatID and cookie which is sessionId for initialized bot session.We need to use these 2 values for all further interactios(calls).
* To send message to the bot use ` /chat/message/ovon ` path
  - With request body we must provide chatId that was given on point of initialization and message that you want to send.Also request must include session cookie in order for request to succeed.
  - With response, you will get message stating 'Message was sent successfully', this indicator that request worked.
  - Response also would provide USED chatId and cookie, so they could be reused for future calls. 
* To finish session with the bot use ` /chat/end/ovon ` path
  - With request body, need to provide chatId and cookie that would conclude chat.
  - Within response, will get message 'Chat session is closed'.

#### API calls examples
#### 1. ` https://dev.buerokratt.ee/ovonr/chat/init/ovon ` - this would initialize the chat.
CURL example:
``````
curl --location 'http://dev.buerokratt.ee/ovonr/chat/init/ovon' \
--header 'protocol: ovon_0.3' \
--header 'Content-Type: application/json' \
--data '{
    "ovon": {
        "conversation": {
            "id": null
        },
        "sender": {
            "from": "https://someBotThatOfferedTheInvite.com"
        },
        "responseCode": 200,
        "events": [
            {
                "eventType": "invite",
                "parameters": {
                    "to": {
                        "url": "https://someBotThatIsBeingInvited.com"
                    },
                    "message": "Hei"
                }
            }
        ]
    }
}'
``````

RESPONSE example:

``````
{
    "response": {
        "data": {
            "ovon": {
                "conversation": {
                    "id": "07f564a3-df85-4cbe-a39c-e3ab098f577e",
                    "cookie": "chatJwt=eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIiLCJjaGF0SWQiOiIwN2Y1NjRhMy1kZjg1LTRjYmUtYTM5Yy1lM2FiMDk4ZjU3N2UiLCJpc3MiOiJkZXYuYnVlcm9rcmF0dC5lZSIsImZvcndhcmRUbyI6IiIsImV4cCI6MTY5OTAwOTA2MSwiaWF0IjoxNjk5MDAxODYxLCJqdGkiOiJiNjcxN2VhNS01MjRjLTRmMjktODhjZi03MTNjMGQ4ZGUxY2UifQ.GWcr4tRql4yOr-8fOLoppOFmG0fN-uzqevGQkH3yXgNUOrAKjA9mZaiV_99KdmLIShkwY_JAt-Et6dgjhwhUJgz8iKP3ifCX9cezEMsPyNk7lVhE8n99eOZkU4e103zkabAsCmRBwLBFtP18jiOPtECHdu-ha5b2EyIUZQeC32M-551YGQlxAwJbVv0Yyuhu5ndlCtmKM-Or9ffpTI2f2S66dtuF88dAHHGc018uh9MsNaI7ZdH7ZMUHXGxSDQl7w1RMuab9Z-_unrNbZZZofecKfw5kogCqEYeUnX5I7ChwGQpOTJeFF2vvqMAUGOqq1m4ok54CUKHJtVjx8-GlAw"
                },
                "sender": {
                    "from": "https://dev.buerokratt.ee"
                },
                "responseCode": 200,
                "events": [
                    {
                        "eventType": "init",
                        "parameters": {
                            "to": {
                                "url": "https://dev.buerokratt.ee"
                            },
                            "message": "Kuidas saan abiks olla?"
                        }
                    }
                ]
            }
        }
    }
}
``````
Here is important to save chat id and cookie values for future calls provided in response.data.conversation. id and cookie
Message within this body is last message sent by bot, but this one could be omitted since all messages could are received with get chat endpoint.

#### 2. ` https://dev.buerokratt.ee/ovonr/chat/message/ovon ` - this would send message to chat.

CURL example:

``````
curl --location 'http://dev.buerokratt.ee/ovonr/chat/message/ovon' \
--header 'protocol: ovon_0.3' \
--header 'Cookie: chatJwt=eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIiLCJjaGF0SWQiOiIwN2Y1NjRhMy1kZjg1LTRjYmUtYTM5Yy1lM2FiMDk4ZjU3N2UiLCJpc3MiOiJkZXYuYnVlcm9rcmF0dC5lZSIsImZvcndhcmRUbyI6IiIsImV4cCI6MTY5OTAwOTA2MSwiaWF0IjoxNjk5MDAxODYxLCJqdGkiOiJiNjcxN2VhNS01MjRjLTRmMjktODhjZi03MTNjMGQ4ZGUxY2UifQ.GWcr4tRql4yOr-8fOLoppOFmG0fN-uzqevGQkH3yXgNUOrAKjA9mZaiV_99KdmLIShkwY_JAt-Et6dgjhwhUJgz8iKP3ifCX9cezEMsPyNk7lVhE8n99eOZkU4e103zkabAsCmRBwLBFtP18jiOPtECHdu-ha5b2EyIUZQeC32M-551YGQlxAwJbVv0Yyuhu5ndlCtmKM-Or9ffpTI2f2S66dtuF88dAHHGc018uh9MsNaI7ZdH7ZMUHXGxSDQl7w1RMuab9Z-_unrNbZZZofecKfw5kogCqEYeUnX5I7ChwGQpOTJeFF2vvqMAUGOqq1m4ok54CUKHJtVjx8-GlAw' \
--header 'Content-Type: application/json' \
--data '{
    "ovon": {
        "conversation": {
            "id": "07f564a3-df85-4cbe-a39c-e3ab098f577e"
        },
        "sender": {
            "from": "https://someBotThatOfferedTheInvite.com"
        },
        "responseCode": 200,
        "events": [
            {
                "eventType": "whisper",
                "parameters": {
                    "to": {
                        "url": "https://someBotThatIsBeingInvited.com"
                    },
                    "message": "How are things"
                }
            }
        ]
    }
}'
``````
Here we reused necessary information (id, cookie from initial requests response) to send message 'How are things' to the bot 

RESPONSE example: 

``````
{
    "response": {
        "data": {
            "ovon": {
                "conversation": {
                    "id": "07f564a3-df85-4cbe-a39c-e3ab098f577e",
                    "cookie": "chatJwt=eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIiLCJjaGF0SWQiOiIwN2Y1NjRhMy1kZjg1LTRjYmUtYTM5Yy1lM2FiMDk4ZjU3N2UiLCJpc3MiOiJkZXYuYnVlcm9rcmF0dC5lZSIsImZvcndhcmRUbyI6IiIsImV4cCI6MTY5OTAwOTA2MSwiaWF0IjoxNjk5MDAxODYxLCJqdGkiOiJiNjcxN2VhNS01MjRjLTRmMjktODhjZi03MTNjMGQ4ZGUxY2UifQ.GWcr4tRql4yOr-8fOLoppOFmG0fN-uzqevGQkH3yXgNUOrAKjA9mZaiV_99KdmLIShkwY_JAt-Et6dgjhwhUJgz8iKP3ifCX9cezEMsPyNk7lVhE8n99eOZkU4e103zkabAsCmRBwLBFtP18jiOPtECHdu-ha5b2EyIUZQeC32M-551YGQlxAwJbVv0Yyuhu5ndlCtmKM-Or9ffpTI2f2S66dtuF88dAHHGc018uh9MsNaI7ZdH7ZMUHXGxSDQl7w1RMuab9Z-_unrNbZZZofecKfw5kogCqEYeUnX5I7ChwGQpOTJeFF2vvqMAUGOqq1m4ok54CUKHJtVjx8-GlAw"
                },
                "sender": {
                    "from": "https://dev.buerokratt.ee"
                },
                "responseCode": 200,
                "events": [
                    {
                        "eventType": "whisper",
                        "parameters": {
                            "to": {
                                "url": "https://dev.buerokratt.ee"
                            },
                            "message": "Message Sent Successfully"
                        }
                    }
                ]
            }
        }
    }
}
``````
This how response should look like.It contains previously used(id, cookie) and confirmation that message was sent.

#### 3. ` https://dev.buerokratt.ee/ovonr/chat/end/ovon ` - this would end the chat.

CURL example:

``````
curl --location 'http://dev.buerokratt.ee/ovonr/chat/end/ovon' \
--header 'protocol: ovon_0.3' \
--header 'Cookie: chatJwt=eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIiLCJjaGF0SWQiOiIwN2Y1NjRhMy1kZjg1LTRjYmUtYTM5Yy1lM2FiMDk4ZjU3N2UiLCJpc3MiOiJkZXYuYnVlcm9rcmF0dC5lZSIsImZvcndhcmRUbyI6IiIsImV4cCI6MTY5OTAwOTA2MSwiaWF0IjoxNjk5MDAxODYxLCJqdGkiOiJiNjcxN2VhNS01MjRjLTRmMjktODhjZi03MTNjMGQ4ZGUxY2UifQ.GWcr4tRql4yOr-8fOLoppOFmG0fN-uzqevGQkH3yXgNUOrAKjA9mZaiV_99KdmLIShkwY_JAt-Et6dgjhwhUJgz8iKP3ifCX9cezEMsPyNk7lVhE8n99eOZkU4e103zkabAsCmRBwLBFtP18jiOPtECHdu-ha5b2EyIUZQeC32M-551YGQlxAwJbVv0Yyuhu5ndlCtmKM-Or9ffpTI2f2S66dtuF88dAHHGc018uh9MsNaI7ZdH7ZMUHXGxSDQl7w1RMuab9Z-_unrNbZZZofecKfw5kogCqEYeUnX5I7ChwGQpOTJeFF2vvqMAUGOqq1m4ok54CUKHJtVjx8-GlAw' \
--header 'Content-Type: application/json' \
--data '{
    "ovon": {
        "conversation": {
            "id": "07f564a3-df85-4cbe-a39c-e3ab098f577e"
        },
        "sender": {
            "from": "https://someBotThatOfferedTheInvite.com"
        },
        "responseCode": 200,
        "events": [
            {
                "eventType": "end",
                "parameters": {
                    "to": {
                        "url": "https://someBotThatIsBeingInvited.com"
                    }
                }
            }
        ]
    }
}'
``````

Request contains previously used id, cookie.
Event type is end.

RESPONSE example:

``````
{
    "response": {
        "data": {
            "ovon": {
                "conversation": {
                    "id": "07f564a3-df85-4cbe-a39c-e3ab098f577e",
                    "cookie": "chatJwt=eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIiLCJjaGF0SWQiOiIwN2Y1NjRhMy1kZjg1LTRjYmUtYTM5Yy1lM2FiMDk4ZjU3N2UiLCJpc3MiOiJkZXYuYnVlcm9rcmF0dC5lZSIsImZvcndhcmRUbyI6IiIsImV4cCI6MTY5OTAwOTA2MSwiaWF0IjoxNjk5MDAxODYxLCJqdGkiOiJiNjcxN2VhNS01MjRjLTRmMjktODhjZi03MTNjMGQ4ZGUxY2UifQ.GWcr4tRql4yOr-8fOLoppOFmG0fN-uzqevGQkH3yXgNUOrAKjA9mZaiV_99KdmLIShkwY_JAt-Et6dgjhwhUJgz8iKP3ifCX9cezEMsPyNk7lVhE8n99eOZkU4e103zkabAsCmRBwLBFtP18jiOPtECHdu-ha5b2EyIUZQeC32M-551YGQlxAwJbVv0Yyuhu5ndlCtmKM-Or9ffpTI2f2S66dtuF88dAHHGc018uh9MsNaI7ZdH7ZMUHXGxSDQl7w1RMuab9Z-_unrNbZZZofecKfw5kogCqEYeUnX5I7ChwGQpOTJeFF2vvqMAUGOqq1m4ok54CUKHJtVjx8-GlAw"
                },
                "sender": {
                    "from": "https://dev.buerokratt.ee"
                },
                "responseCode": 200,
                "events": [
                    {
                        "eventType": "end",
                        "parameters": {
                            "to": {
                                "url": "https://dev.buerokratt.ee"
                            },
                            "message": "Chat session is closed."
                        }
                    }
                ]
            }
        }
    }
}
``````

Response contains previously used id, cookie and confirmation that session was closed.

#### 4. ` https://ruuter.dev.buerokratt.ee/pub1/sse/get-new-messages?chatId=&timeRangeBegin= ` - connect to SSE event to listen for bot RESPONSES.

CURL example: 

``````
curl --location 'https://ruuter.dev.buerokratt.ee/pub1/sse/get-new-messages?chatId=07f564a3-df85-4cbe-a39c-e3ab098f577e&timeRangeBegin=2023-11-02T13%3A10%3A57.970Z' \
--header 'Cookie: chatJwt=eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIiLCJjaGF0SWQiOiIwN2Y1NjRhMy1kZjg1LTRjYmUtYTM5Yy1lM2FiMDk4ZjU3N2UiLCJpc3MiOiJkZXYuYnVlcm9rcmF0dC5lZSIsImZvcndhcmRUbyI6IiIsImV4cCI6MTY5OTAwOTA2MSwiaWF0IjoxNjk5MDAxODYxLCJqdGkiOiJiNjcxN2VhNS01MjRjLTRmMjktODhjZi03MTNjMGQ4ZGUxY2UifQ.GWcr4tRql4yOr-8fOLoppOFmG0fN-uzqevGQkH3yXgNUOrAKjA9mZaiV_99KdmLIShkwY_JAt-Et6dgjhwhUJgz8iKP3ifCX9cezEMsPyNk7lVhE8n99eOZkU4e103zkabAsCmRBwLBFtP18jiOPtECHdu-ha5b2EyIUZQeC32M-551YGQlxAwJbVv0Yyuhu5ndlCtmKM-Or9ffpTI2f2S66dtuF88dAHHGc018uh9MsNaI7ZdH7ZMUHXGxSDQl7w1RMuab9Z-_unrNbZZZofecKfw5kogCqEYeUnX5I7ChwGQpOTJeFF2vvqMAUGOqq1m4ok54CUKHJtVjx8-GlAw'
``````

Here we must provide chat id and cookie that we got from initializing chat and also  timeRangeBegin, would be time of chat initialization.
Then you will get text/stream event connection and every received json would contain chat history.