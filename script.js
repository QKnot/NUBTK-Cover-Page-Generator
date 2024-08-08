function updateContent() {
    const fields = [
        'courseTitle', 'courseCode', 'titleName', 'submissionDate',
        'teacherName', 'teacherDesignation', 'studentName', 'studentId', 'section', 'session'
    ];
    
    fields.forEach(field => {
        const value = document.getElementById(field).value;
        document.getElementById(field + 'Text').textContent = value;
    });

    const coverType = document.getElementById('coverType').value;
    document.getElementById('coverTypeText').textContent = coverType;

    const departmentSelect = document.getElementById('department');
    const selectedDepartment = departmentSelect.options[departmentSelect.selectedIndex].text;
    document.getElementById('departmentText').textContent = `Department of ${selectedDepartment}`;

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

function fillDemoData() {
    document.querySelectorAll('.demo-input').forEach(input => {
        input.value = input.dataset.demo;
    });
    updateContent();
}

document.getElementById('updateContent').addEventListener('click', updateContent);
document.getElementById('fillDemo').addEventListener('click', fillDemoData);

document.getElementById('download').addEventListener('click', () => {
    const element = document.getElementById('content');
    var coverPageName = document.getElementById('coverpagename').value;
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
            compress: true
        });
        const scale = 2.5;  
        const width = doc.internal.pageSize.getWidth();
        const height = doc.internal.pageSize.getHeight();
        html2canvas(element, {
            scale: scale,
            logging: false,
            useCORS: true,
            letterRendering: true,  
            allowTaint: true,  
            backgroundColor: null  
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/jpeg', 0.8); 
            doc.addImage(imgData, 'JPEG', 0, 0, width, height);
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
    input.addEventListener('focus', function() {
        this.setAttribute('placeholder', this.dataset.demo);
    });

    input.addEventListener('blur', function() {
        this.setAttribute('placeholder', '');
    });
});

updateContent();