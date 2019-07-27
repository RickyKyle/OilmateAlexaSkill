const Alexa = require('ask-sdk');
const http = require('http');

// Returns a JSON array for the user's readings. 
function httpGet() {

  // Result is returned in a promise due to the async nature of Node's I/O operations.
  return new Promise(((resolve, reject) => {

    // API configuration to be passed in the request. 
    var options = {
        host: '159.65.93.37',
        path: '/api/readings/user/1',
        method: 'GET',
        headers: {
          'Content-Type' : 'application/json',
          'x-access-token' : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsInVzZXJuYW1lIjoiUmlja3lLeWxlIiwiaWF0IjoxNTYzNzM0ODA1fQ.w_Ik97ldaX_9CmDR7kZouw8_s5acTxlyb0Fn4IsIwg8'
        }
    };
    
    // Generate request.
    const request = http.request(options, (response) => {
      console.log("Status code: " + response.statusCode);
      var responseData = "";

      // Add the data to a varaible.
      response.on('data', (chunk) => {
        responseData += chunk;
      });

      response.on('end', () => {

        // When the data has finished being added to the responseData variable, parse it as a JSON array. 
        var returnArray = JSON.parse(responseData); 

        // Get the latest reading from the JSON array.
        var returnReading = returnArray[returnArray.length - 1];
        // Resolve the promise with the JSON object of the latest reading.. 
        resolve(returnReading);
      });

      // Error handling.
      response.on('error', (error) => {
        reject(error);
        console.log(error); 
      });
    });
    request.end();
  }));
}

// Greeting message when the user launches the skill. 
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speakOutput = 'Welcome to Oilmate';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

// Returns the most recent oil level reading. 
const OilLevelHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'OilLevelIntent';
  },
  async handle(handlerInput) {

    const response = await httpGet();

    // Round the data down - prevents overly complicated responses by giving an approximate. 
    var readingRounded = Math.floor(response.reading); 
    
    return handlerInput.responseBuilder
            .speak("You currently have approximately " + readingRounded + " litres of oil remaining.")
            .getResponse();
  },
};

// If the user asks what the Oilmate Skill can do. 
const HelpHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speakOutput = 'You can ask me how much oil you have remaining in your tank.';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

// When the user cancels their session:
const CancelAndStopHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speakOutput = 'Goodbye, I hope you enjoyed using oil mate.';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

// In the event of an error, logs the error and tells the user they didn't understand their command.
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    console.log(error.trace);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

// Export the handlers in the order in which they are likely to be utilised. 
exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    OilLevelHandler,
    HelpHandler,
    CancelAndStopHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
