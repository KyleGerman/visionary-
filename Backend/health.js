// handling all health and prescription stuff
const express = require('express');
const db = require('./connect_db');
const sax = require('sax');

const BASE_URL = 'https://dailymed.nlm.nih.gov/dailymed/services/v2';

// insert new prescription entry: needs {patient_id, provider_id, ndc, start_date, dosage, reason} in body NOTE: FIX THIS
exports.prescribe = async (req, res) => {
    const { patient_id, provider_id, ndc, start_date, dosage, reason } = req.body;
    
    // verifies that input ndc matches an existing ndc
        // optimization - make 1 local database with ALL current ndc values and index, then check using that and API call only if not found?

    try {
        const response = await fetch(`${BASE_URL}/ndc/${ndc}.json`);
    
        if (!response.ok) {
            if (response.status === 404) {
                // NDC does not exist
                return res.json({ exists: false });
            } else {
                // Other errors
                return res.status(500).json({ error: 'Unexpected error from DailyMed' });
            };
        };

    } catch (err) {
        // Network or fetch error
        return res.status(500).json({ error: 'Failed to fetch DailyMed API' });
    };

    // insert command once ndc confirmed
    const new_prescription = 'INSERT INTO prescriptions (patient_id, provider_id, ndc, start_date, dosage, reason) VALUES (?, ?, ?, ?, ?, ?, ?)';

    db.query(new_prescription, [patient_id, provider_id, ndc, start_date, dosage, reason], (err) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        // Insert success
        res.status(201).json({ message: 'Insert successful' });

    });    
};

// retrieve full health list, returns a JSON oject w/ patientId, medHistory, and a nested JSON prescriptions object
exports.loadHealth = async (req, res) => {
    const userId = res.user_id;
    
   db.query(
    `SELECT JSON_OBJECT(
        'patientId', p.patient_id,
        'medHistory', p.med_history,
        'prescriptions', IFNULL(
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'prescriptionId', pr.id,
                        'medName', pr.medication_name,
                        'providerId', pr.provider_id,
                        'ndc', pr.ndc,
                        'dosage', pr.dosage,
                        'dateStart', pr.date_started,
                        'reason', pr.reason
                    )
                )
                FROM prescriptions pr
                WHERE pr.patient_id = p.patient_id
            ),
            JSON_ARRAY()
        )
    ) AS result
    FROM patients p
    WHERE p.user_id = ?;`,
    [userId],
    (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (!results.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        try {
            const health = (results[0].result);
            res.json(health);
        } catch (parseErr) {
            console.error(parseErr);
            res.status(500).json({ error: 'Failed to send' });
        }
    }
)};

// retrieve full medication information. Input ndc {ndc: 'ndc'}, output is json w/ html (medicationHtml)
exports.medInfo = async (req, res) => {
    const { ndc } = req.body;

    try {
        // retrieve setID using req NDC (10 digit WITH HYPHENS)
        console.log("Calling API for setid...");
        const ndc_response = await fetch(`${BASE_URL}/spls.json?ndc=${ndc}`);
        
        // extract SetID 
        const ndc_json = await ndc_response.json();
        const setid = ndc_json.data[0].setid;
        console.log("setid retrieved");
        
        // request SPL using setid
        console.log("Calling API for SPL...");
        const spl_response = await fetch(`${BASE_URL}/spls/${setid}.xml`);

        // Log status
        console.log("HTTPS status:", spl_response.status);

        const xmlText = await spl_response.text();
        console.log("XML retrieved")

        // stream XML, extract relevant data
        const patient_label_codes = ['59845-8', '42231-1', '42230-3'];

        const parser = sax.parser(true, { trim: true, normalize: true }); 

        let currentSection = null;
        let sectionDepth = 0;
        const sections = [];
        const tagStack = []; // stack for currently open HTML tags

        // Map XML tags + styleCodes to proper HTML
        function convertTagToHtml(tagName, attrs = {}) {
            switch (tagName.toLowerCase()) {
                case 'paragraph': return 'p';
                case 'content':
                    switch ((attrs.styleCode || '').toLowerCase()) {
                        case 'bold': return 'strong';
                        case 'italic': return 'em';
                        case 'underline': return 'u';
                        case 'monospace': return 'code';
                        case 'superscript': return 'sup';
                        case 'subscript': return 'sub';
                        case 'strikethrough': return 'del';
                        case 'highlight': return 'mark';
                        default: return 'span';
                    }
                case 'list':
                    if ((attrs.listType || '').toLowerCase() === 'ordered' || attrs.listType === 'arabic') return 'ol';
                    return 'ul';
                case 'item': return 'li';
                case 'sup': return 'sup';
                case 'sub': return 'sub';
                case 'table': return 'table';
                case 'tr': return 'tr';
                case 'td': return 'td';
                default: return tagName; // fallback for unknown tags
            }
        }

        parser.onopentag = (node) => {
            if (node.name === 'section') {
                currentSection = { code: null, html: '' };
                sectionDepth = 1;
            } else if (currentSection) {
                sectionDepth++;

                // convert XML tag to HTML
                const htmlTag = convertTagToHtml(node.name, node.attributes);
                currentSection.html += `<${htmlTag}>`;
                tagStack.push(htmlTag); // push onto stack for proper closing

                // capture section code
                if (node.name === 'code' && node.attributes?.code) {
                    currentSection.code = node.attributes.code;
                }
            }
        };

        parser.ontext = (text) => {
            if (currentSection && text.trim()) {
                currentSection.html += text;
            }
        };

        parser.oncdata = (cdata) => {
            if (currentSection && cdata.trim()) {
                currentSection.html += cdata;
            }
        };

        parser.onclosetag = (tagName) => {
            if (currentSection) {
                const htmlTag = tagStack.pop() || convertTagToHtml(tagName); // close correct tag
                currentSection.html += `</${htmlTag}>`;

                sectionDepth--;

                if (sectionDepth === 0) {
                    // Only keep sections matching patient_label_codes
                    if (patient_label_codes.includes(currentSection.code)) {
                        sections.push(currentSection);
                    }
                    currentSection = null;
                }
            }
        };

        parser.write(xmlText).close();
        res.json({ medicationHtml: sections });

    }   catch (err) {
        console.error("Error:", err.message);
        return res.status(500).json({ error: 'Internal server error'});
    }
};


// delete prescription entry
