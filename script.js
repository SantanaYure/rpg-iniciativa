let minutes = 0;
let seconds = 0;
let milliseconds = 0;
let interval;
let isRunning = false;
let characters = [];
let currentTurn = 0;
let combatStarted = false;
let currentRound = 0;

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        interval = setInterval(updateTimer, 10);
    }
}

function pauseTimer() {
    isRunning = false;
    clearInterval(interval);
}

function resetTimer() {
    isRunning = false;
    clearInterval(interval);
    minutes = 0;
    seconds = 0;
    milliseconds = 0;
    updateDisplay();
}

function updateTimer() {
    milliseconds++;
    if (milliseconds === 100) {
        milliseconds = 0;
        seconds++;
        if (seconds === 60) {
            seconds = 0;
            minutes++;
        }
    }
    updateDisplay();
}

function updateDisplay() {
    document.getElementById('minutes').textContent = padNumber(minutes);
    document.getElementById('seconds').textContent = padNumber(seconds);
    document.getElementById('milliseconds').textContent = padNumber(milliseconds);
}

function padNumber(number) {
    return number.toString().padStart(2, '0');
}

function rollD20() {
    return Math.floor(Math.random() * 20) + 1;
}

function addCharacter() {
    const name = document.getElementById('characterName').value;
    const bonus = parseInt(document.getElementById('initiativeBonus').value) || 0;
    const type = document.getElementById('characterType').value;

    if (!name) {
        alert('Por favor, insira pelo menos o nome do personagem!');
        return;
    }

    const character = {
        name,
        bonus,
        type,
        initiative: null
    };

    characters.push(character);
    updateDisplay();
    clearInputs();
    saveData();
}

function startCombat() {
    if (characters.length === 0) {
        alert('Adicione pelo menos um personagem antes de iniciar o combate!');
        return;
    }

    combatStarted = true;
    currentRound = 1;
    
    // Rola iniciativa para cada personagem
    characters.forEach(char => {
        const roll = rollD20();
        char.roll = roll;
        char.initiative = roll + char.bonus;
        char.isNatural20 = roll === 20; // Marca se foi um 20 natural
    });

    sortCharacters();
    currentTurn = 0;
    updateDisplay();
    updateRoundDisplay();
    saveData();
}

function sortCharacters() {
    characters.sort((a, b) => {
        // Se as iniciativas totais são diferentes, maior vence
        if (b.initiative !== a.initiative) {
            return b.initiative - a.initiative;
        }
        
        // Se chegou aqui, as iniciativas são iguais
        // Primeiro critério de desempate: maior resultado no dado
        if (b.roll !== a.roll) {
            return b.roll - a.roll;
        }
        
        // Segundo critério: maior bônus
        if (b.bonus !== a.bonus) {
            return b.bonus - a.bonus;
        }
        
        // Terceiro critério: ordem alfabética
        return a.name.localeCompare(b.name);
    });
}

function updateDisplay() {
    const list = document.getElementById('characterList');
    list.innerHTML = '';

    characters.forEach((character, index) => {
        const div = document.createElement('div');
        div.className = `character-item ${character.type}`;
        if (index === currentTurn && combatStarted) {
            div.classList.add('active');
        }

        let initiativeDisplay = combatStarted
            ? `<span class="initiative">${character.initiative}</span> 
               <span class="bonus">(${character.roll}+${character.bonus})</span>`
            : `<span class="bonus">Bônus: ${character.bonus}</span>`;

        div.innerHTML = `
            <span>${character.name} - ${initiativeDisplay}</span>
            <button class="remove-btn" onclick="removeCharacter(${index})">Remover</button>
        `;

        list.appendChild(div);
    });
}

function removeCharacter(index) {
    characters.splice(index, 1);
    if (currentTurn >= characters.length) {
        currentTurn = 0;
    }
    updateDisplay();
    saveData();
}

function nextTurn() {
    if (characters.length === 0) return;
    
    currentTurn++;
    if (currentTurn >= characters.length) {
        currentTurn = 0;
        currentRound++;
        updateRoundDisplay();
    }
    updateDisplay();
    saveData();
}

function resetInitiative() {
    characters = [];
    currentTurn = 0;
    currentRound = 0;
    combatStarted = false;
    updateDisplay();
    updateRoundDisplay();
    saveData();
}

function clearInputs() {
    document.getElementById('characterName').value = '';
    document.getElementById('initiativeBonus').value = '';
}

// Função para salvar os dados no localStorage
function saveData() {
    const gameState = {
        characters,
        currentTurn,
        combatStarted,
        currentRound
    };
    localStorage.setItem('initiativeTracker', JSON.stringify(gameState));
}

// Função para carregar os dados do localStorage
function loadData() {
    const savedData = localStorage.getItem('initiativeTracker');
    if (savedData) {
        const gameState = JSON.parse(savedData);
        characters = gameState.characters;
        currentTurn = gameState.currentTurn;
        combatStarted = gameState.combatStarted;
        currentRound = gameState.currentRound || 0;
        updateDisplay();
        updateRoundDisplay();
    }
}

// Carregar dados salvos quando a página carregar
document.addEventListener('DOMContentLoaded', loadData);

function exportData() {
    const gameState = {
        characters,
        currentTurn,
        combatStarted
    };
    
    const dataStr = JSON.stringify(gameState);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportName = 'iniciativa_' + new Date().toISOString().slice(0,10) + '.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
}

function importData() {
    document.getElementById('importFile').click();
}

function handleImport(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const gameState = JSON.parse(e.target.result);
                characters = gameState.characters;
                currentTurn = gameState.currentTurn;
                combatStarted = gameState.combatStarted;
                updateDisplay();
                saveData();
            } catch (error) {
                alert('Erro ao importar arquivo: Formato inválido');
            }
        };
        reader.readAsText(file);
    }
}

function updateRoundDisplay() {
    document.getElementById('roundNumber').textContent = currentRound;
} 