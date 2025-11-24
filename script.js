// Global data storage for courses and faculty
// Data is loaded via script tags in index.html (courses.js and faculty.js)

// Student data persistence functions
function saveStudentData() {
    const studentData = {
        studentName: document.getElementById('studentName').value,
        studentId: document.getElementById('studentId').value,
        section: document.getElementById('section').value
    };

    try {
        localStorage.setItem('nubtk_student_data', JSON.stringify(studentData));
        console.log('Student data saved to localStorage');
    } catch (error) {
        console.error('Error saving student data:', error);
    }
}

function loadStudentData() {
    try {
        const savedData = localStorage.getItem('nubtk_student_data');
        if (savedData) {
            const studentData = JSON.parse(savedData);

            // Auto-fill the fields if they exist
            if (studentData.studentName) {
                document.getElementById('studentName').value = studentData.studentName;
            }
            if (studentData.studentId) {
                document.getElementById('studentId').value = studentData.studentId;
            }
            if (studentData.section) {
                document.getElementById('section').value = studentData.section;
            }

            // Trigger input events to update the preview
            document.getElementById('studentName').dispatchEvent(new Event('input'));
            document.getElementById('studentId').dispatchEvent(new Event('input'));
            document.getElementById('section').dispatchEvent(new Event('input'));

            console.log('Student data loaded from localStorage');
        }
    } catch (error) {
        console.error('Error loading student data:', error);
    }
}


// Auto-fill course title based on course code
function setupCourseCodeAutofill() {
    const courseCodeInput = document.getElementById('courseCode');
    const courseTitleInput = document.getElementById('courseTitle');

    console.log('Setting up course code autofill. coursesData:', coursesData ? 'loaded' : 'undefined');

    courseCodeInput.addEventListener('input', () => {
        const courseCode = courseCodeInput.value.trim().toUpperCase();
        console.log('Course code input:', courseCode);

        if (courseCode && coursesData && Array.isArray(coursesData)) {
            // Search across all departments
            let foundCourse = null;

            for (const dept of coursesData) {
                if (dept.courses && Array.isArray(dept.courses)) {
                    const course = dept.courses.find(c => c.code.toUpperCase() === courseCode);
                    if (course) {
                        foundCourse = course;
                        break;
                    }
                }
            }

            console.log('Found course:', foundCourse);
            if (foundCourse) {
                courseTitleInput.value = foundCourse.title;
                courseTitleInput.dispatchEvent(new Event('input'));
            }
        }
    });
}

// Auto-fill course code based on course title
function setupCourseTitleAutofill() {
    const courseCodeInput = document.getElementById('courseCode');
    const courseTitleInput = document.getElementById('courseTitle');

    console.log('Setting up course title autofill. coursesData:', coursesData ? 'loaded' : 'undefined');

    courseTitleInput.addEventListener('input', () => {
        const courseTitle = courseTitleInput.value.trim();
        console.log('Course title input:', courseTitle);

        if (courseTitle && coursesData && Array.isArray(coursesData)) {
            // Search across all departments
            let foundCourse = null;

            for (const dept of coursesData) {
                if (dept.courses && Array.isArray(dept.courses)) {
                    const course = dept.courses.find(c => c.title.toLowerCase() === courseTitle.toLowerCase());
                    if (course) {
                        foundCourse = course;
                        break;
                    }
                }
            }

            console.log('Found course by title:', foundCourse);
            if (foundCourse) {
                courseCodeInput.value = foundCourse.code;
                courseCodeInput.dispatchEvent(new Event('input'));
            }
        }
    });
}

// Store the last selected datalist option text for teacher
let lastTeacherDatalistText = null;

