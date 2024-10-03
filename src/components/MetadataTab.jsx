import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import AIMetadataGenerator from './AIMetadataGenerator';
import KeywordSuggestions from './KeywordSuggestions';
import ThumbnailGenerator from './ThumbnailGenerator';

const MetadataTab = ({ state, dispatch, handleAIMetadataGeneration, removeTag, generateThumbnail }) => (
  <>
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
                className={`flex items-center ${index === state.newTagIndex ? 'bg-green-400' : ''}`}
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
  </>
);

export default MetadataTab;