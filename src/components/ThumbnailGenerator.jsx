import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ThumbnailGenerator = ({ videoFile, onGenerate }) => {
  const [generatedThumbnail, setGeneratedThumbnail] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateThumbnail = async () => {
    setIsGenerating(true);
    try {
      // TODO: Implement actual thumbnail generation logic
      const thumbnailUrl = "/placeholder.svg";
      setGeneratedThumbnail(thumbnailUrl);
      onGenerate(thumbnailUrl);
    } catch (error) {
      console.error('Error generating thumbnail:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Thumbnail Generator</CardTitle>
        <CardDescription>Generate a thumbnail for your video.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={generateThumbnail} disabled={isGenerating || !videoFile}>
          {isGenerating ? 'Generating...' : 'Generate Thumbnail'}
        </Button>
        {generatedThumbnail && (
          <img src={generatedThumbnail} alt="Generated Thumbnail" className="mt-4 w-full max-w-md mx-auto object-cover" />
        )}
      </CardContent>
    </Card>
  );
};

export default ThumbnailGenerator;
