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
const relationButton = document.getElementById('relation-button');
const activitiesButton = document.getElementById('activities-button');
const bgAudio = document.getElementById('background-audio');
const eventBox = document.getElementById('event-box');
const eventText = document.getElementById('event-text');
const eventChoices = document.getElementById('event-choices');
const activitiesBox = document.getElementById('activities-box');
const activitiesChoices = document.getElementById('activities-choices');
const relationBox = document.getElementById('relation-box');
let bamski = undefined;
let events = [];
let activities = [];
let usedEvents = []; // samaa eventtiä ei tule kahdesti samassa elämässä
let usedActivities = []; // saman vuoden aikana tehdyt aktiviteetit

// Hakee eventit events.json-tiedostosta
const loadEvents = async () => {
    try {
        const response = await fetch('/api/events');
        const data = await response.json();
        events = Array.isArray(data) ? data : [data];
    } catch (error) {
        console.error('Eventtien lataus epäonnistui', error);
        events = [];
    }
};

// Hakee aktiviteetit activities.json-tiedostosta
const loadActivities = async () => {
    try {
        let response = await fetch('/api/activities');
        if (!response.ok) {
            response = await fetch('/activities.json');
        }
        activities = await response.json();
    } catch (error) {
        console.error('Aktiviteettien lataus epäonnistui', error);
        activities = [];
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
    activitiesBox.hidden = true;
    relationBox.hidden = true;
    eventBox.hidden = false;
    ageButton.disabled = true;
    activitiesButton.disabled = true;
    relationButton.disabled = true;
};

// Pelaaja valitsi vaihtoehdon
const chooseOption = (choice) => {
    bamski.applyEffects(choice.effects);
    log(choice.resultText);
    eventBox.hidden = true;
    ageButton.disabled = false;
    activitiesButton.disabled = false;
    relationButton.disabled = false;
    deadCheck();
    render();
};

// Näyttää ikään sopivat aktiviteetit
const showActivities = () => {
    const available = activities.filter((a) => bamski.age >= a.minAge && bamski.age <= a.maxAge);
    activitiesChoices.innerHTML = '';

    for (const activity of available) {
        const cost = activity.cost || 0;
        const alreadyDone = usedActivities.includes(activity.id);
        const canAfford = bamski.money >= cost;
        const button = document.createElement('button');

        let label = activity.label;
        if (cost > 0) label += ` (${cost} €)`;
        if (alreadyDone) label += ' — Tehty';
        else if (!canAfford) label += ' — Ei varaa';

        button.textContent = label;
        button.disabled = alreadyDone || !canAfford;
        button.addEventListener('click', () => doActivity(activity));
        activitiesChoices.appendChild(button);
    }

    relationBox.hidden = true;
    activitiesBox.hidden = false;
};

// Arpoo lopputuloksen aktiviteetille, jossa on useita vaihtoehtoja (outcomes)
const pickOutcome = (outcomes) => {
    const roll = randomInt(1, 100);
    let cumulative = 0;
    for (const outcome of outcomes) {
        cumulative += outcome.chance;
        if (roll <= cumulative) return outcome;
    }
    return outcomes[outcomes.length - 1];
};

// Suorittaa valitun aktiviteetin
const doActivity = (activity) => {
    const cost = activity.cost || 0;
    if (usedActivities.includes(activity.id) || bamski.money < cost) return;

    usedActivities.push(activity.id);
    const result = activity.outcomes ? pickOutcome(activity.outcomes) : activity;
    bamski.applyEffects(result.effects);
    log(`Ikä ${bamski.age}: ${result.resultText}`);
    activitiesBox.hidden = true;
    deadCheck();
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
    await loadActivities();
    usedEvents = [];
    usedActivities = [];
    ageButton.disabled = false;
    activitiesButton.disabled = false;
    relationButton.disabled = false;
    eventBox.hidden = true;
    activitiesBox.hidden = true;
    relationBox.hidden = true;
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
        activitiesButton.disabled = true;
        relationButton.disabled = true;
        eventBox.hidden = true;
        activitiesBox.hidden = true;
        relationBox.hidden = true;
    }
};

ageButton.addEventListener('click', () => {
    bamski.age += 1;
    usedActivities = [];
    activitiesBox.hidden = true;
    relationBox.hidden = true;
    log(`Ikä ${bamski.age}!`);
    const event = pickEvent();
    if (event) showEvent(event);
    deadCheck();
    render();
});

activitiesButton.addEventListener('click', () => {
    if (!activitiesBox.hidden) {
        activitiesBox.hidden = true;
        return;
    }
    showActivities();
});

relationButton.addEventListener('click', () => {
    log(`Ikä ${bamski.age}: Päätin tutustua ihmisiin.`);
    const event = pickEvent();
    if (event) showEvent(event);
    render();
});