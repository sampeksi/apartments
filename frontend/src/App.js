import React, { useState, useEffect } from 'react';
import axios from 'axios';
import fileDownload from 'js-file-download';
import { Container, Typography, Grid } from '@mui/material';
import Form from './components/Form';
import ResultsTable from './components/ResultsTable';
import CalculatedMetricsTable from './components/CalculatedMetricsTable';

function App() {
    const [location, setLocation] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [yearMin, setYearMin] = useState('');
    const [sizeMin, setSizeMin] = useState('');
    const [userMaxLimit, setUserMaxLimit] = useState('');
    const [results, setResults] = useState([]);
    const [calculatedMetrics, setCalculatedMetrics] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);
    const [interestRate, setInterestRate] = useState('');

    useEffect(() => {
        // Load results and calculated metrics from local storage on component mount
        const savedResults = JSON.parse(localStorage.getItem('results'));
        if (savedResults) {
            setResults(savedResults);
        }
        const savedMetrics = JSON.parse(localStorage.getItem('calculatedMetrics'));
        if (savedMetrics) {
            setCalculatedMetrics(savedMetrics);
        }
    }, []);

    const handleSubmit = async (payload) => {
        setIsLoading(true);
        setCalculatedMetrics([]); // Clear calculated metrics on new search
        setResults([])
        localStorage.removeItem('calculatedMetrics'); // Clear calculated metrics storage
        localStorage.removeItem('results'); // Clear previous search results from local storage
    
        try {
            const response = await axios.post('http://localhost:8000/search/', payload);
            if (response.data) {
                setResults(response.data);
                localStorage.setItem('results', JSON.stringify(response.data)); // Save new results to local storage
            } else {
                setResults([]); // Ensure that no results are set if the response is empty
            }
        } catch (error) {
            console.error('Error during request:', error);
            setResults([]); // Clear results state on error
        } finally {
            setIsLoading(false);
        }
    };    

    const handleCalculateMetrics = async (resultsWithEstimates) => {
        setIsCalculating(true);
        try {
            const properties = resultsWithEstimates.map(result => ({
                kohdenumero: result.Kohdenumero,
                velaton: result.Velaton,
                myyntihinta: result.Myyntihinta,
                lainaosuus: result.Lainanosuus,
                hoitovastike: result.Hoitovastike,
                valmistunut: result.Valmistunut,
                lunastusosuus: result.Tontin_lunastusosuus,
                arvioitu_vuokra: parseFloat(result.arvioitu_vuokra),
                korkotaso: parseFloat(interestRate) || 0.03 // Ensure interest rate is included
            }))
            if (properties.length > 0) {
                const response = await axios.post('http://localhost:8000/calculate-metrics', { properties })
                setCalculatedMetrics(response.data.results) // Assume another state variable to store metrics
                localStorage.setItem('calculatedMetrics', JSON.stringify(response.data.results))
            } else {
                console.log("No properties with necessary data for calculations.");
            }
        } catch (error) {
            console.error('Error during metric calculation:', error)
        } finally {
            setIsCalculating(false)
        }
    };

    const handleDownloadResults = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/download/resultsTable`, {
                responseType: 'blob', // Important for handling binary data files
            });
            if (response.status === 200) {
                fileDownload(response.data, 'search_results.xlsx');
            }
        } catch (error) {
            console.error('Download failed:', error);
            if (error.response && error.response.status === 404) {
                alert('Tietoja ei löytynyt. Tee uusi haku ennen lataamista.');
            }
        }
    };
    
    const handleDownloadMetrics = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/download/calculatedMetricsTable`, {
                responseType: 'blob', // Important for handling binary data files
            });
            if (response.status === 200) {
                fileDownload(response.data, 'calculated_metrics.xlsx');
            }
        } catch (error) {
            console.error('Download failed:', error);
            if (error.response && error.response.status === 404) {
                alert('Tietoja ei löytynyt. Laske tunnusluvut uudelleen.');
            }
        }
    };

    return (
      <Container maxWidth={false} sx={{ padding: 2, width: '100%' }}> 
        <Typography variant="h6" gutterBottom component="div" sx={{ mb: 2, color: '#00796b' }}>
            Hae asuntoja
        </Typography>
        <Grid container spacing={2}>
            <Grid item xs={12} md={2}>
                <Form
                    handleSubmit={handleSubmit}
                    isLoading={isLoading} setIsLoading={setIsLoading}
                    location={location} setLocation={setLocation}
                    priceMax={priceMax} setPriceMax={setPriceMax}
                    yearMin={yearMin} setYearMin={setYearMin}
                    sizeMin={sizeMin} setSizeMin={setSizeMin}
                    userMaxLimit={userMaxLimit} setUserMaxLimit={setUserMaxLimit}
                    interestRate={interestRate} setInterestRate={setInterestRate}
                />
            </Grid>
            <Grid item xs={12} md={9}>
                <ResultsTable 
                results={results} 
                isCalculating={isCalculating}
                setIsCalculating={setIsCalculating}
                onCalculateMetrics={handleCalculateMetrics}
                handleDownloadResults={handleDownloadResults} />
                {calculatedMetrics.length > 0 && 
                <CalculatedMetricsTable 
                metrics={calculatedMetrics}
                handleDownloadMetrics={handleDownloadMetrics} />}
            </Grid>
        </Grid>
      </Container>
    );
}

export default App;
