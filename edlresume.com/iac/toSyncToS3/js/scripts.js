document.addEventListener('DOMContentLoaded', function() {
    // Call API to get cost of website
    fetch('https://6dfeb7uf1f.execute-api.us-east-2.amazonaws.com/prod')
    .then(response => response.text()) // assuming the API returns HTML formatted text
    .then(data => {
        document.getElementById('apiResponseWebsiteCost').innerHTML = data;
    })
    .catch(error => {
        console.error('There was an error fetching the API data:', error);
        document.getElementById('apiResponseWebsiteCost').innerText = 'Failed to load costs.';
    });
    // Call API to get traffic on website
    fetch('https://jdwksop5g9.execute-api.us-east-2.amazonaws.com/prod')
    .then(response => response.text()) // assuming the API returns HTML formatted text
    .then(data => {
        document.getElementById('apiResponseWebsiteTraffic').innerHTML = data;
    })
    .catch(error => {
        console.error('There was an error fetching the API data:', error);
        document.getElementById('apiResponseWebsiteTraffic').innerText = 'Failed to load costs.';
    });
});

