document.addEventListener('DOMContentLoaded', function() {
    fetch('https://x4kkn1qa7d.execute-api.us-east-2.amazonaws.com/test')
    .then(response => response.text()) // assuming the API returns HTML formatted text
    .then(data => {
        document.getElementById('apiResponse').innerHTML = data;
    })
    .catch(error => {
        console.error('There was an error fetching the API data:', error);
        document.getElementById('apiResponse').innerText = 'Failed to load costs.';
    });
});

