import {
  BANK,
  GK_CATEGORIES,
  SUBJECTS,
  computeQuestionContentSignature,
  computeQuestionFingerprint,
  normalizeQuestionSignature,
  normalizeTextToken,
  setPublishedQuestionPoolProvider,
} from './questionEngine';
import type { Question, QuestionDifficulty } from './questionBanks';
import { CURATED_EXPANSION_BATCH_1 } from './curatedExpansionBatch1';
import {
  VALID_SUBJECT_IDS,
  isContaminatedOrCodeText,
  isValidFirebaseAuthUid,
} from './leaderboardEngine';

export type QuestionStatus = 'draft' | 'published' | 'archived';
export type QuestionSource = 'curated' | 'imported' | 'migrated' | 'admin';

export interface QuestionBankDocument {
  id: string;
  subjectId: string;
  topic: string;
  subtopic: string;
  difficulty: QuestionDifficulty;
  type: 'single_choice';
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  status: QuestionStatus;
  fingerprint: string;
  contentSignature: string;
  source: QuestionSource;
  eventDate?: string;
  verifiedSource?: string;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  reviewedBy?: string;
}

export interface DuplicateMatchWarning {
  existingQuestionId: string;
  existingQuestionText: string;
  existingStatus: QuestionStatus;
  matchType:
    | 'exact'
    | 'punctuation'
    | 'reordered_options'
    | 'same_meaning_and_answers'
    | 'near_duplicate';
  similarityScore: number; // 0..1
  blocking: boolean; // true for exact/punctuation/reordered_options, false (warning) for near_duplicate
  reason: string;
}

export interface QuestionValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  duplicateMatches: DuplicateMatchWarning[];
  normalizedDoc?: Omit<
    QuestionBankDocument,
    'id' | 'createdAt' | 'updatedAt' | 'createdBy'
  >;
}

export interface BulkImportRowReport {
  rowIndex: number;
  rawRecord: Record<string, unknown>;
  valid: boolean;
  canImportAsDraft: boolean;
  errors: string[];
  warnings: string[];
  duplicateMatches: DuplicateMatchWarning[];
  preparedDoc?: QuestionBankDocument;
}

export interface BulkImportValidationSummary {
  totalRecords: number;
  validReadyCount: number;
  warningReviewCount: number;
  rejectedCount: number;
  exactDuplicateCount: number;
  nearDuplicateWarningCount: number;
  invalidAnswerKeyCount: number;
  missingExplanationCount: number;
  missingTopicCount: number;
  rows: BulkImportRowReport[];
}

export interface SubjectBankStats {
  subjectId: string;
  label: string;
  hex: string;
  total: number;
  published: number;
  draft: number;
  archived: number;
  easy: number;
  medium: number;
  hard: number;
  targetCount: number;
  remainingToTarget: number;
  topics: Record<string, number>;
}

export interface QuestionBankOverviewStats {
  totalQuestions: number;
  publishedQuestions: number;
  draftQuestions: number;
  archivedQuestions: number;
  targetTotalQuestions: number;
  remainingTotalToTarget: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
    easyPct: number;
    mediumPct: number;
    hardPct: number;
  };
  bySubject: Record<string, SubjectBankStats>;
}

export interface QuestionQueryFilter {
  subjectId?: string;
  topic?: string;
  difficulty?: QuestionDifficulty | 'all';
  status?: QuestionStatus | 'all';
  searchQuery?: string;
  sortOrder?: 'newest' | 'oldest';
  page?: number;
  pageSize?: number;
}

export interface PaginatedQuestionsResult {
  items: QuestionBankDocument[];
  totalMatching: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export const TARGET_QUESTIONS_PER_SUBJECT = 1000;
export const TARGET_TOTAL_QUESTIONS = 9000;

export const SUBJECT_TOPIC_TAXONOMY: Record<
  string,
  { topic: string; subtopics: string[] }[]
> = {
  python: [
    {
      topic: 'Variables and data types',
      subtopics: ['Dynamic typing & mutability', 'Numeric types & booleans', 'Type conversion & casting'],
    },
    {
      topic: 'Operators',
      subtopics: ['Arithmetic & floor division', 'Bitwise & shift operators', 'Identity (is) vs equality (==)'],
    },
    {
      topic: 'Conditional statements',
      subtopics: ['if-elif-else control flow', 'Truthiness & short-circuiting', 'Ternary & pattern matching'],
    },
    {
      topic: 'Loops',
      subtopics: ['for & range() iteration', 'while loops & break/continue', 'for-else & comprehensions'],
    },
    {
      topic: 'Functions',
      subtopics: ['Function arguments (*args, **kwargs)', 'Mutable default arguments', 'Lambda, closures & decorators'],
    },
    {
      topic: 'Lists, tuples and dictionaries',
      subtopics: ['List slicing & methods', 'Tuple unpacking & immutability', 'Dictionary hashing & sets'],
    },
    {
      topic: 'Strings',
      subtopics: ['String slicing & formatting', 'String methods & immutability', 'Encoding & f-strings'],
    },
    {
      topic: 'OOP',
      subtopics: ['Classes, __init__ & self', 'Inheritance & MRO', 'Dunder methods & properties'],
    },
    {
      topic: 'Exception handling',
      subtopics: ['try-except-else-finally', 'Built-in exception hierarchy', 'Raising custom exceptions'],
    },
    {
      topic: 'File handling',
      subtopics: ['Context managers (with)', 'File modes & buffering', 'Pathlib & JSON/CSV I/O'],
    },
    {
      topic: 'Modules and libraries',
      subtopics: ['Import system & namespaces', 'itertools & functools', 'collections & standard library'],
    },
  ],
  java: [
    {
      topic: 'Fundamentals',
      subtopics: ['JVM architecture & bytecode', 'Classloader & memory areas', 'main() signature & packages'],
    },
    {
      topic: 'Data types',
      subtopics: ['Primitive types & ranges', 'Autoboxing & Integer cache', 'Type promotion & casting'],
    },
    {
      topic: 'Operators',
      subtopics: ['Bitwise & unsigned shift (>>>)', 'Logical vs bitwise operators', 'Operator precedence'],
    },
    {
      topic: 'Control statements',
      subtopics: ['Switch expressions & loops', 'Labeled break & continue', 'Enhanced for-each loop'],
    },
    {
      topic: 'Arrays and strings',
      subtopics: ['String Constant Pool & intern()', 'StringBuilder vs String', 'Multidimensional arrays'],
    },
    {
      topic: 'OOP',
      subtopics: ['Classes, objects & constructors', 'this & final keywords', 'Static blocks & nested classes'],
    },
    {
      topic: 'Inheritance',
      subtopics: ['extends & super() chaining', 'Object class contract (equals/hashCode)', 'Final classes & methods'],
    },
    {
      topic: 'Polymorphism',
      subtopics: ['Method overloading vs overriding', 'Dynamic method dispatch', 'Covariant return types'],
    },
    {
      topic: 'Interfaces',
      subtopics: ['Default & static methods', 'Functional interfaces & lambdas', 'Abstract classes vs interfaces'],
    },
    {
      topic: 'Collections',
      subtopics: ['List, Set & Map implementations', 'HashMap hashing & treeification', 'Comparable vs Comparator'],
    },
    {
      topic: 'Exception handling',
      subtopics: ['Checked vs unchecked exceptions', 'try-with-resources & AutoCloseable', 'Finally block semantics'],
    },
    {
      topic: 'Multithreading',
      subtopics: ['Thread lifecycle & Runnable', 'synchronized & volatile memory model', 'Executors & concurrent collections'],
    },
  ],
  c: [
    {
      topic: 'Fundamentals',
      subtopics: ['Preprocessor, compilation & linking', 'Header files & macros', 'Storage classes (auto, static, extern)'],
    },
    {
      topic: 'Data types',
      subtopics: ['Integer widths & signed/unsigned', 'sizeof operator & promotions', 'enum & typedef'],
    },
    {
      topic: 'Operators',
      subtopics: ['Bitwise manipulation', 'Short-circuit & comma operator', 'Sequence points & evaluation'],
    },
    {
      topic: 'Control statements',
      subtopics: ['switch-case fallthrough', 'Loops (for, while, do-while)', 'goto & early return'],
    },
    {
      topic: 'Functions',
      subtopics: ['Pass-by-value & pointer parameters', 'Recursion & stack frames', 'Function pointers'],
    },
    {
      topic: 'Arrays',
      subtopics: ['1D & 2D row-major layout', 'Array decay to pointer', 'Boundary & indexing math'],
    },
    {
      topic: 'Strings',
      subtopics: ['Null-terminated char arrays', 'String literals vs writable arrays', 'string.h functions (strlen, strcmp)'],
    },
    {
      topic: 'Pointers',
      subtopics: ['Pointer arithmetic & scaling', 'const pointers vs pointer to const', 'Void, null & dangling pointers'],
    },
    {
      topic: 'Structures and unions',
      subtopics: ['Struct alignment & padding', 'Union shared memory layout', 'Bit-fields & arrow (->) operator'],
    },
    {
      topic: 'Dynamic memory allocation',
      subtopics: ['malloc, calloc & realloc', 'free() & memory leaks', 'Heap vs stack lifetime'],
    },
    {
      topic: 'File handling',
      subtopics: ['FILE streams (fopen, fclose)', 'fseek, ftell & rewind', 'Formatted vs binary I/O'],
    },
  ],
  cpp: [
    {
      topic: 'Fundamentals',
      subtopics: ['Namespaces & I/O streams', 'References (lvalue & rvalue)', 'auto, constexpr & nullptr'],
    },
    {
      topic: 'Classes and objects',
      subtopics: ['Member functions & const correctness', 'this pointer & friend declarations', 'Static class members'],
    },
    {
      topic: 'Constructors and destructors',
      subtopics: ['Initializer lists & delegating ctors', 'Copy & move constructors (Rule of 5)', 'Virtual destructors & RAII'],
    },
    {
      topic: 'Inheritance',
      subtopics: ['Public, protected & private inheritance', 'Multiple & virtual inheritance', 'Object slicing'],
    },
    {
      topic: 'Polymorphism',
      subtopics: ['Virtual functions & vtable dispatch', 'Pure virtual functions & abstract classes', 'override, final & dynamic_cast'],
    },
    {
      topic: 'Encapsulation',
      subtopics: ['Access specifiers', 'Getters/setters & invariants', 'Pimpl & data hiding'],
    },
    {
      topic: 'Templates',
      subtopics: ['Function & class templates', 'Template specialization', 'Variadic templates & constexpr'],
    },
    {
      topic: 'STL',
      subtopics: ['std::vector, map & unordered_map', 'Iterators & invalidation rules', 'Algorithms (<algorithm>) & lambdas'],
    },
    {
      topic: 'Pointers',
      subtopics: ['std::unique_ptr & std::shared_ptr', 'std::weak_ptr & cycle prevention', 'Raw pointers vs smart pointers'],
    },
    {
      topic: 'Exception handling',
      subtopics: ['try, catch & throw by value/ref', 'Stack unwinding & RAII cleanup', 'noexcept specification'],
    },
  ],
  html: [
    {
      topic: 'HTML structure',
      subtopics: ['DOCTYPE & document metadata', 'DOM tree & nesting rules', 'Block vs inline elements'],
    },
    {
      topic: 'Semantic HTML',
      subtopics: ['Landmark elements (<main>, <nav>, <article>)', 'ARIA attributes & accessibility', 'Heading hierarchy & SEO'],
    },
    {
      topic: 'Forms',
      subtopics: ['Input types & validation attributes', 'Labels, fieldsets & accessibility', 'Form submission (GET vs POST)'],
    },
    {
      topic: 'Tables',
      subtopics: ['thead, tbody, tfoot & scope', 'colspan & rowspan', 'Accessible table captions'],
    },
    {
      topic: 'Media elements',
      subtopics: ['<audio>, <video> & <source>', 'Responsive images (<picture>, srcset)', '<canvas> & inline SVG'],
    },
    {
      topic: 'CSS selectors',
      subtopics: ['Specificity tuple calculation', 'Combinators (>, +, ~)', 'Pseudo-classes & pseudo-elements'],
    },
    {
      topic: 'Box model',
      subtopics: ['content-box vs border-box math', 'Margin collapsing rules', 'Overflow & display modes'],
    },
    {
      topic: 'Flexbox',
      subtopics: ['Main axis vs cross axis alignment', 'flex-grow, flex-shrink & flex-basis', 'Wrapping & gap spacing'],
    },
    {
      topic: 'Grid',
      subtopics: ['grid-template-columns & fr units', 'repeat(), minmax() & auto-fit/auto-fill', 'Grid areas & explicit placement'],
    },
    {
      topic: 'Positioning',
      subtopics: ['static, relative, absolute, fixed & sticky', 'Containing blocks', 'Stacking contexts & z-index'],
    },
    {
      topic: 'Responsive design',
      subtopics: ['Media queries & breakpoints', 'Viewport units (vw, vh, dvh) & rem/em', 'Fluid typography (clamp)'],
    },
    {
      topic: 'Animations',
      subtopics: ['CSS transitions & timing functions', '@keyframes animations', 'Compositor transforms & opacity'],
    },
  ],
  crt: [
    {
      topic: 'Quantitative aptitude',
      subtopics: ['Simplification & algebraic identities', 'Simple & compound interest', 'Mixtures & alligations'],
    },
    {
      topic: 'Percentages',
      subtopics: ['Successive percentage change', 'Population & depreciation formulas', 'Election & examination problems'],
    },
    {
      topic: 'Profit and loss',
      subtopics: ['Cost price, selling price & profit %', 'Marked price & successive discounts', 'False weights & dishonest dealings'],
    },
    {
      topic: 'Ratio and proportion',
      subtopics: ['Compound ratios & partnerships', 'Direct & inverse proportion', 'Ages & mixture replacement'],
    },
    {
      topic: 'Time and work',
      subtopics: ['Combined work efficiency', 'Pipes & cisterns', 'Alternate day & man-days (M1D1H1)'],
    },
    {
      topic: 'Time, speed and distance',
      subtopics: ['Average speed & relative speed', 'Trains & platform crossing', 'Boats & streams'],
    },
    {
      topic: 'Number systems',
      subtopics: ['Divisibility rules & remainders', 'HCF & LCM applications', 'Unit digit & factors'],
    },
    {
      topic: 'Averages',
      subtopics: ['Weighted averages', 'Inclusion & exclusion of members', 'Consecutive numbers'],
    },
    {
      topic: 'Probability',
      subtopics: ['Coins, dice & playing cards', 'Independent & mutually exclusive events', 'Conditional probability & balls in urn'],
    },
    {
      topic: 'Permutations and combinations',
      subtopics: ['Word arrangements & vowel constraints', 'Circular permutations', 'Committee selection (nCr)'],
    },
    {
      topic: 'Logical reasoning',
      subtopics: ['Number & letter series', 'Syllogisms & blood relations', 'Coding-decoding & direction sense'],
    },
    {
      topic: 'Verbal reasoning',
      subtopics: ['Synonyms, antonyms & analogies', 'Sentence correction & idioms', 'Critical reasoning & inference'],
    },
  ],
  gk: [
    {
      topic: 'Indian history',
      subtopics: ['Ancient & Medieval India', 'Indian National Movement', 'Post-independence milestones'],
    },
    {
      topic: 'Indian geography',
      subtopics: ['Rivers, mountains & passes', 'Climate, soils & national parks', 'Minerals & agriculture'],
    },
    {
      topic: 'Indian polity',
      subtopics: ['Fundamental Rights & Duties', 'Parliament, President & Judiciary', 'Constitutional Amendments & Schedules'],
    },
    {
      topic: 'Economics',
      subtopics: ['RBI, Monetary Policy & Banking', 'GDP, Inflation & Fiscal Policy', 'International Trade & Economic Surveys'],
    },
    {
      topic: 'General science',
      subtopics: ['Physics & everyday phenomena', 'Chemistry, elements & compounds', 'Human biology, vitamins & diseases'],
    },
    {
      topic: 'Static GK',
      subtopics: ['World capitals & currencies', 'Books, authors & classical dances', 'Firsts in India & the World'],
    },
    {
      topic: 'Important institutions',
      subtopics: ['UN agencies & headquarters', 'ISRO, DRDO & Indian research bodies', 'Multilateral groupings (G20, BRICS, ASEAN)'],
    },
    {
      topic: 'Awards and honours',
      subtopics: ['Nobel Prizes & Fields Medal', 'Bharat Ratna & Padma Awards', 'Literary, film & gallantry awards'],
    },
    {
      topic: 'Sports',
      subtopics: ['Olympic Games & Asian Games', 'Cricket, Football & Tennis Grand Slams', 'Sports trophies & terminology'],
    },
    {
      topic: 'Current affairs',
      subtopics: ['Space & Science Milestones', 'International Summits & Institutions', 'Verified National & Global Events'],
    },
  ],
  neet: [
    {
      topic: 'Physics',
      subtopics: [
        'Mechanics, Work, Energy & Power',
        'Thermodynamics & Kinetic Theory',
        'Electrostatics & Current Electricity',
        'Magnetism, Optics & Modern Physics',
      ],
    },
    {
      topic: 'Chemistry',
      subtopics: [
        'Physical Chemistry (Equilibrium, Kinetics, Electrochemistry)',
        'Inorganic Chemistry (Chemical Bonding, Coordination Compounds)',
        'Organic Chemistry (GOC, Hydrocarbons, Biomolecules)',
      ],
    },
    {
      topic: 'Botany',
      subtopics: [
        'Cell Biology & Cell Cycle',
        'Plant Physiology (Photosynthesis, Respiration, Transport)',
        'Plant Kingdom, Morphology & Ecology',
      ],
    },
    {
      topic: 'Zoology',
      subtopics: [
        'Human Physiology (Digestion, Circulation, Excretion, Neural)',
        'Genetics, Molecular Biology & Evolution',
        'Biotechnology, Reproduction & Human Health',
      ],
    },
  ],
  jee: [
    {
      topic: 'Physics',
      subtopics: [
        'Kinematics, Newton Laws & Rotational Mechanics',
        'Gravitation, SHM, Waves & Thermodynamics',
        'Electrostatics, Current, Magnetism & EMI',
        'Optics, Dual Nature, Atoms & Semiconductors',
      ],
    },
    {
      topic: 'Chemistry',
      subtopics: [
        'Physical Chemistry (Mole Concept, Thermodynamics, Kinetics, Electrochemistry)',
        'Inorganic Chemistry (Periodic Table, Bonding, d-Block, Coordination)',
        'Organic Chemistry (Reaction Mechanisms, Carbonyls, Amines)',
      ],
    },
    {
      topic: 'Mathematics',
      subtopics: [
        'Algebra (Complex Numbers, Matrices, Quadratic, Permutations, Binomial)',
        'Calculus (Limits, Continuity, Derivatives, Definite & Indefinite Integrals, Differential Equations)',
        'Coordinate Geometry, Vectors, 3D & Probability',
      ],
    },
  ],
};

/**
 * Deterministic 32-bit FNV-1a hash converted to base36 for stable question IDs.
 */
export function hashStringDeterministic(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 ^= ch + (i & 0xff);
    h2 = Math.imul(h2, 0x85ebca6b) >>> 0;
  }
  return `${h1.toString(36)}${h2.toString(36)}`;
}

