import React, { useState, useRef } from "react";
import { Box, Button, Typography, Grid, Card, CardContent } from "@mui/material";
import { Viewer } from "@react-pdf-viewer/core"; // Updated import
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { PDFDocument } from "pdf-lib";




// Sample templates (modify to load from DB if necessary)
const templates = [
  { id: 1, name: "Template 1", content: "Sample.pdf" },
  { id: 2, name: "Template 2", content: "AnotherSample.pdf" },
];

const TemplatePage = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [pdfFile, setPdfFile] = useState(null); // PDF file data
  const [updatedPdf, setUpdatedPdf] = useState(null); // Edited PDF data

  const fileInputRef = useRef(null);

  const loadTemplatePdf = async (template) => {
    try {
      const response = await fetch(`/path-to-your-pdf/${template.content}`);
      const arrayBuffer = await response.arrayBuffer();
      setPdfFile(arrayBuffer);
      setSelectedTemplate(template);
    } catch (error) {
      console.error("Error loading PDF:", error);
    }
  };

  const handlePdfChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      setPdfFile(arrayBuffer);
    }
  };

  const saveEditedPdf = async () => {
    try {
      const pdfDoc = await PDFDocument.load(pdfFile);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];

      // Example of editing the PDF (Adding text)
      firstPage.drawText("Edited Text Example", {
        x: 50,
        y: 700,
        size: 20,
        color: pdfDoc.embedRgb(0.95, 0.1, 0.1),
      });

      const editedPdfBytes = await pdfDoc.save();
      setUpdatedPdf(editedPdfBytes);

      // Save to database (replace this with your API call)
      console.log("Edited PDF saved:", editedPdfBytes);
      alert("Edited PDF saved!");
    } catch (error) {
      console.error("Error editing PDF:", error);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", py: 4 }}>
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 2 }}>
        {!selectedTemplate ? (
          <Box>
            <Typography
              variant="h4"
              align="center"
              sx={{ mb: 4, fontWeight: "bold", color: "#3f51b5" }}
            >
              Select or Create a Template
            </Typography>
            <Grid container spacing={3}>
              {templates.map((template) => (
                <Grid item xs={12} sm={6} md={4} key={template.id}>
                  <Card
                    sx={{
                      p: 2,
                      cursor: "pointer",
                      transition: "0.3s",
                      "&:hover": {
                        transform: "scale(1.05)",
                        boxShadow: "0px 8px 20px rgba(0,0,0,0.2)",
                      },
                    }}
                    onClick={() => loadTemplatePdf(template)}
                  >
                    <CardContent>
                      <Typography
                        variant="h6"
                        align="center"
                        sx={{ fontWeight: "bold", color: "#3f51b5" }}
                      >
                        {template.name}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Button
              variant="contained"
              color="secondary"
              sx={{ mt: 4 }}
              onClick={() => fileInputRef.current.click()}
            >
              Upload New Template
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="application/pdf"
              onChange={handlePdfChange}
            />
          </Box>
        ) : (
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setSelectedTemplate(null)}
              sx={{ mb: 3 }}
            >
              Back to Templates
            </Button>
            {pdfFile && <Viewer fileUrl={pdfFile} style={{ height: "600px", width: "100%" }} />}

            <Button
              variant="contained"
              color="success"
              onClick={saveEditedPdf}
              sx={{ mt: 3 }}
            >
              Save Edited Template
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TemplatePage;