// Auto-fill teacher designation and department based on teacher name
function setupTeacherNameAutofill() {
    const teacherNameInput = document.getElementById('teacherName');
    const teacherDesignationInput = document.getElementById('teacherDesignation');
    const teacherDepartmentSelect = document.getElementById('teacherDepartment');
    const teacherNameList = document.getElementById('teacherNameList');

    console.log('Setting up teacher name autofill. facultyData:', facultyData ? 'loaded' : 'undefined');

    // Listen for when user selects from the datalist
    // The 'change' event fires when the input loses focus after a value change
    teacherNameInput.addEventListener('change', () => {
        const teacherName = teacherNameInput.value.trim();
        console.log('Teacher name changed:', teacherName);

        if (teacherName && facultyData && Array.isArray(facultyData)) {
            performTeacherAutofill(teacherName, lastTeacherDatalistText);
        }
    });

    // Also listen on input for immediate feedback
    teacherNameInput.addEventListener('input', () => {
        const teacherName = teacherNameInput.value.trim();
        console.log('Teacher name input:', teacherName);

        // Check if this matches a datalist option
        if (teacherNameList && teacherName) {
            const matchingOptions = Array.from(teacherNameList.options).filter(
                opt => opt.value === teacherName
            );

            // If there's exactly one match, store its text
            if (matchingOptions.length === 1) {
                lastTeacherDatalistText = matchingOptions[0].textContent;
                console.log('Stored single match option text:', lastTeacherDatalistText);
            } else if (matchingOptions.length > 1) {
                console.log('Multiple matches found, will use last selected option text');
                // Keep the previously stored text for now
            }
        }

        if (teacherName && facultyData && Array.isArray(facultyData)) {
            performTeacherAutofill(teacherName, lastTeacherDatalistText);
        }
    });

    // Add click listener on datalist to capture which option was clicked
    if (teacherNameList) {
        // When user interacts with input, track the current datalist options
        teacherNameInput.addEventListener('click', () => {
            // Set up a temporary listener to catch the selection
            const captureSelection = () => {
                setTimeout(() => {
                    const value = teacherNameInput.value.trim();
                    if (value && teacherNameList) {
                        const matchingOptions = Array.from(teacherNameList.options).filter(
                            opt => opt.value === value
                        );
                        if (matchingOptions.length > 0) {
                            // Try to find which one was likely selected based on visual position
                            // For now, just store the first match's text
                            lastTeacherDatalistText = matchingOptions[0].textContent;
                            console.log('Captured selection text:', lastTeacherDatalistText);
                        }
                    }
                }, 100);
            };
            teacherNameInput.addEventListener('blur', captureSelection, { once: true });
        });
    }
}

function performTeacherAutofill(teacherName, datalistText) {
    const teacherDesignationInput = document.getElementById('teacherDesignation');
    const teacherDepartmentSelect = document.getElementById('teacherDepartment');

    let foundFaculty = null;
    let foundDepartment = null;
    let selectedDepartmentName = null;

    // If we have datalist text, extract department from it
    if (datalistText) {
        const match = datalistText.match(/\(([^)]+)\)$/);
        if (match) {
            selectedDepartmentName = match[1];
            console.log('Extracted department from datalist:', selectedDepartmentName);
        }
    }

    // Search for the teacher in the appropriate department
    for (const dept of facultyData) {
        // If we have a specific department from datalist, only match that department
        if (selectedDepartmentName && dept.department !== selectedDepartmentName) {
            continue;
        }

        const faculty = dept.faculty.find(f => f.name === teacherName);
        if (faculty) {
            foundFaculty = faculty;
            foundDepartment = dept;
            break;
        }
    }

    console.log('Found faculty:', foundFaculty, 'in department:', foundDepartment?.department);

    if (foundFaculty && foundDepartment) {
        // Auto-fill designation only if it exists
        if (foundFaculty.designation) {
            teacherDesignationInput.value = foundFaculty.designation;
            teacherDesignationInput.dispatchEvent(new Event('input'));
            console.log('Auto-filled designation:', foundFaculty.designation);
        } else {
            console.log('No designation found for this faculty member');
        }

        // Auto-fill department based on which department the teacher belongs to
        teacherDepartmentSelect.value = foundDepartment.departmentCode;
        teacherDepartmentSelect.dispatchEvent(new Event('change'));

        console.log('Auto-filled department:', foundDepartment.department);
    }
}

// Flag to prevent circular dependencies during autofill
let isAutoFilling = false;

// Auto-fill student ID based on student name
function setupStudentNameAutofill() {
    const studentNameInput = document.getElementById('studentName');
    const studentIdInput = document.getElementById('studentId');

    console.log('Setting up student name autofill. studentsData:', studentsData ? 'loaded' : 'undefined');

    studentNameInput.addEventListener('input', () => {
        // Skip if we're currently auto-filling to prevent circular dependencies
        if (isAutoFilling) return;

        const studentName = studentNameInput.value.trim();
        console.log('Student name input:', studentName);

        if (studentName && studentsData && studentsData.students && Array.isArray(studentsData.students)) {
            // Search for the student in the students array
            const foundStudent = studentsData.students.find(s => s.name === studentName);

            console.log('Found student:', foundStudent);

            if (foundStudent) {
                // Set flag to prevent circular dependency
                isAutoFilling = true;

                // Auto-fill student ID
                studentIdInput.value = foundStudent.studentId;
                studentIdInput.dispatchEvent(new Event('input'));
                console.log('Auto-filled student ID:', foundStudent.studentId);

                // Reset flag after a short delay
                setTimeout(() => {
                    isAutoFilling = false;
                }, 100);
            }
        }
    });
}

