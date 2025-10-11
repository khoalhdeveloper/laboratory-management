import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../source/page/Axios/Axios';

interface AuthGuardProps {
    children: ReactNode;
    allowedRoles?: string[];
    redirectTo?: string;
}

function AuthGuard({ children, allowedRoles, redirectTo = '/login' }: AuthGuardProps) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                setLoading(true);
                
                const token = localStorage.getItem('token');
                
                
                if (!token) {
                    navigate(redirectTo, { replace: true });
                    return;
                }

                const response = await userAPI.getCurrentUser();
                const userData = response.data;
                
                
                if (allowedRoles && allowedRoles.length > 0) {
                    if (!allowedRoles.includes(userData.role)) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('userRole');
                        localStorage.removeItem('userId');
                        navigate(redirectTo, { replace: true });
                        return;
                    }
                }

                setIsAuthenticated(true);
                
            } catch (error) {
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                localStorage.removeItem('userId');
                navigate(redirectTo, { replace: true });
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [navigate, allowedRoles, redirectTo]);

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50 items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang kiểm tra quyền truy cập...</p>
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return null;
}

export default AuthGuard;
