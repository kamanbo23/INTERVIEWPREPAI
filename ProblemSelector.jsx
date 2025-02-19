import { useEffect, useState } from 'react';
import { Box, FormControl, Select, MenuItem, InputLabel, CircularProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setProblem } from '../store/slice';
import axios from 'axios';

const ProblemSelector = () => {
  const dispatch = useDispatch();
  const { problem } = useSelector(state => state.app);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/problems');
        setProblems(response.data);
        setLoading(false);

        // If no problem is selected, select the first one
        if (!problem && response.data.length > 0) {
          handleProblemSelect(response.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching problems:', error);
        setLoading(false);
      }
    };
    fetchProblems();
  }, [dispatch, problem]);

  const handleProblemSelect = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5001/api/problems/${id}`);
      dispatch(setProblem(response.data));
    } catch (error) {
      console.error('Error fetching problem:', error);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ mb: 3, minWidth: 200 }}>
      <FormControl fullWidth>
        <InputLabel id="problem-select-label">Select Problem</InputLabel>
        <Select
          labelId="problem-select-label"
          id="problem-select"
          value={problem?.id || ''}
          label="Select Problem"
          onChange={(e) => handleProblemSelect(e.target.value)}
          sx={{
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center'
            }
          }}
        >
          {problems.map((p) => (
            <MenuItem 
              key={p.id} 
              value={p.id}
              sx={{
                color: p.difficulty === 'Easy' ? 'success.main' :
                       p.difficulty === 'Medium' ? 'warning.main' : 'error.main'
              }}
            >
              {p.title} - {p.difficulty}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default ProblemSelector;