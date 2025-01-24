import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  CircularProgress, 
  Stack,
  Modal,
  Chip,
  IconButton,
  Pagination,
  TextField,
  ButtonGroup,
  Tooltip
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineDot,
  TimelineContent
} from '@mui/lab';
import { Visibility as VisibilityIcon, Close as CloseIcon, Search as SearchIcon, SwapVert as SwapVertIcon } from '@mui/icons-material';

const CIRCLE_SIZE = 14; // Size of the timeline dots
const HALF_CIRCLE = CIRCLE_SIZE / 2;

interface Project {
  id: number;
  project_name: string;
  preferred_industry: string;
  start_date: string;
  end_date: string;
  'Location\t': string;
  difficulty: string;
  'Description\t'?: string;
  required_skill1: string;
  required_skill2: string;
  required_skill3: string;
  location_city: string;
  location_country: string;
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
  profile_picture: string;
  gender?: string;
  certifications?: string;
  hobbies?: string;
  ethnic?: string;
  past_project_industry?: string;
  preffered_industries?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  total_pages: number;
}

export default function ProjectGallery() {
  const [showConsultants, setShowConsultants] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);
  const [showInProgressOnly, setShowInProgressOnly] = useState(false);
  const ITEMS_PER_PAGE = 30;
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortBy, setSortBy] = useState<'start_date' | 'end_date' | 'years_of_experience' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [seniorityFilter, setSeniorityFilter] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = showConsultants ? 'http://127.0.0.1:8002/consultants' : 'http://127.0.0.1:8002/projects';
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (showConsultants) {
        const data = await response.json() as Consultant[];
        // First sort the data
        const sortedData = sortConsultants(data);
        // Then filter the sorted data
        const filteredData = filterConsultants(sortedData);
        
        const totalItems = filteredData.length;
        const calculatedTotalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        setTotalPages(calculatedTotalPages);

        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const paginatedItems = filteredData.slice(startIndex, endIndex);
        
        setConsultants(paginatedItems);
        setProjects([]);
      } else {
        const allData = await response.json() as Project[];
        const filteredData = filterProjects(sortProjects(allData));
        const totalItems = filteredData.length;
        const calculatedTotalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        setTotalPages(calculatedTotalPages);

        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const paginatedItems = filteredData.slice(startIndex, endIndex);
        setProjects(paginatedItems);
        setConsultants([]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      if (showConsultants) {
        setConsultants([]);
      } else {
        setProjects([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [
    showConsultants,
    page,
    searchQuery,
    difficultyFilter,
    sortBy,
    sortOrder,
    showCompletedOnly,
    showAvailableOnly,
    seniorityFilter
  ]);

  useEffect(() => {
    if (!showConsultants && projects.length > 0) {
      const sortedProjects = sortProjects(projects);
      setProjects(sortedProjects);
    }
  }, [sortBy, sortOrder]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderProjects = (filteredProjects: Project[]) => {
    if (!filteredProjects || filteredProjects.length === 0) {
        return (
        <Grid item xs={12}>
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="h6" color="text.secondary">
              No projects available
            </Typography>
          </Box>
        </Grid>
      );
    }

    return filteredProjects.map((project) => (
      <Grid item xs={12} sm={6} md={4} key={project.id}>
        <Card sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          borderRadius: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="h6" component="div" gutterBottom sx={{ 
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#1a73e8',
                flex: 1,
                mr: 2
              }}>
                {project.project_name}
              </Typography>
              <Chip
                label={project.difficulty}
                size="small"
                sx={{ 
                  bgcolor: project.difficulty.toLowerCase() === 'hard' 
                    ? 'rgba(211, 47, 47, 0.1)'
                    : project.difficulty.toLowerCase() === 'expert'
                    ? 'rgba(156, 39, 176, 0.1)'
                    : project.difficulty.toLowerCase() === 'medium'
                    ? 'rgba(245, 124, 0, 0.1)'
                    : 'rgba(46, 125, 50, 0.1)',
                  color: project.difficulty.toLowerCase() === 'hard'
                    ? '#d32f2f'
                    : project.difficulty.toLowerCase() === 'expert'
                    ? '#9c27b0'
                    : project.difficulty.toLowerCase() === 'medium'
                    ? '#f57c00'
                    : '#2e7d32',
                  fontWeight: 500,
                  flexShrink: 0
                }}
              />
            </Box>

            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
                  Project Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Industry</Typography>
                    <Typography variant="body1" noWrap sx={{ fontWeight: 500 }}>
                      {project.preferred_industry}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Location</Typography>
                    <Typography variant="body1" noWrap sx={{ fontWeight: 500 }}>
                      {project.location_city === 'Remote' || project.location_city === 'Onsite' 
                        ? project.location_city 
                        : `${project.location_city}, ${project.location_country}`}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
                  Timeline
                </Typography>
                <Box sx={{ position: 'relative', height: '80px', mt: 2 }}>
                  {(() => {
                    const now = new Date();
                    const startDate = new Date(project.start_date);
                    const endDate = new Date(project.end_date);
                    
                    // First check if project is completed
                    const isCompleted = now >= endDate;

                    // Calculate progress for in-progress projects
                    let progress;
                    if (isCompleted) {
                      progress = 1;  // Completed projects show full progress
                    } else if (now < startDate) {
                      progress = 0;  // Future projects show no progress
                    } else {
                      // For in-progress projects, calculate actual progress
                      const totalDuration = endDate.getTime() - startDate.getTime();
                      const elapsedTime = now.getTime() - startDate.getTime();
                      progress = Math.min(1, Math.max(0, elapsedTime / totalDuration));
                    }

                    // Determine step statuses based on progress
                    const isStarted = now >= startDate;
                    const isInProgress = progress >= 0.33 && progress < 0.66;
                    const isFinalPhase = progress >= 0.66 && progress < 1;

                    return (
                      <Box sx={{ 
                        position: 'relative',
                        width: '100%',
                        height: '80px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        {/* Base line */}
                        <Box sx={{
                          position: 'absolute',
                          top: '13px',
                          left: '8%',
                          width: '84%',
                          height: '2px',
                          bgcolor: '#e0e0e0',
                          zIndex: 0
                        }} />

                        {/* Progress line */}
                        <Box sx={{
                          position: 'absolute',
                          top: '13px',
                          left: '8%',
                          height: '2px',
                          bgcolor: '#1976d2',
                          zIndex: 0,
                          width: `${progress * 84}%`,
                          transition: 'width 0.3s ease'
                        }} />

                        {/* Timeline points */}
                        <Box sx={{ 
                          position: 'relative',
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'space-between',
                          px: '8%',
                          zIndex: 1
                        }}>
                          {/* Start */}
                          <Box sx={{ textAlign: 'center', width: '32px' }}>
                            <Box sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: isStarted ? '#1976d2' : '#e0e0e0',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: '0.9rem'
                            }}>
                              1
                            </Box>
                            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                              Start
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', display: 'block', mt: 0.5 }}>
                              {endDate.toLocaleDateString()}
                            </Typography>
                          </Box>

                          {/* In Progress */}
                          <Box sx={{ textAlign: 'center', width: '80px' }}>
                            <Box sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: isInProgress || progress >= 0.33 ? '#1976d2' : '#e0e0e0',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: '0.9rem',
                              margin: '0 auto'
                            }}>
                              2
                            </Box>
                            <Typography variant="caption" sx={{ display: 'block', mt: 1, fontSize: '0.7rem' }}>
                              In Progress
                            </Typography>
                          </Box>

                          {/* Final Phase */}
                          <Box sx={{ textAlign: 'center', width: '80px' }}>
                            <Box sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: isFinalPhase || progress >= 0.66 ? '#1976d2' : '#e0e0e0',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: '0.9rem',
                              margin: '0 auto'
                            }}>
                              3
                            </Box>
                            <Typography variant="caption" sx={{ display: 'block', mt: 1, fontSize: '0.7rem' }}>
                              Final Phase
                            </Typography>
                          </Box>

                          {/* End */}
                          <Box sx={{ textAlign: 'center', width: '32px' }}>
                            <Box sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: isCompleted ? '#1976d2' : '#e0e0e0',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: '0.9rem'
                            }}>
                              4
                            </Box>
                            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                              End
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', display: 'block', mt: 0.5 }}>
                              {startDate.toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })()}
                </Box>
              </Box>

              {project['Description\t'] && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    mb: 1,
                    color: 'text.primary'
                  }}>
                    {project['Description\t'].trim()}
                  </Typography>
                </Box>
              )}

              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
                  Required Skills
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {[project.required_skill1, project.required_skill2, project.required_skill3].map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(25, 118, 210, 0.08)',
                        color: '#1976d2',
                        '& .MuiChip-label': { fontWeight: 500 }
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    ));
  };

  const renderConsultants = (filteredConsultants: Consultant[]) => {
    if (!filteredConsultants || filteredConsultants.length === 0) {
        return (
        <Grid item xs={12}>
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="h6" color="text.secondary">
              No consultants available
            </Typography>
          </Box>
        </Grid>
      );
    }

    return filteredConsultants.map((consultant) => (
      <Grid item xs={12} sm={6} md={4} key={consultant.id}>
        <Card 
          sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            }
          }}
          onClick={() => setSelectedConsultant(consultant)}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box
                component="img"
                src={consultant.profile_picture}
                alt={`${consultant.first_name} ${consultant.last_name}`}
                sx={{ 
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #e0e0e0',
                  mr: 2
                }}
              />
              <Box>
                <Typography variant="h6" sx={{ 
                  fontSize: '1.1rem', 
                  fontWeight: 600,
                  color: '#1a73e8'
                }}>
                  {consultant.first_name} {consultant.last_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {consultant.seniority_level} • {consultant.years_of_experience} years
                </Typography>
              </Box>
            </Box>
            
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Availability
                </Typography>
                <Typography variant="body1">
                  {consultant.current_availability}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Location
                </Typography>
                <Typography variant="body1">
                  {consultant.location_flexibility}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
                  Skills
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {[consultant.skill1, consultant.skill2, consultant.skill3].map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(25, 118, 210, 0.08)',
                        color: '#1976d2',
                        '& .MuiChip-label': { fontWeight: 500 }
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    ));
  };

  const renderConsultantModal = () => {
    if (!selectedConsultant) return null;

  };

  const sortProjects = (projectsToSort: Project[]) => {
    if (!sortBy || sortBy === 'years_of_experience') return projectsToSort;

    return [...projectsToSort].sort((a, b) => {
      const dateA = new Date(a[sortBy as 'start_date' | 'end_date']);
      const dateB = new Date(b[sortBy as 'start_date' | 'end_date']);
      return sortOrder === 'asc' 
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });
  };

  const filterProjects = (projectsToFilter: Project[]) => {
    return projectsToFilter.filter(project => {
      const now = new Date();
      const startDate = new Date(project.start_date);
      const endDate = new Date(project.end_date);
      
      // Calculate project status
      const isCompleted = now > endDate;
      const isInProgress = now >= startDate && now <= endDate;

      // Handle completed/in-progress filters
      if (showCompletedOnly && !isCompleted) return false;
      if (showInProgressOnly && !isInProgress) return false;

      // Handle search query
      const matchesSearch = !searchQuery || 
        project.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.required_skill1.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.required_skill2.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.required_skill3.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.preferred_industry.toLowerCase().includes(searchQuery.toLowerCase());

      // Handle difficulty filter
      const matchesDifficulty = !difficultyFilter || 
        project.difficulty.toLowerCase() === difficultyFilter.toLowerCase();

      return matchesSearch && matchesDifficulty;
    });
  };

  const sortConsultants = (consultantsToSort: Consultant[]) => {
    if (!consultantsToSort || !sortBy || sortBy !== 'years_of_experience') {
      return consultantsToSort;
    }

    return [...consultantsToSort].sort((a, b) => {
      if (!a || !b) return 0;
      return sortOrder === 'asc' 
        ? (a.years_of_experience || 0) - (b.years_of_experience || 0)
        : (b.years_of_experience || 0) - (a.years_of_experience || 0);
    });
  };

  const filterConsultants = (consultantsToFilter: Consultant[]) => {
    if (!consultantsToFilter) return [];
    
    return consultantsToFilter.filter(consultant => {
      if (!consultant) return false;

      const matchesSearch = !searchQuery || 
        `${consultant.first_name} ${consultant.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        consultant.skill1?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        consultant.skill2?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        consultant.skill3?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAvailability = !showAvailableOnly || 
        consultant.current_availability?.toLowerCase() === 'available';

      const matchesSeniority = !seniorityFilter ||
        consultant.seniority_level?.toLowerCase() === seniorityFilter.toLowerCase();

      return matchesSearch && matchesAvailability && matchesSeniority;
    });
  };

  const renderControls = () => {
    return (
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        alignItems: 'center',
        flexWrap: 'wrap',
        bgcolor: 'white',
        p: 2,
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <TextField
          size="small"
          placeholder={showConsultants ? "Search consultants or skills..." : "Search projects or skills..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
          }}
          sx={{ minWidth: 250 }}
        />
        
        {showConsultants ? (
          <>
            <ButtonGroup variant="outlined" size="small">
              <Tooltip title="Sort by Experience">
                <Button
                  onClick={() => {
                    setSortBy('years_of_experience');
                    setSortOrder(sortBy === 'years_of_experience' ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc');
                  }}
                  variant={sortBy === 'years_of_experience' ? 'contained' : 'outlined'}
                  endIcon={sortBy === 'years_of_experience' && <SwapVertIcon sx={{ 
                    transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s'
                  }} />}
                >
                  Experience
                </Button>
              </Tooltip>
            </ButtonGroup>

            <Button
              variant={showAvailableOnly ? "contained" : "outlined"}
              onClick={() => {
                setShowAvailableOnly(!showAvailableOnly);
                setPage(1);
              }}
              sx={{ 
                color: showAvailableOnly ? 'white' : '#1976d2',
                bgcolor: showAvailableOnly ? '#1976d2' : 'transparent',
                '&:hover': {
                  bgcolor: showAvailableOnly ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              {showAvailableOnly ? "Showing Available" : "Show Available"}
            </Button>

            <ButtonGroup variant="outlined" size="small">
              <Tooltip title="Filter by Seniority">
                <Button
                  onClick={() => {
                    setSeniorityFilter(seniorityFilter === 'intern' ? null : 'intern');
                    setPage(1);
                  }}
                  variant={seniorityFilter === 'intern' ? 'contained' : 'outlined'}
                  sx={{ color: seniorityFilter === 'intern' ? 'white' : '#00bcd4', bgcolor: seniorityFilter === 'intern' ? '#00bcd4' : 'transparent' }}
                >
                  Intern
                </Button>
              </Tooltip>
              <Tooltip title="Filter by Seniority">
                <Button
                  onClick={() => {
                    setSeniorityFilter(seniorityFilter === 'junior' ? null : 'junior');
                    setPage(1);
                  }}
                  variant={seniorityFilter === 'junior' ? 'contained' : 'outlined'}
                  sx={{ color: seniorityFilter === 'junior' ? 'white' : '#2e7d32', bgcolor: seniorityFilter === 'junior' ? '#2e7d32' : 'transparent' }}
                >
                  Junior
                </Button>
              </Tooltip>
              <Tooltip title="Filter by Seniority">
                <Button
                  onClick={() => {
                    setSeniorityFilter(seniorityFilter === 'mid' ? null : 'mid');
                    setPage(1);
                  }}
                  variant={seniorityFilter === 'mid' ? 'contained' : 'outlined'}
                  sx={{ color: seniorityFilter === 'mid' ? 'white' : '#f57c00', bgcolor: seniorityFilter === 'mid' ? '#f57c00' : 'transparent' }}
                >
                  Mid
                </Button>
              </Tooltip>
              <Tooltip title="Filter by Seniority">
                <Button
                  onClick={() => {
                    setSeniorityFilter(seniorityFilter === 'senior' ? null : 'senior');
                    setPage(1);
                  }}
                  variant={seniorityFilter === 'senior' ? 'contained' : 'outlined'}
                  sx={{ color: seniorityFilter === 'senior' ? 'white' : '#d32f2f', bgcolor: seniorityFilter === 'senior' ? '#d32f2f' : 'transparent' }}
                >
                  Senior
                </Button>
              </Tooltip>
            </ButtonGroup>
          </>
        ) : (
          <>
            <ButtonGroup variant="outlined" size="small">
              <Button
                variant={showCompletedOnly ? "contained" : "outlined"}
                onClick={() => {
                  setShowCompletedOnly(!showCompletedOnly);
                  setShowInProgressOnly(false);
                }}
                sx={{ 
                  color: showCompletedOnly ? 'white' : '#1976d2',
                  bgcolor: showCompletedOnly ? '#1976d2' : 'transparent',
                  '&:hover': {
                    bgcolor: showCompletedOnly ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
                  }
                }}
              >
                {showCompletedOnly ? "Showing Completed" : "Show Completed"}
              </Button>
              <Button
                variant={showInProgressOnly ? "contained" : "outlined"}
                onClick={() => {
                  setShowInProgressOnly(!showInProgressOnly);
                  setShowCompletedOnly(false);
                  setPage(1);
                  fetchData();
                }}
                sx={{ 
                  color: showInProgressOnly ? 'white' : '#1976d2',
                  bgcolor: showInProgressOnly ? '#1976d2' : 'transparent',
                  '&:hover': {
                    bgcolor: showInProgressOnly ? '#1565c0' : 'rgba(25, 118, 210, 0.04)'
                  }
                }}
              >
                {showInProgressOnly ? "Showing In Progress" : "Show In Progress"}
              </Button>
            </ButtonGroup>
            <ButtonGroup variant="outlined" size="small">
              <Tooltip title="Filter by Difficulty">
                <Button
                  onClick={() => setDifficultyFilter(difficultyFilter === 'easy' ? null : 'easy')}
                  variant={difficultyFilter === 'easy' ? 'contained' : 'outlined'}
                  sx={{ color: difficultyFilter === 'easy' ? 'white' : '#2e7d32', bgcolor: difficultyFilter === 'easy' ? '#2e7d32' : 'transparent' }}
                >
                  Easy
                </Button>
              </Tooltip>
              <Tooltip title="Filter by Difficulty">
                <Button
                  onClick={() => setDifficultyFilter(difficultyFilter === 'medium' ? null : 'medium')}
                  variant={difficultyFilter === 'medium' ? 'contained' : 'outlined'}
                  sx={{ color: difficultyFilter === 'medium' ? 'white' : '#f57c00', bgcolor: difficultyFilter === 'medium' ? '#f57c00' : 'transparent' }}
                >
                  Medium
                </Button>
              </Tooltip>
              <Tooltip title="Filter by Difficulty">
                <Button
                  onClick={() => setDifficultyFilter(difficultyFilter === 'hard' ? null : 'hard')}
                  variant={difficultyFilter === 'hard' ? 'contained' : 'outlined'}
                  sx={{ color: difficultyFilter === 'hard' ? 'white' : '#d32f2f', bgcolor: difficultyFilter === 'hard' ? '#d32f2f' : 'transparent' }}
                >
                  Hard
                </Button>
              </Tooltip>
              <Tooltip title="Filter by Difficulty">
                <Button
                  onClick={() => setDifficultyFilter(difficultyFilter === 'expert' ? null : 'expert')}
                  variant={difficultyFilter === 'expert' ? 'contained' : 'outlined'}
                  sx={{ color: difficultyFilter === 'expert' ? 'white' : '#9c27b0', bgcolor: difficultyFilter === 'expert' ? '#9c27b0' : 'transparent' }}
                >
                  Expert
                </Button>
              </Tooltip>
            </ButtonGroup>
          </>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Box sx={{ 
        mb: 3, 
        p: 2, 
        bgcolor: 'white', 
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2
        }}>
          <Typography variant="h5" component="h1">
            {showConsultants ? 'Consultants' : 'Projects'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              setShowConsultants(!showConsultants);
              setPage(1);
              setSortBy(null);
              setSearchQuery('');
              setDifficultyFilter(null);
            }}
            sx={{ 
              bgcolor: '#4285f4',
              '&:hover': {
                bgcolor: '#3367d6'
              }
            }}
          >
            View {showConsultants ? 'Projects' : 'Consultants'}
          </Button>
        </Box>
        {renderControls()}
      </Box>

      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '200px' 
        }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          bgcolor: 'white',
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Typography color="error" gutterBottom>
            Error loading data
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error}
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {showConsultants 
              ? renderConsultants(consultants) 
              : renderProjects(projects)}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ 
              mt: 4, 
              display: 'flex', 
              justifyContent: 'center',
              bgcolor: 'white',
              p: 2,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      {selectedConsultant && (
        <Modal
          open={Boolean(selectedConsultant)}
          onClose={() => setSelectedConsultant(null)}
          aria-labelledby="consultant-modal-title"
        >
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '80%', md: '60%' },
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            overflow: 'auto'
          }}>
            <IconButton
              onClick={() => setSelectedConsultant(null)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 3 }}>
              <Box
                component="img"
                src={selectedConsultant.profile_picture}
                alt={`${selectedConsultant.first_name} ${selectedConsultant.last_name}`}
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
              <Box>
                <Typography variant="h5" id="consultant-modal-title" gutterBottom>
                  {selectedConsultant.first_name} {selectedConsultant.last_name}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {selectedConsultant.email}
                </Typography>
                <Typography variant="body2">
                  {selectedConsultant.seniority_level} • {selectedConsultant.years_of_experience} years of experience
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                  Skills
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  {[selectedConsultant.skill1, selectedConsultant.skill2, selectedConsultant.skill3].map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(66, 133, 244, 0.08)',
                        color: '#4285f4',
                        '& .MuiChip-label': { fontWeight: 500 }
                      }}
                    />
                  ))}
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                  Availability
                </Typography>
                <Typography variant="body2">
                  {selectedConsultant.current_availability}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {selectedConsultant.location_flexibility}
                </Typography>
              </Grid>
              {selectedConsultant.certifications && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                    Certifications
                  </Typography>
                  <Typography variant="body2">
                    {selectedConsultant.certifications}
                  </Typography>
                </Grid>
              )}
              {selectedConsultant.preffered_industries && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                    Preferred Industries
                  </Typography>
                  <Typography variant="body2">
                    {selectedConsultant.preffered_industries}
                  </Typography>
                </Grid>
              )}
              {selectedConsultant.past_project_industry && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                    Past Project Industry
                  </Typography>
                  <Typography variant="body2">
                    {selectedConsultant.past_project_industry}
                  </Typography>
                </Grid>
              )}
              {selectedConsultant.hobbies && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                    Hobbies
                  </Typography>
                  <Typography variant="body2">
                    {selectedConsultant.hobbies}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        </Modal>
      )}
    </Box>
  );
} 