import { SubjectType, LearningStyle, DifficultyLevel, TutorMessage, BoardType, StreamType, ClassLevel } from '../types';

export interface AITutorRequest {
  question: string;
  subject: SubjectType;
  learningStyle: LearningStyle;
  gradeLevel: ClassLevel | string;
  board?: BoardType;
  stream?: StreamType;
  difficulty: DifficultyLevel;
  chapter?: string;
  topic?: string;
  uploadedContext?: {
    fileName: string;
    fileType: string;
    extractedText: string;
  } | null;
  conversationHistory?: TutorMessage[];
  offlineMode?: boolean;
}

export type ResponseType = 'conceptual' | 'mathematical' | 'programming' | 'document' | 'general';

interface DetectedTopic {
  subject: SubjectType;
  topicName: string;
  responseType: ResponseType;
  confidence: number;
}

// Subject taxonomy and intent dictionaries
const TOPIC_PATTERNS: {
  subject: SubjectType;
  topic: string;
  responseType: ResponseType;
  keywords: string[];
}[] = [
  // MATHEMATICS / GANIT
  {
    subject: 'Mathematics',
    topic: 'Linear Equations & Arithmetic Solving',
    responseType: 'mathematical',
    keywords: ['solve', '2x', '3x', '4x', '5x', 'equation', 'linear', 'variable', 'value of x', 'x +', 'x -', 'solve for x', 'rekhik samikaran']
  },
  {
    subject: 'Mathematics',
    topic: 'Quadratic Equations',
    responseType: 'mathematical',
    keywords: ['quadratic', 'roots', 'parabola', 'discriminant', 'b^2 - 4ac', 'b2 - 4ac', 'ax^2', 'ax2', 'dvighat']
  },
  {
    subject: 'Mathematics',
    topic: 'Trigonometry & Heights and Distances',
    responseType: 'mathematical',
    keywords: ['trigonometry', 'sin theta', 'cos theta', 'tan theta', 'sin(x)', 'cos(x)', 'hypotenuse', 'trigonometric identity', 'trikonmiti']
  },
  {
    subject: 'Mathematics',
    topic: 'Calculus: Derivatives & Integrals',
    responseType: 'mathematical',
    keywords: ['calculus', 'derivative', 'differentiation', 'integral', 'integration', 'dx', 'dy/dx', 'limits and derivatives', 'continuity']
  },
  {
    subject: 'Mathematics',
    topic: 'Matrices & Determinants',
    responseType: 'mathematical',
    keywords: ['matrix', 'matrices', 'determinant', 'row matrix', 'column matrix', 'inverse of matrix', 'eigenvalue']
  },
  {
    subject: 'Mathematics',
    topic: 'Pythagoras Theorem & Geometry',
    responseType: 'mathematical',
    keywords: ['pythagoras', 'pythagorean', 'hypotenuse', 'right angled triangle', 'right triangle', 'triangle', 'a^2 + b^2', 'geometry']
  },
  {
    subject: 'Mathematics',
    topic: 'Probability & Statistics',
    responseType: 'mathematical',
    keywords: ['probability', 'favorable outcomes', 'dice', 'coin toss', 'sample space', 'chance', 'statistics', 'mean', 'median', 'mode']
  },
  {
    subject: 'Mathematics',
    topic: 'Polynomials & Factoring',
    responseType: 'mathematical',
    keywords: ['polynomial', 'factorisation', 'factorization', 'factorize', 'remainder theorem', 'algebraic identities']
  },

  // CHEMISTRY
  {
    subject: 'Chemistry',
    topic: 'Functional Groups & Organic Chemistry',
    responseType: 'conceptual',
    keywords: ['functional group', 'functional groups', 'organic chemistry', 'alcohol', 'aldehyde', 'ketone', 'carboxylic acid', 'ester', 'alkane', 'alkene', 'alkyne', 'iupac', 'homologous series']
  },
  {
    subject: 'Chemistry',
    topic: 'Chemical Reactions & Equations',
    responseType: 'conceptual',
    keywords: ['chemical reaction', 'chemical reactions', 'chemical equation', 'reactants', 'products', 'redox', 'oxidation', 'reduction', 'precipitation', 'displacement reaction', 'decomposition']
  },
  {
    subject: 'Chemistry',
    topic: 'Acids, Bases & Salts',
    responseType: 'conceptual',
    keywords: ['acid', 'acids', 'base', 'bases', 'ph scale', 'neutralization', 'litmus', 'hydrochloric acid', 'sodium hydroxide', 'salts']
  },
  {
    subject: 'Chemistry',
    topic: 'Atomic Structure & Chemical Bonding',
    responseType: 'conceptual',
    keywords: ['covalent bond', 'ionic bond', 'chemical bond', 'valence electrons', 'octet rule', 'lewis structure', 'hybridization', 'electronegativity', 'periodic table', 'periodic classification']
  },
  {
    subject: 'Chemistry',
    topic: 'Electrochemistry & Solutions',
    responseType: 'conceptual',
    keywords: ['electrochemistry', 'galvanic cell', 'electrolytic cell', 'molarity', 'molality', 'colligative properties', 'nernst equation', 'rate of reaction']
  },

  // PHYSICS
  {
    subject: 'Physics',
    topic: 'Kinematics & Laws of Motion',
    responseType: 'conceptual',
    keywords: ['kinematics', 'velocity', 'acceleration', 'equations of motion', 'v = u + at', 'displacement', 'inertia', 'momentum', 'newton’s second law', 'newton\'s laws', 'f = ma']
  },
  {
    subject: 'Physics',
    topic: 'Electricity, Ohm’s Law & Circuits',
    responseType: 'conceptual',
    keywords: ['ohm\'s law', 'ohms law', 'resistance', 'electric current', 'potential difference', 'resistors in series', 'resistors in parallel', 'circuit', 'voltage', 'v = ir']
  },
  {
    subject: 'Physics',
    topic: 'Optics: Reflection & Refraction',
    responseType: 'conceptual',
    keywords: ['optics', 'reflection', 'refraction', 'snell\'s law', 'focal length', 'concave mirror', 'convex lens', 'refractive index', 'ray diagram']
  },
  {
    subject: 'Physics',
    topic: 'Gravitation & Gravitational Force',
    responseType: 'conceptual',
    keywords: ['gravitation', 'gravity', 'universal law of gravitation', 'free fall', 'g = 9.8', 'mass and weight']
  },
  {
    subject: 'Physics',
    topic: 'Work, Energy & Thermodynamics',
    responseType: 'conceptual',
    keywords: ['kinetic energy', 'potential energy', 'work done', 'conservation of energy', 'thermodynamics', 'first law of thermodynamics', 'entropy']
  },

  // BIOLOGY
  {
    subject: 'Biology',
    topic: 'Photosynthesis & Plant Physiology',
    responseType: 'conceptual',
    keywords: ['photosynthesis', 'chlorophyll', 'chloroplast', 'stomata', 'light reaction', 'calvin cycle', 'glucose', 'transpiration', 'xylem', 'phloem']
  },
  {
    subject: 'Biology',
    topic: 'Human Physiology & Life Processes',
    responseType: 'conceptual',
    keywords: ['digestive system', 'digestion', 'stomach', 'small intestine', 'enzymes', 'pepsin', 'bile', 'circulatory system', 'heart', 'respiration', 'nephron', 'kidney']
  },
  {
    subject: 'Biology',
    topic: 'Cell Biology & Organelles',
    responseType: 'conceptual',
    keywords: ['cell', 'mitochondria', 'nucleus', 'cell membrane', 'ribosome', 'cytoplasm', 'mitosis', 'meiosis', 'plant cell', 'animal cell']
  },
  {
    subject: 'Biology',
    topic: 'Genetics, DNA & Heredity',
    responseType: 'conceptual',
    keywords: ['genetics', 'dna', 'rna', 'mendel', 'heredity', 'chromosome', 'allele', 'dominant trait', 'recessive trait', 'punnett square', 'evolution']
  },

  // SCIENCE (Unified Middle School)
  {
    subject: 'Science',
    topic: 'Photosynthesis & Plant Biology',
    responseType: 'conceptual',
    keywords: ['photosynthesis', 'chlorophyll', 'chloroplast', 'stomata', 'light reaction', 'dark reaction', 'glucose', 'calvin cycle', 'autotroph']
  },
  {
    subject: 'Science',
    topic: 'Newton’s Laws of Motion',
    responseType: 'conceptual',
    keywords: ['newton', 'newton’s second law', 'newtons second law', 'second law', 'first law', 'third law', 'f = ma', 'inertia', 'momentum', 'acceleration']
  },
  {
    subject: 'Science',
    topic: 'Human Digestive System',
    responseType: 'conceptual',
    keywords: ['digestive system', 'digestion', 'stomach', 'small intestine', 'enzymes', 'pepsin', 'bile', 'alimentary canal', 'peristalsis', 'saliva']
  },
  {
    subject: 'Science',
    topic: 'Atomic Structure & Chemical Bonding',
    responseType: 'conceptual',
    keywords: ['atom', 'atomic', 'electron', 'proton', 'neutron', 'nucleus', 'valence', 'chemical reaction']
  },

  // COMPUTER SCIENCE
  {
    subject: 'Computer Science',
    topic: 'Binary Trees & Tree Hierarchies',
    responseType: 'programming',
    keywords: ['binary tree', 'bst', 'tree traversal', 'inorder', 'preorder', 'postorder', 'root node', 'leaf node', 'balanced tree']
  },
  {
    subject: 'Computer Science',
    topic: 'Recursion & Base Cases',
    responseType: 'programming',
    keywords: ['recursion', 'recursive', 'base case', 'call stack', 'factorial', 'fibonacci', 'stack overflow']
  },
  {
    subject: 'Computer Science',
    topic: 'Arrays & Linear Data Structures',
    responseType: 'programming',
    keywords: ['array', 'arrays', 'index', 'element', 'contiguous', 'dynamic array', 'vector', 'list indexing']
  },
  {
    subject: 'Computer Science',
    topic: 'Loops & Control Flow (Python / General)',
    responseType: 'programming',
    keywords: ['loop', 'for loop', 'while loop', 'python loop', 'iteration', 'nested loop', 'infinite loop', 'break', 'continue']
  },
  {
    subject: 'Computer Science',
    topic: 'Time and Space Complexity (Big O)',
    responseType: 'programming',
    keywords: ['time complexity', 'space complexity', 'big o', 'o(n)', 'o(1)', 'o(n^2)', 'asymptotic', 'efficiency', 'worst case']
  },

  // COMMERCE SUBJECTS
  {
    subject: 'Accountancy',
    topic: 'Accounting Equation & Double Entry System',
    responseType: 'conceptual',
    keywords: ['accounting equation', 'assets = liabilities', 'debit and credit', 'journal entry', 'ledger', 'trial balance', 'balance sheet']
  },
  {
    subject: 'Business Studies',
    topic: 'Principles of Management & Business Functions',
    responseType: 'conceptual',
    keywords: ['principles of management', 'fayol', 'taylor', 'planning', 'organizing', 'staffing', 'directing', 'controlling', 'marketing mix']
  },
  {
    subject: 'Economics',
    topic: 'Demand, Supply & Macroeconomic Fundamentals',
    responseType: 'conceptual',
    keywords: ['law of demand', 'elasticity of demand', 'supply', 'market equilibrium', 'national income', 'gdp', 'inflation', 'fiscal policy']
  },

  // ENGLISH
  {
    subject: 'English',
    topic: 'Nouns, Pronouns & Parts of Speech',
    responseType: 'conceptual',
    keywords: ['noun', 'pronoun', 'parts of speech', 'proper noun', 'common noun', 'collective noun', 'relative pronoun', 'antecedent']
  },
  {
    subject: 'English',
    topic: 'Active and Passive Voice',
    responseType: 'conceptual',
    keywords: ['active and passive', 'active voice', 'passive voice', 'convert this sentence', 'subject verb object', 'by the agent']
  },
  {
    subject: 'English',
    topic: 'Figures of Speech: Metaphors & Similes',
    responseType: 'conceptual',
    keywords: ['metaphor', 'simile', 'figure of speech', 'imagery', 'personification', 'alliteration', 'hyperbole']
  },
  {
    subject: 'English',
    topic: 'Sentence Correction & Grammar Rules',
    responseType: 'conceptual',
    keywords: ['correct this sentence', 'sentence correction', 'subject-verb agreement', 'grammar', 'tense', 'preposition', 'punctuation']
  },

  // SOCIAL SCIENCE / SAMAJIK VIGYAN
  {
    subject: 'Social Science',
    topic: 'The Indian Constitution & Rights',
    responseType: 'conceptual',
    keywords: ['indian constitution', 'constitution', 'preamble', 'fundamental rights', 'dr br ambedkar', 'constituent assembly', 'directive principles', 'samvidhan']
  },
  {
    subject: 'Social Science',
    topic: 'Democracy & Electoral Politics',
    responseType: 'conceptual',
    keywords: ['democracy', 'democratic', 'rule of law', 'free and fair elections', 'universal adult franchise', 'dictatorship', 'loktantra']
  },
  {
    subject: 'Social Science',
    topic: 'Causes of the French Revolution',
    responseType: 'conceptual',
    keywords: ['french revolution', 'louis xvi', 'three estates', 'bastille', 'third estate', 'reign of terror', 'guillotine', 'bourgeoisie']
  },
  {
    subject: 'Social Science',
    topic: 'The Role of the Parliament & Government',
    responseType: 'conceptual',
    keywords: ['parliament', 'lok sabha', 'rajya sabha', 'prime minister', 'president', 'separation of powers', 'legislature', 'executive', 'judiciary', 'sansad']
  }
];

