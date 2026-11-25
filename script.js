const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const hintBtn = document.getElementById('hintBtn');
const resetBtn = document.getElementById('resetBtn');

let selectedSubject = null;
let currentQuestion = null;
let currentStepIndex = 0;

// Programmed Socratic Question Bank (Method first, never straight answers!)
const showcaseBank = {
  "Maths": [
    {
      question: "Solve: 3x + 5 = 20",
      steps: [
        {
          prompt: "Let's use the **balancing method**—we never jump straight to the answer!\n1. Look at `3x + 5 = 20`.\n2. To get `3x` on its own, we must undo the `+ 5` first.\n\n**Step 1:** Which inverse operation should we apply to both sides?",
          options: [
            { text: "Subtract 5 from both sides", correct: true },
            { text: "Add 5 to both sides", correct: false, feedback: "Careful! Adding 5 would give `3x + 10 = 25`. We need the **opposite** of `+ 5`." },
            { text: "Divide 20 by 3 first", correct: false, feedback: "Hold on! Always undo addition/subtraction **before** dividing by the coefficient." }
          ],
          hint: "💡 **Hint:** The opposite (inverse) of `+ 5` is **subtracting 5**!"
        },
        {
          prompt: "✅ Spot on! Subtracting 5 from both sides leaves us with **`3x = 15`**.\n\n**Step 2:** Now `x` is multiplied by 3. Apply the inverse operation—what is the value of **x**?",
          options: [
            { text: "x = 5", correct: true },
            { text: "x = 12", correct: false, feedback: "Not quite—don't subtract 3! Since `3x` means `3 × x`, divide 15 by 3." },
            { text: "x = 45", correct: false, feedback: "Careful! You multiplied by 3 instead of dividing by 3." }
          ],
          validTyped: ["5", "x = 5", "x=5"],
          hint: "💡 **Hint:** Divide both sides of `3x = 15` by **3** (`15 ÷ 3`)."
        }
      ]
    },
    {
      question: "Find the area of a triangle (base = 8 cm, height = 5 cm)",
      steps: [
        {
          prompt: "Let's apply the **Geometry formula method**:\nA triangle is half of a rectangle with the same base and height.\n\n**Step 1:** Which formula should we use before plugging in numbers?",
          options: [
            { text: "½ × base × height", correct: true },
            { text: "base × height", correct: false, feedback: "Close! `base × height` gives the area of a **rectangle**. Remember a triangle is half of that!" },
            { text: "base + height", correct: false, feedback: "Not quite—adding gives part of a perimeter, not area." }
          ],
          hint: "💡 **Hint:** Multiply the base by the height, then **halve** it (`½ × b × h`)."
        },
        {
          prompt: "✅ Exact right formula! Now substitute `base = 8` and `height = 5` into **`½ × 8 × 5`**.\n\n**Step 2:** What is the final area?",
          options: [
            { text: "20 cm²", correct: true },
            { text: "40 cm²", correct: false, feedback: "You calculated `8 × 5 = 40`, which is the rectangle! Don't forget the **½** step." },
            { text: "13 cm²", correct: false, feedback: "Careful—you added 8 + 5 instead of multiplying and halving." }
          ],
          validTyped: ["20", "20 cm2", "20cm2", "20 cm²"],
          hint: "💡 **Hint:** First work out `8 × 5 = 40`, then divide 40 by **2**."
        }
      ]
    }
  ],
  "English": [
    {
      question: "What is a metaphor?",
      steps: [
        {
          prompt: "Let's analyse this **English** language technique using comparison rules:\n1. Both similes and metaphors compare two things.\n2. The difference is **how** the comparison is phrased.\n\n**Step 1:** How does a metaphor compare two things?",
          options: [
            { text: "Directly, without 'like' or 'as'", correct: true },
            { text: "Using the words 'like' or 'as'", correct: false, feedback: "Aha, common trap! Comparing things using *'like'* or *'as'* is a **simile**, not a metaphor!" },
            { text: "Giving human feelings to weather", correct: false, feedback: "Good guess, but giving human traits to weather is **pathetic fallacy**." }
          ],
          hint: "💡 **Hint:** A simile uses *'like'* or *'as'*—a **metaphor** makes a **direct** comparison without them!"
        },
        {
          prompt: "✅ Brilliant! A metaphor states one thing *is* another directly.\n\n**Step 2:** Which sentence below is a **metaphor**?",
          options: [
            { text: "The classroom was a zoo.", correct: true },
            { text: "He ran as fast as a cheetah.", correct: false, feedback: "Watch out! That sentence uses *'as'*, which makes it a **simile**." },
            { text: "The wind whispered through the trees.", correct: false, feedback: "That gives a human action ('whispered') to the wind—that's **personification**." }
          ],
          validTyped: ["zoo", "the classroom was a zoo", "classroom was a zoo"],
          hint: "💡 **Hint:** Pick the sentence that says one thing **was** another without using *'like'* or *'as'*."
        }
      ]
    },
    {
      question: "How do I structure a P.E.E. analytical paragraph?",
      steps: [
        {
          prompt: "Let's build a strong **English Literature** paragraph step-by-step:\n1. First, make a clear **Point** answering the question.\n2. Next, back up your point.\n\n**Step 1:** What does the first **E** in **P.E.E.** stand for?",
          options: [
            { text: "Evidence (a short quote)", correct: true },
            { text: "Ending (a conclusion)", correct: false, feedback: "Not yet! Before concluding, you need to prove your point with text from the book." },
            { text: "Exaggeration", correct: false, feedback: "Not quite—in essays we back up points with textual proof!" }
          ],
          hint: "💡 **Hint:** How do you prove your Point using the text? With **Evidence**!"
        },
        {
          prompt: "✅ Spot on! Point → Evidence.\n\n**Step 2:** What is the final **E** step that earns top marks?",
          options: [
            { text: "Explain the effect on the reader", correct: true },
            { text: "Erase the quote", correct: false, feedback: "Definitely keep your quote! Now tell the examiner what that quote means." },
            { text: "Enter a new topic", correct: false, feedback: "Stay focused on your current quote first before starting a new paragraph!" }
          ],
          validTyped: ["explain", "explanation", "explain the effect"],
          hint: "💡 **Hint:** After giving a quote, you must **E**xplain what it reveals to the reader."
        }
      ]
    }
  ],
  "Biology": [
    {
      question: "What is the function of mitochondria?",
      steps: [
        {
          prompt: "Let's use the **Cell Structure & Function** method:\n1. Mitochondria are found inside both animal and plant cells.\n2. Inside them, glucose reacts with oxygen.\n\n**Step 1:** What biological process takes place inside the mitochondria?",
          options: [
            { text: "Aerobic respiration", correct: true },
            { text: "Photosynthesis", correct: false, feedback: "Common mix-up! **Photosynthesis** happens in **chloroplasts** (in plants), not mitochondria." },
            { text: "Digestion of food", correct: false, feedback: "Digestion happens in the digestive system—cells break down glucose via respiration." }
          ],
          hint: "💡 **Hint:** Cells use oxygen and glucose to release energy in a process called **aerobic respiration**."
        },
        {
          prompt: "✅ Exactly right! Aerobic respiration happens there.\n\n**Step 2:** What does this process release for the cell to use?",
          options: [
            { text: "Energy", correct: true },
            { text: "Chlorophyll", correct: false, feedback: "Chlorophyll is the green pigment in leaves. Think about why mitochondria are called the 'powerhouse'!" },
            { text: "Carbon dioxide only", correct: false, feedback: "Carbon dioxide is a waste product—what useful thing powers cell activities?" }
          ],
          validTyped: ["energy", "atp"],
          hint: "💡 **Hint:** Mitochondria are known as the powerhouse of the cell because they release **energy**!"
        }
      ]
    }
  ],
  "Chemistry": [
    {
      question: "What is the chemical formula for water?",
      steps: [
        {
          prompt: "Let's build the formula using **Atomic Bonding rules**:\n1. Water is a covalent compound made of two non-metal gases.\n\n**Step 1:** Which two elements bond together to form pure water?",
          options: [
            { text: "Hydrogen and Oxygen", correct: true },
            { text: "Helium and Oxygen", correct: false, feedback: "Close on Oxygen, but Helium is an unreactive noble gas!" },
            { text: "Hydrogen and Carbon", correct: false, feedback: "Hydrogen and Carbon make hydrocarbons (like methane), not water." }
          ],
          hint: "💡 **Hint:** Think of the letter **H** and the letter **O**!"
        },
        {
          prompt: "✅ Spot on! Hydrogen (H) and Oxygen (O).\n\n**Step 2:** Each molecule has **2 Hydrogen** atoms and **1 Oxygen** atom. How do we write its formula?",
          options: [
            { text: "H₂O", correct: true },
            { text: "HO₂", correct: false, feedback: "Check the numbers! The '2' goes right after the element that has two atoms (**H**)." },
            { text: "2HO", correct: false, feedback: "A big '2' in front means two separate molecules—use a subscript after H instead." }
          ],
          validTyped: ["h2o", "h₂o"],
          hint: "💡 **Hint:** Put the `2` right after **H** and before **O**."
        }
      ]
    }
  ]
};

