const TransformationCreate = () => {
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [transformations, setTransformations] = useState([]);

  const handleDatasetSelect = (dataset) => {
    console.log('Selected dataset:', dataset);
    setSelectedDataset(dataset);
  };

  const handleTransformationAdd = (transformation) => {
    console.log('Adding transformation:', transformation);
    setTransformations([...transformations, transformation]);
  };

  return (
    <Box>
      <DatasetSelector onSelect={handleDatasetSelect} />
      
      {selectedDataset && (
        <>
          <TransformationBuilder onAdd={handleTransformationAdd} />
          
          <TransformationPreview 
            datasetId={selectedDataset.id}
            transformations={transformations}
          />
        </>
      )}
    </Box>
  );
}; 