/**
 * Intelligent topic & subject detector
 */
export function detectQuestionTopic(
  question: string,
  selectedSubject: SubjectType,
  hasUploadedMaterial = false
): DetectedTopic {
  const lowerQ = question.toLowerCase().trim();

  // 1. Check if user query directly asks about uploaded document
  if (
    hasUploadedMaterial &&
    (lowerQ.includes('explain this') ||
      lowerQ.includes('summarize') ||
      lowerQ.includes('summary') ||
      lowerQ.includes('question') ||
      lowerQ.includes('pdf') ||
      lowerQ.includes('document') ||
      lowerQ.includes('this material') ||
      lowerQ.includes('notes') ||
      lowerQ.includes('points from this') ||
      lowerQ.includes('chapter'))
  ) {
    return {
      subject: selectedSubject,
      topicName: 'Uploaded Document Review',
      responseType: 'document',
      confidence: 0.95
    };
  }

  // 2. Exact or partial match with our domain taxonomy
  let bestMatch: (typeof TOPIC_PATTERNS)[0] | null = null;
  let maxScore = 0;

  for (const pattern of TOPIC_PATTERNS) {
    let score = 0;
    for (const kw of pattern.keywords) {
      if (lowerQ.includes(kw)) {
        score += kw.length; // Longer keyword match holds higher weight
      }
    }
    // Boost if matches currently selected subject
    if (pattern.subject === selectedSubject && score > 0) {
      score += 4;
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = pattern;
    }
  }

  if (bestMatch && maxScore >= 3) {
    return {
      subject: bestMatch.subject,
      topicName: bestMatch.topic,
      responseType: bestMatch.responseType,
      confidence: Math.min(1.0, maxScore / 10)
    };
  }

  // 3. Fallback heuristic detection based on grammatical / mathematical tokens
  if (/[\d\+\-\*\/\=xXyYzZ\^]{3,}/.test(lowerQ) || lowerQ.includes('solve') || lowerQ.includes('find the value')) {
    return {
      subject: 'Mathematics',
      topicName: 'Algebraic & Mathematical Calculation',
      responseType: 'mathematical',
      confidence: 0.7
    };
  }

  if (lowerQ.includes('code') || lowerQ.includes('program') || lowerQ.includes('function') || lowerQ.includes('algorithm')) {
    return {
      subject: 'Computer Science',
      topicName: 'Programming & Logic',
      responseType: 'programming',
      confidence: 0.7
    };
  }

  return {
    subject: selectedSubject,
    topicName: `${selectedSubject} Concept Analysis`,
    responseType: 'conceptual',
    confidence: 0.5
  };
}

/**
 * Generate 4 targeted, context-relevant follow-up questions
 */
export function generateFollowUpQuestions(
  topicName: string,
  subject: SubjectType,
  hasUploadedDoc = false
): string[] {
  if (hasUploadedDoc) {
    return [
      'Can you summarize the most important points from this document?',
      'What are the key terms introduced in this material?',
      'Give me 3 practice quiz questions based on this document.',
      'Explain the difficult concepts in this file in simple words.'
    ];
  }

  const t = topicName.toLowerCase();

  // Mathematics
  if (t.includes('linear equation') || t.includes('solve')) {
    return [
      'How can I verify my answer by substituting x back into the equation?',
      'Can you show me another linear equation problem with brackets?',
      'How does this differ from solving a quadratic equation?',
      'Give me a word problem based on linear equations.'
    ];
  }
  if (t.includes('quadratic')) {
    return [
      'How does the discriminant (D = b² - 4ac) decide the nature of roots?',
      'What is the difference between factoring and using the quadratic formula?',
      'Can you give me a real-world example of a parabolic curve?',
      'Give me a Class 9 practice question on finding roots.'
    ];
  }
  if (t.includes('pythagoras') || t.includes('triangle')) {
    return [
      'What are common Pythagorean triplets (like 3-4-5)?',
      'How do I find the hypotenuse if base = 6 cm and height = 8 cm?',
      'Does Pythagoras theorem apply to non-right angled triangles?',
      'Give me a step-by-step ladder problem using Pythagoras.'
    ];
  }
  if (t.includes('probability')) {
    return [
      'What is the probability of getting a sum of 7 with two dice?',
      'What is the difference between experimental and theoretical probability?',
      'Why can probability never be negative or greater than 1?',
      'Give me a practice problem on drawing a card from a deck.'
    ];
  }

  // Science
  if (t.includes('photosynthesis')) {
    return [
      'What are the light and dark stages of photosynthesis?',
      'What is the exact chemical role of chlorophyll?',
      'Why is photosynthesis vital for terrestrial life and oxygen balance?',
      'What factors (like light intensity or CO₂) affect the rate of photosynthesis?'
    ];
  }
  if (t.includes('newton')) {
    return [
      'How does Newton’s second law define Force = mass × acceleration (F = ma)?',
      'What is the difference between mass (kg) and weight (Newtons)?',
      'Can you explain Newton’s third law with a rocket launching example?',
      'Calculate: What force is needed to accelerate a 5 kg mass at 4 m/s²?'
    ];
  }
  if (t.includes('digestive')) {
    return [
      'What is the role of hydrochloric acid (HCl) in the stomach?',
      'How do villi in the small intestine absorb digested nutrients?',
      'What is the difference between mechanical and chemical digestion?',
      'Which enzymes break down carbohydrates, proteins, and fats?'
    ];
  }
  if (t.includes('atom') || t.includes('bonding')) {
    return [
      'What is the difference between covalent and ionic bonding?',
      'How do valence electrons determine chemical reactivity?',
      'What did Rutherford’s gold foil experiment reveal about the nucleus?',
      'Draw or describe the electron configuration of Carbon (Atomic number 6).'
    ];
  }

  // Computer Science
  if (t.includes('binary tree') || t.includes('tree')) {
    return [
      'What are the different types of binary trees (Full, Complete, Balanced)?',
      'What is a Binary Search Tree (BST) and what is its search time complexity?',
      'Can you explain Inorder, Preorder, and Postorder tree traversals?',
      'What is the difference between a general binary tree and a heap?'
    ];
  }
  if (t.includes('recursion')) {
    return [
      'Why is a base case strictly necessary to prevent stack overflow?',
      'How does the call stack work step-by-step during recursion?',
      'Can you write the recursive function for Fibonacci numbers?',
      'What is the difference between recursion and iterative while loops?'
    ];
  }
  if (t.includes('array')) {
    return [
      'Why does accessing an element by index in an array take O(1) constant time?',
      'What is the difference between a static array and a dynamic array?',
      'How do I reverse an array without creating a second array?',
      'Give me an example of linear search vs binary search on an array.'
    ];
  }
  if (t.includes('loop')) {
    return [
      'What is the difference between a "for" loop and a "while" loop in Python?',
      'How does the range() function work in Python loops?',
      'What is an infinite loop and how do you avoid it?',
      'Show me how to use the "break" and "continue" keywords with code.'
    ];
  }
  if (t.includes('complexity') || t.includes('big o')) {
    return [
      'What does O(1) constant time mean compared to O(n) linear time?',
      'Why is O(log n) binary search much faster than O(n) linear search?',
      'What is space complexity and how do we minimize extra memory?',
      'What is the time complexity of bubble sort vs merge sort?'
    ];
  }

  // English
  if (t.includes('noun') || t.includes('pronoun')) {
    return [
      'What is the difference between a proper noun and a common noun?',
      'What are relative pronouns (who, which, that) and how are they used?',
      'Can you give me 3 examples of collective nouns (e.g. flock, herd)?',
      'Identify the pronouns in: "She gave him her favorite book."'
    ];
  }
  if (t.includes('active') || t.includes('passive')) {
    return [
      'What are the general rules for converting active to passive voice?',
      'How do verb tenses shift when changing from active to passive voice?',
      'When is it stylistically better to use passive voice in English?',
      'Convert to passive: "The chef cooked a delicious three-course meal."'
    ];
  }
  if (t.includes('metaphor') || t.includes('simile')) {
    return [
      'What is the key difference between a metaphor and a simile?',
      'Can you identify metaphors in famous poems or daily idioms?',
      'What is personification and how does it compare to a metaphor?',
      'Turn this simile into a metaphor: "Her laughter was like music."'
    ];
  }
  if (t.includes('correction') || t.includes('grammar')) {
    return [
      'What are the golden rules of Subject-Verb Agreement in English?',
      'Explain when to use "who" vs "whom" in formal sentences.',
      'How do I avoid dangling modifiers in descriptive writing?',
      'Correct this sentence: "Each of the students have submitted their project."'
    ];
  }

  // Social Science
  if (t.includes('constitution')) {
    return [
      'What are the six Fundamental Rights guaranteed by the Indian Constitution?',
      'What does the Preamble say about India being Sovereign, Socialist, and Democratic?',
      'Why is Dr. B.R. Ambedkar revered as the Father of the Indian Constitution?',
      'How does the Constitution ensure a balance between Legislature, Executive, and Judiciary?'
    ];
  }
  if (t.includes('democracy')) {
    return [
      'What are the essential features of a democratic government?',
      'Why is democracy considered superior to other forms of government like monarchy?',
      'What is the significance of Universal Adult Franchise in India?',
      'How does democracy protect minority rights and allow citizens to correct mistakes?'
    ];
  }
  if (t.includes('french revolution')) {
    return [
      'What were the three Estates of French society before 1789?',
      'What was the significance of the storming of the Bastille on July 14, 1789?',
      'What ideas did philosophers like Rousseau and Montesquieu contribute?',
      'What was the Reign of Terror and who was Maximilien Robespierre?'
    ];
  }
  if (t.includes('parliament')) {
    return [
      'What is the difference in powers between the Lok Sabha and Rajya Sabha?',
      'How does a bill passed by Parliament become an official law in India?',
      'What is the role of the Opposition in a parliamentary democracy?',
      'Explain the "Question Hour" and "No-Confidence Motion" in Parliament.'
    ];
  }

  // General fallback
  return [
    `Can you give me a simple real-world example of ${topicName}?`,
    `What are the most common exam questions on this topic?`,
    `Explain this concept using a memorable everyday analogy.`,
    `Give me a quick 1-minute practice question to test my understanding.`
  ];
}

