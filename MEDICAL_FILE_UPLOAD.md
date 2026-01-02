# Medical File Upload System

## Overview
Patients can now upload various types of medical documents directly from the Records page using a comprehensive upload modal.

## Features

### Supported Document Types
1. **💊 Prescription** - Prescription documents
2. **🩸 Blood Test Report** - Blood test results
3. **🦴 X-Ray / Scan** - X-rays, CT scans, MRIs
4. **🔬 Lab Report** - Laboratory test reports
5. **💉 Vaccination Record** - Vaccination certificates
6. **📋 Discharge Summary** - Hospital discharge summaries
7. **📄 Other Document** - Any other medical document

### File Support
- **Supported Formats**: JPG, PNG, WEBP, PDF
- **Maximum Size**: 10MB per file
- **Upload Methods**: 
  - Click to browse
  - Drag and drop

### Upload Process
1. Click the "Upload" button on the Records page
2. Select document type from the category grid
3. Upload file (drag & drop or browse)
4. Add optional notes
5. Submit

### Data Storage
- Files are stored in `backend/uploads/` directory
- Metadata is saved to Firestore in the `records` collection
- Each record includes:
  - File information (name, size, type)
  - Category
  - User/profile association
  - Optional notes
  - Timestamps

## Technical Implementation

### Frontend Components
- **FileUploadModal.jsx** - Main upload modal with category selection and file handling
- **RecordsView.jsx** - Updated to display all document types with appropriate icons

### Backend Endpoints
- **POST /api/upload-medical-file** - Handles file upload and record creation
  - Parameters: file, user_id, profile_id, category, notes
  - Returns: success status and record_id

### Database
- **Firestore Collection**: `records`
- **Document Type**: `medical_file`
- **Fields**:
  ```javascript
  {
    id: string,
    user_id: string,
    profile_id: string,
    type: "medical_file",
    data: {
      filename: string,
      stored_filename: string,
      file_path: string,
      category: string,
      file_type: string,
      file_size: number,
      notes: string
    },
    created_at: ISO timestamp,
    updated_at: ISO timestamp
  }
  ```

## User Experience
- Clean, modern modal interface
- Visual file preview for images
- Category-based organization with color coding
- Drag-and-drop support
- File validation and error handling
- Automatic record refresh after upload

## Removed Dependencies
- The old RxAnalyzer upload flow has been replaced
- Upload button now opens the modal instead of navigating to a separate view
- More streamlined user experience
