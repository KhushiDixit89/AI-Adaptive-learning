import {
  ClassLevel,
  BoardType,
  StreamType,
  CurriculumChapter,
  SubjectData,
  LearningStyle,
  PedagogicalStyleContent,
  CurriculumLessonContent
} from '../types';
import { ADDITIONAL_CURRICULUM_CHAPTERS } from './curriculumExpanded';

export interface SubjectMetadata {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgLight: string;
  description: string;
}

// Subject catalog with visual styling
export const SUBJECT_METADATA: Record<string, SubjectMetadata> = {
  Mathematics: {
    id: 'subj-math',
    name: 'Mathematics',
    icon: '📐',
    color: '#4F46E5',
    bgLight: '#EEF2FF',
    description: 'Numbers, algebra, geometry, calculus, statistics and analytical logic.'
  },
  Science: {
    id: 'subj-sci',
    name: 'Science',
    icon: '🔬',
    color: '#059669',
    bgLight: '#ECFDF5',
    description: 'Natural phenomena, matter, energy, chemical transformations and living organisms.'
  },
  English: {
    id: 'subj-eng',
    name: 'English',
    icon: '📖',
    color: '#D97706',
    bgLight: '#FEF3C7',
    description: 'Grammar, reading comprehension, literature analysis and communication.'
  },
  'Social Science': {
    id: 'subj-sst',
    name: 'Social Science',
    icon: '🌍',
    color: '#DC2626',
    bgLight: '#FEF2F2',
    description: 'History, democratic politics, geography, resources and economics.'
  },
  Hindi: {
    id: 'subj-hindi',
    name: 'Hindi',
    icon: '🕉️',
    color: '#EA580C',
    bgLight: '#FFF7ED',
    description: 'Vyakaran, sahitya, kavya and bhasha bodh.'
  },
  'Computer Science': {
    id: 'subj-cs',
    name: 'Computer Science',
    icon: '💻',
    color: '#7C3AED',
    bgLight: '#F5F3FF',
    description: 'Python programming, data structures, database queries and algorithmic problem solving.'
  },
  Physics: {
    id: 'subj-phy',
    name: 'Physics',
    icon: '⚡',
    color: '#2563EB',
    bgLight: '#EFF6FF',
    description: 'Kinematics, mechanics, thermodynamics, electrostatics and modern physics.'
  },
  Chemistry: {
    id: 'subj-chem',
    name: 'Chemistry',
    icon: '🧪',
    color: '#0D9488',
    bgLight: '#F0FDFA',
    description: 'Atomic structure, chemical bonding, organic functional groups and thermodynamics.'
  },
  Biology: {
    id: 'subj-bio',
    name: 'Biology',
    icon: '🌿',
    color: '#16A34A',
    bgLight: '#F0FDF4',
    description: 'Cell biology, human and plant physiology, genetics, biotechnology and ecology.'
  },
  Accountancy: {
    id: 'subj-acc',
    name: 'Accountancy',
    icon: '📊',
    color: '#0284C7',
    bgLight: '#F0F9FF',
    description: 'Double entry ledger, financial accounting, partnership deeds and balance sheets.'
  },
  'Business Studies': {
    id: 'subj-bst',
    name: 'Business Studies',
    icon: '💼',
    color: '#9333EA',
    bgLight: '#FAF5FF',
    description: 'Principles of management, business finance, marketing mix and organizing.'
  },
  Economics: {
    id: 'subj-eco',
    name: 'Economics',
    icon: '📈',
    color: '#CA8A04',
    bgLight: '#FEFCE8',
    description: 'Microeconomics, national income accounting, banking, money and development.'
  },
  History: {
    id: 'subj-hist',
    name: 'History',
    icon: '🏛️',
    color: '#B45309',
    bgLight: '#FFFBEB',
    description: 'Ancient civilization, colonial encounters, world history and nationalist movements.'
  },
  'Political Science': {
    id: 'subj-pol',
    name: 'Political Science',
    icon: '⚖️',
    color: '#475569',
    bgLight: '#F8FAFC',
    description: 'Constitution at work, political theories, international relations and diplomacy.'
  },
  Geography: {
    id: 'subj-geo',
    name: 'Geography',
    icon: '🗺️',
    color: '#047857',
    bgLight: '#ECFDF5',
    description: 'Geomorphology, climate patterns, human settlements and economic resources.'
  },
  // UP Board / Hindi nomenclature mappings
  'Ganit (Mathematics)': {
    id: 'subj-ganit',
    name: 'Ganit (Mathematics)',
    icon: '📐',
    color: '#4F46E5',
    bgLight: '#EEF2FF',
    description: 'Beejganit, Rekhaganit, Nirdeshank Jyamiti aur Trikonmiti.'
  },
  'Vigyan (Science)': {
    id: 'subj-vigyan',
    name: 'Vigyan (Science)',
    icon: '🔬',
    color: '#059669',
    bgLight: '#ECFDF5',
    description: 'Bhaotik, Rasayan aur Jeev Vigyan ke mahatvapurna siddhant.'
  },
  'Samajik Vigyan (Social Science)': {
    id: 'subj-samajik',
    name: 'Samajik Vigyan (Social Science)',
    icon: '🌍',
    color: '#DC2626',
    bgLight: '#FEF2F2',
    description: 'Itihas, Nagarik Shastra, Bhugol aur Arthashastra.'
  }
};

/**
 * Standard Subject Allocations by Class, Board, and Stream
 */
export const CURRICULUM_STRUCTURE: Record<
  ClassLevel,
  Record<BoardType, Record<StreamType, string[]>>
> = {
  'Class 6': {
    CBSE: {
      'Not applicable': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'],
      Science: ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'],
      Commerce: ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'],
      'Humanities / Arts': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi']
    },
    ICSE: {
      'Not applicable': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi', 'Computer Science'],
      Science: ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'],
      Commerce: ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'],
      'Humanities / Arts': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi']
    },
    'UP Board': {
      'Not applicable': ['Ganit (Mathematics)', 'Vigyan (Science)', 'Samajik Vigyan (Social Science)', 'Hindi', 'English'],
      Science: ['Ganit (Mathematics)', 'Vigyan (Science)', 'Samajik Vigyan (Social Science)', 'Hindi', 'English'],
      Commerce: ['Ganit (Mathematics)', 'Vigyan (Science)', 'Samajik Vigyan (Social Science)', 'Hindi', 'English'],
      'Humanities / Arts': ['Ganit (Mathematics)', 'Vigyan (Science)', 'Samajik Vigyan (Social Science)', 'Hindi', 'English']
    }
  },
  'Class 7': {
    CBSE: {
      'Not applicable': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'],
      Science: ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'],
      Commerce: ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'],
      'Humanities / Arts': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi']
    },
    ICSE: {
      'Not applicable': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi', 'Computer Science'],
      Science: ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'],
      Commerce: ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'],
      'Humanities / Arts': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi']
    },
    'UP Board': {
      'Not applicable': ['Ganit (Mathematics)', 'Vigyan (Science)', 'Samajik Vigyan (Social Science)', 'Hindi', 'English'],
      Science: ['Ganit (Mathematics)', 'Vigyan (Science)', 'Samajik Vigyan (Social Science)', 'Hindi', 'English'],
      Commerce: ['Ganit (Mathematics)', 'Vigyan (Science)', 'Samajik Vigyan (Social Science)', 'Hindi', 'English'],
      'Humanities / Arts': ['Ganit (Mathematics)', 'Vigyan (Science)', 'Samajik Vigyan (Social Science)', 'Hindi', 'English']
    }
  },
  'Class 8': {
    CBSE: {
      'Not applicable': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'],
      Science: ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'],
      Commerce: ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'],
      'Humanities / Arts': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi']
    },
    ICSE: {
      'Not applicable': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi', 'Computer Science'],
      Science: ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'],
      Commerce: ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'],
      'Humanities / Arts': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi']
    },
    'UP Board': {
      'Not applicable': ['Ganit (Mathematics)', 'Vigyan (Science)', 'Samajik Vigyan (Social Science)', 'Hindi', 'English'],
      Science: ['Ganit (Mathematics)', 'Vigyan (Science)', 'Samajik Vigyan (Social Science)', 'Hindi', 'English'],
      Commerce: ['Ganit (Mathematics)', 'Vigyan (Science)', 'Samajik Vigyan (Social Science)', 'Hindi', 'English'],
      'Humanities / Arts': ['Ganit (Mathematics)', 'Vigyan (Science)', 'Samajik Vigyan (Social Science)', 'Hindi', 'English']
    }
  },
  'Class 9': {
    CBSE: {
      'Not applicable': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'],
      Science: ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'],
      Commerce: ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'],
      'Humanities / Arts': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi']
    },
    ICSE: {
      'Not applicable': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi', 'Computer Science'],
      Science: ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'],
      Commerce: ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'],
      'Humanities / Arts': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi']
    },
    'UP Board': {
      'Not applicable': ['Ganit (Mathematics)', 'Vigyan (Science)', 'Samajik Vigyan (Social Science)', 'Hindi', 'English'],
      Science: ['Ganit (Mathematics)', 'Vigyan (Science)', 'Samajik Vigyan (Social Science)', 'Hindi', 'English'],
      Commerce: ['Ganit (Mathematics)', 'Vigyan (Science)', 'Samajik Vigyan (Social Science)', 'Hindi', 'English'],
      'Humanities / Arts': ['Ganit (Mathematics)', 'Vigyan (Science)', 'Samajik Vigyan (Social Science)', 'Hindi', 'English']
    }
  },
  'Class 10': {
    CBSE: {
      'Not applicable': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'],
      Science: ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'],
      Commerce: ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'],
      'Humanities / Arts': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi']
    },
    ICSE: {
      'Not applicable': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi', 'Computer Science'],
      Science: ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'],
      Commerce: ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'],
      'Humanities / Arts': ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi']
    },
    'UP Board': {
      'Not applicable': ['Ganit (Mathematics)', 'Vigyan (Science)', 'Samajik Vigyan (Social Science)', 'Hindi', 'English'],
      Science: ['Ganit (Mathematics)', 'Vigyan (Science)', 'Samajik Vigyan (Social Science)', 'Hindi', 'English'],
      Commerce: ['Ganit (Mathematics)', 'Vigyan (Science)', 'Samajik Vigyan (Social Science)', 'Hindi', 'English'],
      'Humanities / Arts': ['Ganit (Mathematics)', 'Vigyan (Science)', 'Samajik Vigyan (Social Science)', 'Hindi', 'English']
    }
  },
  'Class 11': {
    CBSE: {
      Science: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Computer Science'],
      Commerce: ['Accountancy', 'Business Studies', 'Economics', 'Mathematics', 'English'],
      'Humanities / Arts': ['History', 'Political Science', 'Geography', 'Economics', 'English'],
      'Not applicable': ['Physics', 'Chemistry', 'Mathematics', 'English']
    },
    ICSE: {
      Science: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Computer Science'],
      Commerce: ['Accountancy', 'Business Studies', 'Economics', 'Mathematics', 'English'],
      'Humanities / Arts': ['History', 'Political Science', 'Geography', 'Economics', 'English'],
      'Not applicable': ['Physics', 'Chemistry', 'Mathematics', 'English']
    },
    'UP Board': {
      Science: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Hindi', 'English'],
      Commerce: ['Accountancy', 'Business Studies', 'Economics', 'Hindi', 'English'],
      'Humanities / Arts': ['History', 'Political Science', 'Geography', 'Hindi', 'English'],
      'Not applicable': ['Physics', 'Chemistry', 'Mathematics', 'Hindi']
    }
  },
  'Class 12': {
    CBSE: {
      Science: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Computer Science'],
      Commerce: ['Accountancy', 'Business Studies', 'Economics', 'Mathematics', 'English'],
      'Humanities / Arts': ['History', 'Political Science', 'Geography', 'Economics', 'English'],
      'Not applicable': ['Physics', 'Chemistry', 'Mathematics', 'English']
    },
    ICSE: {
      Science: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Computer Science'],
      Commerce: ['Accountancy', 'Business Studies', 'Economics', 'Mathematics', 'English'],
      'Humanities / Arts': ['History', 'Political Science', 'Geography', 'Economics', 'English'],
      'Not applicable': ['Physics', 'Chemistry', 'Mathematics', 'English']
    },
    'UP Board': {
      Science: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Hindi', 'English'],
      Commerce: ['Accountancy', 'Business Studies', 'Economics', 'Hindi', 'English'],
      'Humanities / Arts': ['History', 'Political Science', 'Geography', 'Hindi', 'English'],
      'Not applicable': ['Physics', 'Chemistry', 'Mathematics', 'Hindi']
    }
  }
};

