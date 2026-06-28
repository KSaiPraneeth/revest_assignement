'use client';

import { SchemaEditor } from '@/components/SchemaEditor';
import { SignupForm } from '@/components/SignupForm';
import { SubmissionList } from '@/components/SubmissionList';
import defaultSchema from '@/data/form-schema.json';
import {
  clearSubmissions,
  loadStoredSchema,
  loadSubmissions,
} from '@/lib/storage';
import { FormSchema, SignupSubmission } from '@/types/form';
import { Box, Container, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [schema, setSchema] = useState<FormSchema>(defaultSchema as FormSchema);
  const [submissions, setSubmissions] = useState<SignupSubmission[]>([]);

  useEffect(() => {
    const storedSchema = loadStoredSchema();
    if (storedSchema) {
      setSchema(storedSchema);
    }
    setSubmissions(loadSubmissions());
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 3, md: 5 } }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 800 }} gutterBottom>
            Revest Dynamic Signup
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            JSON-driven form components with React Hook Form, Zod validation, and
            Material UI
          </Typography>
        </Box>

        <Stack spacing={3}>
          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' },
            }}
          >
            <SignupForm
              schema={schema}
              onSubmitSuccess={() => setSubmissions(loadSubmissions())}
            />
            <SubmissionList
              submissions={submissions}
              onClear={() => {
                clearSubmissions();
                setSubmissions([]);
              }}
            />
          </Box>
          <SchemaEditor schema={schema} onSchemaChange={setSchema} />
        </Stack>
      </Container>
    </Box>
  );
}
