const ws = new WebSocket("ws://localhost:8080"); // Atualize com o endereço do servidor WebSocket
let playerId = null;
let opponentChoice = null;
let yourChoice = null;

// Pontuação
let player1Score = 0;
let player2Score = 0;

// Referências no DOM
const statusDiv = document.getElementById("status");
const resultDiv = document.getElementById("result");
const restartButton = document.getElementById("restart");
const player1Options = document.getElementById("player1-options");
const player2Options = document.getElementById("player2-options");
const player1ScoreDisplay = document.getElementById("player1-score");
const player2ScoreDisplay = document.getElementById("player2-score");

// Atualiza status
const updateStatus = (message) => {
    statusDiv.textContent = message;
};

// Desativa botões
const disableOptions = (options) => {
    options.querySelectorAll("button").forEach((button) => {
        button.disabled = true;
    });
};

// Ativa botões
const enableOptions = (options) => {
    options.querySelectorAll("button").forEach((button) => {
        button.disabled = false;
    });
};

// Lógica de resultado
const getResult = (choice1, choice2) => {
    if (choice1 === choice2) return "Empate";
    if (
        (choice1 === "pedra" && choice2 === "tesoura") ||
        (choice1 === "tesoura" && choice2 === "papel") ||
        (choice1 === "papel" && choice2 === "pedra")
    ) {
        return "Vitória";
    }
    return "Derrota";
};

// Envia mensagem via WebSocket
const sendMessage = (message) => {
    ws.send(JSON.stringify(message));
};

// Lida com mensagem recebida
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "assign-id") {
        playerId = data.playerId;
        updateStatus(`Você é o Jogador ${playerId}`);
        if (playerId === 1) {
            enableOptions(player1Options);
        }
    }

    if (data.type === "opponent-choice") {
        opponentChoice = data.choice;

        if (yourChoice) {
            const result = getResult(yourChoice, opponentChoice);
            if (result === "Vitória") {
                playerId === 1 ? player1Score++ : player2Score++;
            } else if (result === "Derrota") {
                playerId === 1 ? player2Score++ : player1Score++;
            }

            player1ScoreDisplay.textContent = `Pontos: ${player1Score}`;
            player2ScoreDisplay.textContent = `Pontos: ${player2Score}`;
            resultDiv.textContent = `Resultado: ${result}`;

            // Reinicia jogada
            yourChoice = null;
            opponentChoice = null;
            if (playerId === 1) {
                enableOptions(player1Options);
            } else {
                enableOptions(player2Options);
            }
        }
    }
};

// Escolha do jogador
const handleChoice = (choice) => {
    yourChoice = choice;
    disableOptions(playerId === 1 ? player1Options : player2Options);
    updateStatus("Aguardando oponente...");
    sendMessage({ type: "choice", playerId, choice });
};

// Configura botões de escolha
document.querySelectorAll(".options button").forEach((button) => {
    button.addEventListener("click", () => {
        handleChoice(button.getAttribute("data-option"));
    });
});

// Reinicia o jogo
restartButton.addEventListener("click", () => {
    player1Score = 0;
    player2Score = 0;
    player1ScoreDisplay.textContent = "Pontos: 0";
    player2ScoreDisplay.textContent = "Pontos: 0";
    resultDiv.textContent = "";
    updateStatus("Jogo reiniciado. Aguardando jogadas...");
    sendMessage({ type: "restart" });
});

