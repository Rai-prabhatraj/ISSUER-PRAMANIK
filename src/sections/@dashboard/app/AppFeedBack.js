
import { Box, Card, Paper, Typography, CardHeader, CardContent } from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';
import FeedbackOutlinedIcon from '@mui/icons-material/FeedbackOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';


export default function FeedbackAndIssues() {
  const feedbackList = [
    { category: 'Technical Issues', count: 120, icon: <BugReportIcon />, severity: 'High' },
    { category: 'General Feedback', count: 340, icon: <FeedbackOutlinedIcon />, severity: 'Low' },
    { category: 'Complaints', count: 75, icon: <ReportProblemOutlinedIcon />, severity: 'Medium' },
    { category: 'Suggestions', count: 50, icon: <ThumbUpOutlinedIcon />, severity: 'Low' },
  ];

  return (
    <Card>
      <CardHeader title="Feedback and Issues" subheader="Overview of recent feedback and reported issues" />

      <CardContent>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: 'repeat(2, 1fr)',
          }}
        >
          {feedbackList.map((item) => (
            <Paper
              key={item.category}
              variant="outlined"
              sx={{
                py: 2.5,
                textAlign: 'center',
                backgroundColor: item.severity === 'High' ? 'error.lighter' : 'background.paper',
              }}
            >
              <Box sx={{ mb: 0.5 }}>{item.icon}</Box>

              <Typography variant="h6">{item.count}</Typography>

              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {item.category}
              </Typography>
            </Paper>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