// Auto-fill student name based on student ID
function setupStudentIdAutofill() {
    const studentNameInput = document.getElementById('studentName');
    const studentIdInput = document.getElementById('studentId');

    console.log('Setting up student ID autofill. studentsData:', studentsData ? 'loaded' : 'undefined');

    studentIdInput.addEventListener('input', () => {
        // Skip if we're currently auto-filling to prevent circular dependencies
        if (isAutoFilling) return;

        const studentId = studentIdInput.value.trim();
        console.log('Student ID input:', studentId);

        if (studentId && studentsData && studentsData.students && Array.isArray(studentsData.students)) {
            // Search for the student in the students array
            const foundStudent = studentsData.students.find(s => s.studentId === studentId);

            console.log('Found student:', foundStudent);

            if (foundStudent) {
                // Set flag to prevent circular dependency
                isAutoFilling = true;

                // Auto-fill student name
                studentNameInput.value = foundStudent.name;
                studentNameInput.dispatchEvent(new Event('input'));
                console.log('Auto-filled student name:', foundStudent.name);

                // Reset flag after a short delay
                setTimeout(() => {
                    isAutoFilling = false;
                }, 100);
            }
        }
    });
}

// Populate datalists with course codes, course titles, and teacher names for autocomplete
function populateDataLists() {
    // Populate course code datalist from all departments
    if (coursesData && Array.isArray(coursesData)) {
        const courseCodeList = document.getElementById('courseCodeList');
        if (courseCodeList) {
            courseCodeList.innerHTML = ''; // Clear existing options

            // Iterate through all departments and their courses
            coursesData.forEach(dept => {
                if (dept.courses && Array.isArray(dept.courses)) {
                    dept.courses.forEach(course => {
                        const option = document.createElement('option');
                        option.value = course.code;
                        option.textContent = `${course.code} - ${course.title} (${dept.department})`;
                        courseCodeList.appendChild(option);
                    });
                }
            });

            const totalCourses = coursesData.reduce((sum, dept) => {
                return sum + (dept.courses ? dept.courses.length : 0);
            }, 0);
            console.log('Populated course code datalist with', totalCourses, 'courses from', coursesData.length, 'departments');
        }

        // Populate course title datalist from all departments
        const courseTitleList = document.getElementById('courseTitleList');
        if (courseTitleList) {
            courseTitleList.innerHTML = ''; // Clear existing options

            // Iterate through all departments and their courses
            coursesData.forEach(dept => {
                if (dept.courses && Array.isArray(dept.courses)) {
                    dept.courses.forEach(course => {
                        const option = document.createElement('option');
                        option.value = course.title;
                        option.textContent = `${course.title} - ${course.code} (${dept.department})`;
                        courseTitleList.appendChild(option);
                    });
                }
            });

            console.log('Populated course title datalist with', coursesData.reduce((sum, dept) => sum + (dept.courses ? dept.courses.length : 0), 0), 'courses');
        }
    }

    // Populate teacher name datalist from all departments
    if (facultyData && Array.isArray(facultyData)) {
        const teacherNameList = document.getElementById('teacherNameList');
        if (teacherNameList) {
            teacherNameList.innerHTML = ''; // Clear existing options

            // Iterate through all departments and their faculty
            facultyData.forEach(dept => {
                dept.faculty.forEach(faculty => {
                    const option = document.createElement('option');
                    option.value = faculty.name;

                    // Build text content with optional designation
                    if (faculty.designation) {
                        option.textContent = `${faculty.name} - ${faculty.designation} (${dept.department})`;
                    } else {
                        option.textContent = `${faculty.name} (${dept.department})`;
                    }

                    teacherNameList.appendChild(option);
                });
            });

            const totalFaculty = facultyData.reduce((sum, dept) => sum + dept.faculty.length, 0);
            console.log('Populated teacher name datalist with', totalFaculty, 'faculty members from', facultyData.length, 'departments');
        }
    }

    // Populate student name and ID datalists
    if (studentsData && studentsData.students && Array.isArray(studentsData.students)) {
        const studentNameList = document.getElementById('studentNameList');
        const studentIdList = document.getElementById('studentIdList');

        if (studentNameList) {
            studentNameList.innerHTML = ''; // Clear existing options

            // Iterate through all students
            studentsData.students.forEach(student => {
                const option = document.createElement('option');
                option.value = student.name;
                option.textContent = `${student.name} - ${student.studentId} (${studentsData.department})`;
                studentNameList.appendChild(option);
            });

            console.log('Populated student name datalist with', studentsData.students.length, 'students from', studentsData.department);
        }

        if (studentIdList) {
            studentIdList.innerHTML = ''; // Clear existing options

            // Iterate through all students
            studentsData.students.forEach(student => {
                const option = document.createElement('option');
                option.value = student.studentId;
                option.textContent = `${student.studentId} - ${student.name} (${studentsData.department})`;
                studentIdList.appendChild(option);
            });

            console.log('Populated student ID datalist with', studentsData.students.length, 'student IDs from', studentsData.department);
        }
    }
}

