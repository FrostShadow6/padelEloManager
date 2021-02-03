/*jshint esversion: 6 */

//
//Views
//

const mainMenuView = function(){
    document.getElementById("menuRanking").style.display = "none";
    document.getElementById("menuAddMatch").style.display = "none";
    document.getElementById("menuAddPlayer").style.display = "none";
}

const menuRankingView = function() {
    document.getElementById("menuRanking").style.display = "block";
    document.getElementById("menuAddMatch").style.display = "none";
    document.getElementById("menuAddPlayer").style.display = "none";
    document.getElementById("title").innerText = "Classificació";
};

const menuAddMatchView = function() {
    document.getElementById("menuRanking").style.display = "none";
    document.getElementById("menuAddMatch").style.display = "block";
    document.getElementById("menuAddPlayer").style.display = "none";
    document.getElementById("title").innerText = "Afegir Resultat";
};

const menuAddPlayerView = function() {
    document.getElementById("menuRanking").style.display = "none";
    document.getElementById("menuAddMatch").style.display = "none";
    document.getElementById("menuAddPlayer").style.display = "block";
    document.getElementById("title").innerText = "Afegir nou Jugador";
};

//
//Controllers
//

function removeOptions(dropBox1, dropBox2, dropBox3, dropBox4){ //Borra les options de cada select per no duplicar-les quan hi tornem a entrar, i també les variacions.
    var i, L = dropBox1.options.length - 1;
    for(i = L; i >= 1; i--) {
      dropBox1.remove(i);
      dropBox2.remove(i);
      dropBox3.remove(i);
      dropBox4.remove(i);
      document.getElementById("variationWinners").innerHTML = "";
      document.getElementById("variationLosers").innerHTML = "";
    }
}

function defaultOption(text, sel){ //Quan canviem el view a menuAddMatchView(), posa les opcions per defecte.
    var opts = sel.options;
    for (var opt, j = 0; opt = opts[j]; j++) {
        if (opt.value == text) {
            sel.selectedIndex = j;
            break;
        }
    }
}

function deleteTable(){ //Borra la taula per evitar duplicats.
    let table = document.getElementById("rankingTable");
    while (table.rows.length > 1){
        table.deleteRow(1);
    }
}

function sortBy(players, sort){
    for (let k = 1; k < players.length; k++){
        let temp = players[k];
        let j = k-1;
        switch(sort){
            case 1:
                while (j >= 0 && temp.elo <= players[j].elo){
                    players[j+1] = players[j];
                    j = j-1;
                }
                break;
            case 2:
                while (j >= 0 && temp.wins <= players[j].wins){
                    players[j+1] = players[j];
                    j = j-1;
                }
                break;
            case 3:
                while (j >= 0 && temp.loses <= players[j].loses){
                    players[j+1] = players[j];
                    j = j-1;
                }
                break;
            case 4:
                while (j >= 0 && (temp.wins * 100) / (temp.wins + temp.loses) <= (players[j].wins * 100) / (players[j].wins + players[j].loses)){
                    players[j+1] = players[j];
                    j = j-1;
                }
                break;
        }
        players[j+1] = temp;
    }
    //Comprovem que s'hagi jugat algun partit, ja que sino es queda en bucle infinit al següent pas.
    firstGame = true;
    z = 0;
    while (z < players.length){
        if ((players[z].wins + players[z].loses) != 0){
            firstGame = false;
            break;
        }
        else z++;
    }

    //Pasem els jugadors que no han jugat mai al final de la classificació.
    if (firstGame == false){
        sorted = false;
        while (sorted == false){
            if ((players[players.length-1].wins + players[players.length-1].loses) == 0){
            players.unshift(players[players.length-1]);
            players.splice(-1,1);
            }
            else{
                sorted = true;
            }
        }
    }
}

const mainMenuController = function(){
    mainMenuView();
};

/*
sort = 1 -> Ordena per elo
sort = 2 -> Ordena per victòries
sort = 3 -> Ordena per derrotes
sort = 4 -> Ordena per winrate
*/
const menuRankingController = function(sort) { 
    removeOptions(document.getElementById("winner1"), document.getElementById("winner2"), document.getElementById("loser1"), document.getElementById("loser2"));
    deleteTable();
    menuRankingView();

    let xhr = new XMLHttpRequest();
    let url = 'http://localhost:8000/getRanking';
    xhr.open('GET', url);
    xhr.addEventListener('load', (data) => {
        let table = document.getElementById("rankingTable");
        players = JSON.parse(data.target.response);
        sortBy(players, sort);
        for (let i = 0; i < players.length; i++){
            let row = table.insertRow(1);
            let cell1 = row.insertCell(0);
            let cell2 = row.insertCell(1);
            let cell3 = row.insertCell(2);
            let cell4 = row.insertCell(3);
            let cell5 = row.insertCell(4);
            cell1.innerHTML = players[i].name;
            cell2.innerHTML = parseInt(players[i].elo);
            cell3.innerHTML = players[i].wins;
            cell4.innerHTML = players[i].loses;
            if (players[i].wins == 0 && players[i].loses == 0){
                cell5.innerHTML = "-";
            }
            else{
                cell5.innerHTML = parseFloat((players[i].wins * 100)/(players[i].wins + players[i].loses)).toFixed(2)+"%";
            }
        }
    });
    xhr.send();
};

