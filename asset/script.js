const quizData = {
    technology: [
        { q: "What does HTML stand for?", a: "HyperText Markup Language", options: ["HyperText Markup Language", "HighText Machine Language", "HyperTool Multi Language", "None"] },
        { q: "Is JavaScript same as Java?", a: "No", options: ["Yes", "No", "Maybe", "Only in browsers"] }
    ],
    science: [
        { q: "Boiling point of water?", a: "100°C", options: ["90°C", "100°C", "120°C", "80°C"] },
        { q: "Powerhouse of the cell?", a: "Mitochondria", options: ["Nucleus", "Ribosome", "Mitochondria", "Cell Wall"] }
    ]
};

let currentQuestionIndex = 0;
let score = 0;

// This function MUST be global for the onclick to work
window.selectCategory = function(cat) {
    console.log("Category selected:", cat);
    localStorage.setItem('selectedCategory', cat);
    window.location.href = 'quiz.html';
};

$(document).ready(function() {
    // Determine which page we are on
    const path = window.location.pathname;
    const page = path.split("/").pop();

    if (page === "quiz.html" || $("#quiz-card").length > 0) {
        const cat = localStorage.getItem('selectedCategory') || 'technology';
        loadQuestion(cat);
    }

    function loadQuestion(cat) {
        const questions = quizData[cat];
        const q = questions[currentQuestionIndex];

        $('#category-label').text(cat.toUpperCase());
        $('#progress').text(`Question ${currentQuestionIndex + 1}/${questions.length}`);
        $('#question-text').text(q.q);
        $('#options-container').empty();

        q.options.forEach(opt => {
            const btn = $(`<button class="btn btn-outline-dark p-3 w-100">${opt}</button>`);
            btn.on('click', function() { checkAnswer(opt, q.a, cat); });
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

    if (page === "result.html" || $("#final-score").length > 0) {
        const lastScore = localStorage.getItem('lastScore') || 0;
        $('#final-score').text(lastScore + "%");
    }
});
