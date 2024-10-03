import React, { useState, useEffect, useCallback, useRef, useReducer, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { videoUploadReducer, initialState } from '../reducers/videoUploadReducer';
import { useErrorLogger } from '../hooks/useErrorLogger';
import { generateTranscription, generateAIMetadata, generateKeywordSuggestions, detectPlaylist } from '../services/videoServices';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TranscriptionSummary from '@/components/TranscriptionSummary';
import ThumbnailGenerator from '@/components/ThumbnailGenerator';
import AIMetadataGenerator from '@/components/AIMetadataGenerator';
import KeywordSuggestions from '@/components/KeywordSuggestions';
import ScheduleUpload from '@/components/ScheduleUpload';
import AutoScheduler from '@/components/AutoScheduler';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import RetroactiveUpdate from '@/components/RetroactiveUpdate';
import SocialMediaLinks from '@/components/SocialMediaLinks';
import { useQuery } from '@tanstack/react-query';
import * as SliderPrimitive from "@radix-ui/react-slider";

// Import the Slider component directly from the ui folder
import { Slider as OriginalSlider } from './ui/slider';

// Create a new Slider component that wraps the original
const Slider = React.forwardRef((props, ref) => {
  return <OriginalSlider {...props} ref={ref} />;
});

Slider.displayName = 'Slider';

const YouTubeAutomation = () => {
  console.log('YouTubeAutomation component rendered');
  const [state, dispatch] = useReducer(videoUploadReducer, initialState);
  const { errorLogs, addErrorLog } = useErrorLogger();
  const [socialMediaLinks, setSocialMediaLinks] = useState('');
  const [newTagIndex, setNewTagIndex] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    console.log('Current state:', state);
  }, [state]);

  const { data: analyticsData, refetch: refetchAnalytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: fetchAnalyticsData,
    enabled: false, // Only fetch when needed
  });

  const memoizedAnalyticsData = useMemo(() => analyticsData, [analyticsData]);

  useEffect(() => {
    if (state.videoFile) {
      refetchAnalytics();
    }
  }, [state.videoFile, refetchAnalytics]);

  useEffect(() => {
    if (state.videoFile) {
      generateThumbnail(state.videoFile).then(thumbnailUrl => {
        dispatch({ type: 'SET_THUMBNAIL', payload: thumbnailUrl });
      });
    }
  }, [state.videoFile, dispatch]);

  const handleVideoUpload = useCallback(async (event) => {
    try {
      console.log('handleVideoUpload called');
      const file = event.target.files[0];
      if (!file) {
        throw new Error("No file selected");
      }
      console.log('File selected:', file.name);
      dispatch({ type: 'SET_VIDEO_FILE', payload: file });
      await uploadVideo(file);
      await startAutomationProcess(file);
    } catch (error) {
      console.error('Error in handleVideoUpload:', error);
      addErrorLog("Video Upload", error);
      toast.error(`Upload failed: ${error.message}`);
      dispatch({ type: 'END_PROCESSING' });
    }
  }, [dispatch, addErrorLog, state.title, state.description, state.playlist, state.tags]);

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

  const startAutomationProcess = useCallback(async (file) => {
    if (!file) {
      console.error('No file provided to startAutomationProcess');
      return;
    }
    console.log('Starting automation process');
    dispatch({ type: 'START_PROCESSING' });
    const startTime = Date.now();

    const updateProgress = () => {
      const elapsedTime = Date.now() - startTime;
      const newProgress = Math.min((elapsedTime / 60000) * 100, 100);
      dispatch({ type: 'UPDATE_PROGRESS', payload: newProgress });
    };

    const progressInterval = setInterval(updateProgress, 100);

    try {
      const [thumbnail, transcriptionData, metadata, keywords, detectedPlaylist] = await Promise.all([
        generateThumbnail(file),
        generateTranscription(file),
        generateAIMetadata(),
        generateKeywordSuggestions(state.title, state.description, state.playlist, state.tags),
        detectPlaylist(transcriptionData.transcription)
      ]);

      console.log('Automation steps completed:', { thumbnail, transcriptionData, metadata, keywords, detectedPlaylist });

      dispatch({ type: 'SET_THUMBNAIL', payload: thumbnail });
      handleTranscriptionComplete(transcriptionData);
      handleAIMetadataGeneration(metadata.title, metadata.description, metadata.tags);
      dispatch({ type: 'SET_TAGS', payload: keywords });
      dispatch({ type: 'SET_PLAYLIST', payload: detectedPlaylist });

      console.log('Automation process completed');
      toast.success('Video processing completed successfully!');
    } catch (error) {
      console.error('Error during automation process:', error);
      addErrorLog("Automation Process", error);
      toast.error(`Automation process failed: ${error.message}`);
    } finally {
      clearInterval(progressInterval);
      dispatch({ type: 'END_PROCESSING' });
    }
  }, [dispatch, addErrorLog, state.title, state.description, state.playlist, state.tags]);

  const generateThumbnail = useCallback(async (file) => {
    if (!file) {
      console.error('No file provided to generateThumbnail');
      return "/placeholder.svg";
    }
    // TODO: Implement actual thumbnail generation
    return "/placeholder.svg";
  }, []);

  const removeTag = useCallback((indexToRemove) => {
    dispatch({ type: 'SET_TAGS', payload: state.tags.filter((_, index) => index !== indexToRemove) });
    generateKeywordSuggestions(state.title, state.description, state.playlist, state.tags);
  }, [state.tags, state.title, state.description, state.playlist]);

  useEffect(() => {
    if (state.tags.length < 25) {
      generateKeywordSuggestions(state.title, state.description, state.playlist, state.tags);
    }
  }, [state.tags, state.title, state.description, state.playlist]);

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
        setNewTagIndexForceUpdate(prev => prev + 1);
      }, 60000);
      return () => clearTimeout(timer);
    }
  }, [newTagIndex]);

  const handleTranscriptionComplete = useCallback((newTranscription, newSummary, identifiedSpeakers) => {
    dispatch({ type: 'SET_TRANSCRIPTION', payload: newTranscription });
    dispatch({ type: 'SET_SUMMARY', payload: newSummary });
    dispatch({ type: 'SET_SPEAKERS', payload: identifiedSpeakers });
    
    const speakerInfo = identifiedSpeakers.map(s => `${s.name} (Speaker ${s.id})`).join(', ');
    updateDescription(newSummary, speakerInfo, newTranscription);
  }, [dispatch, updateDescription]);

  const updateDescription = useCallback((summary, speakerInfo, transcription) => {
    const newDescription = `SUMMARY:\n${summary}\n\nSpeakers: ${speakerInfo}\n\n${socialMediaLinks}\n\nTRANSCRIPT:\n${transcription}`;
    dispatch({ type: 'SET_DESCRIPTION', payload: newDescription });
  }, [dispatch, socialMediaLinks]);

  const handleAIMetadataGeneration = (aiTitle, aiDescription, aiTags) => {
    dispatch({ type: 'SET_TITLE', payload: aiTitle });
    updateDescription(aiDescription, state.speakers.map(s => `${s.name} (Speaker ${s.id})`).join(', '), state.transcription);
    dispatch({ type: 'SET_TAGS', payload: aiTags });
  };

  const handleSocialMediaUpdate = (links) => {
    setSocialMediaLinks(links);
    updateDescription(state.summary, state.speakers.map(s => `${s.name} (Speaker ${s.id})`).join(', '), state.transcription);
  };

  const handleScheduleChange = (date) => {
    dispatch({ type: 'SET_SCHEDULED_TIME', payload: date });
  };

  const handleAutoSchedule = (playlistId, scheduledTime) => {
    dispatch({ type: 'SET_PLAYLIST', payload: playlistId });
    dispatch({ type: 'SET_SCHEDULED_TIME', payload: scheduledTime });
  };

  const handleSubmit = useCallback(() => {
    // TODO: Implement actual video upload and metadata submission
    console.log('Submitting video:', { 
      videoFile: state.videoFile, 
      title: state.title, 
      description: state.description, 
      tags: state.tags, 
      transcription: state.transcription, 
      summary: state.summary, 
      scheduledTime: state.scheduledTime,
      playlist: state.playlist
    });
    toast.success('Video submitted successfully!');
  }, [state]);

  const fetchAnalyticsData = async () => {
    try {
      // TODO: Implement actual analytics data fetching
      return { views: 1000, likes: 100, comments: 50 };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      addErrorLog("Analytics Fetch", error);
      throw error;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">YouTube Video Automation</h1>
      
      {state.isProcessing && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Processing Video</CardTitle>
            <CardDescription>Automating video upload process</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={state.progress} className="w-full" />
            <p className="text-sm text-center mt-2">Progress: {Math.round(state.progress)}%</p>
          </CardContent>
        </Card>
      )}
      
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-8">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="transcribe">Transcribe</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="auto-schedule">Auto</TabsTrigger>
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
            onTranscriptionComplete={handleTranscriptionComplete}
          />
        </TabsContent>
        <TabsContent value="metadata">
          <AIMetadataGenerator onGenerate={async () => {
            const metadata = await generateAIMetadata(state.transcription);
            handleAIMetadataGeneration(metadata.title, metadata.description, metadata.tags.split(','));
            return metadata;
          }} transcription={state.transcription} />
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Video Details</CardTitle>
              <CardDescription>Edit the AI-generated metadata for your video.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="video-title">Video Title</Label>
                <Input 
                  id="video-title" 
                  value={state.title} 
                  onChange={(e) => dispatch({ type: 'SET_TITLE', payload: e.target.value })} 
                  className="mt-1" 
                />
              </div>
              <div>
                <Label htmlFor="video-description">Video Description</Label>
                <Textarea 
                  id="video-description" 
                  value={state.description} 
                  onChange={(e) => dispatch({ type: 'SET_DESCRIPTION', payload: e.target.value })} 
                  className="mt-1" 
                />
              </div>
              <div>
                <Label htmlFor="playlist-name">Detected Playlist</Label>
                <Input id="playlist-name" value={state.playlist || ''} readOnly className="mt-1" />
                <p className="text-sm text-muted-foreground mt-1">
                  Playlist automatically detected based on video content. You can change this manually if needed.
                </p>
              </div>
              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {state.tags.map((tag, index) => (
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
          <KeywordSuggestions tags={state.tags} onGenerate={async () => {
            const newTags = await generateKeywordSuggestions(state.title, state.description, state.playlist, state.tags);
            dispatch({ type: 'SET_TAGS', payload: newTags });
            return newTags;
          }} />
          <ThumbnailGenerator videoFile={state.videoFile} onGenerate={async () => {
            const thumbnailUrl = await generateThumbnail(state.videoFile);
            dispatch({ type: 'SET_THUMBNAIL', payload: thumbnailUrl });
            return thumbnailUrl;
          }} />
          {state.thumbnailUrl && (
            <img src={state.thumbnailUrl} alt="Generated Thumbnail" className="mt-4 w-full max-w-md mx-auto object-cover h-48" />
          )}
        </TabsContent>
        <TabsContent value="social">
          <SocialMediaLinks onUpdate={handleSocialMediaUpdate} />
        </TabsContent>
        <TabsContent value="schedule">
          <ScheduleUpload onSchedule={handleScheduleChange} />
        </TabsContent>
        <TabsContent value="auto-schedule">
          <AutoScheduler videoData={state} onSchedule={handleAutoSchedule} />
        </TabsContent>
        <TabsContent value="analytics">
          <AnalyticsDashboard data={memoizedAnalyticsData} />
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
            <p><strong>Title:</strong> {state.title}</p>
            <p><strong>Description:</strong> {state.description}</p>
            <p><strong>Playlist:</strong> {state.playlist}</p>
            <p><strong>Tags:</strong> {state.tags.join(', ')}</p>
            <p><strong>Scheduled Time:</strong> {state.scheduledTime ? state.scheduledTime.toLocaleString() : 'Not scheduled'}</p>
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
                <Alert key={`${log.timestamp}-${index}`} variant="destructive" className="mb-2">
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
