const API_BASE = 'http://localhost:3000/api'; // Change to deployed URL in production

document.getElementById('addSchoolForm').addEventListener('submit', addSchool);
document.getElementById('searchSchoolsForm').addEventListener('submit', listSchools);
document.getElementById('geoBtn').addEventListener('click', useMyLocation);

// Utility to show message
function showMessage(id, message, isError = false) {
  const el = document.getElementById(id);
  el.textContent = message;
  el.className = 'message ' + (isError ? 'error' : 'success');
  setTimeout(() => { el.style.display = 'none'; }, 5000);
}

// Add School
async function addSchool(event) {
  event.preventDefault();
  const btn = document.getElementById('addSubmitBtn');
  const orgText = btn.textContent;
  btn.innerHTML = '<span class="spinner"></span> Adding...';
  btn.disabled = true;

  const name = document.getElementById('schoolName').value;
  const address = document.getElementById('schoolAddress').value;
  const latitude = document.getElementById('schoolLat').value;
  const longitude = document.getElementById('schoolLon').value;

  try {
    const response = await fetch(`${API_BASE}/addSchool`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, address, latitude: parseFloat(latitude), longitude: parseFloat(longitude) })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      showMessage('addMessage', 'School added successfully!');
      event.target.reset();
    } else {
      showMessage('addMessage', data.errors ? data.errors.join(', ') : data.message, true);
    }
  } catch (error) {
    showMessage('addMessage', 'Network error or server down', true);
  } finally {
    btn.textContent = orgText;
    btn.disabled = false;
  }
}

// List Schools by proximity
async function listSchools(event) {
  event.preventDefault();
  const btn = document.getElementById('searchSubmitBtn');
  const orgText = btn.textContent;
  btn.innerHTML = '<span class="spinner"></span> Searching...';
  btn.disabled = true;

  const lat = document.getElementById('userLat').value;
  const lon = document.getElementById('userLon').value;
  const resultsContainer = document.getElementById('resultsSection');
  resultsContainer.innerHTML = '';

  try {
    const response = await fetch(`${API_BASE}/listSchools?latitude=${lat}&longitude=${lon}`);
    const data = await response.json();

    if (response.ok && data.success) {
      if (data.count === 0) {
        resultsContainer.innerHTML = '<div class="card"><p>No schools found in the database.</p></div>';
      } else {
        data.schools.forEach((school, index) => {
          const card = document.createElement('div');
          card.className = `school-card ${index === 0 ? 'closest' : ''}`;
          card.innerHTML = `
            <div class="school-info">
              <h3>${school.name} ${index === 0 ? '📍' : ''}</h3>
              <p>${school.address}</p>
              <p>Lat: ${school.latitude}, Lon: ${school.longitude}</p>
            </div>
            <div class="distance-badge">${school.distance_km} km</div>
          `;
          resultsContainer.appendChild(card);
        });
      }
    } else {
      showMessage('searchMessage', data.message || 'Error fetching schools', true);
    }
  } catch (error) {
    showMessage('searchMessage', 'Network error or server down', true);
  } finally {
    btn.textContent = orgText;
    btn.disabled = false;
  }
}

// Geolocation auto-fill
function useMyLocation() {
  const btn = document.getElementById('geoBtn');
  const orgText = btn.textContent;
  btn.textContent = 'Locating...';
  btn.disabled = true;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        document.getElementById('userLat').value = position.coords.latitude.toFixed(6);
        document.getElementById('userLon').value = position.coords.longitude.toFixed(6);
        btn.textContent = orgText;
        btn.disabled = false;
        
        // Auto search if desired:
        // document.getElementById('searchSubmitBtn').click();
      },
      (error) => {
        showMessage('searchMessage', 'Unable to retrieve your location.', true);
        btn.textContent = orgText;
        btn.disabled = false;
      }
    );
  } else {
    showMessage('searchMessage', 'Geolocation is not supported by your browser.', true);
    btn.textContent = orgText;
    btn.disabled = false;
  }
}
