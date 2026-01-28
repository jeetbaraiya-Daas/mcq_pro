const quizData = {
    technology: [
        { q: "What is JavaScript?", options: ["Language", "Framework", "Library", "Database"], answer: 0 },
        { q: "What does HTML stand for?", options: ["Hyper Text Preprocessor", "Hyper Text Markup Language", "Hyper Tool Multi Language", "Home Tool Markup Language"], answer: 1 },
        { q: "Which symbol is used for ID in CSS?", options: [".", "#", "&", "*"], answer: 1 },
        { q: "Inside which HTML element do we put the JavaScript?", options: ["<js>", "<javascript>", "<script>", "<scripting>"], answer: 2 },
        { q: "How do you write 'Hello World' in an alert box?", options: ["msg('Hello World')", "alertBox('Hello World')", "msgBox('Hello World')", "alert('Hello World')"], answer: 3 }
    ],
    science: [
        { q: "What is the chemical symbol for gold?", options: ["Au", "Ag", "Fe", "Hg"], answer: 0 },
        { q: "Which planet is closest to the sun?", options: ["Venus", "Earth", "Mercury", "Mars"], answer: 2 }
    ],
    general: [
        { q: "How many continents are there?", options: ["5", "6", "7", "8"], answer: 2 }
    ],
    "pop-culture": [
        { q: "Who is the King of Pop?", options: ["Elvis", "Michael Jackson", "Prince", "Usher"], answer: 1 }
    ]
};

let currentQuestionIndex = 0;
let userAnswers = []; 
let currentCategory = 'technology';
let timerInterval;
let timeLeft = 60;

window.selectCategory = function(cat) {
    localStorage.setItem('selectedCategory', cat);
    window.location.href = 'quiz.html';
};

$(document).ready(function() {
    const path = window.location.pathname;
    const page = path.split("/").pop();

    if (page === "quiz.html" || $("#quiz-card").length > 0) {
        currentCategory = localStorage.getItem('selectedCategory') || 'technology';
        initQuiz();
    }

    if (page === "result.html" || $("#final-score").length > 0) {
        showResults();
    }
});

function initQuiz() {
    userAnswers = new Array(quizData[currentCategory].length).fill(null);
    currentQuestionIndex = 0;
    startTimer();
    loadQuestion(currentQuestionIndex);

    $('#next-btn').click(function() {
        if (currentQuestionIndex < quizData[currentCategory].length - 1) {
            navigateQuestion('next');
        } else {
            submitQuiz();
        }
    });

    $('#prev-btn').click(function() {
        if (currentQuestionIndex > 0) {
            navigateQuestion('prev');
        }
    });
}

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 60; 
    $('#timer').text(`Time: ${timeLeft}s`);
    
    timerInterval = setInterval(function() {
        timeLeft--;
        $('#timer').text(`Time: ${timeLeft}s`);
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitQuiz();
        }
    }, 1000);
}

function loadQuestion(index) {
    const questions = quizData[currentCategory];
    const q = questions[index];

    $('#category-label').text(currentCategory.toUpperCase());
    $('#progress').text(`${index + 1} of ${questions.length}`);
    $('#question-text').text(q.q);
    $('#options-container').empty();

    q.options.forEach((opt, i) => {
        let btnClass = "btn btn-outline-dark p-3 text-start option-btn";
        
        if (userAnswers[index] === i) {
            btnClass += " active-option";
        }

        const btn = $(`<button class="${btnClass}" data-index="${i}">${opt}</button>`);
        
        btn.click(function() {
            $('.option-btn').removeClass('active-option');
            $(this).addClass('active-option');
            userAnswers[index] = i; 
        });

        $('#options-container').append(btn);
    });

    updateButtons(index, questions.length);
}

function updateButtons(index, total) {
    if (index === 0) {
        $('#prev-btn').prop('disabled', true);
    } else {
        $('#prev-btn').prop('disabled', false);
    }

    if (index === total - 1) {
        $('#next-btn').text('Finish');
        $('#next-btn').removeClass('btn-dark').addClass('btn-success');
    } else {
        $('#next-btn').text('Next');
        $('#next-btn').removeClass('btn-success').addClass('btn-dark');
    }
}

function navigateQuestion(direction) {
    const content = $('#quiz-content');
    let slideOutCss = { opacity: 0, marginLeft: '-50px' };
    let slideInCss = { opacity: 0, marginLeft: '50px' };

    if (direction === 'prev') {
        slideOutCss = { opacity: 0, marginLeft: '50px' };
        slideInCss = { opacity: 0, marginLeft: '-50px' };
        currentQuestionIndex--;
    } else {
        currentQuestionIndex++;
    }

    content.animate(slideOutCss, 200, function() {
        loadQuestion(currentQuestionIndex);
        content.css(slideInCss);
        content.animate({ opacity: 1, marginLeft: '0px' }, 200);
    });
}

function submitQuiz() {
    clearInterval(timerInterval);
    let score = 0;
    const questions = quizData[currentCategory];

    questions.forEach((q, index) => {
        if (userAnswers[index] === q.answer) {
            score++;
        }
    });

    const finalPercent = Math.round((score / questions.length) * 100);
    localStorage.setItem('lastScore', finalPercent);
    window.location.href = 'result.html';
}

function showResults() {
    const lastScore = localStorage.getItem('lastScore') || 0;
    $('#final-score').text(lastScore + "%");
    }
