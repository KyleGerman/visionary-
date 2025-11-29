const express = require('express');
const readline = require("readline");
const sax = require('sax');

const BASE_URL = 'https://dailymed.nlm.nih.gov/dailymed/services/v2';

// Helper functions
function formatAttributes(attrs) {
  if (!attrs) return '';
  return Object.entries(attrs)
    .map(([k, v]) => ` ${k}="${escapeHtml(v)}"`)
    .join('');
};

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Enter a test value: ", async (value) => {
    try {
        // retrieve setID using input NDC (10 digit WITH HYPHENS)
        console.log("Calling API for setid...");
        const ndc_response = await fetch(`${BASE_URL}/spls.json?ndc=${value}`);
        
        // Log status
        console.log("HTTP Status:", ndc_response.status);

        // Check content-type header
        const contentType_ndc = ndc_response.headers.get("content-type");
        console.log("Content-Type:", contentType_ndc);
        
        // extract SetID 
        const ndc_json = await ndc_response.json();
        const setid = ndc_json.data[0].setid;
        
        console.log(setid);

        // request SPL using setid
        console.log("Calling API for SPL...");
        const spl_response = await fetch(`${BASE_URL}/spls/${setid}.xml`);

        // Log status
        console.log("HTTPS status:", spl_response.status);

        // Check content header type (expect XML)
        const contentType_spl = spl_response.headers.get("content-type");
        console.log("Content-Type:", contentType_spl);

        const xmlText = await spl_response.text();

        // stream XML, extract relevant data
        const patient_label_codes = ['59845-8', '42231-1', '42230-3'];

        const parser = sax.parser(true); 
        let currentSection = null;
        let sectionDepth = 0;
        const sections = [];

        parser.onopentag = (node) => {
            if (node.name === 'section') {
                // Start of a section
                currentSection = {
                    code: null,
                    html: '',
                };
                sectionDepth = 1;
            } else if (currentSection) {
                // Increment depth for nested tags
                sectionDepth++;
                currentSection.html += `<${node.name}${formatAttributes(node.attributes)}>`;
                
                if (node.name === 'code' && node.attributes?.code) {
                    currentSection.code = node.attributes.code;
                }
            }
        };
        
        parser.ontext = (text) => {
            if (currentSection) {
                currentSection.html += escapeHtml(text);
            }
        };

        parser.oncdata = (cdata) => {
            if (currentSection) {
                currentSection.html += escapeHtml(cdata);
            }
        };

         parser.onclosetag = (tagName) => {
            if (currentSection) {
                currentSection.html += `</${tagName}>`;
                sectionDepth--;
                
                if (sectionDepth === 0) {
                    // Only keep sections matching the LOINC codes
                    if (patient_label_codes.includes(currentSection.code)) {
                        sections.push(currentSection);
                    }
                    currentSection = null;
                }
            }
        };

        parser.write(xmlText).close();
        console.log(sections);

    }   catch (err) {
        console.error("Error:", err.message);
    }
});