# TRIQUIZ Firestore Security Specification (`security_spec.md`)

## 1. Data & Authorization Invariants

1. **Zero-Trust Administrator Authorization (`/admins/{adminUid}` & Custom Claims)**
   - Administrator privileges are granted strictly via server-controlled Firebase Auth custom claims (`request.auth.token.admin == true` or `request.auth.token.role == 'admin'`) OR the presence of a server-provisioned `/admins/$(request.auth.uid)` document, combined with `request.auth.token.email_verified == true`.
   - Client SDKs can NEVER create, update, or delete `/admins/{adminUid}` documents (`allow create, update, delete: if false;`), and cannot list `/admins` (`allow list: if false;`).
   - No hardcoded administrator email addresses exist in client code or Firestore rules.

2. **Question Bank Isolation (`/questionBank/{questionId}`)**
   - **Students (`isSignedIn()` non-admins)**: Can only `get` and `list` documents where `resource.data.status == 'published'`. Any query or direct document read targeting `draft` or `archived` questions by a non-admin is rejected by Firestore rules.
   - **Administrators (`isAdmin()`)**: Can `get` and `list` questions of any status (`draft`, `published`, `archived`), and can `create`, `update`, and `delete` questions only when the payload satisfies `isValidQuestionBankDoc()`.
   - **Immutable Provenance & Server Timestamps**:
     - On `create`: `createdBy == request.auth.uid`, `createdAt == request.time`, and `updatedAt == request.time`.
     - On `update`: `createdBy == resource.data.createdBy`, `createdAt == resource.data.createdAt`, and `updatedAt == request.time`.

3. **Leaderboard Integrity (`/scores/{uid}`)**
   - Only verified users (`email_verified == true`) can create or update their own `/scores/{uid}` document (`request.auth.uid == uid`).
   - `overallScore`, `overallTotal`, `overallPct`, and `subjectsCount` must mathematically match the nested `subjects` map.
   - Contaminated strings, Firestore rule snippets, or non-Firebase UIDs are rejected.

4. **Private User Subcollections (`/users/{uid}/attempts/{attemptId}` & `/users/{uid}/questionHistory/{subjectId}`)**
   - Strictly isolated to the authenticated owner (`request.auth.uid == uid`).

---

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Self-Admin Privilege Escalation**: Authenticated student attempts `setDoc(doc(db, 'admins', studentUid), { uid: studentUid, role: 'admin' })` → `PERMISSION_DENIED`.
2. **Student Creating a Question**: Authenticated verified student attempts `setDoc(doc(db, 'questionBank', 'q_python_1'), validQuestionPayload)` → `PERMISSION_DENIED`.
3. **Student Reading a Draft Question**: Authenticated student attempts `getDoc` or `getDocs` on `/questionBank/q_draft_1` where `status == 'draft'` → `PERMISSION_DENIED`.
4. **Student Reading an Archived Question**: Authenticated student attempts `getDoc` on `/questionBank/q_arch_1` where `status == 'archived'` → `PERMISSION_DENIED`.
5. **Student Modifying or Publishing a Question**: Authenticated student attempts `updateDoc(doc(db, 'questionBank', 'q_1'), { status: 'published' })` → `PERMISSION_DENIED`.
6. **Student Deleting a Question**: Authenticated student attempts `deleteDoc(doc(db, 'questionBank', 'q_1'))` → `PERMISSION_DENIED`.
7. **Admin Spoofing `createdBy` UID**: Admin `uid_admin_1` attempts to create a question with `createdBy: 'uid_other_admin_2'` → `PERMISSION_DENIED`.
8. **Admin Forging Client Timestamp**: Admin attempts to create or update a question with a client-supplied number/Date instead of `serverTimestamp()` (`request.time`) → `PERMISSION_DENIED`.
9. **Admin Mutating Immutable `createdAt` or `createdBy` on Update**: Admin attempts to overwrite `createdBy` or `createdAt` during an update → `PERMISSION_DENIED`.
10. **Admin Injecting Shadow/Ghost Field in `questionBank`**: Admin sends valid question fields plus `isSuperApproved: true` → `PERMISSION_DENIED` via `keys().hasOnly(...)`.
11. **Admin Saving Invalid Option Count or Out-of-Range `correctIndex`**: Admin sends `options` with 3 items or `correctIndex: 4` → `PERMISSION_DENIED`.
12. **Cross-User Score or History Tampering**: Authenticated user `uid_1` attempts to write `/scores/uid_2` or read `/users/uid_2/questionHistory/python` → `PERMISSION_DENIED`.
