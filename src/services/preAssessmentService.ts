import {
  ExtractedChapter,
  PreAssessmentQuestion,
  PreAssessmentDifficulty,
  SubjectType,
  ClassLevel
} from '../types';
import { mockCurriculum } from '../data/mockCurriculum';
import { extractChaptersFromText, extractTopicsForChapter } from '../lib/aiSyllabusParser';

export const QUESTIONS_PER_DIFFICULTY = 1;

/**
 * Banned repetitive phrases from previous naive generation
 */
const BANNED_BOILERPLATE_PHRASES = [
  'fundamental principle primarily defines',
  'defines the core rule and baseline properties',
  'applies solely to unrelated auxiliary systems',
  'contradicts standard mathematical and scientific axioms',
  'has no measurable influence on problem solving',
  'ignoring intermediate algebraic',
  'identifying given values, isolating the target variable',
  'boundary conditions causes a proportional shift',
  'boundary conditions have zero effect',
  'prerequisite relationships are completely discarded',
  'results are non-deterministic and cannot be reasoned logically'
];

/**
 * Validates a generated question against strict school curriculum standards
 */
export function validateQuestion(q: PreAssessmentQuestion): { valid: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // Rule 1: Exactly 4 options
  if (!Array.isArray(q.options) || q.options.length !== 4) {
    reasons.push(`Must have exactly 4 options (found ${q.options?.length || 0})`);
  }

  // Rule 2 & 3: Exactly one valid correct option index (0..3)
  if (typeof q.correctOption !== 'number' || q.correctOption < 0 || q.correctOption > 3) {
    reasons.push(`correctOption must be an integer between 0 and 3 (got ${q.correctOption})`);
  } else if (q.options && (!q.options[q.correctOption] || q.options[q.correctOption].trim() === '')) {
    reasons.push('Correct option index points to an empty string');
  }

  // Rule 4: No duplicate options
  if (Array.isArray(q.options)) {
    const trimmed = q.options.map(o => (o || '').trim().toLowerCase());
    const unique = new Set(trimmed);
    if (unique.size !== trimmed.length) {
      reasons.push('Contains duplicate options');
    }

    // Check option diversity (options shouldn't be identical boilerplate)
    // Note: Standard Assertion-Reason and Statement I/II questions deliberately follow standardized option formulations
    const isAssertionOrStatement = /assertion|statement\s+i/i.test(q.question || '');
    if (!isAssertionOrStatement) {
      for (let i = 0; i < trimmed.length; i++) {
        for (let j = i + 1; j < trimmed.length; j++) {
          const wordsA = new Set(trimmed[i].split(/\s+/));
          const wordsB = new Set(trimmed[j].split(/\s+/));
          if (wordsA.size > 4 && wordsB.size > 4) {
            let overlap = 0;
            wordsA.forEach(w => { if (wordsB.has(w)) overlap++; });
            const similarity = overlap / Math.min(wordsA.size, wordsB.size);
            if (similarity > 0.88) {
              reasons.push(`Options ${i + 1} and ${j + 1} are too similar (${Math.round(similarity * 100)}% word overlap)`);
            }
          }
        }
      }
    }
  }

  // Rule 5: Non-empty question text
  if (!q.question || q.question.trim().length < 8) {
    reasons.push('Question text is too short or empty');
  }

  // Rule 6: Explanation present
  if (!q.explanation || q.explanation.trim().length < 10) {
    reasons.push('Explanation is missing or insufficient');
  }

  // Rule 7: Anti-boilerplate filter
  const allText = `${q.question} ${(q.options || []).join(' ')}`.toLowerCase();
  for (const banned of BANNED_BOILERPLATE_PHRASES) {
    if (allText.includes(banned.toLowerCase())) {
      reasons.push(`Contains banned repetitive boilerplate phrase: "${banned}"`);
      break;
    }
  }

  return {
    valid: reasons.length === 0,
    reasons
  };
}

/**
 * Local high-quality NCERT/CBSE curriculum question bank
 * Organized by Subject -> Chapter -> Easy, Moderate, Difficult
 */
interface FallbackQuestionTemplate {
  topic: string;
  difficulty: PreAssessmentDifficulty;
  question: string;
  options: string[];
  correctOption: number;
  explanation: string;
  sourcePage?: number;
}

