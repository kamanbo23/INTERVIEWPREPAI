import Editor from '@monaco-editor/react';
import { Box, Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setCode, setValidating, setValidationResults, setValidationError } from '../store/slice';
import axios from 'axios';
import ValidationResults from './ValidationResults';




const CodeEditor = () => {
 const dispatch = useDispatch();
 const code = useSelector(state => state.app.code);
 const problem = useSelector(state => state.app.problem);
 const isValidating = useSelector(state => state.app.isValidating);




 const validateCode = async () => {
   try {
     if (!problem?.id) {
       dispatch(setValidationError("No problem selected"));
       return;
     }
     if (!code?.trim()) {
       dispatch(setValidationError("Please write some code first"));
       return;
     }




     dispatch(setValidating());
     const response = await axios.post(
       'http://localhost:5001/api/validate',
       {
         code,
         problemId: problem.id
       }
     );
     dispatch(setValidationResults(response.data.results));
   } catch (error) {
     const errorMessage = error.response?.data?.error || error.message;
     dispatch(setValidationError(`Validation failed: ${errorMessage}`));
   }
 };




 return (
   <Box>
     <Box sx={{ height: '60vh', border: '1px solid #555', borderRadius: 1 }}>
       <Editor
         height="100%"
         defaultLanguage="javascript"
         value={code || problem?.template || ''}
         onChange={(value) => dispatch(setCode(value || ''))}
         theme="vs-dark"
         options={{
           minimap: { enabled: false },
           fontSize: 16,
           scrollBeyondLastLine: false
         }}
       />
     </Box>
    
     <Button
       variant="contained"
       onClick={validateCode}
       sx={{ mt: 2 }}
       disabled={isValidating}
     >
       {isValidating ? 'Validating...' : 'Validate Solution'}
     </Button>
    
     <ValidationResults />
   </Box>
 );
};




export default CodeEditor;
