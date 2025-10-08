/**
 * CSV/Excel Parser Utility
 * Parses contact list files (CSV, XLSX, XLS) for voice campaigns
 */

import Papa from "papaparse";
import * as XLSX from "xlsx";

export interface ParsedContactData {
  headers: string[];
  rows: Record<string, any>[];
  totalRows: number;
  errors: string[];
}

/**
 * Parse CSV file
 */
export async function parseCSV(file: File): Promise<ParsedContactData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, any>[];
        const errors = results.errors.map((err) => err.message);
        
        resolve({
          headers,
          rows,
          totalRows: rows.length,
          errors,
        });
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}

/**
 * Parse Excel file (XLSX or XLS)
 */
export async function parseExcel(file: File): Promise<ParsedContactData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error("Failed to read file"));
          return;
        }
        
        const workbook = XLSX.read(data, { type: "binary" });
        
        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (jsonData.length === 0) {
          reject(new Error("Empty spreadsheet"));
          return;
        }
        
        // First row is headers
        const headers = jsonData[0].map((h) => String(h || "").trim()).filter(Boolean);
        
        // Remaining rows are data
        const rows: Record<string, any>[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length === 0) continue;
          
          const rowData: Record<string, any> = {};
          headers.forEach((header, index) => {
            rowData[header] = row[index] !== undefined ? row[index] : "";
          });
          
          // Only include rows that have at least one non-empty value
          if (Object.values(rowData).some((val) => val !== "")) {
            rows.push(rowData);
          }
        }
        
        resolve({
          headers,
          rows,
          totalRows: rows.length,
          errors: [],
        });
      } catch (error) {
        reject(new Error(`Excel parsing failed: ${error}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("File reading failed"));
    };
    
    reader.readAsBinaryString(file);
  });
}

/**
 * Auto-detect file type and parse accordingly
 */
export async function parseContactFile(file: File): Promise<ParsedContactData> {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith(".csv")) {
    return parseCSV(file);
  } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
    return parseExcel(file);
  } else {
    throw new Error("Unsupported file type. Please upload CSV, XLSX, or XLS file.");
  }
}

/**
 * Smart column mapping suggestions
 * Analyzes column names and suggests mappings to standard fields
 */
export function suggestColumnMapping(headers: string[]): Record<string, string | null> {
  const mapping: Record<string, string | null> = {
    phone: null,
    firstName: null,
    lastName: null,
    email: null,
    company: null,
  };
  
  // Normalize headers for comparison
  const normalizeHeader = (header: string) => header.toLowerCase().replace(/[^a-z0-9]/g, "");
  
  headers.forEach((header) => {
    const normalized = normalizeHeader(header);
    
    // Phone number patterns
    if (
      normalized.includes("phone") ||
      normalized.includes("mobile") ||
      normalized.includes("cell") ||
      normalized.includes("number") ||
      normalized === "tel"
    ) {
      if (!mapping.phone) mapping.phone = header;
    }
    
    // First name patterns
    else if (
      normalized.includes("firstname") ||
      normalized.includes("first") ||
      normalized === "fname"
    ) {
      mapping.firstName = header;
    }
    
    // Last name patterns
    else if (
      normalized.includes("lastname") ||
      normalized.includes("last") ||
      normalized === "lname" ||
      normalized === "surname"
    ) {
      mapping.lastName = header;
    }
    
    // Email patterns
    else if (normalized.includes("email") || normalized.includes("mail")) {
      if (!mapping.email) mapping.email = header;
    }
    
    // Company patterns
    else if (
      normalized.includes("company") ||
      normalized.includes("organization") ||
      normalized.includes("business")
    ) {
      if (!mapping.company) mapping.company = header;
    }
  });
  
  return mapping;
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false;
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");
  
  // Must be 10 digits or 11 digits starting with 1
  return digits.length === 10 || (digits.length === 11 && digits.startsWith("1"));
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate and clean contact data
 */
export interface ValidationResult {
  valid: Record<string, any>[];
  invalid: Array<{ row: Record<string, any>; errors: string[] }>;
  duplicates: Record<string, any>[];
}

export function validateContactData(
  rows: Record<string, any>[],
  columnMapping: Record<string, string | null>
): ValidationResult {
  const result: ValidationResult = {
    valid: [],
    invalid: [],
    duplicates: [],
  };
  
  const phoneNumbersSeen = new Set<string>();
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const errors: string[] = [];
    
    // Get mapped values
    const phoneColumn = columnMapping.phone;
    const phone = phoneColumn ? String(row[phoneColumn] || "").trim() : "";
    
    // Validate phone number (required)
    if (!phone) {
      errors.push("Missing phone number");
    } else if (!isValidPhoneNumber(phone)) {
      errors.push("Invalid phone number format");
    } else {
      // Check for duplicates
      const normalizedPhone = phone.replace(/\D/g, "");
      if (phoneNumbersSeen.has(normalizedPhone)) {
        result.duplicates.push(row);
        continue;
      }
      phoneNumbersSeen.add(normalizedPhone);
    }
    
    // Validate email (optional, but if present must be valid)
    const emailColumn = columnMapping.email;
    const email = emailColumn ? String(row[emailColumn] || "").trim() : "";
    if (email && !isValidEmail(email)) {
      errors.push("Invalid email format");
    }
    
    if (errors.length > 0) {
      result.invalid.push({ row, errors });
    } else {
      result.valid.push(row);
    }
  }
  
  return result;
}
