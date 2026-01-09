// Question Database
const quizData = {
    technology: [
        { q: "What does CPU stand for?", a: "Central Processing Unit", options: ["Central Process Unit", "Central Processing Unit", "Computer Personal Unit", "Central Processor Unifier"] },
        { q: "Which language is used for web styling?", a: "CSS", options: ["HTML", "Python", "CSS", "Java"] },
        { q: "Which of these is a Javascript library?", a: "jQuery", options: ["HTML", "CSS", "jQuery", "Python"] }
    ],
    science: [
        { q: "What is the chemical symbol for water?", a: "H2O", options: ["O2", "H2O", "CO2", "HO2"] },
        { q: "Which planet is known as the Red Planet?", a: "Mars", options: ["Venus", "Mars", "Jupiter", "Saturn"] }
    ],
    general: [
        { q: "Which is the largest continent?", a: "Asia", options: ["Africa", "Europe", "Asia", "North America"] },
        { q: "How many days are in a leap year?", a: "366", options: ["364", "365", "366", "367"] }
    ],
    "pop-culture": [
        { q: "Who played Iron Man in the Marvel movies?", a: "Robert Downey Jr.", options: ["Chris Evans", "Robert Downey Jr.", "Tom Holland", "Mark Ruffalo"] },
        { q: "Which singer is known as the 'Queen of Pop'?", a: "Madonna", options: ["Beyonce", "Madonna", "Lady Gaga", "Taylor Swift"] }
    ]
};

let currentQuestionIndex = 0;
let score = 0;

$(document).ready(function() {
    // 1. Logic for Home Page
    window.selectCategory = function(cat) {
        localStorage.setItem('selectedCategory', cat);
        window.location.href = 'quiz.html';
    };

    // 2. Logic for Quiz Page
    if ($('#question-text').length > 0) {
        const cat = localStorage.getItem('selectedCategory') || 'general';
        loadQuestion(cat);
    }

    function loadQuestion(cat) {
        const questions = quizData[cat];
        const currentQ = questions[currentQuestionIndex];

        $('#category-label').text(cat.toUpperCase());
        $('#progress').text(`Question ${currentQuestionIndex + 1}/${questions.length}`);
        $('#question-text').text(currentQ.q);
        $('#options-container').empty();

        currentQ.options.forEach(opt => {
            const btn = $(`<button class="btn btn-outline-dark p-3">${opt}</button>`);
            btn.on('click', () => checkAnswer(opt, currentQ.a, cat));
            $('#options-container').append(btn);
        });
    }

    function checkAnswer(selected, correct, cat) {
        if (selected === correct) score++;
        
        currentQuestionIndex++;
        if (currentQuestionIndex < quizData[cat].length) {
            $('#quiz-card').fadeOut(200, function() {
                loadQuestion(cat);
                $(this).fadeIn(200);
            });
        } else {
            const finalScore = Math.round((score / quizData[cat].length) * 100);
            localStorage.setItem('lastScore', finalScore);
            window.location.href = 'result.html';
        }
    }

    // 3. Logic for Result Page
    if ($('#final-score').length > 0) {
        $('#final-score').text(localStorage.getItem('lastScore') + "%");
    }
});