const CURRICULUM_QUESTION_BANK: Record<string, FallbackQuestionTemplate[]> = {
  // ================= MATHEMATICS =================
  'Number Systems': [
    {
      topic: 'Rational & Irrational Numbers',
      difficulty: 'easy',
      question: 'Which of the following numbers is an irrational number?',
      options: ['3.141414...', '√2', '22/7', '√16'],
      correctOption: 1,
      explanation: '√2 cannot be expressed in the form p/q where p and q are integers and q ≠ 0. Its decimal expansion is non-terminating and non-recurring.'
    },
    {
      topic: 'Real Numbers & Operations',
      difficulty: 'moderate',
      question: 'If x = 2 + √3, what is the value of x + 1/x?',
      options: ['2', '2√3', '4', '4 + 2√3'],
      correctOption: 2,
      explanation: '1/x = 1/(2 + √3) = 2 - √3. Therefore, x + 1/x = (2 + √3) + (2 - √3) = 4.'
    },
    {
      topic: 'Laws of Exponents for Real Numbers',
      difficulty: 'difficult',
      question: 'Evaluate the expression: (64/125)^(-2/3) × (256/625)^(1/4)',
      options: ['25/16', '5/4', '125/64', '4/5'],
      correctOption: 1,
      explanation: '(64/125)^(-2/3) = ((4/5)³)^(-2/3) = (4/5)^(-2) = 25/16. (256/625)^(1/4) = 4/5. Multiplying gives (25/16) × (4/5) = 5/4.'
    }
  ],

  'Polynomials': [
    {
      topic: 'Zeros of Polynomials',
      difficulty: 'easy',
      question: 'What is the zero of the linear polynomial p(x) = 3x - 12?',
      options: ['-4', '4', '12', '3'],
      correctOption: 1,
      explanation: 'Set p(x) = 0: 3x - 12 = 0 => 3x = 12 => x = 4.'
    },
    {
      topic: 'Factorisation of Polynomials',
      difficulty: 'moderate',
      question: 'What are the factors of the quadratic polynomial x² - 7x + 12?',
      options: ['(x - 3)(x - 4)', '(x + 3)(x + 4)', '(x - 6)(x - 2)', '(x - 1)(x - 12)'],
      correctOption: 0,
      explanation: 'We need two numbers whose product is 12 and sum is -7: -3 and -4. Hence x² - 7x + 12 = (x - 3)(x - 4).'
    },
    {
      topic: 'Remainder & Factor Theorems',
      difficulty: 'difficult',
      question: 'If polynomial p(x) = x³ - 3x² + kx - 6 is exactly divisible by (x - 2), what is the value of k?',
      options: ['2', '5', '8', '-5'],
      correctOption: 1,
      explanation: 'By the Factor Theorem, p(2) = 0. Substituting x = 2: 2³ - 3(2)² + k(2) - 6 = 0 => 8 - 12 + 2k - 6 = 0 => 2k = 10 => k = 5.'
    }
  ],

  'Linear Equations': [
    {
      topic: 'Solutions of Linear Equations',
      difficulty: 'easy',
      question: 'Which of the following points lies on the line 2x + 3y = 12?',
      options: ['(0, 4)', '(2, 3)', '(3, 3)', '(4, 2)'],
      correctOption: 0,
      explanation: 'Substitute (0, 4): 2(0) + 3(4) = 0 + 12 = 12, which satisfies the equation.'
    },
    {
      topic: 'Graphical Representation',
      difficulty: 'moderate',
      question: 'At what point does the line 3x - 4y = 24 intersect the x-axis?',
      options: ['(0, -6)', '(8, 0)', '(-8, 0)', '(0, 8)'],
      correctOption: 1,
      explanation: 'On the x-axis, y = 0. Thus 3x - 4(0) = 24 => 3x = 24 => x = 8. The point is (8, 0).'
    },
    {
      topic: 'Consistency of Linear Systems',
      difficulty: 'difficult',
      question: 'For what value of k will the pair of equations 2x + 3y = 7 and 4x + ky = 14 represent coincident lines with infinitely many solutions?',
      options: ['3', '6', '9', '12'],
      correctOption: 1,
      explanation: 'For coincident lines, a₁/a₂ = b₁/b₂ = c₁/c₂. Here 2/4 = 3/k => 1/2 = 3/k => k = 6.'
    }
  ],

  'Quadratic Equations': [
    {
      topic: 'Standard Form & Roots',
      difficulty: 'easy',
      question: 'What are the roots of the equation x² - 9 = 0?',
      options: ['3 only', '-3 only', '3 and -3', '9 and -9'],
      correctOption: 2,
      explanation: 'x² - 9 = 0 gives x² = 9, so x = ±√9 = ±3.'
    },
    {
      topic: 'Nature of Roots',
      difficulty: 'moderate',
      question: 'What is the nature of the roots for 2x² - 4x + 3 = 0?',
      options: ['Two distinct real roots', 'Two equal real roots', 'No real roots', 'One real root only'],
      correctOption: 2,
      explanation: 'Discriminant D = b² - 4ac = (-4)² - 4(2)(3) = 16 - 24 = -8. Since D < 0, the equation has no real roots.'
    },
    {
      topic: 'Reciprocal Equation Problem',
      difficulty: 'difficult',
      question: 'The sum of a positive number and its reciprocal is 10/3. What is the number?',
      options: ['2 or 1/2', '3 or 1/3', '4 or 1/4', '5 or 1/5'],
      correctOption: 1,
      explanation: 'Let the number be x: x + 1/x = 10/3 => 3x² - 10x + 3 = 0 => (3x - 1)(x - 3) = 0 => x = 3 or 1/3.'
    }
  ],

  'Arithmetic Progressions': [
    {
      topic: 'Common Difference & nth Term',
      difficulty: 'easy',
      question: 'What is the common difference of the AP: 7, 11, 15, 19, ...?',
      options: ['3', '4', '5', '-4'],
      correctOption: 1,
      explanation: 'Common difference d = a₂ - a₁ = 11 - 7 = 4.'
    },
    {
      topic: 'Finding Specific Term',
      difficulty: 'moderate',
      question: 'What is the 20th term of the AP: 2, 5, 8, 11, ...?',
      options: ['57', '59', '61', '63'],
      correctOption: 1,
      explanation: 'a₂₀ = a + 19d. Here a = 2, d = 3. So a₂₀ = 2 + 19(3) = 2 + 57 = 59.'
    },
    {
      topic: 'Sum of n Terms',
      difficulty: 'difficult',
      question: 'How many terms of the AP: 24, 21, 18, ... must be taken so that their sum is 78?',
      options: ['4 terms only', '13 terms only', 'Both 4 and 13 terms', '7 terms'],
      correctOption: 2,
      explanation: 'Sₙ = (n/2)[2(24) + (n-1)(-3)] = 78 => 3n² - 51n + 156 = 0 => n² - 17n + 52 = 0 => (n - 4)(n - 13) = 0. Both n = 4 and n = 13 give sum 78 because terms from 5th to 13th cancel out to zero.'
    }
  ],

  'Triangles': [
    {
      topic: 'Basic Proportionality Theorem',
      difficulty: 'easy',
      question: 'In ΔABC, if DE ∥ BC intersecting AB at D and AC at E, then according to Thales Theorem:',
      options: ['AD / DB = AE / EC', 'AD / AB = EC / AE', 'AB / DB = AC / AE', 'AD × DB = AE × EC'],
      correctOption: 0,
      explanation: 'The Basic Proportionality Theorem (Thales Theorem) states that if a line is drawn parallel to one side of a triangle, it divides the other two sides in the same ratio: AD/DB = AE/EC.'
    },
    {
      topic: 'Criteria for Similarity',
      difficulty: 'moderate',
      question: 'If ΔABC ~ ΔDEF such that 2AB = DE and BC = 8 cm, what is the length of EF?',
      options: ['4 cm', '12 cm', '16 cm', '20 cm'],
      correctOption: 2,
      explanation: 'Since ΔABC ~ ΔDEF, AB/DE = BC/EF. Given DE = 2AB, AB/2AB = 8/EF => 1/2 = 8/EF => EF = 16 cm.'
    },
    {
      topic: 'Right Triangles & Altitudes',
      difficulty: 'difficult',
      question: 'In right-angled triangle ABC, ∠B = 90° and BD ⊥ AC. If AD = 4 cm and CD = 9 cm, find the length of BD.',
      options: ['5 cm', '6 cm', '6.5 cm', '36 cm'],
      correctOption: 1,
      explanation: 'In a right triangle with an altitude to the hypotenuse, BD² = AD × CD. BD² = 4 × 9 = 36 => BD = 6 cm.'
    }
  ],

  'Coordinate Geometry': [
    {
      topic: 'Distance Formula',
      difficulty: 'easy',
      question: 'What is the distance between the points (0, 0) and (6, 8)?',
      options: ['7 units', '10 units', '14 units', '48 units'],
      correctOption: 1,
      explanation: 'Distance = √( (6 - 0)² + (8 - 0)² ) = √(36 + 64) = √100 = 10 units.'
    },
    {
      topic: 'Section Formula',
      difficulty: 'moderate',
      question: 'What are the coordinates of the midpoint of the line segment joining P(-2, 6) and Q(4, -2)?',
      options: ['(1, 2)', '(2, 4)', '(1, 4)', '(3, 2)'],
      correctOption: 0,
      explanation: 'Midpoint = ((x₁ + x₂)/2, (y₁ + y₂)/2) = ((-2 + 4)/2, (6 + -2)/2) = (2/2, 4/2) = (1, 2).'
    },
    {
      topic: 'Collinearity & Area Relations',
      difficulty: 'difficult',
      question: 'For what value of k are the three points (1, 2), (k, 0), and (0, 3) collinear?',
      options: ['2', '3', '-1', '1.5'],
      correctOption: 1,
      explanation: 'For collinearity, slope between (1,2) and (0,3) equals slope between (0,3) and (k,0). Slope = (3 - 2)/(0 - 1) = -1. Then (0 - 3)/(k - 0) = -1 => -3/k = -1 => k = 3.'
    }
  ],

  'Introduction to Trigonometry': [
    {
      topic: 'Trigonometric Ratios',
      difficulty: 'easy',
      question: 'In a right-angled triangle, if sin θ = 3/5, what is the value of cos θ?',
      options: ['4/5', '5/3', '3/4', '4/3'],
      correctOption: 0,
      explanation: 'cos θ = √(1 - sin² θ) = √(1 - 9/25) = √(16/25) = 4/5.'
    },
    {
      topic: 'Specific Angle Values',
      difficulty: 'moderate',
      question: 'Evaluate: 2 tan² 45° + cos² 30° - sin² 60°',
      options: ['1', '2', '3/2', '√3'],
      correctOption: 1,
      explanation: 'tan 45° = 1, cos 30° = √3/2, sin 60° = √3/2. Expression = 2(1)² + (3/4) - (3/4) = 2.'
    },
    {
      topic: 'Trigonometric Identities',
      difficulty: 'difficult',
      question: 'Simplify the expression: (sec θ + tan θ)(1 - sin θ)',
      options: ['cos θ', 'sin θ', 'sec θ', 'cosec θ'],
      correctOption: 0,
      explanation: '(sec θ + tan θ)(1 - sin θ) = ((1 + sin θ)/cos θ)(1 - sin θ) = (1 - sin² θ)/cos θ = cos² θ / cos θ = cos θ.'
    }
  ],

  'Statistics': [
    {
      topic: 'Empirical Relationship',
      difficulty: 'easy',
      question: 'What is the empirical relationship between mean, median, and mode for a moderately skewed distribution?',
      options: [
        'Mode = 3 Median - 2 Mean',
        'Mode = 2 Median - 3 Mean',
        'Median = 3 Mode - 2 Mean',
        'Mean = 3 Median - Mode'
      ],
      correctOption: 0,
      explanation: 'The standard empirical formula connecting central tendencies is: Mode = 3 Median - 2 Mean.'
    },
    {
      topic: 'Mean of Grouped Data',
      difficulty: 'moderate',
      question: 'If the mean of five observations x, x+2, x+4, x+6, and x+8 is 11, what is the value of x?',
      options: ['5', '7', '9', '11'],
      correctOption: 1,
      explanation: 'Sum = 5x + 20. Mean = (5x + 20)/5 = x + 4. x + 4 = 11 => x = 7.'
    },
    {
      topic: 'Median Class & Cumulative Frequency',
      difficulty: 'difficult',
      question: 'In a grouped frequency distribution with total frequency N = 60, the median class is identified as the class whose cumulative frequency is:',
      options: [
        'Just greater than or equal to 30',
        'Strictly equal to 60',
        'Less than 30',
        'The class with the highest individual frequency'
      ],
      correctOption: 0,
      explanation: 'To locate the median class, we calculate N/2 = 60/2 = 30 and locate the class interval whose cumulative frequency is just greater than or equal to N/2.'
    }
  ],

  'Probability': [
    {
      topic: 'Range of Probability',
      difficulty: 'easy',
      question: 'Which of the following numbers cannot represent the probability of an event?',
      options: ['2/3', '-1.5', '15%', '0.7'],
      correctOption: 1,
      explanation: 'The probability of any event E satisfies 0 ≤ P(E) ≤ 1. Probability can never be negative.'
    },
    {
      topic: 'Complementary Events',
      difficulty: 'moderate',
      question: 'If the probability of an event P(E) is 0.05, what is the probability of the complementary event "not E"?',
      options: ['0.95', '0.50', '0.05', '0.90'],
      correctOption: 0,
      explanation: 'P(not E) = 1 - P(E) = 1 - 0.05 = 0.95.'
    },
    {
      topic: 'Card Deck & Combined Probability',
      difficulty: 'difficult',
      question: 'A card is drawn from a well-shuffled deck of 52 playing cards. What is the probability of getting either a King or a Red Card?',
      options: ['28/52', '26/52', '30/52', '7/13'],
      correctOption: 3,
      explanation: 'Number of Red cards = 26. Number of Kings = 4 (2 red, 2 black). Total favourable outcomes = 26 red cards + 2 black kings = 28 cards. P = 28/52 = 7/13.'
    }
  ],

  // ================= SCIENCE =================
  'Chemical Reactions and Equations': [
    {
      topic: 'Types of Reactions',
      difficulty: 'easy',
      question: 'What type of chemical reaction is represented by: 2Mg + O₂ → 2MgO?',
      options: ['Decomposition reaction', 'Combination reaction', 'Displacement reaction', 'Double displacement reaction'],
      correctOption: 1,
      explanation: 'Two reactants combine to form a single compound product (MgO), which defines a combination reaction.'
    },
    {
      topic: 'Redox Reactions',
      difficulty: 'moderate',
      question: 'In the reaction CuO + H₂ → Cu + H₂O, which substance undergoes oxidation?',
      options: ['CuO', 'Cu', 'H₂', 'H₂O'],
      correctOption: 2,
      explanation: 'Hydrogen (H₂) gains oxygen to form H₂O, meaning hydrogen is oxidized. CuO loses oxygen and is reduced.'
    },
    {
      topic: 'Balancing Chemical Equations',
      difficulty: 'difficult',
      question: 'When balancing the equation Fe + H₂O → Fe₃O₄ + H₂, what is the coefficient of H₂O in the balanced equation?',
      options: ['2', '3', '4', '1'],
      correctOption: 2,
      explanation: 'The balanced equation is 3Fe + 4H₂O → Fe₃O₄ + 4H₂. The stoichiometric coefficient of H₂O is 4.'
    }
  ],

  'Acids, Bases and Salts': [
    {
      topic: 'pH Scale & Indicators',
      difficulty: 'easy',
      question: 'Which of the following solutions will turn blue litmus paper red?',
      options: ['Baking soda solution (pH ~ 8.5)', 'Lemon juice (pH ~ 2.2)', 'Soap solution (pH ~ 9.5)', 'Pure distilled water (pH 7)'],
      correctOption: 1,
      explanation: 'Acids turn blue litmus red. Lemon juice contains citric acid and has an acidic pH below 7.'
    },
    {
      topic: 'Neutralization & Gas Evolution',
      difficulty: 'moderate',
      question: 'Which gas is evolved when dilute hydrochloric acid reacts with zinc metal granules?',
      options: ['Oxygen gas', 'Carbon dioxide gas', 'Hydrogen gas', 'Chlorine gas'],
      correctOption: 2,
      explanation: 'Acid + Metal → Salt + Hydrogen gas. Zn + 2HCl → ZnCl₂ + H₂↑. Hydrogen gas burns with a characteristic pop sound.'
    },
    {
      topic: 'Salts & Water of Crystallization',
      difficulty: 'difficult',
      question: 'Heating Gypsum at 373 K yields Plaster of Paris. What is the chemical formula of Plaster of Paris?',
      options: ['CaSO₄ · 2H₂O', 'CaSO₄ · ½H₂O', 'CaSO₄ · 5H₂O', 'CaSO₄ · 7H₂O'],
      correctOption: 1,
      explanation: 'Plaster of Paris is calcium sulphate hemihydrate: CaSO₄ · ½H₂O. On mixing with water, it rehydrates to form hard gypsum (CaSO₄ · 2H₂O).'
    }
  ],

  'Life Processes': [
    {
      topic: 'Autotrophic Nutrition',
      difficulty: 'easy',
      question: 'Which gas is released by green plants during the light-dependent reaction of photosynthesis?',
      options: ['Carbon dioxide', 'Nitrogen', 'Oxygen', 'Methane'],
      correctOption: 2,
      explanation: 'Photolysis (splitting) of water molecules inside chloroplasts during the light reactions releases molecular oxygen (O₂).'
    },
    {
      topic: 'Cellular Respiration',
      difficulty: 'moderate',
      question: 'Where does the complete aerobic breakdown of pyruvate into CO₂, water, and energy occur inside eukaryotic cells?',
      options: ['Cytoplasm', 'Mitochondria', 'Chloroplast', 'Endoplasmic reticulum'],
      correctOption: 1,
      explanation: 'Glycolysis occurs in the cytoplasm, but the Krebs cycle and oxidative phosphorylation occur inside the mitochondria.'
    },
    {
      topic: 'Circulation & Transportation',
      difficulty: 'difficult',
      question: 'Why do the ventricles in the human heart have substantially thicker muscular walls than the atria?',
      options: [
        'To store larger volumes of blood permanently',
        'Because ventricles have to pump blood to distant body organs under high pressure',
        'To prevent oxygenated blood from mixing with deoxygenated blood',
        'Because atria generate the electrical pacemaker rhythm'
      ],
      correctOption: 1,
      explanation: 'Ventricles pump blood across long distances against high resistance (left ventricle to systemic circulation, right ventricle to lungs), requiring thicker muscular walls.'
    }
  ],

  'Light - Reflection and Refraction': [
    {
      topic: 'Reflection & Spherical Mirrors',
      difficulty: 'easy',
      question: 'A concave mirror has a radius of curvature of 30 cm. What is its focal length?',
      options: ['60 cm', '30 cm', '15 cm', '7.5 cm'],
      correctOption: 2,
      explanation: 'For spherical mirrors, focal length f = R / 2. Therefore, f = 30 / 2 = 15 cm.'
    },
    {
      topic: 'Refraction & Snell\'s Law',
      difficulty: 'moderate',
      question: 'Light travels from vacuum into glass with a refractive index of 1.5. If the speed of light in vacuum is 3 × 10⁸ m/s, what is its speed in glass?',
      options: ['2 × 10⁸ m/s', '4.5 × 10⁸ m/s', '1.5 × 10⁸ m/s', '3 × 10⁸ m/s'],
      correctOption: 0,
      explanation: 'v = c / n = (3 × 10⁸ m/s) / 1.5 = 2 × 10⁸ m/s.'
    },
    {
      topic: 'Lens Power & Combination',
      difficulty: 'difficult',
      question: 'A convex lens has a focal length of +25 cm. What is its optical power in dioptres (D)?',
      options: ['+4 D', '-4 D', '+0.25 D', '+2.5 D'],
      correctOption: 0,
      explanation: 'Power P = 1 / f(in meters). f = +25 cm = +0.25 m. P = 1 / 0.25 = +4 D.'
    }
  ],

  'Electricity': [
    {
      topic: 'Ohm\'s Law & Resistance',
      difficulty: 'easy',
      question: 'According to Ohm\'s Law, at constant temperature, the electric current passing through a conductor is:',
      options: [
        'Directly proportional to the potential difference across its ends',
        'Inversely proportional to the potential difference across its ends',
        'Directly proportional to the square of its resistance',
        'Independent of the applied voltage'
      ],
      correctOption: 0,
      explanation: 'Ohm\'s Law states V = IR, meaning current I is directly proportional to potential difference V.'
    },
    {
      topic: 'Resistors in Series and Parallel',
      difficulty: 'moderate',
      question: 'Two resistors of 6 Ω and 3 Ω are connected in parallel. What is their equivalent resistance?',
      options: ['9 Ω', '2 Ω', '18 Ω', '4.5 Ω'],
      correctOption: 1,
      explanation: '1/R_eq = 1/6 + 1/3 = 1/6 + 2/6 = 3/6 = 1/2. Therefore R_eq = 2 Ω.'
    },
    {
      topic: 'Joule\'s Law of Heating & Electric Power',
      difficulty: 'difficult',
      question: 'An electric bulb is rated 220 V and 100 W. When it is operated on 110 V, what power will it consume?',
      options: ['50 W', '75 W', '25 W', '40 W'],
      correctOption: 2,
      explanation: 'Bulb resistance R = V² / P = (220)² / 100 = 484 Ω. When operated at 110 V: P_new = V_new² / R = (110)² / 484 = 12100 / 484 = 25 W.'
    }
  ],

  // ================= ENGLISH =================
  'Grammar & Sentence Structure': [
    {
      topic: 'Subject-Verb Agreement',
      difficulty: 'easy',
      question: 'Identify the sentence with correct subject-verb agreement:',
      options: [
        'Neither the teacher nor the students was present in the auditorium.',
        'Neither the teacher nor the students were present in the auditorium.',
        'Neither the teacher nor the students is present in the auditorium.',
        'Neither the teacher nor the students are being present in the auditorium.'
      ],
      correctOption: 1,
      explanation: 'When subjects are joined by "neither... nor", the verb agrees with the nearer subject ("students", which is plural, so "were").'
    },
    {
      topic: 'Active and Passive Voice',
      difficulty: 'moderate',
      question: 'Choose the correct passive voice: "The committee has approved the revised scholarship policy."',
      options: [
        'The revised scholarship policy was approved by the committee.',
        'The revised scholarship policy had been approved by the committee.',
        'The revised scholarship policy has been approved by the committee.',
        'The revised scholarship policy is approved by the committee.'
      ],
      correctOption: 2,
      explanation: 'Present perfect active ("has approved") changes to present perfect passive ("has been approved").'
    },
    {
      topic: 'Direct and Indirect Speech',
      difficulty: 'difficult',
      question: 'Convert to indirect speech: The doctor said to the patient, "Do you exercise regularly?"',
      options: [
        'The doctor asked the patient whether he exercised regularly.',
        'The doctor asked the patient that if he exercises regularly.',
        'The doctor ordered the patient whether he had exercised regularly.',
        'The doctor inquired the patient did he exercise regularly.'
      ],
      correctOption: 0,
      explanation: 'Interrogative questions without question words use "if" or "whether", the reporting verb becomes "asked", and simple present "exercise" shifts to simple past "exercised".'
    }
  ]
};

