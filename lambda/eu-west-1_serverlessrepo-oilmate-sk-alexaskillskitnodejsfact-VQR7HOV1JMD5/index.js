const Alexa = require('ask-sdk');
const http = require('http');

function httpGet() {
  return new Promise(((resolve, reject) => {
    var options = {
        host: '159.65.93.37',
        path: '/api/readings/user/1',
        method: 'GET',
        headers: {
          'Content-Type' : 'application/json',
          'x-access-token' : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOjEsInVzZXJuYW1lIjoiUmlja3lLeWxlIiwiaWF0IjoxNTYzNzM0ODA1fQ.w_Ik97ldaX_9CmDR7kZouw8_s5acTxlyb0Fn4IsIwg8'
        }
    };
    
    const request = http.request(options, (response) => {
      console.log("Status code: " + response.statusCode);
      var responseData = "";

      response.on('data', (chunk) => {
        responseData += chunk;
      });

      response.on('end', () => {
        console.log(responseData); 
        var returnArray = JSON.parse(responseData); 
        console.log(returnArray);
        var returnReading = returnArray[returnArray.length - 1];
        console.log(returnReading); 
        resolve(returnReading);
      });

      response.on('error', (error) => {
        reject(error);
      });
    });
    request.end();
  }));
}

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

const OilLevelHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'OilLevelIntent';
  },
  async handle(handlerInput) {
    const response = await httpGet();
    var readingRounded = Math.floor(response.reading); 
    
    return handlerInput.responseBuilder
            .speak("You currently have approximately " + readingRounded + " litres of oil remaining.")
            .reprompt("Do you have another question?")
            .getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speakOutput = 'You can say hello to me!';

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

const CancelAndStopHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speakOutput = 'Goodbye!';

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