Object.assign(showcaseBank, {
  "Physics": [
    {
      question: "Calculate speed: Distance = 100 m, Time = 20 s",
      steps: [
        {
          prompt: "Let's use the **Physics Formula Method**:\n1. Look at the units: distance is in **metres (m)** and time is in **seconds (s)**.\n2. Speed is measured in **metres per second (m/s)**.\n\n**Step 1:** Which formula connects speed, distance, and time?",
          options: [
            { text: "Speed = Distance ÷ Time", correct: true },
            { text: "Speed = Distance × Time", correct: false, feedback: "Careful! Multiplying distance by time gives `m·s`, not `m/s`. Look at the `/` in `m/s`!" },
            { text: "Speed = Time ÷ Distance", correct: false, feedback: "Flipped! Distance goes on top (`Distance ÷ Time`)." }
          ],
          hint: "💡 **Hint:** 'Per' in *metres **per** second* means **divided by** (`Distance ÷ Time`)."
        },
        {
          prompt: "✅ Brilliant! Now substitute `Distance = 100` and `Time = 20` into **`100 ÷ 20`**.\n\n**Step 2:** What is the final speed?",
          options: [
            { text: "5 m/s", correct: true },
            { text: "2000 m/s", correct: false, feedback: "You multiplied `100 × 20`! Remember our formula from Step 1 is **divide**." },
            { text: "80 m/s", correct: false, feedback: "Careful—you subtracted `100 - 20` instead of dividing." }
          ],
          validTyped: ["5", "5 m/s", "5m/s"],
          hint: "💡 **Hint:** Work out `100 ÷ 20`!"
        }
      ]
    }
  ],
  "Geography": [
    {
      question: "What causes an earthquake?",
      steps: [
        {
          prompt: "Let's trace the **Tectonic Process** step-by-step:\n1. The Earth's crust is split into huge slabs of rock.\n\n**Step 1:** What are these giant slabs of the Earth's crust called?",
          options: [
            { text: "Tectonic plates", correct: true },
            { text: "Convection currents", correct: false, feedback: "Close! Convection currents in the mantle **move** the slabs, while the slabs themselves are **tectonic plates**." },
            { text: "Sedimentary layers", correct: false, feedback: "Sedimentary layers are rock types—the giant moving crust sections are **tectonic plates**." }
          ],
          hint: "💡 **Hint:** They are called **tectonic plates**!"
        },
        {
          prompt: "✅ Spot on! Tectonic plates move slowly and get stuck at boundaries.\n\n**Step 2:** What happens next to trigger the earthquake?",
          options: [
            { text: "Friction builds pressure until the plates suddenly slip", correct: true },
            { text: "Ocean waves push the plates down", correct: false, feedback: "Actually, underwater earthquakes cause tsunamis—not the other way around!" },
            { text: "Heavy rain softens the crust", correct: false, feedback: "Rain causes surface erosion, whereas earthquakes come from deep **tectonic pressure**." }
          ],
          validTyped: ["pressure", "slip", "friction", "plates slip"],
          hint: "💡 **Hint:** Friction causes **pressure** to build up until the rock suddenly **slips**!"
        }
      ]
    }
  ],
  "History": [
    {
      question: "When did World War II end?",
      steps: [
        {
          prompt: "Let's use the **Chronology & Timeline Method**:\n1. World War II began in Europe in **September 1939**.\n2. The global conflict lasted for **6 years**.\n\n**Step 1:** Add 6 years to 1939—which year did World War II end?",
          options: [
            { text: "1945", correct: true },
            { text: "1918", correct: false, feedback: "Good historical date, but **1918** was the end of **World War I**!" },
            { text: "1939", correct: false, feedback: "1939 was when World War II **started**—add 6 years to find the end." }
          ],
          validTyped: ["1945"],
          hint: "💡 **Hint:** `1939 + 6 = ?`"
        },
        {
          prompt: "✅ Exact right year—**1945**!\n\n**Step 2:** Why are there two victory days in 1945 (**VE Day** in May and **VJ Day** in August)?",
          options: [
            { text: "War ended in Europe first, then in Japan later", correct: true },
            { text: "World War I and II ended in the same year", correct: false, feedback: "WWI ended in 1918—VE stands for *Victory in Europe* and VJ stands for *Victory over Japan*!" },
            { text: "The war paused for summer", correct: false, feedback: "No pause! Fighting continued in the Pacific until August 1945." }
          ],
          validTyped: ["europe", "japan", "europe and japan"],
          hint: "💡 **Hint:** **VE** = Victory in **Europe** (May 1945); **VJ** = Victory over **Japan** (August 1945)."
        }
      ]
    }
  ],
  "Computer Science": [
    {
      question: "What is a variable in programming?",
      steps: [
        {
          prompt: "Let's use the **Memory & Data Analogy**:\n1. Imagine writing a game that tracks a player's `score`.\n2. As the player collects coins, `score` changes from `0` to `10` to `20`.\n\n**Step 1:** How does a computer store that changing value?",
          options: [
            { text: "In a labelled memory location (like a named box)", correct: true },
            { text: "As a permanent value that can never change", correct: false, feedback: "Careful! A value that **never** changes is a **constant**, not a variable!" },
            { text: "Inside the monitor screen pixels", correct: false, feedback: "The monitor only displays output—variables live inside the computer's **memory (RAM)**." }
          ],
          hint: "💡 **Hint:** Think of a named **box in memory** that holds a value that can **vary** (change)!"
        },
        {
          prompt: "✅ Brilliant! A variable is a named memory container whose value can change.\n\n**Step 2:** Which line of Python code correctly creates a variable named `score` set to `10`?",
          options: [
            { text: "score = 10", correct: true },
            { text: "10 = score", correct: false, feedback: "Flipped! In programming, the **variable name** always goes on the **left** of the `=` sign." },
            { text: "score == 10", correct: false, feedback: "Watch out! Double equals (`==`) **compares** two values—single equals (`=`) **assigns** a value." }
          ],
          validTyped: ["score = 10", "score=10"],
          hint: "💡 **Hint:** Put the variable name on the left and use a single `=` sign: `score = 10`."
        }
      ]
    }
  ]
});
const subjects = Object.keys(showcaseBank);

