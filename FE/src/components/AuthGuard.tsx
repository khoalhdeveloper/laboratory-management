import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../source/page/Axios/Axios';
import '../source/CSS/Loading.css';

interface AuthGuardProps {
    children: ReactNode;
    allowedRoles?: string[];
    redirectTo?: string;
}

function AuthGuard({ children, allowedRoles, redirectTo = '/' }: AuthGuardProps) {
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
        
        // Handle different response structures
        let actualUserData;
        if (userData.data) {
            actualUserData = userData.data;
        } else {
            actualUserData = userData;
        }
        
        if (allowedRoles && allowedRoles.length > 0) {
            if (!allowedRoles.includes(actualUserData.role)) {
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
                    <div className="flex items-center justify-center gap-3">
                        <div className="loader" style={{
                            borderColor: '#000000'
                        }}></div>
                        <p className="text-gray-600">Checking access rights...</p>
                    </div>
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
