const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

var player1 = {
    name: "",
    score: 0,
};
var player2 = {
    name: "",
    score: 0,
};
wss.on("connection", function connection(ws) {
    ws.on("message", (message) => {
        const data = JSON.parse(message);
        console.log("Parsed Data: ", data);
        switch (data.type) {
            case "ready":
                if (player1.name == "") {
                    player1 = data.player;
                    console.log("Player 1: ", player1);
                    ws.send(
                        JSON.stringify({
                            type: "player1",
                            player: player1,
                            opponent: player2,
                        })
                    );
                } else if (player2.name == "") {
                    player2 = data.player;
                    console.log("Player 2: ", player2);
                    ws.send(
                        JSON.stringify({
                            type: "player2",
                            player: player2,
                            opponent: player1,
                        })
                    );
                }

                console.log("Player 1 Name: ", player1.name);
                console.log("Player 2 Name: ", player2.name);
                if (player1.name != "" && player2.name != "") {
                    wss.clients.forEach((client) => {
                        client.send(
                            JSON.stringify({
                                type: "allReady",
                                playerOne: player1,
                                playerTwo: player2,
                            })
                        );
                    });
                    console.log("Start");
                }

                break;

            case "point":
                if (data.player == player1.name) {
                    player1.score++;
                } else if (data.player == player2.name) {
                    player2.score++;
                }
                console.log("Point");
                wss.clients.forEach((client) => {
                    client.send(
                        JSON.stringify({
                            type: "point",
                            player: data.player,
                            points: data.player.score,
                        })
                    );
                });
        }
    });
});
