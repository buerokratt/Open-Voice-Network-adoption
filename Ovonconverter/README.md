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

