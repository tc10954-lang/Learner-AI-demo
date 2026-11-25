const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const hintBtn = document.getElementById('hintBtn');
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
  if (isMarkdown) {
    msgDiv.innerHTML = text
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
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
  userInput.placeholder = `Type a ${subject} question...`;
  appendMessage(`Brilliant! Let's work on **${subject}**. Share a question or problem, and I'll guide you through the method step-by-step.`, 'bot-message', true);
}

// Built-in backup Socratic tutor in case external AI is blocked by Wi-Fi
function getBackupSocraticReply(userText, subject) {
  const lower = userText.toLowerCase();
  if (subject === "Maths") {
    if (lower.includes("=")) {
      return "Let's solve this equation using the **balancing method**:\n1. Look at the numbers on the same side as the unknown letter.\n2. Do the **inverse (opposite) operation** to both sides.\n\nWhat is the first step you would take to get the variable on its own?";
    }
    return "Let's break this **Maths** problem down using the **RUCSAC** method:\n- **Read** and **Underline** the key numbers.\n- **Choose** the right operation (+, −, ×, ÷).\n\nWhich operation do you think we should start with here, and why?";
  }
  return `Good question for **${subject}**! Remember, I won't give the straight answer—let's break it down:\n1. Identify the **key term or rule** in your question.\n2. Think about what you already know about this topic.\n\nWhat do you think the first step or main idea is?`;
}

async function fetchAIResponse(userText) {
  const typingDiv = document.createElement('div');
  typingDiv.classList.add('typing-indicator');
  typingDiv.innerHTML = '<span></span><span></span><span></span>';
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  conversationHistory.push({ role: "user", content: userText });

  const systemPrompt = `You are Learner AI for the World Ready programme, tutoring ${selectedSubject || 'General Studies'}.
CORE RULE — NEVER GIVE THE FINAL ANSWER:
- Do NOT solve the problem for the student or state the final answer, even if they ask directly.
- Teach the learning method: break the problem into small steps, explain the rule or formula, and ask ONE guiding question at a time.
- Use British English spelling (e.g., Maths, colour, programme, analyse).`;

  try {
    if (typeof puter === 'undefined') throw new Error("Puter not loaded");

    const response = await puter.ai.chat([
      { role: "system", content: systemPrompt },
      ...conversationHistory
    ], { model: "gpt-4o-mini" });

    const aiReply = response?.message?.content || response.toString();
    typingDiv.remove();
    conversationHistory.push({ role: "assistant", content: aiReply });
    appendMessage(aiReply, 'bot-message', true);
  } catch (err) {
    // Seamless fallback so it NEVER shows "Network Error"
    setTimeout(() => {
      typingDiv.remove();
      const backupReply = getBackupSocraticReply(userText, selectedSubject);
      conversationHistory.push({ role: "assistant", content: backupReply });
      appendMessage(backupReply, 'bot-message', true);
    }, 600);
  }
}

function handleSend(customText = null) {
  const text = customText || userInput.value.trim();
  if (!text) return;

  appendMessage(text, 'user-message');
  if (!customText) userInput.value = '';

  if (!selectedSubject) {
    appendMessage("Please click one of the subjects above first!", 'bot-message');
    return;
  }
  fetchAIResponse(text);
}

hintBtn.addEventListener('click', () => {
  if (!selectedSubject || conversationHistory.length === 0) {
    appendMessage("Type a question first, then click **💡 Hint** if you get stuck!", 'bot-message', true);
    return;
  }
  handleSend("I'm stuck. Give me a small hint on the method without telling me the answer.");
});

resetBtn.addEventListener('click', () => {
  selectedSubject = null;
  userInput.placeholder = "Select a subject first...";
  showSubjectPrompt();
});

sendBtn.addEventListener('click', () => handleSend());
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSend();
});

showSubjectPrompt();
