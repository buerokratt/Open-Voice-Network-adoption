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

## Chat Bot via (RASA)Rest Api (Responses come with response body of request)

### Short description
Sending messages to bot with OVON structure type, and get instant response within
- base url: `https://dev.buerokratt.ee/ovonr`
- path: `/chat/rasa/ovon`
- conversation id is unique if for conversation(ID's could be any number, keep in mind that sessions are always active and don't require initialization)
- event type should be `whisper`
- Header must have `protocol` key with value of version, currently used `ovon_0.3`
- And message is something you want to send to the bot.
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
                    "message": "Nordpool hind hetkel"
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
                    "id": "5011",
                    "cookie": ""
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
- ID: is session that been used for chat
- MESSAGE : response from bot for last message sent within session

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
  - With request body we need to provide chatId and cookie that would conclude chat.
  - Within response, we will get message 'Chat session is closed'.

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
Message within this body is last message sent by bot, but this one could be omitted since all messages could bre recieved with get chat endpoint.

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
Here we reused necessary information (id, cookie from initial request) to send message 'How are things' to the bot 

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
This how response should look like.It contains previously (id, cookie) and infromation that message was sent.

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

We reused same body structure as it was sent to the messaging

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

#### 4. ` https://ruuter.dev.buerokratt.ee/pub1/sse/get-new-messages?chatId=&timeRangeBegin= ` - connect to SSE event to listen for bot RESPONSES.

CURL example: 

``````
curl --location 'https://ruuter.dev.buerokratt.ee/pub1/sse/get-new-messages?chatId=07f564a3-df85-4cbe-a39c-e3ab098f577e&timeRangeBegin=2023-11-02T13%3A10%3A57.970Z' \
--header 'Cookie: chatJwt=eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIiLCJjaGF0SWQiOiIwN2Y1NjRhMy1kZjg1LTRjYmUtYTM5Yy1lM2FiMDk4ZjU3N2UiLCJpc3MiOiJkZXYuYnVlcm9rcmF0dC5lZSIsImZvcndhcmRUbyI6IiIsImV4cCI6MTY5OTAwOTA2MSwiaWF0IjoxNjk5MDAxODYxLCJqdGkiOiJiNjcxN2VhNS01MjRjLTRmMjktODhjZi03MTNjMGQ4ZGUxY2UifQ.GWcr4tRql4yOr-8fOLoppOFmG0fN-uzqevGQkH3yXgNUOrAKjA9mZaiV_99KdmLIShkwY_JAt-Et6dgjhwhUJgz8iKP3ifCX9cezEMsPyNk7lVhE8n99eOZkU4e103zkabAsCmRBwLBFtP18jiOPtECHdu-ha5b2EyIUZQeC32M-551YGQlxAwJbVv0Yyuhu5ndlCtmKM-Or9ffpTI2f2S66dtuF88dAHHGc018uh9MsNaI7ZdH7ZMUHXGxSDQl7w1RMuab9Z-_unrNbZZZofecKfw5kogCqEYeUnX5I7ChwGQpOTJeFF2vvqMAUGOqq1m4ok54CUKHJtVjx8-GlAw'
``````

Here we must provide chat id and cookie that we got from initializing chat and also  timeRangeBegin, would be time of chat initialization