import { Box, Typography, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';




const AIFeedback = () => {
 const { aiFeedback, isAnalyzing } = useSelector(state => state.app);




 return (
   <Box sx={{
     mt: 3,
     p: 3,
     bgcolor: 'background.paper',
     borderRadius: 2,
     boxShadow: 1
   }}>
     <Typography variant="h6" sx={{ mb: 2 }}>
       {isAnalyzing ? (
         <>
           <CircularProgress size={20} sx={{ mr: 1.5 }} />
           Interviewer is reviewing...
         </>
       ) : '🧠 AI Analysis'}
     </Typography>
    
     {aiFeedback && (
       <Typography
         variant="body1"
         sx={{ whiteSpace: 'pre-wrap' }}
         dangerouslySetInnerHTML={{
           __html: aiFeedback
             .replace(/- /g, '• ')
             .replace(/\n/g, '<br/>')
         }}
       />
     )}
   </Box>
 );
};




export default AIFeedback;
