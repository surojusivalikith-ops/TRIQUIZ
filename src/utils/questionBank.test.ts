import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeQuestionDuplicates,
  commitBulkImportDraftsToStore,
  computeQuestionBankOverviewStats,
  createQuestionInStore,
  deleteQuestionFromStore,
  evaluateQuestionBankAccessRule,
  getAllQuestionBankDocuments,
  getPublishedQuestionsForSubject,
  parseBulkImportCSV,
  parseBulkImportJSON,
  prepareIdempotentCuratedMigration,
  queryQuestionBankPaginated,
  resetQuestionBankStoreToInitialForTesting,
  updateQuestionInStore,
  validateBulkImportBatch,
  validateQuestionInput,
} from './questionBankService';
import {
  SUBJECTS,
  getNextUniqueQuestion,
  selectQuizQuestions,
} from './questionEngine';

const ADMIN_UID_1 = 'a9xK2mP7qR4tV8wY1zB3cD5eF7gH';
const ADMIN_UID_2 = 'b8wJ1nM6pQ3sU7vX0yA2bC4dE6fG';
const STUDENT_UID = 's7vH0kL5nP2rT6uW9xZ1aB3cD5eF';

test('Phase 2 & 9 Security Rules: Dirty Dozen adversarial payloads and Admin vs Student access control', () => {
  const SERVER_TIME = Symbol('request.time');

  const validQuestionPayload = {
    subjectId: 'python',
    topic: 'Functions',
    subtopic: 'Closures',
    difficulty: 'medium',
    type: 'single_choice',
    question: 'What keyword allows a nested function to rebind a variable in the enclosing non-global scope?',
    options: ['nonlocal', 'global', 'outer', 'super'],
    correctIndex: 0,
    explanation: 'The `nonlocal` keyword binds an identifier to the nearest enclosing function scope excluding globals.',
    status: 'published',
    fingerprint: 'python::functions::single_choice::python::what keyword allows a nested function',
    source: 'admin',
    createdAt: SERVER_TIME,
    updatedAt: SERVER_TIME,
    createdBy: ADMIN_UID_1,
  };

  // 1. Self-Admin Privilege Escalation -> PERMISSION_DENIED
  const selfAdminAttempt = evaluateQuestionBankAccessRule({
    auth: { uid: STUDENT_UID, emailVerified: true },
    operation: 'create',
    collectionPath: 'admins',
    docId: STUDENT_UID,
    incomingDoc: { uid: STUDENT_UID, role: 'admin' },
  });
  assert.equal(selfAdminAttempt.allowed, false);

  // 2. Student Creating a Question -> PERMISSION_DENIED
  const studentCreate = evaluateQuestionBankAccessRule({
    auth: { uid: STUDENT_UID, emailVerified: true },
    operation: 'create',
    collectionPath: 'questionBank',
    docId: 'q_python_test1',
    incomingDoc: { ...validQuestionPayload, createdBy: STUDENT_UID },
    requestTimeSymbol: SERVER_TIME,
  });
  assert.equal(studentCreate.allowed, false);

  // 3. Student Reading a Draft Question -> PERMISSION_DENIED
  const studentReadDraft = evaluateQuestionBankAccessRule({
    auth: { uid: STUDENT_UID, emailVerified: true },
    operation: 'get',
    collectionPath: 'questionBank',
    docId: 'q_python_draft1',
    existingDoc: { ...validQuestionPayload, status: 'draft' },
  });
  assert.equal(studentReadDraft.allowed, false);

  // 4. Student Reading an Archived Question -> PERMISSION_DENIED
  const studentReadArchived = evaluateQuestionBankAccessRule({
    auth: { uid: STUDENT_UID, emailVerified: true },
    operation: 'get',
    collectionPath: 'questionBank',
    docId: 'q_python_arch1',
    existingDoc: { ...validQuestionPayload, status: 'archived' },
  });
  assert.equal(studentReadArchived.allowed, false);

  // 5. Student Reading a Published Question -> ALLOWED
  const studentReadPublished = evaluateQuestionBankAccessRule({
    auth: { uid: STUDENT_UID, emailVerified: false },
    operation: 'get',
    collectionPath: 'questionBank',
    docId: 'q_python_pub1',
    existingDoc: { ...validQuestionPayload, status: 'published' },
  });
  assert.equal(studentReadPublished.allowed, true);

  // 6. Student Modifying or Deleting a Question -> PERMISSION_DENIED
  const studentUpdate = evaluateQuestionBankAccessRule({
    auth: { uid: STUDENT_UID, emailVerified: true },
    operation: 'update',
    collectionPath: 'questionBank',
    docId: 'q_python_pub1',
    existingDoc: validQuestionPayload,
    incomingDoc: validQuestionPayload,
    requestTimeSymbol: SERVER_TIME,
  });
  assert.equal(studentUpdate.allowed, false);

  const studentDelete = evaluateQuestionBankAccessRule({
    auth: { uid: STUDENT_UID, emailVerified: true },
    operation: 'delete',
    collectionPath: 'questionBank',
    docId: 'q_python_pub1',
  });
  assert.equal(studentDelete.allowed, false);

  // 7. Verified Admin Reading Draft & Creating Valid Question -> ALLOWED
  const adminReadDraft = evaluateQuestionBankAccessRule({
    auth: {
      uid: ADMIN_UID_1,
      emailVerified: true,
      customClaims: { admin: true },
    },
    operation: 'get',
    collectionPath: 'questionBank',
    docId: 'q_python_draft1',
    existingDoc: { ...validQuestionPayload, status: 'draft' },
  });
  assert.equal(adminReadDraft.allowed, true);

  const adminCreateValid = evaluateQuestionBankAccessRule({
    auth: {
      uid: ADMIN_UID_1,
      emailVerified: true,
      customClaims: { admin: true },
    },
    operation: 'create',
    collectionPath: 'questionBank',
    docId: 'q_python_valid1',
    incomingDoc: validQuestionPayload,
    requestTimeSymbol: SERVER_TIME,
  });
  assert.equal(adminCreateValid.allowed, true);

  // 8. Admin Spoofing createdBy UID -> PERMISSION_DENIED
  const adminSpoofCreatedBy = evaluateQuestionBankAccessRule({
    auth: {
      uid: ADMIN_UID_1,
      emailVerified: true,
      customClaims: { admin: true },
    },
    operation: 'create',
    collectionPath: 'questionBank',
    docId: 'q_python_spoof',
    incomingDoc: { ...validQuestionPayload, createdBy: ADMIN_UID_2 },
    requestTimeSymbol: SERVER_TIME,
  });
  assert.equal(adminSpoofCreatedBy.allowed, false);

  // 9. Admin Forging Client Timestamp -> PERMISSION_DENIED
  const adminClientTimestamp = evaluateQuestionBankAccessRule({
    auth: {
      uid: ADMIN_UID_1,
      emailVerified: true,
      customClaims: { admin: true },
    },
    operation: 'create',
    collectionPath: 'questionBank',
    docId: 'q_python_badts',
    incomingDoc: { ...validQuestionPayload, updatedAt: Date.now() },
    requestTimeSymbol: SERVER_TIME,
  });
  assert.equal(adminClientTimestamp.allowed, false);

  // 10. Admin Mutating Immutable createdBy / createdAt on Update -> PERMISSION_DENIED
  const adminMutateImmutable = evaluateQuestionBankAccessRule({
    auth: {
      uid: ADMIN_UID_2,
      emailVerified: true,
      inAdminsCollection: true,
    },
    operation: 'update',
    collectionPath: 'questionBank',
    docId: 'q_python_valid1',
    existingDoc: validQuestionPayload,
    incomingDoc: { ...validQuestionPayload, createdBy: ADMIN_UID_2 },
    requestTimeSymbol: SERVER_TIME,
  });
  assert.equal(adminMutateImmutable.allowed, false);

  // 11. Admin Injecting Shadow Field -> PERMISSION_DENIED
  const adminShadowField = evaluateQuestionBankAccessRule({
    auth: {
      uid: ADMIN_UID_1,
      emailVerified: true,
      customClaims: { admin: true },
    },
    operation: 'create',
    collectionPath: 'questionBank',
    docId: 'q_python_shadow',
    incomingDoc: { ...validQuestionPayload, ghostField: true },
    requestTimeSymbol: SERVER_TIME,
  });
  assert.equal(adminShadowField.allowed, false);

  // 12. Admin Saving Out-of-Range correctIndex -> PERMISSION_DENIED
  const adminInvalidCorrectIndex = evaluateQuestionBankAccessRule({
    auth: {
      uid: ADMIN_UID_1,
      emailVerified: true,
      customClaims: { admin: true },
    },
    operation: 'create',
    collectionPath: 'questionBank',
    docId: 'q_python_badans',
    incomingDoc: { ...validQuestionPayload, correctIndex: 4 },
    requestTimeSymbol: SERVER_TIME,
  });
  assert.equal(adminInvalidCorrectIndex.allowed, false);
});

