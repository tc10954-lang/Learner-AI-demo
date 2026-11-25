const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const resetBtn = document.getElementById('resetBtn');

let selectedSubject = null;
let conversationHistory = [];

const subjects = [
  "Maths", "English", "Biology", "Chemistry",
  "Physics", "Geography", "History", "Computer Science"
];

function appendMessage(text, className, isMarkdown = false) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', className);

  if (isMarkdown && typeof marked !== 'undefined') {
    msgDiv.innerHTML = marked.parse(text);
  } else {
    msgDiv.textContent = text;
  }

  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showSubjectPrompt() {
  appendMessage("Hello! I'm Learner AI. Which Subject Do You Need Assistance With?", 'bot-message');

  const optionsDiv = document.createElement('div');
  optionsDiv.classList.add('subject-options');

  subjects.forEach(subject => {
    const btn = document.createElement('button');
    btn.classList.add('subject-btn');
    btn.textContent = subject;
    btn.onclick = () => selectSubject(subject, optionsDiv);
    optionsDiv.appendChild(btn);
  });

  chatMessages.appendChild(optionsDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function selectSubject(subject, optionsDiv) {
  selectedSubject = subject;
  conversationHistory = [];

  optionsDiv.querySelectorAll('button').forEach(b => b.disabled = true);
  appendMessage(subject, 'user-message');
  userInput.placeholder = `Ask a ${subject} question...`;

  appendMessage(`Brilliant! Let's work on **${subject}**. What topic or question would you like help with today?`, 'bot-message', true);
}

async function fetchAIResponse(userText) {
  const typingDiv = document.createElement('div');
  typingDiv.classList.add('typing-indicator');
  typingDiv.innerHTML = '<span></span><span></span><span></span>';
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  conversationHistory.push({ role: "user", content: userText });

  const systemPrompt = `You are Learner AI, a supportive, encouraging tutor for the World Ready programme. The student has selected the subject: ${selectedSubject || 'General Studies'}. Always use British English spelling (e.g., Maths, colour, programme, analyse). Explain concepts clearly step-by-step and keep answers concise.`;

  try {
    const response = await fetch("https://pollinations.ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationHistory
        ],
        model: "openai"
      })
    });

    const aiReply = await response.text();
    typingDiv.remove();

    conversationHistory.push({ role: "assistant", content: aiReply });
    appendMessage(aiReply, 'bot-message', true);
  } catch (err) {
    typingDiv.remove();
    appendMessage("Network error. Please try again in a moment.", 'bot-message');
  }
}

function handleSend() {
  const text = userInput.value.trim();
  if (!text) return;

  appendMessage(text, 'user-message');
  userInput.value = '';

  if (!selectedSubject) {
    appendMessage("Please choose a subject from the options above first so I can tailor my tutoring!", 'bot-message');
    return;
  }

  fetchAIResponse(text);
}

resetBtn.addEventListener('click', () => {
  selectedSubject = null;
  userInput.placeholder = "Select a subject or type a question...";
  showSubjectPrompt();
});

sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSend();
});

showSubjectPrompt();