/**
 * Dynamic pedagogical calibration helper based on student class and stream
 */
export function getGradeCalibrationNote(
  gradeLevel?: ClassLevel | string,
  board?: BoardType,
  stream?: StreamType
): string {
  const g = (gradeLevel || '').toLowerCase();
  if (g.includes('6') || g.includes('7') || g.includes('8')) {
    return 'Calibrated for Middle School (Classes 6–8): Focusing on fundamental concepts, intuitive explanations, and real-life connections.';
  }
  if (g.includes('9') || g.includes('10')) {
    return `Calibrated for Secondary (${board || 'CBSE'} Board): Focusing on concept clarity, core definitions, and exam-oriented problem-solving.`;
  }
  if (g.includes('11') || g.includes('12')) {
    return `Calibrated for Senior Secondary (${board || 'CBSE'}${stream && stream !== 'Not applicable' ? ' • ' + stream : ''}): In-depth theoretical rigor, analytical reasoning, and competitive syllabus alignment.`;
  }
  return 'Calibrated to your active curriculum grade and academic level.';
}

/**
 * Offline / Demo Curriculum Answer Generator
 * Powered by GuruMitra's built-in academic curriculum engine for Classes 6-12 (CBSE / ICSE / UP Board).
 */
export function generateOfflineCurriculumAnswer(
  request: AITutorRequest
): NonNullable<TutorMessage['structuredResponse']> {
  const { question, subject, learningStyle, gradeLevel, board, stream, difficulty } = request;

  const cleanLower = question.trim().toLowerCase();
  const isGreeting = /^(hi|hello|hey|namaste|good\s*(morning|afternoon|evening)|hola|hii+)\b/i.test(cleanLower);
  if (isGreeting && cleanLower.length <= 25) {
    return {
      responseType: 'general',
      directAnswer: `Hello! I'm GuruMitra, your personal AI Tutor for ${subject}.`,
      simpleExplanation: `I'm calibrated for your ${gradeLevel || 'Class 9'} (${board || 'CBSE'}${stream && stream !== 'Not applicable' ? ' • ' + stream : ''}) syllabus. Ask me any question, ask for step-by-step problem solving, or pick one of the suggestions below!`,
      keyConcept: `Active Learning: Ask questions anytime in ${subject} or switch between Simple, Analogy, Visual, and Exam modes.`,
      example: subject === 'Mathematics'
        ? 'Try: "Solve 2x + 5 = 15" or "Explain quadratic equations"'
        : subject === 'Science'
        ? 'Try: "Explain photosynthesis" or "What is Newton\'s third law?"'
        : `Ask any concept, question, or problem from your ${subject} syllabus!`,
      followUpQuestions: [
        `Explain the core concepts of ${subject}`,
        `Give me an exam-style practice question for ${subject}`,
        `What are the most important formulas/definitions?`
      ]
    };
  }

  const detected = detectQuestionTopic(question, subject, Boolean(request.uploadedContext));
  const crossNotice = (detected.subject !== subject)
    ? `Notice: Your active subject is ${subject}, but this question belongs to ${detected.subject}. Answering with ${detected.subject} curriculum context.`
    : undefined;
  const followUps = generateFollowUpQuestions(detected.topicName, detected.subject, Boolean(request.uploadedContext));

  if (detected.responseType === 'mathematical') {
    return generateMathAnswer(question, learningStyle, gradeLevel, board, stream, difficulty, crossNotice, followUps);
  }
  if (detected.responseType === 'programming') {
    return generateProgrammingAnswer(question, detected.topicName, learningStyle, gradeLevel, board, stream, difficulty, crossNotice, followUps);
  }
  return generateConceptualAnswer(question, detected.topicName, detected.subject, learningStyle, gradeLevel, board, stream, difficulty, crossNotice, followUps);
}

/**
 * Core Answer Generator:
 * Connects directly to the server-side OpenAI Responses API endpoint (/api/ai-tutor).
 * Dispatches student context, active subject, learning style, and recent conversation.
 */
export async function generateTutorAnswer(
  request: AITutorRequest
): Promise<NonNullable<TutorMessage['structuredResponse']>> {
  const {
    question,
    subject,
    learningStyle,
    gradeLevel,
    board,
    stream,
    difficulty,
    chapter,
    topic,
    uploadedContext,
    conversationHistory,
    offlineMode
  } = request;

  const cleanQ = question.trim();
  if (!cleanQ) {
    throw new Error('Please enter a question.');
  }

  // If student is in explicit offline / demo mode, resolve via curriculum engine
  if (offlineMode) {
    return generateOfflineCurriculumAnswer(request);
  }

  // Format recent conversation history for multi-turn conversational memory (cost-controlled)
  const recentConversation = (conversationHistory || []).slice(-8).map((msg) => ({
    role: (msg.sender === 'student' ? 'user' : 'assistant') as 'user' | 'assistant',
    content: msg.text || msg.structuredResponse?.directAnswer || ''
  }));

  try {
    const res = await fetch('/api/ai-tutor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: cleanQ,
        context: {
          classLevel: gradeLevel || 'Class 9',
          board: board || 'CBSE',
          stream: stream || 'Not applicable',
          subject: subject || 'General',
          chapter: chapter || '',
          topic: topic || '',
          learningStyle: learningStyle || 'Simple',
          difficulty: difficulty || 'Beginner'
        },
        conversation: recentConversation,
        uploadedContext: uploadedContext || null
      })
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data) {
      if (res.status === 503 && data?.notConfigured) {
        return {
          responseType: 'general',
          directAnswer: 'AI Tutor API is not configured. Add OPENAI_API_KEY to the server environment.',
          simpleExplanation: 'To activate dynamic OpenAI tutoring, please configure your OPENAI_API_KEY in the server environment (.env file) and restart Vite.',
          keyConcept: 'Server Configuration: OPENAI_API_KEY is required to enable live AI responses.',
          followUpQuestions: [
            'What is photosynthesis?',
            "Explain Newton's second law with an example",
            'What is a binary tree?'
          ]
        };
      }

      if (res.status === 429) {
        return generateOfflineCurriculumAnswer(request);
      }

      const errMsg = data?.error || 'AI Tutor is temporarily unavailable. Please try again.';
      throw new Error(errMsg);
    }

    if (data.data) {
      return data.data;
    }

    throw new Error('Invalid response received from AI Tutor service.');
  } catch (err: any) {
    console.error('GuruMitra AI Tutor Service Error:', err);
    throw err;
  }
}


/**
 * Specialized Mathematical Answer Generator
 */
