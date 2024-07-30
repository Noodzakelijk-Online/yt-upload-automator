import { useState, useEffect, useCallback, useRef, useReducer } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVideoUploadReducer, initialState } from '../reducers/videoUploadReducer';
import { useErrorLogger } from '../hooks/useErrorLogger';
import { generateTranscription, generateAIMetadata, generateKeywordSuggestions } from '../services/videoServices';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import TranscriptionSummary from '@/components/TranscriptionSummary';
import ThumbnailGenerator from '@/components/ThumbnailGenerator';
import AIMetadataGenerator from '@/components/AIMetadataGenerator';
import KeywordSuggestions from '@/components/KeywordSuggestions';
import ScheduleUpload from '@/components/ScheduleUpload';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import RetroactiveUpdate from '@/components/RetroactiveUpdate';
import SocialMediaLinks from '@/components/SocialMediaLinks';
import { useQuery } from '@tanstack/react-query';

const YouTubeAutomation = () => {
  const [state, dispatch] = useReducer(useVideoUploadReducer, initialState);
  const { errorLogs, addErrorLog } = useErrorLogger();
  const [socialMediaLinks, setSocialMediaLinks] = useState('');
  const [newTagIndex, setNewTagIndex] = useState(null);
  const [playlistName, setPlaylistName] = useState('');
  const timerRef = useRef(null);

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

  const handleVideoUpload = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) {
        throw new Error("No file selected");
      }
      dispatch({ type: 'SET_VIDEO_FILE', payload: file });
      await uploadVideo(file);
      await startAutomationProcess(file);
    } catch (error) {
      addErrorLog("Video Upload", error);
    }
  };

  const uploadVideo = async (file) => {
    try {
      // TODO: Implement actual video upload to YouTube
      console.log('Uploading video:', file.name);
      // Simulating upload time
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Video uploaded successfully');
    } catch (error) {
      throw new Error(`Failed to upload video: ${error.message}`);
    }
  };

  const startAutomationProcess = async (file) => {
    dispatch({ type: 'START_PROCESSING' });
    const startTime = Date.now();

    const updateProgress = () => {
      const elapsedTime = Date.now() - startTime;
      const newProgress = Math.min((elapsedTime / 60000) * 100, 100);
      dispatch({ type: 'UPDATE_PROGRESS', payload: newProgress });
    };

    const progressInterval = setInterval(updateProgress, 100);

    try {
      const [thumbnail, transcriptionData, metadata, keywords] = await Promise.all([
        generateThumbnail(file),
        generateTranscription(file),
        generateAIMetadata(),
        generateKeywordSuggestions(state.title, state.description, playlistName, state.tags)
      ]);

      dispatch({ type: 'SET_THUMBNAIL', payload: thumbnail });
      handleTranscriptionComplete(transcriptionData);
      handleAIMetadataGeneration(metadata.title, metadata.description, metadata.tags);
      dispatch({ type: 'SET_TAGS', payload: keywords });

      console.log('Automation process completed');
    } catch (error) {
      console.error('Error during automation process:', error);
      addErrorLog("Automation Process", error);
    } finally {
      clearInterval(progressInterval);
      dispatch({ type: 'END_PROCESSING' });
    }
  };

  const generateThumbnail = async (file) => {
    // TODO: Implement actual thumbnail generation
    return "/placeholder.svg";
  };

  const removeTag = (indexToRemove) => {
    setTags(prevTags => {
      const newTags = prevTags.filter((_, index) => index !== indexToRemove);
      generateKeywordSuggestions();
      return newTags;
    });
  };

  useEffect(() => {
    if (tags.length < 25) {
      generateKeywordSuggestions();
    }
  }, [tags, generateKeywordSuggestions]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (newTagIndex !== null) {
      const timer = setTimeout(() => {
        setNewTagIndex(null);
      }, 60000);
      return () => clearTimeout(timer);
    }
  }, [newTagIndex]);

  const handleTranscriptionComplete = (newTranscription, newSummary, identifiedSpeakers) => {
    setTranscription(newTranscription);
    setSummary(newSummary);
    setSpeakers(identifiedSpeakers);
    
    const speakerInfo = identifiedSpeakers.map(s => `${s.name} (Speaker ${s.id})`).join(', ');
    updateDescription(newSummary, speakerInfo, newTranscription);
  };

  const updateDescription = (summary, speakerInfo, transcription) => {
    setDescription(`${summary}\n\nSpeakers: ${speakerInfo}\n\n${socialMediaLinks}\n\nTranscript:\n${transcription}`);
  };

  const fetchAnalyticsData = async () => {
    // TODO: Implement actual analytics data fetching
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    return { views: 1000, likes: 100, comments: 50 };
  };

  const generateThumbnail = async (file) => {
    // TODO: Implement actual thumbnail generation
    setThumbnailUrl("/placeholder.svg");
  };

  const handleAIMetadataGeneration = (aiTitle, aiDescription, aiTags) => {
    setTitle(aiTitle);
    updateDescription(aiDescription, speakers.map(s => `${s.name} (Speaker ${s.id})`).join(', '), transcription);
    setTags(aiTags);
  };

  const handleSocialMediaUpdate = (links) => {
    setSocialMediaLinks(links);
    updateDescription(summary, speakers.map(s => `${s.name} (Speaker ${s.id})`).join(', '), transcription);
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
      
      {isProcessing && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Processing Video</CardTitle>
            <CardDescription>Automating video upload process</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-center mt-2">Progress: {Math.round(progress)}%</p>
          </CardContent>
        </Card>
      )}
      
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="transcribe">Transcribe</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
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
          <TranscriptionSummary
            transcription={transcription}
            summary={summary}
            speakers={speakers}
            onTranscriptionComplete={handleTranscriptionComplete}
          />
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
                <Label htmlFor="playlist-name">Playlist Name</Label>
                <Input id="playlist-name" value={playlistName} onChange={(e) => setPlaylistName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className={`flex items-center ${index === newTagIndex ? 'bg-green-400' : ''}`}
                    >
                      {tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 p-0 h-auto"
                        onClick={() => removeTag(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          <KeywordSuggestions tags={tags} onGenerate={generateKeywordSuggestions} />
          <ThumbnailGenerator videoFile={videoFile} onGenerate={setThumbnailUrl} />
        </TabsContent>
        <TabsContent value="social">
          <SocialMediaLinks onUpdate={handleSocialMediaUpdate} />
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
            <p><strong>Playlist:</strong> {playlistName}</p>
            <p><strong>Tags:</strong> {tags.join(', ')}</p>
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

      {errorLogs.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Error Logs</CardTitle>
            <CardDescription>Detailed error information for debugging</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              {errorLogs.map((log, index) => (
                <Alert key={index} variant="destructive" className="mb-2">
                  <AlertTitle>{log.process} Error - {new Date(log.timestamp).toLocaleString()}</AlertTitle>
                  <AlertDescription>
                    <p><strong>Error:</strong> {log.error}</p>
                    <p><strong>Stack Trace:</strong> {log.stack}</p>
                  </AlertDescription>
                </Alert>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default YouTubeAutomation;
