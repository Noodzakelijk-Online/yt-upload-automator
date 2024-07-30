import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import TranscriptionSummary from '@/components/TranscriptionSummary';

const YouTubeAutomation = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [transcription, setTranscription] = useState('');
  const [summary, setSummary] = useState('');

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    setVideoFile(file);
    // TODO: Implement actual thumbnail generation
    setThumbnailUrl("/placeholder.svg");
  };

  const handleTranscriptionComplete = (newTranscription, newSummary) => {
    setTranscription(newTranscription);
    setSummary(newSummary);
    setDescription(`${newSummary}\n\nTranscript:\n${newTranscription}`);
  };

  const handleSubmit = () => {
    // TODO: Implement actual video upload and metadata submission
    console.log('Submitting video:', { videoFile, title, description, tags, transcription, summary });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">YouTube Video Automation</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Step 1: Upload Video</CardTitle>
          <CardDescription>Select your video file to begin the automation process.</CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="video-upload">Choose video file</Label>
          <Input id="video-upload" type="file" accept="video/*" onChange={handleVideoUpload} className="mt-2" />
        </CardContent>
      </Card>

      {videoFile && (
        <TranscriptionSummary videoFile={videoFile} onTranscriptionComplete={handleTranscriptionComplete} />
      )}

      {thumbnailUrl && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Step 2: Video Details</CardTitle>
              <CardDescription>Enter the details for your video.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="video-title">Video Title</Label>
                <Input id="video-title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="video-description">Video Description</Label>
                <Textarea id="video-description" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="video-tags">Tags (comma-separated)</Label>
                <Input id="video-tags" value={tags} onChange={(e) => setTags(e.target.value)} className="mt-1" />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Generated Thumbnail</CardTitle>
              <CardDescription>This is a preview of your automatically generated thumbnail.</CardDescription>
            </CardHeader>
            <CardContent>
              <img src={thumbnailUrl} alt="Generated Thumbnail" className="w-full max-w-md mx-auto object-cover" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 3: Review and Submit</CardTitle>
              <CardDescription>Review your video details before submitting.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Title:</strong> {title}</p>
                <p><strong>Description:</strong> {description}</p>
                <p><strong>Tags:</strong> {tags}</p>
              </div>
            </CardContent>
            <CardFooter>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>Submit Video</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to submit this video?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will upload your video and set its metadata on YouTube.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
};

export default YouTubeAutomation;
