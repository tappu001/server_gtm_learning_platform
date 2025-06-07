// Application State
const appState = {
    currentModule: 'welcome',
    completedModules: new Set(),
    quizAnswers: {},
    totalModules: 9
};

// Quiz data
const quizData = [
    {
        question: "What is the main advantage of server-side tagging for cookie lifetime?",
        options: [
            "Cookies last 7 days instead of 1 day",
            "Cookies last 400 days instead of 7 days", 
            "Cookies never expire",
            "Cookies are not needed"
        ],
        correct: 1,
        explanation: "Server-side tagging enables first-party cookies that can last up to 400 days, compared to third-party cookies limited to 7 days by browser restrictions."
    },
    {
        question: "What happens when you set minimum instances to 2 in Cloud Run?",
        options: [
            "Maximum 2 users can access your site",
            "At least 2 virtual computers always running",
            "Exactly 2 requests processed per second",
            "2 different tracking platforms supported"
        ],
        correct: 1,
        explanation: "Setting minimum instances to 2 ensures at least 2 virtual computers (instances) are always running, reducing cold start delays and providing redundancy."
    }
];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupTabSwitching();
    setupTroubleshootingToggles();
    updateProgress();
    
    // Load saved progress from sessionStorage if available
    loadProgress();
}

// Navigation functionality
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const moduleId = this.getAttribute('data-module');
            switchToModule(moduleId);
        });
    });
}

function switchToModule(moduleId) {
    // Update navigation active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-module="${moduleId}"]`).classList.add('active');
    
    // Update module visibility
    document.querySelectorAll('.module').forEach(module => {
        module.classList.remove('active');
    });
    document.getElementById(moduleId).classList.add('active');
    
    // Update state
    appState.currentModule = moduleId;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Save progress
    saveProgress();
}

function startLearning() {
    switchToModule('fundamentals');
}

// Module completion functionality
function completeModule(moduleId) {
    appState.completedModules.add(moduleId);
    updateProgress();
    saveProgress();
    
    // Show completion feedback
    showCompletionFeedback(moduleId);
    
    // Auto-advance to next module (except for quiz)
    if (moduleId !== 'quiz') {
        setTimeout(() => {
            const nextModule = getNextModule(moduleId);
            if (nextModule) {
                switchToModule(nextModule);
            }
        }, 2000); // Increased delay to prevent overlap
    }
}

function getNextModule(currentModule) {
    const moduleOrder = ['welcome', 'fundamentals', 'examples', 'backend', 'implementation', 'instances', 'troubleshooting', 'pricing', 'quiz'];
    const currentIndex = moduleOrder.indexOf(currentModule);
    
    if (currentIndex >= 0 && currentIndex < moduleOrder.length - 1) {
        return moduleOrder[currentIndex + 1];
    }
    
    return null;
}

