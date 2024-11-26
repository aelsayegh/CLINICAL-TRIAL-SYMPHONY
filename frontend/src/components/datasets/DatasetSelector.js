const DatasetSelector = ({ onSelect }) => {
  const [datasets, setDatasets] = useState([]);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const response = await api.get('/datasets');
        console.log('Fetched datasets response:', response.data);
        
        if (response.data.success && response.data.datasets) {
          setDatasets(response.data.datasets);
          
          // If there's only one dataset, auto-select it
          if (response.data.datasets.length === 1) {
            handleSelect(response.data.datasets[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching datasets:', error);
      }
    };

    fetchDatasets();
  }, [onSelect]);

  const handleSelect = (dataset) => {
    console.log('Selecting dataset:', dataset);
    onSelect({
      id: dataset.id || dataset._id,
      name: dataset.name,
      headerCount: dataset.headerCount,
      dataCount: dataset.dataCount
    });
  };

  return (
    <Box>
      <Typography variant="h6">Select Dataset</Typography>
      <List>
        {datasets.map((dataset) => (
          <ListItem 
            key={dataset.id || dataset._id}
            button 
            onClick={() => handleSelect(dataset)}
          >
            <ListItemText 
              primary={dataset.name}
              secondary={`Headers: ${dataset.headerCount}, Rows: ${dataset.dataCount}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}; 