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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineDot,
  TimelineContent
} from '@mui/lab';
import { Visibility as VisibilityIcon, Close as CloseIcon, Search as SearchIcon, SwapVert as SwapVertIcon, Add as AddIcon, Edit as EditIcon, Group as GroupIcon } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useAuth } from '../../contexts/AuthContext';
import type { UserProfile } from '../../contexts/AuthContext';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const CIRCLE_SIZE = 14; // Size of the timeline dots
const HALF_CIRCLE = CIRCLE_SIZE / 2;

// Keep a separate interface for "unsaved project" data
interface NewProject {
  project_name: string;
  preferred_industry: string;
  start_date: Date | null;
  end_date: Date | null;
  location_city: string;
  location_country: string;
  difficulty: string;
  description: string;
  required_skill1: string;
  required_skill2: string;
  required_skill3: string;
}

// For saved projects that come from the backend, `id` must be a real number
interface Project {
  id: number;  // Required for all saved projects
  project_name: string;
  preferred_industry: string;
  start_date: string;  // in YYYY-MM-DD format from server
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
  profile_picture: string;
  gender?: string;
  certifications?: string;
  hobbies?: string;
  ethnic?: string;
  past_project_industry?: string;
  preferred_industries?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  total_pages: number;
}

interface FormErrors {
  [key: string]: string;
}

interface EditProjectModalProps {
  project: Project;
  open: boolean;
  onClose: () => void;
  onSave: (updatedProject: Project) => void;
}

