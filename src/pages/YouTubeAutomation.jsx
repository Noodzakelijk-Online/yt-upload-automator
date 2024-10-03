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
import { Slider } from '@/components/SliderWrapper';

const YouTubeAutomation = () => {
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


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">YouTube Video Automation</h1>
      
      {state.isProcessing && <ProcessingCard progress={state.progress} />}
      
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
          <UploadTab handleVideoUpload={handleVideoUpload} />
        </TabsContent>
        
        <TabsContent value="transcribe">
          <TranscriptionSummary onTranscriptionComplete={handleTranscriptionComplete} />
        </TabsContent>
        
        <TabsContent value="metadata">
          <MetadataTab
            state={state}
            dispatch={dispatch}
            handleAIMetadataGeneration={handleAIMetadataGeneration}
            removeTag={removeTag}
            generateThumbnail={generateThumbnail}
          />
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
      
      <ReviewSubmitCard state={state} handleSubmit={handleSubmit} />
      
      {errorLogs.length > 0 && <ErrorLogsCard errorLogs={errorLogs} />}
    </div>
  );
};

// ... Add new component definitions here (ProcessingCard, UploadTab, MetadataTab, ReviewSubmitCard, ErrorLogsCard)

export default YouTubeAutomation;
