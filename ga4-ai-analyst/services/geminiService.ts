
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Ga4Data, SheetData, DocData } from '../types';

const API_KEY = process.env.API_KEY;
const MAX_DATA_LENGTH = 150000; // Character limit for stringified data

let ai: GoogleGenAI | null = null;

const getAiClient = (): GoogleGenAI => {
  if (!API_KEY) {
    console.error("CRITICAL: Gemini API Key (process.env.API_KEY) is not available.");
    throw new Error("API_KEY is not configured.");
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  }
  return ai;
};

interface AnalyzeJsonParams {
  mode: 'json';
  jsonData: Ga4Data;
  userQuestion: string;
}

interface AnalyzeGa4LiveParams {
  mode: 'ga4';
  userQuestion: string;
  ga4User: string | null;
}

interface AnalyzeSheetParams {
  mode: 'googleSheet';
  sheetData: SheetData;
  userQuestion: string;
  fileName?: string;
}

interface AnalyzeDocParams {
  mode: 'googleDoc';
  docData: DocData;
  userQuestion: string;
  fileName?: string;
}

export type AnalyzeParams = AnalyzeJsonParams | AnalyzeGa4LiveParams | AnalyzeSheetParams | AnalyzeDocParams;

const chartRequestInstructions = `
If the user's query implies a request for a visual representation of data (e.g., 'show me a chart of...', 'visualize...', 'graph of...') OR if the data being discussed is inherently suitable for a simple chart (like bar, line, pie), you MUST attempt to include a JSON object in your response formatted for Chart.js.
This JSON object MUST be the *only* content between the markers '// GEMINI_CHART_DATA_START' and '// GEMINI_CHART_DATA_END'. No other text, explanations, or markdown should be within these markers.
The JSON structure should be:
{
  "type": "bar", "data": { "labels": ["A", "B"], "datasets": [{ "label": "Data", "data": [10, 20] }] }, "options": { "plugins": { "title": { "display": true, "text": "Chart Title" } } }
}
Guidelines: Simplicity, Relevance, Concise Title. Use varied backgroundColors for pie/doughnut.
`;

const tableRequestInstructions = `
If the answer to the user's query is best represented as tabular data (e.g., a list of items with multiple attributes, raw data snippets, or if the user asks "show data for X"), you MAY include a JSON object for rendering a table.
This JSON object MUST be the *only* content between the markers '// GEMINI_TABLE_DATA_START' and '// GEMINI_TABLE_DATA_END'. No other text or markdown within.
The JSON structure MUST be: { "headers": ["H1", "H2"], "rows": [["R1C1", "R1C2"], ["R2C1", "R2C2"]] }
Keep tables concise, ideally 5-10 rows if showing a sample.
`;

const proactiveInsightInstructions = `
In addition to answering the user's direct question, if you identify any particularly interesting trends, anomalies, or actionable insights from the data that are relevant to the user's general context, please briefly mention 1-2 of these as "Proactive Insight:" or "Key Observation:". Keep this concise.
`;

