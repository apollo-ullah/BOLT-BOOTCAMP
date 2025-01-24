import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../../../contexts/AuthContext';
import dayjs from 'dayjs';

interface ConsultantFormData {
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
  certifications: string;
  hobbies: string;
  past_project_industry: string;
  preferred_industries: string;
  availability_start: Date | null;
  availability_end: Date | null;
  linkedin_url: string;
  portfolio_url: string;
  bio: string;
}

interface FormErrors {
  [key: string]: string;
}

const ConsultantForm = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  const [formData, setFormData] = useState<ConsultantFormData>({
    first_name: '',
    last_name: '',
    email: userProfile?.email || '',
    seniority_level: '',
    skill1: '',
    skill2: '',
    skill3: '',
    years_of_experience: 0,
    current_availability: '',
    location_flexibility: '',
    certifications: '',
    hobbies: '',
    past_project_industry: '',
    preferred_industries: '',
    availability_start: null,
    availability_end: null,
    linkedin_url: '',
    portfolio_url: '',
    bio: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);
    setFormErrors({});

    // Validate form
    const errors: FormErrors = {};
    if (!formData.first_name) errors.first_name = 'First name is required';
    if (!formData.last_name) errors.last_name = 'Last name is required';
    if (!formData.seniority_level) errors.seniority_level = 'Seniority level is required';
    if (!formData.skill1) errors.skill1 = 'At least one skill is required';
    if (!formData.years_of_experience) errors.years_of_experience = 'Years of experience is required';
    if (!formData.location_flexibility) errors.location_flexibility = 'Location flexibility is required';
    if (!formData.availability_start) errors.availability_start = 'Availability start date is required';
    if (!formData.availability_end) errors.availability_end = 'Availability end date is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8002/consultants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          availability_start: formData.availability_start?.toISOString().split('T')[0],
          availability_end: formData.availability_end?.toISOString().split('T')[0],
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to create consultant profile');
      }

      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('Error creating consultant profile:', error);
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Complete Your Consultant Profile
        </Typography>

        {submitSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Profile updated successfully!
          </Alert>
        )}

        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="First Name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                error={!!formErrors.first_name}
                helperText={formErrors.first_name}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                error={!!formErrors.last_name}
                helperText={formErrors.last_name}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                value={formData.email}
                disabled
              />
            </Grid>

            {/* Professional Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Professional Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!formErrors.seniority_level}>
                <InputLabel>Seniority Level</InputLabel>
                <Select
                  value={formData.seniority_level}
                  onChange={(e) => setFormData({ ...formData, seniority_level: e.target.value })}
                  label="Seniority Level"
                >
                  <MenuItem value="junior">Junior</MenuItem>
                  <MenuItem value="mid-level">Mid-Level</MenuItem>
                  <MenuItem value="senior">Senior</MenuItem>
                  <MenuItem value="expert">Expert</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="number"
                label="Years of Experience"
                value={formData.years_of_experience}
                onChange={(e) => setFormData({ ...formData, years_of_experience: parseInt(e.target.value) })}
                error={!!formErrors.years_of_experience}
                helperText={formErrors.years_of_experience}
              />
            </Grid>

            {/* Skills */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Skills & Expertise
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Primary Skill"
                value={formData.skill1}
                onChange={(e) => setFormData({ ...formData, skill1: e.target.value })}
                error={!!formErrors.skill1}
                helperText={formErrors.skill1}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Secondary Skill"
                value={formData.skill2}
                onChange={(e) => setFormData({ ...formData, skill2: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Additional Skill"
                value={formData.skill3}
                onChange={(e) => setFormData({ ...formData, skill3: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Certifications"
                value={formData.certifications}
                onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                placeholder="List your relevant certifications"
              />
            </Grid>

            {/* Industry Experience */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Industry Experience
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Past Project Industry"
                value={formData.past_project_industry}
                onChange={(e) => setFormData({ ...formData, past_project_industry: e.target.value })}
                placeholder="e.g., Healthcare, Finance, Technology"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Preferred Industries"
                value={formData.preferred_industries}
                onChange={(e) => setFormData({ ...formData, preferred_industries: e.target.value })}
                placeholder="Industries you'd like to work in"
              />
            </Grid>

            {/* Availability & Location */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Availability & Location
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Available From"
                  value={formData.availability_start}
                  onChange={(date) => setFormData({ ...formData, availability_start: date })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!formErrors.availability_start,
                      helperText: formErrors.availability_start
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Available Until"
                  value={formData.availability_end}
                  onChange={(date) => setFormData({ ...formData, availability_end: date })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!formErrors.availability_end,
                      helperText: formErrors.availability_end
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required error={!!formErrors.location_flexibility}>
                <InputLabel>Location Flexibility</InputLabel>
                <Select
                  value={formData.location_flexibility}
                  onChange={(e) => setFormData({ ...formData, location_flexibility: e.target.value })}
                  label="Location Flexibility"
                >
                  <MenuItem value="remote">Remote Only</MenuItem>
                  <MenuItem value="hybrid">Hybrid</MenuItem>
                  <MenuItem value="onsite">On-site</MenuItem>
                  <MenuItem value="flexible">Flexible</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Additional Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Additional Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Professional Bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about your professional background and expertise"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="LinkedIn Profile"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/your-profile"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Portfolio Website"
                value={formData.portfolio_url}
                onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                placeholder="https://your-portfolio.com"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Hobbies & Interests"
                value={formData.hobbies}
                onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
                placeholder="Share some of your interests outside of work"
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Save Profile'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ConsultantForm; 