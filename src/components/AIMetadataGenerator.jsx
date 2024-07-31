import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateAIMetadata } from '../services/videoServices';

const AIMetadataGenerator = ({ onGenerate }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMetadata = async () => {
    setIsGenerating(true);
    try {
      const { title, description, tags } = await generateAIMetadata();
      onGenerate(title, description, tags);
    } catch (error) {
      console.error("Error generating metadata:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Metadata Generator</CardTitle>
        <CardDescription>Generate AI-powered title, description, and tags for your video.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={generateMetadata} disabled={isGenerating}>
          {isGenerating ? "Generating..." : "Generate Metadata"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AIMetadataGenerator;
