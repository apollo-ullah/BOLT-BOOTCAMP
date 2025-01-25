import { Box } from '@mui/material';

<Box
  sx={{
    background: 'linear-gradient(120deg, #004D4D 0%, #45B649 100%)',
    // or for a more exact match:
    // background: 'linear-gradient(120deg, #00454A 0%, #45B649 100%)',
    color: 'white',
    p: 2,
    position: 'fixed',
    width: '100%',
    top: 0,
    zIndex: 1100,
  }}
>
  // ... rest of the navbar content ...
</Box> 