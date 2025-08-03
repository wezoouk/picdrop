
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllWeddings, deleteWedding, WeddingData } from '../services/weddingService';
import NavHeader from '../components/NavHeader';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import Icon from '../components/Icon';

const AdminView: React.FC = () => {
    const [weddings, setWeddings] = useState<WeddingData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchWeddings = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const allWeddings = await getAllWeddings();
            setWeddings(allWeddings);
        } catch (e) {
            setError('Failed to load wedding data.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWeddings();
    }, [fetchWeddings]);

    const handleDelete = async (weddingId: string, coupleNames: string) => {
        if (window.confirm(`Are you sure you want to delete the wedding for ${coupleNames}? This action is permanent and cannot be undone.`)) {
            try {
                await deleteWedding(weddingId);
                fetchWeddings(); // Refresh the list after deletion
            } catch (e) {
                alert('Failed to delete wedding. Please try again.');
            }
        }
    };
    
    const handleResetPassword = (email?: string) => {
        if (!email) {
            alert("Cannot reset password: user email is not available.");
            return;
        }
        alert(`A password reset link would be sent to ${email}. (This is a mock action).`);
    };

    return (
        <>
            <NavHeader />
            <div className="bg-blush/50 min-h-[calc(100vh-4rem)] py-12">
                <div className="container mx-auto px-4">
                    <div className="mb-8">
                        <h1 className="text-3xl font-serif font-bold text-dark-text">Admin Dashboard</h1>
                        <p className="text-dark-text/80">Manage all wedding pages on the platform.</p>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
                    ) : error ? (
                        <p className="text-center text-red-500">{error}</p>
                    ) : (
                        <div className="bg-ivory rounded-xl shadow-lg border border-gold-accent/20 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left font-sans">
                                    <thead className="bg-blush border-b border-gold-accent/20">
                                        <tr>
                                            <th className="px-6 py-3 text-sm font-semibold text-dark-text">Couple's Names</th>
                                            <th className="px-6 py-3 text-sm font-semibold text-dark-text">Owner Email</th>
                                            <th className="px-6 py-3 text-sm font-semibold text-dark-text text-center">Photos</th>
                                            <th className="px-6 py-3 text-sm font-semibold text-dark-text text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-soft-gray">
                                        {weddings.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="text-center py-16 text-dark-text/70">
                                                    No wedding pages have been created yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            weddings.map((wedding) => (
                                                <tr key={wedding.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="font-medium text-dark-text">{wedding.details.coupleNames}</div>
                                                        <div className="text-xs text-dark-text/60">{wedding.id}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-dark-text/90">{wedding.details.ownerEmail || 'N/A'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-dark-text/90">{wedding.photos.length}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end items-center gap-2">
                                                            <Link to={`/admin/manage/${wedding.id}`}>
                                                                <Button size="sm" variant="outline">Manage Photos</Button>
                                                            </Link>
                                                            <Button size="sm" variant="outline" onClick={() => handleResetPassword(wedding.details.ownerEmail)}>Reset Pass</Button>
                                                            <Button size="sm" variant="secondary" className="!bg-red-600" onClick={() => handleDelete(wedding.id, wedding.details.coupleNames)}>
                                                                <Icon id="trash" className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminView;
