class Bamski {
    constructor(name, age = 0, money = 0, job = "Unemployed", health = 100, happiness = 100, smarts = 100, clout = 0) {
        this.name = name;
        this.age = age;
        this.money = money;
        this.job = job;
        this.health = health;
        this.happiness = happiness;
        this.smarts = smarts;
        this.clout = clout;
    }
}
const startForm = document.getElementById('start-form');
const bgAudio = document.getElementById('background-audio');
let bamski = undefined;
let started = false;

startForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const nameInput = document.getElementById('name-input').value.trim();
    if (nameInput === "") {
        alert("Please enter your name.");
        return;
    }
    if (!started) {
        bamski = new Bamski(nameInput);
        started = true;
        bgAudio.volume = 0.2;
        bgAudio.play();
        startgame();
    } else {
        bamski.age += 1;
        document.getElementById('game-text').innerHTML = `Year: ${bamski.age}. Your journey continues!`;
    }
});


const startgame = () => {
    // Bitlife starts here
    document.getElementById('game-text').innerHTML = `Welcome, ${bamski.name}! Your journey begins now.`;
    document.getElementById('start-button').innerHTML = '[ +1 Year ]';
}