const FEED_API = "https://challenge.carmanahsigns.com/";
const FEED_INTERVAL = 60; // Seconds

const LOTTO_IDS = [
    "lmax",
    "l649",
    "scratch",
    "dg"
];

document.addEventListener("DOMContentLoaded", function() {
    
});

function updateJackpot(id, jackpot) {
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