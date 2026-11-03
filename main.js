// Select elemnts
let countSpan = document.querySelector(".quiz-info .cont span");
let bulletsSpan = document.querySelector(".bullets");
let bulletsSpanContainer = document.querySelector(".bullets .spans");
let quizArea = document.querySelector(".quiz-area");
let quizApp = document.querySelector(".quiz-app");
let answersArea = document.querySelector(".answers-area");
let submitButton = document.querySelector(".submit-button");
let resultsContaier = document.querySelector(".results");
let countdownDiv = document.querySelector(".countdown");
let categorySpan = document.querySelector(".selectedCategory");

//class
class Quiz {
  constructor(title, date, questions, score) {
    this.id = Date.now();
    this.title = title;
    this.createdAt = date;
    this.questions = questions;
    this.score = score;
  }
}

class Question {
  constructor(title, answer, right_answer) {
    this.t = title;
    this.answer = answer;
    this.rAnswer = right_answer;
  }
}

//main
let params = new URLSearchParams(window.location.search);
let category = params.get("category");

//options
let currentIndex = 0;
let qCount = 0;
let rightAnswers = 0;
let countdownInterval;
let countDownTimer = 30;
let questions = [];
let lastAnswer;
let lastTilte;
let quizzes = JSON.parse(localStorage.getItem("quizzes") || "[]");

function getQuestions() {
  if (!category) return;
  fetch(`${category.toLowerCase()}_questions.json`)
    .then((response) => response.json())
    .then((data) => {
      if (category)
        categorySpan.textContent =
          category.toLowerCase() === "csharp" ? "C#" : category;
      categorySpan.classList.add(category.toLowerCase());

      qCount = data.length;

      //creating the bullets
      CreateBullets(qCount);

      //add Questions Data
      AddQuestionsData(data[currentIndex]);

      //start countdown
      countdown(countDownTimer);

      //click on submita
      submitButton.onclick = () => {
        //get right answer

        let rightAnswer = data[currentIndex].right_answer;

        currentIndex++;

        //check the answer
        checkAnswer(rightAnswer);

        saveQuestion(rightAnswer);

        //remove previous area
        quizArea.innerHTML = "";
        answersArea.innerHTML = "";
        //add Questions Data
        AddQuestionsData(data[currentIndex]);

        //Hundelbullets class
        HundelBullets();

        //start countdown
        clearInterval(countdownInterval);
        countdown(countDownTimer);

        //show Result
        ShowResults();
      };
    })
    .catch((e) => alert("Error While Getting the data " + e));
}

function CreateBullets(num) {
  countSpan.innerHTML = num;

  //create spans
  for (let i = 0; i < num; i++) {
    let theBullet = document.createElement("span");

    //chect the first span
    if (i === 0) {
      theBullet.className = "on";
    }

    // append bullet to main bullet container
    bulletsSpanContainer.appendChild(theBullet);
  }
}

function AddQuestionsData(question) {
  if (!(currentIndex < qCount)) {
    return;
  }

  //Create h2 qustion Title
  let questionTitle = document.createElement("h2");

  //create question txt;
  lastTilte = question["title"];
  let questionTxt = document.createTextNode(lastTilte);

  //append txt to h2
  questionTitle.appendChild(questionTxt);

  quizArea.appendChild(questionTitle);

  //create the answers

  for (let i = 1; i <= 4; i++) {
    let div = document.createElement("div");
    div.className = "answer";
    div.htmlFor = `answer_${i}`;

    //create redio input
    let radioInp = document.createElement("input");
    radioInp.type = "radio";
    radioInp.name = "question";
    radioInp.id = `answer_${i}`;
    radioInp.dataset.answer = question[`answer_${i}`];

    //Check first
    if (i === 1) {
      radioInp.checked = true;
    }

    //creating the lable
    let theLable = document.createElement("label");
    theLable.htmlFor = `answer_${i}`;

    //create lable txt
    let theLableTxt = document.createTextNode(question[`answer_${i}`]);

    theLable.appendChild(theLableTxt);

    //appendto main div;

    div.appendChild(radioInp);
    div.appendChild(theLable);

    answersArea.appendChild(div);
  }
}

function checkAnswer(rightAnswer) {
  let answers = document.getElementsByName("question");
  let theChoosenAnswer;

  for (let i = 0; i < answers.length; i++) {
    if (answers[i].checked) {
      theChoosenAnswer = answers[i].dataset.answer;
      lastAnswer = theChoosenAnswer;
      break;
    }
  }

  if (rightAnswer === theChoosenAnswer) {
    rightAnswers++;
  }
}