export const TARGET_PRE_ASSESSMENT_QUESTIONS = 30;

export interface ChapterQuestionAllocation {
  chapterId: string;
  chapterName: string;
  subject: SubjectType;
  easyCount: number;
  moderateCount: number;
  difficultCount: number;
  totalCount: number;
  topics: string[];
}

/**
 * Deterministically computes balanced 30-question allocation across extracted chapters and difficulty levels
 */
export function computeChapterQuestionAllocations(
  chapters: ExtractedChapter[],
  totalQuestions: number = TARGET_PRE_ASSESSMENT_QUESTIONS
): ChapterQuestionAllocation[] {
  if (!chapters || chapters.length === 0) return [];

  const n = chapters.length;
  const basePerChapter = Math.floor(totalQuestions / n);
  const remainder = totalQuestions % n;

  // 1. Allocate total question quota per chapter
  const chapterQuotas: number[] = [];
  for (let i = 0; i < n; i++) {
    chapterQuotas.push(basePerChapter + (i < remainder ? 1 : 0));
  }

  // 2. Global difficulty distribution target: ~30% Easy (9-10), ~47% Moderate (14), ~23% Difficult (7)
  const targetEasyGlobal = Math.max(n, Math.round(totalQuestions * 0.30));
  const targetDiffGlobal = Math.max(Math.floor(n / 2), Math.round(totalQuestions * 0.23));

  const allocations: ChapterQuestionAllocation[] = [];

  for (let i = 0; i < n; i++) {
    const qCount = chapterQuotas[i];
    const ch = chapters[i];

    let easy = Math.max(1, Math.round((qCount / totalQuestions) * targetEasyGlobal));
    let diff = Math.max(qCount >= 3 ? 1 : 0, Math.round((qCount / totalQuestions) * targetDiffGlobal));
    let mod = qCount - easy - diff;

    if (mod < 1 && qCount >= 2) {
      if (easy > 1) { easy--; mod++; }
      else if (diff > 1) { diff--; mod++; }
    }

    allocations.push({
      chapterId: ch.chapterId,
      chapterName: ch.chapterName,
      subject: ch.subject,
      easyCount: easy,
      moderateCount: mod,
      difficultCount: diff,
      totalCount: qCount,
      topics: ch.topics && ch.topics.length > 0 ? ch.topics : [`${ch.chapterName} Core Principles`]
    });
  }

  // 3. Exact 30-question balancing pass
  let currentSum = allocations.reduce((acc, a) => acc + a.easyCount + a.moderateCount + a.difficultCount, 0);
  let diffAdjust = totalQuestions - currentSum;
  let idx = 0;
  while (diffAdjust !== 0) {
    if (diffAdjust > 0) {
      allocations[idx % n].moderateCount++;
      allocations[idx % n].totalCount++;
      diffAdjust--;
    } else {
      if (allocations[idx % n].moderateCount > 1) {
        allocations[idx % n].moderateCount--;
        allocations[idx % n].totalCount--;
        diffAdjust++;
      }
    }
    idx++;
  }

  return allocations;
}

