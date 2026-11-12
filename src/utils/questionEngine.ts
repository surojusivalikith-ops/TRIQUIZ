import {
  BANK,
  GK_CATEGORIES,
  SUBJECTS,
} from './questionBanks';
import type {
  Question,
  QuestionDifficulty,
  SubjectMeta,
} from './questionBanks';

export { BANK, GK_CATEGORIES, SUBJECTS };
export type { Question, QuestionDifficulty, SubjectMeta };

export function normalizeTextToken(raw: string): string {
  return String(raw || '')
    .trim()
    .toLowerCase()
    // Strip any legacy artificial suffix patterns if present in stored history
    .replace(/\(\s*#\d+-\d+\s*\)\s*$/g, '')
    .replace(/#\d{3,6}\b/g, '')
    // Strip leading bracketed subject/category tags like "[Python]" or "[GK · Science]"
    .replace(/^\[[^\]]+\]\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeQuestionSignature(text: string): string {
  return normalizeTextToken(text);
}

/**
 * Computes a deterministic, canonical content signature for a question that is
 * invariant to option shuffling and formatting differences.
 */
export function computeQuestionContentSignature(
  q: Pick<Question, 'text' | 'opts' | 'ans' | 'cat'>,
  subjectId = 'general'
): string {
  const normStem = normalizeTextToken(q.text).replace(/[^a-z0-9+-/*=<>!&|%]+/g, ' ').trim();
  const normOpts = (q.opts || [])
    .map((o) => String(o || '').trim().toLowerCase().replace(/\s+/g, ' '))
    .sort()
    .join('|');
  const correctText =
    q.opts && q.opts[q.ans] !== undefined
      ? String(q.opts[q.ans]).trim().toLowerCase().replace(/\s+/g, ' ')
      : String(q.ans);
  return `${subjectId.toLowerCase()}::${normStem}::${correctText}::${normOpts}`;
}

/**
 * Full question fingerprint incorporating:
 * - subject
 * - topic (cat)
 * - question type (curated vs procedural templateId)
 * - normalized question text
 * - normalized sorted answer options
 * - normalized correct answer
 */
export function computeQuestionFingerprint(
  q: Question,
  subjectId = 'general'
): string {
  const qType = q.isProcedural
    ? `procedural:${q.templateId || 'gen'}`
    : `curated:${q.id || 'bank'}`;
  const topic = (q.cat || 'general').trim().toLowerCase();
  const contentSig = computeQuestionContentSignature(q, subjectId);
  return `${subjectId.toLowerCase()}::${topic}::${qType}::${contentSig}`;
}

/**
 * Checks whether a candidate question has already been seen/used in the given signature set.
 * Matches against full fingerprint, canonical content signature, and normalized stem signature.
 */
export function isQuestionInSignatureSet(
  q: Question,
  subjectId: string,
  signatures: ReadonlySet<string>
): boolean {
  const stemSig = normalizeQuestionSignature(q.text);
  const contentSig = computeQuestionContentSignature(q, subjectId);
  const fullFp = computeQuestionFingerprint(q, subjectId);
  return (
    signatures.has(fullFp) ||
    signatures.has(contentSig) ||
    signatures.has(stemSig)
  );
}

/**
 * Adds all canonical identifiers for a question to a mutable signature set.
 */
export function registerQuestionInSignatureSet(
  q: Question,
  subjectId: string,
  signatures: Set<string>
): void {
  signatures.add(normalizeQuestionSignature(q.text));
  signatures.add(computeQuestionContentSignature(q, subjectId));
  signatures.add(computeQuestionFingerprint(q, subjectId));
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffleArray<T>(arr: readonly T[]): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function mcqFromNumeric(
  correct: number,
  suffix = '',
  prefix = '',
  minAllowed?: number
): { opts: string[]; ans: number } {
  const seen = new Set<number>([correct]);
  const distractors: number[] = [];
  const spread = Math.max(5, Math.round(Math.abs(correct) * 0.35));

  let attempts = 0;
  while (distractors.length < 3 && attempts < 60) {
    attempts++;
    const delta = randInt(1, spread) * (Math.random() < 0.5 ? -1 : 1);
    const candidate = Number((correct + delta).toFixed(2));
    if (minAllowed !== undefined && candidate < minAllowed) continue;
    if (seen.has(candidate)) continue;
    seen.add(candidate);
    distractors.push(candidate);
  }
  let fallbackOffset = 1;
  while (distractors.length < 3) {
    const candidate = Number((correct + fallbackOffset).toFixed(2));
    fallbackOffset++;
    if (minAllowed !== undefined && candidate < minAllowed) continue;
    if (!seen.has(candidate)) {
      seen.add(candidate);
      distractors.push(candidate);
    }
  }

  const allVals = shuffleArray([correct, ...distractors]);
  const opts = allVals.map((v) => `${prefix}${v}${suffix}`);
  const ans = allVals.indexOf(correct);
  return { opts, ans };
}

const FALLBACK_DOMAIN_DISTRACTORS = [
  'Compile-time error',
  'Runtime exception',
  'Undefined behavior',
  'None / null',
  '0',
  '-1',
];

export function mcqFromStrings(
  correct: string,
  wrongCandidates: string[]
): { opts: string[]; ans: number } {
  const cleanCorrect = correct.trim();
  const uniqueWrong = Array.from(
    new Set(
      wrongCandidates
        .map((w) => w.trim())
        .filter((w) => w.length > 0 && w.toLowerCase() !== cleanCorrect.toLowerCase())
    )
  );
  for (const fb of FALLBACK_DOMAIN_DISTRACTORS) {
    if (uniqueWrong.length >= 3) break;
    if (
      fb.toLowerCase() !== cleanCorrect.toLowerCase() &&
      !uniqueWrong.some((u) => u.toLowerCase() === fb.toLowerCase())
    ) {
      uniqueWrong.push(fb);
    }
  }
  const pickedWrong = shuffleArray(uniqueWrong).slice(0, 3);
  const opts = shuffleArray([cleanCorrect, ...pickedWrong]);
  return { opts, ans: opts.indexOf(cleanCorrect) };
}

/* ============================================================================
   1. PYTHON PROCEDURAL GENERATOR (12 DIVERSE TEMPLATES)
   ============================================================================ */
const PYTHON_TEMPLATE_COUNT = 12;

function genPythonQuestion(templateIdx?: number): Question {
  const template =
    templateIdx !== undefined
      ? ((templateIdx % PYTHON_TEMPLATE_COUNT) + PYTHON_TEMPLATE_COUNT) % PYTHON_TEMPLATE_COUNT
      : randInt(0, PYTHON_TEMPLATE_COUNT - 1);
  const templateId = `py-tpl-${template}`;

  if (template === 0) {
    const a = randInt(3, 35);
    const b = randInt(2, 16);
    const c = randInt(2, 14);
    const correct = a + b * c;
    const { opts, ans } = mcqFromNumeric(correct);
    return {
      text: `[Python] What is the output of \`print(${a} + ${b} * ${c})\`?`,
      opts,
      ans,
      cat: 'Core Syntax & Operators',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `In Python, multiplication (\`*\`) has higher precedence than addition (\`+\`). First evaluate \`${b} * ${c} = ${b * c}\`, then add \`${a} + ${b * c} = ${correct}\`.`,
    };
  }

  if (template === 1) {
    const divisor = randInt(3, 23);
    const quotient = randInt(2, 28);
    const remainder = randInt(1, divisor - 1);
    const dividend = divisor * quotient + remainder;
    const isFloor = (dividend + divisor) % 2 === 0;
    const correct = isFloor ? quotient : remainder;
    const op = isFloor ? '//' : '%';
    const { opts, ans } = mcqFromNumeric(correct, '', '', 0);
    return {
      text: `[Python] What does \`print(${dividend} ${op} ${divisor})\` output?`,
      opts,
      ans,
      cat: 'Core Syntax & Operators',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: isFloor
        ? `The floor division operator \`//\` returns the integer quotient of \`${dividend} / ${divisor}\`. Since \`${divisor} * ${quotient} + ${remainder} = ${dividend}\`, \`${dividend} // ${divisor}\` evaluates to \`${quotient}\`.`
        : `The modulo operator \`%\` returns the remainder of dividing \`${dividend}\` by \`${divisor}\`. Since \`${dividend} = ${divisor} * ${quotient} + ${remainder}\`, the remainder is \`${remainder}\`.`,
    };
  }

  if (template === 2) {
    const n = randInt(3, 6);
    const mult = randInt(2, 7);
    const add = randInt(1, 11);
    const arr = Array.from({ length: n }, (_, x) => x * mult + add);
    const correct = `[${arr.join(', ')}]`;
    const wrong1 = `[${Array.from({ length: n }, (_, x) => (x + 1) * mult + add).join(', ')}]`;
    const wrong2 = `[${Array.from({ length: n }, (_, x) => x * mult).join(', ')}]`;
    const wrong3 = `[${Array.from({ length: n + 1 }, (_, x) => x * mult + add).join(', ')}]`;
    const { opts, ans } = mcqFromStrings(correct, [wrong1, wrong2, wrong3]);
    return {
      text: `[Python] What list is produced by \`[x * ${mult} + ${add} for x in range(${n})]\`?`,
      opts,
      ans,
      cat: 'Data Structures',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `\`range(${n})\` generates \`x = ${Array.from({ length: n }, (_, i) => i).join(', ')}\`. Substituting each into \`x * ${mult} + ${add}\` yields \`${correct}\`.`,
    };
  }

  if (template === 3) {
    const words = [
      'compiler',
      'algorithm',
      'database',
      'function',
      'variable',
      'iterator',
      'protocol',
      'pipeline',
      'terminal',
      'sequence',
      'decorator',
      'generator',
    ];
    const word = words[randInt(0, words.length - 1)] + randInt(10, 99);
    const start = randInt(1, 3);
    const end = randInt(start + 2, start + 5);
    const slice = word.slice(start, end);
    const { opts, ans } = mcqFromStrings(slice, [
      word.slice(start - 1, end),
      word.slice(start, end + 1),
      word.slice(start + 1, end + 1),
    ]);
    return {
      text: `[Python] Given \`s = "${word}"\`, what is the value of \`s[${start}:${end}]\`?`,
      opts,
      ans,
      cat: 'Data Structures',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `Python 0-based slicing \`s[${start}:${end}]\` extracts characters starting at index \`${start}\` (\`'${word[start]}'\`) up to (but excluding) index \`${end}\`, producing \`"${slice}"\`.`,
    };
  }

  if (template === 4) {
    const a = randInt(4, 39);
    const shift = randInt(1, 4);
    const correct = a << shift;
    const { opts, ans } = mcqFromNumeric(correct, '', '', 1);
    return {
      text: `[Python] What is the output of \`print(${a} << ${shift})\`?`,
      opts,
      ans,
      cat: 'Core Syntax & Operators',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `Left-shifting an integer by \`${shift}\` bits (\`${a} << ${shift}\`) multiplies it by 2^${shift} = ${1 << shift}. Thus \`${a} * ${1 << shift} = ${correct}\`.`,
    };
  }

  if (template === 5) {
    const base = [randInt(1, 9), randInt(10, 19), randInt(20, 29), randInt(30, 39)];
    const dupList = [base[0], base[1], base[0], base[2], base[1], base[3]];
    const extra = randInt(40, 99);
    const finalItems = Math.random() < 0.5 ? dupList : [...dupList, extra];
    const uniqueCount = new Set(finalItems).size;
    const { opts, ans } = mcqFromNumeric(uniqueCount, '', '', 1);
    return {
      text: `[Python] What does \`len(set([${finalItems.join(', ')}]))\` return?`,
      opts,
      ans,
      cat: 'Data Structures',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `Converting the list to a \`set\` removes all duplicate numbers, leaving the unique elements \`{${Array.from(new Set(finalItems)).join(', ')}}\`. Its \`len()\` is \`${uniqueCount}\`.`,
    };
  }

  if (template === 6) {
    const n = randInt(4, 11);
    const step = randInt(2, 6);
    let sum = 0;
    const terms: number[] = [];
    for (let i = 1; i <= n; i++) {
      terms.push(i * step);
      sum += i * step;
    }
    const { opts, ans } = mcqFromNumeric(sum, '', '', 1);
    return {
      text: `[Python] What is the value of \`total\` after running \`total = sum(i * ${step} for i in range(1, ${n + 1}))\`?`,
      opts,
      ans,
      cat: 'Functions & Generators',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `\`range(1, ${n + 1})\` iterates \`i\` from \`1\` to \`${n}\`. The generated terms are \`${terms.join(' + ')} = ${sum}\`.`,
    };
  }

  if (template === 7) {
    const k1 = randInt(2, 18);
    const k2 = randInt(19, 40);
    const defVal = randInt(50, 99);
    const { opts, ans } = mcqFromNumeric(defVal, '', '', 1);
    return {
      text: `[Python] Given \`d = {"a": ${k1}, "b": ${k2}}\`, what does \`d.get("c", ${defVal})\` return?`,
      opts,
      ans,
      cat: 'Data Structures',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `\`dict.get(key, default)\` returns the value for \`key\` if it exists in the dictionary, or \`default\` (\`${defVal}\`) when \`"c"\` is absent.`,
    };
  }

  if (template === 8) {
    const base = randInt(2, 6);
    const exp = randInt(2, 4);
    const mod = randInt(5, 19);
    const correct = Math.pow(base, exp) % mod;
    const { opts, ans } = mcqFromNumeric(correct, '', '', 0);
    return {
      text: `[Python] What does the built-in 3-argument power call \`pow(${base}, ${exp}, ${mod})\` return?`,
      opts,
      ans,
      cat: 'Core Syntax & Operators',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `In Python, \`pow(base, exp, mod)\` computes \`(base ** exp) % mod\` = \`(${base} ** ${exp}) % ${mod} = ${Math.pow(base, exp)} % ${mod} = ${correct}\`.`,
    };
  }

  if (template === 9) {
    const a = randInt(3, 15);
    const b = randInt(2, 9);
    const c = randInt(4, 14);
    const correct = a * b + c;
    const { opts, ans } = mcqFromNumeric(correct);
    return {
      text: `[Python] Given \`fn = lambda x, y=${b}: x * y + ${c}\`, what is the value of \`fn(${a})\`?`,
      opts,
      ans,
      cat: 'Functions & Generators',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `When \`fn(${a})\` is called with one argument, \`y\` uses its default value \`${b}\`. The lambda returns \`${a} * ${b} + ${c} = ${correct}\`.`,
    };
  }

  if (template === 10) {
    const start = randInt(2, 12);
    const stop = start + randInt(10, 28);
    const step = randInt(2, 5);
    const count = Math.ceil((stop - start) / step);
    const { opts, ans } = mcqFromNumeric(count, '', '', 1);
    return {
      text: `[Python] What does \`len(range(${start}, ${stop}, ${step}))\` evaluate to?`,
      opts,
      ans,
      cat: 'Data Structures',
      difficulty: 'hard',
      templateId,
      isProcedural: true,
      exp: `\`range(${start}, ${stop}, ${step})\` produces integers starting at \`${start}\` with step \`+${step}\` strictly below \`${stop}\`. That yields \`ceil((${stop} - ${start}) / ${step}) = ${count}\` elements.`,
    };
  }

  const nums = [randInt(2, 9), randInt(11, 23), randInt(24, 39), randInt(40, 58), randInt(60, 85)];
  const correct = nums[nums.length - 2];
  const { opts, ans } = mcqFromNumeric(correct);
  return {
    text: `[Python] Given \`arr = [${nums.join(', ')}]\`, what does \`arr[-2]\` evaluate to?`,
    opts,
    ans,
    cat: 'Data Structures',
    difficulty: 'easy',
    templateId,
    isProcedural: true,
    exp: `Negative indices count from the end of the list: \`arr[-1]\` is \`${nums[nums.length - 1]}\` and \`arr[-2]\` is the second-to-last element \`${correct}\`.`,
  };
}

/* ============================================================================
   2. JAVA PROCEDURAL GENERATOR (12 DIVERSE TEMPLATES)
   ============================================================================ */
const JAVA_TEMPLATE_COUNT = 12;

function genJavaQuestion(templateIdx?: number): Question {
  const template =
    templateIdx !== undefined
      ? ((templateIdx % JAVA_TEMPLATE_COUNT) + JAVA_TEMPLATE_COUNT) % JAVA_TEMPLATE_COUNT
      : randInt(0, JAVA_TEMPLATE_COUNT - 1);
  const templateId = `java-tpl-${template}`;

  if (template === 0) {
    const a = randInt(15, 115);
    const b = randInt(4, 16);
    const c = randInt(2, 15);
    const intDiv = Math.trunc(a / b);
    const correct = intDiv + c;
    const { opts, ans } = mcqFromNumeric(correct);
    return {
      text: `[Java] What does \`System.out.println(${a} / ${b} + ${c});\` print?`,
      opts,
      ans,
      cat: 'Java Fundamentals',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `In Java, \`${a} / ${b}\` uses integer division, which truncates the decimal part to give \`${intDiv}\`. Adding \`${c}\` yields \`${intDiv} + ${c} = ${correct}\`.`,
    };
  }

  if (template === 1) {
    const a = randInt(14, 75);
    const b = randInt(5, 13);
    const m = randInt(2, 9);
    const rem = a % b;
    const correct = rem * m;
    const { opts, ans } = mcqFromNumeric(correct, '', '', 0);
    return {
      text: `[Java] Evaluate the output of \`System.out.println((${a} % ${b}) * ${m});\``,
      opts,
      ans,
      cat: 'Java Fundamentals',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `First compute the remainder \`${a} % ${b} = ${rem}\`. Then multiply by \`${m}\`: \`${rem} * ${m} = ${correct}\`.`,
    };
  }

  if (template === 2) {
    const x = randInt(10, 65);
    const y = randInt(10, 65);
    const vTrue = randInt(100, 199);
    const vFalse = randInt(200, 299);
    const cond = x > y;
    const correct = cond ? vTrue : vFalse;
    const { opts, ans } = mcqFromNumeric(correct);
    return {
      text: `[Java] What is printed by \`System.out.println(${x} > ${y} ? ${vTrue} : ${vFalse});\`?`,
      opts,
      ans,
      cat: 'Java Fundamentals',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `The ternary operator evaluates \`${x} > ${y}\`, which is \`${cond}\`. Therefore it selects the ${cond ? 'first' : 'second'} branch and prints \`${correct}\`.`,
    };
  }

  if (template === 3) {
    const prefix = ['Compile', 'Runtime', 'Generic', 'Package', 'Threads', 'Servlet', 'Streams', 'Adapter'][randInt(0, 7)];
    const str = `${prefix}${randInt(100, 999)}`;
    const s = randInt(1, 3);
    const e = randInt(s + 2, s + 5);
    const sub = str.substring(s, e);
    const { opts, ans } = mcqFromStrings(sub, [
      str.substring(s - 1, e),
      str.substring(s, e + 1),
      str.substring(s + 1, e + 1),
    ]);
    return {
      text: `[Java] What does \`"${str}".substring(${s}, ${e})\` return?`,
      opts,
      ans,
      cat: 'Java Fundamentals',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `\`String.substring(beginIndex, endIndex)\` starts at 0-based index \`${s}\` (\`'${str[s]}'\`) and stops at \`endIndex - 1\` (index \`${e - 1}\`), returning \`"${sub}"\`.`,
    };
  }

  if (template === 4) {
    const a = randInt(3, 32);
    const shift = randInt(1, 4);
    const correct = a << shift;
    const { opts, ans } = mcqFromNumeric(correct, '', '', 1);
    return {
      text: `[Java] What is the value of the bitwise left shift expression \`${a} << ${shift}\`?`,
      opts,
      ans,
      cat: 'Java Fundamentals',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `Left-shifting \`${a}\` by \`${shift}\` bit positions multiplies by 2^${shift} = ${1 << shift}, giving \`${a} * ${1 << shift} = ${correct}\`.`,
    };
  }

  if (template === 5) {
    const arr = [randInt(2, 14), randInt(15, 29), randInt(30, 48), randInt(49, 75)];
    const i1 = randInt(0, 1);
    const i2 = randInt(2, 3);
    const correct = arr[i1] + arr[i2];
    const { opts, ans } = mcqFromNumeric(correct);
    return {
      text: `[Java] Given \`int[] a = {${arr.join(', ')}};\`, what does \`System.out.println(a[${i1}] + a[${i2}]);\` output?`,
      opts,
      ans,
      cat: 'Collections & Arrays',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `Java arrays are 0-indexed: \`a[${i1}] = ${arr[i1]}\` and \`a[${i2}] = ${arr[i2]}\`. Their sum is \`${arr[i1]} + ${arr[i2]} = ${correct}\`.`,
    };
  }

  if (template === 6) {
    const a = randInt(5, 25);
    const b = randInt(3, 18);
    const strPrefix = ['Result:', 'Val=', 'Sum:', 'Out='][randInt(0, 3)];
    const correct = `${strPrefix}${a}${b}`;
    const wrong1 = `${strPrefix}${a + b}`;
    const wrong2 = `${a + b}${strPrefix}`;
    const wrong3 = `${strPrefix}${a * b}`;
    const { opts, ans } = mcqFromStrings(correct, [wrong1, wrong2, wrong3]);
    return {
      text: `[Java] What does \`System.out.println("${strPrefix}" + ${a} + ${b});\` output?`,
      opts,
      ans,
      cat: 'Java Fundamentals',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `The \`+\` operator is evaluated left-to-right. Since the first operand \`"${strPrefix}"\` is a \`String\`, \`"${strPrefix}" + ${a}\` performs string concatenation to \`"${strPrefix}${a}"\`, and then appends \`${b}\` to produce \`"${correct}"\`.`,
    };
  }

  if (template === 7) {
    const rows = randInt(2, 6);
    const cols = randInt(3, 9);
    const askCols = (rows + cols) % 2 === 0;
    const correct = askCols ? cols : rows;
    const expr = askCols ? 'm[0].length' : 'm.length';
    const { opts, ans } = mcqFromNumeric(correct, '', '', 1);
    return {
      text: `[Java] For a 2D array declared as \`int[][] m = new int[${rows}][${cols}];\`, what is the value of \`${expr}\`?`,
      opts,
      ans,
      cat: 'Collections & Arrays',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: askCols
        ? `\`m[0].length\` returns the number of columns in row 0, which is \`${cols}\`.`
        : `\`m.length\` returns the number of rows in the 2D array, which is \`${rows}\`.`,
    };
  }

  if (template === 8) {
    const x = randInt(6, 28);
    const mult = randInt(2, 5);
    const correct = x + (x + 1) * mult;
    const { opts, ans } = mcqFromNumeric(correct);
    return {
      text: `[Java] Given \`int x = ${x}; int y = x++ + x * ${mult};\`, what is the value of \`y\`?`,
      opts,
      ans,
      cat: 'Java Fundamentals',
      difficulty: 'hard',
      templateId,
      isProcedural: true,
      exp: `Post-increment \`x++\` evaluates to \`${x}\` and increments \`x\` to \`${x + 1}\`. Then \`x * ${mult}\` uses \`x = ${x + 1}\` (\`${(x + 1) * mult}\`). Adding them gives \`${x} + ${(x + 1) * mult} = ${correct}\`.`,
    };
  }

  if (template === 9) {
    const a = randInt(12, 48);
    const b = randInt(12, 48);
    const c = randInt(12, 48);
    const correct = Math.max(a, Math.min(b, c));
    const { opts, ans } = mcqFromNumeric(correct);
    return {
      text: `[Java] What does \`Math.max(${a}, Math.min(${b}, ${c}))\` return?`,
      opts,
      ans,
      cat: 'Java Fundamentals',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `First \`Math.min(${b}, ${c})\` returns \`${Math.min(b, c)}\`. Then \`Math.max(${a}, ${Math.min(b, c)})\` returns \`${correct}\`.`,
    };
  }

  if (template === 10) {
    const hexNum = randInt(17, 254);
    const hexStr = hexNum.toString(16).toUpperCase();
    const { opts, ans } = mcqFromNumeric(hexNum, '', '', 1);
    return {
      text: `[Java] What integer value does \`Integer.parseInt("${hexStr}", 16)\` return?`,
      opts,
      ans,
      cat: 'Java Fundamentals',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `Parsing hexadecimal \`"${hexStr}"\` in base 16 converts it to decimal \`${hexNum}\`.`,
    };
  }

  const n = randInt(3, 7);
  const offset = randInt(2, 9);
  const sum = (n * (n - 1)) / 2 + n * offset;
  const { opts, ans } = mcqFromNumeric(sum);
  return {
    text: `[Java] What is \`sum\` after running \`int sum = 0; for (int i = 0; i < ${n}; i++) sum += (i + ${offset});\`?`,
    opts,
    ans,
    cat: 'Java Fundamentals',
    difficulty: 'medium',
    templateId,
    isProcedural: true,
    exp: `As \`i\` runs from \`0\` to \`${n - 1}\`, \`sum\` adds \`${Array.from({ length: n }, (_, i) => i + offset).join(' + ')} = ${sum}\`.`,
  };
}

/* ============================================================================
   3. C LANGUAGE PROCEDURAL GENERATOR (12 DIVERSE TEMPLATES)
   ============================================================================ */
const C_TEMPLATE_COUNT = 12;

function genCQuestion(templateIdx?: number): Question {
  const template =
    templateIdx !== undefined
      ? ((templateIdx % C_TEMPLATE_COUNT) + C_TEMPLATE_COUNT) % C_TEMPLATE_COUNT
      : randInt(0, C_TEMPLATE_COUNT - 1);
  const templateId = `c-tpl-${template}`;

  if (template === 0) {
    const a = randInt(5, 45);
    const b = randInt(3, 44);
    const opIdx = randInt(0, 2);
    const op = ['&', '|', '^'][opIdx];
    const opName = ['bitwise AND', 'bitwise OR', 'bitwise XOR'][opIdx];
    const correct = opIdx === 0 ? a & b : opIdx === 1 ? a | b : a ^ b;
    const { opts, ans } = mcqFromNumeric(correct, '', '', 0);
    return {
      text: `[C] What does \`printf("%d", ${a} ${op} ${b});\` print?`,
      opts,
      ans,
      cat: 'Bitwise & Operators',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `In binary, \`${a}\` is \`${a.toString(2).padStart(6, '0')}\` and \`${b}\` is \`${b.toString(2).padStart(6, '0')}\`. Applying ${opName} (\`${op}\`) bit-by-bit gives \`${correct.toString(2).padStart(6, '0')}\`, which is \`${correct}\` in decimal.`,
    };
  }

  if (template === 1) {
    const arr = [randInt(5, 19), randInt(20, 39), randInt(40, 59), randInt(60, 89), randInt(90, 125)];
    const offset = randInt(1, 4);
    const mult = randInt(2, 5);
    const correct = arr[offset] * mult;
    const { opts, ans } = mcqFromNumeric(correct);
    return {
      text: `[C] Given \`int a[] = {${arr.join(', ')}};\`, what does \`printf("%d", *(a + ${offset}) * ${mult});\` print?`,
      opts,
      ans,
      cat: 'Pointers & Memory',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `In C, \`*(a + ${offset})\` dereferences the pointer at offset \`${offset}\`, which is equivalent to \`a[${offset}] = ${arr[offset]}\`. Multiplying by \`${mult}\` gives \`${arr[offset]} * ${mult} = ${correct}\`.`,
    };
  }

  if (template === 2) {
    const elemCount = randInt(6, 42);
    const intBytes = 4;
    const totalBytes = elemCount * intBytes;
    const { opts, ans } = mcqFromNumeric(totalBytes, ' bytes', '', 4);
    return {
      text: `[C] On a system where \`sizeof(int) == 4\`, what is \`sizeof(arr)\` for \`int arr[${elemCount}];\`?`,
      opts,
      ans,
      cat: 'Pointers & Memory',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `Total array size in bytes equals \`number of elements × sizeof(element)\` = \`${elemCount} × 4 = ${totalBytes} bytes\`.`,
    };
  }

  if (template === 3) {
    const offset = randInt(1, 25);
    const charCode = 65 + offset;
    const letter = String.fromCharCode(charCode);
    const { opts, ans } = mcqFromNumeric(charCode, ` ('${letter}')`);
    return {
      text: `[C] Since \`'A'\` has ASCII value 65, what does \`printf("%d ('%c')", 'A' + ${offset}, 'A' + ${offset});\` output?`,
      opts,
      ans,
      cat: 'Standard Library & Strings',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `Adding \`${offset}\` to \`'A'\` (ASCII 65) gives \`65 + ${offset} = ${charCode}\`, which corresponds to uppercase letter \`'${letter}'\`.`,
    };
  }

  if (template === 4) {
    const a = randInt(25, 135);
    const b = randInt(4, 15);
    const q = Math.trunc(a / b);
    const r = a % b;
    const correct = q + r;
    const { opts, ans } = mcqFromNumeric(correct);
    return {
      text: `[C] What is printed by \`printf("%d", (${a} / ${b}) + (${a} % ${b}));\`?`,
      opts,
      ans,
      cat: 'Control Flow & Storage',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `Integer division \`${a} / ${b} = ${q}\` and remainder \`${a} % ${b} = ${r}\`. Their sum is \`${q} + ${r} = ${correct}\`.`,
    };
  }

  if (template === 5) {
    const limit = randInt(4, 10);
    const factor = randInt(2, 7);
    const sum = ((limit * (limit + 1)) / 2) * factor;
    const { opts, ans } = mcqFromNumeric(sum);
    return {
      text: `[C] If \`int s = 0; for(int i = 1; i <= ${limit}; i++) s += i * ${factor};\`, what is the final value of \`s\`?`,
      opts,
      ans,
      cat: 'Control Flow & Storage',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `The loop adds \`${factor} * (1 + 2 + ... + ${limit}) = ${factor} * ${(limit * (limit + 1)) / 2} = ${sum}\`.`,
    };
  }

  if (template === 6) {
    const word = ['kernel', 'pointer', 'buffer', 'socket', 'struct', 'header', 'malloc'][randInt(0, 6)] + randInt(10, 99);
    const askSizeof = Math.random() < 0.5;
    const correct = askSizeof ? word.length + 1 : word.length;
    const fnName = askSizeof ? 'sizeof' : 'strlen';
    const { opts, ans } = mcqFromNumeric(correct, '', '', 1);
    return {
      text: `[C] For \`char s[] = "${word}";\`, what does \`${fnName}(s)\` evaluate to?`,
      opts,
      ans,
      cat: 'Standard Library & Strings',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: askSizeof
        ? `\`sizeof(s)\` on a char array initialized from a string literal includes the trailing null terminator \`'\\0'\`, giving \`${word.length} + 1 = ${correct}\`.`
        : `\`strlen(s)\` counts characters before the null terminator \`'\\0'\`, returning \`${correct}\`.`,
    };
  }

  if (template === 7) {
    const baseAddr = randInt(10, 40) * 100;
    const idxOffset = randInt(2, 9);
    const typeSize = [2, 4, 8][randInt(0, 2)];
    const typeName = typeSize === 2 ? 'short' : typeSize === 4 ? 'int' : 'double';
    const newAddr = baseAddr + idxOffset * typeSize;
    const { opts, ans } = mcqFromNumeric(newAddr, '', '', 100);
    return {
      text: `[C] Suppose \`${typeName} *p\` points to address \`${baseAddr}\` and \`sizeof(${typeName}) == ${typeSize}\`. What decimal address does \`p + ${idxOffset}\` evaluate to?`,
      opts,
      ans,
      cat: 'Pointers & Memory',
      difficulty: 'hard',
      templateId,
      isProcedural: true,
      exp: `Pointer arithmetic scales the offset by \`sizeof(*p)\`: \`${baseAddr} + ${idxOffset} × ${typeSize} = ${newAddr}\`.`,
    };
  }

  if (template === 8) {
    const calls = randInt(3, 8);
    const step = randInt(2, 6);
    const initVal = randInt(1, 10);
    const finalVal = initVal + calls * step;
    const { opts, ans } = mcqFromNumeric(finalVal);
    return {
      text: `[C] A function contains \`static int c = ${initVal}; c += ${step}; return c;\`. What value is returned on the ${calls}th call to this function?`,
      opts,
      ans,
      cat: 'Control Flow & Storage',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `A \`static\` local variable is initialized once to \`${initVal}\` and retains its value across calls. After ${calls} calls adding \`${step}\` each time, it returns \`${initVal} + ${calls} × ${step} = ${finalVal}\`.`,
    };
  }

  if (template === 9) {
    const a = randInt(3, 9);
    const b = randInt(2, 7);
    const unparenthesized = a + b * a + b;
    const { opts, ans } = mcqFromNumeric(unparenthesized);
    return {
      text: `[C] Given the macro \`#define SQ(x) x * x\`, what does \`SQ(${a} + ${b})\` evaluate to?`,
      opts,
      ans,
      cat: 'Control Flow & Storage',
      difficulty: 'hard',
      templateId,
      isProcedural: true,
      exp: `Preprocessor macros perform textual substitution without implicit parentheses: \`SQ(${a} + ${b})\` expands to \`${a} + ${b} * ${a} + ${b} = ${a} + ${b * a} + ${b} = ${unparenthesized}\`.`,
    };
  }

  if (template === 10) {
    const val = randInt(32, 160);
    const shift = randInt(1, 3);
    const correct = val >> shift;
    const { opts, ans } = mcqFromNumeric(correct, '', '', 0);
    return {
      text: `[C] What is the output of \`printf("%d", ${val} >> ${shift});\`?`,
      opts,
      ans,
      cat: 'Bitwise & Operators',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `Right-shifting positive integer \`${val}\` by \`${shift}\` bits divides by 2^${shift} = ${1 << shift}: \`Math.floor(${val} / ${1 << shift}) = ${correct}\`.`,
    };
  }

  const a = randInt(10, 55);
  const b = randInt(10, 55);
  const correct = a + b + 1;
  const { opts, ans } = mcqFromNumeric(correct);
  return {
    text: `[C] In \`int x = (${a}, ${b}, ${a} + ${b} + 1);\`, what value is assigned to \`x\` via the comma operator?`,
    opts,
    ans,
    cat: 'Bitwise & Operators',
    difficulty: 'medium',
    templateId,
    isProcedural: true,
    exp: `The C comma operator evaluates expressions left-to-right and yields the value of the rightmost expression: \`${a} + ${b} + 1 = ${correct}\`.`,
  };
}

/* ============================================================================
   4. C++ PROCEDURAL GENERATOR (12 DIVERSE TEMPLATES)
   ============================================================================ */
const CPP_TEMPLATE_COUNT = 12;

function genCppQuestion(templateIdx?: number): Question {
  const template =
    templateIdx !== undefined
      ? ((templateIdx % CPP_TEMPLATE_COUNT) + CPP_TEMPLATE_COUNT) % CPP_TEMPLATE_COUNT
      : randInt(0, CPP_TEMPLATE_COUNT - 1);
  const templateId = `cpp-tpl-${template}`;

  if (template === 0) {
    const a = randInt(10, 55);
    const b = randInt(5, 40);
    const c = randInt(2, 22);
    const correct = a + b + c;
    const { opts, ans } = mcqFromNumeric(correct);
    return {
      text: `[C++] Given \`int x = ${a}; int &ref = x; ref += ${b}; x += ${c};\`, what does \`cout << ref;\` print?`,
      opts,
      ans,
      cat: 'Memory & Smart Pointers',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `\`ref\` is an alias (reference) to \`x\`. Modifying \`ref\` or \`x\` updates the same memory location: \`${a} + ${b} + ${c} = ${correct}\`.`,
    };
  }

  if (template === 1) {
    const initCount = randInt(3, 10);
    const pushes = randInt(2, 8);
    const pops = randInt(1, 3);
    const finalSize = initCount + pushes - pops;
    const { opts, ans } = mcqFromNumeric(finalSize, '', '', 1);
    return {
      text: `[C++] A \`std::vector<int> v(${initCount});\` has \`push_back()\` called ${pushes} times and \`pop_back()\` called ${pops} times. What is \`v.size()\`?`,
      opts,
      ans,
      cat: 'STL & Containers',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `Starting with \`${initCount}\` elements, adding \`${pushes}\` elements and removing \`${pops}\` elements leaves \`${initCount} + ${pushes} - ${pops} = ${finalSize}\` elements.`,
    };
  }

  if (template === 2) {
    const a = randInt(4, 24);
    const b = randInt(2, 16);
    const c = randInt(3, 12);
    const correct = (a + b) * c;
    const { opts, ans } = mcqFromNumeric(correct);
    return {
      text: `[C++] What does \`auto fn = [](int x, int y){ return (x + y) * ${c}; }; cout << fn(${a}, ${b});\` output?`,
      opts,
      ans,
      cat: 'Templates & Modern C++',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `The C++ lambda computes \`(x + y) * ${c}\`. Passing \`x = ${a}\` and \`y = ${b}\` yields \`(${a} + ${b}) * ${c} = ${a + b} * ${c} = ${correct}\`.`,
    };
  }

  if (template === 3) {
    const a = randInt(16, 128);
    const shift = randInt(1, 3);
    const correct = a >> shift;
    const { opts, ans } = mcqFromNumeric(correct, '', '', 0);
    return {
      text: `[C++] What is the output of \`cout << (${a} >> ${shift});\`?`,
      opts,
      ans,
      cat: 'C++ Core',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `Right-shifting \`${a}\` by \`${shift}\` bits divides by 2^${shift} = ${1 << shift} (truncating toward zero): \`${a} / ${1 << shift} = ${correct}\`.`,
    };
  }

  if (template === 4) {
    const a = randInt(6, 32);
    const b = randInt(3, 12);
    const c = randInt(2, 15);
    const correct = a * b - c;
    const { opts, ans } = mcqFromNumeric(correct);
    return {
      text: `[C++] What does \`cout << (${a} * ${b} - ${c});\` print?`,
      opts,
      ans,
      cat: 'C++ Core',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `Multiplication executes first: \`${a} * ${b} = ${a * b}\`. Subtracting \`${c}\` gives \`${a * b} - ${c} = ${correct}\`.`,
    };
  }

  if (template === 5) {
    const initAcc = randInt(5, 30);
    const nums = [randInt(2, 9), randInt(10, 18), randInt(19, 27), randInt(28, 39)];
    const sum = initAcc + nums.reduce((x, y) => x + y, 0);
    const { opts, ans } = mcqFromNumeric(sum);
    return {
      text: `[C++] Given \`std::vector<int> v = {${nums.join(', ')}};\`, what does \`std::accumulate(v.begin(), v.end(), ${initAcc})\` return?`,
      opts,
      ans,
      cat: 'STL & Containers',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `\`std::accumulate\` starts with initial value \`${initAcc}\` and adds every element in \`v\`: \`${initAcc} + ${nums.join(' + ')} = ${sum}\`.`,
    };
  }

  if (template === 6) {
    const v1 = randInt(3, 19);
    const v2 = randInt(20, 45);
    const v3 = randInt(46, 70);
    const raw = [v2, v1, v3, v1, v2];
    const { opts, ans } = mcqFromNumeric(v1);
    return {
      text: `[C++] If \`std::set<int> s = {${raw.join(', ')}};\`, what is the value of \`*s.begin()\`?`,
      opts,
      ans,
      cat: 'STL & Containers',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `\`std::set\` stores unique keys sorted in ascending order: \`{${v1}, ${v2}, ${v3}}\`. Therefore \`*s.begin()\` is the smallest element \`${v1}\`.`,
    };
  }

  if (template === 7) {
    const copies = randInt(2, 7);
    const totalOwners = 1 + copies;
    const { opts, ans } = mcqFromNumeric(totalOwners, '', '', 1);
    return {
      text: `[C++] A \`std::shared_ptr<int> p = std::make_shared<int>(42);\` is copied into ${copies} additional \`std::shared_ptr<int>\` variables in the same scope. What does \`p.use_count()\` return?`,
      opts,
      ans,
      cat: 'Memory & Smart Pointers',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `The original \`shared_ptr\` plus ${copies} active copies share ownership of the control block, so \`use_count()\` is \`1 + ${copies} = ${totalOwners}\`.`,
    };
  }

  if (template === 8) {
    const captured = randInt(10, 45);
    const arg = randInt(3, 19);
    const mutated = captured + randInt(5, 20);
    const isByRef = (captured + arg) % 2 === 0;
    const correct = (isByRef ? mutated : captured) + arg;
    const capSyntax = isByRef ? '[&k]' : '[k]';
    const { opts, ans } = mcqFromNumeric(correct);
    return {
      text: `[C++] Given \`int k = ${captured}; auto f = ${capSyntax}(int x){ return k + x; }; k = ${mutated};\`, what does \`f(${arg})\` return?`,
      opts,
      ans,
      cat: 'Templates & Modern C++',
      difficulty: 'hard',
      templateId,
      isProcedural: true,
      exp: isByRef
        ? `Because \`k\` is captured by reference (\`[&k]\`), the lambda reads the updated value \`k = ${mutated}\`, returning \`${mutated} + ${arg} = ${correct}\`.`
        : `Because \`k\` is captured by value (\`[k]\`) when the lambda is created, it retains \`k = ${captured}\`, returning \`${captured} + ${arg} = ${correct}\`.`,
    };
  }

  if (template === 9) {
    const n = randInt(3, 6);
    let fact = 1;
    for (let i = 2; i <= n; i++) fact *= i;
    const { opts, ans } = mcqFromNumeric(fact, '', '', 1);
    return {
      text: `[C++] Given \`constexpr int fact(int n){ return n <= 1 ? 1 : n * fact(n - 1); }\`, what is the compile-time value of \`fact(${n})\`?`,
      opts,
      ans,
      cat: 'Templates & Modern C++',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `The \`constexpr\` recursive function computes \`${n}! = ${fact}\` at compile time.`,
    };
  }

  if (template === 10) {
    const count = randInt(3, 9);
    const val = randInt(4, 15);
    const correct = count * val;
    const { opts, ans } = mcqFromNumeric(correct);
    return {
      text: `[C++] For \`std::vector<int> v(${count}, ${val});\`, what is \`v.front() + v.back() + (${count - 2} * ${val})\` (the sum of all elements)?`,
      opts,
      ans,
      cat: 'STL & Containers',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `\`std::vector<int> v(${count}, ${val})\` constructs ${count} elements each initialized to \`${val}\`. Their total sum is \`${count} × ${val} = ${correct}\`.`,
    };
  }

  const baseVal = randInt(10, 40);
  const derivedVal = randInt(50, 95);
  const isVirtual = (baseVal + derivedVal) % 2 === 0;
  const correct = isVirtual ? derivedVal : baseVal;
  const { opts, ans } = mcqFromNumeric(correct);
  return {
    text: `[C++] Base class \`B\` defines \`${isVirtual ? 'virtual ' : ''}int get() { return ${baseVal}; }\` and derived class \`D : public B\` defines \`int get() { return ${derivedVal}; }\`. For \`B* ptr = new D();Rs\`, what does \`ptr->get()\` return?`.replace('Rs', ''),
    opts,
    ans,
    cat: 'OOP & Polymorphism',
    difficulty: 'hard',
    templateId,
    isProcedural: true,
    exp: isVirtual
      ? `Because \`B::get()\` is declared \`virtual\`, dynamic dispatch via the vtable invokes \`D::get()\`, returning \`${derivedVal}\`.`
      : `Because \`B::get()\` is NOT declared \`virtual\`, the call is bound statically at compile time based on pointer type \`B*\`, returning \`${baseVal}\`.`,
  };
}

/* ============================================================================
   5. HTML / CSS PROCEDURAL GENERATOR (12 DIVERSE TEMPLATES)
   ============================================================================ */
const HTML_TEMPLATE_COUNT = 12;

function genHtmlCssQuestion(templateIdx?: number): Question {
  const template =
    templateIdx !== undefined
      ? ((templateIdx % HTML_TEMPLATE_COUNT) + HTML_TEMPLATE_COUNT) % HTML_TEMPLATE_COUNT
      : randInt(0, HTML_TEMPLATE_COUNT - 1);
  const templateId = `html-tpl-${template}`;

  if (template === 0) {
    const width = randInt(12, 48) * 10;
    const pad = randInt(8, 36);
    const border = randInt(1, 10);
    const isBorderBox = (width + pad) % 2 === 0;
    const correct = isBorderBox ? width : width + 2 * pad + 2 * border;
    const { opts, ans } = mcqFromNumeric(correct, 'px', '', 50);
    return {
      text: `[HTML/CSS] A \`<div>\` has \`box-sizing: ${isBorderBox ? 'border-box' : 'content-box'}; width: ${width}px; padding: ${pad}px; border: ${border}px solid #000;\`. What is its total rendered border-box width?`,
      opts,
      ans,
      cat: 'CSS Layout & Box Model',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: isBorderBox
        ? `With \`box-sizing: border-box\`, \`padding\` (${pad}px × 2) and \`border\` (${border}px × 2) are absorbed inside the declared \`width\`, so total rendered width remains \`${width}px\`.`
        : `With \`box-sizing: content-box\`, total rendered width = \`content width + 2 × padding + 2 × border\` = \`${width} + 2(${pad}) + 2(${border}) = ${correct}px\`.`,
    };
  }

  if (template === 1) {
    const rootPx = [12, 14, 15, 16, 18, 20, 22, 24][randInt(0, 7)];
    const remMult = [1.25, 1.5, 2, 2.5, 3, 3.5, 4][randInt(0, 6)];
    const correct = rootPx * remMult;
    const { opts, ans } = mcqFromNumeric(correct, 'px', '', 8);
    return {
      text: `[HTML/CSS] If \`html { font-size: ${rootPx}px; }\`, what is the computed pixel size of an element with \`font-size: ${remMult}rem;\`?`,
      opts,
      ans,
      cat: 'Selectors & Styling',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `The \`rem\` unit multiplies the root \`<html>\` font size (\`${rootPx}px\`). Therefore \`${remMult}rem = ${remMult} × ${rootPx}px = ${correct}px\`.`,
    };
  }

  if (template === 2) {
    const cols = randInt(2, 6);
    const gap = randInt(10, 32);
    const colWidth = randInt(70, 240);
    const containerWidth = cols * colWidth + (cols - 1) * gap;
    const { opts, ans } = mcqFromNumeric(colWidth, 'px', '', 20);
    return {
      text: `[HTML/CSS] A grid container of width \`${containerWidth}px\` has \`grid-template-columns: repeat(${cols}, 1fr); column-gap: ${gap}px;\`. What is the width of each column track?`,
      opts,
      ans,
      cat: 'CSS Layout & Box Model',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `With ${cols} columns, there are \`${cols} - 1 = ${cols - 1}\` gaps totaling \`${cols - 1} × ${gap}px = ${(cols - 1) * gap}px\`. Remaining space = \`${containerWidth} - ${(cols - 1) * gap} = ${cols * colWidth}px\`. Divided equally across ${cols} \`1fr\` tracks gives \`${colWidth}px\` per column.`,
    };
  }

  if (template === 3) {
    const ids = randInt(0, 3);
    const classes = randInt(1, 4);
    const elems = randInt(1, 4);
    const idPart = Array.from({ length: ids }, (_, i) => `#s${i + 1}`).join(' ');
    const classPart = Array.from({ length: classes }, (_, i) => `.c${i + 1}`).join('');
    const elemPart = ['div', 'ul', 'li', 'a', 'span'].slice(0, elems).join(' ');
    const selector = [idPart, elemPart, classPart].filter(Boolean).join(' ').trim();
    const correct = `(${ids}, ${classes}, ${elems})`;
    const { opts, ans } = mcqFromStrings(correct, [
      `(${classes}, ${ids}, ${elems})`,
      `(${ids}, ${elems}, ${classes})`,
      `(${ids + 1}, ${classes - 1}, ${elems})`,
    ]);
    return {
      text: `[HTML/CSS] What is the CSS specificity tuple \`(IDs, Classes, Elements)\` for the selector \`${selector}\`?`,
      opts,
      ans,
      cat: 'Selectors & Styling',
      difficulty: 'hard',
      templateId,
      isProcedural: true,
      exp: `Counting each selector component: \`${ids}\` ID selector(s) (\`#\`), \`${classes}\` class selector(s) (\`.\`), and \`${elems}\` type/element selector(s), yielding specificity \`${correct}\`.`,
    };
  }

  if (template === 4) {
    const g1 = randInt(1, 4);
    const g2 = randInt(1, 5);
    const unitSpace = randInt(20, 75);
    const baseWidth = randInt(50, 140);
    const extraSpace = (g1 + g2) * unitSpace;
    const totalContainer = 2 * baseWidth + extraSpace;
    const item1Final = baseWidth + g1 * unitSpace;
    const { opts, ans } = mcqFromNumeric(item1Final, 'px', '', 40);
    return {
      text: `[HTML/CSS] A \`${totalContainer}px\` flex container holds two items, each with \`flex-basis: ${baseWidth}px\`. Item A has \`flex-grow: ${g1}\` and Item B has \`flex-grow: ${g2}\`. What is Item A's final width?`,
      opts,
      ans,
      cat: 'CSS Layout & Box Model',
      difficulty: 'hard',
      templateId,
      isProcedural: true,
      exp: `Free space = \`${totalContainer} - (${baseWidth} + ${baseWidth}) = ${extraSpace}px\`. Total grow ratio = \`${g1} + ${g2} = ${g1 + g2}\`. Item A gets \`(${g1}/${g1 + g2}) × ${extraSpace} = ${g1 * unitSpace}px\` extra, so its final width is \`${baseWidth} + ${g1 * unitSpace} = ${item1Final}px\`.`,
    };
  }

  if (template === 5) {
    const vwTotal = randInt(8, 24) * 100;
    const vwPct = randInt(15, 85);
    const correct = (vwTotal * vwPct) / 100;
    const { opts, ans } = mcqFromNumeric(correct, 'px', '', 10);
    return {
      text: `[HTML/CSS] On a viewport of width \`${vwTotal}px\`, what is the computed width in pixels of an element styled with \`width: ${vwPct}vw;\`?`,
      opts,
      ans,
      cat: 'Selectors & Styling',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `\`1vw\` equals 1% of the viewport width (\`${vwTotal / 100}px\`). Thus \`${vwPct}vw = (${vwPct} / 100) × ${vwTotal}px = ${correct}px\`.`,
    };
  }

  if (template === 6) {
    const fontPx = randInt(14, 36);
    const lineMult = [1.25, 1.5, 1.75, 2, 2.5][randInt(0, 4)];
    const correct = fontPx * lineMult;
    const { opts, ans } = mcqFromNumeric(correct, 'px', '', 10);
    return {
      text: `[HTML/CSS] An element has \`font-size: ${fontPx}px; line-height: ${lineMult};\`. What is its computed \`line-height\` in pixels?`,
      opts,
      ans,
      cat: 'Selectors & Styling',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `A unitless \`line-height\` multiplies the element's own \`font-size\`: \`${fontPx}px × ${lineMult} = ${correct}px\`.`,
    };
  }

  if (template === 7) {
    const mBottom = randInt(16, 64);
    const mTop = randInt(12, 60);
    const collapsed = Math.max(mBottom, mTop);
    const { opts, ans } = mcqFromNumeric(collapsed, 'px', '', 8);
    return {
      text: `[HTML/CSS] In normal block flow, Paragraph A has \`margin-bottom: ${mBottom}px\` and the immediately following sibling Paragraph B has \`margin-top: ${mTop}px\`. Due to vertical margin collapsing, what is the vertical gap between their border boxes?`,
      opts,
      ans,
      cat: 'CSS Layout & Box Model',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `Adjacent vertical margins of block-level siblings collapse to the larger of the two positive margins: \`max(${mBottom}px, ${mTop}px) = ${collapsed}px\`.`,
    };
  }

  if (template === 8) {
    const totalCols = randInt(4, 12);
    const span = randInt(2, totalCols - 1);
    const remaining = totalCols - span;
    const { opts, ans } = mcqFromNumeric(remaining, ' columns', '', 1);
    return {
      text: `[HTML/CSS] A table row has ${totalCols} total column cells. If the first \`<td>\` uses \`colspan="${span}"\`, how many additional single-column \`<td>\` elements are needed to complete the row?`,
      opts,
      ans,
      cat: 'Forms, Lists & Tables',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `A cell with \`colspan="${span}"\` occupies ${span} columns, leaving \`${totalCols} - ${span} = ${remaining}\` columns in that row.`,
    };
  }

  if (template === 9) {
    const aspectW = [16, 4, 3, 21][randInt(0, 3)];
    const aspectH = aspectW === 16 ? 9 : aspectW === 4 ? 3 : aspectW === 3 ? 2 : 9;
    const mult = randInt(20, 80);
    const widthPx = aspectW * mult;
    const heightPx = aspectH * mult;
    const { opts, ans } = mcqFromNumeric(heightPx, 'px', '', 20);
    return {
      text: `[HTML/CSS] An element has \`width: ${widthPx}px; aspect-ratio: ${aspectW} / ${aspectH}; height: auto;\`. What is its computed height?`,
      opts,
      ans,
      cat: 'CSS Layout & Box Model',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `With \`aspect-ratio: ${aspectW} / ${aspectH}\`, \`height = width × (${aspectH} / ${aspectW}) = ${widthPx} × (${aspectH} / ${aspectW}) = ${heightPx}px\`.`,
    };
  }

  if (template === 10) {
    const a = randInt(3, 10);
    const b = randInt(1, a - 1);
    const totalItems = randInt(25, 65);
    const matchCount = Math.floor((totalItems - b) / a) + 1;
    const { opts, ans } = mcqFromNumeric(matchCount, ' elements', '', 1);
    return {
      text: `[HTML/CSS] A \`<ul>\` contains ${totalItems} \`<li>\` items (1-indexed from 1 to ${totalItems}). How many \`<li>\` elements match \`li:nth-child(${a}n + ${b})\` for \`n >= 0\`?`,
      opts,
      ans,
      cat: 'Selectors & Styling',
      difficulty: 'hard',
      templateId,
      isProcedural: true,
      exp: `\`${a}n + ${b}\` matches 1-based indices \`${b}, ${a + b}, ${2 * a + b}, ... <= ${totalItems}\`. The number of non-negative integers \`n\` satisfying \`${a}n + ${b} <= ${totalItems}\` is \`floor((${totalItems} - ${b}) / ${a}) + 1 = ${matchCount}\`.`,
    };
  }

  const parentEm = [14, 16, 18, 20, 24][randInt(0, 4)];
  const childEm = [1.5, 2, 2.5, 3][randInt(0, 3)];
  const correct = parentEm * childEm;
  const { opts, ans } = mcqFromNumeric(correct, 'px', '', 10);
  return {
    text: `[HTML/CSS] A parent \`<div>\` has computed \`font-size: ${parentEm}px\`, and its child \`<span>\` has \`font-size: ${childEm}em\`. What is the computed font size of the \`<span>\`?`,
    opts,
    ans,
    cat: 'Selectors & Styling',
    difficulty: 'easy',
    templateId,
    isProcedural: true,
    exp: `For \`font-size\`, \`1em\` equals the parent element's computed \`font-size\` (\`${parentEm}px\`). Thus \`${childEm}em = ${childEm} × ${parentEm}px = ${correct}px\`.`,
  };
}

/* ============================================================================
   6. CRT APTITUDE PROCEDURAL GENERATOR (12 DIVERSE TEMPLATES)
   ============================================================================ */
const CRT_TEMPLATE_COUNT = 12;

function genCrtQuestion(templateIdx?: number): Question {
  const template =
    templateIdx !== undefined
      ? ((templateIdx % CRT_TEMPLATE_COUNT) + CRT_TEMPLATE_COUNT) % CRT_TEMPLATE_COUNT
      : randInt(0, CRT_TEMPLATE_COUNT - 1);
  const templateId = `crt-tpl-${template}`;

  if (template === 0) {
    const speed = randInt(25, 105);
    const time = randInt(2, 9);
    const dist = speed * time;
    const { opts, ans } = mcqFromNumeric(dist, ' km', '', 10);
    return {
      text: `[CRT] A vehicle travels at a uniform speed of ${speed} km/h for ${time} hours. What total distance does it cover?`,
      opts,
      ans,
      cat: 'Time, Speed & Distance',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `Distance = Speed × Time = ${speed} km/h × ${time} h = ${dist} km.`,
    };
  }

  if (template === 1) {
    const p = randInt(12, 98) * 100;
    const r = randInt(4, 18);
    const t = randInt(2, 7);
    const si = (p * r * t) / 100;
    const { opts, ans } = mcqFromNumeric(si, '', '₹', 50);
    return {
      text: `[CRT] Find the simple interest on ₹${p} at ${r}% per annum for ${t} years.`,
      opts,
      ans,
      cat: 'Profit, Loss & Interest',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `Simple Interest SI = (P × R × T) / 100 = (${p} × ${r} × ${t}) / 100 = ₹${si}.`,
    };
  }

  if (template === 2) {
    const pct = randInt(10, 90);
    const base = randInt(4, 75) * 20;
    const val = (base * pct) / 100;
    const { opts, ans } = mcqFromNumeric(val, '', '', 1);
    return {
      text: `[CRT] What is ${pct}% of ${base}?`,
      opts,
      ans,
      cat: 'Quantitative & Number System',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `${pct}% of ${base} = (${pct} / 100) × ${base} = ${val}.`,
    };
  }

  if (template === 3) {
    const n = randInt(4, 6);
    const baseAvg = randInt(20, 95);
    const offsets =
      n === 4 ? [-6, -2, 2, 6] : n === 5 ? [-8, -4, 0, 4, 8] : [-10, -6, -2, 2, 6, 10];
    const nums = shuffleArray(offsets.map((o) => baseAvg + o));
    const sum = nums.reduce((a, b) => a + b, 0);
    const { opts, ans } = mcqFromNumeric(baseAvg, '', '', 1);
    return {
      text: `[CRT] Find the arithmetic mean (average) of the numbers: ${nums.join(', ')}.`,
      opts,
      ans,
      cat: 'Quantitative & Number System',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `Sum of the ${n} numbers = ${nums.join(' + ')} = ${sum}. Average = Sum / ${n} = ${sum} / ${n} = ${baseAvg}.`,
    };
  }

  if (template === 4) {
    const cp = randInt(15, 95) * 20;
    const profitPct = randInt(5, 55);
    const sp = (cp * (100 + profitPct)) / 100;
    const { opts, ans } = mcqFromNumeric(profitPct, '%', '', 1);
    return {
      text: `[CRT] A trader buys an article for ₹${cp} and sells it for ₹${sp}. What is the profit percentage?`,
      opts,
      ans,
      cat: 'Profit, Loss & Interest',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `Profit = SP - CP = ${sp} - ${cp} = ₹${sp - cp}. Profit % = (${sp - cp} / ${cp}) × 100 = ${profitPct}%.`,
    };
  }

  if (template === 5) {
    const a = randInt(2, 25);
    const d = randInt(3, 19);
    const seq = Array.from({ length: 5 }, (_, i) => a + i * d);
    const next = a + 5 * d;
    const { opts, ans } = mcqFromNumeric(next);
    return {
      text: `[CRT] Find the next term in the arithmetic progression: ${seq.join(', ')}, ?`,
      opts,
      ans,
      cat: 'Series & Coding-Decoding',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `Each consecutive term increases by a constant common difference of +${d}. Therefore, the next term is ${seq[4]} + ${d} = ${next}.`,
    };
  }

  if (template === 6) {
    const speedMs = randInt(10, 40);
    const timeSec = randInt(8, 32);
    const lengthM = speedMs * timeSec;
    const speedKmh = (speedMs * 18) / 5;
    const { opts, ans } = mcqFromNumeric(lengthM, ' m', '', 20);
    return {
      text: `[CRT] A train running at ${speedKmh} km/h (${speedMs} m/s) crosses a signal pole in ${timeSec} seconds. What is the length of the train?`,
      opts,
      ans,
      cat: 'Time, Speed & Distance',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `Speed in m/s = ${speedKmh} × (5/18) = ${speedMs} m/s. Length of the train = Speed × Time = ${speedMs} × ${timeSec} = ${lengthM} m.`,
    };
  }

  if (template === 7) {
    const k = randInt(2, 9);
    const aDays = k * 3;
    const bDays = k * 6;
    const together = k * 2;
    const { opts, ans } = mcqFromNumeric(together, ' days', '', 1);
    return {
      text: `[CRT] Worker A can finish a project in ${aDays} days and Worker B can finish the same project in ${bDays} days. Working together, how many days will they take to complete it?`,
      opts,
      ans,
      cat: 'Time & Work',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `Combined 1-day work = 1/${aDays} + 1/${bDays} = 3/${bDays} = 1/${together}. Thus working together they finish in ${together} days.`,
    };
  }

  if (template === 8) {
    const r1 = randInt(2, 7);
    const r2 = randInt(r1 + 1, 11);
    const unit = randInt(6, 28);
    const total = (r1 + r2) * unit;
    const largerShare = r2 * unit;
    const { opts, ans } = mcqFromNumeric(largerShare, '', '₹', 10);
    return {
      text: `[CRT] A sum of ₹${total} is divided between P and Q in the ratio ${r1} : ${r2}. What is the larger share (Q's share)?`,
      opts,
      ans,
      cat: 'Quantitative & Number System',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `Total ratio parts = ${r1} + ${r2} = ${r1 + r2}. Value of 1 part = ₹${total} / ${r1 + r2} = ₹${unit}. Larger share = ${r2} × ₹${unit} = ₹${largerShare}.`,
    };
  }

  if (template === 9) {
    const boatSpeed = randInt(10, 28);
    const streamSpeed = randInt(2, boatSpeed - 4);
    const downSpeed = boatSpeed + streamSpeed;
    const hours = randInt(2, 6);
    const dist = downSpeed * hours;
    const { opts, ans } = mcqFromNumeric(dist, ' km', '', 5);
    return {
      text: `[CRT] A boat's speed in still water is ${boatSpeed} km/h and the speed of the river current is ${streamSpeed} km/h. How far will the boat travel downstream in ${hours} hours?`,
      opts,
      ans,
      cat: 'Time, Speed & Distance',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `Downstream speed = Boat speed + Stream speed = ${boatSpeed} + ${streamSpeed} = ${downSpeed} km/h. Distance in ${hours} hours = ${downSpeed} × ${hours} = ${dist} km.`,
    };
  }

  if (template === 10) {
    const a = randInt(2, 6);
    const r = [2, 3][randInt(0, 1)];
    const seq = [a, a * r, a * r * r, a * r * r * r];
    const next = a * Math.pow(r, 4);
    const { opts, ans } = mcqFromNumeric(next, '', '', 2);
    return {
      text: `[CRT] Find the next number in the geometric series: ${seq.join(', ')}, ?`,
      opts,
      ans,
      cat: 'Series & Coding-Decoding',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `Each term is multiplied by a common ratio of ${r}. Therefore the 5th term is ${seq[3]} × ${r} = ${next}.`,
    };
  }

  const m1 = randInt(6, 20);
  const d1 = randInt(6, 18);
  const m2 = randInt(3, 15);
  const totalManDays = m1 * d1 * m2;
  // Ensure exact integer division
  const workers1 = m1 * m2;
  const days1 = d1;
  const workers2 = m1 * d1;
  const days2 = m2;
  const { opts, ans } = mcqFromNumeric(days2, ' days', '', 1);
  return {
    text: `[CRT] If ${workers1} workers can build a wall in ${days1} days working at the same pace, how many days will ${workers2} workers take to build the same wall?`,
    opts,
    ans,
    cat: 'Time & Work',
    difficulty: 'medium',
    templateId,
    isProcedural: true,
    exp: `By the work equivalence formula M₁ × D₁ = M₂ × D₂ (${totalManDays} man-days): D₂ = (${workers1} × ${days1}) / ${workers2} = ${days2} days.`,
  };
}

/* ============================================================================
   7. GENERAL KNOWLEDGE (GK) PROCEDURAL & FACT COMBINATORIAL GENERATOR
   ============================================================================ */
interface GkFactEntry {
  cat: string;
  subject: string;
  attribute: string;
  value: string;
  detail: string;
}

const GK_FACT_POOL: GkFactEntry[] = [
  { cat: 'Science', subject: 'Carbon (C)', attribute: 'atomic number', value: '6', detail: 'Carbon has 6 protons in its atomic nucleus, placing it in Group 14 of the periodic table.' },
  { cat: 'Science', subject: 'Nitrogen (N)', attribute: 'atomic number', value: '7', detail: 'Nitrogen has 7 protons and makes up roughly 78% of Earth’s atmosphere by volume.' },
  { cat: 'Science', subject: 'Oxygen (O)', attribute: 'atomic number', value: '8', detail: 'Oxygen has 8 protons in its nucleus and is essential for aerobic cellular respiration.' },
  { cat: 'Science', subject: 'Neon (Ne)', attribute: 'atomic number', value: '10', detail: 'Neon is a noble gas with a complete octet and atomic number 10.' },
  { cat: 'Science', subject: 'Sodium (Na)', attribute: 'atomic number', value: '11', detail: 'Sodium is an alkali metal in Group 1 with 11 protons.' },
  { cat: 'Science', subject: 'Magnesium (Mg)', attribute: 'atomic number', value: '12', detail: 'Magnesium is an alkaline earth metal with atomic number 12, central to the chlorophyll molecule.' },
  { cat: 'Science', subject: 'Aluminium (Al)', attribute: 'atomic number', value: '13', detail: 'Aluminium has atomic number 13 and is the most abundant metal in Earth’s crust.' },
  { cat: 'Science', subject: 'Silicon (Si)', attribute: 'atomic number', value: '14', detail: 'Silicon (Z = 14) is a metalloid semiconductor fundamental to integrated circuits.' },
  { cat: 'Science', subject: 'Phosphorus (P)', attribute: 'atomic number', value: '15', detail: 'Phosphorus (Z = 15) is a key structural component of DNA, RNA, and ATP.' },
  { cat: 'Science', subject: 'Sulfur (S)', attribute: 'atomic number', value: '16', detail: 'Sulfur is a chalcogen non-metal with 16 protons.' },
  { cat: 'Science', subject: 'Chlorine (Cl)', attribute: 'atomic number', value: '17', detail: 'Chlorine is a reactive halogen in Group 17 with atomic number 17.' },
  { cat: 'Science', subject: 'Argon (Ar)', attribute: 'atomic number', value: '18', detail: 'Argon (Z = 18) is the third most abundant gas in Earth’s atmosphere.' },
  { cat: 'Science', subject: 'Potassium (K)', attribute: 'atomic number', value: '19', detail: 'Potassium (from Neo-Latin kalium) has atomic number 19.' },
  { cat: 'Science', subject: 'Calcium (Ca)', attribute: 'atomic number', value: '20', detail: 'Calcium (Z = 20) is vital for bone mineralization and muscle contraction.' },
  { cat: 'Science', subject: 'Iron (Fe)', attribute: 'atomic number', value: '26', detail: 'Iron is a transition metal with 26 protons, critical for oxygen transport in hemoglobin.' },
  { cat: 'Science', subject: 'Copper (Cu)', attribute: 'atomic number', value: '29', detail: 'Copper (Z = 29) is a high-conductivity transition metal.' },
  { cat: 'Science', subject: 'Zinc (Zn)', attribute: 'atomic number', value: '30', detail: 'Zinc (Z = 30) serves as an essential cofactor in hundreds of enzymes.' },
  { cat: 'Science', subject: 'Silver (Ag)', attribute: 'atomic number', value: '47', detail: 'Silver (argentum) has atomic number 47 and the highest electrical conductivity of any element.' },
  { cat: 'Science', subject: 'Gold (Au)', attribute: 'atomic number', value: '79', detail: 'Gold (aurum) has 79 protons and is prized for its chemical inertness.' },
  { cat: 'Polity', subject: 'Article 14 of the Indian Constitution', attribute: 'constitutional provision', value: 'Equality before Law', detail: 'Article 14 guarantees equality before the law and equal protection of the laws within India.' },
  { cat: 'Polity', subject: 'Article 15 of the Indian Constitution', attribute: 'constitutional provision', value: 'Prohibition of discrimination on grounds of religion, race, caste, sex or place of birth', detail: 'Article 15 forbids the State from discriminating against any citizen on these protected grounds.' },
  { cat: 'Polity', subject: 'Article 16 of the Indian Constitution', attribute: 'constitutional provision', value: 'Equality of opportunity in public employment', detail: 'Article 16 ensures equal opportunity for all citizens in matters relating to employment under the State.' },
  { cat: 'Polity', subject: 'Article 19 of the Indian Constitution', attribute: 'constitutional provision', value: 'Six Fundamental Freedoms including Speech & Expression', detail: 'Article 19(1) protects freedom of speech, assembly, association, movement, residence, and profession.' },
  { cat: 'Polity', subject: 'Article 21 of the Indian Constitution', attribute: 'constitutional provision', value: 'Protection of Life and Personal Liberty', detail: 'Article 21 declares that no person shall be deprived of life or personal liberty except according to procedure established by law.' },
  { cat: 'Polity', subject: 'Article 21A of the Indian Constitution', attribute: 'constitutional provision', value: 'Right to Elementary Education (ages 6 to 14)', detail: 'Inserted by the 86th Amendment Act (2002), Article 21A makes education a Fundamental Right for children aged 6–14.' },
  { cat: 'Polity', subject: 'Article 32 of the Indian Constitution', attribute: 'constitutional provision', value: 'Right to Constitutional Remedies (Writs)', detail: 'Called the "heart and soul" of the Constitution by Dr. Ambedkar, Article 32 empowers citizens to move the Supreme Court.' },
  { cat: 'Polity', subject: 'Article 40 of the Indian Constitution', attribute: 'constitutional provision', value: 'Organization of Village Panchayats', detail: 'Article 40 is a Gandhian Directive Principle directing the State to organize village panchayats.' },
  { cat: 'Polity', subject: 'Article 44 of the Indian Constitution', attribute: 'constitutional provision', value: 'Uniform Civil Code for citizens', detail: 'Article 44 in Part IV directs the State to endeavour to secure a Uniform Civil Code.' },
  { cat: 'Polity', subject: 'Article 51A of the Indian Constitution', attribute: 'constitutional provision', value: 'Fundamental Duties of citizens', detail: 'Added by the 42nd Amendment (1976) on the Swaran Singh Committee’s recommendation, Article 51A lists 11 Fundamental Duties.' },
  { cat: 'Polity', subject: 'Article 280 of the Indian Constitution', attribute: 'constitutional provision', value: 'Finance Commission of India', detail: 'Article 280 provides for a Finance Commission constituted by the President every fifth year.' },
  { cat: 'Polity', subject: 'Article 324 of the Indian Constitution', attribute: 'constitutional provision', value: 'Superintendence and control of Elections by the Election Commission', detail: 'Article 324 vests the direction and control of elections in the Election Commission of India.' },
  { cat: 'Polity', subject: 'Article 352 of the Indian Constitution', attribute: 'constitutional provision', value: 'Proclamation of National Emergency', detail: 'Article 352 empowers the President to proclaim a National Emergency on grounds of war, external aggression, or armed rebellion.' },
  { cat: 'Polity', subject: 'Article 368 of the Indian Constitution', attribute: 'constitutional provision', value: 'Power of Parliament to amend the Constitution', detail: 'Article 368 in Part XX lays down the procedure for constitutional amendments.' },
  { cat: 'Geography', subject: 'Canada', attribute: 'capital city', value: 'Ottawa', detail: 'Ottawa in Ontario is the federal capital of Canada.' },
  { cat: 'Geography', subject: 'Brazil', attribute: 'capital city', value: 'Brasília', detail: 'Brasília became Brazil’s planned federal capital in 1960.' },
  { cat: 'Geography', subject: 'Australia', attribute: 'capital city', value: 'Canberra', detail: 'Canberra is Australia’s purpose-built inland capital city.' },
  { cat: 'Geography', subject: 'Turkey', attribute: 'capital city', value: 'Ankara', detail: 'Ankara has been the capital of Turkey since 1923, while Istanbul is its largest city.' },
  { cat: 'Geography', subject: 'Morocco', attribute: 'capital city', value: 'Rabat', detail: 'Rabat is the political capital of Morocco, while Casablanca is its largest port city.' },
  { cat: 'Geography', subject: 'Nigeria', attribute: 'capital city', value: 'Abuja', detail: 'Abuja replaced Lagos as the federal capital of Nigeria in 1991.' },
  { cat: 'Geography', subject: 'Switzerland', attribute: 'de facto federal city (capital)', value: 'Bern', detail: 'Bern serves as the federal city (de facto capital) of Switzerland.' },
  { cat: 'Geography', subject: 'New Zealand', attribute: 'capital city', value: 'Wellington', detail: 'Wellington is the capital of New Zealand and the world’s southernmost capital of a sovereign state.' },
  { cat: 'Geography', subject: 'Kazakhstan', attribute: 'capital city', value: 'Astana', detail: 'Astana is the capital city of Kazakhstan.' },
  { cat: 'Geography', subject: 'Vietnam', attribute: 'capital city', value: 'Hanoi', detail: 'Hanoi on the Red River delta is the capital of Vietnam.' },
  { cat: 'History', subject: 'First Battle of Panipat (Babur vs Ibrahim Lodi)', attribute: 'year', value: '1526', detail: 'Fought on April 21, 1526, the First Battle of Panipat marked the beginning of the Mughal Empire in India.' },
  { cat: 'History', subject: 'Battle of Plassey (East India Company vs Siraj-ud-Daulah)', attribute: 'year', value: '1757', detail: 'Fought on June 23, 1757, Robert Clive’s victory at Plassey paved the way for British rule in Bengal.' },
  { cat: 'History', subject: 'Battle of Buxar', attribute: 'year', value: '1764', detail: 'The 1764 Battle of Buxar led to the Treaty of Allahabad (1765) granting Diwani rights to the British.' },
  { cat: 'History', subject: 'Foundation of the Indian National Congress', attribute: 'year', value: '1885', detail: 'The Indian National Congress held its first session in Bombay in December 1885 under W. C. Bonnerjee.' },
  { cat: 'History', subject: 'Partition of Bengal by Lord Curzon', attribute: 'year', value: '1905', detail: 'The 1905 Partition of Bengal triggered the Swadeshi and Boycott movements across India.' },
  { cat: 'History', subject: 'Champaran Satyagraha led by Mahatma Gandhi', attribute: 'year', value: '1917', detail: 'In 1917, Gandhi launched his first Satyagraha in India supporting indigo farmers in Champaran, Bihar.' },
  { cat: 'History', subject: 'Dandi Salt March (Civil Disobedience Movement)', attribute: 'year', value: '1930', detail: 'Mahatma Gandhi marched from Sabarmati Ashram to Dandi in March–April 1930 to break the salt law.' },
  { cat: 'History', subject: 'Quit India Movement resolution', attribute: 'year', value: '1942', detail: 'Launched on August 8, 1942 in Bombay with the call "Do or Die".' },
  { cat: 'Economy', subject: 'Reserve Bank of India (RBI)', attribute: 'establishment year', value: '1935', detail: 'The RBI was established on April 1, 1935 under the Reserve Bank of India Act, 1934.' },
  { cat: 'Economy', subject: 'NABARD (National Bank for Agriculture and Rural Development)', attribute: 'establishment year', value: '1982', detail: 'NABARD was established on July 12, 1982 on the recommendations of the B. Sivaraman Committee.' },
  { cat: 'Economy', subject: 'SEBI (statutory powers under SEBI Act)', attribute: 'statutory year', value: '1992', detail: 'SEBI was given statutory powers on January 30, 1992 through the SEBI Act, 1992.' },
  { cat: 'Economy', subject: 'Goods and Services Tax (GST) launch in India', attribute: 'implementation year', value: '2017', detail: 'GST came into effect across India on July 1, 2017 via the 101st Constitutional Amendment Act.' },
  { cat: 'Sports', subject: 'Basketball (per team on court)', attribute: 'number of active players', value: '5 players', detail: 'Each basketball team fields 5 active players on the court at a time.' },
  { cat: 'Sports', subject: 'Volleyball (per team on court)', attribute: 'number of active players', value: '6 players', detail: 'Each volleyball team has 6 players on the court (3 front row, 3 back row).' },
  { cat: 'Sports', subject: 'Kabaddi (per team on court)', attribute: 'number of active players', value: '7 players', detail: 'Standard style Kabaddi features 7 active players on the court per side.' },
  { cat: 'Sports', subject: 'Baseball (per team on field)', attribute: 'number of defensive players', value: '9 players', detail: 'A baseball team fields 9 defensive positions simultaneously.' },
  { cat: 'Sports', subject: 'Rugby Union (per team on pitch)', attribute: 'number of active players', value: '15 players', detail: 'Rugby Union is played with 15 players on the field per team (8 forwards and 7 backs).' },
  { cat: 'Space & Tech', subject: 'Aryabhata (India’s first satellite)', attribute: 'launch year', value: '1975', detail: 'ISRO’s first satellite Aryabhata was launched on April 19, 1975.' },
  { cat: 'Space & Tech', subject: 'Chandrayaan-1 (India’s first lunar orbiter)', attribute: 'launch year', value: '2008', detail: 'Launched in October 2008 by PSLV-C11, Chandrayaan-1 confirmed water molecules on the Moon.' },
  { cat: 'Space & Tech', subject: 'Mangalyaan (Mars Orbiter Mission)', attribute: 'launch year', value: '2013', detail: 'Launched in November 2013, Mangalyaan entered Mars orbit in September 2014 on India’s maiden attempt.' },
  { cat: 'Space & Tech', subject: 'James Webb Space Telescope (JWST)', attribute: 'launch year', value: '2021', detail: 'JWST launched on December 25, 2021 to observe the infrared universe from the Sun-Earth L2 point.' },
  { cat: 'World Organizations', subject: 'UNESCO', attribute: 'headquarters city', value: 'Paris, France', detail: 'The United Nations Educational, Scientific and Cultural Organization is based in Paris, France.' },
  { cat: 'World Organizations', subject: 'International Court of Justice (ICJ)', attribute: 'headquarters city', value: 'The Hague, Netherlands', detail: 'The ICJ sits at the Peace Palace in The Hague, Netherlands.' },
  { cat: 'World Organizations', subject: 'International Atomic Energy Agency (IAEA)', attribute: 'headquarters city', value: 'Vienna, Austria', detail: 'The IAEA ("Atoms for Peace and Development") is headquartered in Vienna, Austria.' },
  { cat: 'World Organizations', subject: 'Food and Agriculture Organization (FAO)', attribute: 'headquarters city', value: 'Rome, Italy', detail: 'The UN Food and Agriculture Organization is headquartered in Rome, Italy.' },
  { cat: 'World Organizations', subject: 'Asian Development Bank (ADB)', attribute: 'headquarters city', value: 'Mandaluyong (Manila), Philippines', detail: 'Founded in 1966, the ADB is headquartered in Metro Manila, Philippines.' },
  { cat: 'Awards & Honours', subject: 'C. V. Raman (Nobel Prize in Physics for Raman Effect)', attribute: 'award year', value: '1930', detail: 'Sir C. V. Raman received the 1930 Nobel Prize in Physics for discovering inelastic scattering of light.' },
  { cat: 'Awards & Honours', subject: 'Har Gobind Khorana (Nobel Prize in Physiology or Medicine)', attribute: 'award year', value: '1968', detail: 'Dr. Har Gobind Khorana shared the 1968 Nobel Prize for interpreting the genetic code and its role in protein synthesis.' },
  { cat: 'Awards & Honours', subject: 'Amartya Sen (Nobel Memorial Prize in Economic Sciences)', attribute: 'award year', value: '1998', detail: 'Amartya Sen was awarded the 1998 Economics Nobel for his contributions to welfare economics and social choice theory.' },
  { cat: 'Awards & Honours', subject: 'First Bharat Ratna awards (Radhakrishnan, Rajagopalachari, Raman)', attribute: 'institution year', value: '1954', detail: 'India’s highest civilian award, the Bharat Ratna, was instituted in 1954.' },
  { cat: 'Books & Authors', subject: 'Arthashastra (ancient treatise on statecraft and economic policy)', attribute: 'author', value: 'Kautilya (Chanakya)', detail: 'Kautilya (also known as Vishnugupta or Chanakya) authored the Sanskrit treatise Arthashastra.' },
  { cat: 'Books & Authors', subject: 'Meghaduta and Abhijnanashakuntalam', attribute: 'author', value: 'Kalidasa', detail: 'Kalidasa composed the classical Sanskrit masterpieces Meghaduta and Abhijnanashakuntalam.' },
  { cat: 'Books & Authors', subject: 'Poverty and Un-British Rule in India', attribute: 'author', value: 'Dadabhai Naoroji', detail: 'Dadabhai Naoroji ("Grand Old Man of India") propounded the Drain of Wealth theory in this landmark work.' },
  { cat: 'Books & Authors', subject: 'Godaan (classic Hindi novel)', attribute: 'author', value: 'Munshi Premchand', detail: 'Published in 1936, Godaan is considered Munshi Premchand’s greatest Hindi novel.' },
  { cat: 'Art & Culture', subject: 'Sattriya (classical Indian dance form)', attribute: 'state of origin', value: 'Assam', detail: 'Sattriya was introduced in the 15th century by Mahapurusha Srimanta Sankardeva in the Sattras of Assam.' },
  { cat: 'Art & Culture', subject: 'Kuchipudi (classical Indian dance-drama)', attribute: 'state of origin', value: 'Andhra Pradesh', detail: 'Kuchipudi originated in the village of Kuchipudi in Krishna district, Andhra Pradesh.' },
  { cat: 'Art & Culture', subject: 'Kathak (classical dance form of North India)', attribute: 'state of origin', value: 'Uttar Pradesh', detail: 'Kathak evolved from ancient storytellers (Kathakars) and flourished in the courts of Uttar Pradesh.' },
  { cat: 'Art & Culture', subject: 'Mohiniyattam (classical solo dance)', attribute: 'state of origin', value: 'Kerala', detail: 'Mohiniyattam is one of the two classical dance forms originating in Kerala, alongside Kathakali.' },
  { cat: 'Environment', subject: 'Project Tiger conservation programme in India', attribute: 'launch year', value: '1973', detail: 'Project Tiger was launched by the Government of India in April 1973 from Jim Corbett National Park.' },
  { cat: 'Environment', subject: 'Wildlife Protection Act of India', attribute: 'enactment year', value: '1972', detail: 'The Wildlife (Protection) Act, 1972 provides the statutory framework for national parks and sanctuaries in India.' },
  { cat: 'Environment', subject: 'Montreal Protocol on Substances that Deplete the Ozone Layer', attribute: 'adoption year', value: '1987', detail: 'Signed in September 1987, the Montreal Protocol phases out ozone-depleting CFCs and halons.' },
  { cat: 'Environment', subject: 'Ramsar Convention on Wetlands of International Importance', attribute: 'adoption year', value: '1971', detail: 'Signed in Ramsar, Iran in 1971, the treaty provides the framework for wetland conservation.' },
  { cat: 'Computers & Tech', subject: 'IPv4 network address', attribute: 'bit length', value: '32 bits', detail: 'An IPv4 address consists of 4 octets (4 × 8 = 32 bits), typically written in dotted-decimal notation.' },
  { cat: 'Computers & Tech', subject: 'IPv6 network address', attribute: 'bit length', value: '128 bits', detail: 'An IPv6 address uses 128 bits written as eight 16-bit hexadecimal groups.' },
  { cat: 'Computers & Tech', subject: 'Standard HTTPS (HTTP over TLS/SSL)', attribute: 'default TCP port', value: 'Port 443', detail: 'HTTPS traffic uses TCP port 443 by default, whereas unencrypted HTTP uses port 80.' },
  { cat: 'Computers & Tech', subject: 'SSH (Secure Shell)', attribute: 'default TCP port', value: 'Port 22', detail: 'SSH remote administration connections use TCP port 22 by default.' },
  { cat: 'General', subject: 'National Science Day in India (commemorating discovery of Raman Effect)', attribute: 'annual observance date', value: 'February 28', detail: 'February 28 marks the day in 1928 when Sir C. V. Raman discovered the Raman Effect.' },
  { cat: 'General', subject: 'World Environment Day led by UNEP', attribute: 'annual observance date', value: 'June 5', detail: 'World Environment Day is celebrated annually on June 5 since 1973.' },
  { cat: 'General', subject: 'National Constitution Day (Samvidhan Divas) in India', attribute: 'annual observance date', value: 'November 26', detail: 'On November 26, 1949, the Constituent Assembly of India formally adopted the Constitution.' },
  { cat: 'General', subject: 'International Yoga Day proclaimed by the UN General Assembly', attribute: 'annual observance date', value: 'June 21', detail: 'June 21 (the northern summer solstice) is observed globally as International Day of Yoga.' },
];

const GK_TEMPLATE_COUNT = 10;

function genGkQuestion(targetCategory?: string | null, templateIdx?: number): Question {
  const cat =
    targetCategory && targetCategory !== 'All' ? targetCategory : undefined;
  const template =
    templateIdx !== undefined
      ? ((templateIdx % GK_TEMPLATE_COUNT) + GK_TEMPLATE_COUNT) % GK_TEMPLATE_COUNT
      : randInt(0, GK_TEMPLATE_COUNT - 1);

  if ((!cat || cat === 'Computers & Tech') && (template === 0 || (cat === 'Computers & Tech' && Math.random() < 0.5))) {
    const expPower = randInt(4, 15);
    const val = 1 << expPower;
    const { opts, ans } = mcqFromNumeric(val, ' values', '', 4);
    return {
      text: `[GK · Computers & Tech] How many distinct unsigned states can be represented by an ${expPower}-bit binary register (2^${expPower})?`,
      opts,
      ans,
      cat: 'Computers & Tech',
      difficulty: 'medium',
      templateId: 'gk-tpl-binary-states',
      isProcedural: true,
      exp: `An n-bit binary register can represent 2^n distinct patterns. For n = ${expPower}, 2^${expPower} = ${val} distinct values (from 0 to ${val - 1}).`,
    };
  }

  if ((!cat || cat === 'Polity') && (template === 1 || (cat === 'Polity' && Math.random() < 0.5))) {
    const totalSeats = randInt(12, 54) * 10;
    const quorum = Math.round(totalSeats / 10);
    const { opts, ans } = mcqFromNumeric(quorum, ' members', '', 5);
    return {
      text: `[GK · Polity] Under Article 100(3) of the Indian Constitution, the quorum to constitute a meeting of a House is one-tenth (1/10th) of total strength. For a legislative chamber of ${totalSeats} members, what is the minimum quorum?`,
      opts,
      ans,
      cat: 'Polity',
      difficulty: 'easy',
      templateId: 'gk-tpl-polity-quorum',
      isProcedural: true,
      exp: `Constitutional quorum is 1/10 of the total membership of the House: ${totalSeats} / 10 = ${quorum} members.`,
    };
  }

  if ((!cat || cat === 'Economy') && (template === 2 || (cat === 'Economy' && Math.random() < 0.5))) {
    const nominalGrowth = randInt(7, 16);
    const inflation = randInt(2, 6);
    const realGrowth = nominalGrowth - inflation;
    const { opts, ans } = mcqFromNumeric(realGrowth, '%', '', 1);
    return {
      text: `[GK · Economy] If an economy records a nominal GDP growth rate of ${nominalGrowth}% and an annual GDP deflator (inflation rate) of ${inflation}%, what is the approximate real GDP growth rate?`,
      opts,
      ans,
      cat: 'Economy',
      difficulty: 'medium',
      templateId: 'gk-tpl-economy-gdp',
      isProcedural: true,
      exp: `By the Fisher approximation, Real GDP Growth ≈ Nominal GDP Growth - Inflation Rate = ${nominalGrowth}% - ${inflation}% = ${realGrowth}%.`,
    };
  }

  if ((!cat || cat === 'Geography') && (template === 3 || (cat === 'Geography' && Math.random() < 0.5))) {
    const degDiff = randInt(5, 85);
    const isEast = (degDiff % 2) === 0;
    const mins = degDiff * 4;
    const { opts, ans } = mcqFromNumeric(mins, ' minutes', '', 4);
    return {
      text: `[GK · Geography] Since Earth rotates 360° in 24 hours (1° every 4 minutes), what is the local solar time difference between two meridians separated by ${degDiff}° of longitude (${isEast ? 'East' : 'West'})?`,
      opts,
      ans,
      cat: 'Geography',
      difficulty: 'medium',
      templateId: 'gk-tpl-geography-longitude',
      isProcedural: true,
      exp: `Earth rotates 15° per hour, or 1° every 4 minutes. A longitudinal separation of ${degDiff}° corresponds to ${degDiff} × 4 = ${mins} minutes.`,
    };
  }

  if ((!cat || cat === 'Science') && (template === 4 || (cat === 'Science' && Math.random() < 0.45))) {
    const celsius = randInt(-20, 120);
    const kelvin = celsius + 273;
    const { opts, ans } = mcqFromNumeric(kelvin, ' K', '', 100);
    return {
      text: `[GK · Science] Convert a temperature of ${celsius} °C to the absolute Kelvin scale (using 0 °C ≈ 273 K).`,
      opts,
      ans,
      cat: 'Science',
      difficulty: 'easy',
      templateId: 'gk-tpl-science-kelvin',
      isProcedural: true,
      exp: `Temperature in Kelvin K = °C + 273 = ${celsius} + 273 = ${kelvin} K.`,
    };
  }

  if ((!cat || cat === 'Polity') && template === 5) {
    const presentVoting = randInt(15, 45) * 6;
    const twoThirds = (presentVoting * 2) / 3;
    const { opts, ans } = mcqFromNumeric(twoThirds, ' votes', '', 10);
    return {
      text: `[GK · Polity] Under Article 368, a special majority requires at least two-thirds (2/3) of members present and voting. If ${presentVoting} members are present and voting in a House, how many affirmative votes are required for the 2/3 threshold?`,
      opts,
      ans,
      cat: 'Polity',
      difficulty: 'medium',
      templateId: 'gk-tpl-polity-special-majority',
      isProcedural: true,
      exp: `Two-thirds of ${presentVoting} members present and voting = (2/3) × ${presentVoting} = ${twoThirds} affirmative votes.`,
    };
  }

  if ((!cat || cat === 'Environment') && template === 6) {
    const producerKcal = randInt(2, 25) * 1000;
    const secondaryConsumer = producerKcal / 100;
    const { opts, ans } = mcqFromNumeric(secondaryConsumer, ' kcal', '', 5);
    return {
      text: `[GK · Environment] According to Lindeman’s 10% energy transfer law in food chains, if primary producers fix ${producerKcal} kcal of solar energy, how much energy reaches secondary consumers (two trophic transfers higher)?`,
      opts,
      ans,
      cat: 'Environment',
      difficulty: 'medium',
      templateId: 'gk-tpl-env-lindeman',
      isProcedural: true,
      exp: `Primary consumers (herbivores) receive 10% of ${producerKcal} = ${producerKcal / 10} kcal, and secondary consumers receive 10% of that = ${secondaryConsumer} kcal.`,
    };
  }

  const matchingFacts = cat
    ? GK_FACT_POOL.filter((f) => f.cat === cat)
    : GK_FACT_POOL;
  const pool = matchingFacts.length > 0 ? matchingFacts : GK_FACT_POOL;
  const chosen = pool[randInt(0, pool.length - 1)];

  const sameAttrPeers = GK_FACT_POOL.filter(
    (f) => f.attribute === chosen.attribute && f.value !== chosen.value
  ).map((f) => f.value);
  const sameCatPeers = GK_FACT_POOL.filter(
    (f) => f.cat === chosen.cat && f.value !== chosen.value
  ).map((f) => f.value);

  const { opts, ans } = mcqFromStrings(chosen.value, [
    ...sameAttrPeers,
    ...sameCatPeers,
  ]);

  // Clean question stem with NO artificial #variantId tag
  return {
    text: `[GK · ${chosen.cat}] What is the ${chosen.attribute} associated with ${chosen.subject}?`,
    opts,
    ans,
    cat: chosen.cat,
    difficulty: 'medium',
    templateId: `gk-fact-${chosen.cat.toLowerCase().replace(/[^a-z]+/g, '-')}`,
    isProcedural: true,
    exp: chosen.detail,
  };
}

/* ============================================================================
   8. NEET PROCEDURAL GENERATOR (12 DIVERSE TEMPLATES)
   ============================================================================ */
const NEET_TEMPLATE_COUNT = 12;

function genNeetQuestion(templateIdx?: number): Question {
  const template =
    templateIdx !== undefined
      ? ((templateIdx % NEET_TEMPLATE_COUNT) + NEET_TEMPLATE_COUNT) % NEET_TEMPLATE_COUNT
      : randInt(0, NEET_TEMPLATE_COUNT - 1);
  const templateId = `neet-tpl-${template}`;

  if (template === 0) {
    const adeninePct = randInt(12, 38);
    const gcTotal = 100 - 2 * adeninePct;
    const cytosinePct = gcTotal / 2;
    const { opts, ans } = mcqFromNumeric(cytosinePct, '%', '', 2);
    return {
      text: `[NEET · Biology] In a double-stranded B-DNA molecule, if Adenine (A) constitutes ${adeninePct}% of the total nitrogenous bases, what is the percentage of Cytosine (C) according to Chargaff's rule?`,
      opts,
      ans,
      cat: 'Genetics & Molecular Biology',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `By Chargaff's rule in dsDNA, %A = %T = ${adeninePct}%, which accounts for 2 × ${adeninePct}% = ${2 * adeninePct}%. The remaining ${gcTotal}% is split equally between Guanine and Cytosine (%G = %C = ${gcTotal} / 2 = ${cytosinePct}%).`,
    };
  }

  if (template === 1) {
    const unit = randInt(6, 65);
    const total = unit * 4;
    const dominant = unit * 3;
    const { opts, ans } = mcqFromNumeric(dominant, ' offspring', '', 4);
    return {
      text: `[NEET · Genetics] In a Mendelian monohybrid F₂ cross (Aa × Aa) producing ${total} total offspring, how many individuals are expected to exhibit the dominant phenotype?`,
      opts,
      ans,
      cat: 'Genetics & Molecular Biology',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `A monohybrid heterozygous cross (Aa × Aa) yields a 3:1 phenotypic ratio (3/4 dominant, 1/4 recessive). Out of ${total} offspring, (3/4) × ${total} = ${dominant} show the dominant trait.`,
    };
  }

  if (template === 2) {
    const strokeVol = randInt(60, 98);
    const heartRate = randInt(62, 98);
    const cardiacOutputMl = strokeVol * heartRate;
    const { opts, ans } = mcqFromNumeric(cardiacOutputMl, ' mL/min', '', 1000);
    return {
      text: `[NEET · Human Physiology] If a person's left ventricle has a stroke volume of ${strokeVol} mL and their heart beats at ${heartRate} beats per minute, what is their cardiac output?`,
      opts,
      ans,
      cat: 'Human Physiology',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `Cardiac Output = Stroke Volume × Heart Rate = ${strokeVol} mL/beat × ${heartRate} beats/min = ${cardiacOutputMl} mL/min.`,
    };
  }

  if (template === 3) {
    const generations = randInt(3, 9);
    const finalCells = Math.pow(2, generations);
    const { opts, ans } = mcqFromNumeric(finalCells, ' cells', '', 4);
    return {
      text: `[NEET · Cell Cycle] A single somatic cell undergoes ${generations} successive mitotic divisions without cell loss. How many daughter cells are formed at the end?`,
      opts,
      ans,
      cat: 'Cell Biology',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `Each mitotic division doubles the cell number. After n = ${generations} generations, the number of cells is 2^${generations} = ${finalCells} cells.`,
    };
  }

  if (template === 4) {
    const volLiters = [1, 2, 4, 5][randInt(0, 3)];
    const molarity = randInt(1, 6);
    const moles = volLiters * molarity;
    const molarMass = [40, 58, 98, 100, 180][randInt(0, 4)];
    const massGrams = moles * molarMass;
    const { opts, ans } = mcqFromNumeric(molarity, ' M', '', 1);
    return {
      text: `[NEET · Chemistry] Calculate the molarity (M) of a solution prepared by dissolving ${massGrams} g of a solute (molar mass = ${molarMass} g/mol) in ${volLiters} L of solution.`,
      opts,
      ans,
      cat: 'Chemistry',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `Number of moles n = Mass / Molar Mass = ${massGrams} / ${molarMass} = ${moles} mol. Molarity M = n / V(L) = ${moles} / ${volLiters} = ${molarity} M.`,
    };
  }

  if (template === 5) {
    const objMag = [10, 20, 40, 60, 100][randInt(0, 4)];
    const eyeMag = [5, 10, 12, 15, 20][randInt(0, 4)];
    const totalMag = objMag * eyeMag;
    const { opts, ans } = mcqFromNumeric(totalMag, 'x', '', 10);
    return {
      text: `[NEET · Biology] A compound light microscope uses an objective lens of ${objMag}x magnification and an ocular (eyepiece) lens of ${eyeMag}x magnification. What is the total magnification?`,
      opts,
      ans,
      cat: 'Cell Biology',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `Total magnification of a compound microscope = Objective Magnification × Eyepiece Magnification = ${objMag}x × ${eyeMag}x = ${totalMag}x.`,
    };
  }

  if (template === 6) {
    const q = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8][randInt(0, 7)];
    const p = Number((1 - q).toFixed(1));
    const heteroPct = Math.round(2 * p * q * 100);
    const { opts, ans } = mcqFromNumeric(heteroPct, '%', '', 1);
    return {
      text: `[NEET · Genetics] In a population in Hardy-Weinberg equilibrium, the frequency of the recessive allele (q) is ${q} and the dominant allele (p) is ${p}. What percentage of the population consists of heterozygous carriers (2pq)?`,
      opts,
      ans,
      cat: 'Genetics & Molecular Biology',
      difficulty: 'hard',
      templateId,
      isProcedural: true,
      exp: `By the Hardy-Weinberg equation p² + 2pq + q² = 1, heterozygous carrier frequency = 2pq = 2 × ${p} × ${q} = ${(2 * p * q).toFixed(2)} (${heteroPct}%).`,
    };
  }

  if (template === 7) {
    const aminoAcids = randInt(15, 180);
    const codingNucleotides = aminoAcids * 3;
    const withStop = codingNucleotides + 3;
    const { opts, ans } = mcqFromNumeric(withStop, ' nucleotides', '', 10);
    return {
      text: `[NEET · Molecular Biology] A functional polypeptide chain consists of ${aminoAcids} amino acids. Including one termination (stop) codon, how many ribonucleotides make up its coding mRNA sequence?`,
      opts,
      ans,
      cat: 'Genetics & Molecular Biology',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `Each amino acid is encoded by a triplet codon of 3 nucleotides (${aminoAcids} × 3 = ${codingNucleotides}), plus 3 nucleotides for the stop codon = ${withStop} nucleotides.`,
    };
  }

  if (template === 8) {
    const ghp = randInt(55, 72);
    const bcOp = randInt(28, 36);
    const chp = randInt(14, 22);
    const nfp = ghp - (bcOp + chp);
    const { opts, ans } = mcqFromNumeric(nfp, ' mmHg', '', 2);
    return {
      text: `[NEET · Human Physiology] In a renal glomerulus, if glomerular hydrostatic pressure (GHP) is ${ghp} mmHg, blood colloidal osmotic pressure (BCOP) is ${bcOp} mmHg, and capsular hydrostatic pressure (CHP) is ${chp} mmHg, what is the Net Filtration Pressure (NFP)?`,
      opts,
      ans,
      cat: 'Human Physiology',
      difficulty: 'hard',
      templateId,
      isProcedural: true,
      exp: `Net Filtration Pressure NFP = GHP - (BCOP + CHP) = ${ghp} - (${bcOp} + ${chp}) = ${ghp} - ${bcOp + chp} = ${nfp} mmHg.`,
    };
  }

  if (template === 9) {
    const hExp = randInt(2, 12);
    const ph = hExp;
    const { opts, ans } = mcqFromNumeric(ph, '', '', 1);
    return {
      text: `[NEET · Chemistry] What is the pH of an aqueous solution at 25 °C whose hydrogen ion concentration is [H⁺] = 1.0 × 10⁻${hExp} M?`,
      opts,
      ans,
      cat: 'Chemistry',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `pH = -log₁₀[H⁺] = -log₁₀(10⁻${hExp}) = ${ph}.`,
    };
  }

  if (template === 10) {
    const glucoseMoles = randInt(2, 9);
    const co2Moles = glucoseMoles * 6;
    const { opts, ans } = mcqFromNumeric(co2Moles, ' moles of CO₂', '', 6);
    return {
      text: `[NEET · Plant Physiology] In the Calvin cycle (C3 pathway), how many moles of CO₂ must be fixed to synthesize ${glucoseMoles} moles of glucose (C₆H₁₂O₆)?`,
      opts,
      ans,
      cat: 'Plant Physiology',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `Synthesizing 1 mole of hexose glucose (C₆H₁₂O₆) requires fixing 6 moles of CO₂. For ${glucoseMoles} moles of glucose, 6 × ${glucoseMoles} = ${co2Moles} moles of CO₂ are required.`,
    };
  }

  const dihybridUnit = randInt(2, 15);
  const totalF2 = dihybridUnit * 16;
  const doubleDom = dihybridUnit * 9;
  const { opts, ans } = mcqFromNumeric(doubleDom, ' plants', '', 9);
  return {
    text: `[NEET · Genetics] In Mendel's dihybrid cross (RrYy × RrYy) yielding ${totalF2} F₂ plants, how many plants are expected to show both dominant traits (Round and Yellow, 9/16)?`,
    opts,
    ans,
    cat: 'Genetics & Molecular Biology',
    difficulty: 'medium',
    templateId,
    isProcedural: true,
    exp: `A dihybrid cross follows the 9:3:3:1 phenotypic ratio, so 9/16 of the ${totalF2} offspring = 9 × ${dihybridUnit} = ${doubleDom} plants exhibit both dominant traits.`,
  };
}

/* ============================================================================
   9. JEE MAINS PROCEDURAL GENERATOR (12 DIVERSE TEMPLATES)
   ============================================================================ */
const JEE_TEMPLATE_COUNT = 12;

function genJeeQuestion(templateIdx?: number): Question {
  const template =
    templateIdx !== undefined
      ? ((templateIdx % JEE_TEMPLATE_COUNT) + JEE_TEMPLATE_COUNT) % JEE_TEMPLATE_COUNT
      : randInt(0, JEE_TEMPLATE_COUNT - 1);
  const templateId = `jee-tpl-${template}`;

  if (template === 0) {
    const u = randInt(2, 22);
    const a = randInt(1, 9) * 2;
    const t = randInt(2, 8);
    const s = u * t + 0.5 * a * t * t;
    const { opts, ans } = mcqFromNumeric(s, ' m', '', 5);
    return {
      text: `[JEE · Physics] A particle starts with initial velocity u = ${u} m/s and moves with constant acceleration a = ${a} m/s². Find the displacement covered in t = ${t} s.`,
      opts,
      ans,
      cat: 'Physics',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `Using the kinematic equation s = ut + ½at²: s = (${u})(${t}) + ½(${a})(${t}²) = ${u * t} + ${0.5 * a * t * t} = ${s} m.`,
    };
  }

  if (template === 1) {
    const m = randInt(1, 15) * 2;
    const v = randInt(3, 18);
    const ke = 0.5 * m * v * v;
    const { opts, ans } = mcqFromNumeric(ke, ' J', '', 5);
    return {
      text: `[JEE · Physics] Calculate the translational kinetic energy of a body of mass m = ${m} kg moving at speed v = ${v} m/s.`,
      opts,
      ans,
      cat: 'Physics',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `Kinetic energy KE = ½mv² = ½ × ${m} × ${v}² = ${0.5 * m} × ${v * v} = ${ke} J.`,
    };
  }

  if (template === 2) {
    const i = randInt(2, 12);
    const r = randInt(3, 30);
    const power = i * i * r;
    const { opts, ans } = mcqFromNumeric(power, ' W', '', 5);
    return {
      text: `[JEE · Physics] A steady current of I = ${i} A flows through a resistor of resistance R = ${r} Ω. What is the rate of Joule heat dissipation (P = I²R)?`,
      opts,
      ans,
      cat: 'Physics',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `Electrical power dissipated P = I²R = (${i})² × ${r} = ${i * i} × ${r} = ${power} W.`,
    };
  }

  if (template === 3) {
    const a = randInt(1, 6);
    const b = randInt(2, 9);
    const c = randInt(1, 15);
    const x0 = randInt(1, 5);
    const deriv = 3 * a * x0 * x0 + 2 * b * x0 + c;
    const { opts, ans } = mcqFromNumeric(deriv);
    return {
      text: `[JEE · Maths] If f(x) = ${a}x³ + ${b}x² + ${c}x, evaluate the derivative f'(${x0}).`,
      opts,
      ans,
      cat: 'Mathematics',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `Differentiating term-by-term gives f'(x) = ${3 * a}x² + ${2 * b}x + ${c}. Substituting x = ${x0} yields f'(${x0}) = ${3 * a}(${x0 * x0}) + ${2 * b}(${x0}) + ${c} = ${deriv}.`,
    };
  }

  if (template === 4) {
    const a = randInt(2, 13);
    const b = randInt(1, 10);
    const c = randInt(1, 9);
    const d = randInt(3, 14);
    const det = a * d - b * c;
    const { opts, ans } = mcqFromNumeric(det);
    return {
      text: `[JEE · Maths] Find the determinant of the 2×2 matrix A = [[${a}, ${b}], [${c}, ${d}]].`,
      opts,
      ans,
      cat: 'Mathematics',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `For a 2×2 matrix [[a, b], [c, d]], det(A) = ad - bc = (${a})(${d}) - (${b})(${c}) = ${a * d} - ${b * c} = ${det}.`,
    };
  }

  if (template === 5) {
    const r1 = randInt(2, 9);
    const r2 = randInt(2, 11);
    const sum = r1 + r2;
    const prod = r1 * r2;
    const sumSq = r1 * r1 + r2 * r2;
    const { opts, ans } = mcqFromNumeric(sumSq, '', '', 2);
    return {
      text: `[JEE · Maths] If α and β are the roots of the quadratic equation x² - ${sum}x + ${prod} = 0, find the value of α² + β².`,
      opts,
      ans,
      cat: 'Mathematics',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `By Vieta's formulas, α + β = ${sum} and αβ = ${prod}. Thus α² + β² = (α + β)² - 2αβ = ${sum}² - 2(${prod}) = ${sum * sum} - ${2 * prod} = ${sumSq}.`,
    };
  }

  if (template === 6) {
    const n = randInt(2, 7);
    const askElectrons = (n % 2) === 0;
    const correct = askElectrons ? 2 * n * n : n * n;
    const { opts, ans } = mcqFromNumeric(correct, '', '', 1);
    return {
      text: askElectrons
        ? `[JEE · Chemistry] What is the maximum number of electrons that can be accommodated in the principal energy shell with n = ${n} (2n²)?`
        : `[JEE · Chemistry] How many total atomic orbitals exist in the principal shell with principal quantum number n = ${n} (n²)?`,
      opts,
      ans,
      cat: 'Chemistry',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: askElectrons
        ? `A principal shell n contains n² = ${n * n} orbitals, and by the Pauli Exclusion Principle each orbital holds at most 2 electrons, giving 2n² = 2 × ${n}² = ${correct} electrons.`
        : `The total number of orbitals in shell n is n² = ${n}² = ${correct} orbitals.`,
    };
  }

  if (template === 7) {
    const ax = randInt(1, 8);
    const ay = randInt(-6, 7);
    const az = randInt(1, 6);
    const bx = randInt(2, 7);
    const by = randInt(1, 8);
    const bz = randInt(-5, 6);
    const dot = ax * bx + ay * by + az * bz;
    const { opts, ans } = mcqFromNumeric(dot);
    return {
      text: `[JEE · Maths] Compute the scalar (dot) product A · B of vectors A = (${ax}i + ${ay}j + ${az}k) and B = (${bx}i + ${by}j + ${bz}k).`,
      opts,
      ans,
      cat: 'Mathematics',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `A · B = a_x b_x + a_y b_y + a_z b_z = (${ax})(${bx}) + (${ay})(${by}) + (${az})(${bz}) = ${ax * bx} + ${ay * by} + ${az * bz} = ${dot}.`,
    };
  }

  if (template === 8) {
    const c = randInt(2, 16) * 2;
    const v = randInt(5, 30);
    const energyMicroJ = 0.5 * c * v * v;
    const { opts, ans } = mcqFromNumeric(energyMicroJ, ' μJ', '', 10);
    return {
      text: `[JEE · Physics] A capacitor of capacitance C = ${c} μF is charged to a potential difference of V = ${v} V. What is the electrostatic energy stored in the capacitor (U = ½CV²)?`,
      opts,
      ans,
      cat: 'Physics',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `Electrostatic energy U = ½CV² = 0.5 × ${c} μF × (${v} V)² = ${0.5 * c} × ${v * v} = ${energyMicroJ} μJ.`,
    };
  }

  if (template === 9) {
    const k = randInt(1, 6) * 3;
    const b = randInt(2, 12);
    const upper = randInt(2, 5);
    const integralVal = (k / 3) * Math.pow(upper, 3) + b * upper;
    const { opts, ans } = mcqFromNumeric(integralVal);
    return {
      text: `[JEE · Maths] Evaluate the definite integral ∫₀^${upper} (${k}x² + ${b}) dx.`,
      opts,
      ans,
      cat: 'Mathematics',
      difficulty: 'medium',
      templateId,
      isProcedural: true,
      exp: `The antiderivative is F(x) = ${k / 3}x³ + ${b}x. Evaluating from 0 to ${upper} gives F(${upper}) - F(0) = ${k / 3}(${upper}³) + ${b}(${upper}) = ${integralVal}.`,
    };
  }

  if (template === 10) {
    const rUnit = randInt(2, 12);
    const r1 = rUnit * 3;
    const r2 = rUnit * 6;
    const rEq = rUnit * 2;
    const { opts, ans } = mcqFromNumeric(rEq, ' Ω', '', 1);
    return {
      text: `[JEE · Physics] Two resistors of resistances R₁ = ${r1} Ω and R₂ = ${r2} Ω are connected in parallel. What is their equivalent resistance R_eq?`,
      opts,
      ans,
      cat: 'Physics',
      difficulty: 'easy',
      templateId,
      isProcedural: true,
      exp: `For two parallel resistors, R_eq = (R₁ × R₂) / (R₁ + R₂) = (${r1} × ${r2}) / (${r1} + ${r2}) = ${r1 * r2} / ${r1 + r2} = ${rEq} Ω.`,
    };
  }

  const halfLives = randInt(2, 6);
  const initMass = Math.pow(2, halfLives) * randInt(3, 15);
  const remMass = initMass / Math.pow(2, halfLives);
  const tHalfMin = randInt(5, 25);
  const totalMin = halfLives * tHalfMin;
  const { opts, ans } = mcqFromNumeric(remMass, ' g', '', 1);
  return {
    text: `[JEE · Chemistry] A radioactive isotope has a half-life of ${tHalfMin} minutes. Starting with ${initMass} g of the sample, how much undecayed sample remains after ${totalMin} minutes?`,
    opts,
    ans,
    cat: 'Chemistry',
    difficulty: 'medium',
    templateId,
    isProcedural: true,
    exp: `Number of half-lives n = ${totalMin} / ${tHalfMin} = ${halfLives}. Remaining mass N = N₀ / 2ⁿ = ${initMass} / 2^${halfLives} = ${remMass} g.`,
  };
}

const lastUsedTemplateBySubject = new Map<string, number>();

export function generateProceduralQuestion(
  subjectId: string,
  gkCategory?: string | null,
  templateHint?: number
): Question {
  const prevTpl = lastUsedTemplateBySubject.get(subjectId);
  let nextTpl = templateHint;
  if (nextTpl === undefined) {
    const count = 12;
    let candidate = randInt(0, count - 1);
    if (prevTpl !== undefined && candidate === prevTpl) {
      candidate = (candidate + randInt(1, count - 1)) % count;
    }
    nextTpl = candidate;
  }
  lastUsedTemplateBySubject.set(subjectId, nextTpl);

  switch (subjectId) {
    case 'python':
      return genPythonQuestion(nextTpl);
    case 'java':
      return genJavaQuestion(nextTpl);
    case 'c':
      return genCQuestion(nextTpl);
    case 'cpp':
      return genCppQuestion(nextTpl);
    case 'html':
      return genHtmlCssQuestion(nextTpl);
    case 'crt':
      return genCrtQuestion(nextTpl);
    case 'gk':
      return genGkQuestion(gkCategory, nextTpl);
    case 'neet':
      return genNeetQuestion(nextTpl);
    case 'jee':
      return genJeeQuestion(nextTpl);
    default:
      return genPythonQuestion(nextTpl);
  }
}

export type PublishedQuestionPoolProvider = (
  subjectId: string,
  gkCategory?: string | null
) => Question[];

let publishedPoolProvider: PublishedQuestionPoolProvider | null = null;

/**
 * Registers the live published-only Question Bank provider (from `questionBankService.ts`).
 * Ensures student quizzes only receive `status === "published"` questions and never
 * receive `draft` or `archived` questions.
 */
export function setPublishedQuestionPoolProvider(
  provider: PublishedQuestionPoolProvider | null
): void {
  publishedPoolProvider = provider;
}

/**
 * Retrieves the active published curated pool for `subjectId`.
 * Uses the registered `publishedPoolProvider` when available; falls back to static `BANK`.
 */
export function getActiveCuratedPool(
  subjectId: string,
  gkCategory?: string | null,
  customCuratedPool?: Question[]
): Question[] {
  if (Array.isArray(customCuratedPool)) {
    return subjectId === 'gk' && gkCategory && gkCategory !== 'All'
      ? customCuratedPool.filter(
          (q) =>
            q.cat && q.cat.toLowerCase() === gkCategory.trim().toLowerCase()
        )
      : customCuratedPool;
  }

  if (publishedPoolProvider) {
    const dynamicList = publishedPoolProvider(subjectId, gkCategory);
    if (Array.isArray(dynamicList)) {
      return dynamicList;
    }
  }

  const rawBank = BANK[subjectId] || BANK.python;
  return subjectId === 'gk' && gkCategory && gkCategory !== 'All'
    ? rawBank.filter((q) => q.cat === gkCategory)
    : rawBank;
}

function balanceTopicAndDifficultySubset(subset: Question[]): Question[] {
  if (subset.length === 0) return [];

  // Group questions by topic (`cat`) and round-robin across topics
  const byTopic = new Map<string, Question[]>();
  for (const q of shuffleArray(subset)) {
    const topic = q.cat || 'General';
    const list = byTopic.get(topic) || [];
    list.push(q);
    byTopic.set(topic, list);
  }

  const topicBalanced: Question[] = [];
  const topicKeys = shuffleArray(Array.from(byTopic.keys()));
  let added = true;
  while (added) {
    added = false;
    for (const tk of topicKeys) {
      const bucket = byTopic.get(tk);
      if (bucket && bucket.length > 0) {
        topicBalanced.push(bucket.shift()!);
        added = true;
      }
    }
  }

  // Interleave difficulty tiers (~30% easy, ~45% medium, ~25% hard) while preserving topic variety
  const easyQ = topicBalanced.filter((q) => q.difficulty === 'easy');
  const medQ = topicBalanced.filter(
    (q) => !q.difficulty || q.difficulty === 'medium'
  );
  const hardQ = topicBalanced.filter((q) => q.difficulty === 'hard');

  const difficultyPattern: QuestionDifficulty[] = [
    'easy',
    'medium',
    'medium',
    'hard',
    'easy',
    'medium',
    'hard',
    'medium',
    'easy',
    'medium',
  ];

  const balanced: Question[] = [];
  let pIdx = 0;
  while (easyQ.length > 0 || medQ.length > 0 || hardQ.length > 0) {
    const targetDiff = difficultyPattern[pIdx % difficultyPattern.length];
    pIdx++;
    if (targetDiff === 'easy' && easyQ.length > 0) {
      balanced.push(easyQ.shift()!);
    } else if (targetDiff === 'medium' && medQ.length > 0) {
      balanced.push(medQ.shift()!);
    } else if (targetDiff === 'hard' && hardQ.length > 0) {
      balanced.push(hardQ.shift()!);
    } else if (medQ.length > 0) {
      balanced.push(medQ.shift()!);
    } else if (easyQ.length > 0) {
      balanced.push(easyQ.shift()!);
    } else if (hardQ.length > 0) {
      balanced.push(hardQ.shift()!);
    }
  }

  return balanced;
}

/**
 * Selects a balanced ordering of unseen curated questions across topics and difficulty levels
 * (targeting ~30% easy, ~45% medium, ~25% hard).
 * Prioritizes published Admin & Bulk-Imported `questionBank` questions (`source === 'admin' | 'imported'`)
 * first so newly published curriculum questions immediately appear in student quizzes.
 */
function buildBalancedCuratedQueue(
  curatedPool: Question[],
  subjectId: string,
  seenSignatures: ReadonlySet<string>,
  attemptedSignatures?: ReadonlySet<string>
): Question[] {
  const priorityUnseen: Question[] = [];
  const standardUnseen: Question[] = [];
  const seenButUnattempted: Question[] = [];

  for (const q of curatedPool) {
    const isSeen = isQuestionInSignatureSet(q, subjectId, seenSignatures);
    if (!isSeen) {
      if (q.source === 'admin' || q.source === 'imported') {
        priorityUnseen.push(q);
      } else {
        standardUnseen.push(q);
      }
    } else if (
      attemptedSignatures &&
      !isQuestionInSignatureSet(q, subjectId, attemptedSignatures)
    ) {
      seenButUnattempted.push(q);
    }
  }

  return [
    ...balanceTopicAndDifficultySubset(priorityUnseen),
    ...balanceTopicAndDifficultySubset(standardUnseen),
    ...shuffleArray(seenButUnattempted),
  ];
}

export interface NextQuestionSelectionResult {
  question: Question | null;
  poolExhausted: boolean;
  shortageMessage?: string;
}

/**
 * Returns the next genuinely unique question for `subjectId` without EVER adding
 * artificial suffixes (`#123-456`) or returning a duplicate.
 *
 * Priority order:
 * 1. Unseen published curated questions (balanced across topics & difficulty).
 * 2. Optional procedural generator fallback (with strict duplicate checking).
 * 3. If no unique question can be found within `maxAttempts`, returns `{ question: null, poolExhausted: true }`.
 */
export function getNextUniqueQuestion(
  subjectId: string,
  seenSignatures: Set<string>,
  gkCategory?: string | null,
  options?: {
    maxAttempts?: number;
    attemptedSignatures?: ReadonlySet<string>;
    preferCurated?: boolean;
    allowProceduralFallback?: boolean;
    customCuratedPool?: Question[];
  }
): NextQuestionSelectionResult {
  const maxAttempts = Math.max(1, options?.maxAttempts ?? 250);
  const allowProcedural = options?.allowProceduralFallback ?? true;
  const filteredBank = getActiveCuratedPool(
    subjectId,
    gkCategory,
    options?.customCuratedPool
  );

  const unseenCurated = buildBalancedCuratedQueue(
    filteredBank,
    subjectId,
    seenSignatures,
    options?.attemptedSignatures
  ).filter((q) => !isQuestionInSignatureSet(q, subjectId, seenSignatures));

  const preferCurated = options?.preferCurated ?? unseenCurated.length > 0;

  if (preferCurated && unseenCurated.length > 0) {
    const picked = unseenCurated[0];
    registerQuestionInSignatureSet(picked, subjectId, seenSignatures);
    return { question: picked, poolExhausted: false };
  }

  if (allowProcedural) {
    const startTpl = randInt(0, 11);
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const tplIdx = (startTpl + attempt) % 12;
      const candidate = generateProceduralQuestion(
        subjectId,
        gkCategory,
        tplIdx
      );
      if (!isQuestionInSignatureSet(candidate, subjectId, seenSignatures)) {
        registerQuestionInSignatureSet(candidate, subjectId, seenSignatures);
        return { question: candidate, poolExhausted: false };
      }
    }
  }

  // Fall back to unseen curated pool if any remain
  if (unseenCurated.length > 0) {
    const picked = unseenCurated[0];
    registerQuestionInSignatureSet(picked, subjectId, seenSignatures);
    return { question: picked, poolExhausted: false };
  }

  return {
    question: null,
    poolExhausted: true,
    shortageMessage:
      'All unique questions available in this topic pool have been exhausted for your history.',
  };
}

/**
 * Legacy-compatible wrapper used by Unlimited Mode and callers expecting a `Question`.
 * Note: Never appends artificial suffixes.
 */
export function getNextUnlimitedQuestion(
  subjectId: string,
  seenSignatures: Set<string>,
  gkCategory?: string | null,
  maxAttempts = 250
): Question | null {
  const res = getNextUniqueQuestion(subjectId, seenSignatures, gkCategory, {
    maxAttempts,
  });
  return res.question;
}

export interface QuizSelectionBatchResult {
  questions: Question[];
  requestedCount: number;
  poolExhausted: boolean;
  shortageMessage?: string;
}

/**
 * Generates a batch of unique questions for a test attempt:
 * - Retrieves published questions from the active Question Bank pool.
 * - Never repeats a question within the same test attempt.
 * - Excludes questions already in `seenSignatures` (user's persistent history).
 * - Balances curated questions across topics and difficulty levels, prioritizing Admin/Imported published questions.
 * - Uses procedural generation only as a fallback after all unseen published `questionBank` questions are used.
 * - Never appends artificial suffixes to fake uniqueness.
 * - If `recordIntoProvidedSet` is false, does NOT mutate `seenSignatures` prematurely
 *   (so history is only updated as each question is actually presented to the user).
 */
export function selectQuizQuestions(
  subjectId: string,
  count: number,
  seenSignatures: Set<string>,
  gkCategory?: string | null,
  options?: {
    maxAttemptsPerQuestion?: number;
    attemptedSignatures?: ReadonlySet<string>;
    recordIntoProvidedSet?: boolean;
    allowProceduralFallback?: boolean;
    customCuratedPool?: Question[];
  }
): QuizSelectionBatchResult {
  const maxAttempts = Math.max(1, options?.maxAttemptsPerQuestion ?? 250);
  const recordIntoProvided = options?.recordIntoProvidedSet ?? false;
  const allowProcedural = options?.allowProceduralFallback ?? true;

  // Working set combines user's historical seen signatures + current test attempt signatures
  const workingSet = new Set<string>(seenSignatures);
  const questions: Question[] = [];
  let poolExhausted = false;
  let shortageMessage: string | undefined;

  const filteredBank = getActiveCuratedPool(
    subjectId,
    gkCategory,
    options?.customCuratedPool
  );

  const curatedQueue = buildBalancedCuratedQueue(
    filteredBank,
    subjectId,
    workingSet,
    options?.attemptedSignatures
  );

  for (let i = 0; i < count; i++) {
    let picked: Question | null = null;

    // Always prefer unseen published questionBank questions first!
    while (curatedQueue.length > 0) {
      const candidate = curatedQueue.shift()!;
      if (!isQuestionInSignatureSet(candidate, subjectId, workingSet)) {
        picked = candidate;
        break;
      }
    }

    if (!picked && allowProcedural) {
      const startTpl = (i + randInt(0, 11)) % 12;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const tplIdx = (startTpl + attempt) % 12;
        const candidate = generateProceduralQuestion(
          subjectId,
          gkCategory,
          tplIdx
        );
        if (!isQuestionInSignatureSet(candidate, subjectId, workingSet)) {
          picked = candidate;
          break;
        }
      }
    }

    // Fallback to any remaining unseen curated question
    if (!picked) {
      while (curatedQueue.length > 0) {
        const candidate = curatedQueue.shift()!;
        if (!isQuestionInSignatureSet(candidate, subjectId, workingSet)) {
          picked = candidate;
          break;
        }
      }
    }

    if (!picked) {
      poolExhausted = true;
      shortageMessage = `Only ${questions.length} of ${count} unique questions were available without repeating previously seen questions.`;
      break;
    }

    registerQuestionInSignatureSet(picked, subjectId, workingSet);
    if (recordIntoProvided) {
      registerQuestionInSignatureSet(picked, subjectId, seenSignatures);
    }
    questions.push(picked);
  }

  return {
    questions,
    requestedCount: count,
    poolExhausted,
    shortageMessage,
  };
}

export function generateUniqueQuizQuestions(
  subjectId: string,
  count: number,
  seenSignatures: Set<string>,
  gkCategory?: string | null,
  options?: {
    maxAttemptsPerQuestion?: number;
    recordIntoProvidedSet?: boolean;
  }
): Question[] {
  const res = selectQuizQuestions(subjectId, count, seenSignatures, gkCategory, {
    maxAttemptsPerQuestion: options?.maxAttemptsPerQuestion ?? 250,
    recordIntoProvidedSet: options?.recordIntoProvidedSet ?? true,
  });
  return res.questions;
}