/**
 * Infers structured curriculum topic and subtopic for existing static curated questions
 * while preserving explicit `cat` / `topic` metadata when present.
 */
export function inferTopicAndSubtopic(
  subjectId: string,
  q: { text: string; cat?: string; topic?: string; subtopic?: string }
): { topic: string; subtopic: string } {
  const taxonomy = SUBJECT_TOPIC_TAXONOMY[subjectId] || SUBJECT_TOPIC_TAXONOMY.python;
  const textLower = String(q.text || '').toLowerCase();

  if (q.topic && q.topic.trim()) {
    const matched = taxonomy.find(
      (t) => t.topic.toLowerCase() === q.topic!.trim().toLowerCase()
    );
    return {
      topic: matched ? matched.topic : q.topic.trim(),
      subtopic:
        q.subtopic && q.subtopic.trim()
          ? q.subtopic.trim()
          : matched?.subtopics[0] || 'Core Concepts',
    };
  }

  if (subjectId === 'gk' && q.cat) {
    const catLower = q.cat.toLowerCase();
    if (catLower.includes('history')) {
      return { topic: 'Indian history', subtopic: q.cat };
    }
    if (catLower.includes('geography')) {
      return { topic: 'Indian geography', subtopic: q.cat };
    }
    if (catLower.includes('polity') || catLower.includes('constitution')) {
      return { topic: 'Indian polity', subtopic: q.cat };
    }
    if (catLower.includes('economy') || catLower.includes('economics')) {
      return { topic: 'Economics', subtopic: q.cat };
    }
    if (
      catLower.includes('science') ||
      catLower.includes('space') ||
      catLower.includes('computer') ||
      catLower.includes('environment')
    ) {
      return { topic: 'General science', subtopic: q.cat };
    }
    if (catLower.includes('sport')) {
      return { topic: 'Sports', subtopic: q.cat };
    }
    if (catLower.includes('award') || catLower.includes('book') || catLower.includes('art')) {
      return { topic: 'Awards and honours', subtopic: q.cat };
    }
    if (catLower.includes('organization') || catLower.includes('world')) {
      return { topic: 'Important institutions', subtopic: q.cat };
    }
    return { topic: q.cat, subtopic: 'Core General Knowledge' };
  }

  if (subjectId === 'python') {
    if (/class |self|__init__|inherit|mro|super\(/.test(textLower))
      return { topic: 'OOP', subtopic: 'Classes, __init__ & self' };
    if (/try|except|finally|raise|error|exception/.test(textLower))
      return { topic: 'Exception handling', subtopic: 'try-except-else-finally' };
    if (/open\(|file|read\(|write\(|with /.test(textLower))
      return { topic: 'File handling', subtopic: 'Context managers (with)' };
    if (/import |from |module|math\.|itertools|collections/.test(textLower))
      return { topic: 'Modules and libraries', subtopic: 'Import system & namespaces' };
    if (/def |lambda |return |\*args|\*\*kwargs|yield|generator|decorator/.test(textLower))
      return { topic: 'Functions', subtopic: 'Function arguments (*args, **kwargs)' };
    if (/for |while |range\(|break|continue|comprehension/.test(textLower))
      return { topic: 'Loops', subtopic: 'for & range() iteration' };
    if (/if |elif |else /.test(textLower))
      return { topic: 'Conditional statements', subtopic: 'if-elif-else control flow' };
    if (/dict|tuple|set\(|list|append|pop\(|slice|\[\d*:\d*\]/.test(textLower))
      return { topic: 'Lists, tuples and dictionaries', subtopic: 'List slicing & methods' };
    if (/str|upper\(|lower\(|split\(|join\(|strip\(/.test(textLower))
      return { topic: 'Strings', subtopic: 'String slicing & formatting' };
    if (/\/\/|\*\*|%|<<|>>|and |or |not | is |==/.test(textLower))
      return { topic: 'Operators', subtopic: 'Arithmetic & floor division' };
    return { topic: 'Variables and data types', subtopic: 'Dynamic typing & mutability' };
  }

  if (subjectId === 'java') {
    if (/thread|runnable|synchronized|volatile|concurrent/.test(textLower))
      return { topic: 'Multithreading', subtopic: 'Thread lifecycle & Runnable' };
    if (/exception|try|catch|finally|throw|autocloseable/.test(textLower))
      return { topic: 'Exception handling', subtopic: 'Checked vs unchecked exceptions' };
    if (/list|map|set|hashmap|arraylist|collection|iterator/.test(textLower))
      return { topic: 'Collections', subtopic: 'List, Set & Map implementations' };
    if (/interface |default |functional/.test(textLower))
      return { topic: 'Interfaces', subtopic: 'Default & static methods' };
    if (/override|overload|polymorph|dynamic/.test(textLower))
      return { topic: 'Polymorphism', subtopic: 'Method overloading vs overriding' };
    if (/extends |super|inherit/.test(textLower))
      return { topic: 'Inheritance', subtopic: 'extends & super() chaining' };
    if (/string|array|stringbuilder|intern/.test(textLower))
      return { topic: 'Arrays and strings', subtopic: 'String Constant Pool & intern()' };
    if (/switch|for|while|break|continue/.test(textLower))
      return { topic: 'Control statements', subtopic: 'Switch expressions & loops' };
    if (/>>>|>>|<<|operator|instanceof/.test(textLower))
      return { topic: 'Operators', subtopic: 'Bitwise & unsigned shift (>>>)' };
    if (/int|byte|short|long|float|double|boolean|char|integer/.test(textLower))
      return { topic: 'Data types', subtopic: 'Primitive types & ranges' };
    if (/class |object|constructor|static|final/.test(textLower))
      return { topic: 'OOP', subtopic: 'Classes, objects & constructors' };
    return { topic: 'Fundamentals', subtopic: 'JVM architecture & bytecode' };
  }

  if (subjectId === 'c') {
    if (/fopen|fclose|fseek|ftell|fprintf|fscanf|file|eof/.test(textLower))
      return { topic: 'File handling', subtopic: 'FILE streams (fopen, fclose)' };
    if (/malloc|calloc|realloc|free\(|heap/.test(textLower))
      return { topic: 'Dynamic memory allocation', subtopic: 'malloc, calloc & realloc' };
    if (/struct |union |bit-field|->/.test(textLower))
      return { topic: 'Structures and unions', subtopic: 'Struct alignment & padding' };
    if (/pointer|\*p|address|&|dereference|null/.test(textLower))
      return { topic: 'Pointers', subtopic: 'Pointer arithmetic & scaling' };
    if (/strlen|strcpy|strcmp|strcat|string|char\s*\*|\\0/.test(textLower))
      return { topic: 'Strings', subtopic: 'Null-terminated char arrays' };
    if (/array|\[\d+\]/.test(textLower))
      return { topic: 'Arrays', subtopic: '1D & 2D row-major layout' };
    if (/function|recursion|return|prototype/.test(textLower))
      return { topic: 'Functions', subtopic: 'Pass-by-value & pointer parameters' };
    if (/switch|for|while|do |goto|break/.test(textLower))
      return { topic: 'Control statements', subtopic: 'switch-case fallthrough' };
    if (/<<|>>|&|\||\^|~|\+\+|--/.test(textLower))
      return { topic: 'Operators', subtopic: 'Bitwise manipulation' };
    if (/sizeof|int|char|float|double|enum|typedef/.test(textLower))
      return { topic: 'Data types', subtopic: 'Integer widths & signed/unsigned' };
    return { topic: 'Fundamentals', subtopic: 'Preprocessor, compilation & linking' };
  }

  if (subjectId === 'cpp') {
    if (/try|catch|throw|noexcept|exception/.test(textLower))
      return { topic: 'Exception handling', subtopic: 'try, catch & throw by value/ref' };
    if (/unique_ptr|shared_ptr|weak_ptr|pointer/.test(textLower))
      return { topic: 'Pointers', subtopic: 'std::unique_ptr & std::shared_ptr' };
    if (/vector|map|set|iterator|stl|algorithm|sort/.test(textLower))
      return { topic: 'STL', subtopic: 'std::vector, map & unordered_map' };
    if (/template|typename|constexpr/.test(textLower))
      return { topic: 'Templates', subtopic: 'Function & class templates' };
    if (/virtual|vtable|override|abstract|dynamic_cast|polymorph/.test(textLower))
      return { topic: 'Polymorphism', subtopic: 'Virtual functions & vtable dispatch' };
    if (/inherit|derived|base class|diamond/.test(textLower))
      return { topic: 'Inheritance', subtopic: 'Public, protected & private inheritance' };
    if (/constructor|destructor|raii|copy|move/.test(textLower))
      return { topic: 'Constructors and destructors', subtopic: 'Virtual destructors & RAII' };
    if (/private|protected|public|encapsul/.test(textLower))
      return { topic: 'Encapsulation', subtopic: 'Access specifiers' };
    if (/class |object|friend|this|const/.test(textLower))
      return { topic: 'Classes and objects', subtopic: 'Member functions & const correctness' };
    return { topic: 'Fundamentals', subtopic: 'Namespaces & I/O streams' };
  }

  if (subjectId === 'html') {
    if (/animation|keyframe|transition/.test(textLower))
      return { topic: 'Animations', subtopic: 'CSS transitions & timing functions' };
    if (/media|viewport|rem|em|vw|vh|responsive/.test(textLower))
      return { topic: 'Responsive design', subtopic: 'Media queries & breakpoints' };
    if (/position|absolute|relative|fixed|sticky|z-index/.test(textLower))
      return { topic: 'Positioning', subtopic: 'Stacking contexts & z-index' };
    if (/grid|fr\b|minmax|auto-fit/.test(textLower))
      return { topic: 'Grid', subtopic: 'grid-template-columns & fr units' };
    if (/flex|justify-content|align-items/.test(textLower))
      return { topic: 'Flexbox', subtopic: 'Main axis vs cross axis alignment' };
    if (/box-sizing|padding|margin|border/.test(textLower))
      return { topic: 'Box model', subtopic: 'content-box vs border-box math' };
    if (/selector|specificity|pseudo|:hover|::/.test(textLower))
      return { topic: 'CSS selectors', subtopic: 'Specificity tuple calculation' };
    if (/audio|video|canvas|svg|img|picture/.test(textLower))
      return { topic: 'Media elements', subtopic: '<audio>, <video> & <source>' };
    if (/table|tr|td|th|colspan|rowspan/.test(textLower))
      return { topic: 'Tables', subtopic: 'thead, tbody, tfoot & scope' };
    if (/form|input|label|select|textarea/.test(textLower))
      return { topic: 'Forms', subtopic: 'Input types & validation attributes' };
    if (/semantic|main|article|section|nav|header|footer|aria/.test(textLower))
      return { topic: 'Semantic HTML', subtopic: 'Landmark elements (<main>, <nav>, <article>)' };
    return { topic: 'HTML structure', subtopic: 'DOCTYPE & document metadata' };
  }

  if (subjectId === 'crt') {
    if (/percent|%/.test(textLower) && /profit|loss|cost price|selling price|discount|marked/.test(textLower))
      return { topic: 'Profit and loss', subtopic: 'Cost price, selling price & profit %' };
    if (/percent|%/.test(textLower))
      return { topic: 'Percentages', subtopic: 'Successive percentage change' };
    if (/ratio|proportion|partner|mixture|liter/.test(textLower))
      return { topic: 'Ratio and proportion', subtopic: 'Compound ratios & partnerships' };
    if (/work|days|pipe|cistern|complete a job/.test(textLower))
      return { topic: 'Time and work', subtopic: 'Combined work efficiency' };
    if (/train|speed|km\/h|m\/s|boat|stream|distance/.test(textLower))
      return { topic: 'Time, speed and distance', subtopic: 'Average speed & relative speed' };
    if (/probability|dice|coin|card|random|bag/.test(textLower))
      return { topic: 'Probability', subtopic: 'Coins, dice & playing cards' };
    if (/arrange|permutation|combination|ways|committee|letters/.test(textLower))
      return { topic: 'Permutations and combinations', subtopic: 'Word arrangements & vowel constraints' };
    if (/average|mean/.test(textLower))
      return { topic: 'Averages', subtopic: 'Weighted averages' };
    if (/lcm|hcf|gcd|divisible|remainder|prime|number/.test(textLower))
      return { topic: 'Number systems', subtopic: 'HCF & LCM applications' };
    if (/series|coded|blood|direction|syllogism|odd one/.test(textLower))
      return { topic: 'Logical reasoning', subtopic: 'Number & letter series' };
    if (/synonym|antonym|idiom|sentence|verbal/.test(textLower))
      return { topic: 'Verbal reasoning', subtopic: 'Synonyms, antonyms & analogies' };
    return { topic: 'Quantitative aptitude', subtopic: 'Simple & compound interest' };
  }

  if (subjectId === 'neet') {
    if (/velocity|acceleration|force|ohm|resistor|current|capacitor|lens|mirror|wavelength|photon|magnetic|frequency/.test(textLower))
      return { topic: 'Physics', subtopic: 'Mechanics, Electricity & Modern Physics' };
    if (/mole|ph\b|orbital|hybridization|oxidation|bond|enthalpy|acid|alkane|benzene|iupac|periodic|electro/.test(textLower))
      return { topic: 'Chemistry', subtopic: 'Physical, Inorganic & Organic Chemistry' };
    if (/photosynthesis|xylem|phloem|plant|chloroplast|stomata|auxin|root|flower|calvin|c4|krebs|cell wall/.test(textLower))
      return { topic: 'Botany', subtopic: 'Plant Physiology & Cell Biology' };
    return { topic: 'Zoology', subtopic: 'Human Physiology, Genetics & Biotechnology' };
  }

  if (subjectId === 'jee') {
    if (/integral|derivative|limit|matrix|determinant|complex|vector|probability|quadratic|binomial|tangent|differential|sin|cos/.test(textLower))
      return { topic: 'Mathematics', subtopic: 'Calculus, Algebra & Coordinate Geometry' };
    if (/mole|ph\b|orbital|hybridization|oxidation|bond|enthalpy|kinetics|first-order|faraday|electro|alkane|iupac/.test(textLower))
      return { topic: 'Chemistry', subtopic: 'Physical, Inorganic & Organic Chemistry' };
    return { topic: 'Physics', subtopic: 'Mechanics, Electromagnetism & Modern Physics' };
  }

  return {
    topic: taxonomy[0]?.topic || 'General',
    subtopic: taxonomy[0]?.subtopics[0] || 'Core Concepts',
  };
}

/**
 * Assigns a deterministic difficulty distribution (approx 30% easy, 45% medium, 25% hard)
 * when a curated question does not already specify `difficulty`.
 */
export function inferQuestionDifficulty(
  q: { difficulty?: QuestionDifficulty; text: string },
  index: number
): QuestionDifficulty {
  if (
    q.difficulty === 'easy' ||
    q.difficulty === 'medium' ||
    q.difficulty === 'hard'
  ) {
    return q.difficulty;
  }
  const slot = index % 20;
  // 6/20 = 30% easy, 9/20 = 45% medium, 5/20 = 25% hard
  if (slot < 6) return 'easy';
  if (slot < 15) return 'medium';
  return 'hard';
}

/**
 * Computes the canonical question bank fingerprint required by Phase 3 & Phase 5:
 * Incorporates:
 * - subjectId
 * - topic
 * - type ('single_choice')
 * - normalized question stem
 * - normalized sorted answer options
 * - normalized correct answer text
 */
export function computeCanonicalQuestionBankFingerprint(input: {
  subjectId: string;
  topic: string;
  question: string;
  options: readonly string[];
  correctIndex: number;
  templateId?: string;
}): string {
  const subj = String(input.subjectId || 'general').trim().toLowerCase();
  const topic = String(input.topic || 'general').trim().toLowerCase();
  const qType = input.templateId
    ? `single_choice:${input.templateId}`
    : 'single_choice';
  const contentSig = computeQuestionContentSignature(
    {
      text: input.question,
      opts: Array.from(input.options),
      ans: input.correctIndex,
      cat: input.topic,
    },
    subj
  );
  return `${subj}::${topic}::${qType}::${contentSig}`;
}

export function generateDeterministicQuestionId(
  subjectId: string,
  questionText: string,
  options: readonly string[],
  correctIndex: number
): string {
  const contentSig = computeQuestionContentSignature(
    {
      text: questionText,
      opts: Array.from(options),
      ans: correctIndex,
    },
    subjectId
  );
  const hash = hashStringDeterministic(contentSig);
  return `q_${subjectId.toLowerCase()}_${hash}`;
}

/**
 * Converts a Firestore `QuestionBankDocument` to a runtime `Question` object
 * used by `questionEngine.ts`, `QuizView.tsx`, and `ResultView.tsx`.
 */
export function toRuntimeQuestion(doc: QuestionBankDocument): Question {
  return {
    id: doc.id,
    text: doc.question,
    opts: [...doc.options],
    ans: doc.correctIndex,
    cat: doc.topic,
    difficulty: doc.difficulty,
    exp: doc.explanation,
    isProcedural: false,
    source: doc.source,
  };
}

/**
 * Strips all punctuation to compare pure alphanumeric/operator token streams.
 */
function normalizeAlphanumericStream(text: string): string {
  return normalizeTextToken(text)
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOP_WORDS = new Set([
  'the',
  'is',
  'in',
  'of',
  'to',
  'and',
  'a',
  'an',
  'for',
  'on',
  'with',
  'by',
  'at',
  'from',
  'what',
  'which',
  'following',
  'does',
  'are',
  'be',
  'will',
  'when',
  'how',
  'that',
  'this',
]);

function stemTokenLight(tok: string): string {
  if (tok.length > 4 && tok.endsWith('ies')) return tok.slice(0, -3) + 'y';
  if (tok.length > 5 && tok.endsWith('ing')) return tok.slice(0, -3);
  if (tok.length > 4 && tok.endsWith('ed')) return tok.slice(0, -2);
  if (tok.length > 4 && tok.endsWith('es')) return tok.slice(0, -2);
  if (tok.length > 3 && tok.endsWith('s') && !tok.endsWith('ss')) return tok.slice(0, -1);
  return tok;
}

function extractSignificantTokens(text: string): string[] {
  return normalizeAlphanumericStream(text)
    .split(' ')
    .filter((tok) => tok.length >= 2 && !STOP_WORDS.has(tok))
    .map(stemTokenLight);
}

function computeTokenDiceSimilarity(tokensA: string[], tokensB: string[]): number {
  if (tokensA.length === 0 || tokensB.length === 0) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  let intersection = 0;
  for (const t of setA) {
    if (setB.has(t)) intersection++;
  }
  return (2 * intersection) / (setA.size + setB.size);
}

/**
 * Phase 5: 5-Level Duplicate & Similarity Detection Engine
 * Detects:
 * 1. Exact duplicates (`exact`)
 * 2. Same question with different punctuation (`punctuation`)
 * 3. Same question with reordered options (`reordered_options`)
 * 4. Questions with identical meaning and answer sets (`same_meaning_and_answers`)
 * 5. Near-duplicate questions (`near_duplicate` — returned as a non-blocking warning)
 */
export function analyzeQuestionDuplicates(
  candidate: {
    id?: string;
    subjectId: string;
    topic: string;
    question: string;
    options: readonly string[];
    correctIndex: number;
  },
  existingBank: readonly QuestionBankDocument[]
): DuplicateMatchWarning[] {
  const matches: DuplicateMatchWarning[] = [];

  const candSubj = candidate.subjectId.trim().toLowerCase();
  const candNormStem = normalizeQuestionSignature(candidate.question);
  const candAlphaStem = normalizeAlphanumericStream(candidate.question);
  const candTokens = extractSignificantTokens(candidate.question);
  const candRawOptsNorm = candidate.options.map((o) =>
    String(o || '').trim().toLowerCase().replace(/\s+/g, ' ')
  );
  const candSortedOptsNorm = [...candRawOptsNorm].sort().join('|');
  const candSortedOptsAlpha = candidate.options
    .map((o) => normalizeAlphanumericStream(String(o || '')))
    .sort()
    .join('|');
  const candCorrectTextNorm =
    candRawOptsNorm[candidate.correctIndex] ?? String(candidate.correctIndex);
  const candCorrectAlpha = normalizeAlphanumericStream(candCorrectTextNorm);

  for (const existing of existingBank) {
    if (candidate.id && existing.id === candidate.id) continue;
    if (existing.subjectId.toLowerCase() !== candSubj) continue;

    const exNormStem = normalizeQuestionSignature(existing.question);
    const exAlphaStem = normalizeAlphanumericStream(existing.question);
    const exRawOptsNorm = existing.options.map((o) =>
      String(o || '').trim().toLowerCase().replace(/\s+/g, ' ')
    );
    const exSortedOptsNorm = [...exRawOptsNorm].sort().join('|');
    const exSortedOptsAlpha = existing.options
      .map((o) => normalizeAlphanumericStream(String(o || '')))
      .sort()
      .join('|');
    const exCorrectTextNorm =
      exRawOptsNorm[existing.correctIndex] ?? String(existing.correctIndex);
    const exCorrectAlpha = normalizeAlphanumericStream(exCorrectTextNorm);

    // 1. Exact match (same stem, same option order, same correct index)
    if (
      candNormStem === exNormStem &&
      candRawOptsNorm.join('|') === exRawOptsNorm.join('|') &&
      candidate.correctIndex === existing.correctIndex
    ) {
      matches.push({
        existingQuestionId: existing.id,
        existingQuestionText: existing.question,
        existingStatus: existing.status,
        matchType: 'exact',
        similarityScore: 1.0,
        blocking: true,
        reason: 'Exact duplicate: identical question stem, options, and answer key.',
      });
      continue;
    }

    // 2. Reordered options match (same stem, same sorted options & same correct answer text, different option order)
    if (
      candNormStem === exNormStem &&
      candSortedOptsNorm === exSortedOptsNorm &&
      candCorrectTextNorm === exCorrectTextNorm
    ) {
      matches.push({
        existingQuestionId: existing.id,
        existingQuestionText: existing.question,
        existingStatus: existing.status,
        matchType: 'reordered_options',
        similarityScore: 0.99,
        blocking: true,
        reason:
          'Duplicate with reordered options: identical question stem and option set with permuted option indices.',
      });
      continue;
    }

    // 3. Punctuation / formatting duplicate (identical alphanumeric token stream for stem or stem+options)
    if (
      candAlphaStem.length >= 10 &&
      candAlphaStem === exAlphaStem &&
      (candSortedOptsAlpha === exSortedOptsAlpha ||
        candCorrectAlpha === exCorrectAlpha)
    ) {
      matches.push({
        existingQuestionId: existing.id,
        existingQuestionText: existing.question,
        existingStatus: existing.status,
        matchType: 'punctuation',
        similarityScore: 0.97,
        blocking: true,
        reason:
          'Punctuation/formatting duplicate: identical question text and answer after normalizing punctuation and whitespace.',
      });
      continue;
    }

    // Compute token similarity for meaning & near-duplicate checks
    const exTokens = extractSignificantTokens(existing.question);
    const sim = computeTokenDiceSimilarity(candTokens, exTokens);

    // 4. Same meaning and identical answer set
    if (
      sim >= 0.65 &&
      candSortedOptsAlpha === exSortedOptsAlpha &&
      candCorrectAlpha === exCorrectAlpha
    ) {
      matches.push({
        existingQuestionId: existing.id,
        existingQuestionText: existing.question,
        existingStatus: existing.status,
        matchType: 'same_meaning_and_answers',
        similarityScore: Number(sim.toFixed(2)),
        blocking: false, // surfaced as high-priority review warning
        reason: `Identical answer set and high semantic overlap (${Math.round(sim * 100)}% similarity) with existing question.`,
      });
      continue;
    }

    // 5. Near-duplicate stem warning
    if (sim >= 0.78 || (candAlphaStem === exAlphaStem && candAlphaStem.length >= 8)) {
      matches.push({
        existingQuestionId: existing.id,
        existingQuestionText: existing.question,
        existingStatus: existing.status,
        matchType: 'near_duplicate',
        similarityScore: Number(Math.max(sim, 0.78).toFixed(2)),
        blocking: false,
        reason: `Near-duplicate warning (${Math.round(Math.max(sim, 0.78) * 100)}% stem similarity) — review to ensure this is a genuinely distinct question.`,
      });
    }
  }

  matches.sort((a, b) => b.similarityScore - a.similarityScore);
  return matches.slice(0, 5);
}

const ARTIFICIAL_SUFFIX_PATTERNS = [
  /\(\s*#\d+-\d+\s*\)\s*$/,
  /#\d{3,6}\b/,
  /\[\s*variant\s*#?\d+\s*\]/i,
  /\(\s*copy\s*\d*\s*\)\s*$/i,
  /\(\s*duplicate\s*\d*\s*\)\s*$/i,
];

/**
 * Validates all fields of a candidate question record before saving or importing.
 */
export function validateQuestionInput(
  raw: {
    id?: string;
    subjectId?: unknown;
    topic?: unknown;
    subtopic?: unknown;
    difficulty?: unknown;
    question?: unknown;
    options?: unknown;
    correctIndex?: unknown;
    explanation?: unknown;
    status?: unknown;
    source?: unknown;
    eventDate?: unknown;
    verifiedSource?: unknown;
  },
  existingBank: readonly QuestionBankDocument[] = []
): QuestionValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const subjectId =
    typeof raw.subjectId === 'string' ? raw.subjectId.trim().toLowerCase() : '';
  if (!(VALID_SUBJECT_IDS as readonly string[]).includes(subjectId)) {
    errors.push(
      `Invalid subjectId "${String(raw.subjectId ?? '')}". Must be one of: ${VALID_SUBJECT_IDS.join(', ')}.`
    );
  }

  const topic = typeof raw.topic === 'string' ? raw.topic.trim() : '';
  if (!topic) {
    errors.push('Topic is required and cannot be empty.');
  } else if (topic.length > 80) {
    errors.push('Topic must be 80 characters or fewer.');
  }

  const subtopic =
    typeof raw.subtopic === 'string' && raw.subtopic.trim()
      ? raw.subtopic.trim()
      : topic
        ? 'Core Concepts'
        : '';
  if (!subtopic) {
    errors.push('Subtopic is required.');
  } else if (subtopic.length > 100) {
    errors.push('Subtopic must be 100 characters or fewer.');
  }

  const difficultyRaw =
    typeof raw.difficulty === 'string'
      ? raw.difficulty.trim().toLowerCase()
      : '';
  const difficulty: QuestionDifficulty =
    difficultyRaw === 'easy' ||
    difficultyRaw === 'medium' ||
    difficultyRaw === 'hard'
      ? difficultyRaw
      : ('medium' as QuestionDifficulty);
  if (
    difficultyRaw !== 'easy' &&
    difficultyRaw !== 'medium' &&
    difficultyRaw !== 'hard'
  ) {
    errors.push('Difficulty must be "easy", "medium", or "hard".');
  }

  const question = typeof raw.question === 'string' ? raw.question.trim() : '';
  if (question.length < 8) {
    errors.push('Question text must be at least 8 characters long.');
  } else if (question.length > 2000) {
    errors.push('Question text must be 2,000 characters or fewer.');
  } else {
    for (const pat of ARTIFICIAL_SUFFIX_PATTERNS) {
      if (pat.test(question)) {
        errors.push(
          'Question text contains an artificial uniqueness suffix (#123-456 or [Variant]), which is strictly forbidden.'
        );
        break;
      }
    }
  }

  const rawOptions = Array.isArray(raw.options) ? raw.options : [];
  if (rawOptions.length !== 4) {
    errors.push('Exactly four answer options (A, B, C, D) are required.');
  }
  const cleanOptions: string[] = [];
  const seenOptionNorm = new Set<string>();
  for (let i = 0; i < 4; i++) {
    const optVal =
      rawOptions[i] !== undefined && rawOptions[i] !== null
        ? String(rawOptions[i]).trim()
        : '';
    if (!optVal) {
      errors.push(`Option ${String.fromCharCode(65 + i)} cannot be empty.`);
    } else if (optVal.length > 500) {
      errors.push(
        `Option ${String.fromCharCode(65 + i)} exceeds 500 characters.`
      );
    } else if (/^option\s*[a-d1-4]$/i.test(optVal)) {
      errors.push(
        `Option ${String.fromCharCode(65 + i)} contains placeholder text ("${optVal}"). Provide a meaningful option.`
      );
    } else {
      const normOpt = optVal.toLowerCase().replace(/\s+/g, ' ');
      if (seenOptionNorm.has(normOpt)) {
        errors.push(
          `Duplicate option text detected within the same question: "${optVal}". All 4 options must be distinct.`
        );
      }
      seenOptionNorm.add(normOpt);
    }
    cleanOptions.push(optVal);
  }

  const correctIndex =
    typeof raw.correctIndex === 'number'
      ? raw.correctIndex
      : typeof raw.correctIndex === 'string' && raw.correctIndex.trim() !== ''
        ? Number(raw.correctIndex)
        : NaN;
  if (
    !Number.isInteger(correctIndex) ||
    correctIndex < 0 ||
    correctIndex > 3
  ) {
    errors.push(
      'Invalid answer key: correctIndex must be an integer between 0 and 3 (representing Option A, B, C, or D).'
    );
  }

  const explanation =
    typeof raw.explanation === 'string' ? raw.explanation.trim() : '';
  if (!explanation) {
    errors.push('Explanation is missing. Every question requires a complete explanation.');
  } else if (explanation.length < 12) {
    errors.push(
      'Explanation is too brief (minimum 12 characters). Provide a clear step-by-step explanation.'
    );
  } else if (explanation.length > 3000) {
    errors.push('Explanation must be 3,000 characters or fewer.');
  }

  const statusRaw =
    typeof raw.status === 'string' ? raw.status.trim().toLowerCase() : 'draft';
  const status: QuestionStatus =
    statusRaw === 'published' ||
    statusRaw === 'draft' ||
    statusRaw === 'archived'
      ? statusRaw
      : 'draft';

  const sourceRaw =
    typeof raw.source === 'string' ? raw.source.trim().toLowerCase() : 'admin';
  const source: QuestionSource =
    sourceRaw === 'curated' ||
    sourceRaw === 'imported' ||
    sourceRaw === 'migrated' ||
    sourceRaw === 'admin'
      ? sourceRaw
      : 'admin';

  const eventDate =
    typeof raw.eventDate === 'string' && raw.eventDate.trim()
      ? raw.eventDate.trim().slice(0, 40)
      : undefined;
  const verifiedSource =
    typeof raw.verifiedSource === 'string' && raw.verifiedSource.trim()
      ? raw.verifiedSource.trim().slice(0, 300)
      : undefined;

  if (
    subjectId === 'gk' &&
    topic.toLowerCase().includes('current affairs') &&
    (!eventDate || !verifiedSource)
  ) {
    warnings.push(
      'GK Current Affairs questions should include an explicit eventDate and verifiedSource.'
    );
  }

  let duplicateMatches: DuplicateMatchWarning[] = [];
  if (
    subjectId &&
    question.length >= 5 &&
    cleanOptions.length === 4 &&
    Number.isInteger(correctIndex) &&
    correctIndex >= 0 &&
    correctIndex <= 3
  ) {
    duplicateMatches = analyzeQuestionDuplicates(
      {
        id: raw.id,
        subjectId,
        topic: topic || 'General',
        question,
        options: cleanOptions,
        correctIndex,
      },
      existingBank
    );
    for (const dm of duplicateMatches) {
      if (dm.blocking) {
        errors.push(dm.reason);
      } else {
        warnings.push(dm.reason);
      }
    }
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors,
      warnings,
      duplicateMatches,
    };
  }

  const tupleOpts: [string, string, string, string] = [
    cleanOptions[0],
    cleanOptions[1],
    cleanOptions[2],
    cleanOptions[3],
  ];

  const fingerprint = computeCanonicalQuestionBankFingerprint({
    subjectId,
    topic,
    question,
    options: tupleOpts,
    correctIndex,
  });

  const contentSignature = computeQuestionContentSignature(
    {
      text: question,
      opts: tupleOpts,
      ans: correctIndex,
      cat: topic,
    },
    subjectId
  );

  return {
    valid: true,
    errors: [],
    warnings,
    duplicateMatches,
    normalizedDoc: {
      subjectId,
      topic,
      subtopic,
      difficulty,
      type: 'single_choice',
      question,
      options: tupleOpts,
      correctIndex,
      explanation,
      status,
      fingerprint,
      contentSignature,
      source,
      ...(eventDate ? { eventDate } : {}),
      ...(verifiedSource ? { verifiedSource } : {}),
    },
  };
}

/* ============================================================================
   SEEDED & PERSISTENT QUESTION BANK STORE (Local + Firestore Sync)
   ============================================================================ */
const LOCAL_ADMIN_QBANK_STORAGE_KEY = 'triquiz_question_bank_store_v1';
const LOCAL_MIGRATION_BACKUP_KEY = 'triquiz_curated_bank_backup_v1';

let inMemoryQuestionBankMap: Map<string, QuestionBankDocument> | null = null;

/**
 * Builds the initial canonical question bank from the 763 audited questions in `BANK`
 * plus the verified expansion questions in `CURATED_EXPANSION_BATCH_1`.
 */
export function buildInitialCuratedQuestionBankDocs(
  adminUid = 'systemAdminCuratedSeed01'
): QuestionBankDocument[] {
  const docs: QuestionBankDocument[] = [];
  const seenContentSigs = new Set<string>();
  const baseTimestamp = 1730000000000;
  let seq = 0;

  for (const subj of SUBJECTS) {
    const rawList = BANK[subj.id] || [];
    rawList.forEach((q, idx) => {
      if (!q || !Array.isArray(q.opts) || q.opts.length !== 4) return;
      const { topic, subtopic } = inferTopicAndSubtopic(subj.id, q);
      const difficulty = inferQuestionDifficulty(q, idx);
      const tupleOpts: [string, string, string, string] = [
        String(q.opts[0]),
        String(q.opts[1]),
        String(q.opts[2]),
        String(q.opts[3]),
      ];
      const contentSignature = computeQuestionContentSignature(
        {
          text: q.text,
          opts: tupleOpts,
          ans: q.ans,
          cat: topic,
        },
        subj.id
      );
      if (seenContentSigs.has(contentSignature)) return;
      seenContentSigs.add(contentSignature);

      const id =
        q.id && /^[A-Za-z0-9_-]{3,120}$/.test(q.id)
          ? q.id
          : generateDeterministicQuestionId(subj.id, q.text, tupleOpts, q.ans);

      const fingerprint = computeCanonicalQuestionBankFingerprint({
        subjectId: subj.id,
        topic,
        question: q.text,
        options: tupleOpts,
        correctIndex: q.ans,
      });

      seq++;
      docs.push({
        id,
        subjectId: subj.id,
        topic,
        subtopic,
        difficulty,
        type: 'single_choice',
        question: q.text,
        options: tupleOpts,
        correctIndex: q.ans,
        explanation: q.exp,
        status: 'published',
        fingerprint,
        contentSignature,
        source: 'curated',
        createdAt: baseTimestamp + seq * 1000,
        updatedAt: baseTimestamp + seq * 1000,
        createdBy: adminUid,
      });
    });
  }

  for (const item of CURATED_EXPANSION_BATCH_1) {
    const contentSignature = computeQuestionContentSignature(
      {
        text: item.question,
        opts: item.options,
        ans: item.correctIndex,
        cat: item.topic,
      },
      item.subjectId
    );
    if (seenContentSigs.has(contentSignature)) continue;
    seenContentSigs.add(contentSignature);

    const id = generateDeterministicQuestionId(
      item.subjectId,
      item.question,
      item.options,
      item.correctIndex
    );
    const fingerprint = computeCanonicalQuestionBankFingerprint({
      subjectId: item.subjectId,
      topic: item.topic,
      question: item.question,
      options: item.options,
      correctIndex: item.correctIndex,
    });

    seq++;
    docs.push({
      id,
      subjectId: item.subjectId,
      topic: item.topic,
      subtopic: item.subtopic,
      difficulty: item.difficulty,
      type: 'single_choice',
      question: item.question,
      options: item.options,
      correctIndex: item.correctIndex,
      explanation: item.explanation,
      status: 'published',
      fingerprint,
      contentSignature,
      source: 'curated',
      ...(item.eventDate ? { eventDate: item.eventDate } : {}),
      ...(item.verifiedSource ? { verifiedSource: item.verifiedSource } : {}),
      createdAt: baseTimestamp + seq * 1000,
      updatedAt: baseTimestamp + seq * 1000,
      createdBy: adminUid,
    });
  }

  return docs;
}

const customUpsertsMap = new Map<string, QuestionBankDocument>();
const customDeletedIds = new Set<string>();
const remoteFirestoreSyncedIds = new Set<string>();

function ensureQuestionBankStoreLoaded(): Map<string, QuestionBankDocument> {
  if (inMemoryQuestionBankMap) {
    return inMemoryQuestionBankMap;
  }

  const map = new Map<string, QuestionBankDocument>();
  const initialDocs = buildInitialCuratedQuestionBankDocs();
  for (const d of initialDocs) {
    map.set(d.id, d);
  }

  try {
    const raw = localStorage.getItem(LOCAL_ADMIN_QBANK_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as {
        upserts?: Record<string, QuestionBankDocument>;
        deletedIds?: string[];
      };
      if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.deletedIds)) {
          for (const delId of parsed.deletedIds) {
            map.delete(delId);
            customDeletedIds.add(delId);
          }
        }
        if (parsed.upserts && typeof parsed.upserts === 'object') {
          for (const [id, doc] of Object.entries(parsed.upserts)) {
            if (doc && typeof doc.question === 'string') {
              map.set(id, doc);
              customUpsertsMap.set(id, doc);
            }
          }
        }
      }
    }
  } catch {
    // ignore storage read error
  }

  inMemoryQuestionBankMap = map;
  return map;
}

function persistQuestionBankDeltaToStorage(): void {
  try {
    const upsertsObj: Record<string, QuestionBankDocument> = {};
    for (const [k, v] of customUpsertsMap.entries()) {
      upsertsObj[k] = v;
    }
    localStorage.setItem(
      LOCAL_ADMIN_QBANK_STORAGE_KEY,
      JSON.stringify({
        upserts: upsertsObj,
        deletedIds: Array.from(customDeletedIds),
      })
    );
  } catch {
    // ignore quota errors
  }
}

export function resetQuestionBankStoreToInitialForTesting(): void {
  customUpsertsMap.clear();
  customDeletedIds.clear();
  remoteFirestoreSyncedIds.clear();
  inMemoryQuestionBankMap = null;
  try {
    localStorage.removeItem(LOCAL_ADMIN_QBANK_STORAGE_KEY);
  } catch {
    // ignore
  }
  ensureQuestionBankStoreLoaded();
}

export function markQuestionsSyncedToFirestore(ids: readonly string[]): void {
  for (const id of ids) {
    if (id) remoteFirestoreSyncedIds.add(id);
  }
}

export function unmarkQuestionsSyncedToFirestore(ids: readonly string[]): void {
  for (const id of ids) {
    if (id) remoteFirestoreSyncedIds.delete(id);
  }
}

export function isQuestionSyncedToFirestore(id: string): boolean {
  return remoteFirestoreSyncedIds.has(id);
}

export function getRemoteFirestoreSyncedCount(): number {
  return remoteFirestoreSyncedIds.size;
}

export function getUnsyncedCustomQuestions(): QuestionBankDocument[] {
  const store = ensureQuestionBankStoreLoaded();
  const unsynced: QuestionBankDocument[] = [];
  for (const doc of store.values()) {
    if (
      (doc.source === 'admin' || doc.source === 'imported') &&
      !remoteFirestoreSyncedIds.has(doc.id)
    ) {
      unsynced.push(doc);
    }
  }
  return unsynced;
}

export function getAllQuestionBankDocuments(): QuestionBankDocument[] {
  const store = ensureQuestionBankStoreLoaded();
  return Array.from(store.values());
}

/**
 * Returns ONLY `published` questions for a given subject, converted to runtime `Question[]`.
 * Used by the student quiz engine (`selectQuizQuestions` and `getNextUniqueQuestion`).
 * Draft and archived questions are NEVER returned to students.
 */
export function getPublishedQuestionsForSubject(
  subjectId: string,
  topicFilter?: string | null
): Question[] {
  const store = ensureQuestionBankStoreLoaded();
  const out: Question[] = [];
  const subjLower = subjectId.trim().toLowerCase();

  for (const doc of store.values()) {
    if (doc.subjectId !== subjLower) continue;
    if (doc.status !== 'published') continue;
    if (
      topicFilter &&
      topicFilter !== 'All' &&
      doc.topic.toLowerCase() !== topicFilter.toLowerCase() &&
      doc.subtopic.toLowerCase() !== topicFilter.toLowerCase()
    ) {
      continue;
    }
    out.push(toRuntimeQuestion(doc));
  }
  return out;
}

// Register published-only pool provider with the quiz engine at module load
setPublishedQuestionPoolProvider(getPublishedQuestionsForSubject);

/**
 * Merges incoming Firestore `questionBank` documents into the active in-memory store
 * and persists custom/imported remote questions so they remain available across reloads.
 */
export function mergeRemoteFirestoreQuestionsIntoStore(
  remoteDocs: QuestionBankDocument[]
): void {
  const store = ensureQuestionBankStoreLoaded();
  let updatedCustom = false;
  for (const d of remoteDocs) {
    if (!d || !d.id || customDeletedIds.has(d.id)) continue;
    store.set(d.id, d);
    remoteFirestoreSyncedIds.add(d.id);
    if (d.source === 'admin' || d.source === 'imported') {
      customUpsertsMap.set(d.id, d);
      updatedCustom = true;
    }
  }
  if (updatedCustom) {
    persistQuestionBankDeltaToStorage();
  }
}

/**
 * Computes Phase 4A Overview Statistics across all 9 subjects.
 */
export function computeQuestionBankOverviewStats(): QuestionBankOverviewStats {
  const store = ensureQuestionBankStoreLoaded();
  const bySubject: Record<string, SubjectBankStats> = {};

  for (const s of SUBJECTS) {
    bySubject[s.id] = {
      subjectId: s.id,
      label: s.label,
      hex: s.hex,
      total: 0,
      published: 0,
      draft: 0,
      archived: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      targetCount: TARGET_QUESTIONS_PER_SUBJECT,
      remainingToTarget: TARGET_QUESTIONS_PER_SUBJECT,
      topics: {},
    };
  }

  let totalQuestions = 0;
  let publishedQuestions = 0;
  let draftQuestions = 0;
  let archivedQuestions = 0;
  let easyTotal = 0;
  let mediumTotal = 0;
  let hardTotal = 0;

  for (const doc of store.values()) {
    const subjStat = bySubject[doc.subjectId];
    if (!subjStat) continue;

    totalQuestions++;
    subjStat.total++;

    if (doc.status === 'published') {
      publishedQuestions++;
      subjStat.published++;
    } else if (doc.status === 'draft') {
      draftQuestions++;
      subjStat.draft++;
    } else if (doc.status === 'archived') {
      archivedQuestions++;
      subjStat.archived++;
    }

    if (doc.difficulty === 'easy') {
      easyTotal++;
      subjStat.easy++;
    } else if (doc.difficulty === 'medium') {
      mediumTotal++;
      subjStat.medium++;
    } else {
      hardTotal++;
      subjStat.hard++;
    }

    const topicName = doc.topic || 'General';
    subjStat.topics[topicName] = (subjStat.topics[topicName] || 0) + 1;
  }

  let remainingTotalToTarget = 0;
  for (const s of SUBJECTS) {
    const st = bySubject[s.id];
    // Remaining to reach 1,000 published curated questions per subject
    st.remainingToTarget = Math.max(
      0,
      TARGET_QUESTIONS_PER_SUBJECT - st.published
    );
    remainingTotalToTarget += st.remainingToTarget;
  }

  const denom = Math.max(1, totalQuestions);
  return {
    totalQuestions,
    publishedQuestions,
    draftQuestions,
    archivedQuestions,
    targetTotalQuestions: TARGET_TOTAL_QUESTIONS,
    remainingTotalToTarget,
    difficultyDistribution: {
      easy: easyTotal,
      medium: mediumTotal,
      hard: hardTotal,
      easyPct: Math.round((easyTotal / denom) * 100),
      mediumPct: Math.round((mediumTotal / denom) * 100),
      hardPct: Math.round((hardTotal / denom) * 100),
    },
    bySubject,
  };
}

/**
 * Phase 4B: Paginated Question Bank Query with Search, Subject/Topic/Difficulty/Status Filters, and Creation Date Sort.
 */
export function queryQuestionBankPaginated(
  filter: QuestionQueryFilter
): PaginatedQuestionsResult {
  const store = ensureQuestionBankStoreLoaded();
  const page = Math.max(1, filter.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filter.pageSize ?? 20));
  const searchNorm = (filter.searchQuery || '').trim().toLowerCase();
  const subjFilter =
    filter.subjectId && filter.subjectId !== 'all'
      ? filter.subjectId.toLowerCase()
      : null;
  const topicFilter =
    filter.topic && filter.topic !== 'all' ? filter.topic.toLowerCase() : null;
  const diffFilter =
    filter.difficulty && filter.difficulty !== 'all' ? filter.difficulty : null;
  const statusFilter =
    filter.status && filter.status !== 'all' ? filter.status : null;
  const sortOrder = filter.sortOrder || 'newest';

  const matched: QuestionBankDocument[] = [];

  for (const doc of store.values()) {
    if (subjFilter && doc.subjectId !== subjFilter) continue;
    if (
      topicFilter &&
      doc.topic.toLowerCase() !== topicFilter &&
      doc.subtopic.toLowerCase() !== topicFilter
    ) {
      continue;
    }
    if (diffFilter && doc.difficulty !== diffFilter) continue;
    if (statusFilter && doc.status !== statusFilter) continue;

    if (searchNorm) {
      const hay = `${doc.question} ${doc.topic} ${doc.subtopic} ${doc.options.join(' ')} ${doc.explanation} ${doc.id}`.toLowerCase();
      if (!hay.includes(searchNorm)) continue;
    }

    matched.push(doc);
  }

  matched.sort((a, b) =>
    sortOrder === 'newest'
      ? b.createdAt - a.createdAt || a.id.localeCompare(b.id)
      : a.createdAt - b.createdAt || a.id.localeCompare(b.id)
  );

  const totalMatching = matched.length;
  const totalPages = Math.max(1, Math.ceil(totalMatching / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const items = matched.slice(start, start + pageSize);

  return {
    items,
    totalMatching,
    page: safePage,
    pageSize,
    totalPages,
    hasMore: safePage < totalPages,
  };
}

/**
 * Admin Action: Create a new validated question in the store.
 */
export function createQuestionInStore(
  input: {
    subjectId: string;
    topic: string;
    subtopic: string;
    difficulty: QuestionDifficulty;
    question: string;
    options: [string, string, string, string];
    correctIndex: number;
    explanation: string;
    status: QuestionStatus;
    source?: QuestionSource;
    eventDate?: string;
    verifiedSource?: string;
  },
  adminUid: string
): {
  ok: boolean;
  doc?: QuestionBankDocument;
  validation: QuestionValidationResult;
} {
  const store = ensureQuestionBankStoreLoaded();
  const validation = validateQuestionInput(input, Array.from(store.values()));
  if (!validation.valid || !validation.normalizedDoc) {
    return { ok: false, validation };
  }

  const norm = validation.normalizedDoc;
  const id = generateDeterministicQuestionId(
    norm.subjectId,
    norm.question,
    norm.options,
    norm.correctIndex
  );
  const now = Date.now();
  const doc: QuestionBankDocument = {
    ...norm,
    id,
    createdAt: now,
    updatedAt: now,
    createdBy: adminUid,
  };

  store.set(id, doc);
  customDeletedIds.delete(id);
  customUpsertsMap.set(id, doc);
  persistQuestionBankDeltaToStorage();

  return { ok: true, doc, validation };
}

/**
 * Admin Action: Update an existing question in the store (preserving createdAt and createdBy).
 */
export function updateQuestionInStore(
  questionId: string,
  updates: Partial<{
    subjectId: string;
    topic: string;
    subtopic: string;
    difficulty: QuestionDifficulty;
    question: string;
    options: [string, string, string, string];
    correctIndex: number;
    explanation: string;
    status: QuestionStatus;
    eventDate?: string;
    verifiedSource?: string;
  }>,
  adminUid: string
): {
  ok: boolean;
  doc?: QuestionBankDocument;
  validation: QuestionValidationResult;
} {
  const store = ensureQuestionBankStoreLoaded();
  const existing = store.get(questionId);
  if (!existing) {
    return {
      ok: false,
      validation: {
        valid: false,
        errors: [`Question "${questionId}" not found.`],
        warnings: [],
        duplicateMatches: [],
      },
    };
  }

  const mergedCandidate = {
    id: questionId,
    subjectId: updates.subjectId ?? existing.subjectId,
    topic: updates.topic ?? existing.topic,
    subtopic: updates.subtopic ?? existing.subtopic,
    difficulty: updates.difficulty ?? existing.difficulty,
    question: updates.question ?? existing.question,
    options: updates.options ?? existing.options,
    correctIndex: updates.correctIndex ?? existing.correctIndex,
    explanation: updates.explanation ?? existing.explanation,
    status: updates.status ?? existing.status,
    source: existing.source,
    eventDate:
      updates.eventDate !== undefined ? updates.eventDate : existing.eventDate,
    verifiedSource:
      updates.verifiedSource !== undefined
        ? updates.verifiedSource
        : existing.verifiedSource,
  };

  const validation = validateQuestionInput(
    mergedCandidate,
    Array.from(store.values())
  );
  if (!validation.valid || !validation.normalizedDoc) {
    return { ok: false, validation };
  }

  const updatedDoc: QuestionBankDocument = {
    ...validation.normalizedDoc,
    id: questionId,
    createdAt: existing.createdAt, // Immutable
    createdBy: existing.createdBy, // Immutable
    updatedAt: Date.now(),
    reviewedBy: adminUid,
  };

  store.set(questionId, updatedDoc);
  customUpsertsMap.set(questionId, updatedDoc);
  persistQuestionBankDeltaToStorage();

  return { ok: true, doc: updatedDoc, validation };
}

/**
 * Admin Action: Delete a question from the store.
 */
export function deleteQuestionFromStore(questionId: string): boolean {
  const store = ensureQuestionBankStoreLoaded();
  if (!store.has(questionId)) return false;
  store.delete(questionId);
  customUpsertsMap.delete(questionId);
  customDeletedIds.add(questionId);
  persistQuestionBankDeltaToStorage();
  return true;
}

/**
 * Admin Action: Delete all draft questions (optionally filtered by subjectId) from the store.
 * Returns the list of deleted question IDs so they can also be removed from Firestore.
 */
export function deleteAllDraftQuestionsFromStore(subjectId?: string): {
  deletedCount: number;
  deletedIds: string[];
} {
  const store = ensureQuestionBankStoreLoaded();
  const subjFilter =
    subjectId && subjectId !== 'all' ? subjectId.trim().toLowerCase() : null;
  const deletedIds: string[] = [];

  for (const [id, doc] of store.entries()) {
    if (doc.status !== 'draft') continue;
    if (subjFilter && doc.subjectId !== subjFilter) continue;
    deletedIds.push(id);
  }

  for (const id of deletedIds) {
    store.delete(id);
    customUpsertsMap.delete(id);
    customDeletedIds.add(id);
  }

  if (deletedIds.length > 0) {
    persistQuestionBankDeltaToStorage();
  }

  return {
    deletedCount: deletedIds.length,
    deletedIds,
  };
}

/**
 * Admin Action: Approve and publish all draft questions (optionally filtered by subjectId) in the store.
 * Returns the list of updated QuestionBankDocument items so they can also be synced to Firestore.
 */
export function publishAllDraftQuestionsInStore(
  adminUid: string,
  subjectId?: string
): {
  publishedCount: number;
  publishedDocs: QuestionBankDocument[];
} {
  const store = ensureQuestionBankStoreLoaded();
  const subjFilter =
    subjectId && subjectId !== 'all' ? subjectId.trim().toLowerCase() : null;
  const publishedDocs: QuestionBankDocument[] = [];
  const now = Date.now();

  for (const [id, doc] of store.entries()) {
    if (doc.status !== 'draft') continue;
    if (subjFilter && doc.subjectId !== subjFilter) continue;

    const updatedDoc: QuestionBankDocument = {
      ...doc,
      status: 'published',
      updatedAt: now,
      reviewedBy: adminUid,
    };
    store.set(id, updatedDoc);
    customUpsertsMap.set(id, updatedDoc);
    customDeletedIds.delete(id);
    publishedDocs.push(updatedDoc);
  }

  if (publishedDocs.length > 0) {
    persistQuestionBankDeltaToStorage();
  }

  return {
    publishedCount: publishedDocs.length,
    publishedDocs,
  };
}

/**
 * Admin Action: Delete all bulk-imported questions (`source === 'imported'`) from the store.
 * Returns the list of deleted question IDs so they can also be removed from Firestore.
 */
export function deleteBulkImportedQuestionsFromStore(): {
  deletedCount: number;
  deletedIds: string[];
} {
  const store = ensureQuestionBankStoreLoaded();
  const deletedIds: string[] = [];

  for (const [id, doc] of store.entries()) {
    if (doc.source === 'imported') {
      deletedIds.push(id);
    }
  }

  for (const id of deletedIds) {
    store.delete(id);
    customUpsertsMap.delete(id);
    customDeletedIds.add(id);
  }

  if (deletedIds.length > 0) {
    persistQuestionBankDeltaToStorage();
  }

  return {
    deletedCount: deletedIds.length,
    deletedIds,
  };
}

/* ============================================================================
   PHASE 4D: BULK IMPORT PARSERS (JSON & CSV) AND VALIDATION PIPELINE
   ============================================================================ */

export function parseBulkImportJSON(rawText: string): {
  records: Record<string, unknown>[];
  parseError?: string;
} {
  try {
    const parsed = JSON.parse(rawText);
    if (Array.isArray(parsed)) {
      return { records: parsed };
    }
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.questions)) {
      return { records: parsed.questions };
    }
    return {
      records: [],
      parseError:
        'JSON root must be an array of question objects or `{ "questions": [...] }`.',
    };
  } catch (err) {
    return {
      records: [],
      parseError:
        err instanceof Error ? `Invalid JSON syntax: ${err.message}` : 'Invalid JSON.',
    };
  }
}

/**
 * RFC-4180 compliant CSV parser supporting quoted commas and escaped quotes.
 */
function parseCsvRow(line: string): string[] {
  const cells: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        cells.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
  }
  cells.push(cur.trim());
  return cells;
}

export function parseBulkImportCSV(rawCsv: string): {
  records: Record<string, unknown>[];
  parseError?: string;
} {
  const lines = rawCsv
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((l) => l.trim().length > 0);

  if (lines.length < 2) {
    return {
      records: [],
      parseError:
        'CSV must include a header row and at least one question row.',
    };
  }

  const headers = parseCsvRow(lines[0]).map((h) =>
    h.toLowerCase().replace(/[^a-z0-9]/g, '')
  );

  const records: Record<string, unknown>[] = [];
  for (let r = 1; r < lines.length; r++) {
    const cols = parseCsvRow(lines[r]);
    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = cols[idx] ?? '';
    });

    const optionA = rowObj.optiona ?? rowObj.opta ?? rowObj.a ?? '';
    const optionB = rowObj.optionb ?? rowObj.optb ?? rowObj.b ?? '';
    const optionC = rowObj.optionc ?? rowObj.optc ?? rowObj.c ?? '';
    const optionD = rowObj.optiond ?? rowObj.optd ?? rowObj.d ?? '';

    let rawCorrect =
      rowObj.correctindex ?? rowObj.correct ?? rowObj.ans ?? rowObj.answer ?? '';
    let correctIndex: number | string = rawCorrect;
    if (/^[A-Da-d]$/.test(rawCorrect.trim())) {
      correctIndex = rawCorrect.trim().toUpperCase().charCodeAt(0) - 65;
    } else if (rawCorrect.trim() !== '' && !Number.isNaN(Number(rawCorrect))) {
      correctIndex = Number(rawCorrect);
    }

    records.push({
      subjectId: rowObj.subjectid || rowObj.subject || '',
      topic: rowObj.topic || rowObj.category || rowObj.cat || '',
      subtopic: rowObj.subtopic || 'Core Concepts',
      difficulty: rowObj.difficulty || 'medium',
      question: rowObj.question || rowObj.text || '',
      options: [optionA, optionB, optionC, optionD],
      correctIndex,
      explanation: rowObj.explanation || rowObj.exp || '',
      eventDate: rowObj.eventdate || undefined,
      verifiedSource: rowObj.verifiedsource || undefined,
    });
  }

  return { records };
}

/**
 * Validates a batch of imported records and prepares valid rows strictly as `draft`
 * (never auto-publishing unreviewed bulk imports).
 */
export function validateBulkImportBatch(
  records: Record<string, unknown>[],
  adminUid: string
): BulkImportValidationSummary {
  const store = ensureQuestionBankStoreLoaded();
  const workingBank: QuestionBankDocument[] = Array.from(store.values());

  let validReadyCount = 0;
  let warningReviewCount = 0;
  let rejectedCount = 0;
  let exactDuplicateCount = 0;
  let nearDuplicateWarningCount = 0;
  let invalidAnswerKeyCount = 0;
  let missingExplanationCount = 0;
  let missingTopicCount = 0;

  const rows: BulkImportRowReport[] = [];
  const now = Date.now();

  records.forEach((raw, idx) => {
    const normalizedInput = {
      subjectId: raw.subjectId ?? raw.subject,
      topic: raw.topic ?? raw.cat ?? raw.category,
      subtopic: raw.subtopic ?? 'Core Concepts',
      difficulty: raw.difficulty ?? 'medium',
      question: raw.question ?? raw.text,
      options: Array.isArray(raw.options)
        ? raw.options
        : Array.isArray(raw.opts)
          ? raw.opts
          : [raw.optionA, raw.optionB, raw.optionC, raw.optionD].filter(
              (x) => x !== undefined
            ),
      correctIndex: raw.correctIndex ?? raw.ans,
      explanation: raw.explanation ?? raw.exp,
      // CRITICAL PHASE 4D RULE: Never automatically publish unreviewed bulk-imported questions!
      status: 'draft' as QuestionStatus,
      source: 'imported' as QuestionSource,
      eventDate: raw.eventDate,
      verifiedSource: raw.verifiedSource,
    };

    const val = validateQuestionInput(normalizedInput, workingBank);

    if (
      val.errors.some((e) => e.toLowerCase().includes('invalid answer key'))
    ) {
      invalidAnswerKeyCount++;
    }
    if (
      val.errors.some((e) => e.toLowerCase().includes('explanation'))
    ) {
      missingExplanationCount++;
    }
    if (val.errors.some((e) => e.toLowerCase().includes('topic'))) {
      missingTopicCount++;
    }
    if (val.duplicateMatches.some((d) => d.blocking)) {
      exactDuplicateCount++;
    }
    if (val.duplicateMatches.some((d) => !d.blocking)) {
      nearDuplicateWarningCount++;
    }

    if (val.valid && val.normalizedDoc) {
      const id = generateDeterministicQuestionId(
        val.normalizedDoc.subjectId,
        val.normalizedDoc.question,
        val.normalizedDoc.options,
        val.normalizedDoc.correctIndex
      );
      const preparedDoc: QuestionBankDocument = {
        ...val.normalizedDoc,
        id,
        status: 'draft', // Always staged as draft until reviewed
        source: 'imported',
        createdAt: now + idx,
        updatedAt: now + idx,
        createdBy: adminUid,
      };
      // Add to workingBank so subsequent rows in the same batch detect intra-batch duplicates!
      workingBank.push(preparedDoc);

      validReadyCount++;
      if (val.warnings.length > 0 || val.duplicateMatches.length > 0) {
        warningReviewCount++;
      }

      rows.push({
        rowIndex: idx + 1,
        rawRecord: raw,
        valid: true,
        canImportAsDraft: true,
        errors: [],
        warnings: val.warnings,
        duplicateMatches: val.duplicateMatches,
        preparedDoc,
      });
    } else {
      rejectedCount++;
      rows.push({
        rowIndex: idx + 1,
        rawRecord: raw,
        valid: false,
        canImportAsDraft: false,
        errors: val.errors,
        warnings: val.warnings,
        duplicateMatches: val.duplicateMatches,
      });
    }
  });

  return {
    totalRecords: records.length,
    validReadyCount,
    warningReviewCount,
    rejectedCount,
    exactDuplicateCount,
    nearDuplicateWarningCount,
    invalidAnswerKeyCount,
    missingExplanationCount,
    missingTopicCount,
    rows,
  };
}

/**
 * Commits validated bulk-import rows into the question bank store strictly as `draft`.
 */
export function commitBulkImportDraftsToStore(
  summary: BulkImportValidationSummary
): { importedCount: number;importedDocs: QuestionBankDocument[] } {
  const store = ensureQuestionBankStoreLoaded();
  const importedDocs: QuestionBankDocument[] = [];

  for (const row of summary.rows) {
    if (row.valid && row.preparedDoc) {
      const doc: QuestionBankDocument = {
        ...row.preparedDoc,
        status: 'draft',
        source: 'imported',
      };
      store.set(doc.id, doc);
      customDeletedIds.delete(doc.id);
      customUpsertsMap.set(doc.id, doc);
      importedDocs.push(doc);
    }
  }

  if (importedDocs.length > 0) {
    persistQuestionBankDeltaToStorage();
  }

  return {
    importedCount: importedDocs.length,
    importedDocs,
  };
}

/**
 * Phase 8: Idempotent Migration Backup & Preparation Helper
 * Creates a timestamped backup of the curated bank in localStorage and returns
 * the idempotent list of `QuestionBankDocument` items ready for Firestore batch upsert.
 */
export function prepareIdempotentCuratedMigration(adminUid: string): {
  backupKey: string;
  backupCount: number;
  docsToMigrate: QuestionBankDocument[];
  duplicateSkippedCount: number;
} {
  const initialDocs = buildInitialCuratedQuestionBankDocs(adminUid);
  const store = ensureQuestionBankStoreLoaded();

  const docsToMigrate: QuestionBankDocument[] = [];
  const seenIds = new Set<string>();
  let duplicateSkippedCount = 0;

  for (const d of initialDocs) {
    if (seenIds.has(d.id)) {
      duplicateSkippedCount++;
      continue;
    }
    seenIds.add(d.id);
    const existing = store.get(d.id);
    if (!existing) {
      store.set(d.id, d);
    }
    docsToMigrate.push(existing || d);
  }

  try {
    localStorage.setItem(
      LOCAL_MIGRATION_BACKUP_KEY,
      JSON.stringify({
        backedUpAt: new Date().toISOString(),
        count: docsToMigrate.length,
      })
    );
  } catch {
    // ignore
  }

  return {
    backupKey: LOCAL_MIGRATION_BACKUP_KEY,
    backupCount: docsToMigrate.length,
    docsToMigrate,
    duplicateSkippedCount,
  };
}

/**
 * Evaluates `/admins/{adminUid}` and `/questionBank/{questionId}` security rules
 * matching `firestore.rules` for automated security testing (Phase 9).
 */
export function evaluateQuestionBankAccessRule(params: {
  auth: {
    uid: string;
    emailVerified: boolean;
    customClaims?: { admin?: boolean; role?: string };
    inAdminsCollection?: boolean;
  } | null;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  collectionPath: 'questionBank' | 'admins';
  docId?: string;
  existingDoc?: Record<string, unknown> | null;
  incomingDoc?: Record<string, unknown> | null;
  requestTimeSymbol?: unknown;
}): { allowed: boolean; reason?: string } {
  const {
    auth,
    operation,
    collectionPath,
    docId,
    existingDoc,
    incomingDoc,
    requestTimeSymbol,
  } = params;

  if (!auth || !auth.uid) {
    return { allowed: false, reason: 'Unauthenticated access denied.' };
  }

  const isAdmin =
    auth.emailVerified === true &&
    (auth.customClaims?.admin === true ||
      auth.customClaims?.role === 'admin' ||
      auth.inAdminsCollection === true);

  if (collectionPath === 'admins') {
    if (operation === 'get') {
      if (
        docId &&
        auth.uid === docId &&
        isValidFirebaseAuthUid(docId)
      ) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: 'Users can only read their own /admins/{uid} status document.',
      };
    }
    return {
      allowed: false,
      reason:
        'Client SDKs are strictly forbidden from listing, creating, updating, or deleting /admins documents.',
    };
  }

  if (collectionPath === 'questionBank') {
    if (operation === 'get') {
      if (!docId || !/^[A-Za-z0-9_-]{1,128}$/.test(docId)) {
        return { allowed: false, reason: 'Invalid questionId.' };
      }
      if (isAdmin) {
        return { allowed: true };
      }
      if (existingDoc && existingDoc.status === 'published') {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason:
          'Students can only read published questions; draft and archived questions are restricted to admins.',
      };
    }

    if (operation === 'list') {
      if (isAdmin) {
        return { allowed: true };
      }
      if (existingDoc && existingDoc.status === 'published') {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason:
          'Student list queries must filter by status == "published"; draft/archived questions are denied.',
      };
    }

    if (!isAdmin) {
      return {
        allowed: false,
        reason:
          'Only verified administrators can create, update, publish, archive, or delete questions.',
      };
    }

    if (operation === 'delete') {
      if (!docId || !/^[A-Za-z0-9_-]{1,128}$/.test(docId)) {
        return { allowed: false, reason: 'Invalid questionId.' };
      }
      return { allowed: true };
    }

    if (operation === 'create' || operation === 'update') {
      if (!docId || !/^[A-Za-z0-9_-]{1,128}$/.test(docId)) {
        return { allowed: false, reason: 'Invalid questionId.' };
      }
      if (!incomingDoc || typeof incomingDoc !== 'object') {
        return { allowed: false, reason: 'Missing incoming question payload.' };
      }

      const requiredKeys = [
        'subjectId',
        'topic',
        'subtopic',
        'difficulty',
        'type',
        'question',
        'options',
        'correctIndex',
        'explanation',
        'status',
        'fingerprint',
        'source',
        'createdAt',
        'updatedAt',
        'createdBy',
      ];
      const allowedKeys = new Set([
        ...requiredKeys,
        'contentSignature',
        'eventDate',
        'verifiedSource',
        'reviewedBy',
      ]);

      for (const rk of requiredKeys) {
        if (!(rk in incomingDoc)) {
          return {
            allowed: false,
            reason: `Missing required field "${rk}".`,
          };
        }
      }
      for (const k of Object.keys(incomingDoc)) {
        if (!allowedKeys.has(k)) {
          return {
            allowed: false,
            reason: `Disallowed shadow field "${k}" rejected by hasOnly() rule.`,
          };
        }
      }

      if (
        !(VALID_SUBJECT_IDS as readonly string[]).includes(
          String(incomingDoc.subjectId)
        )
      ) {
        return { allowed: false, reason: 'Invalid subjectId.' };
      }
      if (
        typeof incomingDoc.topic !== 'string' ||
        incomingDoc.topic.length < 1 ||
        incomingDoc.topic.length > 80
      ) {
        return { allowed: false, reason: 'Invalid topic length.' };
      }
      if (
        typeof incomingDoc.subtopic !== 'string' ||
        incomingDoc.subtopic.length < 1 ||
        incomingDoc.subtopic.length > 100
      ) {
        return { allowed: false, reason: 'Invalid subtopic length.' };
      }
      if (
        incomingDoc.difficulty !== 'easy' &&
        incomingDoc.difficulty !== 'medium' &&
        incomingDoc.difficulty !== 'hard'
      ) {
        return { allowed: false, reason: 'Invalid difficulty.' };
      }
      if (incomingDoc.type !== 'single_choice') {
        return { allowed: false, reason: 'Invalid question type.' };
      }
      if (
        typeof incomingDoc.question !== 'string' ||
        incomingDoc.question.length < 5 ||
        incomingDoc.question.length > 2000
      ) {
        return { allowed: false, reason: 'Invalid question text length.' };
      }
      if (
        !Array.isArray(incomingDoc.options) ||
        incomingDoc.options.length !== 4 ||
        !incomingDoc.options.every(
          (o) => typeof o === 'string' && o.length >= 1 && o.length <= 500
        )
      ) {
        return {
          allowed: false,
          reason: 'options must be a list of 4 valid strings.',
        };
      }
      if (
        typeof incomingDoc.correctIndex !== 'number' ||
        !Number.isInteger(incomingDoc.correctIndex) ||
        incomingDoc.correctIndex < 0 ||
        incomingDoc.correctIndex > 3
      ) {
        return {
          allowed: false,
          reason: 'correctIndex must be an integer 0..3.',
        };
      }
      if (
        typeof incomingDoc.explanation !== 'string' ||
        incomingDoc.explanation.length < 10 ||
        incomingDoc.explanation.length > 3000
      ) {
        return { allowed: false, reason: 'Invalid explanation length.' };
      }
      if (
        incomingDoc.status !== 'draft' &&
        incomingDoc.status !== 'published' &&
        incomingDoc.status !== 'archived'
      ) {
        return { allowed: false, reason: 'Invalid status.' };
      }
      if (
        typeof incomingDoc.fingerprint !== 'string' ||
        incomingDoc.fingerprint.length < 10 ||
        incomingDoc.fingerprint.length > 512
      ) {
        return { allowed: false, reason: 'Invalid fingerprint.' };
      }
      if (
        incomingDoc.source !== 'curated' &&
        incomingDoc.source !== 'imported' &&
        incomingDoc.source !== 'migrated' &&
        incomingDoc.source !== 'admin'
      ) {
        return { allowed: false, reason: 'Invalid source.' };
      }
      if (!isValidFirebaseAuthUid(incomingDoc.createdBy)) {
        return { allowed: false, reason: 'Invalid createdBy UID.' };
      }

      if (
        requestTimeSymbol !== undefined &&
        incomingDoc.updatedAt !== requestTimeSymbol
      ) {
        return {
          allowed: false,
          reason: 'updatedAt must equal request.time (serverTimestamp).',
        };
      }

      if (operation === 'create') {
        if (incomingDoc.createdBy !== auth.uid) {
          return {
            allowed: false,
            reason: 'createdBy must match request.auth.uid on create.',
          };
        }
        if (
          requestTimeSymbol !== undefined &&
          incomingDoc.createdAt !== requestTimeSymbol
        ) {
          return {
            allowed: false,
            reason: 'createdAt must equal request.time (serverTimestamp) on create.',
          };
        }
      }

      if (operation === 'update') {
        if (!existingDoc) {
          return { allowed: false, reason: 'Existing document required for update.' };
        }
        if (incomingDoc.createdBy !== existingDoc.createdBy) {
          return {
            allowed: false,
            reason: 'createdBy is immutable and cannot be modified on update.',
          };
        }
        if (incomingDoc.createdAt !== existingDoc.createdAt) {
          return {
            allowed: false,
            reason: 'createdAt is immutable and cannot be modified on update.',
          };
        }
      }

      return { allowed: true };
    }
  }

  return { allowed: false, reason: 'Denied by default catch-all rule.' };
}
