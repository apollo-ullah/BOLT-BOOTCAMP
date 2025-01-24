// Add refresh token handling
const refreshUserSession = async () => {
  if (auth.currentUser) {
    try {
      await auth.currentUser.getIdToken(true);
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Handle refresh failure
    }
  }
}; 