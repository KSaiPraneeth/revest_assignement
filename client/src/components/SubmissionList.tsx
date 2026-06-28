'use client';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { SignupSubmission } from '@/types/form';

interface SubmissionListProps {
  submissions: SignupSubmission[];
  onClear: () => void;
}

export function SubmissionList({ submissions, onClear }: SubmissionListProps) {
  if (submissions.length === 0) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Saved Signups
          </Typography>
          <Alert severity="info">No submissions yet. Complete the form above.</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={2}>
      <CardContent>
        <Stack spacing={2}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6">Saved Signups</Typography>
            <Button color="error" size="small" onClick={onClear}>
              Clear All
            </Button>
          </Box>

          {submissions.map((submission) => (
            <Box
              key={submission.id}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'grey.50',
                border: '1px solid',
                borderColor: 'grey.200',
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', mb: 1 }}
              >
                <Chip
                  size="small"
                  label={new Date(submission.submittedAt).toLocaleString()}
                  color="primary"
                  variant="outlined"
                />
              </Stack>
              <Stack spacing={0.5}>
                {Object.entries(submission.values).map(([label, value]) => (
                  <Typography key={label} variant="body2">
                    <strong>{label}:</strong> {value}
                  </Typography>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
