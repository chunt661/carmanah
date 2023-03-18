const FEED_API = "https://challenge.carmanahsigns.com/";
// How often the feed will be refreshed, in seconds
const FEED_INTERVAL = 60;

/*
List of lottery identifiers. Used for iterating through the different jackpots
and ensuring that each is updated every cycle. This must be maintained on the
client side, as the API does not consistently return all lotteries and
therefore some jackpots may be missed during an update.
*/
const LOTTO_IDS = [
    "lmax",
    "l649",
    "scratch",
    "dg"
];

document.addEventListener("DOMContentLoaded", function() {
    // Generate markup at each location marked in the HTML file
    LOTTO_IDS.forEach(id => {
        document.querySelectorAll(`.lotto-${id}`).forEach(tag => {
            tag.appendChild(createJackpotMarkup(id));
        });
    });
    
    update();
    //setInterval(update, FEED_INTERVAL*1000);
});

/**
Downloads jackpot data from the feed API and updates the display.
*/
function update() {
    fetch(FEED_API)
        .then(response => response.json())
        .then(json => {
            LOTTO_IDS.forEach(id => {
                if (json[id] && json[id].jackpot) {
                    let jackpot = json[id].jackpot.replace(/,/g, "");
                    displayJackpot(id, parseInt(jackpot));
                }
            });
        });
}

/**
Creates and returns a DOM element to be used for displaying jackpots.
*/
function createJackpotMarkup() {
    const container = document.createElement("div");
    
    const jackpotContainer = document.createElement("div");
    jackpotContainer.classList.add("jackpot-container");
    
    const dollarSign = document.createElement("span");
    dollarSign.classList.add("dollar");
    dollarSign.textContent = "$";
    
    const jackpot = document.createElement("span");
    jackpot.classList.add("jackpot");
    
    const unitDisplay = document.createElement("div");
    unitDisplay.classList.add("illion");
    
    jackpotContainer.append(dollarSign, jackpot);
    
    container.append(jackpotContainer, unitDisplay);
    
    return container;
}

/**
Updates DOM elements to display the given jackpot. The jackpot is formatted and
the accompanying unit (i.e., million or billion) is displayed when necessary.

@param id The identifer for the lottery being updated.
@param jackpot The jackpot dollar amount.
*/
function displayJackpot(id, jackpot) {
    let number = jackpot; // Number to be displayed
    let unit = ""; // The million/billion display

    if (jackpot >= 10e8) {
        unit = "BILLION";
        number = jackpot / 10e8;
        // Truncates decimals beyond the tenths place
        number = Math.trunc(number*10)/10;
    } else if (jackpot >= 10e5) {
        unit = "MILLION";
        number = Math.floor(jackpot / 10e5);
    } else {
        // Adds commas to the number
        number = Math.floor(number).toLocaleString("en-US");
    }
    
    document.querySelectorAll(`.lotto-${id}`).forEach(lotto => {
        lotto.querySelector(".jackpot").textContent = number;
        lotto.querySelector(".illion").textContent = unit;
    });
}