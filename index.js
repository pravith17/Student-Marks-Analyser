
document.addEventListener('DOMContentLoaded', () => {
    // STATE MANAGEMENT 
    let state = {
        currentUser: null,           
        users: [],                   
        exams: [],                   
        marks: {},                   
        activeCharts: {},           
        analyzerChart: null,        
        analyzerChartType: 'bar',   
        analyzerResultData: null,   
    };

    // --- DOM ELEMENT SELECTors ---
    const mainHeader = document.getElementById('main-header');
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutBtn = document.getElementById('logout-btn');

    const views = {
        login: document.getElementById('login-view'),
        teacher: document.getElementById('teacher-portal'),
        student: document.getElementById('student-portal'),
    };
    
    // Login View
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    // Teacher Portal
    const studentsTableBody = document.getElementById('students-table-body');
    const addStudentBtn = document.getElementById('add-student-btn');
    const createExamBtn = document.getElementById('create-exam-btn');
    const examsListEl = document.getElementById('exams-list');
    const importExamBtn = document.getElementById('import-exam-btn');
    const csvFileInput = document.getElementById('csv-file-input');
    
    // Modals
    const studentModal = document.getElementById('student-modal');
    const studentForm = document.getElementById('student-form');
    const modalTitle = document.getElementById('modal-title');
    const cancelStudentModalBtn = document.getElementById('cancel-student-modal');

    const examModal = document.getElementById('exam-modal');
    const examForm = document.getElementById('exam-form');
    const examModalTitle = document.getElementById('exam-modal-title');
    const cancelExamModalBtn = document.getElementById('cancel-exam-modal');
    const addExamSubjectBtn = document.getElementById('add-exam-subject-btn');
    const examSubjectsListEl = document.getElementById('exam-subjects-list');

    const marksModal = document.getElementById('marks-modal');
    const marksForm = document.getElementById('marks-form');
    const marksModalTitle = document.getElementById('marks-modal-title');
    const marksTableHead = document.getElementById('marks-table-head');
    const marksTableBody = document.getElementById('marks-table-body');
    const cancelMarksModalBtn = document.getElementById('cancel-marks-modal');

    // CSV Import Modal
    const csvImportModal = document.getElementById('csv-import-modal');
    const csvImportForm = document.getElementById('csv-import-form');
    const cancelCsvModalBtn = document.getElementById('cancel-csv-modal');
    const saveCsvDataBtn = document.getElementById('save-csv-data-btn');
    const csvErrorContainer = document.getElementById('csv-error-container');
    const csvExamNameInput = document.getElementById('csv-exam-name');
    const csvSubjectNameInput = document.getElementById('csv-subject-name');
    const csvSubjectCreditsInput = document.getElementById('csv-subject-credits');
    const csvTableHead = document.getElementById('csv-table-head');
    const csvTableBody = document.getElementById('csv-table-body');

    // Student Portal
    const studentDetailsContent = document.getElementById('student-details-content');
    const officialResultsList = document.getElementById('official-results-list');

    // Student Portal: Analyzer
    const analyzerForm = document.getElementById('analyzer-form');
    const analyzerSubjectsList = document.getElementById('analyzer-subjects-list');
    const analyzerAddSubjectBtn = document.getElementById('analyzer-add-subject-btn');
    const analyzerResultContainer = document.getElementById('analyzer-result-container');

    // Theme Toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

    //CONSTANTS
    const GRADING_CRITERIA = [
        { min: 90, gradePoint: 10, letter: 'O', descriptor: 'Outstanding' },
        { min: 80, gradePoint: 9, letter: 'A+', descriptor: 'Excellent' },
        { min: 70, gradePoint: 8, letter: 'A', descriptor: 'Very Good' },
        { min: 60, gradePoint: 7, letter: 'B+', descriptor: 'Good' },
        { min: 55, gradePoint: 6, letter: 'B', descriptor: 'Above Average' },
        { min: 50, gradePoint: 5, letter: 'C', descriptor: 'Average' },
        { min: 40, gradePoint: 4, letter: 'P', descriptor: 'Pass' },
        { min: 0, gradePoint: 0, letter: 'F', descriptor: 'Fails' }
    ];
    const SGPA_CLASSIFICATION = [
        { min: 7.00, classification: 'First Class with Distinction' },
        { min: 6.00, classification: 'First Class' },
        { min: 5.00, classification: 'Second Class' },
        { min: 0, classification: 'Academic Probation / Non-compliance' }
    ];
    const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
    
    //DATA PERSISTENCE
    const loadDataFromStorage = () => {
        state.users = JSON.parse(localStorage.getItem('app_users')) || [];
        state.exams = JSON.parse(localStorage.getItem('app_exams')) || [];
        state.marks = JSON.parse(localStorage.getItem('app_marks')) || {};

        if (state.users.length === 0) {
            state.users.push({ username: 'admin', name: 'Administrator', password: 'admin123', role: 'admin' });
            saveUsers();
        }
        const sessionUser = sessionStorage.getItem('app_currentUser');
        if (sessionUser) state.currentUser = JSON.parse(sessionUser);
    };
    const saveUsers = () => localStorage.setItem('app_users', JSON.stringify(state.users));
    const saveExams = () => localStorage.setItem('app_exams', JSON.stringify(state.exams));
    const saveMarks = () => localStorage.setItem('app_marks', JSON.stringify(state.marks));

    //VIEW MANAGEMENT
    const updateView = () => {
        Object.values(views).forEach(view => view.classList.add('hidden'));
        if (state.currentUser) {
            mainHeader.classList.remove('hidden');
            welcomeMessage.textContent = `Welcome, ${state.currentUser.name}!`;
            if (state.currentUser.role === 'admin') {
                views.teacher.classList.remove('hidden');
                renderTeacherDashboard();
            } else {
                views.student.classList.remove('hidden');
                renderStudentDashboard();
            }
        } else {
            mainHeader.classList.add('hidden');
            views.login.classList.remove('hidden');
        }
    };

    //AUTHENTICATION
    const handleLogin = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get('username').trim();
        const password = formData.get('password');
        const user = state.users.find(u => u.username === username && u.password === password);
        if (user) {
            state.currentUser = { username: user.username, name: user.name, role: user.role };
            sessionStorage.setItem('app_currentUser', JSON.stringify(state.currentUser));
            loginForm.reset();
            loginError.classList.add('hidden');
            updateView();
        } else {
            loginError.textContent = 'Invalid username or password.';
            loginError.classList.remove('hidden');
        }
    };
    const handleLogout = () => {
        state.currentUser = null;
        sessionStorage.removeItem('app_currentUser');
        updateView();
    };

    //SGPA & CGPA CALCULATION ENGINE
    const getGradeDetails = (percentage, isAbsent = false) => {
        if (isAbsent) return { gradePoint: 0, letter: 'AB', descriptor: 'Absent' };
        for (const criteria of GRADING_CRITERIA) {
            if (percentage >= criteria.min) return criteria;
        }
        return GRADING_CRITERIA[GRADING_CRITERIA.length - 1];
    };
    const getSgpaClassification = (sgpa) => {
        for (const criteria of SGPA_CLASSIFICATION) {
            if (sgpa >= criteria.min) return criteria.classification;
        }
        return SGPA_CLASSIFICATION[SGPA_CLASSIFICATION.length - 1].classification;
    };
    const calculateSGPA = (exam, studentMarks) => {
        if (!exam || !studentMarks) return null;

        let allSeeMarksEntered = true;
        for (const subject of exam.subjects) {
            const subjectMarkData = studentMarks[subject.name];
            if (!subjectMarkData || (subjectMarkData.see ?? null) === null) {
                allSeeMarksEntered = false;
                break;
            }
        }

        const subjectDetails = exam.subjects.map(subject => {
            const marks = studentMarks[subject.name] || {};
            const mse1 = marks.mse1 || 0;
            const mse2 = marks.mse2 || 0;
            const task1 = marks.task1 || 0;
            const task2 = marks.task2 || 0;
            const task3 = marks.task3 || 0;
            const see = marks.see;
            
            const cie = mse1 + mse2 + task1 + task2 + task3;

            if (allSeeMarksEntered) {
                const isAbsent = see === -1;
                const finalPercentage = isAbsent ? 0 : cie + (see / 2);
                const { gradePoint, letter } = getGradeDetails(finalPercentage, isAbsent);
                return { name: subject.name, credits: subject.credits, marks, cie, see, finalPercentage, gradePoint, letter };
            } else {
                return { name: subject.name, credits: subject.credits, marks, cie, see, finalPercentage: null, gradePoint: null, letter: 'N/A' };
            }
        });
        
        if (!allSeeMarksEntered) {
            return { examId: exam.id, sgpa: null, classification: 'Awaiting SEE Results', subjectDetails };
        }

        let totalCredits = 0;
        let weightedGradePoints = 0;
        for (const detail of subjectDetails) {
            totalCredits += detail.credits;
            weightedGradePoints += detail.credits * detail.gradePoint;
        }
        
        const sgpa = totalCredits > 0 ? (weightedGradePoints / totalCredits) : 0;
        const classification = getSgpaClassification(sgpa);
        return { examId: exam.id, sgpa, classification, subjectDetails };
    };
    const calculateCumulativeCGPA = (allCompletedResults) => {
        let totalWeightedGradePoints = 0;
        let totalCredits = 0;

        allCompletedResults.forEach(result => {
            if (result && result.subjectDetails) {
                result.subjectDetails.forEach(subject => {
                    if (subject.letter !== 'F' && subject.letter !== 'AB') {
                        totalWeightedGradePoints += subject.credits * subject.gradePoint;
                        totalCredits += subject.credits;
                    }
                });
            }
        });

        return totalCredits > 0 ? (totalWeightedGradePoints / totalCredits) : 0;
    };

    //TEACHER PORTAL: STUDENT MANAGEMENT
    const renderStudentsTable = () => {
        const students = state.users.filter(u => u.role === 'student');
        if (students.length === 0) {
             studentsTableBody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-gray-500 dark:text-gray-400">No students found.</td></tr>`;
             return;
        }
        studentsTableBody.innerHTML = students.map(student => `
            <tr id="student-row-${student.username}">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${student.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${student.username}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button class="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-200" data-action="edit" data-username="${student.username}">Edit</button>
                    <button class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200" data-action="delete" data-username="${student.username}">Delete</button>
                </td>
            </tr>
        `).join('');
    };
    const showStudentModal = (studentUsername = null) => {
        studentForm.reset();
        const studentIdInput = studentForm.querySelector('#student-id');
        const studentUsernameInput = studentForm.querySelector('#student-username');
        const studentPasswordInput = studentForm.querySelector('#student-password');
        if (studentUsername) {
            const student = state.users.find(u => u.username === studentUsername);
            modalTitle.textContent = 'Edit Student';
            studentIdInput.value = student.username;
            studentForm.querySelector('#student-name').value = student.name;
            studentUsernameInput.value = student.username;
            studentUsernameInput.disabled = true;
            studentPasswordInput.placeholder = "Leave blank to keep current password";
            studentPasswordInput.required = false;
        } else {
            modalTitle.textContent = 'Add New Student';
            studentIdInput.value = '';
            studentUsernameInput.disabled = false;
            studentPasswordInput.placeholder = "";
            studentPasswordInput.required = true;
        }
        studentModal.classList.remove('hidden');
    };
    const hideStudentModal = () => studentModal.classList.add('hidden');
    const handleStudentFormSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(studentForm);
        const id = formData.get('student-id');
        const name = formData.get('student-name')?.trim() || '';
        const password = formData.get('student-password') || '';

        if (id) { 
            const userIndex = state.users.findIndex(u => u.username === id);
            if (userIndex > -1) {
                state.users[userIndex].name = name;
                if (password) state.users[userIndex].password = password;
            }
        } else { 
            const username = formData.get('student-username')?.trim() || '';
            if (!name || !username) { alert('Name and username are required.'); return; }
            if (state.users.some(u => u.username === username)) { alert('Username already exists.'); return; }
            if (!password) { alert('Password is required for new students.'); return; }
            state.users.push({ username, name, password, role: 'student' });
        }
        saveUsers();
        renderStudentsTable();
        hideStudentModal();
    };
    const handleDeleteStudent = (username) => {
        if (confirm(`Are you sure you want to delete student '${username}'? This will also remove all their marks.`)) {
            state.users = state.users.filter(u => u.username !== username);
            Object.keys(state.marks).forEach(examId => {
                if (state.marks[examId]?.[username]) {
                    delete state.marks[examId][username];
                }
            });
            saveUsers();
            saveMarks();
            renderStudentsTable();
        }
    };
    const handleStudentsTableClick = (e) => {
        const target = e.target.closest('button');
        if (!target) return;
        const action = target.dataset.action;
        const username = target.dataset.username;
        if (action === 'edit') showStudentModal(username);
        else if (action === 'delete') handleDeleteStudent(username);
    };

    //TEACHER PORTAL: EXAM MANAGEMENT
    const renderExamsList = () => {
        if (state.exams.length === 0) {
            examsListEl.innerHTML = `<p class="text-center py-4 text-gray-500 dark:text-gray-400">No exams created yet.</p>`;
            return;
        }
        examsListEl.innerHTML = state.exams.map(exam => `
            <div class="p-4 border dark:border-gray-700 rounded-lg flex justify-between items-center">
                <div>
                    <h3 class="font-bold text-lg">${exam.name}</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">${exam.subjects.length} subjects</p>
                </div>
                <div class="space-x-2">
                    <button class="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700" data-action="enter-marks" data-id="${exam.id}">Enter Marks</button>
                    <button class="px-3 py-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline" data-action="edit-exam" data-id="${exam.id}">Edit</button>
                    <button class="px-3 py-1 text-sm font-medium text-red-600 dark:text-red-400 hover:underline" data-action="delete-exam" data-id="${exam.id}">Delete</button>
                </div>
            </div>
        `).join('');
    };
    const renderExamSubjectsInputs = (subjects = [{ name: '', credits: '' }]) => {
        examSubjectsListEl.innerHTML = subjects.map((subject, index) => `
            <div class="flex items-center space-x-2" data-subject-index="${index}">
                <input type="text" name="subject-name-${index}" class="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg" placeholder="Subject Name" value="${subject.name || ''}" required>
                <input type="number" name="subject-credits-${index}" class="w-24 p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg" placeholder="Credits" value="${subject.credits || ''}" required min="1">
                <button type="button" class="text-red-500 hover:text-red-700" data-action="remove-subject" ${subjects.length === 1 ? 'disabled' : ''}>&times;</button>
            </div>
        `).join('');
    };
    const showExamModal = (examId = null) => {
        examForm.reset();
        if (examId) {
            const exam = state.exams.find(e => e.id === examId);
            examModalTitle.textContent = 'Edit Exam';
            examForm.querySelector('#exam-id').value = exam.id;
            examForm.querySelector('#exam-name').value = exam.name;
            renderExamSubjectsInputs(exam.subjects);
        } else {
            examModalTitle.textContent = 'Create New Exam';
            examForm.querySelector('#exam-id').value = '';
            renderExamSubjectsInputs();
        }
        examModal.classList.remove('hidden');
    };
    const hideExamModal = () => examModal.classList.add('hidden');
    const handleExamFormSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(examForm);
        const id = formData.get('exam-id');
        const name = formData.get('exam-name').trim();
        const subjects = [];
        const subjectCount = examSubjectsListEl.children.length;
        for (let i = 0; i < subjectCount; i++) {
            const subjectName = formData.get(`subject-name-${i}`)?.trim();
            const subjectCredits = parseInt(formData.get(`subject-credits-${i}`), 10);
            if (subjectName && subjectCredits > 0) {
                subjects.push({ name: subjectName, credits: subjectCredits });
            }
        }
        if (!name || subjects.length === 0) {
            alert('Exam name and at least one subject are required.');
            return;
        }

        if (id) {
            const examIndex = state.exams.findIndex(e => e.id === id);
            state.exams[examIndex] = { ...state.exams[examIndex], name, subjects };
        } else {
            const newExam = { id: `exam_${Date.now()}`, name, subjects };
            state.exams.push(newExam);
        }
        saveExams();
        renderExamsList();
        hideExamModal();
    };
    const handleAddExamSubject = () => {
        const index = examSubjectsListEl.children.length;
        const newSubjectInput = `
            <div class="flex items-center space-x-2" data-subject-index="${index}">
                <input type="text" name="subject-name-${index}" class="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg" placeholder="Subject Name" required>
                <input type="number" name="subject-credits-${index}" class="w-24 p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg" placeholder="Credits" required min="1">
                <button type="button" class="text-red-500 hover:text-red-700" data-action="remove-subject">&times;</button>
            </div>`;
        examSubjectsListEl.insertAdjacentHTML('beforeend', newSubjectInput);
        examSubjectsListEl.querySelectorAll('[data-action="remove-subject"]').forEach(btn => btn.disabled = false);
    };
    const handleExamSubjectsListClick = (e) => {
        const target = e.target.closest('button');
        if (!target || target.dataset.action !== 'remove-subject') return;
        target.closest('.flex').remove();
        if (examSubjectsListEl.children.length === 1) {
            examSubjectsListEl.querySelector('[data-action="remove-subject"]').disabled = true;
        }
    };
    const handleDeleteExam = (examId) => {
        if(confirm('Are you sure you want to delete this exam? This will remove all associated marks.')) {
            state.exams = state.exams.filter(e => e.id !== examId);
            delete state.marks[examId];
            saveExams();
            saveMarks();
            renderExamsList();
        }
    };
    const handleExamsListClick = (e) => {
        const target = e.target.closest('button');
        if (!target) return;
        const action = target.dataset.action;
        const id = target.dataset.id;
        
        if (action === 'edit-exam') showExamModal(id);
        else if (action === 'delete-exam') handleDeleteExam(id);
        else if (action === 'enter-marks') showMarksModal(id);
    };

    //TEACHER PORTAL: MARKS MANAGEMENT
    const showMarksModal = (examId) => {
        const exam = state.exams.find(e => e.id === examId);
        const students = state.users.filter(u => u.role === 'student');
        
        marksForm.reset();
        marksModalTitle.textContent = `Enter Marks for ${exam.name}`;
        marksForm.querySelector('#marks-exam-id').value = examId;

        const markInputClasses = 'w-16 p-1.5 text-sm text-center bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500';

        // Generate Header
        let headerHtml = '<tr><th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-100 dark:bg-gray-700 z-20 min-w-[150px]">Student Name</th>';
        exam.subjects.forEach(subject => {
            headerHtml += `<th colspan="6" class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-l dark:border-gray-600">${subject.name} (${subject.credits} Cr)</th>`;
        });
        headerHtml += '</tr><tr><th class="sticky left-0 bg-gray-100 dark:bg-gray-700 z-20 min-w-[150px]"></th>';
        exam.subjects.forEach(() => {
            headerHtml += `
                <td class="px-2 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 border-l dark:border-gray-600">MSE1 (20)</td>
                <td class="px-2 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">MSE2 (20)</td>
                <td class="px-2 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">T1 (4)</td>
                <td class="px-2 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">T2 (4)</td>
                <td class="px-2 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">T3 (2)</td>
                <td class="px-2 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">SEE (100)</td>
            `;
        });
        headerHtml += '</tr>';
        marksTableHead.innerHTML = headerHtml;

        // Generate Body
        let bodyHtml = '';
        students.forEach(student => {
            bodyHtml += `<tr><td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-800 z-10 min-w-[150px]">${student.name}</td>`;
            exam.subjects.forEach(subject => {
                const currentMarks = state.marks[examId]?.[student.username]?.[subject.name] || {};
                bodyHtml += `
                    <td class="px-2 py-2 border-l dark:border-gray-600"><input type="number" class="${markInputClasses}" name="${student.username}-${subject.name}-mse1" min="0" max="20" value="${currentMarks.mse1 ?? ''}"></td>
                    <td class="px-2 py-2"><input type="number" class="${markInputClasses}" name="${student.username}-${subject.name}-mse2" min="0" max="20" value="${currentMarks.mse2 ?? ''}"></td>
                    <td class="px-2 py-2"><input type="number" class="${markInputClasses}" name="${student.username}-${subject.name}-task1" min="0" max="4" value="${currentMarks.task1 ?? ''}"></td>
                    <td class="px-2 py-2"><input type="number" class="${markInputClasses}" name="${student.username}-${subject.name}-task2" min="0" max="4" value="${currentMarks.task2 ?? ''}"></td>
                    <td class="px-2 py-2"><input type="number" class="${markInputClasses}" name="${student.username}-${subject.name}-task3" min="0" max="2" value="${currentMarks.task3 ?? ''}"></td>
                    <td class="px-2 py-2"><input type="text" class="${markInputClasses}" name="${student.username}-${subject.name}-see" placeholder="0-100 or A" value="${(currentMarks.see === -1) ? 'A' : (currentMarks.see ?? '')}"></td>
                `;
            });
            bodyHtml += '</tr>';
        });
        marksTableBody.innerHTML = bodyHtml || `<tr><td colspan="${(exam.subjects.length * 6) + 1}" class="text-center py-4 text-gray-500 dark:text-gray-400">No students to enter marks for.</td></tr>`;

        marksModal.classList.remove('hidden');
    };
    const handleMarksFormSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(marksForm);
        const examId = formData.get('marks-exam-id');
        const exam = state.exams.find(ex => ex.id === examId);
        const students = state.users.filter(u => u.role === 'student');

        if (!state.marks[examId]) state.marks[examId] = {};

        students.forEach(student => {
            if (!state.marks[examId][student.username]) state.marks[examId][student.username] = {};

            exam.subjects.forEach(subject => {
                if (!state.marks[examId][student.username][subject.name]) state.marks[examId][student.username][subject.name] = {};
                
                const mse1 = formData.get(`${student.username}-${subject.name}-mse1`);
                const mse2 = formData.get(`${student.username}-${subject.name}-mse2`);
                const task1 = formData.get(`${student.username}-${subject.name}-task1`);
                const task2 = formData.get(`${student.username}-${subject.name}-task2`);
                const task3 = formData.get(`${student.username}-${subject.name}-task3`);
                const see = formData.get(`${student.username}-${subject.name}-see`);

                const parseValue = (val) => val === '' ? null : parseInt(val, 10);
                const parseSee = (val) => {
                    if (val === null || val.trim() === '') return null;
                    if (val.trim().toUpperCase() === 'A') return -1;
                    const num = parseInt(val, 10);
                    return isNaN(num) ? null : num;
                };

                state.marks[examId][student.username][subject.name] = {
                    mse1: parseValue(mse1),
                    mse2: parseValue(mse2),
                    task1: parseValue(task1),
                    task2: parseValue(task2),
                    task3: parseValue(task3),
                    see: parseSee(see),
                };
            });
        });
        
        saveMarks();
        hideMarksModal();
    };
    const hideMarksModal = () => marksModal.classList.add('hidden');

    // TEACHER PORTAL: CSV IMPORT
    const showCsvImportModal = () => csvImportModal.classList.remove('hidden');
    const hideCsvImportModal = () => csvImportModal.classList.add('hidden');

    const parseCsv = (csvText) => {
        try {
            const allRows = csvText.split('\n')
                .map(row => row.split(',').map(cell => cell.trim()));
            const examRow = allRows.find(row => row.some(cell => cell.includes('Semester')));
            const subjectHeaderRow = allRows.find(row => row.includes('Subject') && row.includes('Credit'));
            const subjectValueRowIndex = allRows.findIndex(row => row.includes('Subject') && row.includes('Credit')) + 1;
            const subjectValueRow = allRows[subjectValueRowIndex];
            const headerRowIndex = allRows.findIndex(row => row.includes('Name') && row.includes('USN'));

            if (!examRow || !subjectHeaderRow || !subjectValueRow || headerRowIndex === -1) {
                throw new Error("Could not find key landmarks in CSV: 'Semester', 'Subject'/'Credit', or 'Name'/'USN' headers.");
            }
            const examName = examRow.find(cell => cell.includes('Semester')) || '';
            const subjectName = subjectValueRow[subjectHeaderRow.indexOf('Subject')] || '';
            const subjectCredits = parseInt(subjectValueRow[subjectHeaderRow.indexOf('Credit')], 10);
            const headerRow = allRows[headerRowIndex];
            const firstHeaderIndex = headerRow.findIndex(cell => cell.length > 0);
            const headers = headerRow.slice(firstHeaderIndex);
            
            const studentDataRows = allRows.slice(headerRowIndex + 1)
                .filter(row => row.slice(firstHeaderIndex).some(cell => cell.length > 0)); 

            const students = studentDataRows.map(row => {
                const student = { data: {} };
                const rowData = row.slice(firstHeaderIndex);
                headers.forEach((header, i) => {
                    if (header) { 
                        student.data[header] = rowData[i] || '';
                    }
                });
                return student;
            }).filter(s => s.data['USN'] && s.data['Name']); 

            if (!examName || !subjectName || isNaN(subjectCredits) || students.length === 0) {
                throw new Error("CSV is missing essential data: Exam Name, Subject Name/Credits, or valid student rows.");
            }

            return { examName, subject: { name: subjectName, credits: subjectCredits }, students, headers };

        } catch (error) {
            console.error("Error parsing CSV:", error);
            alert(`Failed to parse CSV file. Please ensure it follows the correct format. Error: ${error.message}`);
            return null;
        }
    };
    
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const csvText = event.target.result;
            const parsedData = parseCsv(csvText);
            if (parsedData) {
                renderCsvImportModal(parsedData);
            }
        };
        reader.readAsText(file);
        e.target.value = ''; 
    };

    const renderCsvImportModal = (parsedData) => {
        csvExamNameInput.value = parsedData.examName;
        csvSubjectNameInput.value = parsedData.subject.name;
        csvSubjectCreditsInput.value = parsedData.subject.credits;

        csvTableHead.innerHTML = parsedData.headers.map(h => `<th class="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">${h}</th>`).join('');

        const inputClasses = "w-full p-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500";
        csvTableBody.innerHTML = parsedData.students.map((student, rowIndex) => `
            <tr data-row-index="${rowIndex}">
                ${parsedData.headers.map(header => {
                    const value = student.data[header] || '';
                    const isNumeric = !['Name', 'USN'].includes(header);
                    return `<td class="px-1 py-1"><input type="${isNumeric ? 'text' : 'text'}" data-header="${header}" class="${inputClasses}" value="${value}"></td>`;
                }).join('')}
            </tr>
        `).join('');
        
        showCsvImportModal();
        validateAndRenderCsvErrors();
    };

    const validateAndRenderCsvErrors = () => {
        let isValid = true;
        
        csvImportModal.querySelectorAll('.border-red-500').forEach(el => el.classList.remove('border-red-500', 'dark:border-red-500'));
        const markLimits = { 'MSE 1': 20, 'MSE 2': 20, 'Task1': 4, 'Task2': 4, 'Task3': 2, 'SEE': 100 };
        const usnsInFile = new Set();
        
        const markAsInvalid = (el) => {
            el.classList.add('border-red-500', 'dark:border-red-500');
            isValid = false;
        };

        if (!csvExamNameInput.value.trim()) markAsInvalid(csvExamNameInput);
        if (!csvSubjectNameInput.value.trim()) markAsInvalid(csvSubjectNameInput);
        if (!csvSubjectCreditsInput.value.trim() || parseInt(csvSubjectCreditsInput.value, 10) < 1) markAsInvalid(csvSubjectCreditsInput);

        csvTableBody.querySelectorAll('tr').forEach(row => {
            const usnInput = row.querySelector('input[data-header="USN"]');
            if (usnInput) {
                const usnValue = usnInput.value.trim();
                if (usnValue && usnsInFile.has(usnValue)) {
                    markAsInvalid(usnInput);
                } else if(usnValue) {
                    usnsInFile.add(usnValue);
                }
            }

            row.querySelectorAll('input').forEach(input => {
                const header = input.dataset.header;
                const value = input.value.trim();
                
                if (header === 'Name' && !value) markAsInvalid(input);
                if (header === 'USN' && !value) markAsInvalid(input);

                if (markLimits[header]) {
                    if (value.toUpperCase() === 'A' && header === 'SEE') {
                    } else if (value !== '') {
                         const numValue = parseInt(value, 10);
                        if (isNaN(numValue) || numValue < 0 || numValue > markLimits[header]) {
                            markAsInvalid(input);
                        }
                    }
                }
            });
        });

        saveCsvDataBtn.disabled = !isValid;
        csvErrorContainer.classList.toggle('hidden', isValid);
        return isValid;
    };

    const handleSaveCsvData = (e) => {
        e.preventDefault();
        if (!validateAndRenderCsvErrors()) {
            alert("Please fix the validation errors before saving.");
            return;
        }
    
        const examName = csvExamNameInput.value.trim();
        const subjectName = csvSubjectNameInput.value.trim();
        const subjectCredits = parseInt(csvSubjectCreditsInput.value, 10);
        let existingExam = state.exams.find(ex => ex.name.toLowerCase() === examName.toLowerCase());
        
        let changesMade = false;
        let isNewExam = !existingExam;
        let examId;
    
        if (existingExam) {
            //EXISTING EXAM LOGIC
            examId = existingExam.id;
            const existingSubject = existingExam.subjects.find(sub => sub.name.toLowerCase() === subjectName.toLowerCase());
    
            if (existingSubject) {
                if (existingSubject.credits !== subjectCredits) {
                    existingSubject.credits = subjectCredits;
                    changesMade = true;
                }
            } else {
                existingExam.subjects.push({ name: subjectName, credits: subjectCredits });
                changesMade = true;
            }
        } else {
            //NEW EXAM LOGIC
            const newExam = { id: `exam_${Date.now()}`, name: examName, subjects: [{ name: subjectName, credits: subjectCredits }] };
            state.exams.push(newExam);
            existingExam = newExam;
            examId = newExam.id;
            changesMade = true;
        }
        if (!state.marks[examId]) state.marks[examId] = {};
    
        //PROCESS STUDENTS AND MARKS
        csvTableBody.querySelectorAll('tr').forEach(row => {
            const studentData = {};
            row.querySelectorAll('input').forEach(input => {
                studentData[input.dataset.header] = input.value.trim();
            });
    
            const usn = studentData['USN'];
            const name = studentData['Name'];
            
            if (!usn || !name) return;
            if (!state.users.some(u => u.username === usn)) {
                state.users.push({ username: usn, name: name, password: usn, role: 'student' });
                changesMade = true;
            }
            if (!state.marks[examId][usn]) state.marks[examId][usn] = {};
            
            const parseVal = (val) => val === '' ? null : parseInt(val, 10);
            const parseSee = (val) => {
                if (val === null || val.trim() === '') return null;
                if (val.trim().toUpperCase() === 'A') return -1;
                const num = parseInt(val, 10);
                return isNaN(num) ? null : num;
            };
            
            const newMarks = {
                mse1: parseVal(studentData['MSE 1']),
                mse2: parseVal(studentData['MSE 2']),
                task1: parseVal(studentData['Task1']),
                task2: parseVal(studentData['Task2']),
                task3: parseVal(studentData['Task3']),
                see: parseSee(studentData['SEE'])
            };
            if (!isNewExam) {
                const oldMarks = state.marks[examId][usn]?.[subjectName] || {};
                if (JSON.stringify(oldMarks) !== JSON.stringify(newMarks)) {
                    changesMade = true;
                }
            }
            state.marks[examId][usn][subjectName] = newMarks;
        });
    
        //FINAL DECISION AND SAVE
        if (!changesMade) {
             alert("No new data to import. The students and marks for this subject already exist with the same values.");
             return;
        }
    
        saveExams();
        saveUsers();
        saveMarks();
        hideCsvImportModal();
        renderTeacherDashboard();
    };

    //STUDENT DASHBOARD: OFFICIAL RESULTS & CHARTS
    const updateChartToggleStyles = (containerEl, activeType) => {
        const buttons = containerEl.querySelectorAll('button[data-chart-type]');
        buttons.forEach(btn => {
            if (btn.dataset.chartType === activeType) {
                btn.classList.add('bg-white', 'dark:bg-gray-800', 'shadow-sm', 'text-primary-600', 'dark:text-primary-400', 'font-semibold');
                btn.classList.remove('bg-transparent', 'text-gray-600', 'dark:text-gray-300');
            } else {
                btn.classList.remove('bg-white', 'dark:bg-gray-800', 'shadow-sm', 'text-primary-600', 'dark:text-primary-400', 'font-semibold');
                btn.classList.add('bg-transparent', 'text-gray-600', 'dark:text-gray-300');
            }
        });
    };

    const renderStudentDashboard = () => {
        renderStudentDetails();
        renderOfficialResults();
        renderAnalyzer();
    };
    const renderStudentDetails = () => {
        studentDetailsContent.innerHTML = `
            <p><span class="font-semibold">Full Name:</span> ${state.currentUser.name}</p>
            <p><span class="font-semibold">Username:</span> ${state.currentUser.username}</p>
        `;
    };
    const renderOfficialResults = () => {
        const studentUsername = state.currentUser.username;
        
        Object.values(state.activeCharts).forEach(chartInfo => chartInfo.instance.destroy());
        state.activeCharts = {};
        
        const completedResults = state.exams
            .map(exam => {
                const studentMarks = state.marks[exam.id]?.[studentUsername];
                if (!studentMarks) return null;
                const resultData = calculateSGPA(exam, studentMarks);
                return (resultData && resultData.sgpa !== null) ? resultData : null;
            })
            .filter(Boolean);

        const resultsHtml = state.exams.map(exam => {
            const studentMarks = state.marks[exam.id]?.[studentUsername];
            if (!studentMarks) return '';

            const resultData = calculateSGPA(exam, studentMarks);
            if (!resultData) return '';

            const isFinal = resultData.sgpa !== null;
            const resultId = `result-details-${exam.id}`;

            let cgpaHtml = '';
            if (isFinal) {
                const completedResultIndex = completedResults.findIndex(cr => cr.examId === exam.id);
                if (completedResultIndex > 0) {
                    const resultsForCgpa = completedResults.slice(0, completedResultIndex + 1);
                    const cgpa = calculateCumulativeCGPA(resultsForCgpa);
                    cgpaHtml = `<p class="text-sm font-semibold text-green-600 dark:text-green-400 mt-1">CGPA: ${cgpa.toFixed(2)}</p>`;
                }
            }
            
            let detailsHtml = '';
            if (isFinal) {
                detailsHtml = `
                    <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 class="font-bold text-lg mb-2">Marks Breakdown</h4>
                            <div class="overflow-x-auto">
                                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead class="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th class="px-4 py-2 text-left text-xs font-medium uppercase">Subject</th>
                                            <th class="px-4 py-2 text-center text-xs font-medium uppercase">CIE (50)</th>
                                            <th class="px-4 py-2 text-center text-xs font-medium uppercase">SEE (50)</th>
                                            <th class="px-4 py-2 text-center text-xs font-medium uppercase">Total (100)</th>
                                            <th class="px-4 py-2 text-center text-xs font-medium uppercase">Grade</th>
                                            <th class="px-4 py-2 text-center text-xs font-medium uppercase">GP</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                        ${resultData.subjectDetails.map(s => `
                                            <tr>
                                                <td class="px-4 py-2 font-medium">${s.name}</td>
                                                <td class="px-4 py-2 text-center">${s.cie}</td>
                                                <td class="px-4 py-2 text-center">${s.see === -1 ? 'AB' : s.see / 2}</td>
                                                <td class="px-4 py-2 text-center">${s.finalPercentage}</td>
                                                <td class="px-4 py-2 text-center font-bold">${s.letter}</td>
                                                <td class="px-4 py-2 text-center">${s.gradePoint}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div>
                            <div class="flex justify-between items-center mb-2">
                                <h4 class="font-bold text-lg">Performance Chart</h4>
                                <div class="chart-toggle-container flex space-x-1 bg-gray-200 dark:bg-gray-700 p-0.5 rounded-lg">
                                    <button class="px-3 py-1 text-xs rounded-md" data-action="set-chart-type" data-exam-id="${exam.id}" data-chart-type="bar">Bar</button>
                                    <button class="px-3 py-1 text-xs rounded-md" data-action="set-chart-type" data-exam-id="${exam.id}" data-chart-type="pie">Pie</button>
                                </div>
                            </div>
                            <canvas id="chart-${exam.id}"></canvas>
                        </div>
                    </div>
                `;
            } else {
                 detailsHtml = `
                    <div class="mt-4">
                        <h4 class="font-bold text-lg mb-2">Internal Assessment Marks (CIE)</h4>
                        <p class="text-sm text-yellow-500 mb-4">Final grade and SGPA will be calculated after SEE results are published.</p>
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead class="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th class="px-4 py-2 text-left text-xs font-medium uppercase">Subject</th>
                                        <th class="px-4 py-2 text-center text-xs font-medium uppercase">MSE1 (20)</th>
                                        <th class="px-4 py-2 text-center text-xs font-medium uppercase">MSE2 (20)</th>
                                        <th class="px-4 py-2 text-center text-xs font-medium uppercase">T1 (4)</th>
                                        <th class="px-4 py-2 text-center text-xs font-medium uppercase">T2 (4)</th>
                                        <th class="px-4 py-2 text-center text-xs font-medium uppercase">T3 (2)</th>
                                        <th class="px-4 py-2 text-center text-xs font-medium uppercase font-bold">Total CIE (50)</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                                    ${resultData.subjectDetails.map(s => `
                                        <tr>
                                            <td class="px-4 py-2 font-medium">${s.name}</td>
                                            <td class="px-4 py-2 text-center">${s.marks.mse1 ?? '-'}</td>
                                            <td class="px-4 py-2 text-center">${s.marks.mse2 ?? '-'}</td>
                                            <td class="px-4 py-2 text-center">${s.marks.task1 ?? '-'}</td>
                                            <td class="px-4 py-2 text-center">${s.marks.task2 ?? '-'}</td>
                                            <td class="px-4 py-2 text-center">${s.marks.task3 ?? '-'}</td>
                                            <td class="px-4 py-2 text-center font-bold">${s.cie}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            }
            
            return `
                <div class="border dark:border-gray-700 rounded-lg">
                    <div class="w-full text-left p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                        <button class="flex-grow text-left" data-action="toggle-result" data-target="${resultId}">
                            <div>
                                <h3 class="font-bold text-lg">${exam.name}</h3>
                                ${isFinal ? 
                                    `<div>
                                        <p class="text-sm font-semibold text-primary-600 dark:text-primary-400">SGPA: ${resultData.sgpa.toFixed(2)} - ${resultData.classification}</p>
                                        ${cgpaHtml}
                                    </div>` :
                                    `<p class="text-sm text-yellow-500">${resultData.classification}</p>`
                                }
                            </div>
                        </button>
                        <div class="flex items-center space-x-2">
                          ${isFinal ? `
                            <button class="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700" data-action="export-pdf" data-exam-id="${exam.id}">PDF</button>
                            <button class="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700" data-action="export-csv" data-exam-id="${exam.id}">CSV</button>
                          ` : ''}
                          <button data-action="toggle-result" data-target="${resultId}">
                            <svg class="w-5 h-5 transform transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                          </button>
                        </div>
                    </div>
                    <div id="${resultId}" class="p-4 hidden">
                       ${detailsHtml}
                    </div>
                </div>
            `;
        }).join('');
        
        if (resultsHtml.trim() === '') {
            officialResultsList.innerHTML = `<p id="official-results-placeholder" class="text-gray-500 dark:text-gray-400 text-center py-8">No official results published yet.</p>`;
        } else {
            officialResultsList.innerHTML = resultsHtml;
            state.exams.forEach(exam => {
                 const studentMarks = state.marks[exam.id]?.[studentUsername];
                 if (!studentMarks) return;
                 const resultData = calculateSGPA(exam, studentMarks);
                 if (resultData && resultData.sgpa !== null) {
                    const ctx = document.getElementById(`chart-${exam.id}`);
                    if (ctx) {
                        const chartData = {
                            labels: resultData.subjectDetails.map(s => s.name),
                            datasets: [{
                                label: 'Final Marks (%)',
                                data: resultData.subjectDetails.map(s => s.finalPercentage),
                                backgroundColor: chartColors,
                            }]
                        };
                        const chartOptions = {
                            scales: { y: { beginAtZero: true, max: 100 } },
                            plugins: { legend: { display: true } }
                        };
                        const chartInstance = new Chart(ctx, { type: 'bar', data: chartData, options: chartOptions });
                        state.activeCharts[exam.id] = { instance: chartInstance, type: 'bar', data: chartData, options: chartOptions };
                        updateChartToggleStyles(ctx.parentElement, 'bar');
                    }
                 }
            });
        }
    };
    const handleOfficialResultsClick = (e) => {
        const button = e.target.closest('button');
        if (!button) return;
    
        const action = button.dataset.action;
        if (action === 'toggle-result') {
            const targetId = button.dataset.target;
            const detailsEl = document.getElementById(targetId);
            const icon = button.closest('.border').querySelector('svg');
            if (detailsEl) {
                detailsEl.classList.toggle('hidden');
                icon.classList.toggle('rotate-180');
            }
        } else if (action === 'export-pdf') {
            handleExportPdf(button.dataset.examId);
        } else if (action === 'export-csv') {
            handleExportCsv(button.dataset.examId);
        } else if (action === 'set-chart-type') {
            const examId = button.dataset.examId;
            const newType = button.dataset.chartType;
            const chartInfo = state.activeCharts[examId];

            if (chartInfo && chartInfo.type !== newType) {
                chartInfo.instance.destroy();
                const ctx = document.getElementById(`chart-${examId}`);
                const options = (newType === 'pie') ? { plugins: { legend: { display: true } } } : chartInfo.options;
                const newInstance = new Chart(ctx, { type: newType, data: chartInfo.data, options });
                state.activeCharts[examId] = { ...chartInfo, instance: newInstance, type: newType };
                updateChartToggleStyles(button.closest('.chart-toggle-container').parentElement, newType);
            }
        }
    };
    const handleExportPdf = (examId) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const exam = state.exams.find(e => e.id === examId);
        const student = state.currentUser;
        const studentMarks = state.marks[examId]?.[student.username];
        const resultData = calculateSGPA(exam, studentMarks);

        if (!resultData || resultData.sgpa === null) {
            alert('Cannot export incomplete results.');
            return;
        }

        const studentUsername = state.currentUser.username;
        const completedResults = state.exams
            .map(ex => {
                const marks = state.marks[ex.id]?.[studentUsername];
                if (!marks) return null;
                const resData = calculateSGPA(ex, marks);
                return resData && resData.sgpa !== null ? resData : null;
            })
            .filter(Boolean);

        const completedResultIndex = completedResults.findIndex(cr => cr.examId === examId);
        let cgpa = null;
        if (completedResultIndex > 0) {
            const resultsForCgpa = completedResults.slice(0, completedResultIndex + 1);
            cgpa = calculateCumulativeCGPA(resultsForCgpa);
        }

        doc.setFontSize(20);
        doc.text('Official Result Transcript', 14, 22);
        doc.setFontSize(12);
        doc.text(`Student: ${student.name} (${student.username})`, 14, 32);
        doc.text(`Exam: ${exam.name}`, 14, 38);
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`SGPA: ${resultData.sgpa.toFixed(2)}`, 14, 50);
        
        let classificationY = 56;
        let startY = 65;
        if (cgpa !== null) {
            doc.text(`CGPA: ${cgpa.toFixed(2)}`, 14, 56);
            classificationY = 62;
            startY = 70;
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text(`Classification: ${resultData.classification}`, 14, classificationY);

        const head = [['Subject', 'Credits', 'CIE (50)', 'SEE (50)', 'Total (100)', 'Grade', 'GP']];
        const body = resultData.subjectDetails.map(s => [
            s.name, s.credits, s.cie, s.see === -1 ? 'AB' : s.see / 2, s.finalPercentage, s.letter, s.gradePoint
        ]);

        doc.autoTable({ startY, head, body, theme: 'striped', headStyles: { fillColor: '#1d4ed8' } });
        
        doc.save(`${student.username}_${exam.name}_result.pdf`);
    };
    const handleExportCsv = (examId) => {
        const exam = state.exams.find(e => e.id === examId);
        const student = state.currentUser;
        const studentMarks = state.marks[examId]?.[student.username];
        const resultData = calculateSGPA(exam, studentMarks);
    
        if (!resultData || resultData.sgpa === null) {
            alert('Cannot export incomplete results.');
            return;
        }
    
        const studentUsername = state.currentUser.username;
        const completedResults = state.exams
            .map(ex => {
                const marks = state.marks[ex.id]?.[studentUsername];
                if (!marks) return null;
                const resData = calculateSGPA(ex, marks);
                return resData && resData.sgpa !== null ? resData : null;
            })
            .filter(Boolean);

        const completedResultIndex = completedResults.findIndex(cr => cr.examId === examId);
        let cgpa = null;
        if (completedResultIndex > 0) {
            const resultsForCgpa = completedResults.slice(0, completedResultIndex + 1);
            cgpa = calculateCumulativeCGPA(resultsForCgpa);
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        const headers = ['Subject', 'Credits', 'CIE (50)', 'SEE (50)', 'Total (100)', 'Grade', 'GP'];
        csvContent += headers.join(",") + "\r\n";
    
        resultData.subjectDetails.forEach(s => {
            const row = [s.name, s.credits, s.cie, s.see === -1 ? 'AB' : s.see / 2, s.finalPercentage, s.letter, s.gradePoint];
            csvContent += row.join(",") + "\r\n";
        });
        
        csvContent += "\r\n";
        csvContent += `SGPA,${resultData.sgpa.toFixed(2)}\r\n`;
        if (cgpa !== null) {
            csvContent += `CGPA,${cgpa.toFixed(2)}\r\n`;
        }
        csvContent += `Classification,"${resultData.classification}"\r\n`;
    
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${student.username}_${exam.name}_result.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    //STUDENT DASHBOARD: ANALYZER
    const renderAnalyzer = () => {
        analyzerSubjectsList.innerHTML = '';
        analyzerResultContainer.classList.add('hidden');
        addAnalyzerSubjectRow(); 
    };
    const addAnalyzerSubjectRow = () => {
        const index = analyzerSubjectsList.children.length;
        const markInputClasses = 'w-full p-1.5 text-sm text-center bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500';
        const newRow = document.createElement('div');
        newRow.className = 'p-4 border dark:border-gray-600 rounded-lg space-y-3 analyzer-subject-row';
        newRow.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input type="text" name="analyzer-subject-name" class="p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg" placeholder="Subject Name" required>
                <input type="number" name="analyzer-credits" class="p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg" placeholder="Credits" required min="1">
                <button type="button" data-action="remove-analyzer-subject" class="text-red-500 justify-self-end text-lg font-bold hover:text-red-700">&times;</button>
            </div>
            <div class="grid grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs text-gray-500">
                <span>MSE1 (20)</span><span>MSE2 (20)</span><span>T1 (4)</span><span>T2 (4)</span><span>T3 (2)</span><span>SEE (100)</span>
            </div>
            <div class="grid grid-cols-3 md:grid-cols-6 gap-2">
                <input type="number" class="${markInputClasses}" name="analyzer-mse1" min="0" max="20">
                <input type="number" class="${markInputClasses}" name="analyzer-mse2" min="0" max="20">
                <input type="number" class="${markInputClasses}" name="analyzer-task1" min="0" max="4">
                <input type="number" class="${markInputClasses}" name="analyzer-task2" min="0" max="4">
                <input type="number" class="${markInputClasses}" name="analyzer-task3" min="0" max="2">
                <input type="text" class="${markInputClasses}" name="analyzer-see" placeholder="0-100 or A">
            </div>
        `;
        analyzerSubjectsList.appendChild(newRow);
        updateAnalyzerRemoveButtons();
    };
    const updateAnalyzerRemoveButtons = () => {
        const buttons = analyzerSubjectsList.querySelectorAll('[data-action="remove-analyzer-subject"]');
        buttons.forEach(btn => btn.disabled = (buttons.length === 1));
    };
    const handleAnalyzerSubjectsClick = (e) => {
        const button = e.target.closest('button[data-action="remove-analyzer-subject"]');
        if(button) {
            button.closest('.analyzer-subject-row').remove();
            updateAnalyzerRemoveButtons();
        }
    };
    const handleAnalyzerFormSubmit = (e) => {
        e.preventDefault();
        const subjectRows = analyzerSubjectsList.querySelectorAll('.analyzer-subject-row');
        if (subjectRows.length === 0) {
            alert('Please add at least one subject.'); return;
        }
    
        const mockExam = { id: 'analyzer_exam', name: 'Analyzer Simulation', subjects: [] };
        const mockMarks = {};
    
        let hasErrors = false;
        subjectRows.forEach(row => {
            const subjectName = row.querySelector('[name="analyzer-subject-name"]').value.trim();
            const credits = parseInt(row.querySelector('[name="analyzer-credits"]').value, 10);
            
            if (!subjectName || !credits || credits < 1) hasErrors = true;
    
            mockExam.subjects.push({ name: subjectName, credits: credits });
    
            const parseVal = (val) => val === '' ? null : parseInt(val, 10);
            const parseSee = (val) => {
                if (val === null || val.trim() === '') return null;
                if (val.trim().toUpperCase() === 'A') return -1;
                const num = parseInt(val, 10);
                return isNaN(num) ? null : num;
            };
    
            mockMarks[subjectName] = {
                mse1: parseVal(row.querySelector('[name="analyzer-mse1"]').value),
                mse2: parseVal(row.querySelector('[name="analyzer-mse2"]').value),
                task1: parseVal(row.querySelector('[name="analyzer-task1"]').value),
                task2: parseVal(row.querySelector('[name="analyzer-task2"]').value),
                task3: parseVal(row.querySelector('[name="analyzer-task3"]').value),
                see: parseSee(row.querySelector('[name="analyzer-see"]').value)
            };
        });
    
        if (hasErrors) {
            alert('Please fill in a valid name and credits (>=1) for all subjects.');
            return;
        }
    
        const resultData = calculateSGPA(mockExam, mockMarks);
        renderAnalyzerResult(resultData);
    };
    const handleAnalyzerResultClick = (e) => {
        const button = e.target.closest('button');
        if (!button) return;
    
        const action = button.dataset.action;
        if (action === 'export-analyzer-pdf') {
            if (state.analyzerResultData) handleAnalyzerExportPdf(state.analyzerResultData);
        } else if (action === 'export-analyzer-csv') {
            if (state.analyzerResultData) handleAnalyzerExportCsv(state.analyzerResultData);
        } else if (action === 'set-analyzer-chart-type') {
            const newType = button.dataset.chartType;
            if (newType !== state.analyzerChartType) {
                state.analyzerChartType = newType;
                renderAnalyzerResult(state.analyzerResultData);
            }
        }
    };
    const handleAnalyzerExportPdf = (resultData) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text('Simulated Result Transcript', 14, 22);
        doc.setFontSize(12);

        const isFinal = resultData.sgpa !== null;
        let totalMarksObtained = 0;
        let totalMarksPossible = 0;
        resultData.subjectDetails.forEach(s => {
            if (isFinal) {
                totalMarksObtained += s.finalPercentage;
                totalMarksPossible += 100;
            } else {
                totalMarksObtained += s.cie;
                totalMarksPossible += 50;
            }
        });
        const averagePercentage = totalMarksPossible > 0 ? (totalMarksObtained / totalMarksPossible) * 100 : 0;
        
        doc.text(`Total Marks: ${totalMarksObtained.toFixed(2)} / ${totalMarksPossible}`, 14, 32);
        doc.text(`Average: ${averagePercentage.toFixed(2)}%`, 14, 38);

        if (isFinal) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(`SGPA: ${resultData.sgpa.toFixed(2)}`, 14, 50);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
            doc.text(`Classification: ${resultData.classification}`, 14, 56);
        }

        const head = isFinal
            ? [['Subject', 'Credits', 'CIE (50)', 'SEE (50)', 'Total (100)', 'Grade', 'GP']]
            : [['Subject', 'Credits', 'CIE (50)']];
        
        const body = isFinal
            ? resultData.subjectDetails.map(s => [s.name, s.credits, s.cie, s.see === -1 ? 'AB' : s.see / 2, s.finalPercentage, s.letter, s.gradePoint])
            : resultData.subjectDetails.map(s => [s.name, s.credits, s.cie]);

        doc.autoTable({ startY: 65, head, body, theme: 'striped', headStyles: { fillColor: '#1d4ed8' } });
        doc.save(`SGPA_Analyzer_Result.pdf`);
    };
    const handleAnalyzerExportCsv = (resultData) => {
        const isFinal = resultData.sgpa !== null;
        let csvContent = "data:text/csv;charset=utf-8,";
        
        const headers = isFinal
            ? ['Subject', 'Credits', 'CIE (50)', 'SEE (50)', 'Total (100)', 'Grade', 'GP']
            : ['Subject', 'Credits', 'CIE (50)'];
        csvContent += headers.join(",") + "\r\n";
    
        resultData.subjectDetails.forEach(s => {
            const row = isFinal
                ? [s.name, s.credits, s.cie, s.see === -1 ? 'AB' : s.see / 2, s.finalPercentage, s.letter, s.gradePoint]
                : [s.name, s.credits, s.cie];
            csvContent += row.join(",") + "\r\n";
        });
        
        csvContent += "\r\n";
        if (isFinal) {
            csvContent += `SGPA,${resultData.sgpa.toFixed(2)}\r\n`;
            csvContent += `Classification,"${resultData.classification}"\r\n`;
        } else {
             csvContent += `Classification,"${resultData.classification}"\r\n`;
        }
    
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `SGPA_Analyzer_Result.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const renderAnalyzerResult = (resultData) => {
        if (state.analyzerChart) {
            state.analyzerChart.destroy();
            state.analyzerChart = null;
        }

        if (!resultData) {
            analyzerResultContainer.innerHTML = `<p class="text-red-500">Could not calculate result. Please check your inputs.</p>`;
            analyzerResultContainer.classList.remove('hidden');
            return;
        }

        state.analyzerResultData = resultData;
        const isFinal = resultData.sgpa !== null;

        let totalMarksObtained = 0;
        let totalMarksPossible = 0;
        resultData.subjectDetails.forEach(s => {
            if (isFinal) {
                totalMarksObtained += s.finalPercentage;
                totalMarksPossible += 100;
            } else {
                totalMarksObtained += s.cie;
                totalMarksPossible += 50;
            }
        });
        const averagePercentage = totalMarksPossible > 0 ? (totalMarksObtained / totalMarksPossible) * 100 : 0;

        let resultHtml = '';
        if (isFinal) {
            resultHtml += `<div class="text-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <p class="text-lg">Simulated SGPA</p>
                <p class="text-4xl font-bold text-primary-600 dark:text-primary-400">${resultData.sgpa.toFixed(2)}</p>
                <p class="font-semibold">${resultData.classification}</p>
            </div>`;
        } else {
             resultHtml += `<div class="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p class="text-lg font-semibold text-yellow-600 dark:text-yellow-400">${resultData.classification}</p>
                <p class="text-sm">Enter SEE marks for all subjects to calculate final SGPA.</p>
            </div>`;
        }

        resultHtml += `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                <div class="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Total Marks</p>
                    <p class="text-xl font-bold">${totalMarksObtained.toFixed(0)} / ${totalMarksPossible}</p>
                </div>
                <div class="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Average Percentage</p>
                    <p class="text-xl font-bold">${averagePercentage.toFixed(2)}%</p>
                </div>
                <div class="p-3 flex items-center justify-center space-x-2">
                     <button class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700" data-action="export-analyzer-pdf">PDF</button>
                     <button class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700" data-action="export-analyzer-csv">CSV</button>
                </div>
            </div>
        `;

        const tableHeaders = isFinal 
            ? `<th class="px-4 py-2 text-left text-xs font-medium uppercase">Subject</th>
               <th class="px-4 py-2 text-center text-xs font-medium uppercase">CIE</th>
               <th class="px-4 py-2 text-center text-xs font-medium uppercase">SEE</th>
               <th class="px-4 py-2 text-center text-xs font-medium uppercase">Total</th>
               <th class="px-4 py-2 text-center text-xs font-medium uppercase">Grade</th>
               <th class="px-4 py-2 text-center text-xs font-medium uppercase">GP</th>`
            : `<th class="px-4 py-2 text-left text-xs font-medium uppercase">Subject</th>
               <th class="px-4 py-2 text-center text-xs font-medium uppercase">Total CIE (50)</th>`;

        const tableBody = resultData.subjectDetails.map(s => isFinal 
            ? `<tr>
                <td class="px-4 py-2 font-medium">${s.name}</td>
                <td class="px-4 py-2 text-center">${s.cie}</td>
                <td class="px-4 py-2 text-center">${s.see === -1 ? 'AB' : s.see === null ? '-' : s.see/2}</td>
                <td class="px-4 py-2 text-center">${s.finalPercentage ?? '-'}</td>
                <td class="px-4 py-2 text-center font-bold">${s.letter}</td>
                <td class="px-4 py-2 text-center">${s.gradePoint ?? '-'}</td>
               </tr>`
            : `<tr>
                <td class="px-4 py-2 font-medium">${s.name}</td>
                <td class="px-4 py-2 text-center font-bold">${s.cie}</td>
               </tr>`
        ).join('');

        resultHtml += `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 class="font-bold text-lg mb-2">Simulated Marks Breakdown</h4>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead class="bg-gray-50 dark:bg-gray-700"><tr>${tableHeaders}</tr></thead>
                            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">${tableBody}</tbody>
                        </table>
                    </div>
                </div>
                 <div>
                    <div class="flex justify-between items-center mb-2">
                        <h4 class="font-bold text-lg">Performance Chart</h4>
                        <div class="chart-toggle-container flex space-x-1 bg-gray-200 dark:bg-gray-700 p-0.5 rounded-lg">
                            <button class="px-3 py-1 text-xs rounded-md" data-action="set-analyzer-chart-type" data-chart-type="bar">Bar</button>
                            <button class="px-3 py-1 text-xs rounded-md" data-action="set-analyzer-chart-type" data-chart-type="pie">Pie</button>
                        </div>
                    </div>
                    <canvas id="analyzer-chart"></canvas>
                </div>
            </div>`;
        
        analyzerResultContainer.innerHTML = resultHtml;
        analyzerResultContainer.classList.remove('hidden');

        const ctx = document.getElementById('analyzer-chart');
        if (ctx) {
            const chartData = {
                labels: resultData.subjectDetails.map(s => s.name),
                datasets: [{
                    label: isFinal ? 'Final Marks (%)' : 'CIE Marks (out of 50)',
                    data: resultData.subjectDetails.map(s => isFinal ? s.finalPercentage : s.cie),
                    backgroundColor: chartColors,
                }]
            };
            const chartOptions = (state.analyzerChartType === 'pie')
                ? { plugins: { legend: { display: true } } }
                : { scales: { y: { beginAtZero: true, max: isFinal ? 100 : 50 } }, plugins: { legend: { display: false } } };

            state.analyzerChart = new Chart(ctx, { type: state.analyzerChartType, data: chartData, options: chartOptions });
            updateChartToggleStyles(ctx.parentElement, state.analyzerChartType);
        }
    };


    // THEME MANAGEMENT
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            themeToggleLightIcon.classList.remove('hidden');
            themeToggleDarkIcon.classList.add('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            themeToggleDarkIcon.classList.remove('hidden');
            themeToggleLightIcon.classList.add('hidden');
        }
    };
    const toggleTheme = () => {
        const isDark = document.documentElement.classList.contains('dark');
        const newTheme = isDark ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    };
    const initializeTheme = () => {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        applyTheme(theme);
    };
    
    //APP INITIALIZATION
    const init = () => {
        loadDataFromStorage();
        initializeTheme();

        loginForm.addEventListener('submit', handleLogin);
        logoutBtn.addEventListener('click', handleLogout);
        themeToggleBtn.addEventListener('click', toggleTheme);

        addStudentBtn.addEventListener('click', () => showStudentModal());
        studentsTableBody.addEventListener('click', handleStudentsTableClick);
        studentForm.addEventListener('submit', handleStudentFormSubmit);
        cancelStudentModalBtn.addEventListener('click', hideStudentModal);

        createExamBtn.addEventListener('click', () => showExamModal());
        examsListEl.addEventListener('click', handleExamsListClick);
        examForm.addEventListener('submit', handleExamFormSubmit);
        cancelExamModalBtn.addEventListener('click', hideExamModal);
        addExamSubjectBtn.addEventListener('click', handleAddExamSubject);
        examSubjectsListEl.addEventListener('click', handleExamSubjectsListClick);
        importExamBtn.addEventListener('click', () => csvFileInput.click());
        csvFileInput.addEventListener('change', handleFileSelect);

        marksForm.addEventListener('submit', handleMarksFormSubmit);
        cancelMarksModalBtn.addEventListener('click', hideMarksModal);

        csvImportForm.addEventListener('submit', handleSaveCsvData);
        cancelCsvModalBtn.addEventListener('click', hideCsvImportModal);
        csvImportModal.addEventListener('input', validateAndRenderCsvErrors);

        officialResultsList.addEventListener('click', handleOfficialResultsClick);

        analyzerAddSubjectBtn.addEventListener('click', addAnalyzerSubjectRow);
        analyzerSubjectsList.addEventListener('click', handleAnalyzerSubjectsClick);
        analyzerForm.addEventListener('submit', handleAnalyzerFormSubmit);
        analyzerResultContainer.addEventListener('click', handleAnalyzerResultClick);

        updateView();
    };
    
    //GLOBAL HELPER
    const renderTeacherDashboard = () => {
        renderStudentsTable();
        renderExamsList();
    };

    init();
});