// Filter datalists based on selected department
function filterDataListsByDepartment(selectedDepartmentCode) {
    console.log('Filtering datalists by department:', selectedDepartmentCode);

    // Filter course code datalist
    if (coursesData && Array.isArray(coursesData)) {
        const courseCodeList = document.getElementById('courseCodeList');
        if (courseCodeList) {
            courseCodeList.innerHTML = ''; // Clear existing options

            // Sort and filter departments
            const sortedDepts = [...coursesData].sort((a, b) =>
                a.department.localeCompare(b.department)
            );

            sortedDepts.forEach(dept => {
                // If a department is selected, only show courses from that department
                if (selectedDepartmentCode && dept.departmentCode !== selectedDepartmentCode) {
                    return; // Skip this department
                }

                if (dept.courses && Array.isArray(dept.courses)) {
                    dept.courses.forEach(course => {
                        const option = document.createElement('option');
                        option.value = course.code;
                        option.textContent = `${course.code} - ${course.title} (${dept.department})`;
                        courseCodeList.appendChild(option);
                    });
                }
            });

            const totalCourses = courseCodeList.querySelectorAll('option').length;
            console.log('Filtered course code datalist:', totalCourses, 'courses');
        }

        // Filter course title datalist
        const courseTitleList = document.getElementById('courseTitleList');
        if (courseTitleList) {
            courseTitleList.innerHTML = ''; // Clear existing options

            // Sort and filter departments
            const sortedDepts = [...coursesData].sort((a, b) =>
                a.department.localeCompare(b.department)
            );

            sortedDepts.forEach(dept => {
                // If a department is selected, only show courses from that department
                if (selectedDepartmentCode && dept.departmentCode !== selectedDepartmentCode) {
                    return; // Skip this department
                }

                if (dept.courses && Array.isArray(dept.courses)) {
                    dept.courses.forEach(course => {
                        const option = document.createElement('option');
                        option.value = course.title;
                        option.textContent = `${course.title} - ${course.code} (${dept.department})`;
                        courseTitleList.appendChild(option);
                    });
                }
            });

            const totalCourses = courseTitleList.querySelectorAll('option').length;
            console.log('Filtered course title datalist:', totalCourses, 'courses');
        }
    }

    // Filter teacher name datalist
    if (facultyData && Array.isArray(facultyData)) {
        const teacherNameList = document.getElementById('teacherNameList');
        if (teacherNameList) {
            teacherNameList.innerHTML = ''; // Clear existing options

            // Sort and filter departments
            const sortedDepts = [...facultyData].sort((a, b) =>
                a.department.localeCompare(b.department)
            );

            sortedDepts.forEach(dept => {
                // If a department is selected, only show faculty from that department
                if (selectedDepartmentCode && dept.departmentCode !== selectedDepartmentCode) {
                    return; // Skip this department
                }

                if (dept.faculty && Array.isArray(dept.faculty)) {
                    dept.faculty.forEach(faculty => {
                        const option = document.createElement('option');
                        option.value = faculty.name;

                        // Build text content with optional designation
                        if (faculty.designation) {
                            option.textContent = `${faculty.name} - ${faculty.designation} (${dept.department})`;
                        } else {
                            option.textContent = `${faculty.name} (${dept.department})`;
                        }

                        teacherNameList.appendChild(option);
                    });
                }
            });

            const totalFaculty = teacherNameList.querySelectorAll('option').length;
            console.log('Filtered teacher name datalist:', totalFaculty, 'faculty members');
        }
    }
}

// Setup department change listener to filter datalists
function setupDepartmentFilter() {
    const departmentSelect = document.getElementById('department');

    if (departmentSelect) {
        departmentSelect.addEventListener('change', () => {
            const selectedDepartment = departmentSelect.value;

            // Filter datalists based on selected department
            // If no department is selected (empty string), show all options
            filterDataListsByDepartment(selectedDepartment || null);
        });

        console.log('Department filter listener set up');
    }
}


function addInputListeners() {

    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', updateContent);
    });
}

