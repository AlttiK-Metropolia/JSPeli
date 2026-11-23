// Arpoo kokonaisluvun väliltä min-max
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

class Bamski {
    constructor(name) {
        this.name = name;
        this.age = 0;
        this.money = 0;
        this.job = "Unemployed";
        // BitLifen tapaan aloitusarvot arvotaan
        this.health = randomInt(70, 100);
        this.happiness = randomInt(50, 100);
        this.smarts = randomInt(20, 100);
        this.clout = 0;
    }
}

const startForm = document.getElementById('start-form');
const gameContainer = document.getElementById('game-container');
const gameScreen = document.getElementById('game-screen');
const lifeLog = document.getElementById('life-log');
const ageButton = document.getElementById('age-button');
const bgAudio = document.getElementById('background-audio');
let bamski = undefined;

// Lisää rivin elämän logii
const log = (text) => {
    const p = document.createElement('p');
    p.textContent = text;
    lifeLog.appendChild(p);
};

// Päivittää bämääään tiedot näkyviin
const render = () => {
    document.getElementById('profile').textContent =
        `${bamski.name} | Age: ${bamski.age} | ${bamski.job} | ${bamski.money} €`;
    document.getElementById('stats').innerHTML = `
        <li>Health: ${bamski.health}</li>
        <li>Happiness: ${bamski.happiness}</li>
        <li>Smarts: ${bamski.smarts}</li>
        <li>Clout: ${bamski.clout}</li>`;
};

startForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const nameInput = document.getElementById('name-input').value.trim();
    if (nameInput === "") {
        alert("Please enter your name.");
        return;
    }
    bamski = new Bamski(nameInput);
    bgAudio.volume = 0.2;
    bgAudio.play();
    startgame();
});

const startgame = () => {
    gameContainer.hidden = true;
    gameScreen.hidden = false;
    lifeLog.innerHTML = '';
    log(`Age 0: I was born as ${bamski.name}.`);
    render();
};

ageButton.addEventListener('click', () => {
    bamski.age += 1;
    log(`Age ${bamski.age}!`);
    render();
});
