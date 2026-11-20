class Bamski {
    constructor(name, age, money, job, health, happiness, smarts, clout) {
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
const startButton = document.getElementById('start-button');
const bgAudio = document.getElementById('background-audio');
let bamski = undefined;
let started = false;

startButton.addEventListener('click', () => {
    if (!started) {
        bamski = new Bamski("Bämski", 0, 0, "Unemployed", 100, 100, 100, 0);
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
    const name = prompt("Enter your Bämski's name:");
    document.getElementById('game-text').innerHTML = `Welcome, ${name}! Your journey begins now.`;
    document.getElementById('start-button').innerHTML = '[ +1 Year ]';
}