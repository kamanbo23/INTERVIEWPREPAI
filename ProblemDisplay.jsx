import { useEffect } from 'react';
import { Typography, Box, Chip } from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { useDispatch, useSelector } from 'react-redux';
import { setProblem } from '../store/slice';
import axios from 'axios';




const ProblemDisplay = () => {
 const dispatch = useDispatch();
 const problem = useSelector(state => state.app.problem);




 useEffect(() => {
   const fetchProblem = async () => {
     try {
       const response = await axios.get('http://localhost:5001/api/problems');
       dispatch(setProblem(response.data));
     } catch (error) {
       console.error('Error fetching problem:', error);
     }
   };
   fetchProblem();
 }, [dispatch]);




 return (
   <Box sx={{ mb: 4 }}>
     {problem && (
       <>
         <Typography variant="h4" gutterBottom>
           {problem.title}
           <Chip
             label={problem.difficulty}
             color={
               problem.difficulty === 'Easy' ? 'success' :
               problem.difficulty === 'Medium' ? 'warning' : 'error'
             }
             sx={{ ml: 2 }}
           />
         </Typography>
         <Typography variant="body1" paragraph>
           {problem.description}
         </Typography>
         <Box sx={{ bgcolor: 'grey.900', p: 2, borderRadius: 1 }}>
           <Typography variant="h6" sx={{ mb: 1 }}>
             <LightbulbIcon sx={{ mr: 1 }} />
             Starter Hints
           </Typography>
           <ul>
             {problem.hints?.map((hint, index) => (
               <li key={index}><Typography variant="body2">{hint}</Typography></li>
             ))}
           </ul>
         </Box>
       </>
     )}
   </Box>
 );
};




export default ProblemDisplay;
