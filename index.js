//Define a token to save jwt and a count to show remaining requests  
var token;
var count = 5;
let alert = document.getElementById("alert");
let alertMessage = document.getElementById("alertMessage");

document.getElementById("loginButton").addEventListener("click", login);
document.getElementById("requestButton").addEventListener("click", request);
document.getElementById("registerButton").addEventListener("click", register);
document.getElementById("createButton").addEventListener("click", showRegister);

//Function to login from mongoDB
function login() {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    fetch('http://localhost:3030/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            'email': email,
            'password': password
        })
    }).then(response => {
        return response.json();
    }).then(response => {
        if (response.data) {
            token = response.data.token;
            console.log(token);
            showRequest();

        } else {
            alert.style.display = "flex";
            alert.style.borderBottom = "2px solid red";

            alertMessage.innerHTML = response.error;
            console.log("Login Error");
            setTimeout(() => {alert.style.display = "none";}, 5000);
        }
    });
};

//Create a WebSocket client to release the main server from each request
function request() {
    let request = document.getElementById("textRequest").value;
    let result = document.getElementById("result");
    result.innerHTML = "Processing request ...";
    let data = [token, request];
    const socket = new WebSocket('ws://localhost:3001/wss');
    if (token) {
        socket.onopen = function (e) {
            // alert("[open] Connection established");
            // alert("Sending to server");
            socket.send(data);
        };

        socket.onmessage = function (event) {
            // alert(`[message] Data received from server: ${event.data}`);
            let resultado = event.data.toString().split("\n");
            let answer = "";
            resultado.forEach(element => {
                answer += element + "<br>";
            });

            if (count > 0) {
                count--;
                document.getElementById("requestR").innerHTML = count;
                setTimeout(() => {

                    result.innerHTML = answer;
                }, Math.random() * (3000 - 1000) + 1000);
            };
        };
        socket.onclose = function (event) {
            // if (event.wasClean) {
            //   alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
            // } else {
            //   // e.g. server process killed or network down
            //   // event.code is usually 1006 in this case
            //   alert('[close] Connection died');
            // }
        };
        socket.onerror = function (error) {
            // alert(`[error]`);
        };
    };
};

//function to register on mongoDB
function register() {
    let email = document.getElementById("registerEmail").value;
    let password = document.getElementById("registerPassword").value;
    console.log(email, password);
    fetch('http://localhost:3030/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            'email': email,
            'password': password
        })
    }).then(response => {
        showLogin();
        return response.json();

    }).then(response => {
        alert.style.display = "flex";
        setTimeout(() => {alert.style.display = "none";}, 5000);
        if (response.message) {
            alert.style.borderBottom = "2px solid green";
            alertMessage.innerHTML = response.message;
        } else {
            alert.style.borderBottom = "2px solid red";
            alertMessage.innerHTML = response.error;
        }

    });
};

//Functions to show each form
function showRequest() {
    document.getElementById("request").style.display = "flex";
    document.getElementById("login").style.display = "none";
    document.getElementById("register").style.display = "none";
};
function showLogin() {
    document.getElementById("register").style.display = "none";
    document.getElementById("request").style.display = "none";
    document.getElementById("login").style.display = "flex";
};
function showRegister() {
    document.getElementById("register").style.display = "flex";
    document.getElementById("request").style.display = "none";
    document.getElementById("login").style.display = "none";
};







