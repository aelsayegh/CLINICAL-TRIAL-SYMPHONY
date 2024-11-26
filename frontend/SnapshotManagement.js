const [snapshots, setSnapshots] = useState([]);
const [error, setError] = useState(null);

const loadSnapshots = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/snapshots', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    setSnapshots(data);
  } catch (error) {
    console.error('Error loading snapshots:', error);
    setError(error.message);
  }
};

useEffect(() => {
  loadSnapshots();
}, []);

const handleCreateSnapshot = async (formData) => {
  try {
    const response = await fetch('http://localhost:5000/api/snapshots', {
      method: 'POST',
      body: formData, // Don't set Content-Type header when sending FormData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    // Handle success
    loadSnapshots(); // Reload the snapshots list
  } catch (error) {
    console.error('Error creating snapshot:', error);
    setError(error.message);
  }
}; 