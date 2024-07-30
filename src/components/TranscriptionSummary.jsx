import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const TranscriptionSummary = ({ videoFile, onTranscriptionComplete }) => {
  const [transcription, setTranscription] = useState('');
  const [summary, setSummary] = useState('');

  const transcribeAudio = async () => {
    // TODO: Implement actual transcription using multiple services
    const mockTranscription = "This is a mock transcription of the video content.";
    setTranscription(mockTranscription);
    
    // TODO: Implement actual summary generation
    const mockSummary = "This is a 4-5 sentence summary of the video content.";
    setSummary(mockSummary);

    onTranscriptionComplete(mockTranscription, mockSummary);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Transcription and Summary</CardTitle>
        <CardDescription>Generate a transcription and summary for your video.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={transcribeAudio}>Generate Transcription and Summary</Button>
        {transcription && (
          <>
            <div>
              <h3 className="font-semibold mb-2">Summary</h3>
              <Textarea value={summary} readOnly className="h-24" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Transcription</h3>
              <Textarea value={transcription} readOnly className="h-48" />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TranscriptionSummary;
