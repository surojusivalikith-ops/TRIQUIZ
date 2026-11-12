import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SUBJECTS } from '../utils/questionEngine';
import type { QuestionDifficulty } from '../utils/questionBanks';
import {
  BulkImportValidationSummary,
  DuplicateMatchWarning,
  QuestionBankDocument,
  QuestionStatus,
  SUBJECT_TOPIC_TAXONOMY,
  TARGET_QUESTIONS_PER_SUBJECT,
  TARGET_TOTAL_QUESTIONS,
  analyzeQuestionDuplicates,
  computeQuestionBankOverviewStats,
  getAllQuestionBankDocuments,
  getRemoteFirestoreSyncedCount,
  getUnsyncedCustomQuestions,
  isQuestionSyncedToFirestore,
  parseBulkImportCSV,
  parseBulkImportJSON,
  queryQuestionBankPaginated,
  validateBulkImportBatch,
  validateQuestionInput,
} from '../utils/questionBankService';
import {
  UserProfile,
  apiAdminCommitBulkImport,
  apiAdminCreateQuestion,
  apiAdminDeleteAllDrafts,
  apiAdminDeleteBulkImportedQuestions,
  apiAdminDeleteQuestion,
  apiAdminMigrateCuratedBankToFirestore,
  apiAdminPublishAllDrafts,
  apiAdminPushUnsyncedQuestionsToFirestore,
  apiAdminSyncQuestionBank,
  apiAdminUpdateQuestion,
} from '../utils/apiService';

interface AdminDashboardViewProps {
  currentUser: UserProfile;
  onBackToStudentApp: () => void;
}

type AdminTab = 'overview' | 'manage' | 'add' | 'import' | 'review';

