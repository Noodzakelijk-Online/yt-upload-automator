import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TranscriptionSummary from '@/components/TranscriptionSummary';
import ThumbnailGenerator from '@/components/ThumbnailGenerator';
import AIMetadataGenerator from '@/components/AIMetadataGenerator';
import KeywordSuggestions from '@/components/KeywordSuggestions';
import ScheduleUpload from '@/components/ScheduleUpload';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import RetroactiveUpdate from '@/components/RetroactiveUpdate';
import { useQuery } from '@tanstack/react-query';

const YouTubeAutomation = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [transcription, setTranscription] = useState('');
  const [summary, setSummary] = useState('');
  const [scheduledTime, setScheduledTime] = useState(null);

  const { data: analyticsData } = useQuery({
    queryKey: ['analytics'],
    queryFn: fetchAnalyticsData,
    enabled: false, // Only fetch when needed
  });

  useEffect(() => {
    if (videoFile) {
      generateThumbnail(videoFile);
    }
  }, [videoFile]);

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    setVideoFile(file);
  };

  const handleTranscriptionComplete = (newTranscription, newSummary) => {
    setTranscription(newTranscription);
    setSummary(newSummary);
    setDescription(`${newSummary}\n\nTranscript:\n${newTranscription}`);
  };

  const generateThumbnail = async (file) => {
    // TODO: Implement actual thumbnail generation
    setThumbnailUrl("/placeholder.svg");
  };

  const handleAIMetadataGeneration = (aiTitle, aiDescription, aiTags) => {
    setTitle(aiTitle);
    setDescription(aiDescription);
    setTags(aiTags);
  };

  const handleScheduleChange = (date) => {
    setScheduledTime(date);
  };

  const handleSubmit = () => {
    // TODO: Implement actual video upload and metadata submission
    console.log('Submitting video:', { videoFile, title, description, tags, transcription, summary, scheduledTime });
  };

  const fetchAnalyticsData = async () => {
    // TODO: Implement actual analytics data fetching
    return { views: 1000, likes: 100, comments: 50 };
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">YouTube Video Automation</h1>
      
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="transcribe">Transcribe</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="retroactive">Retroactive</TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Upload Video</CardTitle>
              <CardDescription>Select your video file to begin the automation process.</CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="video-upload">Choose video file</Label>
              <Input id="video-upload" type="file" accept="video/*" onChange={handleVideoUpload} className="mt-2" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="transcribe">
          <TranscriptionSummary videoFile={videoFile} onTranscriptionComplete={handleTranscriptionComplete} />
        </TabsContent>
        <TabsContent value="metadata">
          <AIMetadataGenerator onGenerate={handleAIMetadataGeneration} />
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Video Details</CardTitle>
              <CardDescription>Edit the AI-generated metadata for your video.</CardDescription>
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
          <KeywordSuggestions onSuggest={(keywords) => setTags(keywords.join(', '))} />
          <ThumbnailGenerator videoFile={videoFile} onGenerate={setThumbnailUrl} />
        </TabsContent>
        <TabsContent value="schedule">
          <ScheduleUpload onSchedule={handleScheduleChange} />
        </TabsContent>
        <TabsContent value="analytics">
          <AnalyticsDashboard data={analyticsData} />
        </TabsContent>
        <TabsContent value="retroactive">
          <RetroactiveUpdate />
        </TabsContent>
      </Tabs>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Review and Submit</CardTitle>
          <CardDescription>Review your video details before submitting.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Title:</strong> {title}</p>
            <p><strong>Description:</strong> {description}</p>
            <p><strong>Tags:</strong> {tags}</p>
            <p><strong>Scheduled Time:</strong> {scheduledTime ? scheduledTime.toLocaleString() : 'Not scheduled'}</p>
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
    </div>
  );
};

export default YouTubeAutomation;
