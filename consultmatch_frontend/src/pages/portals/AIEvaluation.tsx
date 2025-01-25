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
import { ArrowBack as ArrowBackIcon, Send as SendIcon } from '@mui/icons-material';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [input, setInput] = useState('');
  
  const { project, topCandidates, requestTopFive } = location.state as LocationState;

  useEffect(() => {
    // Generate initial AI analysis
    const generateInitialAnalysis = async () => {
      setLoading(true);
      try {
        const prompt = `You are an expert AI staffing assistant. Below, I will provide:

1. **Project Details**
- Name: ${project.project_name}
- Difficulty: ${project.difficulty}
- Preferred Industry: ${project.preferred_industry}
- Required Skills: ${[project.required_skill1, project.required_skill2, project.required_skill3].filter(Boolean).join(', ')}

**Your Task**: 
Pick the **best 5-person team** that satisfies the project's required roles (intern/junior/mid-level/senior) according to the difficulty constraints:

- **easy** → 2 interns, 1 junior, 1 mid-level, 1 senior  
- **medium** → 1 intern, 2 juniors, 1 mid-level, 1 senior  
- **hard** → 0 interns, 2 juniors, 2 mid-level, 1 senior  
- **expert** → 0 interns, 1 junior, 2 mid-level, 2 seniors  

**Additionally**:
- Prefer candidates who have **industry experience** that matches the project's **preferred industry**.
- Strive for **diversity** in the team (e.g., gender, background) unless it severely compromises overall skill/performance.
- Also consider **synergy**: if certain candidates share hobbies or personal interests, that might improve team chemistry.

**Top 10 Candidates**:
${topCandidates.map((match, index) => `
${index + 1}. **Name**: ${match.consultant.first_name} ${match.consultant.last_name}
   - Seniority: ${match.consultant.seniority_level}
   - Skills: ${match.consultant.skill1}, ${match.consultant.skill2}, ${match.consultant.skill3}
   - Past Industry: ${match.consultant.past_project_industry}
   - Years of Experience: ${match.consultant.years_of_experience}
   - Match Score: ${Math.round(match.match_score * 100)}%
   - Hobbies: ${match.consultant.hobbies || 'Not specified'}
   - Key Strengths: ${match.match_reasons.join(', ')}
`).join('\n')}

**Now,** please select the **top 5** according to the rules. Provide your final answer in this format:

🎯 **Selected Team Composition**
[List the 5 selected candidates with their roles]

💡 **Selection Rationale**
[Explain why each candidate was chosen]

🤝 **Team Synergy Analysis**
[Discuss how the team will work together]

⚠️ **Potential Risks & Mitigation**
[Identify any gaps or risks and how to address them]`;

        console.log('Sending request to Ollama...');
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
    // Split content into sections based on double newlines or section headers with **
    const sections = content.split(/(?:\n\n|\*\*)/g).filter(Boolean);
    
    return sections.map((section, index) => {
      // Check if this is a header section
      const isHeader = section.includes(':') && section.length < 100;
      
      // Format bullet points and sub-points
      const formattedContent = section
        .split('\n')
        .map(line => {
          if (line.trim().startsWith('*')) {
            return (
              <Typography 
                key={line} 
                sx={{ 
                  ml: 2, 
                  my: 1,
                  fontWeight: line.includes('Candidate') ? 'bold' : 'normal'
                }}
              >
                {line.trim().substring(1).trim()}
              </Typography>
            );
          } else if (line.trim().startsWith('+')) {
            return (
              <Typography 
                key={line} 
                sx={{ 
                  ml: 4, 
                  my: 0.5,
                  color: 'text.secondary',
                  fontSize: '0.95rem'
                }}
              >
                {line.trim().substring(1).trim()}
              </Typography>
            );
          }
          return (
            <Typography 
              key={line} 
              sx={{ 
                my: 0.5,
                fontWeight: isHeader ? 'bold' : 'normal',
                fontSize: isHeader ? '1.1rem' : '1rem'
              }}
            >
              {line.trim()}
            </Typography>
          );
        });

      return (
        <Box key={index} sx={{ mb: 3 }}>
          {formattedContent}
        </Box>
      );
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Back to Recommendations
        </Button>
      </Box>

      <Typography variant="h4" gutterBottom>
        AI-Assisted Evaluation
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
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
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, overflow: 'auto' }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              )}
              <Stack spacing={2}>
                {conversation.map((message, index) => (
                  <Box
                    key={index}
                    sx={{
                      backgroundColor: message.role === 'assistant' ? 'action.hover' : 'transparent',
                      p: 2,
                      borderRadius: 1,
                    }}
                  >
                    {message.role === 'assistant' ? (
                      formatAIResponse(message.content)
                    ) : (
                      <Typography>{message.content}</Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            </CardContent>
            
            <Divider />
            
            <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Ask a follow-up question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={loading}
              />
              <IconButton 
                color="primary" 
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AIEvaluation; 