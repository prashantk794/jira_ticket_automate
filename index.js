const notifier = require('mail-notifier');
var axios = require('axios');
const imap = {
  user: 'YOUR_EMAIL_ID',
  password: 'YOUR_PASSWORD',
  host: "imap.gmail.com",
  port: 993, // imap port
  tls: true,// use secure connection
  tlsOptions: { rejectUnauthorized: false },
  box:'INBOX'
}
notifier(imap)
  .on('mail', mail => CallJira(mail['subject'], mail['text']))
  .start();



function CallJira(subject, text){
    
  var data = JSON.stringify({
    "fields": {
      "project": {
        "key": "NODE"
      },
      "summary": subject,
      "description": text,
      "issuetype": {
        "name": "Bug"
      }
    }
  });
  
  var config = {
    method: 'post',
    url: '<YOUR_JIRA_URL>rest/api/2/issue',
    headers: { 
      'Authorization': 'Basic <YOUR APP ACCESS TOKEN >', 
      'Content-Type': 'application/json', 
      'Cookie': 'atlassian.xsrf.token=13ac9972-2220-4061-b294-2a4ae33ac6e8_2c7134d964103e3ba796e06156e3f2a0e8014c39_lin'
    },
    data : data
  };

  axios(config)
  .then(function (response) {
    console.log(response.status)

    if(response.status == 201)
      console.log(JSON.stringify(response.data['self']));
      CallSlack(response.data['self'])
    })
  .catch(function (error) {
    console.log(error);
  });


}

function CallSlack(jira_ticket_url){
  var data = JSON.stringify({
      "text": <YOUR_JIRA_PROFILE>/jira_ticket_url
    });

    var config = {
      method: 'post',
      url: '<YOUR_SLACK_WEBHOOK_URL>/',
      headers: { 
        'Content-Type': 'application/json'
      },
      data : data
    };

    axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });
}
