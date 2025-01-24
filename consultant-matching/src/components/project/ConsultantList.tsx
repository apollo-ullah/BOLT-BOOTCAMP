import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid, Avatar } from '@mui/material';

interface Consultant {
    id: string;
    name: string;
    skills: string[];
    availability: string;
    profile_picture?: string;
}

const ConsultantList = () => {
    const [consultants, setConsultants] = useState<Consultant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchConsultants = async () => {
            try {
                const response = await fetch('http://localhost:8002/consultants');
                if (!response.ok) {
                    throw new Error('Failed to fetch consultants');
                }
                const data = await response.json();
                setConsultants(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch consultants');
            } finally {
                setLoading(false);
            }
        };

        fetchConsultants();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-600 p-4">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <Grid container spacing={4}>
            {consultants.map((consultant) => (
                <Grid item xs={12} sm={6} md={4} key={consultant.id}>
                    <Card className="h-full">
                        <CardContent>
                            <div className="flex items-center space-x-4 mb-4">
                                <Avatar
                                    src={consultant.profile_picture}
                                    alt={consultant.name}
                                    className="w-12 h-12"
                                >
                                    {consultant.name[0]}
                                </Avatar>
                                <div>
                                    <Typography variant="h6" component="h2">
                                        {consultant.name}
                                    </Typography>
                                    <Typography color="textSecondary" variant="body2">
                                        {consultant.availability}
                                    </Typography>
                                </div>
                            </div>
                            <div>
                                <Typography variant="subtitle2" className="mb-2">
                                    Skills
                                </Typography>
                                <div className="flex flex-wrap gap-2">
                                    {consultant.skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default ConsultantList; 