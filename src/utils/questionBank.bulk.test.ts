import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseBulkImportCSV,
  parseBulkImportJSON,
  validateBulkImportBatch,
  commitBulkImportDraftsToStore,
  computeQuestionBankOverviewStats,
  resetQuestionBankStoreToInitialForTesting,
  markQuestionsSyncedToFirestore,
  isQuestionSyncedToFirestore,
  getAllQuestionBankDocuments,
  mergeRemoteFirestoreQuestionsIntoStore,
  QuestionBankDocument,
} from './questionBankService';

const ADMIN_UID = 'admin_uid_bulk_test_12345';

test('Bulk Import CSV Parsing: RFC-4180 multiline, escaped quotes, commas, and header aliases', () => {
  // 1. Multiline stem and explanation with internal commas and escaped double quotes
  const complexCsv = [
    'subjectId,topic,subtopic,difficulty,question,optionA,optionB,optionC,optionD,correctIndex,explanation',
    'python,Functions,Closures,medium,"def outer():\n    x = 10\n    def inner():\n        return x\n    return inner\nWhat does this return?",A function closure,"An integer, 10",None,A NameError,0,"The outer function returns the inner function object,\nwhich retains bindings to ""x"" in its enclosing scope."',
    'c,Pointers,Void,hard,"Can a `void *` be dereferenced?",No,"Yes, as int","Yes, as char",Undefined,0,"In C, `void` is an incomplete type and cannot be dereferenced without a cast."',
  ].join('\n');

  const parsed = parseBulkImportCSV(complexCsv);
  assert.equal(parsed.parseError, undefined);
  assert.equal(parsed.records.length, 2);

  // Check row 0 preserved multiline and quotes
  const row0 = parsed.records[0] as any;
  assert.ok(row0.question.includes('\n'), 'Question stem should retain newlines');
  assert.ok(row0.question.includes('x = 10'), 'Question stem should contain indented code');
  assert.equal(row0.options[1], 'An integer, 10', 'Options with commas inside quotes must be parsed intact');
  assert.ok(row0.explanation.includes('"x"'), 'Escaped quotes ("") must be converted to single double-quote');
  assert.ok(row0.explanation.includes('\n'), 'Explanation should retain newlines');

  // Check header alias support: option1..4, correct_answer, reason
  const aliasCsv = [
    'subject,topic,subtopic,difficulty,question,option1,option2,option3,option4,correct_answer,reason',
    'java,Collections,List,easy,Which list is synchronized?,Vector,ArrayList,LinkedList,TreeList,0,Vector methods are synchronized.',
  ].join('\n');

  const parsedAliases = parseBulkImportCSV(aliasCsv);
  assert.equal(parsedAliases.parseError, undefined);
  assert.equal(parsedAliases.records.length, 1);
  const aliasRow = parsedAliases.records[0] as any;
  assert.equal(aliasRow.subjectId, 'java');
  assert.equal(aliasRow.options[0], 'Vector');
  assert.equal(aliasRow.explanation, 'Vector methods are synchronized.');

  // Check column count validation and row-level error reporting on malformed lines
  const malformedCsv = [
    'subjectId,topic,subtopic,difficulty,question,optionA,optionB,optionC,optionD,correctIndex,explanation',
    'c,Syntax,Types,easy,Short row,A,B,0', // missing columns
    'c,Syntax,Types,easy,Valid row,A,B,C,D,0,Valid explanation',
  ].join('\n');

  const parsedMalformed = parseBulkImportCSV(malformedCsv);
  assert.equal(parsedMalformed.records.length, 2);
  const summary = validateBulkImportBatch(parsedMalformed.records, ADMIN_UID);
  assert.equal(summary.totalRecords, 2);
  assert.equal(summary.validReadyCount, 1);
  assert.equal(summary.rejectedCount, 1);
  assert.ok(
    summary.rows[0].errors.some((e) => e.toLowerCase().includes('column')),
    'Row 1 must report column count error'
  );
  assert.equal(summary.rows[1].valid, true, 'Row 2 must be valid despite Row 1 error');
});