function generateMathAnswer(
  question: string,
  style: LearningStyle,
  gradeLevel?: ClassLevel | string,
  board?: BoardType,
  stream?: StreamType,
  difficulty?: DifficultyLevel,
  crossNotice?: string,
  followUps?: string[]
): NonNullable<TutorMessage['structuredResponse']> {
  const lowerQ = question.toLowerCase();

  // Linear equation solver: e.g. "Solve 2x + 5 = 15"
  const linearMatch = question.match(/(\d*)\s*x\s*([\+\-])\s*(\d+)\s*=\s*(\d+)/i);
  if (linearMatch) {
    const coeff = linearMatch[1] ? parseInt(linearMatch[1], 10) : 1;
    const sign = linearMatch[2];
    const constant = parseInt(linearMatch[3], 10);
    const rhs = parseInt(linearMatch[4], 10);

    const step1Rhs = sign === '+' ? rhs - constant : rhs + constant;
    const finalX = step1Rhs / coeff;

    return {
      responseType: 'mathematical',
      crossSubjectNotice: crossNotice,
      directAnswer: `The solution to ${question.replace(/solve\s*/i, '')} is x = ${finalX}.`,
      simpleExplanation: `In Class 9 algebra, the objective is to isolate the variable 'x' on one side by doing the exact same mathematical operations to both sides of the equation.`,
      stepByStep: [
        `Given Equation: ${coeff}x ${sign} ${constant} = ${rhs}`,
        `Step 1 (Isolate term with x): ${sign === '+' ? 'Subtract' : 'Add'} ${constant} ${sign === '+' ? 'from' : 'to'} both sides: ${coeff}x = ${rhs} ${sign === '+' ? '-' : '+'} ${constant} => ${coeff}x = ${step1Rhs}`,
        `Step 2 (Solve for x): Divide both sides by the coefficient ${coeff}: x = ${step1Rhs} / ${coeff} => x = ${finalX}`,
        `Step 3 (Verification Check): Substitute x = ${finalX} back into original equation: ${coeff}(${finalX}) ${sign} ${constant} = ${coeff * finalX} ${sign} ${constant} = ${rhs} (L.H.S = R.H.S ✓)`
      ],
      formulaOrCode: `Given: ${coeff}x ${sign} ${constant} = ${rhs}\nCalculation:\n  ${coeff}x = ${step1Rhs}\n  x = ${finalX}\nFinal Result: x = ${finalX}`,
      keyConcept: 'Balance Scale Rule: Whatever operation you apply to the left side (addition, subtraction, division), you must apply to the right side.',
      analogy:
        style === 'Analogy'
          ? 'Imagine a balance scale with two trays perfectly level. If you remove 5 grams from the left tray, you must remove 5 grams from the right tray to keep them level!'
          : undefined,
      visualDiagram:
        style === 'Visual'
          ? `[ ${coeff}x + ${constant} ] ═══════ [ ${rhs} ]\n       │ Subtract ${constant} from both sides\n[ ${coeff}x ]       ═══════ [ ${step1Rhs} ]\n       │ Divide both sides by ${coeff}\n[   x   ]       ═══════ [ ${finalX} ]  ✓ Balanced`
          : undefined,
      practiceQuestion: {
        question: `Try this: Solve 3x + 6 = 21`,
        options: ['x = 5', 'x = 7', 'x = 3', 'x = 9'],
        answer: 'x = 5 (Subtract 6: 3x = 15; Divide by 3: x = 5)'
      },
      followUpQuestions: followUps
    };
  }

  // Pythagoras Theorem
  if (lowerQ.includes('pythagor')) {
    return {
      responseType: 'mathematical',
      crossSubjectNotice: crossNotice,
      directAnswer: 'Pythagoras theorem states that in a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides.',
      simpleExplanation: 'The hypotenuse is always the longest side and lies directly opposite to the 90° right angle. Formula: a² + b² = c².',
      stepByStep: [
        '1. Given: A right-angled triangle with perpendicular legs "a" and "b", and hypotenuse "c".',
        '2. Concept / Formula: (Hypotenuse)² = (Base)² + (Perpendicular)²',
        '3. Example Calculation: If base = 3 cm and height = 4 cm, then c² = 3² + 4² = 9 + 16 = 25.',
        '4. Final Answer: c = √25 = 5 cm.'
      ],
      formulaOrCode: 'Formula:\nc² = a² + b²\n\nWhere:\n• c = Hypotenuse (longest side opposite 90°)\n• a = Base leg\n• b = Perpendicular height leg',
      keyConcept: 'Applies exclusively to 90° right-angled triangles. The Pythagorean triplet (3, 4, 5) and (5, 12, 13) are classic exam examples.',
      analogy:
        style === 'Analogy'
          ? 'Walking diagonally across an empty square park is like taking the hypotenuse: it is much shorter than walking along the two perpendicular sidewalks (a + b)!'
          : undefined,
      visualDiagram:
        style === 'Visual'
          ? '       │╲\n       │ ╲\n   b   │  ╲  c (Hypotenuse)\n (Perp)│   ╲\n       │____╲\n       ┌─┐ a (Base)\n       └─┘ (90° right angle)\n\n   Relation: c² = a² + b²'
          : undefined,
      practiceQuestion: {
        question: 'Find the hypotenuse of a right triangle with legs of length 6 cm and 8 cm.',
        options: ['10 cm', '12 cm', '14 cm', '9 cm'],
        answer: '10 cm (c² = 6² + 8² = 36 + 64 = 100 => c = √100 = 10 cm)'
      },
      followUpQuestions: followUps
    };
  }

  // Quadratic Equations
  if (lowerQ.includes('quadratic')) {
    return {
      responseType: 'mathematical',
      crossSubjectNotice: crossNotice,
      directAnswer: 'A quadratic equation is a second-degree polynomial equation in standard form: ax² + bx + c = 0 (where a ≠ 0).',
      simpleExplanation: 'Because the highest power of the variable is 2 (x²), a quadratic equation always has up to two solutions called roots.',
      stepByStep: [
        '1. Standard Form: Rewrite any quadratic equation as ax² + bx + c = 0.',
        '2. Identify Coefficients: Read out values of a, b, and c.',
        '3. Calculate Discriminant: D = b² - 4ac. If D > 0 (2 distinct real roots); D = 0 (1 real repeated root); D < 0 (no real roots).',
        '4. Quadratic Formula: x = (-b ± √(b² - 4ac)) / (2a).'
      ],
      formulaOrCode: 'Standard Equation: ax² + bx + c = 0\nQuadratic Formula: x = (-b ± √(b² - 4ac)) / (2a)\nDiscriminant: D = b² - 4ac',
      keyConcept: 'Sum of roots α + β = -b/a. Product of roots α · β = c/a.',
      analogy:
        style === 'Analogy'
          ? 'Think of throwing a cricket ball up into the sky. Its height forms a symmetrical curved U-shape (parabola), and the two times it touches the ground are its roots!'
          : undefined,
      visualDiagram:
        style === 'Visual'
          ? '     y\n     │        ╭───╮  (Vertex: maximum height)\n     │       ╭╯   ╰╮\n     │──────x₁─────x₂───► x  (Roots: x₁ and x₂ where y = 0)\n     │'
          : undefined,
      practiceQuestion: {
        question: 'Find the roots of x² - 5x + 6 = 0.',
        options: ['x = 2 or x = 3', 'x = -2 or x = -3', 'x = 1 or x = 6', 'x = 0 or x = 6'],
        answer: 'x = 2 or x = 3 (Because (x - 2)(x - 3) = 0)'
      },
      followUpQuestions: followUps
    };
  }

  // Probability
  if (lowerQ.includes('probability')) {
    return {
      responseType: 'mathematical',
      crossSubjectNotice: crossNotice,
      directAnswer: 'Probability measures the likelihood that a particular event will occur, expressed as a number between 0 (impossible) and 1 (certain).',
      simpleExplanation: 'In Class 9 mathematics, Probability P(E) = (Number of Favorable Outcomes) / (Total Number of Possible Outcomes).',
      stepByStep: [
        '1. Define the Experiment: e.g. rolling a standard 6-sided die.',
        '2. Determine Total Outcomes (Sample Space S): {1, 2, 3, 4, 5, 6} => n(S) = 6.',
        '3. Count Favorable Outcomes (Event E): e.g. rolling an even number {2, 4, 6} => n(E) = 3.',
        '4. Apply Formula: P(E) = n(E) / n(S) = 3 / 6 = 1/2 (or 50%).'
      ],
      formulaOrCode: 'P(Event) = Number of Favorable Outcomes / Total Possible Outcomes\n\n0 ≤ P(E) ≤ 1\nP(Impossible Event) = 0\nP(Certain Event) = 1',
      keyConcept: 'The sum of probabilities of all elementary events of an experiment is always equal to 1: P(E) + P(not E) = 1.',
      analogy:
        style === 'Analogy'
          ? 'Think of a pizza sliced into 8 equal slices. If 2 slices have mushrooms, the probability that a random pick has mushrooms is 2 out of 8, or 1/4!'
          : undefined,
      visualDiagram:
        style === 'Visual'
          ? 'Impossible Event               Equal Chance (Coin Toss)               Certain Event\n     [ 0 ] ───────────────────────── [ 0.5 (50%) ] ───────────────────────── [ 1.0 (100%) ]\n  (e.g., Roll 7 on 6-sided die)         (e.g., Heads on fair coin)          (e.g., Sun rises in East)'
          : undefined,
      practiceQuestion: {
        question: 'A bag contains 3 red balls and 5 black balls. What is the probability of picking a red ball at random?',
        options: ['3/8', '5/8', '3/5', '1/3'],
        answer: '3/8 (Favorable red = 3; Total balls = 3 + 5 = 8 => 3/8)'
      },
      followUpQuestions: followUps
    };
  }

  // General Math
  return {
    responseType: 'mathematical',
    crossSubjectNotice: crossNotice,
    directAnswer: `In Class 9 Mathematics, "${question}" addresses fundamental numerical and algebraic principles.`,
    simpleExplanation: 'Mathematical problem solving requires identifying the known quantities, setting up the exact formula, and systematically computing each algebraic step.',
    stepByStep: [
      '1. Given: Identify the numbers, variables, and conditions provided.',
      '2. Concept / Formula: Select the standard theorem or algebraic identity.',
      '3. Step-by-Step Calculation: Carry out operations maintaining equality across both sides.',
      '4. Final Answer & Units: State the exact result with appropriate units.'
    ],
    formulaOrCode: 'General Solution Template:\nStep 1: Write Given\nStep 2: Apply Formula: Result = f(Variables)\nStep 3: Solve and verify L.H.S = R.H.S',
    keyConcept: 'Precision in calculation: always double-check signs (+ and -) and verify units.',
    practiceQuestion: {
      question: 'Which step is most crucial when solving an equation?',
      answer: 'Maintaining balance by applying the exact same operation to both sides!'
    },
    followUpQuestions: followUps
  };
}

/**
 * Specialized Programming / Computer Science Answer Generator
 */
