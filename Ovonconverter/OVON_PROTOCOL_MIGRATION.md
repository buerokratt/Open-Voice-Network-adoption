### Implementing conversion from OVON to BYK and vice versa using protocol version

#### Converting OVON to BYK
Firstly we would need to create mapping file that would properly extract information from OVON request to Buerokratt.
We already have [ovonToByk](DataMapper/views/ovon/ovonToByk_V1.hbs)

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

* Need to make similar file with name of the version you intend to use for example ovonToByk_V05.hbs
* According to new OVON structure need to provide proper path for 'id'. Currently, its ovo.conversation.id within OVON request
* Now we need to modify helper script for extracting message from request here [messageExtract](DataMapper/js/helpers/extractMessageByProtocol.js)
  - Add function to provide route for message with OVON request body
  - Add switch case to include new function for new version processing

Mapping is complete now need to update all DSL steps to process new version 
 [init](DSL/POST/chat/init/ovon.yml)
 [message](DSL/POST/chat/message/ovon.yml)
 [end](DSL/POST/chat/end/ovon.yml)

There is Step/function call 'convertOvonToByk' that have switch case, you need to add new condition with specific version you want to use,
providing next as a new Step/function that would be triggered for this version.Creating new Step/function

````
ovonToBykV1:
  call: http.post
  args:
    url: http://ovon_dmapper:3000/dmapper/ovonToByk-V1
    body:
      request: ${request}
      type: "message"
      eventType: "invite"
      protocolVersion: ${incoming.headers.protocol}
  result: bykRequest
````

Here can copy existing step and update name and url that would use previously created mapper, then use this step for condition
modified example(Note that if file having underscore symbol '_' then url should be with hyphen symbol '-')
````
ovonToBykV07:
  call: http.post
  args:
    url: http://ovon_dmapper:3000/dmapper/ovonToByk-V07
    body:
      request: ${request}
      type: "message"
      eventType: "invite"
      protocolVersion: ${incoming.headers.protocol}
  result: bykRequest
````
updated condition exmaple
````
convertOvonToByk:
  switch:
    - condition: ${protocolVersion.includes('ovon_0.3')}
      next: ovonToBykV1
    - condition: ${protocolVersion.includes('ovon_0.7')}
      next: ovonToBykV07
  next: ovonToBykV1
````
for these examples we are using `ovonToByk_V07.hbs` file for mapping that should be located in `DataMapper/views/ovon/`

#### Converting BYK to OVON
Firstly we would need to create mapping file that would properly extract information from OVON request to Buerokratt.
We already have [bykToOvon](DataMapper/views/ovon/bykToOvon_V03.hbs)

Process is identical as OVON to BYK just reversed, we need to create new mapper .hbs file where you define structure of desired OVON response
and fill it with necessary information.In example of [bykToOvon](DataMapper/views/ovon/bykToOvon_V03.hbs)
* Set to 'id' chat id that been used before or we got as response from initial request
* Cookie is session cookie that been provided by init request and need for any future call for this session
* event type you can put any text you need to see, currently i used whisper/init/end as inputs, but mainly its text and could bre replaced by any needed text
* message - is something that could be returned after calling an DSL file
  - message for init contains initial bot response
  - message for sending message would tell if message is sent successfully
  - message for end chat is hardcoded due current structure of request

As with converting ovon to byk we need to add/modify these steps same way
* convertBykToOvon add new condition for new version
* bykToOvonV07 or any name you plan to use
