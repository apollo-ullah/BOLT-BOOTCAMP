import React, { useState } from 'react';
import { Button } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ConsultantList from '../components/project/ConsultantList';
import ProjectList from '../components/project/ProjectList';

const Projects = () => {
    const [showConsultants, setShowConsultants] = useState(false);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Project Gallery</h1>
                <div className="flex gap-4">
                    <Button
                        variant="contained"
                        startIcon={<PersonIcon />}
                        onClick={() => setShowConsultants(!showConsultants)}
                        className="bg-primary hover:bg-primary-dark"
                    >
                        {showConsultants ? 'View Projects' : 'View Consultants'}
                    </Button>
                    <Button
                        variant="contained"
                        className="bg-primary hover:bg-primary-dark"
                    >
                        Create New Project
                    </Button>
                </div>
            </div>

            {showConsultants ? <ConsultantList /> : <ProjectList />}
        </div>
    );
};

export default Projects; 