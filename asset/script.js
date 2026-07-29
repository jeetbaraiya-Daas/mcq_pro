// ==========================================
// 1. MOCK DATABASE (Expanded with Difficulties)
// ==========================================
const quizDatabase = {
    technology: [
        { q: "What does HTML stand for?", options: ["Hyper Text Preprocessor", "Hyper Text Markup Language", "Hyper Tool Multi Language", "Home Tool Markup Language"], answer: 1, difficulty: "easy" },
        { q: "Inside which HTML element do we put the JavaScript?", options: ["<js>", "<javascript>", "<script>", "<scripting>"], answer: 2, difficulty: "easy" },
        { q: "Which symbol is used for ID in CSS?", options: [".", "#", "&", "*"], answer: 1, difficulty: "easy" },
        { q: "How do you write 'Hello World' in an alert box?", options: ["msg('Hello World')", "alertBox('Hello World')", "msgBox('Hello World')", "alert('Hello World')"], answer: 3, difficulty: "medium" },
        { q: "Which of the following is NOT a JavaScript framework?", options: ["Vue", "React", "Django", "Angular"], answer: 2, difficulty: "medium" },
        { q: "How do you empty an array in JavaScript?", options: ["array.empty()", "array.length = 0", "array = null", "delete array"], answer: 1, difficulty: "hard" },
        { q: "What is the output of typeof null in JavaScript?", options: ["null", "undefined", "object", "string"], answer: 2, difficulty: "hard" },
        { q: "Which CSS property is used to control the flow of text around an image?", options: ["wrap", "float", "align", "position"], answer: 1, difficulty: "medium" }
    ],
    science: [
        { q: "What is the chemical symbol for gold?", options: ["Au", "Ag", "Fe", "Hg"], answer: 0, difficulty: "easy" },
        { q: "What is the hardest natural substance on Earth?", options: ["Gold", "Iron", "Diamond", "Platinum"], answer: 2, difficulty: "medium" },
        { q: "What is the speed of light?", options: ["300,000 km/s", "150,000 km/s", "1,000,000 km/s", "50,000 km/s"], answer: 0, difficulty: "hard" }
    ],
    general: [
        { q: "How many continents are there?", options: ["5", "6", "7", "8"], answer: 2, difficulty: "easy" },
        { q: "Which is the largest ocean?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: 3, difficulty: "medium" }
    ],
    "pop-culture": [
        { q: "Who is known as the King of Pop?", options: ["Elvis", "Michael Jackson", "Prince", "Usher"], answer: 1, difficulty: "easy" }
    ]
};

// ==========================================
// 2. GLOBAL APPLICATION STATE
// ==========================================
let activeQuestions = [];
let currentIndex = 0;
let userAnswers = []; // Array of objects: { selected: int, isCorrect: boolean }
let flaggedQuestions = new Set(); // Using a Set to ensure unique flagged indices
let timerInterval;
let timeLeft = 0;

// ==========================================
// 3. NAVIGATION & CATEGORY SELECTION (Fixes index.html bug)
// ==========================================
window.selectCategory = function(category) {
    // Save to sessionStorage so it persists to the next page
    sessionStorage.setItem('selectedCategory', category);
    window.location.href = 'quiz.html';
};

// ==========================================
// 4. QUIZ INITIALIZATION ENGINE
// ==========================================
window.initQuiz = function() {
    // 1. Get configurations from SessionStorage
    const category = sessionStorage.getItem('selectedCategory') || 'technology';
    const rawData = quizDatabase[category] || quizDatabase['technology'];
    
    const difficultyPref = sessionStorage.getItem('quizDifficulty') || 'medium';
    const countPref = parseInt(sessionStorage.getItem('quizCount')) || 5;

    // 2. Filter logic (Get exact difficulty, fallback to others if not enough questions)
    let filteredData = rawData.filter(q => q.difficulty === difficultyPref);
    
    // If not enough questions of that difficulty, mix in others to reach the desired count
    if (filteredData.length < countPref) {
        const otherQuestions = rawData.filter(q => q.difficulty !== difficultyPref);
        filteredData = [...filteredData, ...otherQuestions];
    }

    // 3. Shuffle array randomly and slice it to the user's requested length
    activeQuestions = filteredData.sort(() => Math.random() - 0.5).slice(0, countPref);
    
    // Reset States
    currentIndex = 0;
    userAnswers = new Array(activeQuestions.length).fill(null);
    flaggedQuestions.clear();
    
    // Dynamic Timer: 15 seconds per question
    timeLeft = activeQuestions.length * 15;
    
    startTimer();
    loadQuestion(0);
};

// ==========================================
// 5. CORE QUIZ LOGIC & RENDERING
// ==========================================
function startTimer() {
    clearInterval(timerInterval);
    const timerDisplay = document.getElementById('timer');
    
    timerInterval = setInterval(() => {
        timeLeft--;
        
        // Format time into MM:SS
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitQuiz(); // Auto-submit when time is up
        }
    }, 1000);
}

