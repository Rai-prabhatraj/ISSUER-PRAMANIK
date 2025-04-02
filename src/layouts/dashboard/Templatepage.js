import React, { useState } from 'react';
import { 
  Button, 
  Typography, 
  Box, 
  Modal, 
  Paper, 
  Container, 
  Grid, 
  Stepper, 
  Step, 
  StepLabel, 
  Card, 
  CardContent, 
  CircularProgress,
  Chip,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import PublishIcon from '@mui/icons-material/Publish';
import PreviewIcon from '@mui/icons-material/Preview';
import CloseIcon from '@mui/icons-material/Close';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import axios from 'axios';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

function GeneratePdfPage() {
  const [excelData, setExcelData] = useState([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [fileName, setFileName] = useState('');
  const [uploadError, setUploadError] = useState('');

  const steps = ['Upload Excel File', 'Review Data', 'Generate Document'];

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setUploadError('');
    
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          // Get the first sheet and convert it to JSON
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          let jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Clean the keys in the JSON data
          jsonData = jsonData.map((row) =>
            Object.keys(row).reduce((acc, key) => {
              const cleanedKey = key.trim().replace(/\s+/g, ' '); // Remove extra spaces
              acc[cleanedKey] = row[key];
              return acc;
            }, {})
          );

          setExcelData(jsonData);
          setActiveStep(1); // Move to review step
        } catch (error) {
          console.error("Error processing file:", error);
          setUploadError('Failed to process the Excel file. Please check the format and try again.');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Generate PDF and preview it
  const handleReviewPdf = () => {
    if (excelData.length === 0) {
      setUploadError('No data to review!');
      return;
    }

    const doc = new jsPDF();
    excelData.forEach((item, index) => {
      // Add content for each item
      doc.setFontSize(20);
      doc.text('TCS Application Details', 10, 10);

      doc.setFontSize(10);
      const content = `
        Timestamp: ${item.Timestamp || ''}
        ERP ID: ${item['ERP ID'] || ''}
        Email ID: ${item['Email ID'] || ''}
        Name: ${item.Name || ''}
        Application Status: ${item['Application Status'] || ''}
        Institute Name: ${item['Institute Name'] || ''}
        Highest Qualification: ${item['Highest Qualification'] || ''}
        Specialisation: ${item.Specialisation || ''}
        Skills: ${item.Skills || ''}
        Eligible as per TCS Criteria: ${item['Eligible as per the TCS Eligibility Criteria'] || ''}
        Test State Preference 1: ${item['Test State Preference 1'] || ''}
        Test City Preference 1: ${item['Test City Preference 1'] || ''}
      `;

      doc.text(content, 10, 20);

      // Add a new page if not the last item
      if (index < excelData.length - 1) {
        doc.addPage();
      }
    });

    // Convert the PDF to a Blob and create a preview URL
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    setPreviewPdfUrl(pdfUrl);
    setIsReviewModalOpen(true);
    setActiveStep(2); // Move to final step
  };

  // Generate and upload PDF
  const generateAndUploadPdf = async () => {
    if (excelData.length === 0) {
      setUploadError('No data to publish!');
      return;
    }

    setIsPublishing(true);

    const doc = new jsPDF();

    excelData.forEach((item, index) => {
      // Add content for each item
      doc.setFontSize(20);
      doc.text('TCS Application Details', 10, 10);

      doc.setFontSize(10);
      const content = `
        Timestamp: ${item.Timestamp || ''}
        ERP ID: ${item['ERP ID'] || ''}
        Email ID: ${item['Email ID'] || ''}
        Name: ${item.Name || ''}
        Application Status: ${item['Application Status'] || ''}
        Institute Name: ${item['Institute Name'] || ''}
        Highest Qualification: ${item['Highest Qualification'] || ''}
        Specialisation: ${item.Specialisation || ''}
        Skills: ${item.Skills || ''}
        Eligible as per TCS Criteria: ${item['Eligible as per the TCS Eligibility Criteria'] || ''}
        Test State Preference 1: ${item['Test State Preference 1'] || ''}
        Test City Preference 1: ${item['Test City Preference 1'] || ''}
      `;

      doc.text(content, 10, 20);

      // Add a new page if not the last item
      if (index < excelData.length - 1) {
        doc.addPage();
      }
    });

    // Convert the PDF to a Blob
    const pdfBlob = doc.output('blob');

    // Upload to Pinata
    try {
      const formData = new FormData();
      formData.append('file', pdfBlob, 'applications.pdf');

      const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          pinata_api_key: 'cc2e560077cf5de826f0',
          pinata_secret_api_key: '8d8c5864dea3229f5687b88407027a9a2a115073688a630e9be92ed8f7b70946',
        },
      });

      setUploadError(`PDF successfully published to IPFS! CID: ${response.data.IpfsHash}`);
    } catch (error) {
      console.error('Error uploading to Pinata:', error);
      setUploadError('Failed to publish PDF to IPFS.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, color: '#1976d2', fontWeight: 'bold' }}>
          <DescriptionIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Document Generator
        </Typography>
        
        <Divider sx={{ mb: 4 }} />
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {uploadError && (
          <Alert 
            severity={uploadError.includes('successfully') ? "success" : "error"} 
            sx={{ mb: 3 }}
            onClose={() => setUploadError('')}
          >
            {uploadError}
          </Alert>
        )}
        
        <Box sx={{ mb: 4 }}>
          {activeStep === 0 && (
            <Card variant="outlined" sx={{ 
              p: 3, 
              textAlign: 'center',
              background: 'linear-gradient(to bottom, #f9f9f9, #f0f0f0)',
              border: '2px dashed #ccc',
              borderRadius: 2
            }}>
              <CardContent>
                <CloudUploadIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Upload Excel File
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                  Please upload an Excel file
                </Typography>
                
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mt: 2 }}
                >
                  Select File
                  <VisuallyHiddenInput 
                    type="file" 
                    accept=".xlsx, .xls" 
                    onChange={handleFileUpload}
                  />
                </Button>
              </CardContent>
            </Card>
          )}
          
          {activeStep >= 1 && excelData.length > 0 && (
            <Box>
              <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Grid item>
                  <Chip 
                    icon={<DescriptionIcon />} 
                    label={fileName || "Excel Data"} 
                    variant="outlined" 
                    color="primary" 
                  />
                </Grid>
                <Grid item>
                  <Typography variant="body2" color="textSecondary">
                    {excelData.length} records loaded
                  </Typography>
                </Grid>
              </Grid>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                Application Data Preview:
              </Typography>
              
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {excelData.slice(0, 5).map((item, index) => (
                      <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}>
                        <TableCell>{item.Timestamp}</TableCell>
                        <TableCell>{item['Email ID']}</TableCell>
                        <TableCell>{item.Name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={item['Application Status'] || 'N/A'} 
                            size="small"
                            color={item['Application Status'] === 'Accepted' ? 'success' : 
                                  item['Application Status'] === 'Rejected' ? 'error' : 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {excelData.length > 5 && (
                  <Box sx={{ p: 1, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      Showing 5 of {excelData.length} records
                    </Typography>
                  </Box>
                )}
              </TableContainer>
            </Box>
          )}
          
          {activeStep >= 1 && (
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleReviewPdf}
                  startIcon={<PreviewIcon />}
                  disabled={excelData.length === 0}
                >
                  Preview Document
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={generateAndUploadPdf}
                  disabled={isPublishing || excelData.length === 0}
                  startIcon={isPublishing ? <CircularProgress size={20} color="inherit" /> : <PublishIcon />}
                >
                  {isPublishing ? 'Publishing...' : 'Publish to IPFS'}
                </Button>
              </Grid>
            </Grid>
          )}
        </Box>
      </Paper>

      {/* Review Modal */}
      <Modal
        open={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        aria-labelledby="document-preview-modal"
      >
        <Paper
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxHeight: '80vh',
            p: 4,
            outline: 'none',
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" id="document-preview-modal">
              <PreviewIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Document Preview
            </Typography>
            <IconButton onClick={() => setIsReviewModalOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          {previewPdfUrl ? (
            <iframe
              src={previewPdfUrl}
              title="PDF Preview"
              width="100%"
              height="500px"
              style={{ border: 'none' }}
            />
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={() => setIsReviewModalOpen(false)}
            >
              Close
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={generateAndUploadPdf}
              disabled={isPublishing}
              startIcon={isPublishing ? <CircularProgress size={20} color="inherit" /> : <PublishIcon />}
            >
              {isPublishing ? 'Publishing...' : 'Publish to IPFS'}
            </Button>
          </Box>
        </Paper>
      </Modal>
    </Container>
  );
}

export default GeneratePdfPage;