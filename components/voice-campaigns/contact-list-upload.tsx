"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, Check, X, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { parseContactFile, suggestColumnMapping } from "@/lib/csv-parser";
import { processContactListAction } from "@/actions/campaign-contacts-actions";
import { toast } from "sonner";

interface ContactListUploadProps {
  campaignId: string;
  onUploadComplete?: (stats: any) => void;
}

const FIELD_OPTIONS = [
  { value: "phone", label: "Phone Number *", required: true },
  { value: "firstName", label: "First Name", required: false },
  { value: "lastName", label: "Last Name", required: false },
  { value: "email", label: "Email", required: false },
  { value: "company", label: "Company", required: false },
  { value: "ignore", label: "-- Ignore Column --", required: false },
];

export function ContactListUpload({ campaignId, onUploadComplete }: ContactListUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<{
    headers: string[];
    rows: Record<string, any>[];
    totalRows: number;
  } | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string | null>>({});
  const [uploadStats, setUploadStats] = useState<any>(null);

  // Handle file selection
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setUploadStats(null);
    setParsedData(null);
    setColumnMapping({});
    setParsing(true);

    try {
      const result = await parseContactFile(selectedFile);
      
      if (result.errors.length > 0) {
        toast.error("Some rows had errors during parsing");
      }

      setParsedData(result);

      // Auto-suggest column mapping
      const suggested = suggestColumnMapping(result.headers);
      setColumnMapping(suggested);

      toast.success(`Parsed ${result.totalRows} rows from ${selectedFile.name}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to parse file");
      setFile(null);
    } finally {
      setParsing(false);
    }
  }, []);

  // Handle column mapping change
  const handleMappingChange = (header: string, value: string) => {
    setColumnMapping((prev) => ({
      ...prev,
      [header]: value === "ignore" ? null : value,
    }));
  };

  // Validate mapping
  const validateMapping = (): { valid: boolean; error?: string } => {
    const mappedFields = Object.values(columnMapping).filter(Boolean);
    
    // Must have phone number mapped
    if (!mappedFields.includes("phone")) {
      return { valid: false, error: "Phone number column is required" };
    }

    return { valid: true };
  };

  // Handle upload
  const handleUpload = async () => {
    if (!file || !parsedData) return;

    const validation = validateMapping();
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setProcessing(true);

    try {
      // Reverse mapping: field -> column name
      const reversedMapping: Record<string, string | null> = {};
      Object.entries(columnMapping).forEach(([header, field]) => {
        if (field) {
          reversedMapping[field] = header;
        }
      });

      const result = await processContactListAction({
        campaignId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.name.split(".").pop() || "unknown",
        totalRows: parsedData.totalRows,
        columnMapping: reversedMapping,
        parsedRows: parsedData.rows,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setUploadStats(result.stats);
      toast.success(`Successfully uploaded ${result.stats?.valid} contacts!`);
      
      if (onUploadComplete) {
        onUploadComplete(result.stats);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload contacts");
    } finally {
      setProcessing(false);
    }
  };

  // Reset
  const handleReset = () => {
    setFile(null);
    setParsedData(null);
    setColumnMapping({});
    setUploadStats(null);
  };

  // Get currently assigned field for a header
  const getAssignedField = (header: string) => {
    return columnMapping[header] || "ignore";
  };

  // Check if a field is already assigned to another column
  const isFieldAssigned = (field: string, currentHeader: string) => {
    return Object.entries(columnMapping).some(
      ([header, assignedField]) => header !== currentHeader && assignedField === field
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Contact List
        </CardTitle>
        <CardDescription>
          Upload a CSV or Excel file with your contact list. Supported formats: .csv, .xlsx, .xls
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        {!parsedData && !uploadStats && (
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              id="contact-file-upload"
              disabled={parsing}
            />
            <label htmlFor="contact-file-upload" className="cursor-pointer">
              {parsing ? (
                <>
                  <Loader2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-spin" />
                  <p className="text-sm text-muted-foreground">Parsing file...</p>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">
                    {file ? file.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-muted-foreground">CSV, XLSX, or XLS (max 10MB)</p>
                </>
              )}
            </label>
          </div>
        )}

        {/* Column Mapping */}
        {parsedData && !uploadStats && (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Found {parsedData.totalRows} rows with {parsedData.headers.length} columns. Map each
                column to the appropriate field below.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h3 className="text-sm font-medium">Column Mapping</h3>
              {parsedData.headers.map((header) => (
                <div key={header} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{header}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      Example: {parsedData.rows[0]?.[header] || "N/A"}
                    </p>
                  </div>
                  <div className="w-48">
                    <Select
                      value={getAssignedField(header)}
                      onValueChange={(value) => handleMappingChange(header, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            disabled={
                              option.value !== "ignore" &&
                              isFieldAssigned(option.value, header)
                            }
                          >
                            {option.label}
                            {option.value !== "ignore" &&
                              isFieldAssigned(option.value, header) && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  (assigned)
                                </span>
                              )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleUpload}
                disabled={processing || !validateMapping().valid}
                className="flex-1"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Upload {parsedData.totalRows} Contacts
                  </>
                )}
              </Button>
              <Button onClick={handleReset} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Upload Success */}
        {uploadStats && (
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Successfully uploaded contacts!
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">{uploadStats.valid}</div>
                  <div className="text-xs text-muted-foreground">Valid Contacts</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-yellow-600">{uploadStats.invalid}</div>
                  <div className="text-xs text-muted-foreground">Invalid</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-orange-600">{uploadStats.duplicates}</div>
                  <div className="text-xs text-muted-foreground">Duplicates</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{uploadStats.total}</div>
                  <div className="text-xs text-muted-foreground">Total Rows</div>
                </CardContent>
              </Card>
            </div>

            {/* Timezone Summary */}
            {uploadStats.timezoneSummary && (
              <div>
                <h3 className="text-sm font-medium mb-3">Contacts by Timezone</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(uploadStats.timezoneSummary).map(([tz, count]) => (
                    <Badge key={tz} variant="outline" className="px-3 py-1">
                      {tz}: {count as number}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={handleReset} variant="outline" className="w-full">
              Upload Another List
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
