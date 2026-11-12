/** Difficulty tier for curated and procedural TRIQUIZ questions. */
export type QuestionDifficulty = "easy" | "medium" | "hard";

export interface Question {
  id?: string;
  text: string;
  opts: string[];
  ans: number;
  cat?: string;
  difficulty?: QuestionDifficulty;
  templateId?: string;
  isProcedural?: boolean;
  source?: "curated" | "imported" | "migrated" | "admin";
  exp: string;
}

export interface SubjectMeta {
  id: string;
  label: string;
  color: string;
  hex: string;
  desc: string;
}

export const SUBJECTS: SubjectMeta[] = [
  { id: "python", label: "Python", color: "var(--py)", hex: "#4b8bbe", desc: "Syntax, data structures, slicing, comprehensions & core built-ins." },
  { id: "java", label: "Java", color: "var(--java)", hex: "#e76f51", desc: "OOP principles, JVM internals, collections & exception handling." },
  { id: "c", label: "C", color: "var(--c)", hex: "#5da9e9", desc: "Pointers, memory allocation, bitwise ops & standard library." },
  { id: "cpp", label: "C++", color: "var(--cpp)", hex: "#f28ab2", desc: "STL containers, RAII, polymorphism, templates & memory model." },
  { id: "html", label: "HTML/CSS", color: "var(--html)", hex: "#ff9d5c", desc: "Semantic markup, CSS box model, specificity, Flexbox & Grid math." },
  { id: "crt", label: "CRT Aptitude", color: "var(--crt)", hex: "#b48ce0", desc: "Quantitative aptitude, logical reasoning, series & verbal ability." },
  { id: "gk", label: "General Knowledge", color: "var(--gk)", hex: "#6fcf97", desc: "Science, polity, history, geography, economy, space & world affairs." },
  { id: "neet", label: "NEET", color: "var(--neet)", hex: "#e0b04b", desc: "Biology, Chemistry & Physics — genetics, physiology & stoichiometry." },
  { id: "jee", label: "JEE Mains", color: "var(--jee)", hex: "#5ce0c6", desc: "Physics, Chemistry & Calculus/Algebra — numerical & conceptual problems." },
];

export const QUESTION_BANK_AUDIT_REPORT = {
  "totalOriginalQuestionsAudited": 724,
  "totalUniqueCuratedQuestionsRetained": 763,
  "exactDuplicatesRemovedCount": 33,
  "nearDuplicatesConsolidatedCount": 96,
  "answerKeysCorrectedCount": 3,
  "answerKeysCorrected": [
    {
      "subject": "crt",
      "originalIndex": 21,
      "questionText": "A trader sells goods at 20% loss. If he had sold it for ₹100 more, he would have gained 5%. Find the cost price.",
      "previousAnswer": "₹500 (index 1)",
      "correctedAnswer": "₹400 (index 0)",
      "reason": "Difference between 20% loss (0.80 CP) and 5% gain (1.05 CP) is 25% of CP = ₹100, so CP = ₹100 / 0.25 = ₹400."
    },
    {
      "subject": "crt",
      "originalIndex": 31,
      "questionText": "Two numbers are in the ratio 5:6 and their LCM is 480. Find the numbers.",
      "previousAnswer": "50, 60 (index 1, whose LCM is 300)",
      "correctedAnswer": "80, 96 (index 3, whose LCM is 480)",
      "reason": "For numbers 5x and 6x with gcd(5,6)=1, LCM = 30x = 480 => x = 16, giving 80 and 96."
    },
    {
      "subject": "gk",
      "originalIndex": 137,
      "questionText": "How many Fundamental Rights were originally guaranteed by the Indian Constitution (including the right to property)?",
      "previousAnswer": "6 (index 1)",
      "correctedAnswer": "7 (index 2)",
      "reason": "The original 1950 Constitution guaranteed 7 Fundamental Rights (including Right to Property under Article 31) before the 44th Amendment (1978) made Property a constitutional right under Article 300A."
    }
  ],
  "exactDuplicatesRemoved": [
    {
      "subject": "python",
      "originalIndex": 0,
      "text": "What is the output of `print(type([]))`?"
    },
    {
      "subject": "python",
      "originalIndex": 1,
      "text": "Which keyword is used to define a function in Python?"
    },
    {
      "subject": "python",
      "originalIndex": 2,
      "text": "What does `len('hello')` return?"
    },
    {
      "subject": "python",
      "originalIndex": 4,
      "text": "What is the output of `2 ** 3`?"
    },
    {
      "subject": "python",
      "originalIndex": 21,
      "text": "What is the output of `'abc'.upper()`?"
    },
    {
      "subject": "python",
      "originalIndex": 24,
      "text": "What is the output of `len({1,2,2,3})`?"
    },
    {
      "subject": "python",
      "originalIndex": 30,
      "text": "What is the output of `'Hello'[1:4]`?"
    },
    {
      "subject": "html",
      "originalIndex": 24,
      "text": "What does `position: absolute` position an element relative to?"
    },
    {
      "subject": "crt",
      "originalIndex": 1,
      "text": "Find the next number in the series: 2, 6, 12, 20, 30, ?"
    },
    {
      "subject": "crt",
      "originalIndex": 5,
      "text": "A can complete a job in 10 days and B in 15 days. Working together, how many days will they take?"
    },
    {
      "subject": "crt",
      "originalIndex": 14,
      "text": "A boat travels 20 km downstream in 2 hours and 20 km upstream in 4 hours. Find the speed of the boat in still water."
    },
    {
      "subject": "crt",
      "originalIndex": 44,
      "text": "If the cost price of 20 articles equals the selling price of 16 articles, what is the profit percentage?"
    },
    {
      "subject": "gk",
      "originalIndex": 18,
      "text": "What is the chemical symbol for gold?"
    },
    {
      "subject": "gk",
      "originalIndex": 190,
      "text": "Which African country was formerly known as Abyssinia?"
    },
    {
      "subject": "gk",
      "originalIndex": 192,
      "text": "What is the capital of Brazil?"
    },
    {
      "subject": "gk",
      "originalIndex": 196,
      "text": "Which river flows through Egypt and is vital to its agriculture?"
    },
    {
      "subject": "gk",
      "originalIndex": 202,
      "text": "Which is the highest waterfall in the world?"
    },
    {
      "subject": "gk",
      "originalIndex": 205,
      "text": "Which is the longest river in India?"
    },
    {
      "subject": "gk",
      "originalIndex": 209,
      "text": "Which is the largest freshwater lake in the world by surface area?"
    },
    {
      "subject": "gk",
      "originalIndex": 210,
      "text": "Which Indian union territory is an archipelago in the Bay of Bengal?"
    },
    {
      "subject": "gk",
      "originalIndex": 215,
      "text": "In which year did World War II end?"
    },
    {
      "subject": "gk",
      "originalIndex": 216,
      "text": "Who led the Salt March (Dandi March) in 1930?"
    },
    {
      "subject": "gk",
      "originalIndex": 218,
      "text": "Who was the last Mughal emperor of India?"
    },
    {
      "subject": "gk",
      "originalIndex": 225,
      "text": "Who was known as the 'Iron Man of India'?"
    },
    {
      "subject": "gk",
      "originalIndex": 240,
      "text": "Which planet is famous for its prominent ring system?"
    }
  ],
  "nearDuplicatesConsolidated": [
    {
      "subject": "gk",
      "originalIndex": 0,
      "text": "Who is known as the Father of the Indian Constitution?",
      "reason": "Merged near-duplicate Dr. B. R. Ambedkar Constitution question."
    },
    {
      "subject": "gk",
      "originalIndex": 1,
      "text": "Which is the largest planet in our solar system?",
      "reason": "Merged near-duplicate Jupiter largest planet question."
    },
    {
      "subject": "gk",
      "originalIndex": 7,
      "text": "Which is the smallest country in the world by area?",
      "reason": "Merged near-duplicate Vatican City smallest country question."
    },
    {
      "subject": "gk",
      "originalIndex": 49,
      "text": "What is the SI unit of electric current?",
      "reason": "Merged near-duplicate Ampere SI unit question."
    },
    {
      "subject": "neet",
      "originalIndex": 0,
      "text": "Which of these is the powerhouse of the cell?",
      "reason": "Merged with enhanced NEET curated stem."
    },
    {
      "subject": "neet",
      "originalIndex": 1,
      "text": "The functional unit of the kidney is called the:",
      "reason": "Merged with enhanced NEET curated stem."
    },
    {
      "subject": "neet",
      "originalIndex": 3,
      "text": "DNA replication is described as:",
      "reason": "Merged with enhanced NEET curated stem."
    },
    {
      "subject": "neet",
      "originalIndex": 4,
      "text": "Which hormone regulates blood glucose by promoting its uptake into cells?",
      "reason": "Merged with enhanced NEET curated stem."
    },
    {
      "subject": "neet",
      "originalIndex": 6,
      "text": "Which of these is a non-membranous cell organelle?",
      "reason": "Merged with enhanced NEET curated stem."
    },
    {
      "subject": "neet",
      "originalIndex": 12,
      "text": "Which of the following is NOT a nitrogenous base found in DNA?",
      "reason": "Merged with enhanced NEET curated stem."
    },
    {
      "subject": "neet",
      "originalIndex": 13,
      "text": "Xylem tissue in plants is primarily responsible for the transport of:",
      "reason": "Merged with enhanced NEET curated stem."
    },
    {
      "subject": "neet",
      "originalIndex": 14,
      "text": "The Krebs cycle takes place in which part of the cell?",
      "reason": "Merged with enhanced NEET curated stem."
    },
    {
      "subject": "neet",
      "originalIndex": 18,
      "text": "Which type of immunity is provided by antibodies received from mother's milk?",
      "reason": "Merged with enhanced NEET curated stem."
    },
    {
      "subject": "neet",
      "originalIndex": 19,
      "text": "Meiosis results in the formation of how many daughter cells from one parent cell?",
      "reason": "Merged with enhanced NEET curated stem."
    },
    {
      "subject": "jee",
      "originalIndex": 5,
      "text": "Which gas law states that pressure is inversely proportional to volume at constant temperature?",
      "reason": "Merged with enhanced JEE curated stem."
    },
    {
      "subject": "jee",
      "originalIndex": 9,
      "text": "The integral of `1/x` with respect to x is:",
      "reason": "Merged with enhanced JEE curated stem."
    },
    {
      "subject": "jee",
      "originalIndex": 10,
      "text": "An isotope differs from another isotope of the same element in the number of:",
      "reason": "Merged with enhanced JEE curated stem."
    },
    {
      "subject": "jee",
      "originalIndex": 13,
      "text": "Which quantum number determines the shape of an orbital?",
      "reason": "Merged with enhanced JEE curated stem."
    },
    {
      "subject": "jee",
      "originalIndex": 16,
      "text": "The escape velocity of Earth is approximately:",
      "reason": "Merged with enhanced JEE curated stem."
    },
    {
      "subject": "jee",
      "originalIndex": 18,
      "text": "The centripetal acceleration of an object moving in a circle of radius r with speed v is given by:",
      "reason": "Merged with enhanced JEE curated stem."
    }
  ]
};

export const BANK: Record<string, Question[]> = {
  "python": [
    {
      "id": "python-cur-1",
      "text": "What is the output of `print(type([]))`?",
      "opts": [
        "<class 'list'>",
        "<class 'array'>",
        "<class 'tuple'>",
        "list"
      ],
      "ans": 0,
      "cat": "Core Syntax & Operators",
      "difficulty": "easy",
      "exp": "Square brackets `[]` create a Python list instance, and `type([])` returns its class representation `<class 'list'>`."
    },
    {
      "id": "python-cur-2",
      "text": "Which keyword is used to define a function in Python?",
      "opts": [
        "func",
        "def",
        "function",
        "lambda"
      ],
      "ans": 1,
      "cat": "Functions & Generators",
      "difficulty": "medium",
      "exp": "In Python, named functions are declared using the `def` keyword followed by the function name and parameter list."
    },
    {
      "id": "python-cur-3",
      "text": "What does `len('hello')` return?",
      "opts": [
        "4",
        "5",
        "6",
        "Error"
      ],
      "ans": 1,
      "cat": "Data Structures",
      "difficulty": "hard",
      "exp": "`len()` counts the number of characters in the string `'hello'`, which has 5 characters."
    },
    {
      "id": "python-cur-4",
      "text": "Which of these built-in types is immutable in Python?",
      "opts": [
        "list",
        "dict",
        "tuple",
        "set"
      ],
      "ans": 2,
      "cat": "Core Syntax & Operators",
      "difficulty": "easy",
      "exp": "Tuples cannot be modified in place after creation, whereas lists, dictionaries, and sets are mutable collections."
    },
    {
      "id": "python-cur-5",
      "text": "What is the output of `2 ** 3`?",
      "opts": [
        "6",
        "8",
        "9",
        "Error"
      ],
      "ans": 1,
      "cat": "Core Syntax & Operators",
      "difficulty": "medium",
      "exp": "The `**` operator performs exponentiation in Python, computing 2³ = 8."
    },
    {
      "id": "python-cur-6",
      "text": "Which method adds a single item to the end of a list?",
      "opts": [
        "add()",
        "append()",
        "insert()",
        "push()"
      ],
      "ans": 1,
      "cat": "Data Structures",
      "difficulty": "hard",
      "exp": "`list.append(x)` appends a single element `x` to the end of the list in O(1) amortized time."
    },
    {
      "id": "python-cur-7",
      "text": "What sequence of integers does `list(range(5))` generate?",
      "opts": [
        "0 to 5",
        "1 to 5",
        "0 to 4",
        "1 to 4"
      ],
      "ans": 2,
      "cat": "Data Structures",
      "difficulty": "easy",
      "exp": "`range(stop)` starts at 0 by default and stops at `stop - 1`, producing `[0, 1, 2, 3, 4]`."
    },
    {
      "id": "python-cur-8",
      "text": "How do you start a single-line comment in Python?",
      "opts": [
        "//",
        "#",
        "/*",
        "--"
      ],
      "ans": 1,
      "cat": "Core Syntax & Operators",
      "difficulty": "medium",
      "exp": "Python uses the hash symbol `#` to start a single-line comment."
    },
    {
      "id": "python-cur-9",
      "text": "What is the result of floor division `10 // 3`?",
      "opts": [
        "3.33",
        "3",
        "4",
        "Error"
      ],
      "ans": 1,
      "cat": "Modules & I/O",
      "difficulty": "hard",
      "exp": "The `//` operator performs floor division, discarding the fractional part of 10 / 3 = 3.333... to yield `3`."
    },
    {
      "id": "python-cur-10",
      "text": "Which of the following literals creates a Python dictionary?",
      "opts": [
        "{1, 2, 3}",
        "[1, 2, 3]",
        "{'a': 1}",
        "(1, 2)"
      ],
      "ans": 2,
      "cat": "Data Structures",
      "difficulty": "easy",
      "exp": "Curly braces containing `key: value` pairs (`{'a': 1}`) construct a dictionary (`dict`), while `{1, 2, 3}` creates a set."
    },
    {
      "id": "python-cur-11",
      "text": "What does `self` refer to inside an instance method of a Python class?",
      "opts": [
        "The class itself",
        "The current instance",
        "A global variable",
        "A static method"
      ],
      "ans": 1,
      "cat": "OOP",
      "difficulty": "medium",
      "exp": "`self` is the conventional first parameter of an instance method and binds to the specific object instance on which the method was called."
    },
    {
      "id": "python-cur-12",
      "text": "Which standard library module provides regular expression support in Python?",
      "opts": [
        "regex",
        "re",
        "pyregex",
        "restring"
      ],
      "ans": 1,
      "cat": "Modules & I/O",
      "difficulty": "hard",
      "exp": "Python's built-in `re` module provides regular expression matching operations (`re.search`, `re.match`, `re.findall`)."
    },
    {
      "id": "python-cur-13",
      "text": "What is the output of `bool(0)` in Python?",
      "opts": [
        "True",
        "False",
        "0",
        "Error"
      ],
      "ans": 1,
      "cat": "Core Syntax & Operators",
      "difficulty": "easy",
      "exp": "In Python's truth value testing, numeric zero (`0`, `0.0`) and empty containers evaluate to `False`."
    },
    {
      "id": "python-cur-14",
      "text": "Which built-in function converts a numeric string into an integer?",
      "opts": [
        "int()",
        "str()",
        "float()",
        "num()"
      ],
      "ans": 0,
      "cat": "Functions & Generators",
      "difficulty": "medium",
      "exp": "`int('42')` parses a string of digits and returns the integer value `42`."
    },
    {
      "id": "python-cur-15",
      "text": "What is a `lambda` function in Python?",
      "opts": [
        "A named recursive function",
        "An anonymous inline function",
        "A class constructor",
        "A loop construct"
      ],
      "ans": 1,
      "cat": "Functions & Generators",
      "difficulty": "hard",
      "exp": "A `lambda` expression creates a small anonymous function limited to a single expression, e.g., `lambda x: x * 2`."
    },
    {
      "id": "python-cur-16",
      "text": "Which keyword is used to catch exceptions in Python?",
      "opts": [
        "catch",
        "except",
        "error",
        "rescue"
      ],
      "ans": 1,
      "cat": "Exceptions",
      "difficulty": "easy",
      "exp": "Python uses `try ... except` blocks rather than `try ... catch` to handle runtime exceptions."
    },
    {
      "id": "python-cur-17",
      "text": "What does the slice `my_list[::-1]` do?",
      "opts": [
        "Copies the list in original order",
        "Returns a reversed copy of the list",
        "Sorts the list in place",
        "Empties the list"
      ],
      "ans": 1,
      "cat": "Data Structures",
      "difficulty": "medium",
      "exp": "A slice with step `-1` (`[::-1]`) traverses the sequence from end to start, returning a new reversed list."
    },
    {
      "id": "python-cur-18",
      "text": "Which data structure operates on a Last-In, First-Out (LIFO) principle?",
      "opts": [
        "Queue",
        "Stack",
        "Deque",
        "Priority Queue"
      ],
      "ans": 1,
      "cat": "Modules & I/O",
      "difficulty": "hard",
      "exp": "A Stack follows LIFO order: the most recently pushed item is the first one popped."
    },
    {
      "id": "python-cur-19",
      "text": "What is the output of `3 == 3.0` in Python?",
      "opts": [
        "True",
        "False",
        "TypeError",
        "None"
      ],
      "ans": 0,
      "cat": "Core Syntax & Operators",
      "difficulty": "easy",
      "exp": "The `==` operator compares numeric values across `int` and `float`, so `3` and `3.0` are equal in value (`True`)."
    },
    {
      "id": "python-cur-20",
      "text": "Which list method removes and returns the last element by default?",
      "opts": [
        "remove()",
        "pop()",
        "del()",
        "clear()"
      ],
      "ans": 1,
      "cat": "Data Structures",
      "difficulty": "medium",
      "exp": "`list.pop()` removes the element at the given index (defaulting to `-1`, the last item) and returns it."
    },
    {
      "id": "python-cur-21",
      "text": "What is the correct mode string to open a file for appending data at the end?",
      "opts": [
        "'r'",
        "'w'",
        "'a'",
        "'x'"
      ],
      "ans": 2,
      "cat": "Modules & I/O",
      "difficulty": "hard",
      "exp": "Mode `'a'` opens a file for appending; writes are added to the end without truncating existing content."
    },
    {
      "id": "python-cur-22",
      "text": "What is the output of `'abc'.upper()`?",
      "opts": [
        "abc",
        "ABC",
        "Abc",
        "Error"
      ],
      "ans": 1,
      "cat": "Core Syntax & Operators",
      "difficulty": "easy",
      "exp": "`.upper()` returns a new string with all cased characters converted to uppercase (`'ABC'`)."
    },
    {
      "id": "python-cur-23",
      "text": "What does the `is` operator test in Python?",
      "opts": [
        "Value equality",
        "Object identity (same memory address)",
        "Subclass inheritance",
        "Container membership"
      ],
      "ans": 1,
      "cat": "Core Syntax & Operators",
      "difficulty": "medium",
      "exp": "`a is b` evaluates to `True` only if `a` and `b` reference the exact same object in memory (`id(a) == id(b)`)."
    },
    {
      "id": "python-cur-24",
      "text": "What is the output of `len({1, 2, 2, 3})`?",
      "opts": [
        "4",
        "3",
        "2",
        "Error"
      ],
      "ans": 1,
      "cat": "Data Structures",
      "difficulty": "hard",
      "exp": "Set literals automatically deduplicate elements, so `{1, 2, 2, 3}` becomes `{1, 2, 3}` with length `3`."
    },
    {
      "id": "python-cur-25",
      "text": "Which keyword turns a Python function into a generator function?",
      "opts": [
        "return",
        "yield",
        "gen",
        "async"
      ],
      "ans": 1,
      "cat": "Functions & Generators",
      "difficulty": "hard",
      "exp": "Using `yield` inside a function makes it return a lazy generator iterator that produces values one at a time."
    },
    {
      "id": "python-cur-26",
      "text": "What does list comprehension `[x * 2 for x in range(3)]` evaluate to?",
      "opts": [
        "[0, 2, 4]",
        "[0, 1, 2]",
        "[2, 4, 6]",
        "[1, 2, 3]"
      ],
      "ans": 0,
      "cat": "Data Structures",
      "difficulty": "hard",
      "exp": "`range(3)` yields `0, 1, 2`; multiplying each by 2 gives `[0, 2, 4]`."
    },
    {
      "id": "python-cur-27",
      "text": "Which exception is raised when dividing a number by zero in Python?",
      "opts": [
        "ValueError",
        "ZeroDivisionError",
        "KeyError",
        "TypeError"
      ],
      "ans": 1,
      "cat": "Exceptions",
      "difficulty": "hard",
      "exp": "Attempting `x / 0` or `x // 0` raises `ZeroDivisionError`, a subclass of `ArithmeticError`."
    },
    {
      "id": "python-cur-28",
      "text": "How do you check whether key `k` exists in dictionary `d`?",
      "opts": [
        "d.has(k)",
        "k in d",
        "d.contains(k)",
        "d.exists(k)"
      ],
      "ans": 1,
      "cat": "Data Structures",
      "difficulty": "easy",
      "exp": "The `in` operator checks dictionary keys in O(1) average time (`k in d`)."
    },
    {
      "id": "python-cur-29",
      "text": "What does the `pass` statement do in Python?",
      "opts": [
        "Breaks out of a loop",
        "Acts as a null no-op placeholder",
        "Skips to the next iteration",
        "Raises NotImplementedError"
      ],
      "ans": 1,
      "cat": "Core Syntax & Operators",
      "difficulty": "medium",
      "exp": "`pass` is a null operation used when syntax requires a statement block but no code needs to execute."
    },
    {
      "id": "python-cur-30",
      "text": "What is the output of `'Hello'[1:4]`?",
      "opts": [
        "Hel",
        "ell",
        "ello",
        "Hell"
      ],
      "ans": 1,
      "cat": "Core Syntax & Operators",
      "difficulty": "hard",
      "exp": "String slicing `[1:4]` extracts characters at indices 1, 2, and 3 (`'e'`, `'l'`, `'l'`), producing `'ell'`."
    },
    {
      "id": "python-cur-31",
      "text": "What is a lambda function?",
      "opts": [
        "A named function",
        "An anonymous inline function",
        "A class method",
        "A loop construct"
      ],
      "ans": 1,
      "cat": "Functions & Generators",
      "difficulty": "medium",
      "exp": "The correct option is \"An anonymous inline function\". In PYTHON (Functions & Generators), \"An anonymous inline function\" directly satisfies the concept or fact asked in: What is a lambda function?"
    },
    {
      "id": "python-cur-32",
      "text": "What does `list[::-1]` do?",
      "opts": [
        "Copies the list",
        "Reverses the list",
        "Sorts the list",
        "Empties the list"
      ],
      "ans": 1,
      "cat": "Data Structures",
      "difficulty": "easy",
      "exp": "The correct option is \"Reverses the list\". In PYTHON (Data Structures), \"Reverses the list\" directly satisfies the concept or fact asked in: What does `list[::-1]` do?"
    },
    {
      "id": "python-cur-33",
      "text": "Which data structure uses LIFO order?",
      "opts": [
        "Queue",
        "Stack",
        "List",
        "Dictionary"
      ],
      "ans": 1,
      "cat": "Modules & I/O",
      "difficulty": "medium",
      "exp": "The correct option is \"Stack\". In PYTHON (Modules & I/O), \"Stack\" directly satisfies the concept or fact asked in: Which data structure uses LIFO order?"
    },
    {
      "id": "python-cur-34",
      "text": "What is the output of `3 == 3.0`?",
      "opts": [
        "True",
        "False",
        "Error",
        "None"
      ],
      "ans": 0,
      "cat": "Core Syntax & Operators",
      "difficulty": "hard",
      "exp": "The correct option is \"True\". In PYTHON (Core Syntax & Operators), \"True\" directly satisfies the concept or fact asked in: What is the output of `3 == 3.0`?"
    },
    {
      "id": "python-cur-35",
      "text": "Which of these defines a set in Python?",
      "opts": [
        "[]",
        "{}",
        "()",
        "set{}"
      ],
      "ans": 1,
      "cat": "Data Structures",
      "difficulty": "hard",
      "exp": "The correct option is \"{}\". In PYTHON (Data Structures), \"{}\" directly satisfies the concept or fact asked in: Which of these defines a set in Python?"
    },
    {
      "id": "python-cur-36",
      "text": "What does the `is` operator check?",
      "opts": [
        "Equality of values",
        "Identity (same object)",
        "Type match only",
        "Membership"
      ],
      "ans": 1,
      "cat": "Core Syntax & Operators",
      "difficulty": "easy",
      "exp": "The correct option is \"Identity (same object)\". In PYTHON (Core Syntax & Operators), \"Identity (same object)\" directly satisfies the concept or fact asked in: What does the `is` operator check?"
    },
    {
      "id": "python-cur-37",
      "text": "Which built-in function returns the largest item in an iterable?",
      "opts": [
        "max()",
        "top()",
        "highest()",
        "big()"
      ],
      "ans": 0,
      "cat": "Functions & Generators",
      "difficulty": "medium",
      "exp": "The correct option is \"max()\". In PYTHON (Functions & Generators), \"max()\" directly satisfies the concept or fact asked in: Which built-in function returns the largest item in an iterable?"
    },
    {
      "id": "python-cur-38",
      "text": "What is a decorator in Python?",
      "opts": [
        "A design pattern only",
        "A function that modifies another function",
        "A type of loop",
        "A class attribute"
      ],
      "ans": 1,
      "cat": "Functions & Generators",
      "difficulty": "hard",
      "exp": "The correct option is \"A function that modifies another function\". In PYTHON (Functions & Generators), \"A function that modifies another function\" directly satisfies the concept or fact asked in: What is a decorator in Python?"
    },
    {
      "id": "python-cur-39",
      "text": "What is the output of `3 + 4 * 2`?",
      "opts": [
        "14",
        "11",
        "10",
        "Error"
      ],
      "ans": 1,
      "cat": "Core Syntax & Operators",
      "difficulty": "medium",
      "exp": "The correct option is \"11\". In PYTHON (Core Syntax & Operators), \"11\" directly satisfies the concept or fact asked in: What is the output of `3 + 4 * 2`?"
    },
    {
      "id": "python-cur-40",
      "text": "Which method converts a list to a set?",
      "opts": [
        "list()",
        "set()",
        "tuple()",
        "dict()"
      ],
      "ans": 1,
      "cat": "Data Structures",
      "difficulty": "hard",
      "exp": "The correct option is \"set()\". In PYTHON (Data Structures), \"set()\" directly satisfies the concept or fact asked in: Which method converts a list to a set?"
    },
    {
      "id": "python-cur-41",
      "text": "Which of these is used to define a class in Python?",
      "opts": [
        "class",
        "struct",
        "object",
        "def"
      ],
      "ans": 0,
      "cat": "OOP",
      "difficulty": "easy",
      "exp": "The correct option is \"class\". In PYTHON (OOP), \"class\" directly satisfies the concept or fact asked in: Which of these is used to define a class in Python?"
    },
    {
      "id": "python-cur-42",
      "text": "What does `__init__` do in a Python class?",
      "opts": [
        "Deletes the object",
        "Initializes a new object",
        "Prints the object",
        "Compares objects"
      ],
      "ans": 1,
      "cat": "OOP",
      "difficulty": "medium",
      "exp": "The correct option is \"Initializes a new object\". In PYTHON (OOP), \"Initializes a new object\" directly satisfies the concept or fact asked in: What does `__init__` do in a Python class?"
    },
    {
      "id": "python-cur-43",
      "text": "Which function checks if all characters in a string are digits?",
      "opts": [
        "isdigit()",
        "isnumeric()",
        "isdecimal()",
        "isint()"
      ],
      "ans": 0,
      "cat": "Functions & Generators",
      "difficulty": "hard",
      "exp": "The correct option is \"isdigit()\". In PYTHON (Functions & Generators), \"isdigit()\" directly satisfies the concept or fact asked in: Which function checks if all characters in a string are digits?"
    },
    {
      "id": "python-cur-44",
      "text": "What is the output of `[1,2,3] + [4,5]`?",
      "opts": [
        "[1,2,3,4,5]",
        "[5,7,8]",
        "Error",
        "[1,2,3,[4,5]]"
      ],
      "ans": 0,
      "cat": "Core Syntax & Operators",
      "difficulty": "easy",
      "exp": "The correct option is \"[1,2,3,4,5]\". In PYTHON (Core Syntax & Operators), \"[1,2,3,4,5]\" directly satisfies the concept or fact asked in: What is the output of `[1,2,3] + [4,5]`?"
    },
    {
      "id": "python-cur-45",
      "text": "Which keyword is used to import a module?",
      "opts": [
        "include",
        "import",
        "using",
        "require"
      ],
      "ans": 1,
      "cat": "Modules & I/O",
      "difficulty": "medium",
      "exp": "The correct option is \"import\". In PYTHON (Modules & I/O), \"import\" directly satisfies the concept or fact asked in: Which keyword is used to import a module?"
    },
    {
      "id": "python-cur-46",
      "text": "What does `enumerate()` return?",
      "opts": [
        "Only values",
        "Only indices",
        "Index-value pairs",
        "A dictionary"
      ],
      "ans": 2,
      "cat": "Modules & I/O",
      "difficulty": "hard",
      "exp": "The correct option is \"Index-value pairs\". In PYTHON (Modules & I/O), \"Index-value pairs\" directly satisfies the concept or fact asked in: What does `enumerate()` return?"
    },
    {
      "id": "python-cur-47",
      "text": "Which operator is used for exponentiation?",
      "opts": [
        "^",
        "**",
        "exp",
        "pow"
      ],
      "ans": 1,
      "cat": "Core Syntax & Operators",
      "difficulty": "easy",
      "exp": "The correct option is \"**\". In PYTHON (Core Syntax & Operators), \"**\" directly satisfies the concept or fact asked in: Which operator is used for exponentiation?"
    },
    {
      "id": "python-cur-48",
      "text": "What is a Python tuple's key property?",
      "opts": [
        "Mutable",
        "Immutable",
        "Unordered",
        "Duplicates not allowed"
      ],
      "ans": 1,
      "cat": "Data Structures",
      "difficulty": "medium",
      "exp": "The correct option is \"Immutable\". In PYTHON (Data Structures), \"Immutable\" directly satisfies the concept or fact asked in: What is a Python tuple's key property?"
    },
    {
      "id": "python-cur-49",
      "text": "Which built-in function returns the number of items in an object?",
      "opts": [
        "count()",
        "len()",
        "size()",
        "length()"
      ],
      "ans": 1,
      "cat": "Functions & Generators",
      "difficulty": "hard",
      "exp": "The correct option is \"len()\". In PYTHON (Functions & Generators), \"len()\" directly satisfies the concept or fact asked in: Which built-in function returns the number of items in an object?"
    },
    {
      "id": "python-cur-50",
      "text": "What is the output of `type(3.0)`?",
      "opts": [
        "<class 'int'>",
        "<class 'float'>",
        "<class 'double'>",
        "<class 'number'>"
      ],
      "ans": 1,
      "cat": "Core Syntax & Operators",
      "difficulty": "easy",
      "exp": "The correct option is \"<class 'float'>\". In PYTHON (Core Syntax & Operators), \"<class 'float'>\" directly satisfies the concept or fact asked in: What is the output of `type(3.0)`?"
    },
    {
      "id": "python-cur-51",
      "text": "Which of these is a valid way to open a file for reading in Python?",
      "opts": [
        "open('f.txt','r')",
        "file('f.txt')",
        "read('f.txt')",
        "input('f.txt')"
      ],
      "ans": 0,
      "cat": "Modules & I/O",
      "difficulty": "medium",
      "exp": "The correct option is \"open('f.txt','r')\". In PYTHON (Modules & I/O), \"open('f.txt','r')\" directly satisfies the concept or fact asked in: Which of these is a valid way to open a file for reading in Python?"
    },
    {
      "id": "python-cur-52",
      "text": "Which exception is raised when dividing by zero?",
      "opts": [
        "ValueError",
        "ZeroDivisionError",
        "ArithmeticError",
        "TypeError"
      ],
      "ans": 1,
      "cat": "Exceptions",
      "difficulty": "easy",
      "exp": "The correct option is \"ZeroDivisionError\". In PYTHON (Exceptions), \"ZeroDivisionError\" directly satisfies the concept or fact asked in: Which exception is raised when dividing by zero?"
    },
    {
      "id": "python-cur-53",
      "text": "Which of these correctly copies a list without referencing the original?",
      "opts": [
        "b = a",
        "b = a.copy()",
        "b = a[:0]",
        "b = list"
      ],
      "ans": 1,
      "cat": "Data Structures",
      "difficulty": "hard",
      "exp": "The correct option is \"b = a.copy()\". In PYTHON (Data Structures), \"b = a.copy()\" directly satisfies the concept or fact asked in: Which of these correctly copies a list without referencing the original?"
    },
    {
      "id": "python-cur-54",
      "text": "What does the `pass` statement do?",
      "opts": [
        "Exits a loop",
        "Does nothing, acts as a placeholder",
        "Skips one iteration",
        "Raises an error"
      ],
      "ans": 1,
      "cat": "Core Syntax & Operators",
      "difficulty": "easy",
      "exp": "The correct option is \"Does nothing, acts as a placeholder\". In PYTHON (Core Syntax & Operators), \"Does nothing, acts as a placeholder\" directly satisfies the concept or fact asked in: What does the `pass` statement do?"
    },
    {
      "id": "python-cur-55",
      "text": "Which function converts a value into a string?",
      "opts": [
        "str()",
        "string()",
        "toStr()",
        "cast()"
      ],
      "ans": 0,
      "cat": "Functions & Generators",
      "difficulty": "medium",
      "exp": "The correct option is \"str()\". In PYTHON (Functions & Generators), \"str()\" directly satisfies the concept or fact asked in: Which function converts a value into a string?"
    }
  ],
  "java": [
    {
      "id": "java-cur-1",
      "text": "Which keyword is used for a class to inherit from a superclass in Java?",
      "opts": [
        "implements",
        "extends",
        "inherits",
        "super"
      ],
      "ans": 1,
      "cat": "OOP & Inheritance",
      "difficulty": "easy",
      "exp": "In Java, a class inherits fields and methods from a parent class using the `extends` keyword."
    },
    {
      "id": "java-cur-2",
      "text": "What is the default value of an uninitialized `boolean` instance field in Java?",
      "opts": [
        "true",
        "false",
        "0",
        "null"
      ],
      "ans": 1,
      "cat": "Java Fundamentals",
      "difficulty": "medium",
      "exp": "Java initializes class/instance `boolean` fields to `false` by default."
    },
    {
      "id": "java-cur-3",
      "text": "Which method serves as the entry point for executing a Java application?",
      "opts": [
        "start()",
        "main()",
        "run()",
        "init()"
      ],
      "ans": 1,
      "cat": "Exception Handling",
      "difficulty": "hard",
      "exp": "The JVM starts execution by invoking `public static void main(String[] args)`."
    },
    {
      "id": "java-cur-4",
      "text": "Java achieves platform independence ('Write Once, Run Anywhere') primarily through:",
      "opts": [
        "The C preprocessor",
        "Bytecode executed by the JVM",
        "Platform-specific source files",
        "Hardware emulation"
      ],
      "ans": 1,
      "cat": "Java Fundamentals",
      "difficulty": "easy",
      "exp": "`javac` compiles source code into platform-neutral bytecode (`.class`), which any Java Virtual Machine (JVM) can execute."
    },
    {
      "id": "java-cur-5",
      "text": "Which keyword prevents a class from being subclassed in Java?",
      "opts": [
        "static",
        "final",
        "const",
        "private"
      ],
      "ans": 1,
      "cat": "OOP & Inheritance",
      "difficulty": "medium",
      "exp": "Declaring a class `final` (such as `final class String`) forbids any other class from extending it."
    },
    {
      "id": "java-cur-6",
      "text": "What is the exact size of the primitive `int` type in Java?",
      "opts": [
        "16 bits",
        "32 bits",
        "64 bits",
        "Platform dependent"
      ],
      "ans": 1,
      "cat": "Java Fundamentals",
      "difficulty": "hard",
      "exp": "In Java, `int` is strictly defined as a 32-bit signed two's-complement integer across all platforms."
    },
    {
      "id": "java-cur-7",
      "text": "Which `java.util` collection interface forbids duplicate elements?",
      "opts": [
        "List",
        "Set",
        "Queue",
        "Collection"
      ],
      "ans": 1,
      "cat": "OOP & Inheritance",
      "difficulty": "easy",
      "exp": "A `Set` models a mathematical set and rejects duplicate elements based on `.equals()` and `.hashCode()`."
    },
    {
      "id": "java-cur-8",
      "text": "Which operator allocates memory on the heap for a new object instance?",
      "opts": [
        "new",
        "create",
        "malloc",
        "instance"
      ],
      "ans": 0,
      "cat": "OOP & Inheritance",
      "difficulty": "medium",
      "exp": "The `new` operator allocates heap memory and invokes the class constructor."
    },
    {
      "id": "java-cur-9",
      "text": "Which of the following is NOT a valid Java access modifier?",
      "opts": [
        "public",
        "private",
        "protected",
        "internal"
      ],
      "ans": 3,
      "cat": "Java Fundamentals",
      "difficulty": "hard",
      "exp": "Java has `public`, `protected`, `private`, and package-private (no keyword); `internal` belongs to C#."
    },
    {
      "id": "java-cur-10",
      "text": "Which interface is a marker interface (having no methods) in Java?",
      "opts": [
        "Runnable",
        "Serializable",
        "Comparable",
        "Iterable"
      ],
      "ans": 1,
      "cat": "OOP & Inheritance",
      "difficulty": "easy",
      "exp": "`java.io.Serializable` has zero methods and simply tags a class as eligible for serialization."
    },
    {
      "id": "java-cur-11",
      "text": "What is method overloading in Java?",
      "opts": [
        "Same method name with different parameter lists in the same class",
        "Redefining a superclass method with the same signature",
        "Hiding a private field",
        "Declaring multiple constructors with identical parameters"
      ],
      "ans": 0,
      "cat": "OOP & Inheritance",
      "difficulty": "medium",
      "exp": "Compile-time polymorphism (overloading) allows multiple methods with the same name as long as their parameter types, count, or order differ."
    },
    {
      "id": "java-cur-12",
      "text": "Which of these is a checked exception that must be declared or caught?",
      "opts": [
        "NullPointerException",
        "IOException",
        "ArithmeticException",
        "ArrayIndexOutOfBoundsException"
      ],
      "ans": 1,
      "cat": "Exception Handling",
      "difficulty": "hard",
      "exp": "`IOException` extends `Exception` (not `RuntimeException`), so the compiler requires it to be caught or declared with `throws`."
    },
    {
      "id": "java-cur-13",
      "text": "What is the ultimate root superclass of all classes in Java?",
      "opts": [
        "Main",
        "Object",
        "Class",
        "Super"
      ],
      "ans": 1,
      "cat": "OOP & Inheritance",
      "difficulty": "easy",
      "exp": "`java.lang.Object` sits at the root of the Java class hierarchy; every class implicitly extends `Object`."
    },
    {
      "id": "java-cur-14",
      "text": "Which keyword is used by a class to fulfill an interface contract?",
      "opts": [
        "extends",
        "implements",
        "interface",
        "abstract"
      ],
      "ans": 1,
      "cat": "OOP & Inheritance",
      "difficulty": "medium",
      "exp": "A class uses `implements` to provide concrete implementations for an interface's abstract methods."
    },
    {
      "id": "java-cur-15",
      "text": "What is the result of integer division `7 / 2` in Java?",
      "opts": [
        "3.5",
        "3",
        "4",
        "Compile error"
      ],
      "ans": 1,
      "cat": "Java Fundamentals",
      "difficulty": "hard",
      "exp": "When both operands are `int`, `/` performs integer division and truncates toward zero, giving `3`."
    },
    {
      "id": "java-cur-16",
      "text": "Which package is imported automatically into every Java source file?",
      "opts": [
        "java.util",
        "java.lang",
        "java.io",
        "java.net"
      ],
      "ans": 1,
      "cat": "Java Fundamentals",
      "difficulty": "easy",
      "exp": "`java.lang` (containing `String`, `Math`, `Object`, `System`, `Integer`) is implicitly imported in every compilation unit."
    },
    {
      "id": "java-cur-17",
      "text": "What is the purpose of the `finally` block in exception handling?",
      "opts": [
        "Runs only when an exception is thrown",
        "Executes regardless of whether an exception was thrown or caught",
        "Replaces the catch block",
        "Prevents exceptions from occurring"
      ],
      "ans": 1,
      "cat": "OOP & Inheritance",
      "difficulty": "medium",
      "exp": "The `finally` block always executes after the `try`/`catch` blocks finish, making it ideal for resource cleanup."
    },
    {
      "id": "java-cur-18",
      "text": "Which `Set` implementation preserves the insertion order of elements?",
      "opts": [
        "HashSet",
        "TreeSet",
        "LinkedHashSet",
        "EnumSet"
      ],
      "ans": 2,
      "cat": "Collections & Arrays",
      "difficulty": "hard",
      "exp": "`LinkedHashSet` maintains a doubly-linked list across its hash table entries to preserve insertion order."
    },
    {
      "id": "java-cur-19",
      "text": "What does `==` compare when applied to two `String` object references?",
      "opts": [
        "Character sequence equality",
        "Reference identity (whether both point to the same object)",
        "Lexicographical order",
        "String length"
      ],
      "ans": 1,
      "cat": "OOP & Inheritance",
      "difficulty": "easy",
      "exp": "For object references, `==` compares memory addresses; `.equals()` must be used to compare string contents."
    },
    {
      "id": "java-cur-20",
      "text": "What is the average time complexity of `ArrayList.get(index)`?",
      "opts": [
        "O(1)",
        "O(n)",
        "O(log n)",
        "O(n²)"
      ],
      "ans": 0,
      "cat": "Collections & Arrays",
      "difficulty": "hard",
      "exp": "`ArrayList` is backed by a contiguous array, so random access by index takes constant O(1) time."
    },
    {
      "id": "java-cur-21",
      "text": "Java is platform independent because of:",
      "opts": [
        "Compiler",
        "JVM",
        "JDK",
        "IDE"
      ],
      "ans": 1,
      "cat": "Java Fundamentals",
      "difficulty": "hard",
      "exp": "The correct option is \"JVM\". In JAVA (Java Fundamentals), \"JVM\" directly satisfies the concept or fact asked in: Java is platform independent because of:"
    },
    {
      "id": "java-cur-22",
      "text": "What is the size of an int in Java?",
      "opts": [
        "16 bit",
        "32 bit",
        "64 bit",
        "8 bit"
      ],
      "ans": 1,
      "cat": "Java Fundamentals",
      "difficulty": "medium",
      "exp": "The correct option is \"32 bit\". In JAVA (Java Fundamentals), \"32 bit\" directly satisfies the concept or fact asked in: What is the size of an int in Java?"
    },
    {
      "id": "java-cur-23",
      "text": "Which collection does not allow duplicate elements?",
      "opts": [
        "List",
        "Set",
        "ArrayList",
        "LinkedList"
      ],
      "ans": 1,
      "cat": "Collections & Arrays",
      "difficulty": "hard",
      "exp": "The correct option is \"Set\". In JAVA (Collections & Arrays), \"Set\" directly satisfies the concept or fact asked in: Which collection does not allow duplicate elements?"
    },
    {
      "id": "java-cur-24",
      "text": "What is used to handle exceptions in Java?",
      "opts": [
        "try-catch",
        "if-else",
        "switch-case",
        "for-while"
      ],
      "ans": 0,
      "cat": "Exception Handling",
      "difficulty": "hard",
      "exp": "The correct option is \"try-catch\". In JAVA (Exception Handling), \"try-catch\" directly satisfies the concept or fact asked in: What is used to handle exceptions in Java?"
    },
    {
      "id": "java-cur-25",
      "text": "What does JVM stand for?",
      "opts": [
        "Java Virtual Machine",
        "Java Verified Method",
        "Java Variable Model",
        "Java Visual Machine"
      ],
      "ans": 0,
      "cat": "JVM & Concurrency",
      "difficulty": "medium",
      "exp": "The correct option is \"Java Virtual Machine\". In JAVA (JVM & Concurrency), \"Java Virtual Machine\" directly satisfies the concept or fact asked in: What does JVM stand for?"
    },
    {
      "id": "java-cur-26",
      "text": "Which keyword is used to allocate memory for an array?",
      "opts": [
        "alloc",
        "new",
        "malloc",
        "create"
      ],
      "ans": 1,
      "cat": "Collections & Arrays",
      "difficulty": "hard",
      "exp": "The correct option is \"new\". In JAVA (Collections & Arrays), \"new\" directly satisfies the concept or fact asked in: Which keyword is used to allocate memory for an array?"
    },
    {
      "id": "java-cur-27",
      "text": "What is method overloading?",
      "opts": [
        "Same method name, different parameters",
        "Same method, same parameters",
        "Overriding a parent method",
        "Deleting a method"
      ],
      "ans": 0,
      "cat": "OOP & Inheritance",
      "difficulty": "easy",
      "exp": "The correct option is \"Same method name, different parameters\". In JAVA (OOP & Inheritance), \"Same method name, different parameters\" directly satisfies the concept or fact asked in: What is method overloading?"
    },
    {
      "id": "java-cur-28",
      "text": "What is the use of the `super` keyword?",
      "opts": [
        "Refers to static members",
        "Refers to the parent class",
        "Creates a new object",
        "Defines a constant"
      ],
      "ans": 1,
      "cat": "OOP & Inheritance",
      "difficulty": "medium",
      "exp": "The correct option is \"Refers to the parent class\". In JAVA (OOP & Inheritance), \"Refers to the parent class\" directly satisfies the concept or fact asked in: What is the use of the `super` keyword?"
    },
    {
      "id": "java-cur-29",
      "text": "Which collection maintains key-value pairs?",
      "opts": [
        "ArrayList",
        "HashMap",
        "HashSet",
        "LinkedList"
      ],
      "ans": 1,
      "cat": "Collections & Arrays",
      "difficulty": "hard",
      "exp": "The correct option is \"HashMap\". In JAVA (Collections & Arrays), \"HashMap\" directly satisfies the concept or fact asked in: Which collection maintains key-value pairs?"
    },
    {
      "id": "java-cur-30",
      "text": "What does the `static` keyword mean for a method?",
      "opts": [
        "Belongs to instance",
        "Belongs to the class, not instance",
        "Cannot be called",
        "Runs only once ever"
      ],
      "ans": 1,
      "cat": "Java Fundamentals",
      "difficulty": "easy",
      "exp": "The correct option is \"Belongs to the class, not instance\". In JAVA (Java Fundamentals), \"Belongs to the class, not instance\" directly satisfies the concept or fact asked in: What does the `static` keyword mean for a method?"
    },
    {
      "id": "java-cur-31",
      "text": "Which loop is best when the number of iterations is known?",
      "opts": [
        "while",
        "do-while",
        "for",
        "if"
      ],
      "ans": 2,
      "cat": "Java Fundamentals",
      "difficulty": "medium",
      "exp": "The correct option is \"for\". In JAVA (Java Fundamentals), \"for\" directly satisfies the concept or fact asked in: Which loop is best when the number of iterations is known?"
    },
    {
      "id": "java-cur-32",
      "text": "What is autoboxing in Java?",
      "opts": [
        "Manual type casting",
        "Automatic conversion between primitive and wrapper types",
        "Array resizing",
        "Garbage collection"
      ],
      "ans": 1,
      "cat": "Java Fundamentals",
      "difficulty": "hard",
      "exp": "The correct option is \"Automatic conversion between primitive and wrapper types\". In JAVA (Java Fundamentals), \"Automatic conversion between primitive and wrapper types\" directly satisfies the concept or fact asked in: What is autoboxing in Java?"
    },
    {
      "id": "java-cur-33",
      "text": "Which of these is used for thread synchronization?",
      "opts": [
        "synchronized",
        "volatile only",
        "static",
        "final"
      ],
      "ans": 0,
      "cat": "JVM & Concurrency",
      "difficulty": "easy",
      "exp": "The correct option is \"synchronized\". In JAVA (JVM & Concurrency), \"synchronized\" directly satisfies the concept or fact asked in: Which of these is used for thread synchronization?"
    },
    {
      "id": "java-cur-34",
      "text": "What is the output of integer division `7/2` in Java?",
      "opts": [
        "3.5",
        "3",
        "4",
        "Error"
      ],
      "ans": 1,
      "cat": "Java Fundamentals",
      "difficulty": "medium",
      "exp": "The correct option is \"3\". In JAVA (Java Fundamentals), \"3\" directly satisfies the concept or fact asked in: What is the output of integer division `7/2` in Java?"
    },
    {
      "id": "java-cur-35",
      "text": "Which keyword is used to define an abstract class?",
      "opts": [
        "abstract",
        "interface",
        "virtual",
        "final"
      ],
      "ans": 0,
      "cat": "OOP & Inheritance",
      "difficulty": "hard",
      "exp": "The correct option is \"abstract\". In JAVA (OOP & Inheritance), \"abstract\" directly satisfies the concept or fact asked in: Which keyword is used to define an abstract class?"
    },
    {
      "id": "java-cur-36",
      "text": "What does garbage collection do in Java?",
      "opts": [
        "Deletes source code",
        "Automatically frees unused memory",
        "Compiles the program",
        "Formats the disk"
      ],
      "ans": 1,
      "cat": "Collections & Arrays",
      "difficulty": "easy",
      "exp": "The correct option is \"Automatically frees unused memory\". In JAVA (Collections & Arrays), \"Automatically frees unused memory\" directly satisfies the concept or fact asked in: What does garbage collection do in Java?"
    },
    {
      "id": "java-cur-37",
      "text": "Which of these is used to create a constant in Java?",
      "opts": [
        "const",
        "final",
        "static",
        "readonly"
      ],
      "ans": 1,
      "cat": "Java Fundamentals",
      "difficulty": "hard",
      "exp": "The correct option is \"final\". In JAVA (Java Fundamentals), \"final\" directly satisfies the concept or fact asked in: Which of these is used to create a constant in Java?"
    },
    {
      "id": "java-cur-38",
      "text": "What is the output of `System.out.println(10 == 10.0)`?",
      "opts": [
        "true",
        "false",
        "Compile error",
        "Runtime error"
      ],
      "ans": 0,
      "cat": "Java Fundamentals",
      "difficulty": "easy",
      "exp": "The correct option is \"true\". In JAVA (Java Fundamentals), \"true\" directly satisfies the concept or fact asked in: What is the output of `System.out.println(10 == 10.0)`?"
    },
    {
      "id": "java-cur-39",
      "text": "Which interface must a class implement to be used in a for-each loop?",
      "opts": [
        "Iterable",
        "Iterator",
        "Comparable",
        "Runnable"
      ],
      "ans": 0,
      "cat": "OOP & Inheritance",
      "difficulty": "medium",
      "exp": "The correct option is \"Iterable\". In JAVA (OOP & Inheritance), \"Iterable\" directly satisfies the concept or fact asked in: Which interface must a class implement to be used in a for-each loop?"
    },
    {
      "id": "java-cur-40",
      "text": "What is the purpose of the `finally` block?",
      "opts": [
        "Runs only if an exception occurs",
        "Always executes after try/catch",
        "Replaces catch",
        "Runs before try"
      ],
      "ans": 1,
      "cat": "OOP & Inheritance",
      "difficulty": "hard",
      "exp": "The correct option is \"Always executes after try/catch\". In JAVA (OOP & Inheritance), \"Always executes after try/catch\" directly satisfies the concept or fact asked in: What is the purpose of the `finally` block?"
    },
    {
      "id": "java-cur-41",
      "text": "Which of these is a wrapper class for `int`?",
      "opts": [
        "Int",
        "Integer",
        "INT",
        "IntWrapper"
      ],
      "ans": 1,
      "cat": "OOP & Inheritance",
      "difficulty": "easy",
      "exp": "The correct option is \"Integer\". In JAVA (OOP & Inheritance), \"Integer\" directly satisfies the concept or fact asked in: Which of these is a wrapper class for `int`?"
    },
    {
      "id": "java-cur-42",
      "text": "What does the `instanceof` operator check?",
      "opts": [
        "Variable type at compile time",
        "Object type at runtime",
        "Memory address",
        "Method signature"
      ],
      "ans": 1,
      "cat": "Java Fundamentals",
      "difficulty": "medium",
      "exp": "The correct option is \"Object type at runtime\". In JAVA (Java Fundamentals), \"Object type at runtime\" directly satisfies the concept or fact asked in: What does the `instanceof` operator check?"
    },
    {
      "id": "java-cur-43",
      "text": "Which keyword is used to call a parent class constructor?",
      "opts": [
        "this()",
        "super()",
        "parent()",
        "base()"
      ],
      "ans": 1,
      "cat": "OOP & Inheritance",
      "difficulty": "hard",
      "exp": "The correct option is \"super()\". In JAVA (OOP & Inheritance), \"super()\" directly satisfies the concept or fact asked in: Which keyword is used to call a parent class constructor?"
    },
    {
      "id": "java-cur-44",
      "text": "What is encapsulation in Java?",
      "opts": [
        "Hiding data using access modifiers",
        "Multiple inheritance",
        "Method overloading",
        "Exception handling"
      ],
      "ans": 0,
      "cat": "OOP & Inheritance",
      "difficulty": "easy",
      "exp": "The correct option is \"Hiding data using access modifiers\". In JAVA (OOP & Inheritance), \"Hiding data using access modifiers\" directly satisfies the concept or fact asked in: What is encapsulation in Java?"
    },
    {
      "id": "java-cur-45",
      "text": "Which collection class maintains insertion order?",
      "opts": [
        "HashSet",
        "TreeSet",
        "LinkedHashSet",
        "HashMap"
      ],
      "ans": 2,
      "cat": "OOP & Inheritance",
      "difficulty": "medium",
      "exp": "The correct option is \"LinkedHashSet\". In JAVA (OOP & Inheritance), \"LinkedHashSet\" directly satisfies the concept or fact asked in: Which collection class maintains insertion order?"
    },
    {
      "id": "java-cur-46",
      "text": "What is the output of concatenating a String and an int with `+`?",
      "opts": [
        "Compile error",
        "Concatenated string",
        "Sum of ASCII values",
        "Runtime error"
      ],
      "ans": 1,
      "cat": "Java Fundamentals",
      "difficulty": "hard",
      "exp": "The correct option is \"Concatenated string\". In JAVA (Java Fundamentals), \"Concatenated string\" directly satisfies the concept or fact asked in: What is the output of concatenating a String and an int with `+`?"
    },
    {
      "id": "java-cur-47",
      "text": "Which keyword makes a variable accessible only within its class?",
      "opts": [
        "public",
        "protected",
        "private",
        "default"
      ],
      "ans": 2,
      "cat": "OOP & Inheritance",
      "difficulty": "easy",
      "exp": "The correct option is \"private\". In JAVA (OOP & Inheritance), \"private\" directly satisfies the concept or fact asked in: Which keyword makes a variable accessible only within its class?"
    },
    {
      "id": "java-cur-48",
      "text": "What is a functional interface in Java?",
      "opts": [
        "An interface with multiple methods",
        "An interface with exactly one abstract method",
        "A class with static methods",
        "An abstract class"
      ],
      "ans": 1,
      "cat": "OOP & Inheritance",
      "difficulty": "medium",
      "exp": "The correct option is \"An interface with exactly one abstract method\". In JAVA (OOP & Inheritance), \"An interface with exactly one abstract method\" directly satisfies the concept or fact asked in: What is a functional interface in Java?"
    },
    {
      "id": "java-cur-49",
      "text": "Which of these is used for multi-threading in Java?",
      "opts": [
        "Thread class",
        "Runnable interface",
        "Both Thread and Runnable",
        "Process class"
      ],
      "ans": 2,
      "cat": "JVM & Concurrency",
      "difficulty": "hard",
      "exp": "The correct option is \"Both Thread and Runnable\". In JAVA (JVM & Concurrency), \"Both Thread and Runnable\" directly satisfies the concept or fact asked in: Which of these is used for multi-threading in Java?"
    },
    {
      "id": "java-cur-50",
      "text": "What does `equals()` compare by default in the Object class?",
      "opts": [
        "Field values",
        "Reference/memory address",
        "Hash code only",
        "Class name"
      ],
      "ans": 1,
      "cat": "OOP & Inheritance",
      "difficulty": "easy",
      "exp": "The correct option is \"Reference/memory address\". In JAVA (OOP & Inheritance), \"Reference/memory address\" directly satisfies the concept or fact asked in: What does `equals()` compare by default in the Object class?"
    },
    {
      "id": "java-cur-51",
      "text": "Which keyword is used to handle multiple exception types in one catch block (Java 7+)?",
      "opts": [
        "|",
        "&&",
        "or",
        "catch-all"
      ],
      "ans": 0,
      "cat": "Exception Handling",
      "difficulty": "medium",
      "exp": "The correct option is \"|\". In JAVA (Exception Handling), \"|\" directly satisfies the concept or fact asked in: Which keyword is used to handle multiple exception types in one catch block (Java 7+)?"
    },
    {
      "id": "java-cur-52",
      "text": "What is the time complexity of accessing an element in an ArrayList by index?",
      "opts": [
        "O(1)",
        "O(n)",
        "O(log n)",
        "O(n^2)"
      ],
      "ans": 0,
      "cat": "Collections & Arrays",
      "difficulty": "hard",
      "exp": "The correct option is \"O(1)\". In JAVA (Collections & Arrays), \"O(1)\" directly satisfies the concept or fact asked in: What is the time complexity of accessing an element in an ArrayList by index?"
    },
    {
      "id": "java-cur-53",
      "text": "Which of these correctly declares a generic class?",
      "opts": [
        "class Box<T>",
        "class Box[T]",
        "class Box(T)",
        "class Box{T}"
      ],
      "ans": 0,
      "cat": "OOP & Inheritance",
      "difficulty": "easy",
      "exp": "The correct option is \"class Box<T>\". In JAVA (OOP & Inheritance), \"class Box<T>\" directly satisfies the concept or fact asked in: Which of these correctly declares a generic class?"
    },
    {
      "id": "java-cur-54",
      "text": "What does the `transient` keyword do?",
      "opts": [
        "Prevents serialization of a field",
        "Makes a variable constant",
        "Makes a method abstract",
        "Improves performance"
      ],
      "ans": 0,
      "cat": "Java Fundamentals",
      "difficulty": "medium",
      "exp": "The correct option is \"Prevents serialization of a field\". In JAVA (Java Fundamentals), \"Prevents serialization of a field\" directly satisfies the concept or fact asked in: What does the `transient` keyword do?"
    },
    {
      "id": "java-cur-55",
      "text": "Which method is used to compare two strings for equality?",
      "opts": [
        "==",
        "equals()",
        "compareTo() only",
        "matches()"
      ],
      "ans": 1,
      "cat": "Java Fundamentals",
      "difficulty": "hard",
      "exp": "The correct option is \"equals()\". In JAVA (Java Fundamentals), \"equals()\" directly satisfies the concept or fact asked in: Which method is used to compare two strings for equality?"
    },
    {
      "id": "java-cur-56",
      "text": "What is the default capacity of an ArrayList in Java?",
      "opts": [
        "0",
        "10",
        "16",
        "100"
      ],
      "ans": 1,
      "cat": "Collections & Arrays",
      "difficulty": "easy",
      "exp": "The correct option is \"10\". In JAVA (Collections & Arrays), \"10\" directly satisfies the concept or fact asked in: What is the default capacity of an ArrayList in Java?"
    }
  ],
  "c": [
    {
      "id": "c-cur-1",
      "text": "Which standard header file must be included to use `printf()` and `scanf()`?",
      "opts": [
        "<stdlib.h>",
        "<stdio.h>",
        "<string.h>",
        "<math.h>"
      ],
      "ans": 1,
      "cat": "Standard Library & Strings",
      "difficulty": "easy",
      "exp": "`<stdio.h>` (Standard Input/Output) declares `printf`, `scanf`, `fgets`, and file I/O functions."
    },
    {
      "id": "c-cur-2",
      "text": "Which operator returns the memory address of a variable in C?",
      "opts": [
        "*",
        "&",
        "#",
        "->"
      ],
      "ans": 1,
      "cat": "Control Flow & Storage",
      "difficulty": "medium",
      "exp": "The unary address-of operator `&var` evaluates to the pointer address where `var` is stored."
    },
    {
      "id": "c-cur-3",
      "text": "What does `malloc(size)` return if memory allocation fails?",
      "opts": [
        "0 or NULL",
        "-1",
        "A garbage pointer",
        "Terminates the program automatically"
      ],
      "ans": 0,
      "cat": "Pointers & Memory",
      "difficulty": "hard",
      "exp": "`malloc()` returns a `NULL` pointer when the heap cannot satisfy the requested allocation."
    },
    {
      "id": "c-cur-4",
      "text": "Which loop construct is guaranteed to execute its body at least once?",
      "opts": [
        "for",
        "while",
        "do-while",
        "switch"
      ],
      "ans": 2,
      "cat": "Structs & Types",
      "difficulty": "easy",
      "exp": "A `do { ... } while (cond);` loop evaluates its condition at the bottom of the loop after running the body once."
    },
    {
      "id": "c-cur-5",
      "text": "What does `sizeof(char)` always evaluate to in C?",
      "opts": [
        "1",
        "2",
        "4",
        "Depends on architecture"
      ],
      "ans": 0,
      "cat": "Bitwise & Operators",
      "difficulty": "medium",
      "exp": "By the C standard definition, `sizeof(char)` is guaranteed to be `1` byte on all compliant implementations."
    },
    {
      "id": "c-cur-6",
      "text": "Which standard library function releases memory allocated by `malloc()`?",
      "opts": [
        "delete()",
        "remove()",
        "free()",
        "clear()"
      ],
      "ans": 2,
      "cat": "Pointers & Memory",
      "difficulty": "hard",
      "exp": "`free(ptr)` returns dynamically allocated heap memory back to the allocator; `<stdlib.h>` provides it."
    },
    {
      "id": "c-cur-7",
      "text": "What effect does `static` have on a local variable inside a C function?",
      "opts": [
        "Frees it immediately on return",
        "Preserves its value across multiple calls to the function",
        "Makes it accessible from all files",
        "Stores it in a CPU register"
      ],
      "ans": 1,
      "cat": "Control Flow & Storage",
      "difficulty": "easy",
      "exp": "A `static` local variable has static storage duration, so it is initialized once and retains its value between function calls."
    },
    {
      "id": "c-cur-8",
      "text": "Which function compares two null-terminated C strings lexicographically?",
      "opts": [
        "strcmp()",
        "strcompare()",
        "streq()",
        "memcopy()"
      ],
      "ans": 0,
      "cat": "Pointers & Memory",
      "difficulty": "medium",
      "exp": "`strcmp(s1, s2)` in `<string.h>` returns `0` when both strings are identical, `< 0` if `s1 < s2`, and `> 0` if `s1 > s2`."
    },
    {
      "id": "c-cur-9",
      "text": "How does `calloc(n, size)` differ from `malloc(n * size)`?",
      "opts": [
        "calloc zero-initializes all allocated bytes",
        "calloc allocates memory on the stack",
        "calloc is faster and leaves memory uninitialized",
        "They are completely identical"
      ],
      "ans": 0,
      "cat": "Pointers & Memory",
      "difficulty": "easy",
      "exp": "`calloc` allocates memory for an array of `n` elements of `size` bytes each and initializes every byte to `0`."
    },
    {
      "id": "c-cur-10",
      "text": "What happens if a non-static local variable is read before being initialized in C?",
      "opts": [
        "It defaults to 0",
        "It contains an indeterminate garbage value (undefined behavior)",
        "It defaults to -1",
        "The linker sets it to NULL"
      ],
      "ans": 1,
      "cat": "Control Flow & Storage",
      "difficulty": "medium",
      "exp": "Automatic local variables live on the stack and hold whatever bits were previously in that stack frame until explicitly initialized."
    },
    {
      "id": "c-cur-11",
      "text": "How do a `struct` and a `union` differ in C?",
      "opts": [
        "All members of a union share the same memory location",
        "Unions can only store integers",
        "Structs cannot be passed by pointer",
        "Unions allocate sum of all member sizes"
      ],
      "ans": 0,
      "cat": "Structs & Types",
      "difficulty": "hard",
      "exp": "A `struct` allocates separate space for every member, whereas a `union` overlays all members at offset 0 so its size equals its largest member."
    },
    {
      "id": "c-cur-12",
      "text": "What is the value of `5 & 3` in C (bitwise AND)?",
      "opts": [
        "1",
        "7",
        "6",
        "2"
      ],
      "ans": 0,
      "cat": "Pointers & Memory",
      "difficulty": "easy",
      "exp": "In binary, `5` is `0101` and `3` is `0011`. Bitwise AND keeps only bits set in both: `0101 & 0011 = 0001` (`1`)."
    },
    {
      "id": "c-cur-13",
      "text": "What does `typedef` do in C?",
      "opts": [
        "Allocates heap memory",
        "Creates an alias name for an existing data type",
        "Defines a preprocessor macro",
        "Declares an external variable"
      ],
      "ans": 1,
      "cat": "Structs & Types",
      "difficulty": "medium",
      "exp": "`typedef` creates a type alias (e.g., `typedef unsigned long ulong;`) that is checked by the compiler."
    },
    {
      "id": "c-cur-14",
      "text": "Which header file declares `malloc()`, `calloc()`, `realloc()`, and `free()`?",
      "opts": [
        "<stdio.h>",
        "<stdlib.h>",
        "<string.h>",
        "<ctype.h>"
      ],
      "ans": 1,
      "cat": "Pointers & Memory",
      "difficulty": "hard",
      "exp": "Dynamic memory management functions are declared in `<stdlib.h>`."
    },
    {
      "id": "c-cur-15",
      "text": "What is the size of `int` typically in C (32-bit systems)?",
      "opts": [
        "2 bytes",
        "4 bytes",
        "8 bytes",
        "1 byte"
      ],
      "ans": 1,
      "cat": "Bitwise & Operators",
      "difficulty": "medium",
      "exp": "The correct option is \"4 bytes\". In C (Bitwise & Operators), \"4 bytes\" directly satisfies the concept or fact asked in: What is the size of `int` typically in C (32-bit systems)?"
    },
    {
      "id": "c-cur-16",
      "text": "What does `malloc()` do?",
      "opts": [
        "Frees memory",
        "Allocates memory dynamically",
        "Copies memory",
        "Compares memory"
      ],
      "ans": 1,
      "cat": "Pointers & Memory",
      "difficulty": "easy",
      "exp": "The correct option is \"Allocates memory dynamically\". In C (Pointers & Memory), \"Allocates memory dynamically\" directly satisfies the concept or fact asked in: What does `malloc()` do?"
    },
    {
      "id": "c-cur-17",
      "text": "Which of these is a valid C variable name?",
      "opts": [
        "2value",
        "_value",
        "value-1",
        "value 1"
      ],
      "ans": 1,
      "cat": "Control Flow & Storage",
      "difficulty": "medium",
      "exp": "The correct option is \"_value\". In C (Control Flow & Storage), \"_value\" directly satisfies the concept or fact asked in: Which of these is a valid C variable name?"
    },
    {
      "id": "c-cur-18",
      "text": "What is the output of `printf(\"%d\", 5/2)`?",
      "opts": [
        "2.5",
        "2",
        "3",
        "Error"
      ],
      "ans": 1,
      "cat": "Standard Library & Strings",
      "difficulty": "hard",
      "exp": "The correct option is \"2\". In C (Standard Library & Strings), \"2\" directly satisfies the concept or fact asked in: What is the output of `printf(\"%d\", 5/2)`?"
    },
    {
      "id": "c-cur-19",
      "text": "Which loop is guaranteed to execute at least once?",
      "opts": [
        "for",
        "while",
        "do-while",
        "if"
      ],
      "ans": 2,
      "cat": "Control Flow & Storage",
      "difficulty": "easy",
      "exp": "The correct option is \"do-while\". In C (Control Flow & Storage), \"do-while\" directly satisfies the concept or fact asked in: Which loop is guaranteed to execute at least once?"
    },
    {
      "id": "c-cur-20",
      "text": "What does `sizeof(char)` return?",
      "opts": [
        "1",
        "2",
        "4",
        "Depends on compiler"
      ],
      "ans": 0,
      "cat": "Bitwise & Operators",
      "difficulty": "medium",
      "exp": "The correct option is \"1\". In C (Bitwise & Operators), \"1\" directly satisfies the concept or fact asked in: What does `sizeof(char)` return?"
    },
    {
      "id": "c-cur-21",
      "text": "What is the correct way to declare a constant in C?",
      "opts": [
        "let x = 5",
        "const int x = 5;",
        "final int x = 5;",
        "int const x = 5"
      ],
      "ans": 1,
      "cat": "Control Flow & Storage",
      "difficulty": "easy",
      "exp": "The correct option is \"const int x = 5;\". In C (Control Flow & Storage), \"const int x = 5;\" directly satisfies the concept or fact asked in: What is the correct way to declare a constant in C?"
    },
    {
      "id": "c-cur-22",
      "text": "What is a NULL pointer?",
      "opts": [
        "Pointer to 0 value",
        "Pointer pointing to nothing",
        "Uninitialized pointer",
        "Pointer to a function"
      ],
      "ans": 1,
      "cat": "Pointers & Memory",
      "difficulty": "hard",
      "exp": "The correct option is \"Pointer pointing to nothing\". In C (Pointers & Memory), \"Pointer pointing to nothing\" directly satisfies the concept or fact asked in: What is a NULL pointer?"
    },
    {
      "id": "c-cur-23",
      "text": "Which function is used to read a string with spaces from input?",
      "opts": [
        "scanf()",
        "gets()/fgets()",
        "read()",
        "getchar() alone"
      ],
      "ans": 1,
      "cat": "Control Flow & Storage",
      "difficulty": "easy",
      "exp": "The correct option is \"gets()/fgets()\". In C (Control Flow & Storage), \"gets()/fgets()\" directly satisfies the concept or fact asked in: Which function is used to read a string with spaces from input?"
    },
    {
      "id": "c-cur-24",
      "text": "What does the `static` keyword do to a local variable?",
      "opts": [
        "Deletes it after function ends",
        "Preserves its value between calls",
        "Makes it global",
        "Makes it constant"
      ],
      "ans": 1,
      "cat": "Control Flow & Storage",
      "difficulty": "medium",
      "exp": "The correct option is \"Preserves its value between calls\". In C (Control Flow & Storage), \"Preserves its value between calls\" directly satisfies the concept or fact asked in: What does the `static` keyword do to a local variable?"
    },
    {
      "id": "c-cur-25",
      "text": "What is a structure (`struct`) used for?",
      "opts": [
        "Grouping different data types together",
        "Looping",
        "Pointer arithmetic",
        "Memory deallocation"
      ],
      "ans": 0,
      "cat": "Structs & Types",
      "difficulty": "easy",
      "exp": "The correct option is \"Grouping different data types together\". In C (Structs & Types), \"Grouping different data types together\" directly satisfies the concept or fact asked in: What is a structure (`struct`) used for?"
    },
    {
      "id": "c-cur-26",
      "text": "Which function compares two strings in C?",
      "opts": [
        "strcmp()",
        "strcompare()",
        "compare()",
        "equals()"
      ],
      "ans": 0,
      "cat": "Control Flow & Storage",
      "difficulty": "medium",
      "exp": "The correct option is \"strcmp()\". In C (Control Flow & Storage), \"strcmp()\" directly satisfies the concept or fact asked in: Which function compares two strings in C?"
    },
    {
      "id": "c-cur-27",
      "text": "What is the output of `1 && 0` in C?",
      "opts": [
        "1",
        "0",
        "true",
        "Error"
      ],
      "ans": 1,
      "cat": "Pointers & Memory",
      "difficulty": "hard",
      "exp": "The correct option is \"0\". In C (Pointers & Memory), \"0\" directly satisfies the concept or fact asked in: What is the output of `1 && 0` in C?"
    },
    {
      "id": "c-cur-28",
      "text": "Which of these correctly declares a function pointer?",
      "opts": [
        "int fp();",
        "int *fp;",
        "int (*fp)(int);",
        "pointer int fp;"
      ],
      "ans": 2,
      "cat": "Pointers & Memory",
      "difficulty": "easy",
      "exp": "The correct option is \"int (*fp)(int);\". In C (Pointers & Memory), \"int (*fp)(int);\" directly satisfies the concept or fact asked in: Which of these correctly declares a function pointer?"
    },
    {
      "id": "c-cur-29",
      "text": "What does `#define` do?",
      "opts": [
        "Declares a variable",
        "Defines a macro/constant",
        "Includes a file",
        "Defines a function"
      ],
      "ans": 1,
      "cat": "Control Flow & Storage",
      "difficulty": "medium",
      "exp": "The correct option is \"Defines a macro/constant\". In C (Control Flow & Storage), \"Defines a macro/constant\" directly satisfies the concept or fact asked in: What does `#define` do?"
    },
    {
      "id": "c-cur-30",
      "text": "Which storage class has the smallest scope by default?",
      "opts": [
        "extern",
        "static",
        "auto",
        "register"
      ],
      "ans": 2,
      "cat": "Control Flow & Storage",
      "difficulty": "hard",
      "exp": "The correct option is \"auto\". In C (Control Flow & Storage), \"auto\" directly satisfies the concept or fact asked in: Which storage class has the smallest scope by default?"
    },
    {
      "id": "c-cur-31",
      "text": "What is the result of `sizeof(int*)` typically on a 64-bit system?",
      "opts": [
        "4 bytes",
        "8 bytes",
        "2 bytes",
        "Depends on int size"
      ],
      "ans": 1,
      "cat": "Pointers & Memory",
      "difficulty": "easy",
      "exp": "The correct option is \"8 bytes\". In C (Pointers & Memory), \"8 bytes\" directly satisfies the concept or fact asked in: What is the result of `sizeof(int*)` typically on a 64-bit system?"
    },
    {
      "id": "c-cur-32",
      "text": "Which function is used to dynamically resize allocated memory?",
      "opts": [
        "resize()",
        "realloc()",
        "recalloc()",
        "remalloc()"
      ],
      "ans": 1,
      "cat": "Control Flow & Storage",
      "difficulty": "medium",
      "exp": "The correct option is \"realloc()\". In C (Control Flow & Storage), \"realloc()\" directly satisfies the concept or fact asked in: Which function is used to dynamically resize allocated memory?"
    },
    {
      "id": "c-cur-33",
      "text": "What does `argc` represent in `main(int argc, char *argv[])`?",
      "opts": [
        "Argument count",
        "Argument character",
        "Array count",
        "Argument class"
      ],
      "ans": 0,
      "cat": "Pointers & Memory",
      "difficulty": "hard",
      "exp": "The correct option is \"Argument count\". In C (Pointers & Memory), \"Argument count\" directly satisfies the concept or fact asked in: What does `argc` represent in `main(int argc, char *argv[])`?"
    },
    {
      "id": "c-cur-34",
      "text": "Which operator is used for modulus (remainder)?",
      "opts": [
        "/",
        "%",
        "//",
        "mod"
      ],
      "ans": 1,
      "cat": "Control Flow & Storage",
      "difficulty": "easy",
      "exp": "The correct option is \"%\". In C (Control Flow & Storage), \"%\" directly satisfies the concept or fact asked in: Which operator is used for modulus (remainder)?"
    },
    {
      "id": "c-cur-35",
      "text": "What happens when you dereference a NULL pointer?",
      "opts": [
        "Returns 0",
        "Compiler error",
        "Undefined behavior / crash",
        "Returns NULL"
      ],
      "ans": 2,
      "cat": "Pointers & Memory",
      "difficulty": "medium",
      "exp": "The correct option is \"Undefined behavior / crash\". In C (Pointers & Memory), \"Undefined behavior / crash\" directly satisfies the concept or fact asked in: What happens when you dereference a NULL pointer?"
    },
    {
      "id": "c-cur-36",
      "text": "What is the output of `sizeof('a')` in C?",
      "opts": [
        "1",
        "2",
        "4",
        "Depends on compiler"
      ],
      "ans": 2,
      "cat": "Bitwise & Operators",
      "difficulty": "easy",
      "exp": "The correct option is \"4\". In C (Bitwise & Operators), \"4\" directly satisfies the concept or fact asked in: What is the output of `sizeof('a')` in C?"
    },
    {
      "id": "c-cur-37",
      "text": "Which function is used to concatenate two strings?",
      "opts": [
        "strcat()",
        "strcpy()",
        "strlen()",
        "strcmp()"
      ],
      "ans": 0,
      "cat": "Control Flow & Storage",
      "difficulty": "medium",
      "exp": "The correct option is \"strcat()\". In C (Control Flow & Storage), \"strcat()\" directly satisfies the concept or fact asked in: Which function is used to concatenate two strings?"
    },
    {
      "id": "c-cur-38",
      "text": "What does the `volatile` keyword indicate?",
      "opts": [
        "Variable can change unexpectedly, prevent optimization",
        "Variable is constant",
        "Variable is static",
        "Variable is global only"
      ],
      "ans": 0,
      "cat": "Control Flow & Storage",
      "difficulty": "hard",
      "exp": "The correct option is \"Variable can change unexpectedly, prevent optimization\". In C (Control Flow & Storage), \"Variable can change unexpectedly, prevent optimization\" directly satisfies the concept or fact asked in: What does the `volatile` keyword indicate?"
    },
    {
      "id": "c-cur-39",
      "text": "Which of these correctly declares a 2D array in C?",
      "opts": [
        "int a[3][4];",
        "int a(3,4);",
        "array a[3][4];",
        "int a[3,4];"
      ],
      "ans": 0,
      "cat": "Control Flow & Storage",
      "difficulty": "easy",
      "exp": "The correct option is \"int a[3][4];\". In C (Control Flow & Storage), \"int a[3][4];\" directly satisfies the concept or fact asked in: Which of these correctly declares a 2D array in C?"
    },
    {
      "id": "c-cur-40",
      "text": "What is the output of `printf(\"%d\", 'A')`?",
      "opts": [
        "A",
        "65",
        "Error",
        "97"
      ],
      "ans": 1,
      "cat": "Standard Library & Strings",
      "difficulty": "medium",
      "exp": "The correct option is \"65\". In C (Standard Library & Strings), \"65\" directly satisfies the concept or fact asked in: What is the output of `printf(\"%d\", 'A')`?"
    },
    {
      "id": "c-cur-41",
      "text": "Which function reads a single character from input?",
      "opts": [
        "getchar()",
        "readchar()",
        "scanchar()",
        "inputchar()"
      ],
      "ans": 0,
      "cat": "Control Flow & Storage",
      "difficulty": "hard",
      "exp": "The correct option is \"getchar()\". In C (Control Flow & Storage), \"getchar()\" directly satisfies the concept or fact asked in: Which function reads a single character from input?"
    },
    {
      "id": "c-cur-42",
      "text": "What does `EOF` represent?",
      "opts": [
        "End of File marker",
        "A file type",
        "A function",
        "An error code always -2"
      ],
      "ans": 0,
      "cat": "Control Flow & Storage",
      "difficulty": "easy",
      "exp": "The correct option is \"End of File marker\". In C (Control Flow & Storage), \"End of File marker\" directly satisfies the concept or fact asked in: What does `EOF` represent?"
    },
    {
      "id": "c-cur-43",
      "text": "Which storage class keyword makes a variable retain its value across function calls?",
      "opts": [
        "auto",
        "register",
        "static",
        "extern"
      ],
      "ans": 2,
      "cat": "Control Flow & Storage",
      "difficulty": "medium",
      "exp": "The correct option is \"static\". In C (Control Flow & Storage), \"static\" directly satisfies the concept or fact asked in: Which storage class keyword makes a variable retain its value across function calls?"
    },
    {
      "id": "c-cur-44",
      "text": "What happens if you don't initialize a local variable in C?",
      "opts": [
        "It's set to 0",
        "It's set to NULL",
        "It contains garbage value",
        "Compile error"
      ],
      "ans": 2,
      "cat": "Control Flow & Storage",
      "difficulty": "hard",
      "exp": "The correct option is \"It contains garbage value\". In C (Control Flow & Storage), \"It contains garbage value\" directly satisfies the concept or fact asked in: What happens if you don't initialize a local variable in C?"
    },
    {
      "id": "c-cur-45",
      "text": "Which operator is used for bitwise AND?",
      "opts": [
        "&&",
        "&",
        "AND",
        "and"
      ],
      "ans": 1,
      "cat": "Bitwise & Operators",
      "difficulty": "easy",
      "exp": "The correct option is \"&\". In C (Bitwise & Operators), \"&\" directly satisfies the concept or fact asked in: Which operator is used for bitwise AND?"
    },
    {
      "id": "c-cur-46",
      "text": "What is a union in C?",
      "opts": [
        "Same as struct but shares memory among members",
        "A pointer type",
        "A loop construct",
        "A type of array"
      ],
      "ans": 0,
      "cat": "Structs & Types",
      "difficulty": "medium",
      "exp": "The correct option is \"Same as struct but shares memory among members\". In C (Structs & Types), \"Same as struct but shares memory among members\" directly satisfies the concept or fact asked in: What is a union in C?"
    },
    {
      "id": "c-cur-47",
      "text": "Which function is used to duplicate a string dynamically?",
      "opts": [
        "strdup()",
        "strcopy()",
        "strclone()",
        "dupstr()"
      ],
      "ans": 0,
      "cat": "Control Flow & Storage",
      "difficulty": "hard",
      "exp": "The correct option is \"strdup()\". In C (Control Flow & Storage), \"strdup()\" directly satisfies the concept or fact asked in: Which function is used to duplicate a string dynamically?"
    },
    {
      "id": "c-cur-48",
      "text": "What does `typedef` do?",
      "opts": [
        "Deletes a type",
        "Creates an alias for a type",
        "Defines a macro",
        "Declares a constant"
      ],
      "ans": 1,
      "cat": "Structs & Types",
      "difficulty": "easy",
      "exp": "The correct option is \"Creates an alias for a type\". In C (Structs & Types), \"Creates an alias for a type\" directly satisfies the concept or fact asked in: What does `typedef` do?"
    },
    {
      "id": "c-cur-49",
      "text": "Which of these is the correct format specifier for a float in printf?",
      "opts": [
        "%d",
        "%f",
        "%s",
        "%c"
      ],
      "ans": 1,
      "cat": "Standard Library & Strings",
      "difficulty": "medium",
      "exp": "The correct option is \"%f\". In C (Standard Library & Strings), \"%f\" directly satisfies the concept or fact asked in: Which of these is the correct format specifier for a float in printf?"
    },
    {
      "id": "c-cur-50",
      "text": "What is recursion?",
      "opts": [
        "A function calling itself",
        "A loop with two conditions",
        "A pointer to a pointer",
        "A type of array"
      ],
      "ans": 0,
      "cat": "Control Flow & Storage",
      "difficulty": "hard",
      "exp": "The correct option is \"A function calling itself\". In C (Control Flow & Storage), \"A function calling itself\" directly satisfies the concept or fact asked in: What is recursion?"
    },
    {
      "id": "c-cur-51",
      "text": "What does `calloc()` do differently from `malloc()`?",
      "opts": [
        "Allocates and zero-initializes memory",
        "Frees memory",
        "Allocates less memory",
        "Nothing, they're identical"
      ],
      "ans": 0,
      "cat": "Pointers & Memory",
      "difficulty": "medium",
      "exp": "The correct option is \"Allocates and zero-initializes memory\". In C (Pointers & Memory), \"Allocates and zero-initializes memory\" directly satisfies the concept or fact asked in: What does `calloc()` do differently from `malloc()`?"
    },
    {
      "id": "c-cur-52",
      "text": "Which header file contains `malloc()` and `free()`?",
      "opts": [
        "<stdio.h>",
        "<stdlib.h>",
        "<string.h>",
        "<memory.h>"
      ],
      "ans": 1,
      "cat": "Pointers & Memory",
      "difficulty": "hard",
      "exp": "The correct option is \"<stdlib.h>\". In C (Pointers & Memory), \"<stdlib.h>\" directly satisfies the concept or fact asked in: Which header file contains `malloc()` and `free()`?"
    },
    {
      "id": "c-cur-53",
      "text": "What is the output of `5 & 3` in C (bitwise AND)?",
      "opts": [
        "1",
        "7",
        "8",
        "5"
      ],
      "ans": 0,
      "cat": "Pointers & Memory",
      "difficulty": "easy",
      "exp": "The correct option is \"1\". In C (Pointers & Memory), \"1\" directly satisfies the concept or fact asked in: What is the output of `5 & 3` in C (bitwise AND)?"
    }
  ],
  "cpp": [
    {
      "id": "cpp-cur-1",
      "text": "What is the default access specifier for members of a `class` in C++?",
      "opts": [
        "public",
        "private",
        "protected",
        "internal"
      ],
      "ans": 1,
      "cat": "OOP & Polymorphism",
      "difficulty": "easy",
      "exp": "In C++, `class` members default to `private` access, whereas `struct` members default to `public`."
    },
    {
      "id": "cpp-cur-2",
      "text": "Which STL container stores unique elements in sorted order using a balanced tree?",
      "opts": [
        "std::vector",
        "std::set",
        "std::list",
        "std::unordered_set"
      ],
      "ans": 1,
      "cat": "STL & Containers",
      "difficulty": "medium",
      "exp": "`std::set` is typically implemented as a Red-Black Tree, keeping unique keys sorted with O(log n) operations."
    },
    {
      "id": "cpp-cur-3",
      "text": "What does declaring a base-class method `virtual` enable in C++?",
      "opts": [
        "Compile-time inlining",
        "Runtime polymorphism (dynamic dispatch via vtable)",
        "Static member access",
        "Automatic garbage collection"
      ],
      "ans": 1,
      "cat": "OOP & Polymorphism",
      "difficulty": "hard",
      "exp": "`virtual` functions use a virtual method table (`vtable`) so calling a method through a base pointer invokes the derived class override at runtime."
    },
    {
      "id": "cpp-cur-4",
      "text": "Which operator is the scope resolution operator in C++?",
      "opts": [
        "::",
        "->",
        ".",
        ".*"
      ],
      "ans": 0,
      "cat": "Templates & Modern C++",
      "difficulty": "easy",
      "exp": "`::` resolves names inside namespaces, classes, or global scope (e.g., `std::cout`, `MyClass::method`)."
    },
    {
      "id": "cpp-cur-5",
      "text": "What does the C++ idiom RAII stand for?",
      "opts": [
        "Resource Acquisition Is Initialization",
        "Runtime Array Index Initialization",
        "Random Access Iterator Interface",
        "Reference Allocation In Inheritance"
      ],
      "ans": 0,
      "cat": "Memory & Smart Pointers",
      "difficulty": "hard",
      "exp": "RAII binds the lifecycle of a resource (heap memory, file handle, mutex lock) to a stack object's constructor and destructor."
    },
    {
      "id": "cpp-cur-6",
      "text": "Which STL container provides O(1) average-case key lookup using a hash table?",
      "opts": [
        "std::map",
        "std::vector",
        "std::unordered_map",
        "std::set"
      ],
      "ans": 2,
      "cat": "STL & Containers",
      "difficulty": "easy",
      "exp": "`std::unordered_map` uses a hash table for O(1) average lookup, whereas `std::map` uses a balanced tree (O(log n))."
    },
    {
      "id": "cpp-cur-7",
      "text": "Which C++11 smart pointer enforces exclusive single ownership of a heap object?",
      "opts": [
        "std::shared_ptr",
        "std::unique_ptr",
        "std::weak_ptr",
        "std::auto_ptr"
      ],
      "ans": 1,
      "cat": "C++ Core",
      "difficulty": "hard",
      "exp": "`std::unique_ptr` cannot be copied (only moved), guaranteeing a single owner and zero reference-counting overhead."
    },
    {
      "id": "cpp-cur-8",
      "text": "What makes a class an abstract class in C++?",
      "opts": [
        "Having only private constructors",
        "Declaring at least one pure virtual function (`virtual void f() = 0;`)",
        "Using the `abstract` keyword",
        "Inheriting from std::object"
      ],
      "ans": 1,
      "cat": "OOP & Polymorphism",
      "difficulty": "hard",
      "exp": "A class with one or more pure virtual functions (`= 0`) cannot be instantiated directly and acts as an abstract base class."
    },
    {
      "id": "cpp-cur-9",
      "text": "Which operator must be used to deallocate an array allocated with `new int[50]`?",
      "opts": [
        "delete p;",
        "delete[] p;",
        "free(p);",
        "remove(p);"
      ],
      "ans": 1,
      "cat": "Memory & Smart Pointers",
      "difficulty": "easy",
      "exp": "Arrays allocated with `new[]` must be freed with `delete[]` so destructors run for every element and the correct block is freed."
    },
    {
      "id": "cpp-cur-10",
      "text": "What does `const` at the end of a member function declaration (`int get() const`) guarantee?",
      "opts": [
        "The return value is a constant pointer",
        "The method will not modify any non-mutable instance member variables",
        "The method can only be called once",
        "The method is static"
      ],
      "ans": 1,
      "cat": "Templates & Modern C++",
      "difficulty": "medium",
      "exp": "A `const` member function treats `this` as a pointer to `const`, preventing modification of the object's state."
    },
    {
      "id": "cpp-cur-11",
      "text": "What does `std::move(x)` actually do at runtime?",
      "opts": [
        "Immediately copies bytes to a new buffer",
        "Performs an unconditional cast to an rvalue reference (`T&&`)",
        "Deallocates `x` from memory",
        "Swaps two variables"
      ],
      "ans": 1,
      "cat": "Memory & Smart Pointers",
      "difficulty": "hard",
      "exp": "`std::move` is a zero-cost `static_cast<T&&>` that marks an object as eligible to have its resources moved by a move constructor or move assignment."
    },
    {
      "id": "cpp-cur-12",
      "text": "Which feature allows a function to behave differently based on arguments?",
      "opts": [
        "Inheritance",
        "Polymorphism",
        "Encapsulation",
        "Function overloading"
      ],
      "ans": 3,
      "cat": "C++ Core",
      "difficulty": "easy",
      "exp": "The correct option is \"Function overloading\". In CPP (C++ Core), \"Function overloading\" directly satisfies the concept or fact asked in: Which feature allows a function to behave differently based on arguments?"
    },
    {
      "id": "cpp-cur-13",
      "text": "What is the default access specifier in a C++ class?",
      "opts": [
        "public",
        "private",
        "protected",
        "none"
      ],
      "ans": 1,
      "cat": "OOP & Polymorphism",
      "difficulty": "medium",
      "exp": "The correct option is \"private\". In CPP (OOP & Polymorphism), \"private\" directly satisfies the concept or fact asked in: What is the default access specifier in a C++ class?"
    },
    {
      "id": "cpp-cur-14",
      "text": "Which operator is used for dynamic memory allocation in C++?",
      "opts": [
        "malloc",
        "new",
        "alloc",
        "create"
      ],
      "ans": 1,
      "cat": "Templates & Modern C++",
      "difficulty": "hard",
      "exp": "The correct option is \"new\". In CPP (Templates & Modern C++), \"new\" directly satisfies the concept or fact asked in: Which operator is used for dynamic memory allocation in C++?"
    },
    {
      "id": "cpp-cur-15",
      "text": "What is a constructor?",
      "opts": [
        "A function that destroys objects",
        "A special method called on object creation",
        "A loop",
        "A variable"
      ],
      "ans": 1,
      "cat": "OOP & Polymorphism",
      "difficulty": "easy",
      "exp": "The correct option is \"A special method called on object creation\". In CPP (OOP & Polymorphism), \"A special method called on object creation\" directly satisfies the concept or fact asked in: What is a constructor?"
    },
    {
      "id": "cpp-cur-16",
      "text": "Which STL container stores unique sorted elements?",
      "opts": [
        "vector",
        "set",
        "list",
        "map"
      ],
      "ans": 1,
      "cat": "STL & Containers",
      "difficulty": "medium",
      "exp": "The correct option is \"set\". In CPP (STL & Containers), \"set\" directly satisfies the concept or fact asked in: Which STL container stores unique sorted elements?"
    },
    {
      "id": "cpp-cur-17",
      "text": "What does `virtual` keyword enable?",
      "opts": [
        "Static binding",
        "Dynamic/runtime polymorphism",
        "Faster compilation",
        "Memory management"
      ],
      "ans": 1,
      "cat": "OOP & Polymorphism",
      "difficulty": "hard",
      "exp": "The correct option is \"Dynamic/runtime polymorphism\". In CPP (OOP & Polymorphism), \"Dynamic/runtime polymorphism\" directly satisfies the concept or fact asked in: What does `virtual` keyword enable?"
    },
    {
      "id": "cpp-cur-18",
      "text": "Which of these supports multiple inheritance?",
      "opts": [
        "Java",
        "Python",
        "C++",
        "C#"
      ],
      "ans": 2,
      "cat": "OOP & Polymorphism",
      "difficulty": "easy",
      "exp": "The correct option is \"C++\". In CPP (OOP & Polymorphism), \"C++\" directly satisfies the concept or fact asked in: Which of these supports multiple inheritance?"
    },
    {
      "id": "cpp-cur-19",
      "text": "Which STL container is a key-value pair structure?",
      "opts": [
        "vector",
        "map",
        "stack",
        "queue"
      ],
      "ans": 1,
      "cat": "STL & Containers",
      "difficulty": "hard",
      "exp": "The correct option is \"map\". In CPP (STL & Containers), \"map\" directly satisfies the concept or fact asked in: Which STL container is a key-value pair structure?"
    },
    {
      "id": "cpp-cur-20",
      "text": "What does RAII stand for conceptually?",
      "opts": [
        "Resource acquisition is initialization",
        "Runtime array index initialization",
        "Random access iterator interface",
        "Resource access is inherited"
      ],
      "ans": 0,
      "cat": "Memory & Smart Pointers",
      "difficulty": "hard",
      "exp": "The correct option is \"Resource acquisition is initialization\". In CPP (Memory & Smart Pointers), \"Resource acquisition is initialization\" directly satisfies the concept or fact asked in: What does RAII stand for conceptually?"
    },
    {
      "id": "cpp-cur-21",
      "text": "Which keyword is used to prevent function overriding?",
      "opts": [
        "static",
        "final",
        "const",
        "sealed"
      ],
      "ans": 1,
      "cat": "C++ Core",
      "difficulty": "medium",
      "exp": "The correct option is \"final\". In CPP (C++ Core), \"final\" directly satisfies the concept or fact asked in: Which keyword is used to prevent function overriding?"
    },
    {
      "id": "cpp-cur-22",
      "text": "What is the output type of `cout`?",
      "opts": [
        "Input stream",
        "Output stream",
        "File stream",
        "String stream"
      ],
      "ans": 1,
      "cat": "C++ Core",
      "difficulty": "hard",
      "exp": "The correct option is \"Output stream\". In CPP (C++ Core), \"Output stream\" directly satisfies the concept or fact asked in: What is the output type of `cout`?"
    },
    {
      "id": "cpp-cur-23",
      "text": "What is a destructor used for?",
      "opts": [
        "Creating objects",
        "Cleaning up resources when an object is destroyed",
        "Copying objects",
        "Comparing objects"
      ],
      "ans": 1,
      "cat": "OOP & Polymorphism",
      "difficulty": "easy",
      "exp": "The correct option is \"Cleaning up resources when an object is destroyed\". In CPP (OOP & Polymorphism), \"Cleaning up resources when an object is destroyed\" directly satisfies the concept or fact asked in: What is a destructor used for?"
    },
    {
      "id": "cpp-cur-24",
      "text": "Which keyword is used to catch exceptions in C++?",
      "opts": [
        "except",
        "catch",
        "rescue",
        "handle"
      ],
      "ans": 1,
      "cat": "C++ Core",
      "difficulty": "medium",
      "exp": "The correct option is \"catch\". In CPP (C++ Core), \"catch\" directly satisfies the concept or fact asked in: Which keyword is used to catch exceptions in C++?"
    },
    {
      "id": "cpp-cur-25",
      "text": "What is function overriding?",
      "opts": [
        "Same function signature redefined in a derived class",
        "Multiple functions with the same name in one class",
        "Deleting a function",
        "Renaming a function"
      ],
      "ans": 0,
      "cat": "C++ Core",
      "difficulty": "hard",
      "exp": "The correct option is \"Same function signature redefined in a derived class\". In CPP (C++ Core), \"Same function signature redefined in a derived class\" directly satisfies the concept or fact asked in: What is function overriding?"
    },
    {
      "id": "cpp-cur-26",
      "text": "What is the purpose of a copy constructor?",
      "opts": [
        "Initializes an object using another object of the same class",
        "Deletes an object",
        "Compares two objects",
        "Converts data types"
      ],
      "ans": 0,
      "cat": "OOP & Polymorphism",
      "difficulty": "medium",
      "exp": "The correct option is \"Initializes an object using another object of the same class\". In CPP (OOP & Polymorphism), \"Initializes an object using another object of the same class\" directly satisfies the concept or fact asked in: What is the purpose of a copy constructor?"
    },
    {
      "id": "cpp-cur-27",
      "text": "Which access specifier allows access only within the class and derived classes?",
      "opts": [
        "public",
        "private",
        "protected",
        "friend"
      ],
      "ans": 2,
      "cat": "OOP & Polymorphism",
      "difficulty": "hard",
      "exp": "The correct option is \"protected\". In CPP (OOP & Polymorphism), \"protected\" directly satisfies the concept or fact asked in: Which access specifier allows access only within the class and derived classes?"
    },
    {
      "id": "cpp-cur-28",
      "text": "What does `nullptr` represent in modern C++?",
      "opts": [
        "An integer zero",
        "A null pointer constant",
        "An uninitialized variable",
        "A reference"
      ],
      "ans": 1,
      "cat": "Templates & Modern C++",
      "difficulty": "easy",
      "exp": "The correct option is \"A null pointer constant\". In CPP (Templates & Modern C++), \"A null pointer constant\" directly satisfies the concept or fact asked in: What does `nullptr` represent in modern C++?"
    },
    {
      "id": "cpp-cur-29",
      "text": "Which STL container provides O(1) average time complexity for lookups?",
      "opts": [
        "vector",
        "list",
        "unordered_map",
        "deque"
      ],
      "ans": 2,
      "cat": "STL & Containers",
      "difficulty": "hard",
      "exp": "The correct option is \"unordered_map\". In CPP (STL & Containers), \"unordered_map\" directly satisfies the concept or fact asked in: Which STL container provides O(1) average time complexity for lookups?"
    },
    {
      "id": "cpp-cur-30",
      "text": "What is a template in C++ used for?",
      "opts": [
        "Generic programming across data types",
        "Formatting output",
        "Memory allocation",
        "Exception handling"
      ],
      "ans": 0,
      "cat": "Templates & Modern C++",
      "difficulty": "hard",
      "exp": "The correct option is \"Generic programming across data types\". In CPP (Templates & Modern C++), \"Generic programming across data types\" directly satisfies the concept or fact asked in: What is a template in C++ used for?"
    },
    {
      "id": "cpp-cur-31",
      "text": "Which keyword prevents a variable from being modified?",
      "opts": [
        "static",
        "const",
        "final",
        "readonly"
      ],
      "ans": 1,
      "cat": "C++ Core",
      "difficulty": "easy",
      "exp": "The correct option is \"const\". In CPP (C++ Core), \"const\" directly satisfies the concept or fact asked in: Which keyword prevents a variable from being modified?"
    },
    {
      "id": "cpp-cur-32",
      "text": "What does the `this` pointer refer to?",
      "opts": [
        "The base class",
        "The current object instance",
        "A static member",
        "The next object"
      ],
      "ans": 1,
      "cat": "OOP & Polymorphism",
      "difficulty": "medium",
      "exp": "The correct option is \"The current object instance\". In CPP (OOP & Polymorphism), \"The current object instance\" directly satisfies the concept or fact asked in: What does the `this` pointer refer to?"
    },
    {
      "id": "cpp-cur-33",
      "text": "Which type of inheritance involves a class derived from two base classes?",
      "opts": [
        "Single",
        "Multiple",
        "Multilevel",
        "Hierarchical"
      ],
      "ans": 1,
      "cat": "OOP & Polymorphism",
      "difficulty": "hard",
      "exp": "The correct option is \"Multiple\". In CPP (OOP & Polymorphism), \"Multiple\" directly satisfies the concept or fact asked in: Which type of inheritance involves a class derived from two base classes?"
    },
    {
      "id": "cpp-cur-34",
      "text": "What is the use of the `friend` keyword?",
      "opts": [
        "Grants a function/class access to private members",
        "Creates a public method",
        "Deletes a class",
        "Speeds up compilation"
      ],
      "ans": 0,
      "cat": "OOP & Polymorphism",
      "difficulty": "easy",
      "exp": "The correct option is \"Grants a function/class access to private members\". In CPP (OOP & Polymorphism), \"Grants a function/class access to private members\" directly satisfies the concept or fact asked in: What is the use of the `friend` keyword?"
    },
    {
      "id": "cpp-cur-35",
      "text": "Which smart pointer allows shared ownership in modern C++?",
      "opts": [
        "unique_ptr",
        "shared_ptr",
        "auto_ptr",
        "raw_ptr"
      ],
      "ans": 1,
      "cat": "C++ Core",
      "difficulty": "hard",
      "exp": "The correct option is \"shared_ptr\". In CPP (C++ Core), \"shared_ptr\" directly satisfies the concept or fact asked in: Which smart pointer allows shared ownership in modern C++?"
    },
    {
      "id": "cpp-cur-36",
      "text": "What is the output of `5 / 2` when both operands are integers in C++?",
      "opts": [
        "2.5",
        "2",
        "3",
        "Error"
      ],
      "ans": 1,
      "cat": "C++ Core",
      "difficulty": "hard",
      "exp": "The correct option is \"2\". In CPP (C++ Core), \"2\" directly satisfies the concept or fact asked in: What is the output of `5 / 2` when both operands are integers in C++?"
    },
    {
      "id": "cpp-cur-37",
      "text": "Which C++ feature allows binding a function call to code at runtime?",
      "opts": [
        "Static binding",
        "Dynamic binding",
        "Early binding",
        "Compile-time binding"
      ],
      "ans": 1,
      "cat": "C++ Core",
      "difficulty": "easy",
      "exp": "The correct option is \"Dynamic binding\". In CPP (C++ Core), \"Dynamic binding\" directly satisfies the concept or fact asked in: Which C++ feature allows binding a function call to code at runtime?"
    },
    {
      "id": "cpp-cur-38",
      "text": "What is operator overloading?",
      "opts": [
        "Redefining operators for user-defined types",
        "Overriding a function",
        "Creating new operators",
        "Deleting operators"
      ],
      "ans": 0,
      "cat": "Templates & Modern C++",
      "difficulty": "medium",
      "exp": "The correct option is \"Redefining operators for user-defined types\". In CPP (Templates & Modern C++), \"Redefining operators for user-defined types\" directly satisfies the concept or fact asked in: What is operator overloading?"
    },
    {
      "id": "cpp-cur-39",
      "text": "Which STL container provides FIFO behavior?",
      "opts": [
        "stack",
        "queue",
        "vector",
        "set"
      ],
      "ans": 1,
      "cat": "STL & Containers",
      "difficulty": "hard",
      "exp": "The correct option is \"queue\". In CPP (STL & Containers), \"queue\" directly satisfies the concept or fact asked in: Which STL container provides FIFO behavior?"
    },
    {
      "id": "cpp-cur-40",
      "text": "What does the `explicit` keyword prevent?",
      "opts": [
        "Multiple inheritance",
        "Implicit constructor conversions",
        "Virtual functions",
        "Operator overloading"
      ],
      "ans": 1,
      "cat": "C++ Core",
      "difficulty": "easy",
      "exp": "The correct option is \"Implicit constructor conversions\". In CPP (C++ Core), \"Implicit constructor conversions\" directly satisfies the concept or fact asked in: What does the `explicit` keyword prevent?"
    },
    {
      "id": "cpp-cur-41",
      "text": "Which of these is true about a pure virtual function?",
      "opts": [
        "It has a body",
        "It makes the class abstract",
        "It cannot be overridden",
        "It's the same as a normal virtual function"
      ],
      "ans": 1,
      "cat": "OOP & Polymorphism",
      "difficulty": "hard",
      "exp": "The correct option is \"It makes the class abstract\". In CPP (OOP & Polymorphism), \"It makes the class abstract\" directly satisfies the concept or fact asked in: Which of these is true about a pure virtual function?"
    },
    {
      "id": "cpp-cur-42",
      "text": "What is the output of `cout << 5 << \" \" << 10;`?",
      "opts": [
        "5 10",
        "510",
        "5\\n10",
        "Error"
      ],
      "ans": 0,
      "cat": "C++ Core",
      "difficulty": "hard",
      "exp": "The correct option is \"5 10\". In CPP (C++ Core), \"5 10\" directly satisfies the concept or fact asked in: What is the output of `cout << 5 << \" \" << 10;`?"
    },
    {
      "id": "cpp-cur-43",
      "text": "Which access specifier is used for inheritance to keep base class public members public?",
      "opts": [
        "private inheritance",
        "protected inheritance",
        "public inheritance",
        "default inheritance"
      ],
      "ans": 2,
      "cat": "OOP & Polymorphism",
      "difficulty": "easy",
      "exp": "The correct option is \"public inheritance\". In CPP (OOP & Polymorphism), \"public inheritance\" directly satisfies the concept or fact asked in: Which access specifier is used for inheritance to keep base class public members public?"
    },
    {
      "id": "cpp-cur-44",
      "text": "What is the purpose of `#include` guards or `#pragma once`?",
      "opts": [
        "Speed up compilation",
        "Prevent multiple inclusion of a header",
        "Enable debugging",
        "Reduce binary size"
      ],
      "ans": 1,
      "cat": "C++ Core",
      "difficulty": "medium",
      "exp": "The correct option is \"Prevent multiple inclusion of a header\". In CPP (C++ Core), \"Prevent multiple inclusion of a header\" directly satisfies the concept or fact asked in: What is the purpose of `#include` guards or `#pragma once`?"
    },
    {
      "id": "cpp-cur-45",
      "text": "Which STL algorithm is used to sort a container?",
      "opts": [
        "std::order",
        "std::sort",
        "std::arrange",
        "std::rank"
      ],
      "ans": 1,
      "cat": "STL & Containers",
      "difficulty": "hard",
      "exp": "The correct option is \"std::sort\". In CPP (STL & Containers), \"std::sort\" directly satisfies the concept or fact asked in: Which STL algorithm is used to sort a container?"
    },
    {
      "id": "cpp-cur-46",
      "text": "What is a lambda expression in C++11 and later?",
      "opts": [
        "A named function only",
        "An anonymous inline function object",
        "A macro",
        "A template"
      ],
      "ans": 1,
      "cat": "Templates & Modern C++",
      "difficulty": "easy",
      "exp": "The correct option is \"An anonymous inline function object\". In CPP (Templates & Modern C++), \"An anonymous inline function object\" directly satisfies the concept or fact asked in: What is a lambda expression in C++11 and later?"
    },
    {
      "id": "cpp-cur-47",
      "text": "Which keyword is used to delete a dynamically allocated array?",
      "opts": [
        "delete",
        "delete[]",
        "free()",
        "remove[]"
      ],
      "ans": 1,
      "cat": "Memory & Smart Pointers",
      "difficulty": "medium",
      "exp": "The correct option is \"delete[]\". In CPP (Memory & Smart Pointers), \"delete[]\" directly satisfies the concept or fact asked in: Which keyword is used to delete a dynamically allocated array?"
    },
    {
      "id": "cpp-cur-48",
      "text": "What does `std::move` do?",
      "opts": [
        "Copies an object",
        "Casts an object to an rvalue reference to enable move semantics",
        "Deletes an object",
        "Compares two objects"
      ],
      "ans": 1,
      "cat": "Memory & Smart Pointers",
      "difficulty": "hard",
      "exp": "The correct option is \"Casts an object to an rvalue reference to enable move semantics\". In CPP (Memory & Smart Pointers), \"Casts an object to an rvalue reference to enable move semantics\" directly satisfies the concept or fact asked in: What does `std::move` do?"
    },
    {
      "id": "cpp-cur-49",
      "text": "Which of these correctly demonstrates function overloading?",
      "opts": [
        "Same name, different return type only",
        "Same name, different parameter list",
        "Different name, same parameters",
        "Same name, same parameters"
      ],
      "ans": 1,
      "cat": "C++ Core",
      "difficulty": "easy",
      "exp": "The correct option is \"Same name, different parameter list\". In CPP (C++ Core), \"Same name, different parameter list\" directly satisfies the concept or fact asked in: Which of these correctly demonstrates function overloading?"
    },
    {
      "id": "cpp-cur-50",
      "text": "What is the diamond problem related to?",
      "opts": [
        "Single inheritance",
        "Multiple inheritance ambiguity",
        "Operator overloading",
        "Templates"
      ],
      "ans": 1,
      "cat": "C++ Core",
      "difficulty": "medium",
      "exp": "The correct option is \"Multiple inheritance ambiguity\". In CPP (C++ Core), \"Multiple inheritance ambiguity\" directly satisfies the concept or fact asked in: What is the diamond problem related to?"
    },
    {
      "id": "cpp-cur-51",
      "text": "Which container adaptor is built on top of deque by default?",
      "opts": [
        "vector",
        "stack",
        "set",
        "map"
      ],
      "ans": 1,
      "cat": "STL & Containers",
      "difficulty": "hard",
      "exp": "The correct option is \"stack\". In CPP (STL & Containers), \"stack\" directly satisfies the concept or fact asked in: Which container adaptor is built on top of deque by default?"
    },
    {
      "id": "cpp-cur-52",
      "text": "What is the initializer list used for in a constructor?",
      "opts": [
        "Initializing member variables before the constructor body runs",
        "Deleting members",
        "Overloading functions",
        "Declaring friends"
      ],
      "ans": 0,
      "cat": "OOP & Polymorphism",
      "difficulty": "easy",
      "exp": "The correct option is \"Initializing member variables before the constructor body runs\". In CPP (OOP & Polymorphism), \"Initializing member variables before the constructor body runs\" directly satisfies the concept or fact asked in: What is the initializer list used for in a constructor?"
    },
    {
      "id": "cpp-cur-53",
      "text": "Which of these best describes an iterator in STL?",
      "opts": [
        "A pointer-like object to traverse containers",
        "A sorting algorithm",
        "A type of exception",
        "A memory allocator"
      ],
      "ans": 0,
      "cat": "STL & Containers",
      "difficulty": "medium",
      "exp": "The correct option is \"A pointer-like object to traverse containers\". In CPP (STL & Containers), \"A pointer-like object to traverse containers\" directly satisfies the concept or fact asked in: Which of these best describes an iterator in STL?"
    },
    {
      "id": "cpp-cur-54",
      "text": "What does `const` before a member function signify?",
      "opts": [
        "The function cannot modify member variables",
        "The function is static",
        "The function is virtual",
        "The function cannot be called"
      ],
      "ans": 0,
      "cat": "Templates & Modern C++",
      "difficulty": "hard",
      "exp": "The correct option is \"The function cannot modify member variables\". In CPP (Templates & Modern C++), \"The function cannot modify member variables\" directly satisfies the concept or fact asked in: What does `const` before a member function signify?"
    },
    {
      "id": "cpp-cur-55",
      "text": "Which exception handling keyword re-throws the current exception?",
      "opts": [
        "throw;",
        "rethrow;",
        "catch;",
        "raise;"
      ],
      "ans": 0,
      "cat": "C++ Core",
      "difficulty": "easy",
      "exp": "The correct option is \"throw;\". In CPP (C++ Core), \"throw;\" directly satisfies the concept or fact asked in: Which exception handling keyword re-throws the current exception?"
    },
    {
      "id": "cpp-cur-56",
      "text": "What is the output type of an uninitialized `int` at global scope in C++?",
      "opts": [
        "Garbage value",
        "0",
        "Compile error",
        "NULL"
      ],
      "ans": 1,
      "cat": "C++ Core",
      "difficulty": "medium",
      "exp": "The correct option is \"0\". In CPP (C++ Core), \"0\" directly satisfies the concept or fact asked in: What is the output type of an uninitialized `int` at global scope in C++?"
    }
  ],
  "html": [
    {
      "id": "html-cur-1",
      "text": "Which HTML element is used to create a hyperlink?",
      "opts": [
        "<link>",
        "<a>",
        "<href>",
        "<url>"
      ],
      "ans": 1,
      "cat": "Selectors & Styling",
      "difficulty": "easy",
      "exp": "The anchor element `<a href='...'>` defines a hyperlink to another page, section, or URL."
    },
    {
      "id": "html-cur-2",
      "text": "Which CSS property controls the size of rendered text?",
      "opts": [
        "font-weight",
        "text-size",
        "font-size",
        "size"
      ],
      "ans": 2,
      "cat": "Forms, Lists & Tables",
      "difficulty": "medium",
      "exp": "`font-size` sets the height/scale of the font glyphs (in `px`, `rem`, `em`, `%`, or `vw`)."
    },
    {
      "id": "html-cur-3",
      "text": "In the CSS box model, what does `margin` control?",
      "opts": [
        "Space between content and border",
        "Transparent space outside the border separating adjacent elements",
        "The thickness of the border line",
        "The internal width of the text box"
      ],
      "ans": 1,
      "cat": "CSS Layout & Box Model",
      "difficulty": "hard",
      "exp": "`padding` is inside the border, while `margin` is the outer spacing outside the element's border."
    },
    {
      "id": "html-cur-4",
      "text": "Which CSS layout module is specifically designed for two-dimensional (rows AND columns) layouts?",
      "opts": [
        "Flexbox",
        "CSS Grid",
        "Float",
        "Inline-block"
      ],
      "ans": 1,
      "cat": "Forms, Lists & Tables",
      "difficulty": "easy",
      "exp": "CSS Grid (`display: grid`) controls both rows and columns simultaneously, whereas Flexbox is primarily one-dimensional."
    },
    {
      "id": "html-cur-5",
      "text": "What does `display: none` do compared to `visibility: hidden`?",
      "opts": [
        "Both leave an empty gap in the layout",
        "`display: none` removes the element from document layout flow completely",
        "`display: none` only sets opacity to 0",
        "`visibility: hidden` deletes the DOM node"
      ],
      "ans": 1,
      "cat": "CSS Layout & Box Model",
      "difficulty": "medium",
      "exp": "`display: none` removes the element's box from layout calculation so it takes up zero space; `visibility: hidden` hides it visually while keeping its box space."
    },
    {
      "id": "html-cur-6",
      "text": "Which CSS unit is always relative to the root (`<html>`) element's font size?",
      "opts": [
        "em",
        "px",
        "rem",
        "ch"
      ],
      "ans": 2,
      "cat": "Selectors & Styling",
      "difficulty": "hard",
      "exp": "`rem` stands for 'root em' and scales strictly against the `<html>` element's `font-size`, avoiding nested `em` compounding."
    },
    {
      "id": "html-cur-7",
      "text": "What does `position: absolute` position an element relative to?",
      "opts": [
        "Always the browser window",
        "Its nearest ancestor with a `position` other than `static` (or the initial containing block)",
        "Its immediate previous sibling",
        "Always the `<main>` tag"
      ],
      "ans": 1,
      "cat": "CSS Layout & Box Model",
      "difficulty": "easy",
      "exp": "An absolutely positioned element is offset relative to its closest positioned ancestor (`relative`, `absolute`, `fixed`, or `sticky`)."
    },
    {
      "id": "html-cur-8",
      "text": "What does `box-sizing: border-box` change in CSS?",
      "opts": [
        "Removes padding and borders",
        "Includes `padding` and `border` inside the element's declared `width` and `height`",
        "Adds automatic outer margins",
        "Forces the element to be a flex container"
      ],
      "ans": 1,
      "cat": "CSS Layout & Box Model",
      "difficulty": "hard",
      "exp": "With `border-box`, an element with `width: 200px; padding: 20px; border: 2px solid` still has a total outer border-box width of `200px`."
    },
    {
      "id": "html-cur-9",
      "text": "Which CSS combinator selects only direct children of an element (`ul > li`)?",
      "opts": [
        "Space (` `)",
        "Child combinator (`>`)",
        "Adjacent sibling (`+`)",
        "General sibling (`~`)"
      ],
      "ans": 1,
      "cat": "Selectors & Styling",
      "difficulty": "hard",
      "exp": "`parent > child` matches only direct children one level deep, whereas a space matches descendants at any depth."
    },
    {
      "id": "html-cur-10",
      "text": "Why is the `alt` attribute important on `<img>` elements?",
      "opts": [
        "It sets the image's tooltip on hover",
        "It provides accessible screen-reader text and fallback text when the image fails to load",
        "It compresses the image file size",
        "It preloads the image in the background"
      ],
      "ans": 1,
      "cat": "Selectors & Styling",
      "difficulty": "easy",
      "exp": "`alt` text is read aloud by screen readers for visually impaired users and displayed by the browser if the image URL fails."
    },
    {
      "id": "html-cur-11",
      "text": "Which tag defines the largest heading?",
      "opts": [
        "<h6>",
        "<heading>",
        "<h1>",
        "<head>"
      ],
      "ans": 2,
      "cat": "HTML/CSS Fundamentals",
      "difficulty": "easy",
      "exp": "The correct option is \"<h1>\". In HTML (HTML/CSS Fundamentals), \"<h1>\" directly satisfies the concept or fact asked in: Which tag defines the largest heading?"
    },
    {
      "id": "html-cur-12",
      "text": "What does CSS stand for?",
      "opts": [
        "Creative Style Sheets",
        "Cascading Style Sheets",
        "Computer Style Sheets",
        "Colorful Style Sheets"
      ],
      "ans": 1,
      "cat": "HTML/CSS Fundamentals",
      "difficulty": "medium",
      "exp": "The correct option is \"Cascading Style Sheets\". In HTML (HTML/CSS Fundamentals), \"Cascading Style Sheets\" directly satisfies the concept or fact asked in: What does CSS stand for?"
    },
    {
      "id": "html-cur-13",
      "text": "Which attribute specifies an alternate text for an image?",
      "opts": [
        "title",
        "alt",
        "src",
        "desc"
      ],
      "ans": 1,
      "cat": "Forms, Lists & Tables",
      "difficulty": "hard",
      "exp": "The correct option is \"alt\". In HTML (Forms, Lists & Tables), \"alt\" directly satisfies the concept or fact asked in: Which attribute specifies an alternate text for an image?"
    },
    {
      "id": "html-cur-14",
      "text": "Which property is used to change the background color?",
      "opts": [
        "color",
        "bgcolor",
        "background-color",
        "bg-color"
      ],
      "ans": 2,
      "cat": "Selectors & Styling",
      "difficulty": "easy",
      "exp": "The correct option is \"background-color\". In HTML (Selectors & Styling), \"background-color\" directly satisfies the concept or fact asked in: Which property is used to change the background color?"
    },
    {
      "id": "html-cur-15",
      "text": "Which HTML element is used for the largest, semantic page container?",
      "opts": [
        "<div>",
        "<section>",
        "<main>",
        "<body>"
      ],
      "ans": 2,
      "cat": "Selectors & Styling",
      "difficulty": "medium",
      "exp": "The correct option is \"<main>\". In HTML (Selectors & Styling), \"<main>\" directly satisfies the concept or fact asked in: Which HTML element is used for the largest, semantic page container?"
    },
    {
      "id": "html-cur-16",
      "text": "In the box model, what does 'margin' refer to?",
      "opts": [
        "Space inside the border",
        "Space outside the border",
        "The border itself",
        "Content area"
      ],
      "ans": 1,
      "cat": "CSS Layout & Box Model",
      "difficulty": "hard",
      "exp": "The correct option is \"Space outside the border\". In HTML (CSS Layout & Box Model), \"Space outside the border\" directly satisfies the concept or fact asked in: In the box model, what does 'margin' refer to?"
    },
    {
      "id": "html-cur-17",
      "text": "Which CSS layout system is designed for two-dimensional layouts?",
      "opts": [
        "Flexbox",
        "Grid",
        "Float",
        "Table"
      ],
      "ans": 1,
      "cat": "Selectors & Styling",
      "difficulty": "easy",
      "exp": "The correct option is \"Grid\". In HTML (Selectors & Styling), \"Grid\" directly satisfies the concept or fact asked in: Which CSS layout system is designed for two-dimensional layouts?"
    },
    {
      "id": "html-cur-18",
      "text": "Which tag is used to embed JavaScript in HTML?",
      "opts": [
        "<js>",
        "<script>",
        "<javascript>",
        "<code>"
      ],
      "ans": 1,
      "cat": "Selectors & Styling",
      "difficulty": "medium",
      "exp": "The correct option is \"<script>\". In HTML (Selectors & Styling), \"<script>\" directly satisfies the concept or fact asked in: Which tag is used to embed JavaScript in HTML?"
    },
    {
      "id": "html-cur-19",
      "text": "Which value of `display` hides an element and removes its space?",
      "opts": [
        "hidden",
        "invisible",
        "none",
        "collapse"
      ],
      "ans": 2,
      "cat": "CSS Layout & Box Model",
      "difficulty": "hard",
      "exp": "The correct option is \"none\". In HTML (CSS Layout & Box Model), \"none\" directly satisfies the concept or fact asked in: Which value of `display` hides an element and removes its space?"
    },
    {
      "id": "html-cur-20",
      "text": "Which doctype declaration is used for HTML5?",
      "opts": [
        "<!DOCTYPE html5>",
        "<!DOCTYPE HTML PUBLIC>",
        "<!DOCTYPE html>",
        "<html5>"
      ],
      "ans": 2,
      "cat": "Semantic HTML & DOM",
      "difficulty": "easy",
      "exp": "The correct option is \"<!DOCTYPE html>\". In HTML (Semantic HTML & DOM), \"<!DOCTYPE html>\" directly satisfies the concept or fact asked in: Which doctype declaration is used for HTML5?"
    },
    {
      "id": "html-cur-21",
      "text": "Which tag is used to create an ordered list?",
      "opts": [
        "<ul>",
        "<ol>",
        "<li>",
        "<list>"
      ],
      "ans": 1,
      "cat": "Forms, Lists & Tables",
      "difficulty": "medium",
      "exp": "The correct option is \"<ol>\". In HTML (Forms, Lists & Tables), \"<ol>\" directly satisfies the concept or fact asked in: Which tag is used to create an ordered list?"
    },
    {
      "id": "html-cur-22",
      "text": "Which CSS selector targets an element with a specific id?",
      "opts": [
        ".class",
        "#id",
        "*element",
        "element[]"
      ],
      "ans": 1,
      "cat": "Selectors & Styling",
      "difficulty": "hard",
      "exp": "The correct option is \"#id\". In HTML (Selectors & Styling), \"#id\" directly satisfies the concept or fact asked in: Which CSS selector targets an element with a specific id?"
    },
    {
      "id": "html-cur-23",
      "text": "What is the correct HTML element for inserting a line break?",
      "opts": [
        "<break>",
        "<lb>",
        "<br>",
        "<newline>"
      ],
      "ans": 2,
      "cat": "Selectors & Styling",
      "difficulty": "easy",
      "exp": "The correct option is \"<br>\". In HTML (Selectors & Styling), \"<br>\" directly satisfies the concept or fact asked in: What is the correct HTML element for inserting a line break?"
    },
    {
      "id": "html-cur-24",
      "text": "Which property is used to make text bold in CSS?",
      "opts": [
        "font-style",
        "font-weight",
        "text-decoration",
        "font-bold"
      ],
      "ans": 1,
      "cat": "Forms, Lists & Tables",
      "difficulty": "medium",
      "exp": "The correct option is \"font-weight\". In HTML (Forms, Lists & Tables), \"font-weight\" directly satisfies the concept or fact asked in: Which property is used to make text bold in CSS?"
    },
    {
      "id": "html-cur-25",
      "text": "Which attribute makes an input field mandatory in HTML5?",
      "opts": [
        "mandatory",
        "required",
        "validate",
        "need"
      ],
      "ans": 1,
      "cat": "Forms, Lists & Tables",
      "difficulty": "hard",
      "exp": "The correct option is \"required\". In HTML (Forms, Lists & Tables), \"required\" directly satisfies the concept or fact asked in: Which attribute makes an input field mandatory in HTML5?"
    },
    {
      "id": "html-cur-26",
      "text": "What does the `viewport` meta tag control?",
      "opts": [
        "Page title",
        "Responsive scaling on devices",
        "Character encoding",
        "Page background"
      ],
      "ans": 1,
      "cat": "Forms, Lists & Tables",
      "difficulty": "easy",
      "exp": "The correct option is \"Responsive scaling on devices\". In HTML (Forms, Lists & Tables), \"Responsive scaling on devices\" directly satisfies the concept or fact asked in: What does the `viewport` meta tag control?"
    },
    {
      "id": "html-cur-27",
      "text": "Which CSS property is used to add space between flex items?",
      "opts": [
        "margin",
        "gap",
        "spacing",
        "padding"
      ],
      "ans": 1,
      "cat": "CSS Layout & Box Model",
      "difficulty": "medium",
      "exp": "The correct option is \"gap\". In HTML (CSS Layout & Box Model), \"gap\" directly satisfies the concept or fact asked in: Which CSS property is used to add space between flex items?"
    },
    {
      "id": "html-cur-28",
      "text": "Which tag is used to define a table row?",
      "opts": [
        "<td>",
        "<tr>",
        "<th>",
        "<row>"
      ],
      "ans": 1,
      "cat": "Forms, Lists & Tables",
      "difficulty": "hard",
      "exp": "The correct option is \"<tr>\". In HTML (Forms, Lists & Tables), \"<tr>\" directly satisfies the concept or fact asked in: Which tag is used to define a table row?"
    },
    {
      "id": "html-cur-29",
      "text": "What is the purpose of the `<form>` element?",
      "opts": [
        "Displaying images",
        "Collecting user input",
        "Styling text",
        "Linking pages"
      ],
      "ans": 1,
      "cat": "Selectors & Styling",
      "difficulty": "easy",
      "exp": "The correct option is \"Collecting user input\". In HTML (Selectors & Styling), \"Collecting user input\" directly satisfies the concept or fact asked in: What is the purpose of the `<form>` element?"
    },
    {
      "id": "html-cur-30",
      "text": "Which CSS unit is relative to the root element's font size?",
      "opts": [
        "em",
        "px",
        "rem",
        "%"
      ],
      "ans": 2,
      "cat": "Selectors & Styling",
      "difficulty": "medium",
      "exp": "The correct option is \"rem\". In HTML (Selectors & Styling), \"rem\" directly satisfies the concept or fact asked in: Which CSS unit is relative to the root element's font size?"
    },
    {
      "id": "html-cur-31",
      "text": "Which property controls the stacking order of positioned elements?",
      "opts": [
        "z-index",
        "order",
        "layer",
        "stack"
      ],
      "ans": 0,
      "cat": "CSS Layout & Box Model",
      "difficulty": "hard",
      "exp": "The correct option is \"z-index\". In HTML (CSS Layout & Box Model), \"z-index\" directly satisfies the concept or fact asked in: Which property controls the stacking order of positioned elements?"
    },
    {
      "id": "html-cur-32",
      "text": "Which HTML5 element is used for navigation links?",
      "opts": [
        "<nav>",
        "<navigate>",
        "<links>",
        "<menu>"
      ],
      "ans": 0,
      "cat": "Selectors & Styling",
      "difficulty": "easy",
      "exp": "The correct option is \"<nav>\". In HTML (Selectors & Styling), \"<nav>\" directly satisfies the concept or fact asked in: Which HTML5 element is used for navigation links?"
    },
    {
      "id": "html-cur-33",
      "text": "Which CSS property is used to change text color?",
      "opts": [
        "font-color",
        "text-color",
        "color",
        "fg-color"
      ],
      "ans": 2,
      "cat": "Selectors & Styling",
      "difficulty": "medium",
      "exp": "The correct option is \"color\". In HTML (Selectors & Styling), \"color\" directly satisfies the concept or fact asked in: Which CSS property is used to change text color?"
    },
    {
      "id": "html-cur-34",
      "text": "Which tag is used to define metadata about an HTML document?",
      "opts": [
        "<meta>",
        "<head>",
        "<info>",
        "<data>"
      ],
      "ans": 0,
      "cat": "Semantic HTML & DOM",
      "difficulty": "hard",
      "exp": "The correct option is \"<meta>\". In HTML (Semantic HTML & DOM), \"<meta>\" directly satisfies the concept or fact asked in: Which tag is used to define metadata about an HTML document?"
    },
    {
      "id": "html-cur-35",
      "text": "Which CSS property is used to create rounded corners?",
      "opts": [
        "corner-radius",
        "border-radius",
        "round-corner",
        "box-radius"
      ],
      "ans": 1,
      "cat": "HTML/CSS Fundamentals",
      "difficulty": "easy",
      "exp": "The correct option is \"border-radius\". In HTML (HTML/CSS Fundamentals), \"border-radius\" directly satisfies the concept or fact asked in: Which CSS property is used to create rounded corners?"
    },
    {
      "id": "html-cur-36",
      "text": "What does the `<iframe>` tag do?",
      "opts": [
        "Embeds another HTML page inside the current page",
        "Creates a form",
        "Defines an image map",
        "Creates a table"
      ],
      "ans": 0,
      "cat": "HTML/CSS Fundamentals",
      "difficulty": "medium",
      "exp": "The correct option is \"Embeds another HTML page inside the current page\". In HTML (HTML/CSS Fundamentals), \"Embeds another HTML page inside the current page\" directly satisfies the concept or fact asked in: What does the `<iframe>` tag do?"
    },
    {
      "id": "html-cur-37",
      "text": "Which CSS pseudo-class targets an element when the mouse is over it?",
      "opts": [
        ":active",
        ":hover",
        ":focus",
        ":visited"
      ],
      "ans": 1,
      "cat": "Selectors & Styling",
      "difficulty": "hard",
      "exp": "The correct option is \":hover\". In HTML (Selectors & Styling), \":hover\" directly satisfies the concept or fact asked in: Which CSS pseudo-class targets an element when the mouse is over it?"
    },
    {
      "id": "html-cur-38",
      "text": "What is the correct HTML5 element for playing video?",
      "opts": [
        "<media>",
        "<video>",
        "<movie>",
        "<play>"
      ],
      "ans": 1,
      "cat": "Selectors & Styling",
      "difficulty": "easy",
      "exp": "The correct option is \"<video>\". In HTML (Selectors & Styling), \"<video>\" directly satisfies the concept or fact asked in: What is the correct HTML5 element for playing video?"
    },
    {
      "id": "html-cur-39",
      "text": "Which CSS property controls the space between lines of text?",
      "opts": [
        "line-height",
        "text-spacing",
        "letter-spacing",
        "word-height"
      ],
      "ans": 0,
      "cat": "Forms, Lists & Tables",
      "difficulty": "medium",
      "exp": "The correct option is \"line-height\". In HTML (Forms, Lists & Tables), \"line-height\" directly satisfies the concept or fact asked in: Which CSS property controls the space between lines of text?"
    },
    {
      "id": "html-cur-40",
      "text": "What does `flex-direction: column` do in a flex container?",
      "opts": [
        "Stacks items vertically",
        "Stacks items horizontally",
        "Wraps items",
        "Centers items"
      ],
      "ans": 0,
      "cat": "CSS Layout & Box Model",
      "difficulty": "hard",
      "exp": "The correct option is \"Stacks items vertically\". In HTML (CSS Layout & Box Model), \"Stacks items vertically\" directly satisfies the concept or fact asked in: What does `flex-direction: column` do in a flex container?"
    },
    {
      "id": "html-cur-41",
      "text": "Which attribute is used to open a link in a new tab?",
      "opts": [
        "target='_blank'",
        "new='true'",
        "open='new'",
        "tab='new'"
      ],
      "ans": 0,
      "cat": "Forms, Lists & Tables",
      "difficulty": "easy",
      "exp": "The correct option is \"target='_blank'\". In HTML (Forms, Lists & Tables), \"target='_blank'\" directly satisfies the concept or fact asked in: Which attribute is used to open a link in a new tab?"
    },
    {
      "id": "html-cur-42",
      "text": "What is semantic HTML?",
      "opts": [
        "HTML that describes its meaning to browser and developer",
        "HTML with inline styles",
        "HTML without CSS",
        "HTML using only div tags"
      ],
      "ans": 0,
      "cat": "Selectors & Styling",
      "difficulty": "medium",
      "exp": "The correct option is \"HTML that describes its meaning to browser and developer\". In HTML (Selectors & Styling), \"HTML that describes its meaning to browser and developer\" directly satisfies the concept or fact asked in: What is semantic HTML?"
    },
    {
      "id": "html-cur-43",
      "text": "Which CSS property is used to control element transparency?",
      "opts": [
        "visibility",
        "opacity",
        "display",
        "transparency"
      ],
      "ans": 1,
      "cat": "Selectors & Styling",
      "difficulty": "hard",
      "exp": "The correct option is \"opacity\". In HTML (Selectors & Styling), \"opacity\" directly satisfies the concept or fact asked in: Which CSS property is used to control element transparency?"
    },
    {
      "id": "html-cur-44",
      "text": "What does the `<label>` tag do in a form?",
      "opts": [
        "Styles text",
        "Describes an input field, improving accessibility",
        "Creates a dropdown",
        "Validates input"
      ],
      "ans": 1,
      "cat": "Forms, Lists & Tables",
      "difficulty": "easy",
      "exp": "The correct option is \"Describes an input field, improving accessibility\". In HTML (Forms, Lists & Tables), \"Describes an input field, improving accessibility\" directly satisfies the concept or fact asked in: What does the `<label>` tag do in a form?"
    },
    {
      "id": "html-cur-45",
      "text": "Which value of `position` removes an element from normal document flow entirely?",
      "opts": [
        "relative",
        "static",
        "absolute",
        "inherit"
      ],
      "ans": 2,
      "cat": "CSS Layout & Box Model",
      "difficulty": "medium",
      "exp": "The correct option is \"absolute\". In HTML (CSS Layout & Box Model), \"absolute\" directly satisfies the concept or fact asked in: Which value of `position` removes an element from normal document flow entirely?"
    },
    {
      "id": "html-cur-46",
      "text": "What is the purpose of CSS media queries?",
      "opts": [
        "Add animations",
        "Apply styles conditionally based on device characteristics",
        "Load external fonts",
        "Define variables"
      ],
      "ans": 1,
      "cat": "Selectors & Styling",
      "difficulty": "hard",
      "exp": "The correct option is \"Apply styles conditionally based on device characteristics\". In HTML (Selectors & Styling), \"Apply styles conditionally based on device characteristics\" directly satisfies the concept or fact asked in: What is the purpose of CSS media queries?"
    },
    {
      "id": "html-cur-47",
      "text": "Which HTML tag is used to define an unordered list?",
      "opts": [
        "<ol>",
        "<ul>",
        "<list>",
        "<dl>"
      ],
      "ans": 1,
      "cat": "Forms, Lists & Tables",
      "difficulty": "easy",
      "exp": "The correct option is \"<ul>\". In HTML (Forms, Lists & Tables), \"<ul>\" directly satisfies the concept or fact asked in: Which HTML tag is used to define an unordered list?"
    },
    {
      "id": "html-cur-48",
      "text": "What does `box-sizing: border-box` do?",
      "opts": [
        "Excludes padding/border from declared width",
        "Includes padding and border within the declared width",
        "Removes the border",
        "Adds a shadow"
      ],
      "ans": 1,
      "cat": "CSS Layout & Box Model",
      "difficulty": "hard",
      "exp": "The correct option is \"Includes padding and border within the declared width\". In HTML (CSS Layout & Box Model), \"Includes padding and border within the declared width\" directly satisfies the concept or fact asked in: What does `box-sizing: border-box` do?"
    },
    {
      "id": "html-cur-49",
      "text": "Which CSS selector selects all direct children of an element?",
      "opts": [
        "element *",
        "element > child",
        "element + child",
        "element ~ child"
      ],
      "ans": 1,
      "cat": "Selectors & Styling",
      "difficulty": "hard",
      "exp": "The correct option is \"element > child\". In HTML (Selectors & Styling), \"element > child\" directly satisfies the concept or fact asked in: Which CSS selector selects all direct children of an element?"
    },
    {
      "id": "html-cur-50",
      "text": "What is the default `position` value for HTML elements?",
      "opts": [
        "absolute",
        "relative",
        "static",
        "fixed"
      ],
      "ans": 2,
      "cat": "CSS Layout & Box Model",
      "difficulty": "easy",
      "exp": "The correct option is \"static\". In HTML (CSS Layout & Box Model), \"static\" directly satisfies the concept or fact asked in: What is the default `position` value for HTML elements?"
    },
    {
      "id": "html-cur-51",
      "text": "Which tag is used to group related form elements?",
      "opts": [
        "<group>",
        "<fieldset>",
        "<section>",
        "<formgroup>"
      ],
      "ans": 1,
      "cat": "Selectors & Styling",
      "difficulty": "medium",
      "exp": "The correct option is \"<fieldset>\". In HTML (Selectors & Styling), \"<fieldset>\" directly satisfies the concept or fact asked in: Which tag is used to group related form elements?"
    },
    {
      "id": "html-cur-52",
      "text": "What does CSS specificity determine?",
      "opts": [
        "Which stylesheet loads first",
        "Which rule applies when multiple rules match an element",
        "Browser rendering speed",
        "Page load time"
      ],
      "ans": 1,
      "cat": "Selectors & Styling",
      "difficulty": "hard",
      "exp": "The correct option is \"Which rule applies when multiple rules match an element\". In HTML (Selectors & Styling), \"Which rule applies when multiple rules match an element\" directly satisfies the concept or fact asked in: What does CSS specificity determine?"
    },
    {
      "id": "html-cur-53",
      "text": "Which HTML attribute specifies a unique identifier for an element?",
      "opts": [
        "class",
        "name",
        "id",
        "key"
      ],
      "ans": 2,
      "cat": "Selectors & Styling",
      "difficulty": "easy",
      "exp": "The correct option is \"id\". In HTML (Selectors & Styling), \"id\" directly satisfies the concept or fact asked in: Which HTML attribute specifies a unique identifier for an element?"
    },
    {
      "id": "html-cur-54",
      "text": "What is the purpose of the `alt` attribute besides accessibility?",
      "opts": [
        "Displayed if the image fails to load",
        "Sets image size",
        "Adds a border",
        "Compresses the image"
      ],
      "ans": 0,
      "cat": "Forms, Lists & Tables",
      "difficulty": "medium",
      "exp": "The correct option is \"Displayed if the image fails to load\". In HTML (Forms, Lists & Tables), \"Displayed if the image fails to load\" directly satisfies the concept or fact asked in: What is the purpose of the `alt` attribute besides accessibility?"
    }
  ],
  "crt": [
    {
      "id": "crt-cur-1",
      "text": "If a train covers 60 km in 1.5 hours, what is its average speed?",
      "opts": [
        "30 km/h",
        "40 km/h",
        "45 km/h",
        "50 km/h"
      ],
      "ans": 1,
      "cat": "Time, Speed & Distance",
      "difficulty": "easy",
      "exp": "Speed = Distance ÷ Time = 60 ÷ 1.5 = 40 km/h."
    },
    {
      "id": "crt-cur-2",
      "text": "Find the next number in the series: 2, 6, 12, 20, 30, ?",
      "opts": [
        "36",
        "40",
        "42",
        "44"
      ],
      "ans": 2,
      "cat": "Series & Coding-Decoding",
      "difficulty": "medium",
      "exp": "The differences between consecutive terms are +4, +6, +8, +10. Adding the next even difference +12 gives 30 + 12 = 42 (or n(n+1) for n=6: 6 × 7 = 42)."
    },
    {
      "id": "crt-cur-3",
      "text": "A sum of money doubles itself in 8 years at simple interest. What is the annual rate of interest?",
      "opts": [
        "10%",
        "12.5%",
        "15%",
        "20%"
      ],
      "ans": 1,
      "cat": "Profit, Loss & Interest",
      "difficulty": "hard",
      "exp": "To double, Simple Interest SI = P. Since SI = (P × R × 8) / 100 = P, we get R = 100 / 8 = 12.5%."
    },
    {
      "id": "crt-cur-4",
      "text": "If CODING is written as DPEJOH in a cipher, how is FLOWER written?",
      "opts": [
        "GMPXFS",
        "GMPXES",
        "FMPXFS",
        "GMOXFS"
      ],
      "ans": 0,
      "cat": "Series & Coding-Decoding",
      "difficulty": "easy",
      "exp": "Each letter is shifted forward by +1 in the alphabet: F→G, L→M, O→P, W→X, E→F, R→S, giving `GMPXFS`."
    },
    {
      "id": "crt-cur-5",
      "text": "A can complete a job in 10 days and B in 15 days. Working together, how many days will they take?",
      "opts": [
        "5",
        "6",
        "7",
        "8"
      ],
      "ans": 1,
      "cat": "Time & Work",
      "difficulty": "medium",
      "exp": "Combined daily work rate = 1/10 + 1/15 = (3 + 2)/30 = 5/30 = 1/6 of the job per day, so they finish in 6 days."
    },
    {
      "id": "crt-cur-6",
      "text": "A person walks 6 km North, then turns and walks 8 km East. How far is he from the starting point?",
      "opts": [
        "10 km",
        "12 km",
        "14 km",
        "8 km"
      ],
      "ans": 0,
      "cat": "Time, Speed & Distance",
      "difficulty": "hard",
      "exp": "By the Pythagorean theorem on the right triangle with legs 6 km and 8 km, displacement = √(6² + 8²) = √(36 + 64) = √100 = 10 km."
    },
    {
      "id": "crt-cur-7",
      "text": "A boat travels 20 km downstream in 2 hours and 20 km upstream in 4 hours. Find the speed of the boat in still water.",
      "opts": [
        "6 km/h",
        "7.5 km/h",
        "8 km/h",
        "10 km/h"
      ],
      "ans": 1,
      "cat": "Time, Speed & Distance",
      "difficulty": "hard",
      "exp": "Downstream speed = 20/2 = 10 km/h; upstream speed = 20/4 = 5 km/h. Boat speed in still water = (10 + 5)/2 = 7.5 km/h."
    },
    {
      "id": "crt-cur-8",
      "text": "If a clock shows 3:15, what is the acute angle between the hour and minute hands?",
      "opts": [
        "0°",
        "7.5°",
        "15°",
        "30°"
      ],
      "ans": 1,
      "cat": "Time, Speed & Distance",
      "difficulty": "hard",
      "exp": "At 3:15, the minute hand is at 90° (on the 3), while the hour hand has moved 15 × 0.5° = 7.5° past the 3 to 97.5°. Difference = 7.5°."
    },
    {
      "id": "crt-cur-9",
      "text": "If the cost price of 20 articles equals the selling price of 16 articles, what is the profit percentage?",
      "opts": [
        "20%",
        "25%",
        "30%",
        "16%"
      ],
      "ans": 1,
      "cat": "Profit, Loss & Interest",
      "difficulty": "easy",
      "exp": "Let CP of 1 article = ₹1. Then SP of 16 articles = ₹20, while CP of 16 articles = ₹16. Profit % = ((20 - 16)/16) × 100 = 25%."
    },
    {
      "id": "crt-cur-10",
      "text": "What is 15% of 200?",
      "opts": [
        "20",
        "25",
        "30",
        "35"
      ],
      "ans": 2,
      "cat": "Logical & Analytical Reasoning",
      "difficulty": "medium",
      "exp": "The correct option is \"30\". In CRT (Logical & Analytical Reasoning), \"30\" directly satisfies the concept or fact asked in: What is 15% of 200?"
    },
    {
      "id": "crt-cur-11",
      "text": "Pointing to a man, a woman said, 'His mother is the only daughter of my mother.' How is the woman related to the man?",
      "opts": [
        "Aunt",
        "Sister",
        "Mother",
        "Grandmother"
      ],
      "ans": 2,
      "cat": "Logical & Analytical Reasoning",
      "difficulty": "hard",
      "exp": "The correct option is \"Mother\". In CRT (Logical & Analytical Reasoning), \"Mother\" directly satisfies the concept or fact asked in: Pointing to a man, a woman said, 'His mother is the only daughter of my mother.' How is the woman related to the man?"
    },
    {
      "id": "crt-cur-12",
      "text": "If the average of 5 numbers is 20, what is their sum?",
      "opts": [
        "100",
        "95",
        "105",
        "90"
      ],
      "ans": 0,
      "cat": "Profit, Loss & Interest",
      "difficulty": "easy",
      "exp": "The correct option is \"100\". In CRT (Profit, Loss & Interest), \"100\" directly satisfies the concept or fact asked in: If the average of 5 numbers is 20, what is their sum?"
    },
    {
      "id": "crt-cur-13",
      "text": "Find the odd one out: 3, 5, 7, 9, 11",
      "opts": [
        "3",
        "5",
        "9",
        "11"
      ],
      "ans": 2,
      "cat": "Series & Coding-Decoding",
      "difficulty": "medium",
      "exp": "The correct option is \"9\". In CRT (Series & Coding-Decoding), \"9\" directly satisfies the concept or fact asked in: Find the odd one out: 3, 5, 7, 9, 11"
    },
    {
      "id": "crt-cur-14",
      "text": "If 5 workers can build a wall in 20 days, how many days will 10 workers take?",
      "opts": [
        "5",
        "10",
        "15",
        "20"
      ],
      "ans": 1,
      "cat": "Time & Work",
      "difficulty": "easy",
      "exp": "The correct option is \"10\". In CRT (Time & Work), \"10\" directly satisfies the concept or fact asked in: If 5 workers can build a wall in 20 days, how many days will 10 workers take?"
    },
    {
      "id": "crt-cur-15",
      "text": "Which number should replace the question mark: 7, 14, 28, 56, ?",
      "opts": [
        "84",
        "98",
        "112",
        "110"
      ],
      "ans": 2,
      "cat": "Logical & Analytical Reasoning",
      "difficulty": "medium",
      "exp": "The correct option is \"112\". In CRT (Logical & Analytical Reasoning), \"112\" directly satisfies the concept or fact asked in: Which number should replace the question mark: 7, 14, 28, 56, ?"
    },
    {
      "id": "crt-cur-16",
      "text": "If the ratio of two numbers is 3:4 and their sum is 63, find the larger number.",
      "opts": [
        "27",
        "36",
        "32",
        "30"
      ],
      "ans": 1,
      "cat": "Profit, Loss & Interest",
      "difficulty": "easy",
      "exp": "The correct option is \"36\". In CRT (Profit, Loss & Interest), \"36\" directly satisfies the concept or fact asked in: If the ratio of two numbers is 3:4 and their sum is 63, find the larger number."
    },
    {
      "id": "crt-cur-17",
      "text": "What comes next in the series: A, C, F, J, O, ?",
      "opts": [
        "T",
        "U",
        "S",
        "V"
      ],
      "ans": 1,
      "cat": "Series & Coding-Decoding",
      "difficulty": "medium",
      "exp": "The correct option is \"U\". In CRT (Series & Coding-Decoding), \"U\" directly satisfies the concept or fact asked in: What comes next in the series: A, C, F, J, O, ?"
    },
    {
      "id": "crt-cur-18",
      "text": "If today is Wednesday, what day will it be after 100 days?",
      "opts": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Friday"
      ],
      "ans": 3,
      "cat": "Time & Work",
      "difficulty": "hard",
      "exp": "The correct option is \"Friday\". In CRT (Time & Work), \"Friday\" directly satisfies the concept or fact asked in: If today is Wednesday, what day will it be after 100 days?"
    },
    {
      "id": "crt-cur-19",
      "text": "Two pipes can fill a tank in 12 and 18 minutes. How long will both take together?",
      "opts": [
        "6.2 min",
        "7.2 min",
        "8 min",
        "9 min"
      ],
      "ans": 1,
      "cat": "Time, Speed & Distance",
      "difficulty": "easy",
      "exp": "The correct option is \"7.2 min\". In CRT (Time, Speed & Distance), \"7.2 min\" directly satisfies the concept or fact asked in: Two pipes can fill a tank in 12 and 18 minutes. How long will both take together?"
    },
    {
      "id": "crt-cur-20",
      "text": "A man's age is 4 times his son's age. After 20 years, he will be twice his son's age. Find the son's present age.",
      "opts": [
        "10",
        "12",
        "15",
        "20"
      ],
      "ans": 0,
      "cat": "Quantitative & Number System",
      "difficulty": "medium",
      "exp": "The correct option is \"10\". In CRT (Quantitative & Number System), \"10\" directly satisfies the concept or fact asked in: A man's age is 4 times his son's age. After 20 years, he will be twice his son's age. Find the son's present age."
    },
    {
      "id": "crt-cur-21",
      "text": "Find the missing number: 4, 9, 16, 25, ?, 49",
      "opts": [
        "30",
        "36",
        "32",
        "40"
      ],
      "ans": 1,
      "cat": "Series & Coding-Decoding",
      "difficulty": "hard",
      "exp": "The correct option is \"36\". In CRT (Series & Coding-Decoding), \"36\" directly satisfies the concept or fact asked in: Find the missing number: 4, 9, 16, 25, ?, 49"
    },
    {
      "id": "crt-cur-22",
      "text": "If a code assigns A=1, B=2, ..., Z=26, what is the sum of letters in 'CAB'?",
      "opts": [
        "6",
        "7",
        "9",
        "5"
      ],
      "ans": 1,
      "cat": "Profit, Loss & Interest",
      "difficulty": "easy",
      "exp": "The correct option is \"7\". In CRT (Profit, Loss & Interest), \"7\" directly satisfies the concept or fact asked in: If a code assigns A=1, B=2, ..., Z=26, what is the sum of letters in 'CAB'?"
    },
    {
      "id": "crt-cur-23",
      "text": "A trader sells goods at 20% loss. If he had sold it for ₹100 more, he would have gained 5%. Find the cost price.",
      "opts": [
        "₹400",
        "₹500",
        "₹450",
        "₹350"
      ],
      "ans": 0,
      "cat": "Profit, Loss & Interest",
      "difficulty": "medium",
      "exp": "Moving from a 20% loss (0.80 CP) to a 5% gain (1.05 CP) is a swing of 25% of the cost price. Since 25% of CP = ₹100, Cost Price = 100 ÷ 0.25 = ₹400."
    },
    {
      "id": "crt-cur-24",
      "text": "In how many ways can the letters of the word 'BAT' be arranged?",
      "opts": [
        "3",
        "6",
        "9",
        "12"
      ],
      "ans": 1,
      "cat": "Series & Coding-Decoding",
      "difficulty": "hard",
      "exp": "The correct option is \"6\". In CRT (Series & Coding-Decoding), \"6\" directly satisfies the concept or fact asked in: In how many ways can the letters of the word 'BAT' be arranged?"
    },
    {
      "id": "crt-cur-25",
      "text": "A car travels at 60 km/h for 2 hours and 40 km/h for 1 hour. What is the average speed?",
      "opts": [
        "50 km/h",
        "52 km/h",
        "53.3 km/h",
        "55 km/h"
      ],
      "ans": 2,
      "cat": "Time, Speed & Distance",
      "difficulty": "easy",
      "exp": "The correct option is \"53.3 km/h\". In CRT (Time, Speed & Distance), \"53.3 km/h\" directly satisfies the concept or fact asked in: A car travels at 60 km/h for 2 hours and 40 km/h for 1 hour. What is the average speed?"
    },
    {
      "id": "crt-cur-26",
      "text": "If x + y = 10 and xy = 21, what is x^2 + y^2?",
      "opts": [
        "58",
        "54",
        "50",
        "62"
      ],
      "ans": 0,
      "cat": "Quantitative & Number System",
      "difficulty": "medium",
      "exp": "x² + y² = (x + y)² - 2xy = 100 - 42 = 58."
    },
    {
      "id": "crt-cur-27",
      "text": "A sum triples itself in 15 years at simple interest. What is the rate of interest?",
      "opts": [
        "10%",
        "13.33%",
        "15%",
        "20%"
      ],
      "ans": 1,
      "cat": "Profit, Loss & Interest",
      "difficulty": "hard",
      "exp": "To triple, SI = 2P. Rate R = (2 × 100) / 15 = 13.33% per annum."
    },
    {
      "id": "crt-cur-28",
      "text": "Find the odd one out: 8, 27, 64, 100, 125",
      "opts": [
        "27",
        "64",
        "100",
        "125"
      ],
      "ans": 2,
      "cat": "Series & Coding-Decoding",
      "difficulty": "easy",
      "exp": "8, 27, 64, and 125 are perfect cubes (2³, 3³, 4³, 5³), whereas 100 is not a cube."
    },
    {
      "id": "crt-cur-29",
      "text": "If a clock shows 3:15, what is the angle between the hour and minute hands?",
      "opts": [
        "0 degrees",
        "7.5 degrees",
        "15 degrees",
        "30 degrees"
      ],
      "ans": 1,
      "cat": "Time, Speed & Distance",
      "difficulty": "medium",
      "exp": "At 3:15 the minute hand is at 90° and the hour hand is at 90° + (15 × 0.5°) = 97.5°, creating a 7.5° angle."
    },
    {
      "id": "crt-cur-30",
      "text": "A train 120 m long passes a pole in 12 seconds. What is its speed?",
      "opts": [
        "10 m/s",
        "12 m/s",
        "36 km/h",
        "Both a and c"
      ],
      "ans": 3,
      "cat": "Time, Speed & Distance",
      "difficulty": "hard",
      "exp": "Speed = 120 m / 12 s = 10 m/s = 10 × 3.6 = 36 km/h, so both 10 m/s and 36 km/h are correct."
    },
    {
      "id": "crt-cur-31",
      "text": "If A is twice as good a workman as B, and together they finish a job in 14 days, how long will A alone take?",
      "opts": [
        "18 days",
        "20 days",
        "21 days",
        "24 days"
      ],
      "ans": 2,
      "cat": "Time, Speed & Distance",
      "difficulty": "easy",
      "exp": "Combined rate = 3 units/day; total work = 14 × 3 = 42 units. A alone (2 units/day) takes 42 / 2 = 21 days."
    },
    {
      "id": "crt-cur-32",
      "text": "What is the next term: 1, 4, 9, 16, 25, ?",
      "opts": [
        "30",
        "36",
        "32",
        "49"
      ],
      "ans": 1,
      "cat": "Series & Coding-Decoding",
      "difficulty": "medium",
      "exp": "Consecutive squares 1², 2², 3², 4², 5²; next is 6² = 36."
    },
    {
      "id": "crt-cur-33",
      "text": "Two numbers are in the ratio 5:6 and their LCM is 480. Find the numbers.",
      "opts": [
        "40, 48",
        "50, 60",
        "60, 72",
        "80, 96"
      ],
      "ans": 3,
      "cat": "Quantitative & Number System",
      "difficulty": "hard",
      "exp": "Let the numbers be 5x and 6x. Since 5 and 6 are coprime, their LCM is 30x. Setting 30x = 480 gives x = 16, so the numbers are 5×16 = 80 and 6×16 = 96."
    },
    {
      "id": "crt-cur-34",
      "text": "If 20% of a number is 50, what is the number?",
      "opts": [
        "200",
        "250",
        "300",
        "150"
      ],
      "ans": 1,
      "cat": "Logical & Analytical Reasoning",
      "difficulty": "easy",
      "exp": "Number = 50 ÷ 0.20 = 250."
    },
    {
      "id": "crt-cur-35",
      "text": "A father is 3 times as old as his son. In 12 years, he will be twice as old. Find the father's present age.",
      "opts": [
        "30",
        "36",
        "42",
        "48"
      ],
      "ans": 1,
      "cat": "Quantitative & Number System",
      "difficulty": "medium",
      "exp": "3s + 12 = 2(s + 12) ⇒ s = 12, so the father’s current age is 3 × 12 = 36."
    },
    {
      "id": "crt-cur-36",
      "text": "Which word does NOT belong: Apple, Banana, Carrot, Mango",
      "opts": [
        "Apple",
        "Banana",
        "Carrot",
        "Mango"
      ],
      "ans": 2,
      "cat": "Logical & Analytical Reasoning",
      "difficulty": "hard",
      "exp": "Carrot is a root vegetable, while Apple, Banana, and Mango are fruits."
    },
    {
      "id": "crt-cur-37",
      "text": "In a certain code, TABLE is written as UBCMF. How is CHAIR written in that code?",
      "opts": [
        "DIBJS",
        "DIBIS",
        "DHBJS",
        "DIAJS"
      ],
      "ans": 0,
      "cat": "Series & Coding-Decoding",
      "difficulty": "easy",
      "exp": "Shifting each letter of CHAIR forward by +1 gives D-I-B-J-S."
    },
    {
      "id": "crt-cur-38",
      "text": "A sells a bicycle to B at 20% profit and B sells it to C at 25% profit. If C pays ₹300, what did A pay?",
      "opts": [
        "₹180",
        "₹200",
        "₹190",
        "₹210"
      ],
      "ans": 1,
      "cat": "Profit, Loss & Interest",
      "difficulty": "medium",
      "exp": "Cost × 1.20 × 1.25 = Cost × 1.50 = ₹300 ⇒ Cost = ₹200."
    },
    {
      "id": "crt-cur-39",
      "text": "Find the missing number in the series: 3, 7, 15, 31, ?",
      "opts": [
        "47",
        "63",
        "57",
        "61"
      ],
      "ans": 1,
      "cat": "Series & Coding-Decoding",
      "difficulty": "hard",
      "exp": "Each term doubles the previous and adds 1: 31 × 2 + 1 = 63."
    },
    {
      "id": "crt-cur-40",
      "text": "A is the brother of B. B is the sister of C. C is the father of D. How is A related to D?",
      "opts": [
        "Uncle",
        "Father",
        "Grandfather",
        "Cousin"
      ],
      "ans": 0,
      "cat": "Logical & Analytical Reasoning",
      "difficulty": "easy",
      "exp": "A is the brother of D’s father C, making A the paternal uncle of D."
    },
    {
      "id": "crt-cur-41",
      "text": "If the perimeter of a square is 64 cm, what is its area?",
      "opts": [
        "256 sq cm",
        "128 sq cm",
        "64 sq cm",
        "512 sq cm"
      ],
      "ans": 0,
      "cat": "Quantitative & Number System",
      "difficulty": "medium",
      "exp": "Side = 64 / 4 = 16 cm; Area = 16² = 256 sq cm."
    },
    {
      "id": "crt-cur-42",
      "text": "A bag contains 4 red and 6 blue balls. What is the probability of picking a red ball?",
      "opts": [
        "0.4",
        "0.6",
        "0.5",
        "0.25"
      ],
      "ans": 0,
      "cat": "Quantitative & Number System",
      "difficulty": "hard",
      "exp": "Probability of red = 4 / (4 + 6) = 4 / 10 = 0.4."
    },
    {
      "id": "crt-cur-43",
      "text": "If 8 men can dig a pit in 12 days, how many men are needed to dig it in 6 days?",
      "opts": [
        "12",
        "14",
        "16",
        "20"
      ],
      "ans": 2,
      "cat": "Time & Work",
      "difficulty": "easy",
      "exp": "Men needed = (8 × 12) / 6 = 16 men."
    },
    {
      "id": "crt-cur-44",
      "text": "Find the next letter series: Z, X, V, T, ?",
      "opts": [
        "S",
        "R",
        "Q",
        "P"
      ],
      "ans": 1,
      "cat": "Series & Coding-Decoding",
      "difficulty": "medium",
      "exp": "Alphabet positions decrease by 2 each step: 26(Z), 24(X), 22(V), 20(T), 18(R)."
    },
    {
      "id": "crt-cur-45",
      "text": "A number when divided by 6 leaves remainder 3. What is the remainder when its square is divided by 6?",
      "opts": [
        "1",
        "2",
        "3",
        "0"
      ],
      "ans": 2,
      "cat": "Quantitative & Number System",
      "difficulty": "hard",
      "exp": "(6k + 3)² = 36k² + 36k + 9 = 6(6k² + 6k + 1) + 3, leaving remainder 3."
    }
  ],
  "gk": [
    {
      "id": "gk-cur-1",
      "text": "Who chaired the Drafting Committee and is known as the chief architect of the Indian Constitution?",
      "opts": [
        "Mahatma Gandhi",
        "Dr. B. R. Ambedkar",
        "Jawaharlal Nehru",
        "Sardar Vallabhbhai Patel"
      ],
      "ans": 1,
      "cat": "Polity",
      "difficulty": "easy",
      "exp": "Dr. B. R. Ambedkar served as Chairman of the Drafting Committee of the Constituent Assembly."
    },
    {
      "id": "gk-cur-2",
      "text": "Which is the largest planet in our solar system by mass and volume?",
      "opts": [
        "Earth",
        "Saturn",
        "Jupiter",
        "Neptune"
      ],
      "ans": 2,
      "cat": "Science",
      "difficulty": "medium",
      "exp": "Jupiter is a gas giant with more than twice the mass of all other solar system planets combined."
    },
    {
      "id": "gk-cur-3",
      "text": "What is the official currency of Japan?",
      "opts": [
        "Yuan",
        "Won",
        "Yen",
        "Ringgit"
      ],
      "ans": 2,
      "cat": "Economy",
      "difficulty": "hard",
      "exp": "The Japanese Yen (¥, JPY) is the official currency of Japan."
    },
    {
      "id": "gk-cur-4",
      "text": "Which gas do green plants absorb from the atmosphere to fix carbon during photosynthesis?",
      "opts": [
        "Oxygen",
        "Carbon dioxide",
        "Nitrogen",
        "Hydrogen"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "easy",
      "exp": "During the Calvin cycle of photosynthesis, plants fix atmospheric carbon dioxide (CO₂) into glucose."
    },
    {
      "id": "gk-cur-5",
      "text": "Which is the smallest independent country in the world by land area?",
      "opts": [
        "Monaco",
        "San Marino",
        "Vatican City",
        "Liechtenstein"
      ],
      "ans": 2,
      "cat": "Geography",
      "difficulty": "medium",
      "exp": "Vatican City covers roughly 0.49 square kilometers (121 acres) inside Rome, making it the smallest sovereign state."
    },
    {
      "id": "gk-cur-6",
      "text": "Which Indian city is widely known as the 'Silicon Valley of India'?",
      "opts": [
        "Chennai",
        "Hyderabad",
        "Bengaluru",
        "Pune"
      ],
      "ans": 2,
      "cat": "Geography",
      "difficulty": "hard",
      "exp": "Bengaluru is India's leading IT exporter and startup hub, earning it the nickname 'Silicon Valley of India'."
    },
    {
      "id": "gk-cur-7",
      "text": "What is the chemical symbol for gold?",
      "opts": [
        "Go",
        "Gd",
        "Au",
        "Ag"
      ],
      "ans": 2,
      "cat": "Science",
      "difficulty": "easy",
      "exp": "Gold's symbol `Au` derives from its Latin name aurum ('shining dawn')."
    },
    {
      "id": "gk-cur-8",
      "text": "Which vitamin is synthesized in human skin upon exposure to ultraviolet B (UVB) sunlight?",
      "opts": [
        "Vitamin A",
        "Vitamin C",
        "Vitamin D",
        "Vitamin K"
      ],
      "ans": 2,
      "cat": "Science",
      "difficulty": "medium",
      "exp": "UVB radiation converts 7-dehydrocholesterol in the epidermis into previtamin D₃ (cholecalciferol)."
    },
    {
      "id": "gk-cur-9",
      "text": "What is the capital city of Australia?",
      "opts": [
        "Sydney",
        "Melbourne",
        "Canberra",
        "Perth"
      ],
      "ans": 2,
      "cat": "Geography",
      "difficulty": "hard",
      "exp": "Canberra was selected in 1908 as a planned compromise capital between rivals Sydney and Melbourne."
    },
    {
      "id": "gk-cur-10",
      "text": "What is the SI base unit of electric current?",
      "opts": [
        "Volt",
        "Watt",
        "Ampere",
        "Ohm"
      ],
      "ans": 2,
      "cat": "Science",
      "difficulty": "easy",
      "exp": "The Ampere (A) is the SI base unit of electric current, equal to one coulomb of charge per second."
    },
    {
      "id": "gk-cur-11",
      "text": "Which blood group is known as the universal red blood cell donor?",
      "opts": [
        "AB+",
        "O−",
        "A+",
        "B−"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "medium",
      "exp": "Type O-negative red blood cells lack A, B, and RhD antigens, minimizing transfusion reactions in recipients."
    },
    {
      "id": "gk-cur-12",
      "text": "Which is the deepest known point in Earth's oceans?",
      "opts": [
        "Puerto Rico Trench",
        "Mariana Trench (Challenger Deep)",
        "Java Trench",
        "Tonga Trench"
      ],
      "ans": 1,
      "cat": "Geography",
      "difficulty": "hard",
      "exp": "Challenger Deep in the western Pacific's Mariana Trench reaches nearly 11,000 meters below sea level."
    },
    {
      "id": "gk-cur-13",
      "text": "Which mountain range forms the traditional physical boundary between Europe and Asia?",
      "opts": [
        "Alps",
        "Andes",
        "Ural Mountains",
        "Himalayas"
      ],
      "ans": 2,
      "cat": "Geography",
      "difficulty": "easy",
      "exp": "Running north-to-south through western Russia, the Ural Mountains mark the conventional boundary between Europe and Asia."
    },
    {
      "id": "gk-cur-14",
      "text": "Which Article of the Indian Constitution abolishes 'Untouchability' and forbids its practice in any form?",
      "opts": [
        "Article 14",
        "Article 17",
        "Article 21",
        "Article 32"
      ],
      "ans": 1,
      "cat": "Polity",
      "difficulty": "medium",
      "exp": "Article 17 under the Right to Equality abolishes untouchability and makes its enforcement a punishable offense."
    },
    {
      "id": "gk-cur-15",
      "text": "Which Tenth Schedule amendment introduced the Anti-Defection Law in India?",
      "opts": [
        "42nd Amendment",
        "44th Amendment",
        "52nd Amendment (1985)",
        "61st Amendment"
      ],
      "ans": 2,
      "cat": "Polity",
      "difficulty": "hard",
      "exp": "The 52nd Constitutional Amendment Act of 1985 added the Tenth Schedule to curb political defections."
    },
    {
      "id": "gk-cur-16",
      "text": "Which organization publishes the 'World Economic Outlook' report twice a year?",
      "opts": [
        "World Bank",
        "International Monetary Fund (IMF)",
        "World Trade Organization",
        "UNCTAD"
      ],
      "ans": 1,
      "cat": "Economy",
      "difficulty": "easy",
      "exp": "The IMF publishes the World Economic Outlook (WEO) analysing global economic growth, inflation, and fiscal trends."
    },
    {
      "id": "gk-cur-17",
      "text": "Which ISRO mission successfully achieved a soft landing near the Moon's south pole in August 2023?",
      "opts": [
        "Mangalyaan",
        "Chandrayaan-3",
        "Gaganyaan",
        "Aditya-L1"
      ],
      "ans": 1,
      "cat": "Space & Tech",
      "difficulty": "medium",
      "exp": "Chandrayaan-3's Vikram lander touched down at 69°S latitude on August 23, 2023, making India the first nation to land near the lunar south pole."
    },
    {
      "id": "gk-cur-18",
      "text": "Which Indian space observatory was launched in 2023 to study the Sun from the L1 Lagrange point?",
      "opts": [
        "Chandrayaan-2",
        "AstroSat",
        "Aditya-L1",
        "RISAT-1"
      ],
      "ans": 2,
      "cat": "Space & Tech",
      "difficulty": "hard",
      "exp": "Aditya-L1 operates in a halo orbit around the Sun-Earth Lagrange point 1 (L1) to observe the solar corona and solar wind."
    },
    {
      "id": "gk-cur-19",
      "text": "In which city is the Nobel Peace Prize awarded annually, unlike the other Nobel Prizes awarded in Stockholm?",
      "opts": [
        "Geneva",
        "Oslo",
        "Vienna",
        "The Hague"
      ],
      "ans": 1,
      "cat": "Awards & Honours",
      "difficulty": "easy",
      "exp": "As stipulated in Alfred Nobel's will, the Nobel Peace Prize is selected by the Norwegian Nobel Committee and presented in Oslo."
    },
    {
      "id": "gk-cur-20",
      "text": "Who wrote the autobiography 'Wings of Fire'?",
      "opts": [
        "Dr. A. P. J. Abdul Kalam",
        "Jawaharlal Nehru",
        "Dr. Vikram Sarabhai",
        "Dr. Homi Bhabha"
      ],
      "ans": 0,
      "cat": "Books & Authors",
      "difficulty": "medium",
      "exp": "'Wings of Fire' (co-authored with Arun Tiwari) chronicles the early life and aerospace career of Dr. A. P. J. Abdul Kalam."
    },
    {
      "id": "gk-cur-21",
      "text": "Which classical Indian dance form originated in the temples of Tamil Nadu?",
      "opts": [
        "Kathak",
        "Bharatanatyam",
        "Odissi",
        "Kathakali"
      ],
      "ans": 1,
      "cat": "Art & Culture",
      "difficulty": "hard",
      "exp": "Bharatanatyam evolved from Sadir Attam in the temples of Tamil Nadu and is codified in the Natya Shastra."
    },
    {
      "id": "gk-cur-22",
      "text": "Which atmospheric layer contains the highest concentration of ozone (O₃) that absorbs harmful solar UV radiation?",
      "opts": [
        "Troposphere",
        "Stratosphere",
        "Mesosphere",
        "Thermosphere"
      ],
      "ans": 1,
      "cat": "Environment",
      "difficulty": "easy",
      "exp": "About 90% of atmospheric ozone resides in the Stratosphere (15–35 km altitude), shielding Earth from UV-B and UV-C rays."
    },
    {
      "id": "gk-cur-23",
      "text": "Which 2015 landmark international treaty commits nations to keep global warming well below 2°C above pre-industrial levels?",
      "opts": [
        "Kyoto Protocol",
        "Montreal Protocol",
        "Paris Agreement",
        "Ramsar Convention"
      ],
      "ans": 2,
      "cat": "Environment",
      "difficulty": "medium",
      "exp": "Adopted at COP21 in December 2015, the Paris Agreement sets long-term temperature goals and nationally determined contributions."
    },
    {
      "id": "gk-cur-24",
      "text": "What does 'HTTP' stand for in web networking?",
      "opts": [
        "HyperText Transfer Protocol",
        "High Transmission Text Process",
        "Hyperlink Tracking Protocol",
        "Host Transfer Terminal Protocol"
      ],
      "ans": 0,
      "cat": "Computers & Tech",
      "difficulty": "hard",
      "exp": "HTTP (HyperText Transfer Protocol) is the application-layer protocol used for transmitting hypermedia documents on the Web."
    },
    {
      "id": "gk-cur-25",
      "text": "Where is the headquarters of the World Health Organization (WHO) located?",
      "opts": [
        "New York, USA",
        "Geneva, Switzerland",
        "Vienna, Austria",
        "Brussels, Belgium"
      ],
      "ans": 1,
      "cat": "World Organizations",
      "difficulty": "easy",
      "exp": "Founded in 1948, the World Health Organization is headquartered in Geneva, Switzerland."
    },
    {
      "id": "gk-cur-26",
      "text": "In tennis, what term is used to represent a score of zero points in a game?",
      "opts": [
        "Nil",
        "Love",
        "Duck",
        "Deuce"
      ],
      "ans": 1,
      "cat": "Sports",
      "difficulty": "medium",
      "exp": "In tennis scoring (Love, 15, 30, 40), 'Love' denotes a score of zero."
    },
    {
      "id": "gk-cur-27",
      "text": "Which is the longest river in the world?",
      "opts": [
        "Amazon",
        "Nile",
        "Ganges",
        "Yangtze"
      ],
      "ans": 1,
      "cat": "Geography",
      "difficulty": "medium",
      "exp": "The correct option is \"Nile\". In GK (Geography), \"Nile\" directly satisfies the concept or fact asked in: Which is the longest river in the world?"
    },
    {
      "id": "gk-cur-28",
      "text": "Who wrote the Indian National Anthem?",
      "opts": [
        "Bankim Chandra",
        "Rabindranath Tagore",
        "Sarojini Naidu",
        "Subhas Chandra Bose"
      ],
      "ans": 1,
      "cat": "History",
      "difficulty": "hard",
      "exp": "The correct option is \"Rabindranath Tagore\". In GK (History), \"Rabindranath Tagore\" directly satisfies the concept or fact asked in: Who wrote the Indian National Anthem?"
    },
    {
      "id": "gk-cur-29",
      "text": "What does GDP stand for?",
      "opts": [
        "Gross Domestic Product",
        "General Development Plan",
        "Global Development Product",
        "Gross Development Price"
      ],
      "ans": 0,
      "cat": "Economy",
      "difficulty": "easy",
      "exp": "The correct option is \"Gross Domestic Product\". In GK (Economy), \"Gross Domestic Product\" directly satisfies the concept or fact asked in: What does GDP stand for?"
    },
    {
      "id": "gk-cur-30",
      "text": "How many continents are there on Earth?",
      "opts": [
        "5",
        "6",
        "7",
        "8"
      ],
      "ans": 2,
      "cat": "Geography",
      "difficulty": "medium",
      "exp": "The correct option is \"7\". In GK (Geography), \"7\" directly satisfies the concept or fact asked in: How many continents are there on Earth?"
    },
    {
      "id": "gk-cur-31",
      "text": "Which organ in the human body is primarily responsible for pumping blood?",
      "opts": [
        "Lungs",
        "Liver",
        "Heart",
        "Kidney"
      ],
      "ans": 2,
      "cat": "Science",
      "difficulty": "hard",
      "exp": "The correct option is \"Heart\". In GK (Science), \"Heart\" directly satisfies the concept or fact asked in: Which organ in the human body is primarily responsible for pumping blood?"
    },
    {
      "id": "gk-cur-32",
      "text": "The Great Barrier Reef is located near which country?",
      "opts": [
        "Brazil",
        "Australia",
        "South Africa",
        "Indonesia"
      ],
      "ans": 1,
      "cat": "Geography",
      "difficulty": "medium",
      "exp": "The correct option is \"Australia\". In GK (Geography), \"Australia\" directly satisfies the concept or fact asked in: The Great Barrier Reef is located near which country?"
    },
    {
      "id": "gk-cur-33",
      "text": "Who was the first Prime Minister of India?",
      "opts": [
        "Mahatma Gandhi",
        "Jawaharlal Nehru",
        "Sardar Patel",
        "Rajendra Prasad"
      ],
      "ans": 1,
      "cat": "History",
      "difficulty": "hard",
      "exp": "The correct option is \"Jawaharlal Nehru\". In GK (History), \"Jawaharlal Nehru\" directly satisfies the concept or fact asked in: Who was the first Prime Minister of India?"
    },
    {
      "id": "gk-cur-34",
      "text": "Which planet is known as the Red Planet?",
      "opts": [
        "Venus",
        "Mars",
        "Jupiter",
        "Mercury"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "easy",
      "exp": "The correct option is \"Mars\". In GK (Science), \"Mars\" directly satisfies the concept or fact asked in: Which planet is known as the Red Planet?"
    },
    {
      "id": "gk-cur-35",
      "text": "What is the national bird of India?",
      "opts": [
        "Sparrow",
        "Peacock",
        "Eagle",
        "Parrot"
      ],
      "ans": 1,
      "cat": "General",
      "difficulty": "medium",
      "exp": "The correct option is \"Peacock\". In GK (General), \"Peacock\" directly satisfies the concept or fact asked in: What is the national bird of India?"
    },
    {
      "id": "gk-cur-36",
      "text": "Which is the largest ocean on Earth?",
      "opts": [
        "Atlantic",
        "Indian",
        "Arctic",
        "Pacific"
      ],
      "ans": 3,
      "cat": "Geography",
      "difficulty": "hard",
      "exp": "The correct option is \"Pacific\". In GK (Geography), \"Pacific\" directly satisfies the concept or fact asked in: Which is the largest ocean on Earth?"
    },
    {
      "id": "gk-cur-37",
      "text": "Who painted the Mona Lisa?",
      "opts": [
        "Vincent van Gogh",
        "Pablo Picasso",
        "Leonardo da Vinci",
        "Michelangelo"
      ],
      "ans": 2,
      "cat": "History",
      "difficulty": "easy",
      "exp": "The correct option is \"Leonardo da Vinci\". In GK (History), \"Leonardo da Vinci\" directly satisfies the concept or fact asked in: Who painted the Mona Lisa?"
    },
    {
      "id": "gk-cur-38",
      "text": "Which is the tallest mountain in the world?",
      "opts": [
        "K2",
        "Kangchenjunga",
        "Mount Everest",
        "Nanga Parbat"
      ],
      "ans": 2,
      "cat": "Geography",
      "difficulty": "medium",
      "exp": "The correct option is \"Mount Everest\". In GK (Geography), \"Mount Everest\" directly satisfies the concept or fact asked in: Which is the tallest mountain in the world?"
    },
    {
      "id": "gk-cur-39",
      "text": "In which year did India gain independence?",
      "opts": [
        "1945",
        "1946",
        "1947",
        "1950"
      ],
      "ans": 2,
      "cat": "History",
      "difficulty": "hard",
      "exp": "The correct option is \"1947\". In GK (History), \"1947\" directly satisfies the concept or fact asked in: In which year did India gain independence?"
    },
    {
      "id": "gk-cur-40",
      "text": "Which country hosted the 2016 Summer Olympics?",
      "opts": [
        "China",
        "UK",
        "Brazil",
        "Russia"
      ],
      "ans": 2,
      "cat": "Sports",
      "difficulty": "easy",
      "exp": "The correct option is \"Brazil\". In GK (Sports), \"Brazil\" directly satisfies the concept or fact asked in: Which country hosted the 2016 Summer Olympics?"
    },
    {
      "id": "gk-cur-41",
      "text": "Which is the largest desert in the world?",
      "opts": [
        "Sahara",
        "Gobi",
        "Antarctic Desert",
        "Thar"
      ],
      "ans": 2,
      "cat": "Geography",
      "difficulty": "medium",
      "exp": "The correct option is \"Antarctic Desert\". In GK (Geography), \"Antarctic Desert\" directly satisfies the concept or fact asked in: Which is the largest desert in the world?"
    },
    {
      "id": "gk-cur-42",
      "text": "What is the powerhouse of the cell called?",
      "opts": [
        "Nucleus",
        "Ribosome",
        "Mitochondria",
        "Golgi body"
      ],
      "ans": 2,
      "cat": "Science",
      "difficulty": "hard",
      "exp": "The correct option is \"Mitochondria\". In GK (Science), \"Mitochondria\" directly satisfies the concept or fact asked in: What is the powerhouse of the cell called?"
    },
    {
      "id": "gk-cur-43",
      "text": "Which Indian state is known as the 'Land of Five Rivers'?",
      "opts": [
        "Punjab",
        "Haryana",
        "Rajasthan",
        "Gujarat"
      ],
      "ans": 0,
      "cat": "Geography",
      "difficulty": "easy",
      "exp": "The correct option is \"Punjab\". In GK (Geography), \"Punjab\" directly satisfies the concept or fact asked in: Which Indian state is known as the 'Land of Five Rivers'?"
    },
    {
      "id": "gk-cur-44",
      "text": "Who is credited with inventing the World Wide Web?",
      "opts": [
        "Bill Gates",
        "Tim Berners-Lee",
        "Steve Jobs",
        "Mark Zuckerberg"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "medium",
      "exp": "The correct option is \"Tim Berners-Lee\". In GK (Science), \"Tim Berners-Lee\" directly satisfies the concept or fact asked in: Who is credited with inventing the World Wide Web?"
    },
    {
      "id": "gk-cur-45",
      "text": "Which is the longest wall in the world?",
      "opts": [
        "Great Wall of China",
        "Berlin Wall",
        "Hadrian's Wall",
        "Wailing Wall"
      ],
      "ans": 0,
      "cat": "Geography",
      "difficulty": "hard",
      "exp": "The correct option is \"Great Wall of China\". In GK (Geography), \"Great Wall of China\" directly satisfies the concept or fact asked in: Which is the longest wall in the world?"
    },
    {
      "id": "gk-cur-46",
      "text": "Which is the largest continent by area?",
      "opts": [
        "Africa",
        "Asia",
        "North America",
        "Europe"
      ],
      "ans": 1,
      "cat": "Geography",
      "difficulty": "medium",
      "exp": "The correct option is \"Asia\". In GK (Geography), \"Asia\" directly satisfies the concept or fact asked in: Which is the largest continent by area?"
    },
    {
      "id": "gk-cur-47",
      "text": "Who is known as the 'Missile Man of India'?",
      "opts": [
        "C.V. Raman",
        "A.P.J. Abdul Kalam",
        "Homi Bhabha",
        "Vikram Sarabhai"
      ],
      "ans": 1,
      "cat": "History",
      "difficulty": "hard",
      "exp": "The correct option is \"A.P.J. Abdul Kalam\". In GK (History), \"A.P.J. Abdul Kalam\" directly satisfies the concept or fact asked in: Who is known as the 'Missile Man of India'?"
    },
    {
      "id": "gk-cur-48",
      "text": "Which is the national animal of India?",
      "opts": [
        "Lion",
        "Elephant",
        "Tiger",
        "Leopard"
      ],
      "ans": 2,
      "cat": "General",
      "difficulty": "medium",
      "exp": "The correct option is \"Tiger\". In GK (General), \"Tiger\" directly satisfies the concept or fact asked in: Which is the national animal of India?"
    },
    {
      "id": "gk-cur-49",
      "text": "Who discovered gravity?",
      "opts": [
        "Albert Einstein",
        "Isaac Newton",
        "Galileo Galilei",
        "Nikola Tesla"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "hard",
      "exp": "The correct option is \"Isaac Newton\". In GK (Science), \"Isaac Newton\" directly satisfies the concept or fact asked in: Who discovered gravity?"
    },
    {
      "id": "gk-cur-50",
      "text": "Which is the smallest planet in our solar system?",
      "opts": [
        "Mars",
        "Mercury",
        "Venus",
        "Pluto"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "easy",
      "exp": "The correct option is \"Mercury\". In GK (Science), \"Mercury\" directly satisfies the concept or fact asked in: Which is the smallest planet in our solar system?"
    },
    {
      "id": "gk-cur-51",
      "text": "What is the study of earthquakes called?",
      "opts": [
        "Seismology",
        "Geology",
        "Meteorology",
        "Volcanology"
      ],
      "ans": 0,
      "cat": "Science",
      "difficulty": "medium",
      "exp": "The correct option is \"Seismology\". In GK (Science), \"Seismology\" directly satisfies the concept or fact asked in: What is the study of earthquakes called?"
    },
    {
      "id": "gk-cur-52",
      "text": "Which Indian festival is known as the 'Festival of Lights'?",
      "opts": [
        "Holi",
        "Diwali",
        "Navratri",
        "Eid"
      ],
      "ans": 1,
      "cat": "History",
      "difficulty": "hard",
      "exp": "The correct option is \"Diwali\". In GK (History), \"Diwali\" directly satisfies the concept or fact asked in: Which Indian festival is known as the 'Festival of Lights'?"
    },
    {
      "id": "gk-cur-53",
      "text": "What is the freezing point of water in Celsius?",
      "opts": [
        "0",
        "32",
        "100",
        "-1"
      ],
      "ans": 0,
      "cat": "Science",
      "difficulty": "easy",
      "exp": "The correct option is \"0\". In GK (Science), \"0\" directly satisfies the concept or fact asked in: What is the freezing point of water in Celsius?"
    },
    {
      "id": "gk-cur-54",
      "text": "Which is the largest mammal in the world?",
      "opts": [
        "African elephant",
        "Blue whale",
        "Giraffe",
        "Polar bear"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "medium",
      "exp": "The correct option is \"Blue whale\". In GK (Science), \"Blue whale\" directly satisfies the concept or fact asked in: Which is the largest mammal in the world?"
    },
    {
      "id": "gk-cur-55",
      "text": "Who is the author of the epic 'Mahabharata'?",
      "opts": [
        "Valmiki",
        "Ved Vyasa",
        "Kalidasa",
        "Tulsidas"
      ],
      "ans": 1,
      "cat": "History",
      "difficulty": "hard",
      "exp": "The correct option is \"Ved Vyasa\". In GK (History), \"Ved Vyasa\" directly satisfies the concept or fact asked in: Who is the author of the epic 'Mahabharata'?"
    },
    {
      "id": "gk-cur-56",
      "text": "Which country is known as the 'Land of the Rising Sun'?",
      "opts": [
        "China",
        "South Korea",
        "Japan",
        "Thailand"
      ],
      "ans": 2,
      "cat": "Geography",
      "difficulty": "easy",
      "exp": "The correct option is \"Japan\". In GK (Geography), \"Japan\" directly satisfies the concept or fact asked in: Which country is known as the 'Land of the Rising Sun'?"
    },
    {
      "id": "gk-cur-57",
      "text": "What is the hardest natural substance on Earth?",
      "opts": [
        "Gold",
        "Iron",
        "Diamond",
        "Platinum"
      ],
      "ans": 2,
      "cat": "Science",
      "difficulty": "medium",
      "exp": "The correct option is \"Diamond\". In GK (Science), \"Diamond\" directly satisfies the concept or fact asked in: What is the hardest natural substance on Earth?"
    },
    {
      "id": "gk-cur-58",
      "text": "Which gas makes up the majority of Earth's atmosphere?",
      "opts": [
        "Oxygen",
        "Carbon dioxide",
        "Nitrogen",
        "Argon"
      ],
      "ans": 2,
      "cat": "Science",
      "difficulty": "hard",
      "exp": "The correct option is \"Nitrogen\". In GK (Science), \"Nitrogen\" directly satisfies the concept or fact asked in: Which gas makes up the majority of Earth's atmosphere?"
    },
    {
      "id": "gk-cur-59",
      "text": "Who was the first person to walk on the Moon?",
      "opts": [
        "Buzz Aldrin",
        "Neil Armstrong",
        "Yuri Gagarin",
        "John Glenn"
      ],
      "ans": 1,
      "cat": "History",
      "difficulty": "easy",
      "exp": "The correct option is \"Neil Armstrong\". In GK (History), \"Neil Armstrong\" directly satisfies the concept or fact asked in: Who was the first person to walk on the Moon?"
    },
    {
      "id": "gk-cur-60",
      "text": "Which Indian river is known as the 'Sorrow of Bihar'?",
      "opts": [
        "Ganga",
        "Kosi",
        "Yamuna",
        "Brahmaputra"
      ],
      "ans": 1,
      "cat": "Geography",
      "difficulty": "medium",
      "exp": "The correct option is \"Kosi\". In GK (Geography), \"Kosi\" directly satisfies the concept or fact asked in: Which Indian river is known as the 'Sorrow of Bihar'?"
    },
    {
      "id": "gk-cur-61",
      "text": "What is the national sport of Japan?",
      "opts": [
        "Judo",
        "Karate",
        "Sumo wrestling",
        "Baseball"
      ],
      "ans": 2,
      "cat": "Sports",
      "difficulty": "hard",
      "exp": "The correct option is \"Sumo wrestling\". In GK (Sports), \"Sumo wrestling\" directly satisfies the concept or fact asked in: What is the national sport of Japan?"
    },
    {
      "id": "gk-cur-62",
      "text": "Which organelle is responsible for photosynthesis in plant cells?",
      "opts": [
        "Mitochondria",
        "Chloroplast",
        "Nucleus",
        "Ribosome"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "easy",
      "exp": "The correct option is \"Chloroplast\". In GK (Science), \"Chloroplast\" directly satisfies the concept or fact asked in: Which organelle is responsible for photosynthesis in plant cells?"
    },
    {
      "id": "gk-cur-63",
      "text": "Who developed the theory of relativity?",
      "opts": [
        "Isaac Newton",
        "Albert Einstein",
        "Niels Bohr",
        "Max Planck"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "medium",
      "exp": "The correct option is \"Albert Einstein\". In GK (Science), \"Albert Einstein\" directly satisfies the concept or fact asked in: Who developed the theory of relativity?"
    },
    {
      "id": "gk-cur-64",
      "text": "Which is the driest continent on Earth?",
      "opts": [
        "Africa",
        "Australia",
        "Antarctica",
        "Asia"
      ],
      "ans": 2,
      "cat": "Geography",
      "difficulty": "hard",
      "exp": "The correct option is \"Antarctica\". In GK (Geography), \"Antarctica\" directly satisfies the concept or fact asked in: Which is the driest continent on Earth?"
    },
    {
      "id": "gk-cur-65",
      "text": "Who is the current Prime Minister of the United Kingdom (as of 2025)?",
      "opts": [
        "Rishi Sunak",
        "Keir Starmer",
        "Boris Johnson",
        "Liz Truss"
      ],
      "ans": 1,
      "cat": "Polity",
      "difficulty": "easy",
      "exp": "The correct option is \"Keir Starmer\". In GK (Polity), \"Keir Starmer\" directly satisfies the concept or fact asked in: Who is the current Prime Minister of the United Kingdom (as of 2025)?"
    },
    {
      "id": "gk-cur-66",
      "text": "Which Indian city hosted the G20 Summit in 2023?",
      "opts": [
        "Mumbai",
        "New Delhi",
        "Bengaluru",
        "Chennai"
      ],
      "ans": 1,
      "cat": "Polity",
      "difficulty": "medium",
      "exp": "The correct option is \"New Delhi\". In GK (Polity), \"New Delhi\" directly satisfies the concept or fact asked in: Which Indian city hosted the G20 Summit in 2023?"
    },
    {
      "id": "gk-cur-67",
      "text": "Which is the largest island in the world?",
      "opts": [
        "Madagascar",
        "Greenland",
        "Borneo",
        "New Guinea"
      ],
      "ans": 1,
      "cat": "Geography",
      "difficulty": "hard",
      "exp": "The correct option is \"Greenland\". In GK (Geography), \"Greenland\" directly satisfies the concept or fact asked in: Which is the largest island in the world?"
    },
    {
      "id": "gk-cur-68",
      "text": "Who composed India's National Song 'Vande Mataram'?",
      "opts": [
        "Rabindranath Tagore",
        "Bankim Chandra Chattopadhyay",
        "Sarojini Naidu",
        "Muhammad Iqbal"
      ],
      "ans": 1,
      "cat": "History",
      "difficulty": "easy",
      "exp": "The correct option is \"Bankim Chandra Chattopadhyay\". In GK (History), \"Bankim Chandra Chattopadhyay\" directly satisfies the concept or fact asked in: Who composed India's National Song 'Vande Mataram'?"
    },
    {
      "id": "gk-cur-69",
      "text": "What is the capital of Canada?",
      "opts": [
        "Toronto",
        "Vancouver",
        "Ottawa",
        "Montreal"
      ],
      "ans": 2,
      "cat": "Geography",
      "difficulty": "hard",
      "exp": "The correct option is \"Ottawa\". In GK (Geography), \"Ottawa\" directly satisfies the concept or fact asked in: What is the capital of Canada?"
    },
    {
      "id": "gk-cur-70",
      "text": "Which Indian scientist led the team behind India's first satellite, Aryabhata?",
      "opts": [
        "Vikram Sarabhai",
        "Satish Dhawan",
        "U. R. Rao",
        "Homi Bhabha"
      ],
      "ans": 2,
      "cat": "Science",
      "difficulty": "easy",
      "exp": "The correct option is \"U. R. Rao\". In GK (Science), \"U. R. Rao\" directly satisfies the concept or fact asked in: Which Indian scientist led the team behind India's first satellite, Aryabhata?"
    },
    {
      "id": "gk-cur-71",
      "text": "Which is the deepest point in the world's oceans?",
      "opts": [
        "Puerto Rico Trench",
        "Mariana Trench",
        "Java Trench",
        "Tonga Trench"
      ],
      "ans": 1,
      "cat": "Geography",
      "difficulty": "medium",
      "exp": "The correct option is \"Mariana Trench\". In GK (Geography), \"Mariana Trench\" directly satisfies the concept or fact asked in: Which is the deepest point in the world's oceans?"
    },
    {
      "id": "gk-cur-72",
      "text": "What is the main component of natural gas?",
      "opts": [
        "Propane",
        "Butane",
        "Methane",
        "Ethane"
      ],
      "ans": 2,
      "cat": "Science",
      "difficulty": "hard",
      "exp": "The correct option is \"Methane\". In GK (Science), \"Methane\" directly satisfies the concept or fact asked in: What is the main component of natural gas?"
    },
    {
      "id": "gk-cur-73",
      "text": "Which country has the longest coastline in the world?",
      "opts": [
        "Russia",
        "Canada",
        "Indonesia",
        "Australia"
      ],
      "ans": 1,
      "cat": "Geography",
      "difficulty": "easy",
      "exp": "The correct option is \"Canada\". In GK (Geography), \"Canada\" directly satisfies the concept or fact asked in: Which country has the longest coastline in the world?"
    },
    {
      "id": "gk-cur-74",
      "text": "Who was the first woman Prime Minister of India?",
      "opts": [
        "Sonia Gandhi",
        "Indira Gandhi",
        "Pratibha Patil",
        "Sarojini Naidu"
      ],
      "ans": 1,
      "cat": "Polity",
      "difficulty": "medium",
      "exp": "The correct option is \"Indira Gandhi\". In GK (Polity), \"Indira Gandhi\" directly satisfies the concept or fact asked in: Who was the first woman Prime Minister of India?"
    },
    {
      "id": "gk-cur-75",
      "text": "Which is the official language with the most native speakers in the world?",
      "opts": [
        "English",
        "Hindi",
        "Spanish",
        "Mandarin Chinese"
      ],
      "ans": 3,
      "cat": "General",
      "difficulty": "hard",
      "exp": "The correct option is \"Mandarin Chinese\". In GK (General), \"Mandarin Chinese\" directly satisfies the concept or fact asked in: Which is the official language with the most native speakers in the world?"
    },
    {
      "id": "gk-cur-76",
      "text": "What does 'WWW' stand for?",
      "opts": [
        "World Wide Web",
        "World Wide Website",
        "Web Wide World",
        "World Web Wide"
      ],
      "ans": 0,
      "cat": "Science",
      "difficulty": "easy",
      "exp": "The correct option is \"World Wide Web\". In GK (Science), \"World Wide Web\" directly satisfies the concept or fact asked in: What does 'WWW' stand for?"
    },
    {
      "id": "gk-cur-77",
      "text": "Which Indian state has the largest population?",
      "opts": [
        "Maharashtra",
        "Bihar",
        "Uttar Pradesh",
        "West Bengal"
      ],
      "ans": 2,
      "cat": "Geography",
      "difficulty": "medium",
      "exp": "The correct option is \"Uttar Pradesh\". In GK (Geography), \"Uttar Pradesh\" directly satisfies the concept or fact asked in: Which Indian state has the largest population?"
    },
    {
      "id": "gk-cur-78",
      "text": "Who is known as the 'Father of Green Revolution' in India?",
      "opts": [
        "Norman Borlaug",
        "M. S. Swaminathan",
        "Verghese Kurien",
        "C. Subramaniam"
      ],
      "ans": 1,
      "cat": "History",
      "difficulty": "hard",
      "exp": "The correct option is \"M. S. Swaminathan\". In GK (History), \"M. S. Swaminathan\" directly satisfies the concept or fact asked in: Who is known as the 'Father of Green Revolution' in India?"
    },
    {
      "id": "gk-cur-79",
      "text": "Which planet has the most moons in our solar system?",
      "opts": [
        "Jupiter",
        "Saturn",
        "Uranus",
        "Neptune"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "easy",
      "exp": "The correct option is \"Saturn\". In GK (Science), \"Saturn\" directly satisfies the concept or fact asked in: Which planet has the most moons in our solar system?"
    },
    {
      "id": "gk-cur-80",
      "text": "What is the currency of the United Kingdom?",
      "opts": [
        "Euro",
        "Pound Sterling",
        "Dollar",
        "Franc"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "medium",
      "exp": "The correct option is \"Pound Sterling\". In GK (Science), \"Pound Sterling\" directly satisfies the concept or fact asked in: What is the currency of the United Kingdom?"
    },
    {
      "id": "gk-cur-81",
      "text": "Which vitamin deficiency causes scurvy?",
      "opts": [
        "Vitamin A",
        "Vitamin B12",
        "Vitamin C",
        "Vitamin D"
      ],
      "ans": 2,
      "cat": "History",
      "difficulty": "hard",
      "exp": "The correct option is \"Vitamin C\". In GK (History), \"Vitamin C\" directly satisfies the concept or fact asked in: Which vitamin deficiency causes scurvy?"
    },
    {
      "id": "gk-cur-82",
      "text": "Which is the smallest bone in the human body?",
      "opts": [
        "Femur",
        "Stapes",
        "Radius",
        "Tibia"
      ],
      "ans": 1,
      "cat": "Geography",
      "difficulty": "easy",
      "exp": "The correct option is \"Stapes\". In GK (Geography), \"Stapes\" directly satisfies the concept or fact asked in: Which is the smallest bone in the human body?"
    },
    {
      "id": "gk-cur-83",
      "text": "Who wrote the play 'Romeo and Juliet'?",
      "opts": [
        "Charles Dickens",
        "William Shakespeare",
        "Jane Austen",
        "Mark Twain"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "medium",
      "exp": "The correct option is \"William Shakespeare\". In GK (Science), \"William Shakespeare\" directly satisfies the concept or fact asked in: Who wrote the play 'Romeo and Juliet'?"
    },
    {
      "id": "gk-cur-84",
      "text": "Which is the largest freshwater lake in the world by surface area?",
      "opts": [
        "Lake Victoria",
        "Lake Superior",
        "Lake Baikal",
        "Lake Tanganyika"
      ],
      "ans": 1,
      "cat": "General",
      "difficulty": "hard",
      "exp": "The correct option is \"Lake Superior\". In GK (General), \"Lake Superior\" directly satisfies the concept or fact asked in: Which is the largest freshwater lake in the world by surface area?"
    },
    {
      "id": "gk-cur-85",
      "text": "What is the chemical formula for table salt?",
      "opts": [
        "NaCl",
        "KCl",
        "CaCl2",
        "NaOH"
      ],
      "ans": 0,
      "cat": "Science",
      "difficulty": "easy",
      "exp": "The correct option is \"NaCl\". In GK (Science), \"NaCl\" directly satisfies the concept or fact asked in: What is the chemical formula for table salt?"
    },
    {
      "id": "gk-cur-86",
      "text": "Which Indian dam is known as the 'Temple of Modern India'?",
      "opts": [
        "Tehri Dam",
        "Bhakra Nangal Dam",
        "Hirakud Dam",
        "Sardar Sarovar Dam"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "medium",
      "exp": "The correct option is \"Bhakra Nangal Dam\". In GK (Science), \"Bhakra Nangal Dam\" directly satisfies the concept or fact asked in: Which Indian dam is known as the 'Temple of Modern India'?"
    },
    {
      "id": "gk-cur-87",
      "text": "Which is the most abundant metal in the Earth's crust?",
      "opts": [
        "Iron",
        "Copper",
        "Aluminium",
        "Zinc"
      ],
      "ans": 2,
      "cat": "Science",
      "difficulty": "hard",
      "exp": "The correct option is \"Aluminium\". In GK (Science), \"Aluminium\" directly satisfies the concept or fact asked in: Which is the most abundant metal in the Earth's crust?"
    },
    {
      "id": "gk-cur-88",
      "text": "Who was awarded the first Nobel Prize in Physics?",
      "opts": [
        "Marie Curie",
        "Wilhelm Röntgen",
        "Albert Einstein",
        "Max Planck"
      ],
      "ans": 1,
      "cat": "General",
      "difficulty": "easy",
      "exp": "The correct option is \"Wilhelm Röntgen\". In GK (General), \"Wilhelm Röntgen\" directly satisfies the concept or fact asked in: Who was awarded the first Nobel Prize in Physics?"
    },
    {
      "id": "gk-cur-89",
      "text": "Which is the fastest land animal?",
      "opts": [
        "Lion",
        "Cheetah",
        "Horse",
        "Leopard"
      ],
      "ans": 1,
      "cat": "Geography",
      "difficulty": "medium",
      "exp": "The correct option is \"Cheetah\". In GK (Geography), \"Cheetah\" directly satisfies the concept or fact asked in: Which is the fastest land animal?"
    },
    {
      "id": "gk-cur-90",
      "text": "What is the national flower of India?",
      "opts": [
        "Rose",
        "Lotus",
        "Sunflower",
        "Marigold"
      ],
      "ans": 1,
      "cat": "General",
      "difficulty": "hard",
      "exp": "The correct option is \"Lotus\". In GK (General), \"Lotus\" directly satisfies the concept or fact asked in: What is the national flower of India?"
    },
    {
      "id": "gk-cur-91",
      "text": "Which strait separates Asia from North America?",
      "opts": [
        "Strait of Gibraltar",
        "Bering Strait",
        "Strait of Malacca",
        "Palk Strait"
      ],
      "ans": 1,
      "cat": "Geography",
      "difficulty": "easy",
      "exp": "The correct option is \"Bering Strait\". In GK (Geography), \"Bering Strait\" directly satisfies the concept or fact asked in: Which strait separates Asia from North America?"
    },
    {
      "id": "gk-cur-92",
      "text": "Which element has the chemical symbol 'Fe'?",
      "opts": [
        "Fluorine",
        "Iron",
        "Lead",
        "Tin"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "medium",
      "exp": "The correct option is \"Iron\". In GK (Science), \"Iron\" directly satisfies the concept or fact asked in: Which element has the chemical symbol 'Fe'?"
    },
    {
      "id": "gk-cur-93",
      "text": "What is the speed of light in a vacuum, approximately?",
      "opts": [
        "3 x 10^5 km/s",
        "3 x 10^8 m/s",
        "3 x 10^6 m/s",
        "3 x 10^3 km/s"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "hard",
      "exp": "The correct option is \"3 x 10^8 m/s\". In GK (Science), \"3 x 10^8 m/s\" directly satisfies the concept or fact asked in: What is the speed of light in a vacuum, approximately?"
    },
    {
      "id": "gk-cur-94",
      "text": "Which blood vessel carries oxygenated blood away from the heart?",
      "opts": [
        "Vein",
        "Artery",
        "Capillary",
        "Aorta only"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "easy",
      "exp": "The correct option is \"Artery\". In GK (Science), \"Artery\" directly satisfies the concept or fact asked in: Which blood vessel carries oxygenated blood away from the heart?"
    },
    {
      "id": "gk-cur-95",
      "text": "What is the atomic number of hydrogen?",
      "opts": [
        "0",
        "1",
        "2",
        "3"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "medium",
      "exp": "The correct option is \"1\". In GK (Science), \"1\" directly satisfies the concept or fact asked in: What is the atomic number of hydrogen?"
    },
    {
      "id": "gk-cur-96",
      "text": "Which planet has a day longer than its year?",
      "opts": [
        "Mars",
        "Venus",
        "Mercury",
        "Neptune"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "hard",
      "exp": "The correct option is \"Venus\". In GK (Science), \"Venus\" directly satisfies the concept or fact asked in: Which planet has a day longer than its year?"
    },
    {
      "id": "gk-cur-97",
      "text": "What is the pH value of pure water?",
      "opts": [
        "0",
        "7",
        "14",
        "5"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "easy",
      "exp": "The correct option is \"7\". In GK (Science), \"7\" directly satisfies the concept or fact asked in: What is the pH value of pure water?"
    },
    {
      "id": "gk-cur-98",
      "text": "Which part of the eye controls the amount of light entering it?",
      "opts": [
        "Retina",
        "Cornea",
        "Iris",
        "Lens"
      ],
      "ans": 2,
      "cat": "Science",
      "difficulty": "medium",
      "exp": "The correct option is \"Iris\". In GK (Science), \"Iris\" directly satisfies the concept or fact asked in: Which part of the eye controls the amount of light entering it?"
    },
    {
      "id": "gk-cur-99",
      "text": "Which scientist proposed the laws of planetary motion?",
      "opts": [
        "Isaac Newton",
        "Johannes Kepler",
        "Galileo Galilei",
        "Nicolaus Copernicus"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "hard",
      "exp": "The correct option is \"Johannes Kepler\". In GK (Science), \"Johannes Kepler\" directly satisfies the concept or fact asked in: Which scientist proposed the laws of planetary motion?"
    },
    {
      "id": "gk-cur-100",
      "text": "Which vitamin is essential for blood clotting?",
      "opts": [
        "Vitamin A",
        "Vitamin B",
        "Vitamin K",
        "Vitamin E"
      ],
      "ans": 2,
      "cat": "Science",
      "difficulty": "medium",
      "exp": "The correct option is \"Vitamin K\". In GK (Science), \"Vitamin K\" directly satisfies the concept or fact asked in: Which vitamin is essential for blood clotting?"
    },
    {
      "id": "gk-cur-101",
      "text": "What is the unit used to measure the frequency of sound waves?",
      "opts": [
        "Decibel",
        "Hertz",
        "Joule",
        "Newton"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "hard",
      "exp": "The correct option is \"Hertz\". In GK (Science), \"Hertz\" directly satisfies the concept or fact asked in: What is the unit used to measure the frequency of sound waves?"
    },
    {
      "id": "gk-cur-102",
      "text": "Which gas is used to fill balloons because it is lighter than air?",
      "opts": [
        "Oxygen",
        "Helium",
        "Carbon dioxide",
        "Nitrogen"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "easy",
      "exp": "The correct option is \"Helium\". In GK (Science), \"Helium\" directly satisfies the concept or fact asked in: Which gas is used to fill balloons because it is lighter than air?"
    },
    {
      "id": "gk-cur-103",
      "text": "What is the process by which liquid turns into vapor called?",
      "opts": [
        "Condensation",
        "Evaporation",
        "Sublimation",
        "Precipitation"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "medium",
      "exp": "The correct option is \"Evaporation\". In GK (Science), \"Evaporation\" directly satisfies the concept or fact asked in: What is the process by which liquid turns into vapor called?"
    },
    {
      "id": "gk-cur-104",
      "text": "Which organ produces insulin in the human body?",
      "opts": [
        "Liver",
        "Pancreas",
        "Kidney",
        "Spleen"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "hard",
      "exp": "The correct option is \"Pancreas\". In GK (Science), \"Pancreas\" directly satisfies the concept or fact asked in: Which organ produces insulin in the human body?"
    },
    {
      "id": "gk-cur-105",
      "text": "What is the chemical symbol for sodium?",
      "opts": [
        "So",
        "Sd",
        "Na",
        "S"
      ],
      "ans": 2,
      "cat": "Science",
      "difficulty": "easy",
      "exp": "The correct option is \"Na\". In GK (Science), \"Na\" directly satisfies the concept or fact asked in: What is the chemical symbol for sodium?"
    },
    {
      "id": "gk-cur-106",
      "text": "Which of these is NOT a state of matter?",
      "opts": [
        "Solid",
        "Liquid",
        "Gas",
        "Energy"
      ],
      "ans": 3,
      "cat": "Science",
      "difficulty": "medium",
      "exp": "The correct option is \"Energy\". In GK (Science), \"Energy\" directly satisfies the concept or fact asked in: Which of these is NOT a state of matter?"
    },
    {
      "id": "gk-cur-107",
      "text": "What does DNA stand for?",
      "opts": [
        "Deoxyribonucleic acid",
        "Dinucleic acid",
        "Diribose nucleic acid",
        "Deoxyribose nuclear acid"
      ],
      "ans": 0,
      "cat": "Science",
      "difficulty": "hard",
      "exp": "The correct option is \"Deoxyribonucleic acid\". In GK (Science), \"Deoxyribonucleic acid\" directly satisfies the concept or fact asked in: What does DNA stand for?"
    },
    {
      "id": "gk-cur-108",
      "text": "Which force keeps planets in orbit around the Sun?",
      "opts": [
        "Magnetism",
        "Gravity",
        "Friction",
        "Nuclear force"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "easy",
      "exp": "The correct option is \"Gravity\". In GK (Science), \"Gravity\" directly satisfies the concept or fact asked in: Which force keeps planets in orbit around the Sun?"
    },
    {
      "id": "gk-cur-109",
      "text": "What is the boiling point of water at sea level in Celsius?",
      "opts": [
        "90",
        "100",
        "110",
        "120"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "medium",
      "exp": "The correct option is \"100\". In GK (Science), \"100\" directly satisfies the concept or fact asked in: What is the boiling point of water at sea level in Celsius?"
    },
    {
      "id": "gk-cur-110",
      "text": "Which metal is liquid at room temperature?",
      "opts": [
        "Iron",
        "Mercury",
        "Aluminium",
        "Zinc"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "hard",
      "exp": "The correct option is \"Mercury\". In GK (Science), \"Mercury\" directly satisfies the concept or fact asked in: Which metal is liquid at room temperature?"
    },
    {
      "id": "gk-cur-111",
      "text": "Who developed the polio vaccine?",
      "opts": [
        "Alexander Fleming",
        "Jonas Salk",
        "Louis Pasteur",
        "Edward Jenner"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "easy",
      "exp": "The correct option is \"Jonas Salk\". In GK (Science), \"Jonas Salk\" directly satisfies the concept or fact asked in: Who developed the polio vaccine?"
    },
    {
      "id": "gk-cur-112",
      "text": "Which is the largest organ in the human body?",
      "opts": [
        "Liver",
        "Brain",
        "Skin",
        "Lungs"
      ],
      "ans": 2,
      "cat": "Science",
      "difficulty": "medium",
      "exp": "The correct option is \"Skin\". In GK (Science), \"Skin\" directly satisfies the concept or fact asked in: Which is the largest organ in the human body?"
    },
    {
      "id": "gk-cur-113",
      "text": "What is the study of fossils called?",
      "opts": [
        "Paleontology",
        "Archaeology",
        "Geology",
        "Anthropology"
      ],
      "ans": 0,
      "cat": "Science",
      "difficulty": "hard",
      "exp": "The correct option is \"Paleontology\". In GK (Science), \"Paleontology\" directly satisfies the concept or fact asked in: What is the study of fossils called?"
    },
    {
      "id": "gk-cur-114",
      "text": "Which particle in an atom carries a negative charge?",
      "opts": [
        "Proton",
        "Neutron",
        "Electron",
        "Nucleon"
      ],
      "ans": 2,
      "cat": "Science",
      "difficulty": "easy",
      "exp": "The correct option is \"Electron\". In GK (Science), \"Electron\" directly satisfies the concept or fact asked in: Which particle in an atom carries a negative charge?"
    },
    {
      "id": "gk-cur-115",
      "text": "Which African country was formerly known as Abyssinia?",
      "opts": [
        "Kenya",
        "Ethiopia",
        "Sudan",
        "Somalia"
      ],
      "ans": 1,
      "cat": "Geography",
      "difficulty": "hard",
      "exp": "The correct option is \"Ethiopia\". In GK (Geography), \"Ethiopia\" directly satisfies the concept or fact asked in: Which African country was formerly known as Abyssinia?"
    },
    {
      "id": "gk-cur-116",
      "text": "Which is the smallest continent by land area?",
      "opts": [
        "Europe",
        "Australia",
        "Antarctica",
        "South America"
      ],
      "ans": 1,
      "cat": "Geography",
      "difficulty": "easy",
      "exp": "The correct option is \"Australia\". In GK (Geography), \"Australia\" directly satisfies the concept or fact asked in: Which is the smallest continent by land area?"
    },
    {
      "id": "gk-cur-117",
      "text": "Which river flows through Egypt and is vital to its agriculture?",
      "opts": [
        "Amazon",
        "Nile",
        "Congo",
        "Niger"
      ],
      "ans": 1,
      "cat": "Geography",
      "difficulty": "medium",
      "exp": "The correct option is \"Nile\". In GK (Geography), \"Nile\" directly satisfies the concept or fact asked in: Which river flows through Egypt and is vital to its agriculture?"
    },
    {
      "id": "gk-cur-118",
      "text": "Which country is both in Europe and Asia?",
      "opts": [
        "Turkey",
        "Italy",
        "Germany",
        "Spain"
      ],
      "ans": 0,
      "cat": "Geography",
      "difficulty": "easy",
      "exp": "The correct option is \"Turkey\". In GK (Geography), \"Turkey\" directly satisfies the concept or fact asked in: Which country is both in Europe and Asia?"
    },
    {
      "id": "gk-cur-119",
      "text": "Which Indian state is the largest producer of tea?",
      "opts": [
        "Kerala",
        "Assam",
        "Punjab",
        "Gujarat"
      ],
      "ans": 1,
      "cat": "Geography",
      "difficulty": "medium",
      "exp": "The correct option is \"Assam\". In GK (Geography), \"Assam\" directly satisfies the concept or fact asked in: Which Indian state is the largest producer of tea?"
    },
    {
      "id": "gk-cur-120",
      "text": "Which is the longest river in India?",
      "opts": [
        "Yamuna",
        "Godavari",
        "Ganga",
        "Brahmaputra"
      ],
      "ans": 2,
      "cat": "Geography",
      "difficulty": "hard",
      "exp": "The correct option is \"Ganga\". In GK (Geography), \"Ganga\" directly satisfies the concept or fact asked in: Which is the longest river in India?"
    },
    {
      "id": "gk-cur-121",
      "text": "Which country has the most time zones?",
      "opts": [
        "Russia",
        "USA",
        "France",
        "China"
      ],
      "ans": 2,
      "cat": "Geography",
      "difficulty": "easy",
      "exp": "The correct option is \"France\". In GK (Geography), \"France\" directly satisfies the concept or fact asked in: Which country has the most time zones?"
    },
    {
      "id": "gk-cur-122",
      "text": "What is the capital of Brazil?",
      "opts": [
        "Rio de Janeiro",
        "Sao Paulo",
        "Brasilia",
        "Salvador"
      ],
      "ans": 2,
      "cat": "Geography",
      "difficulty": "medium",
      "exp": "The correct option is \"Brasilia\". In GK (Geography), \"Brasilia\" directly satisfies the concept or fact asked in: What is the capital of Brazil?"
    },
    {
      "id": "gk-cur-123",
      "text": "Which desert is the largest hot desert in the world?",
      "opts": [
        "Gobi Desert",
        "Kalahari Desert",
        "Sahara Desert",
        "Thar Desert"
      ],
      "ans": 2,
      "cat": "Geography",
      "difficulty": "hard",
      "exp": "The correct option is \"Sahara Desert\". In GK (Geography), \"Sahara Desert\" directly satisfies the concept or fact asked in: Which desert is the largest hot desert in the world?"
    },
    {
      "id": "gk-cur-124",
      "text": "Which Indian union territory is an archipelago in the Bay of Bengal?",
      "opts": [
        "Lakshadweep",
        "Andaman and Nicobar Islands",
        "Daman and Diu",
        "Puducherry"
      ],
      "ans": 1,
      "cat": "Geography",
      "difficulty": "easy",
      "exp": "The correct option is \"Andaman and Nicobar Islands\". In GK (Geography), \"Andaman and Nicobar Islands\" directly satisfies the concept or fact asked in: Which Indian union territory is an archipelago in the Bay of Bengal?"
    },
    {
      "id": "gk-cur-125",
      "text": "Which country is known as the 'Land Down Under'?",
      "opts": [
        "New Zealand",
        "South Africa",
        "Australia",
        "Argentina"
      ],
      "ans": 2,
      "cat": "Geography",
      "difficulty": "medium",
      "exp": "The correct option is \"Australia\". In GK (Geography), \"Australia\" directly satisfies the concept or fact asked in: Which country is known as the 'Land Down Under'?"
    },
    {
      "id": "gk-cur-126",
      "text": "Which sea lies between Africa, Arabia and India?",
      "opts": [
        "Mediterranean Sea",
        "Red Sea",
        "Arabian Sea",
        "Caspian Sea"
      ],
      "ans": 2,
      "cat": "Geography",
      "difficulty": "hard",
      "exp": "The correct option is \"Arabian Sea\". In GK (Geography), \"Arabian Sea\" directly satisfies the concept or fact asked in: Which sea lies between Africa, Arabia and India?"
    },
    {
      "id": "gk-cur-127",
      "text": "Which is the highest waterfall in the world?",
      "opts": [
        "Niagara Falls",
        "Angel Falls",
        "Victoria Falls",
        "Iguazu Falls"
      ],
      "ans": 1,
      "cat": "Geography",
      "difficulty": "easy",
      "exp": "The correct option is \"Angel Falls\". In GK (Geography), \"Angel Falls\" directly satisfies the concept or fact asked in: Which is the highest waterfall in the world?"
    },
    {
      "id": "gk-cur-128",
      "text": "Which Indian state shares a border with the most number of other states?",
      "opts": [
        "Madhya Pradesh",
        "Uttar Pradesh",
        "Maharashtra",
        "Rajasthan"
      ],
      "ans": 1,
      "cat": "Geography",
      "difficulty": "medium",
      "exp": "The correct option is \"Uttar Pradesh\". In GK (Geography), \"Uttar Pradesh\" directly satisfies the concept or fact asked in: Which Indian state shares a border with the most number of other states?"
    },
    {
      "id": "gk-cur-129",
      "text": "Which strait separates Sri Lanka from India?",
      "opts": [
        "Bering Strait",
        "Strait of Malacca",
        "Palk Strait",
        "Torres Strait"
      ],
      "ans": 2,
      "cat": "Geography",
      "difficulty": "hard",
      "exp": "The correct option is \"Palk Strait\". In GK (Geography), \"Palk Strait\" directly satisfies the concept or fact asked in: Which strait separates Sri Lanka from India?"
    },
    {
      "id": "gk-cur-130",
      "text": "Which is the driest place on Earth?",
      "opts": [
        "Sahara Desert",
        "Atacama Desert",
        "Gobi Desert",
        "Death Valley"
      ],
      "ans": 1,
      "cat": "Geography",
      "difficulty": "easy",
      "exp": "The correct option is \"Atacama Desert\". In GK (Geography), \"Atacama Desert\" directly satisfies the concept or fact asked in: Which is the driest place on Earth?"
    },
    {
      "id": "gk-cur-131",
      "text": "Which country has the largest population in the world (as of the mid-2020s)?",
      "opts": [
        "China",
        "USA",
        "India",
        "Indonesia"
      ],
      "ans": 2,
      "cat": "Geography",
      "difficulty": "medium",
      "exp": "The correct option is \"India\". In GK (Geography), \"India\" directly satisfies the concept or fact asked in: Which country has the largest population in the world (as of the mid-2020s)?"
    },
    {
      "id": "gk-cur-132",
      "text": "Which Indian city is known as the 'Pink City'?",
      "opts": [
        "Udaipur",
        "Jodhpur",
        "Jaipur",
        "Bikaner"
      ],
      "ans": 2,
      "cat": "Geography",
      "difficulty": "hard",
      "exp": "The correct option is \"Jaipur\". In GK (Geography), \"Jaipur\" directly satisfies the concept or fact asked in: Which Indian city is known as the 'Pink City'?"
    },
    {
      "id": "gk-cur-133",
      "text": "Who was the first Mughal emperor of India?",
      "opts": [
        "Akbar",
        "Babur",
        "Humayun",
        "Shah Jahan"
      ],
      "ans": 1,
      "cat": "History",
      "difficulty": "easy",
      "exp": "The correct option is \"Babur\". In GK (History), \"Babur\" directly satisfies the concept or fact asked in: Who was the first Mughal emperor of India?"
    },
    {
      "id": "gk-cur-134",
      "text": "In which year did World War II end?",
      "opts": [
        "1943",
        "1944",
        "1945",
        "1946"
      ],
      "ans": 2,
      "cat": "History",
      "difficulty": "medium",
      "exp": "The correct option is \"1945\". In GK (History), \"1945\" directly satisfies the concept or fact asked in: In which year did World War II end?"
    },
    {
      "id": "gk-cur-135",
      "text": "Who led the Salt March (Dandi March) in 1930?",
      "opts": [
        "Jawaharlal Nehru",
        "Mahatma Gandhi",
        "Subhas Chandra Bose",
        "Bhagat Singh"
      ],
      "ans": 1,
      "cat": "History",
      "difficulty": "hard",
      "exp": "The correct option is \"Mahatma Gandhi\". In GK (History), \"Mahatma Gandhi\" directly satisfies the concept or fact asked in: Who led the Salt March (Dandi March) in 1930?"
    },
    {
      "id": "gk-cur-136",
      "text": "Which empire built the Colosseum in Rome?",
      "opts": [
        "Greek Empire",
        "Roman Empire",
        "Byzantine Empire",
        "Ottoman Empire"
      ],
      "ans": 1,
      "cat": "History",
      "difficulty": "easy",
      "exp": "The correct option is \"Roman Empire\". In GK (History), \"Roman Empire\" directly satisfies the concept or fact asked in: Which empire built the Colosseum in Rome?"
    },
    {
      "id": "gk-cur-137",
      "text": "Who was the first President of independent India?",
      "opts": [
        "Jawaharlal Nehru",
        "Dr. Rajendra Prasad",
        "Sardar Patel",
        "Dr. S. Radhakrishnan"
      ],
      "ans": 1,
      "cat": "History",
      "difficulty": "medium",
      "exp": "The correct option is \"Dr. Rajendra Prasad\". In GK (History), \"Dr. Rajendra Prasad\" directly satisfies the concept or fact asked in: Who was the first President of independent India?"
    },
    {
      "id": "gk-cur-138",
      "text": "Which ancient civilization built the pyramids of Giza?",
      "opts": [
        "Mesopotamian",
        "Egyptian",
        "Roman",
        "Greek"
      ],
      "ans": 1,
      "cat": "History",
      "difficulty": "hard",
      "exp": "The correct option is \"Egyptian\". In GK (History), \"Egyptian\" directly satisfies the concept or fact asked in: Which ancient civilization built the pyramids of Giza?"
    },
    {
      "id": "gk-cur-139",
      "text": "Who was known as the 'Iron Man of India'?",
      "opts": [
        "Jawaharlal Nehru",
        "Sardar Vallabhbhai Patel",
        "Bhagat Singh",
        "Lal Bahadur Shastri"
      ],
      "ans": 1,
      "cat": "History",
      "difficulty": "easy",
      "exp": "The correct option is \"Sardar Vallabhbhai Patel\". In GK (History), \"Sardar Vallabhbhai Patel\" directly satisfies the concept or fact asked in: Who was known as the 'Iron Man of India'?"
    },
    {
      "id": "gk-cur-140",
      "text": "In which year was the Battle of Plassey fought?",
      "opts": [
        "1757",
        "1857",
        "1707",
        "1607"
      ],
      "ans": 0,
      "cat": "History",
      "difficulty": "medium",
      "exp": "The correct option is \"1757\". In GK (History), \"1757\" directly satisfies the concept or fact asked in: In which year was the Battle of Plassey fought?"
    },
    {
      "id": "gk-cur-141",
      "text": "Who wrote the book 'Discovery of India'?",
      "opts": [
        "Mahatma Gandhi",
        "Jawaharlal Nehru",
        "Rabindranath Tagore",
        "Subhas Chandra Bose"
      ],
      "ans": 1,
      "cat": "History",
      "difficulty": "hard",
      "exp": "The correct option is \"Jawaharlal Nehru\". In GK (History), \"Jawaharlal Nehru\" directly satisfies the concept or fact asked in: Who wrote the book 'Discovery of India'?"
    },
    {
      "id": "gk-cur-142",
      "text": "Which war is associated with the Treaty of Versailles?",
      "opts": [
        "World War I",
        "World War II",
        "Korean War",
        "Vietnam War"
      ],
      "ans": 0,
      "cat": "History",
      "difficulty": "easy",
      "exp": "The correct option is \"World War I\". In GK (History), \"World War I\" directly satisfies the concept or fact asked in: Which war is associated with the Treaty of Versailles?"
    },
    {
      "id": "gk-cur-143",
      "text": "Who was the founder of the Maurya Empire?",
      "opts": [
        "Ashoka",
        "Chandragupta Maurya",
        "Bindusara",
        "Samudragupta"
      ],
      "ans": 1,
      "cat": "History",
      "difficulty": "medium",
      "exp": "The correct option is \"Chandragupta Maurya\". In GK (History), \"Chandragupta Maurya\" directly satisfies the concept or fact asked in: Who was the founder of the Maurya Empire?"
    },
    {
      "id": "gk-cur-144",
      "text": "Which year did the Berlin Wall fall?",
      "opts": [
        "1987",
        "1989",
        "1991",
        "1993"
      ],
      "ans": 1,
      "cat": "History",
      "difficulty": "hard",
      "exp": "The correct option is \"1989\". In GK (History), \"1989\" directly satisfies the concept or fact asked in: Which year did the Berlin Wall fall?"
    },
    {
      "id": "gk-cur-145",
      "text": "Who gave the 'Quit India' call in 1942?",
      "opts": [
        "Jawaharlal Nehru",
        "Mahatma Gandhi",
        "Subhas Chandra Bose",
        "Maulana Azad"
      ],
      "ans": 1,
      "cat": "History",
      "difficulty": "easy",
      "exp": "The correct option is \"Mahatma Gandhi\". In GK (History), \"Mahatma Gandhi\" directly satisfies the concept or fact asked in: Who gave the 'Quit India' call in 1942?"
    },
    {
      "id": "gk-cur-146",
      "text": "Which explorer is credited with discovering the sea route to India in 1498?",
      "opts": [
        "Christopher Columbus",
        "Vasco da Gama",
        "Ferdinand Magellan",
        "Marco Polo"
      ],
      "ans": 1,
      "cat": "History",
      "difficulty": "medium",
      "exp": "The correct option is \"Vasco da Gama\". In GK (History), \"Vasco da Gama\" directly satisfies the concept or fact asked in: Which explorer is credited with discovering the sea route to India in 1498?"
    },
    {
      "id": "gk-cur-147",
      "text": "Who was the last Mughal emperor of India?",
      "opts": [
        "Akbar II",
        "Bahadur Shah Zafar",
        "Shah Alam II",
        "Aurangzeb"
      ],
      "ans": 1,
      "cat": "History",
      "difficulty": "hard",
      "exp": "The correct option is \"Bahadur Shah Zafar\". In GK (History), \"Bahadur Shah Zafar\" directly satisfies the concept or fact asked in: Who was the last Mughal emperor of India?"
    },
    {
      "id": "gk-cur-148",
      "text": "Which Indian freedom fighter was known as 'Netaji'?",
      "opts": [
        "Bhagat Singh",
        "Subhas Chandra Bose",
        "Chandrashekhar Azad",
        "Lala Lajpat Rai"
      ],
      "ans": 1,
      "cat": "History",
      "difficulty": "easy",
      "exp": "The correct option is \"Subhas Chandra Bose\". In GK (History), \"Subhas Chandra Bose\" directly satisfies the concept or fact asked in: Which Indian freedom fighter was known as 'Netaji'?"
    },
    {
      "id": "gk-cur-149",
      "text": "Who was the first Indian to win a Nobel Prize?",
      "opts": [
        "C.V. Raman",
        "Rabindranath Tagore",
        "Mother Teresa",
        "Amartya Sen"
      ],
      "ans": 1,
      "cat": "History",
      "difficulty": "medium",
      "exp": "The correct option is \"Rabindranath Tagore\". In GK (History), \"Rabindranath Tagore\" directly satisfies the concept or fact asked in: Who was the first Indian to win a Nobel Prize?"
    },
    {
      "id": "gk-cur-150",
      "text": "Who is known as the 'Father of the Nation' in India?",
      "opts": [
        "Jawaharlal Nehru",
        "Mahatma Gandhi",
        "Sardar Patel",
        "B. R. Ambedkar"
      ],
      "ans": 1,
      "cat": "Polity",
      "difficulty": "easy",
      "exp": "The correct option is \"Mahatma Gandhi\". In GK (Polity), \"Mahatma Gandhi\" directly satisfies the concept or fact asked in: Who is known as the 'Father of the Nation' in India?"
    },
    {
      "id": "gk-cur-151",
      "text": "Who is the head of the Indian judiciary?",
      "opts": [
        "President",
        "Prime Minister",
        "Chief Justice of India",
        "Attorney General"
      ],
      "ans": 2,
      "cat": "Polity",
      "difficulty": "hard",
      "exp": "The correct option is \"Chief Justice of India\". In GK (Polity), \"Chief Justice of India\" directly satisfies the concept or fact asked in: Who is the head of the Indian judiciary?"
    },
    {
      "id": "gk-cur-152",
      "text": "What is the minimum age to become a member of the Lok Sabha in India?",
      "opts": [
        "18 years",
        "21 years",
        "25 years",
        "30 years"
      ],
      "ans": 2,
      "cat": "Polity",
      "difficulty": "easy",
      "exp": "The correct option is \"25 years\". In GK (Polity), \"25 years\" directly satisfies the concept or fact asked in: What is the minimum age to become a member of the Lok Sabha in India?"
    },
    {
      "id": "gk-cur-153",
      "text": "Which body is responsible for conducting elections in India?",
      "opts": [
        "Supreme Court",
        "Election Commission of India",
        "Parliament",
        "NITI Aayog"
      ],
      "ans": 1,
      "cat": "Polity",
      "difficulty": "medium",
      "exp": "The correct option is \"Election Commission of India\". In GK (Polity), \"Election Commission of India\" directly satisfies the concept or fact asked in: Which body is responsible for conducting elections in India?"
    },
    {
      "id": "gk-cur-154",
      "text": "How many members can the Rajya Sabha have at most, as per the Constitution?",
      "opts": [
        "245",
        "250",
        "300",
        "350"
      ],
      "ans": 1,
      "cat": "Polity",
      "difficulty": "hard",
      "exp": "The correct option is \"250\". In GK (Polity), \"250\" directly satisfies the concept or fact asked in: How many members can the Rajya Sabha have at most, as per the Constitution?"
    },
    {
      "id": "gk-cur-155",
      "text": "Which amendment of the Indian Constitution is known as the 'Mini Constitution'?",
      "opts": [
        "42nd Amendment",
        "44th Amendment",
        "52nd Amendment",
        "61st Amendment"
      ],
      "ans": 0,
      "cat": "Polity",
      "difficulty": "easy",
      "exp": "The correct option is \"42nd Amendment\". In GK (Polity), \"42nd Amendment\" directly satisfies the concept or fact asked in: Which amendment of the Indian Constitution is known as the 'Mini Constitution'?"
    },
    {
      "id": "gk-cur-156",
      "text": "Who appoints the Governor of an Indian state?",
      "opts": [
        "Chief Minister",
        "President of India",
        "Prime Minister",
        "Chief Justice"
      ],
      "ans": 1,
      "cat": "Polity",
      "difficulty": "medium",
      "exp": "The correct option is \"President of India\". In GK (Polity), \"President of India\" directly satisfies the concept or fact asked in: Who appoints the Governor of an Indian state?"
    },
    {
      "id": "gk-cur-157",
      "text": "Which schedule of the Indian Constitution deals with anti-defection law?",
      "opts": [
        "8th Schedule",
        "9th Schedule",
        "10th Schedule",
        "12th Schedule"
      ],
      "ans": 2,
      "cat": "Polity",
      "difficulty": "hard",
      "exp": "The correct option is \"10th Schedule\". In GK (Polity), \"10th Schedule\" directly satisfies the concept or fact asked in: Which schedule of the Indian Constitution deals with anti-defection law?"
    },
    {
      "id": "gk-cur-158",
      "text": "What is the tenure of the President of India?",
      "opts": [
        "4 years",
        "5 years",
        "6 years",
        "7 years"
      ],
      "ans": 1,
      "cat": "Polity",
      "difficulty": "easy",
      "exp": "The correct option is \"5 years\". In GK (Polity), \"5 years\" directly satisfies the concept or fact asked in: What is the tenure of the President of India?"
    },
    {
      "id": "gk-cur-159",
      "text": "Which is the largest exporter of crude oil in the world?",
      "opts": [
        "USA",
        "Russia",
        "Saudi Arabia",
        "Iran"
      ],
      "ans": 2,
      "cat": "Economy",
      "difficulty": "medium",
      "exp": "The correct option is \"Saudi Arabia\". In GK (Economy), \"Saudi Arabia\" directly satisfies the concept or fact asked in: Which is the largest exporter of crude oil in the world?"
    },
    {
      "id": "gk-cur-160",
      "text": "What is 'inflation' in economics?",
      "opts": [
        "A fall in general price levels",
        "A rise in general price levels",
        "Increase in exports",
        "Decrease in unemployment"
      ],
      "ans": 1,
      "cat": "Economy",
      "difficulty": "hard",
      "exp": "The correct option is \"A rise in general price levels\". In GK (Economy), \"A rise in general price levels\" directly satisfies the concept or fact asked in: What is 'inflation' in economics?"
    },
    {
      "id": "gk-cur-161",
      "text": "Which organization publishes the World Economic Outlook report?",
      "opts": [
        "World Bank",
        "IMF",
        "WTO",
        "UN"
      ],
      "ans": 1,
      "cat": "Economy",
      "difficulty": "easy",
      "exp": "The correct option is \"IMF\". In GK (Economy), \"IMF\" directly satisfies the concept or fact asked in: Which organization publishes the World Economic Outlook report?"
    },
    {
      "id": "gk-cur-162",
      "text": "What does GST stand for in the Indian tax system?",
      "opts": [
        "General Sales Tax",
        "Goods and Services Tax",
        "Government Service Tax",
        "Gross Sales Tax"
      ],
      "ans": 1,
      "cat": "Economy",
      "difficulty": "medium",
      "exp": "The correct option is \"Goods and Services Tax\". In GK (Economy), \"Goods and Services Tax\" directly satisfies the concept or fact asked in: What does GST stand for in the Indian tax system?"
    },
    {
      "id": "gk-cur-163",
      "text": "Which Indian institution is known as the 'Banker's Bank'?",
      "opts": [
        "State Bank of India",
        "Reserve Bank of India",
        "NABARD",
        "SEBI"
      ],
      "ans": 1,
      "cat": "Economy",
      "difficulty": "hard",
      "exp": "The correct option is \"Reserve Bank of India\". In GK (Economy), \"Reserve Bank of India\" directly satisfies the concept or fact asked in: Which Indian institution is known as the 'Banker's Bank'?"
    },
    {
      "id": "gk-cur-164",
      "text": "What is a 'bull market' in stock trading?",
      "opts": [
        "A market with falling prices",
        "A market with rising prices",
        "A market with no trading",
        "A regulated market"
      ],
      "ans": 1,
      "cat": "Economy",
      "difficulty": "easy",
      "exp": "The correct option is \"A market with rising prices\". In GK (Economy), \"A market with rising prices\" directly satisfies the concept or fact asked in: What is a 'bull market' in stock trading?"
    },
    {
      "id": "gk-cur-165",
      "text": "Which country has the largest economy in the world by nominal GDP (as of the mid-2020s)?",
      "opts": [
        "China",
        "Japan",
        "USA",
        "Germany"
      ],
      "ans": 2,
      "cat": "Economy",
      "difficulty": "medium",
      "exp": "The correct option is \"USA\". In GK (Economy), \"USA\" directly satisfies the concept or fact asked in: Which country has the largest economy in the world by nominal GDP (as of the mid-2020s)?"
    },
    {
      "id": "gk-cur-166",
      "text": "What is the term for money paid by a government to support an industry?",
      "opts": [
        "Tax",
        "Subsidy",
        "Tariff",
        "Duty"
      ],
      "ans": 1,
      "cat": "Economy",
      "difficulty": "hard",
      "exp": "The correct option is \"Subsidy\". In GK (Economy), \"Subsidy\" directly satisfies the concept or fact asked in: What is the term for money paid by a government to support an industry?"
    },
    {
      "id": "gk-cur-167",
      "text": "Which index measures the average price change of a basket of consumer goods?",
      "opts": [
        "Consumer Price Index",
        "Gross Domestic Product",
        "Sensex",
        "Human Development Index"
      ],
      "ans": 0,
      "cat": "Economy",
      "difficulty": "easy",
      "exp": "The correct option is \"Consumer Price Index\". In GK (Economy), \"Consumer Price Index\" directly satisfies the concept or fact asked in: Which index measures the average price change of a basket of consumer goods?"
    },
    {
      "id": "gk-cur-168",
      "text": "What is the currency of China?",
      "opts": [
        "Yuan",
        "Won",
        "Baht",
        "Ringgit"
      ],
      "ans": 0,
      "cat": "Economy",
      "difficulty": "medium",
      "exp": "The correct option is \"Yuan\". In GK (Economy), \"Yuan\" directly satisfies the concept or fact asked in: What is the currency of China?"
    },
    {
      "id": "gk-cur-169",
      "text": "Which sector of the economy includes agriculture and mining?",
      "opts": [
        "Primary sector",
        "Secondary sector",
        "Tertiary sector",
        "Quaternary sector"
      ],
      "ans": 0,
      "cat": "Economy",
      "difficulty": "hard",
      "exp": "The correct option is \"Primary sector\". In GK (Economy), \"Primary sector\" directly satisfies the concept or fact asked in: Which sector of the economy includes agriculture and mining?"
    },
    {
      "id": "gk-cur-170",
      "text": "Who is credited with founding modern economics with 'The Wealth of Nations'?",
      "opts": [
        "John Maynard Keynes",
        "Adam Smith",
        "Karl Marx",
        "David Ricardo"
      ],
      "ans": 1,
      "cat": "Economy",
      "difficulty": "easy",
      "exp": "The correct option is \"Adam Smith\". In GK (Economy), \"Adam Smith\" directly satisfies the concept or fact asked in: Who is credited with founding modern economics with 'The Wealth of Nations'?"
    },
    {
      "id": "gk-cur-171",
      "text": "Which country won the FIFA World Cup in 2022?",
      "opts": [
        "Brazil",
        "France",
        "Argentina",
        "Germany"
      ],
      "ans": 2,
      "cat": "Sports",
      "difficulty": "medium",
      "exp": "The correct option is \"Argentina\". In GK (Sports), \"Argentina\" directly satisfies the concept or fact asked in: Which country won the FIFA World Cup in 2022?"
    },
    {
      "id": "gk-cur-172",
      "text": "How many players are there in a standard cricket team on the field?",
      "opts": [
        "9",
        "10",
        "11",
        "12"
      ],
      "ans": 2,
      "cat": "Sports",
      "difficulty": "hard",
      "exp": "The correct option is \"11\". In GK (Sports), \"11\" directly satisfies the concept or fact asked in: How many players are there in a standard cricket team on the field?"
    },
    {
      "id": "gk-cur-173",
      "text": "In which sport is the term 'love' used to indicate zero score?",
      "opts": [
        "Badminton",
        "Tennis",
        "Table Tennis",
        "Squash"
      ],
      "ans": 1,
      "cat": "Sports",
      "difficulty": "easy",
      "exp": "The correct option is \"Tennis\". In GK (Sports), \"Tennis\" directly satisfies the concept or fact asked in: In which sport is the term 'love' used to indicate zero score?"
    },
    {
      "id": "gk-cur-174",
      "text": "Which country has won the most Cricket World Cups (men's, as of the mid-2020s)?",
      "opts": [
        "India",
        "West Indies",
        "Australia",
        "England"
      ],
      "ans": 2,
      "cat": "Sports",
      "difficulty": "medium",
      "exp": "The correct option is \"Australia\". In GK (Sports), \"Australia\" directly satisfies the concept or fact asked in: Which country has won the most Cricket World Cups (men's, as of the mid-2020s)?"
    },
    {
      "id": "gk-cur-175",
      "text": "In the Olympics, how many rings are there in the official symbol?",
      "opts": [
        "4",
        "5",
        "6",
        "7"
      ],
      "ans": 1,
      "cat": "Sports",
      "difficulty": "hard",
      "exp": "The correct option is \"5\". In GK (Sports), \"5\" directly satisfies the concept or fact asked in: In the Olympics, how many rings are there in the official symbol?"
    },
    {
      "id": "gk-cur-176",
      "text": "Which sport is associated with the term 'checkmate'?",
      "opts": [
        "Carrom",
        "Chess",
        "Billiards",
        "Bridge"
      ],
      "ans": 1,
      "cat": "Sports",
      "difficulty": "easy",
      "exp": "The correct option is \"Chess\". In GK (Sports), \"Chess\" directly satisfies the concept or fact asked in: Which sport is associated with the term 'checkmate'?"
    },
    {
      "id": "gk-cur-177",
      "text": "Who holds the record for the most international centuries in men's cricket (as of the mid-2020s)?",
      "opts": [
        "Virat Kohli",
        "Sachin Tendulkar",
        "Ricky Ponting",
        "Kumar Sangakkara"
      ],
      "ans": 1,
      "cat": "Sports",
      "difficulty": "medium",
      "exp": "The correct option is \"Sachin Tendulkar\". In GK (Sports), \"Sachin Tendulkar\" directly satisfies the concept or fact asked in: Who holds the record for the most international centuries in men's cricket (as of the mid-2020s)?"
    },
    {
      "id": "gk-cur-178",
      "text": "Which country hosted the 2020 Summer Olympics (held in 2021)?",
      "opts": [
        "China",
        "Brazil",
        "Japan",
        "UK"
      ],
      "ans": 2,
      "cat": "Sports",
      "difficulty": "hard",
      "exp": "The correct option is \"Japan\". In GK (Sports), \"Japan\" directly satisfies the concept or fact asked in: Which country hosted the 2020 Summer Olympics (held in 2021)?"
    },
    {
      "id": "gk-cur-179",
      "text": "Which trophy is awarded to the winner of the men's cricket World Test Championship?",
      "opts": [
        "Ashes Urn",
        "World Test Championship Mace",
        "ICC Trophy",
        "Border-Gavaskar Trophy"
      ],
      "ans": 1,
      "cat": "Sports",
      "difficulty": "medium",
      "exp": "The correct option is \"World Test Championship Mace\". In GK (Sports), \"World Test Championship Mace\" directly satisfies the concept or fact asked in: Which trophy is awarded to the winner of the men's cricket World Test Championship?"
    },
    {
      "id": "gk-cur-180",
      "text": "Which Indian sprinter is known for winning gold in the Asian Games javelin throw?",
      "opts": [
        "Milkha Singh",
        "Neeraj Chopra",
        "P.T. Usha",
        "Anju Bobby George"
      ],
      "ans": 1,
      "cat": "Sports",
      "difficulty": "hard",
      "exp": "The correct option is \"Neeraj Chopra\". In GK (Sports), \"Neeraj Chopra\" directly satisfies the concept or fact asked in: Which Indian sprinter is known for winning gold in the Asian Games javelin throw?"
    },
    {
      "id": "gk-cur-181",
      "text": "In badminton, what is the maximum number of points needed to win a standard game?",
      "opts": [
        "15",
        "21",
        "25",
        "30"
      ],
      "ans": 1,
      "cat": "Sports",
      "difficulty": "easy",
      "exp": "The correct option is \"21\". In GK (Sports), \"21\" directly satisfies the concept or fact asked in: In badminton, what is the maximum number of points needed to win a standard game?"
    },
    {
      "id": "gk-cur-182",
      "text": "Which country is credited with inventing the sport of table tennis?",
      "opts": [
        "China",
        "India",
        "England",
        "Japan"
      ],
      "ans": 2,
      "cat": "Sports",
      "difficulty": "medium",
      "exp": "The correct option is \"England\". In GK (Sports), \"England\" directly satisfies the concept or fact asked in: Which country is credited with inventing the sport of table tennis?"
    },
    {
      "id": "gk-cur-183",
      "text": "Who is the fastest man in the world, holding the 100m world record (as of the mid-2020s)?",
      "opts": [
        "Justin Gatlin",
        "Usain Bolt",
        "Tyson Gay",
        "Yohan Blake"
      ],
      "ans": 1,
      "cat": "Sports",
      "difficulty": "hard",
      "exp": "The correct option is \"Usain Bolt\". In GK (Sports), \"Usain Bolt\" directly satisfies the concept or fact asked in: Who is the fastest man in the world, holding the 100m world record (as of the mid-2020s)?"
    },
    {
      "id": "gk-cur-184",
      "text": "Which sport is played at Wimbledon?",
      "opts": [
        "Cricket",
        "Tennis",
        "Golf",
        "Badminton"
      ],
      "ans": 1,
      "cat": "Sports",
      "difficulty": "easy",
      "exp": "The correct option is \"Tennis\". In GK (Sports), \"Tennis\" directly satisfies the concept or fact asked in: Which sport is played at Wimbledon?"
    },
    {
      "id": "gk-cur-185",
      "text": "Which UN agency is dedicated to global health?",
      "opts": [
        "UNESCO",
        "WHO",
        "UNICEF",
        "UNDP"
      ],
      "ans": 1,
      "cat": "General",
      "difficulty": "medium",
      "exp": "The correct option is \"WHO\". In GK (General), \"WHO\" directly satisfies the concept or fact asked in: Which UN agency is dedicated to global health?"
    },
    {
      "id": "gk-cur-186",
      "text": "What is the full form of ISRO?",
      "opts": [
        "Indian Space Research Organisation",
        "International Space Research Organisation",
        "Indian Scientific Research Organisation",
        "Indian Satellite Research Organisation"
      ],
      "ans": 0,
      "cat": "General",
      "difficulty": "hard",
      "exp": "The correct option is \"Indian Space Research Organisation\". In GK (General), \"Indian Space Research Organisation\" directly satisfies the concept or fact asked in: What is the full form of ISRO?"
    },
    {
      "id": "gk-cur-187",
      "text": "Which is the largest religion in the world by number of followers?",
      "opts": [
        "Islam",
        "Christianity",
        "Hinduism",
        "Buddhism"
      ],
      "ans": 1,
      "cat": "General",
      "difficulty": "easy",
      "exp": "The correct option is \"Christianity\". In GK (General), \"Christianity\" directly satisfies the concept or fact asked in: Which is the largest religion in the world by number of followers?"
    },
    {
      "id": "gk-cur-188",
      "text": "Which day is celebrated as World Environment Day?",
      "opts": [
        "June 5",
        "April 22",
        "March 21",
        "October 2"
      ],
      "ans": 0,
      "cat": "General",
      "difficulty": "medium",
      "exp": "The correct option is \"June 5\". In GK (General), \"June 5\" directly satisfies the concept or fact asked in: Which day is celebrated as World Environment Day?"
    },
    {
      "id": "gk-cur-189",
      "text": "Which Indian award is the highest civilian honour?",
      "opts": [
        "Padma Vibhushan",
        "Padma Shri",
        "Bharat Ratna",
        "Ashoka Chakra"
      ],
      "ans": 2,
      "cat": "General",
      "difficulty": "easy",
      "exp": "The correct option is \"Bharat Ratna\". In GK (General), \"Bharat Ratna\" directly satisfies the concept or fact asked in: Which Indian award is the highest civilian honour?"
    },
    {
      "id": "gk-cur-190",
      "text": "Which day is observed as International Yoga Day?",
      "opts": [
        "June 21",
        "April 7",
        "May 1",
        "September 21"
      ],
      "ans": 0,
      "cat": "General",
      "difficulty": "medium",
      "exp": "The correct option is \"June 21\". In GK (General), \"June 21\" directly satisfies the concept or fact asked in: Which day is observed as International Yoga Day?"
    },
    {
      "id": "gk-cur-191",
      "text": "What is the term for a government by the people, for the people, exercised through elected representatives?",
      "opts": [
        "Monarchy",
        "Democracy",
        "Oligarchy",
        "Theocracy"
      ],
      "ans": 1,
      "cat": "General",
      "difficulty": "hard",
      "exp": "The correct option is \"Democracy\". In GK (General), \"Democracy\" directly satisfies the concept or fact asked in: What is the term for a government by the people, for the people, exercised through elected representatives?"
    },
    {
      "id": "gk-cur-192",
      "text": "Which social media platform was originally called 'TheFacebook'?",
      "opts": [
        "Instagram",
        "Facebook",
        "Twitter",
        "LinkedIn"
      ],
      "ans": 1,
      "cat": "General",
      "difficulty": "easy",
      "exp": "The correct option is \"Facebook\". In GK (General), \"Facebook\" directly satisfies the concept or fact asked in: Which social media platform was originally called 'TheFacebook'?"
    },
    {
      "id": "gk-cur-193",
      "text": "What does 'AI' stand for in technology?",
      "opts": [
        "Automated Interface",
        "Artificial Intelligence",
        "Applied Informatics",
        "Autonomous Integration"
      ],
      "ans": 1,
      "cat": "General",
      "difficulty": "hard",
      "exp": "The correct option is \"Artificial Intelligence\". In GK (General), \"Artificial Intelligence\" directly satisfies the concept or fact asked in: What does 'AI' stand for in technology?"
    },
    {
      "id": "gk-cur-194",
      "text": "Which Indian city is called the 'City of Lakes'?",
      "opts": [
        "Jaipur",
        "Udaipur",
        "Bhopal",
        "Srinagar"
      ],
      "ans": 1,
      "cat": "General",
      "difficulty": "easy",
      "exp": "The correct option is \"Udaipur\". In GK (General), \"Udaipur\" directly satisfies the concept or fact asked in: Which Indian city is called the 'City of Lakes'?"
    },
    {
      "id": "gk-cur-195",
      "text": "What is the term for the study of maps and map-making?",
      "opts": [
        "Geology",
        "Cartography",
        "Topology",
        "Geography"
      ],
      "ans": 1,
      "cat": "General",
      "difficulty": "medium",
      "exp": "The correct option is \"Cartography\". In GK (General), \"Cartography\" directly satisfies the concept or fact asked in: What is the term for the study of maps and map-making?"
    },
    {
      "id": "gk-cur-196",
      "text": "Which festival is known as the festival of colors in India?",
      "opts": [
        "Diwali",
        "Holi",
        "Navratri",
        "Baisakhi"
      ],
      "ans": 1,
      "cat": "General",
      "difficulty": "hard",
      "exp": "The correct option is \"Holi\". In GK (General), \"Holi\" directly satisfies the concept or fact asked in: Which festival is known as the festival of colors in India?"
    },
    {
      "id": "gk-cur-197",
      "text": "Which is the largest country in the world by area?",
      "opts": [
        "China",
        "USA",
        "Russia",
        "Canada"
      ],
      "ans": 2,
      "cat": "Geography",
      "difficulty": "easy",
      "exp": "The correct option is \"Russia\". In GK (Geography), \"Russia\" directly satisfies the concept or fact asked in: Which is the largest country in the world by area?"
    },
    {
      "id": "gk-cur-198",
      "text": "Which strait separates Europe and Asia at Istanbul?",
      "opts": [
        "Strait of Gibraltar",
        "Bosphorus",
        "Strait of Hormuz",
        "Bering Strait"
      ],
      "ans": 1,
      "cat": "Geography",
      "difficulty": "medium",
      "exp": "The correct option is \"Bosphorus\". In GK (Geography), \"Bosphorus\" directly satisfies the concept or fact asked in: Which strait separates Europe and Asia at Istanbul?"
    },
    {
      "id": "gk-cur-199",
      "text": "Which is the longest mountain range in the world?",
      "opts": [
        "Rockies",
        "Himalayas",
        "Andes",
        "Alps"
      ],
      "ans": 2,
      "cat": "Geography",
      "difficulty": "hard",
      "exp": "The correct option is \"Andes\". In GK (Geography), \"Andes\" directly satisfies the concept or fact asked in: Which is the longest mountain range in the world?"
    },
    {
      "id": "gk-cur-200",
      "text": "Which desert is located in northern China and Mongolia?",
      "opts": [
        "Sahara",
        "Thar",
        "Gobi Desert",
        "Kalahari"
      ],
      "ans": 2,
      "cat": "Geography",
      "difficulty": "easy",
      "exp": "The correct option is \"Gobi Desert\". In GK (Geography), \"Gobi Desert\" directly satisfies the concept or fact asked in: Which desert is located in northern China and Mongolia?"
    },
    {
      "id": "gk-cur-201",
      "text": "What is the capital of South Korea?",
      "opts": [
        "Busan",
        "Seoul",
        "Incheon",
        "Daegu"
      ],
      "ans": 1,
      "cat": "Geography",
      "difficulty": "medium",
      "exp": "The correct option is \"Seoul\". In GK (Geography), \"Seoul\" directly satisfies the concept or fact asked in: What is the capital of South Korea?"
    },
    {
      "id": "gk-cur-202",
      "text": "What is the capital of Argentina?",
      "opts": [
        "Lima",
        "Santiago",
        "Buenos Aires",
        "Montevideo"
      ],
      "ans": 2,
      "cat": "Geography",
      "difficulty": "easy",
      "exp": "The correct option is \"Buenos Aires\". In GK (Geography), \"Buenos Aires\" directly satisfies the concept or fact asked in: What is the capital of Argentina?"
    },
    {
      "id": "gk-cur-203",
      "text": "Which country has the most time zones, largely due to its overseas territories?",
      "opts": [
        "Russia",
        "USA",
        "France",
        "United Kingdom"
      ],
      "ans": 2,
      "cat": "Geography",
      "difficulty": "medium",
      "exp": "The correct option is \"France\". In GK (Geography), \"France\" directly satisfies the concept or fact asked in: Which country has the most time zones, largely due to its overseas territories?"
    },
    {
      "id": "gk-cur-204",
      "text": "Which sea is famous for being so salty that swimmers float easily on its surface?",
      "opts": [
        "Red Sea",
        "Dead Sea",
        "Caspian Sea",
        "Black Sea"
      ],
      "ans": 1,
      "cat": "Geography",
      "difficulty": "hard",
      "exp": "The correct option is \"Dead Sea\". In GK (Geography), \"Dead Sea\" directly satisfies the concept or fact asked in: Which sea is famous for being so salty that swimmers float easily on its surface?"
    },
    {
      "id": "gk-cur-205",
      "text": "Which Indian state is the largest by area?",
      "opts": [
        "Madhya Pradesh",
        "Maharashtra",
        "Rajasthan",
        "Uttar Pradesh"
      ],
      "ans": 2,
      "cat": "Geography",
      "difficulty": "easy",
      "exp": "The correct option is \"Rajasthan\". In GK (Geography), \"Rajasthan\" directly satisfies the concept or fact asked in: Which Indian state is the largest by area?"
    },
    {
      "id": "gk-cur-206",
      "text": "Which of these is a transcontinental country, lying in both Europe and Asia?",
      "opts": [
        "Turkey",
        "France",
        "Japan",
        "Brazil"
      ],
      "ans": 0,
      "cat": "Geography",
      "difficulty": "medium",
      "exp": "The correct option is \"Turkey\". In GK (Geography), \"Turkey\" directly satisfies the concept or fact asked in: Which of these is a transcontinental country, lying in both Europe and Asia?"
    },
    {
      "id": "gk-cur-207",
      "text": "What is the capital of Egypt?",
      "opts": [
        "Alexandria",
        "Cairo",
        "Giza",
        "Luxor"
      ],
      "ans": 1,
      "cat": "Geography",
      "difficulty": "hard",
      "exp": "The correct option is \"Cairo\". In GK (Geography), \"Cairo\" directly satisfies the concept or fact asked in: What is the capital of Egypt?"
    },
    {
      "id": "gk-cur-208",
      "text": "Which country is known as the 'Land of a Thousand Lakes'?",
      "opts": [
        "Sweden",
        "Finland",
        "Norway",
        "Iceland"
      ],
      "ans": 1,
      "cat": "Geography",
      "difficulty": "easy",
      "exp": "The correct option is \"Finland\". In GK (Geography), \"Finland\" directly satisfies the concept or fact asked in: Which country is known as the 'Land of a Thousand Lakes'?"
    },
    {
      "id": "gk-cur-209",
      "text": "What is the capital of Kenya?",
      "opts": [
        "Mombasa",
        "Nairobi",
        "Kisumu",
        "Dar es Salaam"
      ],
      "ans": 1,
      "cat": "Geography",
      "difficulty": "medium",
      "exp": "The correct option is \"Nairobi\". In GK (Geography), \"Nairobi\" directly satisfies the concept or fact asked in: What is the capital of Kenya?"
    },
    {
      "id": "gk-cur-210",
      "text": "Which mountain range is often considered the traditional boundary between Europe and Asia?",
      "opts": [
        "Andes",
        "Ural Mountains",
        "Alps",
        "Atlas Mountains"
      ],
      "ans": 1,
      "cat": "Geography",
      "difficulty": "hard",
      "exp": "The correct option is \"Ural Mountains\". In GK (Geography), \"Ural Mountains\" directly satisfies the concept or fact asked in: Which mountain range is often considered the traditional boundary between Europe and Asia?"
    },
    {
      "id": "gk-cur-211",
      "text": "What is the capital of Vietnam?",
      "opts": [
        "Ho Chi Minh City",
        "Hanoi",
        "Da Nang",
        "Hue"
      ],
      "ans": 1,
      "cat": "Geography",
      "difficulty": "easy",
      "exp": "The correct option is \"Hanoi\". In GK (Geography), \"Hanoi\" directly satisfies the concept or fact asked in: What is the capital of Vietnam?"
    },
    {
      "id": "gk-cur-212",
      "text": "Which is the driest non-polar desert in the world?",
      "opts": [
        "Sahara",
        "Atacama Desert",
        "Thar Desert",
        "Mojave Desert"
      ],
      "ans": 1,
      "cat": "Geography",
      "difficulty": "medium",
      "exp": "The correct option is \"Atacama Desert\". In GK (Geography), \"Atacama Desert\" directly satisfies the concept or fact asked in: Which is the driest non-polar desert in the world?"
    },
    {
      "id": "gk-cur-213",
      "text": "Which two countries share the longest international border in the world?",
      "opts": [
        "Russia and China",
        "USA and Canada",
        "India and China",
        "Brazil and Argentina"
      ],
      "ans": 1,
      "cat": "Geography",
      "difficulty": "hard",
      "exp": "The correct option is \"USA and Canada\". In GK (Geography), \"USA and Canada\" directly satisfies the concept or fact asked in: Which two countries share the longest international border in the world?"
    },
    {
      "id": "gk-cur-214",
      "text": "Who was the first President of the United States?",
      "opts": [
        "Thomas Jefferson",
        "John Adams",
        "George Washington",
        "Abraham Lincoln"
      ],
      "ans": 2,
      "cat": "History",
      "difficulty": "easy",
      "exp": "The correct option is \"George Washington\". In GK (History), \"George Washington\" directly satisfies the concept or fact asked in: Who was the first President of the United States?"
    },
    {
      "id": "gk-cur-215",
      "text": "Which ancient wonder still stands today, located in Giza, Egypt?",
      "opts": [
        "Colossus of Rhodes",
        "Hanging Gardens of Babylon",
        "Great Pyramid of Giza",
        "Lighthouse of Alexandria"
      ],
      "ans": 2,
      "cat": "History",
      "difficulty": "medium",
      "exp": "The correct option is \"Great Pyramid of Giza\". In GK (History), \"Great Pyramid of Giza\" directly satisfies the concept or fact asked in: Which ancient wonder still stands today, located in Giza, Egypt?"
    },
    {
      "id": "gk-cur-216",
      "text": "In which year did the French Revolution begin?",
      "opts": [
        "1776",
        "1789",
        "1799",
        "1804"
      ],
      "ans": 1,
      "cat": "History",
      "difficulty": "hard",
      "exp": "The correct option is \"1789\". In GK (History), \"1789\" directly satisfies the concept or fact asked in: In which year did the French Revolution begin?"
    },
    {
      "id": "gk-cur-217",
      "text": "Who was the first emperor of the Maurya Empire?",
      "opts": [
        "Ashoka",
        "Bindusara",
        "Chandragupta Maurya",
        "Chanakya"
      ],
      "ans": 2,
      "cat": "History",
      "difficulty": "easy",
      "exp": "The correct option is \"Chandragupta Maurya\". In GK (History), \"Chandragupta Maurya\" directly satisfies the concept or fact asked in: Who was the first emperor of the Maurya Empire?"
    },
    {
      "id": "gk-cur-218",
      "text": "The Battle of Plassey, which established British influence in Bengal, was fought in which year?",
      "opts": [
        "1757",
        "1764",
        "1857",
        "1707"
      ],
      "ans": 0,
      "cat": "History",
      "difficulty": "medium",
      "exp": "The correct option is \"1757\". In GK (History), \"1757\" directly satisfies the concept or fact asked in: The Battle of Plassey, which established British influence in Bengal, was fought in which year?"
    },
    {
      "id": "gk-cur-219",
      "text": "Who wrote the book 'The Discovery of India'?",
      "opts": [
        "Mahatma Gandhi",
        "Jawaharlal Nehru",
        "Rajendra Prasad",
        "Sarojini Naidu"
      ],
      "ans": 1,
      "cat": "History",
      "difficulty": "hard",
      "exp": "The correct option is \"Jawaharlal Nehru\". In GK (History), \"Jawaharlal Nehru\" directly satisfies the concept or fact asked in: Who wrote the book 'The Discovery of India'?"
    },
    {
      "id": "gk-cur-220",
      "text": "Which vast empire was ruled by Genghis Khan?",
      "opts": [
        "Ottoman Empire",
        "Mongol Empire",
        "Persian Empire",
        "Roman Empire"
      ],
      "ans": 1,
      "cat": "History",
      "difficulty": "easy",
      "exp": "The correct option is \"Mongol Empire\". In GK (History), \"Mongol Empire\" directly satisfies the concept or fact asked in: Which vast empire was ruled by Genghis Khan?"
    },
    {
      "id": "gk-cur-221",
      "text": "In which year did India's Quit India Movement begin?",
      "opts": [
        "1930",
        "1942",
        "1947",
        "1919"
      ],
      "ans": 1,
      "cat": "History",
      "difficulty": "medium",
      "exp": "The correct option is \"1942\". In GK (History), \"1942\" directly satisfies the concept or fact asked in: In which year did India's Quit India Movement begin?"
    },
    {
      "id": "gk-cur-222",
      "text": "Which war ended with the Treaty of Versailles in 1919?",
      "opts": [
        "World War I",
        "World War II",
        "Napoleonic Wars",
        "Crimean War"
      ],
      "ans": 0,
      "cat": "History",
      "difficulty": "hard",
      "exp": "The correct option is \"World War I\". In GK (History), \"World War I\" directly satisfies the concept or fact asked in: Which war ended with the Treaty of Versailles in 1919?"
    },
    {
      "id": "gk-cur-223",
      "text": "Who founded the Mughal Empire in India?",
      "opts": [
        "Akbar",
        "Humayun",
        "Babur",
        "Aurangzeb"
      ],
      "ans": 2,
      "cat": "History",
      "difficulty": "easy",
      "exp": "The correct option is \"Babur\". In GK (History), \"Babur\" directly satisfies the concept or fact asked in: Who founded the Mughal Empire in India?"
    },
    {
      "id": "gk-cur-224",
      "text": "In which year did the Berlin Wall come down?",
      "opts": [
        "1985",
        "1989",
        "1991",
        "1993"
      ],
      "ans": 1,
      "cat": "History",
      "difficulty": "medium",
      "exp": "The correct option is \"1989\". In GK (History), \"1989\" directly satisfies the concept or fact asked in: In which year did the Berlin Wall come down?"
    },
    {
      "id": "gk-cur-225",
      "text": "Which civilization built the ancient city of Machu Picchu?",
      "opts": [
        "Aztec",
        "Maya",
        "Inca",
        "Olmec"
      ],
      "ans": 2,
      "cat": "History",
      "difficulty": "hard",
      "exp": "The correct option is \"Inca\". In GK (History), \"Inca\" directly satisfies the concept or fact asked in: Which civilization built the ancient city of Machu Picchu?"
    },
    {
      "id": "gk-cur-226",
      "text": "Who was the first woman to become President of India?",
      "opts": [
        "Sonia Gandhi",
        "Pratibha Patil",
        "Draupadi Murmu",
        "Indira Gandhi"
      ],
      "ans": 1,
      "cat": "History",
      "difficulty": "easy",
      "exp": "The correct option is \"Pratibha Patil\". In GK (History), \"Pratibha Patil\" directly satisfies the concept or fact asked in: Who was the first woman to become President of India?"
    },
    {
      "id": "gk-cur-227",
      "text": "In which year did the Indian Constitution come into effect?",
      "opts": [
        "1947",
        "1949",
        "1950",
        "1952"
      ],
      "ans": 2,
      "cat": "History",
      "difficulty": "hard",
      "exp": "The correct option is \"1950\". In GK (History), \"1950\" directly satisfies the concept or fact asked in: In which year did the Indian Constitution come into effect?"
    },
    {
      "id": "gk-cur-228",
      "text": "Who was the founder of the Sikh religion?",
      "opts": [
        "Guru Gobind Singh",
        "Guru Nanak",
        "Guru Arjan",
        "Guru Tegh Bahadur"
      ],
      "ans": 1,
      "cat": "History",
      "difficulty": "easy",
      "exp": "The correct option is \"Guru Nanak\". In GK (History), \"Guru Nanak\" directly satisfies the concept or fact asked in: Who was the founder of the Sikh religion?"
    },
    {
      "id": "gk-cur-229",
      "text": "The Renaissance, a period of great cultural and artistic revival, began in which country?",
      "opts": [
        "France",
        "Italy",
        "Spain",
        "England"
      ],
      "ans": 1,
      "cat": "History",
      "difficulty": "medium",
      "exp": "The correct option is \"Italy\". In GK (History), \"Italy\" directly satisfies the concept or fact asked in: The Renaissance, a period of great cultural and artistic revival, began in which country?"
    },
    {
      "id": "gk-cur-230",
      "text": "Which explorer's expedition was the first to circumnavigate the globe?",
      "opts": [
        "Christopher Columbus",
        "Vasco da Gama",
        "Ferdinand Magellan",
        "James Cook"
      ],
      "ans": 2,
      "cat": "History",
      "difficulty": "hard",
      "exp": "The correct option is \"Ferdinand Magellan\". In GK (History), \"Ferdinand Magellan\" directly satisfies the concept or fact asked in: Which explorer's expedition was the first to circumnavigate the globe?"
    },
    {
      "id": "gk-cur-231",
      "text": "Which Mughal emperor built the Taj Mahal?",
      "opts": [
        "Akbar",
        "Jahangir",
        "Shah Jahan",
        "Aurangzeb"
      ],
      "ans": 2,
      "cat": "History",
      "difficulty": "easy",
      "exp": "The correct option is \"Shah Jahan\". In GK (History), \"Shah Jahan\" directly satisfies the concept or fact asked in: Which Mughal emperor built the Taj Mahal?"
    },
    {
      "id": "gk-cur-232",
      "text": "In which year did the Indian Rebellion, often called the First War of Independence, occur?",
      "opts": [
        "1757",
        "1857",
        "1885",
        "1905"
      ],
      "ans": 1,
      "cat": "History",
      "difficulty": "medium",
      "exp": "The correct option is \"1857\". In GK (History), \"1857\" directly satisfies the concept or fact asked in: In which year did the Indian Rebellion, often called the First War of Independence, occur?"
    },
    {
      "id": "gk-cur-233",
      "text": "Which Egyptian queen was famously allied with Julius Caesar and Mark Antony?",
      "opts": [
        "Nefertiti",
        "Hatshepsut",
        "Cleopatra",
        "Ankhesenamun"
      ],
      "ans": 2,
      "cat": "History",
      "difficulty": "hard",
      "exp": "The correct option is \"Cleopatra\". In GK (History), \"Cleopatra\" directly satisfies the concept or fact asked in: Which Egyptian queen was famously allied with Julius Caesar and Mark Antony?"
    },
    {
      "id": "gk-cur-234",
      "text": "What is the chemical formula for water?",
      "opts": [
        "CO2",
        "H2O",
        "O2",
        "H2O2"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "easy",
      "exp": "The correct option is \"H2O\". In GK (Science), \"H2O\" directly satisfies the concept or fact asked in: What is the chemical formula for water?"
    },
    {
      "id": "gk-cur-235",
      "text": "What is the approximate speed of light in a vacuum?",
      "opts": [
        "3 x 10^5 m/s",
        "3 x 10^6 m/s",
        "3 x 10^8 m/s",
        "3 x 10^10 m/s"
      ],
      "ans": 2,
      "cat": "Science",
      "difficulty": "medium",
      "exp": "The correct option is \"3 x 10^8 m/s\". In GK (Science), \"3 x 10^8 m/s\" directly satisfies the concept or fact asked in: What is the approximate speed of light in a vacuum?"
    },
    {
      "id": "gk-cur-236",
      "text": "Which blood vessel carries oxygenated blood from the lungs to the heart?",
      "opts": [
        "Pulmonary artery",
        "Pulmonary vein",
        "Aorta",
        "Vena cava"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "hard",
      "exp": "The correct option is \"Pulmonary vein\". In GK (Science), \"Pulmonary vein\" directly satisfies the concept or fact asked in: Which blood vessel carries oxygenated blood from the lungs to the heart?"
    },
    {
      "id": "gk-cur-237",
      "text": "What is the SI unit of frequency?",
      "opts": [
        "Watt",
        "Hertz",
        "Joule",
        "Newton"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "easy",
      "exp": "The correct option is \"Hertz\". In GK (Science), \"Hertz\" directly satisfies the concept or fact asked in: What is the SI unit of frequency?"
    },
    {
      "id": "gk-cur-238",
      "text": "Which scientist proposed the theory of evolution by natural selection?",
      "opts": [
        "Gregor Mendel",
        "Charles Darwin",
        "Louis Pasteur",
        "Carl Linnaeus"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "medium",
      "exp": "The correct option is \"Charles Darwin\". In GK (Science), \"Charles Darwin\" directly satisfies the concept or fact asked in: Which scientist proposed the theory of evolution by natural selection?"
    },
    {
      "id": "gk-cur-239",
      "text": "What is the pH value of pure water at 25 degrees Celsius?",
      "opts": [
        "0",
        "7",
        "10",
        "14"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "hard",
      "exp": "The correct option is \"7\". In GK (Science), \"7\" directly satisfies the concept or fact asked in: What is the pH value of pure water at 25 degrees Celsius?"
    },
    {
      "id": "gk-cur-240",
      "text": "Which gas is commonly known as 'laughing gas'?",
      "opts": [
        "Carbon dioxide",
        "Nitrous oxide",
        "Methane",
        "Helium"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "medium",
      "exp": "The correct option is \"Nitrous oxide\". In GK (Science), \"Nitrous oxide\" directly satisfies the concept or fact asked in: Which gas is commonly known as 'laughing gas'?"
    },
    {
      "id": "gk-cur-241",
      "text": "What is the process called by which a liquid changes into a gas?",
      "opts": [
        "Condensation",
        "Evaporation",
        "Sublimation",
        "Deposition"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "hard",
      "exp": "The correct option is \"Evaporation\". In GK (Science), \"Evaporation\" directly satisfies the concept or fact asked in: What is the process called by which a liquid changes into a gas?"
    },
    {
      "id": "gk-cur-242",
      "text": "What is the SI unit of force?",
      "opts": [
        "Joule",
        "Pascal",
        "Newton",
        "Watt"
      ],
      "ans": 2,
      "cat": "Science",
      "difficulty": "medium",
      "exp": "The correct option is \"Newton\". In GK (Science), \"Newton\" directly satisfies the concept or fact asked in: What is the SI unit of force?"
    },
    {
      "id": "gk-cur-243",
      "text": "Which element has the chemical symbol 'Na'?",
      "opts": [
        "Nitrogen",
        "Sodium",
        "Nickel",
        "Neon"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "hard",
      "exp": "The correct option is \"Sodium\". In GK (Science), \"Sodium\" directly satisfies the concept or fact asked in: Which element has the chemical symbol 'Na'?"
    },
    {
      "id": "gk-cur-244",
      "text": "What is the boiling point of water at sea level in degrees Celsius?",
      "opts": [
        "0",
        "50",
        "100",
        "212"
      ],
      "ans": 2,
      "cat": "Science",
      "difficulty": "easy",
      "exp": "The correct option is \"100\". In GK (Science), \"100\" directly satisfies the concept or fact asked in: What is the boiling point of water at sea level in degrees Celsius?"
    },
    {
      "id": "gk-cur-245",
      "text": "Which type of rock is formed from cooled and solidified lava or magma?",
      "opts": [
        "Sedimentary rock",
        "Igneous rock",
        "Metamorphic rock",
        "Mineral rock"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "medium",
      "exp": "The correct option is \"Igneous rock\". In GK (Science), \"Igneous rock\" directly satisfies the concept or fact asked in: Which type of rock is formed from cooled and solidified lava or magma?"
    },
    {
      "id": "gk-cur-246",
      "text": "Which scientist is credited with discovering penicillin?",
      "opts": [
        "Louis Pasteur",
        "Alexander Fleming",
        "Robert Koch",
        "Edward Jenner"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "medium",
      "exp": "The correct option is \"Alexander Fleming\". In GK (Science), \"Alexander Fleming\" directly satisfies the concept or fact asked in: Which scientist is credited with discovering penicillin?"
    },
    {
      "id": "gk-cur-247",
      "text": "What is the process by which green plants make their own food called?",
      "opts": [
        "Respiration",
        "Transpiration",
        "Photosynthesis",
        "Germination"
      ],
      "ans": 2,
      "cat": "Science",
      "difficulty": "hard",
      "exp": "The correct option is \"Photosynthesis\". In GK (Science), \"Photosynthesis\" directly satisfies the concept or fact asked in: What is the process by which green plants make their own food called?"
    },
    {
      "id": "gk-cur-248",
      "text": "What is the chemical symbol for iron?",
      "opts": [
        "Ir",
        "In",
        "Fe",
        "I"
      ],
      "ans": 2,
      "cat": "Science",
      "difficulty": "medium",
      "exp": "The correct option is \"Fe\". In GK (Science), \"Fe\" directly satisfies the concept or fact asked in: What is the chemical symbol for iron?"
    },
    {
      "id": "gk-cur-249",
      "text": "Which gland is often called the 'master gland' of the human body?",
      "opts": [
        "Thyroid gland",
        "Adrenal gland",
        "Pituitary gland",
        "Pineal gland"
      ],
      "ans": 2,
      "cat": "Science",
      "difficulty": "hard",
      "exp": "The correct option is \"Pituitary gland\". In GK (Science), \"Pituitary gland\" directly satisfies the concept or fact asked in: Which gland is often called the 'master gland' of the human body?"
    },
    {
      "id": "gk-cur-250",
      "text": "Which SI unit is used to measure atmospheric pressure?",
      "opts": [
        "Newton",
        "Pascal",
        "Joule",
        "Watt"
      ],
      "ans": 1,
      "cat": "Science",
      "difficulty": "easy",
      "exp": "The correct option is \"Pascal\". In GK (Science), \"Pascal\" directly satisfies the concept or fact asked in: Which SI unit is used to measure atmospheric pressure?"
    },
    {
      "id": "gk-cur-251",
      "text": "Which scientist formulated the three laws of motion?",
      "opts": [
        "Albert Einstein",
        "Galileo Galilei",
        "Isaac Newton",
        "Niels Bohr"
      ],
      "ans": 2,
      "cat": "Science",
      "difficulty": "medium",
      "exp": "The correct option is \"Isaac Newton\". In GK (Science), \"Isaac Newton\" directly satisfies the concept or fact asked in: Which scientist formulated the three laws of motion?"
    },
    {
      "id": "gk-cur-252",
      "text": "How many fundamental rights are currently guaranteed by the Indian Constitution?",
      "opts": [
        "5",
        "6",
        "7",
        "8"
      ],
      "ans": 1,
      "cat": "Polity",
      "difficulty": "hard",
      "exp": "The correct option is \"6\". In GK (Polity), \"6\" directly satisfies the concept or fact asked in: How many fundamental rights are currently guaranteed by the Indian Constitution?"
    },
    {
      "id": "gk-cur-253",
      "text": "What is the minimum age to become a member of the Lok Sabha?",
      "opts": [
        "21 years",
        "25 years",
        "30 years",
        "35 years"
      ],
      "ans": 1,
      "cat": "Polity",
      "difficulty": "easy",
      "exp": "The correct option is \"25 years\". In GK (Polity), \"25 years\" directly satisfies the concept or fact asked in: What is the minimum age to become a member of the Lok Sabha?"
    },
    {
      "id": "gk-cur-254",
      "text": "Which article of the Indian Constitution guarantees the Right to Equality?",
      "opts": [
        "Article 12",
        "Article 14",
        "Article 19",
        "Article 21"
      ],
      "ans": 1,
      "cat": "Polity",
      "difficulty": "medium",
      "exp": "The correct option is \"Article 14\". In GK (Polity), \"Article 14\" directly satisfies the concept or fact asked in: Which article of the Indian Constitution guarantees the Right to Equality?"
    },
    {
      "id": "gk-cur-255",
      "text": "Who formally appoints the Governor of an Indian state?",
      "opts": [
        "The Chief Minister",
        "The Prime Minister",
        "The President of India",
        "The Chief Justice"
      ],
      "ans": 2,
      "cat": "Polity",
      "difficulty": "hard",
      "exp": "The correct option is \"The President of India\". In GK (Polity), \"The President of India\" directly satisfies the concept or fact asked in: Who formally appoints the Governor of an Indian state?"
    },
    {
      "id": "gk-cur-256",
      "text": "Which house of the Indian Parliament is known as the 'Council of States'?",
      "opts": [
        "Lok Sabha",
        "Rajya Sabha",
        "Vidhan Sabha",
        "Vidhan Parishad"
      ],
      "ans": 1,
      "cat": "Polity",
      "difficulty": "medium",
      "exp": "The correct option is \"Rajya Sabha\". In GK (Polity), \"Rajya Sabha\" directly satisfies the concept or fact asked in: Which house of the Indian Parliament is known as the 'Council of States'?"
    },
    {
      "id": "gk-cur-257",
      "text": "Who chaired the Drafting Committee of the Indian Constitution?",
      "opts": [
        "Jawaharlal Nehru",
        "Rajendra Prasad",
        "B. R. Ambedkar",
        "Sardar Patel"
      ],
      "ans": 2,
      "cat": "Polity",
      "difficulty": "hard",
      "exp": "The correct option is \"B. R. Ambedkar\". In GK (Polity), \"B. R. Ambedkar\" directly satisfies the concept or fact asked in: Who chaired the Drafting Committee of the Indian Constitution?"
    },
    {
      "id": "gk-cur-258",
      "text": "What is the minimum age required to become the President of India?",
      "opts": [
        "25 years",
        "30 years",
        "35 years",
        "40 years"
      ],
      "ans": 2,
      "cat": "Polity",
      "difficulty": "easy",
      "exp": "The correct option is \"35 years\". In GK (Polity), \"35 years\" directly satisfies the concept or fact asked in: What is the minimum age required to become the President of India?"
    },
    {
      "id": "gk-cur-259",
      "text": "Which part of the Indian Constitution contains the Directive Principles of State Policy?",
      "opts": [
        "Part II",
        "Part III",
        "Part IV",
        "Part V"
      ],
      "ans": 2,
      "cat": "Polity",
      "difficulty": "medium",
      "exp": "The correct option is \"Part IV\". In GK (Polity), \"Part IV\" directly satisfies the concept or fact asked in: Which part of the Indian Constitution contains the Directive Principles of State Policy?"
    },
    {
      "id": "gk-cur-260",
      "text": "What is the maximum strength the Rajya Sabha can have as per the Constitution?",
      "opts": [
        "245",
        "250",
        "500",
        "552"
      ],
      "ans": 1,
      "cat": "Polity",
      "difficulty": "hard",
      "exp": "The correct option is \"250\". In GK (Polity), \"250\" directly satisfies the concept or fact asked in: What is the maximum strength the Rajya Sabha can have as per the Constitution?"
    },
    {
      "id": "gk-cur-261",
      "text": "Who administers the oath of office to the President of India?",
      "opts": [
        "The Vice President",
        "The Prime Minister",
        "The Chief Justice of India",
        "The Speaker of the Lok Sabha"
      ],
      "ans": 2,
      "cat": "Polity",
      "difficulty": "easy",
      "exp": "The correct option is \"The Chief Justice of India\". In GK (Polity), \"The Chief Justice of India\" directly satisfies the concept or fact asked in: Who administers the oath of office to the President of India?"
    },
    {
      "id": "gk-cur-262",
      "text": "How many schedules does the Indian Constitution currently have?",
      "opts": [
        "8",
        "10",
        "12",
        "14"
      ],
      "ans": 2,
      "cat": "Polity",
      "difficulty": "medium",
      "exp": "The correct option is \"12\". In GK (Polity), \"12\" directly satisfies the concept or fact asked in: How many schedules does the Indian Constitution currently have?"
    },
    {
      "id": "gk-cur-263",
      "text": "What is the minimum voting age in India?",
      "opts": [
        "16 years",
        "18 years",
        "21 years",
        "25 years"
      ],
      "ans": 1,
      "cat": "Polity",
      "difficulty": "hard",
      "exp": "The correct option is \"18 years\". In GK (Polity), \"18 years\" directly satisfies the concept or fact asked in: What is the minimum voting age in India?"
    },
    {
      "id": "gk-cur-264",
      "text": "Who serves as the ceremonial Supreme Commander of India's armed forces?",
      "opts": [
        "The Prime Minister",
        "The Defence Minister",
        "The President",
        "The Army Chief"
      ],
      "ans": 2,
      "cat": "Polity",
      "difficulty": "easy",
      "exp": "The correct option is \"The President\". In GK (Polity), \"The President\" directly satisfies the concept or fact asked in: Who serves as the ceremonial Supreme Commander of India's armed forces?"
    },
    {
      "id": "gk-cur-265",
      "text": "Which amendment to the Indian Constitution is often called the 'Mini Constitution'?",
      "opts": [
        "24th Amendment",
        "42nd Amendment",
        "44th Amendment",
        "52nd Amendment"
      ],
      "ans": 1,
      "cat": "Polity",
      "difficulty": "medium",
      "exp": "The correct option is \"42nd Amendment\". In GK (Polity), \"42nd Amendment\" directly satisfies the concept or fact asked in: Which amendment to the Indian Constitution is often called the 'Mini Constitution'?"
    },
    {
      "id": "gk-cur-266",
      "text": "What does 'PIL' stand for in the Indian legal system?",
      "opts": [
        "Public Interest Litigation",
        "Provisional Interim Law",
        "Public Inquiry License",
        "Preliminary Investigation Letter"
      ],
      "ans": 0,
      "cat": "Polity",
      "difficulty": "hard",
      "exp": "The correct option is \"Public Interest Litigation\". In GK (Polity), \"Public Interest Litigation\" directly satisfies the concept or fact asked in: What does 'PIL' stand for in the Indian legal system?"
    },
    {
      "id": "gk-cur-267",
      "text": "Who was the first Speaker of the Lok Sabha?",
      "opts": [
        "Neelam Sanjiva Reddy",
        "G. V. Mavalankar",
        "Hukam Singh",
        "K. S. Hegde"
      ],
      "ans": 1,
      "cat": "Polity",
      "difficulty": "easy",
      "exp": "The correct option is \"G. V. Mavalankar\". In GK (Polity), \"G. V. Mavalankar\" directly satisfies the concept or fact asked in: Who was the first Speaker of the Lok Sabha?"
    },
    {
      "id": "gk-cur-268",
      "text": "What is the term of office for members of the Rajya Sabha?",
      "opts": [
        "4 years",
        "5 years",
        "6 years",
        "7 years"
      ],
      "ans": 2,
      "cat": "Polity",
      "difficulty": "medium",
      "exp": "The correct option is \"6 years\". In GK (Polity), \"6 years\" directly satisfies the concept or fact asked in: What is the term of office for members of the Rajya Sabha?"
    },
    {
      "id": "gk-cur-269",
      "text": "What is the full form of RBI?",
      "opts": [
        "Reserve Bank of India",
        "Regional Bank of India",
        "Rural Bank of India",
        "Reserve Bureau of India"
      ],
      "ans": 0,
      "cat": "Economy",
      "difficulty": "hard",
      "exp": "The correct option is \"Reserve Bank of India\". In GK (Economy), \"Reserve Bank of India\" directly satisfies the concept or fact asked in: What is the full form of RBI?"
    },
    {
      "id": "gk-cur-270",
      "text": "Which document outlines a government's estimated revenue and expenditure for the coming year?",
      "opts": [
        "Balance Sheet",
        "Budget",
        "Census Report",
        "Economic Survey"
      ],
      "ans": 1,
      "cat": "Economy",
      "difficulty": "easy",
      "exp": "The correct option is \"Budget\". In GK (Economy), \"Budget\" directly satisfies the concept or fact asked in: Which document outlines a government's estimated revenue and expenditure for the coming year?"
    },
    {
      "id": "gk-cur-271",
      "text": "What term describes a sustained rise in the general price level of goods and services?",
      "opts": [
        "Deflation",
        "Inflation",
        "Recession",
        "Stagnation"
      ],
      "ans": 1,
      "cat": "Economy",
      "difficulty": "medium",
      "exp": "The correct option is \"Inflation\". In GK (Economy), \"Inflation\" directly satisfies the concept or fact asked in: What term describes a sustained rise in the general price level of goods and services?"
    },
    {
      "id": "gk-cur-272",
      "text": "Which international organization publishes the 'World Economic Outlook' report?",
      "opts": [
        "World Bank",
        "IMF",
        "WTO",
        "OECD"
      ],
      "ans": 1,
      "cat": "Economy",
      "difficulty": "hard",
      "exp": "The correct option is \"IMF\". In GK (Economy), \"IMF\" directly satisfies the concept or fact asked in: Which international organization publishes the 'World Economic Outlook' report?"
    },
    {
      "id": "gk-cur-273",
      "text": "What term describes money invested by a foreign company or individual into a business in another country?",
      "opts": [
        "Portfolio investment",
        "Foreign Direct Investment (FDI)",
        "Venture capital",
        "Public offering"
      ],
      "ans": 1,
      "cat": "Economy",
      "difficulty": "hard",
      "exp": "The correct option is \"Foreign Direct Investment (FDI)\". In GK (Economy), \"Foreign Direct Investment (FDI)\" directly satisfies the concept or fact asked in: What term describes money invested by a foreign company or individual into a business in another country?"
    },
    {
      "id": "gk-cur-274",
      "text": "Which body oversaw India's Five-Year Plans before being replaced by NITI Aayog?",
      "opts": [
        "Finance Commission",
        "Planning Commission",
        "RBI",
        "SEBI"
      ],
      "ans": 1,
      "cat": "Economy",
      "difficulty": "easy",
      "exp": "The correct option is \"Planning Commission\". In GK (Economy), \"Planning Commission\" directly satisfies the concept or fact asked in: Which body oversaw India's Five-Year Plans before being replaced by NITI Aayog?"
    },
    {
      "id": "gk-cur-275",
      "text": "What is the official currency of the United States?",
      "opts": [
        "Euro",
        "Pound Sterling",
        "US Dollar",
        "Canadian Dollar"
      ],
      "ans": 2,
      "cat": "Economy",
      "difficulty": "medium",
      "exp": "The correct option is \"US Dollar\". In GK (Economy), \"US Dollar\" directly satisfies the concept or fact asked in: What is the official currency of the United States?"
    },
    {
      "id": "gk-cur-276",
      "text": "Which institution is often called the 'banker's bank' in India?",
      "opts": [
        "State Bank of India",
        "Reserve Bank of India",
        "NABARD",
        "ICICI Bank"
      ],
      "ans": 1,
      "cat": "Economy",
      "difficulty": "hard",
      "exp": "The correct option is \"Reserve Bank of India\". In GK (Economy), \"Reserve Bank of India\" directly satisfies the concept or fact asked in: Which institution is often called the 'banker's bank' in India?"
    },
    {
      "id": "gk-cur-277",
      "text": "What does 'NITI Aayog' stand for?",
      "opts": [
        "National Institution for Transforming India",
        "National Investment and Trade Institute",
        "National Infrastructure and Technology Initiative",
        "National Industrial Trade Institution"
      ],
      "ans": 0,
      "cat": "Economy",
      "difficulty": "easy",
      "exp": "The correct option is \"National Institution for Transforming India\". In GK (Economy), \"National Institution for Transforming India\" directly satisfies the concept or fact asked in: What does 'NITI Aayog' stand for?"
    },
    {
      "id": "gk-cur-278",
      "text": "Which economic system is characterized by free markets and private ownership of the means of production?",
      "opts": [
        "Socialism",
        "Capitalism",
        "Communism",
        "Feudalism"
      ],
      "ans": 1,
      "cat": "Economy",
      "difficulty": "medium",
      "exp": "The correct option is \"Capitalism\". In GK (Economy), \"Capitalism\" directly satisfies the concept or fact asked in: Which economic system is characterized by free markets and private ownership of the means of production?"
    },
    {
      "id": "gk-cur-279",
      "text": "What term refers to the total monetary value of goods and services produced within a country in a year?",
      "opts": [
        "GNP",
        "GDP",
        "CPI",
        "FDI"
      ],
      "ans": 1,
      "cat": "Economy",
      "difficulty": "hard",
      "exp": "The correct option is \"GDP\". In GK (Economy), \"GDP\" directly satisfies the concept or fact asked in: What term refers to the total monetary value of goods and services produced within a country in a year?"
    },
    {
      "id": "gk-cur-280",
      "text": "Which is the oldest stock exchange in Asia?",
      "opts": [
        "National Stock Exchange",
        "Bombay Stock Exchange",
        "Tokyo Stock Exchange",
        "Hong Kong Stock Exchange"
      ],
      "ans": 1,
      "cat": "Economy",
      "difficulty": "easy",
      "exp": "The correct option is \"Bombay Stock Exchange\". In GK (Economy), \"Bombay Stock Exchange\" directly satisfies the concept or fact asked in: Which is the oldest stock exchange in Asia?"
    },
    {
      "id": "gk-cur-281",
      "text": "What is the full form of SEBI?",
      "opts": [
        "Securities and Exchange Board of India",
        "State Economic Bureau of India",
        "Securities and Export Board of India",
        "Stock Exchange Board of India"
      ],
      "ans": 0,
      "cat": "Economy",
      "difficulty": "medium",
      "exp": "The correct option is \"Securities and Exchange Board of India\". In GK (Economy), \"Securities and Exchange Board of India\" directly satisfies the concept or fact asked in: What is the full form of SEBI?"
    },
    {
      "id": "gk-cur-282",
      "text": "In which sport is the term 'checkmate' used?",
      "opts": [
        "Carrom",
        "Chess",
        "Bridge",
        "Snooker"
      ],
      "ans": 1,
      "cat": "Sports",
      "difficulty": "easy",
      "exp": "The correct option is \"Chess\". In GK (Sports), \"Chess\" directly satisfies the concept or fact asked in: In which sport is the term 'checkmate' used?"
    },
    {
      "id": "gk-cur-283",
      "text": "Which country won the first Cricket World Cup, held in 1975?",
      "opts": [
        "Australia",
        "India",
        "West Indies",
        "England"
      ],
      "ans": 2,
      "cat": "Sports",
      "difficulty": "medium",
      "exp": "The correct option is \"West Indies\". In GK (Sports), \"West Indies\" directly satisfies the concept or fact asked in: Which country won the first Cricket World Cup, held in 1975?"
    },
    {
      "id": "gk-cur-284",
      "text": "Which sport uses a shuttlecock?",
      "opts": [
        "Tennis",
        "Squash",
        "Badminton",
        "Table tennis"
      ],
      "ans": 2,
      "cat": "Sports",
      "difficulty": "easy",
      "exp": "The correct option is \"Badminton\". In GK (Sports), \"Badminton\" directly satisfies the concept or fact asked in: Which sport uses a shuttlecock?"
    },
    {
      "id": "gk-cur-285",
      "text": "In which city were the 2020 Summer Olympics held (delayed to 2021)?",
      "opts": [
        "Rio de Janeiro",
        "Tokyo",
        "London",
        "Beijing"
      ],
      "ans": 1,
      "cat": "Sports",
      "difficulty": "medium",
      "exp": "The correct option is \"Tokyo\". In GK (Sports), \"Tokyo\" directly satisfies the concept or fact asked in: In which city were the 2020 Summer Olympics held (delayed to 2021)?"
    },
    {
      "id": "gk-cur-286",
      "text": "Which trophy is awarded to the winner of the FIFA World Cup?",
      "opts": [
        "Jules Rimet Trophy",
        "FIFA World Cup Trophy",
        "Champions Cup",
        "Golden Cup"
      ],
      "ans": 1,
      "cat": "Sports",
      "difficulty": "easy",
      "exp": "The correct option is \"FIFA World Cup Trophy\". In GK (Sports), \"FIFA World Cup Trophy\" directly satisfies the concept or fact asked in: Which trophy is awarded to the winner of the FIFA World Cup?"
    },
    {
      "id": "gk-cur-287",
      "text": "Which country has won the most FIFA World Cup titles as of 2022?",
      "opts": [
        "Germany",
        "Argentina",
        "Brazil",
        "Italy"
      ],
      "ans": 2,
      "cat": "Sports",
      "difficulty": "hard",
      "exp": "The correct option is \"Brazil\". In GK (Sports), \"Brazil\" directly satisfies the concept or fact asked in: Which country has won the most FIFA World Cup titles as of 2022?"
    },
    {
      "id": "gk-cur-288",
      "text": "What is the maximum possible score in a single game of ten-pin bowling?",
      "opts": [
        "200",
        "250",
        "300",
        "350"
      ],
      "ans": 2,
      "cat": "Sports",
      "difficulty": "easy",
      "exp": "The correct option is \"300\". In GK (Sports), \"300\" directly satisfies the concept or fact asked in: What is the maximum possible score in a single game of ten-pin bowling?"
    },
    {
      "id": "gk-cur-289",
      "text": "In golf, what is the term for completing a hole one stroke under par?",
      "opts": [
        "Bogey",
        "Eagle",
        "Birdie",
        "Albatross"
      ],
      "ans": 2,
      "cat": "Sports",
      "difficulty": "medium",
      "exp": "The correct option is \"Birdie\". In GK (Sports), \"Birdie\" directly satisfies the concept or fact asked in: In golf, what is the term for completing a hole one stroke under par?"
    },
    {
      "id": "gk-cur-290",
      "text": "Which Indian city hosted the 2010 Commonwealth Games?",
      "opts": [
        "Mumbai",
        "New Delhi",
        "Bengaluru",
        "Kolkata"
      ],
      "ans": 1,
      "cat": "Sports",
      "difficulty": "hard",
      "exp": "The correct option is \"New Delhi\". In GK (Sports), \"New Delhi\" directly satisfies the concept or fact asked in: Which Indian city hosted the 2010 Commonwealth Games?"
    },
    {
      "id": "gk-cur-291",
      "text": "In tennis, what term is used for a score of zero?",
      "opts": [
        "Nil",
        "Love",
        "Duck",
        "Zero"
      ],
      "ans": 1,
      "cat": "Sports",
      "difficulty": "medium",
      "exp": "The correct option is \"Love\". In GK (Sports), \"Love\" directly satisfies the concept or fact asked in: In tennis, what term is used for a score of zero?"
    },
    {
      "id": "gk-cur-292",
      "text": "What is the national tree of India?",
      "opts": [
        "Neem",
        "Banyan tree",
        "Peepal tree",
        "Mango tree"
      ],
      "ans": 1,
      "cat": "General",
      "difficulty": "hard",
      "exp": "The correct option is \"Banyan tree\". In GK (General), \"Banyan tree\" directly satisfies the concept or fact asked in: What is the national tree of India?"
    },
    {
      "id": "gk-cur-293",
      "text": "Which library is often cited as the largest library in the world by number of items?",
      "opts": [
        "British Library",
        "Library of Congress",
        "New York Public Library",
        "Bodleian Library"
      ],
      "ans": 1,
      "cat": "General",
      "difficulty": "easy",
      "exp": "The correct option is \"Library of Congress\". In GK (General), \"Library of Congress\" directly satisfies the concept or fact asked in: Which library is often cited as the largest library in the world by number of items?"
    },
    {
      "id": "gk-cur-294",
      "text": "What is the term for a person who studies stars, planets, and celestial phenomena?",
      "opts": [
        "Geologist",
        "Astronomer",
        "Meteorologist",
        "Biologist"
      ],
      "ans": 1,
      "cat": "General",
      "difficulty": "medium",
      "exp": "The correct option is \"Astronomer\". In GK (General), \"Astronomer\" directly satisfies the concept or fact asked in: What is the term for a person who studies stars, planets, and celestial phenomena?"
    },
    {
      "id": "gk-cur-295",
      "text": "Which language has the largest number of native speakers within India?",
      "opts": [
        "Bengali",
        "Tamil",
        "Hindi",
        "Telugu"
      ],
      "ans": 2,
      "cat": "General",
      "difficulty": "hard",
      "exp": "The correct option is \"Hindi\". In GK (General), \"Hindi\" directly satisfies the concept or fact asked in: Which language has the largest number of native speakers within India?"
    },
    {
      "id": "gk-cur-296",
      "text": "The Indian national emblem is derived from which historical monument?",
      "opts": [
        "Sanchi Stupa",
        "Lion Capital of Ashoka",
        "Red Fort",
        "Konark Sun Temple"
      ],
      "ans": 1,
      "cat": "General",
      "difficulty": "easy",
      "exp": "The correct option is \"Lion Capital of Ashoka\". In GK (General), \"Lion Capital of Ashoka\" directly satisfies the concept or fact asked in: The Indian national emblem is derived from which historical monument?"
    },
    {
      "id": "gk-cur-297",
      "text": "Which Indian city is popularly known as the 'Pink City'?",
      "opts": [
        "Udaipur",
        "Jodhpur",
        "Jaipur",
        "Jaisalmer"
      ],
      "ans": 2,
      "cat": "General",
      "difficulty": "medium",
      "exp": "The correct option is \"Jaipur\". In GK (General), \"Jaipur\" directly satisfies the concept or fact asked in: Which Indian city is popularly known as the 'Pink City'?"
    },
    {
      "id": "gk-cur-298",
      "text": "What is the scientific term for the classification of living organisms into groups?",
      "opts": [
        "Ecology",
        "Taxonomy",
        "Physiology",
        "Morphology"
      ],
      "ans": 1,
      "cat": "General",
      "difficulty": "hard",
      "exp": "The correct option is \"Taxonomy\". In GK (General), \"Taxonomy\" directly satisfies the concept or fact asked in: What is the scientific term for the classification of living organisms into groups?"
    },
    {
      "id": "gk-cur-299",
      "text": "Which of the following is one of the six official languages of the United Nations?",
      "opts": [
        "Hindi",
        "English",
        "Portuguese",
        "German"
      ],
      "ans": 1,
      "cat": "General",
      "difficulty": "easy",
      "exp": "The correct option is \"English\". In GK (General), \"English\" directly satisfies the concept or fact asked in: Which of the following is one of the six official languages of the United Nations?"
    },
    {
      "id": "gk-cur-300",
      "text": "Which sport is traditionally regarded as the national game of India?",
      "opts": [
        "Cricket",
        "Hockey",
        "Kabaddi",
        "Football"
      ],
      "ans": 1,
      "cat": "General",
      "difficulty": "medium",
      "exp": "The correct option is \"Hockey\". In GK (General), \"Hockey\" directly satisfies the concept or fact asked in: Which sport is traditionally regarded as the national game of India?"
    },
    {
      "id": "gk-cur-301",
      "text": "Which Indian city is known as the 'City of Nawabs'?",
      "opts": [
        "Bhopal",
        "Hyderabad",
        "Lucknow",
        "Rampur"
      ],
      "ans": 2,
      "cat": "General",
      "difficulty": "hard",
      "exp": "The correct option is \"Lucknow\". In GK (General), \"Lucknow\" directly satisfies the concept or fact asked in: Which Indian city is known as the 'City of Nawabs'?"
    },
    {
      "id": "gk-cur-302",
      "text": "Which lightweight gas is commonly used to fill balloons so they float in air?",
      "opts": [
        "Hydrogen",
        "Helium",
        "Nitrogen",
        "Oxygen"
      ],
      "ans": 1,
      "cat": "General",
      "difficulty": "easy",
      "exp": "The correct option is \"Helium\". In GK (General), \"Helium\" directly satisfies the concept or fact asked in: Which lightweight gas is commonly used to fill balloons so they float in air?"
    },
    {
      "id": "gk-cur-303",
      "text": "What is the official currency of India?",
      "opts": [
        "Indian Rupee",
        "Indian Dollar",
        "Indian Taka",
        "Indian Dinar"
      ],
      "ans": 0,
      "cat": "General",
      "difficulty": "medium",
      "exp": "The correct option is \"Indian Rupee\". In GK (General), \"Indian Rupee\" directly satisfies the concept or fact asked in: What is the official currency of India?"
    },
    {
      "id": "gk-cur-304",
      "text": "Which Indian city is known as the 'Manchester of India' for its textile industry?",
      "opts": [
        "Surat",
        "Ahmedabad",
        "Kanpur",
        "Coimbatore"
      ],
      "ans": 1,
      "cat": "General",
      "difficulty": "hard",
      "exp": "The correct option is \"Ahmedabad\". In GK (General), \"Ahmedabad\" directly satisfies the concept or fact asked in: Which Indian city is known as the 'Manchester of India' for its textile industry?"
    },
    {
      "id": "gk-cur-305",
      "text": "What is the term for the scientific study of ancient artifacts and structures?",
      "opts": [
        "Anthropology",
        "Archaeology",
        "Paleontology",
        "Ethnography"
      ],
      "ans": 1,
      "cat": "General",
      "difficulty": "easy",
      "exp": "The correct option is \"Archaeology\". In GK (General), \"Archaeology\" directly satisfies the concept or fact asked in: What is the term for the scientific study of ancient artifacts and structures?"
    },
    {
      "id": "gk-cur-306",
      "text": "What was the name of the first artificial satellite launched into space?",
      "opts": [
        "Explorer 1",
        "Sputnik 1",
        "Voyager 1",
        "Apollo 1"
      ],
      "ans": 1,
      "cat": "Space & Tech",
      "difficulty": "medium",
      "exp": "The correct option is \"Sputnik 1\". In GK (Space & Tech), \"Sputnik 1\" directly satisfies the concept or fact asked in: What was the name of the first artificial satellite launched into space?"
    },
    {
      "id": "gk-cur-307",
      "text": "What was the name of India's first satellite, launched in 1975?",
      "opts": [
        "Rohini",
        "Aryabhata",
        "Bhaskara",
        "INSAT-1A"
      ],
      "ans": 1,
      "cat": "Space & Tech",
      "difficulty": "hard",
      "exp": "The correct option is \"Aryabhata\". In GK (Space & Tech), \"Aryabhata\" directly satisfies the concept or fact asked in: What was the name of India's first satellite, launched in 1975?"
    },
    {
      "id": "gk-cur-308",
      "text": "What is the name of NASA's rover that landed on Mars in 2021?",
      "opts": [
        "Curiosity",
        "Opportunity",
        "Perseverance",
        "Spirit"
      ],
      "ans": 2,
      "cat": "Space & Tech",
      "difficulty": "easy",
      "exp": "The correct option is \"Perseverance\". In GK (Space & Tech), \"Perseverance\" directly satisfies the concept or fact asked in: What is the name of NASA's rover that landed on Mars in 2021?"
    },
    {
      "id": "gk-cur-309",
      "text": "Which Indian space mission was launched to study the Sun?",
      "opts": [
        "Chandrayaan-3",
        "Gaganyaan",
        "Aditya-L1",
        "Mangalyaan"
      ],
      "ans": 2,
      "cat": "Space & Tech",
      "difficulty": "medium",
      "exp": "The correct option is \"Aditya-L1\". In GK (Space & Tech), \"Aditya-L1\" directly satisfies the concept or fact asked in: Which Indian space mission was launched to study the Sun?"
    },
    {
      "id": "gk-cur-310",
      "text": "Which is the closest star to Earth, apart from the Sun?",
      "opts": [
        "Alpha Centauri A",
        "Proxima Centauri",
        "Sirius",
        "Betelgeuse"
      ],
      "ans": 1,
      "cat": "Space & Tech",
      "difficulty": "hard",
      "exp": "The correct option is \"Proxima Centauri\". In GK (Space & Tech), \"Proxima Centauri\" directly satisfies the concept or fact asked in: Which is the closest star to Earth, apart from the Sun?"
    },
    {
      "id": "gk-cur-311",
      "text": "Which agency oversees India's space program?",
      "opts": [
        "DRDO",
        "ISRO",
        "CSIR",
        "BARC"
      ],
      "ans": 1,
      "cat": "Space & Tech",
      "difficulty": "easy",
      "exp": "The correct option is \"ISRO\". In GK (Space & Tech), \"ISRO\" directly satisfies the concept or fact asked in: Which agency oversees India's space program?"
    },
    {
      "id": "gk-cur-312",
      "text": "What term describes a large system of stars, gas, and dust bound together by gravity?",
      "opts": [
        "Nebula",
        "Galaxy",
        "Constellation",
        "Solar system"
      ],
      "ans": 1,
      "cat": "Space & Tech",
      "difficulty": "medium",
      "exp": "The correct option is \"Galaxy\". In GK (Space & Tech), \"Galaxy\" directly satisfies the concept or fact asked in: What term describes a large system of stars, gas, and dust bound together by gravity?"
    },
    {
      "id": "gk-cur-313",
      "text": "Who was the first human to travel into space?",
      "opts": [
        "Neil Armstrong",
        "Yuri Gagarin",
        "Buzz Aldrin",
        "Alan Shepard"
      ],
      "ans": 1,
      "cat": "Space & Tech",
      "difficulty": "easy",
      "exp": "The correct option is \"Yuri Gagarin\". In GK (Space & Tech), \"Yuri Gagarin\" directly satisfies the concept or fact asked in: Who was the first human to travel into space?"
    },
    {
      "id": "gk-cur-314",
      "text": "Which private company developed the first reusable orbital-class rocket?",
      "opts": [
        "Blue Origin",
        "Virgin Galactic",
        "SpaceX",
        "Boeing"
      ],
      "ans": 2,
      "cat": "Space & Tech",
      "difficulty": "medium",
      "exp": "The correct option is \"SpaceX\". In GK (Space & Tech), \"SpaceX\" directly satisfies the concept or fact asked in: Which private company developed the first reusable orbital-class rocket?"
    },
    {
      "id": "gk-cur-315",
      "text": "What does 'GPS' stand for?",
      "opts": [
        "General Positioning System",
        "Global Positioning System",
        "Geo Positioning Satellite",
        "Global Position Service"
      ],
      "ans": 1,
      "cat": "Space & Tech",
      "difficulty": "hard",
      "exp": "The correct option is \"Global Positioning System\". In GK (Space & Tech), \"Global Positioning System\" directly satisfies the concept or fact asked in: What does 'GPS' stand for?"
    },
    {
      "id": "gk-cur-316",
      "text": "What is the name of India's planned human spaceflight mission?",
      "opts": [
        "Aditya-L1",
        "Chandrayaan",
        "Gaganyaan",
        "Mangalyaan"
      ],
      "ans": 2,
      "cat": "Space & Tech",
      "difficulty": "easy",
      "exp": "The correct option is \"Gaganyaan\". In GK (Space & Tech), \"Gaganyaan\" directly satisfies the concept or fact asked in: What is the name of India's planned human spaceflight mission?"
    },
    {
      "id": "gk-cur-317",
      "text": "Which space telescope, launched in 2021, succeeded the Hubble Space Telescope?",
      "opts": [
        "Kepler Telescope",
        "Spitzer Telescope",
        "James Webb Space Telescope",
        "Chandra X-ray Observatory"
      ],
      "ans": 2,
      "cat": "Space & Tech",
      "difficulty": "medium",
      "exp": "The correct option is \"James Webb Space Telescope\". In GK (Space & Tech), \"James Webb Space Telescope\" directly satisfies the concept or fact asked in: Which space telescope, launched in 2021, succeeded the Hubble Space Telescope?"
    },
    {
      "id": "gk-cur-318",
      "text": "Which planet has the shortest day (fastest rotation) in the solar system?",
      "opts": [
        "Earth",
        "Saturn",
        "Jupiter",
        "Mars"
      ],
      "ans": 2,
      "cat": "Space & Tech",
      "difficulty": "hard",
      "exp": "The correct option is \"Jupiter\". In GK (Space & Tech), \"Jupiter\" directly satisfies the concept or fact asked in: Which planet has the shortest day (fastest rotation) in the solar system?"
    },
    {
      "id": "gk-cur-319",
      "text": "Who was the first woman to travel into space?",
      "opts": [
        "Sally Ride",
        "Valentina Tereshkova",
        "Mae Jemison",
        "Kalpana Chawla"
      ],
      "ans": 1,
      "cat": "Space & Tech",
      "difficulty": "easy",
      "exp": "The correct option is \"Valentina Tereshkova\". In GK (Space & Tech), \"Valentina Tereshkova\" directly satisfies the concept or fact asked in: Who was the first woman to travel into space?"
    },
    {
      "id": "gk-cur-320",
      "text": "Which prestigious prize is awarded annually for outstanding contributions in fields like literature, peace, and science?",
      "opts": [
        "Pulitzer Prize",
        "Nobel Prize",
        "Booker Prize",
        "Grammy Award"
      ],
      "ans": 1,
      "cat": "Awards & Honours",
      "difficulty": "medium",
      "exp": "The correct option is \"Nobel Prize\". In GK (Awards & Honours), \"Nobel Prize\" directly satisfies the concept or fact asked in: Which prestigious prize is awarded annually for outstanding contributions in fields like literature, peace, and science?"
    },
    {
      "id": "gk-cur-321",
      "text": "Which is the highest award for lifetime achievement in Indian cinema?",
      "opts": [
        "National Film Award",
        "Filmfare Award",
        "Dadasaheb Phalke Award",
        "IIFA Award"
      ],
      "ans": 2,
      "cat": "Awards & Honours",
      "difficulty": "hard",
      "exp": "The correct option is \"Dadasaheb Phalke Award\". In GK (Awards & Honours), \"Dadasaheb Phalke Award\" directly satisfies the concept or fact asked in: Which is the highest award for lifetime achievement in Indian cinema?"
    },
    {
      "id": "gk-cur-322",
      "text": "Which award is popularly referred to as the 'Oscars of Bollywood'?",
      "opts": [
        "National Film Award",
        "Filmfare Awards",
        "IIFA Awards",
        "Screen Awards"
      ],
      "ans": 1,
      "cat": "Awards & Honours",
      "difficulty": "easy",
      "exp": "The correct option is \"Filmfare Awards\". In GK (Awards & Honours), \"Filmfare Awards\" directly satisfies the concept or fact asked in: Which award is popularly referred to as the 'Oscars of Bollywood'?"
    },
    {
      "id": "gk-cur-323",
      "text": "What is the highest military gallantry award in India?",
      "opts": [
        "Ashoka Chakra",
        "Vir Chakra",
        "Param Vir Chakra",
        "Maha Vir Chakra"
      ],
      "ans": 2,
      "cat": "Awards & Honours",
      "difficulty": "medium",
      "exp": "The correct option is \"Param Vir Chakra\". In GK (Awards & Honours), \"Param Vir Chakra\" directly satisfies the concept or fact asked in: What is the highest military gallantry award in India?"
    },
    {
      "id": "gk-cur-324",
      "text": "What is the highest sporting honour given by the Government of India?",
      "opts": [
        "Arjuna Award",
        "Padma Shri",
        "Major Dhyan Chand Khel Ratna Award",
        "Dronacharya Award"
      ],
      "ans": 2,
      "cat": "Awards & Honours",
      "difficulty": "hard",
      "exp": "The correct option is \"Major Dhyan Chand Khel Ratna Award\". In GK (Awards & Honours), \"Major Dhyan Chand Khel Ratna Award\" directly satisfies the concept or fact asked in: What is the highest sporting honour given by the Government of India?"
    },
    {
      "id": "gk-cur-325",
      "text": "Who was the first Indian-born woman to win a Nobel Prize?",
      "opts": [
        "Indira Gandhi",
        "Mother Teresa",
        "Kiran Bedi",
        "Kalpana Chawla"
      ],
      "ans": 1,
      "cat": "Awards & Honours",
      "difficulty": "easy",
      "exp": "The correct option is \"Mother Teresa\". In GK (Awards & Honours), \"Mother Teresa\" directly satisfies the concept or fact asked in: Who was the first Indian-born woman to win a Nobel Prize?"
    },
    {
      "id": "gk-cur-326",
      "text": "In which city is the Nobel Prize ceremony held for all categories except Peace?",
      "opts": [
        "Oslo",
        "Geneva",
        "Stockholm",
        "Copenhagen"
      ],
      "ans": 2,
      "cat": "Awards & Honours",
      "difficulty": "medium",
      "exp": "The correct option is \"Stockholm\". In GK (Awards & Honours), \"Stockholm\" directly satisfies the concept or fact asked in: In which city is the Nobel Prize ceremony held for all categories except Peace?"
    },
    {
      "id": "gk-cur-327",
      "text": "In which city is the Nobel Peace Prize awarded?",
      "opts": [
        "Stockholm",
        "Oslo",
        "Geneva",
        "Vienna"
      ],
      "ans": 1,
      "cat": "Awards & Honours",
      "difficulty": "hard",
      "exp": "The correct option is \"Oslo\". In GK (Awards & Honours), \"Oslo\" directly satisfies the concept or fact asked in: In which city is the Nobel Peace Prize awarded?"
    },
    {
      "id": "gk-cur-328",
      "text": "Which Indian economist won the Nobel Prize in Economics in 2019?",
      "opts": [
        "Amartya Sen",
        "Abhijit Banerjee",
        "Raghuram Rajan",
        "Kaushik Basu"
      ],
      "ans": 1,
      "cat": "Awards & Honours",
      "difficulty": "easy",
      "exp": "The correct option is \"Abhijit Banerjee\". In GK (Awards & Honours), \"Abhijit Banerjee\" directly satisfies the concept or fact asked in: Which Indian economist won the Nobel Prize in Economics in 2019?"
    },
    {
      "id": "gk-cur-329",
      "text": "Who is the author of the 'Harry Potter' book series?",
      "opts": [
        "J. R. R. Tolkien",
        "J. K. Rowling",
        "Roald Dahl",
        "C. S. Lewis"
      ],
      "ans": 1,
      "cat": "Books & Authors",
      "difficulty": "medium",
      "exp": "The correct option is \"J. K. Rowling\". In GK (Books & Authors), \"J. K. Rowling\" directly satisfies the concept or fact asked in: Who is the author of the 'Harry Potter' book series?"
    },
    {
      "id": "gk-cur-330",
      "text": "Who is traditionally credited as the author of the Indian epic 'Ramayana'?",
      "opts": [
        "Ved Vyasa",
        "Valmiki",
        "Kalidasa",
        "Tulsidas"
      ],
      "ans": 1,
      "cat": "Books & Authors",
      "difficulty": "hard",
      "exp": "The correct option is \"Valmiki\". In GK (Books & Authors), \"Valmiki\" directly satisfies the concept or fact asked in: Who is traditionally credited as the author of the Indian epic 'Ramayana'?"
    },
    {
      "id": "gk-cur-331",
      "text": "Who wrote the popular science book 'A Brief History of Time'?",
      "opts": [
        "Carl Sagan",
        "Stephen Hawking",
        "Richard Feynman",
        "Neil deGrasse Tyson"
      ],
      "ans": 1,
      "cat": "Books & Authors",
      "difficulty": "easy",
      "exp": "The correct option is \"Stephen Hawking\". In GK (Books & Authors), \"Stephen Hawking\" directly satisfies the concept or fact asked in: Who wrote the popular science book 'A Brief History of Time'?"
    },
    {
      "id": "gk-cur-332",
      "text": "Who is the author of 'Pride and Prejudice'?",
      "opts": [
        "Emily Bronte",
        "Charlotte Bronte",
        "Jane Austen",
        "Virginia Woolf"
      ],
      "ans": 2,
      "cat": "Books & Authors",
      "difficulty": "medium",
      "exp": "The correct option is \"Jane Austen\". In GK (Books & Authors), \"Jane Austen\" directly satisfies the concept or fact asked in: Who is the author of 'Pride and Prejudice'?"
    },
    {
      "id": "gk-cur-333",
      "text": "Who wrote 'On the Origin of Species'?",
      "opts": [
        "Gregor Mendel",
        "Charles Darwin",
        "Alfred Russel Wallace",
        "Thomas Huxley"
      ],
      "ans": 1,
      "cat": "Books & Authors",
      "difficulty": "hard",
      "exp": "The correct option is \"Charles Darwin\". In GK (Books & Authors), \"Charles Darwin\" directly satisfies the concept or fact asked in: Who wrote 'On the Origin of Species'?"
    },
    {
      "id": "gk-cur-334",
      "text": "Who wrote 'Gitanjali', for which he won the Nobel Prize in Literature?",
      "opts": [
        "Sarojini Naidu",
        "Rabindranath Tagore",
        "Bankim Chandra Chattopadhyay",
        "Munshi Premchand"
      ],
      "ans": 1,
      "cat": "Books & Authors",
      "difficulty": "easy",
      "exp": "The correct option is \"Rabindranath Tagore\". In GK (Books & Authors), \"Rabindranath Tagore\" directly satisfies the concept or fact asked in: Who wrote 'Gitanjali', for which he won the Nobel Prize in Literature?"
    },
    {
      "id": "gk-cur-335",
      "text": "Who wrote the novel 'War and Peace'?",
      "opts": [
        "Fyodor Dostoevsky",
        "Leo Tolstoy",
        "Anton Chekhov",
        "Ivan Turgenev"
      ],
      "ans": 1,
      "cat": "Books & Authors",
      "difficulty": "medium",
      "exp": "The correct option is \"Leo Tolstoy\". In GK (Books & Authors), \"Leo Tolstoy\" directly satisfies the concept or fact asked in: Who wrote the novel 'War and Peace'?"
    },
    {
      "id": "gk-cur-336",
      "text": "Who created the fictional detective Sherlock Holmes?",
      "opts": [
        "Agatha Christie",
        "Arthur Conan Doyle",
        "Edgar Allan Poe",
        "Wilkie Collins"
      ],
      "ans": 1,
      "cat": "Books & Authors",
      "difficulty": "hard",
      "exp": "The correct option is \"Arthur Conan Doyle\". In GK (Books & Authors), \"Arthur Conan Doyle\" directly satisfies the concept or fact asked in: Who created the fictional detective Sherlock Holmes?"
    },
    {
      "id": "gk-cur-337",
      "text": "Which classical Indian dance form originated in Tamil Nadu?",
      "opts": [
        "Kathak",
        "Bharatanatyam",
        "Odissi",
        "Manipuri"
      ],
      "ans": 1,
      "cat": "Art & Culture",
      "difficulty": "easy",
      "exp": "The correct option is \"Bharatanatyam\". In GK (Art & Culture), \"Bharatanatyam\" directly satisfies the concept or fact asked in: Which classical Indian dance form originated in Tamil Nadu?"
    },
    {
      "id": "gk-cur-338",
      "text": "Which traditional Indian string instrument is played with a bow?",
      "opts": [
        "Sitar",
        "Tabla",
        "Sarangi",
        "Flute"
      ],
      "ans": 2,
      "cat": "Art & Culture",
      "difficulty": "medium",
      "exp": "The correct option is \"Sarangi\". In GK (Art & Culture), \"Sarangi\" directly satisfies the concept or fact asked in: Which traditional Indian string instrument is played with a bow?"
    },
    {
      "id": "gk-cur-339",
      "text": "The Taj Mahal, a UNESCO World Heritage Site, is located in which Indian city?",
      "opts": [
        "Delhi",
        "Agra",
        "Jaipur",
        "Lucknow"
      ],
      "ans": 1,
      "cat": "Art & Culture",
      "difficulty": "hard",
      "exp": "The correct option is \"Agra\". In GK (Art & Culture), \"Agra\" directly satisfies the concept or fact asked in: The Taj Mahal, a UNESCO World Heritage Site, is located in which Indian city?"
    },
    {
      "id": "gk-cur-340",
      "text": "Which festival marks the harvest season in Punjab?",
      "opts": [
        "Onam",
        "Baisakhi",
        "Pongal",
        "Bihu"
      ],
      "ans": 1,
      "cat": "Art & Culture",
      "difficulty": "easy",
      "exp": "The correct option is \"Baisakhi\". In GK (Art & Culture), \"Baisakhi\" directly satisfies the concept or fact asked in: Which festival marks the harvest season in Punjab?"
    },
    {
      "id": "gk-cur-341",
      "text": "Which classical dance form from Kerala is known for elaborate makeup and costumes?",
      "opts": [
        "Kuchipudi",
        "Mohiniyattam",
        "Kathakali",
        "Bharatanatyam"
      ],
      "ans": 2,
      "cat": "Art & Culture",
      "difficulty": "medium",
      "exp": "The correct option is \"Kathakali\". In GK (Art & Culture), \"Kathakali\" directly satisfies the concept or fact asked in: Which classical dance form from Kerala is known for elaborate makeup and costumes?"
    },
    {
      "id": "gk-cur-342",
      "text": "The Taj Mahal is sometimes described by which nickname?",
      "opts": [
        "Jewel of the Desert",
        "Crown of Palaces",
        "Pearl of the East",
        "Garden of Eden"
      ],
      "ans": 1,
      "cat": "Art & Culture",
      "difficulty": "hard",
      "exp": "The correct option is \"Crown of Palaces\". In GK (Art & Culture), \"Crown of Palaces\" directly satisfies the concept or fact asked in: The Taj Mahal is sometimes described by which nickname?"
    },
    {
      "id": "gk-cur-343",
      "text": "Which classical Indian dance form originated in Odisha?",
      "opts": [
        "Odissi",
        "Kathak",
        "Sattriya",
        "Kuchipudi"
      ],
      "ans": 0,
      "cat": "Art & Culture",
      "difficulty": "easy",
      "exp": "The correct option is \"Odissi\". In GK (Art & Culture), \"Odissi\" directly satisfies the concept or fact asked in: Which classical Indian dance form originated in Odisha?"
    },
    {
      "id": "gk-cur-344",
      "text": "Which Indian musical instrument was famously played by Pandit Ravi Shankar?",
      "opts": [
        "Tabla",
        "Sitar",
        "Veena",
        "Santoor"
      ],
      "ans": 1,
      "cat": "Art & Culture",
      "difficulty": "medium",
      "exp": "The correct option is \"Sitar\". In GK (Art & Culture), \"Sitar\" directly satisfies the concept or fact asked in: Which Indian musical instrument was famously played by Pandit Ravi Shankar?"
    },
    {
      "id": "gk-cur-345",
      "text": "Which is considered the oldest of the four Vedas?",
      "opts": [
        "Yajurveda",
        "Samaveda",
        "Rigveda",
        "Atharvaveda"
      ],
      "ans": 2,
      "cat": "Art & Culture",
      "difficulty": "hard",
      "exp": "The correct option is \"Rigveda\". In GK (Art & Culture), \"Rigveda\" directly satisfies the concept or fact asked in: Which is considered the oldest of the four Vedas?"
    },
    {
      "id": "gk-cur-346",
      "text": "Which Rajasthani city is known for its annual camel fair?",
      "opts": [
        "Jodhpur",
        "Pushkar",
        "Bikaner",
        "Udaipur"
      ],
      "ans": 1,
      "cat": "Art & Culture",
      "difficulty": "easy",
      "exp": "The correct option is \"Pushkar\". In GK (Art & Culture), \"Pushkar\" directly satisfies the concept or fact asked in: Which Rajasthani city is known for its annual camel fair?"
    },
    {
      "id": "gk-cur-347",
      "text": "Which gas is primarily responsible for the greenhouse effect and global warming?",
      "opts": [
        "Oxygen",
        "Carbon dioxide",
        "Nitrogen",
        "Argon"
      ],
      "ans": 1,
      "cat": "Environment",
      "difficulty": "medium",
      "exp": "The correct option is \"Carbon dioxide\". In GK (Environment), \"Carbon dioxide\" directly satisfies the concept or fact asked in: Which gas is primarily responsible for the greenhouse effect and global warming?"
    },
    {
      "id": "gk-cur-348",
      "text": "What term describes the variety of plant and animal life in a particular habitat?",
      "opts": [
        "Ecosystem",
        "Biodiversity",
        "Biosphere",
        "Symbiosis"
      ],
      "ans": 1,
      "cat": "Environment",
      "difficulty": "hard",
      "exp": "The correct option is \"Biodiversity\". In GK (Environment), \"Biodiversity\" directly satisfies the concept or fact asked in: What term describes the variety of plant and animal life in a particular habitat?"
    },
    {
      "id": "gk-cur-349",
      "text": "Which layer of the atmosphere protects Earth from harmful ultraviolet radiation?",
      "opts": [
        "Troposphere",
        "Ozone layer",
        "Stratosphere clouds",
        "Mesosphere"
      ],
      "ans": 1,
      "cat": "Environment",
      "difficulty": "easy",
      "exp": "The correct option is \"Ozone layer\". In GK (Environment), \"Ozone layer\" directly satisfies the concept or fact asked in: Which layer of the atmosphere protects Earth from harmful ultraviolet radiation?"
    },
    {
      "id": "gk-cur-350",
      "text": "Which international agreement, adopted in 2015, aims to limit global warming?",
      "opts": [
        "Kyoto Protocol",
        "Montreal Protocol",
        "Paris Agreement",
        "Basel Convention"
      ],
      "ans": 2,
      "cat": "Environment",
      "difficulty": "medium",
      "exp": "The correct option is \"Paris Agreement\". In GK (Environment), \"Paris Agreement\" directly satisfies the concept or fact asked in: Which international agreement, adopted in 2015, aims to limit global warming?"
    },
    {
      "id": "gk-cur-351",
      "text": "What is the process of planting trees to restore or create a forest called?",
      "opts": [
        "Deforestation",
        "Afforestation",
        "Desertification",
        "Urbanization"
      ],
      "ans": 1,
      "cat": "Environment",
      "difficulty": "hard",
      "exp": "The correct option is \"Afforestation\". In GK (Environment), \"Afforestation\" directly satisfies the concept or fact asked in: What is the process of planting trees to restore or create a forest called?"
    },
    {
      "id": "gk-cur-352",
      "text": "Which renewable energy source directly harnesses the power of sunlight?",
      "opts": [
        "Wind energy",
        "Solar energy",
        "Tidal energy",
        "Geothermal energy"
      ],
      "ans": 1,
      "cat": "Environment",
      "difficulty": "easy",
      "exp": "The correct option is \"Solar energy\". In GK (Environment), \"Solar energy\" directly satisfies the concept or fact asked in: Which renewable energy source directly harnesses the power of sunlight?"
    },
    {
      "id": "gk-cur-353",
      "text": "What term describes waste that can be broken down naturally by living organisms?",
      "opts": [
        "Non-biodegradable waste",
        "Biodegradable waste",
        "Hazardous waste",
        "Inert waste"
      ],
      "ans": 1,
      "cat": "Environment",
      "difficulty": "medium",
      "exp": "The correct option is \"Biodegradable waste\". In GK (Environment), \"Biodegradable waste\" directly satisfies the concept or fact asked in: What term describes waste that can be broken down naturally by living organisms?"
    },
    {
      "id": "gk-cur-354",
      "text": "On which date is Earth Day observed globally?",
      "opts": [
        "April 22",
        "June 5",
        "March 21",
        "October 2"
      ],
      "ans": 0,
      "cat": "Environment",
      "difficulty": "hard",
      "exp": "The correct option is \"April 22\". In GK (Environment), \"April 22\" directly satisfies the concept or fact asked in: On which date is Earth Day observed globally?"
    },
    {
      "id": "gk-cur-355",
      "text": "Which Indian government programme was launched to clean and conserve the Ganga river?",
      "opts": [
        "Jal Jeevan Mission",
        "Namami Gange",
        "Swachh Bharat",
        "Clean India Mission"
      ],
      "ans": 1,
      "cat": "Environment",
      "difficulty": "easy",
      "exp": "The correct option is \"Namami Gange\". In GK (Environment), \"Namami Gange\" directly satisfies the concept or fact asked in: Which Indian government programme was launched to clean and conserve the Ganga river?"
    },
    {
      "id": "gk-cur-356",
      "text": "What term describes a region characterized by very low rainfall and sparse vegetation?",
      "opts": [
        "Grassland",
        "Desert",
        "Wetland",
        "Tundra"
      ],
      "ans": 1,
      "cat": "Environment",
      "difficulty": "medium",
      "exp": "The correct option is \"Desert\". In GK (Environment), \"Desert\" directly satisfies the concept or fact asked in: What term describes a region characterized by very low rainfall and sparse vegetation?"
    },
    {
      "id": "gk-cur-357",
      "text": "What does 'CPU' stand for?",
      "opts": [
        "Central Processing Unit",
        "Computer Personal Unit",
        "Central Program Utility",
        "Core Processing Unit"
      ],
      "ans": 0,
      "cat": "Computers & Tech",
      "difficulty": "hard",
      "exp": "The correct option is \"Central Processing Unit\". In GK (Computers & Tech), \"Central Processing Unit\" directly satisfies the concept or fact asked in: What does 'CPU' stand for?"
    },
    {
      "id": "gk-cur-358",
      "text": "Which company developed the Android operating system?",
      "opts": [
        "Apple",
        "Microsoft",
        "Google",
        "Samsung"
      ],
      "ans": 2,
      "cat": "Computers & Tech",
      "difficulty": "easy",
      "exp": "The correct option is \"Google\". In GK (Computers & Tech), \"Google\" directly satisfies the concept or fact asked in: Which company developed the Android operating system?"
    },
    {
      "id": "gk-cur-359",
      "text": "What does 'HTTP' stand for?",
      "opts": [
        "HyperText Transfer Protocol",
        "High Transfer Text Protocol",
        "HyperText Technical Process",
        "Home Text Transfer Protocol"
      ],
      "ans": 0,
      "cat": "Computers & Tech",
      "difficulty": "medium",
      "exp": "The correct option is \"HyperText Transfer Protocol\". In GK (Computers & Tech), \"HyperText Transfer Protocol\" directly satisfies the concept or fact asked in: What does 'HTTP' stand for?"
    },
    {
      "id": "gk-cur-360",
      "text": "What is the full form of 'RAM' in computing?",
      "opts": [
        "Random Access Memory",
        "Read Access Memory",
        "Rapid Access Module",
        "Run Access Memory"
      ],
      "ans": 0,
      "cat": "Computers & Tech",
      "difficulty": "hard",
      "exp": "The correct option is \"Random Access Memory\". In GK (Computers & Tech), \"Random Access Memory\" directly satisfies the concept or fact asked in: What is the full form of 'RAM' in computing?"
    },
    {
      "id": "gk-cur-361",
      "text": "Who is often regarded as the 'father of the modern computer' for his early mechanical designs?",
      "opts": [
        "Alan Turing",
        "Charles Babbage",
        "John von Neumann",
        "Ada Lovelace"
      ],
      "ans": 1,
      "cat": "Computers & Tech",
      "difficulty": "easy",
      "exp": "The correct option is \"Charles Babbage\". In GK (Computers & Tech), \"Charles Babbage\" directly satisfies the concept or fact asked in: Who is often regarded as the 'father of the modern computer' for his early mechanical designs?"
    },
    {
      "id": "gk-cur-362",
      "text": "What does 'URL' stand for?",
      "opts": [
        "Universal Resource Link",
        "Uniform Resource Locator",
        "United Resource Locator",
        "Unified Reference Link"
      ],
      "ans": 1,
      "cat": "Computers & Tech",
      "difficulty": "medium",
      "exp": "The correct option is \"Uniform Resource Locator\". In GK (Computers & Tech), \"Uniform Resource Locator\" directly satisfies the concept or fact asked in: What does 'URL' stand for?"
    },
    {
      "id": "gk-cur-363",
      "text": "What does 'USB' stand for?",
      "opts": [
        "Universal Serial Bus",
        "United System Bus",
        "Universal System Board",
        "Unified Serial Bus"
      ],
      "ans": 0,
      "cat": "Computers & Tech",
      "difficulty": "hard",
      "exp": "The correct option is \"Universal Serial Bus\". In GK (Computers & Tech), \"Universal Serial Bus\" directly satisfies the concept or fact asked in: What does 'USB' stand for?"
    },
    {
      "id": "gk-cur-364",
      "text": "What is the full form of 'PDF'?",
      "opts": [
        "Personal Document File",
        "Portable Document Format",
        "Public Data File",
        "Printed Document Format"
      ],
      "ans": 1,
      "cat": "Computers & Tech",
      "difficulty": "easy",
      "exp": "The correct option is \"Portable Document Format\". In GK (Computers & Tech), \"Portable Document Format\" directly satisfies the concept or fact asked in: What is the full form of 'PDF'?"
    },
    {
      "id": "gk-cur-365",
      "text": "Which popular programming language, widely used in data science, is named after a British comedy show?",
      "opts": [
        "Java",
        "Python",
        "Ruby",
        "Perl"
      ],
      "ans": 1,
      "cat": "Computers & Tech",
      "difficulty": "medium",
      "exp": "The correct option is \"Python\". In GK (Computers & Tech), \"Python\" directly satisfies the concept or fact asked in: Which popular programming language, widely used in data science, is named after a British comedy show?"
    },
    {
      "id": "gk-cur-366",
      "text": "What does the term 'Wi-Fi' commonly refer to?",
      "opts": [
        "Wireless Fidelity",
        "Wired Frequency",
        "Wireless File",
        "Wide Field Internet"
      ],
      "ans": 0,
      "cat": "Computers & Tech",
      "difficulty": "hard",
      "exp": "The correct option is \"Wireless Fidelity\". In GK (Computers & Tech), \"Wireless Fidelity\" directly satisfies the concept or fact asked in: What does the term 'Wi-Fi' commonly refer to?"
    },
    {
      "id": "gk-cur-367",
      "text": "Where is the headquarters of the United Nations located?",
      "opts": [
        "Geneva",
        "New York",
        "Paris",
        "Brussels"
      ],
      "ans": 1,
      "cat": "World Organizations",
      "difficulty": "easy",
      "exp": "The correct option is \"New York\". In GK (World Organizations), \"New York\" directly satisfies the concept or fact asked in: Where is the headquarters of the United Nations located?"
    },
    {
      "id": "gk-cur-368",
      "text": "What does 'UNESCO' stand for?",
      "opts": [
        "United Nations Educational, Scientific and Cultural Organization",
        "United Nations Economic and Social Council",
        "United Nations Environmental and Scientific Cooperation Office",
        "United Nations Educational and Social Council"
      ],
      "ans": 0,
      "cat": "World Organizations",
      "difficulty": "medium",
      "exp": "The correct option is \"United Nations Educational, Scientific and Cultural Organization\". In GK (World Organizations), \"United Nations Educational, Scientific and Cultural Organization\" directly satisfies the concept or fact asked in: What does 'UNESCO' stand for?"
    },
    {
      "id": "gk-cur-369",
      "text": "How many permanent members does the UN Security Council have?",
      "opts": [
        "3",
        "4",
        "5",
        "6"
      ],
      "ans": 2,
      "cat": "World Organizations",
      "difficulty": "hard",
      "exp": "The correct option is \"5\". In GK (World Organizations), \"5\" directly satisfies the concept or fact asked in: How many permanent members does the UN Security Council have?"
    },
    {
      "id": "gk-cur-370",
      "text": "What does 'NATO' stand for?",
      "opts": [
        "North Atlantic Treaty Organization",
        "North American Trade Organization",
        "National Alliance Treaty Organization",
        "New Atlantic Trade Organization"
      ],
      "ans": 0,
      "cat": "World Organizations",
      "difficulty": "easy",
      "exp": "The correct option is \"North Atlantic Treaty Organization\". In GK (World Organizations), \"North Atlantic Treaty Organization\" directly satisfies the concept or fact asked in: What does 'NATO' stand for?"
    },
    {
      "id": "gk-cur-371",
      "text": "Which organization sets and enforces rules for international trade?",
      "opts": [
        "IMF",
        "World Bank",
        "World Trade Organization",
        "UNCTAD"
      ],
      "ans": 2,
      "cat": "World Organizations",
      "difficulty": "medium",
      "exp": "The correct option is \"World Trade Organization\". In GK (World Organizations), \"World Trade Organization\" directly satisfies the concept or fact asked in: Which organization sets and enforces rules for international trade?"
    },
    {
      "id": "gk-cur-372",
      "text": "Where is the headquarters of the International Monetary Fund (IMF) located?",
      "opts": [
        "New York",
        "Washington, D.C.",
        "London",
        "Geneva"
      ],
      "ans": 1,
      "cat": "World Organizations",
      "difficulty": "hard",
      "exp": "The correct option is \"Washington, D.C.\". In GK (World Organizations), \"Washington, D.C.\" directly satisfies the concept or fact asked in: Where is the headquarters of the International Monetary Fund (IMF) located?"
    },
    {
      "id": "gk-cur-373",
      "text": "What does 'SAARC' stand for?",
      "opts": [
        "South Asian Association for Regional Cooperation",
        "South African Association for Regional Cooperation",
        "South Asian Alliance for Regional Cooperation",
        "Southeast Asian Association for Regional Cooperation"
      ],
      "ans": 0,
      "cat": "World Organizations",
      "difficulty": "easy",
      "exp": "The correct option is \"South Asian Association for Regional Cooperation\". In GK (World Organizations), \"South Asian Association for Regional Cooperation\" directly satisfies the concept or fact asked in: What does 'SAARC' stand for?"
    },
    {
      "id": "gk-cur-374",
      "text": "Which organization is responsible for selecting host cities for the Olympic Games?",
      "opts": [
        "FIFA",
        "International Olympic Committee",
        "United Nations",
        "World Athletics"
      ],
      "ans": 1,
      "cat": "World Organizations",
      "difficulty": "medium",
      "exp": "The correct option is \"International Olympic Committee\". In GK (World Organizations), \"International Olympic Committee\" directly satisfies the concept or fact asked in: Which organization is responsible for selecting host cities for the Olympic Games?"
    },
    {
      "id": "gk-cur-375",
      "text": "Where is the headquarters of Interpol located?",
      "opts": [
        "Geneva, Switzerland",
        "The Hague, Netherlands",
        "Lyon, France",
        "Brussels, Belgium"
      ],
      "ans": 2,
      "cat": "World Organizations",
      "difficulty": "hard",
      "exp": "The correct option is \"Lyon, France\". In GK (World Organizations), \"Lyon, France\" directly satisfies the concept or fact asked in: Where is the headquarters of Interpol located?"
    }
  ],
  "neet": [
    {
      "id": "neet-cur-1",
      "text": "Which organelle is known as the powerhouse of the eukaryotic cell due to oxidative phosphorylation?",
      "opts": [
        "Ribosome",
        "Mitochondria",
        "Golgi apparatus",
        "Lysosome"
      ],
      "ans": 1,
      "cat": "Cell Biology",
      "difficulty": "easy",
      "exp": "Mitochondria generate the majority of cellular ATP via the Krebs cycle and oxidative phosphorylation across the inner mitochondrial membrane."
    },
    {
      "id": "neet-cur-2",
      "text": "What is the structural and functional filtration unit of the mammalian kidney?",
      "opts": [
        "Nephron",
        "Neuron",
        "Alveolus",
        "Sarcomere"
      ],
      "ans": 0,
      "cat": "Human Physiology",
      "difficulty": "medium",
      "exp": "Each kidney contains roughly one million nephrons, consisting of a glomerulus, Bowman's capsule, and renal tubule."
    },
    {
      "id": "neet-cur-3",
      "text": "DNA replication in both prokaryotes and eukaryotes follows which mechanism?",
      "opts": [
        "Conservative",
        "Semi-conservative",
        "Dispersive",
        "Random"
      ],
      "ans": 1,
      "cat": "Genetics & Molecular Biology",
      "difficulty": "hard",
      "exp": "Proved by Meselson and Stahl (1958), each daughter DNA molecule retains one parental strand and synthesizes one new complementary strand."
    },
    {
      "id": "neet-cur-4",
      "text": "Which pancreatic hormone lowers blood glucose levels by promoting cellular glucose uptake and glycogenesis?",
      "opts": [
        "Glucagon",
        "Insulin",
        "Adrenaline",
        "Cortisol"
      ],
      "ans": 1,
      "cat": "Genetics & Molecular Biology",
      "difficulty": "easy",
      "exp": "Secreted by beta cells of the Islets of Langerhans, insulin stimulates GLUT4 translocation and glycogen synthesis in liver and muscle."
    },
    {
      "id": "neet-cur-5",
      "text": "Which of the following is a non-membrane-bound organelle found in both prokaryotic (70S) and eukaryotic (80S) cells?",
      "opts": [
        "Mitochondria",
        "Ribosome",
        "Lysosome",
        "Chloroplast"
      ],
      "ans": 1,
      "cat": "Cell Biology",
      "difficulty": "medium",
      "exp": "Ribosomes are ribonucleoprotein complexes lacking a lipid bilayer membrane, present in all living cells for translation."
    },
    {
      "id": "neet-cur-6",
      "text": "Which nitrogenous base is present in RNA but replaced by Thymine in DNA?",
      "opts": [
        "Adenine",
        "Uracil",
        "Guanine",
        "Cytosine"
      ],
      "ans": 1,
      "cat": "Genetics & Molecular Biology",
      "difficulty": "hard",
      "exp": "RNA uses Uracil (U) to base-pair with Adenine, whereas DNA uses 5-methyluracil (Thymine, T) for greater chemical stability."
    },
    {
      "id": "neet-cur-7",
      "text": "In vascular plants, xylem tissue is primarily responsible for the unidirectional transport of:",
      "opts": [
        "Sucrose and amino acids",
        "Water and dissolved mineral ions",
        "Plant hormones only",
        "Oxygen gas"
      ],
      "ans": 1,
      "cat": "Plant Physiology",
      "difficulty": "easy",
      "exp": "Xylem vessels and tracheids conduct water and dissolved minerals upward from roots to shoots driven by transpirational pull."
    },
    {
      "id": "neet-cur-8",
      "text": "Where in the cell do the reactions of the Tricarboxylic Acid (Krebs) cycle occur in eukaryotes?",
      "opts": [
        "Cytosol",
        "Nucleoplasm",
        "Mitochondrial matrix",
        "Thylakoid lumen"
      ],
      "ans": 2,
      "cat": "Cell Biology",
      "difficulty": "medium",
      "exp": "All enzymes of the Krebs cycle (except succinate dehydrogenase on the inner membrane) are localized in the mitochondrial matrix."
    },
    {
      "id": "neet-cur-9",
      "text": "How many haploid daughter cells are produced at the end of meiosis from a single diploid meiocyte?",
      "opts": [
        "2 diploid cells",
        "2 haploid cells",
        "4 haploid cells",
        "4 diploid cells"
      ],
      "ans": 2,
      "cat": "Genetics & Molecular Biology",
      "difficulty": "hard",
      "exp": "Meiosis involves one round of DNA replication followed by two sequential nuclear divisions (Meiosis I and II), yielding 4 genetically distinct haploid cells."
    },
    {
      "id": "neet-cur-10",
      "text": "Colostrum (mother's first milk) provides the newborn with IgA antibodies, which is an example of:",
      "opts": [
        "Naturally acquired active immunity",
        "Naturally acquired passive immunity",
        "Artificially acquired active immunity",
        "Artificially acquired passive immunity"
      ],
      "ans": 1,
      "cat": "Biology & Biochemistry",
      "difficulty": "easy",
      "exp": "Because ready-made maternal IgA antibodies are transferred naturally without the infant's immune system generating them, it is natural passive immunity."
    },
    {
      "id": "neet-cur-11",
      "text": "Which blood cells are primarily responsible for fighting infection?",
      "opts": [
        "Red blood cells",
        "White blood cells",
        "Platelets",
        "Plasma cells"
      ],
      "ans": 1,
      "cat": "Cell Biology",
      "difficulty": "medium",
      "exp": "The correct option is \"White blood cells\". In NEET (Cell Biology), \"White blood cells\" directly satisfies the concept or fact asked in: Which blood cells are primarily responsible for fighting infection?"
    },
    {
      "id": "neet-cur-12",
      "text": "The process by which plants lose water vapor through stomata is called:",
      "opts": [
        "Respiration",
        "Transpiration",
        "Photosynthesis",
        "Guttation"
      ],
      "ans": 1,
      "cat": "Plant Physiology",
      "difficulty": "hard",
      "exp": "The correct option is \"Transpiration\". In NEET (Plant Physiology), \"Transpiration\" directly satisfies the concept or fact asked in: The process by which plants lose water vapor through stomata is called:"
    },
    {
      "id": "neet-cur-13",
      "text": "In humans, the normal diploid chromosome number is:",
      "opts": [
        "44",
        "46",
        "48",
        "23"
      ],
      "ans": 1,
      "cat": "Genetics & Molecular Biology",
      "difficulty": "easy",
      "exp": "The correct option is \"46\". In NEET (Genetics & Molecular Biology), \"46\" directly satisfies the concept or fact asked in: In humans, the normal diploid chromosome number is:"
    },
    {
      "id": "neet-cur-14",
      "text": "Photosynthesis in plants primarily occurs in which organelle?",
      "opts": [
        "Mitochondria",
        "Nucleus",
        "Chloroplast",
        "Vacuole"
      ],
      "ans": 2,
      "cat": "Cell Biology",
      "difficulty": "medium",
      "exp": "The correct option is \"Chloroplast\". In NEET (Cell Biology), \"Chloroplast\" directly satisfies the concept or fact asked in: Photosynthesis in plants primarily occurs in which organelle?"
    },
    {
      "id": "neet-cur-15",
      "text": "Which of these enzymes helps digest starch in the mouth?",
      "opts": [
        "Pepsin",
        "Salivary amylase",
        "Trypsin",
        "Lipase"
      ],
      "ans": 1,
      "cat": "Biology & Biochemistry",
      "difficulty": "hard",
      "exp": "The correct option is \"Salivary amylase\". In NEET (Biology & Biochemistry), \"Salivary amylase\" directly satisfies the concept or fact asked in: Which of these enzymes helps digest starch in the mouth?"
    },
    {
      "id": "neet-cur-16",
      "text": "The pH of human blood is normally maintained around:",
      "opts": [
        "6.4",
        "7.0",
        "7.4",
        "8.0"
      ],
      "ans": 2,
      "cat": "Human Physiology",
      "difficulty": "easy",
      "exp": "The correct option is \"7.4\". In NEET (Human Physiology), \"7.4\" directly satisfies the concept or fact asked in: The pH of human blood is normally maintained around:"
    },
    {
      "id": "neet-cur-17",
      "text": "Which part of the brain controls balance and coordination?",
      "opts": [
        "Cerebrum",
        "Cerebellum",
        "Medulla oblongata",
        "Hypothalamus"
      ],
      "ans": 1,
      "cat": "Human Physiology",
      "difficulty": "medium",
      "exp": "The correct option is \"Cerebellum\". In NEET (Human Physiology), \"Cerebellum\" directly satisfies the concept or fact asked in: Which part of the brain controls balance and coordination?"
    },
    {
      "id": "neet-cur-18",
      "text": "Which vitamin acts as a coenzyme and is needed for blood clotting?",
      "opts": [
        "Vitamin A",
        "Vitamin C",
        "Vitamin K",
        "Vitamin E"
      ],
      "ans": 2,
      "cat": "Human Physiology",
      "difficulty": "hard",
      "exp": "The correct option is \"Vitamin K\". In NEET (Human Physiology), \"Vitamin K\" directly satisfies the concept or fact asked in: Which vitamin acts as a coenzyme and is needed for blood clotting?"
    },
    {
      "id": "neet-cur-19",
      "text": "Which of these organisms is used as a model organism in classical genetics?",
      "opts": [
        "E. coli",
        "Drosophila melanogaster",
        "Paramecium",
        "Amoeba"
      ],
      "ans": 1,
      "cat": "Genetics & Molecular Biology",
      "difficulty": "easy",
      "exp": "The correct option is \"Drosophila melanogaster\". In NEET (Genetics & Molecular Biology), \"Drosophila melanogaster\" directly satisfies the concept or fact asked in: Which of these organisms is used as a model organism in classical genetics?"
    },
    {
      "id": "neet-cur-20",
      "text": "The exchange of gases in human lungs occurs in the:",
      "opts": [
        "Bronchi",
        "Trachea",
        "Alveoli",
        "Larynx"
      ],
      "ans": 2,
      "cat": "Biology & Biochemistry",
      "difficulty": "medium",
      "exp": "The correct option is \"Alveoli\". In NEET (Biology & Biochemistry), \"Alveoli\" directly satisfies the concept or fact asked in: The exchange of gases in human lungs occurs in the:"
    },
    {
      "text": "Which human blood group is known as the universal recipient because it lacks anti-A and anti-B antibodies in plasma?",
      "opts": [
        "O negative",
        "AB positive",
        "A positive",
        "B negative"
      ],
      "ans": 1,
      "cat": "Human Physiology",
      "difficulty": "easy",
      "exp": "AB+ individuals express A, B, and RhD antigens on RBCs and have neither anti-A nor anti-B plasma antibodies, allowing them to receive RBCs from any group.",
      "id": "neet-cur-21"
    },
    {
      "text": "What is the normal pacemaker of the human heart that initiates the cardiac action potential?",
      "opts": [
        "Atrioventricular (AV) node",
        "Sinoatrial (SA) node",
        "Bundle of His",
        "Purkinje fibers"
      ],
      "ans": 1,
      "cat": "Human Physiology",
      "difficulty": "easy",
      "exp": "The Sinoatrial (SA) node in the right upper atrium generates impulses at 70–75 beats/min, setting the sinus rhythm of the heart.",
      "id": "neet-cur-22"
    },
    {
      "text": "During C4 photosynthesis (Hatch-Slack pathway), which enzyme catalyzes the primary fixation of CO₂ in mesophyll cells?",
      "opts": [
        "RuBisCO",
        "PEP carboxylase (PEPCase)",
        "Carbonic anhydrase",
        "Pyruvate kinase"
      ],
      "ans": 1,
      "cat": "Plant Physiology",
      "difficulty": "hard",
      "exp": "Phosphoenolpyruvate carboxylase (PEPCase) fixes HCO₃⁻ with PEP to form oxaloacetate (OAA, a 4-carbon acid) in mesophyll cells without oxygenase activity.",
      "id": "neet-cur-23"
    },
    {
      "text": "Which immunoglobulin class is a pentamer and is the first antibody produced during a primary immune response?",
      "opts": [
        "IgG",
        "IgM",
        "IgA",
        "IgE"
      ],
      "ans": 1,
      "cat": "Human Physiology",
      "difficulty": "medium",
      "exp": "IgM circulates as a J-chain-linked pentamer with 10 antigen-binding sites and is the earliest antibody secreted in primary humoral immunity.",
      "id": "neet-cur-24"
    },
    {
      "text": "Which type of ecological pyramid is ALWAYS upright in any ecosystem?",
      "opts": [
        "Pyramid of numbers",
        "Pyramid of biomass",
        "Pyramid of energy",
        "Aquatic biomass pyramid"
      ],
      "ans": 2,
      "cat": "Ecology",
      "difficulty": "easy",
      "exp": "By the Second Law of Thermodynamics and Lindeman’s 10% law, energy is lost as heat at every trophic transfer, so the pyramid of energy is never inverted.",
      "id": "neet-cur-25"
    },
    {
      "text": "Which restriction endonuclease was the first type II restriction enzyme discovered and recognizes a 6-bp palindromic sequence?",
      "opts": [
        "EcoRI",
        "HindII",
        "Taq polymerase",
        "DNA ligase"
      ],
      "ans": 1,
      "cat": "Biotechnology",
      "difficulty": "medium",
      "exp": "HindII, isolated from Haemophilus influenzae Rd by Smith, Wilcox, and Kelley, was the first Type II restriction endonuclease characterized.",
      "id": "neet-cur-26"
    },
    {
      "text": "In the lac operon of E. coli, what is the role of allolactose?",
      "opts": [
        "Corepressor that activates the repressor",
        "Inducer that binds and inactivates the lac repressor protein",
        "Structural enzyme that cleaves lactose",
        "Promoter sequence for RNA polymerase"
      ],
      "ans": 1,
      "cat": "Genetics & Molecular Biology",
      "difficulty": "medium",
      "exp": "Allolactose binds to the lacI repressor, causing an allosteric conformational change that prevents it from binding the operator, allowing transcription.",
      "id": "neet-cur-27"
    },
    {
      "text": "Which plant phytohormone is a gaseous hydrocarbon responsible for fruit ripening and triple response in seedlings?",
      "opts": [
        "Auxin (IAA)",
        "Gibberellic acid (GA₃)",
        "Ethylene (C₂H₄)",
        "Abscisic acid (ABA)"
      ],
      "ans": 2,
      "cat": "Plant Physiology",
      "difficulty": "easy",
      "exp": "Ethylene (C₂H₄) is a gaseous plant hormone that triggers climacteric respiration and cell-wall softening during fruit ripening.",
      "id": "neet-cur-28"
    },
    {
      "text": "Which syndrome is caused by trisomy of chromosome 21 (47, XX/XY, +21)?",
      "opts": [
        "Turner syndrome",
        "Klinefelter syndrome",
        "Down syndrome",
        "Edward syndrome"
      ],
      "ans": 2,
      "cat": "Genetics & Molecular Biology",
      "difficulty": "easy",
      "exp": "Down syndrome results from non-disjunction of chromosome 21 during meiosis, giving three copies of chromosome 21.",
      "id": "neet-cur-29"
    },
    {
      "text": "In which stage of Prophase I of meiosis does crossing over (recombination) between non-sister chromatids occur?",
      "opts": [
        "Leptotene",
        "Zygotene",
        "Pachytene",
        "Diakinesis"
      ],
      "ans": 2,
      "cat": "Cell Biology",
      "difficulty": "medium",
      "exp": "During Pachytene, recombination nodules form on synapsed homologous bivalents and recombinase mediates crossing over between non-sister chromatids.",
      "id": "neet-cur-30"
    },
    {
      "text": "What is the coordination number and oxidation state of cobalt in the complex [Co(NH₃)₆]Cl₃?",
      "opts": [
        "Coordination number 6, oxidation state +3",
        "Coordination number 3, oxidation state +6",
        "Coordination number 6, oxidation state +2",
        "Coordination number 4, oxidation state +3"
      ],
      "ans": 0,
      "cat": "Chemistry",
      "difficulty": "medium",
      "exp": "Six monodentate NH₃ ligands give coordination number 6; balancing three Cl⁻ counterions gives Co oxidation state +3.",
      "id": "neet-cur-31"
    },
    {
      "text": "According to VSEPR theory, what is the molecular shape of XeF₄?",
      "opts": [
        "Tetrahedral",
        "See-saw",
        "Square planar",
        "Octahedral"
      ],
      "ans": 2,
      "cat": "Chemistry",
      "difficulty": "hard",
      "exp": "Xenon in XeF₄ has 4 bonding pairs and 2 lone pairs (sp³d², steric number 6); the two lone pairs occupy trans axial positions, leaving a square planar molecular geometry.",
      "id": "neet-cur-32"
    },
    {
      "text": "Which cranial nerve is the longest autonomic (parasympathetic) nerve innervating the heart, lungs, and digestive tract?",
      "opts": [
        "Optic nerve (II)",
        "Trigeminal nerve (V)",
        "Vagus nerve (X)",
        "Hypoglossal nerve (XII)"
      ],
      "ans": 2,
      "cat": "Human Physiology",
      "difficulty": "medium",
      "exp": "The Vagus nerve (Cranial Nerve X) provides major parasympathetic innervation to thoracic and abdominal viscera.",
      "id": "neet-cur-33"
    },
    {
      "text": "In an ideal transformer with primary turns Np = 200 and secondary turns Ns = 1000, if the primary AC voltage is 110 V, what is the secondary voltage?",
      "opts": [
        "22 V",
        "220 V",
        "550 V",
        "1100 V"
      ],
      "ans": 2,
      "cat": "Physics",
      "difficulty": "medium",
      "exp": "By the transformer turns ratio Vs / Vp = Ns / Np, Vs = 110 × (1000 / 200) = 110 × 5 = 550 V.",
      "id": "neet-cur-34"
    },
    {
      "text": "Which cell junction facilitates direct cytoplasmic communication of ions and small molecules between adjacent animal cells?",
      "opts": [
        "Tight junctions",
        "Desmosomes",
        "Gap junctions",
        "Hemidesmosomes"
      ],
      "ans": 2,
      "cat": "Cell Biology",
      "difficulty": "easy",
      "exp": "Gap junctions are composed of connexon channels that allow rapid passage of ions and signaling molecules between neighboring cells.",
      "id": "neet-cur-35"
    }
  ],
  "jee": [
    {
      "id": "jee-cur-1",
      "text": "Which gas law states that at constant temperature, the pressure of a fixed mass of ideal gas is inversely proportional to its volume (P ∝ 1/V)?",
      "opts": [
        "Charles's Law",
        "Boyle's Law",
        "Avogadro's Law",
        "Gay-Lussac's Law"
      ],
      "ans": 1,
      "cat": "Chemistry",
      "difficulty": "easy",
      "exp": "Boyle's Law states that P₁V₁ = P₂V₂ at constant temperature (T) and moles (n)."
    },
    {
      "id": "jee-cur-2",
      "text": "What is the indefinite integral ∫ (1/x) dx for x ≠ 0?",
      "opts": [
        "x² / 2 + C",
        "ln|x| + C",
        "-1 / x² + C",
        "e^x + C"
      ],
      "ans": 1,
      "cat": "Mathematics",
      "difficulty": "medium",
      "exp": "Since the derivative of ln|x| is 1/x, its antiderivative is ln|x| + C."
    },
    {
      "id": "jee-cur-3",
      "text": "Two isotopes of the same chemical element always differ in their number of:",
      "opts": [
        "Protons",
        "Valence electrons",
        "Neutrons",
        "Atomic number (Z)"
      ],
      "ans": 2,
      "cat": "Chemistry",
      "difficulty": "hard",
      "exp": "Isotopes have the same atomic number Z (protons) and chemical properties, but different mass numbers A due to different neutron counts (N = A - Z)."
    },
    {
      "id": "jee-cur-4",
      "text": "Which quantum number specifies the 3D shape (subshell s, p, d, f) of an atomic orbital?",
      "opts": [
        "Principal quantum number (n)",
        "Azimuthal / Angular momentum quantum number (l)",
        "Magnetic quantum number (m_l)",
        "Spin quantum number (m_s)"
      ],
      "ans": 1,
      "cat": "Chemistry",
      "difficulty": "easy",
      "exp": "The azimuthal quantum number l ∈ {0, 1, ..., n-1} defines orbital shape (l=0 spherical s, l=1 dumbbell p, l=2 cloverleaf d)."
    },
    {
      "id": "jee-cur-5",
      "text": "What is the escape velocity from the surface of Earth (R ≈ 6400 km, g ≈ 9.8 m/s²)?",
      "opts": [
        "7.9 km/s",
        "11.2 km/s",
        "3.0 × 10⁵ km/s",
        "1.62 km/s"
      ],
      "ans": 1,
      "cat": "Physics",
      "difficulty": "hard",
      "exp": "Escape velocity v_e = √(2gR) ≈ √(2 × 9.8 × 6.4 × 10⁶) ≈ 11.2 km/s."
    },
    {
      "id": "jee-cur-6",
      "text": "For a body moving in a circle of radius r at constant speed v, its centripetal acceleration is:",
      "opts": [
        "v / r",
        "v² / r",
        "v · r",
        "v² · r"
      ],
      "ans": 1,
      "cat": "Physics",
      "difficulty": "hard",
      "exp": "Centripetal acceleration is directed radially inward with magnitude a_c = v² / r = ω²r."
    },
    {
      "id": "jee-cur-7",
      "text": "What is the hybridization and molecular geometry of methane (CH₄)?",
      "opts": [
        "sp² — Trigonal planar",
        "sp³ — Tetrahedral (109.5°)",
        "sp — Linear",
        "dsp² — Square planar"
      ],
      "ans": 1,
      "cat": "Chemistry",
      "difficulty": "easy",
      "exp": "Carbon in CH₄ forms 4 sigma bonds with 0 lone pairs, giving sp³ hybridization and a regular tetrahedral bond angle of 109.5°."
    },
    {
      "id": "jee-cur-8",
      "text": "If vectors A and B are perpendicular non-zero vectors, what is their scalar (dot) product A · B?",
      "opts": [
        "|A||B|",
        "0",
        "1",
        "-|A||B|"
      ],
      "ans": 1,
      "cat": "Mathematics",
      "difficulty": "medium",
      "exp": "A · B = |A||B| cos(θ). For θ = 90°, cos(90°) = 0, so the dot product is 0."
    },
    {
      "id": "jee-cur-9",
      "text": "The SI unit of electric resistance is:",
      "opts": [
        "Ampere",
        "Ohm",
        "Volt",
        "Farad"
      ],
      "ans": 1,
      "cat": "Physics",
      "difficulty": "hard",
      "exp": "The correct option is \"Ohm\". In JEE (Physics), \"Ohm\" directly satisfies the concept or fact asked in: The SI unit of electric resistance is:"
    },
    {
      "id": "jee-cur-10",
      "text": "Which law states that the rate of change of momentum is proportional to the applied force?",
      "opts": [
        "Newton's First Law",
        "Newton's Second Law",
        "Newton's Third Law",
        "Law of Conservation of Momentum"
      ],
      "ans": 1,
      "cat": "Physics",
      "difficulty": "easy",
      "exp": "The correct option is \"Newton's Second Law\". In JEE (Physics), \"Newton's Second Law\" directly satisfies the concept or fact asked in: Which law states that the rate of change of momentum is proportional to the applied force?"
    },
    {
      "id": "jee-cur-11",
      "text": "The value of `sin(90°)` is:",
      "opts": [
        "0",
        "1",
        "-1",
        "undefined"
      ],
      "ans": 1,
      "cat": "Mathematics",
      "difficulty": "medium",
      "exp": "The correct option is \"1\". In JEE (Mathematics), \"1\" directly satisfies the concept or fact asked in: The value of `sin(90°)` is:"
    },
    {
      "id": "jee-cur-12",
      "text": "Which of the following is a scalar quantity?",
      "opts": [
        "Velocity",
        "Force",
        "Work",
        "Displacement"
      ],
      "ans": 2,
      "cat": "Physics",
      "difficulty": "hard",
      "exp": "The correct option is \"Work\". In JEE (Physics), \"Work\" directly satisfies the concept or fact asked in: Which of the following is a scalar quantity?"
    },
    {
      "id": "jee-cur-13",
      "text": "The derivative of `x^2` with respect to x is:",
      "opts": [
        "x",
        "2x",
        "x^2",
        "2"
      ],
      "ans": 1,
      "cat": "Mathematics",
      "difficulty": "easy",
      "exp": "The correct option is \"2x\". In JEE (Mathematics), \"2x\" directly satisfies the concept or fact asked in: The derivative of `x^2` with respect to x is:"
    },
    {
      "id": "jee-cur-14",
      "text": "The pH of a neutral aqueous solution at 25°C is:",
      "opts": [
        "0",
        "7",
        "14",
        "1"
      ],
      "ans": 1,
      "cat": "Chemistry",
      "difficulty": "medium",
      "exp": "The correct option is \"7\". In JEE (Chemistry), \"7\" directly satisfies the concept or fact asked in: The pH of a neutral aqueous solution at 25°C is:"
    },
    {
      "id": "jee-cur-15",
      "text": "The number of electrons in a neutral carbon atom (atomic number 6) is:",
      "opts": [
        "4",
        "6",
        "8",
        "12"
      ],
      "ans": 1,
      "cat": "Chemistry",
      "difficulty": "hard",
      "exp": "The correct option is \"6\". In JEE (Chemistry), \"6\" directly satisfies the concept or fact asked in: The number of electrons in a neutral carbon atom (atomic number 6) is:"
    },
    {
      "id": "jee-cur-16",
      "text": "Which of these is the unit of capacitance?",
      "opts": [
        "Henry",
        "Farad",
        "Tesla",
        "Weber"
      ],
      "ans": 1,
      "cat": "Physics",
      "difficulty": "easy",
      "exp": "The correct option is \"Farad\". In JEE (Physics), \"Farad\" directly satisfies the concept or fact asked in: Which of these is the unit of capacitance?"
    },
    {
      "id": "jee-cur-17",
      "text": "According to the ideal gas equation PV = nRT, R is the:",
      "opts": [
        "Rydberg constant",
        "Universal gas constant",
        "Avogadro constant",
        "Planck's constant"
      ],
      "ans": 1,
      "cat": "Chemistry",
      "difficulty": "medium",
      "exp": "The correct option is \"Universal gas constant\". In JEE (Chemistry), \"Universal gas constant\" directly satisfies the concept or fact asked in: According to the ideal gas equation PV = nRT, R is the:"
    },
    {
      "id": "jee-cur-18",
      "text": "The chemical formula of glucose is:",
      "opts": [
        "C6H12O6",
        "C12H22O11",
        "C6H6",
        "CH4"
      ],
      "ans": 0,
      "cat": "Mathematics",
      "difficulty": "hard",
      "exp": "The correct option is \"C6H12O6\". In JEE (Mathematics), \"C6H12O6\" directly satisfies the concept or fact asked in: The chemical formula of glucose is:"
    },
    {
      "id": "jee-cur-19",
      "text": "The value of `d/dx(sin x)` is:",
      "opts": [
        "-cos x",
        "cos x",
        "-sin x",
        "sin x"
      ],
      "ans": 1,
      "cat": "Mathematics",
      "difficulty": "easy",
      "exp": "The correct option is \"cos x\". In JEE (Mathematics), \"cos x\" directly satisfies the concept or fact asked in: The value of `d/dx(sin x)` is:"
    },
    {
      "id": "jee-cur-20",
      "text": "Which of these bonds is formed by the sharing of electrons between atoms?",
      "opts": [
        "Ionic bond",
        "Covalent bond",
        "Metallic bond",
        "Hydrogen bond"
      ],
      "ans": 1,
      "cat": "Chemistry",
      "difficulty": "medium",
      "exp": "The correct option is \"Covalent bond\". In JEE (Chemistry), \"Covalent bond\" directly satisfies the concept or fact asked in: Which of these bonds is formed by the sharing of electrons between atoms?"
    },
    {
      "id": "jee-cur-21",
      "text": "Which of the following is an example of an exothermic reaction?",
      "opts": [
        "Photosynthesis",
        "Combustion of fuel",
        "Melting of ice",
        "Evaporation of water"
      ],
      "ans": 1,
      "cat": "Chemistry",
      "difficulty": "hard",
      "exp": "The correct option is \"Combustion of fuel\". In JEE (Chemistry), \"Combustion of fuel\" directly satisfies the concept or fact asked in: Which of the following is an example of an exothermic reaction?"
    },
    {
      "id": "jee-cur-22",
      "text": "Avogadro's number is approximately:",
      "opts": [
        "6.022 x 10^23",
        "3.14 x 10^8",
        "9.8 x 10^0",
        "1.6 x 10^-19"
      ],
      "ans": 0,
      "cat": "Chemistry",
      "difficulty": "easy",
      "exp": "The correct option is \"6.022 x 10^23\". In JEE (Chemistry), \"6.022 x 10^23\" directly satisfies the concept or fact asked in: Avogadro's number is approximately:"
    },
    {
      "text": "What is the value of the limit lim(x → 0) (sin(5x) / x)?",
      "opts": [
        "0",
        "1",
        "5",
        "1/5"
      ],
      "ans": 2,
      "cat": "Mathematics",
      "difficulty": "easy",
      "exp": "Rewriting as 5 · lim(x → 0) [sin(5x) / (5x)] and using lim(u → 0) (sin u / u) = 1 gives 5 × 1 = 5.",
      "id": "jee-cur-23"
    },
    {
      "text": "For a first-order chemical reaction with rate constant k, the half-life (t₁/₂) is given by:",
      "opts": [
        "1 / k",
        "ln(2) / k (≈ 0.693 / k)",
        "[A]₀ / (2k)",
        "k / ln(2)"
      ],
      "ans": 1,
      "cat": "Chemistry",
      "difficulty": "easy",
      "exp": "For first-order kinetics, ln([A]₀/[A]) = kt. Setting [A] = [A]₀/2 yields t₁/₂ = ln(2)/k ≈ 0.693/k, independent of initial concentration.",
      "id": "jee-cur-24"
    },
    {
      "text": "According to Lenz’s Law, the direction of induced electromotive force (emf) always:",
      "opts": [
        "Aids the change in magnetic flux",
        "Opposes the cause (change in magnetic flux) that produces it",
        "Is perpendicular to the electric current",
        "Violates conservation of energy"
      ],
      "ans": 1,
      "cat": "Physics",
      "difficulty": "easy",
      "exp": "Lenz’s Law (the minus sign in Faraday’s law ε = -dΦ_B/dt) reflects conservation of energy: induced current opposes the flux change.",
      "id": "jee-cur-25"
    },
    {
      "text": "What is the bond order of the dioxygen molecular ion O₂⁺ according to Molecular Orbital Theory?",
      "opts": [
        "1.5",
        "2.0",
        "2.5",
        "3.0"
      ],
      "ans": 2,
      "cat": "Chemistry",
      "difficulty": "medium",
      "exp": "Neutral O₂ has bond order 2.0 (10 bonding, 6 antibonding electrons). Removing one π*₂p antibonding electron to form O₂⁺ increases bond order to (10 - 5)/2 = 2.5.",
      "id": "jee-cur-26"
    },
    {
      "text": "If a projectile is launched at speed u at angle θ = 45° to the horizontal on level ground, its horizontal range R is:",
      "opts": [
        "u² / (2g)",
        "u² / g",
        "2u² / g",
        "u / g"
      ],
      "ans": 1,
      "cat": "Physics",
      "difficulty": "medium",
      "exp": "Range R = (u² sin 2θ) / g. At θ = 45°, sin(90°) = 1, yielding the maximum horizontal range R_max = u² / g.",
      "id": "jee-cur-27"
    },
    {
      "text": "What is the modulus |z| of the complex number z = 3 - 4i?",
      "opts": [
        "1",
        "5",
        "7",
        "25"
      ],
      "ans": 1,
      "cat": "Mathematics",
      "difficulty": "easy",
      "exp": "For z = a + bi, |z| = √(a² + b²) = √(3² + (-4)²) = √(9 + 16) = √25 = 5.",
      "id": "jee-cur-28"
    },
    {
      "text": "Which thermodynamic condition is always true for a spontaneous process at constant temperature and pressure?",
      "opts": [
        "ΔG < 0",
        "ΔG > 0",
        "ΔH > 0",
        "ΔS_universe < 0"
      ],
      "ans": 0,
      "cat": "Chemistry",
      "difficulty": "easy",
      "exp": "At constant T and P, a process is spontaneous if and only if the change in Gibbs free energy is negative (ΔG = ΔH - TΔS < 0).",
      "id": "jee-cur-29"
    },
    {
      "text": "What is the moment of inertia of a uniform solid sphere of mass M and radius R about an axis passing through its center?",
      "opts": [
        "(1/2) MR²",
        "(2/5) MR²",
        "(2/3) MR²",
        "MR²"
      ],
      "ans": 1,
      "cat": "Physics",
      "difficulty": "medium",
      "exp": "Integrating thin disks across a uniform solid sphere yields I_cm = (2/5) MR², whereas a hollow spherical shell has (2/3) MR².",
      "id": "jee-cur-30"
    },
    {
      "text": "If A is a 3×3 matrix with determinant det(A) = 4, what is the determinant of the matrix 2A?",
      "opts": [
        "8",
        "16",
        "24",
        "32"
      ],
      "ans": 3,
      "cat": "Mathematics",
      "difficulty": "medium",
      "exp": "For an n×n matrix A and scalar k, det(kA) = kⁿ det(A). Here n = 3 and k = 2, so det(2A) = 2³ × 4 = 8 × 4 = 32.",
      "id": "jee-cur-31"
    },
    {
      "text": "Which organic reaction converts an aromatic diazonium salt into an aryl chloride or bromide using CuCl or CuBr?",
      "opts": [
        "Wurtz reaction",
        "Sandmeyer reaction",
        "Aldol condensation",
        "Cannizzaro reaction"
      ],
      "ans": 1,
      "cat": "Chemistry",
      "difficulty": "medium",
      "exp": "The Sandmeyer reaction replaces the diazonium group (-N₂⁺X⁻) on a benzene ring with Cl, Br, or CN using cuprous salts (CuCl/HCl or CuBr/HBr).",
      "id": "jee-cur-32"
    },
    {
      "text": "In Young’s Double Slit Experiment (YDSE), if the slit separation d is halved while wavelength λ and screen distance D remain constant, the fringe width β = λD/d becomes:",
      "opts": [
        "Halved",
        "Doubled",
        "Quadrupled",
        "Unchanged"
      ],
      "ans": 1,
      "cat": "Physics",
      "difficulty": "medium",
      "exp": "Since fringe width β = λD / d is inversely proportional to slit separation d, halving d doubles the fringe width β.",
      "id": "jee-cur-33"
    },
    {
      "text": "What is the sum of the infinite geometric series 1 + 1/3 + 1/9 + 1/27 + ...?",
      "opts": [
        "4/3",
        "3/2",
        "2",
        "3"
      ],
      "ans": 1,
      "cat": "Mathematics",
      "difficulty": "easy",
      "exp": "For a geometric series with first term a = 1 and common ratio r = 1/3 (|r| < 1), S_∞ = a / (1 - r) = 1 / (1 - 1/3) = 3/2.",
      "id": "jee-cur-34"
    }
  ]
};

export const GK_CATEGORIES: string[] = [
  "All",
  "Art & Culture",
  "Awards & Honours",
  "Books & Authors",
  "Computers & Tech",
  "Economy",
  "Environment",
  "General",
  "Geography",
  "History",
  "Polity",
  "Science",
  "Space & Tech",
  "Sports",
  "World Organizations",
];