/**
 * Chapter database for authentic curriculum mapping
 */
export const CURRICULUM_CHAPTERS: CurriculumChapter[] = [
  // ==========================================
  // CLASS 9 CBSE MATHEMATICS
  // ==========================================
  {
    id: 'cbse-9-math-ch1',
    number: 1,
    title: 'Number Systems',
    subject: 'Mathematics',
    classLevel: 'Class 9',
    board: 'CBSE',
    description: 'Irrational numbers, real numbers and decimal expansions, laws of exponents for real numbers.',
    topics: [
      {
        id: 'cbse-9-math-t1',
        title: 'Irrational Numbers and Decimal Expansions',
        difficulty: 'Beginner',
        keyPoints: [
          'Irrational numbers cannot be written in the form p/q (q != 0).',
          'Decimal expansion of irrational numbers is non-terminating and non-recurring.',
          'Square roots of non-perfect squares like √2, √3, √5 are irrational.'
        ],
        formulas: ['p/q representation', 'a^(m) * a^(n) = a^(m+n)'],
        summary: 'Understand the distinction between terminating, non-terminating repeating, and non-repeating decimals on the number line.'
      },
      {
        id: 'cbse-9-math-t2',
        title: 'Rationalisation of Denominators',
        difficulty: 'Intermediate',
        keyPoints: [
          'Multiply numerator and denominator by conjugate surd.',
          '(a + √b)(a - √b) = a² - b.'
        ],
        formulas: ['1 / (√a + √b) = (√a - √b) / (a - b)'],
        summary: 'Simplifying surds by clearing radicals from the denominator.'
      }
    ]
  },
  {
    id: 'cbse-9-math-ch2',
    number: 2,
    title: 'Polynomials',
    subject: 'Mathematics',
    classLevel: 'Class 9',
    board: 'CBSE',
    description: 'Polynomials in one variable, zeroes of a polynomial, Remainder Theorem, Factor Theorem and algebraic identities.',
    topics: [
      {
        id: 'cbse-9-math-t3',
        title: 'Zeroes of a Polynomial & Remainder Theorem',
        difficulty: 'Beginner',
        keyPoints: [
          'A zero of a polynomial p(x) is a number c such that p(c) = 0.',
          'A non-zero constant polynomial has no zero.',
          'Every real number is a zero of the zero polynomial.'
        ],
        formulas: ['p(x) = g(x) * q(x) + r(x) where deg(r) < deg(g)'],
        summary: 'Finding zeroes of linear, quadratic polynomials and algebraic roots.'
      },
      {
        id: 'cbse-9-math-t4',
        title: 'Factorisation of Polynomials & Identities',
        difficulty: 'Intermediate',
        keyPoints: [
          'Splitting the middle term method for quadratic trinomials.',
          'Factor Theorem: x - a is a factor of p(x) if p(a) = 0.',
          'Cubic polynomial factorisation using synthetic trial and division.'
        ],
        formulas: [
          '(x + y + z)² = x² + y² + z² + 2xy + 2yz + 2zx',
          'x³ + y³ + z³ - 3xyz = (x + y + z)(x² + y² + z² - xy - yz - zx)'
        ],
        summary: 'Master factoring quadratic and cubic expressions through algebraic identities.'
      }
    ]
  },
  {
    id: 'cbse-9-math-ch3',
    number: 3,
    title: 'Coordinate Geometry',
    subject: 'Mathematics',
    classLevel: 'Class 9',
    board: 'CBSE',
    description: 'Cartesian plane, coordinates of a point, plotting points in the plane.',
    topics: [
      {
        id: 'cbse-9-math-t5',
        title: 'The Cartesian Coordinate System',
        difficulty: 'Beginner',
        keyPoints: [
          'X-axis is the horizontal abscissa; Y-axis is the vertical ordinate.',
          'Origin (0,0) is where both axes intersect at right angles.',
          'Four quadrants: I (+,+), II (-,+), III (-,-), IV (+,-).'
        ],
        formulas: ['Point notation: P(x, y)'],
        summary: 'Visualizing coordinates and sign conventions across the four quadrants.'
      }
    ]
  },
  {
    id: 'cbse-9-math-ch4',
    number: 4,
    title: 'Linear Equations in Two Variables',
    subject: 'Mathematics',
    classLevel: 'Class 9',
    board: 'CBSE',
    description: 'Linear equations, solution of a linear equation, graph of a linear equation in two variables.',
    topics: [
      {
        id: 'cbse-9-math-t6',
        title: 'Solutions and Graphs of Linear Equations',
        difficulty: 'Intermediate',
        keyPoints: [
          'Standard form: ax + by + c = 0 (a, b not simultaneously zero).',
          'A linear equation in two variables has infinitely many solutions.',
          'The graph of every linear equation in two variables is a straight line.'
        ],
        formulas: ['ax + by + c = 0', 'Slope-intercept: y = mx + c'],
        summary: 'Finding coordinate pairs and plotting straight lines on Cartesian grids.'
      }
    ]
  },
  {
    id: 'cbse-9-math-ch5',
    number: 5,
    title: 'Geometry',
    subject: 'Mathematics',
    classLevel: 'Class 9',
    board: 'CBSE',
    description: 'Congruence of triangles, criteria for congruence, properties of triangles, inequalities in a triangle, and Pythagoras theorem.',
    topics: [
      {
        id: 'cbse-9-math-t7',
        title: 'Triangles',
        difficulty: 'Intermediate',
        keyPoints: [
          'Two triangles are congruent if corresponding sides and angles are equal (SAS, ASA, AAS, SSS, RHS).',
          'Angles opposite to equal sides of an isosceles triangle are equal.',
          'In any right triangle, hypotenuse squared equals sum of squares of other two sides (Pythagoras Theorem: a² + b² = c²).'
        ],
        formulas: ['c² = a² + b²', 'AD/DB = AE/EC (BPT)', 'Area = 1/2 × base × height'],
        summary: 'Congruence criteria, similarity properties, and geometric proofs for triangles.'
      },
      {
        id: 'cbse-9-math-t8',
        title: 'Lines and Angles',
        difficulty: 'Beginner',
        keyPoints: [
          'Linear pair of angles sums to 180° on any straight line.',
          'Vertically opposite angles are equal when two lines intersect.',
          'Sum of three interior angles in any triangle is always 180°.'
        ],
        formulas: ['∠A + ∠B + ∠C = 180°', 'Interior angle sum = (n - 2) × 180°'],
        summary: 'Fundamental axioms of straight lines, transversals, and angles.'
      }
    ]
  },

  // ==========================================
  // CLASS 9 CBSE SCIENCE
  // ==========================================
  {
    id: 'cbse-9-sci-ch1',
    number: 1,
    title: 'Matter in Our Surroundings',
    subject: 'Science',
    classLevel: 'Class 9',
    board: 'CBSE',
    description: 'Physical nature of matter, characteristics of particles, states of matter and latent heat.',
    topics: [
      {
        id: 'cbse-9-sci-t1',
        title: 'States of Matter and Kinetic Particle Theory',
        difficulty: 'Beginner',
        keyPoints: [
          'Matter is made up of particles that have spaces and attract each other.',
          'Solid, Liquid, Gas: differ in shape, volume, compressibility and kinetic energy.',
          'Diffusion increases with temperature as kinetic velocity rises.'
        ],
        summary: 'Explaining particle arrangement, intermolecular forces and spacing.'
      },
      {
        id: 'cbse-9-sci-t2',
        title: 'Evaporation and Latent Heat',
        difficulty: 'Intermediate',
        keyPoints: [
          'Latent heat of fusion: heat to convert 1kg solid to liquid at atmospheric pressure.',
          'Latent heat of vaporization: heat to convert 1kg liquid to gas at boiling point.',
          'Evaporation is a surface phenomenon causing cooling.'
        ],
        summary: 'Thermal transitions occurring at constant temperature during state change.'
      }
    ]
  },
  {
    id: 'cbse-9-sci-ch2',
    number: 2,
    title: 'Atoms and Molecules',
    subject: 'Science',
    classLevel: 'Class 9',
    board: 'CBSE',
    description: 'Laws of chemical combination, Dalton atomic theory, atomic mass, molecular mass, mole concept.',
    topics: [
      {
        id: 'cbse-9-sci-t3',
        title: 'Law of Conservation of Mass & Definite Proportions',
        difficulty: 'Beginner',
        keyPoints: [
          'Mass can neither be created nor destroyed in a chemical reaction (Lavoisier).',
          'In a chemical substance elements are always present in definite proportions by mass (Proust).'
        ],
        summary: 'Quantitative foundations of chemical reactions.'
      },
      {
        id: 'cbse-9-sci-t4',
        title: 'Chemical Formulae and Molecular Mass',
        difficulty: 'Intermediate',
        keyPoints: [
          'Criss-cross method using valencies of combining ions.',
          'Polyatomic ions enclosed in brackets when multiplier > 1 (e.g., Ca(OH)₂).'
        ],
        summary: 'Writing systematic chemical formulae and calculating molecular weights.'
      }
    ]
  },
  {
    id: 'cbse-9-sci-ch3',
    number: 3,
    title: 'Motion and Laws of Motion',
    subject: 'Science',
    classLevel: 'Class 9',
    board: 'CBSE',
    description: 'Distance, displacement, velocity, acceleration, Newton laws of motion and momentum.',
    topics: [
      {
        id: 'cbse-9-sci-t5',
        title: 'Equations of Uniformly Accelerated Motion',
        difficulty: 'Intermediate',
        keyPoints: [
          'First equation: v = u + at relates velocity and time.',
          'Second equation: s = ut + 0.5at² relates displacement and time.',
          'Third equation: v² - u² = 2as relates velocity and distance.'
        ],
        formulas: ['v = u + at', 's = ut + (1/2)at²', 'v² - u² = 2as'],
        summary: 'Kinematic derivations using velocity-time graphs and numerical problem solving.'
      },
      {
        id: 'cbse-9-sci-t6',
        title: "Newton's Three Laws of Motion & Momentum",
        difficulty: 'Intermediate',
        keyPoints: [
          '1st Law: Law of Inertia (tendency to resist change in state of motion).',
          '2nd Law: Rate of change of momentum is proportional to applied force: F = ma.',
          '3rd Law: To every action there is an equal and opposite reaction.'
        ],
        formulas: ['p = mv', 'F = Δp / Δt = m(v - u) / t = ma'],
        summary: 'Understanding inertia, momentum conservation, and impulse.'
      }
    ]
  },
  {
    id: 'cbse-9-sci-ch4',
    number: 4,
    title: 'Carbon and Its Compounds',
    subject: 'Science',
    classLevel: 'Class 9',
    board: 'CBSE',
    description: 'Covalent bonding in carbon compounds, versatile nature of carbon, homologous series, and functional groups.',
    topics: [
      {
        id: 'cbse-9-sci-t7',
        title: 'Carbon and Its Compounds',
        difficulty: 'Intermediate',
        keyPoints: [
          'Carbon forms covalent bonds by sharing electrons due to its tetravalency (atomic number 6, valency 4).',
          'Catenation is the unique ability of carbon to form bonds with other carbon atoms, giving rise to long chains, branched chains, and rings.',
          'Allotropes of carbon include Diamond (tetrahedral non-conductor), Graphite (hexagonal conductor), and Fullerenes (C-60).'
        ],
        formulas: ['Alkanes: C_n H_{2n+2}', 'Alkenes: C_n H_{2n}', 'Alkynes: C_n H_{2n-2}'],
        summary: 'Covalent bonding, tetravalency, catenation, and allotropes of carbon.'
      },
      {
        id: 'cbse-9-sci-t8',
        title: 'Functional Groups',
        difficulty: 'Intermediate',
        keyPoints: [
          'A functional group is an atom or group of atoms that determines the characteristic chemical properties of an organic compound.',
          'Alcohols contain the hydroxyl group (-OH) ending in -ol (e.g., Ethanol C2H5OH).',
          'Aldehydes contain -CHO ending in -al, Ketones contain >C=O ending in -one, and Carboxylic acids contain -COOH ending in -oic acid.',
          'Homologous series differ from successive members by a -CH2- unit and 14 u atomic mass.'
        ],
        formulas: ['Alcohol: R-OH', 'Aldehyde: R-CHO', 'Ketone: R-CO-R\'', 'Carboxylic Acid: R-COOH', 'Ester: R-COO-R\''],
        summary: 'Nomenclature, structure, and chemical behavior of organic functional groups.'
      }
    ]
  },
  {
    id: 'cbse-phy-ch-motion',
    number: 1,
    title: 'Motion',
    subject: 'Physics',
    classLevel: 'Class 9',
    board: 'CBSE',
    description: 'Distance and displacement, uniform and non-uniform motion, speed, velocity, acceleration, and kinematic equations.',
    topics: [
      {
        id: 'phy-motion-t1',
        title: 'Motion',
        difficulty: 'Intermediate',
        keyPoints: [
          'Distance is the total path length (scalar); displacement is the shortest straight-line distance from initial to final position (vector).',
          'Speed is distance per unit time; velocity is displacement per unit time with direction.',
          'Slope of a velocity-time graph gives acceleration; area under the curve gives displacement.'
        ],
        formulas: ['v = u + at', 's = ut + (1/2)at²', 'v² - u² = 2as', 'a = (v - u) / t'],
        summary: 'Foundations of rectilinear motion, speed, velocity, acceleration, and graphical analysis.'
      },
      {
        id: 'phy-motion-t2',
        title: 'Equations of Motion',
        difficulty: 'Intermediate',
        keyPoints: [
          'First equation: v = u + at relates velocity, acceleration, and time.',
          'Second equation: s = ut + 0.5at² computes distance covered under uniform acceleration.',
          'Third equation: v² - u² = 2as determines distance and velocities without explicit time.'
        ],
        formulas: ['v = u + at', 's = ut + 0.5at²', 'v² - u² = 2as'],
        summary: 'Derivation and problem solving using the three standard kinematic equations.'
      }
    ]
  },
  {
    id: 'cbse-cs-ch1',
    number: 1,
    title: 'Data Structures',
    subject: 'Computer Science',
    classLevel: 'Class 11',
    board: 'CBSE',
    stream: 'Science',
    description: 'Hierarchical and linear data structures, arrays, stacks, queues, binary trees, and binary search trees.',
    topics: [
      {
        id: 'cbse-cs-t1',
        title: 'Binary Trees',
        difficulty: 'Intermediate',
        keyPoints: [
          'A binary tree is a hierarchical data structure where each node has at most two children: Left and Right.',
          'In-order traversal (Left -> Root -> Right) visits nodes of a Binary Search Tree (BST) in sorted ascending order.',
          'Search time complexity in a balanced BST is O(log N), compared to O(N) in a linear list.'
        ],
        formulas: ['Max nodes at level i = 2^i', 'Search time in balanced BST = O(log N)', 'Traversals: In-order, Pre-order, Post-order'],
        summary: 'Binary tree architecture, node properties, traversal algorithms, and BST operations.'
      }
    ]
  },

  // ==========================================
  // CLASS 11 CBSE SCIENCE: PHYSICS
  // ==========================================
  {
    id: 'cbse-11-phy-ch1',
    number: 1,
    title: 'Units and Measurements',
    subject: 'Physics',
    classLevel: 'Class 11',
    board: 'CBSE',
    stream: 'Science',
    description: 'SI units, dimensional analysis and applications, error analysis and significant figures.',
    topics: [
      {
        id: 'cbse-11-phy-t1',
        title: 'Dimensional Analysis and Homogeneity Principle',
        difficulty: 'Beginner',
        keyPoints: [
          'Dimensions of physical quantities expressed in powers of [M], [L], [T], [A].',
          'Principle of Homogeneity: only terms having identical dimensions can be added or subtracted.',
          'Applications: checking correctness of equations, deducing relations between physical quantities.'
        ],
        formulas: ['[Force] = [M L T⁻²]', '[Energy] = [M L² T⁻²]', '[Pressure] = [M L⁻¹ T⁻²]'],
        summary: 'Validating physical formulae and converting units across CGS and SI.'
      }
    ]
  },
  {
    id: 'cbse-11-phy-ch2',
    number: 2,
    title: 'Kinematics: Motion in a Straight Line & Plane',
    subject: 'Physics',
    classLevel: 'Class 11',
    board: 'CBSE',
    stream: 'Science',
    description: 'Instantaneous velocity and acceleration, calculus formulations, projectile motion and vectors.',
    topics: [
      {
        id: 'cbse-11-phy-t2',
        title: 'Projectile Motion on Horizontal Plane',
        difficulty: 'Intermediate',
        keyPoints: [
          'Horizontal motion is uniform (ax = 0); vertical motion is uniformly accelerated (ay = -g).',
          'Trajectory is parabolic: y = x tanθ - (gx²) / (2u² cos²θ).',
          'Time of flight: T = (2u sinθ) / g. Maximum Height: H = (u² sin²θ) / 2g.',
          'Horizontal Range: R = (u² sin2θ) / g (maximum at θ = 45°).'
        ],
        formulas: [
          'T = (2u sinθ) / g',
          'H_max = (u² sin²θ) / (2g)',
          'R = (u² sin2θ) / g'
        ],
        summary: 'Two-dimensional motion under constant gravitational acceleration.'
      }
    ]
  },
  {
    id: 'cbse-11-phy-ch3',
    number: 3,
    title: 'Laws of Motion and Work-Energy',
    subject: 'Physics',
    classLevel: 'Class 11',
    board: 'CBSE',
    stream: 'Science',
    description: 'Newton laws, friction, banking of roads, work-energy theorem and conservative forces.',
    topics: [
      {
        id: 'cbse-11-phy-t3',
        title: 'Work-Energy Theorem & Conservation of Energy',
        difficulty: 'Advanced',
        keyPoints: [
          'Work done by all forces equals the change in kinetic energy: W_net = ΔK = Kf - Ki.',
          'Work done by conservative force depends only on initial and final points.',
          'Potential energy is defined only for conservative forces: F = -dU/dx.'
        ],
        formulas: ['W = ∫ F · dx', 'W_net = (1/2)m v² - (1/2)m u²', 'E = K + U = constant'],
        summary: 'Analytical problem solving for mechanical energy conservation.'
      }
    ]
  },

  // ==========================================
  // CLASS 11 CBSE SCIENCE: CHEMISTRY
  // ==========================================
  {
    id: 'cbse-11-chem-ch1',
    number: 1,
    title: 'Some Basic Concepts of Chemistry',
    subject: 'Chemistry',
    classLevel: 'Class 11',
    board: 'CBSE',
    stream: 'Science',
    description: 'Mole concept, stoichiometry, limiting reagent, molarity, molality and mole fraction.',
    topics: [
      {
        id: 'cbse-11-chem-t1',
        title: 'Stoichiometry & Limiting Reagent',
        difficulty: 'Intermediate',
        keyPoints: [
          'Mole = 6.022 × 10²³ particles (Avogadro number).',
          'Limiting reagent is the reactant completely consumed first in a balanced reaction.',
          'Amount of product formed is strictly governed by the limiting reagent.'
        ],
        formulas: ['Moles = Mass / Molar Mass', 'Molarity (M) = Moles of solute / Liters of solution'],
        summary: 'Stoichiometric calculations in chemical synthesis.'
      }
    ]
  },
  {
    id: 'cbse-11-chem-ch2',
    number: 2,
    title: 'Structure of Atom & Periodic Classification',
    subject: 'Chemistry',
    classLevel: 'Class 11',
    board: 'CBSE',
    stream: 'Science',
    description: 'Bohr model, de Broglie relation, Heisenberg uncertainty principle, quantum numbers and orbitals.',
    topics: [
      {
        id: 'cbse-11-chem-t2',
        title: 'Quantum Numbers & Electronic Configuration',
        difficulty: 'Advanced',
        keyPoints: [
          'Principal quantum number (n): size and energy level of orbital.',
          'Azimuthal quantum number (l): orbital shape (s=0, p=1, d=2, f=3).',
          'Magnetic quantum number (m_l): spatial orientation of orbital.',
          'Spin quantum number (m_s): electron spin state (+1/2 or -1/2).',
          'Aufbau principle, Pauli exclusion principle, Hund rule of maximum multiplicity.'
        ],
        formulas: ['λ = h / (mv)', 'Δx · Δp ≥ h / (4π)'],
        summary: 'Subshell electron population and periodic trends.'
      }
    ]
  },
  {
    id: 'cbse-11-chem-ch3',
    number: 3,
    title: 'Organic Chemistry: Basic Principles & Functional Groups',
    subject: 'Chemistry',
    classLevel: 'Class 11',
    board: 'CBSE',
    stream: 'Science',
    description: 'IUPAC nomenclature, inductive and resonance effects, carbocation stability and functional groups.',
    topics: [
      {
        id: 'cbse-11-chem-t3',
        title: 'Functional Groups and IUPAC Nomenclature',
        difficulty: 'Intermediate',
        keyPoints: [
          'Functional group determines characteristic chemical reactivity of the organic molecule.',
          'Priority order for IUPAC: -COOH > -SO3H > -COOR > -COCl > -CONH2 > -CN > -CHO > >C=O > -OH > -NH2 > C=C > C≡C.',
          'Isomerism: Structural (chain, position, functional) and Stereoisomerism.'
        ],
        formulas: ['R-OH (Alcohol)', 'R-CHO (Aldehyde)', 'R-CO-R (Ketone)', 'R-COOH (Carboxylic Acid)'],
        summary: 'Systematic nomenclature of monofunctional and polyfunctional organic compounds.'
      }
    ]
  },

  // ==========================================
  // CLASS 12 CBSE COMMERCE: ACCOUNTANCY
  // ==========================================
  {
    id: 'cbse-12-acc-ch1',
    number: 1,
    title: 'Accounting for Partnership Firms — Fundamentals',
    subject: 'Accountancy',
    classLevel: 'Class 12',
    board: 'CBSE',
    stream: 'Commerce',
    description: 'Partnership deed, profit and loss appropriation account, partners capital accounts, interest on drawings.',
    topics: [
      {
        id: 'cbse-12-acc-t1',
        title: 'Profit and Loss Appropriation & Interest on Capital',
        difficulty: 'Intermediate',
        keyPoints: [
          'P&L Appropriation account is an extension of Profit & Loss account.',
          'In absence of Partnership Deed: Equal profit sharing, no interest on capital or drawings, 6% p.a. on partner loans.',
          'Fixed vs Fluctuating Capital Accounts.'
        ],
        formulas: ['Interest on Capital = Capital × Rate/100 × Period', 'Interest on Drawings = Total × Rate/100 × Average Period/12'],
        summary: 'Appropriation of net profits among partners according to deed provisions.'
      }
    ]
  },
  {
    id: 'cbse-12-acc-ch2',
    number: 2,
    title: 'Accounting for Share Capital',
    subject: 'Accountancy',
    classLevel: 'Class 12',
    board: 'CBSE',
    stream: 'Commerce',
    description: 'Issue of shares at par, premium, calls in arrears, calls in advance, forfeiture and reissue of shares.',
    topics: [
      {
        id: 'cbse-12-acc-t2',
        title: 'Forfeiture and Reissue of Shares',
        difficulty: 'Advanced',
        keyPoints: [
          'Share capital account debited with called-up amount on forfeited shares.',
          'Share Forfeiture Account credited with amount already received towards face value.',
          'Profit on reissue transferred to Capital Reserve Account.'
        ],
        summary: 'Pro-rata allotment accounting and capital reserve calculations.'
      }
    ]
  },

  // ==========================================
  // CLASS 12 CBSE COMMERCE: BUSINESS STUDIES
  // ==========================================
  {
    id: 'cbse-12-bst-ch1',
    number: 1,
    title: 'Principles of Management',
    subject: 'Business Studies',
    classLevel: 'Class 12',
    board: 'CBSE',
    stream: 'Commerce',
    description: 'Fayol 14 principles of general management, Taylor scientific management techniques.',
    topics: [
      {
        id: 'cbse-12-bst-t1',
        title: "Henri Fayol's 14 Principles of Management",
        difficulty: 'Beginner',
        keyPoints: [
          'Division of Work: Specialization increases efficiency.',
          'Unity of Command: One subordinate should receive orders from one superior only.',
          'Unity of Direction: One head and one plan for a group of activities having the same objective.',
          'Scalar Chain: Formal line of authority from highest to lowest rank (Gang Plank for emergency).'
        ],
        summary: 'Fundamental guidelines for organizational decision-making and managerial behavior.'
      }
    ]
  },

  // ==========================================
  // CLASS 12 CBSE COMMERCE: ECONOMICS
  // ==========================================
  {
    id: 'cbse-12-eco-ch1',
    number: 1,
    title: 'National Income Accounting',
    subject: 'Economics',
    classLevel: 'Class 12',
    board: 'CBSE',
    stream: 'Commerce',
    description: 'Circular flow of income, GDP, GNP, NNP at market price and factor cost, Value Added, Income and Expenditure methods.',
    topics: [
      {
        id: 'cbse-12-eco-t1',
        title: 'Measurement of National Income (Three Methods)',
        difficulty: 'Advanced',
        keyPoints: [
          'Value Added Method: Gross Value Added (GVA) = Value of Output - Intermediate Consumption.',
          'Income Method: Compensation of Employees + Operating Surplus (Rent + Interest + Profit) + Mixed Income.',
          'Expenditure Method: Private Final Consumption + Govt Final Consumption + Gross Capital Formation + Net Exports (X - M).',
          'NNP_fc is National Income.'
        ],
        formulas: [
          'GVA_mp = Value of Output - Intermediate Consumption',
          'NNP_fc = GDP_mp - Depreciation + NFIA - NIT'
        ],
        summary: 'National macroeconomic measurement and GDP deflator adjustments.'
      }
    ]
  },

  // ==========================================
  // CLASS 8 UP BOARD: GANIT (MATHEMATICS)
  // ==========================================
  {
    id: 'up-8-math-ch1',
    number: 1,
    title: 'Parimey Sankhyayein (Rational Numbers)',
    subject: 'Ganit (Mathematics)',
    classLevel: 'Class 8',
    board: 'UP Board',
    description: 'Parimey sankhyao par sakriyayein, yog, antar, guna aur bhag ke niyam.',
    topics: [
      {
        id: 'up-8-math-t1',
        title: 'Parimey Sankhyao ke Gun-Dharm',
        difficulty: 'Beginner',
        keyPoints: [
          'Parimey sankhya p/q ke roop me hoti hai jahan q ≠ 0.',
          'Samvarak (Closure), Kram-vinimey (Commutative) aur Sahachari (Associative) niyam.',
          'Yogya tat-samak (Additive Identity) 0 hai aur Gunatmak tat-samak 1 hai.'
        ],
        formulas: ['p/q + r/s = (ps + qr) / qs'],
        summary: 'Basic operations and axioms governing rational fractions in Hindi.'
      }
    ]
  },
  {
    id: 'up-8-math-ch2',
    number: 2,
    title: 'Varg aur Vargmool (Squares and Square Roots)',
    subject: 'Ganit (Mathematics)',
    classLevel: 'Class 8',
    board: 'UP Board',
    description: 'Purna varg sankhyayein, gunankhand vidhi aur bhag vidhi se vargmool gyat karna.',
    topics: [
      {
        id: 'up-8-math-t2',
        title: 'Bhag Vidhi se Vargmool (Square Root by Division Method)',
        difficulty: 'Intermediate',
        keyPoints: [
          'Sankhya ke jode (pairs) daye se baye banaye jaate hain.',
          'Badi sankhyao ka vargmool aasani se bhag vidhi dwara gyat hota hai.',
          'Dashamalav sankhyao ka vargmool nikalne ke niyam.'
        ],
        summary: 'Calculating roots of large integers and decimals using long division.'
      }
    ]
  },

  // ==========================================
  // CLASS 8 UP BOARD: VIGYAN (SCIENCE)
  // ==========================================
  {
    id: 'up-8-sci-ch1',
    number: 1,
    title: 'Dainik Jeevan me Vigyan evam Prodyogiki',
    subject: 'Vigyan (Science)',
    classLevel: 'Class 8',
    board: 'UP Board',
    description: 'Sanchar, shiksha, chikitsa aur antariksh kshetra me vigyan ki naveen upalabdhiyaan.',
    topics: [
      {
        id: 'up-8-sci-t1',
        title: 'Naveen Prodyogiki evam Vigyan ke Labh',
        difficulty: 'Beginner',
        keyPoints: [
          'Internet, e-governance aur mobile dwara sanchar me kranti.',
          'Chikitsa me CT scan, MRI aur X-ray dwara rog ki sahi jaanch.',
          'Krishi me unnat beej, tractor aur harvester dwara harit kranti.'
        ],
        summary: 'Application of modern science and technologies in rural and urban development.'
      }
    ]
  },
  ...ADDITIONAL_CURRICULUM_CHAPTERS
];