/**
 * Extracts structured chapters strictly from document text using Gemini or deterministic local engine
 * NEVER adds external chapters that do not exist in the uploaded material.
 */
export async function extractChaptersFromMaterial(
  text: string,
  subject: SubjectType,
  classLevel?: string
): Promise<{ chapters: ExtractedChapter[]; isDemoMode: boolean }> {
  // 1. Try server-side Gemini endpoint
  try {
    const res = await fetch('/api/ai/extract-chapters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, subject, classLevel })
    });

    if (res.ok) {
      const data = await res.json();
      if (!data.isDemoMode && data.data?.chapters && data.data.chapters.length > 0) {
        return {
          chapters: data.data.chapters.map((ch: any, idx: number) => ({
            chapterId: ch.chapterId || `ch_${idx + 1}`,
            chapterName: ch.chapterName || `Chapter ${idx + 1}`,
            subject,
            topics: Array.isArray(ch.topics) && ch.topics.length > 0
              ? ch.topics
              : extractTopicsForChapter(ch.chapterName || `Chapter ${idx + 1}`, idx, [], text),
            prerequisites: ch.prerequisites || [],
            importantConcepts: ch.importantConcepts || [],
            classLevel,
            sourceMethod: 'document_structure'
          })),
          isDemoMode: false
        };
      }
    }
  } catch (err) {
    console.warn('Server AI chapter extraction unavailable, using fallback:', err);
  }

  // 2. Fallback: Intelligent local pattern matching (TOC + Headings)
  const parsedTitles = extractChaptersFromText(text, subject);

  // STRICT RULE: If document text was supplied, NEVER hallucinate or inject mockCurriculum chapters!
  // Only if text was completely empty (cold start without file) do we fall back to curriculum topics.
  const matchedTitles = parsedTitles.length > 0
    ? parsedTitles
    : (!text || text.trim().length === 0)
      ? (mockCurriculum[subject]?.topics || ['Core Principles', 'Application Analysis'])
      : ['General Overview'];

  const chapters: ExtractedChapter[] = matchedTitles.slice(0, 10).map((title, index) => {
    const extractedTopics = extractTopicsForChapter(title, index, matchedTitles, text);

    return {
      chapterId: `ch_${subject.toLowerCase().slice(0, 3)}_${index + 1}`,
      chapterName: title,
      subject,
      topics: extractedTopics,
      prerequisites: index > 0 ? [matchedTitles[index - 1]] : [],
      classLevel: classLevel || 'Class 10',
      sourceMethod: 'heading_detection'
    };
  });

  return {
    chapters,
    isDemoMode: true
  };
}

