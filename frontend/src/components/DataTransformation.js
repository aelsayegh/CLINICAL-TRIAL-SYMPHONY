import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Typography,
  Button,
  Container
} from '@mui/material';
import DatasetSelector from './transformations/DatasetSelector';
import TransformationBuilder from './transformations/TransformationBuilder';
import TransformationPreview from './transformations/TransformationPreview';

const steps = [
  'Select Dataset',
  'Configure Transformations',
  'Preview & Save'
];

const DataTransformation = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [transformations, setTransformations] = useState([]);
  const [previewData, setPreviewData] = useState(null);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <DatasetSelector
            selectedDataset={selectedDataset}
            onSelect={setSelectedDataset}
          />
        );
      case 1:
        return (
          <TransformationBuilder
            dataset={selectedDataset}
            transformations={transformations}
            onTransformationsChange={setTransformations}
          />
        );
      case 2:
        return (
          <TransformationPreview
            dataset={selectedDataset}
            transformations={transformations}
            previewData={previewData}
            setPreviewData={setPreviewData}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="xl">
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h4" gutterBottom>
          Data Transformation
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 2, mb: 4 }}>
          {getStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={
              (activeStep === 0 && !selectedDataset) ||
              (activeStep === steps.length - 1)
            }
          >
            {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default DataTransformation;