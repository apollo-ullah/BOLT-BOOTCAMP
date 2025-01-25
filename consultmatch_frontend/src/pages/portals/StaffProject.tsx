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
import { 
  ArrowBack as ArrowBackIcon, 
  CheckCircleOutline, 
  AutoAwesome as AutoAwesomeIcon 
} from '@mui/icons-material';

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
    'Review Top 10',
    'AI Analysis',
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
    // Apply the curve: map scores from [0.4-0.67] to [60-90]
    const minInput = 0.4;  // Minimum expected score
    const maxInput = 0.67; // Maximum expected score
    const minOutput = 60;  // Minimum displayed score
    const maxOutput = 90;  // Maximum displayed score
    
    // Linear transformation formula
    let percentage = Math.round(
      ((score - minInput) / (maxInput - minInput)) * (maxOutput - minOutput) + minOutput
    );
    
    // Clamp the value between minOutput and maxOutput
    percentage = Math.max(minOutput, Math.min(maxOutput, percentage));
    
    const getColor = () => {
      if (percentage >= 80) return 'success';
      if (percentage >= 70) return 'info';
      if (percentage >= 60) return 'warning';
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

  const renderSkillChip = (skill: string, projectSkills: string[], index: number, consultantId: number) => {
    const isMatched = isSkillMatch(skill, projectSkills);
    return (
      <Chip 
        key={`${consultantId}-${skill}-${index}`}
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
    if (!recommendedMatches || recommendedMatches.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No matches found. Try adjusting project requirements.
          </Typography>
        </Box>
      );
    }

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Top Recommended Consultants
          </Typography>
          <Button
            variant="contained"
            endIcon={<AutoAwesomeIcon />}
            onClick={() => navigate('/ai-evaluation', { 
              state: { 
                project, 
                topCandidates: recommendedMatches,
                requestTopFive: true
              } 
            })}
          >
            Get AI Analysis for Top 5
          </Button>
        </Box>
        <Typography color="text.secondary" paragraph>
          Found {recommendedMatches.length} potential matches based on skills, experience, and availability.
        </Typography>

        <Grid container spacing={3}>
          {recommendedMatches.map(({ consultant, match_score, match_reasons }, index) => (
            <Grid item xs={12} md={6} key={consultant.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                {index < 3 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      bgcolor: 'primary.main',
                      color: 'white',
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      boxShadow: 2
                    }}
                  >
                    #{index + 1}
                  </Box>
                )}

                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {consultant.first_name} {consultant.last_name}
                    </Typography>
                    <Typography color="text.secondary" variant="subtitle2">
                      {consultant.seniority_level} • {consultant.years_of_experience} years exp.
                    </Typography>
                  </Box>

                  {/* Match Score */}
                  <Box sx={{ mb: 2 }}>
                    {renderMatchScore(match_score)}
                  </Box>

                  {/* Skills */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Skills
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      {[consultant.skill1, consultant.skill2, consultant.skill3]
                        .filter(Boolean)
                        .map((skill, idx) => renderSkillChip(
                          skill, 
                          project ? [
                            project.required_skill1,
                            project.required_skill2,
                            project.required_skill3
                          ].filter(Boolean) : [],
                          idx,
                          consultant.id
                        ))
                      }
                    </Stack>
                  </Box>

                  {/* Match Reasons */}
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Match Reasons
                    </Typography>
                    <List dense disablePadding>
                      {match_reasons.map((reason, i) => (
                        <ListItem key={`${consultant.id}-reason-${i}`} disablePadding sx={{ mb: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <CheckCircleOutline color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={reason}
                            primaryTypographyProps={{
                              variant: 'body2',
                              color: 'text.secondary'
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  {/* Availability */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Available: {consultant.current_availability}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => setActiveStep(1)}
          >
            Back
          </Button>
          <Button
            variant="contained"
            endIcon={<AutoAwesomeIcon />}
            onClick={() => setActiveStep(3)}
          >
            Continue to AI Analysis
          </Button>
        </Box>
      </Box>
    );
  };

  const renderContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            {renderProjectDetails()}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={() => setActiveStep(1)}
              >
                Continue to Recommendations
              </Button>
            </Box>
          </Box>
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
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/projects')}
        sx={{ mb: 3 }}
      >
        Back to Projects
      </Button>

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