test('Phase 5: 5-Level Duplicate & Similarity Detection (Exact, Punctuation, Reordered Options, Same Meaning, Near-Duplicate)', () => {
  resetQuestionBankStoreToInitialForTesting();

  // Create a baseline question in the bank
  const baseRes = createQuestionInStore(
    {
      subjectId: 'python',
      topic: 'Functions',
      subtopic: 'Closures',
      difficulty: 'medium',
      question: 'What is the time complexity of looking up a key in a Python dictionary in the average case?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correctIndex: 0,
      explanation: 'Python dictionaries are backed by open-addressed hash tables, giving O(1) average lookup.',
      status: 'published',
    },
    ADMIN_UID_1
  );
  assert.equal(baseRes.ok, true);
  const bank = getAllQuestionBankDocuments();

  // 1. Exact duplicate
  const exactDups = analyzeQuestionDuplicates(
    {
      subjectId: 'python',
      topic: 'Functions',
      question: 'What is the time complexity of looking up a key in a Python dictionary in the average case?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correctIndex: 0,
    },
    bank
  );
  assert.ok(exactDups.some((d) => d.matchType === 'exact' && d.blocking));

  // 2. Same question with reordered options and adjusted correctIndex
  const reorderedDups = analyzeQuestionDuplicates(
    {
      subjectId: 'python',
      topic: 'Functions',
      question: 'What is the time complexity of looking up a key in a Python dictionary in the average case?',
      options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'],
      correctIndex: 2,
    },
    bank
  );
  assert.ok(
    reorderedDups.some(
      (d) => d.matchType === 'reordered_options' && d.blocking
    )
  );

  // 3. Same question with different punctuation & capitalization
  const punctDups = analyzeQuestionDuplicates(
    {
      subjectId: 'python',
      topic: 'Functions',
      question: 'what is the time-complexity of looking up a key, in a PYTHON dictionary (in the average case)???',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correctIndex: 0,
    },
    bank
  );
  assert.ok(punctDups.some((d) => d.matchType === 'punctuation' && d.blocking));

  // 4. Same meaning and identical answer set -> surfaced as non-blocking warning
  const meaningDups = analyzeQuestionDuplicates(
    {
      subjectId: 'python',
      topic: 'Lists, tuples and dictionaries',
      question: 'In Python dictionaries, what is the average case time complexity for key lookup?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correctIndex: 0,
    },
    bank
  );
  assert.ok(
    meaningDups.some(
      (d) =>
        (d.matchType === 'same_meaning_and_answers' ||
          d.matchType === 'near_duplicate') &&
        d.blocking === false
    )
  );

  // 5. Artificial suffix rejection
  const suffixValidation = validateQuestionInput(
    {
      subjectId: 'python',
      topic: 'Operators',
      subtopic: 'Arithmetic',
      difficulty: 'easy',
      question: 'What is the output of 5 + 3 in Python? (#102-44)',
      options: ['8', '7', '9', '53'],
      correctIndex: 0,
      explanation: 'Integer addition of 5 and 3 produces 8.',
    },
    bank
  );
  assert.equal(suffixValidation.valid, false);
  assert.ok(
    suffixValidation.errors.some((e) => e.toLowerCase().includes('artificial'))
  );
});

