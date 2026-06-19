const db = firebase.database();

let playerName = "";
let roomId = "";
let roomMode = 2;
let playerId = "";

const loginPage =
document.getElementById("loginPage");

const waitingPage =
document.getElementById("waitingPage");

const gamePage =
document.getElementById("gamePage");

const playerNameInput =
document.getElementById("playerName");

const modeSelect =
document.getElementById("modeSelect");

const createRoomBtn =
document.getElementById("createRoomBtn");

const joinRoomBtn =
document.getElementById("joinRoomBtn");

const joinRoomCode =
document.getElementById("joinRoomCode");

const roomCodeText =
document.getElementById("roomCodeText");

const roomModeText =
document.getElementById("roomModeText");

const playerList =
document.getElementById("playerList");

const waitingStatus =
document.getElementById("waitingStatus");

const copyRoomBtn =
document.getElementById("copyRoomBtn");

const backToLoginBtn =
document.getElementById("backToLoginBtn");

function generateRoomCode(){

    const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let code = "";

    for(let i=0;i<6;i++){

        code += chars.charAt(
            Math.floor(
                Math.random() *
                chars.length
            )
        );

    }

    return code;
}

function generatePlayerId(){

    return "P" +
    Date.now() +
    Math.floor(
        Math.random()*1000
    );
}

function showPage(page){

    loginPage.style.display =
    "none";

    waitingPage.style.display =
    "none";

    gamePage.style.display =
    "none";

    page.style.display =
    "block";
}

createRoomBtn.addEventListener(
"click",
()=>{

    playerName =
    playerNameInput.value.trim();

    if(playerName===""){

        alert(
        "กรุณากรอกชื่อ"
        );

        return;
    }

    roomMode =
    parseInt(
    modeSelect.value
    );

    roomId =
    generateRoomCode();

    playerId =
    generatePlayerId();

    const symbol =
    "🖥️";

    db.ref(
    "rooms/" + roomId
    ).set({

        mode:roomMode,

        status:"waiting",

        owner:playerId,

        players:{

            [playerId]:{

                name:playerName,

                symbol:symbol

            }

        }

    });

    enterWaitingRoom();

});
joinRoomBtn.addEventListener(
"click",
()=>{

    playerName =
    playerNameInput.value.trim();

    if(playerName===""){

        alert(
        "กรุณากรอกชื่อ"
        );

        return;
    }

    roomId =
    joinRoomCode.value
    .trim()
    .toUpperCase();

    if(roomId===""){

        alert(
        "กรอกรหัสห้อง"
        );

        return;
    }

    playerId =
    generatePlayerId();

    db.ref(
    "rooms/" + roomId
    )
    .once("value")
    .then(snapshot=>{

        const room =
        snapshot.val();

        if(!room){

            alert(
            "ไม่พบห้อง"
            );

            return;
        }

        const players =
        room.players || {};

        const count =
        Object.keys(players)
        .length;

        if(count >= room.mode){

            alert(
            "ห้องเต็ม"
            );

            return;
        }

        let symbol =
        "⌨️";

        if(count===2){

            symbol =
            "🖱️";
        }

        db.ref(
        "rooms/" +
        roomId +
        "/players/" +
        playerId
        )
        .set({

            name:playerName,

            symbol:symbol

        });

        enterWaitingRoom();

    });

});
function enterWaitingRoom(){

    showPage(
    waitingPage
    );

    roomCodeText.textContent =
    roomId;

    db.ref(
    "rooms/" + roomId
    )
    .on("value",
    snapshot=>{

        const room =
        snapshot.val();

        if(!room)
            return;

        roomModeText.textContent =
        room.mode +
        " Players";

        const players =
        room.players || {};

        const playerArray =
        Object.values(
        players
        );

        playerList.innerHTML =
        "";

        playerArray.forEach(
        player=>{

            const div =
            document
            .createElement(
            "div"
            );

            div.textContent =
            player.symbol +
            " " +
            player.name;

            playerList
            .appendChild(div);

        });

        waitingStatus.textContent =

        "ผู้เล่น " +

        playerArray.length +

        "/" +

        room.mode;

        if(
            playerArray.length
            >= room.mode
        ){

            startGame(
            room
            );

        }

    });

}
copyRoomBtn.addEventListener(
"click",
()=>{

    navigator.clipboard
    .writeText(roomId);

    alert(
    "คัดลอกรหัสห้องแล้ว"
    );

});