function loadQuestion(index) {
    const q = activeQuestions[index];
    
    // Update Progress UI
    $('#progress-text').text(`${index + 1} of ${activeQuestions.length}`);
    const progressPercent = ((index + 1) / activeQuestions.length) * 100;
    $('#quiz-progress-bar').css('width', progressPercent + '%');
    
    // Load Text
    $('#question-text').text(q.q);
    $('#category-label').text(sessionStorage.getItem('selectedCategory').toUpperCase());
    
    // Load Flag State
    if (flaggedQuestions.has(index)) {
        $('#flag-btn').addClass('btn-flagged btn-outline-secondary').html('<i class="fas fa-flag"></i> Flagged');
    } else {
        $('#flag-btn').removeClass('btn-flagged').addClass('btn-outline-secondary').html('<i class="fas fa-flag"></i> Flag');
    }

    // Generate Options
    const optionsContainer = $('#options-container');
    optionsContainer.empty();
    
    q.options.forEach((opt, i) => {
        const btn = $(`<button class="btn option-btn" data-index="${i}">${opt}</button>`);
        
        // Check if user already answered this question previously
        if (userAnswers[index] !== null) {
            applyFeedback(btn, i, index);
        }

        // Handle answering
        btn.click(function() {
            if (userAnswers[index] === null) {
                const isCorrect = (i === q.answer);
                userAnswers[index] = { selectedIndex: i, isCorrect: isCorrect };
                applyFeedback($(this), i, index);
            }
        });

        optionsContainer.append(btn);
    });

    updateNavigationButtons();
}

function applyFeedback(btn, optionIndex, qIndex) {
    const correctIndex = activeQuestions[qIndex].answer;
    const userChoice = userAnswers[qIndex].selectedIndex;

    if (optionIndex === correctIndex) {
        btn.addClass('btn-success text-white border-success');
    } else if (optionIndex === userChoice) {
        btn.addClass('btn-danger text-white border-danger');
        // Optional: animate wrong answer
        btn.css('animation', 'shake 0.4s ease-in-out'); 
    }
    
    // Lock all buttons after selection
    $('.option-btn').prop('disabled', true);
}

// ==========================================
// 6. NAVIGATION CONTROLS
// ==========================================
function updateNavigationButtons() {
    $('#prev-btn').prop('disabled', currentIndex === 0);
    
    if (currentIndex === activeQuestions.length - 1) {
        $('#next-btn').html('Submit <i class="fas fa-check ms-1"></i>').removeClass('btn-primary').addClass('btn-success');
    } else {
        $('#next-btn').html('Next <i class="fas fa-chevron-right ms-1"></i>').removeClass('btn-success').addClass('btn-primary');
    }
}

// Next / Prev Click Listeners
$(document).on('click', '#next-btn', function() {
    if (currentIndex < activeQuestions.length - 1) {
        $('#quiz-content').fadeOut(150, function() {
            currentIndex++;
            loadQuestion(currentIndex);
            $(this).fadeIn(150);
        });
    } else {
        submitQuiz();
    }
});

$(document).on('click', '#prev-btn', function() {
    if (currentIndex > 0) {
        $('#quiz-content').fadeOut(150, function() {
            currentIndex--;
            loadQuestion(currentIndex);
            $(this).fadeIn(150);
        });
    }
});

// Flag Toggle Listener
$(document).on('click', '#flag-btn', function() {
    if (flaggedQuestions.has(currentIndex)) {
        flaggedQuestions.delete(currentIndex);
    } else {
        flaggedQuestions.add(currentIndex);
    }
    // Note: Visual toggling of the button is already handled inline in quiz.html,
    // but the actual state is saved in the flaggedQuestions Set here.
});

// ==========================================
// 7. FINAL SUBMISSION
// ==========================================
function submitQuiz() {
    clearInterval(timerInterval);
    
    let score = 0;
    let attempted = 0;

    userAnswers.forEach(ans => {
        if (ans !== null) {
            attempted++;
            if (ans.isCorrect) score++;
        }
    });

    // Save final stats to session storage
    sessionStorage.setItem('finalScore', score);
    sessionStorage.setItem('totalQuestions', activeQuestions.length);
    sessionStorage.setItem('attempted', attempted);
    
    // Smooth transition out
    $("body").fadeOut(400, function() {
        window.location.href = 'result.html';
    });
}