test('Phase 3, 4 & 7: Draft/Archived isolation from students, Question Lifecycle (Create, Edit, Publish, Archive, Delete), and Pagination', () => {
  resetQuestionBankStoreToInitialForTesting();

  // Create a DRAFT question
  const draftCreate = createQuestionInStore(
    {
      subjectId: 'c',
      topic: 'Pointers',
      subtopic: 'Void pointers',
      difficulty: 'hard',
      question: 'Can a `void *` pointer in C be dereferenced directly without casting to a complete object type first?',
      options: [
        'No, `void` is an incomplete type and cannot be dereferenced directly',
        'Yes, it dereferences to a single `unsigned char` byte',
        'Yes, it dereferences to an `int` by default',
        'Only inside `main()`',
      ],
      correctIndex: 0,
      explanation: 'In ISO C, `void` is an incomplete type with no size, so dereferencing a `void *` without first casting to a concrete object pointer type is a constraint violation.',
      status: 'draft',
    },
    ADMIN_UID_1
  );
  assert.equal(draftCreate.ok, true);
  const draftId = draftCreate.doc!.id;

  // Verify students NEVER see the draft question
  const studentCQuestionsBefore = getPublishedQuestionsForSubject('c');
  assert.equal(
    studentCQuestionsBefore.some((q) => q.id === draftId),
    false,
    'Draft questions must never appear in student published question pool'
  );

  // Verify selectQuizQuestions with customCuratedPool / active pool never selects the draft
  const quizSelectionDraft = selectQuizQuestions('c', 15, new Set(), null, {
    allowProceduralFallback: false,
  });
  assert.equal(
    quizSelectionDraft.questions.some((q) => q.id === draftId),
    false
  );

  // Admin publishes the question
  const publishRes = updateQuestionInStore(
    draftId,
    { status: 'published' },
    ADMIN_UID_1
  );
  assert.equal(publishRes.ok, true);
  assert.equal(publishRes.doc!.status, 'published');

  // Verify students NOW see the published question
  const studentCQuestionsAfterPublish = getPublishedQuestionsForSubject('c');
  assert.equal(
    studentCQuestionsAfterPublish.some((q) => q.id === draftId),
    true,
    'Published question must immediately be available in the student pool'
  );

  // Admin edits the question explanation and archives it
  const archiveRes = updateQuestionInStore(
    draftId,
    {
      explanation:
        'Updated explanation: In ISO C11, `void` is an incomplete type that cannot be completed, so `*voidPtr` is a compile-time constraint error.',
      status: 'archived',
    },
    ADMIN_UID_1
  );
  assert.equal(archiveRes.ok, true);
  assert.equal(archiveRes.doc!.status, 'archived');

  // Verify archived question is removed from student pool
  const studentCQuestionsAfterArchive = getPublishedQuestionsForSubject('c');
  assert.equal(
    studentCQuestionsAfterArchive.some((q) => q.id === draftId),
    false,
    'Archived questions must never appear in student published question pool'
  );

  // Verify pagination works without loading entire collection into a single page
  const page1 = queryQuestionBankPaginated({
    subjectId: 'all',
    page: 1,
    pageSize: 15,
    sortOrder: 'newest',
  });
  const page2 = queryQuestionBankPaginated({
    subjectId: 'all',
    page: 2,
    pageSize: 15,
    sortOrder: 'newest',
  });
  assert.equal(page1.items.length, 15);
  assert.equal(page2.items.length, 15);
  assert.notEqual(page1.items[0].id, page2.items[0].id);
  assert.ok(page1.totalPages > 10);

  // Admin deletes the question
  const deleted = deleteQuestionFromStore(draftId);
  assert.equal(deleted, true);
  const searchDeleted = queryQuestionBankPaginated({
    searchQuery: draftId,
  });
  assert.equal(searchDeleted.totalMatching, 0);
});

