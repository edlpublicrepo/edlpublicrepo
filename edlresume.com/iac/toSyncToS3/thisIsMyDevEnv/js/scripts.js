document.addEventListener('DOMContentLoaded', function() {
    fetch('https://ht24g2tb2c.execute-api.us-east-2.amazonaws.com/test')
    .then(response => response.text()) // assuming the API returns HTML formatted text
    .then(data => {
        document.getElementById('apiResponse').innerHTML = data;
    })
    .catch(error => {
        console.error('There was an error fetching the API data:', error);
        document.getElementById('apiResponse').innerText = 'Failed to load costs.';
    });
});

function centerImageOnPoint(imgElement, containerElement, pointX, pointY, imgOriginalWidth, imgOriginalHeight) {
    // Calculate the scale ratio if the image is resized
    const imgCurrentWidth = imgElement.offsetWidth;
    const imgCurrentHeight = imgElement.offsetHeight;
    const scaleX = imgCurrentWidth / imgOriginalWidth;
    const scaleY = imgCurrentHeight / imgOriginalHeight;
    
    // Calculate the actual point coordinates on the scaled image
    const scaledPointX = pointX * scaleX;
    const scaledPointY = pointY * scaleY;
    
    // Calculate the shift needed to center the point
    const shiftX = (containerElement.offsetWidth / 2) - scaledPointX;
    const shiftY = (containerElement.offsetHeight / 2) - scaledPointY;
    
    // Apply the shift to the image
    imgElement.style.left = `${shiftX}px`;
    imgElement.style.top = `${shiftY}px`;
  }
  
  // Example usage:
  const imgElement = document.getElementById('target-image');
  const containerElement = document.getElementById('image-container-test');
  const pointX = 200; // X coordinate of the point to center, adjust as needed
  const pointY = 150; // Y coordinate of the point to center, adjust as needed
  const imgOriginalWidth = 800; // Original width of the image
  const imgOriginalHeight = 600; // Original height of the image
  
  // Ensure the image is loaded before attempting to center
  imgElement.onload = () => {
    centerImageOnPoint(imgElement, containerElement, pointX, pointY, imgOriginalWidth, imgOriginalHeight);
  };