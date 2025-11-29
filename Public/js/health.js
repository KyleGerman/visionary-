window.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');

    // if no token or ndc recieved, return an error
    if (!token) {
        return console.error('No token found');
    };

    async function load() {
        
        const medHistCont = document.getElementById('medHistCont');
        const prescriptList = document.getElementById('prescriptList')
        
        medHistCont.innerHTML = 'Loading...';
        prescriptList.innerHTML = 'Loading...';
        
        try {
            const response = await fetch('/api/health', {
                headers: { authorization: 'Bearer ' + token } 
            });
           
            if (!response.ok) { medHistCont.innerHTML = 'Failed to load all'; return; }
            
            const healthData = await response.json();
            
            medHistCont.innerHTML = healthData.medHistory;
            if (!healthData.medHistory || healthData.medHistory.trim() === '') {
                medHistCont.innerHTML = '<p>No medical history found</p>';
                return;
            };

            let prescriptData = [];
            
            try {    // NOTE: prescriptions is already a JS array, NOT a JSON string
                prescriptData = healthData.prescriptions;
            } catch (err) {
                console.error("Invalid prescriptions JSON:", err);
            };
            
            prescriptList.innerHTML = '';

            prescriptData.forEach(item => {
                const box = document.createElement('div');
                box.classList.add('prescriptionBox');
                // NOTE: current string returns 'Provider ID'. Provider name would require an extra backend join in health.js
                box.innerHTML = `
                    <hr /><br>
                    <strong>${item.medName}</strong><br>
                    Dosage: ${item.dosage}<br>
                    <small>Prescribed for: ${item.reason}</small><br><br>
                    <small><i>Date Prescribed: ${item.dateStart}</i></small>
                    <br><br>`;

                box.addEventListener('click', () => {
                    drugLoad(item.ndc);
                });

                prescriptList.appendChild(box);
            });
        } catch (err) { 
            console.error(err); 
            medHistCont.innerHTML = 'Network error';
        };
    };

    load();
});

// Close when clicking outside the drugInfo window
const drugInfo = document.getElementById("drugInfo");
const backdrop = document.getElementById("drugInfoBackdrop");

backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) {
        backdrop.style.display = "none";
    }
});

// Load drugInfo window + populate
async function drugLoad(ndc) {
    drugInfo.innerHTML = "<p>Loading medication info...</p>";
    backdrop.style.display = 'flex';

    try {
        const response = await fetch('/api/medInfo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ndc: ndc})
        });

        if (!response.ok) throw new Error("Network error");

        const XML = await response.json();

        // Inject formatted HTML
        drugInfo.innerHTML = XML.medicationHtml[0].html;
    } catch (error) {
        drugInfo.innerHTML = "<p>Error loading medication info.</p>";
        console.error(error);
    };
};
