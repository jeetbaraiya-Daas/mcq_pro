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
        { q: "How many continents are there?", options: ["5", "6", "7", "8"], answer: 2 },
        { q: "Which is the largest ocean?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: 3 }
    ],
    "pop-culture": [
        { q: "Who is the King of Pop?", options: ["Elvis", "Michael Jackson", "Prince", "Usher"], answer: 1 }
    ]
};

let currentQuestionIndex = 0;
let userAnswers = []; // Stores {selectedIndex: number, isCorrect: boolean}
let currentCategory = 'technology';
let timerInterval;
let timeLeft = 60;

// 1. Select Category
window.selectCategory = function(cat) {
    localStorage.setItem('selectedCategory', cat);
    window.location.href = 'quiz.html';
};

$(document).ready(function() {
    const page = window.location.pathname.split("/").pop();

    if ($("#quiz-card").length > 0) {
        currentCategory = localStorage.getItem('selectedCategory') || 'technology';
        initQuiz();
    }

    if ($("#final-score").length > 0) {
        showResults();
    }
});

function initQuiz() {
    const questions = quizData[currentCategory] || quizData['technology'];
    userAnswers = new Array(questions.length).fill(null);
    currentQuestionIndex = 0;
    startTimer();
    loadQuestion(0);

    $('#next-btn').click(function() {
        if (currentQuestionIndex < questions.length - 1) {
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
    timerInterval = setInterval(() => {
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
    
    // Update UI Text
    $('#category-label').text(currentCategory.toUpperCase());
    $('#progress-text').text(`${index + 1} of ${questions.length}`);
    $('#question-text').text(q.q);
    $('#options-container').empty();

    // Progress Bar Animation
    const progressPercent = ((index + 1) / questions.length) * 100;
    $('#quiz-progress-bar').css('width', progressPercent + '%');

    q.options.forEach((opt, i) => {
        const btn = $(`<button class="btn btn-outline-dark p-3 text-start option-btn" data-index="${i}">${opt}</button>`);
        
        // If question was already answered, show the result
        if (userAnswers[index] !== null) {
            applyFeedback(btn, i, index);
        }

        btn.click(function() {
            if (userAnswers[index] === null) { // Prevent re-clicking
                const isCorrect = (i === q.answer);
                userAnswers[index] = { selectedIndex: i, isCorrect: isCorrect };
                applyFeedback($(this), i, index);
            }
        });

        $('#options-container').append(btn);
    });

    updateButtons(index, questions.length);
}

function applyFeedback(btn, optionIndex, qIndex) {
    const correctIndex = quizData[currentCategory][qIndex].answer;
    const userChoice = userAnswers[qIndex].selectedIndex;

    if (optionIndex === correctIndex) {
        btn.addClass('correct');
    } else if (optionIndex === userChoice) {
        btn.addClass('wrong');
    }
    // Disable buttons after selection
    $('.option-btn').prop('disabled', true);
}

function updateButtons(index, total) {
    $('#prev-btn').prop('disabled', index === 0);
    if (index === total - 1) {
        $('#next-btn').text('Finish').removeClass('btn-dark').addClass('btn-success');
    } else {
        $('#next-btn').text('Next').removeClass('btn-success').addClass('btn-dark');
    }
}

function navigateQuestion(direction) {
    const content = $('#quiz-content');
    content.fadeOut(200, function() {
        if (direction === 'next') currentQuestionIndex++;
        else currentQuestionIndex--;
        loadQuestion(currentQuestionIndex);
        content.fadeIn(200);
    });
}

function submitQuiz() {
    clearInterval(timerInterval);
    
    let score = 0;
    let attempted = 0;
    const total = quizData[currentCategory].length;

    userAnswers.forEach(ans => {
        if (ans !== null) {
            attempted++;
            if (ans.isCorrect) score++;
        }
    });

    localStorage.setItem('score', score);
    localStorage.setItem('total', total);
    localStorage.setItem('attempted', attempted);
    
    // Smooth scroll to top then redirect
    $("html, body").animate({ scrollTop: 0 }, "slow", function() {
        window.location.href = 'result.html';
    });
}

function showResults() {
    const score = parseInt(localStorage.getItem('score')) || 0;
    const total = parseInt(localStorage.getItem('total')) || 0;
    const attempted = parseInt(localStorage.getItem('attempted')) || 0;
    const percent = total > 0 ? Math.round((score / total) * 100) : 0;

    $('#stat-score').text(`${score}/${total}`);
    $('#stat-attempted').text(attempted);

    // jQuery Animation for the "Chart"
    $({ Counter: 0 }).animate({ Counter: percent }, {
        duration: 1500,
        easing: 'swing',
        step: function() {
            $('#final-score').text(Math.ceil(this.Counter) + "%");
        }
    });

    $('#result-fill-bar').animate({ width: percent + "%" }, 1500);
}