function HundelBullets() {
  let bulletsSpans = document.querySelectorAll(".bullets .spans span");
  let arrayOfSpans = Array.from(bulletsSpans);

  arrayOfSpans.forEach((span, index) => {
    if (currentIndex == index) {
      span.className = "on";
    }
  });
}

function ShowResults() {
  let theResults;
  if (currentIndex === qCount) {
    quizArea.remove();
    answersArea.remove();
    submitButton.remove();
    bulletsSpan.remove();

    if (rightAnswers > qCount / 2 && rightAnswers < qCount) {
      theResults = `<span class = "good">Good</span>, ${rightAnswers} from ${qCount} is right.`;
    } else if (rightAnswers === qCount) {
      theResults = `<span class = "perfect">Perfect</span>, All answers is right.`;
    } else {
      theResults = `<span class = "bad">Bad</span> ,${rightAnswers} from ${qCount} is right.`;
    }

    resultsContaier.innerHTML = theResults;
    showAnswersResult(questions, quizApp);
    saveInLocalStorege();
  }
}

function countdown(duration) {
  if (!(currentIndex < qCount)) return;

  let minutes, seconds;

  function updateTimer() {
    minutes = parseInt(duration / 60);
    seconds = parseInt(duration % 60);

    minutes = minutes < 10 ? `0${minutes}` : minutes;
    seconds = seconds < 10 ? `0${seconds}` : seconds;

    countdownDiv.innerHTML = `${minutes}:${seconds}`;
  }

  updateTimer();

  countdownInterval = setInterval(function () {
    if (--duration < 0) {
      clearInterval(countdownInterval);
      submitButton.click();
      return;
    }

    updateTimer();
  }, 1000);
}

function saveQuestion(right_answer) {
  let question = new Question(lastTilte, lastAnswer, right_answer);
  questions.push(question);
}

function createResultAnswer(AnswersResultContaier, question, indx) {
  console.log("Q");

  let questionResDiv = document.createElement("div");
  questionResDiv.className = "questionRes";

  let questionTitle = document.createElement("h3");
  let questionTxt = document.createTextNode(`${indx + 1}: ${question.t} `);
  questionTitle.appendChild(questionTxt);

  let spanRes = document.createElement("span");
  questionTitle.appendChild(spanRes);

  questionResDiv.appendChild(questionTitle);

  let corrcetAnswerDiv = document.createElement("div");
  corrcetAnswerDiv.className = "answer";

  let theCorrectLable = document.createElement("label");
  let theCorretLableTxt = document.createTextNode(question.rAnswer);
  theCorrectLable.appendChild(theCorretLableTxt);
  corrcetAnswerDiv.classList.add("correct");
  corrcetAnswerDiv.appendChild(theCorrectLable);
  questionResDiv.appendChild(corrcetAnswerDiv);

  if (question.answer !== question.rAnswer) {
    let falseAnswerDiv = document.createElement("div");
    falseAnswerDiv.className = "answer";
    falseAnswerDiv.classList.add("false");

    let theFalseLable = document.createElement("label");
    let theFalseLableTxt = document.createTextNode(question.answer);
    theFalseLable.appendChild(theFalseLableTxt);
    falseAnswerDiv.appendChild(theFalseLable);
    questionResDiv.appendChild(falseAnswerDiv);

    spanRes.textContent = "Wrong";
    spanRes.className = "false";
  } else {
    spanRes.textContent = "Correct";
    spanRes.className = "correct";
  }
  AnswersResultContaier.appendChild(questionResDiv);
}

function showAnswersResult(questions, parrentDiv) {
  deleteAllAnswersResult();
  let AnswersResultContaier = document.createElement("div");
  AnswersResultContaier.className = "AnswersResultContaier";
  parrentDiv.appendChild(AnswersResultContaier);

  questions.forEach((question, indx) => {
    createResultAnswer(AnswersResultContaier, question, indx);
  });
}

function deleteAllAnswersResult() {
  document.querySelectorAll(".AnswersResultContaier").forEach((element) => {
    element.remove();
  });
}

function startQuiz(category) {
  window.location.href = `/quiz.html?category=${category}`;
}