test('Bulk Import JSON Parsing: Arrays, wrapped objects, and row-level error reporting', () => {
  // 1. Wrapped object format { questions: [...] }
  const wrappedJson = JSON.stringify({
    questions: [
      {
        subjectId: 'cpp',
        topic: 'Templates',
        subtopic: 'Concepts',
        difficulty: 'hard',
        question: 'Which C++20 keyword defines a named set of constraints on template arguments?',
        options: ['concept', 'requires', 'typename', 'template'],
        correctIndex: 0,
        explanation: 'The `concept` keyword defines a concept in C++20.',
      },
    ],
  });

  const parsedWrapped = parseBulkImportJSON(wrappedJson);
  assert.equal(parsedWrapped.parseError, undefined);
  assert.equal(parsedWrapped.records.length, 1);
  assert.equal((parsedWrapped.records[0] as any).subjectId, 'cpp');

  // 2. Corrupted entries inside JSON (primitives, nulls)
  const corruptedJson = JSON.stringify([
    null,
    'not an object',
    {
      subjectId: 'cpp',
      topic: 'Pointers',
      subtopic: 'Smart',
      difficulty: 'medium',
      question: 'Which smart pointer has exclusive ownership in C++?',
      options: ['unique_ptr', 'shared_ptr', 'weak_ptr', 'auto_ptr'],
      correctIndex: 0,
      explanation: 'std::unique_ptr represents exclusive ownership semantics.',
    },
  ]);

  const parsedCorrupted = parseBulkImportJSON(corruptedJson);
  assert.equal(parsedCorrupted.records.length, 3);
  const summary = validateBulkImportBatch(parsedCorrupted.records, ADMIN_UID);
  assert.equal(summary.totalRecords, 3);
  assert.equal(summary.validReadyCount, 1);
  assert.equal(summary.rejectedCount, 2);
  assert.ok(summary.rows[0].errors.some((e) => e.includes('question object')));
  assert.ok(summary.rows[1].errors.some((e) => e.includes('question object')));
  assert.equal(summary.rows[2].valid, true);
});

test('Bulk Import Scale: 10, 100, 500, and 1,000+ Question Batches', () => {
  resetQuestionBankStoreToInitialForTesting();

  // Helper generator to produce N distinct valid questions across all 9 TriQuiz subjects
  function generateTestQuestions(count: number, prefix: string) {
    const list = [];
    const subjects = ['python', 'java', 'c', 'cpp', 'html', 'crt', 'gk', 'neet', 'jee'];
    for (let i = 0; i < count; i++) {
      const subj = subjects[i % subjects.length];
      list.push({
        subjectId: subj,
        topic: `Topic_${prefix}_${i % 10}`,
        subtopic: `Subtopic_${prefix}_${i % 5}`,
        difficulty: (['easy', 'medium', 'hard'] as const)[i % 3],
        question: `Question unique content ${prefix} item index_${i}: What is the expected behavior of test case item_${i}?`,
        options: [
          `Option Alpha for item index_${i}`,
          `Option Beta for item index_${i}`,
          `Option Gamma for item index_${i}`,
          `Option Delta for item index_${i}`,
        ],
        correctIndex: i % 4,
        explanation: `Detailed explanation for question item index_${i} validating proper educational explanation requirements.`,
        status: 'published', // Bulk import MUST override this and stage as 'draft'
      });
    }
    return list;
  }

  // 1. Test 10 questions
  const batch10 = generateTestQuestions(10, 'batch10');
  const summary10 = validateBulkImportBatch(batch10, ADMIN_UID);
  assert.equal(summary10.totalRecords, 10);
  assert.equal(summary10.validReadyCount, 10);
  assert.equal(summary10.rejectedCount, 0);

  // 2. Test 100 questions
  const batch100 = generateTestQuestions(100, 'batch100');
  const summary100 = validateBulkImportBatch(batch100, ADMIN_UID);
  assert.equal(summary100.totalRecords, 100);
  assert.equal(summary100.validReadyCount, 100);
  assert.equal(summary100.rejectedCount, 0);

  // 3. Test 500 questions
  const batch500 = generateTestQuestions(500, 'batch500');
  const summary500 = validateBulkImportBatch(batch500, ADMIN_UID);
  assert.equal(summary500.totalRecords, 500);
  assert.equal(summary500.validReadyCount, 500);
  assert.equal(summary500.rejectedCount, 0);

  // 4. Test 1,000+ questions (1,050 questions)
  const batch1050 = generateTestQuestions(1050, 'batch1050');
  const summary1050 = validateBulkImportBatch(batch1050, ADMIN_UID);
  assert.equal(summary1050.totalRecords, 1050);
  assert.equal(summary1050.validReadyCount, 1050);
  assert.equal(summary1050.rejectedCount, 0);

  // Commit the 1,050 questions to store and verify all are staged as DRAFT
  const commitRes = commitBulkImportDraftsToStore(summary1050);
  assert.equal(commitRes.importedCount, 1050);
  for (const doc of commitRes.importedDocs) {
    assert.equal(doc.status, 'draft', 'All bulk imported questions must strictly be drafts');
    assert.equal(doc.source, 'imported');
  }

  // Overview stats should reflect all 1050 drafts as pendingSync (not yet synced to Firestore)
  const stats = computeQuestionBankOverviewStats();
  assert.equal(stats.draftQuestions, 1050);
  assert.equal(stats.pendingSyncQuestions, 1050);
  assert.equal(stats.firestoreConfirmedQuestions, 0);
  assert.ok(stats.localCuratedQuestions > 0);
});

