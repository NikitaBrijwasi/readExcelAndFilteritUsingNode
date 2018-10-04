'use strict';
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const fs = require('fs');
let filters;
let responseMsg = "";
const readline = require('readline');
const {google} = require('googleapis');
var NewFilteredMap = new Map();

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
  
  let action = request.body.queryResult.action;
console.log ("action" +action);
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
}

function excels(filters){
   const sheets = google.sheets({version: 'v4'});
  sheets.spreadsheets.values.get({
    spreadsheetId: '17J-**********************************',
    range: 'Sheet1!A2:F',
    key: 'AIza**********************************',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    //rows contains all data present in excel
    const rows = res.data.values;
    console.log('print rows' +rows);
    console.log('total number of records are' +rows.length);
    if (rows.length) {
         rows.map((row) => {
        if(row!=row[0])
        {   if(row[2] === filters)
            {   let key=0;
                console.log("inside if");
                //NewFilteredMap contains filtered data of original excel with 
                //Key as data present in 0th column of original excel and
                //value as data present in a row of original excel.
                NewFilteredMap.set(row[0], row);
                console.log("count.......  "+NewFilteredMap.get(row[key]));
                key++;
            }
        }
      });
     } 
     else {
      console.log('No data found.');
    }
  });
}

//action filterExcel needs to be added in respective Intent to invoke this method.
//And filters need to be provided as parameter in case we wish to externally apply them as shown in this case.
if(action === 'filterExcel'){
     filters = request.body.queryResult.parameters.filters;
     console.log('filters to be applied as provided by skill to Google assistant: '+filters);
     excels(filters);
     responseMsg = 'Filters have been applied and the filtered data is available in NewFilteredMap';
     response.json({ 'fulfillmentText': responseMsg});
}
});