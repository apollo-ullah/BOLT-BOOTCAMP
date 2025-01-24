import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid, Chip } from '@mui/material';

interface Project {
    id: string;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    budget: number;
    status: 'open' | 'in_progress' | 'completed';
    required_skills: string[];
}

const ProjectList = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch('http://localhost:8002/projects');
                if (!response.ok) {
                    throw new Error('Failed to fetch projects');
                }
                const data = await response.json();
                setProjects(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch projects');
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open':
                return 'bg-green-100 text-green-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Grid container spacing={4}>
            {projects.map((project) => (
                <Grid item xs={12} sm={6} key={project.id}>
                    <Card className="h-full">
                        <CardContent>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <Typography variant="h6" component="h2">
                                        {project.name}
                                    </Typography>
                                    <span className={`inline-block px-2 py-1 rounded text-xs mt-2 ${getStatusColor(project.status)}`}>
                                        {project.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <Typography variant="h6" color="primary">
                                    ${project.budget.toLocaleString()}
                                </Typography>
                            </div>
                            <Typography color="textSecondary" className="mb-4">
                                {project.description}
                            </Typography>
                            <div className="mb-4">
                                <Typography variant="subtitle2" className="mb-2">
                                    Required Skills
                                </Typography>
                                <div className="flex flex-wrap gap-2">
                                    {project.required_skills.map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>
                                <span>End: {new Date(project.end_date).toLocaleDateString()}</span>
                            </div>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default ProjectList; 