const playerSearch = function(){
    var input, filter, table, tr, i, txtValue;
    input = document.getElementById("tableSearch");
    filter = input.value.toUpperCase();
    table = document.getElementById("rankingTable");
    tr = table.getElementsByTagName("tr");

    for (i = 0; i < tr.length; i++){
        td = tr[i].getElementsByTagName("td")[0];
        if (td){
            txtValue = td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1){
                tr[i].style.display = "";
            }
            else{
                tr[i].style.display = "none";
            }
        }
    }
}

const menuAddMatchController = function() {
    deleteTable();
    removeOptions(document.getElementById("winner1"), document.getElementById("winner2"), document.getElementById("loser1"), document.getElementById("loser2"));
    defaultOption("Guanyador 1", document.getElementById("winner1"));
    defaultOption("Guanyador 2", document.getElementById("winner2"));
    defaultOption("Perdedor 1", document.getElementById("loser1"));
    defaultOption("Perdedor 2", document.getElementById("loser2"));
    menuAddMatchView();

    let xhr = new XMLHttpRequest();
    let url = 'http://localhost:8000/getPlayers';
    xhr.open('GET', url);
    xhr.addEventListener('load', (data) => {
        console.log(JSON.parse(data.target.response));
        for (let i = 0; i < (JSON.parse(data.target.response)).length; i++){
            var option = document.createElement("option");
            option.text = JSON.parse(data.target.response)[i];
            document.getElementById("winner1").add(option);
            var option = document.createElement("option");
            option.text = JSON.parse(data.target.response)[i];
            document.getElementById("winner2").add(option);
            var option = document.createElement("option");
            option.text = JSON.parse(data.target.response)[i];
            document.getElementById("loser1").add(option);
            var option = document.createElement("option");
            option.text = JSON.parse(data.target.response)[i];
            document.getElementById("loser2").add(option);
        }
    });
    xhr.send();
};

const sendResultController = function(){
    let winnerName1 = document.getElementById("winner1").value;
    let winnerName2 = document.getElementById("winner2").value;
    let loserName1 = document.getElementById("loser1").value;
    let loserName2 = document.getElementById("loser2").value;
    let xhr = new XMLHttpRequest();
    let url = 'http://localhost:8000/newResult';
    let data = "winner1="+winnerName1+"&winner2="+winnerName2+"&loser1="+loserName1+"&loser2="+loserName2;
    xhr.open('POST', url);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.addEventListener('load', (data) => {
        let variation = JSON.parse(data.target.response).variation;
        document.getElementById("variationWinners").innerHTML = "Variació de l'elo dels guanyadors: +"+parseInt(variation);
        document.getElementById("variationLosers").innerHTML = "Variació de l'elo dels perdedors: -"+parseInt(variation);
    });
    xhr.send(data);
};

const menuAddPlayerController = function() {
    deleteTable();
    removeOptions(document.getElementById("winner1"), document.getElementById("winner2"), document.getElementById("loser1"), document.getElementById("loser2"));
    menuAddPlayerView();
};

const sendPlayerController = function(){
    let name = document.getElementById("newPlayer").value;
    let xhr = new XMLHttpRequest();
    let url = 'http://localhost:8000/newPlayer';
    let data = "name="+name;
    xhr.open('POST', url);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.addEventListener('load', (data) => {
        document.getElementById("confirm").innerHTML = JSON.parse(data.target.response).message;
    });
    xhr.send(data);
};

//
//Router
//

const eventsController = function() {
    document.getElementById("ranking").onclick = function(){
        menuRankingController(1);
    }
    document.getElementById("elo").onclick = function(){
        menuRankingController(1);
    }
    document.getElementById("victories").onclick = function(){
        menuRankingController(2);
    }
    document.getElementById("derrotes").onclick = function(){
        menuRankingController(3);
    }
    document.getElementById("winrate").onclick = function(){
        menuRankingController(4);
    }
    document.getElementById("addMatch").onclick = function(){
        menuAddMatchController();
    }
    document.getElementById("addPlayer").onclick = function(){
        menuAddPlayerController();
    }
    document.getElementById("sendPlayer").onclick = function(){
        sendPlayerController();
    }
    document.getElementById("sendResult").onclick = function(){
        sendResultController();
    }
    document.getElementById("tableSearch").onkeyup = function(){
        playerSearch();
    }
};


eventsController();
mainMenuView();