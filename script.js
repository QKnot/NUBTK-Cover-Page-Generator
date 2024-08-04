function updateContent() {
    const fields = [
        'courseTitle', 'courseCode', 'submissionDate',
        'teacherName', 'teacherDesignation', 'studentName', 'studentId',
        'year', 'semester', 'session'
    ];
    
    fields.forEach(field => {
        const value = document.getElementById(field).value;
        document.getElementById(field + 'Text').textContent = value;
    });

    const coverType = document.getElementById('coverType').value;
    document.getElementById('coverTypeText').textContent = coverType;

    // Update department
    const departmentSelect = document.getElementById('department');
    const selectedDepartment = departmentSelect.options[departmentSelect.selectedIndex].text;
    document.getElementById('departmentText').textContent = `Department of ${selectedDepartment}`;

    // Update department abbreviation
    const departmentAbbreviations = {
        computer_science: "CSE",
        civil_engineering: "CE",
        electrical_engineering: "EEE",
        architecture: "Arch.",
        business_administration: "BBA",
        economics: "Econ.",
        bangla: "Bangla",
        english: "English",
        journalism: "JMC"
    };
    const departmentAbbreviation = departmentAbbreviations[departmentSelect.value] || "N/A";
    document.getElementById('departmentAbbreviationText').textContent = departmentAbbreviation;
}

document.getElementById('updateContent').addEventListener('click', updateContent);

document.getElementById('download').addEventListener('click', () => {
    const element = document.getElementById('content');
    
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
            compress: true
        });
        const scale = 2.5;  // Increased for better text clarity
        const width = doc.internal.pageSize.getWidth();
        const height = doc.internal.pageSize.getHeight();
        html2canvas(element, {
            scale: scale,
            logging: false,
            useCORS: true,
            letterRendering: true,  // Improves text rendering
            allowTaint: true,  // Allows cross-origin images
            backgroundColor: null  // Transparent background
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/jpeg', 0.8);  // Increased quality, but still compressed
            doc.addImage(imgData, 'JPEG', 0, 0, width, height);
            doc.save('NUBTK_Cover_Page.pdf');
        }).catch(err => {
            console.error("Error in html2canvas:", err);
            alert("Error creating PDF. Please check console for details.");
        });
    } catch (err) {
        console.error("Error creating PDF:", err);
        alert("Error creating PDF. Please check console for details.");
    }
});


// Initial update
updateContent();