backToLoginBtn
.addEventListener(
"click",
()=>{

    leaveRoom();

});
function leaveRoom(){

if(
roomId &&
playerId
){

db.ref(
"rooms/" +
roomId +
"/players/" +
playerId
)
.remove()
.then(()=>{

deleteRoomIfEmpty();

});

}

roomId = "";
playerId = "";

showPage(
loginPage
);

}

const cells =
document.querySelectorAll(
".cell"
);

const currentPlayerText =
document.getElementById(
"currentPlayer"
);

const statusText =
document.getElementById(
"status"
);

const gameRoomCode =
document.getElementById(
"gameRoomCode"
);

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

let currentRoomData =
null;

function startGame(room){

    if(
        room.status ===
        "playing"
    ){

        showPage(
        gamePage
        );

        gameRoomCode
        .textContent =
        roomId;

        return;
    }

    const board =

    ["","","",
     "","","",
     "","",""];

    const symbols =

    Object.values(
    room.players
    ).map(
    p => p.symbol
    );

    db.ref(
    "rooms/" +
    roomId
    )
    .update({

        status:
        "playing",

        game:{

            board:
            board,

            currentPlayer:
            symbols[0],

            winner:""

        }

    });

}
function renderBoard(
board
){

    cells.forEach(
    (cell,index)=>{

        cell.textContent =

        board[index];

    });

}
function getPlayers(){

    if(
    !currentRoomData
    )
    return [];

    return Object
    .values(
    currentRoomData
    .players
    )
    .map(
    p=>p.symbol
    );

}
function nextPlayer(
current
){

    const players =
    getPlayers();

    let index =

    players.indexOf(
    current
    );

    index++;

    if(
    index >=
    players.length
    ){

        index = 0;

    }

    return players[
    index
    ];

}
function checkWinner(
board
){

    for(
        let pattern
        of
        winPatterns
    ){

        const a =
        board[
        pattern[0]
        ];

        const b =
        board[
        pattern[1]
        ];

        const c =
        board[
        pattern[2]
        ];

        if(

        a &&
        a===b &&
        b===c

        ){

            return a;

        }

    }

    return null;

}
function boardFull(
board
){

    return board
    .every(
    value =>
    value !== ""
    );

}
cells.forEach(
cell=>{

cell.addEventListener(
"click",
()=>{

if(
!currentRoomData
)
return;

const game =

currentRoomData
.game;

if(
!game
)
return;

const index =

parseInt(
cell.dataset
.index
);

const board =

[
...game.board
];

if(
board[index]
!== ""
)
return;

if(
game.winner
!== ""
)
return;

board[index] =

game.currentPlayer;

const winner =

checkWinner(
board
);

if(
winner
){

db.ref(
"rooms/" +
roomId +
"/game"
)
.update({

board:
board,

winner:
winner

});

return;

}

if(
boardFull(
board
)
){

db.ref(
"rooms/" +
roomId +
"/game"
)
.update({

board:
board,

winner:
"draw"

});

return;

}

db.ref(
"rooms/" +
roomId +
"/game"
)
.update({

board:
board,

currentPlayer:

nextPlayer(
game.currentPlayer
)

});

});
});
db.ref(
"rooms"
)
.on(
"value",
snapshot=>{

if(
!roomId
)
return;

const room =

snapshot
.val()?.[
roomId
];

if(
!room
)
return;

currentRoomData =
room;

if(
room.status
===
"playing"
){

showPage(
gamePage
);

gameRoomCode
.textContent =
roomId;

}

if(
!room.game
)
return;

renderBoard(
room.game.board
);

currentPlayerText
.textContent =

room.game
.currentPlayer;

if(
room.game.winner
=== ""
){

statusText
.textContent =

"กำลังเล่น...";

}

else if(

room.game.winner
=== "draw"

){

statusText
.textContent =

"🤝 เสมอ";

}

else{

statusText
.textContent =

"🏆 ผู้ชนะ " +

room.game
.winner;

}

});
const scoreTable =
document.getElementById(
"scoreTable"
);