function appendMessage(text, className, isMarkdown = false) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', className);
  if (isMarkdown) {
    msgDiv.innerHTML = text
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
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
  currentQuestion = null;
  currentStepIndex = 0;

  optionsDiv.querySelectorAll('button').forEach(b => b.disabled = true);
  appendMessage(subject, 'user-message');

  showQuestionOptions(subject);
}

function showQuestionOptions(subject) {
  const questions = showcaseBank[subject] || [];
  appendMessage(`Great! Choose a **${subject}** question below to see how I guide you through the learning method:`, 'bot-message', true);

  const qDiv = document.createElement('div');
  qDiv.classList.add('subject-options');

  questions.forEach(qObj => {
    const btn = document.createElement('button');
    btn.classList.add('subject-btn');
    btn.textContent = qObj.question;
    btn.onclick = () => startQuestion(qObj, qDiv);
    qDiv.appendChild(btn);
  });

  chatMessages.appendChild(qDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function startQuestion(qObj, qDiv) {
  currentQuestion = qObj;
  currentStepIndex = 0;
  qDiv.querySelectorAll('button').forEach(b => b.disabled = true);
  appendMessage(qObj.question, 'user-message');
  renderCurrentStep();
}

function renderCurrentStep() {
  const step = currentQuestion.steps[currentStepIndex];
  appendMessage(step.prompt, 'bot-message', true);

  if (step.options && step.options.length > 0) {
    const optDiv = document.createElement('div');
    optDiv.classList.add('subject-options');

    step.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.classList.add('subject-btn');
      btn.textContent = opt.text;
      btn.onclick = () => handleOptionChoice(opt, optDiv);
      optDiv.appendChild(btn);
    });

    chatMessages.appendChild(optDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

function handleOptionChoice(opt, optDiv) {
  appendMessage(opt.text, 'user-message');

  if (opt.correct) {
    optDiv.querySelectorAll('button').forEach(b => b.disabled = true);
    advanceStep();
  } else {
    // Disable only the wrong button clicked so the visitor can try again!
    optDiv.querySelectorAll('button').forEach(b => {
      if (b.textContent === opt.text) b.disabled = true;
    });
    appendMessage(`❌ ${opt.feedback}\n\nTry picking another method option above!`, 'bot-message', true);
  }
}

function advanceStep() {
  currentStepIndex++;
  if (currentStepIndex < currentQuestion.steps.length) {
    renderCurrentStep();
  } else {
    appendMessage(`🎉 **Well done!** You solved **"${currentQuestion.question}"** by mastering the method step-by-step!\n\nWant to try another **${selectedSubject}** question or click **Change Subject** at the top?`, 'bot-message', true);
    currentQuestion = null;
    showQuestionOptions(selectedSubject);
  }
}

function handleTypedSend() {
  const text = userInput.value.trim();
  if (!text) return;
  appendMessage(text, 'user-message');
  userInput.value = '';

  if (!selectedSubject) {
    appendMessage("Please choose a subject from the buttons above first!", 'bot-message');
    return;
  }

  if (!currentQuestion) {
    appendMessage(`Please click one of the **${selectedSubject}** questions above to start a guided walkthrough!`, 'bot-message', true);
    return;
  }

  const step = currentQuestion.steps[currentStepIndex];
  const lower = text.toLowerCase();

  // Check if typed text matches an option or validTyped answer
  const matchedOpt = (step.options || []).find(o => o.text.toLowerCase() === lower);
  const matchedTyped = (step.validTyped || []).some(v => lower === v.toLowerCase() || lower.includes(v.toLowerCase()));

  if ((matchedOpt && matchedOpt.correct) || matchedTyped) {
    // Disable any active option buttons
    const allOptGroups = chatMessages.querySelectorAll('.subject-options');
    if (allOptGroups.length) {
      allOptGroups[allOptGroups.length - 1].querySelectorAll('button').forEach(b => b.disabled = true);
    }
    advanceStep();
  } else if (matchedOpt && !matchedOpt.correct) {
    appendMessage(`❌ ${matchedOpt.feedback}`, 'bot-message', true);
  } else {
    appendMessage("Good effort! Pick one of the method choices above (or click **💡 Hint** if you need a nudge).", 'bot-message', true);
  }
}

hintBtn.addEventListener('click', () => {
  if (!currentQuestion) {
    appendMessage("Select a subject and click a question first, then use **💡 Hint** anytime you want a nudge!", 'bot-message', true);
    return;
  }
  const step = currentQuestion.steps[currentStepIndex];
  appendMessage(step.hint, 'bot-message', true);
});

resetBtn.addEventListener('click', () => {
  selectedSubject = null;
  currentQuestion = null;
  currentStepIndex = 0;
  showSubjectPrompt();
});

sendBtn.addEventListener('click', handleTypedSend);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleTypedSend();
});

showSubjectPrompt();
