var token;
let count = 5;

document.getElementById("loginButton").addEventListener("click", login);
document.getElementById("requestButton").addEventListener("click", request);

function login() {
    let email = document.getElementById("email").value;

    let password = document.getElementById("password").value;

    fetch('http://localhost:3001/login', {
        method: 'POST',
        body: {
            'email': email,
            'password': password
        }
    }).then(response => {
        hide();
        return response.json();

    }).then(response => {
        token = response.data.token;

    })
}

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
            console.log(event.data);
            if(count > 0){
                count--;
            }
            
            document.getElementById("requestR").innerHTML = count;
            setTimeout(() => {
                result.innerHTML = event.data;
              }, Math.random() * (3000 - 1000) + 1000);
              

            

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
    }


    // if(token)
    // fetch('http://localhost:3001/request', {
    //     method: 'GET',
    //     headers: {
    //         'Authorization': `Bearer ${token}`,
    //         'Content-Type': 'application/json',
    //         'Accept': 'application/json'

    //     }
    // }).then(response => {
    //     return response.json();

    // }).then(response => {
    //     if(response.data.error){
    //         console.log(response.data.error);
    //         show();
    //     }

    // })
    // else{
    //     console.log("no token");
    // }

}

function hide() {
    document.getElementById("request").style.display = "flex";
    document.getElementById("login").style.display = "none";
}
function show() {
    document.getElementById("request").style.display = "none";
    document.getElementById("login").style.display = "flex";
}







