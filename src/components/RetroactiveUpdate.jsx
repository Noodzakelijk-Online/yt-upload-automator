import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import SocialMediaLinks from './SocialMediaLinks';

const RetroactiveUpdate = ({ onUpdate }) => {
  const [videos, setVideos] = useState([]);
  const [socialMediaLinks, setSocialMediaLinks] = useState('');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    // TODO: Implement actual API call to fetch videos
    const fetchedVideos = [
      { id: 1, title: 'Video 1', needsUpdate: true, tags: [] },
      { id: 2, title: 'Video 2', needsUpdate: false, tags: [] },
      { id: 3, title: 'Video 3', needsUpdate: true, tags: [] },
    ];
    setVideos(fetchedVideos);
  };

  const generateTags = (video) => {
    // Generate tags based on video title and existing tags
    const keywordSources = [video.title, ...video.tags, 'youtube', 'video'];
    const generatedTags = [];
  
    while (generatedTags.length < 10) {
      const randomSource = keywordSources[Math.floor(Math.random() * keywordSources.length)];
      const words = randomSource.split(' ');
      const tag = words[Math.floor(Math.random() * words.length)].toLowerCase();
    
      if (!video.tags.includes(tag) && !generatedTags.includes(tag) && tag.length > 2) {
        generatedTags.push(tag);
      }
    }
  
    return [...new Set([...video.tags, ...generatedTags])].slice(0, 25);
  };

  const handleUpdateVideos = async () => {
    const videosToUpdate = videos.filter(v => v.needsUpdate);
    // TODO: Implement actual update logic
    console.log('Updating videos:', videosToUpdate);
    onUpdate(videosToUpdate);
    
    for (const video of videosToUpdate) {
      const updatedTags = generateTags(video);
      await updateVideoMetadata(video.id, socialMediaLinks, updatedTags);
    }

    // Refresh the video list after updates
    fetchVideos();
  };

  const updateVideoMetadata = async (videoId, newSocialMediaLinks, newTags) => {
    // TODO: Implement actual API call to update video metadata
    console.log(`Updating video ${videoId} with new social media links: ${newSocialMediaLinks}`);
    console.log(`New tags for video ${videoId}:`, newTags);
    setVideos(videos.map(v => v.id === videoId ? { ...v, tags: newTags } : v));
  };

  const toggleVideoUpdate = (id) => {
    setVideos(videos.map(v => v.id === id ? { ...v, needsUpdate: !v.needsUpdate } : v));
  };

  const handleSocialMediaUpdate = (links) => {
    setSocialMediaLinks(links);
  };

  const regenerateTags = (videoId) => {
    setVideos(videos.map(v => v.id === videoId ? { ...v, tags: generateTags(v) } : v));
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
                <TableHead>Tags</TableHead>
                <TableHead>Actions</TableHead>
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
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {video.tags.slice(0, 5).map((tag, index) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                      ))}
                      {video.tags.length > 5 && <Badge variant="secondary">+{video.tags.length - 5}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => regenerateTags(video.id)} size="sm">Regenerate Tags</Button>
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
