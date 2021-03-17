const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const jwt = require("jsonwebtoken");
const http = require("http");
const ejs = require("ejs");
cookieParser = require('cookie-parser');

const app = express();
const port = process.env.PORT || 3000;
let PUBLIC_KEY = "";

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested With, Content-Type, Accept');
  next();
});

app.use(cookieParser());
app.engine('html', ejs.renderFile);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/logout', (req, res) => {
  res.cookie('token', undefined).status(200).render(path.resolve(`${__dirname}/dist/login/login.html`), {error: null, login: true});
});

app.use('/registration', (req, response) => {
  if (req.body.username && req.body.password) {
    const options = {
      hostname: 'localhost',
      port: 8085,
      path: '/authorization/sign-up',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': JSON.stringify(req.body).length
      }
    };
    const tokenRequest = http.request(options, res => {
      res.on('data', token => {
        if (token.toString().includes('httpCode')) {
          response.cookie('token', undefined).status(401).redirect('/registration');
          return;
        }
        response.cookie('token', token.toString()).redirect('/');
      })
    }).on('error', () => {
      response.cookie('token', undefined).redirect('/');
    });

    tokenRequest.write(JSON.stringify(req.body));
    tokenRequest.end();
    return;
  }
  response.cookie('token', undefined).status(200).render(path.resolve(`${__dirname}/dist/login/login.html`), {
    error: null,
    login: false
  });
});

app.use(/.*(.js|.html|web-ui|web-ui\/|\/|web-ui\/animation|web-ui\/animation\/|web-ui\/uploading|web-ui\/uploading\/)$/, (req, res, next) => {
  console.log(req.originalUrl);
  const token = req.cookies.token;
  //const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiQW5vbnltb3VzIiwiaWF0IjoxNjE0NTA2OTA0LCJleHAiOjE2MTQ1OTMzMDQsImF1ZCI6Imh0dHA6Ly9sb2NhbGhvc3QiLCJpc3MiOiJPdHZpbnRhIGNvcnAiLCJzdWIiOiJvdHZpbnRhQGdtYWlsLmNvbSJ9.FF_XyxHSBSJX2vy33e5XH84Dv6AsQlTEQNacxuz1uOSUyJZHq0ZWiCJJdH1Ebs_XDtLsrz9uzBwoCTuKx2wxu5JSa04Eqvt9T50tGuPD_KYqIhg1LpGEhZWRsFFKjtlvw7EbOUXIkBKao8cPuoIfUSgbZajnCYtEshmyzi9nUBiv-rjCpVPaofiKKWkUWfh-uKH-BhmP_D9NYf4GYwFwR6Bv2ZSQj4AZS_qEiNNKvpVL6hzj7X0k86fHrTaaSumzKhrYRg6-webvdosLzmmGA5QEGoIuw3Q7UNmHYIkXzBVvGgMqOKuqPr6y7tCTRg4QhVXmYBpHr1LSlYh04RhQEA";
  try {
    const legit = jwt.verify(token, PUBLIC_KEY);
    console.log("\nJWT verification result: ", legit);
  } catch (e) {
    if (e.name === "TokenExpiredError" || e.name === "JsonWebTokenError") {
      let params = {error: null, login: true};
      if (req.param("authError") === "true") {
        params.error = "Something went wrong!";
      }
      res.cookie('token', undefined).status(401).render(path.resolve(`${__dirname}/dist/login/login.html`), params);
      return;
    }
  }
  next();
});

app.use('/login', (req, response) => {
  const options = {
    hostname: 'localhost',
    port: 8085,
    path: '/authorization/token',
    method: 'GET'
  };

  const redirectUrl = (req.headers && req.headers.referer && req.headers.referer.slice(req.headers.referer.indexOf('/web-ui') > 0 ? req.headers.referer.indexOf('/web-ui') : 0)).replace('?authError=true', '') || '/';

  if (req.body.username && req.body.password) {
    options.path = '/authorization/login';
    options.method = 'POST';
    options.headers = {
      'Content-Type': 'application/json',
      'Content-Length': JSON.stringify(req.body).length
    };
  }

  const tokenRequest = http.request(options, res => {
    res.on('data', token => {
      if (token.toString().includes('httpCode')) {
        response.cookie('token', undefined).status(401).redirect(redirectUrl + '?authError=true');
        return;
      }
      response.cookie('token', token.toString()).redirect(redirectUrl);
    })
  }).on('error', () => {
    response.cookie('token', undefined).redirect('/');
  });

  if (options.method === 'POST') {
    tokenRequest.write(JSON.stringify(req.body));
  }
  tokenRequest.end();
});

app.use((req, res, next) => {
  if (path.extname(req.path).length > 0) {
    next();
  } else {
    res.sendFile(path.resolve(`${__dirname}/dist/web-ui/index.html`));
  }
});

app.use('/', express.static(`${__dirname}/dist`));


const options = {
  hostname: 'localhost',
  port: 8085,
  path: '/authorization/public-key',
  method: 'GET'
}

http.request(options, res => {
  res.on('data', publicKey => {
    PUBLIC_KEY = res.statusCode === 200 ? publicKey.toString() : "";
  })
}).on('error', () => {
  PUBLIC_KEY = "";
}).end();

app.listen(port, () => {
  console.log(`⚡️[server]: UI server is running at port:${port}`);
});