function randomQuiz() {
  let quizzes = ["HTML", "CSS", "JS", "csharp", "SQL", "CPP"];

  let randomIndex = Math.floor(Math.random() * quizzes.length);

  let randomCategory = quizzes[randomIndex];

  startQuiz(randomCategory);
}

function saveInLocalStorege() {
  let quiz = new Quiz(
    category,
    new Date().toLocaleDateString(),
    questions,
    rightAnswers,
  );

  quizzes.push(quiz);

  localStorage.setItem("quizzes", JSON.stringify(quizzes));
}

function loadHeader() {
  fetch("header.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("header").innerHTML = data;
    })
    .then(() => {
      if (window.location.pathname.includes("previousQuiz.html")) {
        document.querySelector("#home").className = "";
        document.querySelector("#prev").className = "on";
        loadPreviousExams();
      } else if (window.location.pathname.includes("quiz.html")) {
        document.querySelector("#home").className = "";
      }
    });
}

function chengeSelectedPage(e) {
  homeA.className = "";
  prevA.className = "";

  e.className = "on";
}

function loadPreviousExams() {
  let examsDiv = document.querySelector(".exams");

  if (quizzes.length === 0) {
    createNoPrevExames(examsDiv);
    return;
  }

  let bClear = document.querySelector("#clear");
  bClear.onclick = () => {
    localStorage.removeItem("quizzes");
    let header = examsDiv.querySelector(".header");
    examsDiv.replaceChildren(header);
    quizzes = null;
    createNoPrevExames(examsDiv);
  };

  quizzes.forEach((quiz) => {
    createPreviousQuizSummary(quiz, examsDiv);
  });
}

function createPreviousQuizSummary(quiz, parrentDiv) {
  let exam = document.createElement("div");
  exam.className = "exam";

  let categorySpan = document.createElement("span");
  categorySpan.classList.add("selectedCategory");
  categorySpan.classList.add(quiz.title.toLowerCase());
  categorySpan.innerHTML = quiz.title === "Csharp" ? "C#" : quiz.title;

  let pScore = document.createElement("p");
  let score = quiz.score;
  let totalQuestions = quiz.questions.length;
  pScore.innerHTML = `${quiz.score} / ${quiz.questions.length} (${(score / totalQuestions) * 100}%)`;

  let pCount = document.createElement("p");
  pCount.innerHTML = `${totalQuestions} Qs`;

  let pDate = document.createElement("p");
  pDate.innerHTML = quiz.createdAt;

  let bDelete = document.createElement("button");
  bDelete.innerHTML = "Delete";
  bDelete.className = "delete";

  let bInfo = document.createElement("button");
  bInfo.innerHTML = "Info";
  bInfo.className = "info";

  bDelete.onclick = () => {
    deleteQuiz(quiz.id, parrentDiv);
    exam.remove();
  };

  let clicked = false;

  bInfo.onclick = () => {
    if (clicked) {
      deleteAllAnswersResult();
      clicked = false;
    } else {
      showAnswersResult(quiz.questions, exam);
      clicked = true;
    }
  };

  exam.appendChild(categorySpan);
  exam.appendChild(pScore);
  exam.appendChild(pCount);
  exam.appendChild(pDate);
  exam.appendChild(bDelete);
  exam.appendChild(bInfo);

  parrentDiv.appendChild(exam);
}

function deleteQuiz(id, parrentDiv) {
  quizzes = quizzes.filter((q) => q.id !== id);

  localStorage.setItem("quizzes", JSON.stringify(quizzes));

  if (quizzes.length === 0) createNoPrevExames(parrentDiv);
  deleteAllAnswersResult();
}

function createNoPrevExames(examsDiv) {
  let h3 = document.createElement("h3");
  h3.innerHTML = "No Previous Exams Yet!";
  document.querySelector("#clear").className = "hidden";
  examsDiv.appendChild(h3);
}

function loadFooter() {
  fetch("footer.html")
    .then((response) => response.text())
    .then((data) => {
      console.log(data);
      document.getElementById("footer").innerHTML = data;
    })
    .then(() => {
      let scrollTop = document.getElementById("scrollTop");

      window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
          scrollTop.style.opacity = 1;
        } else {
          scrollTop.style.opacity = 0;
        }
      });

      scrollTop.addEventListener("click", () => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      });
    });
}

function openPreviousQuizzes() {
  window.location.href = "previousQuiz.html";
}

loadHeader();
loadFooter();
getQuestions();
