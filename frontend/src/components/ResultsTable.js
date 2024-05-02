import React, { useState, useEffect } from 'react';
import { Table, TableBody, TextField, TableContainer, TableHead, Paper, Typography, 
        TablePagination, Button, Box, CircularProgress, Divider } from '@mui/material';
import { StyledTableCell, StyledTableRow } from './StyledComponents';

function ResultsTable({ results, onCalculateMetrics, isCalculating, 
    setIsCalculating, handleDownloadResults }) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [rentEstimates, setRentEstimates] = useState({});

    // Load rent estimates from local storage
    useEffect(() => {
        const savedEstimates = JSON.parse(localStorage.getItem('rentEstimates')) || {};
        const newEstimates = {};
        results.forEach(result => {
            if (savedEstimates[result.Kohdenumero]) {
                newEstimates[result.Kohdenumero] = savedEstimates[result.Kohdenumero];
            }
        });
        setRentEstimates(newEstimates);
    }, [results]);

    const handleCalculateClick = () => {
        // Normalize Kohdenumero as string and filter results
        const filteredResults = results.filter(result => {
            // Convert both to string to ensure proper matching
            const kohdenumeroAsString = String(result.Kohdenumero);
            return rentEstimates.hasOwnProperty(kohdenumeroAsString) && 
            rentEstimates[kohdenumeroAsString] !== undefined;
        })
    
        if (filteredResults.length > 0) {
            const resultsWithEstimates = filteredResults.map(result => ({
                ...result,
                arvioitu_vuokra: rentEstimates[String(result.Kohdenumero)]
            }));
            setIsCalculating(true)
            onCalculateMetrics(resultsWithEstimates);
        } else {
            console.log("No properties with rent estimates available for calculations.")
            alert('Aseta vuokra-arvio haluamillesi laskettaville kohteille.')
        }
    };
    
    const handleRentChange = (id, value) => {
        const newEstimates = { ...rentEstimates, [id]: value };
        setRentEstimates(newEstimates);
        localStorage.setItem('rentEstimates', JSON.stringify(newEstimates));
    };

    if (!results || results.length === 0 ) {
        return null; // Don't render the table if no search has been performed
    }

    if (results.message === "Ei kriteerit täyttäviä kohteita.") {
        return <Typography sx={{ margin: 2 }}>Ehdoilla ei löytynyt kohteita.</Typography>;
    }

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 700 }} aria-label="customized table">
                    <TableHead>
                        <StyledTableRow>
                            <StyledTableCell>Kohdenumero</StyledTableCell>
                            <StyledTableCell>Osoite</StyledTableCell>
                            <StyledTableCell align="right">Myyntihinta</StyledTableCell>
                            <StyledTableCell align="right">Velaton</StyledTableCell>
                            <StyledTableCell align="right">Lainaosuus</StyledTableCell>
                            <StyledTableCell align="right">Hoitovastike</StyledTableCell>
                            <StyledTableCell align="right">Rahoitusvastike</StyledTableCell>
                            <StyledTableCell align="right">Koko (m²)</StyledTableCell>
                            <StyledTableCell align="right">Kerros</StyledTableCell>
                            <StyledTableCell align="right">Valmistunut</StyledTableCell>
                            <StyledTableCell align="right">Tontin tyyppi</StyledTableCell>
                            <StyledTableCell align="right">Lunastusosuus</StyledTableCell>
                            <StyledTableCell align="right">Arvioitu vuokra</StyledTableCell>
                        </StyledTableRow>
                    </TableHead>
                    <TableBody>
                        {results.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                            <StyledTableRow key={index}>
                                <StyledTableCell component="th" scope="row">
                                    {row.Kohdenumero}
                                </StyledTableCell>
                                <StyledTableCell>{row.Osoite}</StyledTableCell>
                                <StyledTableCell align="right">{row.Myyntihinta.toFixed(2)}</StyledTableCell>
                                <StyledTableCell align="right">{row.Velaton.toFixed(2)}</StyledTableCell>
                                <StyledTableCell align="right">{row.Lainanosuus.toFixed(2)}</StyledTableCell>
                                <StyledTableCell align="right">{row.Hoitovastike.toFixed(2)}</StyledTableCell>
                                <StyledTableCell align="right">{row.Rahoitusvastike.toFixed(2)}</StyledTableCell>
                                <StyledTableCell align="right">{row.Koko}</StyledTableCell>
                                <StyledTableCell align="right">{row.Kerros}</StyledTableCell>
                                <StyledTableCell align="right">{row.Valmistunut}</StyledTableCell>
                                <StyledTableCell align="right">{row.Tontti}</StyledTableCell>
                                <StyledTableCell align="right">{row.Tontin_lunastusosuus}</StyledTableCell>
                                <StyledTableCell align="right">
                                <TextField
                                    size="small"
                                    value={rentEstimates[row.Kohdenumero] || ''}
                                    onChange={(e) => handleRentChange(row.Kohdenumero, e.target.value)}
                                    type="number"
                                    InputProps={{ inputProps: { min: 0 } }}
                                    sx={{
                                        width: '100px', "& .MuiInputBase-root": {height: '2rem'}}}
                                />
                            </StyledTableCell>
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 2 }}>
                    <Box>
                        {results.length > 0 && (
                            <>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleCalculateClick}
                                    disabled={isCalculating}
                                    sx={{ mr: 2}}
                                >
                                    {isCalculating ? <CircularProgress size={24} /> : 'Laske tunnusluvut'}
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleDownloadResults}
                                    disabled={isCalculating}
                                >
                                    Lataa excel
                                </Button>
                            </>
                        )}
                    </Box>
                    <TablePagination
                        rowsPerPageOptions={[10, 20, 50]}
                        component="div"
                        count={results.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(event, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(event) => setRowsPerPage(parseInt(event.target.value, 10))}
                />
            </Box>
            </TableContainer>
        </Paper>
    );
}

export default ResultsTable;
