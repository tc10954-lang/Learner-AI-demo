const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const hintBtn = document.getElementById('hintBtn');
const resetBtn = document.getElementById('resetBtn');

const calcToggleBtn = document.getElementById('calcToggleBtn');
const calcModal = document.getElementById('calcModal');
const closeCalcBtn = document.getElementById('closeCalcBtn');
const calcDisplay = document.getElementById('calcDisplay');
const insertCalcBtn = document.getElementById('insertCalcBtn');

let selectedSubject = null;
let conversationHistory = [];
let calcExpression = "";

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
  appendMessage("Hello! I'm **Learner AI**—I won't just hand you the answer, I'll guide you on *how* to figure it out yourself. Which Subject Do You Need Assistance With?", 'bot-message', true);

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
  userInput.placeholder = `Share a ${subject} problem you're working on...`;

  if (subject === "Maths") {
    calcToggleBtn.classList.remove('hidden');
    appendMessage("Brilliant! Let's work on **Maths** together. Share your problem and what you've tried so far—and use the **🧮 Calc** button at the top whenever you need a calculator!", 'bot-message', true);
  } else {
    calcToggleBtn.classList.add('hidden');
    appendMessage(`Brilliant! Let's tackle **${subject}**. Share the question or concept you're working on, and we'll break down the method step-by-step.`, 'bot-message', true);
  }
}

async function fetchAIResponse(userText) {
  const typingDiv = document.createElement('div');
  typingDiv.classList.add('typing-indicator');
  typingDiv.innerHTML = '<span></span><span></span><span></span>';
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  conversationHistory.push({ role: "user", content: userText });

  const systemPrompt = `You are Learner AI for the World Ready programme, specialising in ${selectedSubject || 'General Studies'}.
CORE RULE — NEVER GIVE THE FINAL ANSWER:
- Do NOT solve the problem for the student or state the final answer, even if they beg or ask directly.
- Instead, teach the learning method: break the problem into small steps, explain the underlying rule or strategy, and ask ONE guiding question at a time so the student discovers the answer themselves.
- Always use British English spelling (e.g., Maths, colour, programme, analyse, factorise).
- Keep responses concise, encouraging, and easy to follow.`;

  try {
    const response = await fetch("https://pollinations.ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "system", content: systemPrompt }, ...conversationHistory],
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

function handleSend(customText = null) {
  const text = customText || userInput.value.trim();
  if (!text) return;

  appendMessage(text, 'user-message');
  if (!customText) userInput.value = '';

  if (!selectedSubject) {
    appendMessage("Please choose a subject from the options above first so I can guide you properly!", 'bot-message');
    return;
  }
  fetchAIResponse(text);
}

hintBtn.addEventListener('click', () => {
  if (!selectedSubject || conversationHistory.length === 0) {
    appendMessage("Share a question first, and click **💡 Hint** whenever you get stuck on a step!", 'bot-message', true);
    return;
  }
  handleSend("I'm stuck on this step. Can you give me a small hint on what method to use next without telling me the answer?");
});

calcToggleBtn.addEventListener('click', () => calcModal.style.display = 'flex');
closeCalcBtn.addEventListener('click', () => calcModal.style.display = 'none');

document.querySelectorAll('.calc-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const val = btn.dataset.val;
    if (val === 'C') {
      calcExpression = "";
      calcDisplay.value = "0";
    } else if (val === 'DEL') {
      calcExpression = calcExpression.slice(0, -1);
      calcDisplay.value = calcExpression || "0";
    } else if (val === '=') {
      try {
        if (/^[0-9+\-*/().\s]+$/.test(calcExpression)) {
          const result = Function(`"use strict"; return (${calcExpression})`)();
          calcDisplay.value = Number.isFinite(result) ? result : "Error";
          calcExpression = String(calcDisplay.value);
        } else {
          calcDisplay.value = "Error";
          calcExpression = "";
        }
      } catch {
        calcDisplay.value = "Error";
        calcExpression = "";
      }
    } else {
      calcExpression += val;
      calcDisplay.value = calcExpression;
    }
  });
});

insertCalcBtn.addEventListener('click', () => {
  if (calcDisplay.value && calcDisplay.value !== "Error") {
    userInput.value += (userInput.value ? " " : "") + calcDisplay.value;
    calcModal.style.display = 'none';
    userInput.focus();
  }
});

resetBtn.addEventListener('click', () => {
  selectedSubject = null;
  calcToggleBtn.classList.add('hidden');
  userInput.placeholder = "Select a subject or type a question...";
  showSubjectPrompt();
});

sendBtn.addEventListener('click', () => handleSend());
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSend();
});

showSubjectPrompt();