const LETTERS = ['A', 'B', 'C', 'D'] as const;

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentUser,
  onBackToStudentApp,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [dataRevision, setDataRevision] = useState<number>(1);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const [isSyncingRemote, setIsSyncingRemote] = useState(false);

  // Overview state
  const [overviewTopicSubject, setOverviewTopicSubject] =
    useState<string>('python');
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);

  // Question Management state (Paginated)
  const [manageSubject, setManageSubject] = useState<string>('all');
  const [manageTopic, setManageTopic] = useState<string>('all');
  const [manageDifficulty, setManageDifficulty] = useState<
    QuestionDifficulty | 'all'
  >('all');
  const [manageStatus, setManageStatus] = useState<QuestionStatus | 'all'>(
    'all'
  );
  const [manageSearch, setManageSearch] = useState<string>('');
  const [manageSort, setManageSort] = useState<'newest' | 'oldest'>('newest');
  const [managePage, setManagePage] = useState<number>(1);
  const [managePageSize, setManagePageSize] = useState<number>(15);
  const [previewQuestionId, setPreviewQuestionId] = useState<string | null>(
    null
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] =
    useState<QuestionBankDocument | null>(null);

  // Add / Edit Question Form state
  const [formSubjectId, setFormSubjectId] = useState<string>('python');
  const [formTopic, setFormTopic] = useState<string>('Variables and data types');
  const [formSubtopic, setFormSubtopic] = useState<string>(
    'Dynamic typing & mutability'
  );
  const [formDifficulty, setFormDifficulty] =
    useState<QuestionDifficulty>('medium');
  const [formQuestionText, setFormQuestionText] = useState<string>('');
  const [formOptionA, setFormOptionA] = useState<string>('');
  const [formOptionB, setFormOptionB] = useState<string>('');
  const [formOptionC, setFormOptionC] = useState<string>('');
  const [formOptionD, setFormOptionD] = useState<string>('');
  const [formCorrectIndex, setFormCorrectIndex] = useState<number>(0);
  const [formExplanation, setFormExplanation] = useState<string>('');
  const [formEventDate, setFormEventDate] = useState<string>('');
  const [formVerifiedSource, setFormVerifiedSource] = useState<string>('');
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [formWarnings, setFormWarnings] = useState<string[]>([]);
  const [formDuplicates, setFormDuplicates] = useState<DuplicateMatchWarning[]>(
    []
  );
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  // Bulk Import state
  const [importFormat, setImportFormat] = useState<'json' | 'csv'>('json');
  const [importRawText, setImportRawText] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [importParseError, setImportParseError] = useState<string>('');
  const [importSummary, setImportSummary] =
    useState<BulkImportValidationSummary | null>(null);
  const [isCommittingImport, setIsCommittingImport] = useState(false);
  const [confirmDeleteBulkImported, setConfirmDeleteBulkImported] =
    useState<boolean>(false);
  const [isDeletingBulkImported, setIsDeletingBulkImported] =
    useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Review Queue & Overall Draft Deletion / Bulk Publish state
  const [reviewSubjectFilter, setReviewSubjectFilter] = useState<string>('all');
  const [reviewPage, setReviewPage] = useState<number>(1);
  const [confirmDeleteAllDrafts, setConfirmDeleteAllDrafts] =
    useState<boolean>(false);
  const [isDeletingAllDrafts, setIsDeletingAllDrafts] =
    useState<boolean>(false);
  const [isPublishingAllDrafts, setIsPublishingAllDrafts] =
    useState<boolean>(false);
  const [isPushingUnsynced, setIsPushingUnsynced] = useState<boolean>(false);

  const handleManualFirestoreSync = async () => {
    if (!currentUser.isAdmin) return;
    setIsSyncingRemote(true);
    try {
      const res = await apiAdminSyncQuestionBank(currentUser);
      setDataRevision((r) => r + 1);
      if (res.syncError) {
        setStatusBanner({
          type: 'error',
          text: `Firestore read error: ${res.syncError}`,
        });
      }
    } catch {
      // ignore
    } finally {
      setIsSyncingRemote(false);
    }
  };

  useEffect(() => {
    void handleManualFirestoreSync();
  }, [currentUser]);

  // Keep default topic/subtopic synced when subject changes in Add mode (unless editing)
  const availableTopicsForFormSubject = useMemo(() => {
    return SUBJECT_TOPIC_TAXONOMY[formSubjectId] || [];
  }, [formSubjectId]);

  const availableSubtopicsForFormTopic = useMemo(() => {
    const found = availableTopicsForFormSubject.find(
      (t) => t.topic === formTopic
    );
    return found ? found.subtopics : ['Core Concepts'];
  }, [availableTopicsForFormSubject, formTopic]);

  const overviewStats = useMemo(() => {
    void dataRevision;
    return computeQuestionBankOverviewStats();
  }, [dataRevision]);

  const paginatedManageResult = useMemo(() => {
    void dataRevision;
    return queryQuestionBankPaginated({
      subjectId: manageSubject,
      topic: manageTopic,
      difficulty: manageDifficulty,
      status: manageStatus,
      searchQuery: manageSearch,
      sortOrder: manageSort,
      page: managePage,
      pageSize: managePageSize,
    });
  }, [
    dataRevision,
    manageSubject,
    manageTopic,
    manageDifficulty,
    manageStatus,
    manageSearch,
    manageSort,
    managePage,
    managePageSize,
  ]);

  const paginatedReviewResult = useMemo(() => {
    void dataRevision;
    return queryQuestionBankPaginated({
      subjectId: reviewSubjectFilter,
      status: 'draft',
      sortOrder: 'newest',
      page: reviewPage,
      pageSize: 10,
    });
  }, [dataRevision, reviewSubjectFilter, reviewPage]);

  const allDocsSnapshot = useMemo(() => {
    void dataRevision;
    return getAllQuestionBankDocuments();
  }, [dataRevision]);

  const bulkImportedQuestionsCount = useMemo(() => {
    return allDocsSnapshot.filter((d) => d.source === 'imported').length;
  }, [allDocsSnapshot]);

  const customQuestionsSummary = useMemo(() => {
    void dataRevision;
    const customDocs = allDocsSnapshot.filter(
      (d) => d.source === 'admin' || d.source === 'imported'
    );
    const customPublished = customDocs.filter(
      (d) => d.status === 'published'
    ).length;
    const customDraft = customDocs.filter((d) => d.status === 'draft').length;
    const unsyncedList = getUnsyncedCustomQuestions();
    const remoteConfirmedCount = getRemoteFirestoreSyncedCount();
    return {
      totalCustom: customDocs.length,
      customPublished,
      customDraft,
      unsyncedCount: unsyncedList.length,
      remoteConfirmedCount,
    };
  }, [allDocsSnapshot, dataRevision]);

  // Authorization Guard: Strict separation between ordinary student access and admin access
  if (!currentUser.isAdmin) {
    return (
      <div className="py-10 px-4 text-center font-mono">
        <div className="text-sm font-bold text-[#ff6b6b] mb-2">
          403 · Administrator Authorization Required
        </div>
        <p className="text-xs text-[#8b96a3] max-w-lg mx-auto mb-6 leading-relaxed">
          Access to the Question Bank Management System is restricted to verified administrators provisioned via Firebase Custom Claims or the server-controlled{' '}
          <code className="text-[#e6edf3]">/admins/&#123;uid&#125;</code> registry. Ordinary student accounts have read-only access to published quiz questions.
        </p>
        <button
          type="button"
          onClick={onBackToStudentApp}
          className="border border-[#232b35] hover:border-[#00d9a0] text-[#e6edf3] font-mono text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors"
        >
          ← return to student subjects
        </button>
      </div>
    );
  }

  const resetForm = (targetSubject = formSubjectId) => {
    const tax = SUBJECT_TOPIC_TAXONOMY[targetSubject] || [];
    const firstTopic = tax[0]?.topic || 'General';
    const firstSub = tax[0]?.subtopics[0] || 'Core Concepts';
    setEditingQuestion(null);
    setFormSubjectId(targetSubject);
    setFormTopic(firstTopic);
    setFormSubtopic(firstSub);
    setFormDifficulty('medium');
    setFormQuestionText('');
    setFormOptionA('');
    setFormOptionB('');
    setFormOptionC('');
    setFormOptionD('');
    setFormCorrectIndex(0);
    setFormExplanation('');
    setFormEventDate('');
    setFormVerifiedSource('');
    setFormErrors([]);
    setFormWarnings([]);
    setFormDuplicates([]);
  };

  const openEditQuestion = (q: QuestionBankDocument) => {
    setEditingQuestion(q);
    setFormSubjectId(q.subjectId);
    setFormTopic(q.topic);
    setFormSubtopic(q.subtopic);
    setFormDifficulty(q.difficulty);
    setFormQuestionText(q.question);
    setFormOptionA(q.options[0] || '');
    setFormOptionB(q.options[1] || '');
    setFormOptionC(q.options[2] || '');
    setFormOptionD(q.options[3] || '');
    setFormCorrectIndex(q.correctIndex);
    setFormExplanation(q.explanation);
    setFormEventDate(q.eventDate || '');
    setFormVerifiedSource(q.verifiedSource || '');
    setFormErrors([]);
    setFormWarnings([]);
    setFormDuplicates([]);
    setActiveTab('add');
  };

  const runLiveDuplicateCheck = () => {
    const val = validateQuestionInput(
      {
        id: editingQuestion?.id,
        subjectId: formSubjectId,
        topic: formTopic,
        subtopic: formSubtopic,
        difficulty: formDifficulty,
        question: formQuestionText,
        options: [formOptionA, formOptionB, formOptionC, formOptionD],
        correctIndex: formCorrectIndex,
        explanation: formExplanation,
        eventDate: formEventDate,
        verifiedSource: formVerifiedSource,
      },
      allDocsSnapshot
    );
    setFormErrors(val.errors);
    setFormWarnings(val.warnings);
    setFormDuplicates(val.duplicateMatches);
    return val;
  };

  const handleSaveQuestionForm = async (targetStatus: QuestionStatus) => {
    setStatusBanner(null);
    const val = runLiveDuplicateCheck();
    if (!val.valid) {
      return;
    }

    setIsSubmittingForm(true);
    try {
      const tupleOptions: [string, string, string, string] = [
        formOptionA.trim(),
        formOptionB.trim(),
        formOptionC.trim(),
        formOptionD.trim(),
      ];

      if (editingQuestion) {
        const res = await apiAdminUpdateQuestion(
          editingQuestion.id,
          {
            subjectId: formSubjectId,
            topic: formTopic.trim(),
            subtopic: formSubtopic.trim(),
            difficulty: formDifficulty,
            question: formQuestionText.trim(),
            options: tupleOptions,
            correctIndex: formCorrectIndex,
            explanation: formExplanation.trim(),
            status: targetStatus,
            eventDate: formEventDate.trim() || undefined,
            verifiedSource: formVerifiedSource.trim() || undefined,
          },
          currentUser
        );
        if (!res.ok) {
          setFormErrors(res.validation.errors);
          return;
        }
        setDataRevision((r) => r + 1);
        setStatusBanner({
          type: res.firestoreSyncWarning ? 'info' : 'success',
          text: res.firestoreSyncWarning
            ? `Question ${editingQuestion.id} updated (${targetStatus}) locally. Note: ${res.firestoreSyncWarning}`
            : `Question ${editingQuestion.id} updated (${targetStatus}) and synced to Cloud Firestore.`,
        });
        resetForm(formSubjectId);
        setActiveTab('manage');
      } else {
        const res = await apiAdminCreateQuestion(
          {
            subjectId: formSubjectId,
            topic: formTopic.trim(),
            subtopic: formSubtopic.trim(),
            difficulty: formDifficulty,
            question: formQuestionText.trim(),
            options: tupleOptions,
            correctIndex: formCorrectIndex,
            explanation: formExplanation.trim(),
            status: targetStatus,
            source: 'admin',
            eventDate: formEventDate.trim() || undefined,
            verifiedSource: formVerifiedSource.trim() || undefined,
          },
          currentUser
        );
        if (!res.ok) {
          setFormErrors(res.validation.errors);
          return;
        }
        setDataRevision((r) => r + 1);
        setStatusBanner({
          type: res.firestoreSyncWarning ? 'info' : 'success',
          text: res.firestoreSyncWarning
            ? `Question created (${res.doc?.id}) with status "${targetStatus}" locally. Note: ${res.firestoreSyncWarning}`
            : `Question created (${res.doc?.id}) with status "${targetStatus}" and synced to Cloud Firestore.`,
        });
        resetForm(formSubjectId);
      }
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'Failed to save question to Firestore.',
      });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleQuickStatusChange = async (
    q: QuestionBankDocument,
    nextStatus: QuestionStatus
  ) => {
    setStatusBanner(null);
    try {
      const res = await apiAdminUpdateQuestion(
        q.id,
        { status: nextStatus },
        currentUser
      );
      if (res.ok) {
        setDataRevision((r) => r + 1);
        setStatusBanner({
          type: res.firestoreSyncWarning ? 'info' : 'success',
          text: res.firestoreSyncWarning
            ? `Question ${q.id} marked as ${nextStatus} locally. Note: ${res.firestoreSyncWarning}`
            : `Question ${q.id} marked as ${nextStatus} and synced to Cloud Firestore.`,
        });
      } else {
        setStatusBanner({
          type: 'error',
          text: res.validation.errors.join(' '),
        });
      }
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Status update failed.',
      });
    }
  };

  const handleConfirmDelete = async (questionId: string) => {
    setStatusBanner(null);
    try {
      await apiAdminDeleteQuestion(questionId, currentUser);
      setConfirmDeleteId(null);
      if (previewQuestionId === questionId) setPreviewQuestionId(null);
      setDataRevision((r) => r + 1);
      setStatusBanner({
        type: 'info',
        text: `Question ${questionId} permanently deleted.`,
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Delete failed.',
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    const isCsv = file.name.toLowerCase().endsWith('.csv');
    setImportFormat(isCsv ? 'csv' : 'json');

    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      setImportRawText(content);
      runBulkValidationOnContent(content, isCsv ? 'csv' : 'json');
    };
    reader.readAsText(file);
  };

  const handleDeleteUploadedFile = () => {
    const removedName = uploadedFileName;
    setUploadedFileName('');
    setImportRawText('');
    setImportParseError('');
    setImportSummary(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setStatusBanner({
      type: 'info',
      text: removedName
        ? `Deleted uploaded file "${removedName}" and cleared staged batch preview.`
        : 'Cleared bulk import content and batch preview.',
    });
  };

  const handleDeleteAllDrafts = async (subjectScope?: string) => {
    setIsDeletingAllDrafts(true);
    setStatusBanner(null);
    try {
      const scope =
        subjectScope && subjectScope !== 'all' ? subjectScope : undefined;
      const res = await apiAdminDeleteAllDrafts(currentUser, scope);
      setConfirmDeleteAllDrafts(false);
      setReviewPage(1);
      setDataRevision((r) => r + 1);
      setStatusBanner({
        type: 'info',
        text: `Deleted ${res.deletedCount} draft question(s)${
          scope ? ` in ${scope.toUpperCase()}` : ' across all subjects'
        }.`,
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'Failed to delete draft questions.',
      });
    } finally {
      setIsDeletingAllDrafts(false);
    }
  };

  const handlePublishAllDrafts = async (subjectScope?: string) => {
    setIsPublishingAllDrafts(true);
    setStatusBanner(null);
    try {
      const scope =
        subjectScope && subjectScope !== 'all' ? subjectScope : undefined;
      const res = await apiAdminPublishAllDrafts(currentUser, scope);
      setConfirmDeleteAllDrafts(false);
      setReviewPage(1);
      setDataRevision((r) => r + 1);
      setStatusBanner({
        type: res.firestoreSyncWarning ? 'info' : 'success',
        text: res.firestoreSyncWarning
          ? `Approved & published ${res.publishedCount} draft question(s)${
              scope ? ` in ${scope.toUpperCase()}` : ' across all subjects'
            } (${res.publishedToFirestoreCount} synced to Firestore). Note: ${res.firestoreSyncWarning}`
          : `Approved & published all ${res.publishedCount} draft question(s)${
              scope ? ` in ${scope.toUpperCase()}` : ' across all subjects'
            }! They are now live for students.`,
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'Failed to publish draft questions.',
      });
    } finally {
      setIsPublishingAllDrafts(false);
    }
  };

  const handleDeleteBulkImportedQuestions = async () => {
    setIsDeletingBulkImported(true);
    setStatusBanner(null);
    try {
      const res = await apiAdminDeleteBulkImportedQuestions(currentUser);
      setConfirmDeleteBulkImported(false);
      setDataRevision((r) => r + 1);
      setStatusBanner({
        type: 'info',
        text: `Deleted ${res.deletedCount} bulk-imported question(s) from the question bank.`,
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'Failed to delete bulk-imported questions.',
      });
    } finally {
      setIsDeletingBulkImported(false);
    }
  };

  const handlePushUnsyncedToFirestore = async () => {
    setIsPushingUnsynced(true);
    setStatusBanner(null);
    try {
      const res = await apiAdminPushUnsyncedQuestionsToFirestore(currentUser);
      setDataRevision((r) => r + 1);
      if (res.firestoreSyncWarning) {
        setStatusBanner({
          type: 'info',
          text: `Pushed ${res.pushedToFirestoreCount} / ${res.totalUnsynced} question(s) to Cloud Firestore. Note: ${res.firestoreSyncWarning}`,
        });
      } else {
        setStatusBanner({
          type: 'success',
          text: `Synced all ${res.pushedToFirestoreCount} custom/bulk-imported question(s) to Cloud Firestore (questionBank collection)!`,
        });
      }
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'Failed to push unsynced questions to Cloud Firestore.',
      });
    } finally {
      setIsPushingUnsynced(false);
    }
  };

  const runBulkValidationOnContent = (
    rawContent: string,
    fmt: 'json' | 'csv' = importFormat
  ) => {
    setImportParseError('');
    setImportSummary(null);
    if (!rawContent.trim()) {
      setImportParseError('Please upload a file or paste JSON/CSV records first.');
      return;
    }
    const parsed =
      fmt === 'csv'
        ? parseBulkImportCSV(rawContent)
        : parseBulkImportJSON(rawContent);
    if (parsed.parseError) {
      setImportParseError(parsed.parseError);
      return;
    }
    const summary = validateBulkImportBatch(parsed.records, currentUser.uid);
    setImportSummary(summary);
  };

  const handleCommitBulkImportDrafts = async () => {
    if (!importSummary || importSummary.validReadyCount === 0) return;
    setIsCommittingImport(true);
    setStatusBanner(null);
    try {
      const res = await apiAdminCommitBulkImport(importSummary, currentUser);
      setDataRevision((r) => r + 1);
      setStatusBanner({
        type: res.firestoreSyncWarning ? 'info' : 'success',
        text: res.firestoreSyncWarning
          ? `Imported ${res.importedCount} validated questions as Drafts in the Admin Dashboard (${res.persistedToFirestoreCount} synced to Firestore). Note: ${res.firestoreSyncWarning}`
          : `Imported ${res.importedCount} validated questions as Drafts for review (${res.persistedToFirestoreCount} synced to Firestore). Unreviewed bulk imports are never published automatically.`,
      });
      setImportSummary(null);
      setImportRawText('');
      setUploadedFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setActiveTab('review');
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text: err instanceof Error ? err.message : 'Bulk import failed.',
      });
    } finally {
      setIsCommittingImport(false);
    }
  };

  const handleDownloadRejectedReport = () => {
    if (!importSummary) return;
    const rejected = importSummary.rows
      .filter((r) => !r.valid)
      .map((r) => ({
        rowIndex: r.rowIndex,
        errors: r.errors,
        warnings: r.warnings,
        rawRecord: r.rawRecord,
      }));
    const blob = new Blob([JSON.stringify(rejected, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `triquiz-rejected-import-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRunIdempotentMigration = async () => {
    setIsMigrating(true);
    setMigrationProgress({ done: 0, total: overviewStats.totalQuestions });
    setStatusBanner(null);
    try {
      const res = await apiAdminMigrateCuratedBankToFirestore(
        currentUser,
        (done, total) => setMigrationProgress({ done, total })
      );
      setDataRevision((r) => r + 1);
      setStatusBanner({
        type: res.firestoreSyncWarning ? 'info' : 'success',
        text: res.firestoreSyncWarning
          ? `Idempotent migration prepared ${res.totalPrepared} curated questions (${res.migratedToFirestore} written to Firestore). Note: ${res.firestoreSyncWarning}`
          : `Idempotent migration verified: ${res.totalPrepared} curated questions backed up (${res.backupKey}), ${res.migratedToFirestore} written to Firestore, ${res.skippedExistingInFirestore} existing skipped.`,
      });
    } catch (err) {
      setStatusBanner({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'Firestore migration encountered a permission or network error.',
      });
    } finally {
      setIsMigrating(false);
      setMigrationProgress(null);
    }
  };

  const manageTopicsForSelectedSubject = useMemo(() => {
    if (manageSubject === 'all') return [];
    return (SUBJECT_TOPIC_TAXONOMY[manageSubject] || []).map((t) => t.topic);
  }, [manageSubject]);

  return (
    <div>
      {/* Top Header & Navigation Tabs */}
      <div className="flex items-start justify-between flex-wrap gap-4 pb-5 mb-6 border-b border-[#232b35]">
        <div>
          <h1 className="font-mono text-2xl font-bold text-[#e6edf3]">
            admin question bank<span className="terminal-cursor" />
          </h1>
          <p className="font-mono text-xs text-[#8b96a3] mt-1">
            questionBank/&#123;questionId&#125; · target 9,000 curated questions (1,000 per subject)
            {isSyncingRemote ? ' · syncing Firestore…' : ''}
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToStudentApp}
          className="border border-[#232b35] hover:border-[#8b96a3] text-[#e6edf3] font-mono text-xs px-3.5 py-2 rounded-lg cursor-pointer transition-colors whitespace-nowrap"
        >
          ← student dashboard
        </button>
      </div>

      {/* Segmented Module Bar */}
      <div
        role="tablist"
        aria-label="Admin dashboard modules"
        className="flex items-center gap-1.5 flex-wrap bg-[#161d26] p-1.5 rounded-lg border border-[#232b35] mb-6"
      >
        {(
          [
            { id: 'overview', label: 'Overview & Progress' },
            {
              id: 'manage',
              label: `Manage Questions (${overviewStats.totalQuestions})`,
            },
            {
              id: 'add',
              label: editingQuestion ? 'Edit Question' : 'Add Question',
            },
            { id: 'import', label: 'Bulk Import (JSON/CSV)' },
            {
              id: 'review',
              label: `Review Queue (${overviewStats.draftQuestions})`,
            },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={activeTab === t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`font-mono text-xs px-3 py-1.5 rounded cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === t.id
                ? 'bg-[#00d9a0] text-[#04140f] font-bold'
                : 'text-[#8b96a3] hover:text-[#e6edf3]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {statusBanner && (
        <div
          className={`mb-5 px-4 py-3 rounded-lg border font-mono text-xs flex items-center justify-between gap-3 ${
            statusBanner.type === 'success'
              ? 'border-[#00d9a0]/40 bg-[#00d9a0]/10 text-[#00d9a0]'
              : statusBanner.type === 'error'
                ? 'border-[#ff6b6b]/40 bg-[#ff6b6b]/10 text-[#ff6b6b]'
                : 'border-[#ffb454]/40 bg-[#ffb454]/10 text-[#ffb454]'
          }`}
        >
          <span>{statusBanner.text}</span>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="underline text-[11px] cursor-pointer shrink-0"
          >
            dismiss
          </button>
        </div>
      )}

      {/* Cloud Firestore & Question Bank Live Sync Diagnostic Bar */}
      <div className="mb-6 bg-[#161d26] border border-[#232b35] rounded-lg px-4 py-3 flex items-center justify-between flex-wrap gap-3 font-mono text-xs">
        <div className="flex items-center gap-3 flex-wrap text-[#8b96a3]">
          <span>
            Cloud Firestore (<code className="text-[#e6edf3]">questionBank</code>):{' '}
            <strong className="text-[#00d9a0] tabular-nums">
              {customQuestionsSummary.remoteConfirmedCount}
            </strong>{' '}
            confirmed in cloud
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Your Added/Imported:{' '}
            <strong className="text-[#e6edf3] tabular-nums">
              {customQuestionsSummary.totalCustom}
            </strong>{' '}
            (
            <span className="text-[#00d9a0] tabular-nums">
              {customQuestionsSummary.customPublished} published
            </span>{' '}
            /{' '}
            <span className="text-[#ffb454] tabular-nums">
              {customQuestionsSummary.customDraft} draft
            </span>
            )
          </span>
          {customQuestionsSummary.unsyncedCount > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-[#ffb454]">
                {customQuestionsSummary.unsyncedCount} saved locally (pending cloud sync)
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {customQuestionsSummary.unsyncedCount > 0 && (
            <button
              type="button"
              disabled={isPushingUnsynced}
              onClick={handlePushUnsyncedToFirestore}
              className="bg-[#00d9a0] hover:bg-[#00e6aa] text-[#04140f] font-bold px-3 py-1 rounded cursor-pointer transition-colors disabled:opacity-50"
            >
              {isPushingUnsynced
                ? 'pushing to firestore…'
                : `push ${customQuestionsSummary.unsyncedCount} unsynced to firestore`}
            </button>
          )}
          <button
            type="button"
            disabled={isSyncingRemote}
            onClick={handleManualFirestoreSync}
            className="border border-[#232b35] hover:border-[#8b96a3] text-[#e6edf3] px-2.5 py-1 rounded cursor-pointer transition-colors disabled:opacity-50"
          >
            {isSyncingRemote ? 'checking cloud…' : 'refresh cloud status'}
          </button>
        </div>
      </div>

      {/* =====================================================================
          MODULE A: OVERVIEW
          ===================================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-[#161d26] border border-[#232b35] rounded-lg p-4">
              <div className="font-mono text-xs text-[#8b96a3]">
                Total Questions
              </div>
              <div className="font-mono text-2xl font-bold text-[#e6edf3] mt-1 tabular-nums">
                {overviewStats.totalQuestions.toLocaleString()}
              </div>
              <div className="font-mono text-[11px] text-[#8b96a3] mt-1 tabular-nums">
                target: {TARGET_TOTAL_QUESTIONS.toLocaleString()} total
              </div>
            </div>

            <div className="bg-[#161d26] border border-[#232b35] rounded-lg p-4">
              <div className="font-mono text-xs text-[#8b96a3]">
                Published (Student-Live)
              </div>
              <div className="font-mono text-2xl font-bold text-[#00d9a0] mt-1 tabular-nums">
                {overviewStats.publishedQuestions.toLocaleString()}
              </div>
              <div className="font-mono text-[11px] text-[#8b96a3] mt-1 tabular-nums">
                {overviewStats.remainingTotalToTarget.toLocaleString()} needed for 9,000
              </div>
            </div>

            <div className="bg-[#161d26] border border-[#232b35] rounded-lg p-4 flex flex-col justify-between">
              <div>
                <div className="font-mono text-xs text-[#8b96a3]">
                  Draft (Pending Review)
                </div>
                <div className="font-mono text-2xl font-bold text-[#ffb454] mt-1 tabular-nums">
                  {overviewStats.draftQuestions.toLocaleString()}
                </div>
                <div className="font-mono text-[11px] text-[#8b96a3] mt-1">
                  hidden from students
                </div>
              </div>
              {overviewStats.draftQuestions > 0 && (
                <div className="mt-3 pt-2.5 border-t border-[#232b35]">
                  {!confirmDeleteAllDrafts ? (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteAllDrafts(true)}
                      className="w-full border border-[#ff6b6b]/50 hover:bg-[#ff6b6b]/15 text-[#ff6b6b] font-mono text-[11px] px-2.5 py-1 rounded cursor-pointer transition-colors"
                    >
                      delete all {overviewStats.draftQuestions} drafts
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <button
                        type="button"
                        disabled={isDeletingAllDrafts}
                        onClick={() => handleDeleteAllDrafts()}
                        className="flex-1 bg-[#ff6b6b] text-[#04140f] font-bold px-2 py-1 rounded cursor-pointer disabled:opacity-50"
                      >
                        {isDeletingAllDrafts ? 'deleting…' : 'confirm delete'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteAllDrafts(false)}
                        className="border border-[#232b35] text-[#e6edf3] px-2 py-1 rounded cursor-pointer"
                      >
                        cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-[#161d26] border border-[#232b35] rounded-lg p-4">
              <div className="font-mono text-xs text-[#8b96a3]">
                Archived Questions
              </div>
              <div className="font-mono text-2xl font-bold text-[#8b96a3] mt-1 tabular-nums">
                {overviewStats.archivedQuestions.toLocaleString()}
              </div>
              <div className="font-mono text-[11px] text-[#8b96a3] mt-1">
                retired from active pool
              </div>
            </div>
          </div>

          {/* Difficulty Distribution vs 30/45/25 Target */}
          <div className="bg-[#161d26] border border-[#232b35] rounded-lg p-4">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <h2 className="font-mono text-sm font-bold text-[#e6edf3]">
                Difficulty Distribution (Target: 30% Easy · 45% Medium · 25% Hard)
              </h2>
              <span className="font-mono text-xs text-[#8b96a3] tabular-nums">
                Easy: {overviewStats.difficultyDistribution.easy} (
                {overviewStats.difficultyDistribution.easyPct}%) · Medium:{' '}
                {overviewStats.difficultyDistribution.medium} (
                {overviewStats.difficultyDistribution.mediumPct}%) · Hard:{' '}
                {overviewStats.difficultyDistribution.hard} (
                {overviewStats.difficultyDistribution.hardPct}%)
              </span>
            </div>
            <div className="h-2.5 bg-[#12181f] rounded-full overflow-hidden flex">
              <div
                style={{
                  width: `${overviewStats.difficultyDistribution.easyPct}%`,
                }}
                className="bg-[#00d9a0]"
                title="Easy"
              />
              <div
                style={{
                  width: `${overviewStats.difficultyDistribution.mediumPct}%`,
                }}
                className="bg-[#5da9e9]"
                title="Medium"
              />
              <div
                style={{
                  width: `${overviewStats.difficultyDistribution.hardPct}%`,
                }}
                className="bg-[#ffb454]"
                title="Hard"
              />
            </div>
          </div>

          {/* Subject-wise Counts & Remaining to 1,000 Target */}
          <div className="bg-[#161d26] border border-[#232b35] rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-[#232b35] flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-mono text-sm font-bold text-[#e6edf3]">
                Subject-wise Question Bank Progress (1,000 Target per Subject)
              </h2>
              <span className="font-mono text-xs text-[#8b96a3] tabular-nums">
                {overviewStats.publishedQuestions.toLocaleString()} /{' '}
                {TARGET_TOTAL_QUESTIONS.toLocaleString()} published
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-[#232b35] text-[#8b96a3]">
                    <th className="py-2.5 px-4">Subject</th>
                    <th className="py-2.5 px-3 text-right">Published</th>
                    <th className="py-2.5 px-3 text-right">Draft</th>
                    <th className="py-2.5 px-3 text-right">Archived</th>
                    <th className="py-2.5 px-3 text-right">E / M / H</th>
                    <th className="py-2.5 px-4 text-right">
                      Remaining to 1,000
                    </th>
                    <th className="py-2.5 px-4">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232b35]">
                  {SUBJECTS.map((s) => {
                    const st = overviewStats.bySubject[s.id];
                    if (!st) return null;
                    const pct = Math.min(
                      100,
                      Math.round(
                        (st.published / TARGET_QUESTIONS_PER_SUBJECT) * 100
                      )
                    );
                    return (
                      <tr
                        key={s.id}
                        className="hover:bg-[#1b2430]/60 transition-colors"
                      >
                        <td className="py-2.5 px-4 font-bold">
                          <button
                            type="button"
                            onClick={() => setOverviewTopicSubject(s.id)}
                            style={{ color: s.hex }}
                            className="hover:underline cursor-pointer text-left"
                          >
                            {s.label}
                          </button>
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#00d9a0] font-semibold tabular-nums">
                          {st.published}
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#ffb454] tabular-nums">
                          {st.draft}
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#8b96a3] tabular-nums">
                          {st.archived}
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#8b96a3] tabular-nums">
                          {st.easy} / {st.medium} / {st.hard}
                        </td>
                        <td className="py-2.5 px-4 text-right text-[#e6edf3] font-semibold tabular-nums">
                          {st.remainingToTarget.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-4 w-36">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-[#12181f] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#00d9a0]"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[11px] text-[#8b96a3] w-9 text-right tabular-nums">
                              {pct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Topic-wise Question Breakdown */}
          <div className="bg-[#161d26] border border-[#232b35] rounded-lg p-4">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
              <h2 className="font-mono text-sm font-bold text-[#e6edf3]">
                Topic-wise Question Counts
              </h2>
              <div className="flex items-center gap-1.5 flex-wrap">
                {SUBJECTS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setOverviewTopicSubject(s.id)}
                    className={`font-mono text-[11px] px-2.5 py-1 rounded cursor-pointer transition-colors ${
                      overviewTopicSubject === s.id
                        ? 'bg-[#00d9a0] text-[#04140f] font-bold'
                        : 'bg-[#12181f] text-[#8b96a3] hover:text-[#e6edf3]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {Object.entries(
                overviewStats.bySubject[overviewTopicSubject]?.topics || {}
              )
                .sort((a, b) => b[1] - a[1])
                .map(([topicName, count]) => (
                  <div
                    key={topicName}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded bg-[#12181f] border border-[#232b35] font-mono text-xs"
                  >
                    <span className="text-[#e6edf3] truncate">{topicName}</span>
                    <span className="text-[#00d9a0] font-bold tabular-nums shrink-0">
                      {count} Qs
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Phase 8: Idempotent Curated Question Bank Migration Panel */}
          <div className="bg-[#161d26] border border-[#232b35] rounded-lg p-4 flex items-center justify-between flex-wrap gap-4">
            <div className="max-w-xl">
              <h3 className="font-mono text-sm font-bold text-[#e6edf3]">
                Phase 8 · Idempotent Curated Question Bank Migration
              </h3>
              <p className="text-xs text-[#8b96a3] mt-1 leading-relaxed">
                Backs up the curated bank locally and synchronizes all{' '}
                {overviewStats.publishedQuestions} verified curated questions to Firestore{' '}
                <code className="text-[#e6edf3]">questionBank/&#123;questionId&#125;</code> using deterministic IDs and canonical fingerprints without duplicating existing records.
              </p>
            </div>
            <button
              type="button"
              disabled={isMigrating}
              onClick={handleRunIdempotentMigration}
              className="bg-[#00d9a0] hover:bg-[#00e6aa] text-[#04140f] font-mono font-bold text-xs px-4 py-2.5 rounded-lg cursor-pointer transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {isMigrating
                ? migrationProgress
                  ? `migrating (${migrationProgress.done}/${migrationProgress.total})…`
                  : 'migrating…'
                : 'backup & sync curated bank to firestore'}
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODULE B: QUESTION MANAGEMENT (Paginated, Searchable, Filterable)
          ===================================================================== */}
      {activeTab === 'manage' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="bg-[#161d26] border border-[#232b35] rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <input
                type="search"
                value={manageSearch}
                onChange={(e) => {
                  setManageSearch(e.target.value);
                  setManagePage(1);
                }}
                placeholder="Search question text, topic, or ID…"
                aria-label="Search questions"
                className="lg:col-span-2 bg-[#12181f] border border-[#232b35] focus:border-[#00d9a0] rounded-lg px-3 py-2 font-mono text-xs text-[#e6edf3] outline-none"
              />

              <select
                value={manageSubject}
                aria-label="Filter by subject"
                onChange={(e) => {
                  setManageSubject(e.target.value);
                  setManageTopic('all');
                  setManagePage(1);
                }}
                className="bg-[#12181f] border border-[#232b35] rounded-lg px-3 py-2 font-mono text-xs text-[#e6edf3] outline-none"
              >
                <option value="all">All Subjects</option>
                {SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>

              <select
                value={manageDifficulty}
                aria-label="Filter by difficulty"
                onChange={(e) => {
                  setManageDifficulty(
                    e.target.value as QuestionDifficulty | 'all'
                  );
                  setManagePage(1);
                }}
                className="bg-[#12181f] border border-[#232b35] rounded-lg px-3 py-2 font-mono text-xs text-[#e6edf3] outline-none"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              <select
                value={manageStatus}
                aria-label="Filter by status"
                onChange={(e) => {
                  setManageStatus(e.target.value as QuestionStatus | 'all');
                  setManagePage(1);
                }}
                className="bg-[#12181f] border border-[#232b35] rounded-lg px-3 py-2 font-mono text-xs text-[#e6edf3] outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-[#232b35] font-mono text-xs text-[#8b96a3]">
              <div className="flex items-center gap-3 flex-wrap">
                {manageSubject !== 'all' &&
                  manageTopicsForSelectedSubject.length > 0 && (
                    <select
                      value={manageTopic}
                      aria-label="Filter by topic"
                      onChange={(e) => {
                        setManageTopic(e.target.value);
                        setManagePage(1);
                      }}
                      className="bg-[#12181f] border border-[#232b35] rounded px-2.5 py-1 text-xs text-[#e6edf3] outline-none"
                    >
                      <option value="all">All Topics in Subject</option>
                      {manageTopicsForSelectedSubject.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  )}

                <select
                  value={manageSort}
                  aria-label="Sort by creation date"
                  onChange={(e) =>
                    setManageSort(e.target.value as 'newest' | 'oldest')
                  }
                  className="bg-[#12181f] border border-[#232b35] rounded px-2.5 py-1 text-xs text-[#e6edf3] outline-none"
                >
                  <option value="newest">Sort: Newest Created</option>
                  <option value="oldest">Sort: Oldest Created</option>
                </select>

                <select
                  value={managePageSize}
                  aria-label="Questions per page"
                  onChange={(e) => {
                    setManagePageSize(Number(e.target.value));
                    setManagePage(1);
                  }}
                  className="bg-[#12181f] border border-[#232b35] rounded px-2.5 py-1 text-xs text-[#e6edf3] outline-none"
                >
                  <option value={10}>10 per page</option>
                  <option value={15}>15 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>

                {overviewStats.draftQuestions > 0 && (
                  <button
                    type="button"
                    disabled={isDeletingAllDrafts}
                    onClick={() => handleDeleteAllDrafts()}
                    className="border border-[#ff6b6b]/50 hover:bg-[#ff6b6b]/15 text-[#ff6b6b] font-mono text-xs px-2.5 py-1 rounded cursor-pointer disabled:opacity-50"
                  >
                    {isDeletingAllDrafts
                      ? 'deleting drafts…'
                      : `delete all drafts (${overviewStats.draftQuestions})`}
                  </button>
                )}
              </div>

              <span className="tabular-nums">
                Showing {paginatedManageResult.items.length} of{' '}
                {paginatedManageResult.totalMatching.toLocaleString()} matching questions (Page{' '}
                {paginatedManageResult.page} of{' '}
                {paginatedManageResult.totalPages})
              </span>
            </div>
          </div>

          {/* Paginated Question List */}
          {paginatedManageResult.items.length === 0 ? (
            <div className="bg-[#161d26] border border-[#232b35] rounded-lg py-10 text-center font-mono text-xs text-[#8b96a3]">
              No questions match your current filters.
            </div>
          ) : (
            <div className="space-y-2.5">
              {paginatedManageResult.items.map((q) => {
                const isPreviewOpen = previewQuestionId === q.id;
                const isConfirmingDelete = confirmDeleteId === q.id;
                return (
                  <div
                    key={q.id}
                    className="bg-[#161d26] border border-[#232b35] rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        {/* Unboxed metadata row per zero-pill discipline */}
                        <div className="font-mono text-[11px] text-[#8b96a3] flex items-center gap-1.5 flex-wrap mb-1.5">
                          <span className="font-bold text-[#00d9a0] uppercase">
                            {q.subjectId}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{q.topic}</span>
                          <span aria-hidden="true">·</span>
                          <span>{q.subtopic}</span>
                          <span aria-hidden="true">·</span>
                          <span>{q.difficulty}</span>
                          <span aria-hidden="true">·</span>
                          <span
                            className={
                              q.status === 'published'
                                ? 'text-[#00d9a0] font-semibold'
                                : q.status === 'draft'
                                  ? 'text-[#ffb454] font-semibold'
                                  : 'text-[#8b96a3]'
                            }
                          >
                            {q.status}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span
                            className={
                              isQuestionSyncedToFirestore(q.id)
                                ? 'text-[#00d9a0]'
                                : q.source === 'admin' || q.source === 'imported'
                                  ? 'text-[#ffb454]'
                                  : 'text-[#8b96a3]'
                            }
                          >
                            {isQuestionSyncedToFirestore(q.id)
                              ? 'firestore synced'
                              : q.source === 'admin' || q.source === 'imported'
                                ? 'local (unsynced)'
                                : 'built-in curated'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#8b96a3]/70">{q.id}</span>
                        </div>

                        <div className="text-sm font-semibold text-[#e6edf3] leading-snug">
                          {q.question}
                        </div>
                      </div>

                      {/* Row Actions */}
                      <div className="flex items-center gap-2 shrink-0 flex-wrap font-mono text-[11px]">
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewQuestionId(isPreviewOpen ? null : q.id)
                          }
                          className="border border-[#232b35] hover:border-[#8b96a3] text-[#e6edf3] px-2.5 py-1 rounded cursor-pointer"
                        >
                          {isPreviewOpen ? 'hide' : 'preview'}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditQuestion(q)}
                          className="border border-[#232b35] hover:border-[#00d9a0] text-[#00d9a0] px-2.5 py-1 rounded cursor-pointer"
                        >
                          edit
                        </button>
                        {q.status !== 'published' && (
                          <button
                            type="button"
                            onClick={() =>
                              handleQuickStatusChange(q, 'published')
                            }
                            className="border border-[#00d9a0]/50 hover:bg-[#00d9a0]/15 text-[#00d9a0] px-2.5 py-1 rounded cursor-pointer"
                          >
                            publish
                          </button>
                        )}
                        {q.status !== 'archived' && (
                          <button
                            type="button"
                            onClick={() =>
                              handleQuickStatusChange(q, 'archived')
                            }
                            className="border border-[#232b35] hover:border-[#ffb454] text-[#ffb454] px-2.5 py-1 rounded cursor-pointer"
                          >
                            archive
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmDeleteId(
                              isConfirmingDelete ? null : q.id
                            )
                          }
                          className="border border-[#232b35] hover:border-[#ff6b6b] text-[#ff6b6b] px-2.5 py-1 rounded cursor-pointer"
                        >
                          delete
                        </button>
                      </div>
                    </div>

                    {/* Delete Confirmation Bar */}
                    {isConfirmingDelete && (
                      <div className="mt-3 pt-3 border-t border-[#ff6b6b]/40 flex items-center justify-between flex-wrap gap-2 font-mono text-xs text-[#ff6b6b]">
                        <span>
                          Confirm permanent deletion of question{' '}
                          <strong>{q.id}</strong>?
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleConfirmDelete(q.id)}
                            className="bg-[#ff6b6b] text-[#04140f] font-bold px-3 py-1 rounded cursor-pointer"
                          >
                            yes, delete permanently
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="border border-[#232b35] text-[#e6edf3] px-3 py-1 rounded cursor-pointer"
                          >
                            cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Expanded Question Preview */}
                    {isPreviewOpen && (
                      <div className="mt-3 pt-3 border-t border-[#232b35] space-y-2.5 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
                          {q.options.map((opt, idx) => (
                            <div
                              key={idx}
                              className={`px-3 py-2 rounded border ${
                                idx === q.correctIndex
                                  ? 'border-[#00d9a0]/50 bg-[#00d9a0]/10 text-[#00d9a0] font-semibold'
                                  : 'border-[#232b35] bg-[#12181f] text-[#c9d3df]'
                              }`}
                            >
                              {LETTERS[idx]}. {opt}{' '}
                              {idx === q.correctIndex ? '✓' : ''}
                            </div>
                          ))}
                        </div>
                        <div className="text-[#c9d3df] leading-relaxed bg-[#12181f] p-3 rounded border border-[#232b35]">
                          <strong className="font-mono text-[#00d9a0] mr-1.5">
                            Explanation:
                          </strong>
                          {q.explanation}
                        </div>
                        <div className="font-mono text-[11px] text-[#8b96a3] flex items-center justify-between flex-wrap gap-2">
                          <span className="truncate max-w-xl">
                            fingerprint: {q.fingerprint}
                          </span>
                          <span>
                            source: {q.source}
                            {q.eventDate ? ` · eventDate: ${q.eventDate}` : ''}
                            {q.verifiedSource
                              ? ` · source: ${q.verifiedSource}`
                              : ''}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Footer */}
          <div className="flex items-center justify-between flex-wrap gap-3 pt-2 font-mono text-xs">
            <button
              type="button"
              disabled={paginatedManageResult.page <= 1}
              onClick={() => setManagePage((p) => Math.max(1, p - 1))}
              className="border border-[#232b35] hover:border-[#8b96a3] text-[#e6edf3] px-3.5 py-2 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← previous page
            </button>
            <span className="text-[#8b96a3] tabular-nums">
              Page {paginatedManageResult.page} of{' '}
              {paginatedManageResult.totalPages} (
              {paginatedManageResult.totalMatching.toLocaleString()} questions)
            </span>
            <button
              type="button"
              disabled={!paginatedManageResult.hasMore}
              onClick={() => setManagePage((p) => p + 1)}
              className="border border-[#232b35] hover:border-[#8b96a3] text-[#e6edf3] px-3.5 py-2 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              next page →
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODULE C: ADD / EDIT QUESTION
          ===================================================================== */}
      {activeTab === 'add' && (
        <div className="bg-[#161d26] border border-[#232b35] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#232b35]">
            <h2 className="font-mono text-base font-bold text-[#e6edf3]">
              {editingQuestion
                ? `Edit Question (${editingQuestion.id})`
                : 'Create Curated Question'}
            </h2>
            {editingQuestion && (
              <button
                type="button"
                onClick={() => resetForm()}
                className="font-mono text-xs text-[#8b96a3] hover:text-[#e6edf3] underline cursor-pointer"
              >
                cancel edit &amp; switch to new question
              </button>
            )}
          </div>

          {/* Subject, Topic, Subtopic, Difficulty Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div>
              <label className="block font-mono text-xs text-[#8b96a3] mb-1.5">
                Subject
              </label>
              <select
                value={formSubjectId}
                onChange={(e) => {
                  const nextSubj = e.target.value;
                  setFormSubjectId(nextSubj);
                  const tax = SUBJECT_TOPIC_TAXONOMY[nextSubj] || [];
                  setFormTopic(tax[0]?.topic || 'General');
                  setFormSubtopic(tax[0]?.subtopics[0] || 'Core Concepts');
                }}
                className="w-full bg-[#12181f] border border-[#232b35] rounded-lg px-3 py-2 font-mono text-xs text-[#e6edf3] outline-none"
              >
                {SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs text-[#8b96a3] mb-1.5">
                Topic
              </label>
              <select
                value={formTopic}
                onChange={(e) => {
                  const nextTopic = e.target.value;
                  setFormTopic(nextTopic);
                  const found = availableTopicsForFormSubject.find(
                    (t) => t.topic === nextTopic
                  );
                  if (found && found.subtopics[0]) {
                    setFormSubtopic(found.subtopics[0]);
                  }
                }}
                className="w-full bg-[#12181f] border border-[#232b35] rounded-lg px-3 py-2 font-mono text-xs text-[#e6edf3] outline-none"
              >
                {availableTopicsForFormSubject.map((t) => (
                  <option key={t.topic} value={t.topic}>
                    {t.topic}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs text-[#8b96a3] mb-1.5">
                Subtopic
              </label>
              <input
                type="text"
                list="subtopic-options"
                value={formSubtopic}
                onChange={(e) => setFormSubtopic(e.target.value)}
                placeholder="e.g. Function Arguments"
                className="w-full bg-[#12181f] border border-[#232b35] rounded-lg px-3 py-2 font-mono text-xs text-[#e6edf3] outline-none"
              />
              <datalist id="subtopic-options">
                {availableSubtopicsForFormTopic.map((sub) => (
                  <option key={sub} value={sub} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block font-mono text-xs text-[#8b96a3] mb-1.5">
                Difficulty
              </label>
              <select
                value={formDifficulty}
                onChange={(e) =>
                  setFormDifficulty(e.target.value as QuestionDifficulty)
                }
                className="w-full bg-[#12181f] border border-[#232b35] rounded-lg px-3 py-2 font-mono text-xs text-[#e6edf3] outline-none"
              >
                <option value="easy">Easy (30% target)</option>
                <option value="medium">Medium (45% target)</option>
                <option value="hard">Hard (25% target)</option>
              </select>
            </div>
          </div>

          {/* Question Stem */}
          <div>
            <label className="block font-mono text-xs text-[#8b96a3] mb-1.5">
              Question Text
            </label>
            <textarea
              rows={3}
              value={formQuestionText}
              onChange={(e) => setFormQuestionText(e.target.value)}
              placeholder="Enter complete, unambiguous question stem…"
              className="w-full bg-[#12181f] border border-[#232b35] focus:border-[#00d9a0] rounded-lg p-3 text-sm text-[#e6edf3] outline-none"
            />
          </div>

          {/* 4 Options + Correct Answer Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {(
              [
                { idx: 0, label: 'Option A', val: formOptionA, set: setFormOptionA },
                { idx: 1, label: 'Option B', val: formOptionB, set: setFormOptionB },
                { idx: 2, label: 'Option C', val: formOptionC, set: setFormOptionC },
                { idx: 3, label: 'Option D', val: formOptionD, set: setFormOptionD },
              ] as const
            ).map((opt) => (
              <div
                key={opt.idx}
                className={`p-3 rounded-lg border ${
                  formCorrectIndex === opt.idx
                    ? 'border-[#00d9a0] bg-[#00d9a0]/5'
                    : 'border-[#232b35] bg-[#12181f]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 font-mono text-xs">
                  <span className="text-[#e6edf3] font-semibold">
                    {opt.label}
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[#00d9a0]">
                    <input
                      type="radio"
                      name="correctIndex"
                      checked={formCorrectIndex === opt.idx}
                      onChange={() => setFormCorrectIndex(opt.idx)}
                    />
                    <span>Correct Answer</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={opt.val}
                  onChange={(e) => opt.set(e.target.value)}
                  placeholder={`Enter ${opt.label}…`}
                  className="w-full bg-[#161d26] border border-[#232b35] rounded px-3 py-2 text-xs text-[#e6edf3] outline-none"
                />
              </div>
            ))}
          </div>

          {/* Detailed Explanation */}
          <div>
            <label className="block font-mono text-xs text-[#8b96a3] mb-1.5">
              Detailed Step-by-Step Explanation
            </label>
            <textarea
              rows={3}
              value={formExplanation}
              onChange={(e) => setFormExplanation(e.target.value)}
              placeholder="Explain clearly why the correct option is right and how the calculation or concept works…"
              className="w-full bg-[#12181f] border border-[#232b35] focus:border-[#00d9a0] rounded-lg p-3 text-xs text-[#e6edf3] outline-none"
            />
          </div>

          {/* Optional GK Current Affairs Event Date & Verified Source */}
          {formSubjectId === 'gk' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-[#232b35]">
              <div>
                <label className="block font-mono text-xs text-[#8b96a3] mb-1">
                  Event Date (Required for GK Current Affairs)
                </label>
                <input
                  type="text"
                  value={formEventDate}
                  onChange={(e) => setFormEventDate(e.target.value)}
                  placeholder="e.g. 2023-08-23"
                  className="w-full bg-[#12181f] border border-[#232b35] rounded-lg px-3 py-2 font-mono text-xs text-[#e6edf3] outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-[#8b96a3] mb-1">
                  Verified Official Source (Required for GK Current Affairs)
                </label>
                <input
                  type="text"
                  value={formVerifiedSource}
                  onChange={(e) => setFormVerifiedSource(e.target.value)}
                  placeholder="e.g. ISRO Official Mission Archive / PIB"
                  className="w-full bg-[#12181f] border border-[#232b35] rounded-lg px-3 py-2 font-mono text-xs text-[#e6edf3] outline-none"
                />
              </div>
            </div>
          )}

          {/* Validation Errors & Duplicate / Similarity Warnings */}
          {formErrors.length > 0 && (
            <div className="p-3.5 rounded-lg border border-[#ff6b6b]/50 bg-[#ff6b6b]/10 font-mono text-xs text-[#ff6b6b] space-y-1">
              <div className="font-bold">Validation Errors (Blocking):</div>
              {formErrors.map((err, i) => (
                <div key={i}>• {err}</div>
              ))}
            </div>
          )}

          {formWarnings.length > 0 && (
            <div className="p-3.5 rounded-lg border border-[#ffb454]/50 bg-[#ffb454]/10 font-mono text-xs text-[#ffb454] space-y-1">
              <div className="font-bold">
                Similarity &amp; Quality Warnings (Non-Blocking Review Notice):
              </div>
              {formWarnings.map((w, i) => (
                <div key={i}>• {w}</div>
              ))}
            </div>
          )}

          {formDuplicates.length > 0 && (
            <div className="p-3.5 rounded-lg border border-[#232b35] bg-[#12181f] font-mono text-xs space-y-2">
              <div className="text-[#e6edf3] font-bold">
                Matched Questions in Bank ({formDuplicates.length}):
              </div>
              {formDuplicates.map((dm, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded border border-[#232b35] bg-[#161d26] text-[11px] space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={
                        dm.blocking
                          ? 'text-[#ff6b6b] font-bold'
                          : 'text-[#ffb454] font-bold'
                      }
                    >
                      {dm.matchType.toUpperCase()} ({Math.round(dm.similarityScore * 100)}% match)
                    </span>
                    <span className="text-[#8b96a3]">
                      ID: {dm.existingQuestionId} · {dm.existingStatus}
                    </span>
                  </div>
                  <div className="text-[#e6edf3]">{dm.existingQuestionText}</div>
                  <div className="text-[#8b96a3]">{dm.reason}</div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-[#232b35]">
            <button
              type="button"
              onClick={runLiveDuplicateCheck}
              className="border border-[#232b35] hover:border-[#8b96a3] text-[#e6edf3] font-mono text-xs px-4 py-2.5 rounded-lg cursor-pointer"
            >
              check duplicates &amp; validate
            </button>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                disabled={isSubmittingForm}
                onClick={() => handleSaveQuestionForm('draft')}
                className="border border-[#ffb454] hover:bg-[#ffb454]/15 text-[#ffb454] font-mono font-semibold text-xs px-4 py-2.5 rounded-lg cursor-pointer disabled:opacity-40"
              >
                save as draft
              </button>
              <button
                type="button"
                disabled={isSubmittingForm}
                onClick={() => handleSaveQuestionForm('published')}
                className="bg-[#00d9a0] hover:bg-[#00e6aa] text-[#04140f] font-mono font-bold text-xs px-5 py-2.5 rounded-lg cursor-pointer disabled:opacity-40"
              >
                {editingQuestion ? 'update & publish' : 'validate & publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODULE D: BULK IMPORT (JSON / CSV with Preview & Duplicate Detection)
          ===================================================================== */}
      {activeTab === 'import' && (
        <div className="space-y-5">
          <div className="bg-[#161d26] border border-[#232b35] rounded-lg p-5 space-y-4">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-mono text-base font-bold text-[#e6edf3]">
                  Bulk Question Import Pipeline (JSON &amp; CSV)
                </h2>
                <p className="text-xs text-[#8b96a3] mt-1 leading-relaxed">
                  Validates every record for topic/subtopic completeness, 4 distinct options, verified answer key (0–3), explanation depth, and 5-level duplicate/similarity checks. Validated questions are always staged as{' '}
                  <strong className="text-[#ffb454]">Draft</strong> for review and are never published unreviewed.
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs shrink-0">
                <a
                  href="/templates/triquiz-bulk-import-template.json"
                  download
                  className="border border-[#232b35] hover:border-[#00d9a0] text-[#00d9a0] px-3 py-1.5 rounded-lg transition-colors"
                >
                  download JSON template
                </a>
                <a
                  href="/templates/triquiz-bulk-import-template.csv"
                  download
                  className="border border-[#232b35] hover:border-[#00d9a0] text-[#00d9a0] px-3 py-1.5 rounded-lg transition-colors"
                >
                  download CSV template
                </a>
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-[#232b35]">
              <div className="flex items-center gap-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setImportFormat('json')}
                  className={`px-3 py-1 rounded cursor-pointer ${
                    importFormat === 'json'
                      ? 'bg-[#00d9a0] text-[#04140f] font-bold'
                      : 'bg-[#12181f] text-[#8b96a3]'
                  }`}
                >
                  JSON Format
                </button>
                <button
                  type="button"
                  onClick={() => setImportFormat('csv')}
                  className={`px-3 py-1 rounded cursor-pointer ${
                    importFormat === 'csv'
                      ? 'bg-[#00d9a0] text-[#04140f] font-bold'
                      : 'bg-[#12181f] text-[#8b96a3]'
                  }`}
                >
                  CSV Format
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
                <label className="border border-[#232b35] hover:border-[#8b96a3] text-[#e6edf3] font-mono text-xs px-3.5 py-1.5 rounded-lg cursor-pointer">
                  {uploadedFileName
                    ? `uploaded: ${uploadedFileName} (change)`
                    : 'upload .json or .csv file'}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.csv,application/json,text/csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {(uploadedFileName ||
                  importRawText.trim().length > 0 ||
                  importSummary !== null) && (
                  <button
                    type="button"
                    onClick={handleDeleteUploadedFile}
                    className="border border-[#ff6b6b] hover:bg-[#ff6b6b]/15 text-[#ff6b6b] font-mono font-semibold text-xs px-3.5 py-1.5 rounded-lg cursor-pointer transition-colors"
                  >
                    delete uploaded file
                  </button>
                )}
              </div>
            </div>

            {bulkImportedQuestionsCount > 0 && (
              <div className="p-3 rounded-lg border border-[#232b35] bg-[#12181f] flex items-center justify-between flex-wrap gap-2 font-mono text-xs">
                <span className="text-[#c9d3df]">
                  Previously bulk-uploaded questions in bank:{' '}
                  <strong className="text-[#ffb454]">
                    {bulkImportedQuestionsCount}
                  </strong>
                </span>
                {!confirmDeleteBulkImported ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteBulkImported(true)}
                    className="border border-[#ff6b6b]/60 hover:bg-[#ff6b6b]/15 text-[#ff6b6b] px-3 py-1 rounded cursor-pointer transition-colors"
                  >
                    delete all bulk-uploaded questions ({bulkImportedQuestionsCount})
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[#ff6b6b]">Confirm delete all?</span>
                    <button
                      type="button"
                      disabled={isDeletingBulkImported}
                      onClick={handleDeleteBulkImportedQuestions}
                      className="bg-[#ff6b6b] text-[#04140f] font-bold px-3 py-1 rounded cursor-pointer disabled:opacity-50"
                    >
                      {isDeletingBulkImported
                        ? 'deleting…'
                        : 'yes, delete bulk-uploaded'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteBulkImported(false)}
                      className="border border-[#232b35] text-[#e6edf3] px-2.5 py-1 rounded cursor-pointer"
                    >
                      cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            <textarea
              rows={7}
              value={importRawText}
              onChange={(e) => setImportRawText(e.target.value)}
              placeholder={
                importFormat === 'json'
                  ? '[{"subjectId":"python","topic":"Functions","subtopic":"Closures","difficulty":"medium","question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}]'
                  : 'subjectId,topic,subtopic,difficulty,question,optionA,optionB,optionC,optionD,correctIndex,explanation'
              }
              className="w-full bg-[#12181f] border border-[#232b35] focus:border-[#00d9a0] rounded-lg p-3 font-mono text-xs text-[#e6edf3] outline-none"
            />

            {importParseError && (
              <div className="p-3 rounded-lg border border-[#ff6b6b]/40 bg-[#ff6b6b]/10 font-mono text-xs text-[#ff6b6b]">
                {importParseError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 flex-wrap">
              {(uploadedFileName ||
                importRawText.trim().length > 0 ||
                importSummary !== null) && (
                <button
                  type="button"
                  onClick={handleDeleteUploadedFile}
                  className="border border-[#ff6b6b]/60 hover:bg-[#ff6b6b]/15 text-[#ff6b6b] font-mono text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors"
                >
                  delete uploaded file / clear batch
                </button>
              )}
              <button
                type="button"
                onClick={() =>
                  runBulkValidationOnContent(importRawText, importFormat)
                }
                className="bg-[#00d9a0] hover:bg-[#00e6aa] text-[#04140f] font-mono font-bold text-xs px-4 py-2 rounded-lg cursor-pointer"
              >
                validate &amp; preview batch
              </button>
            </div>
          </div>

          {/* Bulk Validation Summary & Preview Table */}
          {importSummary && (
            <div className="bg-[#161d26] border border-[#232b35] rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-[#232b35]">
                <div>
                  <h3 className="font-mono text-sm font-bold text-[#e6edf3]">
                    Batch Validation Summary ({importSummary.totalRecords}{' '}
                    records)
                  </h3>
                  <div className="font-mono text-xs text-[#8b96a3] mt-1 flex items-center gap-2 flex-wrap tabular-nums">
                    <span className="text-[#00d9a0]">
                      Ready as Draft: {importSummary.validReadyCount}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#ffb454]">
                      Near-Duplicate Warnings:{' '}
                      {importSummary.nearDuplicateWarningCount}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#ff6b6b]">
                      Rejected: {importSummary.rejectedCount}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Exact Duplicates: {importSummary.exactDuplicateCount}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Invalid Answer Keys: {importSummary.invalidAnswerKeyCount}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Missing Explanations:{' '}
                      {importSummary.missingExplanationCount}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Missing Topics: {importSummary.missingTopicCount}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {importSummary.rejectedCount > 0 && (
                    <button
                      type="button"
                      onClick={handleDownloadRejectedReport}
                      className="border border-[#ff6b6b] text-[#ff6b6b] font-mono text-xs px-3 py-2 rounded-lg cursor-pointer"
                    >
                      download rejected error report (.json)
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={
                      importSummary.validReadyCount === 0 || isCommittingImport
                    }
                    onClick={handleCommitBulkImportDrafts}
                    className="bg-[#00d9a0] hover:bg-[#00e6aa] text-[#04140f] font-mono font-bold text-xs px-4 py-2 rounded-lg cursor-pointer disabled:opacity-40"
                  >
                    {isCommittingImport
                      ? 'importing drafts…'
                      : `stage ${importSummary.validReadyCount} valid records into review queue (draft)`}
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {importSummary.rows.map((r) => (
                  <div
                    key={r.rowIndex}
                    className={`p-3 rounded-lg border font-mono text-xs ${
                      r.valid
                        ? r.warnings.length > 0
                          ? 'border-[#ffb454]/40 bg-[#ffb454]/5'
                          : 'border-[#00d9a0]/30 bg-[#12181f]'
                        : 'border-[#ff6b6b]/40 bg-[#ff6b6b]/5'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-[#e6edf3]">
                        Row #{r.rowIndex} ·{' '}
                        {String(r.rawRecord.subjectId || 'unknown')} ·{' '}
                        {String(r.rawRecord.topic || 'no-topic')}
                      </span>
                      <span
                        className={
                          r.valid
                            ? r.warnings.length > 0
                              ? 'text-[#ffb454] font-bold'
                              : 'text-[#00d9a0] font-bold'
                            : 'text-[#ff6b6b] font-bold'
                        }
                      >
                        {r.valid
                          ? r.warnings.length > 0
                            ? 'VALID (WITH SIMILARITY WARNING) → DRAFT'
                            : 'VALID → DRAFT'
                          : 'REJECTED'}
                      </span>
                    </div>
                    <div className="text-[#c9d3df] mb-1">
                      {String(r.rawRecord.question || '(empty question)')}
                    </div>
                    {r.errors.map((e, i) => (
                      <div key={i} className="text-[#ff6b6b] text-[11px]">
                        ✗ Error: {e}
                      </div>
                    ))}
                    {r.warnings.map((w, i) => (
                      <div key={i} className="text-[#ffb454] text-[11px]">
                        ⚠ Warning: {w}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          MODULE E: QUESTION REVIEW QUEUE (Drafts & Imported Questions)
          ===================================================================== */}
      {activeTab === 'review' && (
        <div className="space-y-4">
          <div className="bg-[#161d26] border border-[#232b35] rounded-lg p-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-mono text-base font-bold text-[#e6edf3]">
                Question Review &amp; Approval Queue (
                {paginatedReviewResult.totalMatching} Drafts)
              </h2>
              <p className="text-xs text-[#8b96a3] mt-0.5">
                Inspect draft and bulk-imported questions, verify explanations and similarity warnings, then approve to publish or archive.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <select
                value={reviewSubjectFilter}
                aria-label="Filter review queue by subject"
                onChange={(e) => {
                  setReviewSubjectFilter(e.target.value);
                  setReviewPage(1);
                }}
                className="bg-[#12181f] border border-[#232b35] rounded-lg px-3 py-2 font-mono text-xs text-[#e6edf3] outline-none"
              >
                <option value="all">All Subjects</option>
                {SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>

              {paginatedReviewResult.totalMatching > 0 && (
                <>
                  <button
                    type="button"
                    disabled={isPublishingAllDrafts || isDeletingAllDrafts}
                    onClick={() => handlePublishAllDrafts(reviewSubjectFilter)}
                    className="bg-[#00d9a0] hover:bg-[#00e6aa] text-[#04140f] font-mono font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                  >
                    {isPublishingAllDrafts
                      ? 'publishing all…'
                      : `approve & publish all (${paginatedReviewResult.totalMatching})`}
                  </button>

                  {!confirmDeleteAllDrafts ? (
                    <button
                      type="button"
                      disabled={isPublishingAllDrafts}
                      onClick={() => setConfirmDeleteAllDrafts(true)}
                      className="border border-[#ff6b6b] hover:bg-[#ff6b6b]/15 text-[#ff6b6b] font-mono font-semibold text-xs px-3.5 py-2 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                    >
                      delete all drafts ({paginatedReviewResult.totalMatching})
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <button
                        type="button"
                        disabled={isDeletingAllDrafts}
                        onClick={() =>
                          handleDeleteAllDrafts(reviewSubjectFilter)
                        }
                        className="bg-[#ff6b6b] text-[#04140f] font-bold px-3 py-2 rounded-lg cursor-pointer disabled:opacity-50"
                      >
                        {isDeletingAllDrafts
                          ? 'deleting drafts…'
                          : `confirm delete (${paginatedReviewResult.totalMatching})`}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteAllDrafts(false)}
                        className="border border-[#232b35] text-[#e6edf3] px-3 py-2 rounded-lg cursor-pointer"
                      >
                        cancel
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {paginatedReviewResult.items.length === 0 ? (
            <div className="bg-[#161d26] border border-[#232b35] rounded-lg py-10 text-center font-mono text-xs text-[#8b96a3]">
              No draft questions are currently awaiting review.
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedReviewResult.items.map((q) => {
                const dupWarnings = analyzeQuestionDuplicates(
                  {
                    id: q.id,
                    subjectId: q.subjectId,
                    topic: q.topic,
                    question: q.question,
                    options: q.options,
                    correctIndex: q.correctIndex,
                  },
                  allDocsSnapshot
                );

                return (
                  <div
                    key={q.id}
                    className="bg-[#161d26] border border-[#232b35] rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="font-mono text-[11px] text-[#8b96a3] flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-[#ffb454] uppercase">
                          DRAFT
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#00d9a0] font-bold uppercase">
                          {q.subjectId}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{q.topic}</span>
                        <span aria-hidden="true">·</span>
                        <span>{q.subtopic}</span>
                        <span aria-hidden="true">·</span>
                        <span>{q.difficulty}</span>
                        <span aria-hidden="true">·</span>
                        <span>source: {q.source}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={
                            isQuestionSyncedToFirestore(q.id)
                              ? 'text-[#00d9a0]'
                              : 'text-[#ffb454]'
                          }
                        >
                          {isQuestionSyncedToFirestore(q.id)
                            ? 'firestore synced'
                            : 'local (unsynced)'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-xs">
                        <button
                          type="button"
                          onClick={() => openEditQuestion(q)}
                          className="border border-[#232b35] hover:border-[#8b96a3] text-[#e6edf3] px-3 py-1 rounded cursor-pointer"
                        >
                          edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmDelete(q.id)}
                          className="border border-[#ff6b6b]/60 hover:bg-[#ff6b6b]/15 text-[#ff6b6b] px-3 py-1 rounded cursor-pointer"
                        >
                          delete
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleQuickStatusChange(q, 'archived')
                          }
                          className="border border-[#ffb454]/50 hover:bg-[#ffb454]/15 text-[#ffb454] px-3 py-1 rounded cursor-pointer"
                        >
                          archive
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleQuickStatusChange(q, 'published')
                          }
                          className="bg-[#00d9a0] hover:bg-[#00e6aa] text-[#04140f] font-bold px-3.5 py-1 rounded cursor-pointer"
                        >
                          approve &amp; publish
                        </button>
                      </div>
                    </div>

                    <div className="text-sm font-semibold text-[#e6edf3]">
                      {q.question}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                      {q.options.map((opt, idx) => (
                        <div
                          key={idx}
                          className={`px-3 py-2 rounded border ${
                            idx === q.correctIndex
                              ? 'border-[#00d9a0]/50 bg-[#00d9a0]/10 text-[#00d9a0] font-semibold'
                              : 'border-[#232b35] bg-[#12181f] text-[#c9d3df]'
                          }`}
                        >
                          {LETTERS[idx]}. {opt}{' '}
                          {idx === q.correctIndex ? '✓ (Correct)' : ''}
                        </div>
                      ))}
                    </div>

                    <div className="text-xs text-[#c9d3df] bg-[#12181f] p-3 rounded border border-[#232b35]">
                      <strong className="font-mono text-[#00d9a0] mr-1.5">
                        Explanation:
                      </strong>
                      {q.explanation}
                    </div>

                    {dupWarnings.length > 0 && (
                      <div className="p-3 rounded border border-[#ffb454]/40 bg-[#ffb454]/10 font-mono text-xs text-[#ffb454] space-y-1">
                        <div className="font-bold">
                          Duplicate / Similarity Warnings ({dupWarnings.length}):
                        </div>
                        {dupWarnings.map((dw, i) => (
                          <div key={i}>
                            • [{dw.matchType}] {dw.reason} (Matches{' '}
                            {dw.existingQuestionId}: &ldquo;
                            {dw.existingQuestionText}&rdquo;)
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
