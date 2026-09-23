import { QuizQuestion } from '../types';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // -------------------------------------------------------------
  // MATHEMATICS: Number Systems & Irrational Numbers (Class 9 CBSE)
  // -------------------------------------------------------------
  {
    id: 'math-num-1',
    subject: 'Mathematics',
        topic: 'Irrational Numbers and Decimal Expansions',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Beginner',
    question: 'Which of the following numbers is an irrational number?',
    options: ['0.375', '√25', '√7', '22/7'],
    correctIndex: 2,
    explanation: '√7 is an irrational number because 7 is not a perfect square, so its decimal expansion is non-terminating and non-recurring. 0.375, √25 (=5), and 22/7 are all rational.',
    hint: 'Look for the non-perfect square root.'
  },
  {
    id: 'math-num-2',
    subject: 'Mathematics',
        topic: 'Irrational Numbers and Decimal Expansions',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Beginner',
    question: 'What is the characteristic decimal expansion of any irrational number?',
    options: [
      'Terminating',
      'Non-terminating and recurring (repeating)',
      'Non-terminating and non-recurring (non-repeating)',
      'Either terminating or recurring'
    ],
    correctIndex: 2,
    explanation: 'By definition in the real number system, every irrational number has a decimal expansion that is non-terminating and non-recurring (e.g. √2 = 1.41421356...).',
    hint: 'It never ends and never repeats a fixed block of digits.'
  },
  {
    id: 'math-num-3',
    subject: 'Mathematics',
        topic: 'Irrational Numbers and Decimal Expansions',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'Between any two distinct rational numbers, how many irrational numbers exist?',
    options: ['Zero', 'Exactly one', 'Finitely many', 'Infinitely many'],
    correctIndex: 3,
    explanation: 'Between any two distinct real numbers on the number line, there exist infinitely many rational and infinitely many irrational numbers (density property).',
    hint: 'The real number line is continuous and dense.'
  },
  {
    id: 'math-num-4',
    subject: 'Mathematics',
        topic: 'Irrational Numbers and Decimal Expansions',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'The sum or difference of a rational number and an irrational number is always:',
    options: ['Rational', 'Irrational', 'An integer', 'Zero'],
    correctIndex: 1,
    explanation: 'The sum or difference of a rational number and an irrational number is always irrational. For example, 3 (rational) + √2 (irrational) = 3 + √2 (irrational).',
    hint: 'Think of adding 2 to √3.'
  },
  {
    id: 'math-num-5',
    subject: 'Mathematics',
        topic: 'Irrational Numbers and Decimal Expansions',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'Which of the following decimal representations represents an irrational number?',
    options: [
      '0.141414... (0.14 repeating)',
      '0.101001000100001...',
      '0.333333... (1/3)',
      '0.25'
    ],
    correctIndex: 1,
    explanation: '0.101001000100001... has an increasing number of zeros between ones, so it is non-terminating and non-repeating, making it irrational.',
    hint: 'Notice the pattern where the number of zeros increases each time.'
  },
  {
    id: 'math-num-6',
    subject: 'Mathematics',
        topic: 'Rationalisation of Denominators',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'On rationalising the denominator of 1 / (√5 + √2), we get:',
    options: [
      '(√5 - √2) / 3',
      '(√5 + √2) / 3',
      '(√5 - √2) / 7',
      '√5 - √2'
    ],
    correctIndex: 0,
    explanation: 'Multiply numerator and denominator by conjugate (√5 - √2): 1*(√5 - √2) / ((√5)² - (√2)²) = (√5 - √2) / (5 - 2) = (√5 - √2) / 3.',
    hint: 'Multiply by conjugate (√5 - √2) using identity (a+b)(a-b) = a² - b².'
  },
  {
    id: 'math-num-7',
    subject: 'Mathematics',
        topic: 'Irrational Numbers and Decimal Expansions',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'Which of the following statements is FALSE?',
    options: [
      'Every rational number is a real number.',
      'Every irrational number is a real number.',
      'Every real number is an irrational number.',
      'Every point on the number line represents a unique real number.'
    ],
    correctIndex: 2,
    explanation: 'Not every real number is irrational; rational numbers like 5, 2/3, and -7 are real numbers but not irrational.',
    hint: 'Real numbers include both rational and irrational numbers.'
  },

  // -------------------------------------------------------------
  // SCIENCE: Functional Groups & Carbon (Class 9 / 10 CBSE)
  // -------------------------------------------------------------
  {
    id: 'sci-fg-1',
    subject: 'Science',
    chapter: 'Carbon and Its Compounds',
    topic: 'Functional Groups',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'Which of the following is the characteristic functional group present in alcohols?',
    options: ['-COOH', '-OH', '-NH2', '-CH3'],
    correctIndex: 1,
    explanation: 'The hydroxyl group (-OH) is the characteristic functional group of alcohols (e.g., Ethanol C2H5OH).',
    hint: 'Think of organic molecules ending in "-ol" like ethanol.'
  },
  {
    id: 'sci-fg-2',
    subject: 'Science',
    chapter: 'Carbon and Its Compounds',
    topic: 'Functional Groups',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'The functional group represented by -COOH is known as:',
    options: ['Aldehyde group', 'Ketone group', 'Carboxylic acid group', 'Ester group'],
    correctIndex: 2,
    explanation: '-COOH is the carboxyl group, which confers acidic properties to organic acids like ethanoic acid (acetic acid).',
    hint: 'It is found in vinegar (acetic acid).'
  },
  {
    id: 'sci-fg-3',
    subject: 'Science',
    chapter: 'Carbon and Its Compounds',
    topic: 'Functional Groups',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'Which functional group must always be situated inside a carbon chain and never at the terminal end?',
    options: ['Alcohol (-OH)', 'Aldehyde (-CHO)', 'Ketone (>C=O)', 'Carboxylic acid (-COOH)'],
    correctIndex: 2,
    explanation: 'A ketone carbonyl group (>C=O) requires carbon atoms on both sides, so it can never be at the chain end. The simplest ketone is Propanone (Acetone).',
    hint: 'Propanone requires at least 3 carbon atoms.'
  },
  {
    id: 'sci-fg-4',
    subject: 'Science',
    chapter: 'Carbon and Its Compounds',
    topic: 'Carbon and Its Compounds',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'How many covalent bonds does a single carbon atom form in its stable organic compounds?',
    options: ['2', '3', '4', '6'],
    correctIndex: 2,
    explanation: 'Carbon has an atomic number of 6 (valence electronic configuration 2, 4) and forms 4 covalent bonds (tetravalency).',
    hint: 'Carbon is tetravalent.'
  },
  {
    id: 'sci-fg-5',
    subject: 'Science',
    chapter: 'Carbon and Its Compounds',
    topic: 'Carbon and Its Compounds',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'When ethanoic acid reacts with ethanol in the presence of concentrated sulfuric acid, what sweet-smelling compound is formed?',
    options: ['Ester (Ethyl ethanoate)', 'Ethene', 'Methane', 'Sodium ethanoate'],
    correctIndex: 0,
    explanation: 'This reaction is esterification: CH3COOH + C2H5OH ──(H2SO4)──► CH3COOC2H5 + H2O, yielding fruity-smelling esters.',
    hint: 'Commonly used in synthetic perfumes and food flavors.'
  },
  {
    id: 'sci-fg-6',
    subject: 'Science',
    chapter: 'Carbon and Its Compounds',
    topic: 'Functional Groups',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'What is the IUPAC suffix used for aldehydes containing the -CHO group?',
    options: ['-ol', '-al', '-one', '-oic acid'],
    correctIndex: 1,
    explanation: 'Aldehydes take the suffix "-al" (e.g., Methanal, Ethanal). Alcohols take "-ol" and ketones take "-one".',
    hint: 'Contrast with alcohol suffix "-ol".'
  },
  {
    id: 'sci-fg-7',
    subject: 'Science',
    chapter: 'Carbon and Its Compounds',
    topic: 'Carbon and Its Compounds',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'Addition of hydrogen to unsaturated vegetable oils in the presence of Nickel catalyst is called:',
    options: ['Esterification', 'Hydrogenation', 'Saponification', 'Fermentation'],
    correctIndex: 1,
    explanation: 'Hydrogenation converts liquid vegetable oils with double bonds into solid fats like vanaspati ghee using Nickel (Ni) or Palladium catalyst.',
    hint: 'Hydrogen is being added across the double bond.'
  },
  {
    id: 'sci-fg-8',
    subject: 'Science',
    chapter: 'Carbon and Its Compounds',
    topic: 'Carbon and Its Compounds',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'Which allotrope of carbon consists of hexagonal layers sliding over each other and conducts electricity?',
    options: ['Diamond', 'Graphite', 'Buckminsterfullerene', 'Carbon nanotube'],
    correctIndex: 1,
    explanation: 'Graphite has delocalized free electrons between hexagonal sheets of carbon atoms, allowing it to conduct electricity.',
    hint: 'Used in pencil leads and battery electrodes.'
  },
  {
    id: 'sci-fg-9',
    subject: 'Science',
    chapter: 'Carbon and Its Compounds',
    topic: 'Functional Groups',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'Members of a homologous series differ from their adjacent successor by which chemical group?',
    options: ['-CH-', '-CH2-', '-CH3-', '-C2H4-'],
    correctIndex: 1,
    explanation: 'Successive homologous members differ by one methylene group (-CH2-) and by 14 atomic mass units.',
    hint: 'Consider Methane (CH4) to Ethane (C2H6).'
  },
  {
    id: 'sci-fg-10',
    subject: 'Science',
    chapter: 'Carbon and Its Compounds',
    topic: 'Carbon and Its Compounds',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'Alkaline Potassium Permanganate (KMnO4) or Acidified Potassium Dichromate acts as what in reactions with alcohols?',
    options: ['Reducing agent', 'Oxidizing agent', 'Dehydrating agent', 'Catalytic inhibitor'],
    correctIndex: 1,
    explanation: 'Alkaline KMnO4 or Acidified K2Cr2O7 are strong oxidizing agents that convert ethanol directly to ethanoic acid.',
    hint: 'They add oxygen to the molecule.'
  },

  // -------------------------------------------------------------
  // MATHEMATICS: Geometry & Triangles
  // -------------------------------------------------------------
  {
    id: 'math-geo-1',
    subject: 'Mathematics',
    chapter: 'Geometry',
    topic: 'Triangles',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'In a right-angled triangle with sides 6 cm and 8 cm enclosing the right angle, what is the length of the hypotenuse?',
    options: ['9 cm', '10 cm', '12 cm', '14 cm'],
    correctIndex: 1,
    explanation: 'By the Pythagorean theorem: c² = a² + b² = 6² + 8² = 36 + 64 = 100, so c = √100 = 10 cm.',
    hint: 'Apply Pythagoras: 6-8-10 is a standard Pythagorean triple.'
  },
  {
    id: 'math-geo-2',
    subject: 'Mathematics',
    chapter: 'Geometry',
    topic: 'Triangles',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'According to Thales’ Theorem (Basic Proportionality Theorem), if a line is drawn parallel to one side of a triangle:',
    options: [
      'It divides the other two sides in the same ratio.',
      'It bisects the opposite angle equally.',
      'The area of the triangle is always halved.',
      'The perimeter doubles in length.'
    ],
    correctIndex: 0,
    explanation: 'Basic Proportionality Theorem (BPT) states that a line parallel to one side divides the other two sides in the same ratio (AD/DB = AE/EC).',
    hint: 'Ratio of segments on both sides remain equal.'
  },
  {
    id: 'math-geo-3',
    subject: 'Mathematics',
    chapter: 'Geometry',
    topic: 'Triangles',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'If two triangles are similar (△ABC ~ △PQR) and their corresponding sides are in ratio 3:5, what is the ratio of their areas?',
    options: ['3:5', '6:10', '9:25', '27:125'],
    correctIndex: 2,
    explanation: 'The ratio of the areas of two similar triangles is equal to the square of the ratio of their corresponding sides: (3/5)² = 9/25.',
    hint: 'Area scales with the square of the linear dimensions.'
  },
  {
    id: 'math-geo-4',
    subject: 'Mathematics',
    chapter: 'Geometry',
    topic: 'Triangles',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'What is the sum of all interior angles in any convex polygon with "n" sides?',
    options: ['(n - 2) × 180°', '(n + 2) × 180°', 'n × 360°', '(2n - 4) × 90°'],
    correctIndex: 0,
    explanation: 'The formula for interior angle sum is (n - 2) × 180°. For a triangle (n=3), it gives (3-2)×180° = 180°.',
    hint: 'Test for n=3 (triangle).'
  },
  {
    id: 'math-geo-5',
    subject: 'Mathematics',
    chapter: 'Geometry',
    topic: 'Geometry',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'In a circle with radius 7 cm, what is the perimeter (circumference) of the circle? (Take π = 22/7)',
    options: ['22 cm', '44 cm', '88 cm', '154 cm'],
    correctIndex: 1,
    explanation: 'Circumference = 2 × π × r = 2 × (22/7) × 7 = 44 cm.',
    hint: 'Formula: 2πr.'
  },
  {
    id: 'math-geo-6',
    subject: 'Mathematics',
    chapter: 'Geometry',
    topic: 'Geometry',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'The tangent at any point on a circle is perpendicular to the:',
    options: ['Chord', 'Secant', 'Radius through the point of contact', 'Opposite arc'],
    correctIndex: 2,
    explanation: 'Theorem 10.1: The tangent at any point of a circle is perpendicular to the radius through the point of contact (makes a 90° angle).',
    hint: 'The angle between tangent and radius is 90 degrees.'
  },
  {
    id: 'math-geo-7',
    subject: 'Mathematics',
    chapter: 'Geometry',
    topic: 'Geometry',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'If lengths of tangents drawn from an external point to a circle are measured, they are always:',
    options: ['Equal in length', 'Inversely proportional', 'Supplementary', 'Perpendicular'],
    correctIndex: 0,
    explanation: 'Theorem 10.2: The lengths of tangents drawn from an external point to a circle are equal (PA = PB).',
    hint: 'Symmetry guarantees both tangent lines match in length.'
  },
  {
    id: 'math-geo-8',
    subject: 'Mathematics',
    chapter: 'Geometry',
    topic: 'Triangles',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'In a right triangle △ABC right-angled at B, if tan A = 4/3, what is sin A?',
    options: ['3/5', '4/5', '5/4', '3/4'],
    correctIndex: 1,
    explanation: 'tan A = opposite/adjacent = 4/3. Hypotenuse = √(4² + 3²) = 5. Therefore, sin A = opposite/hypotenuse = 4/5.',
    hint: 'Hypotenuse is 5.'
  },
  {
    id: 'math-geo-9',
    subject: 'Mathematics',
    chapter: 'Geometry',
    topic: 'Geometry',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'The diagonals of a rhombus always intersect each other at what angle?',
    options: ['45°', '60°', '90° (Right angle)', '120°'],
    correctIndex: 2,
    explanation: 'The diagonals of a rhombus are perpendicular bisectors of each other, intersecting at 90°.',
    hint: 'Rhombus diagonals form perpendicular crosses.'
  },
  {
    id: 'math-geo-10',
    subject: 'Mathematics',
    chapter: 'Geometry',
    topic: 'Geometry',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'What is the coordinate of the midpoint of a line segment connecting points (2, 4) and (6, 8)?',
    options: ['(3, 5)', '(4, 6)', '(8, 12)', '(2, 2)'],
    correctIndex: 1,
    explanation: 'Midpoint formula: ((x1 + x2)/2, (y1 + y2)/2) = ((2 + 6)/2, (4 + 8)/2) = (8/2, 12/2) = (4, 6).',
    hint: 'Average the x coordinates and average the y coordinates.'
  },

  // -------------------------------------------------------------
  // PHYSICS / SCIENCE: Motion & Laws of Motion (Class 9 CBSE)
  // -------------------------------------------------------------
  {
    id: 'phy-mot-1',
    subject: 'Science',
    chapter: 'Motion',
    topic: 'Motion',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Beginner',
    question: 'Which of the following physical quantities is a vector quantity?',
    options: ['Distance', 'Speed', 'Displacement', 'Time'],
    correctIndex: 2,
    explanation: 'Displacement has both magnitude and a specific direction, making it a vector quantity. Distance, speed, and time are scalar quantities.',
    hint: 'It represents the shortest straight line distance between initial and final position.'
  },
  {
    id: 'phy-mot-2',
    subject: 'Science',
    chapter: 'Motion',
    topic: 'Motion',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'What physical quantity does the slope of a velocity-time (v-t) graph represent?',
    options: ['Distance', 'Displacement', 'Acceleration', 'Speed'],
    correctIndex: 2,
    explanation: 'The slope of a velocity-time graph equals change in velocity divided by time elapsed (Δv / Δt), which is acceleration.',
    hint: 'Rate of change of velocity.'
  },
  {
    id: 'phy-mot-3',
    subject: 'Science',
    chapter: 'Motion',
    topic: 'Equations of Motion',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'Which equation of motion correctly relates initial velocity (u), final velocity (v), uniform acceleration (a), and displacement (s)?',
    options: ['v = u + at', 's = ut + (1/2)at²', 'v² - u² = 2as', 'v² + u² = 2as'],
    correctIndex: 2,
    explanation: 'The third kinematic equation of motion is v² - u² = 2as (or v² = u² + 2as), which is independent of time.',
    hint: 'Equation with squared velocity terms.'
  },
  {
    id: 'phy-mot-4',
    subject: 'Science',
    chapter: 'Motion',
    topic: 'Motion',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'What physical quantity is determined by calculating the area under a velocity-time (v-t) graph?',
    options: ['Acceleration', 'Displacement / Distance covered', 'Force', 'Instantaneous speed'],
    correctIndex: 1,
    explanation: 'Area under a velocity-time graph = velocity × time = displacement (or distance in unidirectional motion).',
    hint: 'Velocity multiplied by time gives this quantity.'
  },
  {
    id: 'phy-mot-5',
    subject: 'Science',
    chapter: 'Motion',
    topic: 'Motion',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'An object travels 20 meters in 2 seconds and then another 30 meters in 3 seconds. What is its average speed?',
    options: ['10 m/s', '12 m/s', '8 m/s', '25 m/s'],
    correctIndex: 0,
    explanation: 'Average speed = Total distance / Total time = (20 + 30) m / (2 + 3) s = 50 / 5 = 10 m/s.',
    hint: 'Divide total distance by total elapsed time.'
  },
  // Also add duplicate/alias with subject Physics so both Physics and Science match!
  {
    id: 'phy-mot-1-p',
    subject: 'Physics',
    chapter: 'Motion',
    topic: 'Motion',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Beginner',
    question: 'Which of the following physical quantities is a vector quantity?',
    options: ['Distance', 'Speed', 'Displacement', 'Time'],
    correctIndex: 2,
    explanation: 'Displacement has both magnitude and direction, making it a vector quantity.',
    hint: 'Shortest path length with direction.'
  },
  {
    id: 'phy-mot-2-p',
    subject: 'Physics',
    chapter: 'Motion',
    topic: 'Motion',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'What physical quantity does the slope of a velocity-time (v-t) graph represent?',
    options: ['Distance', 'Displacement', 'Acceleration', 'Speed'],
    correctIndex: 2,
    explanation: 'Slope of v-t graph = Δv / Δt = acceleration.',
    hint: 'Rate of change of velocity.'
  },
  {
    id: 'phy-mot-3-p',
    subject: 'Physics',
    chapter: 'Motion',
    topic: 'Equations of Motion',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'Which equation of motion correctly relates initial velocity (u), final velocity (v), uniform acceleration (a), and displacement (s)?',
    options: ['v = u + at', 's = ut + (1/2)at²', 'v² - u² = 2as', 'v² + u² = 2as'],
    correctIndex: 2,
    explanation: 'The third kinematic equation of motion is v² - u² = 2as.',
    hint: 'Relates velocities and displacement without time.'
  },

  // -------------------------------------------------------------
  // COMPUTER SCIENCE: Binary Trees & Data Structures
  // -------------------------------------------------------------
  {
    id: 'cs-bt-1',
    subject: 'Computer Science',
    chapter: 'Data Structures',
    topic: 'Binary Trees',
    classLevel: 'Class 11',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'In a binary tree, what is the maximum number of children any node can possess?',
    options: ['1', '2', '3', 'Unlimited'],
    correctIndex: 1,
    explanation: 'By definition, every node in a binary tree has at most two children, named Left and Right.',
    hint: '"Binary" means base-2 or maximum two.'
  },
  {
    id: 'cs-bt-2',
    subject: 'Computer Science',
    chapter: 'Data Structures',
    topic: 'Binary Trees',
    classLevel: 'Class 11',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'Which traversal algorithm visits nodes in the exact order: Left child ──► Root ──► Right child?',
    options: ['Pre-order', 'In-order', 'Post-order', 'Level-order'],
    correctIndex: 1,
    explanation: 'In-order traversal visits Left, then Root, then Right. In a Binary Search Tree (BST), this outputs elements in ascending sorted order.',
    hint: 'In a BST, this traversal sorts the values.'
  },
  {
    id: 'cs-bt-3',
    subject: 'Computer Science',
    chapter: 'Data Structures',
    topic: 'Binary Trees',
    classLevel: 'Class 11',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'What is the average time complexity of searching for a value in a balanced Binary Search Tree (BST) with N nodes?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N²)'],
    correctIndex: 1,
    explanation: 'At each comparison, half of the remaining subtree is eliminated, yielding O(log N) logarithmic search time.',
    hint: 'Similar to binary search.'
  },
  {
    id: 'cs-bt-4',
    subject: 'Computer Science',
    chapter: 'Data Structures',
    topic: 'Algorithms',
    classLevel: 'Class 11',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'Which data structure operates on the "Last In, First Out" (LIFO) principle?',
    options: ['Queue', 'Stack', 'Array', 'Linked List'],
    correctIndex: 1,
    explanation: 'A Stack operates strictly on LIFO (Last In First Out). The call stack for recursion is a primary example.',
    hint: 'Think of a stack of cafeteria plates.'
  },
  {
    id: 'cs-bt-5',
    subject: 'Computer Science',
    chapter: 'Data Structures',
    topic: 'Binary Trees',
    classLevel: 'Class 11',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'A node in a tree with zero children is formally known as a:',
    options: ['Root', 'Internal Node', 'Leaf Node', 'Anchor'],
    correctIndex: 2,
    explanation: 'A node with degree 0 (no child pointers) is called a leaf node or terminal node.',
    hint: 'Leaves sit at the ends of branches.'
  },

  // -------------------------------------------------------------
  // ENGLISH: Active and Passive Voice & Grammar
  // -------------------------------------------------------------
  {
    id: 'eng-v-1',
    subject: 'English',
    chapter: 'Grammar',
    topic: 'Active and Passive Voice',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'Which of the following is the correct passive voice for: "The chef cooked a delicious dinner"?',
    options: [
      'A delicious dinner was cooked by the chef.',
      'A delicious dinner is cooked by the chef.',
      'The chef was cooking a delicious dinner.',
      'A delicious dinner had cooked the chef.'
    ],
    correctIndex: 0,
    explanation: '"Cooked" is simple past, so the passive requires "was/were + V3" (was cooked).',
    hint: 'Match past tense with "was cooked".'
  },
  {
    id: 'eng-v-2',
    subject: 'English',
    chapter: 'Grammar',
    topic: 'Active and Passive Voice',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'Transform into passive voice: "Khushi has completed the project."',
    options: [
      'The project is completed by Khushi.',
      'The project has been completed by Khushi.',
      'The project was completed by Khushi.',
      'The project had completed Khushi.'
    ],
    correctIndex: 1,
    explanation: 'Present perfect ("has completed") becomes "has been completed" in passive voice.',
    hint: 'Keep "has" and insert "been".'
  },
  {
    id: 'eng-v-3',
    subject: 'English',
    chapter: 'Grammar',
    topic: 'Active and Passive Voice',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'What is the passive form of the imperative command: "Open the window"?',
    options: [
      'You are opening the window.',
      'Let the window be opened.',
      'The window will open.',
      'The window was opened.'
    ],
    correctIndex: 1,
    explanation: 'Imperative orders convert using the structure: "Let + Object + be + V3" (Let the window be opened).',
    hint: 'Starts with "Let...".'
  },
  {
    id: 'eng-v-4',
    subject: 'English',
    chapter: 'Grammar',
    topic: 'Tenses',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'Choose the sentence with correct subject-verb agreement:',
    options: [
      'Neither of the students were present.',
      'Neither of the students was present.',
      'Neither of the students are present.',
      'Neither of the students have been present.'
    ],
    correctIndex: 1,
    explanation: '"Neither" as a singular pronoun takes a singular verb: "was present".',
    hint: '"Neither" is singular.'
  },
  {
    id: 'eng-v-5',
    subject: 'English',
    chapter: 'Grammar',
    topic: 'Active and Passive Voice',
    classLevel: 'Class 9',
    board: 'CBSE',
    difficulty: 'Intermediate',
    question: 'Convert into active voice: "The poem was written by Maya."',
    options: [
      'Maya wrote the poem.',
      'Maya writes the poem.',
      'Maya has written the poem.',
      'Maya had written the poem.'
    ],
    correctIndex: 0,
    explanation: '"Was written" is simple past, so in active voice it becomes the simple past verb "wrote".',
    hint: 'Simple past tense.'
  }
];

