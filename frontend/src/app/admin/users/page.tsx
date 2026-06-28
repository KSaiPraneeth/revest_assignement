'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { authApi } from '@/lib/api/auth';
import { useSnackbar } from '@/hooks/useSnackbar';
import { User } from '@/types/api';
import {
  Chip,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

export default function AdminUsersPage() {
  const { showSnackbar } = useSnackbar();
  const [users, setUsers] = useState<User[]>([]);

  const load = () => authApi.listUsers().then(setUsers);

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (user: User) => {
    try {
      await authApi.updateUser(user.id, { active: !user.active });
      showSnackbar('User updated', 'success');
      load();
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : 'Update failed', 'error');
    }
  };

  return (
    <ProtectedRoute adminOnly>
      <DashboardLayout admin>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Manage Users
        </Typography>

        <Paper sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Active</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip size="small" label={user.role} color={user.role === 'ADMIN' ? 'primary' : 'default'} />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={user.active}
                      onChange={() => toggleActive(user)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
