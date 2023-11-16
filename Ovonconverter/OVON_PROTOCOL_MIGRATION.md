### Implementing conversion from OVON to BYK and vice versa using protocol version

#### Converting OVON to BYK
### Short description
In order to add new OVON mappings we need to create 2 mapper files in ovon `Datamapper/views/ovon` folder, one is to accept 
ovon `ovonToByk_VX.X.hbs`(X.X would be protocol version that being passed with protocol header) and one file to get proper ovon response
`bykToOvon_VX.X.hbs` (Both mappers should have same version).Adjust mapper file to ensure that all vital information been passed both sides.

----------

1. Create new mapper accept new request format `ovonToByk_VX.X.hbs`
Create new mapping file that would properly extract information from OVON request and converts it to Buerokratt.
We already have [ovonToByk](DataMapper/views/ovon/ovonToByk_V0.3.hbs) so it would be used as an example

````
{
    "message": {
        "chatId": "{{ request.ovon.conversation.id}}",
        "authorTimestamp": "{{ getDate }}",
        {{#if (eq type 'message')}}
            "content": "{{ extractMessage request protocolVersion eventType}}",
        {{else}}
            "event": "CLIENT_LEFT_WITH_ACCEPTED",
        {{/if}}
        "authorRole": "end-user"
    },
    "endUserTechnicalData": {
        "endUserUrl": "https://dev.buerokratt.ee/",
        "endUserOs": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/119.0"
    }
}
````

* Need to make similar file with name of the version you intend to use for example ovonToByk_VX.X.hbs in `Datamapper/views/ovon`
* According to new OVON structure need to provide proper path for 'id'.(In provided example its ovon.conversation.id within OVON request)
* Now update [helper script](DataMapper/js/helpers/extractMessageByProtocol.js) for extracting message from request.
  - Add function to provide route for message within OVON request body
  - Add switch case to include new function for new version processing

2. Create new mapper send new response format `bykToOvon_VX.X.hbs`
Create new mapping file that would properly extract information from BYK response into OVON response.
We already have [bykToOvon](DataMapper/views/ovon/bykToOvon_V0.3.hbs) this would be used as an example

```
{
    "ovon": {
        "conversation": {
            "id": "{{ bykResponse.id }}",
            "cookie": "{{{ cookie }}}"
        },
        "sender": {
            "from": "https://dev.buerokratt.ee"
        },
        "responseCode" : 200,
        "events": [
            {
                "eventType": "{{ eventType}}",
                "parameters": {
                    "to": {
                    "url": "https://dev.buerokratt.ee"
                    },
                    "message": "{{ bykResponse.lastMessage }}"
                }
            }
        ]
    }
}
```
Create new mapper `bykToOvon_VX.X.hbs` file where you define structure of desired OVON response
and fill it with necessary information.In [example](DataMapper/views/ovon/bykToOvon_V0.3.hbs), here i provide data currently used but you can modify it to your needs.
* 'id' chat id that been used before or we got as response from initial request(With RASA request this is SESSION ID that is used from start)
* Cookie is session cookie that been provided by init request and need for any future call for this session(With RASA request not used, can be omitted)
* event type you can put any text you need to see, currently i used whisper/init/end as inputs
* message - is something that could be returned after request is sent
  - message for init contains initial bot response
  - message for sending message would tell if message is sent successfully
  - message for end chat is hardcoded due current structure of request
  - With RASA message would contain response from the BOT.

### After these steps are completed you can use new protocol version that was defined within new mapping files
For example if new mapping files have ending of V2.3.hbs then new `protocol` header must be `ovon_2.3`