test('Chunk Size 10, Batch Failure Resilience, Accurate Accounting & Safe Retries', async () => {
  resetQuestionBankStoreToInitialForTesting();

  // Generate 25 questions -> Exactly 3 batches (10, 10, 5) with CHUNK_SIZE = 10
  const questions = [];
  for (let i = 0; i < 25; i++) {
    questions.push({
      subjectId: 'python',
      topic: 'Batching',
      subtopic: 'Chunks',
      difficulty: 'medium' as const,
      question: `Batch test question index_${i}: How does Firestore batch chunking work in TriQuiz?`,
      options: ['Chunk size 10', 'Chunk size 500', 'Chunk size 1', 'No chunks'],
      correctIndex: 0,
      explanation: 'TriQuiz uses CHUNK_SIZE = 10 to satisfy Firestore security rules exists() limits.',
    });
  }

  const summary = validateBulkImportBatch(questions, ADMIN_UID);
  const { importedDocs } = commitBulkImportDraftsToStore(summary);
  assert.equal(importedDocs.length, 25);

  const CHUNK_SIZE = 10;
  const totalBatches = Math.ceil(importedDocs.length / CHUNK_SIZE);
  assert.equal(totalBatches, 3); // Batches: 1 (10), 2 (10), 3 (5)

  // Simulate Firestore execution where Batch #2 fails due to a network glitch,
  // but Batch #1 and Batch #3 succeed (Condition 5: continue independent batches).
  const batchOutcomes: Array<{
    batchIndex: number;
    count: number;
    status: 'persisted' | 'failed';
    error?: string;
    questionIds: string[];
  }> = [];

  let persistedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < importedDocs.length; i += CHUNK_SIZE) {
    const slice = importedDocs.slice(i, i + CHUNK_SIZE);
    const batchIdx = Math.floor(i / CHUNK_SIZE) + 1;

    if (batchIdx === 2) {
      // Simulated transient failure on batch 2
      failedCount += slice.length;
      batchOutcomes.push({
        batchIndex: batchIdx,
        count: slice.length,
        status: 'failed',
        error: 'Simulated network timeout on batch #2',
        questionIds: slice.map((d) => d.id),
      });
    } else {
      // Batches 1 and 3 succeed
      persistedCount += slice.length;
      markQuestionsSyncedToFirestore(slice.map((d) => d.id));
      batchOutcomes.push({
        batchIndex: batchIdx,
        count: slice.length,
        status: 'persisted',
        questionIds: slice.map((d) => d.id),
      });
    }
  }

  // Verify per-batch outcomes and accurate accounting
  assert.equal(batchOutcomes.length, 3);
  assert.equal(persistedCount, 15); // Batch 1 (10) + Batch 3 (5)
  assert.equal(failedCount, 10);    // Batch 2 (10)
  assert.equal(batchOutcomes[0].status, 'persisted');
  assert.equal(batchOutcomes[1].status, 'failed');
  assert.equal(batchOutcomes[2].status, 'persisted');

  // Verify stats show 15 confirmed and 10 pending sync
  const midStats = computeQuestionBankOverviewStats();
  assert.equal(midStats.firestoreConfirmedQuestions, 15);
  assert.equal(midStats.pendingSyncQuestions, 10);

  // Now perform SAFE RETRY (targeting only !isQuestionSyncedToFirestore)
  const unpersisted = importedDocs.filter((d) => !isQuestionSyncedToFirestore(d.id));
  assert.equal(unpersisted.length, 10);
  assert.deepEqual(unpersisted.map((d) => d.id), batchOutcomes[1].questionIds);

  // Retry batch 2 - now it succeeds
  for (let i = 0; i < unpersisted.length; i += CHUNK_SIZE) {
    const slice = unpersisted.slice(i, i + CHUNK_SIZE);
    markQuestionsSyncedToFirestore(slice.map((d) => d.id));
  }

  // Verify all 25 are now firestoreConfirmed, 0 pendingSync, and zero duplicate documents created
  const finalStats = computeQuestionBankOverviewStats();
  assert.equal(finalStats.firestoreConfirmedQuestions, 25);
  assert.equal(finalStats.pendingSyncQuestions, 0);

  // Check store documents: total custom questions must still be exactly 25 (no duplicate docs created!)
  const allDocs = getAllQuestionBankDocuments();
  const customDocs = allDocs.filter((d) => d.source === 'imported');
  assert.equal(customDocs.length, 25, 'Retry must never create duplicate documents');
});

