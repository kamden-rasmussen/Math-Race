// var server = "ws://localhost:8080";
var server = "ws://mathquizwebsockets.herokuapp.com";

var app = new Vue({
    el: "#app",
    data: {
        countDownTimer: "",
        timer: "",

        individualsReady: false,
        opponentsReady: false,

        individualsGuess: "",
        running: false,
        gameOver: false,
        mainView: true,
        numOne: "",
        numTwo: "",
        playerName: "",

        player: {
            name: "",
            score: 0,
        },
        playerOne: "",
        playerTwo: "",

        playerOneScore: "0",
        playerTwoScore: "0",

        playerOneData: {
            name: "",
            score: 0,
        },
        playerTwoData: {
            name: "",
            score: 0,
        },

        errorMessage: "",
    },
    methods: {
        connectSocket: function () {
            this.socket = new WebSocket(server);
            this.socket.onmessage = function (event) {
                console.log("data from server", event.data);
                var data = JSON.parse(event.data);
                switch (data.type) {
                    case "allReady":
                        console.log("All Ready");

                        app.playerTwoData = data.playerTwo;
                        app.playerOneData = data.playerOne;

                        app.playerOne = app.playerOneData.name;
                        app.playerTwo = app.playerTwoData.name;
                        app.running = true;
                        app.startGame();
                        break;
                    case "point":
                        console.log("Point for " + data.player);
                        if (data.player == app.playerOneData.name) {
                            app.playerOneData.score++;
                        } else if (data.player == app.playerTwoData.name) {
                            app.playerTwoData.score++;
                        }
                        app.playerOneScore = app.playerOneData.score;
                        app.playerTwoScore = app.playerTwoData.score;
                        break;
                }
            };
        },
        checkAnswer: function () {
            // console.log(
            //     "Checking Answer",
            //     this.individualsGuess,
            //     this.numOne * this.numTwo
            // );
            if (this.individualsGuess == this.numOne * this.numTwo) {
                var message = {
                    type: "point",
                    player: this.playerName,
                };
                this.socket.send(JSON.stringify(message));
                this.errorMessage = "";
                this.individualsGuess = "";
                this.nextQuestion();
            } else {
                this.errorMessage = "Incorrect answer. Try again.";
            }
        },
        nextQuestion: function () {
            this.numOne = Math.floor(Math.random() * 10);
            this.numTwo = Math.floor(Math.random() * 10);
        },
        startGame: function () {
            this.running = true;
            this.nextQuestion();
            this.startTimer();
        },
        readyUp: function () {
            if (this.playerName == "") {
                this.errorMessage = "Please enter a name.";
                return;
            }
            this.player.name = this.playerName;
            this.individualsReady = true;
            var message = {
                type: "ready",
                player: this.player,
                start: "start",
            };
            this.socket.send(JSON.stringify(message));
        },
        startTimer: function () {
            // countdown timer from 60 seconds to 0
            this.countDownTimer = 60;
            this.timer = setInterval(() => {
                this.countDownTimer--;
                if (this.countDownTimer == 0) {
                    this.endGame();
                }
            }, 1000);
        },
        endGame: function () {
            this.running = false;
            this.mainView = false;
            this.gameOver = true;
            if (this.playerOneData.score > this.playerTwoData.score) {
                this.errorMessage = this.playerOneData.name + " wins!";
            }
            if (this.playerTwoData.score > this.playerOneData.score) {
                this.errorMessage = this.playerTwoData.name + " wins!";
            }
        },
    },

    created: function () {
        console.log("App created");
        this.connectSocket();
    },
});
