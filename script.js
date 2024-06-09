const letters = document.querySelectorAll(".scoreboard-letter");
const loadingDiv = document.querySelector(".info-bar");
const ANSWER_LENGTH = 5;
const ROUNDS = 6;


async function init() {
    let currentGuess = ''
    let currentRow = 0;
    let isLoading = true;


    const res = await fetch("https://words.dev-apis.com/word-of-the-day?random=1");
    const resObj = await res.json();
    const word = resObj.word.toUpperCase();
    const wordParts = word.split("");
    let done = false;
    setLoading(false);
    isLoading = false;

    console.log(word);

    function addLetter (letter){
        if (currentGuess.length < ANSWER_LENGTH) {
            //add letter to the end 
            currentGuess += letter;
        }else {
            //replace the last letter
            currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
        }

        letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText = letter;
    }

async function commit() {
    if (currentGuess.length !== ANSWER_LENGTH) {
        //do nothing
        return;
    }

    isLoading = true;
    setLoading(true)
    const res = await fetch("https://words.dev-apis.com/validate-word", {
        method: "POST",
        body: JSON.stringify({ word: currentGuess })
    });

    const resObj = await res.json();
    const validWord = resObj.validWord;

    isLoading = false;
    setLoading(false);

    if (!validWord) {
        markInvalidWord();
        return;
    }

    const gussParts = currentGuess.split("");
    const map = makemap(wordParts);


    for (let i = 0; i < ANSWER_LENGTH; i++) {
        // mark as coorect
        if (gussParts[i] === wordParts[i]) {
            letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
            map[gussParts[i]]--;
        }
    }

    for (let i = 0; i < ANSWER_LENGTH; i++) {
        if (gussParts[i] === wordParts[i]) {
            //do nothing we already did it
        } else if (wordParts.includes(gussParts[i]) && map[gussParts[i]] > 0) {
            letters[currentRow * ANSWER_LENGTH + i].classList.add("close");
            map[gussParts[i]]--;
        } else {
            letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong");
        }
    }


    currentRow++;
    if (currentGuess === word) {
        // win 
        alert('you win!');
        document.querySelector('.brand').classList.add("winner");
        done = true;
        return;
    } else if (currentRow === ROUNDS) {
        alert(`you lose, the word was ${word}`);
        done = true;
    }
    
    currentGuess= '';    

}


function backspace() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1) ;
    letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = "";
}


// not a valid word 
function markInvalidWord() {
    for (let i = 0; i < ANSWER_LENGTH; i++) {
        letters[currentRow * ANSWER_LENGTH + i].classList.remove("invalid");

        setTimeout(function () {
            letters[currentRow * ANSWER_LENGTH + i].classList.add("invalid");
        }, 10)
    }
}

document.addEventListener("keydown", function handlekeypress(event) {
    const action = event.key;

    if (done || isLoading) {
        //  do nothing
        return;
    }



    if (action === "Enter") {
    commit();
    } else if (action === "Backspace") {
    backspace();
    } else if (isLetter(action)) {
    addLetter(action.toUpperCase());
    } else {
      //do nothing
    }
});


}

function isLetter(letter) {
return /^[a-zA-Z]$/.test(letter);
}


function setLoading(isLoading) {
    loadingDiv.classList.toggle('show', !isLoading);
}


function makemap (array) {
    const obj = {};
    for (let i = 0; i < array.length; i++) {
        const letter = array[i]
        if(obj[letter]) {
            obj[letter]++;
        }  else {
            obj[letter] = 1;
        }
    }

    return obj;
}

init();
