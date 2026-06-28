'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import defaultSchema from '@/data/form-schema.json';
import { resetStoredSchema, saveStoredSchema } from '@/lib/storage';
import { FormSchema } from '@/types/form';

interface SchemaEditorProps {
  schema: FormSchema;
  onSchemaChange: (schema: FormSchema) => void;
}

export function SchemaEditor({ schema, onSchemaChange }: SchemaEditorProps) {
  const [jsonText, setJsonText] = useState(JSON.stringify(schema, null, 2));
  const [error, setError] = useState('');

  const applySchema = () => {
    try {
      const parsed = JSON.parse(jsonText) as FormSchema;
      if (!Array.isArray(parsed.data)) {
        throw new Error('Schema must contain a "data" array.');
      }
      saveStoredSchema(parsed);
      onSchemaChange(parsed);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON schema');
    }
  };

  const resetSchema = () => {
    resetStoredSchema();
    const fallback = defaultSchema as FormSchema;
    setJsonText(JSON.stringify(fallback, null, 2));
    onSchemaChange(fallback);
    setError('');
  };

  return (
    <Card elevation={2}>
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              JSON Schema Editor
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Change labels, field types (TEXT/LIST/RADIO), required flags, or
              default values to see the form update dynamically.
            </Typography>
          </Box>

          <TextField
            multiline
            minRows={12}
            fullWidth
            value={jsonText}
            onChange={(event) => setJsonText(event.target.value)}
            error={Boolean(error)}
            helperText={error || 'Edit JSON and click Apply Schema'}
            sx={{ fontFamily: 'monospace' }}
          />

          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={applySchema}>
              Apply Schema
            </Button>
            <Button variant="outlined" onClick={resetSchema}>
              Reset to Default
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