/**
 * Pedagogical Content Generator
 * Generates class-level calibrated content for the 4 learning styles:
 * 1. Simple: Accessible conversational explanation, friendly rules, simple bullet points
 * 2. Analogy: Relatable real-world story, side-by-side concept mapping table, mental model
 * 3. Visual: ASCII hierarchical diagram, styled comparison table, step-by-step roadmap
 * 4. Exam-oriented: Official board definition, high-yield points, common mistakes, marking criteria, board practice questions
 */
export function generateCurriculumLesson(
  grade: ClassLevel,
  board: BoardType,
  stream: StreamType,
  subject: string,
  chapterId?: string,
  topicId?: string
): CurriculumLessonContent {
  const matchesChapter = (c: (typeof CURRICULUM_CHAPTERS)[0], idOrTitle?: string) => {
    if (!idOrTitle) return true;
    const clean = idOrTitle.toLowerCase().trim();
    return (
      c.id.toLowerCase() === clean ||
      c.title.toLowerCase() === clean ||
      c.title.toLowerCase().includes(clean) ||
      clean.includes(c.title.toLowerCase())
    );
  };

  const matchesTopic = (t: (typeof CURRICULUM_CHAPTERS)[0]['topics'][0], idOrTitle?: string) => {
    if (!idOrTitle) return true;
    const clean = idOrTitle.toLowerCase().trim();
    return (
      t.id.toLowerCase() === clean ||
      t.title.toLowerCase() === clean ||
      t.title.toLowerCase().includes(clean) ||
      clean.includes(t.title.toLowerCase())
    );
  };

  // Find chapter
  let chapter = CURRICULUM_CHAPTERS.find(
    (c) =>
      c.classLevel === grade &&
      c.board === board &&
      (c.subject.toLowerCase() === subject.toLowerCase() ||
        c.subject.toLowerCase().includes(subject.toLowerCase())) &&
      matchesChapter(c, chapterId)
  );

  // Fallback to any chapter for that subject and grade
  if (!chapter) {
    chapter = CURRICULUM_CHAPTERS.find(
      (c) =>
        c.classLevel === grade &&
        (c.subject.toLowerCase() === subject.toLowerCase() ||
          c.subject.toLowerCase().includes(subject.toLowerCase())) &&
        matchesChapter(c, chapterId)
    );
  }

  // Fallback to any chapter matching subject
  if (!chapter) {
    chapter = CURRICULUM_CHAPTERS.find(
      (c) =>
        (c.subject.toLowerCase() === subject.toLowerCase() ||
          c.subject.toLowerCase().includes(subject.toLowerCase())) &&
        matchesChapter(c, chapterId)
    );
  }

  // Absolute fallback if subject has no curated entry yet (create realistic shell)
  if (!chapter) {
    chapter = {
      id: `ch-custom-${subject.toLowerCase().replace(/\s+/g, '-')}`,
      number: 1,
      title: `${subject} Core Fundamentals`,
      subject,
      classLevel: grade,
      board,
      stream,
      description: `Structured curriculum topics for ${subject} according to ${board} ${grade} syllabus.`,
      topics: [
        {
          id: `t-custom-1`,
          title: `Introduction to ${subject} Concepts`,
          difficulty: 'Beginner',
          keyPoints: [
            `Core principles of ${subject} as prescribed by ${board}.`,
            `Foundational definitions and standard board terminology.`,
            `Application of concepts to real-world problem sets.`
          ],
          summary: `Primary conceptual building block for ${subject} in ${grade}.`
        }
      ]
    };
  }

  const topic =
    (topicId ? chapter.topics.find((t) => matchesTopic(t, topicId)) : chapter.topics[0]) ||
    chapter.topics[0];

  const tTitle = topic.title.toLowerCase();
  const chTitle = chapter.title.toLowerCase();
  const subName = chapter.subject.toLowerCase();

  // -------------------------------------------------------------
  // SPECIALIZED PEDAGOGY: IRRATIONAL NUMBERS & NUMBER SYSTEMS
  // -------------------------------------------------------------
  if (tTitle.includes('irrational') || chTitle.includes('number system')) {
    return {
      subject: chapter.subject,
      classLevel: grade,
      board,
      stream: stream || 'Not applicable',
      chapterId: chapter.id,
      chapterTitle: `Chapter ${chapter.number} • ${chapter.title}`,
      topicId: topic.id,
      topicTitle: topic.title,
      difficulty: topic.difficulty,
      progress: 45,
      styles: {
        Simple: {
          heading: `Understanding Irrational Numbers & Decimal Expansions`,
          paragraph: `A rational number is any number that can be written as a clean fraction p/q of two integers (like 1/2, 3/4, or -5). An irrational number CANNOT be written as a fraction of integers. When converted to decimals, irrational numbers never stop (they are non-terminating) and their decimal digits never repeat in a pattern (non-recurring). For example, √2 = 1.41421356... and π = 3.14159265... continue endlessly without ever settling into a repeating cycle. On the number line, irrational numbers fill every single microscopic space between the fractions!`,
          subtext: `Core takeaway: Rational decimals either terminate (like 0.75) or repeat a fixed block (like 0.333...). Irrational decimals keep going endlessly with no repeating block.`,
          tip: `Friendly Rule: The square root of any positive number that isn't a perfect square (such as √2, √3, √5, √7) is guaranteed to be an irrational number!`,
          bulletPoints: [
            'Cannot be expressed in p/q form where p, q are integers and q ≠ 0.',
            'Decimal expansion is strictly non-terminating and non-recurring.',
            'Surds of non-perfect squares (√2, √3, √5, ∛2) are irrational.',
            'Operations: The sum or product of a rational number with an irrational number is always irrational (e.g., 2 + √3, 5√2).'
          ]
        },
        Analogy: {
          heading: `The Unbreakable Kitchen Measuring Cup Analogy`,
          paragraph: `Imagine baking in a kitchen equipped with standard measuring cups: 1 cup, 1/2 cup, 1/3 cup, 1/4 cup. Any recipe that can be measured using whole combinations of these standard cups represents a Rational Number (p/q). Now imagine a recipe requiring a continuous fluid volume that no combination of measuring cups can ever measure exactly — like trying to fill a perfectly round spherical bowl using only square ice cubes. That exact, elusive volume is an Irrational Number! You can get closer and closer with smaller fractions, but no finite fraction of measuring cups can ever measure it with 100% precision.`,
          subtext: `Mental Model: Rational numbers are countable bricks. Irrational numbers are the smooth continuous water that flows between and seals every microscopic gap between the bricks to form the solid Real Number Line.`,
          tip: `Analogy Insight: Just as circles in geometry need π to exist, the continuous fabric of the real number line needs irrational numbers so there are no empty pinholes.`,
          analogyDetails: {
            analogyTitle: `Kitchen Measuring Cups vs. Continuous Fluid Flow`,
            analogyStory: `Think of rational numbers as countable Lego blocks placed side-by-side. Even if you place billions of microscopic blocks on a table, there remain infinitely tiny gaps between them. Irrational numbers are the continuous water that flows into and seals every single gap, creating the completely solid Real Number Line (ℝ).`,
            conceptMapping: [
              { realWorld: `Standard Measuring Cups (1/2, 3/4)`, concept: `Rational Numbers (p/q integer fractions)` },
              { realWorld: `Smooth Continuous Fluid Flow / Circle Curve`, concept: `Irrational Numbers (√2, π, √3)` },
              { realWorld: `The Solid Kitchen Counter with Zero Gaps`, concept: `The Real Number Line (ℝ)` },
              { realWorld: `Exact Cup Marks (e.g. 0.25 L)`, concept: `Terminating Decimals` },
              { realWorld: `Endless Non-Repeating Melody in Jazz`, concept: `Non-terminating Non-recurring Decimals` }
            ]
          }
        },
        Visual: {
          heading: `Visual Architecture: The Real Number System`,
          paragraph: `Here is the structured hierarchy showing where Irrational Numbers sit inside Mathematics:`,
          visualDiagram: `                  REAL NUMBERS (ℝ)
                 /                \\
                /                  \\
    RATIONAL NUMBERS (ℚ)      IRRATIONAL NUMBERS (I)
    ├── Fractions (3/4, -5/2)  ├── Non-terminating &
    ├── Decimals:              │   Non-repeating decimals
    │   * Terminating (0.5)    ├── Non-perfect square roots:
    │   * Repeating (0.333...) │   √2, √3, √5, √7, ∛2
    └── INTEGERS (ℤ)           └── Transcendental constants:
         └── WHOLE (𝕎)              π (3.14159...), e (2.71828...)
              └── NATURAL (ℕ)`,
          comparisonTable: {
            headers: [`Property`, `Rational Numbers (ℚ)`, `Irrational Numbers (I)`],
            rows: [
              [`Fraction Form`, `Can be written as p/q (q ≠ 0)`, `CANNOT be written as p/q`],
              [`Decimal Expansion`, `Terminating OR Non-terminating Repeating`, `Non-terminating AND Non-repeating`],
              [`Square Roots`, `√4 = 2, √9 = 3 (Perfect squares)`, `√2 = 1.414..., √3 = 1.732... (Surds)`],
              [`Number Line Role`, `Dense on line, but leaves infinite holes`, `Fills every remaining gap to form ℝ`],
              [`Examples`, `-3, 0, 1/2, 0.75, 0.666...`, `√2, √3, π, e, 0.1010010001...`]
            ]
          },
          visualSteps: [
            `Step 1: Check if the number can be expressed as a ratio of two integers p/q.`,
            `Step 2: If in radical form √n, check if n is a perfect square.`,
            `Step 3: If in decimal form, check whether the decimal terminates or repeats a cycle.`,
            `Step 4: If it continues indefinitely without repeating a fixed block, it is Irrational.`
          ],
          subtext: `Notice that 0.101001000100001... is irrational because the number of zeros increases, so no fixed pattern repeats!`,
          tip: `Visual Cue: Draw a right-angled triangle with base 1 and height 1. By Pythagoras, the hypotenuse is exactly √2, pinning an irrational point on the number line!`
        },
        'Exam-oriented': {
          heading: `${board} Class ${grade} Board Examination Blueprint`,
          paragraph: `Irrational Numbers is tested in ${board} Section A (1-mark MCQs) and Section B/C (2-mark and 3-mark analytical problems). Board evaluators test: (1) Recognizing irrational numbers, (2) Inserting irrationals between two numbers, and (3) Operations on real numbers.`,
          subtext: `Board Marking Tip: Full credit requires writing the exact phrase "non-terminating and non-recurring" in justification questions.`,
          tip: `Exam Secret: Questions asking to rationalise the denominator (like 1 / (7 + 3√2)) award 1 mark for multiplying by conjugate (7 - 3√2) and 1 mark for final simplified form.`,
          examBreakdown: {
            definition: `A number 's' is called an irrational number if it cannot be written in the form p/q, where p and q are integers and q ≠ 0.`,
            keyPoints: [
              `The decimal expansion of an irrational number is non-terminating and non-recurring.`,
              `Sum or difference of a rational number and an irrational number is always irrational: e.g., (2 + √3) is irrational.`,
              `Product or quotient of a non-zero rational with an irrational is always irrational: e.g., 3√2 is irrational.`,
              `Sum or product of two irrationals may be rational or irrational: e.g., √2 × √2 = 2 (Rational), but √2 × √3 = √6 (Irrational).`
            ],
            formulas: [
              `Conjugate identity: (a + √b)(a - √b) = a² - b`,
              `Radical product: √(ab) = √a · √b`,
              `Quotient: √(a/b) = √a / √b`
            ],
            importantFacts: [
              `π is irrational, whereas 22/7 and 3.14 are rational approximations.`,
              `There are infinitely many rational and irrational numbers between any two real numbers.`
            ],
            commonMistakes: [
              `Mistake: Writing "π = 22/7, so π is rational". (Correction: 22/7 is only an approximation. π is irrational!)`,
              `Mistake: Assuming the sum of two irrationals is always irrational. (Correction: (2 + √3) + (2 - √3) = 4, which is rational!)`,
              `Mistake: Classifying √16 or √0.04 as irrational without evaluating. (Correction: √16 = 4 and √0.04 = 0.2, both are rational!)`
            ],
            examTips: [
              `To insert an irrational number between 'a' and 'b', construct a non-terminating non-repeating decimal or write √(ab) if not a perfect square.`,
              `Always simplify expressions before answering: (3 + √2)(3 - √2) = 9 - 2 = 7 (Rational).`
            ],
            practiceQuestions: [
              {
                question: `Classify the following as rational or irrational: (i) √23, (ii) √225, (iii) 0.3796, (iv) 7.478478...`,
                marks: `2 Marks`,
                solution: `(i) √23: 23 is not a perfect square → Irrational. (ii) √225 = 15 = 15/1 → Rational. (iii) 0.3796: Terminating decimal → Rational. (iv) 7.478478...: Non-terminating recurring → Rational.`
              },
              {
                question: `Find two irrational numbers between 2 and 3.`,
                marks: `2 Marks`,
                solution: `Number 1: 2.1010010001... Number 2: 2.2020020002... Both are non-terminating and non-recurring and lie between 2 and 3.`
              }
            ]
          }
        }
      }
    };
  }

  // -------------------------------------------------------------
  // SPECIALIZED PEDAGOGY: GEOMETRY & TRIANGLES
  // -------------------------------------------------------------
  if (tTitle.includes('triangle') || chTitle.includes('geometry')) {
    return {
      subject: chapter.subject,
      classLevel: grade,
      board,
      stream: stream || 'Not applicable',
      chapterId: chapter.id,
      chapterTitle: `Chapter ${chapter.number} • ${chapter.title}`,
      topicId: topic.id,
      topicTitle: topic.title,
      difficulty: topic.difficulty,
      progress: 50,
      styles: {
        Simple: {
          heading: `Understanding Triangles, Congruence & Pythagoras`,
          paragraph: `A triangle is a closed shape with three sides and three angles. Two triangles are called 'congruent' if they are identical clones — identical shapes, identical side lengths, and matching angles. If you lift one up and place it on top of the other, they cover each other completely! There are 5 standard congruence tests (SAS, ASA, AAS, SSS, and RHS). In any right-angled triangle, the famous Pythagoras Theorem gives us: (Hypotenuse)² = (Base)² + (Perpendicular)².`,
          subtext: `Core takeaway: In congruent triangles, Corresponding Parts of Congruent Triangles (CPCT) are always equal!`,
          tip: `Friendly Tip: Remember CPCT! Once you prove two triangles are congruent using 3 criteria, all other corresponding sides and angles are automatically equal.`,
          bulletPoints: [
            'Sum of all three angles in any triangle is always 180°.',
            'Two triangles are congruent if they have identical shape and identical size.',
            '5 Congruence Criteria: SAS, ASA, AAS, SSS, RHS.',
            'Pythagorean Theorem for right triangles: a² + b² = c².'
          ]
        },
        Analogy: {
          heading: `The Cookie Cutter & Factory Stencil Analogy`,
          paragraph: `Imagine a factory cookie cutter stamping out biscuits from rolled dough. Every single cookie stamped from the same cutter has identical dimensions: matching side lengths, matching corner angles, and identical area. If you stack them up, they fit together with zero overhang. That is exactly what 'Congruence' means in geometry! Unlike 'similarity' (which is like a smartphone photo and its giant movie poster), congruent figures are exact physical twins with identical measurements.`,
          subtext: `Mental Model: Similar = Same shape, different size (like a blueprint vs a house). Congruent = Same shape AND same size (like two identical puzzle pieces).`,
          tip: `Analogy Insight: Two photocopies of the same document are congruent; a scaled reduction is only similar.`,
          analogyDetails: {
            analogyTitle: `The Cookie Cutter & Precision Die Stencil`,
            analogyStory: `Think of two identical puzzle pieces cut from the same die: their corners fit identically into the board. When you establish 3 specific matching measurements (like SSS or SAS), the rest of the puzzle piece is mechanically locked into place.`,
            conceptMapping: [
              { realWorld: `Cookie Cutter Die / Stencil`, concept: `Congruence Condition (SAS, SSS)` },
              { realWorld: `Identical Cookies Stacked with No Overhang`, concept: `Superimposing Congruent Triangles` },
              { realWorld: `Photo and its Giant Poster`, concept: `Similar Triangles (Same angles, scaled sides)` },
              { realWorld: `Ladder Leaning against a Wall`, concept: `Right-angled Triangle (Pythagoras Theorem)` },
              { realWorld: `Guaranteed Matching Edges`, concept: `CPCT (Corresponding Parts of Congruent Triangles)` }
            ]
          }
        },
        Visual: {
          heading: `Visual Framework: Triangle Congruence & Geometry`,
          paragraph: `Here is the visual classification of triangle congruence criteria and properties:`,
          visualDiagram: `                     TRIANGLE CONGRUENCE (△ABC ≅ △PQR)
                                    │
        ┌─────────────┬─────────────┼─────────────┬─────────────┐
        │             │             │             │             │
       SAS           ASA           AAS           SSS           RHS
     2 sides &     2 angles &    2 angles &    All 3 sides   Right-angle,
     included      included      non-included  equal         Hypotenuse &
     angle equal   side equal    side equal    (AB=PQ etc)   1 side equal
                                    │
                                    ▼
                 RESULT: CPCT (All remaining parts equal!)
                                    │
        ┌───────────────────────────┴───────────────────────────┐
        ▼                                                       ▼
  RIGHT TRIANGLES (Pythagoras)                         SIMILAR TRIANGLES (Thales / BPT)
  In right △ABC (∠B = 90°):                            If DE || BC in △ABC:
      AC² = AB² + BC²                                      AD / DB = AE / EC
  (e.g., 6-8-10, 3-4-5, 5-12-13)                           Area ratio = (AB / PQ)²`,
          comparisonTable: {
            headers: [`Criteria`, `Requirements`, `Invalid Alternative`, `Key Visual Check`],
            rows: [
              [`SAS`, `Two sides & INCLUDED angle between them`, `SSA or ASS is NOT valid!`, `Angle MUST be between the two sides`],
              [`ASA`, `Two angles & INCLUDED side between them`, `AAA only proves similarity`, `Side MUST join the two angles`],
              [`SSS`, `All three corresponding sides equal`, `Angles automatically match`, `Check all 3 side lengths`],
              [`RHS`, `Right angle, Hypotenuse & any one side`, `Applies ONLY to right triangles`, `Hypotenuse must be verified`]
            ]
          },
          visualSteps: [
            `Step 1: Identify given equal sides and angles in both triangles.`,
            `Step 2: Check if the angle is included between the sides (for SAS) or side is between angles (for ASA).`,
            `Step 3: Select valid criterion (SAS, ASA, AAS, SSS, or RHS).`,
            `Step 4: Conclude congruence (△ABC ≅ △PQR) and apply CPCT to find unknowns.`
          ],
          subtext: `Crucial Visual Rule: 'AAA' (Angle-Angle-Angle) proves SIMILARITY, not Congruence!`,
          tip: `Visual Cue: Look at where the angle sits: if it is nestled right between the two given lines, use SAS!`
        },
        'Exam-oriented': {
          heading: `${board} Examination Blueprint: Geometry & Triangles`,
          paragraph: `Triangles carry high weightage (8-10 marks). Board exam questions focus on: (1) 2-mark congruence proofs with CPCT, (2) 3-mark Pythagoras and BPT applications, and (3) Area ratio problems.`,
          subtext: `Examiner Tip: Always state the congruence criterion in brackets: e.g., 'By SAS Congruence Criterion, △ABC ≅ △PQR'.`,
          tip: `Full Marks Secret: Every geometric statement must have a reason written in parentheses: e.g., '(Given)', '(Common side)', '(Vertically opposite angles)', '(CPCT)'.`,
          examBreakdown: {
            definition: `Two triangles are said to be congruent if they have the same shape and the same size, such that they can be superimposed to coincide completely.`,
            keyPoints: [
              `CPCT: Corresponding Parts of Congruent Triangles are always equal.`,
              `Basic Proportionality Theorem (BPT): If a line is drawn parallel to one side of a triangle, it divides the other two sides in the same ratio.`,
              `Pythagoras Theorem: In a right triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides: c² = a² + b².`,
              `Ratio of areas of two similar triangles is equal to the square of the ratio of their corresponding sides: Area(△1)/Area(△2) = (s1/s2)².`
            ],
            formulas: [
              `Pythagoras: c² = a² + b²`,
              `BPT: AD / DB = AE / EC`,
              `Area ratio: (Side1 / Side2)²`
            ],
            commonMistakes: [
              `Mistake: Using 'ASS' or 'SSA' as a congruence criterion. (Correction: ASS is mathematically invalid; only SAS is valid!)`,
              `Mistake: Writing △ABC ≅ △RPQ without matching corresponding vertices. (Correction: Vertex order MUST correspond: A to P, B to Q, C to R!)`,
              `Mistake: Forgetting to write reasons next to proof statements.`
            ],
            examTips: [
              `Always write Given, To Prove, Construction (if any), and Proof with labeled steps.`,
              `For 1-mark MCQs: Area ratio of similar triangles is side ratio squared. E.g. Side ratio 3:5 → Area ratio 9:25.`
            ],
            practiceQuestions: [
              {
                question: `In right triangle △ABC right angled at B, AB = 6 cm and BC = 8 cm. Find the hypotenuse AC.`,
                marks: `2 Marks`,
                solution: `By Pythagoras Theorem: AC² = AB² + BC² = 6² + 8² = 36 + 64 = 100. AC = √100 = 10 cm.`
              },
              {
                question: `If △ABC ~ △PQR with side ratio 3:5, find the ratio of their areas.`,
                marks: `2 Marks`,
                solution: `Ratio of areas of similar triangles = (Ratio of corresponding sides)² = (3/5)² = 9/25.`
              }
            ]
          }
        }
      }
    };
  }

  // -------------------------------------------------------------
  // SPECIALIZED PEDAGOGY: CARBON AND ITS COMPOUNDS & FUNCTIONAL GROUPS
  // -------------------------------------------------------------
  if (tTitle.includes('carbon') || tTitle.includes('functional group') || chTitle.includes('carbon')) {
    return {
      subject: chapter.subject,
      classLevel: grade,
      board,
      stream: stream || 'Not applicable',
      chapterId: chapter.id,
      chapterTitle: `Chapter ${chapter.number} • ${chapter.title}`,
      topicId: topic.id,
      topicTitle: topic.title,
      difficulty: topic.difficulty,
      progress: 55,
      styles: {
        Simple: {
          heading: `Understanding Carbon & Functional Groups`,
          paragraph: `Carbon is the building block of all life! Its atomic number is 6 (electrons: 2, 4). Because it needs 4 electrons to complete its outer shell, it forms 4 covalent bonds by sharing electrons — this is called tetravalency. Carbon also has a special power called 'catenation', allowing carbon atoms to bond together into long chains, branches, and rings! When special clusters of atoms attach to a carbon chain, they give the molecule distinctive chemical reactions — these are called 'Functional Groups' (such as Alcohols -OH, Aldehydes -CHO, Ketones >C=O, and Carboxylic Acids -COOH).`,
          subtext: `Core takeaway: The functional group dictates how the molecule behaves chemically, while the carbon chain forms the structural backbone.`,
          tip: `Quick Rule: The IUPAC suffix tells the functional group: -ol for Alcohol (Ethanol), -al for Aldehyde (Ethanal), -one for Ketone (Propanone), -oic acid for Carboxylic Acid (Ethanoic Acid).`,
          bulletPoints: [
            'Tetravalency: Carbon forms 4 covalent bonds by sharing electrons.',
            'Catenation: Carbon atoms form bonds with other carbon atoms to make chains.',
            'Allotropes: Diamond (hard, non-conductor), Graphite (slippery, electrical conductor).',
            'Functional Groups: -OH (alcohol), -CHO (aldehyde), >C=O (ketone), -COOH (carboxylic acid).'
          ]
        },
        Analogy: {
          heading: `The Lego Chassis and Modular Attachment Analogy`,
          paragraph: `Think of carbon as the ultimate Lego brick with 4 connection studs on every brick. Because each brick can connect to 4 others, you can build endless straight highways, branching towers, or circular rings — that is Catenation and Tetravalency. Now imagine plugging a special module into your Lego car: plug in a siren and it becomes an ambulance; plug in a hose and it becomes a fire truck. Those modular attachments are 'Functional Groups'! The carbon chain is the vehicle chassis, but the attached functional group (-OH, -COOH, -CHO) completely determines what the chemical does!`,
          subtext: `Mental Model: Carbon chain = Chassis of the car. Functional group = The tool that determines its identity and reactivity.`,
          tip: `Analogy Insight: Vinegar (acetic acid) and wine (ethanol) share similar two-carbon backbones, but their functional groups (-COOH vs -OH) make one acidic and sour and the other an alcohol.`,
          analogyDetails: {
            analogyTitle: `The Lego Chassis and Tool Attachments`,
            analogyStory: `A plain hydrocarbon chain (like propane) is like a bare truck chassis. Add a refrigerator module and it becomes an ice-cream truck; add a ladder and it becomes a rescue truck. Similarly, adding -OH turns a plain hydrocarbon into an alcohol, and adding -COOH turns it into an acid.`,
            conceptMapping: [
              { realWorld: `4 Studs on a Lego Brick`, concept: `Tetravalency (4 covalent bonds)` },
              { realWorld: `Endless Chains of Connected Blocks`, concept: `Catenation Property of Carbon` },
              { realWorld: `Modular Tool / Attachment`, concept: `Functional Group (-OH, -CHO, >C=O, -COOH)` },
              { realWorld: `Car Chassis Size (Compact vs Truck)`, concept: `Carbon Chain Length (Methane, Ethane, Propane)` },
              { realWorld: `Pencil Lead vs Diamond Ring`, concept: `Allotropes: Graphite (conducts) vs Diamond (hard)` }
            ]
          }
        },
        Visual: {
          heading: `Visual Framework: Organic Carbon & Functional Groups`,
          paragraph: `Here is the visual architecture of Carbon compounds and organic functional groups:`,
          visualDiagram: `                      CARBON COMPOUNDS
                             │
        ┌────────────────────┴────────────────────┐
        ▼                                         ▼
   HYDROCARBONS                           FUNCTIONAL GROUPS (Attach to R-)
   ├── Alkanes (C_n H_{2n+2})             ├── Alcohol:         R—OH          (suffix: -ol)
   │   Single bond: C—C (Methane, Ethane) ├── Aldehyde:        R—CHO         (suffix: -al)
   ├── Alkenes (C_n H_{2n})               ├── Ketone:          R—C(=O)—R'    (suffix: -one)
   │   Double bond: C=C (Ethene)          ├── Carboxylic Acid: R—COOH        (suffix: -oic acid)
   └── Alkynes (C_n H_{2n-2})             └── Ester:           R—COO—R'      (sweet fruity smell)
       Triple bond: C≡C (Ethyne)`,
          comparisonTable: {
            headers: [`Functional Group`, `Formula`, `IUPAC Suffix`, `Example Compound`, `Common Use`],
            rows: [
              [`Alcohol`, `-OH`, `-ol`, `Ethanol (C2H5OH)`, `Beverages, antiseptics, solvent`],
              [`Aldehyde`, `-CHO`, `-al`, `Ethanal (CH3CHO)`, `Organic synthesis, perfumes`],
              [`Ketone`, `>C=O (internal)`, `-one`, `Propanone / Acetone (CH3COCH3)`, `Nail polish remover, industrial solvent`],
              [`Carboxylic Acid`, `-COOH`, `-oic acid`, `Ethanoic Acid (CH3COOH)`, `Vinegar (5-8% solution), preservatives`],
              [`Ester`, `-COO-`, `-oate`, `Ethyl ethanoate (CH3COOC2H5)`, `Artificial flavoring, synthetic perfumes`]
            ]
          },
          visualSteps: [
            `Step 1: Count longest carbon chain (1=meth, 2=eth, 3=prop, 4=but).`,
            `Step 2: Identify single/double/triple bonds (-ane, -ene, -yne).`,
            `Step 3: Locate the functional group and replace the terminal 'e' with its suffix (-ol, -al, -one, -oic acid).`,
            `Step 4: Number the chain so the functional group receives the lowest possible position number.`
          ],
          subtext: `Key Rule: Ketones require carbons on BOTH sides of the carbonyl (>C=O), so the simplest ketone (Propanone) must have at least 3 carbon atoms!`,
          tip: `Visual Cue: Carbon must ALWAYS have exactly 4 bond lines radiating from it in structural diagrams!`
        },
        'Exam-oriented': {
          heading: `${board} Examination Blueprint: Carbon & Its Compounds`,
          paragraph: `High-yield chapter carrying 6 to 8 marks in ${board} exams. Typical questions: (1) Esterification and Saponification equations, (2) Cleansing action of soaps and micelles, (3) Identifying functional groups from structures, and (4) Homologous series properties.`,
          subtext: `Board Marking Secret: Always balance organic chemical equations and mention catalysts (e.g. Conc. H2SO4 for esterification, Ni/Pd for hydrogenation).`,
          tip: `Examiner Tip: When asked why carbon forms covalent bonds rather than C4+ or C4- ions, state both energetic reasons (cannot lose 4 electrons due to high ionization energy; cannot hold 10 electrons with 6 protons).`,
          examBreakdown: {
            definition: `A functional group is an atom or group of atoms present in a molecule that determines its characteristic chemical properties regardless of the length of the carbon chain.`,
            keyPoints: [
              `Tetravalency & Catenation are responsible for the vast number of organic compounds.`,
              `Homologous series: Successive members differ by -CH2- group and 14 atomic mass units.`,
              `Esterification: Ethanoic acid reacts with Ethanol in presence of concentrated H2SO4 to yield sweet-smelling Ester.`,
              `Hydrogenation: Addition of H2 to unsaturated vegetable oils in presence of Nickel catalyst forms saturated solid fats.`
            ],
            formulas: [
              `Esterification: CH3COOH + C2H5OH ──(Conc. H2SO4)──► CH3COOC2H5 + H2O`,
              `Combustion: CH4 + 2O2 ──► CO2 + 2H2O + Heat & Light`,
              `Oxidation: CH3CH2OH ──(Alkaline KMnO4 + Heat)──► CH3COOH`
            ],
            commonMistakes: [
              `Mistake: Writing Ketone formula with only 2 carbons. (Correction: Simplest ketone is Propanone with 3 carbons!)`,
              `Mistake: Confusing Aldehyde suffix (-al) with Alcohol suffix (-ol).`,
              `Mistake: Stating Graphite is a non-conductor. (Correction: Graphite conducts electricity due to free delocalized electrons between hexagonal layers!)`
            ],
            examTips: [
              `Ethanoic acid is also known as Glacial Acetic Acid because its melting point is 290 K, so it freezes during winter in cold climates.`,
              `Alkaline KMnO4 or Acidified K2Cr2O7 act as strong oxidizing agents.`
            ],
            practiceQuestions: [
              {
                question: `Name the functional group present in: (i) CH3COOH, (ii) CH3COCH3, (iii) C2H5OH, (iv) HCHO.`,
                marks: `2 Marks`,
                solution: `(i) Carboxylic acid (-COOH), (ii) Ketone (>C=O), (iii) Alcohol (-OH), (iv) Aldehyde (-CHO).`
              },
              {
                question: `What happens when ethanoic acid reacts with ethanol in the presence of concentrated sulfuric acid? Write the chemical equation.`,
                marks: `3 Marks`,
                solution: `A sweet-smelling compound called Ethyl ethanoate (ester) is formed: CH3COOH + C2H5OH ──(Conc. H2SO4)──► CH3COOC2H5 + H2O. This reaction is called Esterification.`
              }
            ]
          }
        }
      }
    };
  }

  // -------------------------------------------------------------
  // SPECIALIZED PEDAGOGY: MOTION & EQUATIONS OF MOTION (PHYSICS)
  // -------------------------------------------------------------
  if (tTitle.includes('motion') || chTitle.includes('motion')) {
    return {
      subject: chapter.subject,
      classLevel: grade,
      board,
      stream: stream || 'Not applicable',
      chapterId: chapter.id,
      chapterTitle: `Chapter ${chapter.number} • ${chapter.title}`,
      topicId: topic.id,
      topicTitle: topic.title,
      difficulty: topic.difficulty,
      progress: 60,
      styles: {
        Simple: {
          heading: `Understanding Motion, Speed & Acceleration`,
          paragraph: `An object is in 'motion' if its position changes over time relative to a stationary reference point. Distance is the total path length traveled (like the odometer in a car). Displacement is the shortest straight line from the start position to the end position with direction. Speed is how fast an object moves (Distance / Time), while Velocity is Speed in a specific direction. If your velocity changes over time (you speed up or slow down), you are Accelerating (a = (v - u) / t). The three kinematic equations of motion connect initial speed (u), final speed (v), acceleration (a), time (t), and distance (s).`,
          subtext: `Core takeaway: In uniform circular motion, speed remains constant but velocity constantly changes direction, so acceleration is NOT zero!`,
          tip: `Friendly Tip: Remember: v = u + at, s = ut + ½at², v² - u² = 2as. If an object starts from rest, u = 0! If it stops, v = 0!`,
          bulletPoints: [
            'Distance is a scalar (path length); displacement is a vector (shortest straight line).',
            'Speed = Distance / Time (m/s); Velocity = Displacement / Time (m/s).',
            'Acceleration = (Final Velocity - Initial Velocity) / Time: a = (v - u) / t (m/s²).',
            '3 Kinematic Equations: v = u + at, s = ut + 0.5at², v² - u² = 2as.'
          ]
        },
        Analogy: {
          heading: `The GPS Jogger & Highway Cruise Analogy`,
          paragraph: `Imagine you are running in a city park. You jog around a 400m circular track and return to the exact same bench you started from. Your fitness watch says: 'Distance: 400 meters!'. But your GPS navigation says: 'Displacement: 0 meters!', because your net position never shifted! Now imagine you get onto a highway in a car with cruise control locked at 60 km/h in a straight line — your acceleration is zero. But the second you step on the gas pedal, you accelerate: your velocity increases by a fixed amount every second. That rate of speed boost is Acceleration (a).`,
          subtext: `Mental Model: Speedometer = Speed. Compass + Speedometer = Velocity. Gas pedal = Positive Acceleration. Brake pedal = Deceleration/Retardation.`,
          tip: `Analogy Insight: Going around a roundabout at a constant 30 km/h feels like turning because you are continuously accelerating inward toward the center.`,
          analogyDetails: {
            analogyTitle: `The GPS Jogger and Car Highway Dashboard`,
            analogyStory: `Think of your daily commute: your car odometer counts every tire rotation (distance), but a helicopter flight from home to school measures the direct straight vector (displacement). Stepping on the accelerator adds velocity over time.`,
            conceptMapping: [
              { realWorld: `Odometer Reading (Tire rotations)`, concept: `Distance (Total path, scalar)` },
              { realWorld: `Straight Flight Vector from Start to End`, concept: `Displacement (Shortest line, vector)` },
              { realWorld: `Speedometer Reading`, concept: `Instantaneous Speed` },
              { realWorld: `Speedometer + Compass Direction`, concept: `Velocity` },
              { realWorld: `Gas Pedal Depression`, concept: `Acceleration (Rate of change of velocity)` }
            ]
          }
        },
        Visual: {
          heading: `Visual Framework: Kinematics & Motion Graphs`,
          paragraph: `Here is the visual framework of motion and velocity-time graph analysis:`,
          visualDiagram: `                           MOTION IN A STRAIGHT LINE
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
     DISTANCE vs DISPLACEMENT                             VELOCITY-TIME GRAPH (v-t)
     Start ● ────────────► End (Displacement)              v ▲         /── Final velocity (v)
           \\              /                                  │        /
            \\── Path ────/ (Distance)                        │       / ◄── Slope = Acceleration (a)
     * Displacement ≤ Distance                               │      /
     * In closed loop: Displacement = 0                    u ├───  /
                                                             │    │        Area under graph =
                                                             │    │        Displacement (s)
                                                             └────┴─────────────► t
                                                                  Time (t)`,
          comparisonTable: {
            headers: [`Quantity`, `Type`, `SI Unit`, `Can it be Zero/Negative?`, `Key Formula`],
            rows: [
              [`Distance`, `Scalar (magnitude only)`, `m (meters)`, `Only positive; never zero if moved`, `Path length`],
              [`Displacement`, `Vector (magnitude + direction)`, `m (meters)`, `Can be positive, negative, or ZERO`, `Shortest vector: x2 - x1`],
              [`Speed`, `Scalar`, `m/s`, `Always positive or zero`, `Speed = Distance / Time`],
              [`Velocity`, `Vector`, `m/s`, `Can be positive, negative, or zero`, `Velocity = Displacement / Time`],
              [`Acceleration`, `Vector`, `m/s²`, `Positive (speeding up), Negative (braking)`, `a = (v - u) / t`]
            ]
          },
          visualSteps: [
            `Step 1: Identify given quantities: initial velocity (u), final velocity (v), acceleration (a), time (t), displacement (s).`,
            `Step 2: Check for keywords: 'starts from rest' means u = 0; 'comes to a stop' means v = 0.`,
            `Step 3: Select the kinematic equation that contains the target unknown without unneeded variables.`,
            `Step 4: Substitute values in consistent SI units (m, s, m/s) and solve.`
          ],
          subtext: `Graph Secret: Slope of Distance-Time graph = Speed. Slope of Velocity-Time graph = Acceleration. Area under v-t graph = Distance/Displacement!`,
          tip: `Visual Cue: A horizontal flat line on a v-t graph means uniform velocity (a = 0). A line sloping up means uniform acceleration!`
        },
        'Exam-oriented': {
          heading: `${board} Examination Blueprint: Motion & Kinematics`,
          paragraph: `High-yield topic carrying 7 to 9 marks in Physics. Board exams test: (1) Graph interpretation (finding acceleration from slope and distance from area), (2) Deriving the 3 equations of motion graphically, and (3) Numerical problems.`,
          subtext: `Board Marking Secret: In numerical problems, 1 mark is awarded for formula, 1 mark for step-by-step substitution, and 1 mark for answer with correct units (m/s or m/s²).`,
          tip: `Examiner Tip: If speed is given in km/h, multiply by 5/18 to convert to m/s before plugging into equations!`,
          examBreakdown: {
            definition: `Motion is the phenomenon in which an object changes its position with respect to time and a specified frame of reference.`,
            keyPoints: [
              `First equation of motion: v = u + at (Velocity-time relation).`,
              `Second equation of motion: s = ut + ½at² (Position-time relation).`,
              `Third equation of motion: v² - u² = 2as (Position-velocity relation).`,
              `In uniform circular motion, speed is constant but acceleration is directed toward the center (Centripetal acceleration).`
            ],
            formulas: [
              `v = u + at`,
              `s = ut + (1/2)at²`,
              `v² - u² = 2as`,
              `Average Speed = Total Distance / Total Time`
            ],
            commonMistakes: [
              `Mistake: Forgetting to convert km/h to m/s (Multiply by 5/18!).`,
              `Mistake: Using positive acceleration when a car brakes (Braking is deceleration: 'a' must be negative!).`,
              `Mistake: Saying displacement equals distance for circular paths (For 1 full round, displacement is 0!).`
            ],
            examTips: [
              `Graphical derivation of s = ut + ½at²: Divide area under v-t graph into rectangle (u × t) and triangle (½ × t × at).`,
              `Always write SI units in final answers.`
            ],
            practiceQuestions: [
              {
                question: `A train starting from rest attains a velocity of 72 km/h in 5 minutes. Assuming uniform acceleration, find: (i) acceleration, (ii) distance traveled.`,
                marks: `3 Marks`,
                solution: `u = 0, v = 72 km/h = 72 × (5/18) = 20 m/s, t = 5 min = 300 s. (i) a = (v - u)/t = (20 - 0)/300 = 1/15 m/s² = 0.067 m/s². (ii) s = ut + 0.5at² = 0 + 0.5 × (1/15) × (300)² = 3000 m = 3 km.`
              },
              {
                question: `What does the slope of a Velocity-Time graph represent?`,
                marks: `1 Mark`,
                solution: `The slope of a Velocity-Time graph represents Acceleration (a = Δv / Δt).`
              }
            ]
          }
        }
      }
    };
  }

  // -------------------------------------------------------------
  // SPECIALIZED PEDAGOGY: DATA STRUCTURES & BINARY TREES (CS)
  // -------------------------------------------------------------
  if (tTitle.includes('binary tree') || chTitle.includes('data structure')) {
    return {
      subject: chapter.subject,
      classLevel: grade,
      board,
      stream: stream || 'Not applicable',
      chapterId: chapter.id,
      chapterTitle: `Chapter ${chapter.number} • ${chapter.title}`,
      topicId: topic.id,
      topicTitle: topic.title,
      difficulty: topic.difficulty,
      progress: 65,
      styles: {
        Simple: {
          heading: `Understanding Binary Trees & Hierarchies`,
          paragraph: `In computer science, a 'Binary Tree' is a non-linear data structure organized like an upside-down family tree. The top element is called the 'Root'. Each element (called a 'Node') can branch out to at most TWO children: a Left Child and a Right Child. A node with no children is called a 'Leaf'. When numbers are arranged so that smaller values always go to the left and larger values go to the right, it is called a 'Binary Search Tree' (BST). This makes searching lightning fast — like opening a dictionary right in the middle and cutting the remaining pages in half every single step!`,
          subtext: `Core takeaway: In a Binary Search Tree (BST), Left Child < Root < Right Child.`,
          tip: `Friendly Tip: In-order traversal (Left, Root, Right) on a BST always prints elements in ascending sorted order!`,
          bulletPoints: [
            'Root is the topmost node with no parent.',
            'Each node has at most two children: Left and Right.',
            'Leaf nodes are terminal nodes with 0 children.',
            'In-order Traversal: Left ──► Root ──► Right (Sorts a BST!).'
          ]
        },
        Analogy: {
          heading: `The 20 Questions Game & Family Tree Analogy`,
          paragraph: `Imagine playing the '20 Questions' guessing game: 'Is the person alive? Yes or No. Are they an athlete? Yes or No.' With each question, you split the entire universe of possible answers into TWO halves. After only 20 questions, you can pinpoint 1 out of 1,000,000 possibilities! That is exactly how a Binary Search Tree works. Instead of reading a linear list from beginning to end (like reading a 1000-page book line by line), the computer branches left or right at each node, discarding half of the remaining data at every step.`,
          subtext: `Mental Model: Linear Array = Waiting in a single-file line. Binary Tree = Tournament bracket where half the teams are eliminated each round.`,
          tip: `Analogy Insight: A dictionary or phonebook lookup is a natural binary search tree.`,
          analogyDetails: {
            analogyTitle: `The Tournament Elimination Bracket`,
            analogyStory: `Think of a sports tournament bracket: 64 teams start, but after 1 round only 32 remain; after 2 rounds 16 remain. In just 6 rounds (log₂ 64 = 6), a champion is found. A binary tree stores data so search operations work in logarithmic time O(log N).`,
            conceptMapping: [
              { realWorld: `Tournament Final Match`, concept: `Root Node (Top of the tree)` },
              { realWorld: `Player with No Matches Left`, concept: `Leaf Node (Degree = 0)` },
              { realWorld: `Eliminating Half the Teams Each Round`, concept: `O(log N) Search Complexity in BST` },
              { realWorld: `Alphabetical Dictionary Flipping`, concept: `Binary Search Tree Rule (Left < Root < Right)` },
              { realWorld: `Visiting Rooms in a Fixed Order`, concept: `Tree Traversals (In-order, Pre-order, Post-order)` }
            ]
          }
        },
        Visual: {
          heading: `Visual Framework: Binary Tree Architecture & Traversals`,
          paragraph: `Here is the visual diagram of a Binary Search Tree (BST) and its traversal paths:`,
          visualDiagram: `                        [ 50 ]  ◄── Root Node
                       /      \\
                      /        \\
                  [ 30 ]      [ 70 ]
                  /    \\      /    \\
                 /      \\    /      \\
               [20]    [40] [60]   [80] ◄── Leaf Nodes (No children)

         IN-ORDER TRAVERSAL (Left ──► Root ──► Right):
         [20] ──► [30] ──► [40] ──► [50] ──► [60] ──► [70] ──► [80]
         (Notice: Elements are printed in ASCENDING SORTED ORDER!)

         PRE-ORDER TRAVERSAL (Root ──► Left ──► Right):
         [50] ──► [30] ──► [20] ──► [40] ──► [70] ──► [60] ──► [80]

         POST-ORDER TRAVERSAL (Left ──► Right ──► Root):
         [20] ──► [40] ──► [30] ──► [60] ──► [80] ──► [70] ──► [50]`,
          comparisonTable: {
            headers: [`Traversal Type`, `Visiting Order`, `Primary Application`, `BST Result Output`],
            rows: [
              [`In-Order`, `Left ──► Root ──► Right`, `Binary Search Tree validation`, `Strictly Sorted in Ascending Order`],
              [`Pre-Order`, `Root ──► Left ──► Right`, `Creating tree copies, prefix notation`, `Root is processed first`],
              [`Post-Order`, `Left ──► Right ──► Root`, `Deleting nodes, postfix calculation`, `Root is processed last`],
              [`Level-Order`, `Level by Level (BFS)`, `Breadth-first search using Queue`, `Shallowest nodes visited first`]
            ]
          },
          visualSteps: [
            `Step 1: Start at the Root node.`,
            `Step 2: If searching for target value X: If X == Root, found! If X < Root, go Left. If X > Root, go Right.`,
            `Step 3: Repeat until value is found or a null pointer is reached.`,
            `Step 4: Average time complexity = O(log N) for balanced trees.`
          ],
          subtext: `Notice that a node with degree 0 has no child pointers and is formally called a Leaf Node.`,
          tip: `Visual Trick: To trace In-Order traversal visually, drop a vertical plumb line from each node down to a baseline — they will land in sorted order!`
        },
        'Exam-oriented': {
          heading: `${board} Class ${grade} Exam Blueprint: Data Structures & Binary Trees`,
          paragraph: `Tested in Computer Science Section C (3 marks) and Section D (5 marks). Typical board questions: (1) Tracing In-order, Pre-order, Post-order traversal outputs, (2) Calculating tree height and max nodes at level K, and (3) BST insertion and search algorithms.`,
          subtext: `Examiner Tip: Writing In-Order traversal for a BST is an easy check: if your final numbers are not sorted, you made an error!`,
          tip: `Time Complexity Rule: Searching in balanced BST is O(log N). Worst case (skewed tree like a linked list) is O(N).`,
          examBreakdown: {
            definition: `A binary tree is a non-linear hierarchical data structure in which each node has at most two children, referred to as the left child and the right child.`,
            keyPoints: [
              `Maximum number of nodes on level 'i' of a binary tree is 2^i (root is level 0).`,
              `Maximum number of nodes in a binary tree of height 'h' is 2^(h+1) - 1.`,
              `In a Binary Search Tree (BST), keys in the left subtree are smaller than the root, and keys in the right subtree are greater.`,
              `In-order traversal on a BST yields keys in non-decreasing sorted order.`
            ],
            formulas: [
              `Max nodes at level i = 2^i`,
              `Max nodes in tree of height h = 2^(h+1) - 1`,
              `Search time complexity: O(log N) average, O(N) worst case`
            ],
            commonMistakes: [
              `Mistake: Saying a binary tree node can have 3 children. (Correction: At most TWO children by definition!)`,
              `Mistake: Confusing Pre-order with In-order traversal.`,
              `Mistake: Confusing tree height (edges from root to deepest leaf) with number of levels.`
            ],
            examTips: [
              `To construct a unique binary tree, In-order traversal combined with either Pre-order or Post-order is required.`,
              `Leaf node degree is always 0.`
            ],
            practiceQuestions: [
              {
                question: `In a binary search tree with root 50, left child 30, right child 70, write the in-order traversal.`,
                marks: `2 Marks`,
                solution: `In-order traversal visits Left, Root, Right: 30, 50, 70.`
              },
              {
                question: `What is the maximum number of children any node in a binary tree can have?`,
                marks: `1 Mark`,
                solution: `Every node in a binary tree can have at most 2 children (Left and Right).`
              }
            ]
          }
        }
      }
    };
  }

  // -------------------------------------------------------------
  // DYNAMIC COMPREHENSIVE GENERATOR FOR ALL OTHER CURRICULUM TOPICS
  // -------------------------------------------------------------
  const kp1 = topic.keyPoints[0] || `Fundamental principles of ${topic.title}.`;
  const kp2 = topic.keyPoints[1] || `Key analytical equations and standard theorems.`;
  const kp3 = topic.keyPoints[2] || `Step-by-step problem solving and application methods.`;

  return {
    subject: chapter.subject,
    classLevel: grade,
    board,
    stream: stream || 'Not applicable',
    chapterId: chapter.id,
    chapterTitle: `Chapter ${chapter.number} • ${chapter.title}`,
    topicId: topic.id,
    topicTitle: topic.title,
    difficulty: topic.difficulty,
    progress: 45,
    styles: {
      Simple: {
        heading: `Let's Understand: ${topic.title}`,
        paragraph: `${topic.summary} In simple terms, this topic helps us analyze and break down ${topic.title} systematically. Think of it as a fundamental rule: once you grasp how the components interact, solving any question becomes intuitive!`,
        subtext: `Key takeaway: ${kp1}`,
        tip: `Friendly Tip: Relate each definition to a real observation in your environment to make it unforgettable!`,
        bulletPoints: [kp1, kp2, kp3]
      },
      Analogy: {
        heading: `Intuitive Metaphor: Understanding ${topic.title}`,
        paragraph: `Think of ${topic.title} like a well-organized city transit system: the principles are the tracks, the parameters are the passenger trains, and the governing equations are the signals keeping everything running in perfect balance without collisions. When one parameter changes, the system adjusts naturally according to standard rules.`,
        subtext: `Mental Model: When you anchor this abstract concept to an everyday system you interact with daily, remembering it becomes second nature!`,
        tip: `Analogy Insight: Abstract rules in ${chapter.subject} reflect physical balances we see all around us.`,
        analogyDetails: {
          analogyTitle: `The City Transit & Balance System`,
          analogyStory: `Imagine a city where traffic flows through synchronized signals. If one road has heavier volume, the signals balance the flow. In ${topic.title}, inputs and outputs balance according to exact governing principles.`,
          conceptMapping: [
            { realWorld: `Transit Tracks & Rules`, concept: `Core Laws of ${topic.title}` },
            { realWorld: `Passenger Volume / Input`, concept: `Given Parameters & Variables` },
            { realWorld: `Signal Coordination`, concept: `Equilibrium & Governing Equations` },
            { realWorld: `Smooth Commute Result`, concept: `Accurate Problem Solution` }
          ]
        }
      },
      Visual: {
        heading: `Visual Framework: ${topic.title}`,
        paragraph: `Here is the structured architecture connecting ${topic.title} across the ${chapter.subject} curriculum:`,
        visualDiagram: `                   ${chapter.title.toUpperCase()}
                                 │
                                 ▼
                   ${topic.title.toUpperCase()}
                                 │
        ┌────────────────────────┼────────────────────────┐
        ▼                        ▼                        ▼
  CORE FOUNDATION          PRACTICAL RULE           EXAM APPLICATION
  ${kp1.slice(0, 24)}...    ${kp2.slice(0, 24)}...   ${kp3.slice(0, 24)}...`,
        comparisonTable: {
          headers: [`Component`, `Definition / Principle`, `Role in ${chapter.subject}`],
          rows: [
            [`Pillar 1`, kp1, `Theoretical baseline`],
            [`Pillar 2`, kp2, `Analytical formulation`],
            [`Pillar 3`, kp3, `Practical problem application`]
          ]
        },
        visualSteps: [
          `Step 1: Identify the given information and boundary conditions.`,
          `Step 2: Apply the governing rule of ${topic.title}.`,
          `Step 3: Solve analytically and verify the units.`
        ],
        subtext: topic.formulas && topic.formulas.length > 0
          ? `Primary Governing Formulas: ${topic.formulas.join('  |  ')}`
          : `Core Pillars: ${kp1}`,
        tip: `Visual Cue: Use diagrams and flowcharts to connect sub-concepts and equations together.`
      },
      'Exam-oriented': {
        heading: `${board} Class ${grade} Exam Blueprint: ${topic.title}`,
        paragraph: `High-yield topic for ${board} examinations. Typically appears in Section B (2 marks) or Section C (3-4 marks). Examiners test foundational definitions, numerical substitutions with units, and proper step markings.`,
        subtext: `Guaranteed Mark Booster: Ensure you state all assumptions, formulas used, and box your final numerical answers with correct units.`,
        tip: `${board} Marking Scheme: Full marks require standard formulas, substitution steps, and final units.`,
        examBreakdown: {
          definition: `${topic.title} represents a core requirement in the ${board} ${grade} curriculum for ${chapter.subject}.`,
          keyPoints: [kp1, kp2, kp3],
          formulas: topic.formulas && topic.formulas.length > 0 ? topic.formulas : [`Standard syllabus formulation for ${topic.title}`],
          commonMistakes: [
            `Mistake: Skipping intermediate calculation steps and writing only the final answer.`,
            `Mistake: Missing units in the final numerical conclusion.`,
            `Mistake: Misinterpreting initial premise in word problems.`
          ],
          examTips: [
            `Read the question carefully to identify whether 1, 2, or 3 marks are allocated.`,
            `Write definitions word-for-word according to ${board} textbook specifications.`
          ],
          practiceQuestions: [
            {
              question: `State the primary governing principle of ${topic.title} in ${grade} ${chapter.subject}.`,
              marks: `2 Marks`,
              solution: `By definition in ${board} syllabus: ${kp1}. This is applied systematically to solve analytical problems.`
            }
          ]
        }
      }
    }
  };
}