function generateProgrammingAnswer(
  question: string,
  topic: string,
  style: LearningStyle,
  gradeLevel?: ClassLevel | string,
  board?: BoardType,
  stream?: StreamType,
  difficulty?: DifficultyLevel,
  crossNotice?: string,
  followUps?: string[]
): NonNullable<TutorMessage['structuredResponse']> {
  const lowerQ = question.toLowerCase();

  // Binary Tree
  if (lowerQ.includes('binary tree')) {
    return {
      responseType: 'programming',
      crossSubjectNotice: crossNotice,
      directAnswer: 'A binary tree is a hierarchical non-linear data structure in which each parent node has at most two children, typically called the left child and right child.',
      simpleExplanation: 'Unlike an array which is linear (like books in a line), a binary tree organizes data in branches, starting from a single top node called the "root".',
      stepByStep: [
        '1. Root Node: The topmost node of the tree with no parent.',
        '2. Edge: The connection link between a parent and its child.',
        '3. Leaf Node: A bottom node that has no children (left = null, right = null).',
        '4. Subtrees: The left and right children each form smaller binary trees.'
      ],
      formulaOrCode: `# Python representation of a Binary Tree Node
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None   # Left child pointer
        self.right = None  # Right child pointer

# Creating a simple 3-node tree:
#        (1)
#       /   \\
#     (2)   (3)
root = TreeNode(1)
root.left = TreeNode(2)
root.right = TreeNode(3)

print("Root node value:", root.value)
print("Left child:", root.left.value)`,
      codeExplanation: 'Each TreeNode object stores its data "value" and two references (pointers) pointing to its left and right children. If a child does not exist, it points to None.',
      complexity: {
        time: 'Search / Insertion: O(log n) in balanced BST; O(n) in worst case (skewed tree).',
        space: 'O(n) memory to store n nodes; O(h) call stack memory where h is tree height.'
      },
      keyConcept: 'Hierarchy & Branching: At most 2 children per node. Maximum nodes at level "i" is 2ⁱ.',
      analogy:
        style === 'Analogy'
          ? 'Think of a family tree or a company organization chart: the CEO is the root node, and each manager can manage up to two team leads beneath them!'
          : undefined,
      visualDiagram:
        style === 'Visual'
          ? '              [ Root: 10 ]\n               /        \\\n         [ Left: 5 ]   [ Right: 15 ]\n          /       \\          \\\n      [ 2 ]       [ 7 ]     [ 20 ]  (Leaf Nodes)'
          : undefined,
      practiceQuestion: {
        question: 'What is the maximum number of children a node in a binary tree can have?',
        options: ['1', '2', '3', 'Unlimited'],
        answer: '2 (At most a left child and a right child)'
      },
      followUpQuestions: followUps
    };
  }

  // Recursion
  if (lowerQ.includes('recursion')) {
    return {
      responseType: 'programming',
      crossSubjectNotice: crossNotice,
      directAnswer: 'Recursion is a computational technique where a function solves a problem by calling itself with smaller inputs until it reaches a termination condition called a base case.',
      simpleExplanation: 'Instead of using a loop, a recursive function breaks a big task into a tiny step plus the exact same problem for the remaining smaller pieces.',
      stepByStep: [
        '1. Base Case (Crucial): The stopping condition where the function returns a simple result without calling itself.',
        '2. Recursive Step: The function calls itself with a reduced version of the argument (e.g. n - 1).',
        '3. Call Stack: Each function call pauses and waits in memory until the base case is reached and answers bubble back up.'
      ],
      formulaOrCode: `# Calculating Factorial using Recursion in Python
def factorial(n):
    # 1. Base Case: stops recursion
    if n <= 1:
        return 1
    # 2. Recursive Step: breaks problem into n * factorial(n-1)
    return n * factorial(n - 1)

# Example: factorial(4) => 4 * 3 * 2 * 1 = 24
print("4! =", factorial(4))`,
      codeExplanation: 'When factorial(4) runs, it computes 4 * factorial(3). This continues until factorial(1) returns 1. Then the call stack resolves 2 * 1 = 2, 3 * 2 = 6, and 4 * 6 = 24.',
      complexity: {
        time: 'O(n) for linear factorial recursion since it calls itself n times.',
        space: 'O(n) space complexity because the system call stack stores n active frames.'
      },
      keyConcept: 'Always define the Base Case first: Without it, the function calls itself indefinitely, causing a "RecursionError: maximum recursion depth exceeded" (Stack Overflow).',
      analogy:
        style === 'Analogy'
          ? 'Think of Russian Matryoshka nesting dolls! You open a big doll to find a slightly smaller doll inside. You keep opening until you find the solid wooden baby in the center (the Base Case) that cannot be opened.'
          : undefined,
      visualDiagram:
        style === 'Visual'
          ? '   factorial(4) ──► calls 4 * factorial(3)\n     factorial(3) ──► calls 3 * factorial(2)\n       factorial(2) ──► calls 2 * factorial(1)\n         factorial(1) ──► [ BASE CASE: returns 1 ]\n       returns 2 * 1 = 2 ◄───┘\n     returns 3 * 2 = 6 ◄─────┘\n   returns 4 * 6 = 24 ◄──────┘'
          : undefined,
      practiceQuestion: {
        question: 'What happens if a recursive function does not have a base case?',
        options: ['It runs faster', 'It causes a Stack Overflow error', 'It returns 0', 'It compiles automatically'],
        answer: 'It causes a Stack Overflow error (runs infinitely until system memory runs out)'
      },
      followUpQuestions: followUps
    };
  }

  // Loops in Python
  if (lowerQ.includes('loop') || lowerQ.includes('for loop') || lowerQ.includes('while')) {
    return {
      responseType: 'programming',
      crossSubjectNotice: crossNotice,
      directAnswer: 'A loop is a control structure in programming that repeats a block of code multiple times until a specified condition is satisfied.',
      simpleExplanation: 'Instead of copying and pasting the same line 100 times, a loop lets you write the instruction once and tell the computer how many times or under what condition to repeat it.',
      stepByStep: [
        '1. Initialization: Starting point (e.g. start at index 0 or number 1).',
        '2. Condition: Test evaluated before each iteration. If True, run block; if False, exit.',
        '3. Body Execution: The code inside the loop executes.',
        '4. Update / Increment: Progress toward termination (e.g. i = i + 1).'
      ],
      formulaOrCode: `# Python Loop Examples:

# 1. 'for' loop using range(start, stop)
print("--- For Loop Example ---")
for i in range(1, 6):
    print(f"Step {i}: Learning with GuruMitra!")

# 2. 'while' loop with a counter
print("\\n--- While Loop Example ---")
counter = 1
while counter <= 3:
    print(f"Count is {counter}")
    counter += 1  # Crucial: update counter so it stops!`,
      codeExplanation: 'range(1, 6) generates numbers 1, 2, 3, 4, 5. The variable "i" takes each value in sequence. In the while loop, counter += 1 ensures the condition counter <= 3 eventually becomes false.',
      complexity: {
        time: 'O(n) where n is the number of loop iterations.',
        space: 'O(1) constant extra memory since variables are updated in place.'
      },
      keyConcept: 'For loop is ideal when you know the number of iterations in advance; While loop is ideal when looping depends on a live dynamic condition.',
      analogy:
        style === 'Analogy'
          ? 'Think of running laps around a sports field: a for loop is "run exactly 5 laps", while a while loop is "keep running while you still have energy"!'
          : undefined,
      visualDiagram:
        style === 'Visual'
          ? '      ┌──► [ Check Condition ] ──(True)──► [ Execute Loop Body ]\n      │            │                                    │\n      │            └──(False)──┐                        ▼\n      │                        │               [ Update Counter ]\n      │                        ▼                        │\n      └──────────────── [ Exit Loop ] ◄─────────────────┘'
          : undefined,
      practiceQuestion: {
        question: 'What will "for x in range(3): print(x)" output?',
        options: ['1, 2, 3', '0, 1, 2', '0, 1, 2, 3', '3, 2, 1'],
        answer: '0, 1, 2 (Python range starts at 0 by default and stops before 3)'
      },
      followUpQuestions: followUps
    };
  }

  // Array / Data Structures
  if (lowerQ.includes('array')) {
    return {
      responseType: 'programming',
      crossSubjectNotice: crossNotice,
      directAnswer: 'An array is a linear data structure that stores a collection of elements of the same type in contiguous (adjacent) memory locations.',
      simpleExplanation: 'Each item in an array has a unique position number called an "index". Because elements sit side by side in memory, accessing any item by index takes instant O(1) time.',
      stepByStep: [
        '1. 0-based Indexing: In almost all programming languages, the first element is at index 0.',
        '2. Fixed Size: Standard arrays have a fixed capacity decided when created.',
        '3. Random Access: You can directly access array[k] immediately using its index calculation: Address = Base + k * Size.'
      ],
      formulaOrCode: `# Array / List example in Python
scores = [85, 92, 78, 96, 88]

# Accessing elements by index
first_score = scores[0]   # 85 (Index 0)
last_score = scores[-1]   # 88 (Last element)

# Appending a new score
scores.append(95)

print("Student Scores:", scores)
print("Highest score:", max(scores))`,
      codeExplanation: 'scores[0] fetches the first item in constant time O(1). scores.append(95) adds a new item to the end of the collection.',
      complexity: {
        time: 'Access by index: O(1); Search by value: O(n); Insertion/Deletion in middle: O(n).',
        space: 'O(n) where n is the number of elements.'
      },
      keyConcept: 'Fast Indexing vs Slow Insertion: Reading array[i] is instantaneous (O(1)), but inserting in the middle requires shifting all subsequent elements (O(n)).',
      analogy:
        style === 'Analogy'
          ? 'Think of numbered post office boxes or lockers along a hallway: Locker #0, Locker #1, Locker #2. You can walk straight to Locker #4 without checking the lockers before it!'
          : undefined,
      visualDiagram:
        style === 'Visual'
          ? 'Index:     [ 0 ]    [ 1 ]    [ 2 ]    [ 3 ]    [ 4 ]\n         ┌────────┬────────┬────────┬────────┬────────┐\nValue:   │   85   │   92   │   78   │   96   │   88   │\n         └────────┴────────┴────────┴────────┴────────┘\nMemory:   0x1000   0x1004   0x1008   0x100C   0x1010  (Contiguous)'
          : undefined,
      practiceQuestion: {
        question: 'What is the time complexity of accessing an element in an array if you know its index?',
        options: ['O(1) Constant', 'O(n) Linear', 'O(log n)', 'O(n²)'],
        answer: 'O(1) Constant time (instant calculation directly to memory address)'
      },
      followUpQuestions: followUps
    };
  }

  // Time Complexity
  if (lowerQ.includes('time complexity') || lowerQ.includes('big o')) {
    return {
      responseType: 'programming',
      crossSubjectNotice: crossNotice,
      directAnswer: 'Time complexity is a measure of how the runtime of an algorithm increases as the input size (n) grows, expressed using Big O notation.',
      simpleExplanation: 'Instead of measuring seconds (which varies on fast vs slow computers), time complexity counts the number of fundamental operations executed relative to input size n.',
      stepByStep: [
        '1. O(1) Constant: Speed stays the same no matter how big n is (e.g. accessing array[0]).',
        '2. O(log n) Logarithmic: Extremely fast; cuts problem in half every step (e.g. binary search).',
        '3. O(n) Linear: Proportional; checking 100 items takes 100 operations (e.g. simple for loop).',
        '4. O(n²) Quadratic: Nested loops; 100 items takes 10,000 operations (e.g. bubble sort).'
      ],
      formulaOrCode: `# Comparing O(1) vs O(n) vs O(n^2) in Python

# O(1) - Constant Time
def get_first(arr):
    return arr[0]

# O(n) - Linear Time (single loop)
def print_all(arr):
    for item in arr:
        print(item)

# O(n^2) - Quadratic Time (nested loops)
def print_pairs(arr):
    for i in arr:
        for j in arr:
            print(i, j)`,
      codeExplanation: 'In print_all, runtime scales linearly with n. In print_pairs, two nested loops multiply n * n = n², which slows down rapidly for large inputs.',
      complexity: {
        time: 'Fastest to Slowest: O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ)',
        space: 'Measures auxiliary RAM required as input n scales.'
      },
      keyConcept: 'Big O focuses on the Worst-Case and drops constant factors (e.g. 5n + 20 simplifies to O(n)).',
      analogy:
        style === 'Analogy'
          ? 'Imagine looking for a word in a dictionary: flipping pages from page 1 to the end is O(n) linear search, while opening right to the middle and cutting the book in half is O(log n) binary search!'
          : undefined,
      visualDiagram:
        style === 'Visual'
          ? 'Operations\n   │                                 / (O(n²) Quadratic - Slow!)\n   │                                /\n   │                              /   (O(n) Linear)\n   │                       ───────    (O(log n) Logarithmic - Fast!)\n   │  ──────────────────────────────── (O(1) Constant - Instant!)\n   └───────────────────────────────────► Input Size (n)'
          : undefined,
      practiceQuestion: {
        question: 'Which time complexity is considered the fastest and most efficient for searching in a sorted list?',
        options: ['O(log n)', 'O(n)', 'O(n²)', 'O(n!)'],
        answer: 'O(log n) (Binary search cuts the remaining items in half on every step)'
      },
      followUpQuestions: followUps
    };
  }

  // General CS
  return {
    responseType: 'programming',
    crossSubjectNotice: crossNotice,
    directAnswer: `In Computer Science, "${question}" revolves around algorithmic structure and computational efficiency.`,
    simpleExplanation: 'Computer Science combines data organization with step-by-step algorithms designed to process inputs into verified outputs reliably.',
    stepByStep: [
      '1. Data Modeling: Choose the appropriate data structure (array, list, tree, dictionary).',
      '2. Logic Implementation: Write instructions with clean control flow (conditionals and loops).',
      '3. Boundary Conditions: Test edge cases (empty inputs, zero, single element).',
      '4. Complexity Analysis: Evaluate time and memory overhead.'
    ],
    formulaOrCode: `# Clean implementation pattern
def solve_problem(data):
    # Base / Boundary validation
    if not data:
        return None
    # Transformation logic
    result = [item for item in data if item > 0]
    return result`,
    keyConcept: 'Modular, readable code with documented complexity is the hallmark of sound software engineering.',
    practiceQuestion: {
      question: 'What is the primary purpose of writing algorithms with low time complexity?',
      answer: 'To ensure the application remains fast and responsive even when processing millions of data records!'
    },
    followUpQuestions: followUps
  };
}

/**
 * Specialized Conceptual Answer Generator (Chemistry, Physics, Biology, Science, English, Social Science, Commerce, General)
 */
