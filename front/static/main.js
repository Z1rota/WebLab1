import {showNotification} from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {

    let selectedX = NaN;
    let selectedY = NaN;
    let selectedR = NaN;
    const xstorage = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2]
    const rstorage = [1, 1.5, 2, 2.5, 3];

    loadResultsFromStorage();

    function setupInputValidation() {
        const yInput = document.getElementById('YChoice');

        const validateInput = (input) => {
            input.addEventListener('input', function () {
                this.value = this.value.replace(/[^0-9.,-]/g, '');
                this.value = this.value.replace(/,/g, '.');
                if ((this.value.match(/\./g) || []).length > 1) {
                    this.value = this.value.substring(0, this.value.lastIndexOf('.'));
                }
                if (this.value.indexOf('-') > 0) {
                    this.value = this.value.replace(/-/g, '');
                }
                if (this.value.length > 1 && this.value.includes('-')) {
                    this.value = this.value.replace(/-/g, '');
                    this.value = '-' + this.value;
                }
            });
        };
        validateInput(yInput);
    }
    setupInputValidation()

    document.querySelectorAll('.RButtons button').forEach(button => {
        button.addEventListener('click', function () {
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
        })
    }

    const checkY = () => {
        return new Promise((resolve, reject) => {
            selectedY = parseFloat(document.getElementById("YChoice").value);
            if ((selectedY > 5) || (selectedY < -5) || (isNaN(selectedY))) {
                reject("Неверное значение Y");
            } else {
                resolve();
            }
        })
    }

    const checkR = () => {
        return new Promise((resolve, reject) => {
            selectedR = parseFloat(selectedR);
            if ((isNaN(selectedR)) || (!rstorage.includes(selectedR))) {
                reject("Неверное значение R");
                console.log(typeof selectedR)
            } else {
                resolve();
            }
        })
    }

    document.querySelector('.submitCord').addEventListener("click", () => {

        Promise.all([
            checkX(),
            checkY(),
            checkR()
        ]).then(() => {
            sendToServer(selectedX, selectedY, selectedR)
            showNotification("Данные отправлены!", false)
        }).catch((error) => {
            showNotification(error, true)

        })

    })



    function sendToServer(x, y, r) {
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

    function saveResultsToStorage() {
        const tableRows = document.querySelectorAll('#results-table tbody tr');
        const resultsData = [];

        tableRows.forEach(row => {
            resultsData.push({
                x: row.cells[0].textContent,
                y: row.cells[1].textContent,
                r: row.cells[2].textContent,
                result: row.cells[3].textContent,
                workTime: row.cells[4].textContent,
                execTime: row.cells[5].textContent
            });
        });

        sessionStorage.setItem('resultsTable', JSON.stringify(resultsData));
    }

    function loadResultsFromStorage() {
        const savedData = sessionStorage.getItem('resultsTable');
        if (savedData) {
            const resultsData = JSON.parse(savedData);
            const tableBody = document.querySelector('#results-table tbody');
            tableBody.innerHTML = ''; // Очищаем таблицу перед загрузкой

            resultsData.forEach(data => {
                const row = document.createElement('tr');

                // Создаем ячейки как в вашей функции addResultToTable
                const xCell = document.createElement('td');
                xCell.textContent = data.x;

                const yCell = document.createElement('td');
                yCell.textContent = data.y;

                const rCell = document.createElement('td');
                rCell.textContent = data.r;

                const resultCell = document.createElement('td');
                resultCell.textContent = data.result;
                resultCell.className = data.result === 'Попал' ? 'result-hit' : 'result-miss';

                const timeCell = document.createElement('td');
                timeCell.textContent = data.workTime;

                const execTimeCell = document.createElement('td');
                execTimeCell.textContent = data.execTime;

                // Добавляем ячейки в строку
                row.appendChild(xCell);
                row.appendChild(yCell);
                row.appendChild(rCell);
                row.appendChild(resultCell);
                row.appendChild(timeCell);
                row.appendChild(execTimeCell);

                // Добавляем строку в таблицу
                tableBody.appendChild(row);
            });
        }
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

        saveResultsToStorage();
    }
})



