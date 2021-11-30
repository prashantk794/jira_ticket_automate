var Imap = require('imap');
var axios = require('axios');
var imap = new Imap({
  user: 'YOUR_EMAIL_ID',
  password: 'YOUR_PASSWORD',
  host: 'imap.gmail.com', // put your mail host
  port: 993, // your mail host port
  tls: true 
})

function openInbox(cb) {
  imap.openBox('INBOX', true, cb);

}

imap.once('ready', function() {
  openInbox(function(err, box) {
    if (err) throw err;
    var f = imap.seq.fetch('1:1', {
      bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
      struct: true
    });
    f.on('message', function(msg, seqno) {
      msg.on('body', function(stream, info) {
        var buffer = '';
        stream.on('data', function(chunk) {
          buffer += chunk.toString('utf8');
        });
        stream.once('end', function() {
          var data = Imap.parseHeader(buffer);
           CallJira(data['subject'][0]);
        });
      });
     
      msg.once('end', function() {
        console.log('Finished');
      });
    });
    f.once('error', function(err) {
      console.log('Fetch error: ' + err);
    });
    f.once('end', function() {
      console.log('Done fetching all messages!');
      imap.end();
    });
  });
});

imap.once('error', function(err) {
  console.log(err);
});

imap.once('end', function() {
  console.log('Connection ended');
});

imap.connect();

function CallJira(subject){
    
  var data = JSON.stringify({
    "fields": {
      "project": {
        "key": "NODE"
      },
      "summary": subject,
      "description": subject,
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
      "text": jira_ticket_url
    });

    var config = {
      method: 'post',
      url: '<YOUR_SLACK_WEBHOOK_URL>',
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
