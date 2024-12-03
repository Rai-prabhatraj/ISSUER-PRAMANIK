// @mui
import React from 'react';
import { Card, Typography, CardHeader, CardContent, Box, Button } from '@mui/material';
import { Timeline, TimelineDot, TimelineItem, TimelineContent, TimelineSeparator, TimelineConnector } from '@mui/lab';

// ----------------------------------------------------------------------

export default function AppUserActivityLog() {
  // Hardcoded activity log data
  const activityLog = [
    {
      id: 1,
      time: '2024-11-29 09:00 AM',
      title: 'Logged In',
      description: 'Successfully logged into the dashboard.',
      type: 'login',
    },
    {
      id: 2,
      time: '2024-11-29 10:00 AM',
      title: 'Viewed Document',
      description: 'Viewed document #12345.',
      type: 'documentViewed',
    },
    {
      id: 3,
      time: '2024-11-29 11:00 AM',
      title: 'Updated Document',
      description: 'Updated details in document #12345.',
      type: 'documentUpdated',
    },
    {
      id: 4,
      time: '2024-11-29 12:00 PM',
      title: 'Logged Out',
      description: 'Logged out of the system.',
      type: 'logout',
    },
    {
      id: 5,
      time: '2024-11-29 01:00 PM',
      title: 'Changed Password',
      description: 'Changed their password.',
      type: 'passwordChanged',
    },
    {
      id: 6,
      time: '2024-11-29 02:00 PM',
      title: 'Uploaded File',
      description: 'Uploaded file #67890.',
      type: 'fileUploaded',
    },
    {
      id: 7,
      time: '2024-11-29 03:00 PM',
      title: 'Shared Document',
      description: 'Shared document #12345 with team.',
      type: 'documentShared',
    },
  ];

  const [activities, setActivities] = React.useState(activityLog.slice(0, 6));
  const [showMore, setShowMore] = React.useState();

  const handleShowMore = () => {
    setActivities(activityLog); // Load more activities or all activities
    setShowMore(true); // Hide the "See More" button after loading all
  };

  return (
    <Card>
      <CardHeader title="Activity Log" subheader="Last 24 hours" />

      <CardContent
        sx={{
          height: 400, // Fixed height to enable scrolling
          overflowY: 'auto', // Enables vertical scrolling
          '& .MuiTimelineItem-missingOppositeContent:before': {
            display: 'none',
          },
        }}
      >
        <Timeline>
          {activities.map((activity, index) => (
            <TimelineItem key={activity.id}>
              <TimelineSeparator>
                <TimelineDot
                  color={
                    (activity.type === 'login' && 'primary') ||
                    (activity.type === 'documentViewed' && 'success') ||
                    (activity.type === 'documentUpdated' && 'info') ||
                    (activity.type === 'logout' && 'warning') ||
                    'error'
                  }
                />
                {index !== activities.length - 1 && <TimelineConnector />}
              </TimelineSeparator>

              <TimelineContent>
                <Typography variant="subtitle2">{activity.title}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {activity.description}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {activity.time}
                </Typography>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
        {showMore && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button onClick={handleShowMore} variant="outlined">
              See More
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
