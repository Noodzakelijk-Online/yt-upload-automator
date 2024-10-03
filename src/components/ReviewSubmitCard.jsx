import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const ReviewSubmitCard = ({ state, handleSubmit }) => (
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
);

export default ReviewSubmitCard;