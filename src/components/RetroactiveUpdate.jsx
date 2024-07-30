import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import SocialMediaLinks from './SocialMediaLinks';

const RetroactiveUpdate = () => {
  const [videos, setVideos] = useState([]);
  const [socialMediaLinks, setSocialMediaLinks] = useState('');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    // TODO: Implement actual API call to fetch videos
    const fetchedVideos = [
      { id: 1, title: 'Video 1', needsUpdate: true },
      { id: 2, title: 'Video 2', needsUpdate: false },
      { id: 3, title: 'Video 3', needsUpdate: true },
    ];
    setVideos(fetchedVideos);
  };

  const handleUpdateVideos = async () => {
    const videosToUpdate = videos.filter(v => v.needsUpdate);
    // TODO: Implement actual update logic
    console.log('Updating videos:', videosToUpdate);
    
    for (const video of videosToUpdate) {
      await updateVideoDescription(video.id, socialMediaLinks);
    }

    // Refresh the video list after updates
    fetchVideos();
  };

  const updateVideoDescription = async (videoId, newSocialMediaLinks) => {
    // TODO: Implement actual API call to update video description
    console.log(`Updating video ${videoId} with new social media links: ${newSocialMediaLinks}`);
  };

  const toggleVideoUpdate = (id) => {
    setVideos(videos.map(v => v.id === id ? { ...v, needsUpdate: !v.needsUpdate } : v));
  };

  const handleSocialMediaUpdate = (links) => {
    setSocialMediaLinks(links);
  };

  return (
    <div className="space-y-6">
      <SocialMediaLinks onUpdate={handleSocialMediaUpdate} />
      <Card>
        <CardHeader>
          <CardTitle>Retroactive Video Updates</CardTitle>
          <CardDescription>Apply new social media links to your existing videos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Needs Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell>{video.title}</TableCell>
                  <TableCell>
                    <Checkbox
                      checked={video.needsUpdate}
                      onCheckedChange={() => toggleVideoUpdate(video.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button onClick={handleUpdateVideos} className="mt-4">Update Selected Videos</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RetroactiveUpdate;