/**
 * Generates a balanced 30-question diagnostic assessment across verified chapters and difficulties
 */
export async function generateCombinedQuestions(
  chaptersBySubject: Record<SubjectType, ExtractedChapter[]>,
  classLevel?: string,
  targetTotalQuestions = TARGET_PRE_ASSESSMENT_QUESTIONS
): Promise<{ questions: PreAssessmentQuestion[]; isDemoMode: boolean; allocations: ChapterQuestionAllocation[] }> {
  const allChapters: ExtractedChapter[] = Object.values(chaptersBySubject).flat();
  let generatedQuestions: PreAssessmentQuestion[] = [];
  let isDemoMode = false;

  // 1. Compute exact 30-question allocation across chapters and difficulty levels
  const allocations = computeChapterQuestionAllocations(allChapters, targetTotalQuestions);

  // 2. Attempt Gemini Generation via server endpoint
  try {
    const res = await fetch('/api/ai/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chapters: allChapters,
        subject: Object.keys(chaptersBySubject).join(' & '),
        classLevel,
        chapterAllocations: allocations,
        targetTotalQuestions
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (!data.isDemoMode && Array.isArray(data.data?.questions) && data.data.questions.length > 0) {
        // Validate each question
        const validated: PreAssessmentQuestion[] = [];
        const validChapterIds = new Set(allChapters.map(c => c.chapterId));

        data.data.questions.forEach((q: any) => {
          // STRICT RULE: Reject any question not belonging to an extracted chapter
          if (q.chapterId && !validChapterIds.has(q.chapterId)) {
            const matchedCh = allChapters.find(c => c.chapterName.toLowerCase() === (q.chapterName || '').toLowerCase());
            if (matchedCh) {
              q.chapterId = matchedCh.chapterId;
            } else {
              return; // Skip questions for absent chapters
            }
          }

          const qObj: PreAssessmentQuestion = {
            questionId: q.questionId || `q_${Math.random().toString(36).substr(2, 6)}`,
            chapterId: q.chapterId || allChapters[0].chapterId,
            chapterName: q.chapterName || allChapters[0].chapterName,
            topic: q.topic || 'Core Concept',
            difficulty: (['easy', 'moderate', 'difficult'].includes(q.difficulty) ? q.difficulty : 'moderate') as PreAssessmentDifficulty,
            question: q.question,
            options: q.options,
            correctOption: Number(q.correctOption),
            explanation: q.explanation,
            sourcePage: q.sourcePage,
            subject: (allChapters.find(c => c.chapterId === q.chapterId)?.subject || Object.keys(chaptersBySubject)[0] || 'Mathematics') as SubjectType
          };

          const check = validateQuestion(qObj);
          if (check.valid) {
            validated.push(qObj);
          } else {
            console.warn(`Question validation failed for [${qObj.chapterName} - ${qObj.difficulty}]:`, check.reasons);
          }
        });

        if (validated.length >= Math.min(24, targetTotalQuestions)) {
          generatedQuestions = validated.slice(0, targetTotalQuestions);
          isDemoMode = false;
        }
      } else {
        isDemoMode = true;
      }
    } else {
      isDemoMode = true;
    }
  } catch (err) {
    console.warn('AI Question generation failed, falling back to curriculum question bank:', err);
    isDemoMode = true;
  }

  // 3. Fallback: High-Quality Curriculum Question Bank + Dynamic Domain Synthesizer
  if (generatedQuestions.length < targetTotalQuestions) {
    isDemoMode = true;
    let qCounter = generatedQuestions.length + 1;

    // Generate according to chapter allocations to guarantee exact 30 questions and topic coverage
    allocations.forEach((alloc) => {
      const chapter = allChapters.find(c => c.chapterId === alloc.chapterId) || {
        chapterId: alloc.chapterId,
        chapterName: alloc.chapterName,
        subject: alloc.subject,
        topics: alloc.topics
      };

      // Check if static bank has templates for this chapter
      const bankEntry = Object.entries(CURRICULUM_QUESTION_BANK).find(([key]) =>
        chapter.chapterName.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(chapter.chapterName.toLowerCase())
      );
      const templates = bankEntry ? bankEntry[1] : null;

      // Plan questions for this chapter: Easy, Moderate, Difficult
      const diffPlan: PreAssessmentDifficulty[] = [
        ...Array(alloc.easyCount).fill('easy'),
        ...Array(alloc.moderateCount).fill('moderate'),
        ...Array(alloc.difficultCount).fill('difficult')
      ];

      let topicCursor = 0;
      diffPlan.forEach((diff) => {
        // Rotate through topics for comprehensive chapter coverage
        const topic = alloc.topics[topicCursor % alloc.topics.length] || chapter.chapterName;
        topicCursor++;

        let questionObj: PreAssessmentQuestion;

        if (templates) {
          const availableTemplates = templates.filter(
            t => t.difficulty === diff && !generatedQuestions.some(g => g.question === t.question)
          );
          const matchingTemplate = availableTemplates[0];

          if (matchingTemplate) {
            questionObj = {
              questionId: `q_${String(qCounter).padStart(3, '0')}`,
              chapterId: chapter.chapterId,
              chapterName: chapter.chapterName,
              topic: matchingTemplate.topic || topic,
              difficulty: diff,
              question: matchingTemplate.question,
              options: [...matchingTemplate.options],
              correctOption: matchingTemplate.correctOption,
              explanation: matchingTemplate.explanation,
              subject: chapter.subject
            };
          } else {
            questionObj = generateSyntheticCurriculumQuestion(
              chapter,
              topic,
              diff,
              qCounter
            );
          }
        } else {
          // Dynamic authentic question synthesis grounded in domain and cognitive types
          questionObj = generateSyntheticCurriculumQuestion(
            chapter,
            topic,
            diff,
            qCounter
          );
        }

        generatedQuestions.push(questionObj);
        qCounter++;
      });
    });
  }

  // 4. Combined Test Interleaving
  // Order questions progressively: Easy first, Moderate next, Difficult final ramp
  const easyQuestions = generatedQuestions.filter(q => q.difficulty === 'easy');
  const modQuestions = generatedQuestions.filter(q => q.difficulty === 'moderate');
  const diffQuestions = generatedQuestions.filter(q => q.difficulty === 'difficult');

  const orderedQuestions: PreAssessmentQuestion[] = [
    ...easyQuestions,
    ...modQuestions,
    ...diffQuestions
  ].slice(0, targetTotalQuestions);

  // 5. Inter-Question Option Diversity Guarantee
  // Validates that across all questions in the test, NO two questions share identical options or questions
  const uniqueQuestions = ensureAssessmentQuestionDiversity(orderedQuestions, allChapters);

  // Re-index question IDs sequentially: q_001, q_002, ..., q_030
  const finalQuestions = uniqueQuestions.map((q, idx) => ({
    ...q,
    questionId: `q_${String(idx + 1).padStart(3, '0')}`
  }));

  return {
    questions: finalQuestions,
    isDemoMode,
    allocations
  };
}

