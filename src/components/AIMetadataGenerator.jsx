import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AIMetadataGenerator = ({ onGenerate }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMetadata = async () => {
    setIsGenerating(true);
    // TODO: Implement actual AI-powered metadata generation
    const aiTitle = "AI Generated Title";
    const aiDescription = "This is an AI-generated description for your video.";
    const aiTags = "ai, generated, tags";
    setIsGenerating(false);
    onGenerate(aiTitle, aiDescription, aiTags);
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
