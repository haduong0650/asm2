import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from './supabase';

export default function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const router = useRouter();

    useEffect(() => {
      const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace('/login');
        }
      };
      checkSession();
    }, [router]);

    return <Component {...props} />;
  };
} 