export const analyzeGa4Data = async (params: AnalyzeParams): Promise<string> => {
  const client = getAiClient();
  let prompt: string;

  if (params.mode === 'json') {
    let dataContextString: string;
    try {
      dataContextString = JSON.stringify(params.jsonData, null, 2);
    } catch (e) {
      return "Error: The provided GA4 data could not be stringified. Please ensure it's valid JSON.";
    }
    if (dataContextString.length > MAX_DATA_LENGTH) { 
      dataContextString = dataContextString.substring(0, MAX_DATA_LENGTH) + "\n... (Data truncated due to size limit)";
    }
    prompt = `
You are an expert AI assistant specializing in analyzing Google Analytics 4 (GA4) data.
The user provided GA4 data in JSON format.
Your task is to answer the user's question based *solely* on this data.
If the answer isn't in the data, state that. Be concise.

${proactiveInsightInstructions}
${chartRequestInstructions}
${tableRequestInstructions}

Provided GA4 Data:
\`\`\`json
${dataContextString}
\`\`\`
User's Question: "${params.userQuestion}"

Based *only* on the provided GA4 Data, what is the answer? If relevant, provide Chart.js JSON and/or Table JSON according to the instructions.`;

  } else if (params.mode === 'googleSheet') {
    let sheetDataContextString: string;
    try {
      const dataForPrompt = params.sheetData.slice(0, 70); // Sample more rows for context, but stringify limit applies
      sheetDataContextString = JSON.stringify(dataForPrompt, null, 2); 
      if (sheetDataContextString.length > MAX_DATA_LENGTH) {
         sheetDataContextString = sheetDataContextString.substring(0, MAX_DATA_LENGTH) + "\n... (Sample data truncated due to size limit)";
      }
    } catch (e) {
      return "Error: The provided Google Sheet data could not be processed for the AI.";
    }
    const fileNameContext = params.fileName ? ` from the Google Sheet named "${params.fileName}"` : '';
    prompt = `
You are an expert AI assistant specializing in analyzing data from Google Sheets.
The user has provided data parsed from a Google Sheet${fileNameContext}. The data is an array of JSON objects.
Your task is to answer the user's question based *solely* on this provided sheet data.
If the answer cannot be found, state that. When referring to columns, use their header names.

${proactiveInsightInstructions}
${chartRequestInstructions}
${tableRequestInstructions}

Provided Google Sheet Data (sample or full data if small enough):
\`\`\`json
${sheetDataContextString}
\`\`\`
Number of rows in the full dataset: ${params.sheetData.length}
User's Question: "${params.userQuestion}"

Based *only* on the provided Google Sheet Data, what is the answer? If relevant, provide Chart.js JSON and/or Table JSON.
If the user asks to modify the sheet, acknowledge the request, state you cannot directly edit the sheet, but describe the changes you *would* make if you could.`;

  } else if (params.mode === 'googleDoc') {
    let docContent = params.docData;
    if (docContent.length > MAX_DATA_LENGTH) {
        docContent = docContent.substring(0, MAX_DATA_LENGTH) + "\n... (Document content truncated due to size limit)";
    }
    const fileNameContext = params.fileName ? ` from the Google Document named "${params.fileName}"` : '';
    prompt = `
You are an expert AI assistant specializing in analyzing textual content from Google Documents.
The user has provided text content from a Google Document${fileNameContext}.
Your task is to answer the user's question based *solely* on this provided document content.
This could involve summarization, extracting key information, answering specific questions about the text, etc.
If the answer cannot be found in the document, state that.

${proactiveInsightInstructions}
${tableRequestInstructions} 
(Note: Chart.js visualization is less likely for pure text documents unless the text describes data suitable for charting.)

Provided Google Document Content:
\`\`\`text
${docContent}
\`\`\`
Length of full document content: ${params.docData.length} characters.
User's Question: "${params.userQuestion}"

Based *only* on the provided Google Document Content, what is the answer? If relevant, provide Table JSON.`;

  } else if (params.mode === 'ga4') {
    prompt = `
You are an expert AI assistant specializing in Google Analytics 4 (GA4).
The user is 'connected' to their GA4 account (simulated connection for user: ${params.ga4User || 'Unknown User'}).
They asked: "${params.userQuestion}".

Acknowledge their question. Explain that in a real, fully integrated scenario, you would now formulate a query to the Google Analytics Data API, retrieve live data, and then provide an answer/visualization.
Since this is currently a *simulated connection phase*, you cannot fetch live data.
Briefly suggest 2-3 key metrics/dimensions you *would typically look for* in GA4 to answer their question.
If their question implies a visualization, describe the chart type and what data you'd plot.
${chartRequestInstructions}
(For simulated mode, if you generate chart JSON, base it on hypothetical data that answers the query, clearly indicating it's illustrative. Title it like "Illustrative Top Pages by Views".)
Keep this concise. Remind the user this is a simulated interaction.`;
  } else {
    return "Error: Invalid analysis mode specified.";
  }

  try {
    const response: GenerateContentResponse = await client.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
        config: { temperature: 0.3 }
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
      if (error.message.includes('API key not valid')) {
        return "Error: The Gemini API key is invalid or missing. Please check your configuration.";
      }
      if (error.message.includes('permission') || error.message.includes('quota')) {
        return "Error: API request failed due to permission or quota issues. Please check your Gemini API account.";
      }
      return `Error analyzing data with Gemini: ${error.message}.`;
    }
    return "An unknown error occurred while communicating with the Gemini API.";
  }
};

export const getSuggestedQuestions = async (dataSample: Ga4Data | SheetData | DocData | null, mode: 'json' | 'googleSheet' | 'googleDoc'): Promise<string[]> => {
  if (!dataSample) return [];
  const client = getAiClient();
  let context: string;
  let headers: string[] = [];

  if (mode === 'json') {
    if (Array.isArray(dataSample) && dataSample.length > 0 && typeof dataSample[0] === 'object') {
      headers = Object.keys(dataSample[0]);
    } else if (typeof dataSample === 'object' && dataSample !== null) {
      headers = Object.keys(dataSample);
    }
    context = `The data is GA4 JSON. Available top-level keys or keys from first array element include: ${headers.join(', ') || 'unknown structure'}.`;
  } else if (mode === 'googleSheet') {
    if (Array.isArray(dataSample) && dataSample.length > 0 && typeof dataSample[0] === 'object') {
      headers = Object.keys(dataSample[0]);
    }
    context = `The data is from a Google Sheet with columns: ${headers.join(', ') || 'unknown columns'}.`;
  } else { // googleDoc
    const docTextSample = typeof dataSample === 'string' ? dataSample.substring(0, 500) + (dataSample.length > 500 ? "..." : "") : "";
    context = `The data is text content from a Google Document. Here's a sample: "${docTextSample}". Suggest questions about this document's content.`;
  }

  if (mode !== 'googleDoc' && headers.length === 0) return []; 

  const prompt = `
Based on the following data structure or content sample, generate 3-4 concise and relevant questions a user might ask.
Return the questions as a JSON array of strings. Example: ["What are the top 5 items?", "Summarize this document."].
Do not include any other text or explanation outside the JSON array.

Data Context/Sample: ${context}

JSON array of suggested questions:
`;
  try {
    const response: GenerateContentResponse = await client.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: prompt,
      config: { temperature: 0.5, responseMimeType: "application/json" }
    });
    
    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.every(q => typeof q === 'string')) {
        return parsed.slice(0, 4); 
      }
      console.warn("Gemini suggested questions response not a valid string array:", parsed);
      return [];
    } catch (e) {
      console.error("Failed to parse suggested questions JSON:", e, "\nJSON string:", jsonStr);
      return [];
    }

  } catch (error) {
    console.error("Error getting suggested questions from Gemini:", error);
    return [];
  }
};