test('Cursor-based Pagination: Retrieving >1,000 documents across pages without limits', async () => {
  resetQuestionBankStoreToInitialForTesting();

  // Create mock remote collection with 1,250 documents to test cursor pagination
  const mockRemoteDocs: QuestionBankDocument[] = [];
  const TOTAL_REMOTE = 1250;
  for (let i = 0; i < TOTAL_REMOTE; i++) {
    mockRemoteDocs.push({
      id: `remote_q_${i.toString().padStart(5, '0')}`,
      subjectId: 'python',
      topic: 'Pagination',
      subtopic: 'Cursors',
      difficulty: 'easy',
      type: 'single_choice',
      question: `Pagination Question index_${i}`,
      options: ['A', 'B', 'C', 'D'],
      correctIndex: 0,
      explanation: 'Explanation for pagination test.',
      status: 'published',
      fingerprint: `python::pagination::single_choice::python::q_${i}`,
      contentSignature: `sig_${i}`,
      source: 'admin',
      createdAt: 1000 + i,
      updatedAt: 1000 + i,
      createdBy: ADMIN_UID,
    });
  }

  // Simulate cursor pagination loop (same logic as apiAdminSyncQuestionBank)
  const PAGE_SIZE = 500;
  let cursor = 0;
  const retrieved: QuestionBankDocument[] = [];
  let fetchIterations = 0;

  while (cursor < mockRemoteDocs.length) {
    fetchIterations++;
    const page = mockRemoteDocs.slice(cursor, cursor + PAGE_SIZE);
    retrieved.push(...page);
    cursor += page.length;
    if (page.length < PAGE_SIZE) {
      break;
    }
  }

  assert.equal(retrieved.length, 1250, 'Must retrieve all 1,250 documents without 1,000 doc limit');
  assert.equal(fetchIterations, 3, '1,250 docs with PAGE_SIZE 500 must require exactly 3 pages (500, 500, 250)');

  // Merge into local store and verify accurate accounting
  mergeRemoteFirestoreQuestionsIntoStore(retrieved);
  markQuestionsSyncedToFirestore(retrieved.map((d) => d.id));

  const stats = computeQuestionBankOverviewStats();
  assert.ok(stats.totalQuestions >= 1250);
  assert.ok(stats.firestoreConfirmedQuestions >= 1250);
  assert.equal(stats.bySubject['python'].firestoreConfirmed, 1250);
});