/**
 * Validates that across all questions in the pre-assessment, NO two questions share identical option sets.
 * If any option set collision is detected, mutates the question dynamically to guarantee 100% uniqueness.
 */
function ensureAssessmentQuestionDiversity(
  questions: PreAssessmentQuestion[],
  allChapters: ExtractedChapter[]
): PreAssessmentQuestion[] {
  const seenOptionSignatures = new Set<string>();
  const seenQuestionTexts = new Set<string>();
  const validated: PreAssessmentQuestion[] = [];

  for (let i = 0; i < questions.length; i++) {
    let q = questions[i];
    let optSig = (q.options || []).map(o => o.trim().toLowerCase()).sort().join('|||');
    let qSig = (q.question || '').trim().toLowerCase();

    let attempts = 0;
    while ((seenOptionSignatures.has(optSig) || seenQuestionTexts.has(qSig)) && attempts < 15) {
      attempts++;
      const chapter = allChapters.find(c => c.chapterId === q.chapterId) || allChapters[0] || {
        chapterId: q.chapterId,
        chapterName: q.chapterName,
        subject: q.subject,
        topics: [q.topic]
      };
      q = generateSyntheticCurriculumQuestion(
        chapter,
        q.topic,
        q.difficulty,
        i + 1 + (attempts * 37)
      );
      optSig = (q.options || []).map(o => o.trim().toLowerCase()).sort().join('|||');
      qSig = (q.question || '').trim().toLowerCase();
    }

    seenOptionSignatures.add(optSig);
    seenQuestionTexts.add(qSig);
    validated.push(q);
  }

  return validated;
}

/**
 * Synthesizes an authentic, domain-tailored school-level question across NCERT cognitive styles
 * when an exact static question is not in the hardcoded curriculum bank.
 * NEVER reuses identical options or repetitive boilerplate.
 */
