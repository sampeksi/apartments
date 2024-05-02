import React from 'react';
import { TextField, Button, Box, Typography, CircularProgress } from '@mui/material';

function Form({
    handleSubmit,
    location, setLocation,
    priceMax, setPriceMax,
    yearMin, setYearMin,
    sizeMin, setSizeMin,
    userMaxLimit, setUserMaxLimit,
    interestRate, setInterestRate,
    isLoading
}) {
    const handleFormSubmit = async (event) => {
        event.preventDefault()
        const payload = {
            location,
            price_max: priceMax ? parseInt(priceMax) : undefined,
            year_min: yearMin ? parseInt(yearMin) : undefined,
            size_min: sizeMin ? parseInt(sizeMin) : undefined,
            user_max_limit: userMaxLimit ? parseFloat(userMaxLimit) * 1000 : undefined,
            interest_rate: interestRate ? parseFloat(interestRate) / 100 : 0.03
        };
        await handleSubmit(payload)
    }
    return (
        <Box sx={{ p: 2, backgroundColor: '#f3f3f3', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" gutterBottom component="div" sx={{ mb: 2, color: '#333' }}>
                Rajaa hakua
            </Typography>
            <form onSubmit={handleFormSubmit} noValidate>
                <TextField
                    fullWidth
                    label="Kaupunki"
                    variant="outlined"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    fullWidth
                    label="Ylin hinta tuhansina"
                    type="number"
                    variant="outlined"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    fullWidth
                    label="Valmistunut aikaisintaan"
                    type="number"
                    variant="outlined"
                    value={yearMin}
                    onChange={(e) => setYearMin(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    fullWidth
                    label="Asuinneliöt minimissään (m²)"
                    type="number"
                    variant="outlined"
                    value={sizeMin}
                    onChange={(e) => setSizeMin(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <Typography variant="body2" sx={{ mt: 2, mb: 1, color: '#666' }}>
                    Aseta ylin myyntihinta. Mukaan tulevat myös kohteet, jotka jäävät rajan alle, kun -10 % alennus velattomaan.
                </Typography>
                <TextField
                    fullWidth
                    label="Korkein myyntihinta tuhansina"
                    type="number"
                    variant="outlined"
                    value={userMaxLimit}
                    onChange={(e) => setUserMaxLimit(e.target.value)}
                    sx={{ mb: 3 }}
                />
                <Typography variant="body2" sx={{ mt: 2, mb: 1, color: '#666' }}>
                    Aseta laskuissa käytettävä laskentakorkokanta (vakiona 3 %).
                </Typography>
                <TextField
                    fullWidth
                    label="Laskentakorko (%)"
                    type="number"
                    variant="outlined"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <Button type="submit" variant="contained" color="primary" fullWidth disabled={isLoading}>
                    {isLoading ? <CircularProgress size={24} /> : 'Hae'}
                </Button>
            </form>
        </Box>
    );
}

export default Form;
