import React, { useState } from "react";
import { Box, Button, Typography, Grid, Card, CardContent } from "@mui/material";

const templates = [
  { id: 1, name: "Template 1", content: "This is Template 1." },
  { id: 2, name: "Template 2", content: "This is Template 2." },
  { id: 3, name: "Template 3", content: "This is Template 3." },
  { id: 4, name: "Template 4", content: "This is Template 4." },
];

const TemplatePage = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

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
              Select a Template
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
                    onClick={() => setSelectedTemplate(template)}
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
            <Card sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                {selectedTemplate.name}
              </Typography>
              <Typography>{selectedTemplate.content}</Typography>
            </Card>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TemplatePage;