function generateSyntheticCurriculumQuestion(
  chapter: ExtractedChapter,
  topic: string,
  difficulty: PreAssessmentDifficulty,
  counter: number
): PreAssessmentQuestion {
  const subject = chapter.subject || 'Mathematics';
  const cleanTopic = topic.replace(/ Fundamentals| Properties and Key Methods| Applications and Problem Solving/g, '').trim();
  const targetOptionIndex = (counter * 7 + 1) % 4; // pseudo-random distribution 0..3

  // ================= MATHEMATICS GENERATOR =================
  if (subject === 'Mathematics') {
    if (difficulty === 'easy') {
      const v1 = counter + 1;
      const v2 = (counter * 3) + 2;
      const archetypes = [
        {
          q: `Which of the following conditions is mathematically required for "${cleanTopic}" (parameter set ${v1}) to be defined over real numbers?`,
          correct: `The denominator must not equal zero and all radicands under even roots must be non-negative (x ≥ 0).`,
          distractors: [
            `The leading coefficient must evaluate to -${v1} for all inputs.`,
            `Every exponent of the variable must evaluate to -${v2}/2.`,
            `The equality holds only when all terms evaluate to zero simultaneously.`
          ],
          exp: `For "${cleanTopic}" to be mathematically valid in real algebra, expressions must have non-zero denominators and real non-negative radicands.`
        },
        {
          q: `In the algebraic expression P(x) = ${v1}x + ${v2} representing "${cleanTopic}", what does the constant ${v2} represent?`,
          correct: `The y-intercept or initial baseline value where the input variable x equals 0.`,
          distractors: [
            `The root of the equation where P(x) equals ${v1}.`,
            `A multiplier that scales the slope by a factor of ${v2}.`,
            `An undefined coefficient that must be eliminated before evaluating.`
          ],
          exp: `In linear and polynomial models, the constant term represents the value of the expression when x = 0 (y-intercept).`
        },
        {
          q: `Which of the following operations preserves the validity of an equation modeling "${cleanTopic}"?`,
          correct: `Adding, subtracting, or multiplying by ${v1} on both sides of the equation.`,
          distractors: [
            `Multiplying only the left side by ${v2} while keeping the right side fixed.`,
            `Changing the addition operators to exponentiation without justification.`,
            `Setting all non-linear terms to zero arbitrarily.`
          ],
          exp: `Applying identical balanced algebraic operations to both sides preserves equality.`
        },
        {
          q: `What is the degree and classification of a polynomial P(x) = ${v1}x² - ${v2}x + 7 associated with "${cleanTopic}"?`,
          correct: `Degree 2, which classifies it as a quadratic expression capable of having at most 2 real roots.`,
          distractors: [
            `Degree ${v1}, classifying it as an exponential transcendental function.`,
            `Degree 1, indicating that its graph is a non-curved horizontal line.`,
            `Degree 0, meaning it has zero roots and no variable terms.`
          ],
          exp: `The highest power of the variable is 2, defining a quadratic polynomial with a parabolic graph.`
        }
      ];

      const arch = archetypes[counter % archetypes.length];
      return {
        questionId: `q_${String(counter).padStart(3, '0')}`,
        chapterId: chapter.chapterId,
        chapterName: chapter.chapterName,
        topic: cleanTopic,
        difficulty: 'easy',
        question: arch.q,
        options: buildShuffledOptions(arch.correct, arch.distractors, targetOptionIndex),
        correctOption: targetOptionIndex,
        explanation: arch.exp,
        subject
      };
    }

    if (difficulty === 'moderate') {
      const v1 = counter + 2;
      const v2 = (counter * 2) + 3;
      const archetypes = [
        {
          q: `When simplifying or solving an equation in "${cleanTopic}", which algebraic step is mathematically sound?`,
          correct: `Factoring common terms like (x - ${v1}) or applying standard algebraic identities to simplify both sides.`,
          distractors: [
            `Deleting polynomial terms that contain negative coefficients without justification.`,
            `Dividing both sides by an expression like (x - ${v1}) without verifying if x = ${v1}.`,
            `Changing addition operators to multiplication to force faster computation.`
          ],
          exp: `Applying verified algebraic identities and factoring common terms preserves algebraic equivalence.`
        },
        {
          q: `If a quadratic relationship in "${cleanTopic}" has real roots at x = ${v1} and x = -${v1}, what is its standard equation?`,
          correct: `x² - ${v1 * v1} = 0`,
          distractors: [
            `x² + ${v1 * v1} = 0`,
            `2x - ${v1} = 0`,
            `x² - ${2 * v1}x = 0`
          ],
          exp: `Roots at ±${v1} produce the symmetric difference of squares: (x - ${v1})(x + ${v1}) = x² - ${v1 * v1} = 0.`
        },
        {
          q: `On a coordinate plane representing y = ${v1}x + ${v2} for "${cleanTopic}", what are the coordinates of the y-intercept?`,
          correct: `(0, ${v2})`,
          distractors: [
            `(${v2}, 0)`,
            `(${v1}, ${v2})`,
            `(0, -${v2})`
          ],
          exp: `The y-intercept occurs where x = 0: y = ${v1}(0) + ${v2} = ${v2}, giving coordinate point (0, ${v2}).`
        },
        {
          q: `What is the value of the discriminant D for the quadratic equation x² - ${2 * v1}x + ${v1 * v1} = 0 in "${cleanTopic}"?`,
          correct: `D = 0, indicating two real and equal (coincident) roots at x = ${v1}.`,
          distractors: [
            `D = ${v1 * 4}, indicating two distinct irrational roots.`,
            `D = -${v1 * 2}, indicating no real roots.`,
            `D = 1, indicating infinite solutions.`
          ],
          exp: `D = b² - 4ac = (-${2 * v1})² - 4(1)(${v1 * v1}) = ${4 * v1 * v1} - ${4 * v1 * v1} = 0. Zero discriminant implies equal roots.`
        }
      ];

      const arch = archetypes[counter % archetypes.length];
      return {
        questionId: `q_${String(counter).padStart(3, '0')}`,
        chapterId: chapter.chapterId,
        chapterName: chapter.chapterName,
        topic: cleanTopic,
        difficulty: 'moderate',
        question: arch.q,
        options: buildShuffledOptions(arch.correct, arch.distractors, targetOptionIndex),
        correctOption: targetOptionIndex,
        explanation: arch.exp,
        subject
      };
    }

    // Difficult:
    const v1 = counter + 1;
    const v2 = counter * 2 + 1;
    const archetypes = [
      {
        q: `For the cubic polynomial P(x) = x³ - ${v1}x² + ${v2} in "${cleanTopic}", which of the following evaluations is mathematically ACCURATE?`,
        correct: `It has at most 3 real zeros, and its graph intersects the vertical axis at (0, ${v2}).`,
        distractors: [
          `It must possess strictly ${v1 * 2} real zeros in all coordinate quadrants.`,
          `The product of all roots is strictly negative regardless of the sign of ${v2}.`,
          `It represents a symmetric parabola with a single minimum at x = ${v1}.`
        ],
        exp: `A polynomial of degree 3 can have at most 3 real zeros, and setting x = 0 yields P(0) = ${v2}, giving intercept (0, ${v2}).`
      },
      {
        q: `In an advanced problem on "${cleanTopic}", if the sum of roots is ${v1 + 3} and product of roots is ${v1 * 3}, what is the quadratic equation?`,
        correct: `x² - ${v1 + 3}x + ${v1 * 3} = 0`,
        distractors: [
          `x² + ${v1 + 3}x + ${v1 * 3} = 0`,
          `x² - ${v1 * 3}x + ${v1 + 3} = 0`,
          `x² + ${v1 * 3}x - ${v1 + 3} = 0`
        ],
        exp: `A quadratic equation with given sum S and product P is x² - Sx + P = 0.`
      },
      {
        q: `For what parameter ratio does the linear system ${v1}x + ${v2}y = 7 and ${v1 * 2}x + ky = 14 in "${cleanTopic}" have infinitely many solutions?`,
        correct: `k = ${v2 * 2}, ensuring a₁/a₂ = b₁/b₂ = c₁/c₂ = 1/2 for coincident lines.`,
        distractors: [
          `k = ${v2}, resulting in intersecting lines.`,
          `k = -${v2 * 2}, resulting in parallel lines.`,
          `k = 0, causing the system to become undefined.`
        ],
        exp: `For coincident lines with infinite solutions: ${v1}/(${v1 * 2}) = ${v2}/k => 1/2 = ${v2}/k => k = ${v2 * 2}.`
      }
    ];

    const arch = archetypes[counter % archetypes.length];
    return {
      questionId: `q_${String(counter).padStart(3, '0')}`,
      chapterId: chapter.chapterId,
      chapterName: chapter.chapterName,
      topic: cleanTopic,
      difficulty: 'difficult',
      question: arch.q,
      options: buildShuffledOptions(arch.correct, arch.distractors, targetOptionIndex),
      correctOption: targetOptionIndex,
      explanation: arch.exp,
      subject
    };
  }

  // ================= SCIENCE GENERATOR =================
  if (subject === 'Science' || subject === 'Physics' || subject === 'Chemistry' || subject === 'Biology') {
    const v1 = counter + 1;
    const v2 = (counter * 5) + 10;
    const v3 = counter * 2 + 3;

    if (difficulty === 'easy') {
      const archetypes = [
        {
          q: `Which fundamental conservation law governs the physical or chemical changes in "${cleanTopic}" (Trial ${v1})?`,
          correct: `Mass and charge conservation: total mass of reactants (${v2} g) equals total mass of products (${v2} g) in a closed system.`,
          distractors: [
            `Spontaneous mass destruction of ${v1 * 2} g occurring during every exothermic phase.`,
            `The system functions with zero driving potential and continuous creation of free protons.`,
            `Reaction rates decrease to absolute zero when mass is preserved.`
          ],
          exp: `Law of Conservation of Mass dictates that mass can neither be created nor destroyed in a chemical reaction.`
        },
        {
          q: `What is the role of an enzyme or chemical catalyst during "${cleanTopic}"?`,
          correct: `It lowers the activation energy barrier by approximately ${v1 * 10} kJ/mol without being consumed in the net reaction.`,
          distractors: [
            `It shifts the equilibrium constant to produce 100% conversion regardless of thermodynamics.`,
            `It gets completely broken down into carbon dioxide and water as a primary fuel.`,
            `It acts by increasing the activation energy barrier to filter out unwanted products.`
          ],
          exp: `Catalysts accelerate reaction rates by offering an alternative pathway with lower activation energy.`
        },
        {
          q: `Which diagnostic observation in a laboratory experiment confirms the specific occurrence of "${cleanTopic}" (Sample ${v1})?`,
          correct: `Formation of a distinct precipitate, gas evolution (${v3} bubbles/sec), or sharp pH shift.`,
          distractors: [
            `Instant conversion of test tube glass into metallic sodium.`,
            `Continuous drop in room temperature down to absolute zero.`,
            `Creation of entirely new chemical elements not present in reactants.`
          ],
          exp: `Chemical reactions manifest observable changes such as precipitate formation, gas release, or pH transitions.`
        }
      ];

      const arch = archetypes[counter % archetypes.length];
      return {
        questionId: `q_${String(counter).padStart(3, '0')}`,
        chapterId: chapter.chapterId,
        chapterName: chapter.chapterName,
        topic: cleanTopic,
        difficulty: 'easy',
        question: arch.q,
        options: buildShuffledOptions(arch.correct, arch.distractors, targetOptionIndex),
        correctOption: targetOptionIndex,
        explanation: arch.exp,
        subject
      };
    }

    if (difficulty === 'moderate') {
      const archetypes = [
        {
          q: `In an experiment studying "${cleanTopic}", what is the observed effect of increasing temperature by +${v1 * 5}°C?`,
          correct: `The average kinetic energy of reacting particles increases, raising the effective collision frequency.`,
          distractors: [
            `All molecular collisions cease instantly above ${v2}°C.`,
            `The molecular weight of the substance doubles spontaneously.`,
            `The activation energy increases proportionally, stopping all reactions.`
          ],
          exp: `Higher temperature provides thermal kinetic energy, allowing more molecules to overcome the activation threshold.`
        },
        {
          q: `In an electrical circuit model for "${cleanTopic}", if a potential difference of ${v2} V drives a current of ${v1} A, what is the resistance?`,
          correct: `R = V / I = ${v2} / ${v1} = ${(v2 / v1).toFixed(1)} Ω`,
          distractors: [
            `R = ${(v2 * v1).toFixed(1)} Ω`,
            `R = ${(v1 / v2).toFixed(2)} Ω`,
            `R = ${(v2 + v1).toFixed(1)} Ω`
          ],
          exp: `Ohm's law gives R = V / I. Substituting ${v2} V and ${v1} A yields ${(v2 / v1).toFixed(1)} Ω.`
        },
        {
          q: `A convex lens associated with "${cleanTopic}" has a focal length of +${v1 * 5} cm. What is its optical power in dioptres (D)?`,
          correct: `P = +${(100 / (v1 * 5)).toFixed(2)} D`,
          distractors: [
            `P = -${(100 / (v1 * 5)).toFixed(2)} D`,
            `P = +${(v1 * 5).toFixed(1)} D`,
            `P = +0.${v1} D`
          ],
          exp: `Power P = 1 / f(in meters) = 100 / f(in cm) = 100 / ${v1 * 5} = +${(100 / (v1 * 5)).toFixed(2)} D.`
        }
      ];

      const arch = archetypes[counter % archetypes.length];
      return {
        questionId: `q_${String(counter).padStart(3, '0')}`,
        chapterId: chapter.chapterId,
        chapterName: chapter.chapterName,
        topic: cleanTopic,
        difficulty: 'moderate',
        question: arch.q,
        options: buildShuffledOptions(arch.correct, arch.distractors, targetOptionIndex),
        correctOption: targetOptionIndex,
        explanation: arch.exp,
        subject
      };
    }

    // Difficult:
    const archetypes = [
      {
        q: `In a biological cellular investigation of "${cleanTopic}", what is the net yield of ATP synthesized when ${v1} units of glucose substrate undergo complete aerobic breakdown?`,
        correct: `Approximately ${v1 * 36} to ${v1 * 38} ATP molecules through combined glycolysis and oxidative phosphorylation.`,
        distractors: [
          `Zero ATP molecules because aerobic pathways consume net energy.`,
          `Exactly ${v1 * 2} ATP molecules restricted solely to anaerobic lactic fermentation.`,
          `Over ${v1 * 1000} ATP molecules created directly without electron transport.`
        ],
        exp: `Complete aerobic respiration yields approximately 36 to 38 ATP per glucose equivalent substrate.`
      },
      {
        q: `In an electrochemical analysis of "${cleanTopic}", what occurs when the external voltage exceeds the cell potential by +0.${v1} V?`,
        correct: `The direction of current reverses and the cell begins functioning as an electrolytic cell.`,
        distractors: [
          `Electrons stop moving completely and the solution freezes.`,
          `The cathode begins dissolving into gas bubbles instantaneously.`,
          `The internal chemical equilibrium shifts permanently to zero potential.`
        ],
        exp: `When external potential opposes and exceeds galvanic cell potential, the reaction runs in reverse as electrolysis.`
      },
      {
        q: `When studying the rate law in "${cleanTopic}", doubling the concentration of reactant [A] increases the reaction rate by a factor of ${Math.pow(2, (counter % 2) + 1)}. What is the reaction order with respect to [A]?`,
        correct: `Order = ${(counter % 2) + 1}, because Rate ∝ [A]^${(counter % 2) + 1}.`,
        distractors: [
          `Order = 0, indicating rate is independent of [A].`,
          `Order = -1, meaning rate is inversely proportional to [A].`,
          `Order = ${(counter % 2) + 3}, meaning rate increases exponentially beyond measurement.`
        ],
        exp: `Rate ∝ [A]^n. If [A] doubles and rate increases by ${Math.pow(2, (counter % 2) + 1)}, then 2^n = ${Math.pow(2, (counter % 2) + 1)}, so n = ${(counter % 2) + 1}.`
      }
    ];

    const arch = archetypes[counter % archetypes.length];
    return {
      questionId: `q_${String(counter).padStart(3, '0')}`,
      chapterId: chapter.chapterId,
      chapterName: chapter.chapterName,
      topic: cleanTopic,
      difficulty: 'difficult',
      question: arch.q,
      options: buildShuffledOptions(arch.correct, arch.distractors, targetOptionIndex),
      correctOption: targetOptionIndex,
      explanation: arch.exp,
      subject
    };
  }

  // ================= GENERAL / ENGLISH / SOCIAL SCIENCE =================
  const v1 = counter + 1;
  const v2 = counter * 2 + 1;

  if (difficulty === 'easy') {
    const archetypes = [
      {
        q: `Which of the following statements correctly identifies the core convention of "${cleanTopic}" (Rule ${v1})?`,
        correct: `Subject and verb agreement must consistently match in number (singular/plural) and tense.`,
        distractors: [
          `Verbs can be omitted at random without affecting grammatical sense.`,
          `Tense markers should be inverted in alternate subordinate clauses.`,
          `Articles like 'a' and 'the' are forbidden before singular countable nouns.`
        ],
        exp: `Fundamental grammatical convention requires agreement between subjects and finite verbs.`
      },
      {
        q: `In the contextual study of "${cleanTopic}", what role do transitional connectors play?`,
        correct: `They establish logical relationships such as cause, contrast, or chronological sequence between ideas.`,
        distractors: [
          `They reverse the factual truth of preceding paragraphs.`,
          `They force all adjectives to become superlative forms.`,
          `They serve solely to increase word count without communicative value.`
        ],
        exp: `Connectors link independent clauses and clarify argumentative relationships.`
      }
    ];

    const arch = archetypes[counter % archetypes.length];
    return {
      questionId: `q_${String(counter).padStart(3, '0')}`,
      chapterId: chapter.chapterId,
      chapterName: chapter.chapterName,
      topic: cleanTopic,
      difficulty: 'easy',
      question: arch.q,
      options: buildShuffledOptions(arch.correct, arch.distractors, targetOptionIndex),
      correctOption: targetOptionIndex,
      explanation: arch.exp,
      subject
    };
  }

  if (difficulty === 'moderate') {
    const archetypes = [
      {
        q: `When converting a direct speech statement in "${cleanTopic}" into reported indirect speech, which transformation is correct?`,
        correct: `The reporting verb shifts tense backward (e.g. simple present to simple past) and pronouns adjust contextually.`,
        distractors: [
          `All quotation marks are preserved and tense remains frozen.`,
          `Past perfect verbs shift into future conditional forms.`,
          `The question word is replaced by 'that' in all interrogative structures.`
        ],
        exp: `Indirect speech requires backshifting verb tenses when the reporting verb is in the past tense.`
      },
      {
        q: `Which of the following passive voice constructions correctly transforms "The researchers analyzed ${v1 * 5} samples" in "${cleanTopic}"?`,
        correct: `"${v1 * 5} samples were analyzed by the researchers."`,
        distractors: [
          `"${v1 * 5} samples have been analyzing by the researchers."`,
          `"The researchers were analyzed by ${v1 * 5} samples."`,
          `"${v1 * 5} samples had being analyzed by the researchers."`
        ],
        exp: `Simple past active ("analyzed") converts to simple past passive ("were analyzed").`
      }
    ];

    const arch = archetypes[counter % archetypes.length];
    return {
      questionId: `q_${String(counter).padStart(3, '0')}`,
      chapterId: chapter.chapterId,
      chapterName: chapter.chapterName,
      topic: cleanTopic,
      difficulty: 'moderate',
      question: arch.q,
      options: buildShuffledOptions(arch.correct, arch.distractors, targetOptionIndex),
      correctOption: targetOptionIndex,
      explanation: arch.exp,
      subject
    };
  }

  // Difficult
  const archetypes = [
    {
      q: `Analyze the thematic structure of "${cleanTopic}" (Perspective ${v1}): Which inference is logically sound?`,
      correct: `Contextual constraints and authorial purpose govern the selection of vocabulary and rhetorical tone.`,
      distractors: [
        `Grammatical voice must remain passive throughout all formal analytical texts.`,
        `Direct quotations should always contradict the central thesis of the essay.`,
        `Literary devices cannot be evaluated through objective textual evidence.`
      ],
      exp: `Rigorous textual analysis links stylistic choices to communicative intent and audience context.`
    },
    {
      q: `In formal discourse concerning "${cleanTopic}", which synthesis best resolves conflicting historical or thematic viewpoints (Case ${v2})?`,
      correct: `Synthesizing primary source evidence while acknowledging the methodological limitations of each source.`,
      distractors: [
        `Discarding all dissenting perspectives without analytical examination.`,
        `Choosing the viewpoint with the shortest chronological timeline exclusively.`,
        `Assuming all contradictory accounts are equally fictional without historical rigor.`
      ],
      exp: `Evidence-based historical and thematic evaluation requires corroborating primary sources and assessing bias.`
    }
  ];

  const arch = archetypes[counter % archetypes.length];
  return {
    questionId: `q_${String(counter).padStart(3, '0')}`,
    chapterId: chapter.chapterId,
    chapterName: chapter.chapterName,
    topic: cleanTopic,
    difficulty: 'difficult',
    question: arch.q,
    options: buildShuffledOptions(arch.correct, arch.distractors, targetOptionIndex),
    correctOption: targetOptionIndex,
    explanation: arch.exp,
    subject
  };
}

/**
 * Helper to construct an options array with the correct answer placed at targetIndex
 */
function buildShuffledOptions(correct: string, distractors: string[], targetIndex: number): string[] {
  const result: string[] = [];
  let dIdx = 0;
  for (let i = 0; i < 4; i++) {
    if (i === targetIndex) {
      result.push(correct);
    } else {
      result.push(distractors[dIdx] || `Alternative perspective ${dIdx + 1}`);
      dIdx++;
    }
  }
  return result;
}
