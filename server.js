const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const http = require('https')
app.use(bodyParser.json())
app.set('port', (process.env.PORT || 5000))

const REQUIRE_AUTH = true
const AUTH_TOKEN = 'an-example-token'

app.get('/', function (req, res) {
  res.send('Use the /webhook endpoint.')
})
app.get('/webhook', function (req, res) {
  res.send('You must POST your request')
})


app.post('/jobpost', function (req, result) {
  var action = req.body.result.action;
  console.log(action);
  if (action == "externaljobposting") {
    var technology = req.body.result.parameters['technology'];    //last update
    var joblocation = req.body.result.parameters['joblocation'];  //last update
    var options = {
      "method": "GET",
      "hostname": "ustbotsearch.search.windows.net",
      "port": null,
      // "path": "/indexes/ijp-index/docs?api-version=2016-09-01&%24filter=Is_Posted_Externally%C2%A0eq%20'Yes'%20and%20Current_Status%20eq%20'Sourcing'&querytype=full&%24top=15&search=Location_Level1%3A%22" + joblocation + "%22%20Location_Level2%3A%22" + joblocation + "%22%20Location_Level3%3A%22" + joblocation + "%22%20Location_Level4%3A%22" + joblocation + "%22%20Title%3A%22%22%20UST_PRIMARY_COMPETENCY%3A%22" + technology + "%22",
      "path": "/indexes/ijp-index/docs?api-version=2016-09-01&%24filter=JobPostingExternal%C2%A0eq%20'YES'%20&querytype=full&%24top=50&search=Title%3A%22%22%20PrimarySkill%3A(%22" + technology + "%22)%20Primarylocation%3A%22" + joblocation + "%22%20Country%3A%22" + joblocation + "%22%20State%3A%22" + joblocation + "%22",
      "headers": {
        "content-type": "application/json; charset=utf-8",
        "api-key": "1AF2593D94137D72051204F97E0BDC14"
      }
    };
    http.get(options, res => {
      res.setEncoding("utf8");
      let body = "";
      res.on("data", data => {
        body += data;
      });
      res.on("end", () => {
        var flag = [{ "source": "webhook" }];
        body = JSON.parse(body);
        var tmpbody = body;
        flag.push(tmpbody);
        var finresult = JSON.stringify(flag);
        // result.send(tmpbody);
        result.status(200).json({
          source: 'webhook',
          speech: finresult,
          displayText: finresult
        })
      });
    });
  }
  else if (action == "jobdetail") {
    var jobdett = req.body.result.parameters['jobdetails'];
    var options = {
      "method": "GET",
      // "hostname": "fmw.uat.ust-global.com",
      "hostname": "ustbotsearch.search.windows.net",
      "port": null,
      // "path": "/indexes/ijp-index/docs?api-version=2016-09-01&%24filter=Is_Posted_Externally%20eq%20'Yes'%20and%20Current_Status%20eq%20'Sourcing'%20and%20search.ismatch('%22" + jobdett + "%22'%2C'id')",
      "path": "/indexes/ijp-index/docs?api-version=2016-09-01&%24filter=JobPostingExternal%20eq%20'YES'%20and%20search.ismatch('%22" + jobdett + "%22'%2C'id')",
      "headers": {
        "content-type": "application/json",
        "api-key": "1AF2593D94137D72051204F97E0BDC14"
        //"authorization": "Basic Q2hhdGJvdDpjaGF0Ym90QDEyMw=="
      }
    };

    http.get(options, res => {
      res.setEncoding("utf8");
      let body = "";
      res.on("data", data => {
        body += data;
      });
      res.on("end", () => {
        var flag = [{ "source": "jobdetail" }];
        body = JSON.parse(body);
        var tmpbody = body;
        flag.push(tmpbody);
        var finresult = JSON.stringify(flag);
        // result.send(tmpbody);
        result.status(200).json({
          source: 'webhook',
          speech: finresult,
          displayText: finresult
        })
      });
    });


  }

})


app.post('/webhook', function (req, res) {
  // we expect to receive JSON data from api.ai here.
  // the payload is stored on req.body
  console.log(req.body)

  // we have a simple authentication
  if (REQUIRE_AUTH) {
    if (req.headers['auth-token'] !== AUTH_TOKEN) {
      return res.status(401).send('Unauthorized')
    }
  }

  // and some validation too
  if (!req.body || !req.body.result || !req.body.result.parameters) {
    return res.status(400).send('Bad Request')
  }

  // the value of Action from api.ai is stored in req.body.result.action
  console.log('* Received action -- %s', req.body.result.action)

  // parameters are stored in req.body.result.parameters
  var userName = req.body.result.parameters['given-name']
  var webhookReply = 'Hello ' + userName + '! Welcome from the webhook.'

  // the most basic response
  res.status(200).json({
    source: 'webhook',
    speech: webhookReply,
    displayText: webhookReply
  })
})

app.listen(app.get('port'), function () {
  console.log('* Webhook service is listening on port:' + app.get('port'))
})
