import { Box, Typography, Chip, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';




const ValidationResults = () => {
 const { validationResults, isValidating, validationError } = useSelector(state => state.app);




 if (isValidating) {
   return (
     <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
       <CircularProgress />
     </Box>
   );
 }




 if (validationError) {
   return (
     <Typography color="error" sx={{ p: 2 }}>
       {validationError}
     </Typography>
   );
 }




 if (!Array.isArray(validationResults) || validationResults.length === 0) {
   return (
     <Typography sx={{ p: 2, color: 'text.secondary' }}>
       No validation results available.
     </Typography>
   );
 }




 return validationResults.map((result, index) => (
   <Box
     key={index}
     sx={{
       bgcolor: result.passed ? 'success.light' : 'error.light',
       p: 2,
       mb: 2,
       borderRadius: 1
     }}
   >
     <Typography variant="h6">
       Test Case #{index + 1}
       <Chip
         label={result.passed ? "Passed" : "Failed"}
         color={result.passed ? "success" : "error"}
         sx={{ ml: 2 }}
       />
     </Typography>
    
     <Typography variant="body2" sx={{ mt: 1 }}>
       Input: nums = [{Array.isArray(result.input?.[0]) ? result.input[0].join(', ') : 'N/A'}],
       target = {result.input?.[1] ?? 'N/A'}
     </Typography>
     <Typography variant="body2">
       Expected: [{Array.isArray(result.expected) ? result.expected.join(', ') : 'N/A'}]
     </Typography>
     <Typography variant="body2">
       Received: {Array.isArray(result.received) ? `[${result.received.join(', ')}]` : 'undefined'}
     </Typography>
    
     {result.error && (
       <Typography variant="caption" color="error" sx={{ mt: 1 }}>
         Error: {result.error}
       </Typography>
     )}
   </Box>
 ));
};




export default ValidationResults;
