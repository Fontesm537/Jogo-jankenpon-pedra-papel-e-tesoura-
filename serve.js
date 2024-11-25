const WebSocket = require("ws");

// Configura o servidor WebSocket na porta 8080
const server = new WebSocket.Server({ port: 8080 });

// Array para armazenar as conexões dos jogadores
let players = [];

server.on("connection", (ws) => {
    if (players.length < 2) {
        // Atribui um ID ao jogador
        const playerId = players.length + 1;
        players.push(ws);

        // Envia o ID do jogador para o cliente
        ws.send(JSON.stringify({ type: "assign-id", playerId }));

        console.log(`Jogador ${playerId} conectado.`);

        // Lida com mensagens enviadas pelos clientes
        ws.on("message", (message) => {
            const data = JSON.parse(message);

            if (data.type === "choice") {
                // Envia a escolha para o oponente
                const opponent = players.find((player) => player !== ws);
                if (opponent) {
                    opponent.send(
                        JSON.stringify({ type: "opponent-choice", choice: data.choice })
                    );
                }
            }

            if (data.type === "restart") {
                // Reinicia o jogo para ambos os jogadores
                players.forEach((player) => {
                    player.send(JSON.stringify({ type: "restart" }));
                });
            }
        });

        // Lida com desconexões
        ws.on("close", () => {
            console.log(`Jogador ${playerId} desconectado.`);
            players = players.filter((player) => player !== ws);
        });
    } else {
        // Fecha a conexão se já houver dois jogadores conectados
        ws.send(JSON.stringify({ type: "error", message: "Servidor cheio." }));
        ws.close();
    }
});

console.log("Servidor WebSocket rodando na porta 8080.");

