const db = firebase.database();

const boardElement = document.getElementById("board");
const cells = document.querySelectorAll(".cell");

const currentPlayerText =
document.getElementById("currentPlayer");

const statusText =
document.getElementById("status");

const gameMode =
document.getElementById("gameMode");

const newGameBtn =
document.getElementById("newGameBtn");

const player3Row =
document.getElementById("player3Row");

let players = ["🖥️","⌨️"];

const winPatterns = [
[0,1,2],
[3,4,5],
[6,7,8],
[0,3,6],
[1,4,7],
[2,5,8],
[0,4,8],
[2,4,6]
];

function createDefaultGame(){

    const mode = parseInt(gameMode.value);

    if(mode === 2){
        players = ["🖥️","⌨️"];
        player3Row.style.display = "none";
    }else{
        players = ["🖥️","⌨️","🖱️"];
        player3Row.style.display = "";
    }

    db.ref("game").set({
        board:["","","","","","","","",""],
        currentPlayer:players[0],
        winner:"",
        mode:mode
    });
}

function renderBoard(board){

    cells.forEach((cell,index)=>{
        cell.textContent = board[index];
    });

}

function nextPlayer(current){

    let index =
    players.indexOf(current);

    index++;

    if(index >= players.length){
        index = 0;
    }

    return players[index];
}

function boardFull(board){

    return board.every(v => v !== "");

}

function checkWinner(board){

    for(let pattern of winPatterns){

        const a = board[pattern[0]];
        const b = board[pattern[1]];
        const c = board[pattern[2]];

        if(a && a===b && b===c){
            return a;
        }

    }

    return null;
}

function updateScore(winner){

    db.ref("score").once("value")
    .then(snapshot=>{

        let score =
        snapshot.val() || {

            p1:{win:0,lose:0},
            p2:{win:0,lose:0},
            p3:{win:0,lose:0}
        };

        if(winner==="🖥️"){
            score.p1.win++;
            score.p2.lose++;
            score.p3.lose++;
        }

        if(winner==="⌨️"){
            score.p2.win++;
            score.p1.lose++;
            score.p3.lose++;
        }

        if(winner==="🖱️"){
            score.p3.win++;
            score.p1.lose++;
            score.p2.lose++;
        }

        db.ref("score").set(score);

    });

}

cells.forEach(cell=>{

    cell.addEventListener("click",()=>{

        const index =
        cell.dataset.index;

        db.ref("game")
        .once("value")
        .then(snapshot=>{

            const game =
            snapshot.val();

            if(!game) return;

            let board =
            game.board;

            if(board[index] !== "")
                return;

            if(game.winner !== "")
                return;

            board[index] =
            game.currentPlayer;

            const winner =
            checkWinner(board);

            if(winner){

                updateScore(winner);

                db.ref("game").update({
                    board:board,
                    winner:winner
                });

                return;
            }

            if(boardFull(board)){

                db.ref("game").update({
                    board:board,
                    winner:"draw"
                });

                return;
            }

            db.ref("game").update({
                board:board,
                currentPlayer:
                nextPlayer(game.currentPlayer)
            });

        });

    });

});

db.ref("game")
.on("value",(snapshot)=>{

    const game =
    snapshot.val();

    if(!game) return;

    renderBoard(game.board);

    currentPlayerText.textContent =
    game.currentPlayer;

    if(game.winner===""){
        statusText.textContent =
        "กำลังเล่น...";
    }

    else if(game.winner==="draw"){
        statusText.textContent =
        "🤝 เสมอ";
    }

    else{
        statusText.textContent =
        "🏆 ผู้ชนะ " +
        game.winner;
    }

});

db.ref("score")
.on("value",(snapshot)=>{

    const score =
    snapshot.val();

    if(!score) return;

    document.getElementById("p1win")
    .textContent =
    score.p1.win;

    document.getElementById("p1lose")
    .textContent =
    score.p1.lose;

    document.getElementById("p2win")
    .textContent =
    score.p2.win;

    document.getElementById("p2lose")
    .textContent =
    score.p2.lose;

    document.getElementById("p3win")
    .textContent =
    score.p3.win;

    document.getElementById("p3lose")
    .textContent =
    score.p3.lose;

});

newGameBtn.addEventListener(
"click",
createDefaultGame
);

createDefaultGame();

