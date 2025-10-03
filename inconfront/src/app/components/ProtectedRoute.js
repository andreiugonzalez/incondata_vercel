"use client";
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { hasAnyRole } from '@/app/utils/roleUtils';

const ProtectedRoute = ({ roles, children }) => {
  const user = useSelector(state => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user.isLoggedIn || !user.token) {
      router.push('/login');
    } else if (!hasAnyRole(user.user, roles)) {
      // router.push('/access-denied');
      toast.error('Acceso denegado');
    }
  }, [user, router, roles]);

  return user.isLoggedIn && user.token && hasAnyRole(user.user, roles) ? children : null;
};

export default ProtectedRoute;
