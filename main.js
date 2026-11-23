// Arpoo kokonaisluvun väliltä min-max
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

class Bamski {
    constructor(name) {
        this.name = name;
        this.age = 0;
        this.money = 0;
        this.job = "Työtön";
        // BitLifen tapaan aloitusarvot arvotaan
        this.health = randomInt(70, 100);
        this.happiness = randomInt(50, 100);
        this.smarts = randomInt(20, 100);
        this.looks = randomInt(20, 100);
        this.clout = 0;
    }

    // Lisää eventin efektit
    applyEffects(effects) {
        for (const key in effects) {
            if (key === 'money') {
                this.money += effects[key];
            } else {
                // Mittarit pysyvät välillä 0-100
                this[key] = Math.min(100, Math.max(0, this[key] + effects[key]));
            }
        }
    }
}

const startForm = document.getElementById('start-form');
const gameContainer = document.getElementById('game-container');
const gameScreen = document.getElementById('game-screen');
const lifeLog = document.getElementById('life-log');
const ageButton = document.getElementById('age-button');
const bgAudio = document.getElementById('background-audio');
const eventBox = document.getElementById('event-box');
const eventText = document.getElementById('event-text');
const eventChoices = document.getElementById('event-choices');
let bamski = undefined;
let events = [];
let usedEvents = []; // samaa eventtiä ei tule kahdesti samassa elämässä

// Hakee eventit events.json-tiedostosta
const loadEvents = async () => {
    try {
        const response = await fetch('/api/events');
        events = await response.json();
    } catch (error) {
        console.error('Eventtien lataus epäonnistui', error);
        events = [];
    }
};

// Arpoo eventin, joka sopii ikään eikä ole vielä tullut
const pickEvent = () => {
    const possible = events.filter((e) =>
        bamski.age >= e.minAge && bamski.age <= e.maxAge && !usedEvents.includes(e));
    if (possible.length === 0) return null;
    return possible[randomInt(0, possible.length - 1)];
};

// Näyttää eventin ja sen valinnat napeiksi
const showEvent = (event) => {
    usedEvents.push(event);
    log(event.text);
    eventText.textContent = event.text;
    eventChoices.innerHTML = '';
    for (const choice of event.choices) {
        const button = document.createElement('button');
        button.textContent = choice.label;
        button.addEventListener('click', () => chooseOption(choice));
        eventChoices.appendChild(button);
    }
    eventBox.hidden = false;
    ageButton.disabled = true; // vuosi ei etene ennen kuin valitaan
};

// Pelaaja valitsi vaihtoehdon
const chooseOption = (choice) => {
    bamski.applyEffects(choice.effects);
    log(choice.resultText);
    eventBox.hidden = true;
    ageButton.disabled = false;
    render();
};

// Lisää rivin elämän logii
const log = (text) => {
    const p = document.createElement('p');
    p.textContent = text;
    lifeLog.appendChild(p);
    lifeLog.scrollTop = lifeLog.scrollHeight;
};

// Päivittää bämääään tiedot näkyviin
const render = () => {
    document.getElementById('profile-container').innerHTML = `
        <p id="profile">${bamski.name} | Ikä: ${bamski.age} | ${bamski.job}</p>
        <p id="money">${bamski.money} €</p>
    `;
    document.getElementById('stats').innerHTML = `
        <li>Terveys: ${bamski.health} %</li>
        <li>Iloisuus: ${bamski.happiness} %</li>
        <li>Älykkyyys: ${bamski.smarts} %</li>
        <li>Ulkonäkö: ${bamski.looks} %</li>
        <li>Cloutti: ${bamski.clout} %</li>`;
};

startForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const nameInput = document.getElementById('name-input').value.trim();
    const nameError = document.getElementById('name-error');
    if (nameInput === "") {
        nameError.hidden = false;
        return;
    }
    nameError.hidden = true;
    bamski = new Bamski(nameInput);
    bgAudio.volume = 0.2;
    bgAudio.play();
    startgame();
});

const startgame = async () => {
    await loadEvents();
    usedEvents = [];
    gameContainer.hidden = true;
    gameScreen.hidden = false;
    lifeLog.innerHTML = '';
    log(`Ikä 0: Olen syntynyt nimellä ${bamski.name}.`);
    render();
};

const deadCheck = () => {
    if (bamski.health <= 0 || bamski.age >= 120) {
        log(`Ikä ${bamski.age}: Kuolin huonoon terveyteen.`);
        ageButton.disabled = true;
    }
};

ageButton.addEventListener('click', () => {
    bamski.age += 1;
    log(`Ikä ${bamski.age}!`);
    const event = pickEvent();
    if (event) showEvent(event);
    deadCheck();
    render();
});
