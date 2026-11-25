const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const hintBtn = document.getElementById('hintBtn');
const resetBtn = document.getElementById('resetBtn');

let selectedSubject = null;
let conversationHistory = [];
let activeMathProblem = null;

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
  activeMathProblem = null;
  optionsDiv.querySelectorAll('button').forEach(b => b.disabled = true);
  appendMessage(subject, 'user-message');
  userInput.placeholder = `Type a ${subject} question...`;
  appendMessage(`Brilliant! Let's work on **${subject}**. Share a question or problem, and I'll guide you through the method step-by-step.`, 'bot-message', true);
}

// Safely calculates a basic arithmetic expression (e.g., "1 + 1" -> 2)
function evaluateExpression(expr) {
  const cleaned = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').trim();
  if (/^[0-9+\-*/().\s]+$/.test(cleaned) && /[+\-*/]/.test(cleaned)) {
    try {
      const val = Function(`"use strict"; return (${cleaned})`)();
      return Number.isFinite(val) ? val : null;
    } catch { return null; }
  }
  return null;
}

// Smart Socratic tutor that checks answers without giving them away first
function getSmartSocraticReply(userText, subject, history) {
  if (subject === "Maths") {
    // Check if the user just typed a new arithmetic expression (like "1 + 1")
    const possibleAnswer = evaluateExpression(userText);
    if (possibleAnswer !== null && !userText.includes("=")) {
      activeMathProblem = { expr: userText.trim(), answer: possibleAnswer };
      const nums = userText.match(/\d+(\.\d+)?/g) || [];
      return `Let's look at the numbers **${nums.join(' and ')}** in your problem:\n1. Identify what the question is asking you to find.\n2. Choose the right operation (**+**, **−**, **×**, or **÷**).\n\nWhich operation connects **${nums[0]}** and **${nums[1]}**, and why?`;
    }

    // If we are actively guiding a Maths problem, check if the student got the right answer!
    if (activeMathProblem !== null) {
      const userNums = userText.match(/-?\d+(\.\d+)?/g);
      if (userNums) {
        const lastNum = parseFloat(userNums[userNums.length - 1]);
        if (Math.abs(lastNum - activeMathProblem.answer) < 0.0001) {
          const solvedExpr = activeMathProblem.expr;
          activeMathProblem = null; // Reset for next question
          return `✅ **Correct! Well done!** You worked out **${solvedExpr}** using the right method.\n\nReady to try another Maths problem?`;
        } else if (!userText.includes(activeMathProblem.expr)) {
          return `Not quite! Check your calculation again—remember to apply the operation step-by-step to **${activeMathProblem.expr}**.\n\nHave another go! What do you get?`;
        }
      }
      return `Good thinking! Now take that operation and apply it to **${activeMathProblem.expr}**.\n\nWhat final value do you get?`;
    }

    if (userText.includes("=")) {
      return `Let's solve **${userText}** using the **balancing method**:\n1. Look at what is happening to the unknown letter.\n2. Use the **inverse (opposite) operation** on both sides.\n\nWhat is the very first operation you should undo?`;
    }

    return "Let's break this **Maths** problem down:\n1. **Identify** what information you are given.\n2. **Choose** the right operation or formula.\n\nWhat is the first step you think we should take?";
  }

  // Non-Maths subjects
  const turn = history.filter(m => m.role === "user").length;
  if (turn > 1) {
    return `✅ **Great effort!** You're on the right track for **${subject}**.\n\nHow would you put that together into a complete, clear explanation?`;
  }
  return `Great **${subject}** question! Instead of giving the answer straight away, let's break it down:\n1. **Identify** the key term or concept.\n2. **Explain** how or why it works.\n\nIn your own words, what is the main idea here?`;
}

async function fetchAIResponse(userText) {
  const typingDiv = document.createElement('div');
  typingDiv.classList.add('typing-indicator');
  typingDiv.innerHTML = '<span></span><span></span><span></span>';
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  conversationHistory.push({ role: "user", content: userText });

  const systemPrompt = `You are Learner AI for the World Ready programme, tutoring ${selectedSubject || 'General Studies'}.
CORE RULE — NEVER GIVE THE FINAL ANSWER FIRST:
- Do NOT solve the problem for the student or state the final answer upfront.
- Teach the learning method step-by-step and ask ONE guiding question at a time.
- When the student replies with the CORRECT final answer, clearly praise them with "✅ Correct! Well done!" and confirm why their method worked.
- If they are incorrect, gently point out the mistake without giving the answer and let them retry.
- Use British English spelling (e.g., Maths, colour, programme, analyse).`;

  try {
    if (typeof puter === 'undefined') throw new Error("No Puter");
    if (!puter.auth.isSignedIn()) {
      await puter.auth.signIn({ attempt_temp_user_creation: true });
    }

    const response = await puter.ai.chat([
      { role: "system", content: systemPrompt },
      ...conversationHistory
    ], { model: "gpt-4o-mini" });

    const aiReply = response?.message?.content || response.toString();
    typingDiv.remove();
    conversationHistory.push({ role: "assistant", content: aiReply });
    appendMessage(aiReply, 'bot-message', true);
  } catch (err) {
    setTimeout(() => {
      typingDiv.remove();
      const reply = getSmartSocraticReply(userText, selectedSubject, conversationHistory);
      conversationHistory.push({ role: "assistant", content: reply });
      appendMessage(reply, 'bot-message', true);
    }, 500);
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
  if (activeMathProblem) {
    appendMessage(`💡 **Hint:** Look at the symbol in **${activeMathProblem.expr}** and combine the two numbers step-by-step. Give it a try!`, 'bot-message', true);
    return;
  }
  handleSend("I'm stuck. Give me a small hint on the method without telling me the answer.");
});

resetBtn.addEventListener('click', () => {
  selectedSubject = null;
  activeMathProblem = null;
  userInput.placeholder = "Select a subject first...";
  showSubjectPrompt();
});

sendBtn.addEventListener('click', () => handleSend());
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSend();
});

showSubjectPrompt();