function updateContent() {
    const fields = [
        'courseTitle', 'courseCode', 'submissionDate',
        'teacherName', 'studentName', 'studentId', 'section'
    ];

    fields.forEach(field => {
        const value = document.getElementById(field).value;
        document.getElementById(field + 'Text').textContent = value;
    });

    // Handle title name separately - make only "Title:" bold
    const titleName = document.getElementById('titleName').value;
    document.getElementById('titleNameText').innerHTML = titleName ? '<strong>Title:</strong> ' + titleName : '';

    const submissionDate = document.getElementById('submissionDate').value;
    const formattedDate = submissionDate ? formatDate(submissionDate) : '';
    document.getElementById('submissionDateText').textContent = formattedDate;

    const coverType = document.getElementById('coverType').value;
    document.getElementById('coverTypeText').textContent = coverType;

    const teacherDesignation = document.getElementById('teacherDesignation').value;
    // Add comma after designation if it exists
    document.getElementById('teacherDesignationText').textContent = teacherDesignation ? teacherDesignation + ',' : '';

    const departmentSelect = document.getElementById('department');
    const selectedDepartment = departmentSelect.options[departmentSelect.selectedIndex].text;
    document.querySelector('#departmentText span').textContent = 'Department of ' + selectedDepartment;
    const departmentAbbreviations = {
        computer_science: "CSE",
        civil_engineering: "CE",
        electrical_engineering: "EEE",
        architecture: "Arch",
        business_administration: "BBA",
        economics: "ECO",
        bangla: "BNG",
        english: "ELL",
        journalism: "JMC",
        law: "LLB"
    };

    const teacherDepartmentSelect = document.getElementById('teacherDepartment');
    // const departmentAbbreviation = departmentAbbreviations[departmentSelect.value] || departmentAbbreviations[teacherDepartmentSelect.value] || "N/A";
    let departmentAbbreviation;
    if (teacherDepartmentSelect.value !== "") {
        departmentAbbreviation = departmentAbbreviations[teacherDepartmentSelect.value];
    } else if (departmentSelect.value !== "") {
        departmentAbbreviation = departmentAbbreviations[departmentSelect.value];
    } else {
        departmentAbbreviation = "N/A";
    }
    document.getElementById('departmentAbbreviationText').textContent = departmentAbbreviation;
}

function formatDate(inputDate) {
    const date = new Date(inputDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}


function areAllFieldsFilled() {
    const requiredFields = [
        'courseTitle', 'courseCode', 'coverType', 'submissionDate',
        'teacherName', 'teacherDesignation', 'studentName', 'studentId', 'section'
    ];

    for (let field of requiredFields) {
        const value = document.getElementById(field).value.trim();
        if (!value) {
            return false;
        }
    }

    const departmentValue = document.getElementById('department').value;
    if (departmentValue === "") {
        return false;
    }

    return true;
}


document.getElementById('download').addEventListener('click', () => {
    if (!areAllFieldsFilled()) {
        showNotification('Please fill in all input fields before downloading the PDF.');
        return;
    }

    // Save student data to localStorage before attempting PDF generation
    // This ensures data is saved even if PDF generation fails
    saveStudentData();

    const element = document.getElementById('content');
    let coverPageName;
    if (document.getElementById('coverpagename').value !== "") {
        coverPageName = document.getElementById('coverpagename').value;
    } else {
        coverPageName = document.getElementById('studentName').value;
    }
    var sanitizedFileName = coverPageName.replace(/\s+/g, '_');
    if (!element) {
        console.error("Content element not found");
        alert("Error: Content element not found");
        return;
    }
    if (typeof jspdf === 'undefined') {
        console.error("jsPDF library not loaded");
        alert("Error: PDF library not loaded");
        return;
    }
    try {
        const doc = new jspdf.jsPDF({
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait',
            compress: true,
            precision: 16
        });
        const scale = 6;
        const width = doc.internal.pageSize.getWidth();
        const height = doc.internal.pageSize.getHeight();
        html2canvas(element, {
            scale: scale,
            logging: false,
            useCORS: true,
            letterRendering: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            imageTimeout: 0,
            removeContainer: true,
            width: element.offsetWidth,
            height: element.offsetHeight,
            windowWidth: element.offsetWidth,
            windowHeight: element.offsetHeight
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            // Add image with exact dimensions to prevent border artifacts
            doc.addImage(imgData, 'JPEG', 0, 0, width, height, undefined, 'SLOW');
            doc.save(`${sanitizedFileName}.pdf`);
        }).catch(err => {
            console.error("Error in html2canvas:", err);
            alert("Error creating PDF. Please check console for details.");
        });
    } catch (err) {
        console.error("Error creating PDF:", err);
        alert("Error creating PDF. Please check console for details.");
    }
});

document.querySelectorAll('.demo-input').forEach(input => {
    input.addEventListener('focus', function () {
        this.setAttribute('placeholder', this.dataset.demo);
    });

    input.addEventListener('blur', function () {
        this.setAttribute('placeholder', '');
    });
});

function generateShareableLink() {
    const inputs = document.querySelectorAll('.input-section input, .input-section select');
    const data = {};
    inputs.forEach(input => {
        data[input.id] = input.value;
    });

    const logoSelect = document.getElementById('logoSelect');
    data.logoSelection = Array.from(logoSelect.selectedOptions).map(option => option.value);

    const encodedData = encodeURIComponent(JSON.stringify(data));
    return `${window.location.origin}${window.location.pathname}?data=${encodedData}`;
}


function shareLink() {
    const shareableLink = generateShareableLink();

    if (navigator.share) {
        navigator.share({
            title: 'Cover Page Generator Data',
            text: 'Check out my cover page data!',
            url: shareableLink,
        })
            .then(() => console.log('Successful share'))
            .catch((error) => console.log('Error sharing', error));
    } else {
        prompt('Copy this link to share:', shareableLink);
    }
}


function loadSharedData() {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('data');

    if (sharedData) {
        try {
            const data = JSON.parse(decodeURIComponent(sharedData));
            Object.keys(data).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    if (key === 'logoSelect') {
                        const logoSelect = document.getElementById('logoSelect');
                        data.logoSelection.forEach(logo => {
                            const option = logoSelect.querySelector(`option[value="${logo}"]`);
                            if (option) {
                                option.selected = true;
                            }
                        });
                        logoSelect.dispatchEvent(new Event('change'));
                    } else {
                        element.value = data[key];
                        element.dispatchEvent(new Event('input'));
                    }
                }
            });
        } catch (error) {
            console.error('Error loading shared data:', error);
        }
    }
}

