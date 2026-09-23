import { CurriculumChapter } from '../types';

/**
 * Universal Curriculum Database Expansion
 * Comprehensive authentic syllabus coverage for Classes 6 through 12 across CBSE, ICSE, and UP Board.
 */
export const ADDITIONAL_CURRICULUM_CHAPTERS: CurriculumChapter[] = [
  // ==========================================
  // CLASS 6 - ALL CORE SUBJECTS
  // ==========================================
  {
    id: 'cbse-6-math-ch1',
    number: 1,
    title: 'Knowing Our Numbers',
    subject: 'Mathematics',
    classLevel: 'Class 6',
    board: 'CBSE',
    description: 'Comparing numbers, place value system, large numbers in practice, estimation and Roman numerals.',
    topics: [
      {
        id: 'cbse-6-math-t1',
        title: 'Comparing Numbers and Place Value',
        difficulty: 'Beginner',
        keyPoints: [
          'Place value determines the numerical value of a digit based on its position.',
          'Indian System uses units, tens, hundreds, thousands, ten thousands, lakhs, and crores.',
          'International System groups digits in periods of threes: ones, thousands, and millions.'
        ],
        formulas: ['1 Lakh = 100,000', '1 Million = 1,000,000', '1 Crore = 10,000,000'],
        summary: 'Master reading, writing, and comparing large numbers using standard comma separation.'
      },
      {
        id: 'cbse-6-math-t2',
        title: 'Estimation and Roman Numerals',
        difficulty: 'Intermediate',
        keyPoints: [
          'Rounding off to the nearest tens, hundreds, or thousands for quick mental arithmetic.',
          'Basic Roman symbols: I=1, V=5, X=10, L=50, C=100, D=500, M=1000.',
          'A symbol of smaller value written to the left of a larger value is subtracted.'
        ],
        formulas: ['IV = 5 - 1 = 4', 'IX = 10 - 1 = 9', 'XC = 100 - 10 = 90'],
        summary: 'Approximating sums and differences, and writing numbers using Roman numerals.'
      }
    ]
  },
  {
    id: 'cbse-6-math-ch2',
    number: 2,
    title: 'Whole Numbers and Basic Algebra',
    subject: 'Mathematics',
    classLevel: 'Class 6',
    board: 'CBSE',
    description: 'Natural numbers, whole numbers, number line operations, properties of whole numbers, and introduction to variables.',
    topics: [
      {
        id: 'cbse-6-math-t3',
        title: 'Properties of Whole Numbers',
        difficulty: 'Beginner',
        keyPoints: [
          'Whole numbers begin from 0 (0, 1, 2, 3, ...), while natural numbers begin from 1.',
          'Closure and commutative properties hold for addition and multiplication of whole numbers.',
          'Division by zero is undefined in mathematics.'
        ],
        formulas: ['a + b = b + a (Commutative)', 'a * (b + c) = a*b + a*c (Distributive)'],
        summary: 'Understanding identity elements and algebraic properties of addition and multiplication.'
      },
      {
        id: 'cbse-6-math-t4',
        title: 'Introduction to Integers and Fractions',
        difficulty: 'Intermediate',
        keyPoints: [
          'Integers include positive numbers, zero, and negative numbers.',
          'Numbers to the right of zero on a number line are greater than numbers to the left.',
          'A fraction represents a part of a whole (numerator / denominator).'
        ],
        formulas: ['Negative + Negative = More Negative', 'Proper fraction: Numerator < Denominator'],
        summary: 'Locating negative numbers on a number line and performing basic integer operations.'
      }
    ]
  },
  {
    id: 'cbse-6-sci-ch1',
    number: 1,
    title: 'Components of Food',
    subject: 'Science',
    classLevel: 'Class 6',
    board: 'CBSE',
    description: 'Nutrients in food, carbohydrates, proteins, fats, vitamins, minerals, balanced diet, and deficiency diseases.',
    topics: [
      {
        id: 'cbse-6-sci-t1',
        title: 'Nutrients and Food Tests',
        difficulty: 'Beginner',
        keyPoints: [
          'Major nutrients needed by our body are carbohydrates, proteins, fats, vitamins, and minerals.',
          'Iodine test turns starch blue-black, indicating the presence of carbohydrates.',
          'Copper sulfate and caustic soda solution test turns violet in the presence of protein.'
        ],
        formulas: ['Starch + Iodine -> Blue-Black', 'Protein + Biuret Reagents -> Violet'],
        summary: 'Identifying primary nutrients and performing standard laboratory chemical tests.'
      },
      {
        id: 'cbse-6-sci-t2',
        title: 'Balanced Diet and Deficiency Diseases',
        difficulty: 'Intermediate',
        keyPoints: [
          'A balanced diet contains all essential nutrients, roughage, and water in appropriate proportions.',
          'Lack of Vitamin A causes night blindness; lack of Vitamin C causes scurvy.',
          'Lack of Vitamin D causes rickets, and deficiency of iron causes anaemia.'
        ],
        summary: 'Maintaining dietary balance and understanding diseases caused by prolonged nutrient shortages.'
      }
    ]
  },
  {
    id: 'cbse-6-sci-ch2',
    number: 2,
    title: 'Light, Shadows and Reflections',
    subject: 'Science',
    classLevel: 'Class 6',
    board: 'CBSE',
    description: 'Luminous and non-luminous objects, transparent, translucent, and opaque materials, pinhole camera, and mirror reflection.',
    topics: [
      {
        id: 'cbse-6-sci-t3',
        title: 'Light Transmission and Shadows',
        difficulty: 'Beginner',
        keyPoints: [
          'Transparent materials allow light to pass completely; translucent allow partially; opaque allow none.',
          'Light travels strictly in straight lines (rectilinear propagation).',
          'A shadow is formed when an opaque object obstructs the path of light.'
        ],
        summary: 'Analyzing how light interacts with matter to form shadows and images.'
      },
      {
        id: 'cbse-6-sci-t4',
        title: 'Mirrors and Reflection',
        difficulty: 'Intermediate',
        keyPoints: [
          'A plane mirror reflects light and changes the direction of the incident ray.',
          'The image formed by a plane mirror is erect, virtual, and laterally inverted (left appears right).',
          'Pinhole cameras produce real, inverted images demonstrating rectilinear propagation.'
        ],
        summary: 'Understanding optical reflection laws and pinhole image formation.'
      }
    ]
  },
  {
    id: 'cbse-6-eng-ch1',
    number: 1,
    title: 'Grammar and Sentence Structure',
    subject: 'English',
    classLevel: 'Class 6',
    board: 'CBSE',
    description: 'Nouns, pronouns, verbs, adjectives, prepositions, and types of sentences.',
    topics: [
      {
        id: 'cbse-6-eng-t1',
        title: 'Parts of Speech and Subject-Verb Agreement',
        difficulty: 'Beginner',
        keyPoints: [
          'A singular subject takes a singular verb, while a plural subject takes a plural verb.',
          'Collective nouns usually take singular verbs when considered as a unified group.',
          'Adjectives qualify nouns, and adverbs modify verbs, adjectives, or other adverbs.'
        ],
        summary: 'Constructing grammatically correct sentences with proper subject-verb agreement.'
      }
    ]
  },
  {
    id: 'cbse-6-sst-ch1',
    number: 1,
    title: 'Our Earth and Environment',
    subject: 'Social Science',
    classLevel: 'Class 6',
    board: 'CBSE',
    description: 'The solar system, latitudes and longitudes, motions of the earth, and early human settlements.',
    topics: [
      {
        id: 'cbse-6-sst-t1',
        title: 'Latitudes, Longitudes and Time Zones',
        difficulty: 'Beginner',
        keyPoints: [
          'Equator is 0° latitude, dividing the Earth into Northern and Southern Hemispheres.',
          'Prime Meridian passes through Greenwich, London at 0° longitude.',
          'Earth rotates 360° in 24 hours, meaning 15° of longitude corresponds to 1 hour of time difference.'
        ],
        formulas: ['15° longitude = 1 hour', '1° longitude = 4 minutes'],
        summary: 'Understanding coordinate grid lines on the globe and calculating local time differences.'
      }
    ]
  },
  {
    id: 'cbse-6-hin-ch1',
    number: 1,
    title: 'Hindi Vyakaran Evam Bhasha',
    subject: 'Hindi',
    classLevel: 'Class 6',
    board: 'CBSE',
    description: 'Varn vichar, sangya, sarvanaam, visheshan, aur shuddh vartani.',
    topics: [
      {
        id: 'cbse-6-hin-t1',
        title: 'Sangya evam Sarvanaam ke Bhed',
        difficulty: 'Beginner',
        keyPoints: [
          'Sangya kisi vyakti, vastu, sthan ya bhaav ke naam ko kehte hain.',
          'Sangya ke pramukh bhed: Vyakti-vachak, Jati-vachak, aur Bhaav-vachak.',
          'Sangya ke sthan par prayukta hone wale shabdon ko Sarvanaam kehte hain.'
        ],
        summary: 'Hindi bhasha me mool vyakaran ke niyam aur shabdon ka vargikaran.'
      }
    ]
  },

  // ==========================================
  // CLASS 7 - ALL CORE SUBJECTS
  // ==========================================
  {
    id: 'cbse-7-math-ch1',
    number: 1,
    title: 'Integers and Rational Numbers',
    subject: 'Mathematics',
    classLevel: 'Class 7',
    board: 'CBSE',
    description: 'Multiplication and division of integers, properties of operations, rational numbers on number line.',
    topics: [
      {
        id: 'cbse-7-math-t1',
        title: 'Multiplication & Division of Integers',
        difficulty: 'Beginner',
        keyPoints: [
          'The product of two negative integers is always positive: (-a) * (-b) = a * b.',
          'The product of a positive and a negative integer is negative: a * (-b) = -(a * b).',
          'Division by zero is not defined for integers.'
        ],
        formulas: ['(-1)^n = 1 (if n is even)', '(-1)^n = -1 (if n is odd)'],
        summary: 'Master integer arithmetic rules, sign conventions, and word problem applications.'
      },
      {
        id: 'cbse-7-math-t2',
        title: 'Operations on Rational Numbers',
        difficulty: 'Intermediate',
        keyPoints: [
          'A rational number is in standard form when denominator is positive and HCF of numerator/denominator is 1.',
          'To add rational numbers with different denominators, find the LCM of denominators.',
          'Multiplication: (a/b) * (c/d) = (a * c) / (b * d).'
        ],
        formulas: ['Additive Inverse of a/b is -a/b', 'Multiplicative Inverse (reciprocal) of a/b is b/a'],
        summary: 'Simplifying, comparing, and computing arithmetic operations on rational numbers.'
      }
    ]
  },
  {
    id: 'cbse-7-math-ch2',
    number: 2,
    title: 'Lines, Angles and Triangles',
    subject: 'Mathematics',
    classLevel: 'Class 7',
    board: 'CBSE',
    description: 'Complementary and supplementary angles, transversal lines, angle sum property, exterior angle theorem.',
    topics: [
      {
        id: 'cbse-7-math-t3',
        title: 'Pairs of Angles and Parallel Lines',
        difficulty: 'Beginner',
        keyPoints: [
          'Two angles are complementary if their sum is 90°, and supplementary if their sum is 180°.',
          'Vertically opposite angles formed by intersecting lines are always equal.',
          'When a transversal cuts two parallel lines: alternate interior angles and corresponding angles are equal.'
        ],
        formulas: ['Complement of x = 90° - x', 'Supplement of x = 180° - x'],
        summary: 'Geometric properties of parallel lines intersected by transversals.'
      },
      {
        id: 'cbse-7-math-t4',
        title: 'Properties of Triangles',
        difficulty: 'Intermediate',
        keyPoints: [
          'The sum of the three interior angles of a triangle is always 180° (Angle Sum Property).',
          'Exterior angle of a triangle is equal to the sum of its two interior opposite angles.',
          'Pythagoras theorem: in a right-angled triangle, Hypotenuse² = Base² + Perpendicular².'
        ],
        formulas: ['∠A + ∠B + ∠C = 180°', 'h² = p² + b²'],
        summary: 'Solving angle problems and applying Pythagoras theorem in geometric configurations.'
      }
    ]
  },
  {
    id: 'cbse-7-sci-ch1',
    number: 1,
    title: 'Nutrition in Plants and Animals',
    subject: 'Science',
    classLevel: 'Class 7',
    board: 'CBSE',
    description: 'Autotrophic and heterotrophic nutrition, photosynthesis, human digestive system, and ruminant digestion.',
    topics: [
      {
        id: 'cbse-7-sci-t1',
        title: 'Photosynthesis and Plant Nutrition',
        difficulty: 'Beginner',
        keyPoints: [
          'Green plants are autotrophs that synthesize food using carbon dioxide, water, and sunlight.',
          'Chlorophyll in chloroplasts absorbs solar energy, while stomata allow gas exchange.',
          'Oxygen is released as a byproduct during photosynthesis.'
        ],
        formulas: ['6CO2 + 6H2O + Light -> C6H12O6 + 6O2'],
        summary: 'Understanding chlorophyll role, stomatal function, and biochemical equation of photosynthesis.'
      },
      {
        id: 'cbse-7-sci-t2',
        title: 'Human Digestive System',
        difficulty: 'Intermediate',
        keyPoints: [
          'Alimentary canal begins at buccal cavity, followed by esophagus, stomach, small intestine, and large intestine.',
          'Stomach secretes hydrochloric acid (HCl) to kill bacteria and pepsin to digest proteins.',
          'Complete digestion and absorption of nutrients occurs in the small intestine via villi.'
        ],
        summary: 'Tracing the digestion path, enzyme actions, and villi absorption mechanisms.'
      }
    ]
  },
  {
    id: 'cbse-7-sci-ch2',
    number: 2,
    title: 'Motion and Time',
    subject: 'Science',
    classLevel: 'Class 7',
    board: 'CBSE',
    description: 'Speed, uniform and non-uniform motion, measurement of time, simple pendulum, and distance-time graphs.',
    topics: [
      {
        id: 'cbse-7-sci-t3',
        title: 'Speed and Uniform Motion',
        difficulty: 'Beginner',
        keyPoints: [
          'Speed is the total distance covered divided by the time taken to cover that distance.',
          'SI unit of speed is metre per second (m/s); practical unit is kilometre per hour (km/h).',
          'An object moving along a straight line with constant speed is in uniform motion.'
        ],
        formulas: ['Speed = Distance / Time', 'Distance = Speed * Time', 'Time = Distance / Speed'],
        summary: 'Calculating speed, converting km/h to m/s (multiply by 5/18), and interpreting distance-time graphs.'
      },
      {
        id: 'cbse-7-sci-t4',
        title: 'Simple Pendulum and Time Period',
        difficulty: 'Intermediate',
        keyPoints: [
          'A simple pendulum consists of a small metallic bob suspended from a rigid stand by a light thread.',
          'One complete to-and-fro motion of the pendulum about its mean position is called an oscillation.',
          'The time taken by the pendulum to complete one oscillation is called its time period.'
        ],
        formulas: ['Time Period T = Total Time / Number of Oscillations'],
        summary: 'Understanding periodic motion, frequency, and time measurement devices.'
      }
    ]
  },
  {
    id: 'cbse-7-eng-ch1',
    number: 1,
    title: 'Tenses and Active-Passive Voice',
    subject: 'English',
    classLevel: 'Class 7',
    board: 'CBSE',
    description: 'Present, past, and future tenses, rules for converting active voice to passive voice, modals and conjunctions.',
    topics: [
      {
        id: 'cbse-7-eng-t1',
        title: 'Tenses and Voice Transformation',
        difficulty: 'Beginner',
        keyPoints: [
          'Simple present tense expresses general truths, habits, and scheduled future events.',
          'In passive voice, the object of the active sentence becomes the subject.',
          'Past participle (third form of the verb) is always used in passive voice sentences.'
        ],
        formulas: ['Active: Subject + Verb + Object', 'Passive: Object + Be + V3 + by + Subject'],
        summary: 'Recognizing verb forms and mastering active to passive sentence conversions.'
      }
    ]
  },
  {
    id: 'cbse-7-sst-ch1',
    number: 1,
    title: 'Medieval India and Democratic Governance',
    subject: 'Social Science',
    classLevel: 'Class 7',
    board: 'CBSE',
    description: 'The Delhi Sultans, the Mughal Empire, equality in Indian democracy, and state government role in healthcare.',
    topics: [
      {
        id: 'cbse-7-sst-t1',
        title: 'Mughal Empire and Medieval Administration',
        difficulty: 'Beginner',
        keyPoints: [
          'Babur established the Mughal Empire in 1526 after defeating Ibrahim Lodi at the Battle of Panipat.',
          'Akbar introduced the Mansabdari system to organize military and civil administration.',
          'Sulh-i kul (universal peace) was Akbar’s policy of religious tolerance.'
        ],
        summary: 'Understanding medieval state building, revenue systems (Zabt), and architectural achievements.'
      }
    ]
  },
  {
    id: 'cbse-7-hin-ch1',
    number: 1,
    title: 'Hindi Vyakaran: Sandhi evam Samas',
    subject: 'Hindi',
    classLevel: 'Class 7',
    board: 'CBSE',
    description: 'Swar sandhi, vyanjan sandhi, tatpurush samas, dvandva samas, aur muhavare.',
    topics: [
      {
        id: 'cbse-7-hin-t1',
        title: 'Swar Sandhi evam Pramukh Bhed',
        difficulty: 'Beginner',
        keyPoints: [
          'Do varnon ke mel se hone wale vikaar ko Sandhi kehte hain.',
          'Swar sandhi ke 5 bhed: Deergh, Gun, Vriddhi, Yan, aur Aayadi sandhi.',
          'Udaharan: Vidya + Aalay = Vidyalay (Deergh Sandhi).'
        ],
        summary: 'Shabdon ko jodna (Sandhi) aur alag karna (Sandhi-Vichhed) ke niyam.'
      }
    ]
  },

  // ==========================================
  // CLASS 8 - EXPANDED CORE SUBJECTS
  // ==========================================
  {
    id: 'cbse-8-math-ch1',
    number: 1,
    title: 'Linear Equations in One Variable',
    subject: 'Mathematics',
    classLevel: 'Class 8',
    board: 'CBSE',
    description: 'Solving linear equations with variables on both sides, algebraic modeling, and word problem applications.',
    topics: [
      {
        id: 'cbse-8-math-t1',
        title: 'Solving Linear Equations',
        difficulty: 'Beginner',
        keyPoints: [
          'A linear equation has highest power of the variable equal to 1.',
          'Transposition method: moving a term from LHS to RHS changes its sign (+ becomes -, * becomes /).',
          'Cross-multiplication applies when expressions are fractions on both sides.'
        ],
        formulas: ['ax + b = cx + d => (a - c)x = d - b', 'Cross-multiplication: a/b = c/d => a*d = b*c'],
        summary: 'Isolating unknown variables and verifying solutions by back-substitution.'
      },
      {
        id: 'cbse-8-math-t2',
        title: 'Word Problems & Real-World Modeling',
        difficulty: 'Intermediate',
        keyPoints: [
          'Translate English word statements into algebraic terms using an unknown variable x.',
          'Consecutive integers: x, x + 1, x + 2.',
          'Age problems: if current age is x, age after n years is x + n; age n years ago was x - n.'
        ],
        summary: 'Formulating and solving algebraic equations from perimeter, ratio, age, and digit problems.'
      }
    ]
  },
  {
    id: 'cbse-8-sci-ch1',
    number: 1,
    title: 'Force and Pressure',
    subject: 'Science',
    classLevel: 'Class 8',
    board: 'CBSE',
    description: 'Contact and non-contact forces, pressure, liquid pressure, atmospheric pressure and barometer.',
    topics: [
      {
        id: 'cbse-8-sci-t1',
        title: 'Types of Forces and Effects',
        difficulty: 'Beginner',
        keyPoints: [
          'Force is a push or pull upon an object resulting from its interaction with another object.',
          'Contact forces require physical touch (e.g. muscular force, frictional force).',
          'Non-contact forces act at a distance (e.g. gravitational force, electrostatic force, magnetic force).'
        ],
        formulas: ['Force F = mass * acceleration (F = m * a)', 'SI unit of Force is Newton (N)'],
        summary: 'Classifying forces, observing balanced vs unbalanced forces, and calculating net force.'
      },
      {
        id: 'cbse-8-sci-t2',
        title: 'Pressure and Liquid Pressure',
        difficulty: 'Intermediate',
        keyPoints: [
          'Pressure is the force acting per unit area of a surface (P = F / A).',
          'Smaller surface area exerts greater pressure for the same applied force (e.g. sharp knife cut).',
          'Liquids exert pressure equally in all directions, and pressure increases with liquid depth.'
        ],
        formulas: ['Pressure P = Force / Area', '1 Pascal (Pa) = 1 N/m²', 'Liquid Pressure P = h * ρ * g'],
        summary: 'Calculating pressure, explaining hydraulic principles, and atmospheric pressure effects.'
      }
    ]
  },
  {
    id: 'cbse-8-eng-ch1',
    number: 1,
    title: 'Direct and Indirect Speech',
    subject: 'English',
    classLevel: 'Class 8',
    board: 'CBSE',
    description: 'Reporting verbs, change of pronouns, change of tenses, and conversion of interrogative and imperative sentences.',
    topics: [
      {
        id: 'cbse-8-eng-t1',
        title: 'Rules of Reported Speech',
        difficulty: 'Beginner',
        keyPoints: [
          'If the reporting verb is in past tense, present tenses in direct speech change to corresponding past tenses.',
          'Simple Present becomes Simple Past; Present Continuous becomes Past Continuous.',
          'Pronouns change according to the subject and object of the reporting verb (SON rule: 1st person->Subject, 2nd->Object, 3rd->No change).'
        ],
        summary: 'Converting direct quotes into reported speech adhering to tense and pronoun shifts.'
      }
    ]
  },
  {
    id: 'cbse-8-sst-ch1',
    number: 1,
    title: 'The Indian Constitution and Secularism',
    subject: 'Social Science',
    classLevel: 'Class 8',
    board: 'CBSE',
    description: 'Preamble, key features of the Constitution, Fundamental Rights, directive principles, and concept of secularism.',
    topics: [
      {
        id: 'cbse-8-sst-t1',
        title: 'Key Features of the Indian Constitution',
        difficulty: 'Beginner',
        keyPoints: [
          'Federalism: existence of more than one level of government in the country (Union, State, Panchayati Raj).',
          'Parliamentary form of government guarantees universal adult suffrage for all citizens.',
          'Separation of Powers divides authority between Legislature, Executive, and Judiciary.'
        ],
        summary: 'Core institutional pillars and fundamental rights enshrined in the Constitution of India.'
      }
    ]
  },
  {
    id: 'cbse-8-hin-ch1',
    number: 1,
    title: 'Hindi Vyakaran: Muhavare aur Lokoktiyan',
    subject: 'Hindi',
    classLevel: 'Class 8',
    board: 'CBSE',
    description: 'Muhavare, lokoktiyan, vakya prayog, aur shuddh vartani.',
    topics: [
      {
        id: 'cbse-8-hin-t1',
        title: 'Muhavare aur Vakya Prayog',
        difficulty: 'Beginner',
        keyPoints: [
          'Muhavare vishesh arth prakat karne wale vakyansh hote hain jo koshagat arth se bhinna hote hain.',
          'Udaharan: "Aankhon ka tara hona" arthath bahut pyara hona.',
          'Lokoktiyan samajik anubhav par aadharit purna vakya hoti hain.'
        ],
        summary: 'Hindi sahitya aur dainik vyavahar me muhavaron ka sateek prayog.'
      }
    ]
  },

  // ==========================================
  // CLASS 9 - EXPANDED SUBJECTS (ENGLISH, SST, HINDI)
  // ==========================================
  {
    id: 'cbse-9-eng-ch1',
    number: 1,
    title: 'Advanced Grammar & Reading Comprehension',
    subject: 'English',
    classLevel: 'Class 9',
    board: 'CBSE',
    description: 'Determiners, modals, subject-verb concord, reported speech, and analytical paragraph writing.',
    topics: [
      {
        id: 'cbse-9-eng-t1',
        title: 'Modals and Conditionals',
        difficulty: 'Beginner',
        keyPoints: [
          'Modals express necessity, obligation, permission, possibility, or ability (can, could, may, might, must, should).',
          'Must implies strong obligation or logical necessity; should implies advice or recommendation.',
          'First conditional: If + present simple, will + base verb (real future possibilities).'
        ],
        summary: 'Using modal auxiliary verbs accurately to express degrees of certainty and obligation.'
      }
    ]
  },
  {
    id: 'cbse-9-sst-ch1',
    number: 1,
    title: 'India - Size and Location',
    subject: 'Social Science',
    classLevel: 'Class 9',
    board: 'CBSE',
    description: 'Latitudinal and longitudinal extent of India, standard meridian (82°30\' E), neighbors and strategic geographical position.',
    topics: [
      {
        id: 'cbse-9-sst-t1',
        title: 'Geographical Extent and Standard Meridian',
        difficulty: 'Beginner',
        keyPoints: [
          'India lies entirely in the Northern Hemisphere between latitudes 8°4\'N and 37°6\'N, longitudes 68°7\'E and 97°25\'E.',
          'Standard Meridian of India (82°30\' E passing through Mirzapur, UP) defines Indian Standard Time (IST).',
          'Tropic of Cancer (23°30\' N) divides India into almost two equal halves.'
        ],
        formulas: ['IST = GMT + 5 hours 30 minutes'],
        summary: 'Locational features of India and maritime commercial trade routes connecting East and West.'
      }
    ]
  },
  {
    id: 'cbse-9-hin-ch1',
    number: 1,
    title: 'Alankar evam Vakya Bhed',
    subject: 'Hindi',
    classLevel: 'Class 9',
    board: 'CBSE',
    description: 'Shabd-alankar, arth-alankar (Anupras, Yamak, Shlesh, Upama, Rupak, Utpreksha), aur rachna ke aadhar par vakya bhed.',
    topics: [
      {
        id: 'cbse-9-hin-t1',
        title: 'Kavya me Alankar ke Bhed',
        difficulty: 'Beginner',
        keyPoints: [
          'Kavya ki shobha badhane wale tatva ko Alankar kehte hain.',
          'Anupras: varno ki aavriti (bar-bar aana). Yamak: ek hi shabd do ya adhik baar aaye par arth bhinna ho.',
          'Upama: kisi vastu ki tulna kisi anya prasiddha vastu se ki jaaye.'
        ],
        summary: 'Kavya saundarya me shabd aur artha alankaron ki pehchan evam prayog.'
      }
    ]
  },

  // ==========================================
  // CLASS 10 - ALL CORE SUBJECTS
  // ==========================================
  {
    id: 'cbse-10-math-ch1',
    number: 1,
    title: 'Real Numbers and Polynomials',
    subject: 'Mathematics',
    classLevel: 'Class 10',
    board: 'CBSE',
    description: 'Fundamental Theorem of Arithmetic, proving irrationality of √2 and √3, zeroes of polynomials and quadratic relationships.',
    topics: [
      {
        id: 'cbse-10-math-t1',
        title: 'Fundamental Theorem of Arithmetic & Irrationality',
        difficulty: 'Beginner',
        keyPoints: [
          'Every composite number can be expressed (factorised) as a product of primes uniquely up to order.',
          'HCF(a, b) * LCM(a, b) = a * b for any two positive integers.',
          'Proof by contradiction establishes that √2, √3, √5 cannot be written in p/q form (p, q coprime).'
        ],
        formulas: ['HCF(a, b) * LCM(a, b) = a * b'],
        summary: 'Finding prime factors, calculating HCF and LCM, and constructing proofs of irrationality.'
      },
      {
        id: 'cbse-10-math-t2',
        title: 'Zeroes and Coefficients of Quadratic Polynomials',
        difficulty: 'Intermediate',
        keyPoints: [
          'If α and β are the zeroes of quadratic polynomial ax² + bx + c (a ≠ 0): Sum of zeroes α + β = -b/a.',
          'Product of zeroes α * β = c/a.',
          'A quadratic polynomial with zeroes α, β is given by k[x² - (α + β)x + αβ].'
        ],
        formulas: ['α + β = -b / a', 'α * β = c / a', 'p(x) = k[x² - Sx + P]'],
        summary: 'Deriving relationships between roots and algebraic coefficients of polynomial functions.'
      }
    ]
  },
  {
    id: 'cbse-10-math-ch2',
    number: 2,
    title: 'Trigonometry and Applications',
    subject: 'Mathematics',
    classLevel: 'Class 10',
    board: 'CBSE',
    description: 'Trigonometric ratios, values at standard angles (0°, 30°, 45°, 60°, 90°), identities, and heights and distances.',
    topics: [
      {
        id: 'cbse-10-math-t3',
        title: 'Trigonometric Ratios and Standard Angles',
        difficulty: 'Beginner',
        keyPoints: [
          'In a right triangle: sin θ = opp/hyp, cos θ = adj/hyp, tan θ = opp/adj.',
          'Reciprocal ratios: cosec θ = 1/sin θ, sec θ = 1/cos θ, cot θ = 1/tan θ.',
          'Key values: sin 30° = 1/2, sin 45° = 1/√2, sin 60° = √3/2, tan 45° = 1.'
        ],
        formulas: ['sin θ = p / h', 'cos θ = b / h', 'tan θ = p / b'],
        summary: 'Memorizing exact trigonometric ratios across acute angles and evaluating numerical expressions.'
      },
      {
        id: 'cbse-10-math-t4',
        title: 'Trigonometric Identities and Heights & Distances',
        difficulty: 'Intermediate',
        keyPoints: [
          'Fundamental identity: sin² θ + cos² θ = 1.',
          'Secondary identities: 1 + tan² θ = sec² θ and 1 + cot² θ = cosec² θ.',
          'Angle of elevation: angle between line of sight and horizontal when observing an object above horizontal plane.'
        ],
        formulas: [
          'sin² θ + cos² θ = 1',
          'sec² θ - tan² θ = 1',
          'cosec² θ - cot² θ = 1',
          'Height h = distance * tan(elevation)'
        ],
        summary: 'Proving trigonometric identities and solving real-world height and distance problems.'
      }
    ]
  },
  {
    id: 'cbse-10-sci-ch1',
    number: 1,
    title: 'Chemical Reactions and Equations',
    subject: 'Science',
    classLevel: 'Class 10',
    board: 'CBSE',
    description: 'Balancing chemical equations, combination, decomposition, displacement, double displacement, redox, and corrosion.',
    topics: [
      {
        id: 'cbse-10-sci-t1',
        title: 'Balancing Chemical Equations & Types of Reactions',
        difficulty: 'Beginner',
        keyPoints: [
          'Law of Conservation of Mass dictates that atoms on the reactant side must equal atoms on product side.',
          'Combination reaction: two or more substances combine to form a single product (CaO + H2O -> Ca(OH)2).',
          'Decomposition reaction: a single compound breaks down into two or more simpler substances when heated or electrified.'
        ],
        formulas: ['Reactant Mass = Product Mass', '2Mg + O2 -> 2MgO'],
        summary: 'Mastering stoichiometric balancing using hit-and-trial methods and classifying chemical transformations.'
      },
      {
        id: 'cbse-10-sci-t2',
        title: 'Redox Reactions, Corrosion and Rancidity',
        difficulty: 'Intermediate',
        keyPoints: [
          'Oxidation is the gain of oxygen or loss of electrons/hydrogen.',
          'Reduction is the loss of oxygen or gain of electrons/hydrogen.',
          'In a redox reaction, one reactant gets oxidized while another gets reduced simultaneously.',
          'Corrosion is the gradual deterioration of metals due to action of air, moisture, and chemical agents.'
        ],
        formulas: ['CuO + H2 --(heat)--> Cu + H2O (CuO is reduced, H2 is oxidized)'],
        summary: 'Identifying oxidizing and reducing agents and preventive techniques for corrosion and rancidity.'
      }
    ]
  },
  {
    id: 'cbse-10-sci-ch2',
    number: 2,
    title: 'Electricity and Circuits',
    subject: 'Science',
    classLevel: 'Class 10',
    board: 'CBSE',
    description: 'Electric current, potential difference, Ohm\'s Law, resistance factors, series and parallel circuits, and Joule\'s heating effect.',
    topics: [
      {
        id: 'cbse-10-sci-t3',
        title: 'Ohm’s Law and Resistance Factors',
        difficulty: 'Beginner',
        keyPoints: [
          'Ohm’s Law: Electric current (I) is directly proportional to potential difference (V) across conductor at constant temperature.',
          'Resistance R depends directly on length (L), inversely on cross-sectional area (A), and on resistivity (ρ).',
          'Resistivity (ρ) is an intrinsic material property measured in Ohm-metre (Ω·m).'
        ],
        formulas: ['V = I * R', 'R = ρ * (L / A)', '1 Ohm = 1 Volt / 1 Ampere'],
        summary: 'Verifying V-I graphs, calculating equivalent resistances, and applying resistivity formulas.'
      },
      {
        id: 'cbse-10-sci-t4',
        title: 'Series & Parallel Resistors and Electric Power',
        difficulty: 'Intermediate',
        keyPoints: [
          'In series combination: Current remains constant, equivalent resistance Rs = R1 + R2 + R3.',
          'In parallel combination: Voltage remains constant, equivalent resistance 1/Rp = 1/R1 + 1/R2 + 1/R3.',
          'Joule’s law of heating: Heat produced H = I² * R * t.',
          'Commercial unit of electric energy is kilowatt-hour (1 kWh = 3.6 × 10^6 Joules).'
        ],
        formulas: [
          'Rs = R1 + R2 + ...',
          '1/Rp = 1/R1 + 1/R2 + ...',
          'H = I² * R * t',
          'P = V * I = I² * R = V² / R'
        ],
        summary: 'Solving circuit networks, calculating domestic power consumption, and thermal heating applications.'
      }
    ]
  },
  {
    id: 'cbse-10-eng-ch1',
    number: 1,
    title: 'Formal Writing and Grammar Mastery',
    subject: 'English',
    classLevel: 'Class 10',
    board: 'CBSE',
    description: 'Letter of complaint, letter of inquiry, analytical paragraphs, error correction, and reported speech.',
    topics: [
      {
        id: 'cbse-10-eng-t1',
        title: 'Reported Speech & Error Correction',
        difficulty: 'Beginner',
        keyPoints: [
          'Reporting commands/requests: said to -> ordered/requested/advised, with "to + base verb".',
          'Questions with auxiliary verbs use "if/whether", while Wh-questions retain the question word.',
          'Subject-verb agreement: singular indefinite pronouns (each, everyone, neither) take singular verbs.'
        ],
        summary: 'Polishing grammar accuracy and sentence transformations for board exam question patterns.'
      }
    ]
  },
  {
    id: 'cbse-10-sst-ch1',
    number: 1,
    title: 'The Rise of Nationalism in Europe and India',
    subject: 'Social Science',
    classLevel: 'Class 10',
    board: 'CBSE',
    description: 'French Revolution ideas, Napoleon Code (1804), unification of Italy and Germany, Non-Cooperation Movement, Civil Disobedience Movement.',
    topics: [
      {
        id: 'cbse-10-sst-t1',
        title: 'Nationalism in Europe & Napoleonic Code',
        difficulty: 'Beginner',
        keyPoints: [
          'Civil Code of 1804 (Napoleonic Code) abolished all privileges based on birth and established equality before law.',
          'Giuseppe Mazzini founded secret societies Young Italy and Young Europe for national unification.',
          'Otto von Bismarck unified Germany using the policy of "Blood and Iron".'
        ],
        summary: 'Tracing the emergence of the modern nation-state and liberal-nationalist ideology in Europe.'
      },
      {
        id: 'cbse-10-sst-t2',
        title: 'Nationalism in India & Mass Movements',
        difficulty: 'Intermediate',
        keyPoints: [
          'Satyagraha emphasizes the power of truth and the need to search for truth through non-violent resistance.',
          'Jallianwala Bagh massacre occurred on 13 April 1919 under General Dyer’s orders in Amritsar.',
          'Dandi March (Salt Satyagraha) began from Sabarmati Ashram on 12 March 1930, marking the Civil Disobedience Movement.'
        ],
        summary: 'Analyzing the freedom struggle, social group participation, and Gandhiji’s non-violent mass campaigns.'
      }
    ]
  },
  {
    id: 'cbse-10-hin-ch1',
    number: 1,
    title: 'Hindi Vyakaran: Pad Parichay aur Ras',
    subject: 'Hindi',
    classLevel: 'Class 10',
    board: 'CBSE',
    description: 'Pad parichay, vachya parivartan (Kartri, Karm, Bhaav), vakya shuddhi, aur navon ras (Sringar, Veer, Karun, etc.).',
    topics: [
      {
        id: 'cbse-10-hin-t1',
        title: 'Pad Parichay evam Vachya Parivartan',
        difficulty: 'Beginner',
        keyPoints: [
          'Vakya me prayukta pratyek shabd "pad" kehlata hai.',
          'Pad parichay me shabd ka bhed, ling, vachan, karak, aur anya shabdon se sambandh batana hota hai.',
          'Vachya ke teen bhed hain: Kartri-vachya, Karma-vachya, aur Bhaav-vachya.'
        ],
        summary: 'Vakya me prayukta shabdon ka vyakaranik vishleshan aur vachya rupantaran.'
      }
    ]
  },
  {
    id: 'cbse-10-cs-ch1',
    number: 1,
    title: 'Computer Applications and Python Basics',
    subject: 'Computer Science',
    classLevel: 'Class 10',
    board: 'CBSE',
    description: 'Internet basics, HTML5 formatting, cyber ethics, intellectual property rights, and Python conditional execution.',
    topics: [
      {
        id: 'cbse-10-cs-t1',
        title: 'Networking Fundamentals & Cyber Ethics',
        difficulty: 'Beginner',
        keyPoints: [
          'World Wide Web (WWW) is a system of interlinked hypertext documents accessed via the Internet.',
          'Protocols: HTTP (Hypertext Transfer Protocol), HTTPS (Secure encrypted), FTP (File Transfer).',
          'Phishing is an attempt to acquire sensitive personal information masquerading as a trustworthy entity.'
        ],
        summary: 'Understanding network architectures, data communication protocols, and cyber security safeguards.'
      }
    ]
  },

  // ==========================================
  // CLASS 11 - EXPANDED SUBJECTS
  // ==========================================
  {
    id: 'cbse-11-math-ch1',
    number: 1,
    title: 'Sets, Relations and Functions',
    subject: 'Mathematics',
    classLevel: 'Class 11',
    board: 'CBSE',
    stream: 'Science',
    description: 'Roster and set-builder form, subsets, union, intersection, Cartesian product, domain, range, and composite functions.',
    topics: [
      {
        id: 'cbse-11-math-t1',
        title: 'Sets, Venn Diagrams and Operations',
        difficulty: 'Beginner',
        keyPoints: [
          'A set is a well-defined collection of distinct objects.',
          'Subsets: If every element of set A is also an element of set B, then A ⊆ B; total subsets = 2^n.',
          'De Morgan’s Laws: (A ∪ B)’ = A’ ∩ B’ and (A ∩ B)’ = A’ ∪ B’.'
        ],
        formulas: ['n(A ∪ B) = n(A) + n(B) - n(A ∩ B)', 'Total subsets = 2^n', '(A ∪ B)’ = A’ ∩ B’'],
        summary: 'Set representation, subset enumeration, Venn diagram logic, and cardinality formulas.'
      },
      {
        id: 'cbse-11-math-t2',
        title: 'Cartesian Products, Relations and Functions',
        difficulty: 'Intermediate',
        keyPoints: [
          'Cartesian product A × B = {(a, b) : a ∈ A and b ∈ B}; total relations = 2^(p*q).',
          'A relation f from A to B is a function if every element of A has one and only one image in B.',
          'Domain is the set of valid inputs; Range is the set of actual outputs.'
        ],
        formulas: ['Total relations = 2^(n(A)*n(B))', 'f: A -> B where ∀ x ∈ A, ∃! y ∈ B'],
        summary: 'Determining domain and range of rational, square-root, and modulus functions.'
      }
    ]
  },
  {
    id: 'cbse-11-bio-ch1',
    number: 1,
    title: 'Cell: The Unit of Life',
    subject: 'Biology',
    classLevel: 'Class 11',
    board: 'CBSE',
    stream: 'Science',
    description: 'Cell theory, prokaryotic vs eukaryotic cells, cell membrane fluid mosaic model, endomembrane system, and cell division.',
    topics: [
      {
        id: 'cbse-11-bio-t1',
        title: 'Prokaryotic vs Eukaryotic Cells & Fluid Mosaic Model',
        difficulty: 'Beginner',
        keyPoints: [
          'Cell theory proposed by Schleiden and Schwann; modified by Virchow ("Omnis cellula-e cellula").',
          'Prokaryotes lack a membrane-bound nucleus and have 70S ribosomes; eukaryotes have 80S ribosomes.',
          'Singer and Nicolson (1972) proposed the Fluid Mosaic Model of the cell membrane composed of a phospholipid bilayer.'
        ],
        summary: 'Contrasting cellular architectures and structural characteristics of the plasma membrane.'
      },
      {
        id: 'cbse-11-bio-t2',
        title: 'Organelles and the Endomembrane System',
        difficulty: 'Intermediate',
        keyPoints: [
          'Endomembrane system includes Endoplasmic Reticulum (ER), Golgi apparatus, Lysosomes, and Vacuoles.',
          'Mitochondria and chloroplasts are semi-autonomous organelles possessing their own DNA and 70S ribosomes.',
          'Lysosomes contain hydrolytic enzymes active at acidic pH (optimal pH ~ 5).'
        ],
        summary: 'Functional coordination among cellular organelles in protein synthesis and cellular respiration.'
      }
    ]
  },
  {
    id: 'cbse-11-bst-ch1',
    number: 1,
    title: 'Business, Trade and Commerce',
    subject: 'Business Studies',
    classLevel: 'Class 11',
    board: 'CBSE',
    stream: 'Commerce',
    description: 'Characteristics of business, classification of business activities (industry and commerce), business risks, and objectives.',
    topics: [
      {
        id: 'cbse-11-bst-t1',
        title: 'Nature and Purpose of Business',
        difficulty: 'Beginner',
        keyPoints: [
          'Business is an economic activity involving production and sale of goods and services undertaken with profit motive.',
          'Industry deals with production/conversion of goods (primary, secondary, tertiary).',
          'Commerce includes trade and auxiliaries to trade (banking, insurance, warehousing, transport, advertising).'
        ],
        summary: 'Distinguishing business from profession and employment, and analyzing the role of profit.'
      }
    ]
  },
  {
    id: 'cbse-11-eco-ch1',
    number: 1,
    title: 'Introduction to Microeconomics',
    subject: 'Economics',
    classLevel: 'Class 11',
    board: 'CBSE',
    stream: 'Commerce',
    description: 'Scarcity, central problems of an economy, Production Possibility Curve (PPC), and opportunity cost.',
    topics: [
      {
        id: 'cbse-11-eco-t1',
        title: 'Central Problems and Production Possibility Curve',
        difficulty: 'Beginner',
        keyPoints: [
          'Central problems of every economy: What to produce, How to produce, and For whom to produce.',
          'Opportunity cost is the cost of the next best alternative foregone.',
          'PPC is concave to the origin due to increasing Marginal Rate of Transformation (MRT).'
        ],
        formulas: ['MRT = ΔY / ΔX (Marginal Opportunity Cost)'],
        summary: 'Analyzing economic scarcity, resource allocation, and shifts in the production frontier.'
      }
    ]
  },
  {
    id: 'cbse-11-hist-ch1',
    number: 1,
    title: 'Early Civilizations and City Life',
    subject: 'History',
    classLevel: 'Class 11',
    board: 'CBSE',
    stream: 'Humanities / Arts',
    description: 'Mesopotamian civilization, emergence of urban settlements, cuneiform writing, and the Code of Hammurabi.',
    topics: [
      {
        id: 'cbse-11-hist-t1',
        title: 'Mesopotamian Urbanization and Cuneiform Script',
        difficulty: 'Beginner',
        keyPoints: [
          'Mesopotamia (land between rivers Tigris and Euphrates) is considered the cradle of city life and writing.',
          'Cuneiform script consisted of wedge-shaped signs impressed on moist clay tablets.',
          'The city of Uruk showcased early monumentality with temples (Ziggurats) and bronze metallurgy.'
        ],
        summary: 'Understanding agrarian surpluses, trading networks, and record-keeping in early ancient cities.'
      }
    ]
  },
  {
    id: 'cbse-11-pol-ch1',
    number: 1,
    title: 'Constitution: Why and How?',
    subject: 'Political Science',
    classLevel: 'Class 11',
    board: 'CBSE',
    stream: 'Humanities / Arts',
    description: 'Need for a constitution, authority of a constitution, Constituent Assembly deliberations, and institutional design.',
    topics: [
      {
        id: 'cbse-11-pol-t1',
        title: 'Role of the Constitution & Constituent Assembly',
        difficulty: 'Beginner',
        keyPoints: [
          'The Constitution coordinates basic rules that allow minimal coordination among members of a society.',
          'It specifies who has the power to make decisions in a society and sets limits on government power.',
          'The Constituent Assembly first met on 9 December 1946; drafting committee was chaired by Dr. B.R. Ambedkar.'
        ],
        summary: 'Evaluating democratic constitutionalism, legitimation of state authority, and institutional checks.'
      }
    ]
  },
  {
    id: 'cbse-11-geo-ch1',
    number: 1,
    title: 'Origin and Evolution of the Earth',
    subject: 'Geography',
    classLevel: 'Class 11',
    board: 'CBSE',
    stream: 'Humanities / Arts',
    description: 'Nebular hypothesis, Big Bang theory, internal structure of Earth (crust, mantle, core), and tectonic boundaries.',
    topics: [
      {
        id: 'cbse-11-geo-t1',
        title: 'Interior Structure of the Earth',
        difficulty: 'Beginner',
        keyPoints: [
          'Earth consists of three concentric layers: Crust (brittle, silica-aluminum), Mantle (magma, silica-magnesium), and Core (nickel-iron).',
          'Mohorovicic discontinuity separates the crust from the mantle; Gutenberg discontinuity separates mantle from core.',
          'Primary (P) waves travel through solids and liquids; Secondary (S) waves travel only through solids.'
        ],
        summary: 'Analyzing seismic wave propagation and density stratifications inside planet Earth.'
      }
    ]
  },

  // ==========================================
  // CLASS 12 - EXPANDED SUBJECTS
  // ==========================================
  {
    id: 'cbse-12-math-ch1',
    number: 1,
    title: 'Matrices and Determinants',
    subject: 'Mathematics',
    classLevel: 'Class 12',
    board: 'CBSE',
    stream: 'Science',
    description: 'Matrix algebra, transpose, symmetric and skew-symmetric matrices, properties of determinants, adjoint and inverse, solving linear systems.',
    topics: [
      {
        id: 'cbse-12-math-t1',
        title: 'Matrix Operations & Invertibility',
        difficulty: 'Beginner',
        keyPoints: [
          'Matrix multiplication is associative and distributive, but generally NOT commutative (AB ≠ BA).',
          'A square matrix A is symmetric if A\' = A, and skew-symmetric if A\' = -A.',
          'Inverse matrix A^(-1) exists if and only if |A| ≠ 0 (non-singular matrix).'
        ],
        formulas: ['A^(-1) = (1 / |A|) * adj(A)', 'A * adj(A) = |A| * I', '|AB| = |A| * |B|'],
        summary: 'Calculating adjoint matrices, inverting matrices, and determining conditions for consistency.'
      },
      {
        id: 'cbse-12-math-t2',
        title: 'Solving Systems of Linear Equations',
        difficulty: 'Intermediate',
        keyPoints: [
          'Matrix method: Express system as AX = B, where X = A^(-1)B.',
          'If |A| ≠ 0, the system has a unique consistent solution.',
          'If |A| = 0 and (adj A)B ≠ O, the system is inconsistent with no solution.'
        ],
        formulas: ['AX = B => X = A^(-1)B'],
        summary: 'Applying matrix inversion to solve simultaneous linear equations in 2 and 3 variables.'
      }
    ]
  },
  {
    id: 'cbse-12-phy-ch1',
    number: 1,
    title: 'Electrostatics & Electric Charges',
    subject: 'Physics',
    classLevel: 'Class 12',
    board: 'CBSE',
    stream: 'Science',
    description: 'Coulomb\'s Law, electric field, electric dipole, Gauss\'s Law and applications, electric potential, capacitance.',
    topics: [
      {
        id: 'cbse-12-phy-t1',
        title: 'Coulomb’s Law and Electric Field',
        difficulty: 'Beginner',
        keyPoints: [
          'Coulomb’s Law: Electrostatic force between two stationary point charges is F = k * |q1 * q2| / r².',
          'Electrostatic constant in vacuum k = 1 / (4πε0) ≈ 9 × 10^9 N·m²/C².',
          'Electric field E at a distance r from point charge q is E = F / q0 = k * q / r².'
        ],
        formulas: ['F = (1 / 4πε0) * (q1 * q2 / r²)', 'E = F / q', 'ε0 ≈ 8.854 × 10^(-12) C²/(N·m²)'],
        summary: 'Vector formulation of electrostatic forces, superposition principle, and electric field lines.'
      },
      {
        id: 'cbse-12-phy-t2',
        title: 'Gauss’s Law and Applications',
        difficulty: 'Intermediate',
        keyPoints: [
          'Gauss’s Law states that total electric flux through any closed Gaussian surface equals Q_enclosed / ε0.',
          'Electric field due to infinitely long thin charged wire: E = λ / (2πε0r).',
          'Electric field due to infinite thin plane sheet of charge: E = σ / (2ε0).'
        ],
        formulas: ['Φ = ∮ E · dA = Q_encl / ε0', 'E_wire = λ / (2πε0r)', 'E_sheet = σ / (2ε0)'],
        summary: 'Calculating electric flux and applying symmetry to derive fields of standard continuous charge distributions.'
      }
    ]
  },
  {
    id: 'cbse-12-chem-ch1',
    number: 1,
    title: 'Solutions and Colligative Properties',
    subject: 'Chemistry',
    classLevel: 'Class 12',
    board: 'CBSE',
    stream: 'Science',
    description: 'Types of solutions, Henry\'s Law, Raoult\'s Law, colligative properties (elevation of boiling point, depression of freezing point, osmotic pressure), van \'t Hoff factor.',
    topics: [
      {
        id: 'cbse-12-chem-t1',
        title: 'Raoult’s Law and Ideal Solutions',
        difficulty: 'Beginner',
        keyPoints: [
          'Raoult’s Law: For a solution of volatile liquids, partial vapour pressure of each component is p1 = p1° * x1.',
          'Ideal solutions obey Raoult’s law over entire concentration range with ΔH_mix = 0 and ΔV_mix = 0.',
          'Non-ideal solutions exhibit positive or negative deviations and form azeotropes.'
        ],
        formulas: ['P_total = pA° * xA + pB° * xB', 'Henry\'s Law: p = KH * x'],
        summary: 'Understanding vapour pressure curves, binary mixtures, and deviations from ideality.'
      },
      {
        id: 'cbse-12-chem-t2',
        title: 'Colligative Properties and van ’t Hoff Factor',
        difficulty: 'Intermediate',
        keyPoints: [
          'Colligative properties depend solely on the number of solute particles, not their chemical nature.',
          'Elevation in boiling point: ΔTb = Kb * m; Depression in freezing point: ΔTf = Kf * m.',
          'Osmotic pressure: π = i * C * R * T, where i is the van \'t Hoff factor indicating association or dissociation.'
        ],
        formulas: ['ΔTb = i * Kb * m', 'ΔTf = i * Kf * m', 'π = i * C * R * T', 'i = 1 + (n - 1)α'],
        summary: 'Determining molar mass of non-volatile solutes using freezing point depression and osmotic pressure.'
      }
    ]
  },
  {
    id: 'cbse-12-bio-ch1',
    number: 1,
    title: 'Principles of Inheritance and Variation',
    subject: 'Biology',
    classLevel: 'Class 12',
    board: 'CBSE',
    stream: 'Science',
    description: 'Mendel\'s laws of inheritance, monohybrid and dihybrid crosses, incomplete dominance, co-dominance, sex determination, and genetic disorders.',
    topics: [
      {
        id: 'cbse-12-bio-t1',
        title: 'Mendelian Genetics and Punnett Squares',
        difficulty: 'Beginner',
        keyPoints: [
          'Mendel proposed Law of Dominance and Law of Segregation based on monohybrid crosses (3:1 phenotypic ratio).',
          'Dihybrid cross demonstrates the Law of Independent Assortment with a phenotypic ratio of 9:3:3:1.',
          'ABO blood grouping in humans exemplifies multiple allelism and co-dominance (IA and IB are codominant over i).'
        ],
        formulas: ['Monohybrid ratio: 3:1 (phenotypic), 1:2:1 (genotypic)', 'Dihybrid ratio: 9:3:3:1'],
        summary: 'Analyzing inheritance patterns, constructing genetic cross diagrams, and predicting offspring probabilities.'
      }
    ]
  },
  {
    id: 'cbse-12-cs-ch1',
    number: 1,
    title: 'Python File Handling and Data Structures',
    subject: 'Computer Science',
    classLevel: 'Class 12',
    board: 'CBSE',
    stream: 'Science',
    description: 'Text, binary, and CSV file operations in Python, pickle module, stack implementation using list (LIFO), and SQL connectivity.',
    topics: [
      {
        id: 'cbse-12-cs-t1',
        title: 'Text and Binary File Operations in Python',
        difficulty: 'Beginner',
        keyPoints: [
          'Text files are accessed via open() using modes: "r" (read), "w" (write), "a" (append).',
          'File methods: read(), readline(), readlines(), write(), writelines(), and seek()/tell().',
          'Binary files handle serialized byte streams using pickle.dump() to write and pickle.load() to read.'
        ],
        formulas: ['open(filename, mode)', 'pickle.dump(obj, file_obj)', 'obj = pickle.load(file_obj)'],
        summary: 'Writing efficient Python code for parsing text logs, CSV data streams, and binary serializations.'
      },
      {
        id: 'cbse-12-cs-t2',
        title: 'Stack Data Structure Implementation',
        difficulty: 'Intermediate',
        keyPoints: [
          'Stack is a linear data structure following Last-In-First-Out (LIFO) order.',
          'Core stack operations: push (add to top), pop (remove from top), and peek (inspect top without removal).',
          'In Python, stacks are commonly implemented using lists: append() for push and pop() for pop.'
        ],
        formulas: ['stack.append(item) # Push', 'item = stack.pop() # Pop (raises IndexError if empty)'],
        summary: 'Implementing and tracing stack functions for reversing strings, balancing brackets, and evaluation.'
      }
    ]
  },
  {
    id: 'cbse-12-hist-ch1',
    number: 1,
    title: 'Harappan Archaeology & Ancient States',
    subject: 'History',
    classLevel: 'Class 12',
    board: 'CBSE',
    stream: 'Humanities / Arts',
    description: 'Harappan civilization urban planning, crafts, burials, script, and political organizations of the Mahajanapadas.',
    topics: [
      {
        id: 'cbse-12-hist-t1',
        title: 'Town Planning and Craft Production in Harappa',
        difficulty: 'Beginner',
        keyPoints: [
          'Harappan settlements were divided into Citadel (higher, smaller, fortified) and Lower Town (residential).',
          'The Great Bath at Mohenjo-daro was a large rectangular tank made watertight with gypsum mortar for ritual bathing.',
          'Grid pattern layout with streets intersecting at right angles and advanced covered drainage systems.'
        ],
        summary: 'Analyzing archaeological evidence from Mohenjo-daro, Harappa, Lothal, and Chanhudaro.'
      }
    ]
  },
  {
    id: 'cbse-12-pol-ch1',
    number: 1,
    title: 'The End of Bipolarity and Contemporary World',
    subject: 'Political Science',
    classLevel: 'Class 12',
    board: 'CBSE',
    stream: 'Humanities / Arts',
    description: 'Collapse of the Soviet Union, shock therapy, rise of new centers of power, and contemporary global politics.',
    topics: [
      {
        id: 'cbse-12-pol-t1',
        title: 'Disintegration of the Soviet Union & Shock Therapy',
        difficulty: 'Beginner',
        keyPoints: [
          'Fall of the Berlin Wall in November 1989 symbolized the collapse of the communist bloc and end of Cold War.',
          'Mikhail Gorbachev introduced policies of Glasnost (openness) and Perestroika (restructuring).',
          'Shock therapy was the rapid, painful transition from a socialist planned economy to a free-market capitalist model.'
        ],
        summary: 'Understanding post-Cold War geopolitics, emergence of 15 successor states, and unipolar transition.'
      }
    ]
  },
  {
    id: 'cbse-12-geo-ch1',
    number: 1,
    title: 'Human Geography: Nature and Scope',
    subject: 'Geography',
    classLevel: 'Class 12',
    board: 'CBSE',
    stream: 'Humanities / Arts',
    description: 'Environmental determinism, possibilism, neo-determinism (stop and go determinism), and global population distribution.',
    topics: [
      {
        id: 'cbse-12-geo-t1',
        title: 'Human Geography Schools of Thought',
        difficulty: 'Beginner',
        keyPoints: [
          'Environmental Determinism: nature controls human activities and culture (Ratzel, Semple).',
          'Possibilism: humans master their environment using technology and create opportunities (Vidal de la Blache).',
          'Neo-determinism (Stop and Go Determinism) proposed by Griffith Taylor emphasizes sustainable middle paths.'
        ],
        summary: 'Conceptualizing human-nature interactions and environmental sustainability frameworks.'
      }
    ]
  }
];
