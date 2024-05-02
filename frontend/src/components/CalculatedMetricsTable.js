import React, { useState } from 'react';
import { Table, TableBody, Box, TableContainer, TableHead, Button, Paper, Divider, TablePagination } from '@mui/material';
import { StyledTableCell, StyledTableRow } from './StyledComponents';

function CalculatedMetricsTable({ metrics, handleDownloadMetrics }) {
    const [sortConfig, setSortConfig] = React.useState({ key: null, direction: 'descending' });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const requestSort = (key) => {
        setSortConfig({ key: key, direction: 'descending' });
    };

    const sortedMetrics = React.useMemo(() => {
        let sortableItems = [...metrics];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'descending' ? 1 : -1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'descending' ? -1 : 1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [metrics, sortConfig]);

    return (
        <TableContainer component={Paper} sx={{ mt: 2, mb: 2 }}>
            <Table sx={{ minWidth: 700 }} aria-label="customized metrics table">
                <TableHead>
                    <StyledTableRow>
                        <StyledTableCell onClick={() => requestSort('kohdenumero')}>Kohdenumero</StyledTableCell>
                        <StyledTableCell align="right" onClick={() => requestSort('kassavirta')}>Kassavirta</StyledTableCell>
                        <StyledTableCell align="right" onClick={() => requestSort('kassavirta_5')}>Kassavirta 5 vuotta</StyledTableCell>
                        <StyledTableCell align="right" onClick={() => requestSort('kassavirta_10')}>Kassavirta 10 vuotta</StyledTableCell>
                        <StyledTableCell align="right" onClick={() => requestSort('yield')}>Tuotto (%)</StyledTableCell>
                        <StyledTableCell align="right" onClick={() => requestSort('ROI')}>ROI (%)</StyledTableCell>
                    </StyledTableRow>
                </TableHead>
                <TableBody>
                    {sortedMetrics.map((metric, index) => (
                        <StyledTableRow key={index}>
                            <StyledTableCell component="th" scope="row">{metric.kohdenumero}</StyledTableCell>
                            <StyledTableCell align="right">{metric.kassavirta.toFixed(2)}</StyledTableCell>
                            <StyledTableCell align="right">{metric.kassavirta_5.toFixed(2)}</StyledTableCell>
                            <StyledTableCell align="right">{metric.kassavirta_10.toFixed(2)}</StyledTableCell>
                            <StyledTableCell align="right">{metric.yield.toFixed(3)}</StyledTableCell>
                            <StyledTableCell align="right">{metric.ROI.toFixed(3)}</StyledTableCell>
                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 1 }}>
            {metrics.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'left', padding: 1 }}>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleDownloadMetrics()}
                    >
                        Lataa excel
                    </Button>
                </Box>
            )}
            <TablePagination
                    rowsPerPageOptions={[10, 20, 50]}
                    component="div"
                    count={metrics.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(event, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(event) => setRowsPerPage(parseInt(event.target.value, 10))}
                />
            </Box>
        </TableContainer>
    );
}

export default CalculatedMetricsTable;