export default function ProjectGallery() {
  const { userProfile } = useAuth();
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
  const [showCompletedProjects, setShowCompletedProjects] = useState(false);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProject, setNewProject] = useState<NewProject>({
    project_name: '',
    preferred_industry: '',
    start_date: null,
    end_date: null,
    location_city: '',
    location_country: '',
    difficulty: '',
    description: '',
    required_skill1: '',
    required_skill2: '',
    required_skill3: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<number | null>(null);
  const canManageProjects = 
    userProfile?.role === 'partner' || 
    userProfile?.role === 'pm';
  const navigate = useNavigate();

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
        console.log('Raw data from API:', allData); // Debug log
        console.log('First project sample:', allData[0]); // Debug log
        console.log('ID type:', allData[0]?.id, typeof allData[0]?.id); // Debug log
        
        const filteredData = filterProjects(sortProjects(allData));
        console.log('After filtering and sorting:', filteredData); // Debug log
        
        const totalItems = filteredData.length;
        const calculatedTotalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        setTotalPages(calculatedTotalPages);

        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const paginatedItems = filteredData.slice(startIndex, endIndex);
        console.log('Final paginated items:', paginatedItems); // Debug log
        
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
    showCompletedProjects,
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

  const getProjectStatus = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return 'not_started';
    if (now > end) return 'completed';
    
    // Calculate progress percentage
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    const progress = elapsed / totalDuration;
    
    if (progress < 0.33) return 'started';
    if (progress < 0.66) return 'in_progress';
    return 'final_phase';
  };

  const renderProjects = (filteredProjects: Project[]) => {
    if (!filteredProjects || filteredProjects.length === 0) {
        return (
        <Grid item xs={12} key="no-projects">
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

    return filteredProjects.map((project) => {
      // Use the guaranteed project ID for the key
      const projectKey = `project-${project.id}`;
      
      console.log('Rendering project:', { id: project.id, name: project.project_name }); // Debug log

      return (
        <Grid item xs={12} sm={6} md={4} key={projectKey}>
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
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Industry
                </Typography>
                  <Chip
                    label={project.preferred_industry}
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(25, 118, 210, 0.1)',
                      color: '#1976d2',
                      fontWeight: 500
                    }}
                  />
              </Box>

              <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Required Skills
                </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                    {[project.required_skill1, project.required_skill2, project.required_skill3]
                      .filter(skill => skill)
                      .map((skill, index) => (
                      <Chip
                        key={`${project.id}-skill-${index}`}
                        label={skill}
                        size="small"
                        sx={{ 
                          bgcolor: 'rgba(0, 0, 0, 0.08)',
                          color: 'text.primary',
                          '& .MuiChip-label': {
                            px: 1
                          }
                        }}
                      />
                    ))}
                  </Stack>
                          </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Location
                            </Typography>
                  <Typography variant="body2">
                    {project.location_city}, {project.location_country}
                            </Typography>
                          </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Timeline
                            </Typography>
                  {renderProjectTimeline(project)}
              </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Description
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {project.description}
                  </Typography>
                </Box>
              </Stack>

              {canManageProjects && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button
                      size="small"
                    startIcon={<GroupIcon />}
                    onClick={() => handleStaffProject(project.id)}
                    color="primary"
                  >
                    Staff Project
                  </Button>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => setEditingProject(project)}
                  >
                    Edit
                  </Button>
              </Box>
              )}
          </CardContent>
        </Card>
      </Grid>
      );
    });
  };

  const renderConsultants = (filteredConsultants: Consultant[]) => {
    if (!filteredConsultants || filteredConsultants.length === 0) {
        return (
        <Grid item xs={12} key="no-consultants">
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
      <Grid item xs={12} sm={6} md={4} key={`consultant-${consultant.id}`}>
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
            cursor: 'pointer'
            }
          }}
        onClick={() => setSelectedConsultant(consultant)}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="h6" component="div" gutterBottom sx={{ 
                  fontSize: '1.1rem', 
                  fontWeight: 600,
                color: '#1a73e8',
                flex: 1,
                mr: 2
                }}>
                  {consultant.first_name} {consultant.last_name}
                </Typography>
              <Chip
                label={consultant.seniority_level}
                size="small"
                sx={{ 
                  bgcolor: 'rgba(25, 118, 210, 0.1)',
                  color: '#1976d2',
                  fontWeight: 500
                }}
              />
            </Box>
            
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Industry Experience
                </Typography>
                <Chip
                  label={consultant.past_project_industry || 'No past projects'}
                  size="small"
                  sx={{ 
                    bgcolor: 'rgba(25, 118, 210, 0.1)',
                    color: '#1976d2',
                    fontWeight: 500
                  }}
                />
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Skills
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
                  {[consultant.skill1, consultant.skill2, consultant.skill3]
                    .filter(skill => skill)
                    .map((skill, index) => (
                    <Chip
                      key={`${consultant.id}-skill-${index}`}
                      label={skill}
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(0, 0, 0, 0.08)',
                        color: 'text.primary',
                        '& .MuiChip-label': {
                          px: 1
                        }
                      }}
                    />
                  ))}
                </Stack>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Location
                </Typography>
                <Typography variant="body2">
                  {consultant.location_flexibility}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Experience
                </Typography>
                <Typography variant="body2">
                  {consultant.years_of_experience} years
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Availability
                </Typography>
                    <Chip
                  label={(() => {
                    if (!consultant.current_availability) return "Not Available";
                    const [startStr, endStr] = consultant.current_availability.split(" to ");
                    const start = new Date(startStr);
                    const end = new Date(endStr);
                    const now = new Date();
                    const isCurrentlyAvailable = now >= start && now <= end;
                    return isCurrentlyAvailable ? "Currently Available" : `Available ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
                  })()}
                      size="small"
                      sx={{ 
                    bgcolor: consultant.current_availability && (() => {
                      const [startStr, endStr] = consultant.current_availability.split(" to ");
                      const start = new Date(startStr);
                      const end = new Date(endStr);
                      const now = new Date();
                      return now >= start && now <= end;
                    })()
                      ? 'rgba(46, 125, 50, 0.1)'
                      : 'rgba(211, 47, 47, 0.1)',
                    color: consultant.current_availability && (() => {
                      const [startStr, endStr] = consultant.current_availability.split(" to ");
                      const start = new Date(startStr);
                      const end = new Date(endStr);
                      const now = new Date();
                      return now >= start && now <= end;
                    })()
                      ? '#2e7d32'
                      : '#d32f2f',
                    fontWeight: 500
                  }}
                />
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Bio
                </Typography>
                <Typography variant="body2" sx={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {consultant.email}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    ));
  };

  const renderConsultantModal = () => {
    if (!selectedConsultant) return null;

    return (
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

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" component="h2" gutterBottom>
              {selectedConsultant.first_name} {selectedConsultant.last_name}
            </Typography>
            <Chip
              label={selectedConsultant.seniority_level}
              size="small"
              sx={{ 
                bgcolor: 'rgba(25, 118, 210, 0.1)',
                color: '#1976d2',
                fontWeight: 500,
                mr: 1
              }}
            />
            <Chip
              label={`${selectedConsultant.years_of_experience} years experience`}
              size="small"
              sx={{ 
                bgcolor: 'rgba(0, 0, 0, 0.08)',
                color: 'text.primary',
                fontWeight: 500
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
              Skills
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ gap: 1 }}>
              {[selectedConsultant.skill1, selectedConsultant.skill2, selectedConsultant.skill3]
                .filter(Boolean)
                .map((skill, index) => (
                  <Chip
                    key={`${selectedConsultant.id}-skill-${index}`}
                    label={skill}
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(0, 0, 0, 0.08)',
                      color: 'text.primary'
                    }}
                  />
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
              Contact
            </Typography>
            <Typography variant="body2">
              {selectedConsultant.email}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
              Availability
            </Typography>
            <Chip
              label={(() => {
                if (!selectedConsultant.current_availability) return "Not Available";
                const [startStr, endStr] = selectedConsultant.current_availability.split(" to ");
                const start = new Date(startStr);
                const end = new Date(endStr);
                const now = new Date();
                const isCurrentlyAvailable = now >= start && now <= end;
                return isCurrentlyAvailable ? "Currently Available" : `Available ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
              })()}
              size="small"
              sx={{ 
                bgcolor: selectedConsultant.current_availability && (() => {
                  const [startStr, endStr] = selectedConsultant.current_availability.split(" to ");
                  const start = new Date(startStr);
                  const end = new Date(endStr);
                  const now = new Date();
                  return now >= start && now <= end;
                })()
                  ? 'rgba(46, 125, 50, 0.1)'
                  : 'rgba(211, 47, 47, 0.1)',
                color: selectedConsultant.current_availability && (() => {
                  const [startStr, endStr] = selectedConsultant.current_availability.split(" to ");
                  const start = new Date(startStr);
                  const end = new Date(endStr);
                  const now = new Date();
                  return now >= start && now <= end;
                })()
                  ? '#2e7d32'
                  : '#d32f2f',
                fontWeight: 500
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {selectedConsultant.location_flexibility}
            </Typography>
          </Grid>

          {selectedConsultant.preferred_industries && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                Preferred Industries
              </Typography>
              <Typography variant="body2">
                {selectedConsultant.preferred_industries}
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

          {selectedConsultant.ethnic && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                Ethnic Background
              </Typography>
              <Typography variant="body2">
                {selectedConsultant.ethnic}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  const sortProjects = (projectsToSort: Project[]) => {
    if (!sortBy) return projectsToSort;

    return [...projectsToSort].sort((a, b) => {
      if (sortBy === 'start_date' || sortBy === 'end_date') {
        const dateA = new Date(a[sortBy]).getTime();
        const dateB = new Date(b[sortBy]).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });
  };

  const filterProjects = (projectsToFilter: Project[]) => {
    console.log('Filtering projects. Total count:', projectsToFilter.length); // Debug log
    
    return projectsToFilter.filter(project => {
      // Status filter
      const status = getProjectStatus(project.start_date, project.end_date);
      const isCompleted = status === 'completed';
      
      // Debug log project details
      console.log('Filtering project:', {
        name: project.project_name,
        id: project.id,
        status,
        isCompleted,
        showCompletedProjects,
        difficulty: project.difficulty,
        difficultyFilter
      });

      // Handle completed/active filter
      if (showCompletedProjects && !isCompleted) {
        console.log('Filtering out: not completed');
        return false;
      }
      if (!showCompletedProjects && isCompleted) {
        console.log('Filtering out: completed');
        return false;
      }

      // Search query filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesName = project.project_name.toLowerCase().includes(searchLower);
        const matchesIndustry = project.preferred_industry.toLowerCase().includes(searchLower);
        const matchesSkills = [
          project.required_skill1,
          project.required_skill2,
          project.required_skill3
        ].some(skill => skill.toLowerCase().includes(searchLower));
        const matchesLocation = `${project.location_city} ${project.location_country}`.toLowerCase().includes(searchLower);
        
        if (!matchesName && !matchesIndustry && !matchesSkills && !matchesLocation) {
          console.log('Filtering out: no search match');
          return false;
        }
      }

      // Difficulty filter
      if (difficultyFilter && project.difficulty.toLowerCase() !== difficultyFilter.toLowerCase()) {
        console.log('Filtering out: difficulty mismatch');
        return false;
      }

      console.log('Project passed all filters');
      return true;
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

      // Search query filter
      const matchesSearch = !searchQuery || 
        `${consultant.first_name} ${consultant.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        consultant.skill1?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        consultant.skill2?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        consultant.skill3?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        consultant.preferred_industries?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        consultant.location_flexibility?.toLowerCase().includes(searchQuery.toLowerCase());

      // Availability filter
      const matchesAvailability = !showAvailableOnly || (() => {
        if (!consultant.current_availability) return false;
        const [startStr, endStr] = consultant.current_availability.split(" to ");
        const availabilityStart = new Date(startStr);
        const availabilityEnd = new Date(endStr);
        const now = new Date();
        return now >= availabilityStart && now <= availabilityEnd;
      })();

      // Seniority filter
      const matchesSeniority = !seniorityFilter ||
        consultant.seniority_level?.toLowerCase() === seniorityFilter.toLowerCase();

      return matchesSearch && matchesAvailability && matchesSeniority;
    });
  };

  const renderControls = () => {
    return (
      <Box sx={{ mb: 4 }}>
        <Stack spacing={3}>
          {/* Search */}
        <TextField
            fullWidth
            variant="outlined"
          size="small"
            placeholder={showConsultants ? "Search consultants by name, skills, or location..." : "Search projects by name, skills, or location..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
          }}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'white',
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />

          {/* Filters and Sort */}
        {showConsultants ? (
            <Stack direction="row" spacing={2} alignItems="center">
              {/* Seniority Filter */}
              <ButtonGroup variant="outlined" size="small" sx={{ bgcolor: 'white' }}>
                <Button
                  onClick={() => setSeniorityFilter(null)}
                  variant={!seniorityFilter ? 'contained' : 'outlined'}
                >
                  All Levels
                </Button>
            <Button
                  onClick={() => setSeniorityFilter('intern')}
                  variant={seniorityFilter === 'intern' ? 'contained' : 'outlined'}
                >
                  Intern
                </Button>
                <Button
                  onClick={() => setSeniorityFilter('junior')}
                  variant={seniorityFilter === 'junior' ? 'contained' : 'outlined'}
                >
                  Junior
                </Button>
                <Button
                  onClick={() => setSeniorityFilter('mid-level')}
                  variant={seniorityFilter === 'mid-level' ? 'contained' : 'outlined'}
                >
                  Mid-Level
                </Button>
                <Button
                  onClick={() => setSeniorityFilter('senior')}
                  variant={seniorityFilter === 'senior' ? 'contained' : 'outlined'}
                >
                  Senior
                </Button>
            </ButtonGroup>

              {/* Sort by Experience */}
              <ButtonGroup variant="outlined" size="small" sx={{ bgcolor: 'white' }}>
              <Button
                onClick={() => {
                    setSortBy('years_of_experience');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  variant={sortBy === 'years_of_experience' ? 'contained' : 'outlined'}
                  endIcon={sortBy === 'years_of_experience' && <SwapVertIcon sx={{ 
                    transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s'
                  }} />}
                >
                  Experience
              </Button>
              </ButtonGroup>

              <Button
                variant={showAvailableOnly ? "contained" : "outlined"}
                onClick={() => {
                  setShowAvailableOnly(!showAvailableOnly);
                  setPage(1);
                }}
                sx={{ 
                  bgcolor: showAvailableOnly ? 'primary.main' : 'white',
                  color: showAvailableOnly ? 'white' : 'primary.main',
                  '&:hover': {
                    bgcolor: showAvailableOnly ? 'primary.dark' : 'white',
                  }
                }}
              >
                {showAvailableOnly ? "Show All" : "Available Only"}
              </Button>
            </Stack>
          ) : (
            <Stack direction="row" spacing={2} alignItems="center">
              {/* Difficulty Filter */}
              <ButtonGroup variant="outlined" size="small" sx={{ bgcolor: 'white' }}>
                <Button
                  onClick={() => setDifficultyFilter(null)}
                  variant={!difficultyFilter ? 'contained' : 'outlined'}
                >
                  All Levels
                </Button>
                <Button
                  onClick={() => setDifficultyFilter('easy')}
                  variant={difficultyFilter === 'easy' ? 'contained' : 'outlined'}
                >
                  Easy
                </Button>
                <Button
                  onClick={() => setDifficultyFilter('medium')}
                  variant={difficultyFilter === 'medium' ? 'contained' : 'outlined'}
                >
                  Medium
                </Button>
                <Button
                  onClick={() => setDifficultyFilter('hard')}
                  variant={difficultyFilter === 'hard' ? 'contained' : 'outlined'}
                >
                  Hard
                </Button>
                <Button
                  onClick={() => setDifficultyFilter('expert')}
                  variant={difficultyFilter === 'expert' ? 'contained' : 'outlined'}
                >
                  Expert
                </Button>
            </ButtonGroup>

              {/* Sort Options */}
              <ButtonGroup variant="outlined" size="small" sx={{ bgcolor: 'white' }}>
                <Button
                  onClick={() => {
                    setSortBy('start_date');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  variant={sortBy === 'start_date' ? 'contained' : 'outlined'}
                  endIcon={sortBy === 'start_date' && <SwapVertIcon sx={{ 
                    transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s'
                  }} />}
                >
                  Start Date
                </Button>
                <Button
                  onClick={() => {
                    setSortBy('end_date');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  variant={sortBy === 'end_date' ? 'contained' : 'outlined'}
                  endIcon={sortBy === 'end_date' && <SwapVertIcon sx={{ 
                    transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s'
                  }} />}
                >
                  End Date
                </Button>
              </ButtonGroup>

              <Button
                variant={showCompletedProjects ? "contained" : "outlined"}
                onClick={() => {
                  setShowCompletedProjects(!showCompletedProjects);
                  setPage(1);
                }}
                sx={{ 
                  bgcolor: showCompletedProjects ? 'primary.main' : 'white',
                  color: showCompletedProjects ? 'white' : 'primary.main',
                  '&:hover': {
                    bgcolor: showCompletedProjects ? 'primary.dark' : 'white',
                  }
                }}
              >
                {showCompletedProjects ? "Active Projects" : "Completed Projects"}
              </Button>
            </Stack>
          )}
        </Stack>
      </Box>
    );
  };

  const renderProjectTimeline = (project: Project) => {
    // Calculate raw fractional progress (0 -> 1)
    const now = new Date();
    const start = new Date(project.start_date);
    const end = new Date(project.end_date);
    let fraction = 0;

    if (now >= start) {
      fraction = (now.getTime() - start.getTime()) / (end.getTime() - start.getTime());
    }
    // Clamp progress between 0 and 1
    fraction = Math.max(0, Math.min(1, fraction));

    // Convert fraction to percentage for the progress bar width
    const progressPercentage = fraction * 100;

    // Determine status for coloring circles
    const status = getProjectStatus(project.start_date, project.end_date);

    // Helper to color the dots
    const getTimelineDotColor = (phase: string) => {
      switch (status) {
        case 'completed':
          return phase === 'completed' || phase === 'final_phase' || phase === 'in_progress' || phase === 'started' ? 'primary' : 'grey';
        case 'final_phase':
          return phase === 'final_phase' || phase === 'in_progress' || phase === 'started' ? 'primary' : 'grey';
        case 'in_progress':
          return phase === 'in_progress' || phase === 'started' ? 'primary' : 'grey';
        case 'started':
          return phase === 'started' ? 'primary' : 'grey';
        default:
          return 'grey';
      }
    };

    return (
      <Box sx={{ position: 'relative', mt: 1, height: '80px' }}>
        {/* Container for lines and circles */}
        <Box sx={{ position: 'relative', height: 24, mb: 1 }}>
          {/* Gray background line */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: 12,
              right: 12,
              height: '3px',
              bgcolor: '#e0e0e0',
              transform: 'translateY(-50%)',
              borderRadius: '4px'
            }}
          />
          
          {/* Blue progress line */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: 12,
              height: '3px',
              width: `${progressPercentage}%`,
              bgcolor: '#1a73e8',
              transform: 'translateY(-50%)',
              transition: 'width 0.3s ease-in-out',
              borderRadius: '4px',
              zIndex: 1
            }}
          />

          {/* The four circles spaced evenly */}
          <Box 
            sx={{ 
              display: 'flex',
              justifyContent: 'space-between', 
              alignItems: 'center',
              position: 'relative',
              height: '100%',
              mx: 1
            }}
          >
            {/* Start */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24, zIndex: 2 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: 'white',
                  border: '3px solid',
                  borderColor: getTimelineDotColor('started') === 'primary' ? '#1a73e8' : '#e0e0e0'
                }}
              />
            </Box>

            {/* In Progress */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24, zIndex: 2 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: 'white',
                  border: '3px solid',
                  borderColor: getTimelineDotColor('in_progress') === 'primary' ? '#1a73e8' : '#e0e0e0'
                }}
              />
            </Box>

            {/* Final Phase */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24, zIndex: 2 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: 'white',
                  border: '3px solid',
                  borderColor: getTimelineDotColor('final_phase') === 'primary' ? '#1a73e8' : '#e0e0e0'
                }}
              />
            </Box>

            {/* Completed */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24, zIndex: 2 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: 'white',
                  border: '3px solid',
                  borderColor: getTimelineDotColor('completed') === 'primary' ? '#1a73e8' : '#e0e0e0'
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Labels below the timeline */}
        <Box 
          sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            px: 1.5
          }}
        >
          {/* Start Label */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24 }}>
            <Typography variant="caption">Start</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {start.toLocaleDateString()}
            </Typography>
          </Box>

          {/* In Progress Label */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24 }}>
            <Typography variant="caption">In Progress</Typography>
          </Box>

          {/* Final Phase Label */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24 }}>
            <Typography variant="caption">Final Phase</Typography>
          </Box>

          {/* Completed Label */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24 }}>
            <Typography variant="caption">Completed</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {end.toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  const handleCreateProject = async () => {
    // Reset errors
    setFormErrors({});
    setSubmitError(null);
    
    // Validate form
    const errors: FormErrors = {};
    if (!newProject.project_name) errors.project_name = 'Project name is required';
    if (!newProject.preferred_industry) errors.preferred_industry = 'Industry is required';
    if (!newProject.start_date) errors.start_date = 'Start date is required';
    if (!newProject.end_date) errors.end_date = 'End date is required';
    if (!newProject.location_city) errors.location_city = 'City is required';
    if (!newProject.location_country) errors.location_country = 'Country is required';
    if (!newProject.difficulty) errors.difficulty = 'Difficulty is required';
    if (!newProject.description) errors.description = 'Description is required';
    if (!newProject.required_skill1) errors.required_skill1 = 'At least one skill is required';
    
    if (newProject.start_date && newProject.end_date && newProject.start_date > newProject.end_date) {
      errors.end_date = 'End date must be after start date';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const projectData = {
        ...newProject,
        start_date: newProject.start_date?.toISOString().split('T')[0],
        end_date: newProject.end_date?.toISOString().split('T')[0],
      };

      console.log('Sending project data:', projectData);

      const response = await fetch('http://127.0.0.1:8002/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to create project');
      }

      // Get the created project with its ID
      const createdProject = await response.json();
      console.log('Server response:', createdProject);
      
      // Validate that we got a proper project with ID back
      if (typeof createdProject.id !== 'number') {
        throw new Error('Server did not return a valid numeric project ID');
      }

      // Immediately add the new project to the state
      setProjects(prev => [createdProject, ...prev]);
      
      // Set success and fetch latest data from server
      setSubmitSuccess(true);
      await fetchData();
      
      // Only close form and reset state after delay
      setTimeout(() => {
        setShowNewProjectForm(false);
        setSubmitSuccess(false);
        setNewProject({
          project_name: '',
          preferred_industry: '',
          start_date: null,
          end_date: null,
          location_city: '',
          location_country: '',
          difficulty: '',
          description: '',
          required_skill1: '',
          required_skill2: '',
          required_skill3: ''
        });
      }, 1500);
    } catch (error) {
      console.error('Error creating project:', error);
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleEditProject = async (updatedProject: Project) => {
    try {
      // Format dates correctly using dayjs
      const formattedProject = {
        ...updatedProject,
        start_date: dayjs(updatedProject.start_date).format('YYYY-MM-DD'),
        end_date: dayjs(updatedProject.end_date).format('YYYY-MM-DD')
      };

      console.log('Sending formatted project:', formattedProject);

      const response = await fetch(`http://127.0.0.1:8002/projects/${formattedProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedProject),
        mode: 'cors'
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to update project');
      }

      const updatedData = await response.json();
      if (typeof updatedData.id !== 'number') {
        throw new Error('Server returned invalid project data');
      }

      // Update the project in the local state
      setProjects(prev => prev.map(p => 
        p.id === updatedData.id ? updatedData : p
      ));

      // Close the edit modal
      setEditingProject(null);
      
      // Show success message
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 1500);
    } catch (error) {
      console.error('Error updating project:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to update project');
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    try {
      console.log('Deleting project:', projectId);
      
      const response = await fetch(`http://127.0.0.1:8002/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to delete project');
      }

      // Immediately remove the project from state
      setProjects(prev => prev.filter(p => p.id !== projectId));
      
      // Close the confirmation dialog
      setShowDeleteConfirmation(null);
      
      // Refresh the projects list to ensure we're in sync with server
      await fetchData();
      
      // Show success message using MUI Alert instead of browser alert
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('Error deleting project:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to delete project');
    }
  };

  const handleStaffProject = (projectId: number) => {
    navigate(`/staff-project/${projectId}`);
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
              setSeniorityFilter(null);
            }}
            startIcon={<SwapVertIcon />}
            sx={{ 
              bgcolor: '#4285f4',
              '&:hover': {
                bgcolor: '#3367d6'
              }
            }}
          >
            Switch to {showConsultants ? 'Projects' : 'Consultants'}
          </Button>
          {!showConsultants && (
            <Button
              variant="contained"
              onClick={() => setShowNewProjectForm(true)}
              startIcon={<AddIcon />}
              sx={{ 
                bgcolor: '#34a853',
                '&:hover': {
                  bgcolor: '#2d8e47'
                }
              }}
            >
              New Project
            </Button>
          )}
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
          <Grid container spacing={3} key={showConsultants ? 'consultants' : 'projects'}>
            {showConsultants ? renderConsultants(consultants) : renderProjects(projects)}
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
          <Box>
            {renderConsultantModal()}
          </Box>
        </Modal>
      )}

      <Dialog 
        open={showNewProjectForm} 
        onClose={() => setShowNewProjectForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          {submitSuccess ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              Project created successfully!
            </Alert>
          ) : (
            <Box sx={{ mt: 2 }}>
              {submitError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {submitError}
                </Alert>
              )}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Project Name"
                    fullWidth
                    value={newProject.project_name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProject({...newProject, project_name: e.target.value})}
                    error={!!formErrors.project_name}
                    helperText={formErrors.project_name}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Industry"
                    fullWidth
                    value={newProject.preferred_industry}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProject({...newProject, preferred_industry: e.target.value})}
                    error={!!formErrors.preferred_industry}
                    helperText={formErrors.preferred_industry}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!formErrors.difficulty}>
                    <InputLabel>Difficulty</InputLabel>
                    <Select
                      value={newProject.difficulty}
                      label="Difficulty"
                      onChange={(e: SelectChangeEvent) => setNewProject({...newProject, difficulty: e.target.value})}
                    >
                      <MenuItem value="easy">Easy</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="hard">Hard</MenuItem>
                      <MenuItem value="expert">Expert</MenuItem>
                    </Select>
                    {formErrors.difficulty && (
                      <FormHelperText>{formErrors.difficulty}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="City"
                    fullWidth
                    value={newProject.location_city}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProject({...newProject, location_city: e.target.value})}
                    error={!!formErrors.location_city}
                    helperText={formErrors.location_city}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Country"
                    fullWidth
                    value={newProject.location_country}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProject({...newProject, location_country: e.target.value})}
                    error={!!formErrors.location_country}
                    helperText={formErrors.location_country}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Start Date"
                      value={newProject.start_date}
                      onChange={(date: Date | null) => setNewProject({...newProject, start_date: date})}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!formErrors.start_date,
                          helperText: formErrors.start_date
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="End Date"
                      value={newProject.end_date}
                      onChange={(date: Date | null) => setNewProject({...newProject, end_date: date})}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!formErrors.end_date,
                          helperText: formErrors.end_date
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Required Skill 1"
                    fullWidth
                    value={newProject.required_skill1}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProject({...newProject, required_skill1: e.target.value})}
                    error={!!formErrors.required_skill1}
                    helperText={formErrors.required_skill1}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Required Skill 2"
                    fullWidth
                    value={newProject.required_skill2}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProject({...newProject, required_skill2: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Required Skill 3"
                    fullWidth
                    value={newProject.required_skill3}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProject({...newProject, required_skill3: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    fullWidth
                    multiline
                    rows={4}
                    value={newProject.description}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewProject({...newProject, description: e.target.value})}
                    error={!!formErrors.description}
                    helperText={formErrors.description}
                  />
                </Grid>
              </Grid>
              </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewProjectForm(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateProject}
            variant="contained"
            disabled={submitSuccess}
          >
            Create Project
          </Button>
        </DialogActions>
      </Dialog>

      {editingProject && (
        <Dialog
          open={Boolean(editingProject)}
          onClose={() => setEditingProject(null)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Edit Project</DialogTitle>
          <DialogContent>
            <Box component="form" noValidate sx={{ mt: 1 }}>
              <input type="hidden" name="id" value={editingProject?.id || ''} />
            <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Project Name"
                    value={editingProject.project_name}
                    onChange={(e) => setEditingProject({
                      ...editingProject,
                      project_name: e.target.value
                    })}
                  />
                </Grid>
              <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Industry"
                    value={editingProject.preferred_industry}
                    onChange={(e) => setEditingProject({
                      ...editingProject,
                      preferred_industry: e.target.value
                    })}
                  />
              </Grid>
              <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Difficulty</InputLabel>
                    <Select
                      value={editingProject.difficulty}
                      onChange={(e) => setEditingProject({
                        ...editingProject,
                        difficulty: e.target.value
                      })}
                    >
                      <MenuItem value="easy">Easy</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="hard">Hard</MenuItem>
                      <MenuItem value="expert">Expert</MenuItem>
                    </Select>
                  </FormControl>
              </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="City"
                    value={editingProject.location_city}
                    onChange={(e) => setEditingProject({
                      ...editingProject,
                      location_city: e.target.value
                    })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Country"
                    value={editingProject.location_country}
                    onChange={(e) => setEditingProject({
                      ...editingProject,
                      location_country: e.target.value
                    })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Start Date"
                      value={editingProject.start_date ? new Date(editingProject.start_date) : null}
                      onChange={(newValue) => setEditingProject({
                        ...editingProject,
                        start_date: newValue ? dayjs(newValue).format('YYYY-MM-DD') : ''
                      })}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="End Date"
                      value={editingProject.end_date ? new Date(editingProject.end_date) : null}
                      onChange={(newValue) => setEditingProject({
                        ...editingProject,
                        end_date: newValue ? dayjs(newValue).format('YYYY-MM-DD') : ''
                      })}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                        }
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Required Skill 1"
                    value={editingProject.required_skill1}
                    onChange={(e) => setEditingProject({
                      ...editingProject,
                      required_skill1: e.target.value
                    })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Required Skill 2"
                    value={editingProject.required_skill2}
                    onChange={(e) => setEditingProject({
                      ...editingProject,
                      required_skill2: e.target.value
                    })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Required Skill 3"
                    value={editingProject.required_skill3}
                    onChange={(e) => setEditingProject({
                      ...editingProject,
                      required_skill3: e.target.value
                    })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    value={editingProject.description}
                    onChange={(e) => setEditingProject({
                      ...editingProject,
                      description: e.target.value
                    })}
                  />
                </Grid>
            </Grid>
          </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingProject(null)}>Cancel</Button>
            <Button 
              onClick={() => {
                if (editingProject?.id) {
                  setShowDeleteConfirmation(editingProject.id);
                  setEditingProject(null); // Close the edit dialog
                }
              }}
              color="error"
            >
              Delete
            </Button>
            <Button onClick={() => handleEditProject(editingProject)} variant="contained">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirmation !== null}
        onClose={() => setShowDeleteConfirmation(null)}
      >
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this project? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirmation(null)}>Cancel</Button>
          <Button 
            onClick={() => {
              if (typeof showDeleteConfirmation === 'number') {
                handleDeleteProject(showDeleteConfirmation);
              }
            }}
            color="error" 
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 