test('Phase 4D & 9: Bulk Import (JSON & CSV) validation, error reporting, and mandatory Draft staging', () => {
  resetQuestionBankStoreToInitialForTesting();

  // 1. Test JSON Bulk Import with a mix of valid records, missing explanations, invalid answer keys, missing topics, and intra-batch duplicates
  const rawJson = JSON.stringify([
    {
      subjectId: 'java',
      topic: 'Multithreading',
      subtopic: 'Synchronization',
      difficulty: 'hard',
      question: 'Which Java class in `java.util.concurrent` allows one or more threads to wait until a set of operations being performed in other threads completes (one-shot barrier)?',
      options: ['CountDownLatch', 'CyclicBarrier', 'Semaphore', 'Phaser'],
      correctIndex: 0,
      explanation: '`CountDownLatch` is a single-use synchronization aid initialized with a count; `await()` blocks until `countDown()` reduces the count to zero.',
      status: 'published', // Even if input says published, bulk import MUST force status='draft'!
    },
    // Intra-batch exact duplicate of row 1
    {
      subjectId: 'java',
      topic: 'Multithreading',
      subtopic: 'Synchronization',
      difficulty: 'hard',
      question: 'Which Java class in `java.util.concurrent` allows one or more threads to wait until a set of operations being performed in other threads completes (one-shot barrier)?',
      options: ['CountDownLatch', 'CyclicBarrier', 'Semaphore', 'Phaser'],
      correctIndex: 0,
      explanation: '`CountDownLatch` is a single-use synchronization aid initialized with a count; `await()` blocks until `countDown()` reduces the count to zero.',
    },
    // Invalid answer key (correctIndex = 5)
    {
      subjectId: 'python',
      topic: 'Operators',
      subtopic: 'Bitwise',
      difficulty: 'easy',
      question: 'What is the result of the bitwise XOR expression `6 ^ 3` in Python?',
      options: ['5', '7', '3', '9'],
      correctIndex: 5,
      explanation: 'In binary, 6 is 110 and 3 is 011; XOR yields 101 which is 5.',
    },
    // Missing explanation
    {
      subjectId: 'cpp',
      topic: 'STL',
      subtopic: 'Containers',
      difficulty: 'medium',
      question: 'Which C++ STL container provides O(1) amortized insertion and removal at both ends?',
      options: ['std::deque', 'std::vector', 'std::forward_list', 'std::stack'],
      correctIndex: 0,
      explanation: '',
    },
    // Missing topic
    {
      subjectId: 'html',
      topic: '',
      subtopic: 'Grid',
      difficulty: 'easy',
      question: 'Which CSS unit represents a fraction of the available space in a Grid container?',
      options: ['fr', 'vw', 'rem', 'ch'],
      correctIndex: 0,
      explanation: 'The `fr` unit represents one fraction of the leftover free space in the grid container.',
    },
  ]);

  const parsedJson = parseBulkImportJSON(rawJson);
  assert.equal(parsedJson.parseError, undefined);
  assert.equal(parsedJson.records.length, 5);

  const summary = validateBulkImportBatch(parsedJson.records, ADMIN_UID_1);
  assert.equal(summary.totalRecords, 5);
  assert.equal(summary.validReadyCount, 1);
  assert.equal(summary.rejectedCount, 4);
  assert.equal(summary.exactDuplicateCount, 1);
  assert.equal(summary.invalidAnswerKeyCount, 1);
  assert.equal(summary.missingExplanationCount, 1);
  assert.equal(summary.missingTopicCount, 1);

  // Commit valid rows and verify they are stored strictly as DRAFT (never auto-published)
  const commitRes = commitBulkImportDraftsToStore(summary);
  assert.equal(commitRes.importedCount, 1);
  assert.equal(commitRes.importedDocs[0].status, 'draft');
  assert.equal(commitRes.importedDocs[0].source, 'imported');

  // 2. Test CSV Bulk Import
  const rawCsv = [
    'subjectId,topic,subtopic,difficulty,question,optionA,optionB,optionC,optionD,correctIndex,explanation',
    'neet,Physics,Optics,medium,"What is the focal length of a plane mirror?",Infinity,Zero,25 cm,100 cm,0,"A plane mirror has a flat reflective surface with radius of curvature R = infinity, so its focal length f = R/2 is also infinity."',
  ].join('\n');

  const parsedCsv = parseBulkImportCSV(rawCsv);
  assert.equal(parsedCsv.parseError, undefined);
  const csvSummary = validateBulkImportBatch(parsedCsv.records, ADMIN_UID_1);
  assert.equal(csvSummary.validReadyCount, 1);
  assert.equal(csvSummary.rows[0].preparedDoc?.status, 'draft');
});