function showCompletionFeedback(moduleId) {
    // Remove any existing feedback first
    const existingFeedback = document.querySelector('.completion-feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }
    
    // Create temporary feedback element
    const feedback = document.createElement('div');
    feedback.className = 'completion-feedback';
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--color-success);
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        font-weight: 500;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease-out;
        max-width: 300px;
        word-wrap: break-word;
    `;
    feedback.textContent = `✓ ${getModuleName(moduleId)} completed!`;
    
    document.body.appendChild(feedback);
    
    // Animate in
    setTimeout(() => {
        feedback.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        feedback.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.remove();
            }
        }, 300);
    }, 1500);
}

function getModuleName(moduleId) {
    const moduleNames = {
        'welcome': 'Welcome',
        'fundamentals': 'Fundamentals',
        'examples': 'Examples',
        'backend': 'Backend Processing',
        'implementation': 'Implementation',
        'instances': 'Instance Management',
        'troubleshooting': 'Troubleshooting',
        'pricing': 'Pricing & Optimization',
        'quiz': 'Quiz'
    };
    
    return moduleNames[moduleId] || moduleId;
}

// Progress tracking
function updateProgress() {
    const progressPercentage = Math.round((appState.completedModules.size / appState.totalModules) * 100);
    
    document.getElementById('overallProgress').style.width = `${progressPercentage}%`;
    document.getElementById('progressText').textContent = `${progressPercentage}% Complete`;
}

// Tab switching for examples
function setupTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Troubleshooting toggles
function setupTroubleshootingToggles() {
    const issueHeaders = document.querySelectorAll('.issue-header');
    
    issueHeaders.forEach(header => {
        header.addEventListener('click', function() {
            toggleIssue(this);
        });
    });
}

function toggleIssue(header) {
    const issueCard = header.closest('.issue-card');
    const isExpanded = issueCard.classList.contains('expanded');
    
    // Close all other issues
    document.querySelectorAll('.issue-card').forEach(card => {
        card.classList.remove('expanded');
    });
    
    // Toggle current issue
    if (!isExpanded) {
        issueCard.classList.add('expanded');
    }
}

// Quiz functionality
let currentQuestionIndex = 0;

function nextQuestion(questionIndex) {
    const selectedOption = document.querySelector(`input[name="q${questionIndex + 1}"]:checked`);
    
    if (!selectedOption) {
        showQuizFeedback('Please select an answer before continuing.', 'warning');
        return;
    }
    
    // Store answer
    appState.quizAnswers[questionIndex] = parseInt(selectedOption.value);
    
    // Hide current question
    document.querySelector(`[data-question="${questionIndex}"]`).classList.remove('active');
    
    // Show next question
    currentQuestionIndex++;
    document.querySelector(`[data-question="${currentQuestionIndex}"]`).classList.add('active');
}

function submitQuiz() {
    const selectedOption = document.querySelector('input[name="q2"]:checked');
    
    if (!selectedOption) {
        showQuizFeedback('Please select an answer before submitting.', 'warning');
        return;
    }
    
    // Store final answer
    appState.quizAnswers[1] = parseInt(selectedOption.value);
    
    // Calculate score
    let score = 0;
    quizData.forEach((question, index) => {
        if (appState.quizAnswers[index] === question.correct) {
            score++;
        }
    });
    
    // Show results
    showQuizResults(score);
}

function showQuizFeedback(message, type = 'info') {
    // Remove any existing feedback
    const existingFeedback = document.querySelector('.quiz-feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }
    
    const feedback = document.createElement('div');
    feedback.className = 'quiz-feedback';
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--color-${type === 'warning' ? 'warning' : 'info'});
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        font-weight: 500;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    feedback.textContent = message;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.remove();
        }
    }, 3000);
}

function showQuizResults(score) {
    // Hide current question
    document.querySelector('.quiz-question.active').classList.remove('active');
    
    // Show results
    const resultsElement = document.getElementById('quizResults');
    resultsElement.style.display = 'block';
    
    // Update score
    document.getElementById('scoreValue').textContent = score;
    
    // Generate explanations
    const explanationsElement = document.getElementById('explanations');
    explanationsElement.innerHTML = '';
    
    quizData.forEach((question, index) => {
        const userAnswer = appState.quizAnswers[index];
        const isCorrect = userAnswer === question.correct;
        
        const explanationDiv = document.createElement('div');
        explanationDiv.className = `explanation-item ${isCorrect ? 'correct' : 'incorrect'}`;
        
        explanationDiv.innerHTML = `
            <h4>Question ${index + 1}: ${isCorrect ? 'Correct' : 'Incorrect'}</h4>
            <p><strong>Your answer:</strong> ${question.options[userAnswer]}</p>
            <p><strong>Correct answer:</strong> ${question.options[question.correct]}</p>
            <p><strong>Explanation:</strong> ${question.explanation}</p>
        `;
        
        explanationsElement.appendChild(explanationDiv);
    });
    
    // Update score color based on performance
    const scoreElement = document.getElementById('scoreValue');
    if (score === quizData.length) {
        scoreElement.style.color = 'var(--color-success)';
    } else if (score >= quizData.length / 2) {
        scoreElement.style.color = 'var(--color-warning)';
    } else {
        scoreElement.style.color = 'var(--color-error)';
    }
}

// Progress persistence
function saveProgress() {
    const progressData = {
        currentModule: appState.currentModule,
        completedModules: Array.from(appState.completedModules),
        quizAnswers: appState.quizAnswers
    };
    
    try {
        sessionStorage.setItem('sst-learning-progress', JSON.stringify(progressData));
    } catch (e) {
        // Gracefully handle storage errors
        console.log('Unable to save progress to sessionStorage');
    }
}

function loadProgress() {
    try {
        const savedProgress = sessionStorage.getItem('sst-learning-progress');
        if (savedProgress) {
            const progressData = JSON.parse(savedProgress);
            
            appState.currentModule = progressData.currentModule || 'welcome';
            appState.completedModules = new Set(progressData.completedModules || []);
            appState.quizAnswers = progressData.quizAnswers || {};
            
            updateProgress();
            
            // Restore current module if not welcome
            if (appState.currentModule !== 'welcome') {
                switchToModule(appState.currentModule);
            }
        }
    } catch (e) {
        // Gracefully handle storage errors
        console.log('Unable to load progress from sessionStorage');
    }
}

// Utility functions
function resetProgress() {
    appState.completedModules.clear();
    appState.quizAnswers = {};
    currentQuestionIndex = 0;
    
    updateProgress();
    saveProgress();
    
    // Reset quiz
    document.querySelectorAll('.quiz-question').forEach(q => q.classList.remove('active'));
    document.querySelector('[data-question="0"]').classList.add('active');
    document.getElementById('quizResults').style.display = 'none';
    
    // Clear quiz selections
    document.querySelectorAll('input[type="radio"]').forEach(input => {
        input.checked = false;
    });
    
    switchToModule('welcome');
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    // Allow navigation with arrow keys
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const moduleOrder = ['welcome', 'fundamentals', 'examples', 'backend', 'implementation', 'instances', 'troubleshooting', 'pricing', 'quiz'];
        const currentIndex = moduleOrder.indexOf(appState.currentModule);
        
        let newIndex;
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
            newIndex = currentIndex - 1;
        } else if (e.key === 'ArrowRight' && currentIndex < moduleOrder.length - 1) {
            newIndex = currentIndex + 1;
        }
        
        if (newIndex !== undefined) {
            switchToModule(moduleOrder[newIndex]);
            e.preventDefault();
        }
    }
});

// Smooth scrolling for internal links
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.getAttribute('href') && e.target.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }
});

// Add visual feedback for button interactions
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn')) {
        // Add click animation
        e.target.style.transform = 'scale(0.95)';
        setTimeout(() => {
            e.target.style.transform = '';
        }, 150);
    }
});

// Performance monitoring for learning analytics
const learningAnalytics = {
    moduleStartTimes: {},
    
    startModule(moduleId) {
        this.moduleStartTimes[moduleId] = Date.now();
    },
    
    completeModule(moduleId) {
        if (this.moduleStartTimes[moduleId]) {
            const timeSpent = Date.now() - this.moduleStartTimes[moduleId];
            console.log(`Module ${moduleId} completed in ${Math.round(timeSpent / 1000)} seconds`);
        }
    }
};

// Track module switches for analytics
const originalSwitchToModule = switchToModule;
switchToModule = function(moduleId) {
    learningAnalytics.startModule(moduleId);
    originalSwitchToModule(moduleId);
};

const originalCompleteModule = completeModule;
completeModule = function(moduleId) {
    learningAnalytics.completeModule(moduleId);
    originalCompleteModule(moduleId);
};

// Export functions for global access
window.startLearning = startLearning;
window.completeModule = completeModule;
window.toggleIssue = toggleIssue;
window.nextQuestion = nextQuestion;
window.submitQuiz = submitQuiz;
window.resetProgress = resetProgress;