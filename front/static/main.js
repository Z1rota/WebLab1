import { showNotification } from './utils.js';


let selectedX = NaN;
let selectedY = NaN;
let selectedR = NaN;
const xstorage = [-2,-1.5,-1,-0.5,0,0.5,1,1.5,2]
const rstorage=[1,1.5,2,2.5,3];

document.querySelectorAll('.RButtons button').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('.RButtons button').forEach(btn => {
            btn.style.backgroundColor = '';
            btn.style.color = '';
        });
        this.style.backgroundColor = '#3fba16';
        selectedR = this.getAttribute('data-value');
        document.getElementById('RChoice').value = selectedR;
    });
});


const checkX = () => {
    return new Promise((resolve, reject) => {
        selectedX = parseFloat(document.querySelector(".XButtons input[type=radio]:checked").value);
        if (!((xstorage.includes(selectedX)) || (isNaN(selectedX)))) {
            reject("Неверное значение X");
        } else {
            resolve();
        }
    } )
}

const checkY = () => {
    return new Promise((resolve,reject) => {
        selectedY=parseFloat(document.getElementById("YChoice").value);
        if ((selectedY > 5) || (selectedY < -5) || (isNaN(selectedY))) {
            reject("Неверное значение Y");
        } else {
            resolve();
        }
    })
}

const checkR = () => {
    return new Promise((resolve,reject) => {
        selectedR=parseFloat(selectedR);
        if ((isNaN(selectedR)) || (!rstorage.includes(selectedR))) {
            reject("Неверное значение R");
            console.log(typeof selectedR)
        } else {
            resolve();
        }
    })
}

document.querySelector('.submitCord').addEventListener("click",() => {

    Promise.all([
        checkX(),
        checkY(),
        checkR()
    ]).then(() => {
        sendToServer(selectedX,selectedY,selectedR)
        showNotification("Данные отправлены!", false)
    }).catch((error) => {
        showNotification(error,true)

    })

})

function sendToServer(x,y,r) {
    fetch(`http://localhost:8080/fcgi-bin/server.jar?x=${x}&y=${y}&r=${r}`, {
        method: "GET",
    }).then(response => response.json())
        .then(data => {
            const audio = document.getElementById('submitAudio');
            audio.play()
            addResultToTable(data);
        })
        .catch(error => {
            showNotification("Проверьте введеные данные", true);
        });
}



function addResultToTable(data) {
    const tableBody = document.querySelector('#results-table tbody');

    const row = document.createElement('tr');


    const xCell = document.createElement('td');
    xCell.textContent = data.x;


    const yCell = document.createElement('td');
    yCell.textContent = data.y;


    const rCell = document.createElement('td');
    rCell.textContent = data.r;


    const resultCell = document.createElement('td');
    const isHit = data.result.toLowerCase() === "true";
    resultCell.textContent = isHit ? 'Попал' : 'Не попал';
    resultCell.className = isHit ? 'result-hit' : 'result-miss';


    const timeCell = document.createElement('td');
    timeCell.textContent = data.workTime;


    const execTimeCell = document.createElement('td');
    execTimeCell.textContent = data.time;


    row.appendChild(xCell);
    row.appendChild(yCell);
    row.appendChild(rCell);
    row.appendChild(resultCell);
    row.appendChild(timeCell);
    row.appendChild(execTimeCell);


    tableBody.appendChild(row);
}



