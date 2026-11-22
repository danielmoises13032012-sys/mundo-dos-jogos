let points = Number(localStorage.getItem("mdj_points") || 0);
let secret = 0, ticBoard = Array(9).fill(""), ticTurn = "X", ticOver = false;
const scoreEl = document.getElementById("score");
function updateScore(){scoreEl.textContent=points;localStorage.setItem("mdj_points",points)}
updateScore();
function award(n=10){points+=n;updateScore()}
function openGame(game){
  const area=document.getElementById("play-area"), title=document.getElementById("game-title"), content=document.getElementById("game-content");
  area.hidden=false; area.scrollIntoView({behavior:"smooth",block:"start"});
  if(game==="guess"){
    title.textContent="🔢 Adivinha o Número"; secret=Math.floor(Math.random()*10)+1;
    content.innerHTML='<div class="game-box"><p>Escolhi um número entre 1 e 10. Qual é?</p><input id="guess-input" type="number" min="1" max="10" placeholder="1 a 10"><button onclick="checkGuess()">Tentar</button><p class="result" id="game-result"></p><button class="close" onclick="openGame(\\'guess\\')">Novo número</button></div>';
  }else if(game==="rps"){
    title.textContent="✂️ Pedra, Papel ou Tesoura";
    content.innerHTML='<div class="game-box"><p>Escolhe a tua jogada:</p><div class="choice-row"><button onclick="playRps(\\'Pedra\\')">🪨 Pedra</button><button onclick="playRps(\\'Papel\\')">📄 Papel</button><button onclick="playRps(\\'Tesoura\\')">✂️ Tesoura</button></div><p class="result" id="game-result"></p></div>';
  }else{
    title.textContent="⭕ Jogo do Galo";ticBoard=Array(9).fill("");ticTurn="X";ticOver=false;drawTic();
  }
}
function closeGame(){document.getElementById("play-area").hidden=true}
function checkGuess(){
  const v=Number(document.getElementById("guess-input").value), r=document.getElementById("game-result");
  if(v<1||v>10||!v){r.textContent="Escreve um número de 1 a 10.";return}
  if(v===secret){r.textContent="Acertaste! Ganhaste 10 pontos!";award(10)}
  else r.textContent=v<secret?"Tenta um número maior.":"Tenta um número menor.";
}
function playRps(user){
  const opts=["Pedra","Papel","Tesoura"], cpu=opts[Math.floor(Math.random()*3)];
  let msg="Empate!";if(user!==cpu){if((user==="Pedra"&&cpu==="Tesoura")||(user==="Papel"&&cpu==="Pedra")||(user==="Tesoura"&&cpu==="Papel")){msg="Ganhaste! +10 pontos";award(10)}else msg="O computador ganhou. Tenta outra vez!"}
  document.getElementById("game-result").textContent="Tu: "+user+" | Computador: "+cpu+". "+msg;
}
function drawTic(){
  const c=document.getElementById("game-content");
  c.innerHTML='<p class="muted">É a vez de: '+ticTurn+'</p><div class="board">'+ticBoard.map((v,i)=>'<button class="cell" onclick="ticMove('+i+')" '+(v||ticOver?'disabled':'')+'>'+v+'</button>').join("")+'</div><p class="result" id="tic-result"></p><button class="close" onclick="openGame(\\'tic\\')">Recomeçar</button>';
}
function ticMove(i){
  if(ticBoard[i]||ticOver)return;ticBoard[i]=ticTurn;
  const wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const won=wins.some(line=>line.every(x=>ticBoard[x]===ticTurn));
  if(won){ticOver=true;drawTic();document.getElementById("tic-result").textContent=ticTurn+" venceu! +10 pontos";award(10);return}
  if(ticBoard.every(Boolean)){ticOver=true;drawTic();document.getElementById("tic-result").textContent="Empate!";return}
  ticTurn=ticTurn==="X"?"O":"X";drawTic();
}