document.getElementById('shareButton').addEventListener('click', async () => await shareLink());

// Function to set the current date as the default submission date
function setCurrentDate() {
    const submissionDateInput = document.getElementById('submissionDate');

    // Always set today's date as the default
    // This will be overridden if there's shared data from a URL
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    submissionDateInput.value = formattedDate;
    submissionDateInput.dispatchEvent(new Event('input'));

    console.log('Set current date:', formattedDate);
}

document.addEventListener('DOMContentLoaded', () => {
    // Populate datalists for autocomplete
    populateDataLists();

    // Setup autofill functionality
    setupCourseCodeAutofill();
    setupCourseTitleAutofill();
    setupTeacherNameAutofill();
    setupStudentNameAutofill();
    setupStudentIdAutofill();

    // Setup department-based filtering
    setupDepartmentFilter();

    // Existing initialization
    addInputListeners();
    updateContent();

    // Set current date as default submission date BEFORE loading shared data
    // This ensures the date is always set by default, but can be overridden by shared URLs
    setCurrentDate();

    // Load shared data from URL (this can override the default date if present in URL)
    loadSharedData();
    handleLogoSelection();

    // Load saved student data from localStorage
    loadStudentData();
});

async function shortenUrl(longUrl) {
    try {
        const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.text();
    } catch (error) {
        console.error('Error shortening URL:', error);
        return longUrl;
    }
}

