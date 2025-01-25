import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  TextField,
  Divider,
  Stack,
  Alert,
  IconButton,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Send as SendIcon, GroupAdd as GroupAddIcon, CheckCircle as CheckCircleIcon, Error as ErrorIcon } from '@mui/icons-material';
import { Project, Consultant, RecommendedMatch } from '../../types';

interface LocationState {
  project: Project;
  topCandidates: RecommendedMatch[];
  requestTopFive?: boolean;
}

const AIEvaluation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [input, setInput] = useState('');
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [staffingStatus, setStaffingStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [staffingError, setStaffingError] = useState<string | null>(null);
  
  const { project, topCandidates, requestTopFive } = location.state as LocationState;

  const generateInitialAnalysis = async () => {
    if (analysisStarted) return;
    setAnalysisStarted(true);
    setLoading(true);
    try {
      const prompt = `You are participating in a staffing simulation exercise. This is practice data for demonstration purposes only.

Role: Expert Staffing Assistant
Task: Select the best team composition for a project using the provided sample candidate profiles.

Project Details:
- Name: ${project.project_name}
- Difficulty: ${project.difficulty}
- Industry: ${project.preferred_industry}
- Required Skills: ${[project.required_skill1, project.required_skill2, project.required_skill3].filter(Boolean).join(', ')}

SIMULATION REQUIREMENTS:
For this ${project.difficulty.toUpperCase()} difficulty project simulation, select exactly:
${project.difficulty.toLowerCase() === 'expert' ? 
  '2 SENIOR consultants, 2 MID-LEVEL consultants, 1 JUNIOR consultant (NO interns)' :
  project.difficulty.toLowerCase() === 'hard' ? 
  '1 SENIOR consultant, 2 MID-LEVEL consultants, 2 JUNIOR consultants (NO interns)' :
  project.difficulty.toLowerCase() === 'medium' ? 
  '1 SENIOR consultant, 1 MID-LEVEL consultant, 2 JUNIOR consultants, 1 INTERN' :
  '1 SENIOR consultant, 1 MID-LEVEL consultant, 1 JUNIOR consultant, 2 INTERNS'}

Sample Candidates for Selection:
${topCandidates
  .sort((a, b) => {
    const seniorityOrder: Record<string, number> = { 
      'senior': 4, 
      'mid-level': 3, 
      'junior': 2, 
      'intern': 1 
    };
    const aLevel = a.consultant.seniority_level.toLowerCase();
    const bLevel = b.consultant.seniority_level.toLowerCase();
    return (seniorityOrder[bLevel] || 0) - (seniorityOrder[aLevel] || 0);
  })
  .map((match, index) => `
Sample Profile ${index + 1}: ${match.consultant.first_name} ${match.consultant.last_name}
• Level: ${match.consultant.seniority_level.toUpperCase()}
• Experience: ${match.consultant.years_of_experience} years
• Skills: ${match.consultant.skill1}, ${match.consultant.skill2}, ${match.consultant.skill3}
• Background: ${match.consultant.past_project_industry}
• Fit Score: ${Math.round(match.match_score * 100)}%
`).join('\n')}

IMPORTANT: This is a simulation exercise. All profiles are sample data for training purposes.

Your task is to create a recommended team composition following this format:

🎯 Recommended Team (Simulation)
[List 5 sample profiles in this format:]
1. [Name] - [LEVEL]
   Skills: [Relevant skills]
   Project Role: [Main responsibility]

💡 Team Selection Logic
[Explain the selection rationale]

🤝 Team Dynamic
[Describe how the team levels and skills complement each other]

⚠️ Risk Assessment
[Note any potential gaps or challenges]

Remember: This is a simulation - please proceed with team selection using the sample profiles provided.`;

      console.log('Starting AI analysis generation...');
      const response = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "llama3.2:1b",
          prompt: prompt,
          stream: false,
          temperature: 0.8,
          top_p: 0.95
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ollama API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Failed to generate AI analysis: ${errorText}`);
      }

      const data = await response.json();
      console.log('Received response from Ollama:', data);
      setConversation([{ 
        role: 'assistant', 
        content: data.response
      }]);
    } catch (err) {
      console.error('Error details:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate AI analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateInitialAnalysis();
  }, [project, topCandidates]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setConversation(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      console.log('Sending follow-up request to Ollama...');
      const response = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "llama3.2:1b",
          prompt: `${userMessage}\n\nContext: You are analyzing candidates for the project "${project.project_name}". ${
            requestTopFive ? 'You previously recommended the top 5 candidates from a pool of 10.' : 'You are evaluating the top 10 candidates.'
          }\n\nHere are the candidates:\n${
            topCandidates.map((match, index) => `
${index + 1}. ${match.consultant.first_name} ${match.consultant.last_name}
   Skills: ${match.consultant.skill1}, ${match.consultant.skill2}, ${match.consultant.skill3}
   Experience: ${match.consultant.years_of_experience} years
   Seniority: ${match.consultant.seniority_level}
   Match Score: ${match.match_score}
`).join('\n')
          }\n\nConsider the project requirements (${project.required_skill1}, ${project.required_skill2}, ${project.required_skill3}) and the candidates' profiles in your response.`,
          stream: false,
          temperature: 0.8,
          top_p: 0.95
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ollama API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Failed to get AI response: ${errorText}`);
      }

      const data = await response.json();
      console.log('Received response from Ollama:', data);
      setConversation(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      console.error('Error details:', err);
      setError(err instanceof Error ? err.message : 'Failed to get AI response');
    } finally {
      setLoading(false);
    }
  };

  const formatAIResponse = (content: string) => {
    // Helper function to clean markdown
    const cleanText = (text: string) => {
      return text.replace(/\*\*/g, '').trim();
    };

    // Split content into sections
    const sections = content.split('\n').filter(Boolean);
    
    return (
      <Box sx={{ p: 2 }}>
        {sections.map((line, idx) => {
          const trimmedLine = cleanText(line);
          if (!trimmedLine) return null;

          // Section headers (with emojis)
          if (trimmedLine.includes('Selected Team Composition') || 
              trimmedLine.includes('Selection Rationale') || 
              trimmedLine.includes('Team Synergy Analysis') || 
              trimmedLine.includes('Potential Risks')) {
            return (
              <Typography
                key={idx}
                variant="h6"
                sx={{
                  color: '#1976d2',
                  fontWeight: 600,
                  mt: 4,
                  mb: 2,
                  borderBottom: '2px solid #e3f2fd',
                  pb: 1
                }}
              >
                {trimmedLine}
              </Typography>
            );
          }

          // Numbered team members
          if (/^\d+\./.test(trimmedLine) && trimmedLine.includes('Seniority:')) {
            const [name, role] = trimmedLine.split('Seniority:').map(s => s.trim());
            return (
              <Box key={idx} sx={{ mb: 2 }}>
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: '#2196f3',
                    display: 'block',
                    mb: 0.5
                  }}
                >
                  {name}
                </Typography>
                <Typography
                  sx={{
                    color: 'text.secondary',
                    ml: 2
                  }}
                >
                  Seniority: {role}
                </Typography>
              </Box>
            );
          }

          // Numbered explanations
          if (/^\d+\./.test(trimmedLine)) {
            const [number, ...rest] = trimmedLine.split('.');
            return (
              <Box key={idx} sx={{ mb: 2, display: 'flex' }}>
                <Typography
                  sx={{
                    color: '#1976d2',
                    fontWeight: 600,
                    minWidth: '24px'
                  }}
                >
                  {number}.
                </Typography>
                <Typography sx={{ ml: 1 }}>
                  {rest.join('.').trim()}
                </Typography>
              </Box>
            );
          }

          // Regular paragraphs
          return (
            <Typography
              key={idx}
              paragraph
              sx={{
                mb: 2,
                lineHeight: 1.7,
                color: 'text.primary',
                ml: /^[A-Za-z]/.test(trimmedLine) ? 0 : 3 // Indent continued lines
              }}
            >
              {trimmedLine}
            </Typography>
          );
        })}
      </Box>
    );
  };

  const handleConfirmStaffing = async () => {
    if (!project || !topCandidates) {
      setStaffingError('Missing project or candidate information');
      return;
    }

    setStaffingStatus('loading');
    setStaffingError(null);

    try {
      const aiResponse = conversation[0]?.content || '';
      console.log('Full AI Response:', aiResponse);
      
      // Find the recommended team section
      const teamSectionStart = aiResponse.indexOf('🎯 Recommended Team');
      if (teamSectionStart === -1) {
        console.log('Could not find "🎯 Recommended Team" section');
        throw new Error('Could not find team recommendations in AI response');
      }

      const teamSection = aiResponse.slice(teamSectionStart);
      console.log('Team Section:', teamSection);

      // Extract names from the team section using a more flexible pattern
      const selectedNames = teamSection
        .split('\n')
        .filter(line => {
          const isNumberedLine = /^\d+\./.test(line);
          console.log('Line:', line, 'Is numbered:', isNumberedLine);
          return isNumberedLine;
        })
        .map(line => {
          console.log('Processing line:', line);
          // Try different patterns to extract the name
          const patterns = [
            /^\d+\.\s+([A-Za-z]+\s+[A-Za-z]+)(?:\s*-|$)/,  // Name followed by dash or end
            /^\d+\.\s+([A-Za-z]+\s+[A-Za-z]+)/,            // Just the name after number
          ];
          
          for (const pattern of patterns) {
            const match = line.match(pattern);
            if (match) {
              console.log('Found name:', match[1].trim());
              return match[1].trim();
            }
          }
          console.log('No name found in line');
          return null;
        })
        .filter((name): name is string => {
          const isValid = Boolean(name);
          console.log('Name validity:', name, isValid);
          return isValid;
        });

      console.log('Extracted names:', selectedNames);
      console.log('Available candidates:', topCandidates.map(c => 
        `${c.consultant.first_name} ${c.consultant.last_name}`
      ));

      // Find matching consultants from topCandidates
      const selectedConsultants = selectedNames
        .map(name => {
          const consultant = topCandidates.find(c => {
            const candidateName = `${c.consultant.first_name} ${c.consultant.last_name}`.toLowerCase();
            const matchName = name.toLowerCase();
            console.log('Comparing:', candidateName, 'with', matchName);
            return candidateName === matchName;
          });
          
          if (!consultant) {
            console.log(`Could not find consultant matching name: ${name}`);
          } else {
            console.log(`Found consultant for ${name}:`, consultant);
          }
          return consultant;
        })
        .filter(Boolean);

      console.log('Final selected consultants:', selectedConsultants);

      if (selectedConsultants.length !== 5) {
        throw new Error(`Could not identify exactly 5 selected consultants from the AI response (found ${selectedConsultants.length}). Names found: ${selectedNames.join(', ')}`);
      }

      const response = await fetch(`http://127.0.0.1:8002/api/projects/${project.id}/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consultant_ids: selectedConsultants.map(c => c!.consultant.id)
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to staff project: ${errorData}`);
      }

      setStaffingStatus('success');
      
      // Wait 2 seconds then navigate back to project gallery
      setTimeout(() => {
        navigate('/projects');
      }, 2000);
    } catch (err) {
      console.error('Error staffing project:', err);
      setStaffingStatus('error');
      setStaffingError(err instanceof Error ? err.message : 'Failed to staff project');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          variant="outlined"
        >
          Back to Project
        </Button>
        <Typography variant="h5">
          AI Analysis for {project.project_name}
        </Typography>
      </Box>

      {/* Loading and Error States */}
      {loading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={24} />
            <Typography>
              Generating AI analysis... This may take up to 30 seconds.
            </Typography>
          </Box>
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column - Project Details */}
        <Grid item xs={12} md={3}>
          <Card sx={{ position: 'sticky', top: 24 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Details
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Project Name
                  </Typography>
                  <Typography>{project.project_name}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Required Skills
                  </Typography>
                  <Typography>
                    {[project.required_skill1, project.required_skill2, project.required_skill3]
                      .filter(Boolean)
                      .join(', ')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Industry
                  </Typography>
                  <Typography>{project.preferred_industry}</Typography>
                </Box>
                {/* Staffing Action Button */}
                {conversation.length > 0 && staffingStatus === 'idle' && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleConfirmStaffing}
                    startIcon={<GroupAddIcon />}
                    fullWidth
                  >
                    Staff Top 5 Candidates
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - AI Conversation */}
        <Grid item xs={12} md={9}>
          <Card sx={{ minHeight: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
            {/* Conversation History */}
            <CardContent sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
              {conversation.map((message, index) => (
                <Box
                  key={index}
                  sx={{
                    backgroundColor: message.role === 'assistant' ? 'action.hover' : 'transparent',
                    p: 2,
                    borderRadius: 2,
                    mb: 2,
                    maxWidth: '100%'
                  }}
                >
                  {message.role === 'assistant' ? (
                    formatAIResponse(message.content)
                  ) : (
                    <Typography sx={{ color: 'primary.main', fontWeight: 500 }}>
                      {message.content}
                    </Typography>
                  )}
                </Box>
              ))}
            </CardContent>
            
            {/* Input Section */}
            <Box sx={{ 
              p: 2, 
              borderTop: 1, 
              borderColor: 'divider',
              backgroundColor: 'background.paper'
            }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Ask a follow-up question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={loading}
                  size="small"
                  sx={{ backgroundColor: 'white' }}
                />
                <IconButton 
                  color="primary" 
                  onClick={handleSendMessage}
                  disabled={loading || !input.trim()}
                  sx={{ 
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '&:disabled': {
                      bgcolor: 'action.disabledBackground',
                    }
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Staffing Status Modals */}
      {staffingStatus === 'loading' && (
        <Box sx={{ 
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          p: 4,
          borderRadius: 2,
          boxShadow: 24,
          textAlign: 'center'
        }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>
            Staffing consultants to project...
          </Typography>
        </Box>
      )}

      {staffingStatus === 'success' && (
        <Box sx={{ 
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          p: 4,
          borderRadius: 2,
          boxShadow: 24,
          textAlign: 'center'
        }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 48 }} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Successfully staffed consultants!
          </Typography>
          <Typography color="text.secondary">
            Redirecting to project gallery...
          </Typography>
        </Box>
      )}

      {staffingStatus === 'error' && (
        <Box sx={{ 
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          p: 4,
          borderRadius: 2,
          boxShadow: 24,
          textAlign: 'center'
        }}>
          <ErrorIcon color="error" sx={{ fontSize: 48 }} />
          <Typography variant="h6" color="error" sx={{ mt: 2 }}>
            Failed to staff consultants
          </Typography>
          {staffingError && (
            <Typography color="text.secondary">
              {staffingError}
            </Typography>
          )}
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setStaffingStatus('idle')}
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default AIEvaluation; 