function updateScoreBoard(){

    if(
    !currentRoomData
    )
    return;

    const score =

    currentRoomData
    .score || {};

    scoreTable
    .innerHTML = "";

    const players =

    currentRoomData
    .players || {};

    Object.values(
    players
    )
    .forEach(player=>{

        const playerScore =

        score[
        player.symbol
        ] || {

            win:0,
            lose:0

        };

        const row =

        document
        .createElement(
        "tr"
        );

        row.innerHTML =

        `
        <td>
        ${player.symbol}
        ${player.name}
        </td>

        <td>
        ${playerScore.win}
        </td>

        <td>
        ${playerScore.lose}
        </td>
        `;

        scoreTable
        .appendChild(
        row
        );

    });

}
function saveWinner(
winner
){

    if(
    !currentRoomData
    )
    return;

    const players =

    Object.values(
    currentRoomData
    .players
    );

    let score =

    currentRoomData
    .score || {};

    players.forEach(
    player=>{

        if(
        !score[
        player.symbol
        ]
        ){

            score[
            player.symbol
            ] = {

                win:0,
                lose:0

            };

        }

    });

    players.forEach(
    player=>{

        if(
        player.symbol
        ===
        winner
        ){

            score[
            player.symbol
            ].win++;

        }else{

            score[
            player.symbol
            ].lose++;

        }

    });

    db.ref(
    "rooms/" +
    roomId +
    "/score"
    )
    .set(score);

}
db.ref(
"rooms"
)
.on(
"value",
snapshot=>{

if(
!roomId
)
return;

const room =

snapshot
.val()?.[
roomId
];

if(
!room)
return;

currentRoomData =
room;

updateScoreBoard();

if(
room.game &&
room.game.winner &&
room.game.winner !==
"draw"
){

saveWinner(
room.game.winner
);

}

});
const newGameBtn =
document.getElementById(
"newGameBtn"
);

newGameBtn
.addEventListener(
"click",
()=>{

if(
!currentRoomData
)
return;

const board =

["","","",
 "","","",
 "","",""];

const firstPlayer =

Object.values(
currentRoomData
.players
)[0]
.symbol;

db.ref(
"rooms/" +
roomId
)
.update({

game:{

board:
board,

currentPlayer:
firstPlayer,

winner:""

}

});

});
const resetBtn =
document.getElementById(
"resetBtn"
);

resetBtn
.addEventListener(
"click",
()=>{

const ok =
confirm(
"รีเซ็ตคะแนนทั้งหมด?"
);

if(
!ok
)
return;

db.ref(
"rooms/" +
roomId +
"/score"
)
.remove();

});
const logoutBtn =
document.getElementById(
"logoutBtn"
);

logoutBtn
.addEventListener(
"click",
()=>{

leaveRoom();

});
const backRoomBtn =
document.getElementById(
"backRoomBtn"
);

backRoomBtn
.addEventListener(
"click",
()=>{

showPage(
waitingPage
);

});
window.addEventListener(
"beforeunload",
()=>{

if(
roomId &&
playerId
){

db.ref(
"rooms/" +
roomId +
"/players/" +
playerId
)
.remove();

}

});
function deleteRoomIfEmpty(){

db.ref(
"rooms/" +
roomId +
"/players"
)
.once(
"value"
)
.then(
snapshot=>{

if(
!snapshot.exists()
){

db.ref(
"rooms/" +
roomId
)
.remove();

}

});

}