async function shareLink() {
    const shareableLink = generateShareableLink();
    const shortLink = await shortenUrl(shareableLink);

    const modal = document.getElementById('shareModal');
    const span = document.getElementsByClassName("close")[0];

    modal.style.display = "block";

    span.onclick = function () {
        modal.style.display = "none";
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    document.getElementById('copyLink').onclick = function () {
        navigator.clipboard.writeText(shortLink).then(() => {
            showNotification('Short link copied to clipboard!');
        });
    }

    document.getElementById('shareMail').onclick = function () {
        const subject = encodeURIComponent("Cover Page Generator Data");
        const body = encodeURIComponent(`Check out my cover page data through the following link: ${shortLink}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }

    document.getElementById('shareMailNubtk').onclick = function () {
        const recipient = "haquenubtk@gmail.com";
        const subject = encodeURIComponent("Cover Page Generator Data");
        const body = encodeURIComponent(`Check out my cover page data through the following link: ${shortLink}`);
        window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
    }
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}


function displayReadmeContent() {
    fetch('README.md')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            const htmlContent = marked.parse(data);

            var modal = document.getElementById('readmeModal');
            var readmeContent = document.getElementById('readmeContent');
            var span = document.getElementsByClassName("close")[0];

            readmeContent.innerHTML = htmlContent;
            modal.style.display = "block";

            span.onclick = function () {
                modal.style.display = "none";
            }


            window.onclick = function (event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error: ' + error.message);
        });
}


document.addEventListener('DOMContentLoaded', function () {
    var userGuideButton = document.getElementById('userGuideButton');
    if (userGuideButton) {
        userGuideButton.addEventListener('click', displayReadmeContent);
    }


    var closeButton = document.querySelector('#readmeModal .close');
    if (closeButton) {
        closeButton.addEventListener('click', function () {
            document.getElementById('readmeModal').style.display = "none";
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const logoSelect = document.getElementById('logoSelect');
    const logoContainer = document.getElementById('logoContainer');

    logoSelect.addEventListener('change', handleLogoSelection);

    function handleLogoSelection() {
        const logoContainer = document.getElementById('logoContainer');
        logoContainer.innerHTML = '';

        let showHeading = true;

        Array.from(logoSelect.selectedOptions).forEach(option => {
            const width = option.dataset.width || 250;
            const height = option.dataset.height || 250;
            addLogoToContent(option.value, option.text, width, height);

            if (option.value === 'image/Nubtklogo5xx.png' || option.value === 'image/Nubtklogo6xx.png' || option.value === 'image/Nubtklogo7xx.png' || option.value === 'image/Nubtklogo8xx.png') {
                showHeading = false;
            }

            // Auto-select department if logo has a data-department attribute
            if (option.dataset.department) {
                const departmentSelect = document.getElementById('department');
                departmentSelect.value = option.dataset.department;
                departmentSelect.dispatchEvent(new Event('change'));
                console.log('Auto-selected department:', option.dataset.department);
            }
        });

        const heading = document.querySelector('#content h1');
        if (heading) {
            heading.style.display = showHeading ? 'block' : 'none';
        }
    }

    function addLogoToContent(src, alt, width, height) {
        const logo = document.createElement('div');
        logo.className = 'logo';
        logo.style.width = `${width}px`;
        logo.style.height = `${height}px`;
        logo.innerHTML = `<img src="${src}" alt="${alt}">`;
        logoContainer.appendChild(logo);
    }

    addLogoToContent('image/Nubtklogo1xx.png', 'NUBTK Logo: 1');

    addInputListeners();
    updateContent();
    loadSharedData();
});


document.addEventListener('DOMContentLoaded', () => {
    const generateQRCodeBtn = document.getElementById('generateQRCode');
    const qrCodeModal = document.getElementById('qrCodeModal');
    const closeQRCodeModal = qrCodeModal.querySelector('.close');
    const downloadQRCodeBtn = document.getElementById('downloadQRCode');

    generateQRCodeBtn.addEventListener('click', generateAndShowQRCode);
    closeQRCodeModal.addEventListener('click', () => qrCodeModal.style.display = 'none');
    downloadQRCodeBtn.addEventListener('click', downloadQRCode);

    window.addEventListener('click', (event) => {
        if (event.target === qrCodeModal) {
            qrCodeModal.style.display = 'none';
        }
    });
});

async function generateAndShowQRCode() {
    const coversite = "https://qknot.github.io/NUBTK-Cover-Page-Generator/?data=%7B%22logoSelect%22%3A%22image%2FNubtklogo1xx.png%22%2C%22coverpagename%22%3A%22%22%2C%22department%22%3A%22%22%2C%22courseTitle%22%3A%22%22%2C%22courseCode%22%3A%22%22%2C%22coverType%22%3A%22%22%2C%22titleName%22%3A%22%22%2C%22teacherName%22%3A%22%22%2C%22teacherDesignation%22%3A%22%22%2C%22teacherDepartment%22%3A%22%22%2C%22studentName%22%3A%22%22%2C%22studentId%22%3A%22%22%2C%22section%22%3A%22%22%2C%22submissionDate%22%3A%222025-11-21%22%2C%22logoSelection%22%3A%5B%22image%2FNubtklogo1xx.png%22%5D%7D";
    const shareableLink = generateShareableLink();
    let shortLink;
    if (coversite !== shareableLink) {
        shortLink = await shortenUrl(shareableLink);
    } else {
        shortLink = "https://qknot.github.io/NUBTK-Cover-Page-Generator/";
    }
    const qr = qrcode(0, 'M');
    qr.addData(shortLink);
    qr.make();

    const qrCodeElement = document.getElementById('qrcode');
    qrCodeElement.innerHTML = qr.createImgTag(5);

    document.getElementById('qrCodeModal').style.display = 'block';
}

function downloadQRCode() {
    const qrCodeImg = document.querySelector('#qrcode img');
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = qrCodeImg.src;
    link.click();
}


document.addEventListener('DOMContentLoaded', () => {
    const scanQRCodeBtn = document.getElementById('scanQRCode');
    const qrScannerModal = document.getElementById('qrScannerModal');
    const closeBtn = qrScannerModal.querySelector('.close');
    const cancelBtn = document.getElementById('cancelScan');

    scanQRCodeBtn.addEventListener('click', startQRScanner);
    closeBtn.onclick = closeScanner;
    cancelBtn.onclick = closeScanner;

    window.onclick = (event) => {
        if (event.target === qrScannerModal) {
            closeScanner();
        }
    };
});

const html5QrCode = new Html5Qrcode("reader");

function startQRScanner() {
    const qrScannerModal = document.getElementById('qrScannerModal');
    qrScannerModal.style.display = 'block';

    html5QrCode.start(
        { facingMode: "environment" },
        {
            fps: 10,
            qrbox: { width: 250, height: 250 }
        },
        onScanSuccess,
        onScanFailure
    ).catch((err) => {
        console.error(`Unable to start scanning: ${err}`);
        showNotification('Unable to start the QR scanner. Please check your camera permissions.');
    });
}

function closeScanner() {
    const qrScannerModal = document.getElementById('qrScannerModal');
    qrScannerModal.style.display = 'none';
    html5QrCode.stop().catch(err => console.error(err));
}

async function onScanSuccess(decodedText, decodedResult) {
    closeScanner();

    try {
        const response = await fetch(decodedText, { method: 'HEAD', redirect: 'follow' });
        const fullUrl = response.url;

        const urlParams = new URLSearchParams(new URL(fullUrl).search);
        const encodedData = urlParams.get('data');

        if (encodedData) {
            const data = JSON.parse(decodeURIComponent(encodedData));
            populateFormFields(data);
            showNotification('Form fields have been populated from the QR code.');
        } else {
            throw new Error('No data found in the URL');
        }
    } catch (error) {
        console.error('Error parsing QR code data:', error);
        showNotification('Error parsing QR code data. Please try again.');
    }
}

function onScanFailure(error) {

    console.warn(`QR code scanning failed: ${error}`);
}

function populateFormFields(data) {
    Object.keys(data).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            if (key === 'logoSelect') {
                const logoSelect = document.getElementById('logoSelect');
                data.logoSelection.forEach(logo => {
                    const option = logoSelect.querySelector(`option[value="${logo}"]`);
                    if (option) {
                        option.selected = true;
                    }
                });
                logoSelect.dispatchEvent(new Event('change'));
            } else {
                element.value = data[key];
                element.dispatchEvent(new Event('input'));
            }
        }
    });


    updateContent();
    handleLogoSelection();
}

document.addEventListener('DOMContentLoaded', () => {
    const editTab = document.getElementById('editTab');
    const previewTab = document.getElementById('previewTab');
    const inputSection = document.getElementById('inputSection');
    const outputSection = document.getElementById('outputSection');

    function switchTab(tab) {
        if (tab === 'edit') {
            editTab.classList.add('active');
            previewTab.classList.remove('active');
            inputSection.classList.remove('hidden');
            outputSection.classList.add('hidden');
        } else {
            previewTab.classList.add('active');
            editTab.classList.remove('active');
            outputSection.classList.remove('hidden');
            inputSection.classList.add('hidden');
            // Update content when switching to preview to ensure latest data
            updateContent();
        }
    }

    editTab.addEventListener('click', () => switchTab('edit'));
    previewTab.addEventListener('click', () => switchTab('preview'));

    // Show preview by default on page load
    switchTab('preview');
});

// Logo Preview Modal functionality
document.addEventListener('DOMContentLoaded', () => {
    const previewLogoBtn = document.getElementById('previewLogoBtn');
    const logoPreviewModal = document.getElementById('logoPreviewModal');
    const previewLogoImage = document.getElementById('previewLogoImage');
    const logoSelect = document.getElementById('logoSelect');
    const closeBtn = logoPreviewModal.querySelector('.close');

    // Open modal when preview button is clicked
    previewLogoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedLogo = logoSelect.value;

        if (selectedLogo) {
            previewLogoImage.src = selectedLogo;
            logoPreviewModal.style.display = 'block';
        } else {
            showNotification('Please select a logo first');
        }
    });

    // Close modal when X is clicked
    closeBtn.addEventListener('click', () => {
        logoPreviewModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === logoPreviewModal) {
            logoPreviewModal.style.display = 'none';
        }
    });

    // Update preview image when logo selection changes
    logoSelect.addEventListener('change', () => {
        if (logoPreviewModal.style.display === 'block') {
            previewLogoImage.src = logoSelect.value;
        }
    });
});