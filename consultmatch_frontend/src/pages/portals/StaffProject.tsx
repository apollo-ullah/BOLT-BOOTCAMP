import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Chip,
  Stack,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, CheckCircleOutline } from '@mui/icons-material';

interface Project {
  id: number;
  project_name: string;
  preferred_industry: string;
  start_date: string;
  end_date: string;
  location_city: string;
  location_country: string;
  difficulty: string;
  description: string;
  required_skill1: string;
  required_skill2: string;
  required_skill3: string;
}

interface Consultant {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  seniority_level: string;
  skill1: string;
  skill2: string;
  skill3: string;
  years_of_experience: number;
  current_availability: string;
  location_flexibility: string;
}

interface RecommendedMatch {
  consultant: Consultant;
  match_score: number;
  match_reasons: string[];
}

const StaffProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [recommendedMatches, setRecommendedMatches] = useState<RecommendedMatch[]>([]);

  const steps = [
    'Project Review',
    'Generate Recommendations',
    'Review Matches',
    'Finalize Team'
  ];

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) {
        console.error('No project ID provided');
        setError('Project ID is missing');
        setLoading(false);
        return;
      }

      // Parse project ID to ensure it's a number
      const numericProjectId = parseInt(projectId, 10);
      if (isNaN(numericProjectId)) {
        console.error('Invalid project ID format:', projectId);
        setError('Invalid project ID format');
        setLoading(false);
        return;
      }

      try {
        console.log('Starting to fetch project details for ID:', numericProjectId);
        const response = await fetch(`http://127.0.0.1:8002/projects/${numericProjectId}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          mode: 'cors',
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server error:', errorText);
          throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received project data:', data);
        
        if (!data || typeof data.id !== 'number') {
          console.error('Invalid project data:', data);
          throw new Error('Invalid project data received');
        }
        
        setProject(data);
        console.log('Project data set successfully');
      } catch (error) {
        console.error('Error in fetchProjectDetails:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch project details');
      } finally {
        setLoading(false);
      }
    };

    console.log('StaffProject component mounted with projectId:', projectId);
    fetchProjectDetails();
  }, [projectId]);

  const handleGenerateRecommendations = async () => {
    if (!projectId) {
      setError('Project ID is missing');
      return;
    }

    setLoading(true);
    try {
      console.log('Generating recommendations for project:', projectId);
      const response = await fetch(`http://127.0.0.1:8002/recommend-consultants/${projectId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received recommendations:', data);
      
      setRecommendedMatches(data);
      setActiveStep(2); // Move to review matches step
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  const renderProjectDetails = () => {
    if (!project) return null;

    return (
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {project.project_name}
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Industry
                  </Typography>
                  <Chip label={project.preferred_industry} />
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Required Skills
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip label={project.required_skill1} />
                    {project.required_skill2 && <Chip label={project.required_skill2} />}
                    {project.required_skill3 && <Chip label={project.required_skill3} />}
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Location
                  </Typography>
                  <Typography>
                    {project.location_city}, {project.location_country}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Timeline
                  </Typography>
                  <Typography>
                    {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Difficulty Level
                  </Typography>
                  <Chip 
                    label={project.difficulty}
                    color={
                      project.difficulty.toLowerCase() === 'hard' ? 'error' :
                      project.difficulty.toLowerCase() === 'medium' ? 'warning' :
                      'success'
                    }
                  />
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body2">
                    {project.description}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderMatchScore = (score: number) => {
    const percentage = Math.round(score * 100);
    const getColor = () => {
      if (percentage >= 80) return 'success';
      if (percentage >= 60) return 'info';
      if (percentage >= 40) return 'warning';
      return 'error';
    };

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" color={getColor()}>
          {percentage}% Match
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={percentage} 
          color={getColor()}
          sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
        />
      </Box>
    );
  };

  const isSkillMatch = (skill: string, projectSkills: string[]) => {
    return projectSkills.some(ps => ps.toLowerCase().includes(skill.toLowerCase()) || 
                                  skill.toLowerCase().includes(ps.toLowerCase()));
  };

  const renderSkillChip = (skill: string, projectSkills: string[]) => {
    const isMatched = isSkillMatch(skill, projectSkills);
    return (
      <Chip 
        key={skill}
        label={skill}
        size="small"
        sx={{ 
          mb: 1,
          backgroundColor: isMatched ? 'rgba(46, 125, 50, 0.1)' : 'rgba(0, 0, 0, 0.08)',
          color: isMatched ? '#2e7d32' : 'text.primary',
          borderWidth: isMatched ? 1 : 0,
          borderStyle: 'solid',
          borderColor: isMatched ? '#2e7d32' : 'transparent',
          '& .MuiChip-label': {
            fontWeight: isMatched ? 500 : 400
          }
        }}
      />
    );
  };

  const renderRecommendations = () => {
    if (!project) return null;
    
    const projectSkills = [
      project.required_skill1,
      project.required_skill2,
      project.required_skill3
    ].filter(Boolean);

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Recommended Matches
        </Typography>
        {recommendedMatches.length === 0 ? (
          <Alert severity="info">No matches found. Try adjusting your project requirements.</Alert>
        ) : (
          <Grid container spacing={3}>
            {recommendedMatches.map((match, index) => (
              <Grid item xs={12} key={match.consultant.id}>
                <Card sx={{ 
                  position: 'relative',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s'
                  }
                }}>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Stack spacing={2}>
                          <Box>
                            <Typography variant="h6">
                              {match.consultant.first_name} {match.consultant.last_name}
                            </Typography>
                            <Typography color="text.secondary">
                              {match.consultant.seniority_level} • {match.consultant.years_of_experience} years exp.
                            </Typography>
                          </Box>
                          {renderMatchScore(match.match_score)}
                        </Stack>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Project Required Skills
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                            {projectSkills.map((skill) => (
                              <Chip 
                                key={skill}
                                label={skill}
                                size="small"
                                sx={{ 
                                  mb: 1,
                                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                  color: '#1976d2',
                                }}
                              />
                            ))}
                          </Stack>
                          
                          <Typography variant="subtitle2" gutterBottom>
                            Consultant Skills
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {[match.consultant.skill1, match.consultant.skill2, match.consultant.skill3]
                              .filter(Boolean)
                              .map((skill) => renderSkillChip(skill, projectSkills))
                            }
                          </Stack>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2" gutterBottom>
                          Match Reasons
                        </Typography>
                        <List dense>
                          {match.match_reasons.map((reason, idx) => (
                            <ListItem key={idx} sx={{ py: 0 }}>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <CheckCircleOutline fontSize="small" color="success" />
                              </ListItemIcon>
                              <ListItemText 
                                primary={reason}
                                primaryTypographyProps={{ variant: 'body2' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    );
  };

  const renderContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            {renderProjectDetails()}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={() => setActiveStep(1)}
              >
                Continue to Recommendations
              </Button>
            </Box>
          </>
        );
      case 1:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              Ready to Generate Recommendations
            </Typography>
            <Typography color="text.secondary" paragraph>
              Our AI-powered engine will analyze consultant profiles and find the best matches for your project.
            </Typography>
            <Button
              variant="contained"
              onClick={handleGenerateRecommendations}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Generate Recommendations'}
            </Button>
          </Box>
        );
      case 2:
        return renderRecommendations();
      default:
        return null;
    }
  };

  if (loading && activeStep === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3 }}
        >
          Back to Projects
        </Button>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Back to Projects
        </Button>
      </Box>

      <Typography variant="h4" gutterBottom>
        Staff Project
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderContent()}
    </Box>
  );
};

export default StaffProject; 