test('Phase 6 & 8: Overview statistics, all 9 subjects present, and idempotent curated bank migration', () => {
  resetQuestionBankStoreToInitialForTesting();

  const stats = computeQuestionBankOverviewStats();
  assert.equal(Object.keys(stats.bySubject).length, 9);
  assert.ok(stats.publishedQuestions >= 800);
  assert.equal(
    stats.remainingTotalToTarget,
    9000 - stats.publishedQuestions
  );

  for (const s of SUBJECTS) {
    const subjStat = stats.bySubject[s.id];
    assert.ok(subjStat, `Missing subject stats for ${s.id}`);
    assert.ok(subjStat.published >= 35, `Expected at least 35 curated questions for ${s.id}`);
    assert.equal(subjStat.remainingToTarget, 1000 - subjStat.published);
  }

  // Run idempotent migration twice and verify zero duplicate growth
  const mig1 = prepareIdempotentCuratedMigration(ADMIN_UID_1);
  const countAfterMig1 = getAllQuestionBankDocuments().length;
  const mig2 = prepareIdempotentCuratedMigration(ADMIN_UID_1);
  const countAfterMig2 = getAllQuestionBankDocuments().length;

  assert.equal(mig1.docsToMigrate.length, mig2.docsToMigrate.length);
  assert.equal(countAfterMig1, countAfterMig2);
  assert.equal(mig2.duplicateSkippedCount, 0);
});

test('Phase 7 Priority: Published Admin and Bulk-Imported questionBank questions appear FIRST in student quizzes', () => {
  resetQuestionBankStoreToInitialForTesting();

  const created = createQuestionInStore(
    {
      subjectId: 'python',
      topic: 'Variables and data types',
      subtopic: 'Memory Interning',
      difficulty: 'medium',
      question:
        'Which sys module function forces two equivalent Python strings to share the same interned memory object?',
      options: ['sys.intern()', 'sys.share()', 'sys.freeze()', 'sys.dedup()'],
      correctIndex: 0,
      explanation:
        '`sys.intern(string)` enters the string in the global table of interned strings and returns the interned string object itself.',
      status: 'published',
      source: 'admin',
    },
    ADMIN_UID_1
  );
  assert.equal(created.ok, true);
  const customId = created.doc!.id;

  const selection = selectQuizQuestions('python', 15, new Set(), null, {
    recordIntoProvidedSet: false,
  });
  assert.equal(selection.questions.length, 15);
  assert.equal(
    selection.questions[0].id,
    customId,
    'Unseen published Admin/Imported questionBank question must be prioritized first in student quiz'
  );
  assert.equal(selection.questions[0].source, 'admin');
});

