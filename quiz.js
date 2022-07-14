const question = document.getElementById("question"); //The document object referes to the webpage
const choices = Array.from(document.getElementsByClassName("choice-text"));
// const questionCounterText = document.getElementById("questionCounter");
const progresstext = document.getElementById("progressText");
const progressBarFill = document.getElementById("progressBarFill");
const scoreText = document.getElementById("score");
const game = document.getElementById("game");
const end = document.getElementById("end");
const username = document.getElementById("username");
const saveScoreButton = document.getElementById("saveScoreButton");
const finalScore = document.getElementById("finalScore");
const intro = document.getElementById("intro");
const highScoresPage = document.getElementById("highScoresPage");
const highScores = JSON.parse(localStorage.getItem("highScores")) || []; // If array doesn't exist, highScores = []
const highScoresList = document.getElementById("highScoresList");
const form = document.getElementById("form");
const loader = document.getElementById("loader");

let currentQuestion = {}; // {} is an empty object
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];

let questions = [];

const MAX_QUESTIONS = 10;

play = () => {
    intro.style = "display:block; display:none;";
    loader.style = "display:show;";
    // game.style = "display:show;";

    // // Questions retrieved from local JSON file. It's cleaner to have questions in another file
    // fetch("questions.json").then (res => {
    //     return res.json();
    // }).then(loadedQuestions => {
    //     questions = loadedQuestions;
    //     startQuiz(); // when questiona are retrieved from json then the game can start
    // }).catch(err => {
    //     console.error(err);
    // });

    /**
     * Fetching questions from public Open Trivia Database API
     * The API link provides 10 multiple-choice questions at an easy difficulty level
     * The format of the questions is in a different form to the kind needed to run a quiz so it has to be transformed
     */
    fetch("https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple").then (res => {
        return res.json();
    }).then(loadedQuestions => {
        console.log(loadedQuestions.results); // logs the array of question object which have properties: category, type, difficulty, question, correct_answer, incorrect_answers
        questions = loadedQuestions.results.map(loadedQuestion => {
            const formattedQuestion = { // Questions are being put into the right format
                question: unescape(loadedQuestion.question)
            };
            const answerChoices = [...loadedQuestion.incorrect_answers]; // copies incorrect answers array from loadedQuestion
            formattedQuestion.answer = Math.floor(Math.random()*3) +1; // gives choice number of correct choice between 1 and 4 and then the correct answer will be spliced into the answerChoices array
            answerChoices.splice(formattedQuestion.answer -1, 0, loadedQuestion.correct_answer);

            // Making choice(number) properties for formattedQuestion object
            answerChoices.forEach((choice, index) => {
                formattedQuestion["choice"+(index+1)] = unescape(choice);
            })

            return formattedQuestion; 
        })
        startQuiz();
    }).catch(err => {
        console.error(err);
    });
}

showHighScores = () => {
    intro.style = "display:block; display:none;";
    highScoresPage.style = "display:show;";
    highScoresList.innerHTML = highScores.map(score => {
        return `<li class="high-score">${score.name} - ${score.score}</li>`
    }).join("")
}

startQuiz = () => {
    questionCounter = 0;
    score = 0;
    scoreText.innerText = "0";
    availableQuestions = [...questions]; // ... is the spread operator. it will make a COPY of the questions array and allow it to be modified without affecting the original 
    getNewQuestion();
    game.style="display:show;"; //Game is displayed and loader is removed once fitst question is ready this prevents the default dummy text in the html file from being shown
    loader.style = "display:block; display:none;";
};

getNewQuestion = () => {
    if (availableQuestions.length === 0 || questionCounter === MAX_QUESTIONS) {
        game.style="display:block; display:none;";
        end.style="display:show;";
        finalScore.innerText = score;
    }
    else {
        questionCounter++;
        // questionCounterText.innerText = questionCounter+"/"+MAX_QUESTIONS;
        progresstext.innerText = "Question "+questionCounter+"/"+MAX_QUESTIONS;
        // Progress bar is fill by percentage of width.
        progressBarFill.style.width = `${(questionCounter/MAX_QUESTIONS)*100}%`;

        const questionIndex = Math.floor(Math.random() * availableQuestions.length); //Math.random() returns between 0 and 1 excluding 1
        currentQuestion = availableQuestions[questionIndex];
        question.innerText = currentQuestion.question;

        choices.forEach(choice => {
            const number = choice.dataset['number'];
            choice.innerText = currentQuestion["choice"+number];
        });

        availableQuestions.splice(questionIndex,1); //remeoving displayed question from array
        acceptingAnswers = true;
    }
};

// Add listeners to each choice box
choices.forEach(choice => {
    console.log("set listener for "+choice.dataset.number)
    choice.addEventListener('click', e => {
        if (!acceptingAnswers) return;

        acceptingAnswers = false;
        const selectedAnswer = e.target.dataset["number"];
        
        /**
         * To colour boxes to indicate if correct or wrong. we add a class to that answer box
         * where the colour of the box will change as defined in the css.
         * It is then removed so it doesn't stay for the next question
         */
        // Ternary syntax
        const classToApply = selectedAnswer == currentQuestion.answer ? 'correct': 'incorrect'
        
        if (classToApply === 'correct') {
            score++;
            scoreText.innerText = score;
        }

        e.target.parentElement.classList.add(classToApply)
        
        // Setting timeout for 0.5 second so user can see if they got the answer correct before the colour is removed
        setTimeout(() => {
            e.target.parentElement.classList.remove(classToApply)
            getNewQuestion();
        }, 500);
        
    });
});


/* End page */
    // // localStorage only stores strings so JSON.stringify should be used to convert other datatypes
    // localStorage.setItem("highScores", JSON.stringify([]));
    // // To convert back from string use JSON.parse
    // JSON.parse(localStorage.getItem("highScores"));

username.addEventListener("keyup", () => {
    saveScoreButton.disabled = !username.value; // button is enabled if something is in box
});

saveScore = e => {
    e.preventDefault(); //prevents the form from posting to a different page whihc is its default
    const score =  {
        score: finalScore.innerText,
        name: username.value
    }

    highScores.push(score);

    // Only saving the highest 5 scores so the l=array will be sorted then clipped
    highScores.sort((a,b) => {
        return b.score - a.score; // if b is greater than a it goes before a
    });

    highScores.splice(5);
    localStorage.setItem("highScores", JSON.stringify([]));
    form.reset(); // this doen't reassigned disabled property to save button though
    saveScoreButton.setAttribute("disabled","disabled") // this resets save button to disabled
    playAgain();
}

// function for when play Again Button is pressed
function playAgain() {
    end.style = "display:block; display:none;";
    highScoresPage.style = "display:block; display:none;";
    intro.style = "display:show";
}


// A function to convert htmlspecial chars like &#309 into " which occurs when getting questions from API
function unescape(text) {
    return new DOMParser().parseFromString(text,'text/html').querySelector('html').textContent;
}