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

Request body: OVON message in JSON format.
Headers: 
	"Content-type": "application/json"
	"Application-type": "application/ovon" for Ruuter to filter out OVON 
	messages for conversion

### Testing/demonstration html form

Included is a html file `test_file.html` which send an AJAX request to Ruuter 
to demonstrate the solution. 