function generateConceptualAnswer(
  question: string,
  topic: string,
  subject: SubjectType,
  style: LearningStyle,
  gradeLevel?: ClassLevel | string,
  board?: BoardType,
  stream?: StreamType,
  difficulty?: DifficultyLevel,
  crossNotice?: string,
  followUps?: string[]
): NonNullable<TutorMessage['structuredResponse']> {
  const lowerQ = question.toLowerCase();

  // Functional Groups & Organic Chemistry (Chemistry)
  if (lowerQ.includes('functional group') || lowerQ.includes('organic chemistry')) {
    return {
      responseType: 'conceptual',
      crossSubjectNotice: crossNotice,
      directAnswer: 'A functional group is an atom or group of atoms within a molecule that determines its characteristic chemical reactivity and physical properties.',
      simpleExplanation: `In ${gradeLevel || 'Class 10/11'} Chemistry, hydrocarbons provide a neutral carbon backbone. Attaching a functional group (like -OH or -COOH) determines the molecule's chemical personality, solubility, and reactivity.`,
      stepByStep: [
        '1. Carbon Skeleton: Carbon chains form the inert backbone of the organic molecule.',
        '2. Heteroatom Linkage: Electronegative atoms (O, N, halogens) create polarized reaction centers.',
        '3. Suffix Nomenclature: -ol (alcohol), -al (aldehyde), -one (ketone), -oic acid (carboxylic acid).',
        '4. Chemical Reaction Site: Reactions primarily occur at the functional group site rather than the carbon chain.'
      ],
      example: 'Example: Ethane (C₂H₆, gas) becomes Ethanol (C₂H₅OH, liquid alcohol) when an -OH functional group is attached.',
      formulaOrCode: 'Core Functional Groups:\n• Alcohol: R-OH (e.g., Ethanol C₂H₅OH)\n• Aldehyde: R-CHO (e.g., Ethanal CH₃CHO)\n• Ketone: R-CO-R\' (e.g., Acetone CH₃COCH₃)\n• Carboxylic Acid: R-COOH (e.g., Ethanoic Acid CH₃COOH)',
      keyConcept: 'Homologous Series: A family of organic compounds with the same functional group where successive members differ by a -CH₂- unit.',
      analogy:
        style === 'Analogy'
          ? 'Think of the carbon chain like a basic car chassis, and the functional group like a specialized emergency kit: attach a siren and it becomes an ambulance; attach a flatbed and it becomes a pickup truck!'
          : undefined,
      visualDiagram:
        style === 'Visual'
          ? '   [ Alcohol: -OH ]           [ Aldehyde: -CHO ]           [ Carboxylic Acid: -COOH ]\n          │                               │                                   │\n     C₂H₅ ── OH                      CH₃ ── C ═ O                        CH₃ ── C ═ O\n                                            │                                   │\n                                            H                                   OH'
          : undefined,
      practiceQuestion: {
        question: 'Which functional group characterizes carboxylic acids?',
        options: ['-COOH', '-OH', '-CHO', '-CO-'],
        answer: '-COOH (Carboxylic Acid group)'
      },
      followUpQuestions: [
        'What is the difference between an aldehyde and a ketone?',
        'How do functional groups influence the boiling point of organic compounds?',
        'Write the IUPAC names for the first 3 members of the alcohol homologous series.',
        'What chemical test distinguishes an aldehyde from a ketone?'
      ]
    };
  }

  // Kinematics & Motion (Physics)
  if (lowerQ.includes('kinematics') || lowerQ.includes('acceleration') || lowerQ.includes('equations of motion')) {
    return {
      responseType: 'conceptual',
      crossSubjectNotice: crossNotice,
      directAnswer: 'Kinematics is the study of motion of points and bodies without considering the forces that cause the motion.',
      simpleExplanation: `In ${gradeLevel || 'Class 9/11'} Physics, motion with constant acceleration is modeled using three foundational equations relating displacement (s), initial velocity (u), final velocity (v), acceleration (a), and time (t).`,
      stepByStep: [
        '1. Velocity-Time Relation: v = u + at.',
        '2. Position-Time Relation: s = ut + ½at².',
        '3. Position-Velocity Relation: v² = u² + 2as.'
      ],
      example: 'Example: An object starting from rest (u = 0) accelerates at 3 m/s² for 4 seconds. Final speed v = 0 + 3(4) = 12 m/s.',
      formulaOrCode: 'Uniform Acceleration Equations:\n1. v = u + at\n2. s = ut + ½at²\n3. v² = u² + 2as',
      keyConcept: 'These kinematic formulas are valid only when acceleration "a" remains constant throughout the motion.',
      practiceQuestion: {
        question: 'A car accelerates uniformly from rest at 2 m/s² for 5 seconds. How far does it travel?',
        options: ['25 m', '50 m', '10 m', '100 m'],
        answer: '25 m (s = ut + ½at² = 0 + ½(2)(5)² = 25 m)'
      },
      followUpQuestions: followUps
    };
  }

  // Electricity & Ohm's Law (Physics)
  if (lowerQ.includes("ohm's law") || lowerQ.includes('ohms law') || lowerQ.includes('resistance')) {
    return {
      responseType: 'conceptual',
      crossSubjectNotice: crossNotice,
      directAnswer: 'Ohm’s law states that current flowing through a conductor is directly proportional to the potential difference across it, provided temperature is constant: V = IR.',
      simpleExplanation: `In ${gradeLevel || 'Class 10/12'} Physics, voltage (V) provides electrical pressure, current (I) measures flow rate, and resistance (R) opposes that flow.`,
      stepByStep: [
        '1. Direct Proportionality: V ∝ I at constant physical conditions.',
        '2. Resistance Constant: R = V / I (Measured in Ohms, Ω).',
        '3. Resistors in Series: R_eq = R₁ + R₂ + R₃.',
        '4. Resistors in Parallel: 1/R_eq = 1/R₁ + 1/R₂ + 1/R₃.'
      ],
      example: 'Example: A 9V battery powering a 3Ω lamp drives a current of I = 9 / 3 = 3 Amperes.',
      formulaOrCode: 'V = I × R\nPower: P = V × I = I²R = V²/R',
      keyConcept: 'The slope of a Voltage vs Current (V-I) graph gives the resistance R of an ohmic conductor.',
      practiceQuestion: {
        question: 'Two 4Ω resistors are connected in parallel. What is their equivalent resistance?',
        options: ['2Ω', '8Ω', '4Ω', '1Ω'],
        answer: '2Ω (1/R = 1/4 + 1/4 = 2/4 => R = 2Ω)'
      },
      followUpQuestions: followUps
    };
  }

  // Photosynthesis (Science / Biology)
  if (lowerQ.includes('photosynthesis')) {
    return {
      responseType: 'conceptual',
      crossSubjectNotice: crossNotice,
      directAnswer: 'Photosynthesis is the biological process by which green plants use sunlight, water, and carbon dioxide to produce glucose (sugar) and release oxygen.',
      simpleExplanation: 'Plants have microscopic green solar factories inside their leaves called chloroplasts. They absorb water from soil through roots and CO₂ from air through tiny pores called stomata.',
      stepByStep: [
        '1. Light Absorption: Chlorophyll in the chloroplasts captures photon energy from sunlight.',
        '2. Water Splitting (Light Reaction): Solar energy splits water molecules (H₂O) into hydrogen and oxygen.',
        '3. Oxygen Release: Oxygen is released into the atmosphere through stomata as a byproduct.',
        '4. Glucose Production (Dark Reaction / Calvin Cycle): Hydrogen combines with Carbon Dioxide (CO₂) to synthesize glucose food.'
      ],
      example: 'Example: A mango tree uses photosynthesis to store energy as sweet fruit while simultaneously releasing the oxygen humans breathe.',
      formulaOrCode: 'Chemical Equation of Photosynthesis:\n6CO₂ + 6H₂O + Sunlight + Chlorophyll ──► C₆H₁₂O₆ (Glucose) + 6O₂ (Oxygen)',
      keyConcept: 'Photosynthesis transforms electromagnetic solar energy into chemical energy stored in glucose bonds, forming the base of terrestrial food webs.',
      analogy:
        style === 'Analogy'
          ? 'Think of a leaf as a solar-powered bakery: sunlight is the oven electricity, water and CO₂ are the flour and sugar, glucose is the baked loaf of bread, and oxygen is the fresh aroma floating out the window!'
          : undefined,
      visualDiagram:
        style === 'Visual'
          ? '          ☀️ Sunlight\n               │\n     CO₂ ──► [ 🌱 Green Leaf: Chloroplasts ] ──► O₂ (Released to Air)\n               │\n     H₂O ──► [ Split H₂O ──► C₆H₁₂O₆ Glucose ] ──► Stored Plant Food'
          : undefined,
      practiceQuestion: {
        question: 'Which gas is released into the atmosphere as a byproduct of photosynthesis?',
        options: ['Oxygen (O₂)', 'Carbon Dioxide (CO₂)', 'Nitrogen (N₂)', 'Methane (CH₄)'],
        answer: 'Oxygen (O₂), produced during the photolysis (splitting) of water molecules!'
      },
      followUpQuestions: followUps
    };
  }

  // Newton's Second Law (Science)
  if (lowerQ.includes('newton')) {
    return {
      responseType: 'conceptual',
      crossSubjectNotice: crossNotice,
      directAnswer: 'Newton’s second law of motion states that the rate of change of momentum of an object is directly proportional to the applied unbalanced force and takes place in the direction of the force.',
      simpleExplanation: 'In simple Class 9 terms: heavier objects require more force to speed up, and pushing harder makes an object accelerate faster. Formula: Force = mass × acceleration (F = ma).',
      stepByStep: [
        '1. Momentum (p): Mass × Velocity (p = mv).',
        '2. Rate of Change of Momentum: dp/dt = m(v - u)/t = ma (since acceleration a = (v - u)/t).',
        '3. Force Proportionality: Force is directly proportional to acceleration and mass.',
        '4. Formula: F = ma (Unit: Newton = kg · m/s²).'
      ],
      example: 'Example: A cricket fielder pulls their hands backward while catching a fast ball. Increasing the time taken reduces the rate of change of momentum, exerting far less force on the hands.',
      formulaOrCode: 'F = m · a\n\nWhere:\n• F = Force (in Newtons, N)\n• m = Mass of the object (in kilograms, kg)\n• a = Acceleration (in m/s²)',
      keyConcept: '1 Newton is the force needed to accelerate a 1 kg mass at 1 m/s².',
      analogy:
        style === 'Analogy'
          ? 'Pushing an empty shopping cart is effortless, but pushing a shopping cart loaded with heavy bricks requires massive effort to reach the same speed!'
          : undefined,
      visualDiagram:
        style === 'Visual'
          ? '  [ Low Mass: 1 kg ]  ──► Push with 10 N ──► [ High Acceleration: 10 m/s² ]\n  [ High Mass: 10 kg ] ──► Push with 10 N ──► [ Low Acceleration: 1 m/s² ]\n\n  Equation: F = m × a'
          : undefined,
      practiceQuestion: {
        question: 'What force is required to accelerate a 4 kg cart at 3 m/s²?',
        options: ['12 N', '7 N', '1 N', '24 N'],
        answer: '12 N (F = m × a = 4 kg × 3 m/s² = 12 N)'
      },
      followUpQuestions: followUps
    };
  }

  // Digestive System (Science)
  if (lowerQ.includes('digestive') || lowerQ.includes('digestion')) {
    return {
      responseType: 'conceptual',
      crossSubjectNotice: crossNotice,
      directAnswer: 'The human digestive system is a continuous muscular tube (alimentary canal) that breaks down complex, insoluble food into simple, soluble molecules absorbed by the bloodstream.',
      simpleExplanation: 'Digestion starts in the mouth, passes through the esophagus into the acidic stomach, gets broken down by enzymes in the small intestine, and waste is excreted by the large intestine.',
      stepByStep: [
        '1. Mouth: Teeth chew food; salivary amylase enzyme begins starch breakdown.',
        '2. Stomach: Secretes Hydrochloric acid (HCl) to kill germs and activate pepsin (digests proteins).',
        '3. Small Intestine: Complete digestion of carbs, proteins, and fats with bile and pancreatic juice.',
        '4. Absorption: Finger-like projections called villi absorb nutrients into blood capillaries.',
        '5. Large Intestine: Absorbs excess water and forms stool for elimination.'
      ],
      example: 'Example: Chewing plain bread for 30 seconds makes it taste sweet because salivary amylase breaks down starch into simple maltose sugar.',
      formulaOrCode: 'Key Digestive Enzymes:\n• Salivary Amylase: Starch ──► Maltose\n• Pepsin (Stomach): Proteins ──► Peptides\n• Bile (Liver): Emulsifies large fat droplets\n• Lipase: Fats ──► Fatty acids + Glycerol',
      keyConcept: 'The small intestine is the longest organ of the alimentary canal and the site of complete digestion and nutrient absorption.',
      analogy:
        style === 'Analogy'
          ? 'Think of the digestive tract like a recycling dismantling factory line: food enters as a complex machine, and specialized robotic arms (enzymes) unbolt individual nuts, bolts, and metal pieces for easy transport!'
          : undefined,
      visualDiagram:
        style === 'Visual'
          ? '  Mouth (Salivary Amylase) ──► Esophagus (Peristalsis)\n       │\n  Stomach (HCl + Pepsin) ──► Small Intestine (Villi Absorption + Bile)\n       │\n  Large Intestine (Water Absorption) ──► Anus (Excretion)'
          : undefined,
      practiceQuestion: {
        question: 'Where in the human body does the complete digestion of carbohydrates, proteins, and fats take place?',
        options: ['Stomach', 'Small Intestine', 'Large Intestine', 'Mouth'],
        answer: 'Small Intestine (assisted by bile juice and pancreatic enzymes)'
      },
      followUpQuestions: followUps
    };
  }

  // Atom (Science)
  if (lowerQ.includes('atom')) {
    return {
      responseType: 'conceptual',
      crossSubjectNotice: crossNotice,
      directAnswer: 'An atom is the basic building block of all matter and the smallest unit of a chemical element that retains all the chemical properties of that element.',
      simpleExplanation: 'An atom has a dense central nucleus made of positively charged protons and neutral neutrons, with tiny negatively charged electrons orbiting around it in shells.',
      stepByStep: [
        '1. Protons (+1 charge): Located in the nucleus, determines the element’s atomic number.',
        '2. Neutrons (0 charge): Located in the nucleus, adds mass and nuclear stability.',
        '3. Electrons (-1 charge): Very light, orbit in energy levels (K, L, M shells) around the nucleus.',
        '4. Electrical Neutrality: Number of protons equals number of electrons in a neutral atom.'
      ],
      example: 'Example: Carbon (Atomic number 6) has 6 protons, 6 neutrons, and 6 electrons arranged as 2 in the K-shell and 4 in the L-shell.',
      formulaOrCode: 'Subatomic Particles:\n• Proton: Charge = +1, Mass ≈ 1 u\n• Neutron: Charge = 0, Mass ≈ 1 u\n• Electron: Charge = -1, Mass ≈ 1/1840 u\n\nAtomic Mass Number (A) = Protons + Neutrons',
      keyConcept: 'Electrons in the outermost shell (valence electrons) determine how the atom bonds with other atoms.',
      analogy:
        style === 'Analogy'
          ? 'Imagine a giant sports stadium: the dense nucleus is like a small marble sitting on the 50-yard line, while the electrons are like tiny gnats buzzing in the topmost bleachers!'
          : undefined,
      visualDiagram:
        style === 'Visual'
          ? '              ( - ) Electron Orbiting\n               ╭─────╮\n            ╭──╯     ╰──╮\n            │   [ +  N ] │  <-- Nucleus (Protons + Neutrons)\n            ╰──╮     ╭──╯\n               ╰─────╯\n              ( - ) Electron'
          : undefined,
      practiceQuestion: {
        question: 'Which subatomic particle has a negative electrical charge?',
        options: ['Proton', 'Electron', 'Neutron', 'Nucleus'],
        answer: 'Electron (Carries -1 unit negative charge)'
      },
      followUpQuestions: followUps
    };
  }

  // Nouns and Pronouns (English)
  if (lowerQ.includes('noun') || lowerQ.includes('pronoun')) {
    return {
      responseType: 'conceptual',
      crossSubjectNotice: crossNotice,
      directAnswer: 'A noun is a naming word for a person, place, thing, or idea. A pronoun is a word used in place of a noun to prevent repetitive phrasing.',
      simpleExplanation: 'Instead of repeating "Khushi went to Khushi\'s school because Khushi had an exam", we use the pronoun "she" and "her": "Khushi went to her school because she had an exam."',
      stepByStep: [
        '1. Proper Noun: Specific name of a person or place (e.g. India, Khushi, Delhi) — always capitalized.',
        '2. Common Noun: General name of a class of objects (e.g. girl, city, book, school).',
        '3. Personal Pronouns: Words like I, you, he, she, it, we, they.',
        '4. Antecedent: The noun that the pronoun refers back to.'
      ],
      example: 'Example: "The students completed the project, and they presented it to the teacher." ("Students" = noun; "they" and "it" = pronouns).',
      formulaOrCode: 'Classification:\n• Noun Types: Proper, Common, Collective (swarm, herd), Abstract (honesty, courage)\n• Pronoun Types: Personal (he/she), Relative (who/which/that), Demonstrative (this/that)',
      keyConcept: 'Pronoun-Antecedent Agreement: A pronoun must agree in gender and number (singular/plural) with the noun it replaces.',
      analogy:
        style === 'Analogy'
          ? 'A pronoun is like a designated substitute player on a sports team: when the star player (the noun) needs to sit out to avoid fatigue, the substitute takes their exact place seamlessly!'
          : undefined,
      visualDiagram:
        style === 'Visual'
          ? '   [ Noun: "Aarav" ] ────────► Performs Action ("Aarav scored a goal")\n           │\n           ▼\n   [ Pronoun: "He" ] ────────► Substitutes Noun ("He celebrated with his team")'
          : undefined,
      practiceQuestion: {
        question: 'Identify the pronoun in this sentence: "The dog wagged its tail happily."',
        options: ['dog', 'wagged', 'its', 'tail'],
        answer: '"its" (Possessive pronoun referring to the dog)'
      },
      followUpQuestions: followUps
    };
  }

  // Active and Passive Voice (English)
  if (lowerQ.includes('active') || lowerQ.includes('passive')) {
    return {
      responseType: 'conceptual',
      crossSubjectNotice: crossNotice,
      directAnswer: 'In Active Voice, the subject performs the action. In Passive Voice, the subject receives the action, focusing on the result rather than the doer.',
      simpleExplanation: 'Active: "The chef cooked the meal." Passive: "The meal was cooked by the chef." In passive voice, the original object becomes the new subject.',
      stepByStep: [
        '1. Swap Subject and Object: The object of the active sentence moves to the front.',
        '2. Use Auxiliary "to be": Insert appropriate form of "be" (is, am, are, was, were, been).',
        '3. Use Past Participle (V3): The main verb is always converted to its 3rd form (cooked, written, eaten).',
        '4. Add "by [Agent]": Mention the original doer with "by" (optional if doer is unknown or obvious).'
      ],
      example: 'Example: "Khushi wrote the essay." (Active) ──► "The essay was written by Khushi." (Passive)',
      formulaOrCode: 'Active Structure:   Subject + Verb + Object\nPassive Structure:  Object + Form of "be" + V3 (Past Participle) + by + Subject',
      keyConcept: 'Only transitive verbs (verbs that take a direct object) can be converted into passive voice.',
      analogy:
        style === 'Analogy'
          ? 'Active voice is like shooting a movie focusing on the thrower throwing the ball. Passive voice switches the camera angle to focus on the ball being caught!'
          : undefined,
      visualDiagram:
        style === 'Visual'
          ? '  ACTIVE:   [ Subject (Doer) ] ──► [ Action ] ──► [ Object (Receiver) ]\n                   │                                      │\n                   ▼                                      ▼\n  PASSIVE:  [ Object (Receiver) ] ──► [ Was + V3 ] ──► [ By Doer ]'
          : undefined,
      practiceQuestion: {
        question: 'Convert to Passive Voice: "The teacher praised the student."',
        options: [
          'The student was praised by the teacher.',
          'The student is praised by the teacher.',
          'The teacher was praising the student.',
          'The student praised the teacher.'
        ],
        answer: 'The student was praised by the teacher. (Simple past "praised" converts to "was praised")'
      },
      followUpQuestions: followUps
    };
  }

  // Metaphor and Simile (English)
  if (lowerQ.includes('metaphor') || lowerQ.includes('simile')) {
    return {
      responseType: 'conceptual',
      crossSubjectNotice: crossNotice,
      directAnswer: 'A metaphor is a figure of speech that directly describes an object or action as being another unrelated thing, without using "like" or "as".',
      simpleExplanation: 'A simile says something is LIKE something else ("He is as brave as a lion"). A metaphor makes a direct equation ("He is a lion in battle").',
      stepByStep: [
        '1. Simile: Uses comparison words "like" or "as" (e.g. "Her smile is like sunshine").',
        '2. Metaphor: Makes a direct statement of equivalence (e.g. "Her smile is sunshine").',
        '3. Purpose: Enhances imagery, emotional resonance, and poetic depth in writing.'
      ],
      example: 'Example: "Time is a thief." (Metaphor — time does not literally steal, but it slips away like a thief).',
      formulaOrCode: 'Comparison:\n• Simile: [A] is LIKE / AS [B]  (e.g., "Life is like a box of chocolates")\n• Metaphor: [A] IS [B]          (e.g., "All the world\'s a stage")',
      keyConcept: 'Metaphors create stronger, more imaginative associations because they assert identity rather than mere resemblance.',
      analogy:
        style === 'Analogy'
          ? 'A simile is like saying a replica jacket looks like a diamond coat. A metaphor declares "This jacket IS pure diamond!"'
          : undefined,
      visualDiagram:
        style === 'Visual'
          ? '  Simile:    [ Person ] ─────"LIKE"─────► [ Lion ]  (Comparison bridge)\n  Metaphor:  [ Person ] ═══════"IS"══════► [ Lion ]  (Direct merge)'
          : undefined,
      practiceQuestion: {
        question: 'Which of the following is a metaphor?',
        options: [
          'The snow is a white blanket.',
          'The snow is as cold as ice.',
          'The child slept like a log.',
          'He ran as fast as the wind.'
        ],
        answer: '"The snow is a white blanket." (Direct equivalence without using "like" or "as")'
      },
      followUpQuestions: followUps
    };
  }

  // Indian Constitution (Social Science)
  if (lowerQ.includes('constitution')) {
    return {
      responseType: 'conceptual',
      crossSubjectNotice: crossNotice,
      directAnswer: 'The Indian Constitution is the supreme legal document of India that defines the political principles, establishes government structure, and guarantees fundamental rights to all citizens.',
      simpleExplanation: 'Drafted by the Constituent Assembly headed by Dr. B.R. Ambedkar, it came into effect on 26th January 1950 (celebrated as Republic Day). It is the longest written constitution in the world.',
      stepByStep: [
        '1. Preamble: The introduction declaring India a Sovereign, Socialist, Secular, Democratic Republic.',
        '2. Fundamental Rights: Six core rights (Equality, Freedom, Against Exploitation, Religion, Culture/Education, Constitutional Remedies).',
        '3. Directive Principles: Guidelines for the government to create social and economic justice.',
        '4. Three Pillars of Government: Legislature (makes laws), Executive (implements laws), Judiciary (interprets laws).'
      ],
      example: 'Example: The Right to Equality (Article 14-18) ensures that all citizens, regardless of religion, caste, gender, or wealth, are treated equally before the law.',
      formulaOrCode: 'Core Constitutional Pillars:\n1. Legislature: Parliament (Lok Sabha + Rajya Sabha)\n2. Executive: President, Prime Minister & Council of Ministers\n3. Judiciary: Supreme Court (Guardian of the Constitution)',
      keyConcept: 'Constitutional Supremacy: No law, policy, or government official is above the Constitution.',
      analogy:
        style === 'Analogy'
          ? 'Think of the Constitution like the official rulebook of a major sporting league: it sets the game rules, limits the referee\'s powers, and ensures fair play for all players on the field!'
          : undefined,
      visualDiagram:
        style === 'Visual'
          ? '                  [ CONSTITUTION OF INDIA ]\n                 /           │           \\\n    [ LEGISLATURE ]   [ EXECUTIVE ]   [ JUDICIARY ]\n     (Makes Laws)     (Implements)    (Guards & Interprets)\n           │                 │                 │\n           └───────── Check & Balances ────────┘'
          : undefined,
      practiceQuestion: {
        question: 'When did the Constitution of India officially come into effect?',
        options: ['15th August 1947', '26th January 1950', '26th November 1949', '2nd October 1952'],
        answer: '26th January 1950 (Celebrated annually as Republic Day)'
      },
      followUpQuestions: followUps
    };
  }

  // Democracy (Social Science)
  if (lowerQ.includes('democracy') || lowerQ.includes('democratic')) {
    return {
      responseType: 'conceptual',
      crossSubjectNotice: crossNotice,
      directAnswer: 'Democracy is a system of government in which supreme power is vested in the people and exercised directly or through elected representatives under a free electoral system.',
      simpleExplanation: 'In Abraham Lincoln\'s famous words: "Democracy is government of the people, by the people, for the people." Citizens vote to choose who leads and holds power.',
      stepByStep: [
        '1. Free and Fair Elections: Regular elections where those in power have a fair chance of losing.',
        '2. Universal Adult Franchise: Every adult citizen has one vote, and every vote has equal value.',
        '3. Rule of Law: Government decisions are bounded by constitutional laws and citizens\' rights.',
        '4. Accountability & Correction: Rulers must explain their actions to citizens and can be voted out.'
      ],
      example: 'Example: In India\'s general elections, over 900 million citizens cast their vote to elect Members of Parliament (MPs) in the Lok Sabha.',
      formulaOrCode: 'Key Democratic Values:\n• Liberty: Freedom of speech, assembly, and belief\n• Equality: One person, one vote, one value\n• Fraternity: Unity and mutual respect across diverse communities',
      keyConcept: 'Democracy improves the quality of decision-making and provides a peaceful mechanism to resolve social conflicts.',
      analogy:
        style === 'Analogy'
          ? 'In a family movie night, if the eldest sibling dictates the movie every time, that is a monarchy. If everyone votes on their favorite movie and majority wins, that is democracy!'
          : undefined,
      visualDiagram:
        style === 'Visual'
          ? '   [ Citizens of the Nation ]\n               │ (Universal Adult Franchise - 1 Vote Each)\n               ▼\n   [ Free & Fair Elections ]\n               │\n               ▼\n   [ Elected Representatives / Government ] ──► Accountable to the People'
          : undefined,
      practiceQuestion: {
        question: 'What is the principle of "Universal Adult Franchise"?',
        options: [
          'Only educated adults can vote',
          'Every adult citizen has one vote of equal value',
          'Only property owners can vote',
          'Only city residents can vote'
        ],
        answer: 'Every adult citizen has one vote of equal value, regardless of gender, caste, or wealth'
      },
      followUpQuestions: followUps
    };
  }

  // French Revolution (Social Science)
  if (lowerQ.includes('french revolution')) {
    return {
      responseType: 'conceptual',
      crossSubjectNotice: crossNotice,
      directAnswer: 'The French Revolution (1789-1799) was a watershed period of social and political upheaval in France that abolished the feudal monarchy and established democratic principles.',
      simpleExplanation: 'Common people were starving and burdened by heavy taxes while the King (Louis XVI), nobility, and clergy paid zero taxes and lived in extreme luxury.',
      stepByStep: [
        '1. Social Inequality: Society was split into 3 Estates. The 3rd Estate (98% of population) paid all taxes.',
        '2. Economic Crisis: War debts and bad harvests created a severe food shortage and price surge in bread.',
        '3. Intellectual Influence: Philosophers like Rousseau, Montesquieu, and Voltaire advocated for liberty and equal rights.',
        '4. Outbreak (1789): Storming of the Bastille prison on July 14, 1789, followed by the Declaration of the Rights of Man.'
      ],
      example: 'Example: The motto of the French Revolution — "Liberté, Égalité, Fraternité" (Liberty, Equality, Fraternity) — became the foundation for modern democracies worldwide.',
      formulaOrCode: 'The Three Estates of Pre-Revolutionary France:\n• 1st Estate: Clergy (Church leaders - exempt from tax)\n• 2nd Estate: Nobility (Feudal aristocrats - exempt from tax)\n• 3rd Estate: Peasants, artisans, merchants, doctors (Paid all taxes: Tithe + Taille)',
      keyConcept: 'The French Revolution ended feudal privileges and introduced the concept of fundamental human rights to world politics.',
      analogy:
        style === 'Analogy'
          ? 'Imagine a team project where 98 students do all the research and pay all expenses, while 2 students take all the praise and pay nothing. Eventually, the 98 students revolt!'
          : undefined,
      visualDiagram:
        style === 'Visual'
          ? '     [ 1st Estate: Clergy ]   (1% pop, No taxes, owns 10% land)\n     [ 2nd Estate: Nobility ] (2% pop, No taxes, owns 25% land)\n  ─────────────────────────────────────────────────────────────\n     [ 3rd Estate: Peasants & Bourgeoisie ] (97% pop, Pays 100% of Taxes)\n                         │\n                         ▼\n           [ REVOLUTION (July 14, 1789) ]'
          : undefined,
      practiceQuestion: {
        question: 'Which fortress prison was stormed by the citizens of Paris on July 14, 1789?',
        options: ['The Bastille', 'Versailles', 'The Louvre', 'Notre-Dame'],
        answer: 'The Bastille (A dreaded symbol of the King\'s despotic power)'
      },
      followUpQuestions: followUps
    };
  }

  // Parliament (Social Science)
  if (lowerQ.includes('parliament')) {
    return {
      responseType: 'conceptual',
      crossSubjectNotice: crossNotice,
      directAnswer: 'The Parliament of India (Sansad) is the supreme legislative body responsible for making laws, scrutinizing government actions, and controlling public finances.',
      simpleExplanation: 'India has a bicameral parliament consisting of the President and two houses: the Lok Sabha (House of the People) and the Rajya Sabha (Council of States).',
      stepByStep: [
        '1. Law Making: Any proposed law (Bill) must be debated and passed by both houses before receiving Presidential assent.',
        '2. Controlling the Executive: Parliament holds ministers accountable through Question Hour and No-Confidence motions.',
        '3. Passing the National Budget: No taxes can be collected or money spent without parliamentary approval.',
        '4. Representing Citizens: MPs voice grievances and represent regional needs of their constituencies.'
      ],
      example: 'Example: The Union Budget presented by the Finance Minister every year must be thoroughly debated and approved by Parliament before funds can be released.',
      formulaOrCode: 'Structure of the Indian Parliament:\n• President of India\n• Lok Sabha (Lower House): Up to 543 directly elected members (5-year term)\n• Rajya Sabha (Upper House): 245 members representing states (Permanent house, 6-year terms)',
      keyConcept: 'The Lok Sabha exercises greater power than Rajya Sabha in money matters and confidence motions.',
      analogy:
        style === 'Analogy'
          ? 'Think of Parliament like a national town hall meeting where delegates from every city and village debate the school rules, manage the lunch budget, and check on the principal!'
          : undefined,
      visualDiagram:
        style === 'Visual'
          ? '                     [ PARLIAMENT OF INDIA ]\n                     /          │          \\\n        [ Lok Sabha ]     [ President ]     [ Rajya Sabha ]\n     (Directly Elected)    (Assents Bills)  (State Reps)\n              │                                     │\n              └────────── Passes Laws ──────────────┘'
          : undefined,
      practiceQuestion: {
        question: 'Which house of the Indian Parliament is directly elected by the citizens?',
        options: ['Lok Sabha', 'Rajya Sabha', 'Vidhan Parishad', 'Supreme Court'],
        answer: 'Lok Sabha (The House of the People)'
      },
      followUpQuestions: followUps
    };
  }

  // Generic Dynamic Conceptual Fallback
  const calibrationNote = getGradeCalibrationNote(gradeLevel, board, stream);

  return {
    responseType: 'conceptual',
    crossSubjectNotice: crossNotice,
    directAnswer: `In ${gradeLevel || 'Class 9'} ${subject}, "${question}" connects directly to core principles of ${topic}.`,
    simpleExplanation: `Here is a clear breakdown tailored to your curriculum: ${calibrationNote} Mastering this topic requires understanding the cause-and-effect relationship, foundational definitions, and practical applications.`,
    stepByStep: [
      `1. Core Definition: Establish the foundational concept within ${subject}.`,
      `2. Key Components: Identify the essential variables, factors, or entities involved.`,
      `3. Mechanism / Process: Trace how these components interact in standard scenarios.`,
      `4. Conclusion & Significance: Understand why this concept matters in ${board || 'board'} examinations and real life.`
    ],
    example: `Example: In your academic curriculum, principles of ${subject} provide the underlying logic that explains why systems function predictably.`,
    keyConcept: `Curriculum Rule in ${subject}: Focus on the foundational mechanism rather than memorizing isolated terms.`,
    analogy:
      style === 'Analogy'
        ? 'Think of this concept like an engine where each gear has a designated job. When each gear turns in sequence, the entire vehicle moves forward smoothly!'
        : undefined,
    visualDiagram:
      style === 'Visual'
        ? `[ Input / Premise in ${subject} ] ──► [ Core Mechanism ] ──► [ Verified Conclusion ]`
        : undefined,
    practiceQuestion: {
      question: `Check your understanding: What is the primary principle behind this ${subject} concept?`,
      answer: `The foundational law of ${subject} linking cause, process, and outcome systematically.`
    },
    followUpQuestions: followUps
  };
}
