function addInputListeners() {
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', updateContent);
    });
}

function updateContent() {
    const fields = [
        'courseTitle', 'courseCode', 'titleName', 'submissionDate',
        'teacherName', 'studentName', 'studentId', 'section', 'session'
    ];
    
    fields.forEach(field => {
        const value = document.getElementById(field).value;
        document.getElementById(field + 'Text').textContent = value;
    });

    const submissionDate = document.getElementById('submissionDate').value;
    const formattedDate = submissionDate ? formatDate(submissionDate) : '';
    document.getElementById('submissionDateText').textContent = formattedDate;

    const coverType = document.getElementById('coverType').value;
    document.getElementById('coverTypeText').textContent = coverType;

    const teacherDesignation = document.getElementById('teacherDesignation').value;
    document.getElementById('teacherDesignationText').textContent = teacherDesignation;

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
        english: "ENG",                         
        journalism: "JMC",                      
        law: "LAW"                              
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
        'courseTitle', 'courseCode', 'coverType', 'titleName', 'submissionDate',
        'teacherName', 'teacherDesignation', 'studentName', 'studentId', 'section', 'session'
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

    const element = document.getElementById('content');
    let coverPageName;
    if(document.getElementById('coverpagename').value !== ""){
        coverPageName = document.getElementById('coverpagename').value;
    }else{
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


document.addEventListener('DOMContentLoaded', () => {
    addInputListeners();
    updateContent();
    loadSharedData(); 
    handleLogoSelection(); 
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

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    document.getElementById('copyLink').onclick = function() {
        navigator.clipboard.writeText(shortLink).then(() => {
          showNotification('Short link copied to clipboard!');
        });
    }

    document.getElementById('shareMail').onclick = function() {
        const subject = encodeURIComponent("Cover Page Generator Data");
        const body = encodeURIComponent(`Check out my cover page data through the following link: ${shortLink}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }

    document.getElementById('shareMailNubtk').onclick = function() {
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
            
            span.onclick = function() {
                modal.style.display = "none";
            }
            

            window.onclick = function(event) {
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


document.addEventListener('DOMContentLoaded', function() {
    var userGuideButton = document.getElementById('userGuideButton');
    if (userGuideButton) {
        userGuideButton.addEventListener('click', displayReadmeContent);
    }

   
    var closeButton = document.querySelector('#readmeModal .close');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
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
        
        Array.from(logoSelect.selectedOptions).forEach(option => {
            const width = option.dataset.width || 250;  
            const height = option.dataset.height || 250; 
            addLogoToContent(option.value, option.text, width, height);
        });
    
        if (logoContainer.children.length === 0) {
            addLogoToContent('image/Nubtklogo.jpg', 'NUBTK Logo', 250, 250);
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

    addLogoToContent('image/Nubtklogo.jpg', 'NUBTK Logo');

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
    const coversite = "http://127.0.0.1:5501/index.html?data=%7B%22logoSelect%22%3A%22image%2FNubtklogo.jpg%22%2C%22coverpagename%22%3A%22%22%2C%22department%22%3A%22%22%2C%22courseTitle%22%3A%22%22%2C%22courseCode%22%3A%22%22%2C%22coverType%22%3A%22%22%2C%22titleName%22%3A%22%22%2C%22teacherName%22%3A%22%22%2C%22teacherDesignation%22%3A%22%22%2C%22teacherDepartment%22%3A%22%22%2C%22studentName%22%3A%22%22%2C%22studentId%22%3A%22%22%2C%22section%22%3A%22%22%2C%22session%22%3A%22%22%2C%22submissionDate%22%3A%22%22%2C%22logoSelection%22%3A%5B%22image%2FNubtklogo.jpg%22%5D%7D";
    const shareableLink = generateShareableLink();
    let shortLink;
    if(coversite !== shareableLink){
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